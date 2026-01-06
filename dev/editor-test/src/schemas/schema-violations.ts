/**
 * Sample Sanity schemas that SHOULD trigger lint warnings/errors.
 * Use this to test that schema linting is working correctly.
 */

import { defineType, defineField } from 'sanity'

// Error: Missing icon and title
export const badDocumentType = defineType({
  name: 'badDocument',
  type: 'document',
  fields: [
    // Warning: Field name uses presentation-focused naming
    defineField({
      name: 'bigHeroText',
      type: 'string',
    }),
    // Warning: Field name uses presentation-focused naming
    defineField({
      name: 'redButton',
      type: 'string',
    }),
    // Warning: Slug without options.source
    defineField({
      name: 'slug',
      type: 'slug',
    }),
    // Warning: Title field without validation
    defineField({
      name: 'title',
      type: 'string',
    }),
    // Error: Reserved field name prefix
    defineField({
      name: '_customField',
      type: 'string',
    }),
    // Warning: Field storing heading levels
    defineField({
      name: 'headingLevel',
      type: 'string',
      options: {
        list: ['h1', 'h2', 'h3', 'h4'],
      },
    }),
  ],
})

// Error: Not using defineType - should be flagged
export const noDefineTypeSchema = {
  name: 'noDefineType',
  type: 'document',
  fields: [
    {
      name: 'title',
      type: 'string',
    },
  ],
}

// Test: Object type also needs icon
export const badObjectType = defineType({
  name: 'badObject',
  type: 'object',
  // Missing title and icon
  fields: [
    defineField({
      name: 'leftColumn',
      type: 'string',
    }),
    defineField({
      name: 'threeColumnRow',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
})

// Error: Using defineType but fields not wrapped in defineField
export const missingDefineFieldSchema = defineType({
  name: 'missingDefineField',
  type: 'document',
  title: 'Missing defineField Example',
  fields: [
    // These fields are NOT wrapped in defineField - should trigger error
    {
      name: 'title',
      type: 'string',
    },
    {
      name: 'description',
      type: 'text',
    },
  ],
})

// Info: Boolean field that could be a list (off by default)
// Enable with: 'sanity/schema-boolean-instead-of-list': 'warn'
export const booleanFieldSchema = defineType({
  name: 'booleanExample',
  type: 'document',
  title: 'Boolean Example',
  icon: () => null,
  fields: [
    defineField({
      name: 'isPublished',
      type: 'boolean',
      title: 'Is Published',
      description: 'Could be better as status: "draft" | "published" | "archived"',
    }),
    defineField({
      name: 'hasDiscount',
      type: 'boolean',
      title: 'Has Discount',
      description: 'Could be better as discountType: "none" | "percentage" | "fixed"',
    }),
  ],
})

// Info: Array without constraints (off by default)
// Enable with: 'sanity/schema-array-missing-constraints': 'warn'
export const arrayWithoutConstraints = defineType({
  name: 'arrayExample',
  type: 'document',
  title: 'Array Example',
  icon: () => null,
  fields: [
    defineField({
      name: 'tags',
      type: 'array',
      title: 'Tags',
      of: [{ type: 'string' }],
      // Missing: validation: (rule) => rule.min(1).max(10).unique()
    }),
    defineField({
      name: 'images',
      type: 'array',
      title: 'Images',
      of: [{ type: 'image' }],
      // Missing validation constraints
    }),
  ],
})

// Info: Missing descriptions (off by default)
// Enable with: 'sanity/schema-missing-description': 'warn'
export const missingDescriptions = defineType({
  name: 'noDescriptions',
  type: 'document',
  title: 'No Descriptions',
  icon: () => null,
  fields: [
    defineField({
      name: 'field1',
      type: 'string',
      title: 'Field 1',
      // No description - editors won't know what to enter
    }),
    defineField({
      name: 'field2',
      type: 'string',
      title: 'Field 2',
      // No description
    }),
    defineField({
      name: 'field3',
      type: 'string',
      title: 'Field 3',
      // No description
    }),
  ],
})

// Info: Unnecessary reference (off by default)
// Enable with: 'sanity/schema-unnecessary-reference': 'warn'
// References to non-shared content could be embedded objects instead
export const unnecessaryReferenceExample = defineType({
  name: 'pageWithSettings',
  type: 'document',
  title: 'Page with Settings',
  icon: () => null,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (rule) => rule.required(),
    }),
    // Info: Reference to type-specific settings - consider embedding
    defineField({
      name: 'seoConfig',
      type: 'reference',
      title: 'SEO Configuration',
      to: [{ type: 'seoSettings' }], // *Settings suggests non-shared content
    }),
    // Info: Reference to parent-specific type - consider embedding
    defineField({
      name: 'metadata',
      type: 'reference',
      title: 'Page Metadata',
      to: [{ type: 'pageMetadata' }], // Contains parent name "page"
    }),
    // OK: Reference to shared content type
    defineField({
      name: 'author',
      type: 'reference',
      title: 'Author',
      to: [{ type: 'author' }], // Shared content - no warning
    }),
  ],
})
