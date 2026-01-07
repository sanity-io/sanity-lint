---
'@sanity/groq-lint': patch
'@sanity/lint-core': patch
'@sanity/schema-lint': patch
'@sanity/prettier-plugin-groq': patch
---

Add CommonJS exports to all library packages

All library packages now export both ESM and CJS formats, fixing compatibility
issues with ESLint configurations that use `require()` or FlatCompat.

- @sanity/lint-core: ESM + CJS
- @sanity/groq-lint: ESM + CJS (library), ESM only (CLI)
- @sanity/schema-lint: ESM + CJS
- @sanity/prettier-plugin-groq: ESM + CJS
