---
name: game-visual
description: 視覺與演出的唯一規範:動畫節奏(預備/命中/頓格/收招)、素材規格與驗收門檻、外部素材與開源套件的引用判準。任何「畫面上看得到的東西」——角色動作、技能演出、打擊感、特效、素材產生或引入、抓 CC0 資源、裝視覺套件——動工前都要先讀這份。觸發詞:動畫、揮擊、攻擊動作、打擊感、太快、太亂、演出、特效、sprite、素材、去背、切幀、風格、美術、CC0、素材包、粒子、濾鏡。
---

# 視覺與演出規範 v1.1

> **這份 skill 專門管「畫面上看得到的東西做得對不對」。**
> 版面配置、分頁結構、HUD 位置歸 `clicker-ui`;數值與平衡歸 `game-balance`。
> 衝突時:構圖聽 clicker-ui,**節奏、素材規格、外部資源引用聽這裡**。

## 〇、第一守則

一個「重擊」動畫做了 **五版** 才收貨(`arms-heavy-v1`~`v5` 加衝鋒兩版,71 個檔案只有 15 個進遊戲)。
根因不是美感,是**沒有客觀驗收標準**——只能靠眼睛看,看不順就重做,而重做方向靠猜,所以來回擺盪。

更糟的是尺存在卻能被關掉:`pipeline-meta.json` 的 QC 門檻允許設 `null`,
`arms-heavy-v5` 的 `body_scale_cv` 高達 **0.587** 照樣出貨;`anchor_x_std` 更是量了卻沒門檻。

> **不合格的東西不准進 repo。門檻不准為個案關掉。**
> 覺得門檻不對,就改門檻並在本檔記一筆理由——不要開例外。

---

## 一、演出節奏:五拍 + 頓格

這一節是通用的,不限本專案:任何 2D 動作的打擊感都建立在這個結構上。

| 拍 | 時長 | 玩家看到什麼 | 為什麼 |
|---|---|---|---|
| **預備** wind-up | **100~200ms** | 蓄力、後拉、重心下沉 | 眼睛要被預告。太短 = 打擊沒有來由,只感覺一閃而過 |
| **加速** | 40~60ms | 全速切入 | 預備要**保持速度**再加速,不是慢慢起 |
| **命中** contact | **20~40ms(全程最短)** | 定格在最強的姿勢 | 最短的一格讀起來最重:時間被壓縮 = 力量 |
| **頓格** hit stop | **1~2 幀(16~33ms)** | 畫面暫停 | 1~2 幀就明顯有感,給大腦一瞬間登記這一擊 |
| **收招** recovery | 60~100ms | 緩速回待機 | 減速的過程在傳達重量 |

### 三條硬規則

1. **幀時間必須不等長。** 等距播放是好動畫的天敵。逐幀序列一律附 `FRAME_MS` 表,不共用常數。
   專案內的正確範例:
   `ARMS_HEAVY_FRAME_MS = [115, 90, 58, 48, 52, 58, 105, 82, 72, 80, 96, 125]`
   ——預備慢、切入快、命中最短(48)、收招再放慢。
2. **命中一定要有頓格。** 沒有頓格的打擊,再多特效都只會顯得「亂」而不是「重」。
3. ⚠️ **頓格只能是表現層的,不可延後傷害結算。**
   見 `game.ts` `dealDamage` 的凍結註解:延遲傷害曾造成「倒數前明明打夠了卻判失敗」。
   正確前例是凍結——傷害即時扣血,`frozenPool` 只做演出彙總。

### 多段技能

技能描述寫「三段突擊」「八段攻擊」,畫面就必須看得到三段、八段。
`skill` 事件帶 `hits`(實際段數,含融合加段)與 `auto`。段間距 **≥110ms**
(受擊閃白是 70ms,段間必須大於它才看得到「閃-恢復-再閃」)。
自動施放走濃縮版(段間 70ms、不做 zoom):zoom 是「玩家自己出手」的獎勵。

### 現況對照(2026-08-02 量測,主角揮擊 230ms)

| 拍 | 標準 | 現況 | |
|---|---|---|---|
| 預備 | 100~200ms | **55ms** | 短 2~4 倍 |
| 命中 | 20~40ms 定格 | 無明確命中幀,一路漸進 | 缺 |
| 頓格 | 1~2 幀 | **全引擎未實作** | 缺 |
| 收招 | 60~100ms | 97ms | 合格 |

**「技能太快、有點亂」的根因就在這張表。**

---

## 二、素材規格與驗收

### 分類決定用哪把尺

⚠️ 一把尺不能量所有東西。爆炸的「身高變異」本來就該大、武器圖示根本沒有腳。
用角色規則去量它們只會產生假陽性,**假陽性會讓人開始忽略工具,那比沒工具更糟**。

| 類別 | 目錄 | 身高變異 | 腳底浮動 | 橫向抖動 | 主體高 | 幀數 |
|---|---|---|---|---|---|---|
| character | heroes / monsters / mercenaries / army / events | ≤0.12 | ≤0.02 | ≤0.02 | ≥120px | — |
| prop | props | ≤0.30 | ≤0.03 | ≤0.03 | ≥90px | — |
| fx | skills / vfx / fx | — | — | — | — | ≥6 |
| icon | items / weapons / ui / scenes | — | — | — | — | — |

**橫向要分清「位移」與「抖動」**:衝鋒本來就會前進,單看標準差會誤判。
判準是**方向反轉**——相鄰幀位移方向來回翻才是抖。

### 尺寸與對位

- 格 **256×256**;角色主體高 **140~210px**。
  ⚠️ 現況 `mercenaries/rogue` 106px、`ice-mage` 110px、`vanguard/charge` 101px,
  比主角(142)與怪物(206)小三成——**「看起來過於簡化」的量化答案**,細節量天生不夠。
- **腳底線統一 `y = 233/256`**。引擎 anchor 用這個數字,產線卻對齊 128 中心,兩邊不一致才是抖的根源。
- 怪物 120~150px、Boss 佔格 90%。
- **濾波全遊戲統一**(`nearest` 或 `linear` 二選一)。現況部分素材被單獨改成 `linear`,
  同屏一半銳利一半模糊。

### 驗收

```bash
~/.venvs/mflux/bin/python tools/sprite/check.py          # 掃全部
~/.venvs/mflux/bin/python tools/sprite/check.py army     # 只掃某類
```

`check.py` **不信任 meta 的自評**,從實際 PNG 重新量,因此對任何來源都適用
(自產 / mflux / 外購)。同時標出「未被 `src` 引用」的死素材。
每個素材目錄必留 `prompt-used.txt`——沒有 prompt 紀錄的素材視同**不可重製**。

---

## 三、外部素材:什麼該找現成、怎麼挑

**原則:沒有身分的用現成,有身分的自己做。**

| | 用現成 | 必須自製 |
|---|---|---|
| 什麼 | 爆炸、火焰、冰霜、煙塵、命中火花、魔法陣、環境粒子、UI 九宮格與圖框 | 主角(背影紙娃娃)、怪物(要眼睛面向玩家的對峙構圖)、場景、標題 |
| 為什麼 | 物理現象沒有敘事身分,誰畫的都一樣 | 帶敘事身分的東西市面上不存在,而且它是玩家記得住的部分 |

### 常用來源與各自的坑

| 來源 | 特性 | 注意 |
|---|---|---|
| [Kenney](https://kenney.nl) | 一人工作室,40,000+ 資產**全部 CC0**、免註冊 | 風格乾淨一致,但偏簡潔向量/低多邊形,與手繪像素風不一定合 |
| [OpenGameArt](https://opengameart.org) | 十年以上的老庫,量大 | **授權混雜**(CC0 / CC-BY / GPL 都有),必須逐件看;用篩選器只挑 CC0 可以省掉署名的麻煩 |
| [itch.io](https://itch.io) | 免費與付費混合,風格選擇最多 | **每個包授權都不同**,不能假設 |

### 挑選判準(六條全過才用)

1. **授權明確**,且 `LICENSE.txt` 跟素材一起存進目錄
   (沿用 `assets/visual/vfx/cc0-spells/` 的做法)
2. **同一包、同作者、同風格**——多來源東拼西湊必然不一致
3. 含逐幀序列,幀數 **≥8**
4. 解析度 ≥ 顯示尺寸的 **1.5 倍**
5. **偏白 / 單色優先**——可用 Pixi `tint` 染進本作調色盤;彩色寫死的融不進去
6. 進 repo 前跑 `check.py`

⚠️ **授權一律在使用前自行到來源頁確認,不要憑印象或憑本檔的敘述。**
CC0 = 無限制;CC-BY = 必須署名;其他授權可能禁止商用或要求同授權釋出。

---

## 四、開源套件:什麼時候該裝

本專案渲染層是 **PixiJS 8**(`pixi.js ^8.6.0`),目前**沒有裝任何額外視覺套件**。

**先問:能不能用既有的做?** 多裝一個套件就多一份載入體積與版本相依。
但**手刻粒子系統、濾鏡、骨架動畫是明確的重造輪子**,那類該裝。

| 需求 | 建議 | 說明 |
|---|---|---|
| 大量粒子(火花、塵土、殘焰) | [`@pixi/particle-emitter`](https://github.com/pixijs-userland/particle-emitter) | 官方 userland,附互動式編輯器可先調好再貼設定 |
| 極大量同類 sprite | Pixi 內建 `ParticleContainer` | 為速度而生的 Container,不必外部套件 |
| 發光 / 模糊 / 色調 | [`pixi-filters`](https://github.com/pixijs/filters) | 官方濾鏡集合 |
| 骨架動畫(換裝、複雜動作) | Spine-Pixi | ⚠️ Spine 編輯器是**商業軟體**,採用前先確認授權成本 |

裝之前確認三件事:**與 Pixi 8 相容**、**授權可商用**、**體積可接受**
(本作是手機網頁,首屏預抓已經有預算壓力)。

生態系全貌見 [PixiJS Ecosystem](https://pixijs.com/8.x/guides/getting-started/ecosystem)。

---

## 五、角色動作優先程式補間

專案原本明訂「禁止逐幀 spritesheet」(美術成本原則),現況已有大量逐幀圖。規則改寫為現實版:

- **角色本體** = 程式補間 + 少量 idle 逐幀
- **FX** 逐幀允許,但要過 `check.py`
- **禁止為單一技能生成全身逐幀**——那正是五版重做的來源

---

## 六、來源

動畫節奏的數字取自業界慣例,非本專案自創:

- [Timing in Animation: A Practical, Game-Ready Guide for 2D & 3D](https://sunstrikestudios.com/en/timing_in_animation)
- [Sword Melee Animation Guide: Timing, Parries, Impact — MoCap Online](https://mocaponline.com/blogs/mocap-news/sword-melee-animation-guide)
- [Animation Gameplay Essentials — Attacks](https://www.animotionx.com/en/post/animation-gameplay-essentials-episode-4-5-attacks)
- [The 12 animation principles adapted for pixel art sprites](https://www.sprite-ai.art/guides/animation-principles)
- [Animation Timing in 2D Games: The FPS Science Behind Snappy Pixel Art](https://spritesheetgenerator.online/blog/animation-timing-fps-pixel-art)

素材來源與套件:

- [Kenney](https://kenney.nl) ・ [OpenGameArt](https://opengameart.org) ・ [itch.io](https://itch.io)
- [PixiJS Ecosystem](https://pixijs.com/8.x/guides/getting-started/ecosystem) ・
  [particle-emitter](https://github.com/pixijs-userland/particle-emitter) ・
  [pixi-filters](https://github.com/pixijs/filters)
