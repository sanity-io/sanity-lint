import type { SchemaRule } from '../types'

/**
 * Rule: missing-define-type
 *
 * Schema types should be wrapped with defineType() for proper type inference
 * and Studio integration.
 */
export const missingDefineType: SchemaRule = {
  id: 'missing-define-type',
  name: 'Missing defineType()',
  description: 'Schema types should use defineType() wrapper',
  severity: 'error',
  category: 'correctness',

  check(schema, context) {
    if (!schema.usesDefineType) {
      context.report({
        message: `Schema type "${schema.name}" should be wrapped with defineType()`,
        severity: 'error',
        ...(schema.span && { span: schema.span }),
        help: 'Import defineType from "sanity" and wrap your schema: export const myType = defineType({ ... })',
      })
    }
  },
}
