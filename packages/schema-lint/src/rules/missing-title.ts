import type { SchemaRule } from '../types'

/**
 * Rule: missing-title
 *
 * Schema types should have a human-readable title.
 */
export const missingTitle: SchemaRule = {
  id: 'missing-title',
  name: 'Missing title',
  description: 'Schema types should have a title property',
  severity: 'warning',
  category: 'style',

  check(schema, context) {
    // Only applies to document and object types
    if (schema.type !== 'document' && schema.type !== 'object') {
      return
    }

    if (!schema.title) {
      context.report({
        message: `Schema type "${schema.name}" should have a title property`,
        severity: 'warning',
        ...(schema.span && { span: schema.span }),
        help: 'Add a human-readable title: title: "Blog Post"',
      })
    }
  },
}
