class_name CombatModel
extends RefCounted

const MAX_TRAINING_LEVEL := 200
const MAX_MOMENTUM := 100.0
const AUTO_ATTACK_INTERVAL := 0.55
const MIN_AUTO_ATTACK_INTERVAL := 0.18
const AUTO_SLOT_COUNT := 5
const HIGH_ARMOR_THRESHOLD := 18.0
const MAX_IMMOVABLE := 3
const MAX_YOUREN := 5
const FLOW_HITS_REQUIRED := 2
const MAX_MAGIC_MARKS := 5
const MAX_BURN := 5
const MAX_HOLY_SEALS := 5
const MAX_MILITARY_MOMENTUM := 100.0
const ALLY_ATTACK_INTERVAL := 2.6
const WAVE_TRANSITION_DURATION := 0.8
const DODGE_CAP := 0.55
const TRAINING_ORDER := ["martial", "physique", "agility", "magic", "faith", "command"]
const TRAINING_DEFS := {
	"martial": {"name": "武藝", "style": "一刀流", "implemented": true, "special": "攻擊、爆發、破甲"},
	"physique": {"name": "體術", "style": "返刃流", "implemented": true, "special": "生命、防禦、格擋、反擊"},
	"agility": {"name": "敏捷", "style": "閃影流", "implemented": true, "special": "攻速、閃避、暴擊、追擊"},
	"magic": {"name": "魔法", "style": "魔劍流", "implemented": true, "special": "魔紋、燃燒、元素爆發"},
	"faith": {"name": "信仰", "style": "聖劍流", "implemented": true, "special": "聖印、治療、護盾、制裁"},
	"command": {"name": "統御", "style": "軍團劍技流", "implemented": true, "special": "軍勢、友軍、雙向連攜"},
}
const EQUIPMENT_SLOT_NAMES := {"weapon": "武器", "armor": "防具", "accessory": "飾品"}
const EQUIPMENT_QUALITY_NAMES := {"common": "普通", "uncommon": "良品", "rare": "稀有", "epic": "史詩"}
const EQUIPMENT_QUALITY_COSTS := {"common": 60, "uncommon": 90, "rare": 140, "epic": 220}
const EQUIPMENT_DEFS := {
	"black_iron_cleaver": {"name": "黑鐵斬劍", "slot": "weapon", "quality": "rare", "primary_style": "martial", "description": "對重甲敵人更有效的哨站軍官劍。", "style_bonuses": {"martial": 6}, "modifiers": {"armored_damage": 0.1}},
	"black_iron_sword": {"name": "黑鐵長劍", "slot": "weapon", "quality": "common", "primary_style": "martial", "description": "制式軍劍，適合磨練穩定的一刀。", "style_bonuses": {"martial": 5}},
	"magic_rune_sword": {"name": "魔紋長劍", "slot": "weapon", "quality": "rare", "primary_style": "magic", "description": "劍脊刻著能引導魔力的基礎符文。", "style_bonuses": {"magic": 7}},
	"officer_sword": {"name": "軍官佩劍", "slot": "weapon", "quality": "rare", "primary_style": "command", "description": "兼顧個人劍術與軍陣號令。", "style_bonuses": {"martial": 3, "command": 5}},
	"black_iron_armor": {"name": "哨站重甲", "slot": "armor", "quality": "common", "primary_style": "physique", "description": "厚重可靠，能減輕重擊造成的傷害。", "style_bonuses": {"physique": 6}, "modifiers": {"heavy_damage_taken": -0.1}},
	"temple_armor": {"name": "聖堂護甲", "slot": "armor", "quality": "rare", "primary_style": "faith", "description": "受祝福的護甲，兼顧守勢與信念。", "style_bonuses": {"physique": 5, "faith": 5}},
	"momentum_talisman": {"name": "蓄勢護符", "slot": "accessory", "quality": "uncommon", "primary_style": "martial", "description": "勢的獲取速度提高 15%。", "style_bonuses": {"martial": 3}, "modifiers": {"momentum_gain": 0.15}},
	"iron_guard_emblem": {"name": "不動鐵徽", "slot": "accessory", "quality": "rare", "primary_style": "physique", "description": "哨站守軍留下的格擋徽記。", "style_bonuses": {"physique": 5}},
	"swift_wind_feather": {"name": "游風羽飾", "slot": "accessory", "quality": "rare", "primary_style": "agility", "description": "輕得幾乎感覺不到的青羽飾品。", "style_bonuses": {"agility": 5}},
	"magic_iron_core": {"name": "魔紋鐵核", "slot": "accessory", "quality": "rare", "primary_style": "magic", "description": "仍殘留微弱魔力的黑鐵核心。", "style_bonuses": {"magic": 5}},
	"chaplain_seal": {"name": "軍牧聖印", "slot": "accessory", "quality": "rare", "primary_style": "faith", "description": "守軍軍牧佩戴的樸素聖印。", "style_bonuses": {"faith": 5}},
	"centurion_banner": {"name": "百夫長旗章", "slot": "accessory", "quality": "rare", "primary_style": "command", "description": "代表前線號令權的殘破旗章。", "style_bonuses": {"command": 5}},
}
const ALLY_DEFS := {
	"infantry": {"name": "王國步兵", "unlock_level": 10, "role": "前排作戰，定時揮劍並為主角累積軍勢"},
	"scout": {"name": "王國斥候", "unlock_level": 80, "role": "高頻追擊，提高軍團連攜次數"},
	"mage": {"name": "隨軍法師", "unlock_level": 130, "role": "追加魔力攻擊與破甲支援"},
	"cleric": {"name": "隨軍聖職", "unlock_level": 200, "role": "進攻時同步為全軍提供小型治療"},
}
const ENEMY_DEFS := {
	"grunt": {"name": "黑鐵新兵", "role": "基準近戰", "hint": "攻守平衡，用來確認目前戰力", "hp": 1.0, "armor": 1.0, "damage": 1.0, "interval": 2.25},
	"raider": {"name": "黑鐵劍兵", "role": "高頻攻擊", "hint": "出手快速，會頻繁養出格擋與閃避觸發", "hp": 0.9, "armor": 0.78, "damage": 0.78, "interval": 1.35},
	"brute": {"name": "黑鐵重槌兵", "role": "碎甲重擊", "hint": "蓄力久但傷害高，重擊會打亂流派節奏", "hp": 1.28, "armor": 1.08, "damage": 1.48, "interval": 3.35},
	"shield": {"name": "黑鐵盾衛", "role": "高護甲", "hint": "普通攻擊效率較低，破甲與魔劍更有效", "hp": 1.3, "armor": 2.45, "damage": 0.9, "interval": 2.65},
	"centurion": {"name": "黑鐵百夫長", "role": "精英統合", "hint": "重甲、蓄力重擊與低血狂暴的綜合考驗", "hp": 1.62, "armor": 1.75, "damage": 1.28, "interval": 2.45},
	"caster": {"name": "林地咒術師", "role": "範圍施法", "hint": "以範圍與必中術打斷節奏", "hp": 0.92, "armor": 0.68, "damage": 1.18, "interval": 3.0},
	"boss": {"name": "黑鐵統領", "role": "重甲首領", "hint": "每隔數次攻擊施放碎甲重擊，30% 生命進入狂怒", "hp": 2.2, "armor": 1.5, "damage": 1.25, "interval": 2.0},
}
const FRONTIER_STAGE_WAVES := {
	1: ["grunt"], 2: ["grunt", "grunt"], 3: ["raider"], 4: ["shield"],
	5: ["raider", "shield"], 6: ["brute"], 7: ["brute", "grunt"], 8: ["centurion"],
	9: ["raider", "shield", "brute"], 10: ["boss"],
}
const SHIELD_BYPASS_SOURCES := {
	"magic_enchant": true, "magic_slash": true, "flame_burst_slash": true,
	"elemental_boundary_slash": true, "elemental_resonance": true, "minor_resonance": true,
	"lightning_chain": true, "lightning_tick": true, "burn_tick": true,
	"holy_enchant": true, "holy_light_slash": true, "judgment_slash": true,
}
const JOURNEY_ROUTES := {
	"mountain": {"name": "灰狼山道", "intro": "碎石路上滿是爪痕。狼群與山賊正沿峽谷逼近。", "effect": "敵人更快更強｜每次戰鬥累積額外 20% 修練"},
	"village": {"name": "邊境村落", "intro": "炊煙後藏著被劫掠的屋舍。村民請你守住最後一條路。", "effect": "選擇時回復生命｜區域敵人稍弱｜每戰額外恢復"},
	"battlefield": {"name": "沉眠古戰場", "intro": "鏽劍遍地，亡者仍守著早已不存在的軍旗。", "effect": "敵人生命與護甲提高｜擊敗 Boss 額外獲得 3 修練"},
}
const ROUTE_ENEMY_NAMES := {
	"frontier": {"grunt": "黑鐵新兵", "raider": "黑鐵劍兵", "brute": "黑鐵重槌兵", "shield": "黑鐵盾衛", "centurion": "黑鐵百夫長", "caster": "林地咒術師", "boss": "黑鐵統領"},
	"mountain": {"grunt": "灰峽野狼", "raider": "裂牙獵狼", "brute": "岩背巨狼", "shield": "山道盾匪", "caster": "峽谷獵手", "boss": "峽谷狼王"},
	"village": {"grunt": "劫村盜匪", "raider": "盜匪斥候", "brute": "破門暴徒", "shield": "掠村盾徒", "caster": "縱火術士", "boss": "黑旗盜匪頭目"},
	"battlefield": {"grunt": "徘徊亡兵", "raider": "斷刃幽魂", "brute": "鐵甲屍兵", "shield": "古戰盾靈", "caster": "戰場怨靈", "boss": "無首將軍"},
}
const AUTO_TACTIC_DEFS := {
	"execute_slash": [
		{"id": "hp25", "name": "血≤25%", "description": "目標生命低於 25% 才斬首"},
		{"id": "hp35", "name": "血≤35%", "description": "更早嘗試斬首"},
	],
	"return_blade": [
		{"id": "any", "name": "任何攻擊", "description": "敵人即將出手就準備返刃"},
		{"id": "heavy", "name": "重擊才擋", "description": "保留返刃給重擊與必中攻擊"},
	],
	"swift_step": [
		{"id": "any", "name": "下一攻擊", "description": "冷卻完成就準備瞬步"},
		{"id": "danger", "name": "重擊/範圍", "description": "只在下一招是重擊或範圍時準備"},
		{"id": "heavy", "name": "只閃重擊", "description": "保留瞬步給重擊"},
	],
	"holy_light_slash": [
		{"id": "offense", "name": "可用就放", "description": "以輸出優先施放聖光斬"},
		{"id": "hp70", "name": "HP<70%", "description": "受傷後才施放，同時回復生命"},
		{"id": "hp50", "name": "HP<50%", "description": "保留聖印給危急時使用"},
	],
	"legion_command": [
		{"id": "full", "name": "軍勢滿", "description": "軍勢已滿就發動號令"},
		{"id": "elite", "name": "精英+", "description": "只對精英或首領發動"},
		{"id": "boss", "name": "只打首領", "description": "保留全軍進攻給首領"},
	],
	"grace_heal": [
		{"id": "hp70", "name": "HP<70%", "description": "生命低於 70% 自動恩典治療"},
		{"id": "hp50", "name": "HP<50%", "description": "生命低於 50% 才治療"},
		{"id": "hp30", "name": "HP<30%", "description": "只在危急時消耗聖印治療"},
	],
}
const GROWTH := {
	"common": {"hp": 1.5, "mp": 0.0, "attack": 0.25, "defense": 0.15, "attack_speed": 0.0},
	"martial": {"hp": 0.5, "mp": 0.0, "attack": 0.7, "defense": 0.2, "attack_speed": 0.0},
	"physique": {"hp": 2.0, "mp": 0.0, "attack": 0.15, "defense": 0.8, "attack_speed": 0.0},
	"agility": {"hp": 0.4, "mp": 0.0, "attack": 0.35, "defense": 0.05, "attack_speed": 0.0},
	"magic": {"hp": 0.2, "mp": 1.5, "attack": 0.35, "defense": 0.05, "attack_speed": 0.0},
	"faith": {"hp": 1.2, "mp": 1.0, "attack": 0.28, "defense": 0.45, "attack_speed": 0.0},
	"command": {"hp": 1.0, "mp": 0.25, "attack": 0.32, "defense": 0.3, "attack_speed": 0.0},
}
const SKILL_DEFS := {
	"heavy_strike": {
		"name": "重擊", "short": "重擊", "type": "active", "track": "common", "level": 1,
		"cooldown": 4.5, "resource": "none", "cost": 0.0,
		"condition": "敵人在攻擊範圍內", "damage_multiplier": 1.8, "armor_ignore": 0.0,
		"tags": ["BASIC_SWORD", "HEAVY_ATTACK", "MELEE"], "implemented": true,
	},
	"remaining_heart": {
		"name": "殘心", "short": "殘心", "type": "passive", "track": "martial", "level": 130,
		"condition": "一刀未擊殺返還 20 勢", "momentum_refund": 20.0,
		"tags": ["ONE_SLASH"], "implemented": true,
	},
	"armor_flash": {
		"name": "破甲一閃", "short": "破甲", "type": "active", "track": "martial", "level": 60,
		"cooldown": 3.0, "resource": "momentum", "cost": 70.0,
		"condition": "敵方護甲 ≥ 18 且勢 ≥ 70", "damage_multiplier": 4.0, "armor_ignore": 0.75, "armor_break": 12.0,
		"tags": ["ONE_SLASH", "ARMOR_BREAK"], "implemented": true,
	},
	"one_slash_mastery": {
		"name": "一刀流極意", "short": "極意", "type": "passive", "track": "martial", "level": 100,
		"condition": "出刀前每 1 勢提高一刀傷害 0.6%",
		"tags": ["ONE_SLASH"], "implemented": true,
	},
	"execute_slash": {
		"name": "斷首", "short": "斷首", "type": "active", "track": "martial", "level": 30,
		"cooldown": 2.0, "resource": "momentum", "cost": 70.0,
		"condition": "目標生命 ≤ 25% 且勢 ≥ 70", "damage_multiplier": 6.0, "armor_ignore": 0.35,
		"tags": ["ONE_SLASH", "EXECUTE"], "implemented": true,
	},
	"draw_stance": {
		"name": "拔刀", "short": "拔刀", "type": "active", "track": "martial", "level": 50,
		"cooldown": 18.0, "resource": "none", "cost": 0.0,
		"condition": "未處於拔刀狀態", "tags": ["ONE_SLASH", "BURST"], "implemented": true,
	},
	"mountain_break": {
		"name": "斷嶽", "short": "斷嶽", "type": "active", "track": "martial", "level": 120,
		"cooldown": 6.0, "resource": "momentum", "cost": 90.0,
		"condition": "勢 ≥ 90", "damage_multiplier": 8.0, "armor_ignore": 0.45,
		"tags": ["ONE_SLASH", "BOSS"], "implemented": true,
	},
	"two_cut": {
		"name": "一刀兩斷", "short": "兩斷", "type": "ultimate", "track": "martial", "level": 200,
		"cooldown": 8.0, "resource": "momentum", "cost": 100.0,
		"condition": "勢已滿", "damage_multiplier": 12.0, "armor_ignore": 0.5,
		"tags": ["ONE_SLASH", "EXECUTE"], "implemented": true,
	},
	"return_blade": {
		"name": "返刃", "short": "返刃", "type": "active", "track": "physique", "level": 30,
		"cooldown": 4.0, "resource": "none", "cost": 0.0,
		"condition": "敵人即將攻擊", "tags": ["BLOCK", "COUNTER"], "implemented": true,
	},
	"guard_stance": {
		"name": "守勢", "short": "守勢", "type": "active", "track": "physique", "level": 10,
		"cooldown": 10.0, "resource": "none", "cost": 0.0,
		"condition": "不動未滿時，4 秒內格擋率 +30%、完美格擋率 +5%",
		"tags": ["BLOCK", "STANCE"], "implemented": true,
	},
	"immovable_form": {
		"name": "不動", "short": "不動", "type": "passive", "track": "physique", "level": 10,
		"condition": "格擋累積不動，最高 3 層", "tags": ["BLOCK", "STANCE"], "implemented": true,
	},
	"borrow_force": {
		"name": "借力", "short": "借力", "type": "passive", "track": "physique", "level": 20,
		"condition": "格擋減免量的 35% 轉為反擊傷害", "tags": ["BLOCK", "COUNTER"], "implemented": true,
	},
	"collapse_counter": {
		"name": "崩勢反擊", "short": "崩返", "type": "active", "track": "physique", "level": 50,
		"cooldown": 5.0, "resource": "immovable", "cost": 3.0,
		"condition": "不動達 3 層", "tags": ["COUNTER", "BURST"], "implemented": true,
	},
	"heaven_return": {
		"name": "奧義・不動返天", "short": "返天", "type": "ultimate", "track": "physique", "level": 200,
		"condition": "滿層不動承受重擊或致命攻擊時自動發動", "tags": ["BLOCK", "COUNTER", "ULTIMATE"], "implemented": true, "reactive": true,
	},
	"swift_step": {
		"name": "瞬步", "short": "瞬步", "type": "active", "track": "agility", "level": 50,
		"cooldown": 5.0, "resource": "none", "cost": 0.0,
		"condition": "待發時必定閃避下一次可閃避攻擊", "tags": ["DODGE", "FOLLOW_UP"], "implemented": true,
	},
	"flowing_ease": {
		"name": "游刃", "short": "游刃", "type": "passive", "track": "agility", "level": 20,
		"condition": "連續攻擊與閃避累積游刃；滿層每 2 次普攻追加追斬", "tags": ["DODGE", "STACK", "FOLLOW_UP"], "implemented": true,
	},
	"swift_cut": {
		"name": "疾斬", "short": "疾斬", "type": "active", "track": "agility", "level": 10,
		"cooldown": 3.2, "resource": "none", "cost": 0.0,
		"condition": "敵人在攻擊範圍內；快速連斬兩次", "damage_multiplier": 0.8,
		"tags": ["MELEE", "FOLLOW_UP"], "implemented": true,
	},
	"shadow_assault": {
		"name": "影襲", "short": "影襲", "type": "active", "track": "agility", "level": 30,
		"cooldown": 0.8, "resource": "none", "cost": 0.0,
		"condition": "成功閃避後短暫可用", "tags": ["DODGE", "FOLLOW_UP"], "implemented": true,
	},
	"exploit_opening": {
		"name": "乘隙", "short": "乘隙", "type": "passive", "track": "agility", "level": 70,
		"condition": "敵人攻擊落空後，2 秒內受到傷害提高 25%", "tags": ["DODGE", "VULNERABLE"], "implemented": true,
	},
	"shadowless": {
		"name": "無影", "short": "無影", "type": "passive", "track": "agility", "level": 190,
		"condition": "滿層游刃維持 3 秒後進入無影", "tags": ["DODGE", "FOLLOW_UP"], "implemented": true,
	},
	"shadowless_extreme": {
		"name": "奧義・無影極境", "short": "極境", "type": "ultimate", "track": "agility", "level": 200,
		"condition": "無影狀態下閃避時自動展開完整連攜", "tags": ["DODGE", "FOLLOW_UP", "ULTIMATE"], "implemented": true, "reactive": true,
	},
	"magic_sword_marks": {
		"name": "魔劍・魔紋", "short": "魔紋", "type": "passive", "track": "magic", "level": 10,
		"condition": "普攻附帶魔法傷害並累積魔紋；滿 5 枚後觸發魔力斬", "tags": ["MAGIC_SWORD", "MAGIC_MARK"], "implemented": true,
	},
	"magic_slash_spread": {
		"name": "魔力擴散", "short": "擴散", "type": "passive", "track": "magic", "level": 15,
		"condition": "魔力斬傷害提高並產生小範圍擴散", "tags": ["MAGIC_SWORD", "AREA"], "implemented": true,
	},
	"burning_enchant": {
		"name": "燃燒附魔", "short": "燃燒", "type": "passive", "track": "magic", "level": 20,
		"condition": "附魔攻擊疊加燃燒，最多 5 層並持續造成傷害", "tags": ["MAGIC_SWORD", "ELEMENTAL", "BURN"], "implemented": true,
	},
	"burning_inscription": {
		"name": "灼紋", "short": "灼紋", "type": "passive", "track": "magic", "level": 25,
		"condition": "連續攻擊燃燒敵人時額外獲得魔紋", "tags": ["MAGIC_MARK", "BURN"], "implemented": true,
	},
	"flame_burst_slash": {
		"name": "炎爆斬", "short": "炎爆", "type": "active", "track": "magic", "level": 30,
		"cooldown": 4.0, "resource": "magic_marks", "cost": 5.0, "mp_cost": 12.0,
		"condition": "魔紋與燃燒皆滿層", "tags": ["MAGIC_SWORD", "ELEMENTAL", "BURN", "BURST"], "implemented": true,
	},
	"flame_burst_refund": {
		"name": "餘燼回流", "short": "回流", "type": "passive", "track": "magic", "level": 35,
		"condition": "炎爆斬擊殺時返還 2 枚魔紋", "tags": ["MAGIC_MARK", "BURN"], "implemented": true,
	},
	"scorching_state": {
		"name": "熾燃", "short": "熾燃", "type": "passive", "track": "magic", "level": 40,
		"condition": "滿層燃燒使敵人受到的火焰傷害提高 25%", "tags": ["ELEMENTAL", "BURN"], "implemented": true,
	},
	"blazing_magic": {
		"name": "熾魔", "short": "熾魔", "type": "passive", "track": "magic", "level": 45,
		"condition": "滿魔紋時，魔劍附傷與魔力斬提高 20%", "tags": ["MAGIC_SWORD", "MAGIC_MARK"], "implemented": true,
	},
	"magic_sword_release": {
		"name": "魔劍解放", "short": "解放", "type": "active", "track": "magic", "level": 50,
		"cooldown": 18.0, "resource": "mp", "cost": 20.0,
		"condition": "MP ≥ 20 且不在解放狀態", "tags": ["MAGIC_SWORD", "ELEMENTAL", "BURST"], "implemented": true,
	},
	"elemental_boundary_slash": {
		"name": "元素斷界斬", "short": "斷界", "type": "active", "track": "magic", "level": 130,
		"cooldown": 6.0, "resource": "magic_marks", "cost": 3.0, "mp_cost": 18.0,
		"condition": "魔紋 ≥ 3 且 MP ≥ 18", "tags": ["MAGIC_SWORD", "ELEMENTAL", "BURST"], "implemented": true,
	},
	"magic_sword_complete_release": {
		"name": "奧義・魔劍完全解放", "short": "全解放", "type": "ultimate", "track": "magic", "level": 200,
		"cooldown": 30.0, "resource": "mp", "cost": 40.0,
		"condition": "MP ≥ 40 且未在完全解放", "tags": ["MAGIC_SWORD", "ELEMENTAL", "ULTIMATE"], "implemented": true,
	},
	"holy_sword_seals": {
		"name": "聖劍・聖印", "short": "聖印", "type": "passive", "track": "faith", "level": 10,
		"condition": "攻擊、承傷與擊殺累積聖印，最高 5 層", "tags": ["HOLY_SWORD", "HOLY_SEAL"], "implemented": true,
	},
	"grace": {
		"name": "恩典", "short": "恩典", "type": "passive", "track": "faith", "level": 20,
		"condition": "生命低於 70% 時自動消耗 1 聖印治療", "tags": ["HOLY_SEAL", "HEAL"], "implemented": true,
	},
	"holy_light_slash": {
		"name": "聖光斬", "short": "聖斬", "type": "active", "track": "faith", "level": 30,
		"cooldown": 4.0, "resource": "holy_seals", "cost": 2.0, "mp_cost": 8.0,
		"condition": "聖印 ≥ 2 且 MP ≥ 8", "tags": ["HOLY_SWORD", "HEAL", "SHIELD"], "implemented": true,
	},
	"holy_sword_release": {
		"name": "聖劍解放", "short": "聖放", "type": "active", "track": "faith", "level": 50,
		"cooldown": 18.0, "resource": "mp", "cost": 20.0,
		"condition": "MP ≥ 20 且未在聖劍解放", "tags": ["HOLY_SWORD", "BURST"], "implemented": true,
	},
	"judgment": {
		"name": "制裁", "short": "制裁", "type": "passive", "track": "faith", "level": 70,
		"condition": "對高血量、精英與 Boss 造成額外聖傷", "tags": ["HOLY_SWORD", "BOSS"], "implemented": true,
	},
	"guardian_oath": {
		"name": "守護誓約", "short": "守護", "type": "passive", "track": "faith", "level": 90,
		"condition": "承受大量傷害時自動消耗聖印展開護盾", "tags": ["HOLY_SEAL", "SHIELD"], "implemented": true,
	},
	"martyrdom": {
		"name": "殉身", "short": "殉身", "type": "passive", "track": "faith", "level": 120,
		"condition": "生命越低，聖印、治療與聖傷收益越高", "tags": ["HOLY_SEAL", "HEAL"], "implemented": true,
	},
	"judgment_slash": {
		"name": "審判斬", "short": "審判", "type": "active", "track": "faith", "level": 130,
		"cooldown": 6.0, "resource": "holy_seals", "cost": 3.0, "mp_cost": 16.0,
		"condition": "聖印 ≥ 3 且 MP ≥ 16", "tags": ["HOLY_SWORD", "JUDGMENT", "BURST"], "implemented": true,
	},
	"divine_grace": {
		"name": "神恩", "short": "神恩", "type": "passive", "track": "faith", "level": 180,
		"condition": "致命時消耗滿聖印回復生命並展開護盾", "tags": ["HOLY_SEAL", "HEAL", "SHIELD"], "implemented": true,
	},
	"holy_sword_descent": {
		"name": "奧義・聖劍降臨", "short": "降臨", "type": "ultimate", "track": "faith", "level": 200,
		"cooldown": 30.0, "resource": "mp", "cost": 40.0,
		"condition": "滿聖印且 MP ≥ 40", "tags": ["HOLY_SWORD", "ULTIMATE"], "implemented": true,
	},
	"military_momentum": {
		"name": "軍勢", "short": "軍勢", "type": "passive", "track": "command", "level": 10,
		"condition": "統御 Lv.10 時王國步兵入隊；雙方攻擊與擊殺累積軍勢", "tags": ["COMMAND", "MILITARY_MOMENTUM"], "implemented": true,
	},
	"coordinated_pursuit": {
		"name": "協同追擊", "short": "協擊", "type": "passive", "track": "command", "level": 20,
		"condition": "主角攻擊後由存活友軍追擊", "tags": ["COMMAND", "FOLLOW_UP"], "implemented": true,
	},
	"vanguard_slash": {
		"name": "先鋒斬", "short": "先鋒", "type": "active", "track": "command", "level": 30,
		"cooldown": 4.0, "resource": "military_momentum", "cost": 30.0,
		"condition": "軍勢 ≥ 30", "tags": ["COMMAND", "FOLLOW_UP"], "implemented": true,
	},
	"legion_command": {
		"name": "軍團號令", "short": "號令", "type": "active", "track": "command", "level": 50,
		"cooldown": 14.0, "resource": "military_momentum", "cost": 100.0,
		"condition": "軍勢已滿", "tags": ["COMMAND", "LEGION", "BURST"], "implemented": true,
	},
	"formation": {
		"name": "列陣", "short": "列陣", "type": "passive", "track": "command", "level": 70,
		"condition": "高軍勢時前排守護、後排增傷", "tags": ["COMMAND", "FORMATION"], "implemented": true,
	},
	"pursuit_order": {
		"name": "追擊令", "short": "追擊令", "type": "passive", "track": "command", "level": 90,
		"condition": "主角破甲或斬殺後觸發全軍追擊", "tags": ["COMMAND", "FOLLOW_UP"], "implemented": true,
	},
	"guard_detail": {
		"name": "護衛", "short": "護衛", "type": "passive", "track": "command", "level": 120,
		"condition": "友軍分攤主角承受的大量傷害", "tags": ["COMMAND", "GUARD"], "implemented": true,
	},
	"army_break_order": {
		"name": "破軍劍令", "short": "破軍令", "type": "active", "track": "command", "level": 130,
		"cooldown": 7.0, "resource": "military_momentum", "cost": 60.0,
		"condition": "軍勢 ≥ 60", "tags": ["COMMAND", "ARMOR_BREAK", "BURST"], "implemented": true,
	},
	"war_god": {
		"name": "軍神", "short": "軍神", "type": "passive", "track": "command", "level": 190,
		"condition": "高軍勢且友軍存活時進入雙向連攜", "tags": ["COMMAND", "FOLLOW_UP"], "implemented": true,
	},
	"ten_thousand_armies_one_sword": {
		"name": "奧義・萬軍一劍", "short": "萬軍", "type": "ultimate", "track": "command", "level": 200,
		"cooldown": 24.0, "resource": "military_momentum", "cost": 100.0,
		"condition": "軍勢已滿且全軍可行動", "tags": ["COMMAND", "LEGION", "ULTIMATE"], "implemented": true,
	},
}
const MARTIAL_BRANCHES := {
	"execution": {"name": "斬首", "description": "強化低血斬殺、斷首與擊殺後的蓄勢"},
	"army_break": {"name": "破軍", "description": "強化精英、Boss 傷害與裂甲效果"},
	"chain_slash": {"name": "連斬", "description": "擊殺後降低下一刀勢需求，連續收割"},
}
const PHYSIQUE_BRANCHES := {
	"iron_wall": {"name": "鐵壁", "description": "滿層不動時，下一次普通格擋提升為完美格擋"},
	"borrowed_force": {"name": "借力", "description": "提高格擋減免轉傷，專門反制 Boss 重擊"},
	"return_blade": {"name": "返刃", "description": "提高返刃頻率與連續反擊傷害"},
}
const AGILITY_BRANCHES := {
	"chase_wind": {"name": "追風", "description": "提高攻速、疾斬與多段追擊頻率"},
	"traceless": {"name": "無蹤", "description": "滿層游刃時，消耗全部游刃閃開一次原本會命中的普通攻擊"},
	"instant_kill": {"name": "瞬殺", "description": "閃避後的下一次普通攻擊必定造成強力暴擊"},
}
const FAITH_BRANCHES := {
	"radiance": {"name": "光耀", "description": "偏向聖傷、制裁與審判斬爆發"},
	"guardian": {"name": "守護", "description": "偏向護盾、減傷與神恩保命"},
	"grace": {"name": "恩典", "description": "偏向治療、聖印循環與長期作戰"},
}
const COMMAND_BRANCHES := {
	"vanguard": {"name": "先鋒", "description": "強化主角與近戰友軍的高頻追擊"},
	"formation": {"name": "陣軍", "description": "強化全體友軍的生存、陣形與增益"},
	"orders": {"name": "號令", "description": "降低軍勢消耗並提高軍團技能頻率"},
}
const MARTIAL_MILESTONES := {
	5: {"name": "鋒刃磨練", "description": "攻擊與破甲提高"}, 10: {"name": "勢", "description": "解鎖一刀流專屬資源「勢」"},
	15: {"name": "蓄勢精進", "description": "勢的累積速度提高"}, 20: {"name": "斬殺", "description": "低血敵人受到更多一刀傷害"},
	25: {"name": "回勢", "description": "擊殺返還額外勢"}, 30: {"name": "斷首", "description": "解鎖低血斬殺技能"},
	35: {"name": "斷首續勢", "description": "斷首擊殺後加快下一輪蓄勢"}, 40: {"name": "裂甲蓄勢", "description": "高勢斬擊獲得額外破甲"},
	45: {"name": "極勢", "description": "滿勢時提高一刀傷害與破甲"}, 50: {"name": "拔刀", "description": "解鎖一刀流爆發狀態"},
	55: {"name": "鋒刃突破", "description": "攻擊與暴擊傷害提高"}, 60: {"name": "破甲一閃", "description": "解鎖高護甲目標專用斬擊"},
	65: {"name": "裂甲追斬", "description": "對裂甲敵人的傷害提高"}, 70: {"name": "一念", "description": "越久未施放一刀，下一刀越強"},
	75: {"name": "一念深化", "description": "一念可累積更高倍率"}, 80: {"name": "極勢留存", "description": "擊殺後短暫保留極勢收益"},
	85: {"name": "斬破精進", "description": "破甲與斬殺效果提高"}, 90: {"name": "無拍子", "description": "擊殺後降低下一刀勢需求"},
	95: {"name": "無拍子深化", "description": "無拍子返還更多勢"}, 100: {"name": "一刀流極意", "description": "滿勢斬擊造成破防與失衡"},
	105: {"name": "極斬磨練", "description": "攻擊與一刀技能提高"}, 110: {"name": "極勢回流", "description": "滿勢斬擊返還少量勢"},
	115: {"name": "拔刀延長", "description": "拔刀狀態延長"}, 120: {"name": "斷嶽", "description": "解鎖精英與 Boss 專用重斬"},
	125: {"name": "破軍鋒", "description": "Boss 傷害與破甲提高"}, 130: {"name": "殘心", "description": "一刀未擊殺時返還勢"},
	135: {"name": "殘心深化", "description": "殘心返還量提高"}, 140: {"name": "超量蓄勢", "description": "極勢斬擊可保留一次餘勢"},
	145: {"name": "極斬突破", "description": "暴擊傷害與破甲提高"}, 150: {"name": "極斬專精", "description": "選擇斬首、破軍或連斬"},
	155: {"name": "專精增幅", "description": "專精效果提高"}, 160: {"name": "勢不盡", "description": "極勢斬擊有機率不完全消耗勢"},
	165: {"name": "主力斬強化", "description": "重斬與斷首提高"}, 170: {"name": "一念極勢", "description": "一念可與極勢完整疊加"},
	175: {"name": "武極突破", "description": "攻擊與暴擊傷害提高"}, 180: {"name": "斬敵極勢", "description": "擊殺後短暫直接進入極勢"},
	185: {"name": "斬首轉化", "description": "斬殺與 Boss 倍率提高"}, 190: {"name": "無心", "description": "滿勢且一念完成時，下一刀瞬發強化"},
	195: {"name": "無心深化", "description": "無心傷害與破甲提高"}, 200: {"name": "一刀兩斷", "description": "解鎖純武藝終極奧義"},
}
const PHYSIQUE_MILESTONES := {
	5: {"name": "鍛體", "description": "生命與防禦提高"}, 10: {"name": "守勢與不動", "description": "守勢提高格擋率，格擋開始累積不動"},
	15: {"name": "穩架", "description": "不動層數提高格擋效果"}, 20: {"name": "借力", "description": "格擋減免轉為反擊傷害"},
	25: {"name": "借力反制", "description": "格擋後反擊傷害提高"}, 30: {"name": "返刃", "description": "解鎖待發型格擋反擊"},
	35: {"name": "返刃守勢", "description": "返刃成功保留不動"}, 40: {"name": "不動境", "description": "滿層時提高格擋、反擊與韌性"},
	45: {"name": "不退", "description": "不動境提高抗擊退"}, 50: {"name": "崩勢反擊", "description": "消耗不動打出防禦爆發"},
	55: {"name": "鐵身突破", "description": "生命與防禦提高"}, 60: {"name": "完美借力", "description": "完美格擋額外儲存借力傷害"},
	65: {"name": "返刃強化", "description": "返刃傷害提高"}, 70: {"name": "卸力", "description": "格擋後降低敵人下一次攻擊"},
	75: {"name": "卸力深化", "description": "卸力效果提高"}, 80: {"name": "連擋反制", "description": "連續格擋提高反擊傷害"},
	85: {"name": "守勢精進", "description": "格擋率與韌性提高"}, 90: {"name": "震返", "description": "完美格擋重擊使敵人失衡"},
	95: {"name": "震返深化", "description": "失衡時間提高"}, 100: {"name": "返刃極意", "description": "完美格擋串聯不動、借力與返刃"},
	105: {"name": "反制磨練", "description": "防禦與反擊傷害提高"}, 110: {"name": "穩固不動", "description": "不動境下普通受擊較不易掉層"},
	115: {"name": "借力深化", "description": "借力轉換率提高"}, 120: {"name": "以牙還牙", "description": "重擊與暴擊會強化下一次反擊"},
	125: {"name": "巨力反制", "description": "Boss 格擋收益提高"}, 130: {"name": "寸勁", "description": "連續反擊逐次增傷"},
	135: {"name": "寸勁疊層", "description": "連續反擊增傷上限提高"}, 140: {"name": "崩返留勢", "description": "崩勢反擊後保留一層不動"},
	145: {"name": "守反突破", "description": "格擋與反擊提高"}, 150: {"name": "返刃專精", "description": "選擇鐵壁、借力或返刃"},
	155: {"name": "專精增幅", "description": "專精效果提高"}, 160: {"name": "不動不破", "description": "滿層時首次破防不會清空"},
	165: {"name": "返刃深化", "description": "返刃傷害與速度提高"}, 170: {"name": "完美回勢", "description": "完美格擋縮短崩勢反擊冷卻"},
	175: {"name": "鐵身極境", "description": "生命與防禦提高"}, 180: {"name": "拒死守勢", "description": "致命攻擊觸發特殊防守"},
	185: {"name": "借力極化", "description": "借力倍率提高"}, 190: {"name": "不動明王", "description": "滿層連擋後短暫必定返刃"},
	195: {"name": "明王深化", "description": "不動明王時間與反擊提高"}, 200: {"name": "不動返天", "description": "解鎖純體術終極奧義"},
}
const AGILITY_MILESTONES := {
	5: {"name": "行動效率", "description": "攻速、暴擊與閃避提高"}, 10: {"name": "疾斬", "description": "解鎖兩段高速斬擊"},
	15: {"name": "迅擊磨練", "description": "疾斬傷害小幅提高"}, 20: {"name": "游刃", "description": "順暢攻防累積游刃；滿層普攻追加追斬"},
	25: {"name": "節奏維持", "description": "擊殺與閃避更容易維持游刃"}, 30: {"name": "影襲", "description": "閃避後追加高速攻擊"},
	35: {"name": "影襲強化", "description": "影襲傷害提高"}, 40: {"name": "游刃有餘", "description": "滿層時提高攻速、暴擊與疾斬"},
	45: {"name": "快劍", "description": "提高疾斬頻率"}, 50: {"name": "瞬步", "description": "保證閃避下一次可閃攻擊"},
	55: {"name": "迅捷突破", "description": "攻速與暴擊提高"}, 60: {"name": "游刃影襲", "description": "影襲傷害隨游刃提高"},
	65: {"name": "身法精進", "description": "閃避率小幅提高"}, 70: {"name": "乘隙", "description": "敵人揮空後短暫承受更多傷害"},
	75: {"name": "乘隙深化", "description": "乘隙傷害提高"}, 80: {"name": "疾斬會心", "description": "疾斬可暴擊"},
	85: {"name": "節奏保全", "description": "普通受擊的掉層懲罰降低"}, 90: {"name": "飛燕", "description": "影襲有機率追加追擊"},
	95: {"name": "飛燕強化", "description": "飛燕追擊率提高"}, 100: {"name": "流轉", "description": "追擊可維持游刃循環"},
	105: {"name": "追影磨練", "description": "攻速與追擊傷害提高"}, 110: {"name": "游刃護持", "description": "高游刃時命中只掉部分層數"},
	115: {"name": "影襲加速", "description": "影襲速度與傷害提高"}, 120: {"name": "燕返", "description": "影襲後有機率繞側再次斬擊"},
	125: {"name": "追擊突破", "description": "暴擊與追擊提高"}, 130: {"name": "無聲", "description": "長時間無傷逐漸提高暴擊傷害"},
	135: {"name": "無聲深化", "description": "無傷增傷上限提高"}, 140: {"name": "疾斬流轉", "description": "滿游刃時每次普攻都可疾斬"},
	145: {"name": "閃影突破", "description": "閃避收益提高"}, 150: {"name": "閃影專精", "description": "選擇追風、無蹤或瞬殺"},
	155: {"name": "專精增幅", "description": "專精效果提高"}, 160: {"name": "滿盈護持", "description": "滿層時首次普通命中不掉層"},
	165: {"name": "疾影強化", "description": "疾斬與影襲提高"}, 170: {"name": "無間影襲", "description": "影襲有機率不受追擊間隔限制"},
	175: {"name": "迅捷極境", "description": "攻速與暴擊提高"}, 180: {"name": "雙重追影", "description": "閃避後獲得第二次追擊機會"},
	185: {"name": "無聲乘隙", "description": "無聲與乘隙提高"}, 190: {"name": "無影", "description": "滿游刃維持後進入高速殘像狀態"},
	195: {"name": "無影深化", "description": "無影攻速與追擊提高"}, 200: {"name": "無影極境", "description": "閃避後展開影襲、飛燕、燕返與疾斬連攜"},
}
const MAGIC_SECONDARIES := {
	"ice": {"name": "冰", "description": "累積冰霜、延緩敵人攻勢，與火形成蒸氣碎裂"},
	"lightning": {"name": "雷", "description": "附加雷擊與連鎖傷害，與火形成爆燃雷爆"},
}
const MAGIC_SPECIALIZATIONS := {
	"fire": {"name": "炎劍", "description": "燃燒、爆炸與炎爆斬傷害提高"},
	"ice": {"name": "霜劍", "description": "冰霜、凍結與碎裂控制提高"},
	"lightning": {"name": "雷劍", "description": "雷擊、連鎖與高頻共鳴提高"},
}
const MAGIC_MILESTONES := {
	55: {"name": "元素增幅", "description": "魔攻與元素傷害提高 5%"},
	60: {"name": "熾燃侵蝕", "description": "熾燃敵人受到的魔劍傷害提高"},
	65: {"name": "魔力效率", "description": "技能 MP 消耗降低 5%，技能傷害提高 5%"},
	70: {"name": "第二元素", "description": "可選擇冰或雷作為副元素"},
	75: {"name": "副元素強化", "description": "冰霜控制或雷擊傷害提高"},
	80: {"name": "雙元素附魔", "description": "魔力斬會追加副元素"},
	85: {"name": "異常增幅", "description": "元素異常累積效率提高"},
	90: {"name": "元素共鳴", "description": "魔力斬可觸發火冰或火雷共鳴"},
	95: {"name": "共鳴增幅", "description": "共鳴傷害與範圍提高"},
	100: {"name": "魔劍共鳴", "description": "共鳴返還魔紋並強化下一次魔力斬"},
	105: {"name": "魔力深化", "description": "魔攻與 MP 提高 5%"},
	110: {"name": "共鳴回流", "description": "共鳴額外返還 1 枚魔紋"},
	115: {"name": "解放延長", "description": "魔劍解放延長至 10 秒"},
	120: {"name": "共鳴鋒刃", "description": "共鳴後的下一次魔力斬獲得強化"},
	125: {"name": "元素精煉", "description": "技能與元素傷害提高 5%"},
	130: {"name": "元素斷界斬", "description": "解鎖依當前元素變化的高階主動斬擊"},
	135: {"name": "斷界塑形", "description": "斷界斬依火、冰、雷產生完整特殊效果"},
	140: {"name": "魔紋留存", "description": "強化技能只消耗部分魔紋"},
	145: {"name": "共鳴擴張", "description": "共鳴傷害提高 10%"},
	150: {"name": "元素專精", "description": "可切換炎劍、霜劍或雷劍專精"},
	155: {"name": "專精增幅", "description": "專精元素傷害提高 10%"},
	160: {"name": "小型共鳴", "description": "專精元素滿層時自動觸發小型共鳴"},
	165: {"name": "專精魔力斬", "description": "魔力斬追加專精元素效果"},
	170: {"name": "解放循環", "description": "解放期間大幅降低魔紋消耗"},
	175: {"name": "極效魔力", "description": "MP 效率提高 10%，魔攻提高 5%"},
	180: {"name": "雙元素融合", "description": "大型元素爆發後暫時獲得第二元素附魔"},
	185: {"name": "共鳴極化", "description": "共鳴倍率與範圍再次提升"},
	190: {"name": "魔劍顯現", "description": "滿魔紋且敵人帶有異常時進入高階狀態"},
	195: {"name": "顯現昇華", "description": "魔劍顯現與完全解放效果提高"},
	200: {"name": "魔劍完全解放", "description": "解鎖純魔法終極奧義"},
}
const FAITH_MILESTONES := {
	5: {"name": "信念初成", "description": "生命、MP 與聖傷提高"}, 10: {"name": "聖劍與聖印", "description": "攻擊附聖傷並開始累積聖印"},
	15: {"name": "神聖鋒刃", "description": "聖劍普攻附傷提高"}, 20: {"name": "恩典", "description": "低血時自動消耗聖印治療"},
	25: {"name": "護體聖光", "description": "治療時同時產生護盾"}, 30: {"name": "聖光斬", "description": "解鎖傷害、治療與護盾一體的主動技"},
	35: {"name": "聖斬回響", "description": "聖光斬命中後回復生命"}, 40: {"name": "祝福", "description": "滿聖印時提高聖傷、治療與護盾"},
	45: {"name": "祝福深化", "description": "祝福期間護盾與聖傷提高"}, 50: {"name": "聖劍解放", "description": "解鎖聖印循環加速的爆發狀態"},
	55: {"name": "聖體突破", "description": "生命與聖傷提高"}, 60: {"name": "護盾鋒刃", "description": "擁有護盾時聖劍傷害提高"},
	65: {"name": "神術效率", "description": "MP 效率與治療提高"}, 70: {"name": "制裁", "description": "對高血、精英與 Boss 增加聖傷"},
	75: {"name": "制裁深化", "description": "對高血目標的制裁提高"}, 80: {"name": "聖印餘光", "description": "消耗聖印後獲得額外護盾"},
	85: {"name": "神聖抵抗", "description": "抗性與護盾強度提高"}, 90: {"name": "守護誓約", "description": "承受重傷時自動消耗聖印展開護盾"},
	95: {"name": "誓約深化", "description": "守護誓約的護盾提高"}, 100: {"name": "聖劍極意", "description": "聖印同時連結輸出、治療與護盾"},
	105: {"name": "神聖磨練", "description": "聖傷與治療提高"}, 110: {"name": "重擊信念", "description": "承受重擊時額外獲得聖印"},
	115: {"name": "解放延長", "description": "聖劍解放時間延長"}, 120: {"name": "殉身", "description": "低血時提高聖印、治療與聖傷收益"},
	125: {"name": "絕境恩典", "description": "低血量時治療效率提高"}, 130: {"name": "審判斬", "description": "解鎖聖印高倍率裁決技"},
	135: {"name": "聖印審判", "description": "審判斬依消耗聖印強化"}, 140: {"name": "聖印留存", "description": "高階聖劍技降低聖印消耗"},
	145: {"name": "守裁突破", "description": "護盾與制裁提高"}, 150: {"name": "聖劍專精", "description": "選擇光耀、守護或恩典"},
	155: {"name": "專精增幅", "description": "專精效果提高"}, 160: {"name": "聖印留光", "description": "滿聖印治療後保留部分聖印"},
	165: {"name": "聖斬升華", "description": "聖光斬與審判斬提高"}, 170: {"name": "破盾聖爆", "description": "護盾破裂時造成聖光爆發"},
	175: {"name": "聖體極境", "description": "生命與聖傷提高"}, 180: {"name": "神恩", "description": "避免一次致命傷害並恢復生命與護盾"},
	185: {"name": "制裁恩典", "description": "制裁與治療效率提高"}, 190: {"name": "神聖顯現", "description": "滿聖印時聖傷提高，溢出治療轉護盾"},
	195: {"name": "顯現升華", "description": "神聖顯現的輸出與護盾提高"}, 200: {"name": "聖劍降臨", "description": "解鎖純信仰終極奧義"},
}
const COMMAND_MILESTONES := {
	5: {"name": "統帥初成", "description": "生命與友軍傷害提高"}, 10: {"name": "第一位友軍", "description": "王國步兵正式入隊，解鎖軍勢與友軍自動攻擊"},
	15: {"name": "前線鼓舞", "description": "主角攻擊獲得更多軍勢"}, 20: {"name": "協同追擊", "description": "主角命中後友軍可追擊"},
	25: {"name": "勝勢", "description": "擊殺後額外返還軍勢"}, 30: {"name": "先鋒斬", "description": "解鎖主角先斬、前排追擊的軍團劍技"},
	35: {"name": "先鋒突進", "description": "先鋒追擊傷害提高"}, 40: {"name": "高昂軍勢", "description": "高軍勢時友軍攻速提高"},
	45: {"name": "軍威", "description": "滿軍勢時主角與友軍攻擊提高"}, 50: {"name": "軍團號令", "description": "命令所有存活友軍同時進攻"},
	55: {"name": "軍備突破", "description": "友軍攻擊與生命提高"}, 60: {"name": "協擊熟練", "description": "主角技能觸發友軍追擊率提高"},
	65: {"name": "軍勢效率", "description": "軍勢獲取效率提高"}, 70: {"name": "列陣", "description": "高軍勢時前排防禦、後排增傷"},
	75: {"name": "戰陣深化", "description": "陣形提供的攻防收益提高"}, 80: {"name": "第二位友軍", "description": "王國斥候入隊，提供高頻追擊"},
	85: {"name": "結陣固守", "description": "友軍生存能力提高"}, 90: {"name": "追擊令", "description": "破甲與斬殺後獲得全軍追擊"},
	95: {"name": "追擊令深化", "description": "全軍追擊傷害與軍勢回收提高"}, 100: {"name": "軍團劍陣", "description": "主角、先鋒與遠程形成固定連攜"},
	105: {"name": "戰陣磨練", "description": "軍勢與友軍傷害提高"}, 110: {"name": "追擊回勢", "description": "軍團追擊後返還軍勢"},
	115: {"name": "號令熟練", "description": "軍團號令冷卻縮短"}, 120: {"name": "護衛", "description": "友軍分攤主角承受的大量傷害"},
	125: {"name": "全軍固守", "description": "友軍減傷與護衛效果提高"}, 130: {"name": "第三位友軍・破軍劍令", "description": "隨軍法師入隊，並解鎖依存活友軍數強化的軍團劍技"},
	135: {"name": "萬人鋒", "description": "破軍劍令依友軍數取得額外破甲"}, 140: {"name": "軍令節制", "description": "軍勢消耗降低"},
	145: {"name": "軍團突破", "description": "軍團技能與追擊傷害提高"}, 150: {"name": "統御專精", "description": "選擇先鋒、陣軍或號令"},
	155: {"name": "專精增幅", "description": "專精效果提高"}, 160: {"name": "號令留勢", "description": "滿軍勢時首次號令保留部分軍勢"},
	165: {"name": "協擊升華", "description": "協同追擊頻率與傷害提高"}, 170: {"name": "雙向連攜", "description": "友軍特殊攻擊有機會反向觸發主角追擊"},
	175: {"name": "全軍極境", "description": "友軍生命與傷害提高"}, 180: {"name": "奮戰", "description": "軍團號令後全軍暫時提高攻速與追擊"},
	185: {"name": "軍勢永續", "description": "追擊與軍勢效率提高"}, 190: {"name": "軍神", "description": "高軍勢與友軍存活時進入雙向高頻連攜"},
	195: {"name": "軍神深化", "description": "軍神期間連攜頻率與軍勢效率提高"}, 200: {"name": "第四位友軍・萬軍一劍", "description": "隨軍聖職入隊，解鎖純統御終極奧義"},
}

var stage := 1
var area_number := 1
var journey_route := "frontier"
var awaiting_journey_choice := false
var boss_reward_claimed := false
var retry_pending := false
var retry_stage := 0
var current_wave := 0
var wave_transition_remaining := 0.0
var last_failure_report := {}
var incoming_damage_by_source := {}
var last_incoming_source := ""
var slice_metrics := {
	"elapsed": 0.0, "stage_first_reached": {}, "stage_deaths": {}, "retry_wait": 0.0,
	"retry_training_spent": false, "retry_equipment_changed": false, "boss_reward": "", "next_area_pressed": false,
}
var route_training_progress := 0.0
var hero_hp := 100.0
var enemy_hp := 52.0
var enemy_max_hp := 52.0
var enemy_armor := 5.8
var enemy_is_boss := false
var boss_enraged := false
var boss_howl_triggered := false
var boss_empowered_attack := false
var enemy_archetype := "grunt"
var enemy_is_elite := false
var enemy_guard_stacks := 0
var enemy_engagement_time := 0.0
var enemy_attack_count := 0
var kills := 0
var gold := 0
var training_points := 5
var training := {"martial": 0, "physique": 0, "agility": 0, "magic": 0, "faith": 0, "command": 0}
var equipped_items := {"weapon": "", "armor": "", "accessory": ""}
var owned_equipment := {"black_iron_sword": 1, "black_iron_armor": 1}
var equipment_enhancements := {"black_iron_sword": 0, "magic_rune_sword": 0, "officer_sword": 0, "black_iron_armor": 0, "temple_armor": 0, "momentum_talisman": 0}
var equipment_collection := {"black_iron_sword": true, "black_iron_armor": true}
var shop_items: Array[String] = []
var shop_refresh_count := 0
var inheritance_unlocked := false
var battle_souls := 0
var inheritance_count := 0
var legacy_choice := ""
var legacy_track := ""
var legacy_item := ""
var temporary_style_modifiers := {"martial": 0, "physique": 0, "agility": 0, "magic": 0, "faith": 0, "command": 0}
var martial_branch := ""
var physique_branch := ""
var agility_branch := ""
var momentum := 0.0
var draw_stance_remaining := 0.0
var time_since_one_slash := 0.0
var reduced_next_slash_cost := false
var extreme_momentum_remaining := 0.0
var immovable := 0
var youren := 0
var flow_hits := 0
var swift_cut_hits := 0
var shadow_assault_ready := false
var hero_mp := 0.0
var magic_marks := 0
var burn_stacks := 0
var burning_hits := 0
var burn_tick_remaining := 1.0
var magic_release_remaining := 0.0
var secondary_element := ""
var magic_specialization := ""
var frost_stacks := 0
var lightning_stacks := 0
var secondary_hit_counter := 0
var resonance_slash_ready := false
var minor_resonance_cooldown := 0.0
var fusion_remaining := 0.0
var complete_release_remaining := 0.0
var _manifest_was_active := false
var faith_branch := ""
var holy_seals := 0
var holy_hit_counter := 0
var holy_shield := 0.0
var grace_cooldown := 0.0
var holy_release_remaining := 0.0
var holy_descent_remaining := 0.0
var divine_grace_cooldown := 0.0
var _divine_manifest_was_active := false
var command_branch := ""
var military_momentum := 0.0
var legion_fervor_remaining := 0.0
var war_god_remaining := 0.0
var _war_god_was_active := false
var ally_attack_remaining := ALLY_ATTACK_INTERVAL
var ally_attack_cursor := 0
var return_blade_ready := false
var guard_stance_remaining := 0.0
var swift_step_ready := false
var recent_prevented_damage := 0.0
var counter_chain := 0
var consecutive_blocks := 0
var enemy_weakened_remaining := 0.0
var immovable_king_remaining := 0.0
var immovable_break_guard := true
var opening_remaining := 0.0
var shadowless_remaining := 0.0
var shadowless_cooldown := 0.0
var full_youren_duration := 0.0
var full_youren_guard := true
var unharmed_duration := 0.0
var instant_kill_ready := false
var rng := RandomNumberGenerator.new()
var auto_skill_slots: Array[String] = ["heavy_strike", "", "", "", ""]
var auto_tactics := {}
var skill_cooldowns := {"heavy_strike": 1.2}
var auto_attack_remaining := AUTO_ATTACK_INTERVAL
var enemy_attack_remaining := 2.25
var _momentum_was_full := false
var _events: Array[Dictionary] = []

func _init() -> void:
	rng.seed = 1337
	_record_stage_reached()
	_generate_shop_items()

func step(delta: float) -> Array[Dictionary]:
	_events.clear()
	slice_metrics.elapsed = float(slice_metrics.elapsed) + delta
	if retry_pending:
		slice_metrics.retry_wait = float(slice_metrics.retry_wait) + delta
	if awaiting_journey_choice:
		return []
	_tick_cooldowns(delta)
	opening_remaining = maxf(0.0, opening_remaining - delta)
	draw_stance_remaining = maxf(0.0, draw_stance_remaining - delta)
	extreme_momentum_remaining = maxf(0.0, extreme_momentum_remaining - delta)
	enemy_weakened_remaining = maxf(0.0, enemy_weakened_remaining - delta)
	immovable_king_remaining = maxf(0.0, immovable_king_remaining - delta)
	guard_stance_remaining = maxf(0.0, guard_stance_remaining - delta)
	shadowless_remaining = maxf(0.0, shadowless_remaining - delta)
	shadowless_cooldown = maxf(0.0, shadowless_cooldown - delta)
	magic_release_remaining = maxf(0.0, magic_release_remaining - delta)
	complete_release_remaining = maxf(0.0, complete_release_remaining - delta)
	fusion_remaining = maxf(0.0, fusion_remaining - delta)
	minor_resonance_cooldown = maxf(0.0, minor_resonance_cooldown - delta)
	grace_cooldown = maxf(0.0, grace_cooldown - delta)
	holy_release_remaining = maxf(0.0, holy_release_remaining - delta)
	holy_descent_remaining = maxf(0.0, holy_descent_remaining - delta)
	divine_grace_cooldown = maxf(0.0, divine_grace_cooldown - delta)
	legion_fervor_remaining = maxf(0.0, legion_fervor_remaining - delta)
	war_god_remaining = maxf(0.0, war_god_remaining - delta)
	if _ally_count() > 0:
		ally_attack_remaining -= delta
	var manifest_active := _magic_manifest_active()
	if manifest_active and not _manifest_was_active:
		_events.append({"type": "magic_sword_manifestation", "name": "魔劍顯現"})
	_manifest_was_active = manifest_active
	var divine_manifest_active := _divine_manifest_active()
	if divine_manifest_active and not _divine_manifest_was_active:
		_events.append({"type": "divine_manifestation", "name": "神聖顯現"})
	_divine_manifest_was_active = divine_manifest_active
	var war_god_active := _war_god_active()
	if war_god_active and not _war_god_was_active:
		war_god_remaining = 6.0 if int(training.command) >= 195 else 4.0
		_events.append({"type": "war_god", "name": "軍神", "duration": war_god_remaining})
	_war_god_was_active = war_god_active
	if _hero_max_mp() > 0.0:
		hero_mp = minf(_hero_max_mp(), hero_mp + delta * _mp_regeneration())
	_try_grace_heal()
	_tick_burning(delta)
	time_since_one_slash += delta
	unharmed_duration += delta
	full_youren_duration = full_youren_duration + delta if youren >= MAX_YOUREN else 0.0
	if int(training.agility) >= 190 and full_youren_duration >= 3.0 and shadowless_remaining <= 0.0 and shadowless_cooldown <= 0.0:
		shadowless_remaining = 6.0
		shadowless_cooldown = 15.0
		_events.append({"type": "shadowless", "duration": shadowless_remaining})
	if wave_transition_remaining > 0.0:
		wave_transition_remaining = maxf(0.0, wave_transition_remaining - delta)
		if wave_transition_remaining <= 0.0:
			_spawn_enemy()
			_events.append({"type": "wave_started", "stage": stage, "wave": current_wave + 1, "wave_count": _stage_waves(stage).size(), "enemy": _enemy_display_name()})
		return _events.duplicate(true)
	enemy_engagement_time += delta
	var passive_gain := 5.0 * (2.0 if draw_stance_remaining > 0.0 else 1.0)
	if effective_style_level("martial") >= 10:
		_add_momentum(delta * passive_gain, "time")
	if int(training.physique) >= 190 and immovable >= MAX_IMMOVABLE and consecutive_blocks >= 3 and immovable_king_remaining <= 0.0:
		immovable_king_remaining = 6.0 if int(training.physique) >= 195 else 4.0
		_events.append({"type": "immovable_king", "duration": immovable_king_remaining})
	auto_attack_remaining -= delta
	enemy_attack_remaining -= delta
	if not _try_auto_skill() and auto_attack_remaining <= 0.0:
		auto_attack_remaining = _current_attack_interval()
		_basic_attack(false)
		_try_auto_skill()
	if enemy_attack_remaining <= 0.0:
		enemy_attack_remaining += _enemy_attack_interval()
		if not _try_first_strike():
			_enemy_attack()
	if ally_attack_remaining <= 0.0 and _ally_count() > 0 and enemy_hp > 0.0:
		ally_attack_remaining += _ally_attack_interval()
		_ally_auto_attack()
	return _events.duplicate(true)

func spend_training(track: String) -> Array[Dictionary]:
	_events.clear()
	if not training.has(track) or training_points <= 0:
		return []
	var definition: Dictionary = TRAINING_DEFS[track]
	if not bool(definition.implemented) or int(training[track]) >= MAX_TRAINING_LEVEL:
		return []
	var old_max_hp := _hero_max_hp()
	var old_max_mp := _hero_max_mp()
	var previous := int(training[track])
	training[track] = previous + 1
	training_points -= 1
	if retry_pending:
		slice_metrics.retry_training_spent = true
	hero_hp += _hero_max_hp() - old_max_hp
	hero_mp += _hero_max_mp() - old_max_mp
	_events.append({"type": "training_up", "track": track, "name": String(definition.name), "level": previous + 1})
	for unlock: Dictionary in _new_unlocks(track, previous, previous + 1):
		_events.append(unlock)
		var skill_id := String(unlock.skill_id)
		var skill_type := String(SKILL_DEFS[skill_id].type)
		if bool(SKILL_DEFS[skill_id].get("implemented", false)) and (skill_type == "active" or (skill_type == "ultimate" and not bool(SKILL_DEFS[skill_id].get("reactive", false)))):
			_auto_equip(skill_id, skill_id in ["two_cut", "magic_sword_complete_release"])
	for milestone: Dictionary in _new_track_milestones(track, previous, previous + 1):
		_events.append(milestone)
	if track == "command":
		for ally_id: String in ALLY_DEFS:
			var ally: Dictionary = ALLY_DEFS[ally_id]
			var unlock_level := int(ally.unlock_level)
			if previous < unlock_level and int(training.command) >= unlock_level:
				_events.append({"type": "ally_joined", "ally_id": ally_id, "name": String(ally.name), "level": unlock_level, "description": String(ally.role)})
	if track == "martial" and previous < 150 and int(training.martial) >= 150:
		_events.append({"type": "branch_unlocked", "name": "極斬專精", "description": "前往技能頁選擇斬首、破軍或連斬"})
	if track == "physique" and previous < 150 and int(training.physique) >= 150:
		_events.append({"type": "branch_unlocked", "name": "返刃專精", "description": "前往技能頁選擇鐵壁、借力或返刃"})
	if track == "agility" and previous < 150 and int(training.agility) >= 150:
		_events.append({"type": "branch_unlocked", "name": "閃影專精", "description": "前往技能頁選擇追風、無蹤或瞬殺"})
	if track == "magic" and previous < 70 and int(training.magic) >= 70:
		_events.append({"type": "branch_unlocked", "name": "第二元素", "description": "前往技能頁選擇冰或雷，可隨時切換"})
	if track == "magic" and previous < 150 and int(training.magic) >= 150:
		_events.append({"type": "branch_unlocked", "name": "元素專精", "description": "前往技能頁選擇炎劍、霜劍或雷劍"})
	if track == "faith" and previous < 150 and int(training.faith) >= 150:
		_events.append({"type": "branch_unlocked", "name": "聖劍專精", "description": "前往技能頁選擇光耀、守護或恩典"})
	if track == "command" and previous < 150 and int(training.command) >= 150:
		_events.append({"type": "branch_unlocked", "name": "統御專精", "description": "前往技能頁選擇先鋒、陣軍或號令"})
	return _events.duplicate(true)

func base_style_level(track: String) -> int:
	return int(training.get(track, 0))

func equipment_style_bonus(track: String) -> int:
	var total := 0
	for slot: String in equipped_items:
		var item_id := String(equipped_items[slot])
		if item_id.is_empty() or not EQUIPMENT_DEFS.has(item_id):
			continue
		var bonuses: Dictionary = EQUIPMENT_DEFS[item_id].get("style_bonuses", {})
		total += int(bonuses.get(track, 0))
		if String(EQUIPMENT_DEFS[item_id].get("primary_style", "")) == track:
			total += int(equipment_enhancements.get(item_id, 0))
	return total

func effective_style_level(track: String) -> int:
	return base_style_level(track) + equipment_style_bonus(track) + int(temporary_style_modifiers.get(track, 0))

func style_level_breakdown(track: String) -> Dictionary:
	return {
		"base": base_style_level(track),
		"equipment": equipment_style_bonus(track),
		"temporary": int(temporary_style_modifiers.get(track, 0)),
		"effective": effective_style_level(track),
	}

func equipment_modifier(modifier: String) -> float:
	var total := 0.0
	for slot: String in equipped_items:
		var item_id := String(equipped_items[slot])
		if item_id.is_empty() or not EQUIPMENT_DEFS.has(item_id):
			continue
		var modifiers: Dictionary = EQUIPMENT_DEFS[item_id].get("modifiers", {})
		total += float(modifiers.get(modifier, 0.0))
	return total

func equip_item(item_id: String) -> bool:
	if not EQUIPMENT_DEFS.has(item_id) or int(owned_equipment.get(item_id, 0)) <= 0:
		return false
	var definition: Dictionary = EQUIPMENT_DEFS[item_id]
	var slot := String(definition.slot)
	if not equipped_items.has(slot):
		return false
	var old_max_hp := _hero_max_hp()
	var old_max_mp := _hero_max_mp()
	equipped_items[slot] = item_id
	if retry_pending:
		slice_metrics.retry_equipment_changed = true
	hero_hp = minf(_hero_max_hp(), hero_hp + maxf(0.0, _hero_max_hp() - old_max_hp))
	hero_mp = minf(_hero_max_mp(), hero_mp + maxf(0.0, _hero_max_mp() - old_max_mp))
	return true

func equipment_enhancement(item_id: String) -> int:
	return int(equipment_enhancements.get(item_id, 0))

func equipment_enhancement_cost(item_id: String) -> int:
	if not EQUIPMENT_DEFS.has(item_id) or equipment_enhancement(item_id) >= 5:
		return -1
	var quality := String(EQUIPMENT_DEFS[item_id].get("quality", "common"))
	return int(EQUIPMENT_QUALITY_COSTS.get(quality, 60)) * (equipment_enhancement(item_id) + 1)

func enhance_equipment(item_id: String) -> bool:
	if int(owned_equipment.get(item_id, 0)) <= 0:
		return false
	var cost := equipment_enhancement_cost(item_id)
	if cost < 0 or gold < cost:
		return false
	var old_max_hp := _hero_max_hp()
	var old_max_mp := _hero_max_mp()
	gold -= cost
	equipment_enhancements[item_id] = equipment_enhancement(item_id) + 1
	if retry_pending:
		slice_metrics.retry_equipment_changed = true
	hero_hp = minf(_hero_max_hp(), hero_hp + maxf(0.0, _hero_max_hp() - old_max_hp))
	hero_mp = minf(_hero_max_mp(), hero_mp + maxf(0.0, _hero_max_mp() - old_max_mp))
	return true

func grant_equipment(item_id: String) -> bool:
	if not EQUIPMENT_DEFS.has(item_id):
		return false
	owned_equipment[item_id] = int(owned_equipment.get(item_id, 0)) + 1
	equipment_collection[item_id] = true
	return true

func shop_refresh_cost() -> int:
	return 30 if shop_refresh_count == 0 else (60 if shop_refresh_count == 1 else 120)

func buy_shop_item(index: int) -> Dictionary:
	if index < 0 or index >= shop_items.size():
		return {}
	var item_id := shop_items[index]
	var price := int(EQUIPMENT_QUALITY_COSTS.get(String(EQUIPMENT_DEFS[item_id].quality), 60))
	if gold < price:
		return {}
	gold -= price
	grant_equipment(item_id)
	shop_items.remove_at(index)
	return {"item_id": item_id, "name": String(EQUIPMENT_DEFS[item_id].name), "price": price}

func sell_equipment(item_id: String) -> int:
	if not EQUIPMENT_DEFS.has(item_id) or int(owned_equipment.get(item_id, 0)) <= 0:
		return 0
	var slot := String(EQUIPMENT_DEFS[item_id].slot)
	if String(equipped_items.get(slot, "")) == item_id:
		equipped_items[slot] = ""
	owned_equipment[item_id] = int(owned_equipment[item_id]) - 1
	var value := maxi(10, int(EQUIPMENT_QUALITY_COSTS.get(String(EQUIPMENT_DEFS[item_id].quality), 60)) / 2)
	gold += value
	return value

func refresh_shop() -> bool:
	var cost := shop_refresh_cost()
	if gold < cost:
		return false
	gold -= cost
	shop_refresh_count += 1
	_generate_shop_items()
	return true

func _generate_shop_items() -> void:
	shop_items.clear()
	var preferred_track := _highest_base_track()
	var preferred_candidates: Array[String] = []
	for item_id: String in EQUIPMENT_DEFS:
		var bonuses: Dictionary = EQUIPMENT_DEFS[item_id].get("style_bonuses", {})
		if int(bonuses.get(preferred_track, 0)) > 0:
			preferred_candidates.append(item_id)
	if not preferred_candidates.is_empty():
		shop_items.append(preferred_candidates[rng.randi_range(0, preferred_candidates.size() - 1)])
	var weighted: Array[String] = []
	for item_id: String in EQUIPMENT_DEFS:
		var definition: Dictionary = EQUIPMENT_DEFS[item_id]
		var weight := int({"common": 8, "uncommon": 5, "rare": 3, "epic": 1}.get(String(definition.quality), 4))
		if not legacy_track.is_empty() and int(definition.get("style_bonuses", {}).get(legacy_track, 0)) > 0:
			weight *= 2
		for copy in weight:
			weighted.append(item_id)
	while shop_items.size() < 3 and not weighted.is_empty():
		var item_id := weighted[rng.randi_range(0, weighted.size() - 1)]
		if not shop_items.has(item_id):
			shop_items.append(item_id)

func _highest_base_track() -> String:
	var result := "martial"
	for track: String in TRAINING_ORDER:
		if base_style_level(track) > base_style_level(result):
			result = track
	return result

func unequip_item(slot: String) -> bool:
	if not equipped_items.has(slot) or String(equipped_items[slot]).is_empty():
		return false
	equipped_items[slot] = ""
	hero_hp = minf(hero_hp, _hero_max_hp())
	hero_mp = minf(hero_mp, _hero_max_mp())
	return true

func select_martial_branch(branch_id: String) -> bool:
	if int(training.martial) < 150 or not MARTIAL_BRANCHES.has(branch_id):
		return false
	martial_branch = branch_id
	return true

func select_physique_branch(branch_id: String) -> bool:
	if int(training.physique) < 150 or not PHYSIQUE_BRANCHES.has(branch_id):
		return false
	physique_branch = branch_id
	return true

func select_agility_branch(branch_id: String) -> bool:
	if int(training.agility) < 150 or not AGILITY_BRANCHES.has(branch_id):
		return false
	agility_branch = branch_id
	return true

func select_secondary_element(element_id: String) -> bool:
	if int(training.magic) < 70 or not MAGIC_SECONDARIES.has(element_id):
		return false
	secondary_element = element_id
	frost_stacks = 0
	lightning_stacks = 0
	return true

func select_magic_specialization(specialization_id: String) -> bool:
	if int(training.magic) < 150 or not MAGIC_SPECIALIZATIONS.has(specialization_id):
		return false
	magic_specialization = specialization_id
	return true

func select_faith_branch(branch_id: String) -> bool:
	if int(training.faith) < 150 or not FAITH_BRANCHES.has(branch_id):
		return false
	faith_branch = branch_id
	return true

func select_command_branch(branch_id: String) -> bool:
	if int(training.command) < 150 or not COMMAND_BRANCHES.has(branch_id):
		return false
	command_branch = branch_id
	return true

func equip_auto_skill(skill_id: String, slot_index := -1) -> bool:
	if not skill_is_unlocked(skill_id):
		return false
	var definition: Dictionary = SKILL_DEFS[skill_id]
	var skill_type := String(definition.type)
	if not bool(definition.get("implemented", false)) or (skill_type != "active" and (skill_type != "ultimate" or bool(definition.get("reactive", false)))):
		return false
	if auto_skill_slots.has(skill_id):
		return false
	if slot_index < 0:
		slot_index = auto_skill_slots.find("")
	if slot_index < 0 or slot_index >= AUTO_SLOT_COUNT:
		return false
	auto_skill_slots[slot_index] = skill_id
	return true

func unequip_auto_skill(slot_index: int) -> bool:
	if slot_index < 0 or slot_index >= AUTO_SLOT_COUNT or auto_skill_slots[slot_index].is_empty():
		return false
	auto_skill_slots[slot_index] = ""
	return true

func move_auto_skill(slot_index: int, direction: int) -> bool:
	var target := slot_index + direction
	if slot_index < 0 or slot_index >= AUTO_SLOT_COUNT or target < 0 or target >= AUTO_SLOT_COUNT:
		return false
	var held := auto_skill_slots[slot_index]
	auto_skill_slots[slot_index] = auto_skill_slots[target]
	auto_skill_slots[target] = held
	return true

func set_auto_tactic(skill_id: String, tactic_id: String) -> bool:
	if not AUTO_TACTIC_DEFS.has(skill_id):
		return false
	for tactic: Dictionary in AUTO_TACTIC_DEFS[skill_id]:
		if String(tactic.id) == tactic_id:
			auto_tactics[skill_id] = tactic_id
			return true
	return false

func cycle_auto_tactic(skill_id: String) -> bool:
	if not AUTO_TACTIC_DEFS.has(skill_id):
		return false
	var tactics: Array = AUTO_TACTIC_DEFS[skill_id]
	var current := auto_tactic_id(skill_id)
	var current_index := 0
	for index in tactics.size():
		if String(tactics[index].id) == current:
			current_index = index
			break
	auto_tactics[skill_id] = String(tactics[(current_index + 1) % tactics.size()].id)
	return true

func auto_tactic_id(skill_id: String) -> String:
	if not AUTO_TACTIC_DEFS.has(skill_id):
		return ""
	var tactics: Array = AUTO_TACTIC_DEFS[skill_id]
	return String(auto_tactics.get(skill_id, tactics[0].id))

func auto_tactic_label(skill_id: String) -> String:
	if not AUTO_TACTIC_DEFS.has(skill_id):
		return "固定"
	var current := auto_tactic_id(skill_id)
	for tactic: Dictionary in AUTO_TACTIC_DEFS[skill_id]:
		if String(tactic.id) == current:
			return String(tactic.name)
	return "固定"

func auto_tactic_description(skill_id: String) -> String:
	if not AUTO_TACTIC_DEFS.has(skill_id):
		return "依技能原始條件判斷"
	var current := auto_tactic_id(skill_id)
	for tactic: Dictionary in AUTO_TACTIC_DEFS[skill_id]:
		if String(tactic.id) == current:
			return String(tactic.description)
	return "依技能原始條件判斷"

func skill_is_unlocked(skill_id: String) -> bool:
	if not SKILL_DEFS.has(skill_id):
		return false
	var definition: Dictionary = SKILL_DEFS[skill_id]
	if String(definition.track) == "common":
		return true
	return effective_style_level(String(definition.track)) >= int(definition.level)

func skill_is_equipment_supported(skill_id: String) -> bool:
	if not skill_is_unlocked(skill_id) or not SKILL_DEFS.has(skill_id):
		return false
	var definition: Dictionary = SKILL_DEFS[skill_id]
	var track := String(definition.track)
	if track == "common":
		return false
	var required_level := int(definition.level)
	return base_style_level(track) < required_level and effective_style_level(track) >= required_level

func save_data() -> Dictionary:
	return {
		"version": 1,
		"stage": stage, "area_number": area_number, "journey_route": journey_route,
		"awaiting_journey_choice": awaiting_journey_choice, "boss_reward_claimed": boss_reward_claimed,
		"retry_pending": retry_pending, "retry_stage": retry_stage, "current_wave": current_wave,
		"hero_hp": hero_hp, "hero_mp": hero_mp, "kills": kills, "gold": gold,
		"training_points": training_points, "training": training.duplicate(true),
		"equipped_items": equipped_items.duplicate(true), "owned_equipment": owned_equipment.duplicate(true),
		"equipment_enhancements": equipment_enhancements.duplicate(true), "equipment_collection": equipment_collection.duplicate(true),
		"shop_items": shop_items.duplicate(), "shop_refresh_count": shop_refresh_count,
		"inheritance_unlocked": inheritance_unlocked, "battle_souls": battle_souls, "inheritance_count": inheritance_count,
		"legacy_choice": legacy_choice, "legacy_track": legacy_track, "legacy_item": legacy_item,
		"martial_branch": martial_branch, "physique_branch": physique_branch, "agility_branch": agility_branch,
		"secondary_element": secondary_element, "magic_specialization": magic_specialization,
		"faith_branch": faith_branch, "command_branch": command_branch,
		"auto_skill_slots": auto_skill_slots.duplicate(), "auto_tactics": auto_tactics.duplicate(true),
		"last_failure_report": last_failure_report.duplicate(true), "slice_metrics": slice_metrics.duplicate(true),
	}

func load_save_data(data: Dictionary) -> bool:
	if int(data.get("version", 0)) != 1:
		return false
	stage = maxi(1, int(data.get("stage", 1)))
	area_number = maxi(1, int(data.get("area_number", 1)))
	var saved_route := String(data.get("journey_route", "frontier"))
	journey_route = saved_route if JOURNEY_ROUTES.has(saved_route) else "frontier"
	awaiting_journey_choice = bool(data.get("awaiting_journey_choice", false))
	boss_reward_claimed = bool(data.get("boss_reward_claimed", false))
	retry_pending = bool(data.get("retry_pending", false))
	retry_stage = maxi(0, int(data.get("retry_stage", 0)))
	kills = maxi(0, int(data.get("kills", 0)))
	gold = maxi(0, int(data.get("gold", 0)))
	training_points = maxi(0, int(data.get("training_points", 0)))
	_load_number_map(training, data.get("training", {}), TRAINING_ORDER, 0, MAX_TRAINING_LEVEL)
	_load_number_map(owned_equipment, data.get("owned_equipment", {}), EQUIPMENT_DEFS.keys(), 0, 999)
	_load_number_map(equipment_enhancements, data.get("equipment_enhancements", {}), EQUIPMENT_DEFS.keys(), 0, 5)
	var saved_equipped: Dictionary = data.get("equipped_items", {})
	for slot: String in EQUIPMENT_SLOT_NAMES:
		var item_id := String(saved_equipped.get(slot, ""))
		equipped_items[slot] = item_id if EQUIPMENT_DEFS.has(item_id) and int(owned_equipment.get(item_id, 0)) > 0 and String(EQUIPMENT_DEFS[item_id].slot) == slot else ""
	equipment_collection = {"black_iron_sword": true, "black_iron_armor": true}
	var saved_collection: Dictionary = data.get("equipment_collection", {})
	for item_id: String in EQUIPMENT_DEFS:
		if bool(saved_collection.get(item_id, false)) or int(owned_equipment.get(item_id, 0)) > 0:
			equipment_collection[item_id] = true
	shop_items.clear()
	for value: Variant in Array(data.get("shop_items", [])):
		var item_id := String(value)
		if EQUIPMENT_DEFS.has(item_id) and not shop_items.has(item_id):
			shop_items.append(item_id)
	shop_refresh_count = maxi(0, int(data.get("shop_refresh_count", 0)))
	inheritance_unlocked = bool(data.get("inheritance_unlocked", false))
	battle_souls = maxi(0, int(data.get("battle_souls", 0)))
	inheritance_count = maxi(0, int(data.get("inheritance_count", 0)))
	legacy_choice = String(data.get("legacy_choice", ""))
	legacy_track = String(data.get("legacy_track", "")) if String(data.get("legacy_track", "")) in TRAINING_ORDER else ""
	legacy_item = String(data.get("legacy_item", "")) if EQUIPMENT_DEFS.has(String(data.get("legacy_item", ""))) else ""
	martial_branch = _valid_choice(data, "martial_branch", MARTIAL_BRANCHES)
	physique_branch = _valid_choice(data, "physique_branch", PHYSIQUE_BRANCHES)
	agility_branch = _valid_choice(data, "agility_branch", AGILITY_BRANCHES)
	secondary_element = _valid_choice(data, "secondary_element", MAGIC_SECONDARIES)
	magic_specialization = _valid_choice(data, "magic_specialization", MAGIC_SPECIALIZATIONS)
	faith_branch = _valid_choice(data, "faith_branch", FAITH_BRANCHES)
	command_branch = _valid_choice(data, "command_branch", COMMAND_BRANCHES)
	auto_skill_slots = []
	for value: Variant in Array(data.get("auto_skill_slots", [])):
		var skill_id := String(value)
		auto_skill_slots.append(skill_id if skill_id.is_empty() or SKILL_DEFS.has(skill_id) else "")
	while auto_skill_slots.size() < AUTO_SLOT_COUNT:
		auto_skill_slots.append("")
	if auto_skill_slots.size() > AUTO_SLOT_COUNT:
		auto_skill_slots.resize(AUTO_SLOT_COUNT)
	if not auto_skill_slots.has("heavy_strike"):
		auto_skill_slots[0] = "heavy_strike"
	auto_tactics = Dictionary(data.get("auto_tactics", {})).duplicate(true)
	last_failure_report = Dictionary(data.get("last_failure_report", {})).duplicate(true)
	slice_metrics = Dictionary(data.get("slice_metrics", slice_metrics)).duplicate(true)
	current_wave = clampi(int(data.get("current_wave", 0)), 0, _stage_waves(stage).size() - 1)
	_spawn_enemy()
	hero_hp = clampf(float(data.get("hero_hp", _hero_max_hp())), 1.0, _hero_max_hp())
	hero_mp = clampf(float(data.get("hero_mp", _hero_max_mp())), 0.0, _hero_max_mp())
	return true

func _load_number_map(target: Dictionary, source_value: Variant, allowed_keys: Array, minimum: int, maximum: int) -> void:
	var source: Dictionary = source_value if source_value is Dictionary else {}
	for key: Variant in allowed_keys:
		var key_name := String(key)
		target[key_name] = clampi(int(source.get(key_name, target.get(key_name, minimum))), minimum, maximum)

func _valid_choice(data: Dictionary, key: String, choices: Dictionary) -> String:
	var value := String(data.get(key, ""))
	return value if choices.has(value) else ""

func snapshot() -> Dictionary:
	var route_definition := _journey_definition()
	var equipment_bonuses := {}
	var effective_levels := {}
	for track: String in TRAINING_ORDER:
		equipment_bonuses[track] = equipment_style_bonus(track)
		effective_levels[track] = effective_style_level(track)
	return {
		"stage": stage,
		"wave": current_wave + 1, "wave_count": _stage_waves(stage).size(), "wave_transition_remaining": wave_transition_remaining,
		"area_number": area_number, "journey_route": journey_route,
		"journey_name": String(route_definition.name), "journey_intro": String(route_definition.intro), "journey_effect": String(route_definition.effect),
		"awaiting_journey_choice": awaiting_journey_choice,
		"boss_reward_claimed": boss_reward_claimed,
		"retry_pending": retry_pending, "retry_stage": retry_stage,
		"last_failure_report": last_failure_report.duplicate(true), "slice_metrics": slice_metrics.duplicate(true),
		"hero_hp": hero_hp, "hero_max_hp": _hero_max_hp(), "hero_mp": hero_mp, "hero_max_mp": _hero_max_mp(),
		"attack": _attack_power(), "magic_power": _magic_power(), "defense": _defense(),
		"enemy_hp": enemy_hp, "enemy_max_hp": enemy_max_hp, "enemy_armor": enemy_armor,
		"enemy_is_boss": enemy_is_boss, "boss_enraged": boss_enraged, "enemy_is_elite": enemy_is_elite,
		"boss_howl_triggered": boss_howl_triggered, "boss_empowered_attack": boss_empowered_attack,
		"enemy_archetype": enemy_archetype, "enemy_name": _enemy_display_name(),
		"enemy_role": String(_enemy_definition().role), "enemy_hint": String(_enemy_definition().hint),
		"enemy_guard_stacks": enemy_guard_stacks,
		"route_position": _route_position(), "route_phase": _route_phase(),
		"enemy_attack_type": _next_enemy_attack_type(), "enemy_attack_remaining": enemy_attack_remaining,
		"kills": kills, "gold": gold, "training_points": training_points, "style_points": training_points,
		"training": training.duplicate(true), "base_style_levels": training.duplicate(true),
		"equipment_style_bonuses": equipment_bonuses, "temporary_style_modifiers": temporary_style_modifiers.duplicate(true),
		"effective_style_levels": effective_levels, "equipped_items": equipped_items.duplicate(true),
		"owned_equipment": owned_equipment.duplicate(true), "equipment_enhancements": equipment_enhancements.duplicate(true),
		"equipment_collection": equipment_collection.duplicate(true), "shop_items": shop_items.duplicate(), "shop_refresh_cost": shop_refresh_cost(),
		"shop_refresh_count": shop_refresh_count, "inheritance_unlocked": inheritance_unlocked, "battle_souls": battle_souls,
		"inheritance_count": inheritance_count, "legacy_choice": legacy_choice, "legacy_track": legacy_track, "legacy_item": legacy_item,
		"momentum": momentum, "max_momentum": MAX_MOMENTUM, "martial_branch": martial_branch, "draw_stance_remaining": draw_stance_remaining,
		"immovable": immovable, "max_immovable": MAX_IMMOVABLE, "physique_branch": physique_branch,
		"return_blade_ready": return_blade_ready, "guard_stance_remaining": guard_stance_remaining, "counter_chain": counter_chain,
		"youren": youren, "max_youren": MAX_YOUREN, "flow_hits": flow_hits, "flow_hits_required": FLOW_HITS_REQUIRED,
		"swift_cut_hits": swift_cut_hits, "swift_cut_hits_required": 1 if int(training.agility) >= 140 else 2, "agility_branch": agility_branch,
		"swift_step_ready": swift_step_ready, "shadow_assault_ready": shadow_assault_ready, "shadowless_remaining": shadowless_remaining,
		"magic_marks": magic_marks, "max_magic_marks": MAX_MAGIC_MARKS,
		"burn_stacks": burn_stacks, "max_burn": MAX_BURN, "frost_stacks": frost_stacks,
		"lightning_stacks": lightning_stacks, "secondary_element": secondary_element,
		"magic_specialization": magic_specialization, "magic_release_remaining": magic_release_remaining,
		"fusion_remaining": fusion_remaining, "complete_release_remaining": complete_release_remaining,
		"magic_manifest_active": _magic_manifest_active(),
		"holy_seals": holy_seals, "max_holy_seals": MAX_HOLY_SEALS, "holy_shield": holy_shield,
		"faith_branch": faith_branch, "holy_release_remaining": holy_release_remaining,
		"holy_descent_remaining": holy_descent_remaining, "divine_manifest_active": _divine_manifest_active(),
		"military_momentum": military_momentum, "max_military_momentum": MAX_MILITARY_MOMENTUM,
		"command_branch": command_branch, "ally_count": _ally_count(), "ally_roster": _unlocked_allies(),
		"ally_attack_remaining": ally_attack_remaining, "legion_fervor_remaining": legion_fervor_remaining,
		"war_god_active": _war_god_active(),
		"dodge_chance": _dodge_chance(), "critical_chance": _critical_chance(),
		"attack_speed_bonus": _agility_action_speed_bonus(), "move_speed_bonus": _agility_move_speed_bonus(),
		"auto_skill_slots": auto_skill_slots.duplicate(), "auto_tactics": auto_tactics.duplicate(true), "skill_cooldowns": skill_cooldowns.duplicate(true),
		"attack_interval": _current_attack_interval(), "auto_attack_remaining": auto_attack_remaining, "engagement_time": enemy_engagement_time,
	}

func training_hint(track: String) -> String:
	if not TRAINING_DEFS.has(track):
		return ""
	var definition: Dictionary = TRAINING_DEFS[track]
	if not bool(definition.implemented):
		return "%s · 後續開放" % String(definition.style)
	if track == "physique":
		return physique_hint()
	if track == "agility":
		return agility_hint()
	if track == "magic":
		return magic_hint()
	if track == "faith":
		return _next_milestone_hint(FAITH_MILESTONES, int(training.faith), "聖劍流已達純流派極致")
	if track == "command":
		return _next_milestone_hint(COMMAND_MILESTONES, int(training.command), "軍團劍技流已達純流派極致")
	var level := int(training[track])
	return _next_milestone_hint(MARTIAL_MILESTONES, level, "一刀流已達純流派極致")

func physique_hint() -> String:
	var level := int(training.physique)
	return _next_milestone_hint(PHYSIQUE_MILESTONES, level, "不動流已達純流派極致")

func agility_hint() -> String:
	var level := int(training.agility)
	return _next_milestone_hint(AGILITY_MILESTONES, level, "閃影流已達純流派極致")

func magic_hint() -> String:
	var level := int(training.magic)
	if level < 10: return "Lv.10 魔劍・魔紋"
	if level < 15: return "Lv.15 魔力擴散"
	if level < 20: return "Lv.20 燃燒附魔"
	if level < 25: return "Lv.25 灼紋"
	if level < 30: return "Lv.30 炎爆斬"
	if level < 35: return "Lv.35 餘燼回流"
	if level < 40: return "Lv.40 熾燃"
	if level < 45: return "Lv.45 熾魔"
	if level < 50: return "Lv.50 魔劍解放"
	for target: int in MAGIC_MILESTONES:
		if level < target:
			return "Lv.%d %s" % [target, String(MAGIC_MILESTONES[target].name)]
	return "魔劍流已達純流派極致"

func _next_milestone_hint(table: Dictionary, level: int, complete_text: String) -> String:
	for target: int in table:
		if level < target:
			return "Lv.%d %s" % [target, String(table[target].name)]
	return complete_text

func _try_auto_skill() -> bool:
	for skill_id: String in auto_skill_slots:
		if not skill_id.is_empty() and _can_cast(skill_id):
			_cast_skill(skill_id)
			return true
	return false

func _can_cast(skill_id: String) -> bool:
	if not skill_is_unlocked(skill_id):
		return false
	var definition: Dictionary = SKILL_DEFS[skill_id]
	var skill_type := String(definition.type)
	if not bool(definition.get("implemented", false)) or (skill_type != "active" and (skill_type != "ultimate" or bool(definition.get("reactive", false)))):
		return false
	if float(skill_cooldowns.get(skill_id, 0.0)) > 0.0:
		return false
	if String(definition.resource) == "momentum" and momentum < _momentum_cost(skill_id):
		return false
	if String(definition.resource) == "immovable" and immovable < int(definition.cost):
		return false
	if String(definition.resource) == "magic_marks" and magic_marks < _magic_mark_cost(skill_id):
		return false
	if String(definition.resource) == "holy_seals" and holy_seals < _holy_seal_cost(skill_id):
		return false
	if String(definition.resource) == "military_momentum" and military_momentum < _command_cost(skill_id):
		return false
	var mp_cost := _skill_mp_cost(skill_id)
	if hero_mp < mp_cost:
		return false
	if not _passes_auto_tactic(skill_id):
		return false
	if skill_id == "armor_flash":
		return enemy_armor >= HIGH_ARMOR_THRESHOLD
	if skill_id == "execute_slash":
		return enemy_hp / maxf(1.0, enemy_max_hp) <= (0.35 if auto_tactic_id(skill_id) == "hp35" else 0.25)
	if skill_id == "return_blade":
		return enemy_attack_remaining <= 0.7 and not return_blade_ready
	if skill_id == "guard_stance":
		return immovable < MAX_IMMOVABLE and guard_stance_remaining <= 0.0
	if skill_id == "swift_step":
		return not swift_step_ready
	if skill_id == "shadow_assault":
		return shadow_assault_ready
	if skill_id == "flame_burst_slash":
		return burn_stacks >= MAX_BURN
	if skill_id == "magic_sword_release":
		return magic_release_remaining <= 0.0 and complete_release_remaining <= 0.0
	if skill_id == "magic_sword_complete_release":
		return complete_release_remaining <= 0.0
	if skill_id == "holy_sword_release":
		return holy_release_remaining <= 0.0 and holy_descent_remaining <= 0.0
	if skill_id == "holy_sword_descent":
		return holy_seals >= MAX_HOLY_SEALS and holy_descent_remaining <= 0.0
	return true

func _passes_auto_tactic(skill_id: String) -> bool:
	var tactic := auto_tactic_id(skill_id)
	if skill_id == "return_blade" and tactic == "heavy":
		return _next_enemy_attack_type_id() in ["heavy", "sure_hit"]
	if skill_id == "swift_step":
		var next_attack := _next_enemy_attack_type_id()
		if tactic == "danger": return next_attack in ["heavy", "area"]
		if tactic == "heavy": return next_attack == "heavy"
	if skill_id == "holy_light_slash":
		var hp_ratio := hero_hp / maxf(1.0, _hero_max_hp())
		if tactic == "hp70": return hp_ratio < 0.7
		if tactic == "hp50": return hp_ratio < 0.5
	if skill_id == "legion_command":
		if tactic == "elite": return enemy_is_elite or enemy_is_boss
		if tactic == "boss": return enemy_is_boss
	return true

func _cast_skill(skill_id: String) -> void:
	var definition: Dictionary = SKILL_DEFS[skill_id]
	if skill_id == "heavy_strike":
		_cast_heavy_strike()
		return
	if skill_id == "return_blade":
		return_blade_ready = true
		skill_cooldowns[skill_id] = float(definition.cooldown)
		_events.append({"type": "return_blade", "skill_id": skill_id, "name": String(definition.name)})
		return
	if skill_id == "guard_stance":
		guard_stance_remaining = 4.0
		skill_cooldowns[skill_id] = float(definition.cooldown)
		_events.append({"type": "guard_stance", "skill_id": skill_id, "name": String(definition.name), "duration": guard_stance_remaining})
		return
	if skill_id == "draw_stance":
		draw_stance_remaining = 10.0 if int(training.martial) >= 115 else 8.0
		skill_cooldowns[skill_id] = float(definition.cooldown)
		_events.append({"type": "draw_stance", "skill_id": skill_id, "name": String(definition.name), "duration": draw_stance_remaining})
		return
	if skill_id == "swift_step":
		swift_step_ready = true
		_events.append({"type": "swift_step_ready", "skill_id": skill_id, "name": String(definition.name)})
		return
	if skill_id == "swift_cut":
		_cast_swift_cut()
		return
	if skill_id == "shadow_assault":
		_cast_shadow_assault()
		return
	if skill_id == "collapse_counter":
		_cast_collapse_counter()
		return
	if skill_id == "flame_burst_slash":
		_cast_flame_burst_slash()
		return
	if skill_id == "elemental_boundary_slash":
		_cast_elemental_boundary_slash()
		return
	if skill_id == "magic_sword_release":
		hero_mp = maxf(0.0, hero_mp - _skill_mp_cost(skill_id))
		magic_release_remaining = 10.0 if int(training.magic) >= 115 else 8.0
		skill_cooldowns[skill_id] = float(definition.cooldown)
		_events.append({"type": "magic_sword_release", "skill_id": skill_id, "name": String(definition.name), "duration": magic_release_remaining})
		return
	if skill_id == "magic_sword_complete_release":
		hero_mp = maxf(0.0, hero_mp - _skill_mp_cost(skill_id))
		complete_release_remaining = 12.0
		magic_release_remaining = maxf(magic_release_remaining, complete_release_remaining)
		fusion_remaining = maxf(fusion_remaining, complete_release_remaining)
		skill_cooldowns[skill_id] = float(definition.cooldown)
		_events.append({"type": "magic_sword_complete_release", "skill_id": skill_id, "name": String(definition.name), "duration": complete_release_remaining})
		return
	if skill_id in ["holy_light_slash", "judgment_slash", "holy_sword_release", "holy_sword_descent"]:
		_cast_faith_skill(skill_id)
		return
	if skill_id in ["vanguard_slash", "legion_command", "army_break_order", "ten_thousand_armies_one_sword"]:
		_cast_command_skill(skill_id)
		return
	var momentum_before := momentum
	var actual_cost := _momentum_cost(skill_id)
	momentum = maxf(0.0, momentum - actual_cost)
	_momentum_was_full = false
	skill_cooldowns[skill_id] = float(definition.cooldown)
	var mastery := _one_slash_mastery_multiplier(momentum_before)
	var raw_damage := _attack_power() * float(definition.damage_multiplier) * mastery * _skill_level_multiplier(skill_id) * _martial_slash_multiplier(skill_id, momentum_before)
	reduced_next_slash_cost = false
	var armor_ignore := float(definition.get("armor_ignore", 0.0))
	if int(training.martial) >= 40 and momentum_before >= 80.0: armor_ignore += 0.12
	if int(training.martial) >= 100 and momentum_before >= MAX_MOMENTUM: armor_ignore += 0.12
	_events.append({"type": skill_id, "skill_id": skill_id, "name": String(definition.name), "damage": raw_damage, "mastery": mastery})
	var defeated := _deal_damage(raw_damage, skill_id, armor_ignore)
	time_since_one_slash = 0.0
	if int(training.martial) >= 110 and momentum_before >= MAX_MOMENTUM:
		_add_momentum(10.0 if int(training.martial) < 140 else 20.0, "extreme_refund")
	if defeated and int(training.martial) >= 90:
		reduced_next_slash_cost = true
		if int(training.martial) >= 180: extreme_momentum_remaining = 4.0
	if skill_id == "armor_flash" and not defeated:
		var armor_broken := minf(enemy_armor, float(definition.armor_break))
		enemy_armor = maxf(0.0, enemy_armor - armor_broken)
		_events.append({"type": "armor_broken", "amount": armor_broken, "remaining": enemy_armor})
	if not defeated and skill_id != "two_cut" and skill_is_unlocked("remaining_heart"):
		var refund := 30.0 if int(training.martial) >= 135 else float(SKILL_DEFS.remaining_heart.momentum_refund)
		_add_momentum(refund, "remaining_heart")
		_events.append({"type": "remaining_heart", "amount": refund})

func _cast_heavy_strike() -> void:
	var definition: Dictionary = SKILL_DEFS.heavy_strike
	var raw_damage := _attack_power() * float(definition.damage_multiplier)
	skill_cooldowns["heavy_strike"] = float(definition.cooldown)
	_events.append({"type": "heavy_strike", "skill_id": "heavy_strike", "name": "重擊", "damage": raw_damage, "modifiers": [], "momentum_ratio": 0.0, "armor_ignore": 0.0})
	_deal_damage(raw_damage, "heavy_strike_base")

func _heavy_strike_cooldown() -> float:
	return float(SKILL_DEFS.heavy_strike.cooldown)

func _heavy_strike_cast_name(momentum_ratio: float) -> String:
	return "重擊"

func heavy_strike_modifiers() -> Array[String]:
	return []

func skill_display_name(skill_id: String, short := false) -> String:
	return String(SKILL_DEFS[skill_id].short if short else SKILL_DEFS[skill_id].name)

func base_skill_description(skill_id: String) -> String:
	if skill_id != "heavy_strike":
		return ""
	return "180% ATK｜冷卻 4.5 秒｜所有小兵 Lv.1 取得\n共通基礎劍技，不受流派改造"

func _cast_swift_cut() -> void:
	var definition: Dictionary = SKILL_DEFS.swift_cut
	var total_damage := 0.0
	var critical_hits := 0
	for hit in 2:
		var hit_damage := _attack_power() * float(definition.damage_multiplier) * _skill_level_multiplier("swift_cut")
		if rng.randf() < _critical_chance():
			hit_damage *= 1.75
			critical_hits += 1
		total_damage += hit_damage
	skill_cooldowns["swift_cut"] = float(definition.cooldown)
	_events.append({"type": "swift_cut", "skill_id": "swift_cut", "name": "疾斬", "damage": total_damage, "hits": 2, "critical_hits": critical_hits})
	var defeated := _deal_damage(total_damage, "swift_cut", 0.05)
	if not defeated and skill_is_unlocked("flowing_ease"):
		_add_youren(1, "swift_cut")

func _cast_shadow_assault() -> void:
	var definition: Dictionary = SKILL_DEFS.shadow_assault
	shadow_assault_ready = false
	skill_cooldowns["shadow_assault"] = float(definition.cooldown)
	var shadow_damage := _attack_power() * 1.15 * (1.1 if youren >= 4 else 1.0) * _skill_level_multiplier("shadow_assault")
	if int(training.agility) >= 35: shadow_damage *= 1.2
	if int(training.agility) >= 60: shadow_damage *= 1.0 + float(youren) * 0.05
	if int(training.agility) >= 115: shadow_damage *= 1.15
	if int(training.agility) >= 165: shadow_damage *= 1.15
	if shadowless_remaining > 0.0:
		shadow_damage *= 2.0 if int(training.agility) >= 195 else 1.8
	_events.append({"type": "shadow_assault", "skill_id": "shadow_assault", "name": "影襲", "damage": shadow_damage})
	if _deal_damage(shadow_damage, "shadow_assault", 0.15):
		return
	var flying_chance := 0.5 if int(training.agility) >= 95 else 0.3
	if int(training.agility) >= 90 and rng.randf() < flying_chance:
		var extra_damage := shadow_damage * 0.75
		_events.append({"type": "flying_swallow", "damage": extra_damage})
		if not _deal_damage(extra_damage, "flying_swallow", 0.15) and int(training.agility) >= 120 and rng.randf() < 0.45:
			var return_damage := shadow_damage * 0.62
			_events.append({"type": "swallow_return", "damage": return_damage})
			_deal_damage(return_damage, "swallow_return", 0.18)
	if int(training.agility) >= 180:
		var second_damage := shadow_damage * 0.5
		_events.append({"type": "second_shadow", "damage": second_damage})
		_deal_damage(second_damage, "second_shadow", 0.15)
	if int(training.agility) >= 200 and shadowless_remaining > 0.0:
		var extreme_damage := shadow_damage * 0.8
		_events.append({"type": "shadowless_extreme", "damage": extreme_damage})
		_deal_damage(extreme_damage, "shadowless_extreme", 0.25)

func _cast_collapse_counter() -> void:
	var definition: Dictionary = SKILL_DEFS.collapse_counter
	var spent := immovable
	immovable = 1 if int(training.physique) >= 140 else 0
	skill_cooldowns["collapse_counter"] = float(definition.cooldown)
	var raw_damage := _attack_power() * 2.2 + _defense() * 4.2 + recent_prevented_damage * 0.8
	raw_damage *= 1.0 + float(spent) * 0.35
	raw_damage *= _skill_level_multiplier("collapse_counter")
	_events.append({"type": "collapse_counter", "name": "不動崩返", "damage": raw_damage, "spent": spent})
	_deal_damage(raw_damage, "collapse_counter", 0.3)
	recent_prevented_damage = 0.0
	_events.append({"type": "immovable_changed", "value": immovable})

func _cast_flame_burst_slash() -> void:
	var definition: Dictionary = SKILL_DEFS.flame_burst_slash
	var fire_multiplier := _fire_damage_multiplier()
	magic_marks = maxi(0, magic_marks - _magic_mark_cost("flame_burst_slash"))
	burn_stacks = 0
	burning_hits = 0
	hero_mp = maxf(0.0, hero_mp - _skill_mp_cost("flame_burst_slash"))
	skill_cooldowns["flame_burst_slash"] = float(definition.cooldown)
	var raw_damage := _magic_power() * 4.2 * fire_multiplier * _skill_level_multiplier("flame_burst_slash")
	if magic_release_remaining > 0.0:
		raw_damage *= 1.4
	if magic_specialization == "fire" and int(training.magic) >= 155:
		raw_damage *= 1.1
	if complete_release_remaining > 0.0:
		raw_damage *= 1.45
	_events.append({"type": "flame_burst_slash", "name": "炎爆斬", "damage": raw_damage})
	_events.append({"type": "magic_marks_changed", "value": magic_marks})
	_events.append({"type": "burn_changed", "value": burn_stacks})
	var defeated := _deal_damage(raw_damage, "flame_burst_slash", 0.2)
	if defeated and skill_is_unlocked("flame_burst_refund"):
		_add_magic_marks(2, "flame_burst_refund")
		_events.append({"type": "flame_burst_refund", "amount": 2})
	_trigger_elemental_fusion()

func _cast_elemental_boundary_slash() -> void:
	var definition: Dictionary = SKILL_DEFS.elemental_boundary_slash
	var element := _current_magic_element()
	magic_marks = maxi(0, magic_marks - _magic_mark_cost("elemental_boundary_slash"))
	hero_mp = maxf(0.0, hero_mp - _skill_mp_cost("elemental_boundary_slash"))
	skill_cooldowns["elemental_boundary_slash"] = float(definition.cooldown)
	var raw_damage := _magic_power() * 4.8 * _advanced_magic_damage_multiplier() * _skill_level_multiplier("elemental_boundary_slash")
	var lightning_chain_count := 0
	if int(training.magic) >= 135:
		raw_damage *= 1.2
	match element:
		"fire":
			raw_damage *= _fire_damage_multiplier()
			burn_stacks = 0
			_events.append({"type": "burn_changed", "value": burn_stacks})
		"ice":
			raw_damage *= 1.1
			enemy_attack_remaining += 1.4
			frost_stacks = 0
			_events.append({"type": "secondary_changed", "element": "ice", "value": frost_stacks})
		"lightning":
			raw_damage *= 0.82
			lightning_chain_count = 2
			lightning_stacks = 0
			_events.append({"type": "secondary_changed", "element": "lightning", "value": lightning_stacks})
	_events.append({"type": "elemental_boundary_slash", "name": "元素斷界斬", "element": element, "damage": raw_damage})
	_events.append({"type": "magic_marks_changed", "value": magic_marks})
	var defeated := _deal_damage(raw_damage, "elemental_boundary_slash", 0.3)
	if not defeated:
		for index in lightning_chain_count:
			_events.append({"type": "lightning_chain", "damage": raw_damage * 0.38})
			if _deal_damage(raw_damage * 0.38, "lightning_chain", 0.2):
				break
	_trigger_elemental_fusion()

func _cast_faith_skill(skill_id: String) -> void:
	var definition: Dictionary = SKILL_DEFS[skill_id]
	skill_cooldowns[skill_id] = float(definition.cooldown)
	hero_mp = maxf(0.0, hero_mp - _skill_mp_cost(skill_id))
	if skill_id == "holy_sword_release":
		holy_release_remaining = 10.0 if int(training.faith) >= 115 else 8.0
		_events.append({"type": "holy_sword_release", "name": String(definition.name), "duration": holy_release_remaining})
		return
	if skill_id == "holy_sword_descent":
		holy_seals = 0
		holy_descent_remaining = 12.0
		holy_release_remaining = maxf(holy_release_remaining, holy_descent_remaining)
		_events.append({"type": "holy_sword_descent", "name": String(definition.name), "duration": holy_descent_remaining})
		_events.append({"type": "holy_seals_changed", "value": holy_seals})
		return
	var spent := _holy_seal_cost(skill_id)
	holy_seals = maxi(0, holy_seals - spent)
	var multiplier := 3.2 if skill_id == "holy_light_slash" else 5.6
	var raw_damage := (_attack_power() * 0.7 + _faith_power()) * multiplier * _skill_level_multiplier(skill_id) * _holy_damage_multiplier()
	if skill_id == "judgment_slash" and (enemy_is_boss or hero_hp / maxf(1.0, _hero_max_hp()) <= 0.4):
		raw_damage *= 1.45
	var heal := _faith_power() * (0.55 if skill_id == "holy_light_slash" else 0.35) * _healing_multiplier()
	_heal_hero(heal, skill_id)
	_add_holy_shield(heal * (0.8 if skill_id == "holy_light_slash" else 0.45), skill_id)
	_events.append({"type": skill_id, "name": String(definition.name), "damage": raw_damage, "spent": spent})
	_events.append({"type": "holy_seals_changed", "value": holy_seals})
	_deal_damage(raw_damage, skill_id, 0.2 if skill_id == "judgment_slash" else 0.08)

func _cast_command_skill(skill_id: String) -> void:
	var definition: Dictionary = SKILL_DEFS[skill_id]
	var spent := _command_cost(skill_id)
	military_momentum = maxf(0.0, military_momentum - spent)
	skill_cooldowns[skill_id] = float(definition.cooldown)
	var allies := _ally_count()
	var multiplier := 2.2
	if skill_id == "legion_command": multiplier = 1.5 + float(allies) * 0.95
	elif skill_id == "army_break_order": multiplier = 3.4 + float(allies) * 0.6
	elif skill_id == "ten_thousand_armies_one_sword": multiplier = 5.0 + float(allies) * 1.35
	var raw_damage := _attack_power() * multiplier * _skill_level_multiplier(skill_id) * _command_damage_multiplier()
	var armor_ignore := 0.35 if skill_id == "army_break_order" else (0.45 if skill_id == "ten_thousand_armies_one_sword" else 0.1)
	if skill_id == "legion_command" and int(training.command) >= 180:
		legion_fervor_remaining = 7.0
		_events.append({"type": "legion_fervor", "duration": legion_fervor_remaining})
	_events.append({"type": skill_id, "name": String(definition.name), "damage": raw_damage, "allies": allies})
	_events.append({"type": "military_momentum_changed", "value": military_momentum})
	_deal_damage(raw_damage, skill_id, armor_ignore)
	if skill_id == "army_break_order" and enemy_hp > 0.0:
		var armor_broken := minf(enemy_armor, 6.0 + float(allies) * 2.0)
		enemy_armor -= armor_broken
		_events.append({"type": "armor_broken", "amount": armor_broken, "remaining": enemy_armor})
	if int(training.command) >= 160 and spent >= 100.0:
		_add_military_momentum(25.0, "command_retention")

func _holy_sword_hit(manual: bool) -> void:
	if not skill_is_unlocked("holy_sword_seals"):
		return
	var damage := _faith_power() * 0.38 * _skill_level_multiplier("holy_sword_seals") * _holy_damage_multiplier()
	if holy_release_remaining > 0.0: damage *= 1.4
	if holy_descent_remaining > 0.0: damage *= 1.45
	_events.append({"type": "holy_enchant", "damage": damage, "manual": manual})
	_deal_damage(damage, "holy_enchant", 0.08)
	holy_hit_counter += 1
	var required := 2 if holy_release_remaining > 0.0 else 3
	if holy_hit_counter >= required:
		holy_hit_counter = 0
		_add_holy_seals(2 if holy_descent_remaining > 0.0 else 1, "holy_attack")

func _try_command_follow_up(source: String) -> void:
	if not skill_is_unlocked("coordinated_pursuit") or _ally_count() <= 0:
		return
	var chance := 0.35 + float(training.command) * 0.0015
	if int(training.command) >= 60: chance += 0.12
	if command_branch == "vanguard": chance += 0.15
	if legion_fervor_remaining > 0.0 or _war_god_active(): chance += 0.2
	if rng.randf() > minf(0.95, chance):
		return
	var damage := _attack_power() * (0.42 + float(_ally_count()) * 0.14) * _track_level_multiplier("command", 20) * _command_damage_multiplier()
	_events.append({"type": "coordinated_pursuit", "damage": damage, "allies": _ally_count(), "source": source})
	_deal_damage(damage, "coordinated_pursuit", 0.05)
	_add_military_momentum(5.0 if int(training.command) >= 110 else 3.0, "ally_attack")
	if int(training.command) >= 170 and rng.randf() < (0.5 if _war_god_active() else 0.3) and enemy_hp > 0.0:
		var hero_follow := _attack_power() * 0.65 * _track_level_multiplier("command", 170)
		_events.append({"type": "reverse_pursuit", "damage": hero_follow})
		_deal_damage(hero_follow, "reverse_pursuit", 0.12)

func _ally_auto_attack() -> void:
	var roster := _unlocked_allies()
	if roster.is_empty():
		return
	var ally_id := String(roster[ally_attack_cursor % roster.size()])
	ally_attack_cursor += 1
	var ally: Dictionary = ALLY_DEFS[ally_id]
	var multiplier: float = float({"infantry": 0.58, "scout": 0.46, "mage": 0.72, "cleric": 0.38}.get(ally_id, 0.5))
	var damage := _attack_power() * multiplier * _track_level_multiplier("command", int(ally.unlock_level)) * _command_damage_multiplier()
	var armor_ignore := 0.2 if ally_id == "mage" else 0.05
	_events.append({"type": "ally_attack", "ally_id": ally_id, "name": String(ally.name), "damage": damage})
	_deal_damage(damage, "ally_%s" % ally_id, armor_ignore)
	_add_military_momentum(6.0, "ally_attack")
	if ally_id == "cleric":
		_heal_hero(_attack_power() * 0.3, "ally_cleric")
	if int(training.command) >= 170 and rng.randf() < (0.5 if _war_god_active() else 0.28) and enemy_hp > 0.0:
		var hero_follow := _attack_power() * 0.65 * _track_level_multiplier("command", 170)
		_events.append({"type": "reverse_pursuit", "damage": hero_follow, "ally_id": ally_id})
		_deal_damage(hero_follow, "reverse_pursuit", 0.12)

func _ally_attack_interval() -> float:
	var speed := 1.0
	if military_momentum >= 70.0: speed += 0.18
	if legion_fervor_remaining > 0.0: speed += 0.3
	if _war_god_active(): speed += 0.25
	return ALLY_ATTACK_INTERVAL / speed

func _try_grace_heal() -> void:
	if not skill_is_unlocked("grace") or holy_seals <= 0 or grace_cooldown > 0.0:
		return
	var threshold: float = float({"hp70": 0.7, "hp50": 0.5, "hp30": 0.3}.get(auto_tactic_id("grace_heal"), 0.7))
	if hero_hp / maxf(1.0, _hero_max_hp()) >= threshold:
		return
	var cost := 0 if int(training.faith) >= 160 and holy_seals >= MAX_HOLY_SEALS else 1
	holy_seals = maxi(0, holy_seals - cost)
	grace_cooldown = 4.0
	var heal := _faith_power() * 1.2 * _healing_multiplier()
	_heal_hero(heal, "grace")
	if int(training.faith) >= 25:
		_add_holy_shield(heal * 0.65, "grace")
	_events.append({"type": "grace", "heal": heal, "cost": cost})
	_events.append({"type": "holy_seals_changed", "value": holy_seals})

func _heal_hero(amount: float, source: String) -> void:
	var before := hero_hp
	hero_hp = minf(_hero_max_hp(), hero_hp + amount)
	var actual := hero_hp - before
	var overflow := maxf(0.0, amount - actual)
	if _divine_manifest_active() and overflow > 0.0:
		_add_holy_shield(overflow, "overflow")
	_events.append({"type": "heal", "amount": actual, "source": source})

func _add_holy_shield(amount: float, source: String) -> void:
	var multiplier := 1.2 if faith_branch == "guardian" else 1.0
	if int(training.faith) >= 145: multiplier *= 1.15
	holy_shield = minf(_hero_max_hp() * 0.8, holy_shield + amount * multiplier)
	_events.append({"type": "holy_shield_changed", "value": holy_shield, "source": source})

func _absorb_holy_shield(damage: float) -> float:
	if holy_shield <= 0.0 or damage <= 0.0:
		return damage
	var absorbed := minf(holy_shield, damage)
	holy_shield -= absorbed
	_events.append({"type": "holy_shield_absorb", "amount": absorbed, "remaining": holy_shield})
	if holy_shield <= 0.0 and int(training.faith) >= 170 and enemy_hp > 0.0:
		var burst := _faith_power() * 1.15 * _holy_damage_multiplier()
		_events.append({"type": "holy_shield_burst", "damage": burst})
		_deal_damage(burst, "holy_shield_burst", 0.1)
	return damage - absorbed

func _trigger_divine_grace() -> bool:
	if not skill_is_unlocked("divine_grace") or holy_seals < MAX_HOLY_SEALS or divine_grace_cooldown > 0.0:
		return false
	holy_seals = 0
	divine_grace_cooldown = 45.0
	hero_hp = maxf(hero_hp, _hero_max_hp() * 0.32)
	_add_holy_shield(_hero_max_hp() * (0.35 if faith_branch == "guardian" else 0.25), "divine_grace")
	_events.append({"type": "divine_grace", "heal": hero_hp, "cooldown": divine_grace_cooldown})
	_events.append({"type": "holy_seals_changed", "value": holy_seals})
	return true

func _add_holy_seals(amount: int, source: String) -> void:
	if not skill_is_unlocked("holy_sword_seals") or amount <= 0:
		return
	if int(training.faith) >= 120 and hero_hp / maxf(1.0, _hero_max_hp()) <= 0.4:
		amount += 1
	var previous := holy_seals
	holy_seals = mini(MAX_HOLY_SEALS, holy_seals + amount)
	if holy_seals != previous:
		_events.append({"type": "holy_seals_changed", "value": holy_seals, "gain": holy_seals - previous, "source": source})

func _add_military_momentum(amount: float, source: String) -> void:
	if not skill_is_unlocked("military_momentum") or amount <= 0.0:
		return
	var efficiency := 1.0 + float(training.command) * 0.002
	if int(training.command) >= 65: efficiency += 0.15
	if int(training.command) >= 185: efficiency += 0.15
	if _war_god_active(): efficiency += 0.2
	var previous := military_momentum
	military_momentum = minf(MAX_MILITARY_MOMENTUM, military_momentum + amount * efficiency)
	if not is_equal_approx(previous, military_momentum):
		_events.append({"type": "military_momentum_changed", "value": military_momentum, "source": source})

func _holy_seal_cost(skill_id: String) -> int:
	var cost := int(SKILL_DEFS[skill_id].cost)
	if int(training.faith) >= 140 and skill_id == "judgment_slash": cost -= 1
	return maxi(0, cost)

func _command_cost(skill_id: String) -> float:
	var cost := float(SKILL_DEFS[skill_id].cost)
	if int(training.command) >= 140: cost *= 0.9
	if command_branch == "orders": cost *= 0.85
	return cost

func _faith_power() -> float:
	var value := 3.0 + float(_total_training_levels()) * 0.06 + float(training.faith) * 0.72
	if int(training.faith) >= 105: value *= 1.08
	if int(training.faith) >= 175: value *= 1.1
	return value

func _healing_multiplier() -> float:
	var multiplier := 1.0 + float(holy_seals) * (0.04 if int(training.faith) >= 100 else 0.0)
	if int(training.faith) >= 125 and hero_hp / maxf(1.0, _hero_max_hp()) <= 0.4: multiplier *= 1.25
	if int(training.faith) >= 185: multiplier *= 1.15
	if faith_branch == "grace": multiplier *= 1.25
	if holy_descent_remaining > 0.0: multiplier *= 1.35
	return multiplier

func _holy_damage_multiplier() -> float:
	var multiplier := 1.0 + float(holy_seals) * (0.04 if int(training.faith) >= 100 else 0.0)
	if skill_is_unlocked("judgment") and (enemy_is_boss or enemy_hp / maxf(1.0, enemy_max_hp) >= 0.7): multiplier *= 1.3 if int(training.faith) >= 75 else 1.2
	if int(training.faith) >= 120 and hero_hp / maxf(1.0, _hero_max_hp()) <= 0.4: multiplier *= 1.2
	if faith_branch == "radiance": multiplier *= 1.25
	if _divine_manifest_active(): multiplier *= 1.25 if int(training.faith) >= 195 else 1.15
	return multiplier

func _divine_manifest_active() -> bool:
	return int(training.faith) >= 190 and holy_seals >= MAX_HOLY_SEALS

func _ally_count() -> int:
	return _unlocked_allies().size()

func _unlocked_allies() -> Array[String]:
	var roster: Array[String] = []
	for ally_id: String in ALLY_DEFS:
		if int(training.command) >= int(ALLY_DEFS[ally_id].unlock_level):
			roster.append(ally_id)
	return roster

func _command_damage_multiplier() -> float:
	var multiplier := 1.0
	if military_momentum >= 70.0: multiplier *= 1.12
	if military_momentum >= MAX_MILITARY_MOMENTUM: multiplier *= 1.18
	if int(training.command) >= 145: multiplier *= 1.12
	if command_branch == "vanguard": multiplier *= 1.18
	if legion_fervor_remaining > 0.0: multiplier *= 1.2
	if _war_god_active(): multiplier *= 1.3 if int(training.command) >= 195 else 1.2
	return multiplier

func _war_god_active() -> bool:
	return int(training.command) >= 190 and military_momentum >= 80.0 and _ally_count() >= 3

func _try_first_strike() -> bool:
	if martial_branch != "first_strike" or momentum < 70.0:
		return false
	var momentum_before := momentum
	momentum -= 70.0
	_momentum_was_full = false
	var raw_damage := _attack_power() * 4.5 * _one_slash_mastery_multiplier(momentum_before) * _track_level_multiplier("martial", 150)
	_events.append({"type": "first_strike", "name": "先之先", "damage": raw_damage})
	_deal_damage(raw_damage, "first_strike", 0.25)
	_events.append({"type": "attack_interrupted"})
	return true

func _auto_attack() -> void:
	_basic_attack(false)

func _basic_attack(manual: bool) -> void:
	var damage := _attack_power()
	var critical := int(training.agility) > 0 and rng.randf() < _critical_chance()
	var instant_kill := instant_kill_ready
	if instant_kill:
		critical = true
		instant_kill_ready = false
	if critical:
		damage *= 2.6 if instant_kill else 1.75
		if int(training.agility) >= 130:
			var cap := 14.0 if int(training.agility) >= 135 else 10.0
			damage *= 1.0 + minf(cap, unharmed_duration) * 0.02
	_events.append({"type": "attack", "damage": damage, "critical": critical, "instant_kill": instant_kill, "manual": manual, "youren": youren})
	var attack_source := "critical_attack" if critical else ("flow_attack_full" if youren >= MAX_YOUREN else ("flow_attack" if youren >= 3 else "attack"))
	var defeated := _deal_damage(damage, attack_source)
	_add_momentum(6.0, "attack")
	_add_military_momentum(6.0 if int(training.command) >= 15 else 4.0, "attack")
	_record_flow_attack()
	if not defeated:
		_track_swift_cut()
		_magic_enchanted_hit(manual)
	if enemy_hp > 0.0:
		_holy_sword_hit(manual)
	if enemy_hp > 0.0:
		_try_command_follow_up("attack")

func _magic_enchanted_hit(manual: bool) -> void:
	if not skill_is_unlocked("magic_sword_marks"):
		return
	var marks_were_full := magic_marks >= MAX_MAGIC_MARKS
	var element := _current_magic_element()
	var enchant_damage := _magic_power() * 0.42 * _element_damage_multiplier(element) * _skill_level_multiplier("magic_sword_marks")
	if skill_is_unlocked("blazing_magic") and marks_were_full:
		enchant_damage *= 1.2
	if magic_release_remaining > 0.0:
		enchant_damage *= 1.4
	if _magic_manifest_active():
		enchant_damage *= 1.25 if int(training.magic) >= 195 else 1.15
	if complete_release_remaining > 0.0:
		enchant_damage *= 1.35
	_events.append({"type": "magic_enchant", "damage": enchant_damage, "manual": manual, "element": element})
	var defeated := _deal_damage(enchant_damage, "magic_enchant", 0.1)
	if not defeated and marks_were_full:
		magic_marks = 3 if int(training.magic) >= 170 and magic_release_remaining > 0.0 else 0
		_events.append({"type": "magic_marks_changed", "value": magic_marks})
		var slash_damage := _magic_power() * (2.75 if skill_is_unlocked("magic_slash_spread") else 2.2) * _skill_level_multiplier("magic_sword_marks")
		if skill_is_unlocked("blazing_magic"):
			slash_damage *= 1.2
		if magic_release_remaining > 0.0:
			slash_damage *= 1.5
		if resonance_slash_ready and int(training.magic) >= 120:
			slash_damage *= 1.4
			resonance_slash_ready = false
		if _magic_manifest_active():
			slash_damage *= 1.3 if int(training.magic) >= 195 else 1.2
		_events.append({"type": "magic_slash", "name": "魔力斬", "damage": slash_damage, "spread": skill_is_unlocked("magic_slash_spread"), "element": element})
		defeated = _deal_damage(slash_damage, "magic_slash", 0.15)
		if not defeated and int(training.magic) >= 80:
			_add_secondary_element(2)
		if not defeated and int(training.magic) >= 165:
			_apply_element(_current_magic_element(), 2)
		if not defeated:
			_try_elemental_resonance()
	var mark_gain := 3 if complete_release_remaining > 0.0 else (2 if magic_release_remaining > 0.0 else 1)
	if skill_is_unlocked("burning_inscription") and burn_stacks > 0:
		burning_hits += 1
		if burning_hits >= 2:
			burning_hits = 0
			mark_gain += 1
	_add_magic_marks(mark_gain, "magic_enchant")
	if defeated or not skill_is_unlocked("burning_enchant"):
		return
	var element_gain := 3 if complete_release_remaining > 0.0 else (2 if magic_release_remaining > 0.0 or int(training.magic) >= 85 else 1)
	_apply_element(element, element_gain)
	if int(training.magic) >= 70 and not secondary_element.is_empty():
		secondary_hit_counter += 1
		if int(training.magic) >= 80 or fusion_remaining > 0.0 or complete_release_remaining > 0.0 or secondary_hit_counter >= 2:
			secondary_hit_counter = 0
			_add_secondary_element(element_gain)

func _add_magic_marks(amount: int, source: String) -> void:
	if amount <= 0:
		return
	var previous := magic_marks
	magic_marks = mini(MAX_MAGIC_MARKS, magic_marks + amount)
	if magic_marks == previous:
		return
	_events.append({"type": "magic_marks_changed", "value": magic_marks, "gain": magic_marks - previous, "source": source})
	if previous < MAX_MAGIC_MARKS and magic_marks >= MAX_MAGIC_MARKS:
		_events.append({"type": "blazing_magic_entered", "enabled": skill_is_unlocked("blazing_magic")})

func _add_burn(amount: int) -> void:
	var previous := burn_stacks
	burn_stacks = mini(MAX_BURN, burn_stacks + amount)
	if burn_stacks == previous:
		return
	_events.append({"type": "burn_changed", "value": burn_stacks, "gain": burn_stacks - previous})
	if previous < MAX_BURN and burn_stacks >= MAX_BURN:
		_events.append({"type": "scorching_entered", "enabled": skill_is_unlocked("scorching_state")})
		_try_minor_resonance("fire")

func _apply_element(element: String, amount: int) -> void:
	match element:
		"ice": _add_frost(amount)
		"lightning": _add_lightning(amount)
		_: _add_burn(amount)

func _add_secondary_element(amount: int) -> void:
	var element := _active_secondary_element()
	if not element.is_empty():
		_apply_element(element, amount)

func _add_frost(amount: int) -> void:
	var previous := frost_stacks
	frost_stacks = mini(MAX_BURN, frost_stacks + amount)
	if frost_stacks == previous:
		return
	enemy_attack_remaining += float(frost_stacks - previous) * (0.1 if int(training.magic) >= 75 else 0.06)
	_events.append({"type": "secondary_changed", "element": "ice", "value": frost_stacks, "gain": frost_stacks - previous})
	if previous < MAX_BURN and frost_stacks >= MAX_BURN:
		enemy_attack_remaining += 0.8
		_events.append({"type": "frozen", "duration": 0.8})
		_try_minor_resonance("ice")

func _add_lightning(amount: int) -> void:
	var previous := lightning_stacks
	lightning_stacks = mini(MAX_BURN, lightning_stacks + amount)
	if lightning_stacks == previous:
		return
	var shock_damage := _magic_power() * (0.24 if int(training.magic) >= 75 else 0.16) * float(lightning_stacks - previous) * _track_level_multiplier("magic", 70)
	_events.append({"type": "secondary_changed", "element": "lightning", "value": lightning_stacks, "gain": lightning_stacks - previous})
	_events.append({"type": "lightning_tick", "damage": shock_damage})
	_deal_damage(shock_damage, "lightning_tick", 0.15)
	if previous < MAX_BURN and lightning_stacks >= MAX_BURN:
		_try_minor_resonance("lightning")

func _tick_burning(delta: float) -> void:
	if burn_stacks <= 0:
		burn_tick_remaining = 1.0
		return
	burn_tick_remaining -= delta
	while burn_tick_remaining <= 0.0 and burn_stacks > 0:
		burn_tick_remaining += 1.0
		var damage := _magic_power() * 0.16 * float(burn_stacks) * _fire_damage_multiplier() * _skill_level_multiplier("burning_enchant")
		_events.append({"type": "burn_tick", "damage": damage, "stacks": burn_stacks})
		if _deal_damage(damage, "burn_tick"):
			return

func _fire_damage_multiplier() -> float:
	var multiplier := 1.25 if skill_is_unlocked("scorching_state") and burn_stacks >= MAX_BURN else 1.0
	if int(training.magic) >= 60 and burn_stacks >= MAX_BURN:
		multiplier *= 1.15
	return multiplier

func _try_elemental_resonance() -> bool:
	if int(training.magic) < 90 or burn_stacks <= 0:
		return false
	var element := _active_secondary_element()
	var stacks := frost_stacks if element == "ice" else lightning_stacks
	if stacks < 3:
		return false
	var damage := _magic_power() * (2.6 if element == "ice" else 2.9) * _resonance_multiplier() * _track_level_multiplier("magic", 90)
	if element == "ice":
		frost_stacks = 0
		enemy_attack_remaining += 1.0
	else:
		lightning_stacks = 0
	_events.append({"type": "elemental_resonance", "element": element, "damage": damage, "name": "蒸氣碎裂" if element == "ice" else "爆燃雷爆"})
	_events.append({"type": "secondary_changed", "element": element, "value": 0})
	_deal_damage(damage, "elemental_resonance", 0.2)
	if int(training.magic) >= 100:
		_add_magic_marks(3 if int(training.magic) >= 110 else 2, "resonance")
		resonance_slash_ready = true
		skill_cooldowns["magic_sword_release"] = maxf(0.0, float(skill_cooldowns.get("magic_sword_release", 0.0)) - 1.0)
	return true

func _try_minor_resonance(element: String) -> void:
	if int(training.magic) < 160 or minor_resonance_cooldown > 0.0 or _current_magic_element() != element:
		return
	minor_resonance_cooldown = 2.5 if complete_release_remaining <= 0.0 else 0.8
	var damage := _magic_power() * 1.25 * _resonance_multiplier() * _track_level_multiplier("magic", 160)
	_events.append({"type": "minor_resonance", "element": element, "damage": damage})
	_deal_damage(damage, "minor_resonance", 0.1)

func _trigger_elemental_fusion() -> void:
	if int(training.magic) < 180:
		return
	fusion_remaining = 6.0
	_events.append({"type": "elemental_fusion", "element": _active_secondary_element(), "duration": fusion_remaining})

func _current_magic_element() -> String:
	return magic_specialization if int(training.magic) >= 150 and not magic_specialization.is_empty() else "fire"

func _active_secondary_element() -> String:
	var primary := _current_magic_element()
	if not secondary_element.is_empty() and secondary_element != primary:
		return secondary_element
	return "fire" if primary != "fire" else secondary_element

func _element_damage_multiplier(element: String) -> float:
	var multiplier := _fire_damage_multiplier() if element == "fire" else 1.0
	if int(training.magic) >= 55:
		multiplier *= 1.05
	if int(training.magic) >= 125:
		multiplier *= 1.05
	if int(training.magic) >= 155 and magic_specialization == element:
		multiplier *= 1.1
	return multiplier

func _advanced_magic_damage_multiplier() -> float:
	var multiplier := 1.05 if int(training.magic) >= 65 else 1.0
	if int(training.magic) >= 125:
		multiplier *= 1.05
	if _magic_manifest_active():
		multiplier *= 1.3 if int(training.magic) >= 195 else 1.2
	if complete_release_remaining > 0.0:
		multiplier *= 1.5
	return multiplier

func _resonance_multiplier() -> float:
	var multiplier := 1.15 if int(training.magic) >= 95 else 1.0
	if int(training.magic) >= 145:
		multiplier *= 1.1
	if int(training.magic) >= 185:
		multiplier *= 1.25
	if complete_release_remaining > 0.0:
		multiplier *= 1.45
	return multiplier

func _magic_mark_cost(skill_id: String) -> int:
	if skill_id == "flame_burst_slash":
		if int(training.magic) >= 170 and magic_release_remaining > 0.0: return 2
		if int(training.magic) >= 140: return 3
	if skill_id == "elemental_boundary_slash":
		if int(training.magic) >= 170 and magic_release_remaining > 0.0: return 1
		if int(training.magic) >= 140: return 2
	return int(SKILL_DEFS[skill_id].cost)

func _skill_mp_cost(skill_id: String) -> float:
	var definition: Dictionary = SKILL_DEFS[skill_id]
	var cost := float(definition.get("mp_cost", definition.cost if String(definition.resource) == "mp" else 0.0))
	var efficiency := 0.95 if int(training.magic) >= 65 else 1.0
	if int(training.magic) >= 175:
		efficiency *= 0.9
	return cost * efficiency

func _magic_manifest_active() -> bool:
	return int(training.magic) >= 190 and magic_marks >= MAX_MAGIC_MARKS and (burn_stacks > 0 or frost_stacks > 0 or lightning_stacks > 0)

func _enemy_attack(block_override := "") -> void:
	enemy_attack_count += 1
	var attack_type := _current_enemy_attack_type_id()
	var empowered := boss_empowered_attack
	boss_empowered_attack = false
	var attack_multiplier: float = float({"normal": 1.0, "heavy": 1.8, "area": 1.35, "sure_hit": 1.55}.get(attack_type, 1.0))
	if empowered:
		attack_multiplier *= 1.35
	_events.append({"type": "enemy_attack", "attack_type": attack_type, "archetype": enemy_archetype, "empowered": empowered})
	var route_damage := 1.08 if journey_route == "mountain" else (0.92 if journey_route == "village" else (1.15 if journey_route == "battlefield" else 1.0))
	var raw_damage := (7.0 + pow(float(stage), 0.82) * 2.1) * attack_multiplier * float(_enemy_definition().damage) * route_damage
	if attack_type == "heavy":
		raw_damage *= 1.0 + equipment_modifier("heavy_damage_taken")
	if boss_enraged:
		raw_damage *= 1.15
	if enemy_is_elite:
		raw_damage *= 1.18
	if enemy_weakened_remaining > 0.0:
		raw_damage *= 0.82 if int(training.physique) >= 75 else 0.9
	var incoming := raw_damage * 100.0 / (100.0 + _defense())
	if int(training.physique) >= 180 and incoming >= hero_hp and immovable > 0:
		incoming *= 0.5
		_events.append({"type": "fatal_guard"})
	if block_override.is_empty() and _try_dodge_attack(attack_type):
		return
	if int(training.command) >= 120 and _ally_count() > 0 and incoming >= _hero_max_hp() * 0.15:
		var guard_ratio := 0.28 if command_branch == "formation" else 0.2
		var guarded := incoming * guard_ratio
		incoming -= guarded
		_events.append({"type": "guard_detail", "prevented": guarded, "allies": _ally_count()})
	if skill_is_unlocked("guardian_oath") and holy_seals >= 2 and incoming >= _hero_max_hp() * 0.18 and holy_shield < incoming * 0.5:
		holy_seals -= 2
		_add_holy_shield(_faith_power() * 1.6 * _healing_multiplier(), "guardian_oath")
		_events.append({"type": "guardian_oath", "cost": 2})
		_events.append({"type": "holy_seals_changed", "value": holy_seals})
	if skill_is_unlocked("heaven_return") and immovable >= MAX_IMMOVABLE and (attack_type in ["heavy", "sure_hit"] or incoming >= hero_hp):
		_trigger_heaven_return(incoming)
		return_blade_ready = false
		return
	var forced_miss := block_override == "none"
	var block_quality := "" if forced_miss else block_override
	if block_override.is_empty():
		block_quality = _roll_block_quality()
	var blade_triggered := return_blade_ready
	if blade_triggered and block_quality.is_empty():
		block_quality = "block"
	if physique_branch == "iron_wall" and immovable >= MAX_IMMOVABLE and block_quality == "block":
		block_quality = "perfect"
	return_blade_ready = false
	if block_quality.is_empty():
		_take_unblocked_hit(incoming)
		return
	var level := int(training.physique)
	var layer_reduction := float(immovable) * (0.1 if level >= 15 else 0.08)
	var reduction := 0.9 if block_quality == "perfect" else minf(0.82, 0.45 + layer_reduction + float(level) * 0.0005)
	var damage := maxf(0.0, incoming * (1.0 - reduction))
	damage = _absorb_holy_shield(damage)
	if damage >= hero_hp and _trigger_divine_grace():
		damage = _absorb_holy_shield(damage)
	var prevented := incoming - damage
	recent_prevented_damage = prevented
	_record_incoming_damage(damage, attack_type)
	hero_hp = maxf(0.0, hero_hp - damage)
	if damage >= _hero_max_hp() * 0.12:
		_add_holy_seals(2 if attack_type == "heavy" and int(training.faith) >= 110 else 1, "damage_taken")
	_lose_youren(attack_type)
	_events.append({"type": "perfect_block" if block_quality == "perfect" else "block", "amount": damage, "prevented": prevented, "attack_type": attack_type})
	consecutive_blocks += 1
	if level >= 70:
		enemy_weakened_remaining = 4.0
	if skill_is_unlocked("immovable_form"):
		var gain := 2 if block_quality == "perfect" else 1
		immovable = mini(MAX_IMMOVABLE, immovable + gain)
		if immovable >= MAX_IMMOVABLE: immovable_break_guard = true
		_events.append({"type": "immovable_changed", "value": immovable})
	var guaranteed_counter := block_quality == "perfect" or blade_triggered or immovable_king_remaining > 0.0
	if guaranteed_counter or rng.randf() < 0.35 + float(level) * 0.002:
		_counter_attack(prevented, block_quality == "perfect", attack_type)
	if hero_hp <= 0.0:
		_defeat_hero()

func _roll_block_quality() -> String:
	var level := int(training.physique)
	if level <= 0:
		return ""
	if rng.randf() < _perfect_block_chance():
		return "perfect"
	return "block" if rng.randf() < _block_chance() else ""

func _perfect_block_chance() -> float:
	return minf(0.3, 0.03 + float(training.physique) * 0.001 + (0.05 if guard_stance_remaining > 0.0 else 0.0))

func _block_chance() -> float:
	return minf(0.8, 0.12 + float(training.physique) * 0.002 + float(immovable) * 0.05 + (0.3 if guard_stance_remaining > 0.0 else 0.0))

func _take_unblocked_hit(damage: float) -> void:
	damage = _absorb_holy_shield(damage)
	if damage >= hero_hp and _trigger_divine_grace():
		damage = _absorb_holy_shield(damage)
	_record_incoming_damage(damage, _current_enemy_attack_type_id())
	hero_hp = maxf(0.0, hero_hp - damage)
	_events.append({"type": "hero_hit", "amount": damage})
	if damage >= _hero_max_hp() * 0.12:
		_add_holy_seals(2 if _current_enemy_attack_type_id() == "heavy" and int(training.faith) >= 110 else 1, "damage_taken")
	return_blade_ready = false
	counter_chain = 0
	consecutive_blocks = 0
	recent_prevented_damage = 0.0
	_lose_youren(_current_enemy_attack_type_id())
	if immovable > 0:
		if int(training.physique) >= 160 and immovable >= MAX_IMMOVABLE and immovable_break_guard:
			immovable_break_guard = false
			_events.append({"type": "immovable_guard"})
		else:
			immovable -= 1
		_events.append({"type": "immovable_changed", "value": immovable})
	if hero_hp <= 0.0:
		_defeat_hero()

func _try_dodge_attack(attack_type: String, roll_override := -1.0) -> bool:
	var used_swift_step := swift_step_ready and _dodge_modifier(attack_type) > 0.0
	if used_swift_step:
		swift_step_ready = false
		skill_cooldowns["swift_step"] = float(SKILL_DEFS.swift_step.cooldown)
		_resolve_dodge(attack_type, true)
		return true
	var roll := rng.randf() if roll_override < 0.0 else roll_override
	if roll < _dodge_chance() * _dodge_modifier(attack_type):
		_resolve_dodge(attack_type, false)
		return true
	if agility_branch == "traceless" and youren >= MAX_YOUREN and attack_type == "normal":
		youren = 0
		swift_cut_hits = 0
		_events.append({"type": "traceless"})
		_events.append({"type": "youren_changed", "value": youren})
		_resolve_dodge(attack_type, false)
		return true
	return false

func _dodge_modifier(attack_type: String) -> float:
	return float({"normal": 1.0, "heavy": 1.0, "area": 0.55, "sure_hit": 0.0}.get(attack_type, 1.0))

func _resolve_dodge(attack_type: String, used_swift_step: bool) -> void:
	_events.append({"type": "dodge", "attack_type": attack_type, "chance": _dodge_chance(), "swift_step": used_swift_step})
	_add_youren(2, "dodge")
	if skill_is_unlocked("exploit_opening"):
		opening_remaining = 2.0
		_events.append({"type": "opening", "duration": opening_remaining})
	if agility_branch == "instant_kill":
		instant_kill_ready = true
	if used_swift_step:
		var swift_damage := _attack_power() * 1.4 * _skill_level_multiplier("swift_step")
		_events.append({"type": "swift_step", "damage": swift_damage})
		if _deal_damage(swift_damage, "swift_step", 0.1):
			return
	if skill_is_unlocked("shadow_assault"):
		shadow_assault_ready = true
		_events.append({"type": "shadow_assault_ready", "skill_id": "shadow_assault", "name": "影襲"})

func _lose_youren(attack_type: String) -> void:
	if shadowless_remaining > 0.0 and attack_type == "normal":
		return
	flow_hits = 0
	swift_cut_hits = 0
	unharmed_duration = 0.0
	if youren <= 0:
		return
	if int(training.agility) >= 160 and youren >= MAX_YOUREN and attack_type == "normal" and full_youren_guard:
		full_youren_guard = false
		_events.append({"type": "flow_guard"})
		return
	var loss := youren if attack_type in ["heavy", "sure_hit"] else 1
	youren = maxi(0, youren - loss)
	instant_kill_ready = false
	_events.append({"type": "youren_changed", "value": youren})

func _counter_attack(prevented: float, perfect: bool, attack_type: String) -> void:
	counter_chain += 1
	var raw_damage := _attack_power() * 0.8 + _defense() * 1.25
	raw_damage *= _track_level_multiplier("physique", 10)
	raw_damage *= 1.0 + float(immovable) * 0.28
	var borrowed := 0.0
	if skill_is_unlocked("borrow_force"):
		var borrow_ratio := 0.35
		if int(training.physique) >= 115: borrow_ratio = 0.5
		if int(training.physique) >= 185: borrow_ratio = 0.65
		if physique_branch == "borrowed_force": borrow_ratio += 0.15
		borrowed = prevented * borrow_ratio
		raw_damage += borrowed
	if perfect:
		raw_damage *= 1.55
	if int(training.physique) >= 130:
		raw_damage *= 1.0 + float(mini(counter_chain - 1, 7 if int(training.physique) >= 135 else 5)) * 0.12
	if physique_branch == "return_blade": raw_damage *= 1.25
	if int(training.physique) >= 120 and attack_type in ["heavy", "sure_hit"]: raw_damage *= 1.3
	var shocked := int(training.physique) >= 90 and perfect and attack_type == "heavy"
	if shocked:
		raw_damage *= 1.8
		enemy_attack_remaining += 1.4 if int(training.physique) >= 95 else 1.0
		_events.append({"type": "shock_return"})
	_events.append({"type": "counter", "damage": raw_damage, "perfect": perfect, "chain": counter_chain, "borrowed": borrowed})
	_deal_damage(raw_damage, "counter", 0.15)

func _trigger_heaven_return(incoming: float) -> void:
	var damage := incoming * 0.15
	hero_hp = maxf(1.0, hero_hp - damage)
	immovable = 0
	var raw_counter := (_attack_power() * 2.5 + _defense() * 7.0 + incoming * 1.25) * _skill_level_multiplier("heaven_return")
	_events.append({"type": "heaven_return", "amount": damage, "prevented": incoming - damage, "damage": raw_counter})
	_events.append({"type": "immovable_changed", "value": immovable})
	_deal_damage(raw_counter, "heaven_return", 0.5)

func _record_incoming_damage(amount: float, attack_type: String) -> void:
	var source := "%s・%s" % [_enemy_display_name(), _attack_type_name(attack_type)]
	last_incoming_source = source
	incoming_damage_by_source[source] = float(incoming_damage_by_source.get(source, 0.0)) + amount

func _highest_incoming_damage() -> Dictionary:
	var result := {"source": last_incoming_source, "amount": 0.0}
	for source: String in incoming_damage_by_source:
		var amount := float(incoming_damage_by_source[source])
		if amount > float(result.amount):
			result = {"source": source, "amount": amount}
	return result

func _defeat_hero() -> void:
	var failed_stage := stage
	var failed_wave := current_wave + 1
	var highest := _highest_incoming_damage()
	last_failure_report = {
		"failed_stage": failed_stage, "failed_wave": failed_wave,
		"killer": last_incoming_source if not last_incoming_source.is_empty() else _enemy_display_name(),
		"highest_damage_source": String(highest.source), "highest_damage_amount": float(highest.amount),
		"enemy_traits": "%s｜%s" % [String(_enemy_definition().role), String(_enemy_definition().hint)],
		"unspent_style_points": training_points,
	}
	var death_key := str(failed_stage)
	var deaths: Dictionary = slice_metrics.stage_deaths
	deaths[death_key] = int(deaths.get(death_key, 0)) + 1
	slice_metrics.stage_deaths = deaths
	stage = maxi(1, failed_stage - 1)
	current_wave = 0
	retry_pending = true
	retry_stage = failed_stage
	hero_hp = _hero_max_hp()
	hero_mp = _hero_max_mp()
	immovable = 0
	youren = 0
	draw_stance_remaining = 0.0
	extreme_momentum_remaining = 0.0
	reduced_next_slash_cost = false
	flow_hits = 0
	swift_cut_hits = 0
	counter_chain = 0
	consecutive_blocks = 0
	immovable_king_remaining = 0.0
	return_blade_ready = false
	swift_step_ready = false
	shadow_assault_ready = false
	shadowless_remaining = 0.0
	full_youren_duration = 0.0
	unharmed_duration = 0.0
	instant_kill_ready = false
	magic_marks = 0
	magic_release_remaining = 0.0
	complete_release_remaining = 0.0
	fusion_remaining = 0.0
	resonance_slash_ready = false
	_manifest_was_active = false
	holy_seals = 0
	holy_hit_counter = 0
	holy_shield = 0.0
	holy_release_remaining = 0.0
	holy_descent_remaining = 0.0
	_divine_manifest_was_active = false
	military_momentum = 0.0
	legion_fervor_remaining = 0.0
	war_god_remaining = 0.0
	_war_god_was_active = false
	ally_attack_remaining = ALLY_ATTACK_INTERVAL
	ally_attack_cursor = 0
	_spawn_enemy()
	_events.append({"type": "defeat", "failed_stage": failed_stage, "failed_wave": failed_wave, "fallback_stage": stage, "report": last_failure_report.duplicate(true)})

func _next_enemy_attack_type() -> String:
	var next_count := enemy_attack_count + 1
	return _attack_type_name(_attack_type_for_count(next_count))

func _next_enemy_attack_type_id() -> String:
	return _attack_type_for_count(enemy_attack_count + 1)

func _current_enemy_attack_type_id() -> String:
	return _attack_type_for_count(enemy_attack_count)

func _attack_type_for_count(count: int) -> String:
	if enemy_is_boss and boss_empowered_attack:
		return "heavy"
	if enemy_is_boss and boss_enraged:
		if count % 4 == 0:
			return "sure_hit"
		if count % 2 == 0:
			return "heavy"
		return "normal"
	if enemy_archetype == "raider":
		return "normal"
	if enemy_archetype == "brute":
		return "heavy"
	if enemy_archetype == "centurion":
		return "heavy" if count % 3 == 0 else "normal"
	if enemy_archetype == "shield":
		return "heavy" if count % 3 == 0 else "normal"
	if enemy_archetype == "caster":
		return "sure_hit" if count % 3 == 0 else "area"
	if count % 11 == 0:
		return "sure_hit"
	if count % 7 == 0:
		return "area"
	if count % (3 if enemy_is_boss else 5) == 0:
		return "heavy"
	return "normal"

func _attack_type_name(attack_type: String) -> String:
	return {"normal": "普通", "heavy": "重擊", "area": "範圍", "sure_hit": "必中"}.get(attack_type, "普通")

func _deal_damage(amount: float, source: String, armor_ignore := 0.0) -> bool:
	if enemy_hp <= 0.0:
		return false
	var previous_ratio := enemy_hp / maxf(1.0, enemy_max_hp)
	var effective_armor := enemy_armor * (1.0 - clampf(armor_ignore, 0.0, 1.0))
	var opening_multiplier := 1.25 if opening_remaining > 0.0 else 1.0
	var final_amount := amount * opening_multiplier * 100.0 / (100.0 + effective_armor)
	if enemy_armor >= HIGH_ARMOR_THRESHOLD:
		final_amount *= 1.0 + equipment_modifier("armored_damage")
	if enemy_guard_stacks > 0 and not SHIELD_BYPASS_SOURCES.has(source) and armor_ignore < 0.2:
		final_amount *= 0.55
		enemy_guard_stacks -= 1
		_events.append({"type": "enemy_guard", "remaining": enemy_guard_stacks})
		if enemy_guard_stacks <= 0:
			enemy_armor *= 0.68
			_events.append({"type": "enemy_guard_broken", "remaining_armor": enemy_armor})
	enemy_hp = maxf(0.0, enemy_hp - final_amount)
	_events.append({"type": "damage", "amount": final_amount, "source": source})
	var defeated := enemy_hp <= 0.0
	var current_ratio := enemy_hp / maxf(1.0, enemy_max_hp)
	if enemy_is_boss and not boss_howl_triggered and not defeated and previous_ratio > 0.7 and current_ratio <= 0.7:
		boss_howl_triggered = true
		boss_empowered_attack = true
		enemy_attack_remaining = maxf(enemy_attack_remaining, 1.05)
		_events.append({"type": "boss_howl", "name": "灰鬃戰吼", "next_attack": "蓄力重擊"})
	if (enemy_is_boss or enemy_archetype == "centurion") and not boss_enraged and not defeated and enemy_hp / maxf(1.0, enemy_max_hp) <= 0.3:
		boss_enraged = true
		enemy_attack_remaining = minf(enemy_attack_remaining, 0.65)
		_events.append({"type": "boss_enraged", "name": "狂怒"})
	if defeated:
		_enemy_defeated()
	return defeated

func _enemy_defeated() -> void:
	var completed_stage := stage
	var defeated_boss := enemy_is_boss
	var defeated_elite := enemy_is_elite
	kills += 1
	var waves := _stage_waves(stage)
	if current_wave + 1 < waves.size():
		current_wave += 1
		wave_transition_remaining = WAVE_TRANSITION_DURATION
		_clear_enemy_state_for_transition()
		_events.append({"type": "enemy_defeated", "stage": stage, "kills": kills, "boss": false, "wave_complete": true})
		_events.append({"type": "wave_transition_started", "stage": stage, "wave": current_wave + 1, "wave_count": waves.size(), "duration": WAVE_TRANSITION_DURATION})
		return
	if not retry_pending:
		stage += 1
		_record_stage_reached()
	if defeated_boss and completed_stage >= 30 and not inheritance_unlocked:
		inheritance_unlocked = true
		_events.append({"type": "inheritance_unlocked", "name": "戰魂傳承", "stage": completed_stage})
	current_wave = 0
	var point_gain := 3 if defeated_boss else 1
	if journey_route == "mountain":
		route_training_progress += float(point_gain) * 0.2
		var route_bonus := floori(route_training_progress)
		point_gain += route_bonus
		route_training_progress -= float(route_bonus)
	elif journey_route == "battlefield" and defeated_boss:
		point_gain += 3
	training_points += point_gain
	_add_momentum(20.0 if int(training.martial) >= 25 else 12.0, "kill")
	_add_youren(2 if int(training.agility) >= 25 else 1, "kill")
	_add_holy_seals(1, "kill")
	_add_military_momentum(18.0 if int(training.command) >= 25 else 12.0, "kill")
	if int(training.martial) >= 90:
		var no_beat_gain := 32.0 if int(training.martial) >= 95 else 24.0
		if martial_branch == "chain_slash": no_beat_gain += 12.0
		_add_momentum(no_beat_gain, "no_beat")
		_events.append({"type": "no_beat", "amount": no_beat_gain})
	hero_hp = minf(_hero_max_hp(), hero_hp + (18.0 if journey_route == "village" else 10.0))
	if defeated_boss and not retry_pending:
		awaiting_journey_choice = true
		boss_reward_claimed = false
	else:
		_spawn_enemy()
	_events.append({"type": "enemy_defeated", "stage": stage, "kills": kills, "boss": defeated_boss})
	_events.append({"type": "training_point", "gain": point_gain, "points": training_points})
	if not defeated_boss and enemy_is_boss:
		_events.append({"type": "boss_entered", "name": _enemy_display_name()})
	if defeated_boss and not retry_pending:
		_events.append({"type": "boss_reward_choice", "area": area_number, "completed_route": journey_route, "options": boss_reward_options()})
	_award_gold_and_equipment(defeated_boss, defeated_elite)

func boss_reward_options() -> Array[Dictionary]:
	var highest_track := "martial"
	for track: String in TRAINING_ORDER:
		if base_style_level(track) > base_style_level(highest_track):
			highest_track = track
	var accessory_by_track := {
		"martial": "momentum_talisman", "physique": "iron_guard_emblem", "agility": "swift_wind_feather",
		"magic": "magic_iron_core", "faith": "chaplain_seal", "command": "centurion_banner",
	}
	var ids: Array[String] = ["black_iron_cleaver", "black_iron_armor", String(accessory_by_track[highest_track])]
	var options: Array[Dictionary] = []
	for item_id: String in ids:
		var definition: Dictionary = EQUIPMENT_DEFS[item_id]
		options.append({"item_id": item_id, "name": String(definition.name), "slot": String(definition.slot), "description": String(definition.description), "style": String(definition.primary_style)})
	return options

func claim_boss_reward(item_id: String) -> Array[Dictionary]:
	_events.clear()
	if not awaiting_journey_choice:
		return []
	var valid := boss_reward_options().any(func(option: Dictionary) -> bool: return String(option.item_id) == item_id)
	if not valid:
		return []
	var definition: Dictionary = EQUIPMENT_DEFS[item_id]
	var track := String(definition.primary_style)
	var before := {
		"effective": effective_style_level(track), "base": base_style_level(track),
		"attack": _attack_power(), "defense": _defense(), "hp": _hero_max_hp(),
		"attack_speed": _agility_action_speed_bonus(),
	}
	grant_equipment(item_id)
	equip_item(item_id)
	boss_reward_claimed = true
	slice_metrics.boss_reward = item_id
	var after := {
		"effective": effective_style_level(track), "base": base_style_level(track),
		"attack": _attack_power(), "defense": _defense(), "hp": _hero_max_hp(),
		"attack_speed": _agility_action_speed_bonus(),
	}
	var next_level := mini(MAX_TRAINING_LEVEL, (int(after.base) / 5 + 1) * 5)
	if int(after.base) >= MAX_TRAINING_LEVEL:
		next_level = MAX_TRAINING_LEVEL
	var summary := {
		"track": track, "style": String(TRAINING_DEFS[track].style), "before": before, "after": after,
		"next_base_milestone": next_level, "modifier_text": _equipment_modifier_summary(item_id),
	}
	_events.append({"type": "boss_reward_claimed", "item_id": item_id, "name": String(definition.name), "style": track, "summary": summary})
	_events.append({"type": "journey_choice", "area": area_number, "completed_route": journey_route})
	return _events.duplicate(true)

func perform_inheritance(choice: String, target := "") -> Array[Dictionary]:
	_events.clear()
	if not inheritance_unlocked or choice not in ["memory", "equipment", "trade"]:
		return []
	var inherited_item := ""
	var inherited_track := ""
	if choice == "memory" or choice == "trade":
		if target not in TRAINING_ORDER:
			return []
		inherited_track = target
	elif choice == "equipment":
		if not EQUIPMENT_DEFS.has(target) or int(owned_equipment.get(target, 0)) <= 0:
			return []
		inherited_item = target
	for item_id: String in owned_equipment:
		if int(owned_equipment[item_id]) > 0:
			equipment_collection[item_id] = true
	battle_souls += 1
	inheritance_count += 1
	legacy_choice = choice
	legacy_track = inherited_track if choice == "trade" else ""
	legacy_item = inherited_item
	_reset_for_inheritance(inherited_item, inherited_track if choice == "memory" else "")
	_events.append({"type": "inheritance_completed", "choice": choice, "target": target, "battle_souls": battle_souls, "count": inheritance_count})
	return _events.duplicate(true)

func _reset_for_inheritance(inherited_item: String, memory_track: String) -> void:
	stage = 1
	area_number = 1
	journey_route = "frontier"
	awaiting_journey_choice = false
	boss_reward_claimed = false
	retry_pending = false
	retry_stage = 0
	current_wave = 0
	wave_transition_remaining = 0.0
	kills = 0
	gold = 0
	training_points = 0
	for track: String in TRAINING_ORDER:
		training[track] = 5 if track == memory_track else 0
	owned_equipment = {"black_iron_sword": 1, "black_iron_armor": 1}
	if not inherited_item.is_empty():
		owned_equipment[inherited_item] = maxi(1, int(owned_equipment.get(inherited_item, 0)))
	equipped_items = {"weapon": "", "armor": "", "accessory": ""}
	equipment_enhancements.clear()
	for item_id: String in EQUIPMENT_DEFS:
		equipment_enhancements[item_id] = 0
	shop_refresh_count = 0
	_generate_shop_items()
	auto_skill_slots = ["heavy_strike", "", "", "", ""]
	skill_cooldowns = {"heavy_strike": 1.2}
	martial_branch = ""
	physique_branch = ""
	agility_branch = ""
	secondary_element = ""
	magic_specialization = ""
	faith_branch = ""
	command_branch = ""
	momentum = 0.0
	immovable = 0
	youren = 0
	magic_marks = 0
	holy_seals = 0
	military_momentum = 0.0
	hero_hp = _hero_max_hp()
	hero_mp = _hero_max_mp()
	auto_attack_remaining = AUTO_ATTACK_INTERVAL
	_spawn_enemy()

func _equipment_modifier_summary(item_id: String) -> String:
	var modifiers: Dictionary = EQUIPMENT_DEFS[item_id].get("modifiers", {})
	if modifiers.has("armored_damage"):
		return "對重甲傷害 +%d%%" % roundi(float(modifiers.armored_damage) * 100.0)
	if modifiers.has("heavy_damage_taken"):
		return "受到重擊傷害 %d%%" % roundi(float(modifiers.heavy_damage_taken) * 100.0)
	if modifiers.has("momentum_gain"):
		return "勢獲取 +%d%%" % roundi(float(modifiers.momentum_gain) * 100.0)
	return ""

func _award_gold_and_equipment(defeated_boss: bool, defeated_elite: bool) -> void:
	var gold_gain := maxi(4, 6 + stage * 2) * (5 if defeated_boss else (2 if defeated_elite else 1))
	gold += gold_gain
	_events.append({"type": "gold_gain", "gain": gold_gain, "gold": gold})
	var drop_chance := 1.0 if defeated_boss else (0.28 if defeated_elite else 0.08)
	if rng.randf() > drop_chance:
		return
	var item_id := _roll_equipment_drop(defeated_boss)
	if item_id.is_empty():
		return
	var definition: Dictionary = EQUIPMENT_DEFS[item_id]
	if int(owned_equipment.get(item_id, 0)) > 0:
		var quality := String(definition.get("quality", "common"))
		var duplicate_gold := int(EQUIPMENT_QUALITY_COSTS.get(quality, 60))
		gold += duplicate_gold
		_events.append({"type": "equipment_duplicate", "item_id": item_id, "name": String(definition.name), "gold": duplicate_gold, "total_gold": gold})
		return
	grant_equipment(item_id)
	_events.append({"type": "equipment_drop", "item_id": item_id, "name": String(definition.name), "quality": String(definition.get("quality", "common"))})

func _roll_equipment_drop(prefer_unowned := false) -> String:
	var weighted_items: Array[String] = []
	var has_unowned := EQUIPMENT_DEFS.keys().any(func(item_id: String) -> bool: return int(owned_equipment.get(item_id, 0)) <= 0)
	for item_id: String in EQUIPMENT_DEFS:
		if prefer_unowned and has_unowned and int(owned_equipment.get(item_id, 0)) > 0:
			continue
		var quality := String(EQUIPMENT_DEFS[item_id].get("quality", "common"))
		var weight: int = int({"common": 8, "uncommon": 5, "rare": 2, "epic": 1}.get(quality, 4))
		for index in weight:
			weighted_items.append(item_id)
	if weighted_items.is_empty():
		return ""
	return weighted_items[rng.randi_range(0, weighted_items.size() - 1)]

func retry_failed_stage() -> Array[Dictionary]:
	_events.clear()
	if not retry_pending:
		return []
	stage = maxi(1, retry_stage)
	current_wave = 0
	retry_pending = false
	retry_stage = 0
	awaiting_journey_choice = false
	boss_reward_claimed = false
	_spawn_enemy()
	_events.append({"type": "retry_started", "stage": stage})
	return _events.duplicate(true)

func choose_journey_route(route_id: String) -> Array[Dictionary]:
	_events.clear()
	if not awaiting_journey_choice or not JOURNEY_ROUTES.has(route_id):
		return []
	journey_route = route_id
	slice_metrics.next_area_pressed = true
	area_number += 1
	awaiting_journey_choice = false
	boss_reward_claimed = false
	shop_refresh_count = 0
	_generate_shop_items()
	if route_id == "village":
		hero_hp = minf(_hero_max_hp(), hero_hp + _hero_max_hp() * 0.35)
		hero_mp = minf(_hero_max_mp(), hero_mp + _hero_max_mp() * 0.35)
	_spawn_enemy()
	var definition: Dictionary = JOURNEY_ROUTES[route_id]
	_events.append({"type": "journey_selected", "route": route_id, "name": String(definition.name), "intro": String(definition.intro), "effect": String(definition.effect)})
	return _events.duplicate(true)

func _spawn_enemy() -> void:
	wave_transition_remaining = 0.0
	enemy_archetype = _enemy_archetype_for_stage(stage)
	enemy_is_boss = enemy_archetype == "boss"
	boss_enraged = false
	boss_howl_triggered = false
	boss_empowered_attack = false
	enemy_is_elite = enemy_archetype == "centurion" or _route_position() == 9
	enemy_guard_stacks = 3 if enemy_archetype == "shield" else 0
	var definition := _enemy_definition()
	var route_hp := 1.08 if journey_route == "mountain" else (0.95 if journey_route == "village" else (1.18 if journey_route == "battlefield" else 1.0))
	enemy_max_hp = (52.0 + pow(float(stage - 1), 1.08) * 9.0) * float(definition.hp) * (1.35 if enemy_is_elite else 1.0) * route_hp
	enemy_hp = enemy_max_hp
	var route_armor := 1.12 if journey_route == "battlefield" else 1.0
	enemy_armor = ((5.0 + float(stage) * 0.8) * float(definition.armor) + (20.0 if enemy_is_boss else 0.0)) * route_armor
	enemy_engagement_time = 0.0
	enemy_attack_count = 0
	incoming_damage_by_source.clear()
	last_incoming_source = ""
	counter_chain = 0
	consecutive_blocks = 0
	recent_prevented_damage = 0.0
	return_blade_ready = false
	swift_step_ready = false
	shadow_assault_ready = false
	opening_remaining = 0.0
	enemy_weakened_remaining = 0.0
	burn_stacks = 0
	frost_stacks = 0
	lightning_stacks = 0
	secondary_hit_counter = 0
	burning_hits = 0
	burn_tick_remaining = 1.0
	enemy_attack_remaining = minf(_enemy_attack_interval(), 1.4)
	ally_attack_remaining = minf(ally_attack_remaining, 0.8) if _ally_count() > 0 else ALLY_ATTACK_INTERVAL

func _clear_enemy_state_for_transition() -> void:
	enemy_hp = 0.0
	enemy_guard_stacks = 0
	enemy_engagement_time = 0.0
	enemy_attack_count = 0
	enemy_attack_remaining = WAVE_TRANSITION_DURATION
	opening_remaining = 0.0
	enemy_weakened_remaining = 0.0
	burn_stacks = 0
	frost_stacks = 0
	lightning_stacks = 0
	secondary_hit_counter = 0
	burning_hits = 0
	incoming_damage_by_source.clear()
	last_incoming_source = ""

func _enemy_definition() -> Dictionary:
	return ENEMY_DEFS.get(enemy_archetype, ENEMY_DEFS.grunt)

func _enemy_display_name() -> String:
	var names: Dictionary = ROUTE_ENEMY_NAMES.get(journey_route, ROUTE_ENEMY_NAMES.frontier)
	return String(names.get(enemy_archetype, _enemy_definition().name))

func _journey_definition() -> Dictionary:
	if JOURNEY_ROUTES.has(journey_route):
		return JOURNEY_ROUTES[journey_route]
	return {"name": "黑鐵哨站", "intro": "你仍是軍陣裡最不起眼的一名小兵。前方，是第一座必須攻下的哨站。", "effect": "初始區域｜熟悉戰鬥與流派"}

func _enemy_attack_interval() -> float:
	var interval := float(_enemy_definition().interval) - minf(0.45, float(stage) * 0.012)
	if enemy_is_elite:
		interval *= 0.88
	if boss_enraged:
		interval *= 0.78
	return maxf(0.85, interval)

func _enemy_archetype_for_stage(target_stage: int) -> String:
	var waves := _stage_waves(target_stage)
	if not waves.is_empty():
		return String(waves[clampi(current_wave, 0, waves.size() - 1)])
	var position := ((maxi(1, target_stage) - 1) % 10) + 1
	if journey_route == "mountain":
		return {1: "raider", 2: "grunt", 3: "raider", 4: "brute", 5: "raider", 6: "caster", 7: "brute", 8: "raider", 9: "shield", 10: "boss"}.get(position, "raider")
	if journey_route == "village":
		return {1: "grunt", 2: "raider", 3: "grunt", 4: "shield", 5: "raider", 6: "caster", 7: "grunt", 8: "brute", 9: "shield", 10: "boss"}.get(position, "grunt")
	if journey_route == "battlefield":
		return {1: "grunt", 2: "shield", 3: "caster", 4: "brute", 5: "shield", 6: "caster", 7: "brute", 8: "caster", 9: "shield", 10: "boss"}.get(position, "grunt")
	return {
		1: "raider", 2: "brute", 3: "shield", 4: "caster", 5: "grunt",
		6: "raider", 7: "brute", 8: "caster", 9: "shield", 10: "boss",
	}.get(position, "grunt")

func _stage_waves(target_stage: int) -> Array:
	var position := ((maxi(1, target_stage) - 1) % 10) + 1
	if journey_route == "frontier":
		return FRONTIER_STAGE_WAVES.get(position, ["grunt"])
	return [_single_enemy_archetype_for_route(target_stage)]

func _single_enemy_archetype_for_route(target_stage: int) -> String:
	var position := ((maxi(1, target_stage) - 1) % 10) + 1
	if journey_route == "mountain":
		return {1: "raider", 2: "grunt", 3: "raider", 4: "brute", 5: "raider", 6: "caster", 7: "brute", 8: "raider", 9: "shield", 10: "boss"}.get(position, "raider")
	if journey_route == "village":
		return {1: "grunt", 2: "raider", 3: "grunt", 4: "shield", 5: "raider", 6: "caster", 7: "grunt", 8: "brute", 9: "shield", 10: "boss"}.get(position, "grunt")
	if journey_route == "battlefield":
		return {1: "grunt", 2: "shield", 3: "caster", 4: "brute", 5: "shield", 6: "caster", 7: "brute", 8: "caster", 9: "shield", 10: "boss"}.get(position, "grunt")
	return "grunt"

func _record_stage_reached() -> void:
	var reached: Dictionary = slice_metrics.stage_first_reached
	var key := str(stage)
	if not reached.has(key):
		reached[key] = float(slice_metrics.elapsed)
	slice_metrics.stage_first_reached = reached

func _route_position() -> int:
	return ((maxi(1, stage) - 1) % 10) + 1

func _route_phase() -> String:
	var position := _route_position()
	if position <= 3:
		return "遭遇"
	if position <= 6:
		return "戰線"
	if position <= 9:
		return "危機"
	return "首領"

func _add_momentum(amount: float, source: String) -> void:
	if effective_style_level("martial") < 10:
		return
	var multiplier := (1.0 + float(effective_style_level("martial")) * 0.003) * (1.0 + equipment_modifier("momentum_gain"))
	momentum = minf(MAX_MOMENTUM, momentum + amount * multiplier)
	if momentum >= MAX_MOMENTUM and not _momentum_was_full:
		_momentum_was_full = true
		if int(training.martial) >= 45: extreme_momentum_remaining = 4.0
		_events.append({"type": "momentum_full", "source": source})

func _one_slash_mastery_multiplier(momentum_before: float) -> float:
	var ratio := clampf(momentum_before / MAX_MOMENTUM, 0.0, 1.0)
	if int(training.martial) >= 15:
		ratio *= 0.25
	if skill_is_unlocked("one_slash_mastery"):
		ratio += clampf(momentum_before / MAX_MOMENTUM, 0.0, 1.0) * 0.6
	return 1.0 + ratio

func _momentum_cost(skill_id: String) -> float:
	var cost := float(SKILL_DEFS[skill_id].cost)
	if reduced_next_slash_cost:
		cost *= 0.5
	if draw_stance_remaining > 0.0:
		cost *= 0.75
	return cost

func _martial_slash_multiplier(skill_id: String, momentum_before: float) -> float:
	var multiplier := 1.0
	var hp_ratio := enemy_hp / maxf(1.0, enemy_max_hp)
	if int(training.martial) >= 20 and hp_ratio <= 0.3:
		multiplier *= 1.25 if int(training.martial) < 85 else 1.4
	if int(training.martial) >= 70:
		var cap := 8.0 if int(training.martial) < 75 else 12.0
		multiplier *= 1.0 + minf(cap, time_since_one_slash) * 0.035
	if draw_stance_remaining > 0.0: multiplier *= 1.3
	if momentum_before >= MAX_MOMENTUM or extreme_momentum_remaining > 0.0: multiplier *= 1.2
	if martial_branch == "execution" and hp_ratio <= 0.3: multiplier *= 1.3
	if martial_branch == "army_break" and enemy_is_boss: multiplier *= 1.35
	if martial_branch == "chain_slash" and reduced_next_slash_cost: multiplier *= 1.2
	if int(training.martial) >= 190 and momentum_before >= MAX_MOMENTUM and time_since_one_slash >= 8.0:
		multiplier *= 1.65 if int(training.martial) >= 195 else 1.45
		_events.append({"type": "mindless", "name": "無心"})
	return multiplier

func _tick_cooldowns(delta: float) -> void:
	for skill_id: String in skill_cooldowns.keys():
		skill_cooldowns[skill_id] = maxf(0.0, float(skill_cooldowns[skill_id]) - delta)

func _auto_equip(skill_id: String, preferred_front: bool) -> void:
	if auto_skill_slots.has(skill_id):
		return
	if preferred_front:
		auto_skill_slots.push_front(skill_id)
		auto_skill_slots.resize(AUTO_SLOT_COUNT)
	else:
		equip_auto_skill(skill_id)

func _new_unlocks(track: String, previous: int, current: int) -> Array[Dictionary]:
	var unlocks: Array[Dictionary] = []
	for skill_id: String in SKILL_DEFS:
		var definition: Dictionary = SKILL_DEFS[skill_id]
		var target := int(definition.level)
		if String(definition.track) == track and previous < target and current >= target:
			unlocks.append({"type": "unlock", "track": track, "level": target, "skill_id": skill_id, "name": String(definition.name), "description": String(definition.condition)})
	return unlocks

func _new_track_milestones(track: String, previous: int, current: int) -> Array[Dictionary]:
	var milestones: Array[Dictionary] = []
	var table: Dictionary = {
		"martial": MARTIAL_MILESTONES, "physique": PHYSIQUE_MILESTONES,
		"agility": AGILITY_MILESTONES, "magic": MAGIC_MILESTONES,
		"faith": FAITH_MILESTONES, "command": COMMAND_MILESTONES,
	}.get(track, {})
	for target: int in table:
		if _has_unlock_at(track, target):
			continue
		if previous < target and current >= target:
			var definition: Dictionary = table[target]
			milestones.append({"type": "milestone", "track": track, "level": target, "name": String(definition.name), "description": String(definition.description)})
	return milestones

func _has_unlock_at(track: String, level: int) -> bool:
	for skill_id: String in SKILL_DEFS:
		var definition: Dictionary = SKILL_DEFS[skill_id]
		if String(definition.track) == track and int(definition.level) == level:
			return true
	return false

func _total_training_levels() -> int:
	var total := 0
	for track: String in TRAINING_ORDER:
		total += effective_style_level(track)
	return total

func _stat_value(stat: String, base: float) -> float:
	var value := base + float(_total_training_levels()) * float(GROWTH.common.get(stat, 0.0))
	for track: String in TRAINING_ORDER:
		value += float(effective_style_level(track)) * float(GROWTH[track].get(stat, 0.0))
	if stat == "attack_speed":
		value += _agility_action_speed_bonus()
	return value

func _hero_max_hp() -> float: return _stat_value("hp", 100.0)
func _hero_max_mp() -> float:
	var value := _stat_value("mp", 0.0)
	return value * (1.05 if int(training.magic) >= 105 else 1.0)
func _attack_power() -> float: return _stat_value("attack", 9.5)
func _magic_power() -> float:
	var value := 4.0 + float(_total_training_levels()) * 0.08 + float(effective_style_level("magic")) * 0.78
	if int(training.magic) >= 55: value *= 1.05
	if int(training.magic) >= 105: value *= 1.05
	if int(training.magic) >= 175: value *= 1.05
	return value
func _defense() -> float: return _stat_value("defense", 2.0)
func _mp_regeneration() -> float: return 1.2 + float(effective_style_level("magic")) * 0.035

func skill_power_hint(skill_id: String) -> String:
	if not SKILL_DEFS.has(skill_id):
		return ""
	var definition: Dictionary = SKILL_DEFS[skill_id]
	if String(definition.track) == "common":
		return "共通基礎技能"
	if String(definition.type) == "passive" and skill_id not in ["flowing_ease", "shadow_assault", "burning_enchant", "magic_sword_marks"]:
		return "被動機制"
	return "流派熟練 ×%.2f" % _skill_level_multiplier(skill_id)

func auto_skill_state(skill_id: String) -> String:
	var cooldown := float(skill_cooldowns.get(skill_id, 0.0))
	if cooldown > 0.0:
		return "冷卻 %.1fs" % cooldown
	return "就緒" if _can_cast(skill_id) else "等待條件"

func _skill_level_multiplier(skill_id: String) -> float:
	var definition: Dictionary = SKILL_DEFS[skill_id]
	if String(definition.track) == "common":
		return 1.0
	return _track_level_multiplier(String(definition.track), int(definition.level))

func _track_level_multiplier(track: String, unlock_level: int) -> float:
	return 1.0 + float(maxi(0, effective_style_level(track) - unlock_level)) * 0.004
func _dodge_chance() -> float:
	return minf(DODGE_CAP, 0.05 + _agility_dodge_bonus())
func _critical_chance() -> float:
	var bonus := _youren_critical_bonus()
	return minf(0.65, 0.05 + _agility_critical_bonus() + bonus)
func _current_attack_interval() -> float:
	var youren_speed := _youren_attack_speed_bonus()
	var shadowless_speed := 0.55 if shadowless_remaining > 0.0 else 0.0
	return maxf(MIN_AUTO_ATTACK_INTERVAL, AUTO_ATTACK_INTERVAL / (1.0 + _stat_value("attack_speed", 0.0) + youren_speed + shadowless_speed))

func _record_flow_attack() -> void:
	if not skill_is_unlocked("flowing_ease"):
		return
	if youren >= MAX_YOUREN:
		flow_hits = 0
		return
	flow_hits += 1
	if flow_hits < FLOW_HITS_REQUIRED:
		return
	flow_hits = 0
	_add_youren(1, "attack_chain")

func _add_youren(amount: int, source: String) -> void:
	if not skill_is_unlocked("flowing_ease") or amount <= 0:
		return
	var previous := youren
	youren = mini(MAX_YOUREN, youren + amount)
	if youren != previous:
		_events.append({"type": "youren_changed", "value": youren, "gain": youren - previous, "source": source})
		if previous < MAX_YOUREN and youren >= MAX_YOUREN:
			swift_cut_hits = 0
			full_youren_guard = true
			full_youren_duration = 0.0
			_events.append({"type": "flow_state_entered", "name": "游刃有餘"})

func _track_swift_cut() -> void:
	if not skill_is_unlocked("flowing_ease") or youren < MAX_YOUREN:
		swift_cut_hits = 0
		return
	swift_cut_hits += 1
	var required := 1 if int(training.agility) >= 140 else 2
	if swift_cut_hits < required:
		return
	swift_cut_hits = 0
	var damage := _attack_power() * (0.45 if int(training.agility) >= 165 else 0.35) * _track_level_multiplier("agility", 20)
	var critical := int(training.agility) >= 80 and rng.randf() < _critical_chance()
	if critical: damage *= 1.75
	_events.append({"type": "swift_cut", "name": "追斬", "damage": damage, "critical": critical, "follow_up": true})
	_deal_damage(damage, "swift_cut", 0.05)

func _youren_attack_speed_bonus() -> float:
	if not skill_is_unlocked("flowing_ease"):
		return 0.0
	var bonus := float(youren) * 0.03
	if agility_branch == "chase_wind": bonus += 0.12
	return bonus

func _youren_critical_bonus() -> float:
	if not skill_is_unlocked("flowing_ease"): return 0.0
	if youren >= 4: return 0.05
	if youren >= 3: return 0.03
	return 0.0

func _agility_action_speed_bonus() -> float:
	return _tiered_agility_bonus(0.012, 0.008, 0.006, 0.004)

func _agility_critical_bonus() -> float:
	return _tiered_agility_bonus(0.002, 0.0015, 0.001, 0.00065)

func _agility_dodge_bonus() -> float:
	return _tiered_agility_bonus(0.0015, 0.002, 0.0025, 0.00225)

func _agility_move_speed_bonus() -> float:
	return _tiered_agility_bonus(0.01, 0.0066667, 0.004, 0.002)

func _tiered_agility_bonus(early: float, mid: float, advanced: float, late: float) -> float:
	var level := effective_style_level("agility")
	return float(mini(level, 20)) * early \
		+ float(mini(maxi(level - 20, 0), 30)) * mid \
		+ float(mini(maxi(level - 50, 0), 50)) * advanced \
		+ float(maxi(level - 100, 0)) * late
