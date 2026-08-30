declare module 'vue3-sfc-loader' {
  import type { Component } from 'vue'

  export function loadModule(
    url: string,
    options: Record<string, unknown>
  ): Promise<Component | { default: Component }>
}

declare module 'bcryptjs/dist/bcrypt.js' {
  const bcrypt: typeof import('bcryptjs')
  export default bcrypt
}
