import { describe, it, expect } from 'vitest'
import { NOTES, STANDARD_TUNING, NOTE_FREQUENCIES_BASE, FREQ_TABLE } from '../src/constants.ts'

describe('constants', () => {
  it('NOTES has 12 chromatic notes starting with C', () => {
    expect(NOTES).toHaveLength(12)
    expect(NOTES[0]).toBe('C')
    expect(NOTES[9]).toBe('A')
  })

  it('STANDARD_TUNING defines 6-string guitar tuning', () => {
    expect(STANDARD_TUNING).toHaveLength(6)
    expect(STANDARD_TUNING).toEqual(['E2', 'A2', 'D3', 'G3', 'B3', 'E4'])
  })

  it('NOTE_FREQUENCIES_BASE has base frequencies for all 12 notes', () => {
    expect(Object.keys(NOTE_FREQUENCIES_BASE)).toHaveLength(12)
    expect(NOTE_FREQUENCIES_BASE.A).toBeCloseTo(27.5, 1)
    expect(NOTE_FREQUENCIES_BASE.C).toBeCloseTo(16.35, 1)
  })

  it('FREQ_TABLE contains 9 octaves per note', () => {
    expect(Object.keys(FREQ_TABLE)).toHaveLength(12)
    for (const note of NOTES) {
      expect(FREQ_TABLE[note]).toHaveLength(9)
    }
    expect(FREQ_TABLE.A[4]).toBeCloseTo(440, 0)
    expect(FREQ_TABLE.C[4]).toBeCloseTo(261.6, 0)
    expect(FREQ_TABLE.E[2]).toBeCloseTo(82.4, 0)
  })
})
