const BASE = 36
const TMIN = 1
const TMAX = 26
const SKEW = 38
const DAMP = 700
const INITIAL_BIAS = 72
const INITIAL_N = 128

function adapt(delta: number, points: number, first: boolean): number {
  delta = first ? Math.floor(delta / DAMP) : Math.floor(delta / 2)
  delta += Math.floor(delta / points)
  let k = 0
  while (delta > Math.floor(((BASE - TMIN) * TMAX) / 2)) {
    delta = Math.floor(delta / (BASE - TMIN))
    k += BASE
  }
  return k + Math.floor(((BASE - TMIN + 1) * delta) / (delta + SKEW))
}

function decodeDigit(char: string): number {
  const code = char.charCodeAt(0)
  if (code >= 48 && code <= 57) return code - 22
  if (code >= 65 && code <= 90) return code - 65
  if (code >= 97 && code <= 122) return code - 97
  return BASE
}

export function decodePunycodeLabel(label: string): string {
  if (!label.toLowerCase().startsWith('xn--')) return label
  const input = label.slice(4)
  const output: number[] = []
  const delimiter = input.lastIndexOf('-')
  let index = 0
  if (delimiter >= 0) {
    for (const char of input.slice(0, delimiter)) output.push(char.charCodeAt(0))
    index = delimiter + 1
  }
  let n = INITIAL_N
  let i = 0
  let bias = INITIAL_BIAS
  while (index < input.length) {
    const oldI = i
    let weight = 1
    for (let k = BASE; ; k += BASE) {
      if (index >= input.length) throw new Error('无效的 Punycode')
      const digit = decodeDigit(input[index++])
      if (digit >= BASE) throw new Error('无效的 Punycode')
      i += digit * weight
      const threshold = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias
      if (digit < threshold) break
      weight *= BASE - threshold
      if (!Number.isSafeInteger(weight) || !Number.isSafeInteger(i)) throw new Error('Punycode 数值溢出')
    }
    const length = output.length + 1
    bias = adapt(i - oldI, length, oldI === 0)
    n += Math.floor(i / length)
    i %= length
    if (n > 0x10ffff) throw new Error('无效的 Unicode 码点')
    output.splice(i, 0, n)
    i++
  }
  return String.fromCodePoint(...output)
}

export function encodeDomain(input: string): string {
  const value = input.trim()
  if (!value) return ''
  const parsed = new URL(`http://${value}`)
  return parsed.hostname
}

export function decodeDomain(input: string): string {
  const value = input.trim()
  if (!value) return ''
  return value.split('.').map(decodePunycodeLabel).join('.')
}
