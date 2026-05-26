# Teal GraphQL Hooks

A reusable, production-ready library of Apollo Client hooks and utilities for React applications.

## Features

- **Type-safe hooks** - Full TypeScript support with JSDoc documentation
- **CRUD operations** - `useSave`, `useDelete` hooks for easy data management
- **Flexible queries** - Generic `useQuery` and `useMutation` hooks
- **Cache management** - Built-in cache eviction helpers
- **Audit fields** - Automatic field injection for auditing
- **React 18+** - Compatible with modern React versions

## Installation

```bash
npm install teal-graphql-hooks @apollo/client react
```

## Quick Start

### 1. Setup the Provider

```tsx
import React from 'react';
import { GraphqlProvider } from 'teal-graphql-hooks';

function App() {
  return (
    <GraphqlProvider
      children={<YourApp />}
      config={{
        graphql_path: '/graphql',
        schema: { user: 'user { id, name, email }' },
        token: 'your-auth-token' // optional
      }}
    />
  );
}
```

### 2. Use Hooks in Components

```tsx
import { useQuery, useMutation, useSave, useDelete } from 'teal-graphql-hooks';

// Simple query
const { data, loading, error } = useQuery(`
  query GetUser {
    user {
      id
      name
      email
    }
  }
`);

// CRUD operations
const [saveUser, deleteUser] = useSave('users');
const [savePost, deletePost] = useSave('posts');

// Save a user
await saveUser({ input: { name: 'John', email: 'john@example.com' } });

// Delete a user
await deleteUser({ input: { id: '123' } });
```

### 3. Configure with Schema

```tsx
import { configure } from 'teal-graphql-hooks';

// Optional: Configure audit fields
configure({
  schema: {
    user: 'user { id, name, email, updated_by }',
    post: 'post { id, title, body, updated_by }'
  },
  updateByField: 'updated_by',
  updateByValue: 'current_user_id'
});
```

## API Reference

### Query Hooks

#### `useQuery(query, config)`

Generic query hook for fetching data.

```tsx
const [result] = useQuery(`
  query {
    users {
      id
      name
      email
    }
  }
`, {
  variables: { limit: 10 },
  skip: false,
  lazy: false
});

// result.data - Array of users
// result.loading - Boolean
// result.error - Error if any
// result.refetch - Refetch function
```

#### `useMutation(query, config)`

Generic mutation hook for mutations.

```tsx
const [mutate] = useMutation(`
  mutation SaveUser($input: UserInput!) {
    saveUser(input: $input) {
      id
      name
    }
  }
`, {
  variables: { input: { name: 'John' } }
});

await mutate();
```

### CRUD Hooks

#### `useSave(table, clearCache)`

Returns a save function for a CRUD table.

```tsx
const [saveUser] = useSave('users');

// Insert new record
await saveUser({ input: { name: 'John', email: 'john@example.com' } });

// Update existing record
await saveUser({ input: { id: '123', name: 'Jane' } });
```

#### `useDelete(table, clearCache)`

Returns a delete function for a CRUD table.

```tsx
const deleteUser = useDelete('users');

await deleteUser({ input: { id: '123' } });
```

#### `useSaveDelete(table, clearCache)`

Returns both save and delete functions in a single hook.

```tsx
const [save, delete] = useSaveDelete('users');
```

### Configuration

#### `configure(config)`

Configure the library with schema and audit settings.

```tsx
import { configure } from 'teal-graphql-hooks';

configure({
  schema: {
    user: 'user { id, name, email }',
    post: 'post { id, title, body }'
  },
  updateByField: 'updated_by',
  updateByValue: 'current_user_id'
});
```

#### `getSchema()`

Get the current schema configuration.

#### `setSchema(schema)`

Set the schema directly.

#### `wrapMutation(fn, table)`

Wrap a mutation to automatically set audit fields.

### Advanced Features

#### Cache Management

```tsx
import { useGraphPurge } from 'teal-graphql-hooks';

const purge = useGraphPurge();

// Purge cache for a specific query
purge('user_123');
```

#### Direct Client Access

```tsx
import { useClient } from 'teal-graphql-hooks';

const client = useClient();

// Advanced cache operations
client.cache.readQuery({
  query: gql`{ users { id } }`
});
```

#### Non-Hook Queries

```tsx
import { query } from 'teal-graphql-hooks';

const result = await query(client, `
  query {
    users {
      id
      name
    }
  }
`, {
  networkOnly: true
});
```

## License

MIT
