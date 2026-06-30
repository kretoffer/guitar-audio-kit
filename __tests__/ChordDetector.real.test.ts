import { describe, it, expect } from 'vitest'
import { loadWavFile } from './helpers/loadAudio.ts'
import { MultiPitchDetector } from '../src/MultiPitchDetector.ts'
import { ChordDetector } from '../src/ChordDetector.ts'

class MockEngine {
  private data: Float32Array
  private offset = 0
  readonly ready = true
  readonly sampleRate: number

  constructor(data: Float32Array, sampleRate: number) {
    this.data = data
    this.sampleRate = sampleRate
  }

  getSampleRate(): number { return this.sampleRate }
  getFftSize(): number { return 2048 }
  getRmsEnergy(): number { return 0.1 }

  getTimeDomainData(): Float32Array {
    const n = this.getFftSize()
    const chunk = new Float32Array(n)
    for (let i = 0; i < n; i++) chunk[i] = this.data[this.offset + i] ?? 0
    this.offset += n
    return chunk
  }
}

function filterStrongPitches(
  pitches: { frequency: number; magnitude: number; noteName: string; midi: number; cents: number }[],
  maxCount: number = 6
): typeof pitches {
  const sorted = [...pitches].sort((a, b) => b.magnitude - a.magnitude)
  return sorted.slice(0, maxCount)
}

function detectChordFromFile(fileName: string): string | null {
  const { data, sampleRate } = loadWavFile(`__tests__/fixtures/audio/${fileName}`)
  const engine = new MockEngine(data, sampleRate)
  const multiPitch = new MultiPitchDetector(engine as any)
  const chordDetector = new ChordDetector()

  const chordVotes: Map<string, number> = new Map()

  for (let i = 0; i < 100; i++) {
    const rawPitches = multiPitch.detect()
    if (rawPitches.length >= 2) {
      const pitches = filterStrongPitches(rawPitches, 6)
      const chord = chordDetector.detect(pitches)
      if (chord !== null) {
        chordVotes.set(chord, (chordVotes.get(chord) ?? 0) + 1)
        if (chordVotes.get(chord)! >= 5) break
      }
    }
  }

  if (chordVotes.size === 0) return null

  let bestChord: string | null = null
  let bestVotes = 0
  for (const [chord, votes] of chordVotes) {
    if (votes > bestVotes) {
      bestVotes = votes
      bestChord = chord
    }
  }

  return bestChord
}

describe('ChordDetector with real audio pipeline', () => {
  it('detects a chord (not null) from C major recording', () => {
    const chord = detectChordFromFile('Chord-C-maj.wav')
    expect(chord).not.toBeNull()
  })

  it('detects a chord (not null) from A minor recording', () => {
    const chord = detectChordFromFile('Chord-A-min.wav')
    expect(chord).not.toBeNull()
  })

  it('detects a chord (not null) from G7 recording', () => {
    const chord = detectChordFromFile('Chord-G7.wav')
    expect(chord).not.toBeNull()
  })

  it('detects a chord (not null) from E minor recording', () => {
    const chord = detectChordFromFile('Chord-Em.wav')
    expect(chord).not.toBeNull()
  })

  it('detects a chord (not null) from Dsus2 recording', () => {
    const chord = detectChordFromFile('Chord-Dsus2.wav')
    expect(chord).not.toBeNull()
  })
})
