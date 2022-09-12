import { fetchProjects } from "./betterplace.ts";
import { gql, GraphQLHTTP, log, makeExecutableSchema, Server } from "./deps.ts";
import setupLogging from "./logging.ts";
import type { ProjectParameters } from "./types.ts";

const PORT = 8001;

const typeDefs = gql`
  type Picture {
    url: String!
    type: String!
  }

  type Project {
    id: Int!
    title: String!
    category: String!
    donationsCount: Int!
    progressPercentage: Int!
    openAmountInCents: Int!
    picture: [Picture]
  }

  interface Pagination {
    totalResults: Int!
    offset: Int!
  }

  type ProjectResponse implements Pagination {
    totalResults: Int!
    offset: Int!
    projects: [Project]
  }

  type Query {
    projects(locale: String, pageSize: Int): ProjectResponse
  }
`;

const resolvers = {
  Query: {
    projects: (
      // deno-lint-ignore no-explicit-any
      _parent: any,
      parameters: ProjectParameters = {},
    ) => fetchProjects(parameters),
  },
};

setupLogging();

const schema = makeExecutableSchema({ resolvers, typeDefs });

const s = new Server({
  handler: async (req) => {
    const { pathname } = new URL(req.url);
    return pathname === "/graphql"
      ? await GraphQLHTTP<Request>({
        schema,
        graphiql: true,
      })(req)
      : new Response("Not Found", { status: 404 });
  },
  port: PORT,
});

s.listenAndServe();

log.info(`Started on http://localhost:${PORT}/graphql`);
