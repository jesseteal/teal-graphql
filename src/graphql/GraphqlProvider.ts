import React from 'react';
import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import * as GraphQL from './hooks';

/**
 *
 * config: {
 *    graphql_path
 *    schema
 *    update_by_field
 *    update_by
 * }
 *
 */

export const GraphqlProvider = ({
  children,
  config = {},
}: {
  children: any;
  config: any;
}) => {
  const uri = config.graphql_path || '/graphql';
  GraphQL.configure({
    schema: config.schema,
    update_by_field: config.update_by_field,
    update_by: config.update_by,
  });
  const httpLink = createHttpLink({
    uri,
  });
  const authLink = setContext((_, { headers }) => {
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: config.token ? `Bearer ${config.token}` : '',
      },
    };
  });
  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return React.createElement(ApolloProvider, { client, children });
};
