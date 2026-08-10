import { describe, it, expect } from 'vitest'
import { detectContentType } from '../src/renderer/src/utils/clipboardDetect'

describe('clipboardDetect', () => {
  describe('detectContentType', () => {
    it('detects JSON objects', () => {
      expect(detectContentType('{"name":"test","value":123}')).toBe('json')
      expect(detectContentType('[1,2,3]')).toBe('json')
    })

    it('detects JSON arrays', () => {
      expect(detectContentType('[{"a":1},{"b":2}]')).toBe('json')
    })

    it('detects URLs', () => {
      expect(detectContentType('https://example.com')).toBe('url')
      expect(detectContentType('http://localhost:3000/path')).toBe('url')
    })

    it('detects UUIDs', () => {
      expect(detectContentType('550e8400-e29b-41d4-a716-446655440000')).toBe('uuid')
    })

    it('detects JWT tokens', () => {
      const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      expect(detectContentType(jwt)).toBe('jwt')
    })

    it('detects timestamps', () => {
      expect(detectContentType('1698765432')).toBe('timestamp')
      expect(detectContentType('1698765432000')).toBe('timestamp')
    })

    it('detects hex strings', () => {
      expect(detectContentType('48656c6c6f')).toBe('hex')
      expect(detectContentType('deadbeef1234')).toBe('hex')
    })

    it('detects IPv4 addresses', () => {
      expect(detectContentType('192.168.1.1')).toBe('ipv4')
      expect(detectContentType('10.0.0.255')).toBe('ipv4')
    })

    it('detects morse code', () => {
      expect(detectContentType('.... . .-.. .-.. ---')).toBe('morse')
    })

    it('detects HTML', () => {
      expect(detectContentType('<div>Hello</div>')).toBe('html')
      expect(detectContentType('<p class="x">text</p>')).toBe('html')
    })

    it('detects JavaScript', () => {
      expect(detectContentType('function foo() { return 42; }')).toBe('javascript')
      expect(detectContentType('const x = 1;')).toBe('javascript')
    })

    it('returns text for plain text', () => {
      expect(detectContentType('Hello World')).toBe('text')
      expect(detectContentType('这是一段中文')).toBe('text')
    })

    it('returns unknown for empty input', () => {
      expect(detectContentType('')).toBe('unknown')
    })
  })
})
