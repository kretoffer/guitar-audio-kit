import { describe, it, expect } from 'vitest'
import { loadWavFile } from './helpers/loadAudio.ts'
import { StringAnalyzer } from '../src/StringAnalyzer.ts'

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

function analyseFileWithTarget(fileName: string, frets: number[], tuning: string[]) {
  const { data, sampleRate } = loadWavFile(`__tests__/fixtures/audio/${fileName}`)
  const engine = new MockEngine(data, sampleRate)
  const analyzer = new StringAnalyzer(engine, { tuning })
  analyzer.setTarget(frets)

  let result = analyzer.analyse()

  for (let i = 0; i < 100; i++) {
    result = analyzer.analyse()
    if (!result.isSilent && result.strings.some(s => s.status === 'correct')) break
  }

  return result
}

describe('StringAnalyzer with real audio', () => {
  const standardTuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']

  it('detects open E2 as correct from single string', () => {
    const result = analyseFileWithTarget('Open-E2.wav', [-1, -1, -1, -1, -1, 0], standardTuning)

    expect(result.isSilent).toBe(false)
    expect(result.strings[5].status).toBe('correct')
    expect(result.strings[5].detectedNote).toMatch(/^E\d*$/)
  })

  it('detects open A2 as correct from single string', () => {
    const result = analyseFileWithTarget('Open-A2.wav', [-1, 0, -1, -1, -1, -1], standardTuning)

    expect(result.isSilent).toBe(false)
    expect(result.strings[1].status).toBe('correct')
    expect(result.strings[1].detectedNote).toMatch(/^A\d*$/)
  })

  it('detects open D3 as correct from single string', () => {
    const result = analyseFileWithTarget('Open-D3.wav', [-1, -1, 0, -1, -1, -1], standardTuning)

    expect(result.isSilent).toBe(false)
    expect(result.strings[2].status).toBe('correct')
    expect(result.strings[2].detectedNote).toMatch(/^D\d*$/)
  })

  it('detects open G3 as correct from single string', () => {
    const result = analyseFileWithTarget('Open-G3.wav', [-1, -1, -1, 0, -1, -1], standardTuning)

    expect(result.isSilent).toBe(false)
    expect(result.strings[3].status).toBe('correct')
    expect(result.strings[3].detectedNote).toMatch(/^G\d*$/)
  })

  it('detects open B3 as correct from single string', () => {
    const result = analyseFileWithTarget('Open-B3.wav', [-1, -1, -1, -1, 0, -1], standardTuning)

    expect(result.isSilent).toBe(false)
    const bString = result.strings[4]
    expect(bString.status).toBe('correct')
    expect(bString.detectedNote).toMatch(/^B\d*$/)
  })

  it('detects open E4 as correct from single string', () => {
    const result = analyseFileWithTarget('Open-E4.wav', [-1, -1, -1, -1, -1, 0], standardTuning)

    expect(result.isSilent).toBe(false)
    expect(result.strings[5].status).toBe('correct')
    expect(result.strings[5].detectedNote).toMatch(/^E\d*$/)
  })
})
