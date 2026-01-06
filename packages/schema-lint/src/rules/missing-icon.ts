import type { SchemaRule } from '../types'

/**
 * Rule: missing-icon
 *
 * Document and object types should have an icon for better Studio UX.
 */
export const missingIcon: SchemaRule = {
  id: 'missing-icon',
  name: 'Missing icon',
  description: 'Document and object types should have an icon',
  severity: 'warning',
  category: 'style',

  check(schema, context) {
    // Only applies to document and object types
    if (schema.type !== 'document' && schema.type !== 'object') {
      return
    }

    if (!schema.hasIcon) {
      context.report({
        message: `Schema type "${schema.name}" should have an icon`,
        severity: 'warning',
        ...(schema.span && { span: schema.span }),
        help: 'Add an icon from @sanity/icons: icon: DocumentIcon',
      })
    }
  },
}
