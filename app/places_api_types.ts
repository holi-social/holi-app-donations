export type PlacesApiSubstringMatch = {
  length: number;
  offset: number;
};

export type PlacesApiStructuredFormatting = {
  main_text: string;
  main_text_matched_substrings: PlacesApiSubstringMatch[];
  secondary_text: string;
};

export type PlacesApiTerm = {
  offset: number;
  value: string;
};

export type PlacesApiType = string;

export type PlacesApiPrediction = {
  description: string;
  matched_substrings: PlacesApiSubstringMatch[];
  place_id: string;
  reference: string;
  structured_formatting: PlacesApiStructuredFormatting;
  terms: PlacesApiTerm[];
  types: PlacesApiType[];
};

export type PlacesApiResults = {
  predictions: PlacesApiPrediction[];
};
