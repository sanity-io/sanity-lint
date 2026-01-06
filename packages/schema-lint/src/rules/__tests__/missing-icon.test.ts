import { SchemaRuleTester, createSchema } from '../../testing'
import { missingIcon } from '../missing-icon'

const tester = new SchemaRuleTester()

tester.run('missing-icon', missingIcon, {
  valid: [
    // Document with icon
    createSchema({ name: 'post', type: 'document', hasIcon: true }),

    // Object with icon
    createSchema({ name: 'seo', type: 'object', hasIcon: true }),

    // Non-document/object types don't need icons
    createSchema({ name: 'tags', type: 'array', hasIcon: false }),
    createSchema({ name: 'name', type: 'string', hasIcon: false }),
  ],

  invalid: [
    {
      name: 'document without icon',
      schema: createSchema({ name: 'post', type: 'document', hasIcon: false }),
      errors: [{ ruleId: 'missing-icon', severity: 'warning' }],
    },
    {
      name: 'object without icon',
      schema: createSchema({ name: 'seo', type: 'object', hasIcon: false }),
      errors: [{ ruleId: 'missing-icon', severity: 'warning' }],
    },
  ],
})
