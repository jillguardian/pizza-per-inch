import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// Collects the licenses of the packages the site ships (production dependencies and what they
// depend on), checks them against the list below, and writes their notices to a file that is
// published with the site. Run by `npm run build`: `node scripts/licenses.ts write dist/licenses.txt`.
// `node scripts/licenses.ts check` only checks. Development tools are not shipped, so they are not
// listed here.

// Licenses that have been read and agreed. A package with any other license fails the check
// until it is reviewed and added here on purpose.
export const ALLOWED_LICENSES = [
  'MIT',
  'ISC',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  '0BSD',
  'CC0-1.0',
]

const MIT_TEXT = `Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`

export interface ShippedPackage {
  name: string
  version: string
  license: string
  repository: string | null
  // The text of the license files that came with the package, or null when it shipped none.
  text: string | null
  author: string | null
}

// "MIT", "(MIT OR CC0-1.0)" and "MIT AND ISC" are SPDX expressions. OR needs one allowed choice,
// AND needs every part allowed. Anything else, such as "UNLICENSED" or "SEE LICENSE IN FILE", is
// not allowed.
export function isAllowed(license: string): boolean {
  const expression = license.replace(/[()]/g, '').trim()
  if (expression === '') return false
  return expression
    .split(/\s+OR\s+/)
    .some((choice) => choice.split(/\s+AND\s+/).every((id) => ALLOWED_LICENSES.includes(id.trim())))
}

// The license text to publish. A package that shipped none gets the standard MIT text with its
// author's name, which is what an MIT license is, and any other license without text is an error.
export function noticeText(pkg: ShippedPackage): string {
  if (pkg.text !== null) return pkg.text
  if (pkg.license === 'MIT') {
    const holder = pkg.author ?? pkg.name
    return `MIT License\n\nCopyright (c) ${holder}\n\n${MIT_TEXT}`
  }
  throw new Error(`${pkg.name}@${pkg.version} (${pkg.license}) shipped no license text.`)
}

export function formatNotices(packages: ShippedPackage[]): string {
  const sorted = [...packages].sort((a, b) => a.name.localeCompare(b.name))
  const rule = '='.repeat(72)
  const entries = sorted.map((pkg) =>
    [
      rule,
      `${pkg.name}@${pkg.version}`,
      `License: ${pkg.license}`,
      ...(pkg.repository ? [`Source: ${pkg.repository}`] : []),
      '',
      noticeText(pkg).trim(),
    ].join('\n'),
  )
  return [
    'Third-party notices for Pizza per Inch',
    '',
    'The site includes the packages below. Each is listed with its license and the license text',
    'that came with it. This file is written by `npm run build` from the installed packages.',
    '',
    ...entries,
    '',
  ].join('\n')
}

function findPackage(name: string, from: string): string | null {
  let dir = from
  for (;;) {
    const candidate = path.join(dir, 'node_modules', name)
    if (existsSync(path.join(candidate, 'package.json'))) return candidate
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

function readText(dir: string): string | null {
  const files = readdirSync(dir)
    .filter((file) => /^(licen[sc]e|copying|copyrightnotice|notice)/i.test(file))
    .sort()
  if (files.length === 0) return null
  return files.map((file) => readFileSync(path.join(dir, file), 'utf8').trim()).join('\n\n')
}

// "git+https://github.com/a/b.git" and "git@github.com:a/b.git" both become a plain web link.
export function webAddress(repository: string): string {
  return repository
    .replace(/^git\+/, '')
    .replace(/^git@([^:]+):/, 'https://$1/')
    .replace(/^git:\/\//, 'https://')
    .replace(/\.git$/, '')
}

function describe(dir: string): ShippedPackage {
  const manifest = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'))
  const address =
    typeof manifest.repository === 'string'
      ? manifest.repository
      : (manifest.repository?.url ?? null)
  const repository = address ? webAddress(address) : null
  const author = typeof manifest.author === 'string' ? manifest.author : manifest.author?.name
  return {
    name: manifest.name,
    version: manifest.version,
    license: typeof manifest.license === 'string' ? manifest.license : 'UNKNOWN',
    repository,
    text: readText(dir),
    // An email address in the package's metadata is not copied into the notices.
    author: author ? author.replace(/\s*<[^>]*>/, '').trim() : null,
  }
}

// Every package the site can ship: the production dependencies of the project and, below them,
// their own dependencies.
export function collectShipped(root: string): ShippedPackage[] {
  const seen = new Map<string, ShippedPackage>()
  const visit = (name: string, from: string): void => {
    if (seen.has(name)) return
    const dir = findPackage(name, from)
    if (dir === null) throw new Error(`${name} is a dependency but is not installed. Run npm ci.`)
    seen.set(name, describe(dir))
    const manifest = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'))
    for (const child of Object.keys(manifest.dependencies ?? {})) visit(child, dir)
  }
  const own = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
  for (const name of Object.keys(own.dependencies ?? {})) visit(name, root)
  return [...seen.values()]
}

export function unlisted(packages: ShippedPackage[]): ShippedPackage[] {
  return packages.filter((pkg) => !isAllowed(pkg.license))
}

function main(): void {
  const [mode, target] = process.argv.slice(2)
  const packages = collectShipped(process.cwd())
  const bad = unlisted(packages)
  if (bad.length > 0) {
    for (const pkg of bad) {
      process.stderr.write(`${pkg.name}@${pkg.version} has the license "${pkg.license}".\n`)
    }
    process.stderr.write(
      `Allowed: ${ALLOWED_LICENSES.join(', ')}. Read the license, then add it to ALLOWED_LICENSES in scripts/licenses.ts if it is acceptable.\n`,
    )
    process.exitCode = 1
    return
  }
  if (mode === 'write') {
    if (!target) throw new Error('Usage: node scripts/licenses.ts write <file>')
    writeFileSync(target, formatNotices(packages))
    process.stdout.write(`Wrote the notices of ${packages.length} packages to ${target}\n`)
    return
  }
  process.stdout.write(`${packages.length} packages, all with an allowed license.\n`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
