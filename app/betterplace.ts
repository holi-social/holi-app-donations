import { log } from "./deps.ts";
import {
  Carrier,
  CarrierPicture,
  CarrierPictureType,
  Project,
  ProjectParameters,
  ProjectPicture,
  ProjectPictureType,
  ProjectsParameters,
  ProjectsResponse,
} from "./types.ts";
import {
  ApiCarrier,
  ApiLink,
  ApiPicture,
  ApiProject,
  ApiProjectCategory,
  ApiProjectsResponse,
} from "./api_types.ts";

const BASE_URL = "https://api.betterplace.org";

const PROJECT_PICTURE_TYPE_MAPPING: {
  [key: string]: ProjectPictureType;
} = {
  original: "original",
  fill_410x214: "small",
};

const CARRIER_PICTURE_TYPE_MAPPING: {
  [key: string]: CarrierPictureType;
} = {
  original: "original",
  fill_100x100: "tiny_square",
};

const transformProjectPicture = (
  picture: ApiPicture | undefined,
): ProjectPicture[] => {
  if (!picture) {
    return [];
  }
  const relTypeRelevant = (link: ApiLink): boolean => {
    return !!link.href &&
      Object.keys(PROJECT_PICTURE_TYPE_MAPPING).includes(link.rel);
  };
  return picture.links
    .filter(relTypeRelevant)
    .map((link: ApiLink) => {
      return {
        url: link.href,
        type: PROJECT_PICTURE_TYPE_MAPPING[link.rel],
        fallback: picture.fallback || false,
      };
    });
};

const transformCarrierPicture = (
  picture: ApiPicture | undefined,
): CarrierPicture[] => {
  if (!picture) {
    return [];
  }
  const relTypeRelevant = (link: ApiLink): boolean => {
    return !!link.href &&
      Object.keys(CARRIER_PICTURE_TYPE_MAPPING).includes(link.rel);
  };
  return picture.links
    .filter(relTypeRelevant)
    .map((link: ApiLink) => {
      return {
        url: link.href,
        type: CARRIER_PICTURE_TYPE_MAPPING[link.rel],
        fallback: picture.fallback || false,
      };
    });
};

const transformCarrier = (
  carrier: ApiCarrier,
): Carrier => {
  return {
    id: carrier.id,
    name: carrier.name,
    city: carrier.city,
    url: carrier.links.find((l) => l.rel === "self")?.href,
    picture: transformCarrierPicture(carrier.picture),
  };
};

const transformProject = (
  project: ApiProject,
): Project => {
  return {
    id: project.id,
    title: project.title,
    categories: [], // will be set by separate resolver
    carrier: transformCarrier(project.carrier),
    donationsCount: project.donations_count,
    progressPercentage: project.progress_percentage,
    openAmountInCents: project.open_amount_in_cents,
    picture: transformProjectPicture(project.profile_picture),
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
  { locale = "en", limit = 5, offset = 0 }: ProjectsParameters,
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

export const fetchProject = (
  { id, locale = "en" }: ProjectParameters,
): Promise<Project> => {
  const url = `${BASE_URL}/${locale}/api_v4/projects/${id}.json`;
  const start = Date.now();
  return fetch(url)
    .then((result) => result.json())
    .then(transformProject)
    .then((result) => {
      const duration = Date.now() - start;
      log.debug(`fetching project with ID ${id} took ${duration} ms`);
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
