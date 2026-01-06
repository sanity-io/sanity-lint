import { SchemaRuleTester, createSchema } from '../../testing'
import { missingDescription } from '../missing-description'

const tester = new SchemaRuleTester()

tester.run('missing-description', missingDescription, {
  valid: [
    // All fields have descriptions
    createSchema({
      name: 'post',
      type: 'document',
      fields: [
        { name: 'title', type: 'string', description: 'The post title' },
        { name: 'body', type: 'text', description: 'The post body' },
      ],
    }),

    // Less than half fields missing descriptions (1 of 3)
    createSchema({
      name: 'post',
      type: 'document',
      fields: [
        { name: 'title', type: 'string', description: 'The post title' },
        { name: 'body', type: 'text', description: 'The post body' },
        { name: 'author', type: 'reference' }, // 1 of 3 missing = less than half
      ],
    }),

    // Hidden fields don't count
    createSchema({
      name: 'post',
      type: 'document',
      fields: [
        { name: 'title', type: 'string', description: 'The post title' },
        { name: 'internalField', type: 'string', hidden: true },
      ],
    }),

    // System fields are skipped
    createSchema({
      name: 'post',
      type: 'document',
      fields: [
        { name: '_id', type: 'string' },
        { name: '_type', type: 'string' },
        { name: 'title', type: 'string', description: 'The title' },
      ],
    }),

    // No fields
    createSchema({
      name: 'post',
      type: 'document',
      fields: [],
    }),
  ],

  invalid: [
    {
      name: 'all fields missing descriptions',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [
          { name: 'title', type: 'string' },
          { name: 'body', type: 'text' },
          { name: 'author', type: 'reference' },
        ],
      }),
      errors: [{ ruleId: 'missing-description', severity: 'info' }],
    },
    {
      name: 'more than half fields missing descriptions',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [
          { name: 'title', type: 'string', description: 'Title' },
          { name: 'body', type: 'text' },
          { name: 'author', type: 'reference' },
          { name: 'category', type: 'reference' },
        ],
      }),
      errors: [{ ruleId: 'missing-description', severity: 'info' }],
    },
  ],
})
