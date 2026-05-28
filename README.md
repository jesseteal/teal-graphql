# Teal GraphQL

A small TypeScript utility package for using Apollo Client in React apps. It
provides a provider, typed query and mutation hooks, CRUD helpers, cache
eviction utilities, and pure helpers for generated GraphQL operations.

## Installation

```bash
npm install @jesseteal/teal-graphql @apollo/client graphql react
```

## Provider

Setup

```tsx
import { GraphqlProvider } from "@jesseteal/teal-graphql";

const graphqlConfig = {
  uri: "/graphql",
  token: "optional-auth-token",
  schema: {
    User: "id name email updatedBy",
  },
  audit: {
    field: "updatedBy",
    value: "current-user-id",
  },
};

export function App() {
  return (
    <GraphqlProvider config={graphqlConfig}>
      <YourApp />
    </GraphqlProvider>
  );
}
```

## CRUD Helpers

```tsx
import { useCrudActions } from "@jesseteal/teal-graphql";

const { save, remove } = useCrudActions({
  resource: "User",
  evict: ["users", "user"],
});

await save({ input: { id: "1", name: "Ada" } });
await save({ input: { name: "Grace" } }, { mode: "create" });
await remove({ input: { id: "1" } });
```

`useCrudActions` builds `create<Resource>`, `update<Resource>`, and
`delete<Resource>` mutations. The resource name must be a valid GraphQL
identifier. The update mutation uses `selection` from the hook options first,
then `config.schema[resource]` from the provider.

## Queries

```tsx
import { useGraphqlQuery } from "@jesseteal/teal-graphql";

type UsersData = {
  users: Array<{ id: string; name: string }>;
};

const { data, loading, error, refetch } = useGraphqlQuery<UsersData>(`
  query Users {
    users {
      id
      name
    }
  }
`);
```

Use `useLazyGraphqlQuery` when a query should run only after an explicit user
action.

## Mutations

Custom Mutations

```tsx
import { useGraphqlMutation } from "@jesseteal/teal-graphql";

type SaveUserData = {
  saveUser: { id: string; name: string };
};

type SaveUserVariables = {
  input: { name: string };
};

const [saveUser, result] = useGraphqlMutation<SaveUserData, SaveUserVariables>(`
  mutation SaveUser($input: UserInput!) {
    saveUser(input: $input) {
      id
      name
    }
  }
`);

await saveUser({ variables: { input: { name: "Ada" } } });
```

## Cache Utilities

```tsx
import { useCacheEvictor } from "@jesseteal/teal-graphql";

const evict = useCacheEvictor();

evict(["users", "user"]);
```

For non-hook code, use `evictCacheFields(cache, target)`.

## Pure Helpers

```tsx
import {
  createGraphqlDocument,
  sanitizeMutationInput,
} from "@jesseteal/teal-graphql";

const input = sanitizeMutationInput({
  __typename: "User",
  name: "",
});
```

`sanitizeMutationInput` removes `__typename`, drops `undefined`, converts empty
strings to `null`, recurses through arrays and plain objects, and applies an
optional audit field.

## Validation

```bash
pnpm test
pnpm build
pnpm smoke
pnpm pack --dry-run
```

## Example Project

A Vite React example lives in `example/`. It imports this package through
`"@jesseteal/teal-graphql": "file:.."` and uses a local Vite middleware to serve an
in-memory `/graphql` endpoint.

```bash
cd example
pnpm install
pnpm dev
```

## License

MIT
