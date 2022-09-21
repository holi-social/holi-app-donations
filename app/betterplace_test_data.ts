import {
  ApiCarrier,
  ApiOrganisation,
  ApiProject,
  ApiProjectCategory,
  ApiProjectsResponse,
} from "./api_types.ts";
import { Initiative, Project, ProjectsResponse } from "./types.ts";

const apiProjectCarrier1: ApiCarrier = {
  id: 1,
  name: "Carrier 1",
  city: "Berlin",
  country: "Deutschland",
  picture: {
    links: [
      {
        "rel": "fill_100x100",
        "href":
          "https://betterplace-assets.betterplace.org/uploads/organisation/profile_picture/000/000/045/fill_100x100_original_ARCHE_Logo_rgb_pos.jpg",
      },
      {
        "rel": "original",
        "href":
          "https://betterplace-assets.betterplace.org/uploads/organisation/profile_picture/000/000/045/crop_original_original_ARCHE_Logo_rgb_pos.jpg",
      },
    ],
  },
  links: [
    {
      "rel": "self",
      "href": "https://api.betterplace.org/de/api_v4/organisations/1.json",
    },
  ],
};

const apiProjectCarrier2: ApiCarrier = {
  id: 2,
  name: "Carrier 2",
  city: "Berlin",
  country: "Deutschland",
  picture: {
    links: [
      {
        "rel": "fill_100x100",
        "href":
          "https://betterplace-assets.betterplace.org/uploads/organisation/profile_picture/000/025/417/fill_100x100_sea_watch_logo.png",
      },
      {
        "rel": "original",
        "href":
          "https://betterplace-assets.betterplace.org/uploads/organisation/profile_picture/000/025/417/crop_original_sea_watch_logo.png",
      },
    ],
  },
  links: [
    {
      "rel": "self",
      "href": "https://api.betterplace.org/de/api_v4/organisations/2.json",
    },
  ],
};

export const apiOrganisation1: ApiOrganisation = {
  links: [
    {
      "rel": "platform",
      "href":
        "https://www.betterplace.org/de/organisations/5147-berliner-obdachlosenhilfe-e-v",
    },
  ],
};

export const apiOrganisation2: ApiOrganisation = {
  links: [
    {
      "rel": "platform",
      "href": "https://www.betterplace.org/de/organisations/25435-sea-eye-e-v",
    },
  ],
};

export const apiProject1: ApiProject = {
  id: 1,
  title: "Project 1",
  summary: "Summary Project 1",
  description: "<div>Description Project 1</div>",
  city: "Kiew",
  country: "Ukraine",
  donations_count: 42,
  progress_percentage: 33,
  open_amount_in_cents: 421234,
  profile_picture: {
    links: [
      {
        "rel": "fill_100x100",
        "href": "https://www.example.com/image1_resized2.jpg",
      },
      {
        "rel": "fill_410x214",
        "href": "https://www.example.com/image1_resized1.jpg",
      },
      {
        "rel": "original",
        "href": "https://www.example.com/image1.jpg",
      },
    ],
  },
  links: [{
    "rel": "categories",
    "href": "https://api.betterplace.org/en/api_v4/projects/1/categories.json",
  }],
  carrier: apiProjectCarrier1,
};

const apiProject2: ApiProject = {
  id: 2,
  title: "Project 2",
  summary: "Summary Project 2",
  description: "Description <b>Project 2</b>",
  city: "Kiew",
  country: "Ukraine",
  donations_count: 13,
  progress_percentage: 10,
  open_amount_in_cents: 1234567,
  profile_picture: {
    links: [],
  },
  links: [{
    "rel": "categories",
    "href": "https://api.betterplace.org/en/api_v4/projects/2/categories.json",
  }],
  carrier: apiProjectCarrier1,
};

const apiProject3: ApiProject = {
  id: 3,
  title: "Project 3",
  summary: "Summary Project 3",
  description:
    '<p>Description <a href="#">Project 3</a><br><img src="#" /></p>',
  city: "Kiew",
  country: null,
  donations_count: 0,
  progress_percentage: 0,
  open_amount_in_cents: 4200000,
  profile_picture: {
    links: [],
  },
  links: [{
    "rel": "categories",
    "href": "https://api.betterplace.org/en/api_v4/projects/3/categories.json",
  }],
  carrier: apiProjectCarrier2,
};

const apiProject4: ApiProject = {
  id: 4,
  title: "Project 4",
  summary: null,
  description: null,
  city: null,
  country: "Ukraine",
  donations_count: 0,
  progress_percentage: 0,
  open_amount_in_cents: 1200000,
  profile_picture: {
    links: [],
  },
  links: [{
    "rel": "categories",
    "href": "https://api.betterplace.org/en/api_v4/projects/4/categories.json",
  }],
  carrier: apiProjectCarrier2,
};

export const apiProjectsResult: ApiProjectsResponse = {
  total_entries: 123,
  offset: 20,
  data: [
    apiProject1,
    apiProject2,
    apiProject3,
    apiProject4,
  ],
};

export const categoryEducation: ApiProjectCategory = {
  id: 3,
  created_at: "2016-12-13T16:18:14+01:00",
  updated_at: "2018-12-03T17:26:13+01:00",
  name: "Education",
  slug: "education",
  links: [],
};

export const categoryPopular: ApiProjectCategory = {
  id: 44,
  created_at: "2018-08-13T17:01:27+02:00",
  updated_at: "2021-07-19T11:40:13+02:00",
  name: "Popular",
  slug: "popular",
  links: [],
};

export const categoriesResult = (
  categories: Array<ApiProjectCategory>,
) => {
  return {
    total_entries: categories.length,
    offset: 0,
    total_pages: 1,
    current_page: 1,
    per_page: 20,
    data: categories,
  };
};

const expectedInitiative1: Initiative = {
  city: "Berlin",
  country: "Deutschland",
  id: 1,
  name: "Carrier 1",
  picture: [
    {
      type: "tiny_square",
      url:
        "https://betterplace-assets.betterplace.org/uploads/organisation/profile_picture/000/000/045/fill_100x100_original_ARCHE_Logo_rgb_pos.jpg",
    },
    {
      type: "original",
      url:
        "https://betterplace-assets.betterplace.org/uploads/organisation/profile_picture/000/000/045/crop_original_original_ARCHE_Logo_rgb_pos.jpg",
    },
  ],
  url:
    "https://www.betterplace.org/de/organisations/5147-berliner-obdachlosenhilfe-e-v",
};

const expectedInitiative2: Initiative = {
  city: "Berlin",
  country: "Deutschland",
  id: 2,
  name: "Carrier 2",
  picture: [
    {
      type: "tiny_square",
      url:
        "https://betterplace-assets.betterplace.org/uploads/organisation/profile_picture/000/025/417/fill_100x100_sea_watch_logo.png",
    },
    {
      type: "original",
      url:
        "https://betterplace-assets.betterplace.org/uploads/organisation/profile_picture/000/025/417/crop_original_sea_watch_logo.png",
    },
  ],
  url: "https://www.betterplace.org/de/organisations/25435-sea-eye-e-v",
};

export const expectedResultList: ProjectsResponse = {
  totalResults: 123,
  offset: 20,
  projects: [
    {
      id: 1,
      title: "Project 1",
      summary: "Summary Project 1",
      description: "<div>Description Project 1</div>",
      city: "Kiew",
      country: "Ukraine",
      categories: ["education"],
      donationsCount: 42,
      progressPercentage: 33,
      openAmountInCents: 421234,
      picture: [
        {
          "type": "small",
          "url": "https://www.example.com/image1_resized1.jpg",
        },
        {
          "type": "original",
          "url": "https://www.example.com/image1.jpg",
        },
      ],
      initiative: expectedInitiative1,
    },
    {
      id: 2,
      title: "Project 2",
      summary: "Summary Project 2",
      description: "Description <b>Project 2</b>",
      city: "Kiew",
      country: "Ukraine",
      categories: ["popular"],
      donationsCount: 13,
      progressPercentage: 10,
      openAmountInCents: 1234567,
      picture: [],
      initiative: expectedInitiative1,
    },
    {
      id: 3,
      title: "Project 3",
      summary: "Summary Project 3",
      description:
        '<p>Description <a href="#">Project 3</a><br><img src="#" /></p>',
      city: "Kiew",
      country: null,
      categories: ["education", "popular"],
      donationsCount: 0,
      progressPercentage: 0,
      openAmountInCents: 4200000,
      picture: [],
      initiative: expectedInitiative2,
    },
    {
      id: 4,
      title: "Project 4",
      summary: null,
      description: null,
      city: null,
      country: "Ukraine",
      categories: ["education", "popular"],
      donationsCount: 0,
      progressPercentage: 0,
      openAmountInCents: 1200000,
      picture: [],
      initiative: expectedInitiative2,
    },
  ],
};

export const expectedResult: Project = {
  id: 1,
  title: "Project 1",
  summary: "Summary Project 1",
  description: "<div>Description Project 1</div>",
  city: "Kiew",
  country: "Ukraine",
  categories: ["education"],
  donationsCount: 42,
  progressPercentage: 33,
  openAmountInCents: 421234,
  picture: [
    {
      "type": "small",
      "url": "https://www.example.com/image1_resized1.jpg",
    },
    {
      "type": "original",
      "url": "https://www.example.com/image1.jpg",
    },
  ],
  initiative: expectedInitiative1,
};
