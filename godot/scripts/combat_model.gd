class_name CombatModel
extends RefCounted

const MAX_TRAINING_LEVEL := 200
const MAX_MOMENTUM := 100.0
const AUTO_ATTACK_INTERVAL := 0.96
const AUTO_SLOT_COUNT := 5
const HIGH_ARMOR_THRESHOLD := 18.0
const TRAINING_ORDER := ["martial", "physique", "agility", "magic", "faith", "command"]
const TRAINING_DEFS := {
	"martial": {"name": "武藝", "style": "一刀流", "implemented": true, "special": "攻擊、爆發、破甲"},
	"physique": {"name": "體術", "style": "格擋流", "implemented": false, "special": "生命、防禦、反擊"},
	"agility": {"name": "敏捷", "style": "閃避流", "implemented": false, "special": "攻速、閃避、追擊"},
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
}
const MARTIAL_BRANCHES := {
	"no_beat": {"name": "無拍子", "description": "擊殺後額外獲得 28 勢，適合連續清怪"},
	"spirit_focus": {"name": "氣合", "description": "對同一敵人戰鬥越久，蓄勢速度越快"},
	"first_strike": {"name": "先之先", "description": "敵人出手前消耗 70 勢先斬並中斷攻擊"},
}

var stage := 1
var hero_hp := 100.0
var enemy_hp := 52.0
var enemy_max_hp := 52.0
var enemy_armor := 5.8
var enemy_is_boss := false
var enemy_engagement_time := 0.0
var kills := 0
var training_points := 5
var training := {"martial": 0, "physique": 0, "agility": 0, "magic": 0, "faith": 0, "command": 0}
var martial_branch := ""
var momentum := 0.0
var auto_skill_slots: Array[String] = ["", "", "", "", ""]
var skill_cooldowns := {}
var auto_attack_remaining := AUTO_ATTACK_INTERVAL
var enemy_attack_remaining := 2.25
var _momentum_was_full := false
var _events: Array[Dictionary] = []

func step(delta: float) -> Array[Dictionary]:
	_events.clear()
	_tick_cooldowns(delta)
	enemy_engagement_time += delta
	var passive_gain := 5.0
	if martial_branch == "spirit_focus":
		passive_gain += minf(6.0, enemy_engagement_time * 0.08)
	_add_momentum(delta * passive_gain, "time")
	auto_attack_remaining -= delta
	enemy_attack_remaining -= delta
	if not _try_auto_skill() and auto_attack_remaining <= 0.0:
		auto_attack_remaining += _current_attack_interval()
		_auto_attack()
		_try_auto_skill()
	if enemy_attack_remaining <= 0.0:
		enemy_attack_remaining += maxf(1.25, 2.25 - stage * 0.02)
		if not _try_first_strike():
			_enemy_attack()
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
		if bool(SKILL_DEFS[skill_id].get("implemented", false)) and String(SKILL_DEFS[skill_id].type) != "passive":
			_auto_equip(skill_id, skill_id == "two_cut")
	if track == "martial" and previous < 150 and int(training.martial) >= 150:
		_events.append({"type": "branch_unlocked", "name": "一刀流分支", "description": "前往技能頁選擇無拍子、氣合或先之先"})
	return _events.duplicate(true)

func select_martial_branch(branch_id: String) -> bool:
	if int(training.martial) < 150 or not MARTIAL_BRANCHES.has(branch_id):
		return false
	martial_branch = branch_id
	return true

func equip_auto_skill(skill_id: String, slot_index := -1) -> bool:
	if not skill_is_unlocked(skill_id):
		return false
	var definition: Dictionary = SKILL_DEFS[skill_id]
	if not bool(definition.get("implemented", false)) or String(definition.type) == "passive":
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
		"kills": kills, "training_points": training_points, "training": training.duplicate(true),
		"momentum": momentum, "max_momentum": MAX_MOMENTUM, "martial_branch": martial_branch,
		"auto_skill_slots": auto_skill_slots.duplicate(), "skill_cooldowns": skill_cooldowns.duplicate(true),
		"attack_interval": _current_attack_interval(), "engagement_time": enemy_engagement_time,
	}

func training_hint(track: String) -> String:
	if not TRAINING_DEFS.has(track):
		return ""
	var definition: Dictionary = TRAINING_DEFS[track]
	if not bool(definition.implemented):
		return "%s · 後續開放" % String(definition.style)
	var level := int(training[track])
	if level < 10: return "Lv.10 重斬"
	if level < 30: return "Lv.30 殘心"
	if level < 50: return "Lv.50 破甲一閃"
	if level < 100: return "Lv.100 一刀流極意"
	if level < 150: return "Lv.150 斷首＋分支"
	if level < 200: return "Lv.200 一刀兩斷"
	return "一刀流已達純流派極致"

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
	if not bool(definition.get("implemented", false)) or String(definition.type) == "passive":
		return false
	if float(skill_cooldowns.get(skill_id, 0.0)) > 0.0 or momentum < float(definition.cost):
		return false
	if skill_id == "armor_flash":
		return enemy_armor >= HIGH_ARMOR_THRESHOLD
	if skill_id == "execute_slash":
		return enemy_hp / maxf(1.0, enemy_max_hp) <= 0.25
	return true

func _cast_skill(skill_id: String) -> void:
	var definition: Dictionary = SKILL_DEFS[skill_id]
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
	var damage := _attack_power()
	_events.append({"type": "attack", "damage": damage})
	_deal_damage(damage, "attack")
	_add_momentum(6.0, "attack")

func _enemy_attack() -> void:
	var raw_damage := 4.4 + sqrt(float(stage)) * 1.15
	var damage := maxf(1.0, raw_damage - _defense() * 0.35)
	hero_hp = maxf(0.0, hero_hp - damage)
	_events.append({"type": "hero_hit", "amount": damage})
	if hero_hp <= 0.0:
		stage = maxi(1, stage - 1)
		hero_hp = _hero_max_hp()
		_spawn_enemy()
		_events.append({"type": "defeat"})

func _deal_damage(amount: float, source: String, armor_ignore := 0.0) -> bool:
	if enemy_hp <= 0.0:
		return false
	var effective_armor := enemy_armor * (1.0 - clampf(armor_ignore, 0.0, 1.0))
	var final_amount := amount * 100.0 / (100.0 + effective_armor)
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

func _add_momentum(amount: float, source: String) -> void:
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
func _current_attack_interval() -> float: return AUTO_ATTACK_INTERVAL / (1.0 + _stat_value("attack_speed", 0.0))
