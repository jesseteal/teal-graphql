import React, { createContext, useContext } from "react";
import type { GraphqlClientConfig } from "./types.js";

/**
 * React context value shared by provider-backed hooks.
 *
 * usage: pass `{ config }` to `GraphqlConfigProvider`.
 */
export type GraphqlContextValue = {
  config: GraphqlClientConfig;
};

const GraphqlContext = createContext<GraphqlContextValue | null>(null);

/**
 * Props for the internal GraphQL configuration provider.
 *
 * usage: `<GraphqlConfigProvider value={{ config }}>...</GraphqlConfigProvider>`.
 */
export type GraphqlConfigProviderProps = {
  children: React.ReactNode;
  value: GraphqlContextValue;
};

/**
 * Provides normalized GraphQL package configuration to hooks.
 *
 * usage: wrap hook consumers inside the public `GraphqlProvider`.
 */
export const GraphqlConfigProvider = ({
  children,
  value,
}: GraphqlConfigProviderProps) => (
  <GraphqlContext.Provider value={value}>{children}</GraphqlContext.Provider>
);

/**
 * Reads the current GraphQL package configuration from React context.
 *
 * usage: `const config = useGraphqlConfig()` inside package hooks.
 */
export const useGraphqlConfig = (): GraphqlClientConfig => {
  const value = useContext(GraphqlContext);

  if (!value) {
    throw new Error(
      "GraphqlProvider is required before using teal-graphql hooks.",
    );
  }

  return value.config;
};

/**
 * Identity helper that gives application config an explicit package type.
 *
 * usage: `const config = createGraphqlClientConfig({ uri: "/graphql" })`.
 */
export const createGraphqlClientConfig = (
  config: GraphqlClientConfig,
): GraphqlClientConfig => config;
