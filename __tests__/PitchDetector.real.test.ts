import { describe, it, expect } from 'vitest'
import { loadWavFile } from './helpers/loadAudio.ts'
import { PitchDetector } from '../src/PitchDetector.ts'

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

function collectDetections(
  fileName: string,
  maxCalls: number = 300
): number[] {
  const { data, sampleRate } = loadWavFile(`__tests__/fixtures/audio/${fileName}`)
  const engine = new MockEngine(data, sampleRate)
  const detector = new PitchDetector(engine as any)
  const results: number[] = []

  for (let i = 0; i < maxCalls; i++) {
    const f = detector.detect()
    if (f !== null && f > 0) {
      results.push(f)
    }
  }

  return results
}

describe('PitchDetector with real audio', () => {
  it('detects E2 (82.41 Hz) from open 6th string', () => {
    const results = collectDetections('Open-E2.wav')
    expect(results.length).toBeGreaterThan(5)
    const median = [...results].sort((a, b) => a - b)[Math.floor(results.length / 2)]
    expect(median).toBeGreaterThan(75)
    expect(median).toBeLessThan(90)
  })

  it('detects A2 (110 Hz) from open 5th string', () => {
    const results = collectDetections('Open-A2.wav')
    expect(results.length).toBeGreaterThan(5)
    const median = [...results].sort((a, b) => a - b)[Math.floor(results.length / 2)]
    expect(median).toBeGreaterThan(100)
    expect(median).toBeLessThan(120)
  })

  it('detects D3 (146.83 Hz) from open 4th string', () => {
    const results = collectDetections('Open-D3.wav')
    expect(results.length).toBeGreaterThan(5)
    const median = [...results].sort((a, b) => a - b)[Math.floor(results.length / 2)]
    expect(median).toBeGreaterThan(135)
    expect(median).toBeLessThan(155)
  })

  it('detects G3 (196 Hz) from open 3rd string', () => {
    const results = collectDetections('Open-G3.wav')
    expect(results.length).toBeGreaterThan(5)
    const median = [...results].sort((a, b) => a - b)[Math.floor(results.length / 2)]
    expect(median).toBeGreaterThan(185)
    expect(median).toBeLessThan(210)
  })

  it('detects B3 (246.94 Hz) from open 2nd string', () => {
    const results = collectDetections('Open-B3.wav')
    expect(results.length).toBeGreaterThan(5)
    const median = [...results].sort((a, b) => a - b)[Math.floor(results.length / 2)]
    expect(median).toBeGreaterThan(235)
    expect(median).toBeLessThan(260)
  })

  it('detects E4 (329.63 Hz) from open 1st string', () => {
    const results = collectDetections('Open-E4.wav')
    expect(results.length).toBeGreaterThan(5)
    const median = [...results].sort((a, b) => a - b)[Math.floor(results.length / 2)]
    expect(median).toBeGreaterThan(315)
    expect(median).toBeLessThan(345)
  })
})
