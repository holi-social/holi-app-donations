export type Locale = "de" | "en";

export interface ProjectsParameters {
  locale?: Locale;
  limit?: number;
  offset?: number;
}

export interface ProjectParameters {
  locale?: Locale;
  id: number;
}

export type ProjectPictureType = "original" | "small";

export type CarrierPictureType = "original" | "tiny_square";

export interface ProjectPicture {
  url: string;
  fallback: boolean;
  type: ProjectPictureType;
}

export interface CarrierPicture {
  url: string;
  fallback: boolean;
  type: CarrierPictureType;
}

export interface Carrier {
  id: number;
  name: string;
  city: string;
  country: string;
  picture: CarrierPicture[];
  url: string | undefined;
}

export interface Project {
  id: number;
  title: string;
  categories: string[];
  carrier: Carrier;
  donationsCount: number;
  /** Number between 0 and 100 */
  progressPercentage: number;
  openAmountInCents: number;
  /** The project's "profile picture" in different variants */
  picture: ProjectPicture[];
}

export interface Pagination {
  totalResults: number;
  offset: number;
}

export interface ProjectsResponse extends Pagination {
  projects: Project[];
}
