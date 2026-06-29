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

export type InstrumentName =
  | 'guitar'
  | 'guitar7'
  | 'guitar12'
  | 'bass'
  | 'bass5'
  | 'ukulele'
  | 'ukuleleLowG'
  | 'ukuleleBaritone'
  | 'balalaikaPrima'
  | 'balalaikaSecunda'
  | 'balalaikaAlto'
  | 'balalaikaBass'
  | 'domra3Piccolo'
  | 'domra3Prima'
  | 'domra3MezzoSoprano'
  | 'domra3Alto'
  | 'domra3Tenor'
  | 'domra3Bass'
  | 'domra3ContrabassMinor'
  | 'domra3ContrabassMajor'
  | 'domra4Piccolo'
  | 'domra4Prima'
  | 'domra4Alto'
  | 'domra4Tenor'
  | 'domra4Bass'
  | 'domra4Contrabass'
  | 'violPardessus5'
  | 'violPardessus6'
  | 'violTreble'
  | 'violAlto'
  | 'violTenorA'
  | 'violTenorG'
  | 'violBass6'
  | 'violBass7'
  | 'violVioloneA'
  | 'violVioloneG'
  | 'violVioloneD'
  | 'mandolin'
  | 'banjo5'

export interface InstrumentDefinition {
  name: string
  nameRu: string
  stringCount: number
  defaultTuning: string
  tunings: Record<string, string[]>
}
