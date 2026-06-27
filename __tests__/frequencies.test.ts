import { describe, it, expect } from 'vitest'
import { noteNameToMidi, midiToNoteName, frequencyToMidi, midiToFrequency } from '../src/utils/frequencies.ts'

describe('frequencies', () => {
  it('converts note name to MIDI', () => {
    expect(noteNameToMidi('A4')).toBe(69)
    expect(noteNameToMidi('C4')).toBe(60)
    expect(noteNameToMidi('E2')).toBe(40)
  })

  it('converts MIDI to note name', () => {
    expect(midiToNoteName(69)).toBe('A4')
    expect(midiToNoteName(60)).toBe('C4')
  })

  it('converts MIDI to frequency', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 1)
    expect(midiToFrequency(81)).toBeCloseTo(880, 1)
  })

  it('converts frequency to MIDI', () => {
    expect(frequencyToMidi(440)).toBeCloseTo(69, 0)
    expect(frequencyToMidi(880)).toBeCloseTo(81, 0)
  })
})
