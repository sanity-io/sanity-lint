/**
 * Extension unit tests
 *
 * Note: Full integration testing requires the VS Code Extension Test Runner.
 * These tests cover utility functions and configuration.
 *
 * To run integration tests:
 * 1. Install @vscode/test-electron
 * 2. Create a test runner in src/test/
 * 3. Run: npm run test:integration
 */

import { describe, it, expect } from 'vitest'

describe('Extension configuration', () => {
  it('should have correct package.json structure', async () => {
    const packageJson = await import('../../package.json')

    // Required fields
    expect(packageJson.name).toBe('vscode-groq')
    expect(packageJson.engines.vscode).toBeDefined()
    expect(packageJson.main).toBe('./dist/extension.js')

    // Activation events
    expect(packageJson.activationEvents).toContain('onLanguage:groq')
    expect(packageJson.activationEvents).toContain('onLanguage:typescript')

    // Language contribution
    const languages = packageJson.contributes.languages
    expect(languages).toHaveLength(1)
    expect(languages[0].id).toBe('groq')
    expect(languages[0].extensions).toContain('.groq')

    // Grammar contributions
    const grammars = packageJson.contributes.grammars
    expect(grammars).toHaveLength(2)
    expect(grammars[0].scopeName).toBe('source.groq')
    expect(grammars[1].scopeName).toBe('inline.groq')

    // Configuration
    const config = packageJson.contributes.configuration
    expect(config.properties['groq.enable']).toBeDefined()
    expect(config.properties['groq.schemaPath']).toBeDefined()
    expect(config.properties['groq.maxDiagnostics']).toBeDefined()

    // Commands
    const commands = packageJson.contributes.commands
    expect(commands.some((c: { command: string }) => c.command === 'groq.restartServer')).toBe(true)
  })
})

describe('Language configuration', () => {
  it('should have correct brackets and comments', async () => {
    const langConfig = await import('../../language-configuration.json')

    // Comments
    expect(langConfig.comments.lineComment).toBe('//')

    // Brackets
    expect(langConfig.brackets).toContainEqual(['{', '}'])
    expect(langConfig.brackets).toContainEqual(['[', ']'])
    expect(langConfig.brackets).toContainEqual(['(', ')'])

    // Auto-closing pairs
    expect(langConfig.autoClosingPairs).toContainEqual({ open: '{', close: '}' })
    expect(langConfig.autoClosingPairs).toContainEqual({
      open: '"',
      close: '"',
      notIn: ['string'],
    })
  })
})

describe('TextMate grammar', () => {
  it('should define GROQ scope', async () => {
    const grammar = await import('../../syntaxes/groq.tmLanguage.json')

    expect(grammar.name).toBe('GROQ')
    expect(grammar.scopeName).toBe('source.groq')

    // Check for essential patterns
    const patternNames = grammar.patterns.map((p: { include: string }) =>
      p.include?.replace('#', '')
    )
    expect(patternNames).toContain('strings')
    expect(patternNames).toContain('numbers')
    expect(patternNames).toContain('operators')
    expect(patternNames).toContain('functions')
    expect(patternNames).toContain('system-fields')
  })

  it('should define injection grammar for JS/TS', async () => {
    const grammar = await import('../../syntaxes/groq-injection.tmLanguage.json')

    expect(grammar.scopeName).toBe('inline.groq')
    expect(grammar.injectionSelector).toContain('source.ts')
    expect(grammar.injectionSelector).toContain('source.js')
  })
})

describe('Snippets', () => {
  it('should define GROQ snippets', async () => {
    const module = await import('../../snippets/groq.json')
    const snippets = module.default || module

    // Check essential snippets exist
    expect(snippets['Filter by type']).toBeDefined()
    expect(snippets['Filter by type'].prefix).toBe('type')

    expect(snippets['Projection']).toBeDefined()
    expect(snippets['Dereference']).toBeDefined()
    expect(snippets['Order ascending']).toBeDefined()
  })

  it('should define TypeScript GROQ snippets', async () => {
    const module = await import('../../snippets/groq-ts.json')
    const snippets = module.default || module

    // Check essential snippets exist
    expect(snippets['GROQ query']).toBeDefined()
    expect(snippets['GROQ query'].prefix).toBe('groq')

    expect(snippets['GROQ import']).toBeDefined()
    expect(snippets['Sanity client query']).toBeDefined()
  })
})
