import { dirname, extname, resolve } from 'path'
import { existsSync } from 'fs'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import type { Plugin } from 'vite'

const root = __dirname || process.cwd()

/** crypto-api@0.8.5 ships extensionless relative imports inside .mjs files. */
const cryptoApiExtensionResolver = (): Plugin => ({
  name: 'crypto-api-extension-resolver',
  enforce: 'pre',
  resolveId(source, importer) {
    if (!importer?.includes('/node_modules/crypto-api/') || !source.startsWith('.') || extname(source)) return null
    const resolved = resolve(dirname(importer), `${source}.mjs`)
    return existsSync(resolved) ? resolved : null
  }
})

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': resolve(root, 'src/main'),
        '@shared': resolve(root, 'src/shared')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(root, 'src/main/index.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@preload': resolve(root, 'src/preload'),
        '@shared': resolve(root, 'src/shared')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(root, 'src/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      alias: {
        '@renderer': resolve(root, 'src/renderer/src'),
        '@components': resolve(root, 'src/renderer/src/components'),
        '@views': resolve(root, 'src/renderer/src/views'),
        '@stores': resolve(root, 'src/renderer/src/stores'),
        '@utils': resolve(root, 'src/renderer/src/utils'),
        '@tools': resolve(root, 'src/renderer/src/tools'),
        '@shared': resolve(root, 'src/shared'),
        crypto: resolve(root, 'src/renderer/src/shims/crypto.ts')
      }
    },
    plugins: [cryptoApiExtensionResolver(), vue()],
    define: {
      global: 'globalThis'
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(root, 'src/renderer/index.html')
        }
      },
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },
    optimizeDeps: {
      exclude: ['electron', 'crypto-api']
    }
  }
})
