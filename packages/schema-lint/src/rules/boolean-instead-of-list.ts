import type { SchemaRule } from '../types'

/**
 * Common boolean field patterns that might benefit from being a list
 */
const EXPANDABLE_BOOLEAN_PATTERNS = [
  /^is[A-Z]/, // isActive, isPublished
  /^has[A-Z]/, // hasFeatured, hasDiscount
  /^show[A-Z]/, // showBanner, showSidebar
  /^enable[A-Z]/, // enableComments, enableSharing
  /^allow[A-Z]/, // allowComments, allowGuests
  /Status$/, // publicationStatus, reviewStatus
  /State$/, // publishState, approvalState
  /Mode$/, // displayMode, editMode
]

/**
 * Rule: boolean-instead-of-list
 *
 * Some boolean fields might be better represented as a string field
 * with options.list for future expandability.
 */
export const booleanInsteadOfList: SchemaRule = {
  id: 'boolean-instead-of-list',
  name: 'Boolean instead of list',
  description: 'Consider using options.list instead of boolean for expandable states',
  severity: 'info',
  category: 'style',

  check(schema, context) {
    if (!schema.fields) {
      return
    }

    for (const field of schema.fields) {
      if (field.type !== 'boolean') {
        continue
      }

      const name = field.name

      for (const pattern of EXPANDABLE_BOOLEAN_PATTERNS) {
        if (pattern.test(name)) {
          context.report({
            message: `Boolean field "${name}" might be better as a string with options.list`,
            severity: 'info',
            ...(field.span && { span: field.span }),
            help: 'Consider using type: "string" with options: { list: [...], layout: "radio" } for future expandability',
          })
          break
        }
      }
    }
  },
}
