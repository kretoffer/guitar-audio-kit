export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

export const STANDARD_TUNING: [string, string, string, string, string, string] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']

export const NOTE_FREQUENCIES_BASE: Record<string, number> = {
  C: 16.3516,
  'C#': 17.3239,
  D: 18.3540,
  'D#': 19.4454,
  E: 20.6017,
  F: 21.8268,
  'F#': 23.1247,
  G: 24.4997,
  'G#': 25.9565,
  A: 27.5000,
  'A#': 29.1352,
  B: 30.8677,
}

export const FREQ_TABLE: Record<string, number[]> = {}
for (const [note, baseFreq] of Object.entries(NOTE_FREQUENCIES_BASE)) {
  const freqs: number[] = []
  for (let o = 0; o <= 8; o++) {
    freqs.push(baseFreq * Math.pow(2, o))
  }
  FREQ_TABLE[note] = freqs
}
