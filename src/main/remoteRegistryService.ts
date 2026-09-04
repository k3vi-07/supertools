import { fetchRemoteText, REMOTE_LIMITS, validateRepoId } from './remoteService'

export async function fetchRemoteRegistry(repo: string): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  let owner = repo
  let version = ''
  const atIndex = repo.lastIndexOf('@')
  if (atIndex > 0) { owner = repo.substring(0, atIndex); version = repo.substring(atIndex + 1) }
  if (!validateRepoId(owner)) return { ok: false, error: '无效的仓库地址: ' + owner }

  const shaResult = await fetchRemoteText('https://api.github.com/repos/' + owner + '/commits/' + (version || 'master'), 256 * 1024)
  let sha: string | null = null
  if (shaResult.ok && shaResult.data) {
    try {
      const value = (JSON.parse(shaResult.data) as { sha?: unknown }).sha
      if (typeof value === 'string' && /^[a-f0-9]{40}$/.test(value)) sha = value
    } catch { /* fallback refs */ }
  }

  const sourceGroups: string[][] = []
  if (sha) sourceGroups.push([
    'https://cdn.jsdelivr.net/gh/' + owner + '@' + sha + '/registry.json',
    'https://raw.githubusercontent.com/' + owner + '/' + sha + '/registry.json'
  ])
  for (const ref of version ? [version] : ['latest', 'master', 'main']) {
    sourceGroups.push([
      'https://cdn.jsdelivr.net/gh/' + owner + '@' + ref + '/registry.json',
      'https://raw.githubusercontent.com/' + owner + '/' + ref + '/registry.json'
    ])
  }

  let lastError = '未知错误'
  for (const sources of sourceGroups) {
    const results = await Promise.all([...new Set(sources)].map((url) => fetchRemoteText(url, REMOTE_LIMITS.registryBytes)))
    for (const result of results) {
      if (!result.ok || !result.data) { lastError = result.error || lastError; continue }
      try {
        const data = JSON.parse(result.data) as { tools?: unknown[] }
        if (Array.isArray(data.tools)) return { ok: true, data }
        lastError = 'registry.json 缺少 tools 数组'
      } catch { lastError = 'registry.json 不是有效 JSON' }
    }
  }
  return { ok: false, error: '无法获取仓库清单 (' + lastError + ')' }
}
