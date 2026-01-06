import { SchemaRuleTester, createSchema } from '../../testing'
import { missingRequiredValidation } from '../missing-required-validation'

const tester = new SchemaRuleTester()

tester.run('missing-required-validation', missingRequiredValidation, {
  valid: [
    // Title with validation
    createSchema({
      name: 'post',
      type: 'document',
      fields: [{ name: 'title', type: 'string', hasValidation: true }],
    }),

    // Slug with validation
    createSchema({
      name: 'post',
      type: 'document',
      fields: [{ name: 'slug', type: 'slug', hasValidation: true }],
    }),

    // Non-critical field without validation is fine
    createSchema({
      name: 'post',
      type: 'document',
      fields: [{ name: 'description', type: 'text', hasValidation: false }],
    }),

    // Object types don't need validation on critical fields
    createSchema({
      name: 'seo',
      type: 'object',
      fields: [{ name: 'title', type: 'string', hasValidation: false }],
    }),

    // No fields
    createSchema({ name: 'post', type: 'document', fields: [] }),
  ],

  invalid: [
    {
      name: 'title without validation',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [{ name: 'title', type: 'string', hasValidation: false }],
      }),
      errors: [{ ruleId: 'missing-required-validation', severity: 'warning' }],
    },
    {
      name: 'slug without validation',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [{ name: 'slug', type: 'slug', hasValidation: false }],
      }),
      errors: [{ ruleId: 'missing-required-validation', severity: 'warning' }],
    },
    {
      name: 'name without validation',
      schema: createSchema({
        name: 'author',
        type: 'document',
        fields: [{ name: 'name', type: 'string', hasValidation: false }],
      }),
      errors: [{ ruleId: 'missing-required-validation', severity: 'warning' }],
    },
    {
      name: 'email without validation',
      schema: createSchema({
        name: 'contact',
        type: 'document',
        fields: [{ name: 'email', type: 'string', hasValidation: false }],
      }),
      errors: [{ ruleId: 'missing-required-validation', severity: 'warning' }],
    },
    {
      name: 'multiple critical fields without validation',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [
          { name: 'title', type: 'string', hasValidation: false },
          { name: 'slug', type: 'slug', hasValidation: false },
        ],
      }),
      errors: [
        { ruleId: 'missing-required-validation' },
        { ruleId: 'missing-required-validation' },
      ],
    },
  ],
})
