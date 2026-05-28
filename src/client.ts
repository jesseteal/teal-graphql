import { useApolloClient } from "./apollo.js";
import { evictCacheFields } from "./cache.js";
import { createGraphqlDocument } from "./documents.js";
import type { CacheEvictTarget } from "./types.js";

/**
 * Returns the active Apollo Client instance from React context.
 *
 * usage: `const client = useClient()`.
 */
export const useClient = () => useApolloClient();

/**
 * Returns a stable helper for evicting one or more cache fields.
 *
 * usage: `const evict = useCacheEvictor(); evict("users")`.
 */
export const useCacheEvictor = () => {
  const client = useApolloClient();

  return (target: CacheEvictTarget): void => {
    evictCacheFields(client.cache, target);
  };
};

/**
 * Runs a GraphQL query with an existing Apollo Client outside React hooks.
 *
 * usage: `runGraphqlQuery(client, "query Users { users { id } }")`.
 */
export const runGraphqlQuery = (
  client: ReturnType<typeof useApolloClient>,
  source: string,
  options: {
    fetchPolicy?: "cache-first" | "network-only" | "no-cache";
    variables?: Record<string, unknown>;
  } = {},
) =>
  client.query({
    fetchPolicy: options.fetchPolicy ?? "cache-first",
    query: createGraphqlDocument(source),
    variables: options.variables,
  });
