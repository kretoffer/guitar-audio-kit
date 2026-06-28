import { describe, it, expect } from 'vitest'
import { noteNameToMidi, midiToNoteName, frequencyToMidi, midiToFrequency, frequencyToNote, noteToFrequency, noteNameToFrequency } from '../src/utils/frequencies.ts'

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

  it('frequencyToNote returns note info for a given frequency', () => {
    const result = frequencyToNote(440)
    expect(result.name).toBe('A4')
    expect(result.octave).toBe(4)
    expect(result.midi).toBe(69)
    expect(Math.abs(result.cents)).toBeLessThanOrEqual(1)

    const result2 = frequencyToNote(261.63)
    expect(result2.name).toBe('C4')
    expect(result2.octave).toBe(4)
  })

  it('noteToFrequency converts note and octave to frequency', () => {
    expect(noteToFrequency('A', 4)).toBeCloseTo(440, 0)
    expect(noteToFrequency('C', 4)).toBeCloseTo(261.6, 0)
  })

  it('noteNameToFrequency converts note name to frequency', () => {
    expect(noteNameToFrequency('A4')).toBeCloseTo(440, 0)
    expect(noteNameToFrequency('C4')).toBeCloseTo(261.6, 0)
  })

  it('throws on invalid note name', () => {
    expect(() => noteNameToMidi('Z4')).toThrow('Invalid note name: Z4')
  })
})
