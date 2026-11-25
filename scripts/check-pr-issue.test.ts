import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

interface Pull {
  body?: string
  author?: string
  labels?: string[]
}

function check({ body = '', author = 'jillguardian', labels = [] }: Pull): {
  ok: boolean
  message: string
} {
  const result = spawnSync('sh', ['scripts/check-pr-issue.sh'], {
    encoding: 'utf8',
    env: {
      PATH: process.env.PATH,
      PR_BODY: body,
      PR_AUTHOR: author,
      PR_LABELS: JSON.stringify(labels),
    },
  })
  return { ok: result.status === 0, message: result.stderr }
}

describe('check-pr-issue.sh', () => {
  it.each([
    ['Closes', 'Closes #73'],
    ['Refs', 'Refs #73'],
    ['Fixes', 'Fixes #12'],
    ['Resolves', 'Resolves #12'],
    ['a lowercase keyword', 'closes #73'],
    ['a reference below other text', '## What\n\nA change.\n\nCloses #73\n\n## Why\n\nBecause.'],
    ['a reference after a template comment', '<!-- hint -->\nRefs #5'],
    ['a reference followed by a full stop', 'Closes #12.'],
    ['a reference at the end of a line', 'Closes #12\nMore text'],
    ['a reference followed by a comma', 'Refs #12, #13'],
  ])('accepts %s', (_name, body) => {
    expect(check({ body }).ok).toBe(true)
  })

  it.each([
    ['an empty description', ''],
    ['the template placeholder with no number', 'Closes #\n\n## What'],
    ['a keyword and a word instead of a number', 'Closes #abc'],
    ['a number without a keyword', 'See #12 for the background'],
    ['a keyword that is part of another word', 'Discloses #12'],
    ['a reference inside an HTML comment', '<!-- Closes #12 -->'],
    ['a reference inside a multi-line HTML comment', '<!--\nCloses #12\n-->\n## What'],
    ['a reference after a comment that is never closed', '<!-- hint\nCloses #12'],
    ['a number followed by letters', 'Closes #12abc'],
    ['a number followed by one letter', 'Closes #1x'],
  ])('rejects %s', (_name, body) => {
    const result = check({ body })
    expect(result.ok).toBe(false)
    expect(result.message).toContain("'Closes #N'")
  })

  it('accepts a Dependabot pull request, which has no issue', () => {
    expect(check({ author: 'dependabot[bot]', body: 'Bumps a package.' }).ok).toBe(true)
  })

  it('does not exempt an author who only looks like Dependabot', () => {
    expect(check({ author: 'dependabot-fan', body: 'Bumps a package.' }).ok).toBe(false)
  })

  describe('the no-issue exemption', () => {
    it('accepts the label with a reason', () => {
      const body = 'Fixes a typo.\n\nNo issue: a one-word typo in the README'
      expect(check({ body, labels: ['no-issue'] }).ok).toBe(true)
    })

    it('accepts the label among other labels', () => {
      const body = 'No issue: a one-word typo'
      expect(check({ body, labels: ['documentation', 'no-issue'] }).ok).toBe(true)
    })

    it('rejects the label with no reason', () => {
      const result = check({ body: 'Fixes a typo.', labels: ['no-issue'] })
      expect(result.ok).toBe(false)
      expect(result.message).toContain('needs a reason')
    })

    it('rejects an empty reason', () => {
      expect(check({ body: 'No issue:', labels: ['no-issue'] }).ok).toBe(false)
    })

    it('rejects a reason without the label', () => {
      expect(check({ body: 'No issue: a typo', labels: [] }).ok).toBe(false)
    })

    it('rejects a reason written only in a template comment', () => {
      expect(check({ body: '<!-- No issue: a typo -->', labels: ['no-issue'] }).ok).toBe(false)
    })

    it('does not count a label that only starts with the name', () => {
      expect(check({ body: 'No issue: a typo', labels: ['no-issue-needed'] }).ok).toBe(false)
    })
  })
})
