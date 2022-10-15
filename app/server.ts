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

export const yoga = createYoga({
  schema: createSchema({ resolvers, typeDefs }),
  graphiql: true,
  plugins: [useResponseCache({
    session: () => null, // global cache, shared by all users
    ttlPerSchemaCoordinate: {
      "Query.projects": 10_000, // cache 10 seconds
    },
  })],
});

export const startServer = (port: number): Promise<void> =>
  serve(yoga, {
    port,
    onListen({ hostname, port }) {
      console.log(`Listening on http://${hostname}:${port}/graphql`);
    },
  });
