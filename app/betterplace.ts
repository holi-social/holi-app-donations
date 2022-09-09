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

// deno-lint-ignore no-explicit-any
const transformPicture = (picture: any): Picture[] => {
  // deno-lint-ignore no-explicit-any
  return picture.links.filter((link: any) =>
    link.href && Object.keys(PICTURE_TYPE_MAPPING).includes(link.rel)
  ).map((link: { href: string; rel: string }) => {
    return {
      url: link.href,
      type: PICTURE_TYPE_MAPPING[link.rel],
    };
  });
};

// deno-lint-ignore no-explicit-any
const transformProject = (project: any): Project => {
  return {
    id: project.id,
    title: project.title,
    category: "DUMMY_CATEGORY", // TODO: has to be resolved in 2nd api request
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
    totalPages: response.total_pages,
    currentPage: response.current_page,
    pageSize: response.per_page,
    projects: response.data.map(transformProject),
  };
};

export const fetchProjects = async (
  { locale = "en", pageSize = 5 }: ProjectParameters,
): Promise<ProjectsResponse> => {
  const params =
    `facets=completed:false|closed:false|prohibit_donations:false&order=rank:DESC&per_page=${pageSize}`;
  const url = `${BASE_URL}/${locale}/api_v4/projects.json?${params}`;
  console.debug(`performing request to ${url}`);
  const result = await fetch(url);
  const parsedResult = await result.json();
  return transformProjectResponse(parsedResult);
};
