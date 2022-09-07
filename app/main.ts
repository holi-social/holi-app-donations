import { gql, GraphQLHTTP, makeExecutableSchema, Server } from "./deps.ts";

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => `Hello World!`,
  },
};

const schema = makeExecutableSchema({ resolvers, typeDefs });

const s = new Server({
  handler: async (req) => {
    const { pathname } = new URL(req.url);
    console.log("got request to " + req.url);
    return pathname === "/graphql"
      ? await GraphQLHTTP<Request>({
        schema,
        graphiql: true,
      })(req)
      : new Response("Not Found", { status: 404 });
  },
  port: 8001,
});

s.listenAndServe();

console.log(`Started on http://localhost:8001`);
