import { gql } from "https://deno.land/x/graphql_tag@0.0.1/mod.ts";
import { Project, ProjectParameters } from "./types.ts";
import { fetchCategories, fetchProjects } from "./betterplace.ts";
import { makeExecutableSchema } from "https://deno.land/x/graphql_tools@0.0.2/schema/makeExecutableSchema.ts";
import { GraphQLHTTP } from "https://deno.land/x/gql@1.1.2/http.ts";
import { Server } from "https://deno.land/std@0.155.0/http/server.ts";

const typeDefs = gql`
    type Picture {
        url: String!
        type: String!
    }

    type Project {
        id: Int!
        title: String!
        categories: [String]!
        donationsCount: Int!
        progressPercentage: Int!
        openAmountInCents: Int!
        picture: [Picture]
    }

    interface Pagination {
        totalResults: Int!
        offset: Int!
    }

    type ProjectsResponse implements Pagination {
        totalResults: Int!
        offset: Int!
        projects: [Project]
    }

    type Query {
        # uses offset-based pagination as described in https://www.apollographql.com/docs/react/pagination/offset-based
        projects(locale: String, limit: Int, offset: Int): ProjectsResponse
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
  Project: {
    categories: (args: Project) => fetchCategories(args.id),
  },
};

export const schema = makeExecutableSchema({ resolvers, typeDefs });
export const middleware = GraphQLHTTP<Request>({
  schema,
  graphiql: true,
});

export const requestHandler = async (req: Request) => {
  const { pathname } = new URL(req.url);
  return pathname === "/graphql"
    ? await middleware(req)
    : new Response("Not Found", { status: 404 });
};

export const createServer = (port: number) =>
  new Server({
    handler: requestHandler,
    port: port,
  });
