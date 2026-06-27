# @kretoffer/guitar-audio-kit

Browser-based guitar audio analysis library. Provides real-time pitch detection, multi-pitch detection, string-by-string chord analysis, and a tuner — all running client-side via the Web Audio API.

## Features

- **AudioEngine** – microphone input, FFT, RMS energy
- **PitchDetector** – autocorrelation-based pitch detection with median filtering
- **MultiPitchDetector** – FFT peak picking with harmonic cancellation
- **Tuner** – single-string tuner with stability-gate state machine (locking → locked → hold)
- **StringAnalyzer** – per-string analysis against a chord shape (frets), handles open, fretted, and muted strings
- **ChordDetector** – generic chord name detection from raw pitch sets (maj, m, 7, m7, sus2, sus4, dim, aug, dim7, m7b5)

## Installation

```bash
npm install @kretoffer/guitar-audio-kit
```

The library is pure TypeScript. If your project uses a bundler (Vite, Webpack), it imports source `.ts` files directly. Otherwise install `tsup` and run `npm run build` to compile.

## Quick Start

### Tuner

```typescript
import { AudioEngine, Tuner } from '@kretoffer/guitar-audio-kit'

const engine = new AudioEngine()
await engine.init()

const tuner = new Tuner(engine)
tuner.setTarget('E', 2) // tune to E2

function loop() {
  const result = tuner.detect()
  if (result) {
    console.log(`${result.note}${result.octave}  ${result.cents}¢  ${result.isInTune ? '✓' : ''}`)
  }
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
```

### String-by-string chord analysis

```typescript
import { AudioEngine, StringAnalyzer } from '@kretoffer/guitar-audio-kit'

const engine = new AudioEngine()
await engine.init()

const analyzer = new StringAnalyzer(engine, {
  tuning: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  silenceThreshold: 0.005,
})
analyzer.setTarget([-1, 0, 2, 2, 1, 0]) // Am shape: mute E, A open, D2 G2 B1 E open

function loop() {
  const result = analyzer.analyse()
  console.log(result.strings.map(s => `${s.status}`))
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
```

## API

### `AudioEngine`

| Method | Description |
|--------|-------------|
| `init()` | Request microphone access, create AudioContext + AnalyserNode (fftSize: 4096, gain: 5x) |
| `getTimeDomainData()` | Return current waveform as `Float32Array` |
| `getRmsEnergy()` | Return RMS energy of current buffer |
| `getSampleRate()` | Return sample rate (default 44100) |
| `getFftSize()` | Return FFT size (4096) |
| `destroy()` | Stop tracks and close AudioContext |
| `ready` | Getter — `true` if analyser is initialized |

### `PitchDetector`

| Method | Description |
|--------|-------------|
| `detect(minFreq?, maxFreq?)` | Run autocorrelation (normalized, threshold 0.5), return median frequency of last 5 readings, or `null` |
| `reset()` | Clear history |

The autocorrelation is energy-normalised: `corr /= sumSq`. RMS gate at 0.004.

### `Tuner`

| Method | Description |
|--------|-------------|
| `setTarget(note, octave)` | Set target string (e.g. `'E'`, `2`) |
| `detect()` | Return `TuningResult \| null` with stability-gate state machine |
| `reset()` | Reset state machine and pitch history |

**Config** (`TunerConfig`): `stableThreshold` (10 frames), `centTolerance` (20¢).

**State machine:**
1. **Silent** → returns `null`
2. **Signal appears** → counts `stableFrames`. After `stableThreshold` → **Locked**
3. **Locked** → returns stable result. Holds during silence (no timeout). If frequency changes → starts parallel candidate count. After `stableThreshold` frames of new frequency → switches to new note.
4. Sanity checks: `freq < 30 || freq > 2000` → invalid. `cents from target > 600` → octave error.

**`TuningResult`**:
```typescript
{ note: string, octave: number, frequency: number, cents: number,
  targetNote: string, targetFrequency: number, isInTune: boolean }
```

### `MultiPitchDetector`

| Method | Description |
|--------|-------------|
| `detect(minFreq?, maxFreq?)` | Return `DetectedPitch[]` — FFT peaks with harmonic cancellation (2x–8x) |

### `StringAnalyzer`

| Config | Default | Description |
|--------|---------|-------------|
| `tuning` | — | Array of 6 open-note names |
| `silenceThreshold` | `0.005` | RMS below this = silent frame |

| Method | Description |
|--------|-------------|
| `setTarget(frets)` | Set expected frets for all 6 strings |
| `analyse()` | Return `AnalyseResult` with per-string states |

**String states per fret value:**
- `fret === -1` (muted): any pitch → `extra`, silence → `inactive`
- `fret === 0` (open): open pitch detected → `correct`, silence → `inactive`
- `fret > 0` (fretted): target pitch → `correct`, open string → `wrong`, silence → `muted`

**Confidence formula**: `max(0, correct - extra) / (fretted + muted)`

### `ChordDetector`

| Method | Description |
|--------|-------------|
| `detect(pitches)` | Try to match detected pitches against chord templates (maj, m, 7, m7, sus2, sus4, dim, aug, dim7, m7b5). Returns chord name or `null` |

### Utility functions

| Function | Description |
|----------|-------------|
| `frequencyToNote(freq)` | `{ name, octave, midi, cents }` |
| `noteToFrequency(note, octave)` | Frequency in Hz |
| `noteNameToMidi(name)` | MIDI number |
| `noteNameToFrequency(name)` | Frequency in Hz |

### Constants

`NOTES`, `STANDARD_TUNING`, `FREQ_TABLE`

## Development

```bash
# Install
npm install

# Type check
npm run typecheck

# Lint
npm run lint

# Test
npm run test

# Build
npm run build
```

## License

MIT
