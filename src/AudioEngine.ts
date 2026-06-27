export class AudioEngine {
  ctx: AudioContext | null = null
  private stream: MediaStream | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private gainNode: GainNode | null = null
  private analyser: AnalyserNode | null = null

  async init(): Promise<void> {
    const ctx = new AudioContext()
    if (ctx.state === 'suspended') await ctx.resume()
    this.ctx = ctx

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    })
    this.source = ctx.createMediaStreamSource(this.stream)
    this.gainNode = ctx.createGain()
    this.gainNode.gain.value = 5
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 4096
    this.analyser.smoothingTimeConstant = 0.2
    this.source.connect(this.gainNode).connect(this.analyser)
  }

  get ready(): boolean {
    return this.analyser !== null && this.ctx !== null
  }

  getSampleRate(): number {
    return this.ctx?.sampleRate ?? 44100
  }

  getFftSize(): number {
    return this.analyser?.fftSize ?? 2048
  }

  getTimeDomainData(): Float32Array {
    const analyser = this.analyser!
    const buffer = new Float32Array(analyser.fftSize)
    analyser.getFloatTimeDomainData(buffer)
    return buffer
  }

  getRmsEnergy(): number {
    const buffer = this.getTimeDomainData()
    let sumSq = 0
    for (let i = 0; i < buffer.length; i++) {
      sumSq += buffer[i] * buffer[i]
    }
    return Math.sqrt(sumSq / buffer.length)
  }

  destroy(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop())
      this.stream = null
    }
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
    }
    this.source = null
    this.analyser = null
  }
}
