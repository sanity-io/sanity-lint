import { SchemaRuleTester, createSchema } from '../../testing'
import { reservedFieldName } from '../reserved-field-name'

const tester = new SchemaRuleTester()

tester.run('reserved-field-name', reservedFieldName, {
  valid: [
    // Normal field names
    createSchema({
      name: 'post',
      type: 'document',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'body', type: 'text' },
        { name: 'author', type: 'reference' },
      ],
    }),

    // Field names with underscores in middle are fine
    createSchema({
      name: 'post',
      type: 'document',
      fields: [
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
      ],
    }),

    // No fields
    createSchema({ name: 'post', type: 'document', fields: [] }),
  ],

  invalid: [
    {
      name: '_id field (reserved)',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [{ name: '_id', type: 'string' }],
      }),
      errors: [{ ruleId: 'reserved-field-name', severity: 'error' }],
    },
    {
      name: '_type field (reserved)',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [{ name: '_type', type: 'string' }],
      }),
      errors: [{ ruleId: 'reserved-field-name', severity: 'error' }],
    },
    {
      name: '_rev field (reserved)',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [{ name: '_rev', type: 'string' }],
      }),
      errors: [{ ruleId: 'reserved-field-name', severity: 'error' }],
    },
    {
      name: '_customField (underscore prefix)',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [{ name: '_customField', type: 'string' }],
      }),
      errors: [{ ruleId: 'reserved-field-name', severity: 'error' }],
    },
    {
      name: '_key field (reserved)',
      schema: createSchema({
        name: 'item',
        type: 'object',
        fields: [{ name: '_key', type: 'string' }],
      }),
      errors: [{ ruleId: 'reserved-field-name', severity: 'error' }],
    },
    {
      name: 'multiple reserved fields',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [
          { name: '_id', type: 'string' },
          { name: '_metadata', type: 'object' },
        ],
      }),
      errors: [{ ruleId: 'reserved-field-name' }, { ruleId: 'reserved-field-name' }],
    },
  ],
})
