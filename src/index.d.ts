/**
 * Teal GraphQL Hooks - TypeScript Definitions
 */

export type Config = {
  graphql_path?: string;
  schema?: Record<string, string>;
  token?: string;
  updateByField?: string;
  updateByValue?: string;
};

export interface QueryResult<T = any> {
  data: T;
  loading: boolean;
  error: ApolloError | null;
  refetch: () => void;
}

export interface MutationResult {
  mutate: (options: {
    variables: {
      input: any;
    };
  }) => Promise<any>;
}

declare namespace React {
  interface ComponentClass<P> {
    (props: P, context?: any): React.ReactElement;
  }
}
