import { SchemaRuleTester, createSchema } from '../../testing'
import { missingTitle } from '../missing-title'

const tester = new SchemaRuleTester()

tester.run('missing-title', missingTitle, {
  valid: [
    // Document with title
    createSchema({ name: 'post', type: 'document', title: 'Blog Post' }),

    // Object with title
    createSchema({ name: 'seo', type: 'object', title: 'SEO Settings' }),

    // Non-document/object types don't need titles
    createSchema({ name: 'tags', type: 'array', title: undefined }),
    createSchema({ name: 'name', type: 'string' }),
  ],

  invalid: [
    {
      name: 'document without title',
      schema: createSchema({ name: 'post', type: 'document', title: undefined }),
      errors: [{ ruleId: 'missing-title', severity: 'warning' }],
    },
    {
      name: 'object without title',
      schema: createSchema({ name: 'seo', type: 'object', title: undefined }),
      errors: [{ ruleId: 'missing-title', severity: 'warning' }],
    },
  ],
})
