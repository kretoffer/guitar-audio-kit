import type { AudioEngine } from './AudioEngine.ts'

export class PitchDetector {
  private engine: AudioEngine
  private sampleRate: number
  private history: number[] = []
  private readonly historySize = 5

  constructor(engine: AudioEngine) {
    this.engine = engine
    this.sampleRate = engine.getSampleRate()
  }

  detect(frequencyMin: number = 50, frequencyMax: number = 1500): number | null {
    if (!this.engine.ready) return null
    const rms = this.engine.getRmsEnergy()
    if (rms < 0.004) {
      this.history = []
      return null
    }

    const buffer = this.engine.getTimeDomainData()
    const freq = this.autocorrelation(buffer, this.sampleRate, frequencyMin, frequencyMax)
    if (freq === null) {
      this.history = []
      return null
    }

    this.history.push(freq)
    if (this.history.length > this.historySize) this.history.shift()

    const sorted = [...this.history].sort((a, b) => a - b)
    return sorted[Math.floor(sorted.length / 2)]
  }

  reset(): void { this.history = [] }

  private autocorrelation(
    buffer: Float32Array,
    sampleRate: number,
    freqMin: number,
    freqMax: number
  ): number | null {
    const minLag = Math.floor(sampleRate / freqMax)
    const maxLag = Math.ceil(sampleRate / freqMin)
    const n = buffer.length

    let sumSq = 0
    for (let i = 0; i < n; i++) sumSq += buffer[i] * buffer[i]
    if (sumSq < 0.001) return null

    let bestLag = -1
    let bestCorr = -Infinity

    for (let lag = minLag; lag <= maxLag; lag++) {
      let correlation = 0
      for (let i = 0; i < n - lag; i++) correlation += buffer[i] * buffer[i + lag]
      correlation /= sumSq
      if (correlation > bestCorr) { bestCorr = correlation; bestLag = lag }
    }

    if (bestLag < 0 || bestCorr < 0.5) return null
    const frequency = sampleRate / bestLag
    if (frequency < freqMin || frequency > freqMax) return null
    return Math.round(frequency * 10) / 10
  }
}
