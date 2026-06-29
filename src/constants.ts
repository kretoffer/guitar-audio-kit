import type { InstrumentDefinition, InstrumentName } from './types.ts'

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

export const INSTRUMENTS: Record<InstrumentName, InstrumentDefinition> = {
  guitar: {
    name: 'Guitar',
    nameRu: 'Гитара',
    stringCount: 6,
    defaultTuning: 'standard',
    tunings: {
      standard: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
      dropD: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
      dropC: ['C2', 'G2', 'C3', 'F3', 'A3', 'D4'],
      openG: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
      openD: ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'],
      openA: ['E2', 'A2', 'E3', 'A3', 'C#4', 'E4'],
      openE: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
      dadgad: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'],
      halfStepDown: ['Eb2', 'Ab2', 'Db3', 'Gb3', 'Bb3', 'Eb4'],
      fullStepDown: ['D2', 'G2', 'C3', 'F3', 'A3', 'D4'],
    },
  },
  guitar7: {
    name: '7-String Guitar',
    nameRu: 'Семиструнная гитара',
    stringCount: 7,
    defaultTuning: 'standard',
    tunings: {
      standard: ['B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
      dropA: ['A1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    },
  },
  guitar12: {
    name: '12-String Guitar',
    nameRu: 'Двенадцатиструнная гитара',
    stringCount: 12,
    defaultTuning: 'standard',
    tunings: {
      standard: ['E2', 'E3', 'A2', 'A3', 'D3', 'D4', 'G3', 'G4', 'B3', 'B3', 'E4', 'E4'],
    },
  },
  bass: {
    name: 'Bass Guitar',
    nameRu: 'Бас-гитара',
    stringCount: 4,
    defaultTuning: 'standard',
    tunings: {
      standard: ['E1', 'A1', 'D2', 'G2'],
      dropD: ['D1', 'A1', 'D2', 'G2'],
    },
  },
  bass5: {
    name: '5-String Bass Guitar',
    nameRu: 'Пятиструнная бас-гитара',
    stringCount: 5,
    defaultTuning: 'standard',
    tunings: {
      standard: ['B0', 'E1', 'A1', 'D2', 'G2'],
    },
  },
  ukulele: {
    name: 'Ukulele (High-G)',
    nameRu: 'Укулеле (High-G)',
    stringCount: 4,
    defaultTuning: 'standard',
    tunings: {
      standard: ['G4', 'C4', 'E4', 'A4'],
    },
  },
  ukuleleLowG: {
    name: 'Ukulele (Low-G)',
    nameRu: 'Укулеле (Low-G)',
    stringCount: 4,
    defaultTuning: 'standard',
    tunings: {
      standard: ['G3', 'C4', 'E4', 'A4'],
    },
  },
  ukuleleBaritone: {
    name: 'Baritone Ukulele',
    nameRu: 'Баритон-укулеле',
    stringCount: 4,
    defaultTuning: 'standard',
    tunings: {
      standard: ['D3', 'G3', 'B3', 'E4'],
    },
  },
  balalaikaPrima: {
    name: 'Balalaika Prima',
    nameRu: 'Балалайка прима',
    stringCount: 3,
    defaultTuning: 'standard',
    tunings: {
      standard: ['E4', 'E4', 'A4'],
    },
  },
  balalaikaSecunda: {
    name: 'Balalaika Secunda',
    nameRu: 'Балалайка секунда',
    stringCount: 3,
    defaultTuning: 'standard',
    tunings: {
      standard: ['A3', 'A3', 'D4'],
    },
  },
  balalaikaAlto: {
    name: 'Balalaika Alto',
    nameRu: 'Балалайка альт',
    stringCount: 3,
    defaultTuning: 'standard',
    tunings: {
      standard: ['E3', 'E3', 'A3'],
    },
  },
  balalaikaBass: {
    name: 'Balalaika Bass',
    nameRu: 'Балалайка бас',
    stringCount: 3,
    defaultTuning: 'standard',
    tunings: {
      standard: ['E2', 'A2', 'D3'],
    },
  },
  domra3Piccolo: {
    name: 'Domra 3-String Piccolo',
    nameRu: 'Домра 3-струнная пикколо',
    stringCount: 3,
    defaultTuning: 'standard',
    tunings: {
      standard: ['B4', 'E5', 'A5'],
    },
  },
  domra3Prima: {
    name: 'Domra 3-String Prima',
    nameRu: 'Домра 3-струнная прима',
    stringCount: 3,
    defaultTuning: 'standard',
    tunings: {
      standard: ['E4', 'A4', 'D5'],
    },
  },
  domra3MezzoSoprano: {
    name: 'Domra 3-String Mezzo-Soprano',
    nameRu: 'Домра 3-струнная меццо-сопрано',
    stringCount: 3,
    defaultTuning: 'standard',
    tunings: {
      standard: ['B3', 'E4', 'A4'],
    },
  },
  domra3Alto: {
    name: 'Domra 3-String Alto',
    nameRu: 'Домра 3-струнная альт',
    stringCount: 3,
    defaultTuning: 'standard',
    tunings: {
      standard: ['E3', 'A3', 'D4'],
    },
  },
  domra3Tenor: {
    name: 'Domra 3-String Tenor',
    nameRu: 'Домра 3-струнная тенор',
    stringCount: 3,
    defaultTuning: 'standard',
    tunings: {
      standard: ['B2', 'E3', 'A3'],
    },
  },
  domra3Bass: {
    name: 'Domra 3-String Bass',
    nameRu: 'Домра 3-струнная бас',
    stringCount: 3,
    defaultTuning: 'standard',
    tunings: {
      standard: ['E2', 'A2', 'D3'],
    },
  },
  domra3ContrabassMinor: {
    name: 'Domra 3-String Contrabass (minor)',
    nameRu: 'Домра 3-струнная контрабас (малая)',
    stringCount: 3,
    defaultTuning: 'standard',
    tunings: {
      standard: ['E1', 'A1', 'D2'],
    },
  },
  domra3ContrabassMajor: {
    name: 'Domra 3-String Contrabass (major)',
    nameRu: 'Домра 3-струнная контрабас (большая)',
    stringCount: 3,
    defaultTuning: 'standard',
    tunings: {
      standard: ['A1', 'D2', 'G2'],
    },
  },
  domra4Piccolo: {
    name: 'Domra 4-String Piccolo',
    nameRu: 'Домра 4-струнная пикколо',
    stringCount: 4,
    defaultTuning: 'standard',
    tunings: {
      standard: ['C4', 'G4', 'D5', 'A5'],
    },
  },
  domra4Prima: {
    name: 'Domra 4-String Prima',
    nameRu: 'Домра 4-струнная прима',
    stringCount: 4,
    defaultTuning: 'standard',
    tunings: {
      standard: ['G3', 'D4', 'A4', 'E5'],
    },
  },
  domra4Alto: {
    name: 'Domra 4-String Alto',
    nameRu: 'Домра 4-струнная альт',
    stringCount: 4,
    defaultTuning: 'standard',
    tunings: {
      standard: ['C3', 'G3', 'D4', 'A4'],
    },
  },
  domra4Tenor: {
    name: 'Domra 4-String Tenor',
    nameRu: 'Домра 4-струнная тенор',
    stringCount: 4,
    defaultTuning: 'standard',
    tunings: {
      standard: ['G2', 'D3', 'A3', 'E4'],
    },
  },
  domra4Bass: {
    name: 'Domra 4-String Bass',
    nameRu: 'Домра 4-струнная бас',
    stringCount: 4,
    defaultTuning: 'standard',
    tunings: {
      standard: ['C2', 'G2', 'D3', 'A3'],
    },
  },
  domra4Contrabass: {
    name: 'Domra 4-String Contrabass',
    nameRu: 'Домра 4-струнная контрабас',
    stringCount: 4,
    defaultTuning: 'standard',
    tunings: {
      standard: ['E1', 'A1', 'D2', 'G2'],
    },
  },
  violPardessus5: {
    name: 'Viol Pardessus (5-string)',
    nameRu: 'Виола пардессю (5-струнная)',
    stringCount: 5,
    defaultTuning: 'standard',
    tunings: {
      standard: ['G3', 'D4', 'A4', 'D5', 'G5'],
    },
  },
  violPardessus6: {
    name: 'Viol Pardessus (6-string)',
    nameRu: 'Виола пардессю (6-струнная)',
    stringCount: 6,
    defaultTuning: 'standard',
    tunings: {
      standard: ['G3', 'C4', 'E4', 'A4', 'D5', 'G5'],
    },
  },
  violTreble: {
    name: 'Treble Viol',
    nameRu: 'Виола дискант (требль)',
    stringCount: 6,
    defaultTuning: 'standard',
    tunings: {
      standard: ['D3', 'G3', 'C4', 'E4', 'A4', 'D5'],
    },
  },
  violAlto: {
    name: 'Alto Viol',
    nameRu: 'Виола альтовая',
    stringCount: 6,
    defaultTuning: 'standard',
    tunings: {
      standard: ['C3', 'F3', 'A3', 'D4', 'G4', 'C5'],
    },
  },
  violTenorA: {
    name: 'Tenor Viol (A)',
    nameRu: 'Виола теноровая (A)',
    stringCount: 6,
    defaultTuning: 'standard',
    tunings: {
      standard: ['A2', 'D3', 'G3', 'B3', 'E4', 'A4'],
    },
  },
  violTenorG: {
    name: 'Tenor Viol (G)',
    nameRu: 'Виола теноровая (G)',
    stringCount: 6,
    defaultTuning: 'standard',
    tunings: {
      standard: ['G2', 'C3', 'F3', 'A3', 'D4', 'G4'],
    },
  },
  violBass6: {
    name: 'Bass Viol (6-string)',
    nameRu: 'Виола басовая (6-струнная)',
    stringCount: 6,
    defaultTuning: 'standard',
    tunings: {
      standard: ['D2', 'G2', 'C3', 'E3', 'A3', 'D4'],
    },
  },
  violBass7: {
    name: 'Bass Viol (7-string)',
    nameRu: 'Виола басовая (7-струнная)',
    stringCount: 7,
    defaultTuning: 'standard',
    tunings: {
      standard: ['A1', 'D2', 'G2', 'C3', 'E3', 'A3', 'D4'],
    },
  },
  violVioloneA: {
    name: 'Violone in A',
    nameRu: 'Виолоне in A',
    stringCount: 6,
    defaultTuning: 'standard',
    tunings: {
      standard: ['A1', 'D2', 'G2', 'B2', 'E3', 'A3'],
    },
  },
  violVioloneG: {
    name: 'Violone in G',
    nameRu: 'Виолоне in G',
    stringCount: 6,
    defaultTuning: 'standard',
    tunings: {
      standard: ['G1', 'C2', 'F2', 'A2', 'D3', 'G3'],
    },
  },
  violVioloneD: {
    name: 'Violone in D',
    nameRu: 'Виолоне in D',
    stringCount: 6,
    defaultTuning: 'standard',
    tunings: {
      standard: ['D1', 'G1', 'C2', 'E2', 'A2', 'D3'],
    },
  },
  mandolin: {
    name: 'Mandolin',
    nameRu: 'Мандолина',
    stringCount: 8,
    defaultTuning: 'standard',
    tunings: {
      standard: ['G3', 'G3', 'D4', 'D4', 'A4', 'A4', 'E5', 'E5'],
    },
  },
  banjo5: {
    name: '5-String Banjo',
    nameRu: 'Банджо 5-струнное',
    stringCount: 5,
    defaultTuning: 'standard',
    tunings: {
      standard: ['G4', 'D3', 'G3', 'B3', 'D4'],
      openG: ['G4', 'D3', 'G3', 'B3', 'D4'],
    },
  },
}

export function getInstrument(name: InstrumentName): InstrumentDefinition {
  return INSTRUMENTS[name]
}

export function getTuning(instrument: InstrumentName, tuningName?: string): string[] {
  const def = INSTRUMENTS[instrument]
  return [...(def.tunings[tuningName ?? def.defaultTuning] ?? def.tunings[def.defaultTuning])]
}
