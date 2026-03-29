// import your local configured client
import { client } from "@/sanity/lib/client";
import { defineLive } from "next-sanity/live";

// set your viewer token
const token = process.env.NEXT_PUBLIC_SANITY_API_READ_TOKEN;
if (!token) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_API_READ_TOKEN");
}

// export the sanityFetch helper and the SanityLive component
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
});
