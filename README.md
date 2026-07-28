# Grunt to Glory / 《小兵的故事》

點擊放置 RPG。Web/PWA → CrazyGames → Capacitor 雙平台。
對外(CrazyGames、package name、封包 id)一律用 **Grunt to Glory**;遊戲內文案維持繁中。

> 存檔 key 仍是 `little-soldier-save`,改名會清掉玩家進度,不要動。

## 指令

```bash
npm run dev        # 開發伺服器 (5173)
npm run test       # /core 單元測試
npm run sim        # 數值 headless 模擬(調常數後必跑)
npm run typecheck
npm run build
```

## 架構

```
src/
  core/    純 TS 遊戲邏輯,零依賴、可 headless 測(不 import React/Pixi)
  render/  Pixi v8 戰鬥演出,只讀 snapshot
  store/   Zustand + 固定 10Hz tick + localforage 存檔
  ui/      React 面板(與 render 不互相 import)
tools/balance-sim/  數值模擬,直接 import core/formulas
docs/               完整 GDD、背後視角原型 HTML
.claude/skills/     clicker-ui(介面規範)、game-balance(數值真相來源)
```

規則:數值只能改 `core/balance.ts`,且必須先改 `game-balance` skill → 跑 `npm run sim` → 結果貼回 skill。

## 進度

**Phase 1 (MVP) 完成**,已在瀏覽器實測全流程:

- [x] 三層架構 + break_infinity Decimal
- [x] 戰鬥 tick、金幣、升級成本曲線(21 項單元測試)
- [x] 背後視角戰鬥演出:揮砍、深度感湧怪、傷害跳字、震屏、Boss 壓迫構圖
- [x] 主畫面 + 五個 Tab 面板
- [x] 每 10 層限時 Boss;失敗退回該層 farm,清一輪自動重挑戰
- [x] 存檔/讀檔(版本欄位 + 遷移點)、離線收益 6 折 4 小時上限
- [x] 普通鍛造 + 分解回收 + 一鍵分解
- [x] 無名小兵 + 重裝步兵/突擊斥候(轉職同步換披風與武器外觀)

**裝備改版(第二批)完成**:

- [x] 修 tick 離散化 bug:溢出傷害帶到下一隻(舊版 Lv.80 實際進度比數值模型慢 4.8 倍)
- [x] 模擬改為直接驅動真實遊戲迴圈(applyTick @10Hz),模擬與遊戲不可能再漂移
- [x] 裝備改成「每件獨立乘區」:全金 5 件 = +29 級等效,命中 skill 的 25~35 級目標
- [x] 鐵匠鋪等級(累積鍛造次數)+ 菁英保底計數(30 次)
- [x] 傳家寶:轉生可指定 1 件帶到下一代
- [x] 存檔 v1→v2 遷移(`migrate()` 不再是空殼)

數值決議見 game-balance skill 第七節。首輪:純掛機 81 層 / 49 分,積極點擊 101 層 / 44 分。

**轉生科技(第三批)完成**:

- [x] 勳章從被動加成改為**純貨幣**,效果全部來自可購買科技,每級乘算
- [x] 四條科技線:軍功勳令(傷害)、後勤補給(金幣,第二乘區)、老兵餘蔭(開局資金)、營地帳篷(離線上限)
- [x] 模擬固定亂數種子,兩次跑結果一致(否則鍛造運氣的雜訊會蓋掉常數調整)
- [x] 存檔 v2→v3 遷移

同層停滯已消除:掛機 91→111→121→141→181→221,每輪 36~55 分。

### 下一步

1. 部位/菁英素材 + 精工鍛造(爬塔↔刷寶綁定)
3. 寶箱怪/黃金哥布林突發事件
4. 上架前必須:新手引導 + Boss 失敗指引 + 數值來源面板;CrazyGames SDK 雲存檔;CI 跑 /core 測試

技能 4 格、傭兵/套裝/圖鑑壓到 CrazyGames 首發後當更新內容。

### 已知缺口

- 純掛機首輪 49 分,超出 skill 訂的 30~45 分上限(原因是裝備變得值得追,暫時接受)
- 首輪長度受鍛造運氣影響大(同常數不同種子:36~53 分)
- 技能列 4 格為視覺佔位;傭兵老獵犬只有待機演出,無光環效果
- 沒有新手引導;無雲存檔;無 CI
