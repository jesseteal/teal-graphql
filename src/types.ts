import type { InMemoryCacheConfig, WatchQueryFetchPolicy } from "./apollo.js";

/**
 * Maps resource names to GraphQL selection sets.
 *
 * usage: `{ User: "id name email" }`.
 */
export type GraphqlSchema = Record<string, string>;

/**
 * Standard GraphQL variables object shape.
 *
 * usage: `{ id: "1" }` for typed query or mutation variables.
 */
export type GraphqlVariables = Record<string, unknown>;

/**
 * Standard mutation input object shape.
 *
 * usage: `{ name: "Ada", email: "ada@example.com" }`.
 */
export type MutationInput = Record<string, unknown>;

/**
 * Cache field or fields to evict after a write operation.
 *
 * usage: `"users"` or `["users", "user"]`.
 */
export type CacheEvictTarget = string | string[];

/**
 * Audit field settings applied to sanitized mutation input.
 *
 * usage: `{ field: "updatedBy", value: currentUserId }`.
 */
export type AuditConfig = {
  field: string;
  value: unknown;
};

/**
 * Root configuration consumed by GraphqlProvider and package hooks.
 *
 * usage: `{ uri: "/graphql", schema, audit }`.
 */
export type GraphqlClientConfig = {
  uri: string;
  token?: string;
  headers?: Record<string, string>;
  schema?: GraphqlSchema;
  audit?: AuditConfig;
  cache?: InMemoryCacheConfig;
};

/**
 * Options accepted by useGraphqlQuery and useLazyGraphqlQuery.
 *
 * usage: `{ variables: { id }, fetchPolicy: "network-only" }`.
 */
export type GraphqlQueryOptions<TVariables extends GraphqlVariables> = {
  variables?: TVariables;
  fetchPolicy?: WatchQueryFetchPolicy;
  skip?: boolean;
};

/**
 * Options accepted by useGraphqlMutation.
 *
 * usage: `{ variables: { input } }`.
 */
export type GraphqlMutationOptions<TVariables extends GraphqlVariables> = {
  variables?: TVariables;
};

/**
 * Resource metadata used to generate CRUD operations.
 *
 * usage: `{ resource: "User", evict: "users" }`.
 */
export type CrudResourceConfig = {
  resource: string;
  selection?: string;
  evict?: CacheEvictTarget;
};

/**
 * Selects whether save should run the create or update mutation.
 *
 * usage: `{ mode: "create" }` when inserting a new record.
 */
export type SaveOptions = {
  mode?: "create" | "update";
};

/**
 * Payload accepted by CRUD save commands.
 *
 * usage: `{ input: { id: "1", name: "Ada" } }`.
 */
export type SavePayload<TInput extends MutationInput> = {
  input: TInput;
};

/**
 * Payload accepted by CRUD remove commands.
 *
 * usage: `{ input: { id: "1" } }`.
 */
export type RemovePayload<TInput extends MutationInput> = {
  input: TInput;
};
