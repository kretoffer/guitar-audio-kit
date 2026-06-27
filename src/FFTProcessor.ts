import type { AudioEngine } from './AudioEngine.ts'

export type WindowFunction = 'hann' | 'hamming' | 'blackman' | 'none'

export class FFTProcessor {
  private engine: AudioEngine
  private windowFunc: WindowFunction = 'hann'

  constructor(engine: AudioEngine) {
    this.engine = engine
  }

  setWindowFunction(fn: WindowFunction): void {
    this.windowFunc = fn
  }

  computeSpectrum(): Float32Array {
    const timeDomain = this.engine.getTimeDomainData()
    const fftSize = this.engine.getFftSize()

    const windowed = new Float32Array(timeDomain)
    this.applyWindow(windowed)

    const re = new Float32Array(fftSize)
    const im = new Float32Array(fftSize)
    re.set(windowed.slice(0, fftSize))
    im.fill(0)

    FFT(fftSize, re, im)

    const binCount = fftSize / 2
    const magnitudes = new Float32Array(binCount)

    for (let i = 0; i < binCount; i++) {
      magnitudes[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i])
    }

    return magnitudes
  }

  findPeaks(threshold: number = 0.05): { frequency: number; magnitude: number; binIndex: number }[] {
    const magnitudes = this.computeSpectrum()
    const sampleRate = this.engine.getSampleRate()
    const fftSize = this.engine.getFftSize()
    const peaks: { frequency: number; magnitude: number; binIndex: number }[] = []

    const maxMag = Math.max(...magnitudes)
    if (maxMag === 0) return peaks
    const thresholdAbs = maxMag * threshold

    for (let i = 1; i < magnitudes.length - 1; i++) {
      if (magnitudes[i] > magnitudes[i - 1] && magnitudes[i] > magnitudes[i + 1] && magnitudes[i] > thresholdAbs) {
        const a = magnitudes[i - 1]
        const b = magnitudes[i]
        const c = magnitudes[i + 1]
        const correction = 0.5 * (a - c) / (a - 2 * b + c)
        const interpolatedBin = i + correction
        const frequency = interpolatedBin * sampleRate / fftSize
        peaks.push({ frequency, magnitude: magnitudes[i], binIndex: i })
      }
    }

    peaks.sort((a, b) => b.magnitude - a.magnitude)
    return peaks
  }

  private applyWindow(buffer: Float32Array): void {
    const N = buffer.length
    switch (this.windowFunc) {
      case 'hann':
        for (let i = 0; i < N; i++) {
          buffer[i] *= 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)))
        }
        break
      case 'hamming':
        for (let i = 0; i < N; i++) {
          buffer[i] *= 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1))
        }
        break
      case 'blackman':
        for (let i = 0; i < N; i++) {
          buffer[i] *= 0.42 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)) + 0.08 * Math.cos((4 * Math.PI * i) / (N - 1))
        }
        break
    }
  }
}

function FFT(fftSize: number, re: Float32Array, im: Float32Array): void {
  const levels = Math.log2(fftSize)
  const cosTable = new Float32Array(fftSize / 2)
  const sinTable = new Float32Array(fftSize / 2)
  for (let i = 0; i < fftSize / 2; i++) {
    cosTable[i] = Math.cos(2 * Math.PI * i / fftSize)
    sinTable[i] = Math.sin(2 * Math.PI * i / fftSize)
  }

  for (let i = 0; i < fftSize; i++) {
    const j = bitReverse(i, levels)
    if (j > i) {
    const reTmp = re[i]; re[i] = re[j]; re[j] = reTmp
    const imTmp = im[i]; im[i] = im[j]; im[j] = imTmp
    }
  }

  for (let size = 2; size <= fftSize; size *= 2) {
    const halfSize = size / 2
    const step = fftSize / size
    for (let i = 0; i < fftSize; i += size) {
      for (let j = 0; j < halfSize; j++) {
        const cos = cosTable[j * step]
        const sin = sinTable[j * step]
        const reT = cos * re[i + j + halfSize] - sin * im[i + j + halfSize]
        const imT = sin * re[i + j + halfSize] + cos * im[i + j + halfSize]
        re[i + j + halfSize] = re[i + j] - reT
        im[i + j + halfSize] = im[i + j] - imT
        re[i + j] += reT
        im[i + j] += imT
      }
    }
  }
}

function bitReverse(n: number, bits: number): number {
  let result = 0
  for (let i = 0; i < bits; i++) {
    result = (result << 1) | (n & 1)
    n >>= 1
  }
  return result
}
