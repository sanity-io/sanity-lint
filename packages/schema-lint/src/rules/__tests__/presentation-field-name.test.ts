import { SchemaRuleTester, createSchema } from '../../testing'
import { presentationFieldName } from '../presentation-field-name'

const tester = new SchemaRuleTester()

tester.run('presentation-field-name', presentationFieldName, {
  valid: [
    // Semantic field names
    createSchema({
      name: 'post',
      type: 'document',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'headline', type: 'string' },
        { name: 'callToAction', type: 'string' },
        { name: 'featuredContent', type: 'array' },
        { name: 'primaryContent', type: 'text' },
      ],
    }),

    // No fields
    createSchema({ name: 'post', type: 'document', fields: [] }),
  ],

  invalid: [
    {
      name: 'color-based name: bigHeroText',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [{ name: 'bigHeroText', type: 'string' }],
      }),
      errors: [{ ruleId: 'presentation-field-name', severity: 'warning' }],
    },
    {
      name: 'color-based name: redButton',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [{ name: 'redButton', type: 'string' }],
      }),
      errors: [{ ruleId: 'presentation-field-name', severity: 'warning' }],
    },
    {
      name: 'layout-based name: leftColumn',
      schema: createSchema({
        name: 'post',
        type: 'document',
        fields: [{ name: 'leftColumn', type: 'string' }],
      }),
      errors: [{ ruleId: 'presentation-field-name', severity: 'warning' }],
    },
    {
      name: 'column-based name: threeColumnRow',
      schema: createSchema({
        name: 'page',
        type: 'document',
        fields: [{ name: 'threeColumnRow', type: 'array' }],
      }),
      errors: [{ ruleId: 'presentation-field-name', severity: 'warning' }],
    },
    {
      name: 'size-based name: smallText',
      schema: createSchema({
        name: 'page',
        type: 'document',
        fields: [{ name: 'smallText', type: 'string' }],
      }),
      errors: [{ ruleId: 'presentation-field-name', severity: 'warning' }],
    },
    {
      name: 'component name: heroSection',
      schema: createSchema({
        name: 'page',
        type: 'document',
        fields: [{ name: 'heroSection', type: 'object' }],
      }),
      errors: [{ ruleId: 'presentation-field-name', severity: 'warning' }],
    },
    {
      name: 'multiple presentation names',
      schema: createSchema({
        name: 'page',
        type: 'document',
        fields: [
          { name: 'bigHeader', type: 'string' },
          { name: 'rightSidebar', type: 'object' },
        ],
      }),
      errors: [{ ruleId: 'presentation-field-name' }, { ruleId: 'presentation-field-name' }],
    },
  ],
})
