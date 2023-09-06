import {
  BetterPlaceLanguage,
  Initiative,
  NewsParameters,
  Project,
  ProjectParameters,
  ProjectsParameters,
} from "./types.ts";
import {
  DEFAULT_LANGUAGE,
  fetchCategories,
  fetchInitiativeUrl,
  fetchNews,
  fetchProject,
  fetchProjects,
  SUPPORTED_LANGUAGES,
} from "./betterplace.ts";
import { createSchema, createYoga, serve, useResponseCache } from "./deps.ts";
import { logger } from "./logging.ts";

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
        data: [Project]!
    }

    type Query {
        # uses offset-based pagination as described in https://www.apollographql.com/docs/react/pagination/offset-based
        projects(offset: Int = 0, limit: Int = 10, location: String): ProjectsResponse!
        project(id: Int!): Project!
    }
`;

const createResolvers = (_config: ServerConfig) => ({
  Query: {
    projects: (
      // deno-lint-ignore no-explicit-any
      _parent: any,
      parameters: ProjectsParameters = {},
      context: GraphQLContext,
    ) =>
      _config.fake
        ? Promise.resolve({ totalResults: 0, data: [] })
        : fetchProjects(parameters, context.language),
    project: (
      // deno-lint-ignore no-explicit-any
      _parent: any,
      parameters: ProjectParameters,
      context: GraphQLContext,
    ) =>
      _config.fake
        ? Promise.resolve({})
        : fetchProject(parameters, context.language),
  },
  Project: {
    categories: (args: Project) => fetchCategories(args.id),
    news: (args: Project, parameters: NewsParameters = {}) =>
      _config.fake ? Promise.resolve([]) : fetchNews(args, parameters),
  },
  Initiative: {
    url: (args: Initiative) =>
      _config.fake ? Promise.resolve(undefined) : fetchInitiativeUrl(args),
  },
});

export const DEFAULT_PORT = 8001;
export const DEFAULT_CACHE_ENABLED = true;
export const DEFAULT_CACHE_TTL_MS_BETTERPLACE = 60_000;

export interface ServerConfig {
  port?: number; // default: 8001
  cacheEnabled?: boolean; // default: true
  cacheTtlMsBetterplace?: number; // default: 60 seconds
  fake: boolean; // For local development. If set, the API returns dummy data
}

const getLanguage = (languages = "") =>
  languages
    .split(",")
    .map((language) => language.split("-")[0])
    .find((language) => SUPPORTED_LANGUAGES.includes(language)) ||
  DEFAULT_LANGUAGE;

export const createGraphQLServer = (config: ServerConfig): GraphQLServer => {
  const plugins = config.cacheEnabled || DEFAULT_CACHE_ENABLED
    ? [
      useResponseCache({
        // global cache per language, shared by all users
        session: (request: Request) =>
          getLanguage(
            request.headers.get("accept-language") || DEFAULT_LANGUAGE,
          ),
        ttlPerSchemaCoordinate: {
          "Query.projects": config.cacheTtlMsBetterplace ||
            DEFAULT_CACHE_TTL_MS_BETTERPLACE,
          "Query.project": config.cacheTtlMsBetterplace ||
            DEFAULT_CACHE_TTL_MS_BETTERPLACE,
        },
      }),
    ]
    : [];
  const resolvers = createResolvers(config);
  return createYoga({
    schema: createSchema({ resolvers, typeDefs }),
    graphiql: true,
    plugins,
    context: (context: GraphQLContext) => {
      const languages = (context.params?.extensions?.headers || {})[
        "accept-language"
      ];
      return {
        ...context,
        language: getLanguage(languages),
      };
    },
  });
};

// deno-lint-ignore no-explicit-any
export type GraphQLServer = any;

type GraphQLContext = {
  params?: {
    extensions?: {
      headers?: {
        [key: string]: string;
      };
    };
  };
  language: BetterPlaceLanguage;
};

export const startServer = (config: ServerConfig): Promise<void> => {
  const graphQLServer: GraphQLServer = createGraphQLServer(config);
  return serve(graphQLServer.handleRequest, {
    port: config.port,
    onListen({ port, hostname }) {
      logger.info(
        `Server started at http://${
          hostname === "0.0.0.0" ? "localhost" : hostname
        }:${port}/graphql`,
      );
      if (config.fake) {
        logger.info(
          `Server is serving fake data due to FAKE env var set to true`,
        );
      }
    },
  });
};
