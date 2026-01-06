import { SchemaRuleTester, createSchema } from '../../testing'
import { booleanInsteadOfList } from '../boolean-instead-of-list'

const tester = new SchemaRuleTester()

tester.run('boolean-instead-of-list', booleanInsteadOfList, {
  valid: [
    // Non-boolean fields
    createSchema({
      name: 'post',
      type: 'document',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'status', type: 'string' },
      ],
    }),

    // Boolean with non-expandable name
    createSchema({
      name: 'post',
      type: 'document',
      fields: [{ name: 'featured', type: 'boolean' }],
    }),

    // No fields
    createSchema({ name: 'post', type: 'document', fields: [] }),
  ],

  invalid: [
    {
      name: 'isPublished boolean',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [{ name: 'isPublished', type: 'boolean' }],
      }),
      errors: [{ ruleId: 'boolean-instead-of-list', severity: 'info' }],
    },
    {
      name: 'hasDiscount boolean',
      schema: createSchema({
        name: 'product',
        type: 'document',
        fields: [{ name: 'hasDiscount', type: 'boolean' }],
      }),
      errors: [{ ruleId: 'boolean-instead-of-list', severity: 'info' }],
    },
    {
      name: 'showBanner boolean',
      schema: createSchema({
        name: 'page',
        type: 'document',
        fields: [{ name: 'showBanner', type: 'boolean' }],
      }),
      errors: [{ ruleId: 'boolean-instead-of-list', severity: 'info' }],
    },
    {
      name: 'enableComments boolean',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [{ name: 'enableComments', type: 'boolean' }],
      }),
      errors: [{ ruleId: 'boolean-instead-of-list', severity: 'info' }],
    },
    {
      name: 'publicationStatus field',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [{ name: 'publicationStatus', type: 'boolean' }],
      }),
      errors: [{ ruleId: 'boolean-instead-of-list', severity: 'info' }],
    },
  ],
})
