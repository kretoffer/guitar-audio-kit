import { describe, it, expect } from 'vitest'
import { loadWavFile } from './helpers/loadAudio.ts'
import { MultiPitchDetector, type DetectedPitch } from '../src/MultiPitchDetector.ts'

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

function collectMultiPitchDetections(
  fileName: string,
  maxCalls: number = 200
): DetectedPitch[][] {
  const { data, sampleRate } = loadWavFile(`__tests__/fixtures/audio/${fileName}`)
  const engine = new MockEngine(data, sampleRate)
  const detector = new MultiPitchDetector(engine as any)
  const results: DetectedPitch[][] = []

  for (let i = 0; i < maxCalls; i++) {
    const pitches = detector.detect()
    if (pitches.length > 0) {
      results.push(pitches)
      if (results.length >= 30) break
    }
  }

  return results
}

function uniqueNoteNames(pitches: DetectedPitch[]): Set<string> {
  return new Set(pitches.map(p => p.noteName))
}

describe('MultiPitchDetector with real audio', () => {
  it('detects some pitches from open E2 recording', () => {
    const frames = collectMultiPitchDetections('Open-E2.wav')
    expect(frames.length).toBeGreaterThan(0)
    const allPitches = frames.flat()
    expect(allPitches.length).toBeGreaterThan(0)
    const uniqueNotes = uniqueNoteNames(allPitches)
    expect(uniqueNotes.size).toBeGreaterThanOrEqual(1)
  })

  it('detects some pitches from open A2 recording', () => {
    const frames = collectMultiPitchDetections('Open-A2.wav')
    expect(frames.length).toBeGreaterThan(0)
    const allPitches = frames.flat()
    expect(allPitches.length).toBeGreaterThan(0)
  })

  it('detects E4 (329.63 Hz) from open 1st string recording', () => {
    const frames = collectMultiPitchDetections('Open-E4.wav')
    expect(frames.length).toBeGreaterThan(0)
    const allPitches = frames.flat()
    const ePitches = allPitches.filter(p =>
      p.noteName.startsWith('E') && p.frequency > 300 && p.frequency < 360
    )
    expect(ePitches.length).toBeGreaterThan(0)
  })

  it('detects some pitches from chord recording', () => {
    const frames = collectMultiPitchDetections('Chord-C-maj.wav')
    expect(frames.length).toBeGreaterThan(0)
    const framesWithMultiple = frames.filter(f => f.length >= 3)
    expect(framesWithMultiple.length).toBeGreaterThan(0)
  })
})
