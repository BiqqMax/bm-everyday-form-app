import type { Metadata } from "next";

import { siteUrl } from "./supabase/env";

export const SITE_NAME = "Everyday Forms";
export const SITE_DESCRIPTION = "Dependable forms and workflow software for everyday use.";
export const SITE_DOMAIN = new URL(siteUrl).hostname;
export const SITE_LOGO_PATH = "/logo.svg";
export const SITE_SOCIAL_IMAGE_PATH = "/opengraph-image";
export const SITE_SUPPORT_EMAIL = "support@everydayforms.com";
export const SITE_SOCIAL_LINKS = [
  "https://twitter.com/everydayforms",
  "https://facebook.com/everydayforms",
  "https://www.linkedin.com/company/everydayforms",
  "https://github.com/everydayforms",
] as const;

export type SeoBreadcrumbItem = {
  name: string;
  path: string;
};

export type SeoMetadataOptions = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  imagePath?: string;
  type?: "website" | "article";
};

function joinTitle(pageTitle: string) {
  return `${pageTitle} | ${SITE_NAME}`;
}

function resolvePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function resolveUrl(path: string) {
  return new URL(resolvePath(path), siteUrl).toString();
}

function buildRobotsConfig(noindex: boolean) {
  if (noindex) {
    return {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  };
}

function buildImageMetadata(url: string, alt: string) {
  return [
    {
      url,
      alt,
      width: 1200,
      height: 630,
    },
  ];
}

export function createPageMetadata({
  title,
  description,
  path,
  noindex = false,
  imagePath = SITE_SOCIAL_IMAGE_PATH,
  type = "website",
}: SeoMetadataOptions): Metadata {
  const url = resolveUrl(path);
  const imageUrl = resolveUrl(imagePath);

  return {
    metadataBase: new URL(siteUrl),
    title: joinTitle(title),
    description,
    alternates: {
      canonical: url,
    },
    robots: buildRobotsConfig(noindex),
    openGraph: {
      title: joinTitle(title),
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: buildImageMetadata(imageUrl, `${title} social preview`),
    },
    twitter: {
      card: "summary_large_image",
      title: joinTitle(title),
      description,
      images: [imageUrl],
    },
  };
}

export function createBreadcrumbJsonLd(items: SeoBreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: resolveUrl(item.path),
    })),
  };
}

export function createWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
  };
}

export function createOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: SITE_NAME,
    url: siteUrl,
    logo: resolveUrl(SITE_LOGO_PATH),
    description: SITE_DESCRIPTION,
    email: SITE_SUPPORT_EMAIL,
    sameAs: [...SITE_SOCIAL_LINKS],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SITE_SUPPORT_EMAIL,
        url: resolveUrl("/support"),
        availableLanguage: ["en"],
      },
    ],
  };
}

export function createSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Form Builder",
    operatingSystem: "Web",
    url: siteUrl,
    description: SITE_DESCRIPTION,
    image: resolveUrl(SITE_SOCIAL_IMAGE_PATH),
    offers: {
      "@type": "Offer",
      url: resolveUrl("/signup"),
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Form creation",
      "Response management",
      "Workspace organization",
      "Link and QR sharing",
      "Secure account access",
    ],
  };
}

export function createFaqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function seoJsonLdScript(data: unknown) {
  return JSON.stringify(data);
}

export function createCanonicalPath(path: string) {
  return resolvePath(path);
}

export function createCanonicalUrl(path: string) {
  return resolveUrl(path);
}
