import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { DetectedPitch } from '../src/MultiPitchDetector.ts'

const { mockMultiDetect } = vi.hoisted(() => ({
  mockMultiDetect: vi.fn<(min?: number, max?: number) => DetectedPitch[]>(),
}))

vi.mock('../src/MultiPitchDetector.ts', () => ({
  MultiPitchDetector: vi.fn().mockImplementation(() => ({
    detect: mockMultiDetect,
  })),
  DetectedPitch: {},
}))

import { StringAnalyzer } from '../src/StringAnalyzer.ts'
import type { AudioEngine } from '../src/AudioEngine.ts'

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

function mockEngine(ready = true, rms = 0.1): AudioEngine {
  return {
    ready,
    getSampleRate: () => 44100,
    getFftSize: () => 2048,
    getTimeDomainData: () => new Float32Array(2048),
    getRmsEnergy: () => rms,
  } as AudioEngine
}

describe('StringAnalyzer', () => {
  const standardTuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']

  beforeEach(() => {
    mockMultiDetect.mockReset()
  })

  it('returns silent result when engine is not ready', () => {
    const analyzer = new StringAnalyzer(mockEngine(false), { tuning: standardTuning })
    const result = analyzer.analyse()
    expect(result.isSilent).toBe(true)
    expect(result.rms).toBe(0)
    expect(result.strings).toHaveLength(0)
  })

  it('returns muted strings when RMS is below silence threshold', () => {
    const analyzer = new StringAnalyzer(mockEngine(true, 0.001), { tuning: standardTuning })
    analyzer.setTarget([0, 5, 5, 0, 0, 0])
    const result = analyzer.analyse()
    expect(result.isSilent).toBe(true)
    expect(result.strings).toHaveLength(6)
    expect(result.strings[0].status).toBe('inactive') // fret 0
    expect(result.strings[1].status).toBe('muted')     // fret > 0
  })

  it('detects open strings as correct', () => {
    mockMultiDetect.mockReturnValue([
      pitch(40, 0.5),  // E2
      pitch(45, 0.5),  // A2
      pitch(50, 0.5),  // D3
      pitch(55, 0.5),  // G3
      pitch(59, 0.5),  // B3
      pitch(64, 0.5),  // E4
    ])
    const analyzer = new StringAnalyzer(mockEngine(), { tuning: standardTuning })
    analyzer.setTarget([0, 0, 0, 0, 0, 0])
    const result = analyzer.analyse()
    expect(result.isSilent).toBe(false)
    expect(result.strings.every(s => s.status === 'correct')).toBe(true)
  })

  it('identifies wrong strings when open string sounds instead of fretted', () => {
    mockMultiDetect.mockReturnValue([
      pitch(40, 0.5),  // E2 only (open 6th, but fret 5 expected)
    ])
    const analyzer = new StringAnalyzer(mockEngine(), { tuning: standardTuning })
    analyzer.setTarget([5, 0, 0, 0, 0, 0])
    const result = analyzer.analyse()
    expect(result.strings[0].status).toBe('wrong')
  })

  it('marks unplayed strings as inactive', () => {
    mockMultiDetect.mockReturnValue([])
    const analyzer = new StringAnalyzer(mockEngine(), { tuning: standardTuning })
    analyzer.setTarget([0, 0, 0, 0, 0, 0])
    const result = analyzer.analyse()
    expect(result.strings.every(s => s.status === 'inactive')).toBe(true)
  })

  it('marks muted strings with extra ringing as extra', () => {
    mockMultiDetect.mockReturnValue([
      pitch(40, 0.5),  // E2 ringing on muted string
    ])
    const analyzer = new StringAnalyzer(mockEngine(), { tuning: standardTuning })
    analyzer.setTarget([-1, 0, 0, 0, 0, 0])
    const result = analyzer.analyse()
    expect(result.strings[0].status).toBe('extra')
  })

  it('calculates confidence correctly', () => {
    mockMultiDetect.mockReturnValue([
      pitch(40, 0.5),  // E2 - open, correct
      pitch(45, 0.5),  // A2 - open, correct
    ])
    const analyzer = new StringAnalyzer(mockEngine(), { tuning: standardTuning })
    analyzer.setTarget([0, 0, 5, 5, 0, 0])
    const result = analyzer.analyse()
    expect(result.confidence).toBeGreaterThan(0)
  })
})
