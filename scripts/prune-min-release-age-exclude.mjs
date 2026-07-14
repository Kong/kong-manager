// Prune stale entries from `minimumReleaseAgeExclude` in pnpm-workspace.yaml.
//
// `pnpm audit --fix=update` adds the freshly-published version of each advisory
// to `minimumReleaseAgeExclude` so the security fix can be installed despite the
// `minimumReleaseAge` gate. Once such a version is older than the release-age
// window it passes the gate on its own, so its exclude entry is redundant and
// only makes the list grow forever. This script removes those aged entries.
//
// Kept untouched (never fetched, never removed):
//   - name-only / glob entries the team set intentionally, e.g. '@kong/*',
//     anything WITHOUT an `@<version>` suffix.
//   - any version we cannot verify (registry error / unknown publish time) —
//     fail-safe: we never drop what we can't prove is aged.
//
// Only version-pinned entries whose every version is provably past the window
// are dropped; a mixed entry keeps the still-fresh versions.

import { readFileSync, writeFileSync } from 'node:fs'

const WORKSPACE_FILE = 'pnpm-workspace.yaml'
const REGISTRY = 'https://registry.npmjs.org'
// pnpm 11 enforces minimumReleaseAge=1440 (1 day) by default when it is not set.
const DEFAULT_MIN_RELEASE_AGE_MINUTES = 1440

const raw = readFileSync(WORKSPACE_FILE, 'utf8')
const lines = raw.split('\n')

// Locate the `minimumReleaseAgeExclude:` block (top-level key + its list items).
const startIdx = lines.findIndex((l) => /^minimumReleaseAgeExclude:/.test(l))
if (startIdx === -1) {
  console.log('No minimumReleaseAgeExclude block; nothing to prune.')
  process.exit(0)
}
let endIdx = startIdx + 1
while (endIdx < lines.length && /^\s+-\s/.test(lines[endIdx])) endIdx++

const exclude = lines
  .slice(startIdx + 1, endIdx)
  .map((l) => l.replace(/^\s+-\s+/, '').trim().replace(/^['"]|['"]$/g, ''))
  .filter(Boolean)

if (exclude.length === 0) {
  console.log('minimumReleaseAgeExclude is empty; nothing to prune.')
  process.exit(0)
}

// `minimumReleaseAge:` is a scalar in minutes; pnpm 11 defaults to 1440 when unset.
const mraLine = lines.find((l) => /^minimumReleaseAge:\s/.test(l))
const parsedAge = mraLine ? parseInt(mraLine.split(':')[1].trim(), 10) : NaN
const minAgeMinutes = Number.isFinite(parsedAge) ? parsedAge : DEFAULT_MIN_RELEASE_AGE_MINUTES
const cutoff = Date.now() - minAgeMinutes * 60_000
const authToken = process.env.NODE_AUTH_TOKEN || process.env.NPM_TOKEN

// Split "@scope/pkg@1.2.3 || 2.0.0" into { name, versions }.
// Returns null for name-only / glob entries (no `@<version>` suffix) -> keep.
function parseVersionedEntry(entry) {
  const at = entry.indexOf('@', 1) // skip a leading scope '@'
  if (at === -1) return null
  const name = entry.slice(0, at)
  const versions = entry
    .slice(at + 1)
    .split('||')
    .map((v) => v.trim())
    .filter(Boolean)
  // Only handle exact versions; bail (keep as-is) on anything else.
  if (versions.length === 0 || !versions.every((v) => /^\d+\.\d+\.\d+/.test(v))) {
    return null
  }
  return { name, versions }
}

const publishTimesCache = new Map()
async function getPublishTimes(pkg) {
  if (publishTimesCache.has(pkg)) return publishTimesCache.get(pkg)
  let times = null
  try {
    const res = await fetch(`${REGISTRY}/${pkg.replace('/', '%2F')}`, {
      headers: authToken ? { authorization: `Bearer ${authToken}` } : {},
    })
    if (res.ok) {
      times = (await res.json()).time ?? {}
    } else {
      console.warn(`  ! ${pkg}: registry returned ${res.status}; keeping its entry`)
    }
  } catch (err) {
    console.warn(`  ! ${pkg}: fetch failed (${err.message}); keeping its entry`)
  }
  publishTimesCache.set(pkg, times)
  return times
}

const result = []
let changed = false

for (const entry of exclude) {
  const parsed = parseVersionedEntry(entry)
  if (!parsed) {
    result.push(entry) // name/glob or unrecognised -> permanent, keep
    continue
  }

  const times = await getPublishTimes(parsed.name)
  if (times === null) {
    result.push(entry) // could not verify -> keep (fail-safe)
    continue
  }

  const kept = parsed.versions.filter((v) => {
    const publishedAt = times[v]
    if (!publishedAt) return true // unknown version time -> keep (fail-safe)
    const aged = new Date(publishedAt).getTime() < cutoff
    if (aged) {
      console.log(`  drop ${parsed.name}@${v} (published ${publishedAt}, past ${minAgeMinutes}min window)`)
    }
    return !aged
  })

  if (kept.length === 0) {
    changed = true
    console.log(`  remove ${parsed.name} (all pinned versions aged)`)
    continue
  }
  const rebuilt = `${parsed.name}@${kept.join(' || ')}`
  if (rebuilt !== entry) changed = true
  result.push(rebuilt)
}

if (!changed) {
  console.log('minimumReleaseAgeExclude is already minimal; no changes.')
  process.exit(0)
}

// Rewrite only the minimumReleaseAgeExclude block, preserving the rest of the file.
const newBlock = result.length
  ? ['minimumReleaseAgeExclude:', ...result.map((e) => `  - '${e.replace(/'/g, "''")}'`)]
  : ['minimumReleaseAgeExclude: []']

writeFileSync(
  WORKSPACE_FILE,
  [...lines.slice(0, startIdx), ...newBlock, ...lines.slice(endIdx)].join('\n'),
)
console.log(`Pruned minimumReleaseAgeExclude: ${exclude.length} -> ${result.length} entries.`)
