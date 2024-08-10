import { Client } from "./deps.ts";
import {
  BetterPlaceLanguage,
  Project,
  ProjectsResponse,
  RecommendationsParameters,
} from "./types.ts";
import { ApiProject } from "./api_types.ts";
import { transformProject } from "./transformers.ts";
import { DEFAULT_LANGUAGE, DEFAULT_PAGE_SIZE } from "./constants.ts";

export type DonationsDBConfig = {
  hostname: string;
  port: string;
  database: string;
  username: string;
  password: string;
  connectionAttempts: number; // see https://deno-postgres.com/#/?id=database-reconnection
};

const topicsVectorIndices = new Map<string, number>([
  ["agriculture-food", 0],
  ["alternative-economy", 1],
  ["biodiversity-animal-welfare", 2],
  ["building-housing", 3],
  ["children-youth", 4],
  ["climate-protection", 5],
  ["consumption-lifestyle", 6],
  ["culture-social-change", 7],
  ["democracy-human-rights", 8],
  ["disabilities-inclusion", 9],
  ["diversity-gender-equality", 10],
  ["eco-tourism", 11],
  ["education-science", 12],
  ["elderly-people", 13],
  ["energy-transition", 14],
  ["governance", 15],
  ["migration-integration", 16],
  ["mobility-infrastructure", 17],
  ["natural-disaster-response", 18],
  ["natural-resources", 19],
  ["other", 20],
  ["peace-security", 21],
  ["physical-mental-health", 22],
  ["politics-society", 23],
  ["poverty-homelesness", 24],
  ["technological-innovation", 25],
  ["urban-rural-development", 26],
  ["water-ocean", 27],
]);

const recosQueryVector = (topics: string[]): number[] => {
  const queryVector: number[] = Array(
    topicsVectorIndices.size +
      50, /* currently DB schema is identical to volunteering with 50 entries representing skills but all are zero */
  ).fill(0.0);
  for (const topic of topics) {
    if (topicsVectorIndices.has(topic)) {
      queryVector[topicsVectorIndices.get(topic)!] = 1.0;
    }
  }
  return queryVector;
};

export const exportedForTesting = {
  recosQueryVector,
};

export const DEFAULT_DB_CONNECTION_ATTEMPTS = 10;

export class DonationsDB {
  private client: Client;

  constructor(config: DonationsDBConfig) {
    this.client = new Client({
      hostname: config.hostname,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      controls: {
        debug: { // TODO make configurable
          queries: true,
          notices: true,
          results: true,
          queryInError: true,
        },
      },
      connection: {
        attempts: config.connectionAttempts,
      },
    });
  }

  // TODO support multiple languages?
  // TODO support queries with location
  async findRecommendations(
    { offset = 0, limit = DEFAULT_PAGE_SIZE, topics, location: _location }:
      RecommendationsParameters,
    _language: BetterPlaceLanguage = DEFAULT_LANGUAGE,
  ): Promise<ProjectsResponse> {
    const recos = await this.queryRecommendations(
      topics,
      offset < 0 ? 0 : offset,
      limit > 100 || limit < 1 ? 10 : limit,
    )
      .catch((reason) => {
        console.error("Error executing query", reason);
        throw reason;
      });
    return Promise.resolve({
      totalResults: recos.length,
      data: recos,
    });
  }

  // Function to perform cosine similarity search
  private async queryRecommendations(
    topics: string[],
    offset: number,
    limit: number,
  ): Promise<Project[]> {
    const queryVector = JSON.stringify(recosQueryVector(topics));
    console.debug(`queryVector=${queryVector}`);

    // special syntax for Denos postgres client, resulting in an SQL injection-safe prepared statement
    // see https://deno-postgres.com/#/?id=template-strings
    const result = await this.client.queryObject<ApiProject>`
      WITH vector_matches AS (
        SELECT *, 1 - (embedding_array <=> ${queryVector}) AS cosine_similarity
        FROM donations_betterplace_with_classification
        ORDER BY cosine_similarity DESC
        OFFSET ${offset}
        LIMIT ${limit}
      )
      SELECT *
      FROM vector_matches;
    `;
    return result.rows.map(transformProject);
  }
}
