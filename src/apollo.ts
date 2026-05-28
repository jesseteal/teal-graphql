import * as ApolloClientModule from "@apollo/client";

/**
 * Normalizes Apollo Client exports across ESM and CommonJS consumers.
 *
 * usage: read Apollo runtime APIs from this local module.
 */
const apollo =
  (Reflect.get(ApolloClientModule, "default") as
    | typeof ApolloClientModule
    | undefined) || ApolloClientModule;

/**
 * Re-exported Apollo runtime APIs used internally by this package.
 *
 * usage: import `gql` or hooks from `./apollo.js` in source modules.
 */
export const {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  gql,
  useApolloClient,
  useLazyQuery,
  useMutation,
  useQuery,
} = apollo;

/**
 * Re-exported Apollo types used by the public TypeScript surface.
 *
 * usage: import Apollo types from `./apollo.js` to keep type imports aligned.
 */
export type {
  ApolloCache,
  ApolloClient as ApolloClientType,
  ApolloError,
  DefaultOptions,
  DocumentNode,
  FetchResult,
  InMemoryCacheConfig,
  MutationFunctionOptions,
  MutationHookOptions,
  MutationResult,
  OperationVariables,
  QueryHookOptions,
  QueryResult,
  WatchQueryFetchPolicy,
} from "@apollo/client";
