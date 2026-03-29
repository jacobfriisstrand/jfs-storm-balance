import type { PAGE_QUERYResult } from "@/sanity/types";
import type { ItemList, ListItem, WithContext } from "schema-dts";

import { JSONLD } from "@/components/core/json-ld";
import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { Heading, Paragraph } from "@/components/ui/typography";
import ShellIcon from "@shared/assets/shell.svg";

function generateGridModuleData(props: GridModuleProps): WithContext<ItemList> {
  const { _key, title, subtitle, columns } = props;

  const listItems: ListItem[] | undefined = columns?.filter(column => column?.title || column?.description).map((column, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    ...(column.title ? { name: column.title } : {}),
    ...(column.description ? { description: column.description } : {}),
  })) as ListItem[] | undefined;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `#grid-module-${_key ?? "primary"}`,
    "name": title || "Kolonne modul",
    "description": subtitle || (title ? `Kolonne modul: ${title}` : "Kolonne modul module content"),
    ...(listItems && listItems.length > 0 ? { itemListElement: listItems } : {}),
  };
}

type GridModuleProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>["pageBuilder"]>[number],
  { _type: "gridModule" }
>;

type GridColumn = {
  _key: string;
  title?: string;
  description?: string;
};

export function GridModule(props: GridModuleProps) {
  const { title, subtitle, columns } = props;
  const gridModuleData = generateGridModuleData(props);

  return (
    <Container asChild>
      <section>
        <JSONLD data={gridModuleData} />
        <Grid className="gap-y-20 tablet:gap-y-140 tablet:items-end">
          <GridItem className="tablet:col-span-5">
            {title && <Heading size="h2" as="h2" colorScheme="dark" className="text-balance">{title}</Heading>}
          </GridItem>
          <GridItem className="tablet:col-start-8">
            {subtitle && <Paragraph>{subtitle}</Paragraph>}
          </GridItem>
          <GridItem>
            <ul className="grid grid-cols-1 tablet:grid-cols-3 gap-20 tablet:gap-60">
              {columns?.map(column => <GridModuleColumn key={column._key} column={column} />)}
            </ul>
          </GridItem>
        </Grid>
      </section>
    </Container>
  );
}

function GridModuleColumn({ column }: { column: GridColumn }) {
  return (
    <li className="aspect-square border border-dark rounded-base p-20 flex flex-col justify-between tablet:aspect-video">
      <div className="flex items-center justify-between gap-20">
        {column.title && <Heading size="h4" as="h3" colorScheme="dark">{column.title}</Heading>}
        <ShellIcon className="size-24 text-dark" />
      </div>
      {column.description && <Paragraph>{column.description}</Paragraph>}
    </li>
  );
}
