import { describe, it, expect } from 'vitest'
import { MultiPitchDetector } from '../src/MultiPitchDetector.ts'
import type { AudioEngine } from '../src/AudioEngine.ts'

function mockEngine(data: Float32Array, fftSize = 2048, sampleRate = 44100): AudioEngine {
  return {
    ready: true,
    getSampleRate: () => sampleRate,
    getFftSize: () => fftSize,
    getTimeDomainData: () => data,
    getRmsEnergy: () => 0.1,
  } as AudioEngine
}

function sine(freq: number, sr: number, n: number): Float32Array {
  const buf = new Float32Array(n)
  for (let i = 0; i < n; i++) buf[i] = Math.sin(2 * Math.PI * freq * i / sr)
  return buf
}

describe('MultiPitchDetector', () => {
  it('detects A4 from a 440 Hz sine wave', () => {
    const sr = 44100
    const fftSize = 2048
    const binFreq = sr / fftSize
    const freq = Math.round(440 / binFreq) * binFreq
    const data = sine(freq, sr, fftSize)
    const detector = new MultiPitchDetector(mockEngine(data, fftSize, sr))
    const pitches = detector.detect()
    expect(pitches.length).toBeGreaterThanOrEqual(1)
    expect(pitches[0].noteName).toBe('A4')
    expect(pitches[0].midi).toBe(69)
  })

  it('filters pitches outside frequency range', () => {
    const sr = 44100
    const fftSize = 2048
    const binFreq = sr / fftSize
    const freq = Math.round(440 / binFreq) * binFreq
    const data = sine(freq, sr, fftSize)
    const detector = new MultiPitchDetector(mockEngine(data, fftSize, sr))
    const pitches = detector.detect(1000, 2000)
    expect(pitches).toHaveLength(0)
  })

  it('detects A2 from a 110 Hz sine wave', () => {
    const sr = 44100
    const fftSize = 2048
    const binFreq = sr / fftSize
    const freq = Math.round(110 / binFreq) * binFreq
    const data = sine(freq, sr, fftSize)
    const detector = new MultiPitchDetector(mockEngine(data, fftSize, sr))
    const pitches = detector.detect()
    expect(pitches.length).toBeGreaterThanOrEqual(1)
    expect(pitches[0].noteName).toBe('A2')
  })
})
