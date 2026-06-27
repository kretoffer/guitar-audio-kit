import type { AudioEngine } from './AudioEngine.ts'
import { FFTProcessor } from './FFTProcessor.ts'

export interface DetectedPitch {
  frequency: number
  magnitude: number
  noteName: string
  midi: number
  cents: number
}

export class MultiPitchDetector {
  private fft: FFTProcessor

  constructor(_engine: AudioEngine) {
    this.fft = new FFTProcessor(_engine)
  }

  detect(minFrequency: number = 60, maxFrequency: number = 1200): DetectedPitch[] {
    const peaks = this.fft.findPeaks(0.03)
    const pitches: DetectedPitch[] = []

    for (const peak of peaks) {
      if (peak.frequency < minFrequency || peak.frequency > maxFrequency) continue

      const isHarmonic = pitches.some(p => {
        const ratio = peak.frequency / p.frequency
        const nearestInteger = Math.round(ratio)
        return nearestInteger >= 2 && nearestInteger <= 8 && Math.abs(ratio - nearestInteger) < 0.03
      })

      if (!isHarmonic) {
        const midi = 12 * Math.log2(peak.frequency / 440) + 69
        const roundedMidi = Math.round(midi)
        const cents = Math.round((midi - roundedMidi) * 100)
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        const noteName = noteNames[roundedMidi % 12]

        pitches.push({
          frequency: peak.frequency,
          magnitude: peak.magnitude,
          noteName: `${noteName}${Math.floor(roundedMidi / 12) - 1}`,
          midi: roundedMidi,
          cents,
        })
      }
    }

    return pitches
  }
}
