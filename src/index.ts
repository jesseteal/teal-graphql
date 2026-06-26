/**
 * Public API for the teal-graphql React package.
 *
 * usage: `import { GraphqlProvider, useGraphqlQuery } from "@jesseteal/teal-graphql"`.
 */
export { evictCacheFields, normalizeCacheEvictTargets } from "./cache.js";
export * from "./apollo.js";
export { createGraphqlClientConfig, useGraphqlConfig } from "./config.js";
export {
  assertGraphqlIdentifier,
  createCrudDocuments,
  createGraphqlDocument,
} from "./documents.js";
export * from "./GraphqlProvider.js";
export {
  runGraphqlQuery,
  useCacheEvictor,
  useClient,
  useCrudActions,
  useGraphqlMutation,
  useGraphqlQuery,
  useLazyGraphqlQuery,
} from "./hooks.js";
export { sanitizeMutationInput } from "./input.js";
export type {
  AuditConfig,
  CacheEvictTarget,
  CrudResourceConfig,
  GraphqlClientConfig,
  GraphqlMutationOptions,
  GraphqlQueryOptions,
  GraphqlSchema,
  GraphqlVariables,
  MutationInput,
  SaveOptions,
} from "./types.js";
