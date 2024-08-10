import { GraphQLError } from "./deps.ts";
import {
  BetterPlaceLanguage,
  Initiative,
  News,
  NewsParameters,
  Project,
  ProjectParameters,
  ProjectsParameters,
  ProjectsResponse,
} from "./types.ts";
import {
  ApiBlogPost,
  ApiOrganisation,
  ApiProjectCategory,
} from "./api_types.ts";
import { logger } from "./logging.ts";
import {
  transformNews,
  transformProject,
  transformProjectCategory,
  transformProjectsResponse,
} from "./transformers.ts";
import { DEFAULT_LANGUAGE, DEFAULT_PAGE_SIZE } from "./constants.ts";

const BASE_URL = "https://api.betterplace.org";
const MAX_PAGE_FOR_RANDOMIZATION = 10;
const ERROR_CODE_NOT_FOUND = "NOT_FOUND";

export const fetchCategories = async (projectId: number): Promise<string[]> => {
  // even though the original query might use a different locale, we are using "en" as locale deliberately
  // betterplace translates category slugs but we need stable identifiers, therefore we default to "en"
  const href =
    `https://api.betterplace.org/en/api_v4/projects/${projectId}/categories.json`;
  logger.info(`fetching project categories from ${href}`);
  try {
    const response = await fetch(href);
    const json = await response.json();
    const categories = json.data as Array<ApiProjectCategory>;
    return categories.map(transformProjectCategory);
  } catch (e) {
    logger.error(
      `Error while fetching project categories from '${href}', using empty array to handle this (somewhat) gracefully`,
      e,
    );
    return [];
  }
};

export const fetchNews = async (
  project: Project,
  parameters: NewsParameters,
): Promise<News[]> => {
  const href = project.newsUrl +
    `?per_page=${parameters.limit || 5}&order=published_at:desc`;
  logger.info(`fetching blog posts from ${href}`);

  try {
    const response = await fetch(href);
    const json = await response.json();
    const news = json.data as ApiBlogPost[];
    return news.map(transformNews);
  } catch (e) {
    logger.error(
      `Error while fetching blog posts from '${href}', using empty array to handle this (somewhat) gracefully`,
      e,
    );
    return [];
  }
};

export const fetchInitiativeUrl = async (
  initiative: Initiative,
): Promise<string | undefined> => {
  if (!initiative.url) {
    return Promise.resolve(initiative.url);
  }
  try {
    const response = await fetch(initiative.url);
    const organisation: ApiOrganisation = await response.json();
    return organisation.links.find((l) => l.rel === "platform")?.href;
  } catch (e) {
    logger.error(
      `Error while fetching organisation url from '${initiative.url}', using api url to handle this (somewhat) gracefully`,
      e,
    );
    return initiative.url;
  }
};

function _debugP<In>(desc: string | undefined = undefined) {
  return async (elemP: In) => {
    const elem = await elemP;
    if (desc) console.debug(desc, elem);
    else console.debug(elem);
    return elem;
  };
}

const buildProjectsUrl = (
  { limit = DEFAULT_PAGE_SIZE, offset = 0, location }: ProjectsParameters,
  language: string = DEFAULT_LANGUAGE,
): URL => {
  const page = Math.floor(offset / limit) + 1; // page is NOT zero-based (!), i.e. first page = 1
  const url = new URL(`${BASE_URL}/${language}/api_v4/projects.json`);
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

const fetchPageOfProjects = async (
  params: ProjectsParameters,
  language: BetterPlaceLanguage = DEFAULT_LANGUAGE,
): Promise<ProjectsResponse> => {
  const url = buildProjectsUrl(params, language);
  const start = Date.now();
  logger.info(`fetching projects from ${url}`);
  try {
    const fetchResponse = await fetch(url);
    const jsonResponse = await fetchResponse.json();
    return transformProjectsResponse(jsonResponse);
  } catch (e) {
    logger.error(
      `Error performing request to ${url}: ${e.message}`,
    );
    throw e;
  } finally {
    const duration = Date.now() - start;
    logger.debug(`fetching projects took ${duration} ms`);
  }
};

// Do not select projects from too far back
const randomPageForToday = () =>
  (new Date().setUTCHours(0, 0, 0, 0) / 100000) % MAX_PAGE_FOR_RANDOMIZATION;

export const fetchProjects = async (
  { offset = 0, limit = DEFAULT_PAGE_SIZE, location }: ProjectsParameters,
  language: BetterPlaceLanguage = DEFAULT_LANGUAGE,
): Promise<ProjectsResponse> => {
  // When not filtering: Each day a randomly selected page is sorted to the front
  const randomPage = randomPageForToday();
  const isFiltering = !!location;
  const isFirstPageOfUnfilteredList = offset < limit && !isFiltering;
  if (isFirstPageOfUnfilteredList) {
    logger.info(`fetching random projects from page ${randomPage}`);
    const projects = await fetchPageOfProjects({
      offset: randomPage * DEFAULT_PAGE_SIZE,
      limit: DEFAULT_PAGE_SIZE,
    }, language);
    return ({
      ...projects,
      data: projects.data.slice(0, limit),
    });
  }
  // After one randomly selected page, "normal" pagination starts with offset 0 and skips the random page that was already displayed
  const afterRandomPage = offset > randomPage * DEFAULT_PAGE_SIZE;
  return fetchPageOfProjects({
    offset: (isFiltering || afterRandomPage) ? offset : offset - limit,
    limit,
    location,
  }, language);
};

export const fetchProject = async (
  { id }: ProjectParameters,
  language: BetterPlaceLanguage = DEFAULT_LANGUAGE,
): Promise<Project> => {
  const url = `${BASE_URL}/${language}/api_v4/projects/${id}.json`;
  logger.info(`fetching project from ${url}`);
  const start = Date.now();
  try {
    const response = await fetch(url);
    if (response.status === 404) {
      throw new GraphQLError("Not found", {
        extensions: { "code": ERROR_CODE_NOT_FOUND },
      });
    }
    const json = await response.json();
    return transformProject(json);
  } catch (e) {
    if (e.extensions?.code !== ERROR_CODE_NOT_FOUND) {
      logger.error(
        `Error performing request to ${url}: ${e.message}`,
      );
    }
    throw e;
  } finally {
    const duration = Date.now() - start;
    logger.debug(`fetching project with ID ${id} took ${duration} ms`);
  }
};
