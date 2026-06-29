import { describe, it, expect } from 'vitest'
import { NOTES, STANDARD_TUNING, NOTE_FREQUENCIES_BASE, FREQ_TABLE, INSTRUMENTS, getInstrument, getTuning } from '../src/constants.ts'
import type { InstrumentName } from '../src/types.ts'

describe('constants', () => {
  it('NOTES has 12 chromatic notes starting with C', () => {
    expect(NOTES).toHaveLength(12)
    expect(NOTES[0]).toBe('C')
    expect(NOTES[9]).toBe('A')
  })

  it('STANDARD_TUNING defines 6-string guitar tuning', () => {
    expect(STANDARD_TUNING).toHaveLength(6)
    expect(STANDARD_TUNING).toEqual(['E2', 'A2', 'D3', 'G3', 'B3', 'E4'])
  })

  it('NOTE_FREQUENCIES_BASE has base frequencies for all 12 notes', () => {
    expect(Object.keys(NOTE_FREQUENCIES_BASE)).toHaveLength(12)
    expect(NOTE_FREQUENCIES_BASE.A).toBeCloseTo(27.5, 1)
    expect(NOTE_FREQUENCIES_BASE.C).toBeCloseTo(16.35, 1)
  })

  it('FREQ_TABLE contains 9 octaves per note', () => {
    expect(Object.keys(FREQ_TABLE)).toHaveLength(12)
    for (const note of NOTES) {
      expect(FREQ_TABLE[note]).toHaveLength(9)
    }
    expect(FREQ_TABLE.A[4]).toBeCloseTo(440, 0)
    expect(FREQ_TABLE.C[4]).toBeCloseTo(261.6, 0)
    expect(FREQ_TABLE.E[2]).toBeCloseTo(82.4, 0)
  })
})

describe('INSTRUMENTS', () => {
  it('includes all instrument names', () => {
    const names: InstrumentName[] = [
      'guitar', 'guitar7', 'guitar12', 'bass', 'bass5',
      'ukulele', 'ukuleleLowG', 'ukuleleBaritone',
      'balalaikaPrima', 'balalaikaSecunda', 'balalaikaAlto', 'balalaikaBass',
      'domra3Piccolo', 'domra3Prima', 'domra3MezzoSoprano', 'domra3Alto',
      'domra3Tenor', 'domra3Bass', 'domra3ContrabassMinor', 'domra3ContrabassMajor',
      'domra4Piccolo', 'domra4Prima', 'domra4Alto', 'domra4Tenor',
      'domra4Bass', 'domra4Contrabass',
      'violPardessus5', 'violPardessus6', 'violTreble', 'violAlto',
      'violTenorA', 'violTenorG', 'violBass6', 'violBass7',
      'violVioloneA', 'violVioloneG', 'violVioloneD',
      'mandolin', 'banjo5',
    ]
    for (const name of names) {
      expect(INSTRUMENTS[name]).toBeDefined()
    }
  })

  it('every instrument has the right string counts', () => {
    const expected: Partial<Record<InstrumentName, number>> = {
      guitar: 6, guitar7: 7, guitar12: 12, bass: 4, bass5: 5,
      ukulele: 4, ukuleleLowG: 4, ukuleleBaritone: 4,
      balalaikaPrima: 3, balalaikaSecunda: 3, balalaikaAlto: 3, balalaikaBass: 3,
      domra3Piccolo: 3, domra3Prima: 3, domra3MezzoSoprano: 3, domra3Alto: 3,
      domra3Tenor: 3, domra3Bass: 3, domra3ContrabassMinor: 3, domra3ContrabassMajor: 3,
      domra4Piccolo: 4, domra4Prima: 4, domra4Alto: 4, domra4Tenor: 4,
      domra4Bass: 4, domra4Contrabass: 4,
      violPardessus5: 5, violPardessus6: 6, violTreble: 6, violAlto: 6,
      violTenorA: 6, violTenorG: 6, violBass6: 6, violBass7: 7,
      violVioloneA: 6, violVioloneG: 6, violVioloneD: 6,
      mandolin: 8, banjo5: 5,
    }
    for (const [name, count] of Object.entries(expected)) {
      expect(INSTRUMENTS[name as InstrumentName].stringCount).toBe(count)
    }
  })

  it('every tuning array has the correct length for its instrument', () => {
    for (const def of Object.values(INSTRUMENTS)) {
      for (const [, tuning] of Object.entries(def.tunings)) {
        expect(tuning).toHaveLength(def.stringCount)
      }
    }
  })

  it('every instrument has a defaultTuning that exists in its tunings', () => {
    for (const def of Object.values(INSTRUMENTS)) {
      expect(def.tunings[def.defaultTuning]).toBeDefined()
    }
  })

  it('STANDARD_TUNING matches guitar standard tuning', () => {
    expect(STANDARD_TUNING).toEqual(INSTRUMENTS.guitar.tunings.standard)
  })
})

describe('getInstrument', () => {
  it('returns instrument definition', () => {
    const def = getInstrument('guitar')
    expect(def.name).toBe('Guitar')
    expect(def.stringCount).toBe(6)
  })
})

describe('getTuning', () => {
  it('returns default tuning when no tuning name given', () => {
    expect(getTuning('guitar')).toEqual(INSTRUMENTS.guitar.tunings.standard)
  })

  it('returns named tuning when specified', () => {
    expect(getTuning('guitar', 'dropD')).toEqual(INSTRUMENTS.guitar.tunings.dropD)
  })

  it('returns a copy of the array', () => {
    const t = getTuning('guitar')
    t[0] = 'X0'
    expect(INSTRUMENTS.guitar.tunings.standard[0]).toBe('E2')
  })
})
