// Types
export type {
  Severity,
  Category,
  SourceLocation,
  SourceSpan,
  Finding,
  RuleContext,
  Rule,
  RuleConfig,
  LinterConfig,
} from './types'

// Reporting utilities
export { formatFindings, formatFindingsJson, summarizeFindings } from './reporter'
export type { FindingsSummary } from './reporter'

// Note: RuleTester is exported from '@sanity/lint-core/testing' to avoid
// importing vitest in production code
