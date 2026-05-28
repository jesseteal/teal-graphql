import {
  assertGraphqlIdentifier,
  createCrudDocuments,
  createGraphqlClientConfig,
  createGraphqlDocument,
  normalizeCacheEvictTargets,
  sanitizeMutationInput,
} from "@jesseteal/teal-graphql";

export type User = {
  id: string;
  name: string;
  email: string;
  updatedBy?: string | null;
};

export type UsersData = {
  users: User[];
};

export type UserByIdData = {
  user: User | null;
};

export type UserByIdVariables = {
  id: string;
};

export const graphqlConfig = createGraphqlClientConfig({
  uri: "/graphql",
  token: "example-token",
  headers: {
    "x-example-client": "teal-graphql-example",
  },
  schema: {
    User: "id name email updatedBy",
  },
  audit: {
    field: "updatedBy",
    value: "example-user",
  },
});

export const usersQuery = `
  query Users {
    users {
      id
      name
      email
      updatedBy
    }
  }
`;

export const userByIdQuery = `
  query UserById($id: ID!) {
    user(id: $id) {
      id
      name
      email
      updatedBy
    }
  }
`;

export const renameFirstUserMutation = `
  mutation RenameFirstUser($name: String!) {
    renameFirstUser(name: $name) {
      id
      name
      email
      updatedBy
    }
  }
`;

assertGraphqlIdentifier("User");

export const helperSnapshot = {
  crudOperationNames: Object.keys(createCrudDocuments("User", "id name")),
  documentKind: createGraphqlDocument(usersQuery).kind,
  evictTargets: normalizeCacheEvictTargets("users, user"),
  sanitizedInput: sanitizeMutationInput(
    {
      __typename: "User",
      email: "",
      name: "Example User",
      omitted: undefined,
    },
    graphqlConfig.audit,
  ),
};
