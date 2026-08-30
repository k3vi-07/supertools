declare module 'crypto-api/src/hasher/snefru.mjs' {
  export default class Snefru {
    constructor(options?: { length?: number; rounds?: number })
    update(message: string): this
    finalize(): string
  }
}

declare module 'crypto-api/src/encoder/utf.mjs' {
  export function fromUtf(message: string): string
}

declare module 'crypto-api/src/encoder/hex.mjs' {
  export function toHex(raw: string): string
}

declare module 'ch-city-wasm/wasm' {
  export default function getWasm(): Uint8Array
}
