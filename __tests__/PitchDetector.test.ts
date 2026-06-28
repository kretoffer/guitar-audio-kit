import { describe, it, expect } from 'vitest'
import { PitchDetector } from '../src/PitchDetector.ts'
import type { AudioEngine } from '../src/AudioEngine.ts'

function mockEngine(overrides: Partial<AudioEngine> = {}): AudioEngine {
  return {
    ready: true,
    getSampleRate: () => 44100,
    getFftSize: () => 2048,
    getTimeDomainData: () => new Float32Array(2048),
    getRmsEnergy: () => 0.1,
    ...overrides,
  } as AudioEngine
}

function sine(freq: number, sr: number, n: number): Float32Array {
  const buf = new Float32Array(n)
  for (let i = 0; i < n; i++) buf[i] = Math.sin(2 * Math.PI * freq * i / sr)
  return buf
}

describe('PitchDetector', () => {
  it('returns null when engine is not ready', () => {
    const detector = new PitchDetector(mockEngine({ ready: false }))
    expect(detector.detect()).toBeNull()
  })

  it('returns null for silent signal', () => {
    const detector = new PitchDetector(mockEngine({ getRmsEnergy: () => 0.001 }))
    expect(detector.detect()).toBeNull()
  })

  it('detects frequency of a sine wave', () => {
    const sr = 44100
    const data = sine(440, sr, 2048)
    const detector = new PitchDetector(mockEngine({ getTimeDomainData: () => data }))
    const freq = detector.detect()
    expect(freq).not.toBeNull()
    expect(freq!).toBeGreaterThan(430)
    expect(freq!).toBeLessThan(450)
  })

  it('returns null for out-of-range frequency', () => {
    const sr = 44100
    const data = sine(2000, sr, 2048)
    const detector = new PitchDetector(mockEngine({ getTimeDomainData: () => data }))
    expect(detector.detect(50, 1000)).toBeNull()
  })

  it('resets history', () => {
    const sr = 44100
    const data = sine(440, sr, 2048)
    const detector = new PitchDetector(mockEngine({ getTimeDomainData: () => data }))
    detector.detect()
    detector.reset()
    const freq = detector.detect()
    expect(freq).not.toBeNull()
  })
})
