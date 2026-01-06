import type { Rule } from '@sanity/lint-core'
import { joinInFilter } from './join-in-filter'

/**
 * All available lint rules
 */
export const rules: Rule[] = [joinInFilter]

/**
 * Rules indexed by ID for quick lookup
 */
export const rulesById: Record<string, Rule> = Object.fromEntries(rules.map((rule) => [rule.id, rule]))

// Re-export individual rules for direct imports
export { joinInFilter }
