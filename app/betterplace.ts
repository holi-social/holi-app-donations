import { log, Parser } from "./deps.ts";
import {
  Initiative,
  News,
  NewsParameters,
  Picture,
  Project,
  ProjectParameters,
  ProjectsParameters,
  ProjectsResponse,
} from "./types.ts";
import {
  ApiBlogPost,
  ApiCarrier,
  ApiLink,
  ApiOrganisation,
  ApiPicture,
  ApiProject,
  ApiProjectCategory,
  ApiProjectsResponse,
} from "./api_types.ts";

const BASE_URL = "https://api.betterplace.org";
const PICTURE_TYPE_REGEX = /(.*)_(\d+)x(\d+)/;
const SUPPORTED_LOCALES = ["en", "de"];
const DEFAULT_LOCALE = "en";

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

const transformPicture = (
  picture: ApiPicture | undefined,
): Picture[] => {
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

const transformCarrier = (
  carrier: ApiCarrier,
): Initiative => {
  return {
    id: carrier.id,
    name: carrier.name,
    city: carrier.city,
    country: carrier.country,
    url: carrier.links.find((l) => l.rel === "self")?.href, // will be replaced by separate resolver resp. used as fallback
    picture: transformPicture(carrier.picture),
  };
};

const transformProject = (
  project: ApiProject,
): Project => {
  return {
    id: project.id,
    title: project.title,
    city: project.city,
    country: project.country,
    categories: [], // will be set by separate resolver
    initiative: transformCarrier(project.carrier),
    donationsCount: project.donations_count,
    progressPercentage: project.progress_percentage,
    openAmountInCents: project.open_amount_in_cents,
    picture: transformPicture(project.profile_picture),
    summary: project.summary,
    description: project.description && cleanUpHtml(project.description),
    donationUrl: project.links.find((p) => p.rel === "new_donation")!.href,
    newsUrl: project.links.find((p) => p.rel === "blog_posts")!.href,
    news: [], // will be set by separate resolver
    newsCount: project.blog_post_count,
  };
};

const transformProjectsResponse = (
  response: ApiProjectsResponse,
): ProjectsResponse => {
  return {
    totalResults: response.total_entries,
    data: response.data.map(transformProject),
  };
};

// TODO consider returning an object consisting of at least id + slug so that original category URL can be reconstructed
//  which could be needed in later stories in which we fetch projects of a given category
const transformProjectCategory = (
  apiProjectCategory: ApiProjectCategory,
): string => apiProjectCategory.slug;

const transformNews = (
  blogPost: ApiBlogPost,
): News => ({
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

export const fetchCategories = (
  projectId: number,
): Promise<string[]> => {
  // even though the original query might use a different locale, we are using "en" as locale deliberately
  // betterplace translates category slugs but we need stable identifiers, therefore we default to "en"
  const href =
    `https://api.betterplace.org/en/api_v4/projects/${projectId}/categories.json`;
  log.debug(`  fetching project categories from ${href}`);
  return fetch(href)
    .then((result) => result.json())
    .then((json) => (json.data as Array<ApiProjectCategory>))
    .then((categories) => categories.map(transformProjectCategory))
    .catch((e) => {
      log.error(
        `Error while fetching project categories from '${href}', using empty array to handle this (somewhat) gracefully`,
        e,
      );
      return [];
    });
};

export const fetchNews = (
  project: Project,
  parameters: NewsParameters,
): Promise<News[]> => {
  const href = project.newsUrl +
    `?per_page=${parameters.limit || 5}&order=published_at:desc`;
  log.debug(`  fetching blog posts from ${href}`);

  return fetch(href)
    .then((result) => result.json())
    .then((json) => (json.data as ApiBlogPost[]))
    .then((news) => news.map(transformNews))
    .catch((e) => {
      log.error(
        `Error while fetching blog posts from '${href}', using empty array to handle this (somewhat) gracefully`,
        e,
      );
      return [];
    });
};

export const fetchInitiativeUrl = (
  initiative: Initiative,
): Promise<string | undefined> => {
  if (!initiative.url) {
    return Promise.resolve(initiative.url);
  }
  return fetch(initiative.url)
    .then((result) => result.json())
    .then((organisation: ApiOrganisation) =>
      organisation.links.find((l) => l.rel === "platform")?.href
    )
    .catch((e) => {
      log.error(
        `Error while fetching organisation url from '${initiative.url}', using api url to handle this (somewhat) gracefully`,
        e,
      );
      return initiative.url;
    });
};

function _debugP<In>(desc: string | undefined = undefined) {
  return async (elemP: In) => {
    const elem = await elemP;
    if (desc) console.debug(desc, elem);
    else console.debug(elem);
    return elem;
  };
}

const getLocaleForLanguage = (languages = "") =>
  languages.split(",").map((language) => language.split("-")[0])
    .find((language) => SUPPORTED_LOCALES.includes(language)) || DEFAULT_LOCALE;

const buildProjectsUrl = (
  { limit = 5, offset = 0, location }: ProjectsParameters,
  language?: string,
): URL => {
  const page = Math.floor(offset / limit) + 1; // page is NOT zero-based (!), i.e. first page = 1
  const locale = getLocaleForLanguage(language);
  const url = new URL(`${BASE_URL}/${locale}/api_v4/projects.json`);
  url.searchParams.append(
    "facets",
    "completed:false|closed:false|prohibit_donations:false",
  );
  url.searchParams.append("order", "rank:DESC");
  url.searchParams.append("page", page.toString());
  url.searchParams.append("per_page", limit.toString());
  if (location) {
    url.searchParams.append("scope", "location");
    url.searchParams.append("q", location);
  }
  return url;
};

export const fetchProjects = (
  params: ProjectsParameters,
  langauge?: string,
): Promise<ProjectsResponse> => {
  const url = buildProjectsUrl(params, langauge);
  const start = Date.now();
  log.debug(`fetching projects from ${url}`);
  return fetch(url)
    .then((result) => result.json())
    .then(transformProjectsResponse)
    .then((result) => {
      const duration = Date.now() - start;
      log.debug(`  fetching projects took ${duration} ms`);
      return result;
    })
    .catch((e) => {
      const duration = Date.now() - start;
      log.error(
        `Error performing request to ${url} after ${duration} ms: ${e.message}`,
      );
      throw e;
    });
};

export const fetchProject = (
  { id }: ProjectParameters,
  language?: string,
): Promise<Project> => {
  const locale = getLocaleForLanguage(language);
  const url = `${BASE_URL}/${locale}/api_v4/projects/${id}.json`;
  log.debug(`fetching project from ${url}`);
  const start = Date.now();
  return fetch(url)
    .then((result) => result.json())
    .then(transformProject)
    .then((result) => {
      const duration = Date.now() - start;
      log.debug(`  fetching project with ID ${id} took ${duration} ms`);
      return result;
    })
    .catch((e) => {
      const duration = Date.now() - start;
      log.error(
        `Error performing request to ${url} after ${duration} ms: ${e.message}`,
      );
      throw e;
    });
};
