import type { SchemaRule } from '../types'

/**
 * Patterns that suggest a type is shared/reusable content
 * (should NOT trigger the rule)
 */
const SHARED_TYPE_PATTERNS = [
  /^author$/i,
  /^category$/i,
  /^tag$/i,
  /^user$/i,
  /^person$/i,
  /^organization$/i,
  /^company$/i,
  /^brand$/i,
  /^product$/i,
  /^page$/i,
  /^post$/i,
  /^article$/i,
  /^media$/i,
  /^asset$/i,
  /^file$/i,
  /^image$/i,
  /^video$/i,
  /^document$/i,
  /^location$/i,
  /^venue$/i,
  /^event$/i,
]

/**
 * Suffixes that suggest non-shared, schema-specific content
 * (SHOULD trigger the rule)
 */
const NON_SHARED_SUFFIXES = [
  'Settings',
  'Config',
  'Configuration',
  'Options',
  'Metadata',
  'Data',
  'Info',
  'Details',
  'Content',
  'Block',
  'Section',
  'Item',
  'Entry',
]

function isLikelySharedType(typeName: string): boolean {
  return SHARED_TYPE_PATTERNS.some((pattern) => pattern.test(typeName))
}

function hasNonSharedSuffix(typeName: string): boolean {
  return NON_SHARED_SUFFIXES.some(
    (suffix) => typeName.endsWith(suffix) && typeName.length > suffix.length
  )
}

function isTypeSpecificToParent(parentName: string, referencedType: string): boolean {
  // Check if referenced type name contains parent name
  // e.g., "post" parent with "postAuthor" reference
  const parentLower = parentName.toLowerCase()
  const refLower = referencedType.toLowerCase()

  return refLower.startsWith(parentLower) && refLower !== parentLower
}

/**
 * Rule: unnecessary-reference
 *
 * Warns about reference fields that might be better as embedded objects.
 * References are great for shared content, but embedded objects are simpler
 * for content that's specific to a single document type.
 */
export const unnecessaryReference: SchemaRule = {
  id: 'unnecessary-reference',
  name: 'Unnecessary reference',
  description: 'Consider using an embedded object instead of a reference for non-shared content',
  severity: 'info',
  category: 'style',

  check(schema, context) {
    if (!schema.fields) {
      return
    }

    for (const field of schema.fields) {
      if (field.type !== 'reference') {
        continue
      }

      // Check each referenced type
      if (!field.to || field.to.length === 0) {
        continue
      }

      for (const ref of field.to) {
        const refType = ref.type

        // Skip if it's clearly a shared type
        if (isLikelySharedType(refType)) {
          continue
        }

        // Check if the referenced type seems specific to this schema
        if (isTypeSpecificToParent(schema.name, refType)) {
          context.report({
            message: `Reference to "${refType}" may be unnecessary`,
            severity: 'info',
            ...(field.span && { span: field.span }),
            help: `"${refType}" appears specific to "${schema.name}". Consider embedding the object directly instead of using a reference.`,
          })
          continue
        }

        // Check for non-shared naming patterns
        if (hasNonSharedSuffix(refType)) {
          context.report({
            message: `Reference to "${refType}" may be unnecessary`,
            severity: 'info',
            ...(field.span && { span: field.span }),
            help: `Types ending in "Settings", "Config", etc. are often better as embedded objects unless shared across multiple documents.`,
          })
        }
      }
    }
  },
}
