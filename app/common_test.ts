import { returnsNext, stub } from "./dev_deps.ts";
import { createMiddleware } from "./server.ts";

export type ResponsePayload = Record<string, unknown> | Error;

export const stubFetch = (response: ResponsePayload) => {
  return stub(
    globalThis,
    "fetch",
    returnsNext([Promise.resolve(new Response(JSON.stringify(response)))]),
  );
};

export const processGqlRequest = (
  query: string,
  variables: Record<string, unknown> = {},
  placesApiKey?: string,
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
  return createMiddleware({ placesApiKey: placesApiKey })(request)
    .then((response) => response.json())
    .then((response) => response.data);
};
