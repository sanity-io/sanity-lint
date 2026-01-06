import type { Rule as ESLintRule } from 'eslint'
import type { TSESTree } from '@typescript-eslint/types'
import type { Rule as GroqRule } from '@sanity/groq-lint'
import { lint, rules as allGroqRules } from '@sanity/groq-lint'
import { isGroqTaggedTemplate, extractGroqString } from './groq-extractor'

/**
 * Build a config that enables only the specified rule
 */
function buildSingleRuleConfig(ruleId: string): Record<string, boolean> {
  const config: Record<string, boolean> = {}
  for (const rule of allGroqRules) {
    config[rule.id] = rule.id === ruleId
  }
  return config
}

/**
 * Create an ESLint rule from a GROQ lint rule.
 */
export function createESLintRule(groqRule: GroqRule): ESLintRule.RuleModule {
  return {
    meta: {
      type: groqRule.category === 'correctness' ? 'problem' : 'suggestion',
      docs: {
        description: groqRule.description,
        recommended: groqRule.severity === 'error',
      },
      messages: {
        [groqRule.id]: '{{ message }}',
      },
      schema: [], // No options for now
    },

    create(context) {
      return {
        TaggedTemplateExpression(eslintNode: ESLintRule.Node) {
          // Cast to our TSESTree type for type-safe property access
          const node = eslintNode as unknown as TSESTree.TaggedTemplateExpression
          if (!isGroqTaggedTemplate(node)) {
            return
          }

          try {
            const query = extractGroqString(node)
            const result = lint(query, { rules: buildSingleRuleConfig(groqRule.id) })

            for (const finding of result.findings) {
              if (finding.ruleId === groqRule.id) {
                context.report({
                  node: eslintNode,
                  messageId: groqRule.id,
                  data: {
                    message: finding.help ? `${finding.message} ${finding.help}` : finding.message,
                  },
                })
              }
            }
          } catch {
            // Parse error - don't report, let the user see it in runtime
          }
        },
      }
    },
  }
}

/**
 * Create all ESLint rules from GROQ lint rules.
 */
export function createAllRules(groqRules: GroqRule[]): Record<string, ESLintRule.RuleModule> {
  const eslintRules: Record<string, ESLintRule.RuleModule> = {}

  for (const rule of groqRules) {
    // Convert rule ID from snake_case to kebab-case for ESLint convention
    const eslintRuleId = `groq-${rule.id}`
    eslintRules[eslintRuleId] = createESLintRule(rule)
  }

  return eslintRules
}
