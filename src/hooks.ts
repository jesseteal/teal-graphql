/**
 * Convenience exports for the primary React hooks and client utilities.
 *
 * usage: import hooks from `teal-graphql` or this barrel internally.
 */
export { runGraphqlQuery, useCacheEvictor, useClient } from "./client.js";
export { useCrudActions, useGraphqlMutation } from "./mutations.js";
export { useGraphqlQuery, useLazyGraphqlQuery } from "./queries.js";
