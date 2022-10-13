export type Locale = "de" | "en";

export interface ProjectsParameters {
  locale?: Locale;
  limit?: number;
  offset?: number;
  location?: string;
}

export interface ProjectParameters {
  locale?: Locale;
  id: number;
}

export interface Picture {
  url: string;
  type: string;
  width?: number | null;
  height?: number | null;
}

export interface Initiative {
  id: number;
  name: string;
  city: string | undefined | null;
  country: string | undefined | null;
  picture: Picture[];
  url?: string;
}

export interface Project {
  id: number;
  title: string;
  categories: string[];
  city: string | undefined | null;
  country: string | undefined | null;
  initiative: Initiative;
  donationsCount: number;
  /** Number between 0 and 100 */
  progressPercentage: number;
  openAmountInCents: number;
  /** The project's "profile picture" in different variants */
  picture: Picture[];
  summary: string | undefined | null;
  description: string | undefined | null;
  donationUrl: string;
}

export interface ProjectsResponse {
  totalResults: number;
  projects: Project[];
}
