import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
const host = fileURLToPath(new URL('..', import.meta.url))
const community = resolve(process.env.SUPERTOOLS_COMMUNITY_DIR || resolve(host, '..', 'supertools-community'))
const result = spawnSync(process.execPath, [resolve(community, 'scripts/test.mjs')], {
  cwd: community, stdio: 'inherit', env: { ...process.env, SUPERTOOLS_HOST_DIR: host }
})
if (result.error) console.error(result.error.message)
process.exit(result.status ?? 1)
