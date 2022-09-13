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
    fetchStub = stubFetch({
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
        },
        {
          id: 3,
          title: "Project 3",
          donations_count: 0,
          progress_percentage: 0,
          open_amount_in_cents: 4200000,
          profile_picture: {},
        },
        {
          id: 4,
          title: "Project 4",
          donations_count: 0,
          progress_percentage: 0,
          open_amount_in_cents: 1200000,
        },
      ],
    });

    const result = await fetchProjects({});

    const expectedResult = {
      totalResults: 123,
      offset: 20,
      projects: [
        {
          id: 1,
          title: "Project 1",
          category: "DUMMY_CATEGORY",
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
          category: "DUMMY_CATEGORY",
          donationsCount: 13,
          progressPercentage: 10,
          openAmountInCents: 1234567,
          picture: [],
        },
        {
          id: 3,
          title: "Project 3",
          category: "DUMMY_CATEGORY",
          donationsCount: 0,
          progressPercentage: 0,
          openAmountInCents: 4200000,
          picture: [],
        },
        {
          id: 4,
          title: "Project 4",
          category: "DUMMY_CATEGORY",
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
