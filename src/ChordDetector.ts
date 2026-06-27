import type { DetectedPitch } from './MultiPitchDetector.ts'

const CHORD_TEMPLATES: Record<string, number[]> = {
  'maj':  [0, 4, 7],
  'm':    [0, 3, 7],
  '7':    [0, 4, 7, 10],
  'm7':   [0, 3, 7, 10],
  'maj7': [0, 4, 7, 11],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  'dim':  [0, 3, 6],
  'aug':  [0, 4, 8],
  'dim7': [0, 3, 6, 9],
  'm7b5': [0, 3, 6, 10],
  '6':    [0, 4, 7, 9],
  'm6':   [0, 3, 7, 9],
  '7sus4': [0, 5, 7, 10],
}

export class ChordDetector {
  detect(pitches: DetectedPitch[]): string | null {
    if (pitches.length < 2) return null

    const noteNumbers = pitches.map(p => p.midi % 12).sort((a, b) => a - b)
    const uniqueNotes = [...new Set(noteNumbers)]

    let bestMatch: { root: number; quality: string; score: number; length: number } | null = null

    for (const rootNote of uniqueNotes) {
      const normalized = uniqueNotes.map(n => (n - rootNote + 12) % 12).sort((a, b) => a - b)

      for (const [quality, template] of Object.entries(CHORD_TEMPLATES)) {
        const matched = template.filter(t => normalized.includes(t)).length
        const score = matched / template.length

        const isBetter = !bestMatch
          || score > bestMatch.score
          || (score === bestMatch.score && template.length > bestMatch.length)

        if (score > 0.5 && isBetter) {
          bestMatch = { root: rootNote, quality, score, length: template.length }
        }
      }
    }

    if (!bestMatch) return null

    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const rootName = noteNames[bestMatch.root]
    return `${rootName}${bestMatch.quality === 'maj' ? '' : bestMatch.quality}`
  }
}
