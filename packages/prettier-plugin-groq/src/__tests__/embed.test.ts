import { describe, it, expect } from 'vitest'
import * as prettier from 'prettier'
import groqPlugin from '../index.js'
import embedPlugin from '../embed.js'

/**
 * Test embedded GROQ formatting in JavaScript/TypeScript files.
 */

async function formatJS(code: string): Promise<string> {
  const result = await prettier.format(code, {
    parser: 'babel',
    plugins: [groqPlugin, embedPlugin],
    printWidth: 60,
    semi: false,
    singleQuote: true,
  })
  return result.trim()
}

describe('embedded GROQ in JavaScript', () => {
  describe('tagged template literals', () => {
    it('formats groq tagged template literal', async () => {
      const input = `const query = groq\`*[_type=="post"]{title,body}\``
      const result = await formatJS(input)
      // Should contain formatted GROQ
      expect(result).toContain('groq')
      expect(result).toContain('`')
    })

    it('formats defineQuery tagged template literal', async () => {
      const input = `const query = defineQuery\`*[_type=="post"]{title}\``
      const result = await formatJS(input)
      expect(result).toContain('defineQuery')
    })
  })

  describe('function calls', () => {
    it('formats defineQuery with string literal', async () => {
      const input = `const query = defineQuery("*[_type==\\"post\\"]{title}")`
      const result = await formatJS(input)
      expect(result).toContain('defineQuery')
    })

    it('formats defineQuery with template literal', async () => {
      const input = `const query = defineQuery(\`*[_type=="post"]{title}\`)`
      const result = await formatJS(input)
      expect(result).toContain('defineQuery')
    })
  })

  describe('preserves code structure', () => {
    it('preserves imports and other code', async () => {
      const input = `
import { groq } from 'next-sanity'

const query = groq\`*[_type=="post"]{title}\`

export default query
`
      const result = await formatJS(input)
      expect(result).toContain("import { groq } from 'next-sanity'")
      expect(result).toContain('export default query')
    })
  })
})
