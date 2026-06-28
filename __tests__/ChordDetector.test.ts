import { describe, it, expect } from 'vitest'
import { ChordDetector } from '../src/ChordDetector.ts'
import type { DetectedPitch } from '../src/MultiPitchDetector.ts'

function pitch(midi: number, magnitude = 0.5): DetectedPitch {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  return {
    frequency: 440 * Math.pow(2, (midi - 69) / 12),
    magnitude,
    noteName: `${noteNames[midi % 12]}${Math.floor(midi / 12) - 1}`,
    midi,
    cents: 0,
  }
}

describe('ChordDetector', () => {
  const detector = new ChordDetector()

  it('returns null for fewer than 2 pitches', () => {
    expect(detector.detect([pitch(60)])).toBeNull()
    expect(detector.detect([])).toBeNull()
  })

  it('detects C major (C E G)', () => {
    expect(detector.detect([pitch(60), pitch(64), pitch(67)])).toBe('C')
  })

  it('detects A minor (A C E)', () => {
    expect(detector.detect([pitch(69), pitch(72), pitch(76)])).toBe('Am')
  })

  it('detects G7 (G B D F)', () => {
    expect(detector.detect([pitch(55), pitch(59), pitch(62), pitch(65)])).toBe('G7')
  })

  it('detects Dsus2 (D E A)', () => {
    expect(detector.detect([pitch(62), pitch(64), pitch(69)])).toBe('Dsus2')
  })

  it('detects E minor (E G B)', () => {
    expect(detector.detect([pitch(52), pitch(55), pitch(59)])).toBe('Em')
  })

  it('returns null for notes not forming a chord', () => {
    expect(detector.detect([pitch(60), pitch(61)])).toBeNull()
  })
})
