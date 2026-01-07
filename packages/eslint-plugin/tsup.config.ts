import { defineConfig } from 'tsup'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  define: {
    PACKAGE_VERSION: JSON.stringify(pkg.version),
  },
})
