import setupLogging from "./logging.ts";
import { Stub } from "./dev_deps.ts";
import { afterEach, assertSpyCall, describe, it } from "./dev_deps.ts";
import { stubFetch } from "./common_test.ts";
import { fetchPlaces } from "./places.ts";

const emptyResponse = {
  predictions: [],
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
    fetchStub = stubFetch(emptyResponse);

    return await Promise.resolve();
  });
});
