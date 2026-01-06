# GROQ for VS Code

GROQ language support for Visual Studio Code, providing intelligent editing features for [Sanity](https://www.sanity.io) GROQ queries.

## Features

### Syntax Highlighting

Full syntax highlighting for `.groq` files and GROQ queries embedded in JavaScript/TypeScript using the `groq` template tag.

```typescript
import { groq } from 'next-sanity'

const query = groq`
  *[_type == "post"] {
    _id,
    title,
    author->{ name }
  }
`
```

### Diagnostics (Linting)

Real-time linting powered by `@sanity/groq-lint`:

- **Parse errors** - Catch syntax mistakes instantly
- **Performance warnings** - Avoid slow query patterns
- **Schema validation** - Validate against your Sanity schema

### Auto-Completion

Intelligent completions for:

- **Document types** - When typing `_type == "..."`
- **Field names** - Based on your schema
- **System fields** - `_id`, `_type`, `_createdAt`, etc.
- **GROQ functions** - `count()`, `defined()`, `coalesce()`, etc.

### Hover Information

Hover over GROQ elements to see:

- Type information
- Function documentation
- Field descriptions from your schema

### Formatting

Format GROQ queries using Prettier (requires `prettier-plugin-groq`).

### Snippets

Quick snippets for common patterns:

| Prefix     | Description             |
| ---------- | ----------------------- |
| `type`     | Filter by document type |
| `typep`    | Filter with projection  |
| `deref`    | Dereference a reference |
| `groq`     | GROQ template literal   |
| `groqlist` | Paginated list query    |

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "GROQ"
4. Click Install

### Manual Installation

```bash
# Build from source
pnpm build
pnpm package

# Install the .vsix file
code --install-extension vscode-groq-0.0.1.vsix
```

## Configuration

### Settings

| Setting                 | Default | Description                                    |
| ----------------------- | ------- | ---------------------------------------------- |
| `groq.enable`           | `true`  | Enable GROQ language features                  |
| `groq.schemaPath`       | `""`    | Path to schema.json (auto-detected if not set) |
| `groq.maxDiagnostics`   | `100`   | Maximum diagnostics per file                   |
| `groq.enableFormatting` | `true`  | Enable GROQ formatting                         |
| `groq.trace.server`     | `"off"` | LSP trace level (`off`, `messages`, `verbose`) |

### Schema Auto-Discovery

The extension automatically discovers your schema from:

1. `schema.json` in workspace root
2. `sanity.schema.json` in workspace root
3. `.sanity/schema.json`

To generate a schema file:

```bash
npx sanity schema extract --path schema.json
```

## Requirements

- VS Code 1.85.0 or higher
- For schema-aware features: `@sanity/groq-lsp` package

The language server is automatically bundled or can be installed via:

```bash
npm install -D @sanity/groq-lsp
```

## Commands

| Command                         | Description               |
| ------------------------------- | ------------------------- |
| `GROQ: Restart Language Server` | Restart the LSP server    |
| `GROQ: Show Output Channel`     | Show the extension output |

## Supported File Types

| Extension     | Description                                     |
| ------------- | ----------------------------------------------- |
| `.groq`       | Standalone GROQ files                           |
| `.ts`, `.tsx` | TypeScript with `groq\`...\`` template literals |
| `.js`, `.jsx` | JavaScript with `groq\`...\`` template literals |

## Development

```bash
# Install dependencies
pnpm install

# Build extension
pnpm build

# Watch mode
pnpm watch

# Run tests
pnpm test

# Package extension
pnpm package
```

### Debugging

1. Open this folder in VS Code
2. Press F5 to launch Extension Development Host
3. Open a file with GROQ queries
4. Check the "GROQ" output channel for logs

## Related Packages

- [`@sanity/groq-lint`](../groq-lint) - GROQ linting rules
- [`@sanity/groq-lsp`](../groq-lsp) - Language Server Protocol implementation
- [`prettier-plugin-groq`](../prettier-plugin-groq) - Prettier plugin for GROQ

## License

MIT
