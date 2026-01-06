import { parse as groqParse } from 'groq-js'
import type { Parser } from 'prettier'
import type { ExprNode } from 'groq-js'

export interface GroqAst {
  type: 'groq-root'
  node: ExprNode
}

function locStart(_node: GroqAst): number {
  // groq-js doesn't provide location info, so we return 0
  return 0
}

function locEnd(_node: GroqAst): number {
  // groq-js doesn't provide location info, so we return 0
  return 0
}

export const groqParser: Parser<GroqAst> = {
  parse(text: string): GroqAst {
    const trimmed = text.trim()
    if (!trimmed) {
      throw new Error('Empty GROQ query')
    }
    const node = groqParse(trimmed)
    return {
      type: 'groq-root',
      node,
    }
  },
  astFormat: 'groq-ast',
  locStart,
  locEnd,
}
