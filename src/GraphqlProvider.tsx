import React, { useMemo } from "react";
import { ApolloClient, ApolloProvider, InMemoryCache } from "./apollo.js";
import type { ApolloClientType } from "./apollo.js";
import { GraphqlConfigProvider } from "./config.js";
import type { GraphqlClientConfig } from "./types.js";

/**
 * Props for the root provider that owns Apollo Client setup.
 *
 * usage: `{ config: { uri: "/graphql" }, children: <App /> }`.
 */
export type GraphqlProviderProps = {
  children: React.ReactNode;
  config: GraphqlClientConfig;
};

/**
 * Creates Apollo Client and exposes GraphQL package config to child hooks.
 *
 * usage: `<GraphqlProvider config={config}><App /></GraphqlProvider>`.
 */
export const GraphqlProvider = ({ children, config }: GraphqlProviderProps) => {
  const cache = useMemo(() => new InMemoryCache(config.cache), [config.cache]);
  const client = useMemo<ApolloClientType<unknown>>(() => {
    const headers = {
      ...config.headers,
      ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
    };

    return new ApolloClient({
      cache,
      defaultOptions: {
        mutate: {
          fetchPolicy: "network-only",
        },
        query: {
          fetchPolicy: "cache-first",
        },
      },
      headers,
      uri: config.uri,
    });
  }, [cache, config.headers, config.token, config.uri]);
  const contextValue = useMemo(() => ({ config }), [config]);

  return (
    <GraphqlConfigProvider value={contextValue}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </GraphqlConfigProvider>
  );
};
