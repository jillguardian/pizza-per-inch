import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

function check(subject: string): { ok: boolean; message: string } {
  const result = spawnSync('sh', ['scripts/check-subject.sh', subject], { encoding: 'utf8' })
  return { ok: result.status === 0, message: result.stderr }
}

describe('check-subject.sh', () => {
  it.each([
    'Feat: Rank pizzas by value',
    'Fix: NaN from partial number input',
    'Refactor: Split App into components',
    'Docs: PR template and Git conventions',
    'Test: Cover number field values',
    'Upgrade: Bump actions/checkout from 4 to 7',
    'Chore: Enforce commit and PR title format',
  ])('accepts "%s"', (subject) => {
    expect(check(subject).ok).toBe(true)
  })

  it.each([
    ['a missing prefix', 'Rank pizzas by value'],
    ['an unknown prefix', 'Update: Rank pizzas'],
    ['a lowercase prefix', 'feat: Rank pizzas'],
    ['no space after the colon', 'Feat:Rank pizzas'],
    ['an empty summary', 'Feat: '],
    ['Dependabot-style prefix', 'Build(deps): Bump actions/checkout from 4 to 7'],
  ])('rejects %s', (_reason, subject) => {
    const result = check(subject)
    expect(result.ok).toBe(false)
    expect(result.message).toContain('Prefix: Short imperative summary')
  })

  it('rejects a title over the length limit', () => {
    const result = check(`Feat: ${'x'.repeat(100)}`)
    expect(result.ok).toBe(false)
    expect(result.message).toContain('Too long')
  })

  it('accepts a title exactly at the length limit', () => {
    expect(check(`Feat: ${'x'.repeat(94)}`).ok).toBe(true)
  })
})
