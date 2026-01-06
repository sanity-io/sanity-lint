import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/extension.ts'],
  format: ['cjs'],
  outDir: 'dist',
  dts: false, // VS Code extensions don't need .d.ts files
  sourcemap: true,
  clean: true,
  minify: false, // Keep readable for debugging
  external: ['vscode'], // VS Code API is provided by the runtime
  noExternal: ['vscode-languageclient'], // Bundle the language client
  platform: 'node',
  target: 'node18',
  // Don't split chunks for extension
  splitting: false,
  // Tree shake unused code
  treeshake: true,
})
