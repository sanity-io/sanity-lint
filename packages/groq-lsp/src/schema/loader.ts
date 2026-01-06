/**
 * Schema loading and caching for the LSP server
 *
 * Handles:
 * - Loading schema.json from disk
 * - Auto-discovery of schema files
 * - Caching and invalidation
 * - File watching for hot-reload
 */

import { readFileSync, existsSync, statSync, watch, type FSWatcher } from 'node:fs'
import { join } from 'node:path'
import type { SchemaType } from 'groq-js'
import type { SchemaState } from '../types.js'

/**
 * Well-known schema file locations to search for
 */
const SCHEMA_CANDIDATES = [
  'schema.json',
  'sanity.schema.json',
  '.sanity/schema.json',
  'studio/schema.json',
]

/**
 * SchemaLoader manages schema state for the LSP server
 */
export class SchemaLoader {
  private state: SchemaState = {}
  private watcher: FSWatcher | null = null
  private onChangeCallback: ((schema: SchemaType | undefined) => void) | null = null

  /**
   * Load schema from a specific path
   */
  loadFromPath(schemaPath: string): SchemaState {
    try {
      if (!existsSync(schemaPath)) {
        this.state = {
          path: schemaPath,
          error: `Schema file not found: ${schemaPath}`,
        }
        return this.state
      }

      const content = readFileSync(schemaPath, 'utf-8')
      const schema = JSON.parse(content) as SchemaType
      const stats = statSync(schemaPath)

      this.state = {
        schema,
        path: schemaPath,
        lastModified: stats.mtimeMs,
      }

      return this.state
    } catch (e) {
      this.state = {
        path: schemaPath,
        error: `Failed to load schema: ${e instanceof Error ? e.message : String(e)}`,
      }
      return this.state
    }
  }

  /**
   * Auto-discover schema file in workspace
   */
  discoverSchema(workspaceRoot: string): SchemaState {
    for (const candidate of SCHEMA_CANDIDATES) {
      const candidatePath = join(workspaceRoot, candidate)
      if (existsSync(candidatePath)) {
        return this.loadFromPath(candidatePath)
      }
    }

    this.state = {
      error: 'No schema.json found. Generate with: npx sanity schema extract',
    }
    return this.state
  }

  /**
   * Get the current schema state
   */
  getState(): SchemaState {
    return this.state
  }

  /**
   * Get the loaded schema (if any)
   */
  getSchema(): SchemaType | undefined {
    return this.state.schema
  }

  /**
   * Check if schema needs reloading (file changed)
   */
  needsReload(): boolean {
    if (!this.state.path || !existsSync(this.state.path)) {
      return false
    }

    try {
      const stats = statSync(this.state.path)
      return stats.mtimeMs !== this.state.lastModified
    } catch {
      return false
    }
  }

  /**
   * Reload schema if the file has changed
   */
  reloadIfNeeded(): boolean {
    if (this.needsReload() && this.state.path) {
      this.loadFromPath(this.state.path)
      return true
    }
    return false
  }

  /**
   * Start watching the schema file for changes
   */
  startWatching(onChange: (schema: SchemaType | undefined) => void): void {
    this.onChangeCallback = onChange

    if (!this.state.path || !existsSync(this.state.path)) {
      return
    }

    try {
      this.watcher = watch(this.state.path, (eventType) => {
        if (eventType === 'change' && this.state.path) {
          this.loadFromPath(this.state.path)
          this.onChangeCallback?.(this.state.schema)
        }
      })
    } catch (e) {
      // Watching may fail on some file systems
      console.error(`Failed to watch schema file: ${e}`)
    }
  }

  /**
   * Stop watching the schema file
   */
  stopWatching(): void {
    this.watcher?.close()
    this.watcher = null
    this.onChangeCallback = null
  }

  /**
   * Clear the loaded schema
   */
  clear(): void {
    this.stopWatching()
    this.state = {}
  }
}

/**
 * Singleton instance for convenience
 */
let defaultLoader: SchemaLoader | null = null

export function getSchemaLoader(): SchemaLoader {
  if (!defaultLoader) {
    defaultLoader = new SchemaLoader()
  }
  return defaultLoader
}
