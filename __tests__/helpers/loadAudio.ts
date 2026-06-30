import * as fs from 'fs'

export interface WavInfo {
  data: Float32Array
  sampleRate: number
  numChannels: number
  bitsPerSample: number
}

export function loadWavFile(filePath: string): WavInfo {
  const buf = fs.readFileSync(filePath)
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

  if (String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)) !== 'RIFF') {
    throw new Error('Not a RIFF file')
  }

  if (String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11)) !== 'WAVE') {
    throw new Error('Not a WAVE file')
  }

  let fmtOffset = 12
  while (fmtOffset < buf.length) {
    const chunkId = String.fromCharCode(
      view.getUint8(fmtOffset), view.getUint8(fmtOffset + 1),
      view.getUint8(fmtOffset + 2), view.getUint8(fmtOffset + 3)
    )
    const chunkSize = view.getUint32(fmtOffset + 4, true)
    if (chunkId === 'fmt ') {
      const audioFormat = view.getUint16(fmtOffset + 8, true)
      const numChannels = view.getUint16(fmtOffset + 10, true)
      const sampleRate = view.getUint32(fmtOffset + 12, true)
      const bitsPerSample = view.getUint16(fmtOffset + 22, true)

      if (audioFormat !== 1 && audioFormat !== 3) {
        throw new Error(`Unsupported audio format: ${audioFormat} (only PCM and IEEE float supported)`)
      }

      fmtOffset += 8 + chunkSize
      while (fmtOffset < buf.length) {
        const dId = String.fromCharCode(
          view.getUint8(fmtOffset), view.getUint8(fmtOffset + 1),
          view.getUint8(fmtOffset + 2), view.getUint8(fmtOffset + 3)
        )
        const dSize = view.getUint32(fmtOffset + 4, true)
        if (dId === 'data') {
          const dataStart = fmtOffset + 8
          const totalSamples = Math.floor(dSize / (bitsPerSample / 8))
          const frames = Math.floor(totalSamples / numChannels)

          const data = new Float32Array(frames)

          for (let f = 0; f < frames; f++) {
            let sum = 0
            for (let c = 0; c < numChannels; c++) {
              const sampleOffset = dataStart + (f * numChannels + c) * (bitsPerSample / 8)
              if (audioFormat === 3) {
                sum += view.getFloat32(sampleOffset, true)
              } else if (bitsPerSample === 8) {
                sum += (view.getUint8(sampleOffset) - 128) / 128
              } else if (bitsPerSample === 16) {
                sum += view.getInt16(sampleOffset, true) / 32768
              } else if (bitsPerSample === 24) {
                let val = view.getUint8(sampleOffset) | (view.getUint8(sampleOffset + 1) << 8) | (view.getUint8(sampleOffset + 2) << 16)
                if (val & 0x800000) val |= ~0xFFFFFF
                sum += val / 8388608
              } else if (bitsPerSample === 32) {
                sum += view.getInt32(sampleOffset, true) / 2147483648
              }
            }
            data[f] = sum / numChannels
          }

          return { data, sampleRate, numChannels, bitsPerSample }
        }
        fmtOffset += 8 + dSize
      }
    }
    fmtOffset += 8 + chunkSize
  }

  throw new Error('No data chunk found')
}

export function findFixture(name: string): string {
  return new URL(`../fixtures/audio/${name}`, import.meta.url).pathname
}

export function findFixtureRelative(name: string): string {
  return `__tests__/fixtures/audio/${name}`
}
