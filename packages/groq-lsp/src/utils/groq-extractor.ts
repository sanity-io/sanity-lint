/**
 * Extract GROQ queries from source files
 *
 * Supports:
 * - .groq files (entire content is GROQ)
 * - .ts/.tsx/.js/.jsx files (groq`...` template literals)
 */

import type { ExtractionResult, GroqQuery } from '../types.js'

/**
 * Extract GROQ queries from a document based on its language/file type
 */
export function extractQueries(content: string, languageId: string): ExtractionResult {
  switch (languageId) {
    case 'groq':
      return extractFromGroqFile(content)
    case 'typescript':
    case 'typescriptreact':
    case 'javascript':
    case 'javascriptreact':
      return extractFromJsTs(content)
    default:
      return { queries: [], errors: [] }
  }
}

/**
 * Extract from a .groq file - the entire content is a GROQ query
 */
function extractFromGroqFile(content: string): ExtractionResult {
  const trimmed = content.trim()
  if (!trimmed) {
    return { queries: [], errors: [] }
  }

  return {
    queries: [
      {
        query: trimmed,
        start: content.indexOf(trimmed),
        end: content.indexOf(trimmed) + trimmed.length,
        line: 0,
        column: 0,
      },
    ],
    errors: [],
  }
}

/**
 * Extract GROQ from JavaScript/TypeScript files
 * Looks for groq`...` tagged template literals
 */
function extractFromJsTs(content: string): ExtractionResult {
  const queries: GroqQuery[] = []
  const errors: string[] = []

  // Match groq`...` template literals
  // This regex handles:
  // - groq`query`
  // - groq `query` (with space)
  // - Nested backticks are not handled (would need a proper parser)
  const groqTagRegex = /\bgroq\s*`([^`]*)`/g

  let match
  while ((match = groqTagRegex.exec(content)) !== null) {
    const queryContent = match[1]
    if (queryContent === undefined) continue

    const fullMatchStart = match.index
    // The query content starts after "groq`"
    const queryStart = fullMatchStart + match[0].indexOf('`') + 1

    // Calculate line and column
    const beforeMatch = content.slice(0, queryStart)
    const lines = beforeMatch.split('\n')
    const line = lines.length - 1
    const column = lines[lines.length - 1]?.length ?? 0

    queries.push({
      query: queryContent,
      start: queryStart,
      end: queryStart + queryContent.length,
      line,
      column,
    })
  }

  return { queries, errors }
}

/**
 * Find which query (if any) contains a given offset
 */
export function findQueryAtOffset(queries: GroqQuery[], offset: number): GroqQuery | undefined {
  return queries.find((q) => offset >= q.start && offset <= q.end)
}

/**
 * Convert a document offset to a position within a query
 * Returns the offset relative to the query start
 */
export function offsetToQueryPosition(query: GroqQuery, documentOffset: number): number {
  return documentOffset - query.start
}
