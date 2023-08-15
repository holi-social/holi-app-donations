import {
  afterEach,
  assertEquals,
  assertExists,
  assertRejects,
  assertSpyCall,
  beforeEach,
  describe,
  FakeTime,
  it,
  returnsNext,
  Stub,
  stub,
} from "./dev_deps.ts";
import {
  processGqlRequest,
  ResponsePayload,
  stubFetch,
} from "./common_test.ts";
import { fetchProject, fetchProjects } from "./betterplace.ts";
import {
  apiBlogPosts1,
  apiBlogPosts2,
  apiBlogPostsEmpty,
  apiOrganisation1,
  apiOrganisation2,
  apiProject1,
  apiProjectsResult,
  categoriesResult,
  categoryEducation,
  categoryPopular,
  expectedProjectsResponse,
  expectedResult,
} from "./betterplace_test_data.ts";
import { Project, ProjectsResponse } from "./types.ts";
import { createGraphQLServer, GraphQLServer } from "./server.ts";

const emptyResponse = {
  total_entries: 0,
  offset: 0,
  data: [],
};

type UrlPrefix = string;

const stubFetchByUrlPrefix = (
  responses: Record<UrlPrefix, ResponsePayload>,
) => {
  return stub(globalThis, "fetch", (input) => {
    const url = input.toString();
    for (const [urlPrefix, response] of Object.entries(responses)) {
      if (url.startsWith(urlPrefix)) {
        if (response instanceof Error) {
          return Promise.reject(response);
        } else {
          return Promise.resolve(new Response(JSON.stringify(response)));
        }
      }
    }
    throw Promise.reject(new Error(`Unexpected request URL "${url}"`));
  });
};

const validApiResponses = {
  "https://api.betterplace.org/en/api_v4/projects.json": apiProjectsResult,
  "https://api.betterplace.org/en/api_v4/projects/1.json": apiProject1,
  "https://api.betterplace.org/de/api_v4/projects/1.json": apiProject1,
  "https://api.betterplace.org/en/api_v4/projects/1/categories.json":
    categoriesResult([categoryEducation]),
  "https://api.betterplace.org/en/api_v4/projects/2/categories.json":
    categoriesResult([categoryPopular]),
  "https://api.betterplace.org/en/api_v4/projects/3/categories.json":
    categoriesResult([categoryEducation, categoryPopular]),
  "https://api.betterplace.org/en/api_v4/projects/4/categories.json":
    categoriesResult([categoryEducation, categoryPopular]),
  "https://api.betterplace.org/de/api_v4/organisations/1.json":
    apiOrganisation1,
  "https://api.betterplace.org/de/api_v4/organisations/2.json":
    apiOrganisation2,
  "https://api.betterplace.org/de/api_v4/organisations/3.json":
    apiOrganisation2,
  "https://api.betterplace.org/de/api_v4/organisations/4.json":
    apiOrganisation2,
  "https://api.betterplace.org/de/api_v4/blog_posts/1.json": apiBlogPosts1,
  "https://api.betterplace.org/de/api_v4/blog_posts/2.json": apiBlogPosts2,
  "https://api.betterplace.org/de/api_v4/blog_posts/": apiBlogPostsEmpty,
};

const projectFragment = `
  id
  title
  summary
  description
  city
  country
  categories
  donationsCount
  donationUrl
  progressPercentage
  openAmountInCents
  picture {
    type
    url
    width
    height
  }
  initiative {
    id
    name
    city
    country
    picture {
      type
      url
      width
      height
    }
    url
  }
  news(limit: 3) {
    id
    title
    body
    publishDate
    author {
      name
      picture {
        type
        url
        width
        height
      }
    }
    url
  }
  newsUrl
  newsCount
`;

const queryProjects = (
  graphQLServer: GraphQLServer,
  offset = 10,
): Promise<ProjectsResponse> => {
  const query = `
  query Projects {
    projects(limit: 10, offset: ${offset}) {
      totalResults
      data {
        ${projectFragment}
      }
    }
  }`;
  return processGqlRequest(graphQLServer, query).then(
    (result) => result?.projects as ProjectsResponse,
  );
};

const queryProject = async (
  graphQLServer: GraphQLServer,
  headers = {},
): Promise<Project> => {
  const promise = processGqlRequest(
    graphQLServer,
    `
    query ProjectById($id:Int!) {
      project(id:$id) {
        ${projectFragment}
      }
    }`,
    { id: apiProject1.id },
    headers,
  );

  return (await promise)?.project as Project;
};

const urlForPage = (page = 1, pageSize = 10) =>
  new URL(
    "https://api.betterplace.org/de/api_v4/projects.json?" +
      `facets=completed%3Afalse%7Cclosed%3Afalse%7Cprohibit_donations%3Afalse&order=rank%3ADESC&page=${page}&per_page=${pageSize}`,
  );

describe("betterplace", () => {
  let fetchStub: Stub;
  let time: FakeTime;

  beforeEach(() => {
    time = new FakeTime(new Date(2023, 8, 13, 12));
  });

  afterEach(() => {
    fetchStub?.restore();
    time?.restore();
  });

  describe("fetching project list", () => {
    it("calls api with correct parameters", async () => {
      fetchStub = stubFetch(emptyResponse);

      await fetchProjects({ limit: 10, offset: 30 }, "de");

      const expectedUrl = urlForPage(3);
      assertSpyCall(fetchStub, 0, { args: [expectedUrl] });
    });

    it("calls api with correct parameters for location search", async () => {
      fetchStub = stubFetch(emptyResponse);

      await fetchProjects({ limit: 10, offset: 20, location: "Hamburg" }, "de");

      const expectedUrl = new URL(
        "https://api.betterplace.org/de/api_v4/projects.json?" +
          "facets=completed%3Afalse%7Cclosed%3Afalse%7Cprohibit_donations%3Afalse&order=rank%3ADESC&page=3&per_page=10" +
          "&scope=location&q=Hamburg",
      );
      assertSpyCall(fetchStub, 0, { args: [expectedUrl] });
    });

    it("properly encodes query for location search", async () => {
      fetchStub = stubFetch(emptyResponse);

      await fetchProjects(
        {
          limit: 10,
          offset: 20,
          location: "Straße 123, 20535 Hamburg",
        },
        "de",
      );

      const expectedUrl = new URL(
        "https://api.betterplace.org/de/api_v4/projects.json?" +
          "facets=completed%3Afalse%7Cclosed%3Afalse%7Cprohibit_donations%3Afalse&order=rank%3ADESC&page=3&per_page=10" +
          "&scope=location&q=Stra%C3%9Fe+123%2C+20535+Hamburg",
      );
      assertSpyCall(fetchStub, 0, { args: [expectedUrl] });
    });

    it("calls api with correct parameters for empty location search", async () => {
      fetchStub = stubFetch(emptyResponse);

      await fetchProjects({ limit: 10, offset: 30, location: "" }, "de");

      const expectedUrl = urlForPage(3);
      assertSpyCall(fetchStub, 0, { args: [expectedUrl] });
    });

    it("queries a random page for the first unfiltered page", async () => {
      fetchStub = stubFetch(emptyResponse);

      await fetchProjects({}, "de");

      assertSpyCall(fetchStub, 0, { args: [urlForPage(635)] });
    });

    it("queries a different random page the next day", async () => {
      time.tick(24 * 60 * 60 * 1000);
      fetchStub = stubFetch(emptyResponse);

      await fetchProjects({}, "de");

      assertSpyCall(fetchStub, 0, { args: [urlForPage(249)] });
    });

    it("resumes normal pagination after the first page", async () => {
      fetchStub = stub(
        globalThis,
        "fetch",
        returnsNext(
          Array(3).fill(emptyResponse).map((response) =>
            Promise.resolve(new Response(JSON.stringify(response)))
          ),
        ),
      );

      await fetchProjects({}, "de");
      await fetchProjects({ offset: 10 }, "de");
      await fetchProjects({ offset: 20 }, "de");

      assertSpyCall(fetchStub, 0, { args: [urlForPage(635)] });
      assertSpyCall(fetchStub, 1, { args: [urlForPage(1)] });
      assertSpyCall(fetchStub, 2, { args: [urlForPage(2)] });
    });

    it("skips the randomly selected page in normal pagination", async () => {
      fetchStub = stub(
        globalThis,
        "fetch",
        returnsNext(
          Array(3).fill(emptyResponse).map((response) =>
            Promise.resolve(new Response(JSON.stringify(response)))
          ),
        ),
      );

      await fetchProjects({}, "de");
      await fetchProjects({ offset: 6340 }, "de");
      await fetchProjects({ offset: 6350 }, "de");

      assertSpyCall(fetchStub, 0, { args: [urlForPage(635)] });
      assertSpyCall(fetchStub, 1, { args: [urlForPage(634)] });
      assertSpyCall(fetchStub, 2, { args: [urlForPage(636)] });
    });

    it("does not query random projects for the first page when filtering for location", async () => {
      fetchStub = stubFetch(emptyResponse);

      await fetchProjects({ limit: 10, offset: 0, location: "Hamburg" }, "de");

      const expectedUrl = new URL(
        "https://api.betterplace.org/de/api_v4/projects.json?" +
          "facets=completed%3Afalse%7Cclosed%3Afalse%7Cprohibit_donations%3Afalse&order=rank%3ADESC&page=1&per_page=10" +
          "&scope=location&q=Hamburg",
      );
      assertSpyCall(fetchStub, 0, { args: [expectedUrl] });
    });

    it("correctly parses empty response", async () => {
      fetchStub = stubFetch(emptyResponse);

      const result = await fetchProjects({ offset: 10 });

      assertEquals(result, { totalResults: 0, data: [] });
    });

    it("correctly parses project list", async () => {
      fetchStub = stubFetchByUrlPrefix(validApiResponses);

      const graphQLServer = createGraphQLServer({ cacheEnabled: false });
      const result = await queryProjects(graphQLServer);

      assertEquals(result, expectedProjectsResponse);
    });

    it("throws error for invalid projects response", async () => {
      fetchStub = stub(
        globalThis,
        "fetch",
        returnsNext([Promise.resolve(new Response("foobar"))]),
      );

      await assertRejects(() => fetchProjects({ offset: 10 }));
    });

    it("throws error for API error response", async () => {
      fetchStub = stubFetch({
        status: "internal_server_error",
        "status_code": 500,
      });

      await assertRejects(() => fetchProjects({ offset: 10 }));
    });

    it("returns empty categories for invalid category responses", async () => {
      fetchStub = stubFetchByUrlPrefix({
        ...validApiResponses,
        "https://api.betterplace.org/en/api_v4/projects/1/categories.json":
          new Error("Expected error"),
      });

      const graphQLServer = createGraphQLServer({ cacheEnabled: false });
      const result = await queryProjects(graphQLServer);

      const project1 = result.data.find((p) => p.id === 1);
      assertExists(project1);
      assertEquals(project1?.categories, []);
    });

    it("returns api url for invalid organisation responses", async () => {
      fetchStub = stubFetchByUrlPrefix({
        ...validApiResponses,
        "https://api.betterplace.org/de/api_v4/organisations/1.json": new Error(
          "Expected error",
        ),
      });

      const graphQLServer = createGraphQLServer({ cacheEnabled: false });
      const result = await queryProjects(graphQLServer);

      const project1 = result.data.find((p) => p.id === 1);
      assertExists(project1?.initiative);
      assertEquals(
        project1?.initiative.url,
        "https://api.betterplace.org/de/api_v4/organisations/1.json",
      );
    });

    it("returns empty news for invalid blog post responses", async () => {
      fetchStub = stubFetchByUrlPrefix({
        ...validApiResponses,
        "https://api.betterplace.org/de/api_v4/blog_posts/1.json": new Error(
          "Expected error",
        ),
      });

      const graphQLServer = createGraphQLServer({ cacheEnabled: false });
      const result = await queryProjects(graphQLServer);
      const project1 = result.data.find((p) => p.id === 1);
      assertExists(project1);
      assertEquals(project1?.news, []);
    });

    it("returns cached results on recurring requests", async () => {
      fetchStub = stubFetchByUrlPrefix(validApiResponses);
      const graphQLServer = createGraphQLServer({ cacheEnabled: true });
      const result = await queryProjects(graphQLServer);
      assertEquals(result, expectedProjectsResponse);

      fetchStub?.restore();
      fetchStub = stubFetchByUrlPrefix({
        "https://api.betterplace.org/en/api_v4/projects.json": new Error(
          "Expected error",
        ),
      });
      const result2 = await queryProjects(graphQLServer);
      assertEquals(result2, expectedProjectsResponse);
    });
  });

  describe("fetching single project", () => {
    it("correctly retrieves a project by ID", async () => {
      fetchStub = stubFetchByUrlPrefix(validApiResponses);

      const graphQLServer = createGraphQLServer({ cacheEnabled: false });
      const result = await queryProject(graphQLServer);

      assertEquals(result, expectedResult);
    });

    it("correctly extracts language from locale", async () => {
      fetchStub = stubFetchByUrlPrefix(validApiResponses);

      const graphQLServer = createGraphQLServer({ cacheEnabled: false });
      const result = await queryProject(graphQLServer, {
        "accept-language": "de-DE",
      });

      assertEquals(result, expectedResult);
      const expectedUrl =
        "https://api.betterplace.org/de/api_v4/projects/1.json";
      assertSpyCall(fetchStub, 0, { args: [expectedUrl] });
    });

    it("uses correct language as default if requested language is not supported", async () => {
      fetchStub = stubFetchByUrlPrefix(validApiResponses);

      const graphQLServer = createGraphQLServer({ cacheEnabled: false });
      const result = await queryProject(graphQLServer, {
        "accept-language": "es",
      });

      assertEquals(result, expectedResult);
      const expectedUrl =
        "https://api.betterplace.org/en/api_v4/projects/1.json";
      assertSpyCall(fetchStub, 0, { args: [expectedUrl] });
    });

    it("calls api with correct parameters for fetching a project by ID", async () => {
      fetchStub = stubFetch(apiProject1);

      await fetchProject({ id: 1 }, "de");

      const expectedUrl =
        "https://api.betterplace.org/de/api_v4/projects/1.json";
      assertSpyCall(fetchStub, 0, { args: [expectedUrl] });
    });

    it("uses default locale if missing for fetching a project by ID", async () => {
      fetchStub = stubFetch(apiProject1);

      await fetchProject({ id: 1 });

      const expectedUrl =
        "https://api.betterplace.org/en/api_v4/projects/1.json";
      assertSpyCall(fetchStub, 0, { args: [expectedUrl] });
    });

    it("throws error for invalid project response", async () => {
      fetchStub = stub(
        globalThis,
        "fetch",
        returnsNext([Promise.resolve(new Response("foobar"))]),
      );

      await assertRejects(() => fetchProject({ id: 123 }));
    });
  });
});
