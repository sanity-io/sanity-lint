import { SchemaRuleTester, createSchema } from '../../testing'
import { headingLevelInSchema } from '../heading-level-in-schema'

const tester = new SchemaRuleTester()

tester.run('heading-level-in-schema', headingLevelInSchema, {
  valid: [
    // Normal field names
    createSchema({
      name: 'section',
      type: 'object',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'string' },
      ],
    }),

    // String with list that doesn't contain heading levels
    createSchema({
      name: 'section',
      type: 'object',
      fields: [
        {
          name: 'style',
          type: 'string',
          options: { list: ['primary', 'secondary', 'tertiary'] },
        },
      ],
    }),

    // No fields
    createSchema({ name: 'block', type: 'object', fields: [] }),
  ],

  invalid: [
    {
      name: 'headingLevel field name',
      schema: createSchema({
        name: 'section',
        type: 'object',
        fields: [{ name: 'headingLevel', type: 'string' }],
      }),
      errors: [{ ruleId: 'heading-level-in-schema', severity: 'warning' }],
    },
    {
      name: 'headerLevel field name',
      schema: createSchema({
        name: 'section',
        type: 'object',
        fields: [{ name: 'headerLevel', type: 'string' }],
      }),
      errors: [{ ruleId: 'heading-level-in-schema', severity: 'warning' }],
    },
    {
      name: 'h1 field name',
      schema: createSchema({
        name: 'block',
        type: 'object',
        fields: [{ name: 'h1', type: 'string' }],
      }),
      errors: [{ ruleId: 'heading-level-in-schema', severity: 'warning' }],
    },
    {
      name: 'field with h1/h2/h3 list options',
      schema: createSchema({
        name: 'section',
        type: 'object',
        fields: [
          {
            name: 'level',
            type: 'string',
            options: { list: ['h1', 'h2', 'h3', 'h4'] },
          },
        ],
      }),
      errors: [{ ruleId: 'heading-level-in-schema', severity: 'warning' }],
    },
    {
      name: 'field with value objects containing heading levels',
      schema: createSchema({
        name: 'section',
        type: 'object',
        fields: [
          {
            name: 'size',
            type: 'string',
            options: {
              list: [{ value: 'h1' }, { value: 'h2' }, { value: 'h3' }],
            },
          },
        ],
      }),
      errors: [{ ruleId: 'heading-level-in-schema', severity: 'warning' }],
    },
    {
      name: 'headingLevel name AND h1/h2 options (both violations)',
      schema: createSchema({
        name: 'section',
        type: 'object',
        fields: [
          {
            name: 'headingLevel',
            type: 'string',
            options: { list: ['h1', 'h2', 'h3'] },
          },
        ],
      }),
      errors: [{ ruleId: 'heading-level-in-schema' }, { ruleId: 'heading-level-in-schema' }],
    },
  ],
})
