export type ApiProjectId = number;

export type ApiLink = {
  href: string;
  rel: string;
};

export type ApiPicture = {
  links: Array<ApiLink>;
};

export type ApiCarrier = {
  id: number;
  name: string;
  city: string | undefined | null;
  country: string | undefined | null;
  links: Array<ApiLink>;
  picture: ApiPicture;
};

/** only covers the parts of the API response type that we're using */
export type ApiProject = {
  id: ApiProjectId | string;
  title: string;
  city: string | undefined | null;
  country: string | undefined | null;
  links: Array<ApiLink>;
  carrier: ApiCarrier;
  donations_count: number | string;
  progress_percentage: number | string;
  open_amount_in_cents: number | string;
  profile_picture: ApiPicture | undefined;
  summary: string | undefined | null;
  description: string | undefined | null;
  blog_post_count: number | string;
};

/** only covers the parts of the API response type that we're using */
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

type ApiAuthor = {
  name: string;
  picture: ApiPicture;
};

export type ApiBlogPost = {
  id: number;
  title: string;
  published_at: string;
  author?: ApiAuthor;
  body: string;
  links: Array<ApiLink>;
};

export type ApiBlogPostResponse = {
  total_entries: number;
  data: ApiBlogPost[];
};

export type ApiOrganisation = {
  links: Array<ApiLink>;
};
