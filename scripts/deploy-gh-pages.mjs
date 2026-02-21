import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const args = new Set(process.argv.slice(2))
const skipBuild = args.has('--skip-build')

if (!skipBuild) {
  const build = spawnSync('npm', ['run', 'build:gh-pages'], { stdio: 'inherit' })
  if (build.status !== 0) {
    process.exit(build.status ?? 1)
  }
}

if (!existsSync('dist/index.html')) {
  console.error('[gh-pages] Missing dist/index.html. Run build first.')
  process.exit(1)
}

const branch = process.env.GH_PAGES_BRANCH || 'gh-pages'
const message = process.env.GH_PAGES_COMMIT_MESSAGE || 'chore(deploy): publish GitHub Pages'

console.log(`[gh-pages] Deploying dist/ to branch ${branch}`)

const deploy = spawnSync(
  'npx',
  ['gh-pages', '-d', 'dist', '-b', branch, '-m', message],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      SKIP_LOCAL_PRE_PUSH: '1',
    },
  },
)

if (deploy.status !== 0) {
  process.exit(deploy.status ?? 1)
}

console.log('[gh-pages] Deployment complete')
