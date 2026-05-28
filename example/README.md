# Teal GraphQL Example

This is a small Vite React project that imports `@jesseteal/teal-graphql` from
the parent directory and showcases the package features against an in-memory
`/graphql` fixture served by Vite middleware.

## Run

```bash
cd example
pnpm install
pnpm dev
```

## Features shown

- `GraphqlProvider` with `createGraphqlClientConfig`
- `useGraphqlQuery`
- `useLazyGraphqlQuery`
- `useGraphqlMutation`
- `useCrudActions`
- `useCacheEvictor`
- `useClient` with `runGraphqlQuery`
- `assertGraphqlIdentifier`
- `createGraphqlDocument`
- `createCrudDocuments`
- `normalizeCacheEvictTargets`
- `sanitizeMutationInput`
