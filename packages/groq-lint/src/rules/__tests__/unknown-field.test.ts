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
      slug: { type: 'objectAttribute', value: { type: 'string' } },
      publishedAt: { type: 'objectAttribute', value: { type: 'string' } },
    },
  },
  {
    type: 'document',
    name: 'author',
    attributes: {
      _id: { type: 'objectAttribute', value: { type: 'string' } },
      _type: { type: 'objectAttribute', value: { type: 'string', value: 'author' } },
      name: { type: 'objectAttribute', value: { type: 'string' } },
      bio: { type: 'objectAttribute', value: { type: 'string' } },
    },
  },
]

describe('unknown-field', () => {
  describe('valid', () => {
    it('accepts valid field in projection', () => {
      const result = lint('*[_type == "post"]{ title }', { schema: testSchema })
      const fieldErrors = result.findings.filter((f) => f.ruleId === 'unknown-field')
      expect(fieldErrors).toHaveLength(0)
    })

    it('accepts multiple valid fields', () => {
      const result = lint('*[_type == "post"]{ title, body, slug }', { schema: testSchema })
      const fieldErrors = result.findings.filter((f) => f.ruleId === 'unknown-field')
      expect(fieldErrors).toHaveLength(0)
    })

    it('accepts built-in fields', () => {
      const result = lint('*[_type == "post"]{ _id, _type, _createdAt, _updatedAt }', {
        schema: testSchema,
      })
      const fieldErrors = result.findings.filter((f) => f.ruleId === 'unknown-field')
      expect(fieldErrors).toHaveLength(0)
    })

    it('accepts valid fields for different document types', () => {
      const result = lint('*[_type == "author"]{ name, bio }', { schema: testSchema })
      const fieldErrors = result.findings.filter((f) => f.ruleId === 'unknown-field')
      expect(fieldErrors).toHaveLength(0)
    })

    it('skips when document type cannot be determined', () => {
      const result = lint('*[]{ unknownField }', { schema: testSchema })
      const fieldErrors = result.findings.filter((f) => f.ruleId === 'unknown-field')
      expect(fieldErrors).toHaveLength(0)
    })
  })

  describe('invalid', () => {
    it('detects typo in field name', () => {
      const result = lint('*[_type == "post"]{ titel }', { schema: testSchema })
      const fieldErrors = result.findings.filter((f) => f.ruleId === 'unknown-field')
      expect(fieldErrors).toHaveLength(1)
      expect(fieldErrors[0].message).toContain('titel')
      expect(fieldErrors[0].message).toContain('does not exist')
    })

    it('suggests similar fields for typos', () => {
      const result = lint('*[_type == "post"]{ titel }', { schema: testSchema })
      const fieldErrors = result.findings.filter((f) => f.ruleId === 'unknown-field')
      expect(fieldErrors).toHaveLength(1)
      expect(fieldErrors[0].help).toContain('title')
    })

    it('detects non-existent field', () => {
      const result = lint('*[_type == "post"]{ nonExistentField }', { schema: testSchema })
      const fieldErrors = result.findings.filter((f) => f.ruleId === 'unknown-field')
      expect(fieldErrors).toHaveLength(1)
      expect(fieldErrors[0].message).toContain('nonExistentField')
    })

    it('detects field from wrong document type', () => {
      // 'bio' exists on author but not on post
      const result = lint('*[_type == "post"]{ bio }', { schema: testSchema })
      const fieldErrors = result.findings.filter((f) => f.ruleId === 'unknown-field')
      expect(fieldErrors).toHaveLength(1)
      expect(fieldErrors[0].message).toContain('bio')
      expect(fieldErrors[0].message).toContain('post')
    })

    it('detects multiple unknown fields', () => {
      const result = lint('*[_type == "post"]{ titel, bdy }', { schema: testSchema })
      const fieldErrors = result.findings.filter((f) => f.ruleId === 'unknown-field')
      expect(fieldErrors).toHaveLength(2)
    })

    it('provides suggestions array', () => {
      const result = lint('*[_type == "post"]{ titel }', { schema: testSchema })
      const fieldErrors = result.findings.filter((f) => f.ruleId === 'unknown-field')
      expect(fieldErrors).toHaveLength(1)
      expect(fieldErrors[0].suggestions).toBeDefined()
      expect(fieldErrors[0].suggestions?.length).toBeGreaterThan(0)
      expect(fieldErrors[0].suggestions?.[0].replacement).toBe('title')
    })
  })

  describe('complex queries', () => {
    it('handles type in AND condition', () => {
      const result = lint('*[_type == "post" && publishedAt != null]{ titel }', {
        schema: testSchema,
      })
      const fieldErrors = result.findings.filter((f) => f.ruleId === 'unknown-field')
      expect(fieldErrors).toHaveLength(1)
      expect(fieldErrors[0].help).toContain('title')
    })

    it('handles reverse comparison', () => {
      const result = lint('*["post" == _type]{ titel }', { schema: testSchema })
      const fieldErrors = result.findings.filter((f) => f.ruleId === 'unknown-field')
      expect(fieldErrors).toHaveLength(1)
    })
  })

  describe('without schema', () => {
    it('does not run when no schema is provided', () => {
      const result = lint('*[_type == "post"]{ unknownField }')
      const fieldErrors = result.findings.filter((f) => f.ruleId === 'unknown-field')
      expect(fieldErrors).toHaveLength(0)
    })
  })
})
