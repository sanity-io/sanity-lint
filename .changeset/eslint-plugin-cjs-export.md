---
'eslint-plugin-sanity': patch
'@sanity/groq-lint': patch
'@sanity/lint-core': patch
'@sanity/schema-lint': patch
'@sanity/prettier-plugin-groq': patch
---

Add CommonJS export for ESLint compatibility

All library packages now export both ESM and CJS formats, fixing compatibility
issues with ESLint configurations that use `require()` or FlatCompat.
