export type StringStatus = 'inactive' | 'correct' | 'wrong' | 'muted' | 'extra'

export interface StringState {
  string: number
  status: StringStatus
  frequency: number | null
  amplitude: number
  expectedNote: string
  detectedNote: string | null
}

export interface AnalyseResult {
  strings: StringState[]
  detectedChord: string | null
  targetChord: string
  confidence: number
  timestamp: number
  rms: number
  isSilent: boolean
}

export interface TuningResult {
  note: string
  octave: number
  frequency: number
  cents: number
  targetNote: string
  targetFrequency: number
  isInTune: boolean
}

export interface NoteInfo {
  name: string
  octave: number
  midi: number
  frequency: number
  cents: number
}

export interface ChordShape {
  name: string
  frets: number[]
  fingers: (number | null)[]
  tuning?: string[]
}
