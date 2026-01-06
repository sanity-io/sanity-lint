# Implementation Plan: Schema-Aware GROQ Tooling

## Overview

Build schema-aware GROQ linting and LSP by leveraging existing Sanity infrastructure:

- **groq-js** - Parser, AST, type evaluator (already in our deps)
- **@sanity/codegen** - Schema reading, query extraction
- **sanity schema extract** - CLI that generates `schema.json`

## Key Discovery: groq-js Has Type Evaluation

```typescript
import { parse, typeEvaluate, SchemaType } from 'groq-js'

const ast = parse('*[_type == "post"]{ title, autor }') // typo: autor
const resultType = typeEvaluate(ast, schema)
// resultType reveals that 'autor' resolves to 'unknown'
```

This is the foundation we need. TypeGen already uses this for generating types.

---

## Stage 1: Schema-Aware GROQ Linting

**Goal**: Catch real bugs like typos in field names, invalid references, wrong types.

### 1.1 Schema Loading

```typescript
// packages/groq-lint/src/schema.ts
import { readSchema } from '@sanity/codegen'
import type { SchemaType } from 'groq-js'

export async function loadSchema(path: string): Promise<SchemaType> {
  return readSchema(path)
}
```

### 1.2 Schema-Aware Rule Interface

Extend our Rule type to support schema context:

```typescript
// packages/core/src/types.ts
interface SchemaAwareRule extends Rule {
  checkWithSchema?(ast: ExprNode, context: LintContext, schema: SchemaType): LintMessage[]
}
```

### 1.3 New Rules Using Type Evaluation

| Rule ID               | Description                          | Example                                           |
| --------------------- | ------------------------------------ | ------------------------------------------------- |
| `unknown-field`       | Field access resolves to unknown     | `*[_type == "post"]{ titel }` (typo)              |
| `invalid-type-filter` | \_type value doesn't exist in schema | `*[_type == "psot"]`                              |
| `type-mismatch`       | Comparing incompatible types         | `*[count > "5"]` (string vs number)               |
| `invalid-reference`   | Reference to non-existent type       | `author->{ name }` where author refs deleted type |

### 1.4 Implementation Approach

```typescript
// packages/groq-lint/src/rules/unknown-field.ts
import { typeEvaluate } from 'groq-js'

export const unknownField: SchemaAwareRule = {
  id: 'unknown-field',
  name: 'Unknown Field',
  description: 'Field does not exist in schema',
  severity: 'error',

  checkWithSchema(ast, context, schema) {
    const messages: LintMessage[] = []

    // Walk projection fields
    walk(ast, (node) => {
      if (node.type === 'AccessAttribute') {
        // Evaluate type at this point
        const parentType = typeEvaluate(node.base, schema)

        // Check if field exists
        if (isUnknown(parentType, node.name)) {
          messages.push({
            ruleId: 'unknown-field',
            message: `Field '${node.name}' does not exist`,
            // Suggest similar fields from schema
            suggestions: findSimilarFields(parentType, node.name),
          })
        }
      }
    })

    return messages
  },
}
```

### 1.5 CLI Integration

```bash
# With schema
sanity-lint --schema schema.json "src/**/*.ts"

# Auto-detect schema.json in project root
sanity-lint "src/**/*.ts"
```

### 1.6 Success Criteria

- [x] Load schema.json via @sanity/codegen
- [x] `unknown-field` rule catches typos in field names
- [x] `invalid-type-filter` catches wrong \_type values
- [x] Suggestions for similar field names (Levenshtein distance)
- [x] Works with ESLint plugin (schema can be passed to linter)

**Status**: Complete

### 1.7 Implementation Notes

**Files created/modified:**

- `packages/groq-lint/src/schema.ts` - Schema loading utilities (Node.js-only, separate entry point)
- `packages/groq-lint/src/rules/invalid-type-filter.ts` - Detects typos in `_type == "value"`
- `packages/groq-lint/src/rules/unknown-field.ts` - Detects unknown fields in projections
- `packages/core/src/types.ts` - Extended with `schema` context and `requiresSchema` flag

**Usage:**

```typescript
import { lint } from '@sanity/groq-lint'
import { loadSchema } from '@sanity/groq-lint/schema'

const schema = await loadSchema('./schema.json')
const result = lint('*[_type == "psot"]{ titel }', { schema })
// Reports: "psot" doesn't exist (suggests "post"), "titel" doesn't exist (suggests "title")
```

---

## Stage 2: GROQ Language Server (LSP)

**Goal**: Real-time feedback in any editor - VS Code, Cursor, Zed, Neovim.

### 2.1 LSP Capabilities

| Capability           | Description                                |
| -------------------- | ------------------------------------------ |
| **Diagnostics**      | Lint errors as you type                    |
| **Hover**            | Show field type, documentation             |
| **Completion**       | Field names, GROQ functions, \_type values |
| **Formatting**       | Use prettier-plugin-groq                   |
| **Go to Definition** | Jump to schema definition (future)         |

### 2.2 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      LSP Server                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Schema    │  │   GROQ      │  │   Diagnostics       │  │
│  │   Loader    │  │   Parser    │  │   (lint rules)      │  │
│  │             │  │   (groq-js) │  │   (@sanity/groq-    │  │
│  │ (@sanity/   │  │             │  │    lint)            │  │
│  │  codegen)   │  │             │  │                     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │              Type Evaluator (groq-js)                 │  │
│  │   typeEvaluate(ast, schema) → TypeNode                │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │                LSP Protocol Handler                   │  │
│  │   textDocument/didOpen, didChange, hover, completion  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
      VS Code              Cursor               Neovim
```

### 2.3 Package Structure

```
packages/
  groq-lsp/
    src/
      server.ts          # LSP server entry
      capabilities/
        diagnostics.ts   # Lint integration
        hover.ts         # Type info on hover
        completion.ts    # Field/function completions
        formatting.ts    # Prettier integration
      schema/
        loader.ts        # Schema loading + watching
        cache.ts         # Schema caching
```

### 2.4 Schema Discovery

```typescript
// Auto-discover schema in project
async function findSchema(workspaceRoot: string): Promise<string | null> {
  const candidates = ['schema.json', 'sanity.schema.json', '.sanity/schema.json']

  for (const candidate of candidates) {
    const path = join(workspaceRoot, candidate)
    if (await exists(path)) return path
  }

  return null
}
```

### 2.5 Embedded GROQ Detection

For JS/TS files, detect GROQ in:

- `groq`...`` tagged template literals
- `defineQuery(`...`)` function calls

Use @sanity/codegen's `findQueriesInSource` or our own ESLint extractor.

### 2.6 Success Criteria

- [ ] LSP server starts and connects
- [ ] Diagnostics for .groq files
- [ ] Diagnostics for embedded GROQ in JS/TS
- [ ] Hover shows field types
- [ ] Completion for field names
- [ ] Format on save works
- [ ] Schema hot-reloading on change

**Status**: Not Started

---

## Stage 3: Editor Extensions

### 3.1 VS Code Extension

- Language configuration for .groq files
- LSP client connecting to our server
- Syntax highlighting (TextMate grammar)
- Snippets for common patterns

### 3.2 Other Editors

- **Neovim**: LSP config in documentation
- **Zed**: Extension or LSP config
- **Cursor**: Should work via VS Code extension

**Status**: Not Started

---

## Stage 4: MCP Server for AI Agents

**Goal**: Let AI assistants validate GROQ before suggesting it.

### 4.1 MCP Tools

```typescript
// tools exposed via MCP
{
  "lint-groq": {
    description: "Lint a GROQ query for issues",
    input: { query: string, schema?: string },
    output: { valid: boolean, messages: LintMessage[] }
  },
  "format-groq": {
    description: "Format a GROQ query",
    input: { query: string },
    output: { formatted: string }
  },
  "explain-groq": {
    description: "Explain what a GROQ query does",
    input: { query: string, schema?: string },
    output: { explanation: string, returnType: TypeNode }
  }
}
```

### 4.2 Integration

AI agents could:

1. Lint GROQ before suggesting to user
2. Auto-fix common issues
3. Understand query return types
4. Generate queries that match schema

**Status**: Not Started

---

## Dependencies

### New Dependencies Needed

```json
{
  "@sanity/codegen": "^5.1.0", // Schema reading, query extraction
  "vscode-languageserver": "^9.0.0", // LSP server (Stage 2)
  "vscode-languageclient": "^9.0.0", // VS Code extension (Stage 3)
  "@modelcontextprotocol/sdk": "..." // MCP server (Stage 4)
}
```

### Already Have

```json
{
  "groq-js": "^1.14.0" // Parser, AST, typeEvaluate, SchemaType
}
```

---

## Open Questions

1. **Schema sync**: How to keep schema.json in sync with Studio changes?
   - Watch mode in LSP
   - Pre-commit hook to regenerate
   - Studio plugin to auto-export on save

2. **Workspace support**: Multi-workspace projects with different schemas?

3. **Performance**: Large schemas + many queries - need caching strategy

4. **Query variables**: How to type-check `$param` usage?

---

## Priority Recommendation

1. **Stage 1 first** - Schema-aware linting has highest value/effort ratio
2. **Stage 2 second** - LSP unlocks real-time DX
3. **Stage 4 third** - MCP for AI agents (growing importance)
4. **Stage 3 last** - Extensions are packaging, not new functionality

---

## References

- [Sanity TypeGen Docs](https://www.sanity.io/docs/apis-and-sdks/sanity-typegen)
- [groq-js source](https://github.com/sanity-io/groq-js)
- [@sanity/codegen source](https://github.com/sanity-io/sanity/tree/next/packages/@sanity/codegen)
- [LSP Specification](https://microsoft.github.io/language-server-protocol/)
- [MCP Specification](https://modelcontextprotocol.io/)
