import { gql } from "./deps.ts";
import {
  Initiative,
  PlacesParameters,
  Project,
  ProjectParameters,
  ProjectsParameters,
} from "./types.ts";
import {
  fetchCategories,
  fetchInitiativeUrl,
  fetchProject,
  fetchProjects,
} from "./betterplace.ts";
import { fetchPlaces } from "./places.ts";
import { GraphQLHTTP, makeExecutableSchema, Server } from "./deps.ts";

const typeDefs = gql`
    type Picture {
        type: String!
        url: String!
        width: Int
        height: Int
    }

    type Initiative {
        id: Int!
        name: String!
        city: String!
        country: String!
        picture: [Picture]
        url: String
    }

    type Project {
        id: Int!
        title: String!
        categories: [String]!
        city: String
        country: String
        donationsCount: Int!
        progressPercentage: Int!
        openAmountInCents: Int!
        picture: [Picture]
        initiative: Initiative!
        summary: String
        description: String
        donationUrl: String
    }

    type ProjectsResponse {
        totalResults: Int!
        projects: [Project]!
    }

    type PlaceSubstringMatch {
        length: Int!
        offset: Int!
    }

    type Place {
        description: String!
        mainText: String!
        mainTextMatchedSubstrings: [PlaceSubstringMatch]!
        secondaryText: String!
    }

    type Query {
        # uses offset-based pagination as described in https://www.apollographql.com/docs/react/pagination/offset-based
        projects(offset: Int, limit: Int, locale: String, location: String): ProjectsResponse!
        project(id: Int!): Project!
        places(input: String!): [Place]!
    }
`;

const createResolvers = (serverConfig: ServerConfig) => ({
  Query: {
    projects: (
      // deno-lint-ignore no-explicit-any
      _parent: any,
      parameters: ProjectsParameters = {},
    ) => fetchProjects(parameters),
    project: (
      // deno-lint-ignore no-explicit-any
      _parent: any,
      parameters: ProjectParameters,
    ) => fetchProject(parameters),
    places: (
      // deno-lint-ignore no-explicit-any
      _parent: any,
      parameters: PlacesParameters,
    ) => fetchPlaces(parameters, serverConfig.placesApiKey || ""),
  },
  Project: {
    categories: (args: Project) => fetchCategories(args.id),
  },
  Initiative: {
    url: (args: Initiative) => fetchInitiativeUrl(args),
  },
});

export interface ServerConfig {
  placesApiKey?: string;
}

export const createSchema = (serverConfig: ServerConfig) =>
  makeExecutableSchema({
    resolvers: createResolvers(serverConfig),
    typeDefs,
  });

export const createMiddleware = (serverConfig: ServerConfig) =>
  GraphQLHTTP<Request>({
    schema: createSchema(serverConfig),
    graphiql: true,
  });

export const createRequestHandler =
  (serverConfig: ServerConfig) => async (req: Request) => {
    const { pathname } = new URL(req.url);
    return pathname === "/graphql"
      ? await createMiddleware(serverConfig)(req)
      : new Response("Not Found", { status: 404 });
  };

export const createServer = (port: number, serverConfig: ServerConfig) =>
  new Server({
    handler: createRequestHandler(serverConfig),
    port: port,
  });
