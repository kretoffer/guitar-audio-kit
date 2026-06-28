import { describe, it, expect } from 'vitest'
import { FFTProcessor } from '../src/FFTProcessor.ts'
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

describe('FFTProcessor', () => {
  describe('computeSpectrum', () => {
    it('returns magnitude spectrum of length fftSize / 2', () => {
      const fft = new FFTProcessor(mockEngine(new Float32Array(2048)))
      expect(fft.computeSpectrum()).toHaveLength(1024)
    })
  })

  describe('findPeaks', () => {
    it('finds a peak near 440 Hz for a 440 Hz sine wave', () => {
      const sr = 44100
      const fftSize = 2048
      const binFreq = sr / fftSize
      const freq = Math.round(440 / binFreq) * binFreq
      const data = sine(freq, sr, fftSize)
      const fft = new FFTProcessor(mockEngine(data, fftSize, sr))
      const peaks = fft.findPeaks(0.05)
      expect(peaks.length).toBeGreaterThanOrEqual(1)
      expect(peaks[0].frequency).toBeGreaterThan(400)
      expect(peaks[0].frequency).toBeLessThan(480)
    })

    it('returns empty for zero signal', () => {
      const fft = new FFTProcessor(mockEngine(new Float32Array(2048)))
      expect(fft.findPeaks()).toHaveLength(0)
    })
  })

  describe('setWindowFunction', () => {
    it('accepts all window types without throwing', () => {
      const fft = new FFTProcessor(mockEngine(new Float32Array(2048)))
      const fns = ['hann', 'hamming', 'blackman', 'none'] as const
      for (const fn of fns) {
        expect(() => fft.setWindowFunction(fn)).not.toThrow()
      }
    })
  })
})
