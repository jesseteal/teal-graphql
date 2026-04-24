import {
  gql,
  useQuery as useApolloQuery,
  useMutation as useApolloMutation,
  useLazyQuery,
  useApolloClient,
} from '@apollo/client';

let schema: any = {};
let update_by_field: any = null; // audit field to inject
let update_by: any = null; // audit value to inject

// check out https://www.30secondsofcode.org

export const wrapMutation = (fn: any, table: string) => {
  return (data: any) => {
    // allow client to include user "updated_by" value with each call
    if (update_by_field && schema[table]?.indexOf(update_by_field) > -1) {
      data[update_by_field] = update_by;
    }
    // don't allow arrays or objects, remove pesky graphql artifacts
    let copy: any = {};
    for (var x in data) {
      if (data.hasOwnProperty(x) && x !== '__typename') {
        if (
          ['object', 'function'].indexOf(typeof data[x]) === -1 ||
          data[x] === null
        ) {
          copy[x] = data[x];
          // save empty strings as null
          if (typeof copy[x] === 'string' && copy[x].trim() === '') {
            copy[x] = null;
          }
        }
      }
    }
    return fn({ variables: { input: copy } });
  };
};
// pass-thru wrapper
export const useMutation = (query: string, config: any = {}) => {
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

export const useSave = (table: string, clear_cache?: any) => {
  const [createMutation] = useApolloMutation(gql`
      mutation create_${table}($input: ${table}Input!) {
        create${table}(input: $input)
      }
    `);
  const insert = wrapMutation(createMutation, table);

  const [updateMutation] = useApolloMutation(gql`
      mutation update_${table}($input: ${table}Input!) {
        update${table}(input: $input){
          ${schema[table]}
        }
      }
    `);
  const update = wrapMutation(updateMutation, table);
  const client: any = useApolloClient();
  let cache_buster = clear_cache
    ? (r: any) => {
        // expecting array or string
        const arr =
          typeof clear_cache === 'string'
            ? clear_cache.split(',')
            : clear_cache;
        arr.forEach((t: string) => {
          // console.log('BUSTING',t);
          client.cache.evict({
            id: 'ROOT_QUERY',
            fieldName: t,
          });
        });
        return r; // pass through values
      }
    : (r: any) => r; // pass through values, do nothing
  return async (values: any, is_insert = false) => {
    if (!values) return null;
    if (is_insert) {
      return await insert(values)
        .then(({ data }: { data: any }) => data)
        .then(cache_buster);
    }
    return await update(values)
      .then(({ data }: { data: any }) => {
        return data[`update${table}`];
      })
      .then(cache_buster);
  };
};

export const useDelete = (table: string, clear_cache?: any) => {
  const [deleteMutation] = useApolloMutation(gql`
      mutation delete_${table}($input: ${table}Input!) {
        delete${table}(input: $input)
      }
    `);
  // cache buster
  const client: any = useApolloClient();
  let cache_buster = clear_cache
    ? (r: any) => {
        // expecting array or string
        const arr =
          typeof clear_cache === 'string'
            ? clear_cache.split(',')
            : clear_cache;
        arr.forEach((t: string) => {
          // console.log('BUSTING',t);
          client.cache.evict({
            id: 'ROOT_QUERY',
            fieldName: t,
          });
        });
        return r; // pass through values
      }
    : (r: any) => r; // pass through values, do nothing

  return (data: any) =>
    deleteMutation({ variables: { input: data } }).then(cache_buster);
};

export const configure = (params: any) => {
  if (params.schema) {
    schema = params.schema;
  }
  update_by_field = params.update_by_field || null;
  update_by = params.update_by;
};

export const getSchema = () => schema;
export const setSchema = (s: any) => (schema = s);

/*
  returns object:
    {
      loading:  [boolean]
      error:    [string]
      data:     [array] - results
      (and more)
    }
*/
export const useQuery = (query: string, config: any = {}) => {
  const qryType = config.lazy ? useLazyQuery : useApolloQuery;
  const { networkOnly = false, skip = false } = config;
  let result: any = qryType(
    gql`
      ${query}
    `,
    {
      skip,
      fetchPolicy: networkOnly ? 'network-only' : 'cache-first',
      variables: config.variables || null,
    },
  );
  // console.log({ result });
  if (result.error) {
    console.error(result.error);
  }

  // return useMemo(
  //   () => result,
  //   [result.loading, JSON.stringify(config.variables)],
  // );
  return result; // contains { data, refetch, error, loading }
};

export const useSaveDelete = (table: string, clear_cache?: any) => {
  const doDelete = useDelete(table);
  const doSave = useSave(table, clear_cache);
  return [doSave, doDelete];
};

// to bypass the `hooks in components only` issue, get handle first
export const useClient = () => useApolloClient();
// then pass handle into wrapper
export const query = (client: any, query: string, config: any = {}) => {
  const { networkOnly = false } = config;
  return client.query({
    query: gql`
      ${query}
    `,
    fetchPolicy: networkOnly ? 'network-only' : 'cache-first',
    variables: config.variables || null,
  });
};

export const useGraphPurge = () => {
  const client = useApolloClient();
  return (query_key: string) => {
    client.cache.evict({
      id: 'ROOT_QUERY',
      fieldName: query_key,
    });
  };
};
