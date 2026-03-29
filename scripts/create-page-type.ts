#!/usr/bin/env tsx

import { AVAILABLE_MODULES } from "@/sanity/constants/available-modules";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";

type PageTypeConfig = {
  name: string;
  title: string;
  modules: string[];
  icon?: string;
};

// Icon options
const ICON_OPTIONS = [
  "📄",
  "📝",
  "📋",
  "📊",
  "📈",
  "📉",
  "🔧",
  "⚙️",
  "🎨",
  "🎯",
  "🚀",
  "💡",
  "⭐",
  "🌟",
  "🔥",
  "💎",
];

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

function generatePageTypeFile(config: PageTypeConfig): string {
  const { name, title, modules, icon = "📄" } = config;
  const camelCaseName = toCamelCase(name);

  return `import { defineField, defineType } from "sanity";

import { client } from "@/sanity/lib/client";
import { basePageBuilder } from "@/sanity/schema-types/page-templates/base-page-builder";

import { basePageType } from "./base-page-type";

export const apiVersion = process.env.SANITY_API_VERSION || "2025-03-26";

export const studioClient = client.withConfig({ apiVersion });

const ${camelCaseName}Modules = [${modules.map(m => `"${m}"`).join(", ")}];

export const ${camelCaseName}Type = defineType({
  name: "${camelCaseName}",
  title: "${title}",
  type: "document",
  icon: () => "${icon}",
  fields: [
    ...basePageType.fields,
    defineField({
      ...basePageBuilder(${camelCaseName}Modules),
    }),
  ],
  preview: basePageType.preview,
});
`;
}

function generateContentQuery(config: PageTypeConfig): string {
  const { modules } = config;
  const pascalCaseName = toPascalCase(config.name);

  const moduleQueries = modules.map((module) => {
    switch (module) {
      case "faqs":
        return `  _type == "faqs" => {
    ...,
    faqs[]->{
    _id,
    title,
    body,
    "text": pt::text(body)
}
  }`;
      case "hero":
        return `  _type == "hero" => {
    ...,
    image \${IMAGE_QUERY}
  }`;
      case "textAndImage":
        return `  _type == "textAndImage" => {
    ...,
    image \${IMAGE_QUERY}
  }`;
      case "features":
        return `  _type == "features" => {
    ...,
    features[]{
      _id,
      title,
      description,
      icon
    }
  }`;
      default:
        return `  _type == "${module}" => {
    ...
  }`;
    }
  }).join(",\n");

  return `// Content query for ${config.name} - ${modules.join(", ")} modules
const ${pascalCaseName.toUpperCase()}_CONTENT_QUERY = \`pageBuilder[]{
  ...,
${moduleQueries}
}\`;`;
}

function appendToSchemaIndex(config: PageTypeConfig): void {
  const schemaPath = join(process.cwd(), "packages/shared/sanity/schema-types/index.ts");
  const camelCaseName = toCamelCase(config.name);
  const kebabName = toKebabCase(config.name);

  if (!existsSync(schemaPath)) {
    console.error("❌ Schema index file not found");
    return;
  }

  const content = readFileSync(schemaPath, "utf-8");

  // Add import line
  const importLine = `import { ${camelCaseName}Type } from "@/sanity/schema-types/page-templates/${kebabName}-type";`;

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

function appendToPageTypesConstant(config: PageTypeConfig): void {
  const constantsPath = join(process.cwd(), "packages/shared/sanity/constants/page-types.ts");
  const camelCaseName = toCamelCase(config.name);

  if (!existsSync(constantsPath)) {
    console.error("❌ Page types constants file not found");
    return;
  }

  const content = readFileSync(constantsPath, "utf-8");

  // Handle both single-line and multi-line PAGE_TYPES arrays
  const pageTypesRegex = /export const PAGE_TYPES = \[([\s\S]*?)\];/;
  const match = content.match(pageTypesRegex);

  if (match) {
    const arrayContent = match[1].trim();
    const newArrayContent = arrayContent.endsWith("\"")
      ? `${arrayContent}, "${camelCaseName}"`
      : `"${camelCaseName}"`;

    const newContent = content.replace(pageTypesRegex, `export const PAGE_TYPES = [${newArrayContent}];`);
    writeFileSync(constantsPath, newContent);
    console.warn("✅ Updated page types constants");
  }
  else {
    console.error("❌ Could not find PAGE_TYPES array in constants file");
  }
}

function appendToQueriesFile(config: PageTypeConfig): void {
  const queriesPath = join(process.cwd(), "packages/shared/sanity/lib/queries.ts");
  const camelCaseName = toCamelCase(config.name);
  const pascalCaseName = toPascalCase(config.name);

  if (!existsSync(queriesPath)) {
    console.error("❌ Queries file not found");
    return;
  }

  const content = readFileSync(queriesPath, "utf-8");
  const lines = content.split("\n");

  // Add content query - find where to insert it
  const contentQuery = generateContentQuery(config);
  const insertIndex = lines.findIndex(line => line.includes("// Generic content query for pages that might have different module combinations"));

  if (insertIndex !== -1) {
    lines.splice(insertIndex, 0, "", ...contentQuery.split("\n"));
  }

  // Add to PAGE_QUERY select statement
  const selectIndex = lines.findIndex(line => line.includes("\"content\": select("));
  if (selectIndex !== -1) {
    // Find the fallback case (the last case without a condition)
    let fallbackCaseIndex = -1;
    let parenCount = 0;
    let inSelect = false;

    for (let i = selectIndex; i < lines.length; i++) {
      const line = lines[i];

      // Count parentheses to track when we're inside the select
      for (const char of line) {
        if (char === "(") {
          parenCount++;
          inSelect = true;
        }
        if (char === ")") {
          parenCount--;
          if (parenCount === 0 && inSelect) {
            // We've reached the end of the select, look backwards for fallback case
            for (let j = i - 1; j >= selectIndex; j--) {
              const prevLine = lines[j].trim();
              // Look for a line that starts with just { (fallback case)
              if ((prevLine === "{" || prevLine.startsWith("{")) && !(prevLine.includes("=>"))) {
                fallbackCaseIndex = j;
                break;
              }
            }
            break;
          }
        }
      }
      if (fallbackCaseIndex !== -1)
        break;
    }

    if (fallbackCaseIndex !== -1) {
      // Insert the new case before the fallback case
      lines.splice(fallbackCaseIndex, 0, `    _type == "${camelCaseName}" => {`, `      \${${pascalCaseName.toUpperCase()}_CONTENT_QUERY}`, `    },`);
    }
  }

  writeFileSync(queriesPath, lines.join("\n"));
  console.warn("✅ Updated queries file");
}

function appendToStructureFile(config: PageTypeConfig): void {
  const structurePath = join(process.cwd(), "packages/shared/sanity/structure.ts");
  const camelCaseName = toCamelCase(config.name);

  if (!existsSync(structurePath)) {
    console.error("❌ Structure file not found");
    return;
  }

  const content = readFileSync(structurePath, "utf-8");
  const lines = content.split("\n");

  // Find the customTitles object
  const customTitlesStartIndex = lines.findIndex(line => line.includes("const customTitles: Record<string, string> = {"));
  if (customTitlesStartIndex === -1) {
    console.error("❌ Could not find customTitles object in structure file");
    return;
  }

  // Find the closing bracket of the customTitles object
  let customTitlesEndIndex = -1;
  let braceCount = 0;
  let inCustomTitles = false;

  for (let i = customTitlesStartIndex; i < lines.length; i++) {
    const line = lines[i];

    for (const char of line) {
      if (char === "{") {
        braceCount++;
        inCustomTitles = true;
      }
      if (char === "}") {
        braceCount--;
        if (braceCount === 0 && inCustomTitles) {
          customTitlesEndIndex = i;
          break;
        }
      }
    }
    if (customTitlesEndIndex !== -1)
      break;
  }

  if (customTitlesEndIndex === -1) {
    console.error("❌ Could not find closing bracket of customTitles object");
    return;
  }

  // Check if the page type already exists in customTitles
  const existingEntry = lines.find(line => line.includes(`"${camelCaseName}":`));
  if (existingEntry) {
    console.warn(`⚠️  Custom title for "${camelCaseName}" already exists, skipping structure update`);
    return;
  }

  // Add the new custom title entry before the closing bracket
  const newEntry = `            ${camelCaseName}: "${config.title}",`;
  lines.splice(customTitlesEndIndex, 0, newEntry);

  writeFileSync(structurePath, lines.join("\n"));
  console.warn("✅ Updated structure file with custom title");
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

function promptForModules(): Promise<string[]> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let selectedModules: string[] = [];
    let currentIndex = 0;

    const displayMenu = () => {
      console.clear();
      console.warn("🚀 Creating new page type...\n");
      console.warn("Select modules to include (use arrow keys, space to select, enter to confirm):\n");

      AVAILABLE_MODULES.forEach((module, index) => {
        const isSelected = selectedModules.includes(module);
        const isCurrent = index === currentIndex;
        const prefix = isCurrent ? ">" : " ";
        const checkbox = isSelected ? "[✓]" : "[ ]";
        console.warn(`${prefix} ${checkbox} ${module}`);
      });

      console.warn(`\nSelected: ${selectedModules.length > 0 ? selectedModules.join(", ") : "None"}`);
      console.warn("\nPress SPACE to toggle selection, ENTER to confirm, ESC to exit");
    };

    const handleKeyPress = (key: string) => {
      switch (key) {
        case "\u001B[A": // Up arrow
          currentIndex = Math.max(0, currentIndex - 1);
          displayMenu();
          break;
        case "\u001B[B": // Down arrow
          currentIndex = Math.min(AVAILABLE_MODULES.length - 1, currentIndex + 1);
          displayMenu();
          break;
        case " ": { // Space
          const module = AVAILABLE_MODULES[currentIndex];
          if (selectedModules.includes(module)) {
            selectedModules = selectedModules.filter(m => m !== module);
          }
          else {
            selectedModules.push(module);
          }
          displayMenu();
          break;
        }
        case "\r": // Enter
          rl.close();
          resolve(selectedModules);
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

function promptForIcon(): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let currentIndex = 0;

    const displayMenu = () => {
      console.clear();
      console.warn("🚀 Creating new page type...\n");
      console.warn("Select an icon (use arrow keys to navigate, enter to confirm):\n");

      ICON_OPTIONS.forEach((icon, index) => {
        const isCurrent = index === currentIndex;
        const prefix = isCurrent ? ">" : " ";
        console.warn(`${prefix} ${icon}`);
      });

      console.warn(`\nSelected: ${ICON_OPTIONS[currentIndex]}`);
      console.warn("\nPress ENTER to confirm, ESC to exit");
    };

    const handleKeyPress = (key: string) => {
      switch (key) {
        case "\u001B[A": // Up arrow
          currentIndex = Math.max(0, currentIndex - 1);
          displayMenu();
          break;
        case "\u001B[B": // Down arrow
          currentIndex = Math.min(ICON_OPTIONS.length - 1, currentIndex + 1);
          displayMenu();
          break;
        case "\r": // Enter
          rl.close();
          resolve(ICON_OPTIONS[currentIndex]);
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

async function main() {
  console.warn("🚀 Creating new page type...\n");

  try {
    // Get page type name
    const name = await promptForInput("Enter page type name in camelCase (e.g., \"blogPost\", \"productPage\"): ");
    if (!name) {
      console.error("❌ Page type name is required");
      process.exit(1);
    }

    // Get title
    const title = await promptForInput(`Enter display title for Sanity Studio (default: "${name}"): `) || name;

    // Get modules
    const modules = await promptForModules();

    if (modules.length === 0) {
      console.error("❌ At least one module is required");
      process.exit(1);
    }

    // Get icon
    const icon = await promptForIcon();

    const config: PageTypeConfig = {
      name,
      title,
      modules,
      icon,
    };

    console.warn("\n📋 Configuration:");
    console.warn(`  Name: ${name}`);
    console.warn(`  Title: ${title} (used in schema and structure)`);
    console.warn(`  Modules: ${modules.join(", ")}`);
    console.warn(`  Icon: ${icon}`);

    const confirm = await promptForInput("\nProceed with creation? (y/N): ");
    if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
      console.warn("❌ Cancelled");
      process.exit(0);
    }

    // Generate files
    const kebabName = toKebabCase(name);
    const filePath = join(process.cwd(), `packages/shared/sanity/schema-types/page-templates/${kebabName}-type.ts`);

    if (existsSync(filePath)) {
      console.error(`❌ File already exists: ${filePath}`);
      process.exit(1);
    }

    const fileContent = generatePageTypeFile(config);
    writeFileSync(filePath, fileContent);
    console.warn(`✅ Created page type file: ${filePath}`);

    // Update related files by appending
    appendToSchemaIndex(config);
    appendToPageTypesConstant(config);
    appendToQueriesFile(config);
    appendToStructureFile(config);

    console.warn("\n🎉 Page type created successfully!");

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
    console.warn("2. Create pages of this type in Sanity Studio");
  }
  catch (error) {
    console.error("❌ Error creating page type:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
