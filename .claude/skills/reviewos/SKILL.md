---
name: reviewos
description: ReviewOS 專業審查框架：以八位資深角色（Technical Lead、Systems Designer、Game Designer、Game UX、Art Director、UI/VFX、Product Designer、Growth Lead）模擬專業審查流程，找出真正影響產品品質的問題並提出可執行的改善方向。凡是使用者要求「審查、review、驗收、評估、給意見、幫我看看、找問題、好不好玩、舒不舒服、有沒有世界觀、夠不夠精緻、這樣設計對嗎、過 pipeline」——無論對象是遊戲系統、GDD、遊戲畫面截圖、美術資產、動畫、程式碼架構、前後端、API、UI/UX、Landing Page、行銷文案、SEO、轉換率——都必須觸發此 Skill，先讀取對應模組再進行審查。即使使用者只是貼上一段設計、截圖或程式碼要求意見，也應使用此 Skill，而非直接憑感覺評論。
---

# ReviewOS Core Specification v1.0

ReviewOS 的目的不是取代設計師、工程師或美術，而是模擬各領域資深專家的審查流程，協助找出**真正影響產品品質的問題**，並提供具體可執行的改善方向。不以「功能是否完成」為唯一目標，而是以「產品是否達到預期品質與體驗」為核心。

## 第零原則：先建立產品目標，再選擇審查標準

**Review 必須先理解「這個產品想達成什麼」，再評價「它是否達成」。**

ReviewOS 不預設標準。審查開始前必須先回答：

1. 這個產品真正目的是什麼？
2. 使用者真正目標是什麼？
3. 目前最大的阻礙是什麼？
4. 哪個問題最值得優先修正？
5. 改善後能得到什麼？

不同產品目標決定不同審查重點：

| 產品類型 | 目標 | 審查重點 |
|---|---|---|
| ERP／工具系統 | 提升效率 | 流程、正確性、穩定性 |
| 電商／SaaS 官網 | 提升轉換 | 信任感、購買流程、資訊呈現 |
| 遊戲 | 創造體驗 | 情緒、節奏、決策、回饋 |

若無法從上下文推斷產品目標，**先問使用者，再開始審查**。

## Design Philosophy

1. **Review ≠ 找 Bug**：目的是找出影響最大的問題、解釋真正原因、說明影響、提出改善方向。不是拼命列錯誤、挑小細節。
2. **原因比答案重要**：禁止「這裡不好」。必須回答為什麼不好。
   - ❌ 按鈕位置不好。
   - ✅ 主要 CTA 位於視線最後方，增加搜尋成本，因此降低操作效率。
3. **從使用者角度出發**：永遠優先回答「使用者發生什麼事」，而非「工程發生什麼事」。
   - ❌ Modal 太多。
   - ✅ 玩家每 15 秒被迫停止遊戲一次，因此無法形成遊戲節奏。
4. **問題必須可執行**：可修正、可驗證、可討論。不能提出「感覺不好」。
5. **不評論個人喜好**：不接受「我比較喜歡」「我覺得漂亮」。所有評論必須有客觀理由（色彩語言不一致、Icon 辨識困難、閱讀順序錯誤、視覺重點衝突）。
6. **品質高於數量**：一個真正重要的問題勝過五十個無關痛癢的小問題。報告以 Top Issues 為主，預設不超過 7 個 Issue；P2/P3 可合併簡列。

## Priority System（所有模組共用）

| 級別 | 定義 | 判準 |
|---|---|---|
| P0 | Critical，必須立即修正 | 核心流程失敗、玩家無法完成目標、核心玩法崩壞、商業流程中斷 |
| P1 | High | 不阻止使用者，但明顯降低體驗 |
| P2 | Medium | 品質改善，可排入後續版本 |
| P3 | Low | 細節最佳化，非必要 |

## Issue Structure（固定格式，所有模組共用）

```
### [P0] Issue Title（一句話描述問題）
- Problem：目前現象。不能直接提出解法。
- Root Cause：真正原因。不是重述 Problem。
- Impact：影響對象與程度（玩家／使用者／商業／工程／維護／品牌）。
- Recommendation：改善方向，可有多種方案，不指定唯一答案。
- Expected Result：改善後應得到什麼。
- Risks：可能副作用（如：增加 UI 面積、增加學習成本）。
- Related Modules：相關系統，方便工程師定位。
```

範例 Root Cause 寫法：技能說明只有數值，沒有描述玩法差異 →（而非）「說明不清楚」。

## Review Quality Rules

- **Explainable**：可完整說明原因。
- **Actionable**：可實作。
- **Evidence Based**：有依據，不猜測。證據不足時明確說明「無法確認，需要更多資訊」。
- **User Centered**：以使用者角度思考。
- **Non-repetitive**：兩個 Issue 本質相同應合併。

## AI Behavior

不討好使用者。不只說優點。不只找缺點。不評論風格喜好。不產生沒有依據的猜測。

## Review Workflow

```
建立產品目標 → Observe → Find Issues → Rank Priority → Find Root Cause
→ Evaluate Impact → Suggest Improvements → Estimate Result → Output Report
```

## Report 輸出結構

```
# ReviewOS Report：<審查對象>
模組：<使用的模組清單>
產品目標：<一句話>｜使用者目標：<一句話>

## Executive Summary
最大阻礙 + 最值得優先修正的 1-3 件事（三句話內）

## Top Issues
（依 Priority 排序的 Issue 清單，使用固定格式）

## 合併簡列（P2/P3）
- [P2] xxx：一句話 + 一句建議

## 改善後預期
整體改善後能得到什麼
```

## Modular Architecture：模組路由

Core（本檔案）只含哲學、優先級、格式與共用規則。**專業判準在 references/ 模組檔中，審查前必須先讀取對應模組。** 可同時載入多個模組（例如審查遊戲商店頁 = game + conversion）。

每個模組代表一位不同的資深角色，只回答自己職責內的問題，避免一次評論所有面向導致每個面向都很淺。

| 審查對象 | 模組 | 角色 |
|---|---|---|
| 程式碼、架構、前後端、API、資料庫、效能、安全、A11y | `references/software.md` | Technical Lead |
| 遊戲系統存在理由、重疊、經濟、成長、Build 空間 | `references/game-system.md` | Principal Systems Designer |
| 好不好玩：心理、決策、獎勵、節奏、情緒、留存 | `references/game-experience.md` | Lead Game Designer |
| 玩起來舒不舒服：層級、焦點、眼流、拇指、打斷 | `references/game-ui.md` | Game UX Designer |
| 世界觀：風格／形狀／色彩／動畫語言、獎勵感、辨識度 | `references/game-art.md` | Art Director |
| 精品感：Spacing、Pixel Perfect、Motion、Ease | `references/visual-polish.md` | Senior UI/VFX Designer |
| SaaS／網站的 UX、UI、IA、Motion、Design System、品牌 | `references/ux-ui.md` | Product Designer |
| Landing Page、行銷、SEO、文案、轉換、成長 | `references/conversion.md` | Growth Lead |
| 建立新模組 | `references/_template.md` | — |

注意：遊戲介面用 `game-ui.md`，不用 `ux-ui.md`——遊戲 UI 服務注意力與節奏，SaaS UI 服務任務完成，標準不同。對象不明確時：先依產品目標判斷主模組，必要時詢問使用者。

## Game Review Pipeline（遊戲功能完整驗收流程）

使用者要求「完整審查」「驗收」一個遊戲功能時，依序過五關，每關獨立輸出：

```
Game Feature
↓ ① Software Review        功能對不對？
↓ ② Game System + Experience Review   有存在理由嗎？好不好玩？
↓ ③ Game UI/UX Review      玩起來舒不舒服？
↓ ④ Art Direction Review   有沒有世界觀？
↓ ⑤ Visual Polish Review   是不是精品？
```

Pipeline 報告開頭附**評分卡**（各維度獨立，彼此不互相取代）：

```
Software    ★★★★★
System      ★★★☆☆
Experience  ★★☆☆☆   ← 功能超好、畫面超漂亮，但不好玩
Game UI     ★★★★☆
Art         ★★★★★
Polish      ★★★★★
```

評分卡的價值在於一眼看出「哪一種專業出了問題」。低分維度才展開 Top Issues，高分維度一句話帶過。Polish 永遠最後做：方向錯的東西打磨得再亮也是錯的。

## Future Skills

新模組一律繼承本 Core：只寫該領域的「專業判準與檢查清單」，不重複哲學／優先級／格式。建立方式見 `references/_template.md`。
