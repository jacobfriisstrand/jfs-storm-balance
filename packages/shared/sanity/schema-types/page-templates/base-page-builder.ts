import { defineArrayMember, defineType } from "sanity";

export function basePageBuilder(moduleTypes: string[], requiredFirstModule?: string) {
  return defineType({
    name: "pageBuilder",
    type: "array",
    title: "Moduler",
    validation: (Rule) => {
      if (requiredFirstModule) {
        const moduleName = requiredFirstModule === "genericHero"
          ? "Generisk side hero"
          : requiredFirstModule === "homepageHero"
            ? "Forside hero"
            : requiredFirstModule;

        return Rule.required()
          .min(1)
          .error(`Mindst ét modul er påkrævet. Første modul skal være ${moduleName}`)
          .custom((value: unknown) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
              return `Første modul skal være ${moduleName}`;
            }

            const firstModule = value[0] as { _type?: string } | undefined;
            if (!firstModule || firstModule._type !== requiredFirstModule) {
              return `Første modul skal være ${moduleName}`;
            }

            return true;
          });
      }

      return Rule.required().min(1).error("Mindst ét modul er påkrævet");
    },
    options: {
      insertMenu: {
        views: [
          {
            name: "grid",
            previewImageUrl: (schemaType: string) => `/block-previews/${schemaType}.png`,
          },
        ],
      },
    },
    of: [
      ...moduleTypes.map(moduleType => defineArrayMember({ type: moduleType })),
    ],
  });
}
