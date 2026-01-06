import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts', 'src/schema.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
})
