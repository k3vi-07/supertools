import { describe, it, expect } from 'vitest'
import { formatShortcut, formatShortcutHint, matchesShortcut, isValidAccelerator } from '../src/renderer/src/utils/shortcut'

describe('shortcut utils', () => {
  describe('formatShortcut', () => {
    it('returns empty for empty input', () => {
      expect(formatShortcut('')).toBe('')
    })

    it('formats accelerator with + separators', () => {
      const result = formatShortcut('Ctrl+Shift+P')
      // Should contain all parts separated by ' + '
      expect(result).toContain('Shift')
      expect(result).toContain('P')
      expect(result).toContain(' + ')
    })

    it('normalizes Cmd to Command', () => {
      const result = formatShortcut('Cmd+J')
      // On Mac → ⌘, on Windows → Ctrl, either way should not contain 'Cmd'
      expect(result).not.toContain('Cmd')
    })
  })

  describe('formatShortcutHint', () => {
    it('returns empty for empty input', () => {
      expect(formatShortcutHint('')).toBe('')
    })

    it('formats without " + " separators', () => {
      const result = formatShortcutHint('Ctrl+K')
      expect(result).not.toContain(' + ')
    })
  })

  describe('matchesShortcut', () => {
    const mockEvent = (overrides: Partial<KeyboardEvent>): KeyboardEvent =>
      ({ key: 'k', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...overrides }) as KeyboardEvent

    it('matches Command+K', () => {
      expect(matchesShortcut(mockEvent({ metaKey: true, key: 'k' }), 'Command+K')).toBe(true)
    })

    it('does not match without modifier', () => {
      expect(matchesShortcut(mockEvent({ key: 'k' }), 'Command+K')).toBe(false)
    })

    it('matches Ctrl+Shift+P', () => {
      expect(matchesShortcut(mockEvent({ ctrlKey: true, shiftKey: true, key: 'p' }), 'Ctrl+Shift+P')).toBe(true)
    })

    it('does not match wrong key', () => {
      expect(matchesShortcut(mockEvent({ metaKey: true, key: 'j' }), 'Command+K')).toBe(false)
    })

    it('returns false for empty accelerator', () => {
      expect(matchesShortcut(mockEvent({ key: 'k' }), '')).toBe(false)
    })

    it('matches Alt+Space', () => {
      expect(matchesShortcut(mockEvent({ altKey: true, key: 'Space' }), 'Alt+Space')).toBe(true)
    })
  })

  describe('isValidAccelerator', () => {
    it('accepts empty string (disabled)', () => {
      expect(isValidAccelerator('')).toBe(true)
    })

    it('accepts modifier+key combos', () => {
      expect(isValidAccelerator('Command+K')).toBe(true)
      expect(isValidAccelerator('Ctrl+Shift+P')).toBe(true)
    })

    it('accepts function keys without modifier', () => {
      expect(isValidAccelerator('F5')).toBe(true)
      expect(isValidAccelerator('F12')).toBe(true)
    })

    it('rejects single non-function key', () => {
      expect(isValidAccelerator('K')).toBe(false)
      expect(isValidAccelerator('A')).toBe(false)
    })
  })
})
