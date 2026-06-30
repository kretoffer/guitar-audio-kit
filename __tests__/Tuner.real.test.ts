import { describe, it, expect } from 'vitest'
import { loadWavFile } from './helpers/loadAudio.ts'
import { Tuner } from '../src/Tuner.ts'

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

function tuneFile(fileName: string, targetNote: string, targetOctave: number, stableThreshold = 10) {
  const { data, sampleRate } = loadWavFile(`__tests__/fixtures/audio/${fileName}`)
  const engine = new MockEngine(data, sampleRate)
  const tuner = new Tuner(engine as any, { stableThreshold })
  tuner.setTarget(targetNote, targetOctave)

  let result = null
  for (let i = 0; i < 150; i++) {
    result = tuner.detect()
    if (result !== null && result.frequency > 0 && result.note === `${targetNote}${targetOctave}`) {
      break
    }
  }

  return result
}

describe('Tuner with real audio', () => {
  it('tunes open E2 string to E2 target', () => {
    const result = tuneFile('Open-E2.wav', 'E', 2)
    expect(result).not.toBeNull()
    expect(result!.note).toBe('E2')
    expect(result!.frequency).toBeGreaterThan(75)
    expect(result!.frequency).toBeLessThan(90)
  })

  it('tunes open A2 string to A2 target', () => {
    const result = tuneFile('Open-A2.wav', 'A', 2)
    expect(result).not.toBeNull()
    expect(result!.note).toBe('A2')
    expect(result!.frequency).toBeGreaterThan(100)
    expect(result!.frequency).toBeLessThan(120)
  })

  it('tunes open D3 string to D3 target', () => {
    const result = tuneFile('Open-D3.wav', 'D', 3)
    expect(result).not.toBeNull()
    expect(result!.note).toBe('D3')
    expect(result!.frequency).toBeGreaterThan(135)
    expect(result!.frequency).toBeLessThan(155)
  })

  it('tunes open G3 string to G3 target', () => {
    const result = tuneFile('Open-G3.wav', 'G', 3)
    expect(result).not.toBeNull()
    expect(result!.note).toBe('G3')
    expect(result!.frequency).toBeGreaterThan(185)
    expect(result!.frequency).toBeLessThan(210)
  })

  it('tunes open B3 string to B3 target', () => {
    const result = tuneFile('Open-B3.wav', 'B', 3)
    expect(result).not.toBeNull()
    expect(result!.note).toBe('B3')
    expect(result!.frequency).toBeGreaterThan(235)
    expect(result!.frequency).toBeLessThan(260)
  })

  it('tunes open E4 string to E4 target', () => {
    const result = tuneFile('Open-E4.wav', 'E', 4)
    expect(result).not.toBeNull()
    expect(result!.note).toBe('E4')
    expect(result!.frequency).toBeGreaterThan(315)
    expect(result!.frequency).toBeLessThan(345)
  })

  it('reports isInTune for a properly tuned string', () => {
    const result = tuneFile('Open-A2.wav', 'A', 2)
    expect(result).not.toBeNull()
    expect(Math.abs(result!.cents)).toBeLessThan(30)
  })
})
