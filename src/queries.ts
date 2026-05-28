import { useMemo } from "react";
import {
  useLazyQuery as useApolloLazyQuery,
  useQuery as useApolloQuery,
} from "./apollo.js";
import type {
  OperationVariables,
  QueryResult,
  WatchQueryFetchPolicy,
} from "./apollo.js";
import { createGraphqlDocument } from "./documents.js";
import type { GraphqlQueryOptions, GraphqlVariables } from "./types.js";

/**
 * Runs a GraphQL query with memoized document creation.
 *
 * usage: `const result = useGraphqlQuery<Data>("query Users { users { id } }")`.
 */
export const useGraphqlQuery = <
  TData = unknown,
  TVariables extends GraphqlVariables = GraphqlVariables,
>(
  source: string,
  options: GraphqlQueryOptions<TVariables> = {},
): QueryResult<TData, TVariables & OperationVariables> => {
  const document = useMemo(() => createGraphqlDocument(source), [source]);
  const { fetchPolicy = "cache-first", skip = false, variables } = options;

  return useApolloQuery(document, {
    fetchPolicy: fetchPolicy as WatchQueryFetchPolicy,
    skip,
    variables,
  });
};

/**
 * Creates a lazy GraphQL query that runs only when explicitly triggered.
 *
 * usage: `const [loadUser] = useLazyGraphqlQuery<Data, Vars>(source)`.
 */
export const useLazyGraphqlQuery = <
  TData = unknown,
  TVariables extends GraphqlVariables = GraphqlVariables,
>(
  source: string,
  options: Omit<GraphqlQueryOptions<TVariables>, "skip"> = {},
) => {
  const document = useMemo(() => createGraphqlDocument(source), [source]);
  const { fetchPolicy = "cache-first", variables } = options;

  return useApolloLazyQuery(document, {
    fetchPolicy: fetchPolicy as WatchQueryFetchPolicy,
    variables,
  });
};
