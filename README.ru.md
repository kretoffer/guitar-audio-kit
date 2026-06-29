<p align="center">
  <h1>@kretoffer/guitar-audio-kit</h1>
  <a href="https://www.npmjs.com/package/@kretoffer/guitar-audio-kit"><img src="https://img.shields.io/github/actions/workflow/status/kretoffer/guitar-audio-kit/publish.yml?style=for-the-badge&logo=npm&label=npm&color=8A2BE2" alt="Npm"></a>
  <a href="https://github.com/kretoffer/guitar-audio-kit/actions"><img src="https://img.shields.io/github/actions/workflow/status/kretoffer/guitar-audio-kit/ci.yml?style=for-the-badge&logo=github&label=tests&color=8A2BE2" alt="Tests"></a>
  <a href="https://app.codecov.io/gh/kretoffer/guitar-audio-kit"><img src="https://img.shields.io/codecov/c/github/kretoffer/guitar-audio-kit?style=for-the-badge&logo=codecov
  " alt="Codecov"></a>
  <a href="https://github.com/kretoffer/guitar-audio-kit/stargazers"><img src="https://img.shields.io/github/stars/kretoffer/guitar-audio-kit?style=for-the-badge&logo=githubsponsors&logoColor=FFFFFF&label=stars&color=FFD700" alt="Stars"></a>
  <a href="https://github.com/kretoffer/guitar-audio-kit/issues"><img src="https://img.shields.io/github/issues/kretoffer/guitar-audio-kit?style=for-the-badge&logo=openbugbounty&logoColor=FFFFFF&label=issues&color=FF6B6B" alt="Issues"></a>
  <a href="https://github.com/kretoffer/guitar-audio-kit/contributors"><img src="https://img.shields.io/github/contributors/kretoffer/guitar-audio-kit?style=for-the-badge&logo=applepodcasts&logoColor=FFFFFF&label=contributors&color=FF6B6B" alt="Contributors"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/kretoffer/guitar-audio-kit?style=for-the-badge&logo=libreoffice" alt="LICENSE"></a>
</p>

Браузерная библиотека для анализа гитарного аудио. Детекция высоты тона, множественная детекция, пострунный анализ аккордов и тюнер — всё на клиенте через Web Audio API.

Поддерживает множество инструментов: 6/7/12-струнная гитара, бас-гитара, укулеле, балалайка, домра (3- и 4-струнная), виола да гамба, мандолина, банджо — с предустановленными строями.

## Возможности

- **AudioEngine** — микрофонный вход, БПФ, RMS-энергия
- **PitchDetector** — автокорреляционная детекция высоты тона с медианным фильтром
- **MultiPitchDetector** — поиск пиков БПФ с подавлением гармоник
- **Tuner** — тюнер для одной струны с конечным автоматом стабильности (захват → блокировка → удержание)
- **StringAnalyzer** — пострунный анализ по форме аккорда (лады): открытые, зажатые и заглушенные струны. Работает с любым количеством струн и инструментов
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

### Анализ для укулеле

```typescript
import { AudioEngine, StringAnalyzer } from '@kretoffer/guitar-audio-kit'

const engine = new AudioEngine()
await engine.init()

const analyzer = new StringAnalyzer(engine, {
  instrument: 'ukulele', // предустановленный инструмент
  silenceThreshold: 0.005,
})
analyzer.setTarget([0, 0, 0, 0]) // все открытые

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
| `tuning` | — | Массив имён открытых струн (если не указан `instrument`) |
| `instrument` | — | Имя предустановленного инструмента — `'guitar'`, `'ukulele'`, `'balalaikaPrima'`, `'domra4Prima'`, `'violTreble'` и др. |
| `silenceThreshold` | `0.005` | Ниже этого RMS = тишина |

| Метод | Описание |
|--------|---------|
| `setTarget(лады)` | Установить ожидаемые лады для всех струн |
| `analyse()` | `AnalyseResult` с состояниями каждой струны |
| `getStringCount()` | Количество струн |
| `getInstrumentName()` | Имя инструмента или `null` |
| `getInstrumentDef()` | Определение инструмента (`InstrumentDefinition`) или `null` |

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

`NOTES`, `STANDARD_TUNING`, `FREQ_TABLE`, `INSTRUMENTS`

### Инструменты и строи (`InstrumentName`)

| Инструмент | Строк | Строи |
|---|---|---|
| `guitar` | 6 | `standard`, `dropD`, `dropC`, `openG`, `openD`, `openA`, `openE`, `dadgad`, `halfStepDown`, `fullStepDown` |
| `guitar7` | 7 | `standard`, `dropA` |
| `guitar12` | 12 | `standard` |
| `bass` | 4 | `standard`, `dropD` |
| `bass5` | 5 | `standard` |
| `ukulele` | 4 | `standard` |
| `ukuleleLowG` | 4 | `standard` |
| `ukuleleBaritone` | 4 | `standard` |
| `balalaikaPrima` | 3 | `standard` |
| `balalaikaSecunda` | 3 | `standard` |
| `balalaikaAlto` | 3 | `standard` |
| `balalaikaBass` | 3 | `standard` |
| `domra3Prima` | 3 | `standard` |
| `domra4Prima` | 4 | `standard` |
| `violTreble` | 6 | `standard` |
| `violBass6` | 6 | `standard` |
| `mandolin` | 8 | `standard` |
| `banjo5` | 5 | `standard`, `openG` |

Всего предопределено ~40 инструментов. Полный список см. в типе `InstrumentName` в `types.ts`.

### Хелперы

| Функция | Описание |
|---------|----------|
| `getInstrument(name)` | `InstrumentDefinition` по имени |
| `getTuning(instrument, tuningName?)` | Массив нот для строя (по умолчанию — стандартный строй) |

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
