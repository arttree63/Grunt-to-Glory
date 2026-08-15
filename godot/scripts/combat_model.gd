class_name CombatModel
extends RefCounted

const MAX_TRAINING_LEVEL := 200
const MAX_MOMENTUM := 100.0
const AUTO_ATTACK_INTERVAL := 0.96
const MANUAL_ATTACK_MULTIPLIER := 0.2
const AUTO_SLOT_COUNT := 5
const HIGH_ARMOR_THRESHOLD := 18.0
const MAX_IMMOVABLE := 3
const MAX_YOUREN := 5
const DODGE_CAP := 0.55
const TRAINING_ORDER := ["martial", "physique", "agility", "magic", "faith", "command"]
const TRAINING_DEFS := {
	"martial": {"name": "武藝", "style": "一刀流", "implemented": true, "special": "攻擊、爆發、破甲"},
	"physique": {"name": "體術", "style": "不動流", "implemented": true, "special": "生命、防禦、格擋、反擊"},
	"agility": {"name": "敏捷", "style": "閃影流", "implemented": true, "special": "攻速、閃避、暴擊、追擊"},
	"magic": {"name": "魔法", "style": "魔劍流", "implemented": false, "special": "魔力、元素、異常"},
	"faith": {"name": "信仰", "style": "聖劍流", "implemented": false, "special": "治療、護盾、聖傷"},
	"command": {"name": "統御", "style": "軍團劍技流", "implemented": false, "special": "軍勢、友軍、連攜"},
}
const GROWTH := {
	"common": {"hp": 1.5, "mp": 0.0, "attack": 0.25, "defense": 0.15, "attack_speed": 0.0},
	"martial": {"hp": 0.5, "mp": 0.0, "attack": 0.7, "defense": 0.2, "attack_speed": 0.0},
	"physique": {"hp": 2.0, "mp": 0.0, "attack": 0.15, "defense": 0.8, "attack_speed": 0.0},
	"agility": {"hp": 0.4, "mp": 0.0, "attack": 0.35, "defense": 0.05, "attack_speed": 0.008},
	"magic": {"hp": 0.2, "mp": 1.5, "attack": 0.35, "defense": 0.05, "attack_speed": 0.0},
	"faith": {"hp": 1.0, "mp": 0.8, "attack": 0.2, "defense": 0.35, "attack_speed": 0.0},
	"command": {"hp": 0.8, "mp": 0.2, "attack": 0.25, "defense": 0.2, "attack_speed": 0.0},
}
const SKILL_DEFS := {
	"heavy_slash": {
		"name": "重斬", "short": "重斬", "type": "active", "track": "martial", "level": 10,
		"cooldown": 1.2, "resource": "momentum", "cost": 50.0,
		"condition": "勢 ≥ 50", "damage_multiplier": 3.2, "armor_ignore": 0.0,
		"tags": ["ONE_SLASH"], "implemented": true,
	},
	"remaining_heart": {
		"name": "殘心", "short": "殘心", "type": "passive", "track": "martial", "level": 30,
		"condition": "一刀未擊殺返還 20 勢", "momentum_refund": 20.0,
		"tags": ["ONE_SLASH"], "implemented": true,
	},
	"armor_flash": {
		"name": "破甲一閃", "short": "破甲", "type": "active", "track": "martial", "level": 50,
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
		"name": "斷首", "short": "斷首", "type": "active", "track": "martial", "level": 150,
		"cooldown": 2.0, "resource": "momentum", "cost": 70.0,
		"condition": "目標生命 ≤ 25% 且勢 ≥ 70", "damage_multiplier": 6.0, "armor_ignore": 0.35,
		"tags": ["ONE_SLASH", "EXECUTE"], "implemented": true,
	},
	"two_cut": {
		"name": "一刀兩斷", "short": "兩斷", "type": "ultimate", "track": "martial", "level": 200,
		"cooldown": 8.0, "resource": "momentum", "cost": 100.0,
		"condition": "勢已滿", "damage_multiplier": 12.0, "armor_ignore": 0.5,
		"tags": ["ONE_SLASH", "EXECUTE"], "implemented": true,
	},
	"return_blade": {
		"name": "返刃", "short": "返刃", "type": "active", "track": "physique", "level": 10,
		"cooldown": 4.0, "resource": "none", "cost": 0.0,
		"condition": "敵人即將攻擊", "tags": ["BLOCK", "COUNTER"], "implemented": true,
	},
	"immovable_form": {
		"name": "不動", "short": "不動", "type": "passive", "track": "physique", "level": 30,
		"condition": "格擋累積不動，最高 3 層", "tags": ["BLOCK", "STANCE"], "implemented": true,
	},
	"borrow_force": {
		"name": "借力", "short": "借力", "type": "passive", "track": "physique", "level": 50,
		"condition": "格擋減免量的 35% 轉為反擊傷害", "tags": ["BLOCK", "COUNTER"], "implemented": true,
	},
	"collapse_counter": {
		"name": "不動崩返", "short": "崩返", "type": "active", "track": "physique", "level": 100,
		"cooldown": 5.0, "resource": "immovable", "cost": 3.0,
		"condition": "不動達 3 層", "tags": ["COUNTER", "BURST"], "implemented": true,
	},
	"heaven_return": {
		"name": "奧義・不動返天", "short": "返天", "type": "ultimate", "track": "physique", "level": 200,
		"condition": "滿層不動承受重擊或致命攻擊時自動發動", "tags": ["BLOCK", "COUNTER", "ULTIMATE"], "implemented": true, "reactive": true,
	},
	"swift_step": {
		"name": "瞬步", "short": "瞬步", "type": "active", "track": "agility", "level": 10,
		"cooldown": 5.0, "resource": "none", "cost": 0.0,
		"condition": "敵人即將發動危險攻擊", "tags": ["DODGE", "FOLLOW_UP"], "implemented": true,
	},
	"flowing_ease": {
		"name": "游刃", "short": "游刃", "type": "passive", "track": "agility", "level": 30,
		"condition": "閃避累積游刃，最高 5 層；命中會中斷節奏", "tags": ["DODGE", "STACK"], "implemented": true,
	},
	"shadow_assault": {
		"name": "影襲", "short": "影襲", "type": "passive", "track": "agility", "level": 50,
		"condition": "成功閃避後立即追擊", "tags": ["DODGE", "FOLLOW_UP"], "implemented": true,
	},
	"exploit_opening": {
		"name": "乘隙", "short": "乘隙", "type": "passive", "track": "agility", "level": 100,
		"condition": "敵人攻擊落空後，2 秒內受到傷害提高 25%", "tags": ["DODGE", "VULNERABLE"], "implemented": true,
	},
	"shadowless": {
		"name": "奧義・無影", "short": "無影", "type": "ultimate", "track": "agility", "level": 200,
		"condition": "滿層游刃時自動進入 6 秒無影", "tags": ["DODGE", "FOLLOW_UP", "ULTIMATE"], "implemented": true, "reactive": true,
	},
}
const MARTIAL_BRANCHES := {
	"no_beat": {"name": "無拍子", "description": "擊殺後額外獲得 28 勢，適合連續清怪"},
	"spirit_focus": {"name": "氣合", "description": "對同一敵人戰鬥越久，蓄勢速度越快"},
	"first_strike": {"name": "先之先", "description": "敵人出手前消耗 70 勢先斬並中斷攻擊"},
}
const PHYSIQUE_BRANCHES := {
	"shock_return": {"name": "震返", "description": "格擋重擊時震退敵人並強化該次反擊"},
	"inch_power": {"name": "寸勁", "description": "連續反擊會逐次提高反擊傷害，破防時重置"},
	"iron_wall": {"name": "鐵壁", "description": "滿層不動時，下一次普通格擋提升為完美格擋"},
}
const AGILITY_BRANCHES := {
	"flying_swallow": {"name": "飛燕", "description": "影襲有 35% 機率追加一次高速追擊"},
	"traceless": {"name": "無蹤", "description": "滿層游刃時，消耗全部游刃閃開一次原本會命中的普通攻擊"},
	"instant_kill": {"name": "瞬殺", "description": "閃避後的下一次普通攻擊必定造成強力暴擊"},
}

var stage := 1
var hero_hp := 100.0
var enemy_hp := 52.0
var enemy_max_hp := 52.0
var enemy_armor := 5.8
var enemy_is_boss := false
var enemy_engagement_time := 0.0
var enemy_attack_count := 0
var kills := 0
var training_points := 5
var training := {"martial": 0, "physique": 0, "agility": 0, "magic": 0, "faith": 0, "command": 0}
var martial_branch := ""
var physique_branch := ""
var agility_branch := ""
var momentum := 0.0
var immovable := 0
var youren := 0
var return_blade_ready := false
var swift_step_ready := false
var recent_prevented_damage := 0.0
var counter_chain := 0
var opening_remaining := 0.0
var shadowless_remaining := 0.0
var shadowless_cooldown := 0.0
var instant_kill_ready := false
var rng := RandomNumberGenerator.new()
var auto_skill_slots: Array[String] = ["", "", "", "", ""]
var skill_cooldowns := {}
var auto_attack_remaining := AUTO_ATTACK_INTERVAL
var enemy_attack_remaining := 2.25
var _momentum_was_full := false
var _events: Array[Dictionary] = []

func _init() -> void:
	rng.seed = 1337

func step(delta: float) -> Array[Dictionary]:
	_events.clear()
	_tick_cooldowns(delta)
	opening_remaining = maxf(0.0, opening_remaining - delta)
	shadowless_remaining = maxf(0.0, shadowless_remaining - delta)
	shadowless_cooldown = maxf(0.0, shadowless_cooldown - delta)
	if skill_is_unlocked("shadowless") and youren >= MAX_YOUREN and shadowless_remaining <= 0.0 and shadowless_cooldown <= 0.0:
		shadowless_remaining = 6.0
		shadowless_cooldown = 15.0
		_events.append({"type": "shadowless", "duration": shadowless_remaining})
	enemy_engagement_time += delta
	var passive_gain := 5.0
	if martial_branch == "spirit_focus":
		passive_gain += minf(6.0, enemy_engagement_time * 0.08)
	if int(training.martial) > 0:
		_add_momentum(delta * passive_gain, "time")
	auto_attack_remaining -= delta
	enemy_attack_remaining -= delta
	if not _try_auto_skill() and auto_attack_remaining <= 0.0:
		auto_attack_remaining = _current_attack_interval()
		_basic_attack(false)
		_try_auto_skill()
	if enemy_attack_remaining <= 0.0:
		enemy_attack_remaining += maxf(1.25, 2.25 - stage * 0.02)
		if not _try_first_strike():
			_enemy_attack()
	return _events.duplicate(true)

func manual_attack() -> Array[Dictionary]:
	_events.clear()
	var damage := _attack_power() * MANUAL_ATTACK_MULTIPLIER
	var critical := int(training.agility) > 0 and rng.randf() < _critical_chance()
	if critical:
		damage *= 1.5
	_events.append({"type": "manual_attack", "damage": damage, "critical": critical})
	_deal_damage(damage, "manual_attack")
	_add_momentum(0.5, "manual_attack")
	return _events.duplicate(true)

func spend_training(track: String) -> Array[Dictionary]:
	_events.clear()
	if not training.has(track) or training_points <= 0:
		return []
	var definition: Dictionary = TRAINING_DEFS[track]
	if not bool(definition.implemented) or int(training[track]) >= MAX_TRAINING_LEVEL:
		return []
	var old_max_hp := _hero_max_hp()
	var previous := int(training[track])
	training[track] = previous + 1
	training_points -= 1
	hero_hp += _hero_max_hp() - old_max_hp
	_events.append({"type": "training_up", "track": track, "name": String(definition.name), "level": previous + 1})
	for unlock: Dictionary in _new_unlocks(track, previous, previous + 1):
		_events.append(unlock)
		var skill_id := String(unlock.skill_id)
		var skill_type := String(SKILL_DEFS[skill_id].type)
		if bool(SKILL_DEFS[skill_id].get("implemented", false)) and (skill_type == "active" or (skill_type == "ultimate" and not bool(SKILL_DEFS[skill_id].get("reactive", false)))):
			_auto_equip(skill_id, skill_id == "two_cut")
	if track == "martial" and previous < 150 and int(training.martial) >= 150:
		_events.append({"type": "branch_unlocked", "name": "一刀流分支", "description": "前往技能頁選擇無拍子、氣合或先之先"})
	if track == "physique" and previous < 150 and int(training.physique) >= 150:
		_events.append({"type": "branch_unlocked", "name": "不動流分支", "description": "前往技能頁選擇震返、寸勁或鐵壁"})
	if track == "agility" and previous < 150 and int(training.agility) >= 150:
		_events.append({"type": "branch_unlocked", "name": "閃影流分支", "description": "前往技能頁選擇飛燕、無蹤或瞬殺"})
	return _events.duplicate(true)

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

func skill_is_unlocked(skill_id: String) -> bool:
	if not SKILL_DEFS.has(skill_id):
		return false
	var definition: Dictionary = SKILL_DEFS[skill_id]
	return int(training[String(definition.track)]) >= int(definition.level)

func snapshot() -> Dictionary:
	return {
		"stage": stage,
		"hero_hp": hero_hp, "hero_max_hp": _hero_max_hp(), "hero_max_mp": _hero_max_mp(),
		"attack": _attack_power(), "defense": _defense(),
		"enemy_hp": enemy_hp, "enemy_max_hp": enemy_max_hp, "enemy_armor": enemy_armor,
		"enemy_is_boss": enemy_is_boss, "enemy_name": "重甲哥布林王" if enemy_is_boss else "林地哥布林",
		"enemy_attack_type": _next_enemy_attack_type(), "enemy_attack_remaining": enemy_attack_remaining,
		"kills": kills, "training_points": training_points, "training": training.duplicate(true),
		"momentum": momentum, "max_momentum": MAX_MOMENTUM, "martial_branch": martial_branch,
		"immovable": immovable, "max_immovable": MAX_IMMOVABLE, "physique_branch": physique_branch,
		"return_blade_ready": return_blade_ready, "counter_chain": counter_chain,
		"youren": youren, "max_youren": MAX_YOUREN, "agility_branch": agility_branch,
		"swift_step_ready": swift_step_ready, "shadowless_remaining": shadowless_remaining,
		"dodge_chance": _dodge_chance(), "critical_chance": _critical_chance(),
		"manual_attack_ready": true,
		"auto_skill_slots": auto_skill_slots.duplicate(), "skill_cooldowns": skill_cooldowns.duplicate(true),
		"attack_interval": _current_attack_interval(), "engagement_time": enemy_engagement_time,
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
	var level := int(training[track])
	if level < 10: return "Lv.10 重斬"
	if level < 30: return "Lv.30 殘心"
	if level < 50: return "Lv.50 破甲一閃"
	if level < 100: return "Lv.100 一刀流極意"
	if level < 150: return "Lv.150 斷首＋分支"
	if level < 200: return "Lv.200 一刀兩斷"
	return "一刀流已達純流派極致"

func physique_hint() -> String:
	var level := int(training.physique)
	if level < 10: return "Lv.10 返刃"
	if level < 30: return "Lv.30 不動"
	if level < 50: return "Lv.50 借力"
	if level < 100: return "Lv.100 不動崩返"
	if level < 150: return "Lv.150 不動流分支"
	if level < 200: return "Lv.200 不動返天"
	return "不動流已達純流派極致"

func agility_hint() -> String:
	var level := int(training.agility)
	if level < 10: return "Lv.10 瞬步"
	if level < 30: return "Lv.30 游刃"
	if level < 50: return "Lv.50 影襲"
	if level < 100: return "Lv.100 乘隙"
	if level < 150: return "Lv.150 閃影流分支"
	if level < 200: return "Lv.200 奧義・無影"
	return "閃影流已達純流派極致"

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
	if String(definition.resource) == "momentum" and momentum < float(definition.cost):
		return false
	if String(definition.resource) == "immovable" and immovable < int(definition.cost):
		return false
	if skill_id == "armor_flash":
		return enemy_armor >= HIGH_ARMOR_THRESHOLD
	if skill_id == "execute_slash":
		return enemy_hp / maxf(1.0, enemy_max_hp) <= 0.25
	if skill_id == "return_blade":
		return enemy_attack_remaining <= 0.7 and not return_blade_ready
	if skill_id == "swift_step":
		return enemy_attack_remaining <= 0.7 and _next_enemy_attack_type() != "普通" and not swift_step_ready
	return true

func _cast_skill(skill_id: String) -> void:
	var definition: Dictionary = SKILL_DEFS[skill_id]
	if skill_id == "return_blade":
		return_blade_ready = true
		skill_cooldowns[skill_id] = float(definition.cooldown)
		_events.append({"type": "return_blade", "skill_id": skill_id, "name": String(definition.name)})
		return
	if skill_id == "swift_step":
		swift_step_ready = true
		skill_cooldowns[skill_id] = float(definition.cooldown)
		_events.append({"type": "swift_step_ready", "skill_id": skill_id, "name": String(definition.name)})
		return
	if skill_id == "collapse_counter":
		_cast_collapse_counter()
		return
	var momentum_before := momentum
	momentum = maxf(0.0, momentum - float(definition.cost))
	_momentum_was_full = false
	skill_cooldowns[skill_id] = float(definition.cooldown)
	var mastery := _one_slash_mastery_multiplier(momentum_before)
	var raw_damage := _attack_power() * float(definition.damage_multiplier) * mastery
	var armor_ignore := float(definition.get("armor_ignore", 0.0))
	_events.append({"type": skill_id, "skill_id": skill_id, "name": String(definition.name), "damage": raw_damage, "mastery": mastery})
	var defeated := _deal_damage(raw_damage, skill_id, armor_ignore)
	if skill_id == "armor_flash" and not defeated:
		var armor_broken := minf(enemy_armor, float(definition.armor_break))
		enemy_armor = maxf(0.0, enemy_armor - armor_broken)
		_events.append({"type": "armor_broken", "amount": armor_broken, "remaining": enemy_armor})
	if not defeated and skill_id != "two_cut" and skill_is_unlocked("remaining_heart"):
		var refund := float(SKILL_DEFS.remaining_heart.momentum_refund)
		_add_momentum(refund, "remaining_heart")
		_events.append({"type": "remaining_heart", "amount": refund})

func _cast_collapse_counter() -> void:
	var definition: Dictionary = SKILL_DEFS.collapse_counter
	var spent := immovable
	immovable = 0
	skill_cooldowns["collapse_counter"] = float(definition.cooldown)
	var raw_damage := _attack_power() * 2.2 + _defense() * 4.2 + recent_prevented_damage * 0.8
	raw_damage *= 1.0 + float(spent) * 0.35
	_events.append({"type": "collapse_counter", "name": "不動崩返", "damage": raw_damage, "spent": spent})
	_deal_damage(raw_damage, "collapse_counter", 0.3)
	recent_prevented_damage = 0.0
	_events.append({"type": "immovable_changed", "value": immovable})

func _try_first_strike() -> bool:
	if martial_branch != "first_strike" or momentum < 70.0:
		return false
	var momentum_before := momentum
	momentum -= 70.0
	_momentum_was_full = false
	var raw_damage := _attack_power() * 4.5 * _one_slash_mastery_multiplier(momentum_before)
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
	_events.append({"type": "attack", "damage": damage, "critical": critical, "instant_kill": instant_kill, "manual": manual})
	_deal_damage(damage, "critical_attack" if critical else "attack")
	_add_momentum(6.0, "attack")

func _enemy_attack(block_override := "") -> void:
	enemy_attack_count += 1
	var attack_type := _current_enemy_attack_type_id()
	var attack_multiplier: float = float({"normal": 1.0, "heavy": 1.8, "area": 1.35, "sure_hit": 1.55}.get(attack_type, 1.0))
	var raw_damage := (7.0 + pow(float(stage), 0.82) * 2.1) * attack_multiplier
	var incoming := raw_damage * 100.0 / (100.0 + _defense())
	if block_override.is_empty() and _try_dodge_attack(attack_type):
		return
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
	var reduction := 0.9 if block_quality == "perfect" else minf(0.78, 0.45 + float(immovable) * 0.08 + float(level) * 0.0005)
	var damage := maxf(0.0, incoming * (1.0 - reduction))
	var prevented := incoming - damage
	recent_prevented_damage = prevented
	hero_hp = maxf(0.0, hero_hp - damage)
	_lose_youren(attack_type)
	_events.append({"type": "perfect_block" if block_quality == "perfect" else "block", "amount": damage, "prevented": prevented, "attack_type": attack_type})
	if skill_is_unlocked("immovable_form"):
		var gain := 2 if block_quality == "perfect" else 1
		immovable = mini(MAX_IMMOVABLE, immovable + gain)
		_events.append({"type": "immovable_changed", "value": immovable})
	var guaranteed_counter := block_quality == "perfect" or blade_triggered
	if guaranteed_counter or rng.randf() < 0.35 + float(level) * 0.002:
		_counter_attack(prevented, block_quality == "perfect", attack_type)
	if hero_hp <= 0.0:
		_defeat_hero()

func _roll_block_quality() -> String:
	var level := int(training.physique)
	if level <= 0:
		return ""
	var perfect_chance := minf(0.25, 0.03 + float(level) * 0.001)
	if rng.randf() < perfect_chance:
		return "perfect"
	var block_chance := minf(0.65, 0.12 + float(level) * 0.002 + float(immovable) * 0.05)
	return "block" if rng.randf() < block_chance else ""

func _take_unblocked_hit(damage: float) -> void:
	hero_hp = maxf(0.0, hero_hp - damage)
	_events.append({"type": "hero_hit", "amount": damage})
	return_blade_ready = false
	counter_chain = 0
	recent_prevented_damage = 0.0
	_lose_youren(_current_enemy_attack_type_id())
	if immovable > 0:
		immovable -= 1
		_events.append({"type": "immovable_changed", "value": immovable})
	if hero_hp <= 0.0:
		_defeat_hero()

func _try_dodge_attack(attack_type: String, roll_override := -1.0) -> bool:
	var used_swift_step := swift_step_ready
	if used_swift_step:
		swift_step_ready = false
		_resolve_dodge(attack_type, true)
		return true
	var roll := rng.randf() if roll_override < 0.0 else roll_override
	if roll < _dodge_chance() * _dodge_modifier(attack_type):
		_resolve_dodge(attack_type, false)
		return true
	if agility_branch == "traceless" and youren >= MAX_YOUREN and attack_type == "normal":
		youren = 0
		_events.append({"type": "traceless"})
		_events.append({"type": "youren_changed", "value": youren})
		_resolve_dodge(attack_type, false)
		return true
	return false

func _dodge_modifier(attack_type: String) -> float:
	return float({"normal": 1.0, "heavy": 1.0, "area": 0.55, "sure_hit": 0.0}.get(attack_type, 1.0))

func _resolve_dodge(attack_type: String, used_swift_step: bool) -> void:
	_events.append({"type": "dodge", "attack_type": attack_type, "chance": _dodge_chance(), "swift_step": used_swift_step})
	if skill_is_unlocked("flowing_ease"):
		youren = mini(MAX_YOUREN, youren + 1)
		_events.append({"type": "youren_changed", "value": youren})
	if skill_is_unlocked("exploit_opening"):
		opening_remaining = 2.0
		_events.append({"type": "opening", "duration": opening_remaining})
	if agility_branch == "instant_kill":
		instant_kill_ready = true
	if used_swift_step:
		var swift_damage := _attack_power() * 1.4
		_events.append({"type": "swift_step", "damage": swift_damage})
		if _deal_damage(swift_damage, "swift_step", 0.1):
			return
	if skill_is_unlocked("shadow_assault"):
		var shadow_damage := _attack_power() * (1.15 + float(youren) * 0.12)
		if shadowless_remaining > 0.0:
			shadow_damage *= 1.8
		_events.append({"type": "shadow_assault", "damage": shadow_damage})
		if _deal_damage(shadow_damage, "shadow_assault", 0.15):
			return
		if agility_branch == "flying_swallow" and rng.randf() < 0.35:
			var extra_damage := shadow_damage * 0.75
			_events.append({"type": "flying_swallow", "damage": extra_damage})
			_deal_damage(extra_damage, "flying_swallow", 0.15)

func _lose_youren(attack_type: String) -> void:
	if youren <= 0:
		return
	if shadowless_remaining > 0.0 and attack_type == "normal":
		return
	var loss := 2 if attack_type == "normal" else youren
	youren = maxi(0, youren - loss)
	instant_kill_ready = false
	_events.append({"type": "youren_changed", "value": youren})

func _counter_attack(prevented: float, perfect: bool, attack_type: String) -> void:
	counter_chain += 1
	var raw_damage := _attack_power() * 0.8 + _defense() * 1.25
	raw_damage *= 1.0 + float(immovable) * 0.28
	var borrowed := 0.0
	if skill_is_unlocked("borrow_force"):
		borrowed = prevented * 0.35
		raw_damage += borrowed
	if perfect:
		raw_damage *= 1.55
	if physique_branch == "inch_power":
		raw_damage *= 1.0 + float(mini(counter_chain - 1, 5)) * 0.15
	var shocked := physique_branch == "shock_return" and attack_type == "heavy"
	if shocked:
		raw_damage *= 1.8
		enemy_attack_remaining += 1.0
		_events.append({"type": "shock_return"})
	_events.append({"type": "counter", "damage": raw_damage, "perfect": perfect, "chain": counter_chain, "borrowed": borrowed})
	_deal_damage(raw_damage, "counter", 0.15)

func _trigger_heaven_return(incoming: float) -> void:
	var damage := incoming * 0.15
	hero_hp = maxf(1.0, hero_hp - damage)
	immovable = 0
	var raw_counter := _attack_power() * 2.5 + _defense() * 7.0 + incoming * 1.25
	_events.append({"type": "heaven_return", "amount": damage, "prevented": incoming - damage, "damage": raw_counter})
	_events.append({"type": "immovable_changed", "value": immovable})
	_deal_damage(raw_counter, "heaven_return", 0.5)

func _defeat_hero() -> void:
	stage = maxi(1, stage - 1)
	hero_hp = _hero_max_hp()
	immovable = 0
	youren = 0
	counter_chain = 0
	return_blade_ready = false
	swift_step_ready = false
	shadowless_remaining = 0.0
	instant_kill_ready = false
	_spawn_enemy()
	_events.append({"type": "defeat"})

func _next_enemy_attack_type() -> String:
	var next_count := enemy_attack_count + 1
	return _attack_type_name(_attack_type_for_count(next_count))

func _current_enemy_attack_type_id() -> String:
	return _attack_type_for_count(enemy_attack_count)

func _attack_type_for_count(count: int) -> String:
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
	var effective_armor := enemy_armor * (1.0 - clampf(armor_ignore, 0.0, 1.0))
	var opening_multiplier := 1.25 if opening_remaining > 0.0 else 1.0
	var final_amount := amount * opening_multiplier * 100.0 / (100.0 + effective_armor)
	enemy_hp = maxf(0.0, enemy_hp - final_amount)
	_events.append({"type": "damage", "amount": final_amount, "source": source})
	var defeated := enemy_hp <= 0.0
	if defeated:
		_enemy_defeated()
	return defeated

func _enemy_defeated() -> void:
	var defeated_boss := enemy_is_boss
	kills += 1
	stage += 1
	var point_gain := 3 if defeated_boss else 1
	training_points += point_gain
	_add_momentum(12.0, "kill")
	if martial_branch == "no_beat":
		_add_momentum(28.0, "no_beat")
		_events.append({"type": "no_beat", "amount": 28.0})
	hero_hp = minf(_hero_max_hp(), hero_hp + 10.0)
	_spawn_enemy()
	_events.append({"type": "enemy_defeated", "stage": stage, "kills": kills, "boss": defeated_boss})
	_events.append({"type": "training_point", "gain": point_gain, "points": training_points})

func _spawn_enemy() -> void:
	enemy_is_boss = stage % 10 == 0
	enemy_max_hp = (52.0 + pow(float(stage - 1), 1.08) * 9.0) * (2.2 if enemy_is_boss else 1.0)
	enemy_hp = enemy_max_hp
	enemy_armor = 5.0 + float(stage) * 0.8 + (20.0 if enemy_is_boss else 0.0)
	enemy_engagement_time = 0.0
	enemy_attack_count = 0
	counter_chain = 0
	recent_prevented_damage = 0.0
	return_blade_ready = false
	swift_step_ready = false
	opening_remaining = 0.0

func _add_momentum(amount: float, source: String) -> void:
	if int(training.martial) <= 0:
		return
	var multiplier := 1.0 + float(training.martial) * 0.003
	momentum = minf(MAX_MOMENTUM, momentum + amount * multiplier)
	if momentum >= MAX_MOMENTUM and not _momentum_was_full:
		_momentum_was_full = true
		_events.append({"type": "momentum_full", "source": source})

func _one_slash_mastery_multiplier(momentum_before: float) -> float:
	if not skill_is_unlocked("one_slash_mastery"):
		return 1.0
	return 1.0 + clampf(momentum_before / MAX_MOMENTUM, 0.0, 1.0) * 0.6

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

func _total_training_levels() -> int:
	var total := 0
	for track: String in TRAINING_ORDER:
		total += int(training[track])
	return total

func _stat_value(stat: String, base: float) -> float:
	var value := base + float(_total_training_levels()) * float(GROWTH.common.get(stat, 0.0))
	for track: String in TRAINING_ORDER:
		value += float(training[track]) * float(GROWTH[track].get(stat, 0.0))
	return value

func _hero_max_hp() -> float: return _stat_value("hp", 100.0)
func _hero_max_mp() -> float: return _stat_value("mp", 0.0)
func _attack_power() -> float: return _stat_value("attack", 9.5)
func _defense() -> float: return _stat_value("defense", 2.0)
func _dodge_chance() -> float:
	return minf(DODGE_CAP, 0.05 + float(training.agility) * 0.0022)
func _critical_chance() -> float:
	var bonus := float(youren) * 0.025 if skill_is_unlocked("flowing_ease") else 0.0
	return minf(0.65, 0.05 + float(training.agility) * 0.001 + bonus)
func _current_attack_interval() -> float:
	var youren_speed := float(youren) * 0.06 if skill_is_unlocked("flowing_ease") else 0.0
	var shadowless_speed := 0.55 if shadowless_remaining > 0.0 else 0.0
	return AUTO_ATTACK_INTERVAL / (1.0 + _stat_value("attack_speed", 0.0) + youren_speed + shadowless_speed)
