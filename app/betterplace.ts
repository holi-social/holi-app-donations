import { log } from "./deps.ts";
import {
  Picture,
  PictureType,
  Project,
  ProjectParameters,
  ProjectsResponse,
} from "./types.ts";

const BASE_URL = "https://api.betterplace.org";

const PICTURE_TYPE_MAPPING: {
  [key: string]: PictureType;
} = {
  original: "original",
  fill_410x214: "small",
};

type ApiProjectId = number;

type ApiLink = {
  href: string;
  rel: string;
};

type ApiProfilePicture = {
  links: Array<ApiLink>;
};

/** only covers the parts of the API response type that were using */
type ApiProject = {
  id: ApiProjectId;
  title: string;
  links: Array<ApiLink>;
  donations_count: number;
  progress_percentage: number;
  open_amount_in_cents: number;
  profile_picture: ApiProfilePicture | undefined;
};

/** only covers the parts of the API response type that were using */
export type ApiProjectsResponse = {
  total_entries: number;
  offset: number;
  data: Array<ApiProject>;
};

export type ApiProjectCategorySlug = string;

export type ApiProjectCategory = {
  created_at: string; // ISO datetime
  id: number;
  links: Array<ApiLink>;
  name: string;
  slug: ApiProjectCategorySlug;
  updated_at: string; // ISO datetime
};

const transformPicture = (
  picture: ApiProfilePicture | undefined,
): Picture[] => {
  return (picture?.links || []).filter((link) =>
    link.href && Object.keys(PICTURE_TYPE_MAPPING).includes(link.rel)
  ).map((link: { href: string; rel: string }) => {
    return {
      url: link.href,
      type: PICTURE_TYPE_MAPPING[link.rel],
    };
  });
};

const transformProject = (
  project: ApiProject,
): Project => {
  return {
    id: project.id,
    title: project.title,
    categories: [], // will be set by separate resolver
    donationsCount: project.donations_count,
    progressPercentage: project.progress_percentage,
    openAmountInCents: project.open_amount_in_cents,
    picture: transformPicture(project.profile_picture),
  };
};

const transformProjectResponse = (
  response: ApiProjectsResponse,
): ProjectsResponse => {
  const apiProjects = response.data;
  return {
    totalResults: response.total_entries,
    offset: response.offset,
    projects: apiProjects.map(transformProject),
  };
};

// TODO consider returning an object consisting of at least id + slug so that original category URL can be reconstructed
//  which could be needed in later stories in which we fetch projects of a given category
const transformProjectCategory = (
  apiProjectCategory: ApiProjectCategory,
): string => apiProjectCategory.slug;

export const fetchCategories = (
  projectId: number,
): Promise<string[]> => {
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

function _debugP<In>(desc: string | undefined = undefined) {
  return async (elemP: In) => {
    const elem = await elemP;
    if (desc) console.debug(desc, elem);
    else console.debug(elem);
    return elem;
  };
}

export const fetchProjects = (
  { locale = "en", limit = 5, offset = 0 }: ProjectParameters,
): Promise<ProjectsResponse> => {
  const page = Math.floor(offset / limit);
  const params =
    "facets=completed:false|closed:false|prohibit_donations:false&" +
    `order=rank:DESC&page=${page}&per_page=${limit}`;
  const url = `${BASE_URL}/${locale}/api_v4/projects.json?${params}`;
  const start = Date.now();
  log.debug(`fetching projects from ${url}`);
  return fetch(url)
    .then((result) => result.json())
    .then(transformProjectResponse)
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
