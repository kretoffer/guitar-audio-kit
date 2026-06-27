import type { AudioEngine } from './AudioEngine.ts'
import { PitchDetector } from './PitchDetector.ts'
import { frequencyToNote } from './utils/frequencies.ts'
import type { TuningResult } from './types.ts'

export interface TunerConfig {
  stableThreshold?: number
  centTolerance?: number
}

export class Tuner {
  private pitchDetector: PitchDetector
  private targetNote: string = 'A'
  private targetOctave: number = 4
  private cfg: Required<TunerConfig>

  private state: 'idle' | 'locked' = 'idle'
  private stableFrames = 0
  private candidateFreq: number | null = null
  private candidateCount = 0
  private lockedFreq: number | null = null
  private lockedResult: TuningResult | null = null

  constructor(_engine: AudioEngine, config?: TunerConfig) {
    this.pitchDetector = new PitchDetector(_engine)
    this.cfg = {
      stableThreshold: config?.stableThreshold ?? 10,
      centTolerance: config?.centTolerance ?? 20,
    }
  }

  setTarget(note: string, octave: number): void {
    this.targetNote = note
    this.targetOctave = octave
  }

  reset(): void {
    this.state = 'idle'
    this.stableFrames = 0
    this.candidateFreq = null
    this.candidateCount = 0
    this.lockedFreq = null
    this.lockedResult = null
    this.pitchDetector.reset()
  }

  detect(): TuningResult | null {
    const rawFreq = this.pitchDetector.detect(60, 1500)
    const freq = rawFreq !== null && this.freqValid(rawFreq) ? rawFreq : null

    if (freq === null) {
      if (this.state === 'locked') {
        return this.lockedResult
      }
      this.stableFrames = 0
      return null
    }

    if (this.state !== 'locked') {
      this.stableFrames = this.stableFrames > 0 && this.sameNote(freq, this.lockedFreq ?? freq)
        ? this.stableFrames + 1
        : 1
      this.lockedFreq = freq

      if (this.stableFrames >= this.cfg.stableThreshold) {
        this.lockedResult = this.buildResult(freq)
        this.state = 'locked'
        this.candidateCount = 0
        this.candidateFreq = null
        return this.lockedResult
      }
      return null
    }

    if (this.sameNote(freq, this.lockedFreq!)) {
      this.candidateCount = 0
      this.candidateFreq = null
      this.lockedFreq = freq
      this.lockedResult = this.buildResult(freq)
      return this.lockedResult
    }

    if (this.candidateFreq !== null && this.sameNote(freq, this.candidateFreq)) {
      this.candidateCount++
    } else {
      this.candidateFreq = freq
      this.candidateCount = 1
    }

    if (this.candidateCount >= this.cfg.stableThreshold) {
      this.lockedFreq = freq
      this.lockedResult = this.buildResult(freq)
      this.candidateFreq = null
      this.candidateCount = 0
      return this.lockedResult
    }

    return this.lockedResult
  }

  private freqValid(freq: number): boolean {
    if (freq < 30 || freq > 2000) return false

    const targetFreq = this.getTargetFreq()
    const cents = 1200 * Math.log2(freq / targetFreq)
    if (Math.abs(cents) > 600) return false

    return true
  }

  private getTargetFreq(): number {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const targetMidi = (this.targetOctave + 1) * 12 + noteNames.indexOf(this.targetNote)
    return 440 * Math.pow(2, (targetMidi - 69) / 12)
  }

  private sameNote(freq1: number, freq2: number): boolean {
    const cents = 1200 * Math.log2(freq1 / freq2)
    return Math.abs(cents) < this.cfg.centTolerance
  }

  private buildResult(freq: number): TuningResult {
    const noteInfo = frequencyToNote(freq)
    const targetFreq = this.getTargetFreq()
    const expectedCents = 1200 * Math.log2(freq / targetFreq)
    const isInTune = Math.abs(expectedCents) < 5

    return {
      note: noteInfo.name,
      octave: noteInfo.octave,
      frequency: freq,
      cents: Math.round(expectedCents),
      targetNote: `${this.targetNote}${this.targetOctave}`,
      targetFrequency: targetFreq,
      isInTune,
    }
  }
}
