// Main linting API
export { lint, lintMany } from './linter'
export type { LintResult } from './linter'

// Rules
export { rules, rulesById } from './rules'
export { joinInFilter } from './rules/join-in-filter'

// Re-export types from core
export type { Rule, RuleConfig, LinterConfig, Finding, Severity, Category } from '@sanity/lint-core'

// Re-export utilities from core
export { formatFindings, formatFindingsJson, summarizeFindings } from '@sanity/lint-core'

// Note: RuleTester is available from '@sanity/lint-core/testing' for test files
