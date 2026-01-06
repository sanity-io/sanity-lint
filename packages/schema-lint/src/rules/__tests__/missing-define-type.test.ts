import { SchemaRuleTester, createSchema } from '../../testing'
import { missingDefineType } from '../missing-define-type'

const tester = new SchemaRuleTester()

tester.run('missing-define-type', missingDefineType, {
  valid: [
    // Document with defineType
    createSchema({ name: 'post', type: 'document', usesDefineType: true }),

    // Object with defineType
    createSchema({ name: 'seo', type: 'object', usesDefineType: true }),

    // Array type with defineType
    createSchema({ name: 'tags', type: 'array', usesDefineType: true }),
  ],

  invalid: [
    {
      name: 'document without defineType',
      schema: createSchema({ name: 'post', type: 'document', usesDefineType: false }),
      errors: [{ ruleId: 'missing-define-type', severity: 'error' }],
    },
    {
      name: 'object without defineType',
      schema: createSchema({ name: 'seo', type: 'object', usesDefineType: false }),
      errors: [{ ruleId: 'missing-define-type', severity: 'error' }],
    },
  ],
})
