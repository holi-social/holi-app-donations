import {
  PlacesApiResults,
  PlacesApiStructuredFormatting,
} from "./places_api_types.ts";
import { Place, PlacesParameters, PlaceStructuredFormatting } from "./types.ts";
import { log } from "./deps.ts";

const buildPlacesUrl = (
  { input }: PlacesParameters,
  placesApiKey: string,
): URL => {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json",
  );
  url.searchParams.append("input", input);
  url.searchParams.append("types", "(cities)");
  url.searchParams.append("key", placesApiKey);
  return url;
};

export const transformPlacesResult = (
  results: PlacesApiResults,
): Place[] => {
  const transformStructuredFormatting = (
    s: PlacesApiStructuredFormatting,
  ): PlaceStructuredFormatting => ({
    mainText: s.main_text,
    mainTextMatchedSubstrings: s.main_text_matched_substrings,
    secondaryText: s.secondary_text,
  });

  return results.predictions.map((prediction) => ({
    description: prediction.description,
    structuredFormatting: transformStructuredFormatting(
      prediction.structured_formatting,
    ),
  }));
};

export const fetchPlaces = (
  params: PlacesParameters,
  placesApiKey: string,
): Promise<Place[]> => {
  const url = buildPlacesUrl(params, placesApiKey);
  const start = Date.now();
  console.debug(`fetching places for search input ${params.input}`);
  return fetch(url)
    .then((result) => result.json())
    .then(transformPlacesResult)
    .then((result) => {
      const duration = Date.now() - start;
      log.debug(`  fetching places took ${duration} ms`);
      return result;
    })
    .catch((e) => {
      const duration = Date.now() - start;
      log.error(
        `Error performing request to ${url} after ${duration} ms: ${e.message}`,
      );
      throw e;
    });
};
