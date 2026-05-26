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
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  from,
} from '@apollo/client';
import { configure as configSetup, getSchema, setSchema } from './hooks';

export type Config = {
  children: React.ReactNode;
  graphql_path?: string;
  schema?: Record<string, string>;
  token?: string;
};

// Store Apollo client and config in a context
const Context = createContext<{
  client: ApolloClient<any>;
  config: Config;
}>({
  client: null as any,
  config: null as any,
});

/**
 * Initial state for the provider reducer
 */
const initialState = {
  client: null as any,
  config: null as any,
};

/**
 * Reducer for managing provider state
 */
function reducer(state: typeof initialState, action: any): typeof initialState {
  switch (action.type) {
    case 'SET_CLIENT': {
      return { ...state, client: action.payload };
    }
    case 'SET_CONFIG': {
      return { ...state, config: action.payload };
    }
    default:
      return state;
  }
}

interface GraphqlProviderProps extends Config {
  children?: React.ReactNode;
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
}: GraphqlProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const cache = useRef(new InMemoryCache({
    // Optimistic updates and cache policies
    typePolicies: {
      Query: {
        fields: {
          // Prevent stale data issues
          user: {
            merge: (prev, { data }: { data: any }) => ({ ...prev, ...data }),
          },
        },
      },
    },
  }));
  const clientRef = useRef<any>(null);

  // Initialize Apollo Client
  const setupClient = useCallback((): ApolloClient<any> => {
    const { graphql_path = '/graphql', schema, token } = config;

    // Get schema for Apollo Client
    const apolloSchema = schema || {};

    // Build headers
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return ApolloClient.create({
      cache,
      connectToDevTools: process.env.NODE_ENV !== 'production',
      ssrMode: false,
      defaultOptions: {
        query: {
          fetchPolicy: 'cache-first',
          nextFetchPolicy: 'cache-first',
        },
        mutation: {
          fetchPolicy: 'network-only',
        },
      },
      uri: graphql_path,
      headers,
    });
  }, [config]);

  // Setup on mount
  useEffect(() => {
    const client = setupClient();
    clientRef.current = client;

    // Apply configuration
    if (schema) {
      setSchema(schema);
      configSetup({
        schema,
        updateByField: config.updateByField,
        updateByValue: config.updateByValue,
      });
    }

    dispatch({
      type: 'SET_CLIENT',
      payload: client,
    });

    return () => {
      // Cleanup (if needed)
      // client.stop();
    };
  }, []);

  return (
    <Context.Provider value={{ client: clientRef.current, config }}>
      <ApolloProvider client={clientRef.current}>{children}</ApolloProvider>
    </Context.Provider>
  );
};

export default GraphqlProvider;
