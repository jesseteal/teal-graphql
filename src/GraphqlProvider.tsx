/**
 * GraphQL Provider Component
 *
 * Sets up Apollo Client with the necessary configuration for the hooks.
 *
 * @example
 * ```tsx
 * import { GraphqlProvider } from 'teal-graphql';
 *
 * function App() {
 *   return (
 *     <GraphqlProvider
 *       children={<YourApp />}
 *       config={{
 *         graphql_path: '/graphql',
 *         schema: { user: 'user { id, name }' }
 *       }}
 *     />
 *   );
 * }
 * ```
 */

import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import * as ApolloClientModule from '@apollo/client';
import type { ApolloClient as ApolloClientType } from '@apollo/client';
import { configure as configSetup, setSchema } from './hooks.js';

const ApolloClientPackage =
  (ApolloClientModule as any).default || ApolloClientModule;
const { ApolloClient, InMemoryCache, ApolloProvider } = ApolloClientPackage;

export type GraphqlConfig = {
  graphql_path?: string;
  schema?: Record<string, string>;
  token?: string;
  updateByField?: string;
  updateByValue?: string;
};

// Store Apollo client and config in a context
const Context = createContext<{
  client: ApolloClientType<any>;
  config: GraphqlConfig;
}>({
  client: null as any,
  config: {},
});

export interface GraphqlProviderProps extends GraphqlConfig {
  children: React.ReactNode;
  config?: GraphqlConfig;
}

/**
 * GraphQL Provider component.
 *
 * @example
 * ```tsx
 * <GraphqlProvider
 *   children={<App />}
 *   config={{
 *     graphql_path: '/graphql',
 *     schema: { user: 'user { id, name }' }
 *   }}
 * />
 * ```
 */
export const GraphqlProvider = ({
  children,
  config,
  graphql_path,
  schema,
  token,
  updateByField,
  updateByValue,
}: GraphqlProviderProps) => {
  const resolvedConfig = useMemo(
    () => ({
      graphql_path,
      schema,
      token,
      updateByField,
      updateByValue,
      ...config,
    }),
    [config, graphql_path, schema, token, updateByField, updateByValue],
  );
  const cache = useRef(new InMemoryCache({
    // Optimistic updates and cache policies
    typePolicies: {
      Query: {
        fields: {
          // Prevent stale data issues
          user: {
            merge: (prev: any, { data }: { data: any }) => ({
              ...prev,
              ...data,
            }),
          },
        },
      },
    },
  }));

  const client = useMemo((): ApolloClientType<any> => {
    const { graphql_path = '/graphql', token } = resolvedConfig;

    // Build headers
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new ApolloClient({
      cache: cache.current,
      ssrMode: false,
      defaultOptions: {
        query: {
          fetchPolicy: 'cache-first',
        },
        mutate: {
          fetchPolicy: 'network-only',
        },
      },
      uri: graphql_path,
      headers,
    });
  }, [resolvedConfig]);

  // Setup on mount
  useEffect(() => {
    const { schema } = resolvedConfig;

    // Apply configuration
    if (schema) {
      setSchema(schema);
      configSetup({
        schema,
        updateByField: resolvedConfig.updateByField,
        updateByValue: resolvedConfig.updateByValue,
      });
    }
  }, [resolvedConfig]);

  return (
    <Context.Provider value={{ client, config: resolvedConfig }}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </Context.Provider>
  );
};

export default GraphqlProvider;
