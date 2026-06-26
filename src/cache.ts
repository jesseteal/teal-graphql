import { useApolloClient, type ApolloCache } from "./apollo.js";
import type { CacheEvictTarget } from "./types.js";

/**
 * Converts cache eviction input into a clean list of root query field names.
 *
 * usage: `normalizeCacheEvictTargets("users, user")`.
 */
export const normalizeCacheEvictTargets = (
  target?: CacheEvictTarget,
): string[] => {
  if (!target) {
    return [];
  }

  const targets = Array.isArray(target) ? target : target.split(",");

  return targets.map((field) => field.trim()).filter(Boolean);
};

/**
 * Evicts one or more ROOT_QUERY fields and runs cache garbage collection.
 *
 * usage: `evictCacheFields(client.cache, ["users", "user"])`.
 */
export const evictCacheFields = (
  cache: ApolloCache<unknown>,
  target?: CacheEvictTarget,
): void => {
  const fields = normalizeCacheEvictTargets(target);

  fields.forEach((fieldName) => {
    cache.evict({
      id: "ROOT_QUERY",
      fieldName,
    });
  });

  if (fields.length > 0) {
    cache.gc();
  }
};
