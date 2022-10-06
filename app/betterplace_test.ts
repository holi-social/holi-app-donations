import {
  afterEach,
  assertEquals,
  assertExists,
  assertRejects,
  assertSpyCall,
  describe,
  it,
  returnsNext,
  Stub,
  stub,
} from "./dev_deps.ts";
import { fetchProject, fetchProjects } from "./betterplace.ts";
import { middleware } from "./server.ts";
import setupLogging from "./logging.ts";
import {
  apiOrganisation1,
  apiOrganisation2,
  apiProject1,
  apiProjectsResult,
  categoriesResult,
  categoryEducation,
  categoryPopular,
  expectedResult,
  expectedResultList,
} from "./betterplace_test_data.ts";
import { Project } from "./types.ts";

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

const validApiResponses = {
  "https://api.betterplace.org/en/api_v4/projects.json": apiProjectsResult,
  "https://api.betterplace.org/en/api_v4/projects/1.json": apiProject1,
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
  "https://api.betterplace.org/de/api_v4/organisations/1.json":
    apiOrganisation1,
  "https://api.betterplace.org/de/api_v4/organisations/": apiOrganisation2,
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
  progressPercentage
  openAmountInCents
  picture {
      type
      url
  }
  initiative {
    id
    name
    city
    country
    picture {
      url
      type
    }
    url
  }`;

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
    .then((response) => response.json())
    .then((response) => response.data);
};

const queryProjects = (): Promise<Project[]> => {
  const query = `
  query Projects {
    projects {
      ${projectFragment}
    }
  }`;
  return processGqlRequest(query).then((result) =>
    result?.projects as Array<Project>
  );
};

const queryProject = async (): Promise<Project> => {
  const promise = processGqlRequest(
    `
    query ProjectById($id:Int!) {
      project(id:$id) {
        ${projectFragment}
      }
    }`,
    { id: apiProject1.id },
  );

  return (await promise)?.project as Project;
};

setupLogging("test");

describe("betterplace", () => {
  let fetchStub: Stub;

  afterEach(() => {
    fetchStub?.restore();
  });

  it("calls api with correct parameters", async () => {
    fetchStub = stubFetch(emptyResponse);

    await fetchProjects({ locale: "de", limit: 10, offset: 20 });

    const expectedUrl = "https://api.betterplace.org/de/api_v4/projects.json?" +
      "facets=completed:false|closed:false|prohibit_donations:false&order=rank:DESC&page=3&per_page=10";
    assertSpyCall(fetchStub, 0, { args: [expectedUrl] });
  });

  it("uses default parameters for api call if missing", async () => {
    fetchStub = stubFetch(emptyResponse);

    await fetchProjects({});

    const expectedUrl = "https://api.betterplace.org/en/api_v4/projects.json?" +
      "facets=completed:false|closed:false|prohibit_donations:false&order=rank:DESC&page=1&per_page=5";
    assertSpyCall(fetchStub, 0, { args: [expectedUrl] });
  });

  it("correctly parses empty response", async () => {
    fetchStub = stubFetch(emptyResponse);

    const result = await fetchProjects({});

    assertEquals(result, []);
  });

  it("correctly parses project list", async () => {
    fetchStub = stubFetchByUrlPrefix(validApiResponses);

    const result = await queryProjects();

    assertEquals(result, expectedResultList);
  });

  it("correctly retrieves a project by ID", async () => {
    fetchStub = stubFetchByUrlPrefix(validApiResponses);

    const result = await queryProject();

    assertEquals(result, expectedResult);
  });

  it("throws error for invalid projects response", async () => {
    fetchStub = stub(
      globalThis,
      "fetch",
      returnsNext([Promise.resolve(new Response("foobar"))]),
    );

    await assertRejects(() => fetchProjects({}));
  });

  it("throws error for invalid project response", async () => {
    fetchStub = stub(
      globalThis,
      "fetch",
      returnsNext([Promise.resolve(new Response("foobar"))]),
    );

    await assertRejects(() => fetchProject({ id: 123 }));
  });

  it("returns empty categories for invalid category responses", async () => {
    fetchStub = stubFetchByUrlPrefix({
      ...validApiResponses,
      "https://api.betterplace.org/en/api_v4/projects/1": new Error(
        "Expected error",
      ),
    });

    const result = await queryProjects();

    const project1 = result.find((p) => p.id === 1);
    assertExists(project1);
    assertEquals(project1.categories, []);
  });

  it("returns api url for invalid organisation responses", async () => {
    fetchStub = stubFetchByUrlPrefix({
      ...validApiResponses,
      "https://api.betterplace.org/de/api_v4/organisations/1.json": new Error(
        "Expected error",
      ),
    });

    const result = await queryProjects();

    const project1 = result.find((p) => p.id === 1);
    assertExists(project1?.initiative);
    assertEquals(
      project1.initiative.url,
      "https://api.betterplace.org/de/api_v4/organisations/1.json",
    );
  });
});
