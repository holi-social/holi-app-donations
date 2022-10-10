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

export type InitiativePictureType = "original" | "tiny_square";

export interface ProjectPicture {
  url: string;
  type: ProjectPictureType;
}

export interface InitiativePicture {
  url: string;
  type: InitiativePictureType;
}

export interface Initiative {
  id: number;
  name: string;
  city: string | undefined | null;
  country: string | undefined | null;
  picture: InitiativePicture[];
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
  picture: ProjectPicture[];
  summary: string | undefined | null;
  description: string | undefined | null;
  donationUrl: string;
}
