// @ts-check
/* eslint-disable no-template-curly-in-string */

/**
 * Semantic Release configuration for sanity-lint monorepo
 *
 * Note: We can't use `extends: '@sanity/semantic-release-preset'` because
 * semantic-release-monorepo doesn't work well with presets (causes nested array conflicts).
 * This config is based on the Sanity preset but adapted for monorepo publishing.
 *
 * @type {import('semantic-release').Options}
 */
module.exports = {
  branches: ['main'],
  plugins: [
    ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
    ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits' }],
    [
      '@semantic-release/changelog',
      {
        changelogTitle: `<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.`,
      },
    ],
    [
      '@semantic-release/npm',
      {
        // Root package is private, don't publish it
        npmPublish: false,
      },
    ],
    // Publish each workspace package
    'semantic-release-monorepo',
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json', 'packages/*/package.json', 'pnpm-lock.yaml'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    [
      '@semantic-release/github',
      {
        addReleases: 'bottom',
        // Disable features that can hit rate limits
        releasedLabels: false,
        successComment: false,
      },
    ],
  ],
}
