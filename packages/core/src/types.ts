import type { ExprNode } from 'groq-js'

/**
 * Severity levels for lint findings
 */
export type Severity = 'error' | 'warning' | 'info'

/**
 * Category of the lint rule
 */
export type Category = 'performance' | 'correctness' | 'style'

/**
 * A location in the source query
 */
export interface SourceLocation {
  /** 1-based line number */
  line: number
  /** 1-based column number */
  column: number
  /** 0-based character offset */
  offset: number
}

/**
 * A span in the source query
 */
export interface SourceSpan {
  start: SourceLocation
  end: SourceLocation
}

/**
 * A lint finding/diagnostic
 */
export interface Finding {
  /** Rule ID that produced this finding */
  ruleId: string
  /** Human-readable message */
  message: string
  /** Severity level */
  severity: Severity
  /** Location in source (optional - some rules are query-wide) */
  span?: SourceSpan
  /** Additional help text */
  help?: string
}

/**
 * Context provided to rules during checking
 */
export interface RuleContext {
  /** The raw query string */
  query: string
  /** Length of the query in bytes */
  queryLength: number
  /** Report a finding */
  report: (finding: Omit<Finding, 'ruleId'>) => void
}

/**
 * A lint rule definition
 */
export interface Rule {
  /** Unique identifier (kebab-case) */
  id: string
  /** Human-readable name */
  name: string
  /** Description of what the rule checks */
  description: string
  /** Default severity */
  severity: Severity
  /** Rule category */
  category: Category
  /** Rule IDs that this rule supersedes */
  supersedes?: string[]

  /**
   * Check the AST for violations
   * @param ast - The parsed GROQ AST
   * @param context - Context with query info and report function
   */
  check: (ast: ExprNode, context: RuleContext) => void
}

/**
 * Configuration for a rule
 */
export interface RuleConfig {
  /** Whether the rule is enabled */
  enabled?: boolean
  /** Override severity */
  severity?: Severity
  /** Rule-specific options */
  options?: Record<string, unknown>
}

/**
 * Linter configuration
 */
export interface LinterConfig {
  /** Rule configurations keyed by rule ID */
  rules?: Record<string, RuleConfig | boolean>
}
