# eslint-plugin-sanity

ESLint plugin for linting GROQ queries and Sanity schemas.

Works with both **ESLint** and **OxLint**.

## Installation

```bash
npm install eslint-plugin-sanity
```

## Usage with ESLint

```javascript
// eslint.config.js
import sanity from 'eslint-plugin-sanity'

export default [
  ...sanity.configs.recommended,
  // or for stricter checking:
  // ...sanity.configs.strict,
]
```

## Usage with OxLint

OxLint supports ESLint-compatible JS plugins. Our plugin works out of the box:

```json
// oxlint.config.json
{
  "jsPlugins": ["eslint-plugin-sanity"],
  "rules": {
    "sanity/groq-join-in-filter": "error",
    "sanity/groq-deep-pagination": "warn"
  }
}
```

Then run:

```bash
oxlint --config oxlint.config.json src/
```

> **Note**: OxLint JS plugins are experimental. See [OxLint JS Plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins) for details.

## Configurations

### `recommended`

Balanced defaults - errors for serious issues, warnings for improvements.

### `strict`

All rules enabled as errors.

## Rules

### GROQ Rules

These rules lint GROQ queries in:

- `groq\`...\`` tagged template literals
- `defineQuery('...')` function calls (from `next-sanity` or `@sanity/client`)

| Rule                                       | Default | Description                                     |
| ------------------------------------------ | ------- | ----------------------------------------------- |
| `sanity/groq-join-in-filter`               | error   | Avoid `->` inside filters                       |
| `sanity/groq-join-to-get-id`               | warn    | Use `._ref` instead of `->_id`                  |
| `sanity/groq-deep-pagination`              | warn    | Avoid large offsets (>=1000)                    |
| `sanity/groq-large-pages`                  | warn    | Avoid fetching >100 results                     |
| `sanity/groq-many-joins`                   | warn    | Avoid >10 joins in one query                    |
| `sanity/groq-computed-value-in-filter`     | error   | Avoid computed values in filters                |
| `sanity/groq-non-literal-comparison`       | error   | Avoid comparing two non-literals                |
| `sanity/groq-order-on-expr`                | error   | Avoid ordering on computed values               |
| `sanity/groq-repeated-dereference`         | info    | Avoid repeated `->` on same attribute           |
| `sanity/groq-match-on-id`                  | info    | Avoid match on `_id` with wildcard              |
| `sanity/groq-count-in-correlated-subquery` | info    | Avoid `count()` on correlated subqueries        |
| `sanity/groq-very-large-query`             | error   | Query exceeds 10KB                              |
| `sanity/groq-extremely-large-query`        | error   | Query exceeds 100KB                             |
| `sanity/groq-unknown-field`                | error   | Field doesn't exist in schema (requires schema) |
| `sanity/groq-invalid-type-filter`          | error   | Type doesn't exist in schema (requires schema)  |

### Schema Rules

These rules lint Sanity schema definitions using `defineType()` and `defineField()`.

| Rule                                        | Default | Description                                 |
| ------------------------------------------- | ------- | ------------------------------------------- |
| `sanity/schema-missing-define-type`         | error   | Must use `defineType()`                     |
| `sanity/schema-missing-define-field`        | warn    | Fields should use `defineField()`           |
| `sanity/schema-missing-icon`                | warn    | Document types should have icons            |
| `sanity/schema-missing-title`               | warn    | Types should have titles                    |
| `sanity/schema-missing-description`         | info    | Fields should have descriptions             |
| `sanity/schema-missing-slug-source`         | warn    | Slug fields need `options.source`           |
| `sanity/schema-reserved-field-name`         | error   | Avoid reserved field names (`_id`, `_type`) |
| `sanity/schema-array-missing-constraints`   | warn    | Arrays should have constraints              |
| `sanity/schema-boolean-instead-of-list`     | info    | Consider options.list over boolean          |
| `sanity/schema-heading-level-in-schema`     | warn    | Don't store heading levels                  |
| `sanity/schema-unnecessary-reference`       | info    | Consider embedding instead                  |
| `sanity/schema-presentation-field-name`     | warn    | Avoid presentation-focused names            |
| `sanity/schema-missing-required-validation` | warn    | Critical fields need validation             |

## Schema-Aware Linting

For schema-aware rules (`unknown-field`, `invalid-type-filter`), you need to provide a schema:

```javascript
// eslint.config.js
import sanity from 'eslint-plugin-sanity'

export default [
  ...sanity.configs.recommended,
  {
    settings: {
      sanity: {
        schemaPath: './schema.json',
      },
    },
  },
]
```

Generate `schema.json` with:

```bash
npx sanity schema extract
```

## Monorepo Setup

When using eslint-plugin-sanity in a monorepo (Turborepo, pnpm workspaces, etc.), the recommended approach is a **root-level ESLint config** that applies to all packages.

### Next.js + Sanity Monorepo (Recommended)

For monorepos with Next.js and Sanity Studio, create `eslint.config.mjs` at the **root**:

```javascript
// eslint.config.mjs
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import sanity from 'eslint-plugin-sanity'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default [
  // Global ignores
  {
    ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/sanity.types.ts'],
  },

  // Sanity GROQ and schema linting for all packages
  ...sanity.configs.recommended,

  // Next.js rules (scoped to web app)
  ...compat.extends('next/core-web-vitals').map((config) => ({
    ...config,
    files: ['apps/web/**/*.{js,jsx,ts,tsx}'],
    settings: {
      ...config.settings,
      next: { rootDir: 'apps/web' },
      react: { version: 'detect' },
    },
  })),
]
```

**Required root dependencies:**

```bash
pnpm add -D -w eslint eslint-plugin-sanity @eslint/eslintrc \
  eslint-config-next eslint-plugin-react eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y eslint-plugin-import @next/eslint-plugin-next
```

> **Important:** When using `eslint-config-next` with `FlatCompat`, pin `@next/eslint-plugin-next` to the same version as `eslint-config-next` to avoid compatibility issues.

### VS Code / Cursor Settings

Create `.vscode/settings.json` at your **monorepo root**:

```json
{
  "eslint.useFlatConfig": true
}
```

### Alternative: Per-Package Configs

If you prefer separate configs per package, use `eslint.workingDirectories`:

```json
{
  "eslint.workingDirectories": [
    { "directory": "apps/web", "changeProcessCWD": true },
    { "directory": "apps/studio", "changeProcessCWD": true }
  ]
}
```

Or auto-detect:

```json
{
  "eslint.workingDirectories": [{ "mode": "auto" }]
}
```

### Troubleshooting

**ESLint extension not showing errors:**

1. **Check ESLint Output**: `Cmd+Shift+P` → "ESLint: Show Output Channel" - look for config loading errors
2. **Restart ESLint Server**: `Cmd+Shift+P` → "ESLint: Restart ESLint Server"
3. **Verify extension is enabled**: Check that the ESLint extension is enabled for your workspace
4. **Missing dependencies**: Ensure all peer dependencies are installed at root level

**Common errors:**

- `Failed to load config "next/core-web-vitals"` - Install `eslint-config-next` at root
- `Cannot find module 'eslint-plugin-react-hooks'` - Install Next.js ESLint peer deps at root
- `Unexpected top-level property "name"` - Version mismatch between `eslint-config-next` and `@next/eslint-plugin-next`

> **Note**: The CLI (`npx eslint .`) may work even when the extension doesn't. Check the ESLint Output panel for config loading errors.

## License

MIT
