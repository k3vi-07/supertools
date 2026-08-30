const { execFileSync } = require('node:child_process')
const { join } = require('node:path')

/**
 * Ad-hoc sign the complete macOS bundle before electron-builder creates ZIP/DMG
 * artifacts. ShipIt validates the extracted bundle during auto-update, so signing
 * an already-created archive is too late.
 */
module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return

  const appPath = join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`)
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], { stdio: 'inherit' })
  execFileSync('codesign', ['--verify', '--deep', '--strict', '--verbose=2', appPath], { stdio: 'inherit' })
}
