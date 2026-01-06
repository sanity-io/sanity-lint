import { describe, it, expect } from 'vitest'
import type { SchemaType } from 'groq-js'
import { lint } from '../../linter'

/**
 * Test schema with common document types
 */
const testSchema: SchemaType = [
  {
    type: 'document',
    name: 'post',
    attributes: {
      _id: { type: 'objectAttribute', value: { type: 'string' } },
      _type: { type: 'objectAttribute', value: { type: 'string', value: 'post' } },
      title: { type: 'objectAttribute', value: { type: 'string' } },
      body: { type: 'objectAttribute', value: { type: 'string' } },
    },
  },
  {
    type: 'document',
    name: 'author',
    attributes: {
      _id: { type: 'objectAttribute', value: { type: 'string' } },
      _type: { type: 'objectAttribute', value: { type: 'string', value: 'author' } },
      name: { type: 'objectAttribute', value: { type: 'string' } },
    },
  },
  {
    type: 'document',
    name: 'category',
    attributes: {
      _id: { type: 'objectAttribute', value: { type: 'string' } },
      _type: { type: 'objectAttribute', value: { type: 'string', value: 'category' } },
      title: { type: 'objectAttribute', value: { type: 'string' } },
    },
  },
]

describe('invalid-type-filter', () => {
  describe('valid', () => {
    it('accepts valid document type', () => {
      const result = lint('*[_type == "post"]', { schema: testSchema })
      const typeErrors = result.findings.filter((f) => f.ruleId === 'invalid-type-filter')
      expect(typeErrors).toHaveLength(0)
    })

    it('accepts another valid document type', () => {
      const result = lint('*[_type == "author"]', { schema: testSchema })
      const typeErrors = result.findings.filter((f) => f.ruleId === 'invalid-type-filter')
      expect(typeErrors).toHaveLength(0)
    })

    it('accepts valid type with other conditions', () => {
      const result = lint('*[_type == "post" && title == "Hello"]', { schema: testSchema })
      const typeErrors = result.findings.filter((f) => f.ruleId === 'invalid-type-filter')
      expect(typeErrors).toHaveLength(0)
    })

    it('accepts reverse comparison order', () => {
      const result = lint('*["post" == _type]', { schema: testSchema })
      const typeErrors = result.findings.filter((f) => f.ruleId === 'invalid-type-filter')
      expect(typeErrors).toHaveLength(0)
    })
  })

  describe('invalid', () => {
    it('detects typo in document type', () => {
      const result = lint('*[_type == "psot"]', { schema: testSchema })
      const typeErrors = result.findings.filter((f) => f.ruleId === 'invalid-type-filter')
      expect(typeErrors).toHaveLength(1)
      expect(typeErrors[0].message).toContain('psot')
      expect(typeErrors[0].message).toContain('does not exist')
    })

    it('suggests similar types for typos', () => {
      const result = lint('*[_type == "psot"]', { schema: testSchema })
      const typeErrors = result.findings.filter((f) => f.ruleId === 'invalid-type-filter')
      expect(typeErrors).toHaveLength(1)
      expect(typeErrors[0].help).toContain('post')
    })

    it('detects non-existent type', () => {
      const result = lint('*[_type == "article"]', { schema: testSchema })
      const typeErrors = result.findings.filter((f) => f.ruleId === 'invalid-type-filter')
      expect(typeErrors).toHaveLength(1)
      expect(typeErrors[0].message).toContain('article')
    })

    it('detects typo in reverse comparison', () => {
      const result = lint('*["athor" == _type]', { schema: testSchema })
      const typeErrors = result.findings.filter((f) => f.ruleId === 'invalid-type-filter')
      expect(typeErrors).toHaveLength(1)
      expect(typeErrors[0].help).toContain('author')
    })

    it('provides suggestions array', () => {
      const result = lint('*[_type == "psot"]', { schema: testSchema })
      const typeErrors = result.findings.filter((f) => f.ruleId === 'invalid-type-filter')
      expect(typeErrors).toHaveLength(1)
      expect(typeErrors[0].suggestions).toBeDefined()
      expect(typeErrors[0].suggestions?.length).toBeGreaterThan(0)
      expect(typeErrors[0].suggestions?.[0].replacement).toBe('post')
    })
  })

  describe('without schema', () => {
    it('does not run when no schema is provided', () => {
      const result = lint('*[_type == "nonexistent"]')
      const typeErrors = result.findings.filter((f) => f.ruleId === 'invalid-type-filter')
      expect(typeErrors).toHaveLength(0)
    })
  })
})
