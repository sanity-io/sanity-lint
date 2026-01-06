import { SchemaRuleTester, createSchema } from '../../testing'
import { arrayMissingConstraints } from '../array-missing-constraints'

const tester = new SchemaRuleTester()

tester.run('array-missing-constraints', arrayMissingConstraints, {
  valid: [
    // Array with validation
    createSchema({
      name: 'post',
      type: 'document',
      fields: [{ name: 'tags', type: 'array', hasValidation: true }],
    }),

    // Non-array fields
    createSchema({
      name: 'post',
      type: 'document',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'body', type: 'text' },
      ],
    }),

    // No fields
    createSchema({ name: 'post', type: 'document', fields: [] }),
  ],

  invalid: [
    {
      name: 'array without validation',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [{ name: 'tags', type: 'array', hasValidation: false }],
      }),
      errors: [{ ruleId: 'array-missing-constraints', severity: 'info' }],
    },
    {
      name: 'images array without validation',
      schema: createSchema({
        name: 'gallery',
        type: 'document',
        fields: [{ name: 'images', type: 'array', hasValidation: false }],
      }),
      errors: [{ ruleId: 'array-missing-constraints', severity: 'info' }],
    },
    {
      name: 'multiple arrays without validation',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [
          { name: 'tags', type: 'array', hasValidation: false },
          { name: 'categories', type: 'array', hasValidation: false },
          { name: 'images', type: 'array', hasValidation: false },
        ],
      }),
      errors: [
        { ruleId: 'array-missing-constraints' },
        { ruleId: 'array-missing-constraints' },
        { ruleId: 'array-missing-constraints' },
      ],
    },
  ],
})
