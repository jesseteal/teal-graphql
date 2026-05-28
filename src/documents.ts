import { gql } from "./apollo.js";
import type { DocumentNode } from "./apollo.js";

const graphqlIdentifierPattern = /^[_A-Za-z][_0-9A-Za-z]*$/;

/**
 * Throws when a generated operation name or resource is not GraphQL-safe.
 *
 * usage: `assertGraphqlIdentifier("User")` before building generated queries.
 */
export const assertGraphqlIdentifier = (
  value: string,
  label = "GraphQL identifier",
): void => {
  if (!graphqlIdentifierPattern.test(value)) {
    throw new Error(`${label} must be a valid GraphQL identifier: ${value}`);
  }
};

/**
 * Parses a GraphQL source string into an Apollo document.
 *
 * usage: `createGraphqlDocument("query Users { users { id } }")`.
 */
export const createGraphqlDocument = (source: string): DocumentNode => gql`
  ${source}
`;

/**
 * Creates the standard create, update, and delete documents for a resource.
 *
 * usage: `createCrudDocuments("User", "id name email")`.
 */
export const createCrudDocuments = (
  resource: string,
  selection?: string,
): {
  create: DocumentNode;
  update?: DocumentNode;
  remove: DocumentNode;
} => {
  assertGraphqlIdentifier(resource, "CRUD resource");

  const create = createGraphqlDocument(`
    mutation Create${resource}($input: ${resource}Input!) {
      create${resource}(input: $input)
    }
  `);

  const update = selection
    ? createGraphqlDocument(`
        mutation Update${resource}($input: ${resource}Input!) {
          update${resource}(input: $input) {
            ${selection}
          }
        }
      `)
    : undefined;

  const remove = createGraphqlDocument(`
    mutation Delete${resource}($input: ${resource}Input!) {
      delete${resource}(input: $input)
    }
  `);

  return {
    create,
    update,
    remove,
  };
};
