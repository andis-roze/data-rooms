import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const rootDir = process.cwd()
const coverageSummaryPath = path.join(rootDir, 'coverage', 'coverage-summary.json')
const minimumCoveragePercent = 60

const runOrExit = (command, args, blockedMessage) => {
  const run = spawnSync(command, args, { stdio: 'inherit' })
  if (run.status !== 0) {
    console.error(blockedMessage)
    process.exit(run.status ?? 1)
  }
}

runOrExit('npx', ['eslint', 'src/**/*.{ts,tsx}', '--max-warnings=0'], '[pre-push] Blocked: TypeScript lint check failed or reported warnings.')

runOrExit('npm', ['run', 'audit:unused'], '[pre-push] Blocked: unused-code audit failed.')

runOrExit('npm', ['run', 'audit:unused:types'], '[pre-push] Blocked: TypeScript check failed.')

runOrExit(
  'npm',
  ['run', 'test:coverage', '--', '--coverage.reporter=json-summary'],
  '[pre-push] Blocked: tests or coverage execution failed.',
)

if (!existsSync(coverageSummaryPath)) {
  console.error('[pre-push] Blocked: coverage summary was not generated.')
  process.exit(1)
}

const summary = JSON.parse(readFileSync(coverageSummaryPath, 'utf8'))
const linesPct = summary?.total?.lines?.pct

if (typeof linesPct !== 'number') {
  console.error('[pre-push] Blocked: unable to read total line coverage.')
  process.exit(1)
}

if (linesPct < minimumCoveragePercent) {
  console.error(
    `[pre-push] Blocked: total line coverage ${linesPct.toFixed(2)}% is below ${minimumCoveragePercent}%.`,
  )
  process.exit(1)
}

console.log(`[pre-push] Coverage check passed: ${linesPct.toFixed(2)}% >= ${minimumCoveragePercent}%.`)

if (process.env.AUTO_DEPLOY_GH_PAGES === '1') {
  console.log('[pre-push] AUTO_DEPLOY_GH_PAGES=1, running GitHub Pages deploy...')
  const deployRun = spawnSync('npm', ['run', 'deploy:gh-pages'], { stdio: 'inherit' })

  if (deployRun.status !== 0) {
    console.error('[pre-push] Blocked: GitHub Pages deploy failed.')
    process.exit(deployRun.status ?? 1)
  }
}
