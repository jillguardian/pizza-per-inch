import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  ALLOWED_LICENSES,
  collectShipped,
  formatNotices,
  isAllowed,
  noticeText,
  unlisted,
  webAddress,
  type ShippedPackage,
} from './licenses'

const pkg = (overrides: Partial<ShippedPackage> = {}): ShippedPackage => ({
  name: 'example',
  version: '1.2.3',
  license: 'MIT',
  repository: 'https://github.com/example/example',
  text: 'MIT License\n\nCopyright (c) Example',
  author: 'Ada Example',
  ...overrides,
})

describe('isAllowed', () => {
  it.each(ALLOWED_LICENSES)('allows %s', (license) => {
    expect(isAllowed(license)).toBe(true)
  })

  it.each([
    ['a choice with one allowed licence', '(MIT OR CC0-1.0)'],
    ['a choice where only the second is allowed', '(GPL-3.0-only OR MIT)'],
    ['two allowed licences that both apply', 'MIT AND ISC'],
  ])('allows %s', (_name, license) => {
    expect(isAllowed(license)).toBe(true)
  })

  it.each([
    ['a copyleft licence', 'GPL-3.0-only'],
    ['a weak copyleft licence', 'MPL-2.0'],
    ['a choice of two licences that are not allowed', '(GPL-3.0-only OR AGPL-3.0-only)'],
    ['licences that both apply, with one not allowed', 'MIT AND GPL-3.0-only'],
    ['no licence at all', 'UNLICENSED'],
    ['a pointer to a file', 'SEE LICENSE IN LICENSE.md'],
    ['an empty licence', ''],
    ['a licence that was not read', 'UNKNOWN'],
    ['a lowercase licence id, which SPDX does not use', 'mit'],
  ])('rejects %s', (_name, license) => {
    expect(isAllowed(license)).toBe(false)
  })
})

describe('noticeText', () => {
  it('uses the license text the package shipped', () => {
    expect(noticeText(pkg({ text: 'The text that came with it' }))).toBe(
      'The text that came with it',
    )
  })

  it('writes the standard MIT text with the author when an MIT package shipped none', () => {
    const text = noticeText(pkg({ text: null, author: 'Ada Example' }))
    expect(text).toContain('Copyright (c) Ada Example')
    expect(text).toContain('Permission is hereby granted, free of charge')
  })

  it('falls back to the package name when there is no author', () => {
    expect(noticeText(pkg({ text: null, author: null }))).toContain('Copyright (c) example')
  })

  it('refuses to invent the text of a license other than MIT', () => {
    expect(() => noticeText(pkg({ text: null, license: 'Apache-2.0' }))).toThrow(
      /shipped no license text/,
    )
  })
})

describe('formatNotices', () => {
  it('lists each package with its version, license, source and text, sorted by name', () => {
    const notices = formatNotices([
      pkg({ name: 'zeta', text: 'ZETA TEXT' }),
      pkg({ name: 'alpha', text: 'ALPHA TEXT', license: 'ISC' }),
    ])

    expect(notices).toContain(
      'alpha@1.2.3\nLicense: ISC\nSource: https://github.com/example/example',
    )
    expect(notices).toContain('ALPHA TEXT')
    expect(notices).toContain('ZETA TEXT')
    expect(notices.indexOf('alpha@')).toBeLessThan(notices.indexOf('zeta@'))
  })

  it('leaves out the source line when there is none', () => {
    expect(formatNotices([pkg({ repository: null })])).not.toContain('Source:')
  })
})

describe('webAddress', () => {
  it.each([
    ['git+https://github.com/a/b.git', 'https://github.com/a/b'],
    ['git@github.com:a/b.git', 'https://github.com/a/b'],
    ['git://github.com/a/b.git', 'https://github.com/a/b'],
    ['https://github.com/a/b', 'https://github.com/a/b'],
  ])('turns %s into a web link', (address, expected) => {
    expect(webAddress(address)).toBe(expected)
  })
})

describe('unlisted', () => {
  it('returns only the packages whose license is not allowed', () => {
    const bad = pkg({ name: 'copyleft', license: 'GPL-3.0-only' })
    expect(unlisted([pkg(), bad])).toEqual([bad])
  })
})

describe('the packages this project ships', () => {
  const shipped = collectShipped(process.cwd())
  const names = shipped.map((p) => p.name)

  it('includes the libraries the app is built on, and what they depend on', () => {
    expect(names).toEqual(expect.arrayContaining(['react', 'react-dom', '@mantine/core']))
    expect(names.length).toBeGreaterThan(10)
  })

  it('leaves out development tools, which are not shipped', () => {
    for (const tool of ['vitest', 'vite', 'prettier', 'axe-core', 'playwright-core']) {
      expect(names).not.toContain(tool)
    }
  })

  it('has an allowed license for every one of them', () => {
    expect(unlisted(shipped).map((p) => `${p.name}@${p.version}: ${p.license}`)).toEqual([])
  })

  it('can write a notice for every one of them', () => {
    expect(() => formatNotices(shipped)).not.toThrow()
  })
})

describe('the project license', () => {
  it('is MIT in package.json and in the LICENSE file', () => {
    const manifest = JSON.parse(readFileSync('package.json', 'utf8'))
    const license = readFileSync('LICENSE', 'utf8')
    expect(manifest.license).toBe('MIT')
    expect(license).toMatch(/^MIT License\n\nCopyright \(c\) 2026 jillguardian\n/)
  })
})
