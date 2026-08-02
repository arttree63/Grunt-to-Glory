#!/usr/bin/env python3
"""
素材檢查尺。掃 assets/visual 底下每一組動作幀,量四項指標並判 PASS / FAIL。

⚠️ 為什麼需要這支:先前一個「重擊」動畫做了五版才收貨,因為**沒有客觀驗收標準**,
只能靠眼睛看,看不順就重做。產線(Codex 側 generate2dsprite)其實有量指標,
但門檻可以設成 null 直接放行——arms-heavy-v5 的 body_scale_cv 高達 0.587 照樣出貨;
而 anchor_x_std 是**量了卻沒有門檻**,所以衝鋒那組 17px 的橫向漂移沒人擋。

這支不信任 pipeline-meta 的自評,一律從實際輸出的 PNG 重新量,
因此對任何來源的素材(Codex 產線、mflux、外購 CC0)都適用。

用法:
    ~/.venvs/mflux/bin/python tools/sprite/check.py            # 掃全部
    ~/.venvs/mflux/bin/python tools/sprite/check.py army       # 只掃某個子目錄
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from statistics import mean, pstdev

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
VISUAL = ROOT / "assets" / "visual"
SRC = ROOT / "src"

# ── 門檻 ──────────────────────────────────────────────────────────
# ⚠️ 這些數字是「尺」本身。要調就在這裡調,並在 clicker-ui skill 同步記一筆理由;
# 禁止在個別素材的 meta 裡把門檻設成 null 繞過——那正是五版重做的成因。
# ⚠️ 一把尺不能量所有東西。爆炸特效的「身高變異」本來就該很大,武器圖示根本沒有腳——
# 用角色的規則去量它們只會產生假陽性,然後大家就開始忽略這支工具的輸出。
# 分類由路徑決定,新增類別要在這裡補,不要在個別素材開例外。
RULES = {
    # 角色:站在地上、會播待機/動作,四項全查
    "character": dict(
        cv=0.12, foot=0.02, jitter=0.02, min_h=120,
        dirs=("heroes/", "monsters/", "mercenaries/", "army/", "events/", "rookie-soldier/"),
    ),
    # 場上物件:有底座、不會走動,放寬身高變異(開火/蓄力會變形)
    "prop": dict(cv=0.30, foot=0.03, jitter=0.03, min_h=90, dirs=("props/",)),
    # 特效:形變就是它的功能。只查「幀數夠不夠讓動作看得出來」
    "fx": dict(cv=None, foot=None, jitter=None, min_h=None, min_frames=6,
               dirs=("skills/", "vfx/", "fx/")),
    # 圖示 / 道具 / UI:靜態單張為主,不查對位
    "icon": dict(cv=None, foot=None, jitter=None, min_h=None,
                 dirs=("items/", "weapons/", "ui/", "scenes/")),
}
DEFAULT_KIND = "character"
FRAME_RE = re.compile(r"^(.+?)-(\d+)\.png$")


def kind_of(rel: str) -> str:
    for kind, cfg in RULES.items():
        if any(d in rel for d in cfg["dirs"]):
            return kind
    return DEFAULT_KIND


def frames_of(d: Path) -> list[Path]:
    """一組動作幀 = 目錄下 `名稱-數字.png`,排除 raw-sheet 這類中間產物。"""
    out = []
    for p in sorted(d.glob("*.png")):
        m = FRAME_RE.match(p.name)
        if m and "sheet" not in p.name:
            out.append((int(m.group(2)), p))
    return [p for _, p in sorted(out)]


def measure(paths: list[Path]) -> dict | None:
    """從 alpha 邊界量:主體高、腳底線、水平中心。全部正規化成佔格的比例。"""
    rows = []
    for p in paths:
        im = Image.open(p).convert("RGBA")
        bb = im.split()[-1].getbbox()
        if not bb:
            continue
        x0, y0, x1, y1 = bb
        rows.append(
            {
                "h": y1 - y0,
                "foot": y1 / im.height,          # 腳底線(越一致越不會上下浮)
                "cx": ((x0 + x1) / 2) / im.width,  # 水平中心
                "cell": im.height,
            }
        )
    if len(rows) < 2:
        return None

    hs = [r["h"] for r in rows]
    cxs = [r["cx"] for r in rows]
    # ⚠️ 橫向要分清楚「位移」與「抖動」:衝鋒本來就會往前推進,
    # 單看 std 會把正常的位移誤判成瑕疵。改量**方向反轉**:
    # 相鄰幀的位移方向來回翻,那才是抖。
    deltas = [cxs[i + 1] - cxs[i] for i in range(len(cxs) - 1)]
    flips = sum(
        1
        for i in range(len(deltas) - 1)
        if deltas[i] * deltas[i + 1] < 0 and min(abs(deltas[i]), abs(deltas[i + 1])) > 0.004
    )
    jitter = pstdev(deltas) if flips >= 2 else 0.0

    return {
        "n": len(rows),
        "body_scale_cv": pstdev(hs) / mean(hs) if mean(hs) else 0,
        "anchor_y_std": pstdev([r["foot"] for r in rows]),
        "x_jitter": jitter,
        "x_flips": flips,
        "x_range_px": (max(cxs) - min(cxs)) * rows[0]["cell"],
        "subject_h": mean(hs),
    }


def imported_dirs() -> set[str]:
    """哪些素材目錄真的被 src 引用。沒被引用的就是死素材,不必為它調品質。"""
    try:
        out = subprocess.run(
            ["grep", "-rho", r"assets/visual/[A-Za-z0-9_./-]*", str(SRC)],
            capture_output=True, text=True, check=False,
        ).stdout
    except Exception:
        return set()
    return {str(Path(line).parent) for line in out.splitlines() if line.strip()}


def verdict(m: dict, kind: str) -> list[str]:
    r = RULES[kind]
    bad = []
    if r["cv"] is not None and m["body_scale_cv"] > r["cv"]:
        bad.append(f"身高變異 {m['body_scale_cv']:.3f}>{r['cv']}")
    if r["foot"] is not None and m["anchor_y_std"] > r["foot"]:
        bad.append(f"腳底浮動 {m['anchor_y_std']:.3f}>{r['foot']}")
    if r["jitter"] is not None and m["x_jitter"] > r["jitter"]:
        bad.append(f"橫向抖動 {m['x_jitter']:.3f}(方向反轉 {m['x_flips']} 次)")
    if r["min_h"] is not None and m["subject_h"] < r["min_h"]:
        bad.append(f"主體太小 {m['subject_h']:.0f}px<{r['min_h']}")
    if r.get("min_frames") and m["n"] < r["min_frames"]:
        bad.append(f"幀數不足 {m['n']}<{r['min_frames']}")
    return bad


def main() -> int:
    only = sys.argv[1] if len(sys.argv) > 1 else ""
    used = imported_dirs()
    groups = []
    for d in sorted(VISUAL.rglob("*")):
        if not d.is_dir():
            continue
        fs = frames_of(d)
        if len(fs) < 2:
            continue
        rel = str(d.relative_to(ROOT))
        if only and only not in rel:
            continue
        groups.append((rel, fs))

    fails = dead = 0
    for rel, fs in groups:
        m = measure(fs)
        if not m:
            continue
        live = any(rel in u or u in rel for u in used)
        kind = kind_of(rel.replace("assets/visual/", ""))
        bad = verdict(m, kind)
        if not live:
            dead += 1
        tag = "PASS" if not bad else "FAIL"
        if bad:
            fails += 1
        used_tag = "" if live else "  [未被引用]"
        short = rel.replace("assets/visual/", "")
        print(f"{tag}  [{kind:<9}] {short:<40} {m['n']}幀  高{m['subject_h']:>5.0f}px{used_tag}")
        for b in bad:
            print(f"        └ {b}")

    print(f"\n共 {len(groups)} 組:{len(groups)-fails} 通過 / {fails} 不合格 / {dead} 未被引用")
    return 1 if fails else 0


if __name__ == "__main__":
    raise SystemExit(main())
