import {
  assertSpyCall,
  returnsNext,
  Stub,
  stub,
} from "https://deno.land/std@0.155.0/testing/mock.ts";
import {
  assertEquals,
  assertExists,
  assertRejects,
} from "https://deno.land/std@0.155.0/testing/asserts.ts";
import { fetchProjects } from "./betterplace.ts";
import {
  afterEach,
  describe,
  it,
} from "https://deno.land/std@0.155.0/testing/bdd.ts";
import { middleware } from "./server.ts";
import { resolveResponse } from "./dev_deps.ts";
import setupLogging from "./logging.ts";
import {
  ApiCarrier,
  ApiProjectCategory,
  ApiProjectsResponse,
} from "./api_types.ts";

const emptyResponse = {
  total_entries: 0,
  offset: 0,
  data: [],
};

type UrlPrefix = string;
type ResponsePayload = Record<string, unknown> | Error;

const stubFetch = (response: ResponsePayload) => {
  return stub(
    globalThis,
    "fetch",
    returnsNext([Promise.resolve(new Response(JSON.stringify(response)))]),
  );
};

const stubFetchByUrlPrefix = (
  responses: Record<UrlPrefix, ResponsePayload>,
) => {
  return stub(globalThis, "fetch", (input) => {
    for (const [urlPrefix, response] of Object.entries(responses)) {
      if ((input as string).startsWith(urlPrefix)) {
        if (response instanceof Error) return Promise.reject(response);
        else return Promise.resolve(new Response(JSON.stringify(response)));
      }
    }
    throw Promise.reject(new Error(`Unexpected request URL "${input}"`));
  });
};

const apiProjectCarrier1: ApiCarrier = {
  id: 45,
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
      "href": "https://api.betterplace.org/de/api_v4/organisations/45.json",
    },
  ],
};

const apiProjectCarrier2: ApiCarrier = {
  id: 25417,
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
      "href": "https://api.betterplace.org/de/api_v4/organisations/25417.json",
    },
  ],
};

const apiProjectsResult: ApiProjectsResponse = {
  total_entries: 123,
  offset: 20,
  data: [
    {
      id: 1,
      title: "Project 1",
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
        "href":
          "https://api.betterplace.org/en/api_v4/projects/1/categories.json",
      }],
      carrier: apiProjectCarrier1,
    },
    {
      id: 2,
      title: "Project 2",
      donations_count: 13,
      progress_percentage: 10,
      open_amount_in_cents: 1234567,
      profile_picture: {
        links: [],
      },
      links: [{
        "rel": "categories",
        "href":
          "https://api.betterplace.org/en/api_v4/projects/2/categories.json",
      }],
      carrier: apiProjectCarrier1,
    },
    {
      id: 3,
      title: "Project 3",
      donations_count: 0,
      progress_percentage: 0,
      open_amount_in_cents: 4200000,
      profile_picture: {
        links: [],
      },
      links: [{
        "rel": "categories",
        "href":
          "https://api.betterplace.org/en/api_v4/projects/3/categories.json",
      }],
      carrier: apiProjectCarrier2,
    },
    {
      id: 4,
      title: "Project 4",
      donations_count: 0,
      progress_percentage: 0,
      open_amount_in_cents: 1200000,
      profile_picture: {
        links: [],
      },
      links: [{
        "rel": "categories",
        "href":
          "https://api.betterplace.org/en/api_v4/projects/4/categories.json",
      }],
      carrier: apiProjectCarrier2,
    },
  ],
};

const categoryEducation: ApiProjectCategory = {
  id: 3,
  created_at: "2016-12-13T16:18:14+01:00",
  updated_at: "2018-12-03T17:26:13+01:00",
  name: "Education",
  slug: "education",
  links: [],
};

const categoryPopular: ApiProjectCategory = {
  id: 44,
  created_at: "2018-08-13T17:01:27+02:00",
  updated_at: "2021-07-19T11:40:13+02:00",
  name: "Popular",
  slug: "popular",
  links: [],
};

const categoriesResult = (
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

const processGqlRequest = (
  query: string,
  variables: Record<string, unknown> = {},
): Promise<Record<string, unknown> | undefined | null> => {
  const request = new Request("http://localhost:8001/graphql", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "*/*",
    },
    body: JSON.stringify({
      operationName: null,
      variables: variables,
      query: query,
    }),
  });
  return middleware(request)
    .then(resolveResponse)
    .then((response) => response.data);
};

setupLogging("development");

describe("betterplace", () => {
  let fetchStub: Stub;

  afterEach(() => {
    fetchStub?.restore();
  });

  it("calls api with correct parameters", async () => {
    fetchStub = stubFetch(emptyResponse);

    await fetchProjects({ locale: "de", limit: 10, offset: 20 });

    const expectedUrl = "https://api.betterplace.org/de/api_v4/projects.json?" +
      "facets=completed:false|closed:false|prohibit_donations:false&order=rank:DESC&page=2&per_page=10";
    assertSpyCall(fetchStub, 0, { args: [expectedUrl] });
  });

  it("uses default parameters for api call if missing", async () => {
    fetchStub = stubFetch(emptyResponse);

    await fetchProjects({});

    const expectedUrl = "https://api.betterplace.org/en/api_v4/projects.json?" +
      "facets=completed:false|closed:false|prohibit_donations:false&order=rank:DESC&page=0&per_page=5";
    assertSpyCall(fetchStub, 0, { args: [expectedUrl] });
  });

  it("correctly parses empty response", async () => {
    fetchStub = stubFetch(emptyResponse);

    const result = await fetchProjects({});

    const expectedResult = {
      totalResults: 0,
      offset: 0,
      projects: [],
    };
    assertEquals(result, expectedResult);
  });

  it("correctly parses project list", async () => {
    fetchStub = stubFetchByUrlPrefix({
      "https://api.betterplace.org/en/api_v4/projects.json": apiProjectsResult,
      "https://api.betterplace.org/en/api_v4/projects/1": categoriesResult([
        categoryEducation,
      ]),
      "https://api.betterplace.org/en/api_v4/projects/2": categoriesResult([
        categoryPopular,
      ]),
      "https://api.betterplace.org/en/api_v4/projects/": categoriesResult([
        categoryEducation,
        categoryPopular,
      ]),
    });

    const promise = processGqlRequest(`
    {
        projects {
            totalResults
            offset
            projects {
                id
                title
                categories
                donationsCount
                progressPercentage
                openAmountInCents
                picture {
                    type
                    url
                }
                carrier {
                  id
                  name
                  city
                  picture {
                    url
                    type
                  }
                  url
                }
            }
        }
    }`);

    const result = (await promise)?.projects;

    const expectedCarrier1 = {
      city: "Berlin",
      id: 45,
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
      url: "https://api.betterplace.org/de/api_v4/organisations/45.json",
    };

    const expectedCarrier2 = {
      city: "Berlin",
      id: 25417,
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
      url: "https://api.betterplace.org/de/api_v4/organisations/25417.json",
    };

    const expectedResult = {
      totalResults: 123,
      offset: 20,
      projects: [
        {
          id: 1,
          title: "Project 1",
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
          carrier: expectedCarrier1,
        },
        {
          id: 2,
          title: "Project 2",
          categories: ["popular"],
          donationsCount: 13,
          progressPercentage: 10,
          openAmountInCents: 1234567,
          picture: [],
          carrier: expectedCarrier1,
        },
        {
          id: 3,
          title: "Project 3",
          categories: ["education", "popular"],
          donationsCount: 0,
          progressPercentage: 0,
          openAmountInCents: 4200000,
          picture: [],
          carrier: expectedCarrier2,
        },
        {
          id: 4,
          title: "Project 4",
          categories: ["education", "popular"],
          donationsCount: 0,
          progressPercentage: 0,
          openAmountInCents: 1200000,
          picture: [],
          carrier: expectedCarrier2,
        },
      ],
    };
    assertEquals(result, expectedResult);
  });

  it("throws error for invalid response", async () => {
    fetchStub = stub(
      globalThis,
      "fetch",
      returnsNext([Promise.resolve(new Response("foobar"))]),
    );

    await assertRejects(() => fetchProjects({}));
  });

  it("returns empty categories for invalid category responses", async () => {
    fetchStub = stubFetchByUrlPrefix({
      "https://api.betterplace.org/en/api_v4/projects.json": apiProjectsResult,
      "https://api.betterplace.org/en/api_v4/projects/1": new Error(
        "Expected error",
      ),
      "https://api.betterplace.org/en/api_v4/projects/": categoriesResult([
        categoryEducation,
        categoryPopular,
      ]),
    });

    const result = await fetchProjects({});

    const project1 = result.projects.find((p) => p.id === 1);
    assertExists(project1);
    assertEquals(project1.categories, []);
  });
});
