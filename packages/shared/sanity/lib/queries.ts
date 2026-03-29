import { defineQuery } from "next-sanity";

const IMAGE_QUERY = `{
  ...,
  alt,
  crop,
  hotspot,
  asset-> {
    url
  }
}`;

const SEO_QUERY = `
  "seo": {
    "title": seo.title,
    "description": coalesce(seo.description,  ""),
    "image": seo.image,
    "noIndex": seo.noIndex == true
  },
`;

// Fragment for resolving inline contact references in rich text fields
const INLINE_CONTACT_REFERENCES = `
  _type == "block" => {
    ...,
    children[]{
      ...,
      _type == "emailReference" => {
        _type,
        _key,
        "email": globalSettings->.contactInfo.email
      },
      _type == "phoneReference" => {
        _type,
        _key,
        "phone": globalSettings->.contactInfo.phone
      }
    }
  }
`;

const CONTENT_QUERY = `pageBuilder[]{
  ...,
  _type == "textAndImage" => {
    ...,
    image ${IMAGE_QUERY}
  }
,
  _type == "homepageHero" => {
    ...,
    title,
    description,
    image ${IMAGE_QUERY},
    buttons[]{
      ...,
      "label": select(label == null => undefined, label),
      linkType,
      url,
      page->{
        _id,
        _type,
        "slug": slug.current
      }
    }
  }
,
  _type == "genericHero" => {
    ...,
    image ${IMAGE_QUERY}
  }
,
  _type == "textAndLinkBlock" => {
    ...,
    description[]{
      ...,
      ${INLINE_CONTACT_REFERENCES}
    },
    link {
      ...,
      "url": select(url == null => undefined, url),
      "page": page->{
        _id,
        _type,
        "slug": slug.current
      }
    }
  }
,
  _type == "listModule" => {
    ...,
    image ${IMAGE_QUERY}
  }
,
  _type == "featureList" => {
    ...,
    description[]{
      ...,
      ${INLINE_CONTACT_REFERENCES}
    },
    link {
      ...,
      "url": select(url == null => undefined, url),
      "page": page->{
        _id,
        _type,
        "slug": slug.current
      }
    }
  }
,
  _type == "quoteModule" => {
    ...,
  }
,
  _type == "ctaBlock" => {
    ...,
    image ${IMAGE_QUERY},
    description[]{
      ...,
      ${INLINE_CONTACT_REFERENCES}
    },
    link {
      ...,
      "url": select(url == null => undefined, url),
      "page": page->{
        _id,
        _type,
        "slug": slug.current
      }
    }
  }
,
  _type == "contactModule" => {
    ...,
    contactButtonText,
    description[]{
      ...,
      ${INLINE_CONTACT_REFERENCES}
    }
  }
,
  _type == "richTextModule" => {
    ...,
    description[]{
      ...,
      ${INLINE_CONTACT_REFERENCES}
    }
  }
,
  _type == "gridModule" => {
    ...,
    image ${IMAGE_QUERY}
  }
,
  _type == "imageGrid" => {
    ...,
    image ${IMAGE_QUERY}
  }
,
  _type == "priceListModule" => {
    ...,
    image ${IMAGE_QUERY}
  }
}`;

// The $pageTypes is an array of page types that are allowed to be queried.
// This array is defined in the constants/page-types.ts file.
// The $slug is the slug of the page that is being queried.
// These parameters are passed in the homepage page.tsx and the [slug]/page.tsx files.
export const PAGE_QUERY = defineQuery(`*[_type in $pageTypes && slug.current == $slug][0]{
  ...,
  ${SEO_QUERY}
  ${CONTENT_QUERY}
}`);

export const NOT_FOUND_PAGE_QUERY = defineQuery(`*[_id == "notFoundPage"][0]{
  ...,
  ${SEO_QUERY}
  heading,
  subheading,
}`);

export const LOGO_QUERY = defineQuery(`*[_type == "globalSettings"][0]{
  "logo": logo ${IMAGE_QUERY}
}`);

export const CONTACT_BUTTONS_QUERY = defineQuery(`*[_type == "globalSettings"][0]{
  "email": contactInfo.email,
  "copyEmailTooltipText": copyEmailTooltipText
}`);

export const NAVIGATION_QUERY = defineQuery(`*[_type == "navigation"][0]{
  ...,
  logoText,
  contactButtonText,
  menu[]{
    _type,
    "label": select(label == null => undefined, label),
    "linkType": select(linkType == null => undefined, linkType),
    "url": select(url == null => undefined, url),
    "page": page->{
      _id,
      _type,
      "slug": slug.current
    }
  },
}`);

export const FOOTER_QUERY = defineQuery(`*[_type == "footer"][0]{
  ...,
  menu[]{
    _type,
    "label": select(label == null => undefined, label),
    "linkType": select(linkType == null => undefined, linkType),
    "url": select(url == null => undefined, url),
    "page": page->{
      _id,
      _type,
      "slug": slug.current
    }
  },
  footerDisplayText
}`);

export const FOOTER_INFO_QUERY = defineQuery(`*[_type == "globalSettings"][0]{
  "phone": contactInfo.phone,
  "email": contactInfo.email,
  "address": {
    "streetName": address.streetName,
    "streetNumber": address.streetNumber,
    "floor": address.floor,
    "zipCode": address.zipCode,
    "city": address.city
  },
  "copyright": copyright,
  "vatNumber": {
    "vatNumberHeading": vatNumberObject.vatNumberHeading,
    "vatNumber": vatNumberObject.vatNumber
  }
}`);

export const HOME_PAGE_QUERY = defineQuery(`*[_id == "homePage"][0]{
    ...,
    ${SEO_QUERY}
    ${CONTENT_QUERY}
  }`);

export const REDIRECTS_QUERY = defineQuery(`
  *[_type == "redirect" && isEnabled == true] {
      source,
      destination,
      permanent
  }
`);

export const OG_IMAGE_QUERY = defineQuery(`
  *[_id == $id][0]{
    title,
    "image": seo.image {
      ...,
      asset-> {
        _id,
        _type,
        url,
        metadata {
          palette
        }
      }
    }
  }    
`);

export const SITEMAP_QUERY = defineQuery(`
*[_type in $pageTypes && defined(slug.current)] {
    "href": select(
      _type == $pageTypes[0] => "/" + slug.current,
      slug.current
    ),
    _updatedAt
}
`);
