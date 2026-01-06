import type { Plugin, SupportLanguage, Parser, Printer } from 'prettier'
import { doc } from 'prettier'
import { groqParser, type GroqAst } from './parser.js'
import { createGroqPrinter } from './printer.js'

const languages: SupportLanguage[] = [
  {
    name: 'GROQ',
    parsers: ['groq'],
    extensions: ['.groq'],
    vscodeLanguageIds: ['groq'],
  },
]

const parsers: Record<string, Parser<GroqAst>> = {
  groq: groqParser,
}

const printers: Record<string, Printer> = {
  'groq-ast': createGroqPrinter(doc.builders),
}

const plugin: Plugin = {
  languages,
  parsers,
  printers,
}

export default plugin
export { languages, parsers, printers }
