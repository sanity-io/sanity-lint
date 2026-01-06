import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/server.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  // Mark Node.js built-ins and large deps as external for the CLI
  external: ['prettier'],
})
