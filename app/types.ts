export type Locale = "de" | "en";

export interface ProjectParameters {
  locale?: Locale;
  pageSize?: number;
}

export type PictureType = "original" | "small";

export interface Picture {
  url: string;
  type: PictureType;
}

export interface Project {
  id: number;
  title: string;
  /** First category in lint */
  category: string;
  donationsCount: number;
  /** Number between 0 and 100 */
  progressPercentage: number;
  openAmountInCents: number;
  /** The project's "profile picture" in different variants */
  picture: Picture[];
}

export interface Pagination {
  totalResults: number;
  offset: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ProjectsResponse extends Pagination {
  projects: Project[];
}
