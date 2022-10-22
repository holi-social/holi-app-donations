const placesPredictionHamburg = {
  "description": "Hamburg, Germany",
  "matched_substrings": [
    {
      "length": 3,
      "offset": 0,
    },
  ],
  "place_id": "ChIJuRMYfoNhsUcRoDrWe_I9JgQ",
  "reference": "ChIJuRMYfoNhsUcRoDrWe_I9JgQ",
  "structured_formatting": {
    "main_text": "Hamburg",
    "main_text_matched_substrings": [
      {
        "length": 3,
        "offset": 0,
      },
    ],
    "secondary_text": "Germany",
  },
  "terms": [
    {
      "offset": 0,
      "value": "Hamburg",
    },
    {
      "offset": 9,
      "value": "Germany",
    },
  ],
  "types": [
    "locality",
    "political",
    "geocode",
  ],
};

const placesPredictionHamilton = {
  "description": "Hamilton, ON, Canada",
  "matched_substrings": [
    {
      "length": 3,
      "offset": 0,
    },
  ],
  "place_id": "ChIJj3feJ2yYLIgRIQ7f2Fbuais",
  "reference": "ChIJj3feJ2yYLIgRIQ7f2Fbuais",
  "structured_formatting": {
    "main_text": "Hamilton",
    "main_text_matched_substrings": [
      {
        "length": 3,
        "offset": 0,
      },
    ],
    "secondary_text": "ON, Canada",
  },
  "terms": [
    {
      "offset": 0,
      "value": "Hamilton",
    },
    {
      "offset": 10,
      "value": "ON",
    },
    {
      "offset": 14,
      "value": "Canada",
    },
  ],
  "types": [
    "locality",
    "political",
    "geocode",
  ],
};

export const placesResponseHam = {
  "predictions": [
    placesPredictionHamburg,
    placesPredictionHamilton,
  ],
  "status": "OK",
};

export const expectedGqlResponseHam = [
  {
    "description": "Hamburg, Germany",
    "mainText": "Hamburg",
    "secondaryText": "Germany",
    "mainTextMatchedSubstrings": [
      {
        "length": 3,
        "offset": 0,
      },
    ],
  },
  {
    "description": "Hamilton, ON, Canada",
    "mainText": "Hamilton",
    "secondaryText": "ON, Canada",
    "mainTextMatchedSubstrings": [
      {
        "length": 3,
        "offset": 0,
      },
    ],
  },
];
