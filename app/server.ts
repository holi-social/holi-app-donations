import {
  Initiative,
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

    type Query {
        # uses offset-based pagination as described in https://www.apollographql.com/docs/react/pagination/offset-based
        projects(offset: Int, limit: Int, locale: String, location: String): ProjectsResponse!
        project(id: Int!): Project!
    }
`;

const resolvers = {
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
  },
  Project: {
    categories: (args: Project) => fetchCategories(args.id),
  },
  Initiative: {
    url: (args: Initiative) => fetchInitiativeUrl(args),
  },
};

export const CACHE_TTL_MS_DEFAULT = 60_000;

export const createGraphQLServer = (
  options: { withCache: boolean; cacheTtlMs?: number },
) => {
  const plugins = !options.withCache ? [] : [useResponseCache({
    session: () => null, // global cache, shared by all users
    ttlPerSchemaCoordinate: {
      "Query.projects": options.cacheTtlMs || CACHE_TTL_MS_DEFAULT,
      "Query.project": options.cacheTtlMs || CACHE_TTL_MS_DEFAULT,
    },
  })];
  return createYoga({
    schema: createSchema({ resolvers, typeDefs }),
    graphiql: true,
    plugins,
  });
};

// deno-lint-ignore no-explicit-any
export type GraphQLServer = any;

export const startServer = (
  options: { port: number; withCache: boolean; cacheTtlMs?: number },
): Promise<void> => {
  const graphQLServer: GraphQLServer = createGraphQLServer({
    withCache: options.withCache,
    cacheTtlMs: options.cacheTtlMs,
  });
  return serve(graphQLServer.handleRequest, {
    port: options.port,
    onListen({ port, hostname }) {
      console.log(
        `Server started at http://${
          hostname === "0.0.0.0" ? "localhost" : hostname
        }:${port}/graphql`,
      );
    },
  });
};
