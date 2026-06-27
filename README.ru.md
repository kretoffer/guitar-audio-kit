# @kretoffer/guitar-audio-kit

Браузерная библиотека для анализа гитарного аудио. Детекция высоты тона, множественная детекция, пострунный анализ аккордов и тюнер — всё на клиенте через Web Audio API.

## Возможности

- **AudioEngine** — микрофонный вход, БПФ, RMS-энергия
- **PitchDetector** — автокорреляционная детекция высоты тона с медианным фильтром
- **MultiPitchDetector** — поиск пиков БПФ с подавлением гармоник
- **Tuner** — тюнер для одной струны с конечным автоматом стабильности (захват → блокировка → удержание)
- **StringAnalyzer** — пострунный анализ по форме аккорда (лады): открытые, зажатые и заглушенные струны
- **ChordDetector** — определение названия аккорда по сырым пикам (maj, m, 7, m7, sus2, sus4, dim, aug, dim7, m7b5)

## Установка

```bash
npm install @kretoffer/guitar-audio-kit
```

Библиотека написана на TypeScript. Если ваш проект использует бандлер (Vite, Webpack), импорт идёт напрямую из `.ts`-файлов. Иначе — `npm run build` через tsup.

## Быстрый старт

### Тюнер

```typescript
import { AudioEngine, Tuner } from '@kretoffer/guitar-audio-kit'

const engine = new AudioEngine()
await engine.init()

const tuner = new Tuner(engine)
tuner.setTarget('E', 2)

function loop() {
  const result = tuner.detect()
  if (result) {
    console.log(`${result.note}${result.octave}  ${result.cents}¢  ${result.isInTune ? '✓' : ''}`)
  }
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
```

### Пострунный анализ аккорда

```typescript
import { AudioEngine, StringAnalyzer } from '@kretoffer/guitar-audio-kit'

const engine = new AudioEngine()
await engine.init()

const analyzer = new StringAnalyzer(engine, {
  tuning: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  silenceThreshold: 0.005,
})
analyzer.setTarget([-1, 0, 2, 2, 1, 0]) // Am

function loop() {
  const result = analyzer.analyse()
  console.log(result.strings.map(s => `${s.status}`))
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
```

## API

### `AudioEngine`

| Метод | Описание |
|--------|---------|
| `init()` | Запросить микрофон, создать AudioContext + AnalyserNode (fftSize: 4096, усиление: 5x) |
| `getTimeDomainData()` | Текущий waveform как `Float32Array` |
| `getRmsEnergy()` | RMS-энергия текущего буфера |
| `getSampleRate()` | Частота дискретизации (44100 по умолчанию) |
| `getFftSize()` | Размер БПФ (4096) |
| `destroy()` | Остановить треки и закрыть AudioContext |
| `ready` | Геттер — `true`, если анализатор инициализирован |

### `PitchDetector`

| Метод | Описание |
|--------|---------|
| `detect(minFreq?, maxFreq?)` | Автокорреляция (нормализованная, порог 0.5), возвращает медиану последних 5 замеров или `null` |
| `reset()` | Очистить историю |

Автокорреляция нормализована по энергии: `corr /= sumSq`. RMS-гейт: 0.004.

### `Tuner`

| Метод | Описание |
|--------|---------|
| `setTarget(nota, октава)` | Установить целевую струну (например `'E'`, `2`) |
| `detect()` | `TuningResult \| null` с конечным автоматом стабильности |
| `reset()` | Сбросить автомат и историю высоты |

**Конфиг** (`TunerConfig`): `stableThreshold` (10 кадров), `centTolerance` (20¢).

**Конечный автомат:**
1. **Тишина** → `null`
2. **Появился сигнал** → считает `stableFrames`. После `stableThreshold` → **Locked**
3. **Locked** → стабильный результат. Удерживается при тишине (без таймаута). При смене частоты — параллельный подсчёт кандидата. После `stableThreshold` кадров новой ноты — переключение.
4. Проверки: `freq < 30 \|\| freq > 2000` → невалид. `центов от цели > 600` → октавная ошибка.

**`TuningResult`**:
```typescript
{ note: string, octave: number, frequency: number, cents: number,
  targetNote: string, targetFrequency: number, isInTune: boolean }
```

### `MultiPitchDetector`

| Метод | Описание |
|--------|---------|
| `detect(minFreq?, maxFreq?)` | `DetectedPitch[]` — пики БПФ с подавлением гармоник (2x–8x) |

### `StringAnalyzer`

| Конфиг | По умолчанию | Описание |
|--------|-------------|---------|
| `tuning` | — | Массив из 6 имён открытых струн |
| `silenceThreshold` | `0.005` | Ниже этого RMS = тишина |

| Метод | Описание |
|--------|---------|
| `setTarget(лады)` | Установить ожидаемые лады для всех 6 струн |
| `analyse()` | `AnalyseResult` с состояниями каждой струны |

**Статусы струн в зависимости от лада:**
- `fret === -1` (глушится): есть пик → `extra`, тишина → `inactive`
- `fret === 0` (открытая): обнаружена открытая → `correct`, тишина → `inactive`
- `fret > 0` (зажатая): целевая частота → `correct`, открытая струна → `wrong`, тишина → `muted`

**Формула confidence**: `max(0, correct - extra) / (fretted + muted)`

### `ChordDetector`

| Метод | Описание |
|--------|---------|
| `detect(pitches)` | Сопоставить обнаруженные пики с шаблонами аккордов (maj, m, 7, m7, sus2, sus4, dim, aug, dim7, m7b5). Возвращает название или `null` |

### Утилиты

| Функция | Описание |
|----------|---------|
| `frequencyToNote(freq)` | `{ name, octave, midi, cents }` |
| `noteToFrequency(nota, октава)` | Частота в Гц |
| `noteNameToMidi(имя)` | MIDI-номер |
| `noteNameToFrequency(имя)` | Частота в Гц |

### Константы

`NOTES`, `STANDARD_TUNING`, `FREQ_TABLE`

## Разработка

```bash
# Установка
npm install

# Проверка типов
npm run typecheck

# Линтер
npm run lint

# Тесты
npm run test

# Сборка
npm run build
```

## Лицензия

MIT
