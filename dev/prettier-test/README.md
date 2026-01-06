# Prettier GROQ Plugin Test Environment

This folder provides a hands-on testing environment for `prettier-plugin-groq`.

## Setup

From the repository root:

```bash
pnpm install
pnpm build
```

## Usage

### Format GROQ Files

```bash
cd dev/prettier-test

# Check formatting
pnpm format:check

# Format all files
pnpm format

# Format only .groq files
pnpm format:groq
```

### Run Demo

```bash
pnpm demo
```

This runs the demo script that shows formatting of various GROQ queries.

## Test Files

- `queries/simple.groq` - Basic query with projection
- `queries/complex.groq` - Complex query with multiple features
- `queries/unformatted.groq` - Intentionally unformatted query

## Configuration

The `.prettierrc` file configures Prettier to use the locally built GROQ plugin:

```json
{
  "plugins": ["../../packages/prettier-plugin-groq/dist/index.js"],
  "printWidth": 80
}
```

**Note**: This references the built plugin directly for local development. When the plugin is published, you would use `"prettier-plugin-groq"` instead.

## IDE Integration

For VS Code / Cursor, install the Prettier extension and add to your settings:

```json
{
  "[groq]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```
