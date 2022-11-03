import {
  Initiative,
  NewsParameters,
  PlacesParameters,
  Project,
  ProjectParameters,
  ProjectsParameters,
} from "./types.ts";
import {
  fetchCategories,
  fetchInitiativeUrl,
  fetchNews,
  fetchProject,
  fetchProjects,
} from "./betterplace.ts";
import { fetchPlaces } from "./places.ts";
import { createSchema, createYoga, serve, useResponseCache } from "./deps.ts";

const typeDefs = `
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

    type Author {
      name: String!
      picture: [Picture]
    }

    type News {
      id: Int!
      title: String!
      publishDate: String!
      author: Author
      body: String!
      url: String!
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
        newsUrl: String
        news(limit: Int): [News]!
        newsCount: Int!
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

const createResolvers = (config: ServerConfig) => ({
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
    ) => fetchPlaces(parameters, config.placesApiKey || ""),
  },
  Project: {
    categories: (args: Project) => fetchCategories(args.id),
    news: (args: Project, parameters: NewsParameters = {}) =>
      fetchNews(args, parameters),
  },
  Initiative: {
    url: (args: Initiative) => fetchInitiativeUrl(args),
  },
});

export const DEFAULT_PORT = 8001;
export const DEFAULT_CACHE_ENABLED = true;
export const DEFAULT_CACHE_TTL_MS_BETTERPLACE = 60_000;
export const DEFAULT_CACHE_TTL_MS_PLACES = 60_000 * 60 * 24;

export interface ServerConfig {
  port?: number; // default: 8001
  cacheEnabled?: boolean; // default: true
  cacheTtlMsBetterplace?: number; // default: 60 seconds
  cacheTtlMsPlaces?: number; // default: 24 hours
  placesApiKey?: string; // must be given in order for places calls to work
}

export const createGraphQLServer = (
  config: ServerConfig,
): GraphQLServer => {
  const plugins = (config.cacheEnabled || DEFAULT_CACHE_ENABLED)
    ? [useResponseCache({
      session: () => null, // global cache, shared by all users
      ttlPerSchemaCoordinate: {
        "Query.projects": config.cacheTtlMsBetterplace ||
          DEFAULT_CACHE_TTL_MS_BETTERPLACE,
        "Query.project": config.cacheTtlMsBetterplace ||
          DEFAULT_CACHE_TTL_MS_BETTERPLACE,
        "Query.places": config.cacheTtlMsBetterplace ||
          DEFAULT_CACHE_TTL_MS_PLACES,
      },
    })]
    : [];
  const resolvers = createResolvers(config);
  return createYoga({
    schema: createSchema({ resolvers, typeDefs }),
    graphiql: true,
    plugins,
  });
};

// deno-lint-ignore no-explicit-any
export type GraphQLServer = any;

export const startServer = (
  config: ServerConfig,
): Promise<void> => {
  const graphQLServer: GraphQLServer = createGraphQLServer(config);
  return serve(graphQLServer.handleRequest, {
    port: config.port || DEFAULT_PORT,
    onListen({ port, hostname }) {
      console.log(
        `Server started at http://${
          hostname === "0.0.0.0" ? "localhost" : hostname
        }:${port}/graphql`,
      );
    },
  });
};
