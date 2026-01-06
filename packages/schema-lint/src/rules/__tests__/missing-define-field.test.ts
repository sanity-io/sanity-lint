import { SchemaRuleTester, createSchema } from '../../testing'
import { missingDefineField } from '../missing-define-field'

const tester = new SchemaRuleTester()

tester.run('missing-define-field', missingDefineField, {
  valid: [
    // Schema with defineType and defineField
    createSchema({
      name: 'post',
      type: 'document',
      usesDefineType: true,
      usesDefineField: true,
      fields: [{ name: 'title', type: 'string' }],
    }),

    // Schema without fields (no fields to check)
    createSchema({
      name: 'post',
      type: 'document',
      usesDefineType: true,
      fields: [],
    }),

    // Schema without defineType (skip check - different rule handles this)
    createSchema({
      name: 'post',
      type: 'document',
      usesDefineType: false,
      usesDefineField: false,
      fields: [{ name: 'title', type: 'string' }],
    }),
  ],

  invalid: [
    {
      name: 'has defineType but fields not using defineField',
      schema: createSchema({
        name: 'post',
        type: 'document',
        usesDefineType: true,
        usesDefineField: false,
        fields: [
          { name: 'title', type: 'string' },
          { name: 'body', type: 'text' },
        ],
      }),
      errors: [{ ruleId: 'missing-define-field', severity: 'error' }],
    },
  ],
})
