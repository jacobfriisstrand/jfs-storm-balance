import type { PAGE_QUERYResult } from "@/sanity/types";

import { PageBuilder } from "@/components/core/page-builder";
import { sanityFetch } from "@/sanity/lib/live";
import { CONTACT_BUTTONS_QUERY } from "@/sanity/lib/queries";

type PageBuilderWrapperProps = {
  modules: NonNullable<PAGE_QUERYResult>["pageBuilder"];
  documentId: string;
  documentType: string;
};

export async function PageBuilderWrapper(props: PageBuilderWrapperProps) {
  const { data: contactButtonsData } = await sanityFetch<typeof CONTACT_BUTTONS_QUERY>({ query: CONTACT_BUTTONS_QUERY });
  return <PageBuilder {...props} contactButtonsData={contactButtonsData} />;
}
