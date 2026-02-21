import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

function getRepoNameFromGitHubRepository(value) {
  if (!value || !value.includes('/')) {
    return null
  }
  return value.split('/')[1] || null
}

function getRepoNameFromRemote(remoteUrl) {
  if (!remoteUrl) {
    return null
  }
  const httpsMatch = remoteUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/)
  if (httpsMatch) {
    return httpsMatch[2]
  }
  return null
}

function detectRepositoryName() {
  const fromEnv = getRepoNameFromGitHubRepository(process.env.GITHUB_REPOSITORY)
  if (fromEnv) {
    return fromEnv
  }

  const remote = spawnSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' })
  if (remote.status === 0) {
    const fromRemote = getRepoNameFromRemote(remote.stdout.trim())
    if (fromRemote) {
      return fromRemote
    }
  }

  return null
}

function resolveBasePath() {
  if (process.env.GH_PAGES_BASE_PATH) {
    return process.env.GH_PAGES_BASE_PATH
  }

  const repoName = detectRepositoryName()
  if (repoName) {
    return `/${repoName}/`
  }

  return '/'
}

const basePath = resolveBasePath()

console.log(`[gh-pages] Building with base path: ${basePath}`)
const build = spawnSync('npm', ['run', 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    VITE_BASE_PATH: basePath,
  },
})

if (build.status !== 0) {
  process.exit(build.status ?? 1)
}

if (!existsSync('dist/index.html')) {
  console.error('[gh-pages] Build did not produce dist/index.html')
  process.exit(1)
}

mkdirSync('dist', { recursive: true })
copyFileSync('dist/index.html', 'dist/404.html')
writeFileSync('dist/.nojekyll', '')

console.log('[gh-pages] Prepared dist/404.html and dist/.nojekyll')
