# @sanity/dev-tools

> Linting, formatting, and static analysis for Sanity projects

This monorepo contains developer tools for building better Sanity applications.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [@sanity/lint-core](./packages/core) | Core types and utilities | 🚧 In Development |
| [@sanity/groq-lint](./packages/groq-lint) | GROQ query linting | 🚧 In Development |
| [eslint-plugin-sanity](./packages/eslint-plugin) | ESLint integration | 📋 Planned |

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint a GROQ query
pnpm --filter @sanity/groq-lint exec groq-lint -q '*[author->name == "Bob"]'
```

## GROQ Lint Rules

The linter checks for performance anti-patterns and correctness issues:

| Rule | Severity | Description |
|------|----------|-------------|
| `join-in-filter` | error | Avoid `->` inside filters |
| `deep-pagination` | warning | Avoid large slice offsets |
| `computed-value-in-filter` | error | Avoid arithmetic in filters |
| `non-literal-comparison` | error | Avoid comparing two fields |
| ... | ... | More rules coming |

## Development

### Prerequisites

- Node.js >= 20
- pnpm >= 9

### Commands

```bash
pnpm install        # Install dependencies
pnpm build          # Build all packages
pnpm test           # Run tests
pnpm test:watch     # Run tests in watch mode
pnpm lint           # Lint codebase
pnpm typecheck      # Type check
pnpm format         # Format with Prettier
```

### Adding a New Rule

1. Create `packages/groq-lint/src/rules/{rule-name}.ts`
2. Create `packages/groq-lint/src/rules/__tests__/{rule-name}.test.ts`
3. Export from `packages/groq-lint/src/rules/index.ts`
4. Run `pnpm test` to verify

See [CLAUDE.md](./CLAUDE.md) for detailed conventions.

## Roadmap

- [x] Phase 0: Project setup and test infrastructure
- [ ] Phase 1: Port all GROQ lint rules from Rust
- [ ] Phase 2: ESLint plugin integration
- [ ] Phase 3: Schema linting
- [ ] Phase 4: TypeGen enforcement
- [ ] Phase 5+: LSP, formatting, advanced analysis

## License

MIT
