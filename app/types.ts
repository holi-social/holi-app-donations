export interface ProjectParameters {
  locale: "de" | "en";
  pageSize: number;
}

export interface Picture {
  url: string;
  type: "original" | "small"; /*fill_410x214*/
}

export interface Project {
  id: number;
  title: string;
  category: string; // first in list
  donationsCount: number;
  progressPercentage: number; // 0 - 100
  openAmountInCents: number;
  picture: Picture[]; // original + fill_410x214
}
