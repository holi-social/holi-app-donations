import { gql, GraphQLHTTP, makeExecutableSchema, Server } from "./deps.ts";
import type { Project, ProjectParameters } from "./types.ts";

// TODO(SF) make port configurable? requires --allow-env
// const PORT = Number(Deno.env.get("PORT")) || 8001
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

  type Query {
    projects(locale: String, pageSize: Int): [Project]
  }
`;

const testProject: Project = {
  id: 1,
  title: "foobar",
  category: "FOOBAR",
  donationsCount: 42,
  progressPercentage: 13,
  openAmountInCents: 42000,
  picture: [],
};

const resolvers = {
  Query: {
    projects: (
      // deno-lint-ignore no-explicit-any
      _parent: any,
      { pageSize = 5, locale = "en" }: ProjectParameters,
    ) => {
      console.log(`Requested ${pageSize} projects in ${locale}`);
      // TODO(SF) validate params
      return Array(pageSize).fill(testProject);
    },
  },
};

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

console.log(`Started on http://localhost:${PORT}/graphql`);
