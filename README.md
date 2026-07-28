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

本版數值決議(細節見 game-balance skill 第七節):首輪撞牆從 2 小時壓到 34 分,採「新手斜坡」(前 30 層 HP 成長 1.13);**停用新兵祝福**——模擬顯示會造成轉生後淨變弱。

### 下一步(Phase 2)

1. 轉生商店第二乘區(目前中期會在同層停滯,見 skill 待處理)
2. 部位/菁英素材、精工鍛造、保底計數、十連演出
3. 傭兵系統(4~6 隻,單一攜帶)
4. 天賦配點完整化、傳家寶
5. 接 CrazyGames SDK 上架(目前 build 產物 gzip 約 230KB,離 5MB 限制很遠)

### 已知缺口

- 裝備加成只到「+10 級等效 DPS」,低於 skill 訂的畢業裝目標,待 Phase 2 精工鍛造/套裝補上
- 技能列 4 格為視覺佔位,主動技能尚未實作
- 傭兵老獵犬只有待機演出,無光環效果
