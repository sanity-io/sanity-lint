/**
 * Embedded GROQ support for JavaScript/TypeScript files.
 *
 * This module provides an estree printer with an embed function that formats
 * GROQ queries inside:
 * - Tagged template literals: groq`...`, defineQuery`...`
 * - Function calls: defineQuery("...")
 *
 * Usage in .prettierrc:
 * ```json
 * {
 *   "plugins": ["prettier-plugin-groq", "prettier-plugin-groq/embed"]
 * }
 * ```
 */

import type { AstPath, Doc, Options, Plugin, Printer } from 'prettier'
// @ts-expect-error - Prettier internal module
import { printers as estreePrinters } from 'prettier/plugins/estree.mjs'
import { parsers } from './index.js'

// Get the default estree printer to wrap
const defaultEstreePrinter = estreePrinters.estree as Printer
const defaultEmbed = defaultEstreePrinter.embed

// Tags and function names that indicate GROQ content
const GROQ_IDENTIFIERS = ['groq', 'defineQuery']

/**
 * Get the tag name from a TaggedTemplateExpression
 */
function getTagName(node: EstreeLikeNode): string | null {
  if (node.type !== 'TaggedTemplateExpression') return null

  const tag = node.tag
  if (!tag) return null

  // groq`...`
  if (tag.type === 'Identifier' && typeof tag.name === 'string') {
    return tag.name
  }

  // groq.experimental`...` - get the object name
  if (tag.type === 'MemberExpression' && tag.object?.type === 'Identifier') {
    return tag.object.name ?? null
  }

  return null
}

/**
 * Get the function name from a CallExpression
 */
function getCallName(node: EstreeLikeNode): string | null {
  if (node.type !== 'CallExpression') return null

  const callee = node.callee
  if (!callee) return null

  // defineQuery("...")
  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return callee.name
  }

  return null
}

/**
 * Check if a node is a GROQ tagged template literal
 */
function isGroqTaggedTemplate(node: EstreeLikeNode): boolean {
  const tagName = getTagName(node)
  return tagName !== null && GROQ_IDENTIFIERS.includes(tagName)
}

/**
 * Check if a node is a GROQ function call like defineQuery("...")
 */
function isGroqFunctionCall(node: EstreeLikeNode): boolean {
  const callName = getCallName(node)
  return callName !== null && GROQ_IDENTIFIERS.includes(callName)
}

/**
 * Extract GROQ content from a tagged template literal
 */
function extractFromTemplate(node: EstreeLikeNode): string | null {
  const quasi = node.quasi
  if (!quasi || !quasi.quasis) return null

  const quasis = quasi.quasis
  const expressions = quasi.expressions || []

  // Simple case: no expressions
  if (expressions.length === 0) {
    const first = quasis[0]
    if (!first) return null
    return first.value?.cooked ?? first.value?.raw ?? null
  }

  // Build string with placeholders for expressions
  let result = ''
  for (let i = 0; i < quasis.length; i++) {
    const q = quasis[i]
    if (!q) continue
    result += q.value?.cooked ?? q.value?.raw ?? ''
    if (i < expressions.length) {
      // Use a GROQ parameter placeholder that will parse correctly
      result += `$__expr${i}__`
    }
  }

  return result
}

/**
 * Extract GROQ content from a function call like defineQuery("...")
 */
function extractFromFunctionCall(node: EstreeLikeNode): string | null {
  const args = node.arguments
  if (!args || args.length === 0) return null

  const firstArg = args[0]
  if (!firstArg) return null

  // String literal: defineQuery("*[_type == 'post']")
  // Handle both ESTree (Literal) and Babel (StringLiteral) AST types
  if (
    (firstArg.type === 'Literal' || firstArg.type === 'StringLiteral') &&
    typeof firstArg.value === 'string'
  ) {
    return firstArg.value
  }

  // Template literal: defineQuery(`*[_type == 'post']`)
  if (firstArg.type === 'TemplateLiteral') {
    const quasis = firstArg.quasis
    const expressions = firstArg.expressions || []

    if (!quasis || quasis.length === 0) return null

    if (expressions.length === 0) {
      const first = quasis[0]
      return first?.value?.cooked ?? first?.value?.raw ?? null
    }

    // Build string with placeholders
    let result = ''
    for (let i = 0; i < quasis.length; i++) {
      const q = quasis[i]
      if (!q) continue
      result += q.value?.cooked ?? q.value?.raw ?? ''
      if (i < expressions.length) {
        result += `$__expr${i}__`
      }
    }
    return result
  }

  return null
}

// Minimal type for AST nodes we care about
interface EstreeLikeNode {
  type: string
  tag?: EstreeLikeNode
  callee?: EstreeLikeNode
  object?: EstreeLikeNode
  name?: string
  quasi?: {
    quasis?: {
      value?: { cooked?: string | null; raw?: string }
    }[]
    expressions?: unknown[]
  }
  arguments?: {
    type: string
    value?: unknown
    quasis?: {
      value?: { cooked?: string | null; raw?: string }
    }[]
    expressions?: unknown[]
  }[]
}

type EmbedFn = (
  textToDoc: (text: string, options: Options) => Promise<Doc>,
  print: (selector?: string | number | (string | number)[] | AstPath) => Doc,
  path: AstPath,
  options: Options
) => Promise<Doc | undefined> | Doc | undefined

/**
 * The embed function for estree that handles GROQ
 */
function embed(path: AstPath<EstreeLikeNode>, options: Options): EmbedFn | undefined {
  const node = path.node

  // Handle tagged template literals: groq`...`
  if (isGroqTaggedTemplate(node)) {
    const content = extractFromTemplate(node)
    if (!content) {
      // Fall back to default embed behavior
      return defaultEmbed ? (defaultEmbed(path, options) as EmbedFn | undefined) : undefined
    }

    return async (textToDoc, print): Promise<Doc | undefined> => {
      try {
        // Format the GROQ content
        const formattedGroq = await textToDoc(content.trim(), { parser: 'groq' })

        // Get the tag printed normally
        const tag = print('tag')

        // Return the tag followed by formatted template literal
        return [tag, '`', formattedGroq, '`']
      } catch {
        // If GROQ formatting fails, return undefined to use default printing
        return undefined
      }
    }
  }

  // Handle function calls: defineQuery("...")
  if (isGroqFunctionCall(node)) {
    const content = extractFromFunctionCall(node)
    if (!content) {
      // Fall back to default embed behavior
      return defaultEmbed ? (defaultEmbed(path, options) as EmbedFn | undefined) : undefined
    }

    return async (textToDoc, print): Promise<Doc | undefined> => {
      try {
        // Format the GROQ content
        const formattedGroq = await textToDoc(content.trim(), { parser: 'groq' })

        // Get the function name printed normally
        const callee = print('callee')

        // Return the function call with formatted GROQ
        return [callee, '(`', formattedGroq, '`)']
      } catch {
        // If GROQ formatting fails, return undefined to use default printing
        return undefined
      }
    }
  }

  // Fall back to default embed behavior for all other nodes
  return defaultEmbed ? (defaultEmbed(path, options) as EmbedFn | undefined) : undefined
}

/**
 * The estree printer that wraps the default estree printer with GROQ embed support
 */
const estreePrinter: Printer = {
  ...defaultEstreePrinter,
  embed: embed as Printer['embed'],
}

/**
 * The embed plugin exports an estree printer with embed support.
 * Load this alongside the main prettier-plugin-groq for embedded GROQ in JS/TS.
 */
const embedPlugin: Plugin = {
  parsers,
  printers: {
    estree: estreePrinter,
  },
}

export default embedPlugin
export { embed, parsers }
