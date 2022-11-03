import {
  ApiBlogPost,
  ApiBlogPostResponse,
  ApiCarrier,
  ApiOrganisation,
  ApiProject,
  ApiProjectCategory,
  ApiProjectsResponse,
} from "./api_types.ts";
import { Initiative, News, Project, ProjectsResponse } from "./types.ts";

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
  blog_post_count: 2,
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
  links: [
    {
      "rel": "categories",
      "href":
        "https://api.betterplace.org/en/api_v4/projects/1/categories.json",
    },
    {
      "rel": "new_donation",
      "href": "https://www.betterplace.org/de/donate/platform/projects/1",
    },
    {
      "rel": "blog_posts",
      "href": "https://api.betterplace.org/de/api_v4/blog_posts/1.json",
    },
  ],
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
  blog_post_count: 1,
  profile_picture: {
    links: [],
  },
  links: [{
    "rel": "categories",
    "href": "https://api.betterplace.org/en/api_v4/projects/2/categories.json",
  }, {
    "rel": "new_donation",
    "href": "https://www.betterplace.org/de/donate/platform/projects/2",
  }, {
    "rel": "blog_posts",
    "href": "https://api.betterplace.org/de/api_v4/blog_posts/2.json",
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
  blog_post_count: 0,
  profile_picture: {
    links: [],
  },
  links: [{
    "rel": "categories",
    "href": "https://api.betterplace.org/en/api_v4/projects/3/categories.json",
  }, {
    "rel": "new_donation",
    "href": "https://www.betterplace.org/de/donate/platform/projects/3",
  }, {
    "rel": "blog_posts",
    "href": "https://api.betterplace.org/de/api_v4/blog_posts/3.json",
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
  blog_post_count: 0,
  profile_picture: {
    links: [],
  },
  links: [{
    "rel": "categories",
    "href": "https://api.betterplace.org/en/api_v4/projects/4/categories.json",
  }, {
    "rel": "new_donation",
    "href": "https://www.betterplace.org/de/donate/platform/projects/4",
  }, {
    "rel": "blog_posts",
    "href": "https://api.betterplace.org/de/api_v4/blog_posts/4.json",
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

const blogPost1: ApiBlogPost = {
  id: 1,
  "title": "Mirwais",
  "published_at": "2009-03-11T20:46:27+01:00",
  "body": "<p>Lorem ipsum</p>",
  "author": {
    "name": "Miray Heinrich",
    "picture": {
      "links": [
        {
          "rel": "fill_100x100",
          "href":
            "https://betterplace-assets.betterplace.org/uploads/user/profile_picture/000/009/238/fill_100x100_bp1584570257_original_maxn_skate.jpg",
        },
        {
          "rel": "original",
          "href":
            "https://betterplace-assets.betterplace.org/uploads/user/profile_picture/000/009/238/crop_original_bp1584570257_original_maxn_skate.jpg",
        },
      ],
    },
  },
  "links": [
    {
      "rel": "platform",
      "href":
        "https://www.betterplace.org/de/projects/1114-unterstuetze-skateistan-sport-bildung-fuer-kinder/news/3917#ppp-sticky-anchor",
    },
  ],
};

const blogPost2: ApiBlogPost = {
  id: 1,
  "title": "Blog post 2",
  "published_at": "2009-03-11T20:46:27+01:00",
  "body": '<p>Lorem ipsum</p><img src="www.example.com/test.jpg"',
  "links": [
    {
      "rel": "platform",
      "href":
        "https://www.betterplace.org/de/projects/1114-unterstuetze-skateistan-sport-bildung-fuer-kinder/news/3917#ppp-sticky-anchor",
    },
  ],
};

export const apiBlogPosts1: ApiBlogPostResponse = {
  total_entries: 2,
  data: [blogPost1, blogPost2],
};

export const apiBlogPosts2: ApiBlogPostResponse = {
  total_entries: 1,
  data: [blogPost1],
};

export const apiBlogPostsEmpty: ApiBlogPostResponse = {
  total_entries: 0,
  data: [],
};

const expectedNews1: News = {
  author: {
    name: "Miray Heinrich",
    picture: [
      {
        height: 100,
        type: "fill",
        url:
          "https://betterplace-assets.betterplace.org/uploads/user/profile_picture/000/009/238/fill_100x100_bp1584570257_original_maxn_skate.jpg",
        width: 100,
      },
      {
        height: null,
        type: "original",
        url:
          "https://betterplace-assets.betterplace.org/uploads/user/profile_picture/000/009/238/crop_original_bp1584570257_original_maxn_skate.jpg",
        width: null,
      },
    ],
  },
  body: "Lorem ipsum",
  id: 1,
  publishDate: "2009-03-11T20:46:27+01:00",
  title: "Mirwais",
  url:
    "https://www.betterplace.org/de/projects/1114-unterstuetze-skateistan-sport-bildung-fuer-kinder/news/3917#ppp-sticky-anchor",
};

const expectedNews2: News = {
  author: null,
  body: "Lorem ipsum",
  id: 1,
  publishDate: "2009-03-11T20:46:27+01:00",
  title: "Blog post 2",
  url:
    "https://www.betterplace.org/de/projects/1114-unterstuetze-skateistan-sport-bildung-fuer-kinder/news/3917#ppp-sticky-anchor",
};

const expectedInitiative1: Initiative = {
  city: "Berlin",
  country: "Deutschland",
  id: 1,
  name: "Carrier 1",
  picture: [
    {
      type: "fill",
      width: 100,
      height: 100,
      url:
        "https://betterplace-assets.betterplace.org/uploads/organisation/profile_picture/000/000/045/fill_100x100_original_ARCHE_Logo_rgb_pos.jpg",
    },
    {
      type: "original",
      url:
        "https://betterplace-assets.betterplace.org/uploads/organisation/profile_picture/000/000/045/crop_original_original_ARCHE_Logo_rgb_pos.jpg",
      width: null,
      height: null,
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
      type: "fill",
      width: 100,
      height: 100,
      url:
        "https://betterplace-assets.betterplace.org/uploads/organisation/profile_picture/000/025/417/fill_100x100_sea_watch_logo.png",
    },
    {
      type: "original",
      url:
        "https://betterplace-assets.betterplace.org/uploads/organisation/profile_picture/000/025/417/crop_original_sea_watch_logo.png",
      width: null,
      height: null,
    },
  ],
  url: "https://www.betterplace.org/de/organisations/25435-sea-eye-e-v",
};

const expectedProjects: Project[] = [
  {
    id: 1,
    title: "Project 1",
    summary: "Summary Project 1",
    description: "Description Project 1",
    city: "Kiew",
    country: "Ukraine",
    categories: ["education"],
    donationsCount: 42,
    progressPercentage: 33,
    openAmountInCents: 421234,
    picture: [
      {
        type: "fill",
        url: "https://www.example.com/image1_resized2.jpg",
        width: 100,
        height: 100,
      },
      {
        type: "fill",
        width: 410,
        height: 214,
        url: "https://www.example.com/image1_resized1.jpg",
      },
      {
        type: "original",
        url: "https://www.example.com/image1.jpg",
        width: null,
        height: null,
      },
    ],
    initiative: expectedInitiative1,
    donationUrl: "https://www.betterplace.org/de/donate/platform/projects/1",
    newsUrl: "https://api.betterplace.org/de/api_v4/blog_posts/1.json",
    news: [expectedNews1, expectedNews2],
    newsCount: 2,
  },
  {
    id: 2,
    title: "Project 2",
    summary: "Summary Project 2",
    description: "Description Project 2",
    city: "Kiew",
    country: "Ukraine",
    categories: ["popular"],
    donationsCount: 13,
    progressPercentage: 10,
    openAmountInCents: 1234567,
    picture: [],
    initiative: expectedInitiative1,
    donationUrl: "https://www.betterplace.org/de/donate/platform/projects/2",
    newsUrl: "https://api.betterplace.org/de/api_v4/blog_posts/2.json",
    news: [expectedNews1],
    newsCount: 1,
  },
  {
    id: 3,
    title: "Project 3",
    summary: "Summary Project 3",
    description: "Description Project 3\n",
    city: "Kiew",
    country: null,
    categories: ["education", "popular"],
    donationsCount: 0,
    progressPercentage: 0,
    openAmountInCents: 4200000,
    picture: [],
    initiative: expectedInitiative2,
    donationUrl: "https://www.betterplace.org/de/donate/platform/projects/3",
    newsUrl: "https://api.betterplace.org/de/api_v4/blog_posts/3.json",
    news: [],
    newsCount: 0,
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
    donationUrl: "https://www.betterplace.org/de/donate/platform/projects/4",
    newsUrl: "https://api.betterplace.org/de/api_v4/blog_posts/4.json",
    news: [],
    newsCount: 0,
  },
];

export const expectedProjectsResponse: ProjectsResponse = {
  totalResults: 123,
  projects: expectedProjects,
};

export const expectedResult: Project = {
  id: 1,
  title: "Project 1",
  summary: "Summary Project 1",
  description: "Description Project 1",
  city: "Kiew",
  country: "Ukraine",
  categories: ["education"],
  donationsCount: 42,
  progressPercentage: 33,
  openAmountInCents: 421234,
  picture: [
    {
      type: "fill",
      url: "https://www.example.com/image1_resized2.jpg",
      width: 100,
      height: 100,
    },
    {
      type: "fill",
      width: 410,
      height: 214,
      url: "https://www.example.com/image1_resized1.jpg",
    },
    {
      type: "original",
      url: "https://www.example.com/image1.jpg",
      width: null,
      height: null,
    },
  ],
  initiative: expectedInitiative1,
  donationUrl: "https://www.betterplace.org/de/donate/platform/projects/1",
  newsUrl: "https://api.betterplace.org/de/api_v4/blog_posts/1.json",
  news: [expectedNews1, expectedNews2],
  newsCount: 2,
};
