import { vi, describe, it, expect, beforeEach } from 'vitest'

const { mockPitchDetect } = vi.hoisted(() => ({
  mockPitchDetect: vi.fn<(min?: number, max?: number) => number | null>(),
}))

vi.mock('../src/PitchDetector.ts', () => ({
  PitchDetector: vi.fn().mockImplementation(() => ({
    detect: mockPitchDetect,
    reset: vi.fn(),
  })),
}))

import { Tuner } from '../src/Tuner.ts'
import type { AudioEngine } from '../src/AudioEngine.ts'

describe('Tuner', () => {
  const mockEngine = {} as AudioEngine

  beforeEach(() => {
    mockPitchDetect.mockReset()
  })

  it('returns null when pitch detector returns null', () => {
    mockPitchDetect.mockReturnValue(null)
    const tuner = new Tuner(mockEngine)
    expect(tuner.detect()).toBeNull()
  })

  it('returns null before reaching stable threshold', () => {
    mockPitchDetect.mockReturnValue(440)
    const tuner = new Tuner(mockEngine, { stableThreshold: 10 })
    for (let i = 0; i < 9; i++) {
      expect(tuner.detect()).toBeNull()
    }
  })

  it('locks after reaching stable threshold', () => {
    mockPitchDetect.mockReturnValue(440)
    const tuner = new Tuner(mockEngine, { stableThreshold: 3 })
    tuner.detect()
    tuner.detect()
    const result = tuner.detect()
    expect(result).not.toBeNull()
    expect(result!.frequency).toBeCloseTo(440, 0)
    expect(result!.note).toBe('A4')
    expect(result!.octave).toBe(4)
    expect(result!.isInTune).toBe(true)
  })

  it('returns locked result while frequency stays stable', () => {
    mockPitchDetect.mockReturnValue(440)
    const tuner = new Tuner(mockEngine, { stableThreshold: 2 })
    tuner.detect()
    tuner.detect() // lock
    const r1 = tuner.detect()
    const r2 = tuner.detect()
    expect(r1).not.toBeNull()
    expect(r2).not.toBeNull()
    expect(r1!.frequency).toBe(440)
    expect(r2!.frequency).toBe(440)
  })

  it('transitions to new note after stable candidate', () => {
    mockPitchDetect.mockReturnValue(440)
    const tuner = new Tuner(mockEngine, { stableThreshold: 3 })
    tuner.detect()
    tuner.detect()
    tuner.detect() // locked on 440

    mockPitchDetect.mockReturnValue(392)
    // After lock, different note starts candidate tracking
    tuner.detect() // candidate: 392 count=1
    tuner.detect() // candidate: 392 count=2
    const result = tuner.detect() // candidate: 392 count=3 >= threshold
    expect(result).not.toBeNull()
    expect(result!.frequency).toBeCloseTo(392, 0)
    expect(result!.note).toBe('G4')
    expect(result!.octave).toBe(4)
  })

  it('returns latest locked result during candidate tracking', () => {
    mockPitchDetect.mockReturnValue(440)
    const tuner = new Tuner(mockEngine, { stableThreshold: 2 })
    tuner.detect()
    tuner.detect() // locked on 440

    mockPitchDetect.mockReturnValue(392)
    // During candidate tracking, returns the old locked result
    const result = tuner.detect()
    expect(result).not.toBeNull()
    expect(result!.frequency).toBeCloseTo(440, 0)
  })

  it('reset clears state', () => {
    mockPitchDetect.mockReturnValue(440)
    const tuner = new Tuner(mockEngine, { stableThreshold: 2 })
    tuner.detect()
    tuner.detect() // locked
    tuner.reset()
    expect(tuner.detect()).toBeNull() // back to idle
  })

  it('setTarget changes target note and octave', () => {
    mockPitchDetect.mockReturnValue(294)
    const tuner = new Tuner(mockEngine, { stableThreshold: 2 })
    tuner.setTarget('D', 4)
    tuner.detect()
    const result = tuner.detect()
    expect(result).not.toBeNull()
    expect(result!.targetNote).toBe('D4')
  })

  it('uses custom cent tolerance', () => {
    mockPitchDetect.mockReturnValue(445)
    const tuner = new Tuner(mockEngine, { stableThreshold: 2, centTolerance: 50 })
    tuner.detect()
    const result = tuner.detect()
    expect(result).not.toBeNull()
    expect(result!.isInTune).toBe(false)
    expect(result!.cents).toBeGreaterThan(5)
  })
})
