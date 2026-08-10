import { describe, it, expect } from 'vitest'
import { validateRegistry } from '../src/renderer/src/utils/registryValidator'

describe('registryValidator', () => {
  const validTool = {
    id: 'test-tool',
    name: 'Test Tool',
    nameZh: '测试工具',
    icon: 'mdi:test',
    category: ['text'],
    keywords: ['test'],
    description: 'A test tool',
    path: 'tools/TestTool.vue'
  }

  it('accepts a valid registry', () => {
    const data = { name: 'Test Repo', tools: [validTool] }
    const result = validateRegistry(data)
    expect(result.valid).toBe(true)
    expect(result.errors.length).toBe(0)
    expect(result.sanitized?.tools.length).toBe(1)
  })

  it('rejects non-object data', () => {
    const result = validateRegistry('not an object')
    expect(result.valid).toBe(false)
    expect(result.sanitized).toBeNull()
  })

  it('rejects non-array tools', () => {
    const result = validateRegistry({ name: 'x', tools: 'not array' })
    expect(result.valid).toBe(false)
    expect(result.sanitized).toBeNull()
  })

  it('rejects invalid ID format', () => {
    const data = { name: 'x', tools: [{ ...validTool, id: 'Invalid_ID!' }] }
    const result = validateRegistry(data)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('id'))).toBe(true)
  })

  it('rejects duplicate IDs', () => {
    const data = { name: 'x', tools: [validTool, { ...validTool }] }
    const result = validateRegistry(data)
    expect(result.errors.some(e => e.includes('重复'))).toBe(true)
  })

  it('rejects path traversal in path', () => {
    const data = { name: 'x', tools: [{ ...validTool, path: '../../../etc/passwd' }] }
    const result = validateRegistry(data)
    expect(result.valid).toBe(false)
  })

  it('rejects non-vue path', () => {
    const data = { name: 'x', tools: [{ ...validTool, path: 'tools/Tool.txt' }] }
    const result = validateRegistry(data)
    expect(result.valid).toBe(false)
  })

  it('rejects invalid category', () => {
    const data = { name: 'x', tools: [{ ...validTool, category: ['invalid-cat'] }] }
    const result = validateRegistry(data)
    expect(result.errors.some(e => e.includes('category'))).toBe(true)
  })

  it('rejects empty name', () => {
    const data = { name: 'x', tools: [{ ...validTool, name: '' }] }
    const result = validateRegistry(data)
    expect(result.errors.some(e => e.includes('name'))).toBe(true)
  })

  it('handles empty tools array', () => {
    const data = { name: 'x', tools: [] }
    const result = validateRegistry(data)
    expect(result.valid).toBe(true)
    expect(result.sanitized?.tools.length).toBe(0)
  })

  it('filters out invalid entries but keeps valid ones', () => {
    const data = {
      name: 'x',
      tools: [
        validTool,
        { ...validTool, id: 'BAD!', name: '' },
        { ...validTool, id: 'another-valid', name: 'Valid', nameZh: '有效' }
      ]
    }
    const result = validateRegistry(data)
    expect(result.sanitized?.tools.length).toBe(2)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})
