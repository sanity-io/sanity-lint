/**
 * ESLint plugin for Sanity
 *
 * This plugin provides rules for linting GROQ queries in JavaScript/TypeScript files.
 *
 * @example
 * ```js
 * // eslint.config.js
 * import sanity from 'eslint-plugin-sanity'
 *
 * export default [
 *   sanity.configs.recommended,
 * ]
 * ```
 */

// TODO: Implement ESLint rules that wrap @sanity/groq-lint
// TODO: Add processor for groq`` template literals
// TODO: Add processor for .groq files

export const rules = {
  // Rules will be added here
}

export const configs = {
  recommended: {
    plugins: {
      // sanity: plugin
    },
    rules: {
      // 'sanity/no-join-in-filter': 'error',
    },
  },
}

export default {
  rules,
  configs,
}
