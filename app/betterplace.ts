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

type ApiProjectId = number

type ApiLink = {
  href: string
  rel: string
}

type ApiProfilePicture = {
  links: Array<ApiLink>
}

/** only covers the parts of the API response type that were using */
type ApiProject = {
  id: ApiProjectId
  title: string
  links: Array<ApiLink>
  donations_count: number
  progress_percentage: number
  open_amount_in_cents: number
  profile_picture: ApiProfilePicture | undefined
}

type ApiProjectCategorySlug = string

type ApiProjectCategory = {
  created_at: string // ISO datetime
  id: number
  links: Array<ApiLink>
  name: string
  slug: ApiProjectCategorySlug
  updated_at: string // ISO datetime
}

type ApiProjectCategoriesMap = Map<ApiProjectId, ApiProjectCategory[]>

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

const transformProject = (project: ApiProject, allProjectsCategoriesById: ApiProjectCategoriesMap): Project => {
  return {
    id: project.id,
    title: project.title,
    categories: allProjectsCategoriesById.get(project.id)?.map(transformProjectCategory) || [],
    donationsCount: project.donations_count,
    progressPercentage: project.progress_percentage,
    openAmountInCents: project.open_amount_in_cents,
    picture: transformPicture(project.profile_picture),
  };
};

const parallelFetchProjectsCategories = (apiProjects: Array<ApiProject>): Promise<ApiProjectCategoriesMap> => {
  return Promise
    .all(apiProjects.map(apiProject => {
      return fetchCategories(apiProject)
        .then(categories => {
          return {id: apiProject.id, categories: categories}
        })
    }))
    .then(allProjectsCategoriesArray => new Map(allProjectsCategoriesArray.map(key => [key.id, key.categories])))
}

// deno-lint-ignore no-explicit-any
const transformProjectResponse = async (response: any): Promise<ProjectsResponse> => {
  const apiProjects = response.data as Array<ApiProject>
  const allProjectsCategoriesById: ApiProjectCategoriesMap = await parallelFetchProjectsCategories(apiProjects)
  return {
    totalResults: response.total_entries,
    offset: response.offset,
    projects: apiProjects.map(apiProject => transformProject(apiProject, allProjectsCategoriesById))
  };
};

// TODO consider returning an object consisting of at least id + slug so that original category URL can be reconstructed
//  which could be needed in later stories in which we fetch projects of a given category
const transformProjectCategory = (apiProjectCategory: ApiProjectCategory): ApiProjectCategorySlug => {
  return apiProjectCategory.slug
}

const fetchCategories = (project: ApiProject): Promise<ApiProjectCategory[]> => {
  const href = project.links.find((link) => link.rel === 'categories')?.href
  if (!href) {
    return Promise.resolve([])
  } else {
    log.debug(`  fetching project categories from ${href}`);
    return fetch(href)
      .then(result => result.json())
      .then((json) => (json.data as Array<ApiProjectCategory>))
      .catch(e => {
        console.error(`Error while fetching project categories from '${href}', using empty array to handle this (somewhat) gracefully`, e)
        return []
      })
  }
}

export const fetchProjects = (
  {locale = "en", limit = 5, offset = 0}: ProjectParameters,
): Promise<ProjectsResponse> => {
  const page = Math.floor(offset / limit);
  const params =
    "facets=completed:false|closed:false|prohibit_donations:false&" +
    `order=rank:DESC&page=${page}&per_page=${limit}`;
  const url = `${BASE_URL}/${locale}/api_v4/projects.json?${params}`;
  const start = Date.now()
  log.debug(`fetching projects from ${url}`);
  return fetch(url)
    .then(result => result.json())
    .then(transformProjectResponse)
    .then(result => {
      log.debug(`  fetching projects (including categories) took ${Date.now() - start} ms`)
      return result
    })
    .catch(e => {
      log.error(`Error performing request to ${url} after ${Date.now() - start} ms: ${e.message}`);
      throw e;
    })
};
