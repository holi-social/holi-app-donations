export type ApiProjectId = number;

export type ApiLink = {
  href: string;
  rel: string;
};

export type ApiPicture = {
  fallback?: boolean;
  links: Array<ApiLink>;
};

export type ApiCarrier = {
  id: number;
  name: string;
  city: string;
  country: string;
  links: Array<ApiLink>;
  picture: ApiPicture;
};

/** only covers the parts of the API response type that were using */
export type ApiProject = {
  id: ApiProjectId;
  title: string;
  city: string | undefined | null;
  country: string | undefined | null;
  links: Array<ApiLink>;
  carrier: ApiCarrier;
  donations_count: number;
  progress_percentage: number;
  open_amount_in_cents: number;
  profile_picture: ApiPicture | undefined;
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
