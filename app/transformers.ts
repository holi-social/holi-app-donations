import { Parser } from "https://deno.land/x/html_parser@v0.1.3/src/Parser.ts";
import {
  ApiBlogPost,
  ApiCarrier,
  ApiLink,
  ApiPicture,
  ApiProject,
  ApiProjectCategory,
  ApiProjectsResponse,
} from "./api_types.ts";
import {
  Initiative,
  News,
  Picture,
  Project,
  ProjectsResponse,
} from "./types.ts";

const PICTURE_TYPE_REGEX = /(.*)_(\d+)x(\d+)/;

const cleanUpHtml = (html: string): string => {
  let result = "";
  const parser = new Parser({
    onopentag: (name) => {
      if (name === "br") {
        result += "\n";
      }
    },
    ontext: (text) => {
      result += text;
    },
  });
  parser.end(html);
  return result;
};

const transformPicture = (picture: ApiPicture | undefined): Picture[] => {
  if (!picture) {
    return [];
  }
  return picture.links.map((link: ApiLink) => {
    try {
      const matches = PICTURE_TYPE_REGEX.exec(link.rel);
      if (matches?.length !== 4) {
        return {
          type: link.rel,
          url: link.href,
        };
      }
      return {
        type: matches[1],
        url: link.href,
        width: parseInt(matches[2], 10),
        height: parseInt(matches[3], 10),
      };
    } catch {
      return {
        type: link.rel,
        url: link.href,
      };
    }
  });
};

const transformCarrier = (carrier: ApiCarrier): Initiative => {
  return {
    id: carrier.id,
    name: carrier.name,
    city: carrier.city,
    country: carrier.country,
    url: carrier.links.find((l) => l.rel === "self")?.href, // will be replaced by separate resolver resp. used as fallback
    picture: transformPicture(carrier.picture),
  };
};

const toNumber = (field: number | string): number => {
  return typeof field === "number" ? field : Number.parseInt(field) as number;
};

export const transformProject = (project: ApiProject): Project => {
  return {
    id: toNumber(project.id),
    title: project.title,
    city: project.city,
    country: project.country,
    categories: [], // will be set by separate resolver
    initiative: transformCarrier(project.carrier),
    donationsCount: toNumber(project.donations_count),
    progressPercentage: toNumber(project.progress_percentage),
    openAmountInCents: toNumber(project.open_amount_in_cents),
    picture: transformPicture(project.profile_picture),
    summary: project.summary,
    description: project.description && cleanUpHtml(project.description),
    donationUrl: project.links.find((p) => p.rel === "new_donation")!.href,
    newsUrl: project.links.find((p) => p.rel === "blog_posts")!.href,
    news: [], // will be set by separate resolver
    newsCount: toNumber(project.blog_post_count),
  };
};

export const transformProjectsResponse = (
  response: ApiProjectsResponse,
): ProjectsResponse => {
  if (!response.data) {
    throw new Error(`Invalid response: ${JSON.stringify(response)}`);
  }
  return {
    totalResults: response.total_entries,
    data: response.data.map(transformProject),
  };
};

// TODO consider returning an object consisting of at least id + slug so that original category URL can be reconstructed
//  which could be needed in later stories in which we fetch projects of a given category
export const transformProjectCategory = (
  apiProjectCategory: ApiProjectCategory,
): string => apiProjectCategory.slug;

export const transformNews = (blogPost: ApiBlogPost): News => ({
  id: blogPost.id,
  title: blogPost.title,
  publishDate: blogPost.published_at,
  author: blogPost.author
    ? {
      name: blogPost.author.name,
      picture: transformPicture(blogPost.author.picture),
    }
    : undefined,
  body: cleanUpHtml(blogPost.body),
  url: blogPost.links.find((p) => p.rel === "platform")!.href,
});
