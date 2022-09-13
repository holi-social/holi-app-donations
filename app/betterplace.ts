import {log} from "./deps.ts";
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

type ApiLink = {
  href: string
  rel: string
}

type ApiProfilePicture = {
  links: Array<ApiLink>
}

/** only covers the parts of the API response type that were using */
type ApiProject = {
  id: number
  title: string
  links: Array<ApiLink>
  donations_count: number
  progress_percentage: number
  open_amount_in_cents: number
  profile_picture: ApiProfilePicture | undefined
}

type ApiProjectCategory = {
  created_at: string // ISO datetime
  id: number
  links: Array<ApiLink>
  name: string
  slug: string
  updated_at: string // ISO datetime
}

const transformPicture = (picture: ApiProfilePicture | undefined): Picture[] => {
  return (picture?.links || []).filter((link) =>
    link.href && Object.keys(PICTURE_TYPE_MAPPING).includes(link.rel)
  ).map((link: { href: string; rel: string }) => {
    return {
      url: link.href,
      type: PICTURE_TYPE_MAPPING[link.rel],
    };
  });
};

const transformProject = async (project: ApiProject): Promise<Project> => {
  const categories = await fetchCategories(project)
  return {
    id: project.id,
    title: project.title,
    categories: categories,
    donationsCount: project.donations_count,
    progressPercentage: project.progress_percentage,
    openAmountInCents: project.open_amount_in_cents,
    picture: transformPicture(project.profile_picture),
  };
};

// deno-lint-ignore no-explicit-any
const transformProjectResponse = (response: any): ProjectsResponse => {
  return {
    totalResults: response.total_entries,
    offset: response.offset,
    projects: response.data.map(transformProject),
  };
};

// TODO consider returning an object consisting of at least id + slug so that original category URL can be reconstructed
//  which could be needed in later stories in which we fetch projects of a given category
const transformProjectCategory = (apiCategory: ApiProjectCategory): string => apiCategory.slug

const fetchCategories = async (project: ApiProject): Promise<string[]> => {
  const href = project.links.find((link) => link.rel === 'categories')?.href
  if (!href) {
    return Promise.resolve([])
  } else {
    log.debug(`  fetching project categories from ${href}`);
    return fetch(href)
      .then(result => result.json())
      .then((json: any) => (json.data as Array<ApiProjectCategory>).map(transformProjectCategory))
      .catch(e => {
        console.error(`Error while fetching project categories from '${href}', using empty array to handle this (somewhat) gracefully`, e)
        return []
      })
  }
}

export const fetchProjects = async (
  {locale = "en", limit = 5, offset = 0}: ProjectParameters,
): Promise<ProjectsResponse> => {
  const page = Math.floor(offset / limit);
  const params =
    "facets=completed:false|closed:false|prohibit_donations:false&" +
    `order=rank:DESC&page=${page}&per_page=${limit}`;
  const url = `${BASE_URL}/${locale}/api_v4/projects.json?${params}`;
  log.debug(`fetching projects from ${url}`);
  try {
    const result = await fetch(url);
    const parsedResult = await result.json();
    return transformProjectResponse(parsedResult);
  } catch (e) {
    log.error(`Error performing request to ${url}: ${e.message}`);
    throw e;
  }
};
