# Repository Guidelines

## Project Structure & Module Organization

```
teal-react-graphql/
├── src/
│   └── graphql/          # Core GraphQL utilities and hooks
│       ├── GraphqlProvider.ts   # Apollo client provider wrapper
│       └── hooks.ts            # GraphQL hooks and mutation wrappers
└── AGENTS.md              # This contributor guide
```

Source code lives in `src/graphql/`. Tests, if added later, should go in `src/graphql/__tests__/` or a dedicated `tests/` directory at the root.

## Build, Test, and Development Commands

```bash
# Run locally (React Native / Expo assumed)
npm start                 # Start development server

# Build production bundle
npm run build

# Run type checks
npm run lint              # Linting and type checking

# Execute tests
npm test                  # Run test suite (use Jest or your preferred framework)
```

Use `npm run <command>` scripts defined in `package.json` for consistent workflows.

## Coding Style & Naming Conventions

- **Indentation**: 2 spaces
- **Line length**: ≤ 100 characters
- **Imports**: Group external first, then internal modules
- **Naming**:
  - Components/Classes: `PascalCase`
  - Functions/variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - GraphQL queries: `gql` tagged templates with descriptive names
- **Formatting**: Run `npm run lint -- --fix` before commits

Use ESLint with Prettier for consistent formatting across the codebase.

## Testing Guidelines

- **Framework**: Jest (or your preferred tester)
- **Coverage**: Aim for > 80% line coverage on critical paths
- **Naming**: `describe('Component', 'scenario') → it('expected result')`
- **Structure**:
  ```javascript
  describe('useMutation', () => {
    it('wraps input with update_by field', () => { /* ... */ });
  });
  ```
- **Run tests**: `npm test` or `npm test -- --watch` for interactive mode

## Commit & Pull Request Guidelines

**Commit message format** (Conventional Commits):

```
type(scope): description

[optional body]

[optional footer]
```

- `type`: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
- `scope`: e.g., `graphql`, `hooks`, `provider`
- Example: `feat(graphql): add update_by mutation wrapper`

**Pull Request requirements**:
- Clear description of changes
- Link to related issue (e.g., `Closes #123`)
- Screenshots for UI changes
- Pass lint and tests before submitting
- Tag reviewers if needed

## Additional Notes

- This repo provides reusable GraphQL hooks for React apps.
- Avoid mutating Apollo Client cache directly; use provided wrappers.
- Keep mutation wrappers focused; extract logic to separate files if needed.
