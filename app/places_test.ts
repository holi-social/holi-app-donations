import setupLogging from "./logging.ts";
import {
  afterEach,
  assertEquals,
  assertSpyCall,
  describe,
  it,
  Stub,
} from "./dev_deps.ts";
import { processGqlRequest, stubFetch } from "./common_test.ts";
import { fetchPlaces } from "./places.ts";
import {
  expectedGqlResponseHam,
  placesResponseHam,
} from "./places_test_data.ts";
import { Place } from "./types.ts";

const emptyResponse = {
  predictions: [],
};

const placeFragment = `
  description
  structuredFormatting {
    mainText
    secondaryText
    mainTextMatchedSubstrings {
      length
      offset
    }
  }
`;

const placesQuery = (input: string) => `
{
  places(input: "${input}") {
    ${placeFragment}
  }
}
`;

const queryPlaces = async (query: string): Promise<Place[]> => {
  return (await processGqlRequest(query))?.places as Place[];
};

setupLogging("test");

describe("places", () => {
  let fetchStub: Stub;

  afterEach(() => {
    fetchStub?.restore();
  });

  it("calls api with correct parameters", async () => {
    fetchStub = stubFetch(emptyResponse);

    const placesApiKey = "random_string";
    await fetchPlaces({ input: "Ham" }, placesApiKey);

    const expectedUrl = new URL(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Ham&types=%28cities%29&key=${placesApiKey}`,
    );
    assertSpyCall(fetchStub, 0, { args: [expectedUrl] });
  });

  it("correctly parses result and returns", async () => {
    fetchStub = stubFetch(placesResponseHam);
    const places = await queryPlaces(placesQuery("Ham"));
    assertEquals(places, expectedGqlResponseHam);
  });
});
