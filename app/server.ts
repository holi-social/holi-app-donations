import {
  BetterPlaceLanguage,
  Initiative,
  News,
  NewsParameters,
  Project,
  ProjectParameters,
  ProjectsParameters,
  ProjectsResponse,
} from './types.ts'
import {
  DEFAULT_LANGUAGE,
  fetchCategories,
  fetchInitiativeUrl,
  fetchNews,
  fetchProject,
  fetchProjects,
  SUPPORTED_LANGUAGES,
} from './betterplace.ts'
import { createSchema, createYoga, serve, useResponseCache } from './deps.ts'
import { logger } from './logging.ts'

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
`

const fakeProject: Project = {
  id: 10,
  title: 'fake',
  categories: [],
  city: undefined,
  country: undefined,
  initiative: {
    id: 0,
    name: 'fake',
    city: undefined,
    country: undefined,
    picture: [],
  },
  donationsCount: 0,
  progressPercentage: 0,
  openAmountInCents: 0,
  picture: [],
  summary: undefined,
  description: undefined,
  donationUrl: '',
  newsUrl: '',
  news: [],
  newsCount: 0,
}

const createResolvers = (_config: ServerConfig) => ({
  Query: {
    projects: (
      // deno-lint-ignore no-explicit-any
      _parent: any,
      parameters: ProjectsParameters = {},
      context: GraphQLContext,
    ): Promise<ProjectsResponse> =>
      _config.fake ? Promise.resolve({ totalResults: 0, data: [] }) : fetchProjects(
        parameters,
        getLanguage(context?.request?.headers),
      ),
    project: (
      // deno-lint-ignore no-explicit-any
      _parent: any,
      parameters: ProjectParameters,
      context: GraphQLContext,
    ): Promise<Project> =>
      _config.fake ? Promise.resolve(fakeProject) : fetchProject(
        parameters,
        getLanguage(context?.request?.headers),
      ),
  },
  Project: {
    categories: (args: Project): Promise<string[]> => _config.fake ? Promise.resolve([]) : fetchCategories(args.id),
    news: (args: Project, parameters: NewsParameters = {}): Promise<News[]> =>
      _config.fake ? Promise.resolve([]) : fetchNews(args, parameters),
  },
  Initiative: {
    url: (args: Initiative): Promise<string | undefined> =>
      _config.fake ? Promise.resolve(undefined) : fetchInitiativeUrl(args),
  },
})

export const DEFAULT_PORT = 8001
export const DEFAULT_CACHE_ENABLED = true
export const DEFAULT_CACHE_TTL_MS_BETTERPLACE = 60_000

export interface ServerConfig {
  port: number // default: 8001
  cacheEnabled: boolean // default: true
  cacheTtlMsBetterplace: number // default: 60 seconds
  fake: boolean // For local development. If set, the API returns dummy data
}

const getLanguage = (headers?: Headers) => {
  const languages: string = headers?.get('accept-language') || DEFAULT_LANGUAGE
  return (languages
    .split(',') // languages are comma separated
    .map((language) => language.split('-')[0]) // languages may include country code 'de-DE' e.g.
    .map((language) => language.split(';')[0]) // languages may include a 'de;q=0.6' e.g.
    .map((language) => language.trim())
    .find((language) => SUPPORTED_LANGUAGES.includes(language)) ||
    DEFAULT_LANGUAGE) as BetterPlaceLanguage
}

const isAlive = () => new Response(`${true}`)

export const createGraphQLServer = (config: ServerConfig): GraphQLServer => {
  const plugins = config.cacheEnabled
    ? [
      useResponseCache({
        // global cache per language, shared by all users
        session: (request: Request) => getLanguage(request.headers),
        ttlPerSchemaCoordinate: {
          'Query.projects': config.cacheTtlMsBetterplace,
          'Query.project': config.cacheTtlMsBetterplace,
        },
      }),
    ]
    : []
  const resolvers = createResolvers(config)
  return createYoga({
    schema: createSchema({ resolvers, typeDefs }),
    graphiql: true,
    plugins,
  })
}

// deno-lint-ignore no-explicit-any
export type GraphQLServer = any

type GraphQLContext = {
  request?: { headers: Headers }
  params?: {
    extensions?: {
      headers?: {
        [key: string]: string
      }
    }
  }
}

export const startServer = (config: ServerConfig): Promise<void> => {
  const graphQLServer: GraphQLServer = createGraphQLServer(config)
  return serve({
    port: config.port,
    handler: (req: Request) => {
      const url = new URL(req.url)
      const pathname = url.pathname
      if (pathname.startsWith('/health') || pathname.startsWith('/ready')) return isAlive()
      return graphQLServer.handleRequest(req)
    },
    onListen({ port, hostname }) {
      logger.info(
        `Server started at http://${hostname === '0.0.0.0' ? 'localhost' : hostname}:${port}/graphql`,
      )
      if (config.fake) {
        logger.info(
          'Server is serving fake data due to FAKE env var set to true',
        )
      }
    },
  })
}
