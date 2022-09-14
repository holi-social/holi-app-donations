import {
  assertSpyCall,
  returnsNext,
  Stub,
  stub,
} from "https://deno.land/std@0.155.0/testing/mock.ts";
import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.155.0/testing/asserts.ts";
import { fetchProjects } from "./betterplace.ts";
import {
  afterEach,
  describe,
  it,
} from "https://deno.land/std@0.155.0/testing/bdd.ts";

const emptyResponse = {
  total_entries: 0,
  offset: 0,
  data: [],
};

// deno-lint-ignore no-explicit-any
const stubFetch = (response: any) => {
  return stub(
    globalThis,
    "fetch",
    returnsNext([Promise.resolve(new Response(JSON.stringify(response)))]),
  );
};

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
    const apiProjectsResult = {
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
        },
        {
          id: 3,
          title: "Project 3",
          donations_count: 0,
          progress_percentage: 0,
          open_amount_in_cents: 4200000,
          profile_picture: {},
          links: [{
            "rel": "categories",
            "href":
              "https://api.betterplace.org/en/api_v4/projects/3/categories.json",
          }],
        },
        {
          id: 4,
          title: "Project 4",
          donations_count: 0,
          progress_percentage: 0,
          open_amount_in_cents: 1200000,
          links: [{
            "rel": "categories",
            "href":
              "https://api.betterplace.org/en/api_v4/projects/4/categories.json",
          }],
        },
      ],
    };

    const educationCategory = {
      id: 3,
      created_at: "2016-12-13T16:18:14+01:00",
      updated_at: "2018-12-03T17:26:13+01:00",
      name: "Education",
      slug: "education",
      links: [[Object]],
    };

    const popularCategory = {
      id: 44,
      created_at: "2018-08-13T17:01:27+02:00",
      updated_at: "2021-07-19T11:40:13+02:00",
      name: "Popular",
      slug: "popular",
      links: [[Object]],
    };

    // deno-lint-ignore no-explicit-any
    const apiProjectsCategoriesResult = (categories: Array<any>) => {
      return {
        total_entries: 2,
        offset: 0,
        total_pages: 1,
        current_page: 1,
        per_page: 20,
        data: categories,
      };
    };

    fetchStub = stub(globalThis, "fetch", (input) => {
      if (
        (input as string).startsWith(
          "https://api.betterplace.org/en/api_v4/projects.json",
        )
      ) {
        return Promise.resolve(new Response(JSON.stringify(apiProjectsResult)));
      } else if (
        (input as string).startsWith(
          "https://api.betterplace.org/en/api_v4/projects/1",
        )
      ) {
        return Promise.resolve(
          new Response(
            JSON.stringify(apiProjectsCategoriesResult([educationCategory])),
          ),
        );
      } else if (
        (input as string).startsWith(
          "https://api.betterplace.org/en/api_v4/projects/2",
        )
      ) {
        return Promise.resolve(
          new Response(
            JSON.stringify(apiProjectsCategoriesResult([popularCategory])),
          ),
        );
      } else if (
        (input as string).startsWith(
          "https://api.betterplace.org/en/api_v4/projects/",
        )
      ) {
        return Promise.resolve(
          new Response(
            JSON.stringify(
              apiProjectsCategoriesResult([educationCategory, popularCategory]),
            ),
          ),
        );
      } else {
        throw Promise.reject(new Error(`Unexpected request URL "${input}"`));
      }
    });

    const result = await fetchProjects({});

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
        },
        {
          id: 2,
          title: "Project 2",
          categories: ["popular"],
          donationsCount: 13,
          progressPercentage: 10,
          openAmountInCents: 1234567,
          picture: [],
        },
        {
          id: 3,
          title: "Project 3",
          categories: ["education", "popular"],
          donationsCount: 0,
          progressPercentage: 0,
          openAmountInCents: 4200000,
          picture: [],
        },
        {
          id: 4,
          title: "Project 4",
          categories: ["education", "popular"],
          donationsCount: 0,
          progressPercentage: 0,
          openAmountInCents: 1200000,
          picture: [],
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
});
