/**
 * GraphQL Hooks Module
 * 
 * Provides reusable Apollo Client hooks for React applications.
 * 
 * @module hooks
 * @example
 * ```tsx
 * import { useQuery, useMutation, useSave, useDelete } from 'teal-graphql-hooks';
 * 
 * // Simple query
 * const { data, loading, error } = useQuery(`query { user { name } }`);
 * 
 * // Mutation
 * const [mutate] = useMutation(`mutation { saveUser { id } }`);
 * 
 * // CRUD operations
 * const [saveUser, deleteUser] = useSave('users');
 * ```
 */

import {
  gql,
  useQuery as useApolloQuery,
  useMutation as useApolloMutation,
  useLazyQuery,
  useApolloClient,
  ApolloError,
} from '@apollo/client';

// Configuration state
export let schema: Record<string, string> = {};
export let updateByField: string | null = null; // Field name for audit (e.g., 'updated_by')
export let updateByValue: string | null = null; // Value to inject (e.g., 'current_user_id')

/**
 * Configure the library with schema and audit settings.
 * Call once before using hooks.
 * 
 * @param params - Configuration object
 * @param params.schema - GraphQL schema mapping for mutations
 * @param params.updateByField - Optional audit field name
 * @param params.updateByValue - Optional audit value
 * @example
 * configure({
 *   schema: { user: 'user { id, name }' },
 *   updateByField: 'updated_by',
 *   updateByValue: 'user_123'
 * });
 */
export const configure = (params: {
  schema?: Record<string, string>;
  updateByField?: string;
  updateByValue?: string;
}): void => {
  if (params.schema) {
    schema = params.schema;
  }
  updateByField = params.updateByField || null;
  updateByValue = params.updateByValue || null;
};

/**
 * Get the current schema configuration.
 * 
 * @returns Schema object
 */
export const getSchema = (): Record<string, string> => schema;

/**
 * Set the schema directly (alternative to configure).
 * 
 * @param s - Schema object
 */
export const setSchema = (s: Record<string, string>): void => {
  schema = s;
};

/**
 * Wrap a mutation to automatically set audit fields.
 * 
 * @param fn - Apollo mutation function
 * @param table - GraphQL table name (used for schema lookup)
 * @returns Wrapped mutation function
 * @example
 * const mutate = wrapMutation(mutationFn, 'users');
 * mutate({ input: { name: 'John' } });
 */
export const wrapMutation = (
  fn: (options: { variables: { input: any } }) => Promise<any>,
  table: string,
): ((data: { input: any }) => Promise<any>) => {
  return async (data: { input: any }): Promise<any> => {
    // Allow client to include user "updated_by" value with each call
    if (updateByField && schema[table] && schema[table].includes(updateByField)) {
      data.input[updateByField] = updateByValue;
    }

    // Remove GraphQL artifacts and filter invalid types
    const copy: Record<string, any> = {};
    for (const x in data.input) {
      if (data.input.hasOwnProperty(x) && x !== '__typename') {
        const value = data.input[x];
        const type = typeof value;

        // Include scalars, null values, and primitives
        if (
          (type !== 'object' && type !== 'function') ||
          value === null
        ) {
          copy[x] = value;

          // Save empty strings as null
          if (type === 'string' && value?.trim() === '') {
            copy[x] = null;
          }
        }
      }
    }

    return fn({ variables: { input: copy } });
  };
};

/**
 * Generic query hook with flexible configuration.
 * 
 * @param query - GraphQL query string
 * @param config - Query configuration options
 * @param config.variables - Query variables
 * @param config.variables.networkOnly - Fetch from network only
 * @param config.variables.skip - Skip query if no variables
 * @param config.variables.lazy - Use lazy query hook
 * @returns Query hook tuple
 * @example
 * const [result] = useQuery(`query { users { id, name } }`);
 * 
 * // With variables
 * const [result] = useQuery(`query { user(id: $id) { name } }`, {
 *   variables: { id: 123 }
 * });
 */
export const useQuery = (
  query: string,
  config: {
    variables?: Record<string, any>;
    networkOnly?: boolean;
    skip?: boolean;
    lazy?: boolean;
  } = {},
): [any, { data: any; loading: boolean; error?: ApolloError; refetch: (v?: any) => void }] => {
  const isLazy = config.lazy || false;
  const { networkOnly = false, skip = false, variables } = config;

  const hook = isLazy ? useLazyQuery : useApolloQuery;

  const result = hook<Record<string, any>>(
    gql`
      ${query}
    `,
    {
      skip,
      fetchPolicy: networkOnly ? 'network-only' : 'cache-first',
      variables,
    },
  );

  // Handle errors gracefully
  if (result.error) {
    console.error('GraphQL Error:', result.error);
  }

  return result;
};

/**
 * Generic mutation hook.
 * 
 * @param query - GraphQL mutation string
 * @param config - Mutation configuration
 * @param config.variables - Mutation variables
 * @returns Mutation hook tuple
 * @example
 * const [mutate] = useMutation(`mutation { saveUser { id } }`);
 * mutate({ input: { name: 'John' } });
 */
export const useMutation = (
  query: string,
  config: { variables?: Record<string, any> } = {},
): [any, { data: any; loading: boolean; error?: ApolloError }] => {
  const [mutate, { data, loading, error }] = useApolloMutation(
    gql`
      ${query}
    `,
    {
      variables: config.variables || null,
    },
  );

  return [mutate, { data, loading, error }];
};

/**
 * Save to a CRUD table.
 * Automatically handles insert vs update based on existence.
 * 
 * @param table - GraphQL table name
 * @param clearCache - Tables or fields to evict from cache
 * @returns Async save function
 * @example
 * const saveUser = useSave('users');
 * await saveUser({ input: { name: 'John', age: 30 } });
 */
export const useSave = (
  table: string,
  clearCache?: string | string[] | null,
): ((values: { input: any; is_insert?: boolean }, is_insert?: boolean) => Promise<any>) => {
  const [createMutation] = useApolloMutation(
    gql`
      mutation create_${table}($input: ${table}Input!) {
        create${table}(input: $input)
      }
    `,
  );

  const [updateMutation] = useApolloMutation(
    gql`
      mutation update_${table}($input: ${table}Input!) {
        update${table}(input: $input) {
          ${schema[table] || ''}
        }
      }
    `,
  );

  const client = useApolloClient();

  // Cache eviction helper
  const cacheBuster = clearCache
    ? (result: any) => {
        if (clearCache && typeof clearCache === 'string') {
          const fields = clearCache.split(',');
        } else if (Array.isArray(clearCache)) {
          clearCache.forEach((field) => {
            client.cache.evict({
              id: 'ROOT_QUERY',
              fieldName: field,
            });
          });
        }
        return result;
      }
    : null;

  return async (
    values: { input: any; is_insert?: boolean },
    is_insert = false,
  ): Promise<any> => {
    if (!values) return null;

    if (is_insert || !schema[table]) {
      return createMutation({
        variables: { input: values.input },
      })
        .then((result) => result.data)
        .then(cacheBuster || ((r: any) => r));
    }

    return updateMutation({
      variables: { input: values.input },
    })
      .then((result) => result.data[`update${table}`])
      .then(cacheBuster || ((r: any) => r));
  };
};

/**
 * Delete from a CRUD table.
 * 
 * @param table - GraphQL table name
 * @param clearCache - Tables/fields to evict from cache
 * @returns Delete function
 * @example
 * const deleteUser = useDelete('users');
 * await deleteUser({ input: { id: 1 } });
 */
export const useDelete = (
  table: string,
  clearCache?: string | string[] | null,
): ((data: { input: any }) => Promise<any>) => {
  const [deleteMutation] = useApolloMutation(
    gql`
      mutation delete_${table}($input: ${table}Input!) {
        delete${table}(input: $input)
      }
    `,
  );

  const client = useApolloClient();

  // Cache eviction helper
  const cacheBuster = clearCache
    ? (result: any) => {
        if (clearCache && typeof clearCache === 'string') {
          const fields = clearCache.split(',');
        } else if (Array.isArray(clearCache)) {
          clearCache.forEach((field) => {
            client.cache.evict({
              id: 'ROOT_QUERY',
              fieldName: field,
            });
          });
        }
        return result;
      }
    : null;

  return async (data: { input: any }): Promise<any> => {
    const result = await deleteMutation({
      variables: { input: data.input },
    });
    return cacheBuster ? cacheBuster(result) : result;
  };
};

/**
 * Combined save and delete hook for CRUD operations.
 * 
 * @param table - GraphQL table name
 * @param clearCache - Tables/fields to evict from cache
 * @returns Tuple of [saveFn, deleteFn]
 * @example
 * const [saveUser, deleteUser] = useSaveDelete('users');
 * await saveUser({ input: { name: 'John' } });
 * await deleteUser({ input: { id: 1 } });
 */
export const useSaveDelete = (
  table: string,
  clearCache?: string | string[] | null,
): [(typeof useSave), (typeof useDelete)] => {
  const save = useSave(table, clearCache);
  const deleteFn = useDelete(table, clearCache);
  return [save, deleteFn];
};

/**
 * Get Apollo Client instance.
 * Useful for advanced cache operations.
 * 
 * @returns Apollo Client instance
 */
export const useClient = (): any => useApolloClient();

/**
 * Non-hook query function for use in components that can't use hooks.
 * 
 * @param client - Apollo Client instance
 * @param query - GraphQL query
 * @param config - Query configuration
 * @returns Query result
 * @example
 * const query = (client, `query { users }`, {});
 */
export const query = (
  client: any,
  query: string,
  config: { networkOnly?: boolean } = {},
): Promise<any> => {
  const { networkOnly = false } = config;
  return client.query({
    query: gql`
      ${query}
    `,
    fetchPolicy: networkOnly ? 'network-only' : 'cache-first',
    variables: config.variables || null,
  });
};

/**
 * Purge cache for a specific query key.
 * 
 * @returns Cache eviction function
 * @example
 * const purge = useGraphPurge();
 * purge('user_123');
 */
export const useGraphPurge = (): (key: string) => void => {
  const client = useApolloClient();
  return (queryKey: string): void => {
    client.cache.evict({
      id: 'ROOT_QUERY',
      fieldName: queryKey,
    });
  };
};
