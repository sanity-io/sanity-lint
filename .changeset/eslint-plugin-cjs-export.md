---
'eslint-plugin-sanity': patch
---

Add CommonJS export for ESLint compatibility

The plugin now exports both ESM and CJS formats, fixing compatibility issues
with ESLint configurations that use `require()` or FlatCompat.
