import type { AudioEngine } from './AudioEngine.ts'
import { MultiPitchDetector, type DetectedPitch } from './MultiPitchDetector.ts'
import { noteNameToFrequency } from './utils/frequencies.ts'
import type { StringState, AnalyseResult, InstrumentName, InstrumentDefinition } from './types.ts'
import { getInstrument, getTuning } from './constants.ts'

export interface StringAnalyzerConfig {
  tuning?: string[]
  instrument?: InstrumentName
  silenceThreshold?: number
}

export class StringAnalyzer {
  private engine: AudioEngine
  private multiPitch: MultiPitchDetector
  private tuning: string[]
  private instrument: InstrumentName | null = null
  private targetFrets: number[] = []
  private silenceThreshold: number

  constructor(engine: AudioEngine, config: StringAnalyzerConfig) {
    this.engine = engine
    this.multiPitch = new MultiPitchDetector(engine)
    this.silenceThreshold = config.silenceThreshold ?? 0.005

    if (config.instrument) {
      this.instrument = config.instrument
      const def = getInstrument(config.instrument)
      this.tuning = config.tuning ?? getTuning(config.instrument)
      if (config.tuning && config.tuning.length !== def.stringCount) {
        throw new Error(
          `${def.name} expects ${def.stringCount} strings, got ${config.tuning.length}`
        )
      }
    } else {
      this.tuning = config.tuning ?? []
    }
  }

  setTarget(frets: number[]): void { this.targetFrets = frets }
  setTuning(tuning: string[]): void { this.tuning = tuning }

  getStringCount(): number {
    return this.tuning.length
  }

  getInstrumentName(): InstrumentName | null {
    return this.instrument
  }

  getInstrumentDef(): InstrumentDefinition | null {
    return this.instrument ? getInstrument(this.instrument) : null
  }

  analyse(): AnalyseResult {
    const timestamp = Date.now()
    if (!this.engine.ready) {
      return { strings: [], detectedChord: null, targetChord: '', confidence: 0, timestamp, rms: 0, isSilent: true }
    }

    const rms = this.engine.getRmsEnergy()
    if (rms < this.silenceThreshold) {
      const strings: StringState[] = this.tuning.map((openNote, i) => ({
        string: i,
        status: this.targetFrets[i] > 0 ? 'muted' : 'inactive',
        frequency: null, amplitude: 0,
        expectedNote: openNote.replace(/[0-9]/g, ''),
        detectedNote: null,
      }))
      return { strings, detectedChord: null, targetChord: '', confidence: 0, timestamp, rms, isSilent: true }
    }

    const maxFreq = this.tuning.some(n => {
      const m = n.match(/[0-9]+/)
      return m && parseInt(m[0]) >= 5
    }) ? 2000 : 1200
    const pitches = this.multiPitch.detect(60, maxFreq)

    const strings: StringState[] = this.tuning.map((openNote, stringIndex) => {
      const fret = this.targetFrets[stringIndex] ?? 0
      const expectedNote = fret <= 0 ? openNote : this.fretToNote(stringIndex, fret)
      const expectedNoteName = expectedNote.replace(/[0-9]/g, '')

      const matchingPitch = fret > 0 ? this.findMatchingPitch(pitches, this.calculateStringFrequency(stringIndex, fret), 0.04) : null
      const openPitch = pitches.find(p => {
        const freq = noteNameToFrequency(openNote)
        return Math.abs(p.frequency - freq) / freq < 0.04 && p.magnitude > 0.15
      })

      let status: StringState['status']
      let detectedNote: string | null = null
      let frequency: number | null = null
      let amplitude = 0

      if (fret === -1) {
        if (openPitch || (matchingPitch && matchingPitch.magnitude > 0.15)) {
          status = 'extra'
          detectedNote = openPitch?.noteName ?? matchingPitch!.noteName
          frequency = openPitch?.frequency ?? matchingPitch!.frequency
          amplitude = openPitch?.magnitude ?? matchingPitch!.magnitude
        } else {
          status = 'inactive'
        }
      } else if (fret === 0) {
        if (openPitch) {
          status = 'correct'
          detectedNote = openNote
          frequency = openPitch.frequency
          amplitude = openPitch.magnitude
        } else {
          status = 'inactive'
        }
      } else if (matchingPitch && matchingPitch.magnitude > 0.15) {
        status = 'correct'
        detectedNote = matchingPitch.noteName
        frequency = matchingPitch.frequency
        amplitude = matchingPitch.magnitude
      } else if (openPitch && openPitch.magnitude > 0.15) {
        status = 'wrong'
        detectedNote = openPitch.noteName
        frequency = openPitch.frequency
        amplitude = openPitch.magnitude
      } else {
        status = 'muted'
      }

      return { string: stringIndex, status, frequency, amplitude, expectedNote: expectedNoteName, detectedNote }
    })

    const correctCount = strings.filter(s => s.status === 'correct').length
    const extraCount = strings.filter(s => s.status === 'extra').length
    const targetCount = strings.filter((_, i) => this.targetFrets[i] > 0).length
    const muteCount = strings.filter((_, i) => this.targetFrets[i] === -1).length
    const totalExpected = targetCount + muteCount
    const confidence = totalExpected > 0 ? Math.max(0, correctCount - extraCount) / totalExpected : 0

    return { strings, detectedChord: null, targetChord: '', confidence, timestamp, rms, isSilent: false }
  }

  private calculateStringFrequency(stringIndex: number, fret: number): number {
    return noteNameToFrequency(this.tuning[stringIndex]) * Math.pow(2, fret / 12)
  }

  private fretToNote(stringIndex: number, fret: number): string {
    const openNote = this.tuning[stringIndex]
    const noteMatch = openNote.match(/^([A-G]#?)([0-8])$/)
    if (!noteMatch) return openNote
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const totalSemitones = noteNames.indexOf(noteMatch[1]) + fret
    return `${noteNames[totalSemitones % 12]}${parseInt(noteMatch[2]) + Math.floor(totalSemitones / 12)}`
  }

  private findMatchingPitch(pitches: DetectedPitch[], targetFreq: number, tolerance: number): DetectedPitch | null {
    let best: DetectedPitch | null = null
    let bestError = Infinity
    for (const p of pitches) {
      const e = Math.abs(p.frequency - targetFreq) / targetFreq
      if (e < tolerance && e < bestError) { bestError = e; best = p }
    }
    return best
  }
}
