import { parse, type SchemaType } from 'groq-js'
import type { Finding, Rule, RuleContext, LinterConfig } from '@sanity/lint-core'
import { rules as allRules } from './rules'

/**
 * Result of linting a query
 */
export interface LintResult {
  /** The query that was linted */
  query: string
  /** Findings from the lint rules */
  findings: Finding[]
  /** Whether parsing failed */
  parseError?: string
}

/**
 * Options for linting
 */
export interface LintOptions {
  /** Linter configuration */
  config?: LinterConfig
  /** Schema for schema-aware rules */
  schema?: SchemaType
}

/**
 * Lint a GROQ query
 *
 * @param query - The GROQ query string to lint
 * @param options - Optional configuration and schema
 * @returns Lint result with findings
 */
export function lint(query: string, options?: LintOptions): LintResult {
  const { config, schema } = options ?? {}
  const findings: Finding[] = []

  // Handle empty query
  if (!query.trim()) {
    return { query, findings }
  }

  // Parse the query
  let ast
  try {
    ast = parse(query)
  } catch (error) {
    return {
      query,
      findings,
      parseError: error instanceof Error ? error.message : 'Unknown parse error',
    }
  }

  // Get enabled rules, filtering out schema-requiring rules if no schema provided
  const enabledRules = getEnabledRules(config, schema)

  // Track which rules have fired (for supersedes logic)
  const firedRules = new Set<string>()
  const allFindings: Finding[] = []

  // Run each rule
  for (const rule of enabledRules) {
    const ruleFindings: Finding[] = []

    const context: RuleContext = {
      query,
      queryLength: query.length,
      ...(schema && { schema }),
      report: (finding) => {
        ruleFindings.push({
          ...finding,
          ruleId: rule.id,
          severity: finding.severity ?? rule.severity,
        })
      },
    }

    rule.check(ast, context)

    if (ruleFindings.length > 0) {
      firedRules.add(rule.id)
      allFindings.push(...ruleFindings)
    }
  }

  // Apply supersedes logic
  for (const finding of allFindings) {
    const rule = enabledRules.find((r) => r.id === finding.ruleId)
    if (rule?.supersedes) {
      // Check if any superseding rule has fired
      const isSuperseded = enabledRules.some(
        (r) => r.supersedes?.includes(finding.ruleId) && firedRules.has(r.id)
      )
      if (!isSuperseded) {
        findings.push(finding)
      }
    } else {
      findings.push(finding)
    }
  }

  return { query, findings }
}

/**
 * Get enabled rules based on configuration
 */
function getEnabledRules(config?: LinterConfig, schema?: SchemaType): Rule[] {
  let rules = allRules

  // Filter out schema-requiring rules if no schema is provided
  if (!schema) {
    rules = rules.filter((rule) => !rule.requiresSchema)
  }

  if (!config?.rules) {
    return rules
  }

  return rules.filter((rule) => {
    const ruleConfig = config.rules?.[rule.id]
    if (ruleConfig === false) {
      return false
    }
    if (typeof ruleConfig === 'object' && ruleConfig.enabled === false) {
      return false
    }
    return true
  })
}

/**
 * Lint multiple queries
 *
 * @param queries - Array of queries to lint
 * @param options - Optional configuration and schema
 * @returns Array of lint results
 */
export function lintMany(queries: string[], options?: LintOptions): LintResult[] {
  return queries.map((query) => lint(query, options))
}
