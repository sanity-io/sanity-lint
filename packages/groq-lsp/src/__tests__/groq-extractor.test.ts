import { describe, it, expect } from 'vitest'
import { extractQueries, findQueryAtOffset, offsetToQueryPosition } from '../utils/groq-extractor'

describe('extractQueries', () => {
  describe('groq files', () => {
    it('should extract entire content as a query', () => {
      const content = '*[_type == "post"]'
      const result = extractQueries(content, 'groq')

      expect(result.queries).toHaveLength(1)
      expect(result.queries[0]?.query).toBe('*[_type == "post"]')
      expect(result.queries[0]?.start).toBe(0)
      expect(result.queries[0]?.line).toBe(0)
      expect(result.queries[0]?.column).toBe(0)
    })

    it('should handle whitespace', () => {
      const content = '  *[_type == "post"]  \n'
      const result = extractQueries(content, 'groq')

      expect(result.queries).toHaveLength(1)
      expect(result.queries[0]?.query).toBe('*[_type == "post"]')
    })

    it('should return empty for empty content', () => {
      const result = extractQueries('', 'groq')
      expect(result.queries).toHaveLength(0)
    })

    it('should return empty for whitespace-only content', () => {
      const result = extractQueries('   \n\n  ', 'groq')
      expect(result.queries).toHaveLength(0)
    })
  })

  describe('typescript files', () => {
    it('should extract groq template literals', () => {
      const content = `
const query = groq\`*[_type == "post"]\`
`
      const result = extractQueries(content, 'typescript')

      expect(result.queries).toHaveLength(1)
      expect(result.queries[0]?.query).toBe('*[_type == "post"]')
    })

    it('should extract multiple queries', () => {
      const content = `
const query1 = groq\`*[_type == "post"]\`
const query2 = groq\`*[_type == "author"]\`
`
      const result = extractQueries(content, 'typescript')

      expect(result.queries).toHaveLength(2)
      expect(result.queries[0]?.query).toBe('*[_type == "post"]')
      expect(result.queries[1]?.query).toBe('*[_type == "author"]')
    })

    it('should handle groq with space before backtick', () => {
      const content = `const query = groq \`*[_type == "post"]\``
      const result = extractQueries(content, 'typescript')

      expect(result.queries).toHaveLength(1)
      expect(result.queries[0]?.query).toBe('*[_type == "post"]')
    })

    it('should calculate line and column positions', () => {
      const content = `const foo = 1
const query = groq\`*[_type == "post"]\``
      const result = extractQueries(content, 'typescript')

      expect(result.queries).toHaveLength(1)
      expect(result.queries[0]?.line).toBe(1) // 0-indexed, second line
    })

    it('should return empty for file without groq', () => {
      const content = `const query = "not groq"`
      const result = extractQueries(content, 'typescript')

      expect(result.queries).toHaveLength(0)
    })
  })

  describe('typescriptreact files', () => {
    it('should extract queries from tsx files', () => {
      const content = `
import { groq } from 'next-sanity'

const query = groq\`*[_type == "post"]\`

export default function Page() {
  return <div />
}
`
      const result = extractQueries(content, 'typescriptreact')

      expect(result.queries).toHaveLength(1)
      expect(result.queries[0]?.query).toBe('*[_type == "post"]')
    })
  })

  describe('javascript files', () => {
    it('should extract queries from js files', () => {
      const content = `const query = groq\`*[_type == "post"]\``
      const result = extractQueries(content, 'javascript')

      expect(result.queries).toHaveLength(1)
    })
  })

  describe('unknown language', () => {
    it('should return empty for unknown languages', () => {
      const content = '*[_type == "post"]'
      const result = extractQueries(content, 'python')

      expect(result.queries).toHaveLength(0)
    })
  })
})

describe('findQueryAtOffset', () => {
  const queries = [
    { query: '*[_type == "post"]', start: 10, end: 28, line: 0, column: 10 },
    { query: '*[_type == "author"]', start: 50, end: 70, line: 2, column: 10 },
  ]

  it('should find query containing offset', () => {
    const result = findQueryAtOffset(queries, 15)
    expect(result).toBe(queries[0])
  })

  it('should find query at exact start', () => {
    const result = findQueryAtOffset(queries, 10)
    expect(result).toBe(queries[0])
  })

  it('should find query at exact end', () => {
    const result = findQueryAtOffset(queries, 28)
    expect(result).toBe(queries[0])
  })

  it('should return undefined for offset between queries', () => {
    const result = findQueryAtOffset(queries, 35)
    expect(result).toBeUndefined()
  })

  it('should return undefined for offset before first query', () => {
    const result = findQueryAtOffset(queries, 5)
    expect(result).toBeUndefined()
  })

  it('should return undefined for offset after last query', () => {
    const result = findQueryAtOffset(queries, 100)
    expect(result).toBeUndefined()
  })

  it('should find second query', () => {
    const result = findQueryAtOffset(queries, 60)
    expect(result).toBe(queries[1])
  })
})

describe('offsetToQueryPosition', () => {
  const query = { query: '*[_type == "post"]', start: 20, end: 38, line: 1, column: 5 }

  it('should convert document offset to query position', () => {
    const result = offsetToQueryPosition(query, 25)
    expect(result).toBe(5)
  })

  it('should return 0 for query start', () => {
    const result = offsetToQueryPosition(query, 20)
    expect(result).toBe(0)
  })

  it('should return query length for query end', () => {
    const result = offsetToQueryPosition(query, 38)
    expect(result).toBe(18)
  })
})
