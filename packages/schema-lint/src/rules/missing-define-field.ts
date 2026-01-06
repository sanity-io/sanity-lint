import type { SchemaRule } from '../types'

/**
 * Rule: missing-define-field
 *
 * Fields should be wrapped with defineField() for proper type inference.
 */
export const missingDefineField: SchemaRule = {
  id: 'missing-define-field',
  name: 'Missing defineField()',
  description: 'Fields should use defineField() wrapper',
  severity: 'error',
  category: 'correctness',

  check(schema, context) {
    // Only check if schema uses defineType (otherwise it's already broken)
    if (!schema.usesDefineType) {
      return
    }

    if (schema.usesDefineField === false && schema.fields && schema.fields.length > 0) {
      context.report({
        message: `Schema type "${schema.name}" has fields not wrapped with defineField()`,
        severity: 'error',
        ...(schema.span && { span: schema.span }),
        help: 'Import defineField from "sanity" and wrap each field: defineField({ name: "...", type: "..." })',
      })
    }
  },
}
