import type { SchemaRule } from '../types'

/**
 * Rule: array-missing-constraints
 *
 * Array fields should have constraints (min, max, unique) to prevent
 * unbounded data and ensure data quality.
 */
export const arrayMissingConstraints: SchemaRule = {
  id: 'array-missing-constraints',
  name: 'Array missing constraints',
  description: 'Array fields should have min/max/unique validation constraints',
  severity: 'info',
  category: 'style',

  check(schema, context) {
    if (!schema.fields) {
      return
    }

    for (const field of schema.fields) {
      if (field.type !== 'array') {
        continue
      }

      // Skip if field has validation (we trust it has constraints)
      if (field.hasValidation) {
        continue
      }

      context.report({
        message: `Array field "${field.name}" has no validation constraints`,
        severity: 'info',
        ...(field.span && { span: field.span }),
        help: 'Consider adding validation: (rule) => rule.min(1).max(10).unique() to prevent unbounded arrays',
      })
    }
  },
}
