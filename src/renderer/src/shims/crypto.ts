/** Minimal browser replacement for bcryptjs' optional Node crypto fallback. */
export function randomBytes(size: number): Uint8Array {
  const bytes = new Uint8Array(size)
  crypto.getRandomValues(bytes)
  return bytes
}
