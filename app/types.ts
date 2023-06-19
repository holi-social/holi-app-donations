export interface ProjectsParameters {
  limit?: number;
  offset?: number;
  location?: string;
}

export interface ProjectParameters {
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

export interface Author {
  name: string;
  picture: Picture[];
}

export interface News {
  id: number;
  title: string;
  publishDate: string;
  author?: Author | null;
  body: string;
  url: string;
}

export interface NewsParameters {
  limit?: number;
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
  newsUrl: string;
  news: News[];
  newsCount: number;
}

export interface ProjectsResponse {
  totalResults: number;
  data: Project[];
}

export type BetterPlaceLanguage = "de" | "en";
