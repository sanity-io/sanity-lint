#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { lint } from './linter'
import { formatFindings, formatFindingsJson, summarizeFindings } from '@sanity/lint-core'

interface CliOptions {
  format: 'pretty' | 'json'
  query?: string
  files: string[]
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    format: 'pretty',
    files: [],
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (!arg) continue

    if (arg === '--json' || arg === '-j') {
      options.format = 'json'
    } else if (arg === '--query' || arg === '-q') {
      const nextArg = args[++i]
      if (nextArg) {
        options.query = nextArg
      }
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else if (arg === '--version' || arg === '-v') {
      console.log('0.0.1')
      process.exit(0)
    } else if (!arg.startsWith('-')) {
      options.files.push(arg)
    }
  }

  return options
}

function printHelp(): void {
  console.log(`
groq-lint - Lint GROQ queries for performance and correctness issues

USAGE:
  groq-lint [OPTIONS] [FILES...]
  groq-lint -q '<query>'
  cat query.groq | groq-lint

OPTIONS:
  -q, --query <QUERY>   Lint a query string directly
  -j, --json            Output findings as JSON
  -h, --help            Show this help message
  -v, --version         Show version

EXAMPLES:
  groq-lint query.groq
  groq-lint -q '*[author->name == "Bob"]'
  groq-lint --json queries/*.groq
`)
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf-8')
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))

  let queries: { source: string; query: string }[] = []

  // Get queries from various sources
  if (options.query) {
    queries.push({ source: 'cli', query: options.query })
  }

  if (options.files.length > 0) {
    for (const file of options.files) {
      try {
        const content = readFileSync(file, 'utf-8')
        queries.push({ source: file, query: content })
      } catch {
        console.error(`Error reading file: ${file}`)
        process.exit(1)
      }
    }
  }

  // Check for stdin if no other input
  if (queries.length === 0 && !process.stdin.isTTY) {
    const stdin = await readStdin()
    if (stdin.trim()) {
      queries.push({ source: 'stdin', query: stdin })
    }
  }

  if (queries.length === 0) {
    printHelp()
    process.exit(1)
  }

  // Lint all queries
  const allFindings: { source: string; query: string; findings: ReturnType<typeof lint>['findings'] }[] = []
  let hasErrors = false

  for (const { source, query } of queries) {
    const result = lint(query)

    if (result.parseError) {
      console.error(`Parse error in ${source}: ${result.parseError}`)
      hasErrors = true
      continue
    }

    if (result.findings.length > 0) {
      allFindings.push({ source, query, findings: result.findings })
      if (result.findings.some((f) => f.severity === 'error')) {
        hasErrors = true
      }
    }
  }

  // Output results
  if (options.format === 'json') {
    const output = allFindings.map(({ source, findings }) => ({
      source,
      findings,
    }))
    console.log(JSON.stringify(output, null, 2))
  } else {
    for (const { source, query, findings } of allFindings) {
      if (queries.length > 1) {
        console.log(`\n=== ${source} ===\n`)
      }
      console.log(formatFindings(query, findings))
    }

    // Print summary
    const totalFindings = allFindings.flatMap((f) => f.findings)
    if (totalFindings.length > 0) {
      const summary = summarizeFindings(totalFindings)
      console.log(
        `\nFound ${summary.total} issue(s): ${summary.errors} error(s), ${summary.warnings} warning(s), ${summary.infos} info(s)`
      )
    }
  }

  process.exit(hasErrors ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
