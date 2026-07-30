/**
 * 音效基礎層(GDD § 10.5)。
 *
 * ⚠️ 三個前提決定了這個實作長這樣:
 * 1. **全部程式合成,不進任何音檔**——與「動畫一律程式補間、禁止逐幀素材」同一個成本原則。
 *    Web Audio 的振盪器 + 包絡就夠做出這些短音,bundle 一個位元組都不增加。
 * 2. **掛機遊戲常被靜音**:任何重要資訊都必須有視覺冗餘,音效只是強化。
 *    所以這一層不負責傳達任何獨有資訊,壞掉也不影響可玩性(整檔用 try/catch 自吞)。
 * 3. **AudioContext 必須等使用者手勢**:瀏覽器會擋自動播放,所以 context 延後到
 *    第一次 `unlock()` 才建立;在那之前所有 play 都是空操作,不報錯。
 *
 * 音量三軌(GDD 要求)+ 全靜音,存 localStorage(這是裝置偏好,不進存檔)。
 */

export type Track = 'battle' | 'event' | 'ui'
export const TRACKS: Array<{ id: Track; name: string }> = [
  { id: 'battle', name: '戰鬥' },
  { id: 'event', name: '事件' },
  { id: 'ui', name: '介面' },
]

interface Voice {
  track: Track
  /** 主振盪器波形 */
  wave?: OscillatorType
  /** 起始頻率(Hz) */
  freq: number
  /** 結束頻率:有值就做頻率滑音(上升=正面,下降=負面) */
  to?: number
  /** 長度(秒) */
  dur: number
  /** 音量(相對 0~1) */
  gain?: number
  /** 疊一層白噪:打擊感、破裂感靠它 */
  noise?: number
  /** 疊加的和聲(相對主頻的倍率),用來做「三和弦=達成」的感覺 */
  chord?: number[]
}

/**
 * ⚠️ 頻率不是隨便填的:正面事件一律上行或大三和弦,負面事件一律下行。
 * 玩家不必學習音效的意思——方向本身就是意思。
 */
const VOICES: Record<string, Voice> = {
  // ── 基礎層:普攻與暴擊。這兩個每秒可能響好幾次,所以最短最輕 ──
  hit: { track: 'battle', wave: 'triangle', freq: 220, to: 160, dur: 0.06, gain: 0.18, noise: 0.5 },
  crit: { track: 'battle', wave: 'square', freq: 440, to: 300, dur: 0.11, gain: 0.26, noise: 0.4 },
  kill: { track: 'battle', wave: 'sine', freq: 330, to: 180, dur: 0.09, gain: 0.16 },
  gold: { track: 'event', wave: 'sine', freq: 900, to: 1300, dur: 0.07, gain: 0.13 },

  // ── 身分層:技能。三系各給一個音色,關掉名稱也能聽出放了哪一招 ──
  skillShield: { track: 'battle', wave: 'sawtooth', freq: 130, to: 90, dur: 0.28, gain: 0.3, noise: 0.3 },
  skillGale: { track: 'battle', wave: 'square', freq: 660, to: 1100, dur: 0.16, gain: 0.22 },
  skillHoly: { track: 'battle', wave: 'sine', freq: 520, to: 780, dur: 0.34, gain: 0.28, chord: [1, 1.5, 2] },
  // 機制成功層:引爆、破盾、打斷
  burst: { track: 'battle', wave: 'sawtooth', freq: 180, to: 60, dur: 0.4, gain: 0.34, noise: 0.5 },
  shellBreak: { track: 'battle', wave: 'square', freq: 1200, to: 400, dur: 0.18, gain: 0.26, noise: 0.8 },
  interrupt: { track: 'battle', wave: 'square', freq: 880, to: 660, dur: 0.1, gain: 0.3, noise: 0.6 },
  perfect: { track: 'battle', wave: 'sine', freq: 1046, dur: 0.3, gain: 0.26, chord: [1, 1.25, 1.5] },

  // ── 敵人預告層:一律低頻下行,製造壓迫 ──
  bossIntro: { track: 'event', wave: 'sawtooth', freq: 90, to: 55, dur: 0.7, gain: 0.3 },
  channel: { track: 'event', wave: 'triangle', freq: 200, to: 320, dur: 0.5, gain: 0.22 },
  // 機制失敗層:下行小三度
  fail: { track: 'event', wave: 'triangle', freq: 300, to: 150, dur: 0.5, gain: 0.24 },

  // ── 結算/稀有事件層 ──
  bossKill: { track: 'event', wave: 'sine', freq: 523, dur: 0.55, gain: 0.3, chord: [1, 1.26, 1.5, 2] },
  levelUp: { track: 'ui', wave: 'sine', freq: 660, to: 880, dur: 0.16, gain: 0.18 },
  achievement: { track: 'event', wave: 'sine', freq: 784, dur: 0.5, gain: 0.26, chord: [1, 1.26, 1.5] },
  forge: { track: 'ui', wave: 'square', freq: 320, to: 180, dur: 0.12, gain: 0.2, noise: 0.7 },
  legendForge: { track: 'event', wave: 'sine', freq: 880, dur: 0.7, gain: 0.3, chord: [1, 1.5, 2, 3] },
  freeze: { track: 'battle', wave: 'sine', freq: 1600, to: 2200, dur: 0.3, gain: 0.16, chord: [1, 1.5] },
  tap: { track: 'ui', wave: 'sine', freq: 520, dur: 0.04, gain: 0.1 },
}

export type SfxName = keyof typeof VOICES

const KEY = 'little-soldier-audio'
interface AudioPrefs {
  muted: boolean
  vol: Record<Track, number>
}

function loadPrefs(): AudioPrefs {
  const fallback: AudioPrefs = { muted: false, vol: { battle: 0.6, event: 0.7, ui: 0.5 } }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fallback
    const p = JSON.parse(raw) as Partial<AudioPrefs>
    return { muted: !!p.muted, vol: { ...fallback.vol, ...(p.vol ?? {}) } }
  } catch {
    return fallback
  }
}

let prefs = loadPrefs()
let ctx: AudioContext | null = null
let noiseBuf: AudioBuffer | null = null
/** 同一個音在這個毫秒數內不重播:普攻每秒好幾下,不節流會糊成一片噪音 */
const lastAt: Record<string, number> = {}
const THROTTLE: Record<string, number> = { hit: 70, crit: 90, kill: 60, gold: 140, tap: 50 }

export function audioPrefs(): AudioPrefs {
  return { muted: prefs.muted, vol: { ...prefs.vol } }
}

export function setMuted(muted: boolean) {
  prefs = { ...prefs, muted }
  persist()
}

export function setVolume(track: Track, v: number) {
  prefs = { ...prefs, vol: { ...prefs.vol, [track]: Math.max(0, Math.min(1, v)) } }
  persist()
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs))
  } catch {
    // 隱私模式寫不進去:音效照樣能用,只是不記住
  }
}

/** 第一次使用者手勢時呼叫。瀏覽器擋自動播放,在這之前建 context 也是 suspended */
export function unlock() {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      ctx = new Ctor()
      const len = Math.floor(ctx.sampleRate * 0.2)
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate)
      const d = noiseBuf.getChannelData(0)
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    }
    if (ctx.state === 'suspended') void ctx.resume()
  } catch {
    ctx = null
  }
}

/** 播一個音。整段自吞例外——音效壞掉不可以影響遊戲 */
export function play(name: SfxName) {
  try {
    const v = VOICES[name]
    if (!v || !ctx || prefs.muted) return
    const vol = prefs.vol[v.track]
    if (vol <= 0) return

    const now = ctx.currentTime
    const ms = performance.now()
    const gap = THROTTLE[name]
    if (gap !== undefined && ms - (lastAt[name] ?? -Infinity) < gap) return
    lastAt[name] = ms

    const out = ctx.createGain()
    // 微幅隨機音高:同一個音連續響時不會像機器,是「同一把武器的不同一下」
    const detune = 1 + (Math.random() - 0.5) * 0.06
    const peak = (v.gain ?? 0.2) * vol
    out.gain.setValueAtTime(0, now)
    out.gain.linearRampToValueAtTime(peak, now + 0.008)
    out.gain.exponentialRampToValueAtTime(0.0001, now + v.dur)
    out.connect(ctx.destination)

    for (const mult of v.chord ?? [1]) {
      const osc = ctx.createOscillator()
      osc.type = v.wave ?? 'sine'
      const f0 = v.freq * mult * detune
      osc.frequency.setValueAtTime(f0, now)
      if (v.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, v.to * mult * detune), now + v.dur)
      // 和聲各自減量,免得三個音疊起來爆音
      const g = ctx.createGain()
      g.gain.value = 1 / (v.chord?.length ?? 1)
      osc.connect(g).connect(out)
      osc.start(now)
      osc.stop(now + v.dur + 0.02)
    }

    if (v.noise && noiseBuf) {
      const src = ctx.createBufferSource()
      src.buffer = noiseBuf
      const ng = ctx.createGain()
      ng.gain.setValueAtTime(peak * v.noise, now)
      ng.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(v.dur, 0.12))
      src.connect(ng).connect(ctx.destination)
      src.start(now)
      src.stop(now + Math.min(v.dur, 0.12))
    }
  } catch {
    // 同上:音效永遠不擋主流程
  }
}
