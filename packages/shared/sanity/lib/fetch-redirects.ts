import { client } from "./client";
import { REDIRECTS_QUERY } from "./queries";

export async function fetchRedirects() {
  const redirects = await client.fetch(REDIRECTS_QUERY);

  // Filter out any redirects with null values and ensure they match Next.js redirect format
  return redirects
    .filter((redirect: any) => redirect.source && redirect.destination)
    .map((redirect: any) => ({
      source: redirect.source as string,
      destination: redirect.destination as string,
      permanent: redirect.permanent ?? true,
    }));
}
