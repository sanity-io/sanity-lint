---
name: test
description: Run tests and report results. Use when you need to verify code changes work correctly.
---

# Test Runner

Run the test suite and interpret results.

## Usage

Just say `/test` to run all tests, or specify options:

- `/test` - Run all tests once
- `/test watch` - Run tests in watch mode
- `/test coverage` - Run with coverage report
- `/test <pattern>` - Run tests matching pattern

## Instructions

1. Run the appropriate test command based on user request:
   - Default: `pnpm test`
   - Watch mode: `pnpm test:watch`
   - Coverage: `pnpm test:coverage`
   - Pattern: `pnpm test -- --testNamePattern="<pattern>"`

2. Parse the output and report:
   - Number of tests passed/failed
   - Which specific tests failed
   - Error messages and stack traces for failures

3. If tests fail:
   - Identify the failing test file and test name
   - Show the relevant assertion error
   - Suggest what might need to be fixed

4. If tests pass:
   - Confirm success briefly
   - Show coverage summary if requested

## Example Output

```
✓ 12 tests passed
✗ 1 test failed

FAILED: packages/groq-lint/src/rules/__tests__/join-in-filter.test.ts
  × join-in-filter > invalid > nested join in filter
    Expected 2 errors but got 1

Suggestion: The nested dereference case may need adjustment in the walker.
```
