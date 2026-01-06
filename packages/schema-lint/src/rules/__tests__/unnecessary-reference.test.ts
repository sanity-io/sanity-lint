import { SchemaRuleTester, createSchema } from '../../testing'
import { unnecessaryReference } from '../unnecessary-reference'

const tester = new SchemaRuleTester()

tester.run('unnecessary-reference', unnecessaryReference, {
  valid: [
    // Reference to shared type (author)
    createSchema({
      name: 'post',
      type: 'document',
      fields: [
        {
          name: 'author',
          type: 'reference',
          to: [{ type: 'author' }],
        },
      ],
    }),

    // Reference to shared type (category)
    createSchema({
      name: 'post',
      type: 'document',
      fields: [
        {
          name: 'category',
          type: 'reference',
          to: [{ type: 'category' }],
        },
      ],
    }),

    // Reference to shared type (tag)
    createSchema({
      name: 'article',
      type: 'document',
      fields: [
        {
          name: 'tags',
          type: 'array',
          of: [{ name: 'tag', type: 'reference', to: [{ type: 'tag' }] }],
        },
      ],
    }),

    // Reference to shared type (product)
    createSchema({
      name: 'order',
      type: 'document',
      fields: [
        {
          name: 'product',
          type: 'reference',
          to: [{ type: 'product' }],
        },
      ],
    }),

    // Non-reference fields
    createSchema({
      name: 'post',
      type: 'document',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'body', type: 'text' },
      ],
    }),

    // Reference with no 'to' array
    createSchema({
      name: 'post',
      type: 'document',
      fields: [
        {
          name: 'ref',
          type: 'reference',
          to: [],
        },
      ],
    }),

    // No fields
    createSchema({ name: 'post', type: 'document', fields: [] }),
  ],

  invalid: [
    {
      name: 'reference to parent-specific type (postAuthor)',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [
          {
            name: 'author',
            type: 'reference',
            to: [{ type: 'postAuthor' }],
          },
        ],
      }),
      errors: [{ ruleId: 'unnecessary-reference', severity: 'info' }],
    },
    {
      name: 'reference to parent-specific type (articleSettings)',
      schema: createSchema({
        name: 'article',
        type: 'document',
        fields: [
          {
            name: 'settings',
            type: 'reference',
            to: [{ type: 'articleSettings' }],
          },
        ],
      }),
      errors: [{ ruleId: 'unnecessary-reference', severity: 'info' }],
    },
    {
      name: 'reference to Settings type',
      schema: createSchema({
        name: 'page',
        type: 'document',
        fields: [
          {
            name: 'seo',
            type: 'reference',
            to: [{ type: 'seoSettings' }],
          },
        ],
      }),
      errors: [{ ruleId: 'unnecessary-reference', severity: 'info' }],
    },
    {
      name: 'reference to Config type',
      schema: createSchema({
        name: 'site',
        type: 'document',
        fields: [
          {
            name: 'theme',
            type: 'reference',
            to: [{ type: 'themeConfig' }],
          },
        ],
      }),
      errors: [{ ruleId: 'unnecessary-reference', severity: 'info' }],
    },
    {
      name: 'reference to Metadata type',
      schema: createSchema({
        name: 'page',
        type: 'document',
        fields: [
          {
            name: 'meta',
            type: 'reference',
            to: [{ type: 'pageMetadata' }],
          },
        ],
      }),
      // Two violations: parent-specific AND non-shared suffix
      errors: [{ ruleId: 'unnecessary-reference', severity: 'info' }],
    },
    {
      name: 'reference to Content type',
      schema: createSchema({
        name: 'landing',
        type: 'document',
        fields: [
          {
            name: 'hero',
            type: 'reference',
            to: [{ type: 'heroContent' }],
          },
        ],
      }),
      errors: [{ ruleId: 'unnecessary-reference', severity: 'info' }],
    },
    {
      name: 'reference to Block type',
      schema: createSchema({
        name: 'page',
        type: 'document',
        fields: [
          {
            name: 'banner',
            type: 'reference',
            to: [{ type: 'bannerBlock' }],
          },
        ],
      }),
      errors: [{ ruleId: 'unnecessary-reference', severity: 'info' }],
    },
    {
      name: 'multiple references to non-shared types',
      schema: createSchema({
        name: 'page',
        type: 'document',
        fields: [
          {
            name: 'header',
            type: 'reference',
            to: [{ type: 'headerSettings' }],
          },
          {
            name: 'footer',
            type: 'reference',
            to: [{ type: 'footerConfig' }],
          },
        ],
      }),
      errors: [{ ruleId: 'unnecessary-reference' }, { ruleId: 'unnecessary-reference' }],
    },
  ],
})
