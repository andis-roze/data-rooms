import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const rootDir = process.cwd()
const gitDir = path.join(rootDir, '.git')
const hooksDir = path.join(rootDir, '.githooks')

if (!existsSync(gitDir)) {
  console.log('[hooks:install] Skipped: not a git repository.')
  process.exit(0)
}

if (!existsSync(hooksDir)) {
  console.log('[hooks:install] Skipped: .githooks directory not found.')
  process.exit(0)
}

execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'inherit' })
console.log('[hooks:install] Configured core.hooksPath=.githooks')
