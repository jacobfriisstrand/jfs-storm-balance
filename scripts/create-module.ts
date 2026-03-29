#!/usr/bin/env tsx

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";

type ModuleConfig = {
  name: string;
  title: string;
  pageTypes: string[];
};

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase())
    .replace(/[-_]/g, "");
}

function generateModuleSchemaFile(config: ModuleConfig): string {
  const { name, title } = config;
  const camelCaseName = toCamelCase(name);

  return `import { defineField, defineType } from "sanity";

export const ${camelCaseName}Type = defineType({
  name: "${camelCaseName}",
  title: "${title}",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "description",
      type: "richText",
    }),
    defineField({
      name: "image",
      type: "imageFieldType",
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title,
        subtitle: "${title}",
      };
    },
  },
});
`;
}

function generateModuleComponentFile(config: ModuleConfig): string {
  const { name, title } = config;
  const camelCaseName = toCamelCase(name);
  const pascalCaseName = toPascalCase(name);

  // Generate props type
  const propsType = `type ${pascalCaseName}Props = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["pageBuilder"]>[number],
  { _type: "${camelCaseName}" }
>;`;

  // Generate JSONLD data function
  const jsonldFunction = `function generate${pascalCaseName}Data(props: ${pascalCaseName}Props): WithContext<WebPageElement> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPageElement",
    "name": props.title || "${title}",
    "description": "${title} module content",
  };
}`;

  return `import type { WebPageElement, WithContext } from "schema-dts";

import { PortableText } from "next-sanity";

import type { PAGE_QUERYResult } from "@/sanity/types";

import { Image } from "@/components/core/image";
import { JSONLD } from "@/components/core/json-ld";

${jsonldFunction}

${propsType}

export function ${pascalCaseName}({
  _key,
  title,
  description,
  image,
  ...props
}: ${pascalCaseName}Props) {
  const ${camelCaseName}Data = generate${pascalCaseName}Data({ _key, title, description, image, ...props });

  return (
    <section>
      <JSONLD data={${camelCaseName}Data} />
      {title && <h2>{title}</h2>}
      
      <div>
        {description && <PortableText value={description} />}
        {image?.asset?.url && image.alt && (
          <Image image={{ asset: { url: image.asset.url }, alt: image.alt }} />
        )}
        {/* Add your module content here */}
      </div>
    </section>
  );
}
`;
}

function generateModuleQuery(config: ModuleConfig): string {
  const { name } = config;
  const camelCaseName = toCamelCase(name);

  return `  _type == "${camelCaseName}" => {
    ...,
    image \${IMAGE_QUERY}
  }`;
}

function appendToAvailableModules(config: ModuleConfig): void {
  const constantsPath = join(process.cwd(), "packages/shared/sanity/constants/available-modules.ts");
  const camelCaseName = toCamelCase(config.name);

  if (!existsSync(constantsPath)) {
    console.error("❌ Available modules constants file not found");
    return;
  }

  const content = readFileSync(constantsPath, "utf-8");

  // Handle both single-line and multi-line AVAILABLE_MODULES arrays
  const modulesRegex = /export const AVAILABLE_MODULES = \[([\s\S]*?)\];/;
  const match = content.match(modulesRegex);

  if (match) {
    const arrayContent = match[1].trim();

    // Parse existing modules from the array content
    const existingModules = arrayContent
      .split(",")
      .map(module => module.trim().replace(/['"]/g, ""))
      .filter(module => module.length > 0);

    // Check if module already exists
    if (existingModules.includes(camelCaseName)) {
      console.warn(`⚠️ Module "${camelCaseName}" already exists in AVAILABLE_MODULES`);
      return;
    }

    // Add the new module
    existingModules.push(camelCaseName);

    // Rebuild the array content
    const newArrayContent = existingModules.map(module => `"${module}"`).join(", ");
    const newContent = content.replace(modulesRegex, `export const AVAILABLE_MODULES = [${newArrayContent}];`);
    writeFileSync(constantsPath, newContent);
    console.warn("✅ Updated available modules constants");
  }
  else {
    console.error("❌ Could not find AVAILABLE_MODULES array in constants file");
  }
}

function appendToSchemaIndex(config: ModuleConfig): void {
  const schemaPath = join(process.cwd(), "packages/shared/sanity/schema-types/index.ts");
  const camelCaseName = toCamelCase(config.name);
  const kebabName = toKebabCase(config.name);

  if (!existsSync(schemaPath)) {
    console.error("❌ Schema index file not found");
    return;
  }

  const content = readFileSync(schemaPath, "utf-8");

  // Add import line
  const importLine = `import { ${camelCaseName}Type } from "@/sanity/schema-types/modules/${kebabName}-type";`;

  // Find the last import and add after it
  const lines = content.split("\n");
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("import ")) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, importLine);
  }

  // Add to schema array - find the closing bracket and add before it
  const schemaArrayIndex = lines.findIndex(line => line.includes("export const schema: SchemaTypeDefinition[]"));
  if (schemaArrayIndex !== -1) {
    // Find the closing bracket of the schema array
    let closingBracketIndex = -1;
    for (let i = schemaArrayIndex; i < lines.length; i++) {
      if (lines[i].trim() === "];") {
        closingBracketIndex = i;
        break;
      }
    }

    if (closingBracketIndex !== -1) {
      lines.splice(closingBracketIndex, 0, `  ${camelCaseName}Type,`);
    }
  }

  writeFileSync(schemaPath, lines.join("\n"));
  console.warn("✅ Updated schema index");
}

function appendToQueriesFile(config: ModuleConfig): void {
  const queriesPath = join(process.cwd(), "packages/shared/sanity/lib/queries.ts");

  if (!existsSync(queriesPath)) {
    console.error("❌ Queries file not found");
    return;
  }

  const content = readFileSync(queriesPath, "utf-8");
  const lines = content.split("\n");

  // Generate the module query
  const moduleQuery = generateModuleQuery(config);

  // Find the CONTENT_QUERY and add the new module query
  const contentQueryIndex = lines.findIndex(line => line.includes("const CONTENT_QUERY = `pageBuilder[]{"));

  if (contentQueryIndex !== -1) {
    // Find the closing of the CONTENT_QUERY
    let closingIndex = -1;
    let braceCount = 0;
    let inQuery = false;

    for (let i = contentQueryIndex; i < lines.length; i++) {
      const line = lines[i];

      // Count braces to track when we're inside the query
      for (const char of line) {
        if (char === "{") {
          braceCount++;
          inQuery = true;
        }
        if (char === "}") {
          braceCount--;
          if (braceCount === 0 && inQuery) {
            closingIndex = i;
            break;
          }
        }
      }
      if (closingIndex !== -1)
        break;
    }

    if (closingIndex !== -1) {
      // Insert the new module query before the closing brace
      lines.splice(closingIndex, 0, `,\n${moduleQuery}`);
    }
  }

  writeFileSync(queriesPath, lines.join("\n"));
  console.warn("✅ Updated queries file");
}

function promptForInput(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function getAvailablePageTypes(): string[] {
  const constantsPath = join(process.cwd(), "packages/shared/sanity/constants/page-types.ts");

  if (!existsSync(constantsPath)) {
    console.error("❌ Page types constants file not found");
    return [];
  }

  const content = readFileSync(constantsPath, "utf-8");
  const pageTypesRegex = /export const PAGE_TYPES = \[([\s\S]*?)\];/;
  const match = content.match(pageTypesRegex);

  if (match) {
    const arrayContent = match[1].trim();
    return arrayContent
      .split(",")
      .map(pageType => pageType.trim().replace(/['"]/g, ""))
      .filter(pageType => pageType.length > 0 && pageType !== "notFoundPage"); // Exclude notFoundPage
  }

  return [];
}

function promptForPageTypes(): Promise<string[]> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const availablePageTypes = getAvailablePageTypes();
    let selectedPageTypes: string[] = [];
    let currentIndex = 0;

    const displayMenu = () => {
      console.clear();
      console.warn("🚀 Creating new module...\n");
      console.warn("Select page types where this module can be used (use arrow keys, space to select, enter to confirm):\n");

      availablePageTypes.forEach((pageType, index) => {
        const isSelected = selectedPageTypes.includes(pageType);
        const isCurrent = index === currentIndex;
        const prefix = isCurrent ? ">" : " ";
        const checkbox = isSelected ? "[✓]" : "[ ]";
        console.warn(`${prefix} ${checkbox} ${pageType}`);
      });

      console.warn(`\nSelected: ${selectedPageTypes.length > 0 ? selectedPageTypes.join(", ") : "None"}`);
      console.warn("\nPress SPACE to toggle selection, ENTER to confirm, ESC to exit");
    };

    const handleKeyPress = (key: string) => {
      switch (key) {
        case "\u001B[A": // Up arrow
          currentIndex = Math.max(0, currentIndex - 1);
          displayMenu();
          break;
        case "\u001B[B": // Down arrow
          currentIndex = Math.min(availablePageTypes.length - 1, currentIndex + 1);
          displayMenu();
          break;
        case " ": { // Space
          const pageType = availablePageTypes[currentIndex];
          if (selectedPageTypes.includes(pageType)) {
            selectedPageTypes = selectedPageTypes.filter(pt => pt !== pageType);
          }
          else {
            selectedPageTypes.push(pageType);
          }
          displayMenu();
          break;
        }
        case "\r": // Enter
          rl.close();
          resolve(selectedPageTypes);
          break;
        case "\u001B": // ESC
          rl.close();
          process.exit(0);
          break;
      }
    };

    // Set up raw mode for key handling
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }

    process.stdin.on("data", (data) => {
      const key = data.toString();
      handleKeyPress(key);
    });

    displayMenu();
  });
}

function updatePageTypeFiles(config: ModuleConfig): void {
  const { name, pageTypes } = config;
  const camelCaseName = toCamelCase(name);

  pageTypes.forEach((pageType) => {
    const kebabPageType = toKebabCase(pageType);
    const pageTypePath = join(process.cwd(), `packages/shared/sanity/schema-types/page-templates/${kebabPageType}-type.ts`);

    if (!existsSync(pageTypePath)) {
      console.warn(`⚠️ Page type file not found: ${pageTypePath}`);
      return;
    }

    const content = readFileSync(pageTypePath, "utf-8");
    const lines = content.split("\n");

    // Find the modules array line (e.g., const homePageModules = [...])
    const modulesArrayIndex = lines.findIndex(line =>
      line.includes("Modules") && line.includes("=") && line.includes("["),
    );

    if (modulesArrayIndex !== -1) {
      const modulesLine = lines[modulesArrayIndex];

      // Extract existing modules
      const modulesMatch = modulesLine.match(/\[([\s\S]*?)\]/);
      if (modulesMatch) {
        const existingModules = modulesMatch[1]
          .split(",")
          .map(module => module.trim().replace(/['"]/g, ""))
          .filter(module => module.length > 0);

        // Check if module already exists
        if (existingModules.includes(camelCaseName)) {
          console.warn(`⚠️ Module "${camelCaseName}" already exists in ${pageType}`);
          return;
        }

        // Add the new module
        existingModules.push(camelCaseName);

        // Rebuild the modules array line
        const newModulesArray = existingModules.map(module => `"${module}"`).join(", ");
        const newModulesLine = modulesLine.replace(/\[[\s\S]*?\]/, `[${newModulesArray}]`);

        lines[modulesArrayIndex] = newModulesLine;

        writeFileSync(pageTypePath, lines.join("\n"));
        console.warn(`✅ Updated ${pageType} to include ${camelCaseName} module`);
      }
    }
  });
}

function updatePageBuilder(config: ModuleConfig): void {
  const { name } = config;
  const camelCaseName = toCamelCase(name);
  const pascalCaseName = toPascalCase(name);
  const kebabName = toKebabCase(name);

  const pageBuilderPath = join(process.cwd(), "packages/shared/components/core/page-builder.tsx");

  if (!existsSync(pageBuilderPath)) {
    console.error("❌ Page builder file not found");
    return;
  }

  const content = readFileSync(pageBuilderPath, "utf-8");
  const lines = content.split("\n");

  // Add import statement
  const importLine = `import { ${pascalCaseName} } from "@/components/modules/${kebabName}";`;

  // Find the last import and add after it
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("import ")) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, importLine);
  }

  // Add case to switch statement
  const switchCase = `          case "${camelCaseName}":
            return (
              <DragHandle key={block._key} blockKey={block._key} documentId={documentId} documentType={documentType}>
                <${pascalCaseName} {...block} />
              </DragHandle>
            );`;

  // Find the switch statement and add the case before the default case
  const defaultCaseIndex = lines.findIndex(line => line.includes("default:"));
  if (defaultCaseIndex !== -1) {
    lines.splice(defaultCaseIndex, 0, switchCase);
  }

  writeFileSync(pageBuilderPath, lines.join("\n"));
  console.warn("✅ Updated page builder with new module");
}

async function main() {
  console.warn("🚀 Creating new module...\n");

  try {
    // Get module name
    const name = await promptForInput("Enter module name in camelCase (e.g., \"testimonials\", \"gallery\"): ");
    if (!name) {
      console.error("❌ Module name is required");
      process.exit(1);
    }

    // Get title
    const title = await promptForInput(`Enter display title (default: "${name}"): `) || name;

    // Get page types
    const pageTypes = await promptForPageTypes();

    if (pageTypes.length === 0) {
      console.error("❌ At least one page type is required");
      process.exit(1);
    }

    const config: ModuleConfig = {
      name,
      title,
      pageTypes,
    };

    console.warn("\n📋 Configuration:");
    console.warn(`  Name: ${name}`);
    console.warn(`  Title: ${title}`);
    console.warn(`  Page Types: ${pageTypes.join(", ")}`);

    const confirm = await promptForInput("\nProceed with creation? (y/N): ");
    if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
      console.warn("❌ Cancelled");
      process.exit(0);
    }

    // Generate files
    const kebabName = toKebabCase(name);
    const schemaPath = join(process.cwd(), `packages/shared/sanity/schema-types/modules/${kebabName}-type.ts`);
    const componentPath = join(process.cwd(), `packages/shared/components/modules/${kebabName}.tsx`);

    if (existsSync(schemaPath)) {
      console.error(`❌ Schema file already exists: ${schemaPath}`);
      process.exit(1);
    }

    if (existsSync(componentPath)) {
      console.error(`❌ Component file already exists: ${componentPath}`);
      process.exit(1);
    }

    // Create schema file
    const schemaContent = generateModuleSchemaFile(config);
    writeFileSync(schemaPath, schemaContent);
    console.warn(`✅ Created module schema: ${schemaPath}`);

    // Create component file
    const componentContent = generateModuleComponentFile(config);
    writeFileSync(componentPath, componentContent);
    console.warn(`✅ Created module component: ${componentPath}`);

    // Update related files
    appendToAvailableModules(config);
    appendToSchemaIndex(config);
    appendToQueriesFile(config);
    updatePageTypeFiles(config);
    updatePageBuilder(config);

    console.warn("\n🎉 Module created successfully!");

    // Run typegen to update TypeScript types
    console.warn("\n🔄 Updating TypeScript types...");
    try {
      execSync("npm run typegen", { stdio: "inherit" });
      console.warn("✅ TypeScript types updated successfully!");
    }
    catch (error) {
      console.error("❌ Failed to update TypeScript types:", error);
      console.warn("Please run `npm run typegen` manually");
    }

    console.warn("\nNext steps:");
    console.warn("1. Restart your development server");
    console.warn(`2. The module is now available in these page types: ${pageTypes.join(", ")}`);
    console.warn("3. Create pages using the module in Sanity Studio");
    console.warn("4. Customize the component in src/components/");
  }
  catch (error) {
    console.error("❌ Error creating module:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
