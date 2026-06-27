import { NOTES } from '../constants.ts'

export function noteNameToMidi(name: string): number {
  const match = name.match(/^([A-G]#?)([0-8])$/)
  if (!match) throw new Error(`Invalid note name: ${name}`)
  const noteIndex = NOTES.indexOf(match[1] as typeof NOTES[number])
  const octave = parseInt(match[2])
  return (octave + 1) * 12 + noteIndex
}

export function midiToNoteName(midi: number): string {
  const noteIndex = midi % 12
  const octave = Math.floor(midi / 12) - 1
  return `${NOTES[noteIndex]}${octave}`
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function frequencyToMidi(freq: number): number {
  return 12 * Math.log2(freq / 440) + 69
}

export function frequencyToNote(freq: number): { name: string; octave: number; midi: number; cents: number } {
  const midi = frequencyToMidi(freq)
  const roundedMidi = Math.round(midi)
  const cents = Math.round((midi - roundedMidi) * 100)
  const name = midiToNoteName(roundedMidi)
  const octave = Math.floor(roundedMidi / 12) - 1
  return { name, octave, midi: roundedMidi, cents }
}

export function noteToFrequency(note: string, octave: number): number {
  const midi = noteNameToMidi(`${note}${octave}`)
  return midiToFrequency(midi)
}

export function noteNameToFrequency(name: string): number {
  return midiToFrequency(noteNameToMidi(name))
}
