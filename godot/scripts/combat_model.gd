class_name CombatModel
extends RefCounted

const MAX_TRAINING_LEVEL := 200
const MAX_MOMENTUM := 100.0
const AUTO_ATTACK_INTERVAL := 0.96
const AUTO_SLOT_COUNT := 5
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
		"cooldown": 1.2, "resource": "momentum", "cost": 50.0, "priority": 50,
		"condition": "勢 ≥ 50", "damage_multiplier": 3.2, "tags": ["ONE_SLASH"], "implemented": true,
	},
	"remaining_heart": {
		"name": "殘心", "short": "殘心", "type": "passive", "track": "martial", "level": 30,
		"cooldown": 0.0, "resource": "none", "cost": 0.0, "priority": 0,
		"condition": "一刀未擊殺", "momentum_refund": 20.0, "tags": ["ONE_SLASH"], "implemented": true,
	},
	"armor_flash": {
		"name": "破甲一閃", "short": "破甲", "type": "active", "track": "martial", "level": 50,
		"condition": "高護甲目標", "tags": ["ONE_SLASH", "ARMOR_BREAK"], "implemented": false,
	},
	"execute_slash": {
		"name": "斷首", "short": "斷首", "type": "active", "track": "martial", "level": 150,
		"condition": "目標生命 ≤ 25%", "tags": ["ONE_SLASH", "EXECUTE"], "implemented": false,
	},
	"two_cut": {
		"name": "一刀兩斷", "short": "兩斷", "type": "ultimate", "track": "martial", "level": 200,
		"cooldown": 8.0, "resource": "momentum", "cost": 100.0, "priority": 100,
		"condition": "勢已滿", "damage_multiplier": 12.0, "tags": ["ONE_SLASH", "EXECUTE"], "implemented": true,
	},
}

var stage := 1
var hero_hp := 100.0
var enemy_hp := 52.0
var enemy_max_hp := 52.0
var kills := 0
var training_points := 5
var training := {
	"martial": 0,
	"physique": 0,
	"agility": 0,
	"magic": 0,
	"faith": 0,
	"command": 0,
}
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
	_add_momentum(delta * 5.0, "time")
	auto_attack_remaining -= delta
	enemy_attack_remaining -= delta
	if _try_auto_skill():
		pass
	elif auto_attack_remaining <= 0.0:
		auto_attack_remaining += _current_attack_interval()
		_auto_attack()
		_try_auto_skill()
	if enemy_attack_remaining <= 0.0:
		enemy_attack_remaining += maxf(1.25, 2.25 - stage * 0.02)
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
		if SKILL_DEFS.has(skill_id) and bool(SKILL_DEFS[skill_id].get("implemented", false)) and String(SKILL_DEFS[skill_id].type) != "passive":
			_auto_equip(skill_id, skill_id == "two_cut")
	return _events.duplicate(true)

func equip_auto_skill(skill_id: String, slot_index := -1) -> bool:
	if not skill_is_unlocked(skill_id):
		return false
	var definition: Dictionary = SKILL_DEFS[skill_id]
	if not bool(definition.get("implemented", false)) or String(definition.type) == "passive":
		return false
	for index in AUTO_SLOT_COUNT:
		if auto_skill_slots[index] == skill_id:
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
		"hero_hp": hero_hp,
		"hero_max_hp": _hero_max_hp(),
		"hero_max_mp": _hero_max_mp(),
		"attack": _attack_power(),
		"defense": _defense(),
		"enemy_hp": enemy_hp,
		"enemy_max_hp": enemy_max_hp,
		"kills": kills,
		"training_points": training_points,
		"training": training.duplicate(true),
		"momentum": momentum,
		"max_momentum": MAX_MOMENTUM,
		"auto_skill_slots": auto_skill_slots.duplicate(),
		"skill_cooldowns": skill_cooldowns.duplicate(true),
		"attack_interval": _current_attack_interval(),
	}

func training_hint(track: String) -> String:
	if not TRAINING_DEFS.has(track):
		return ""
	var definition: Dictionary = TRAINING_DEFS[track]
	if not bool(definition.implemented):
		return "%s · 後續開放" % String(definition.style)
	var level := int(training[track])
	if level < 10:
		return "Lv.10 重斬"
	if level < 30:
		return "Lv.30 殘心"
	if level < 50:
		return "Lv.50 破甲一閃（後續）"
	if level < 100:
		return "Lv.100 一刀流核心（後續）"
	if level < 150:
		return "Lv.150 斷首（後續）"
	if level < 200:
		return "Lv.200 一刀兩斷"
	return "一刀流已達純流派極致"

func _try_auto_skill() -> bool:
	for skill_id: String in auto_skill_slots:
		if skill_id.is_empty() or not _can_cast(skill_id):
			continue
		_cast_skill(skill_id)
		return true
	return false

func _can_cast(skill_id: String) -> bool:
	if not skill_is_unlocked(skill_id):
		return false
	var definition: Dictionary = SKILL_DEFS[skill_id]
	if not bool(definition.get("implemented", false)) or String(definition.type) == "passive":
		return false
	if float(skill_cooldowns.get(skill_id, 0.0)) > 0.0:
		return false
	return momentum >= float(definition.cost)

func _cast_skill(skill_id: String) -> void:
	var definition: Dictionary = SKILL_DEFS[skill_id]
	momentum = maxf(0.0, momentum - float(definition.cost))
	_momentum_was_full = false
	skill_cooldowns[skill_id] = float(definition.cooldown)
	var damage := _attack_power() * float(definition.damage_multiplier)
	var enemy_will_survive := enemy_hp > damage
	_events.append({"type": skill_id, "skill_id": skill_id, "name": String(definition.name), "damage": damage})
	_deal_damage(damage, skill_id)
	if enemy_will_survive and skill_id != "two_cut" and skill_is_unlocked("remaining_heart"):
		var refund := float(SKILL_DEFS.remaining_heart.momentum_refund)
		_add_momentum(refund, "remaining_heart")
		_events.append({"type": "remaining_heart", "amount": refund})

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
		_events.append({"type": "defeat"})

func _deal_damage(amount: float, source: String) -> void:
	if enemy_hp <= 0.0:
		return
	enemy_hp = maxf(0.0, enemy_hp - amount)
	_events.append({"type": "damage", "amount": amount, "source": source})
	if enemy_hp <= 0.0:
		_enemy_defeated()

func _enemy_defeated() -> void:
	kills += 1
	stage += 1
	training_points += 1
	_add_momentum(12.0, "kill")
	hero_hp = minf(_hero_max_hp(), hero_hp + 10.0)
	enemy_max_hp = 52.0 + pow(float(stage - 1), 1.08) * 9.0
	enemy_hp = enemy_max_hp
	_events.append({"type": "enemy_defeated", "stage": stage, "kills": kills})
	_events.append({"type": "training_point", "points": training_points})

func _add_momentum(amount: float, source: String) -> void:
	var multiplier := 1.0 + float(training.martial) * 0.003
	momentum = minf(MAX_MOMENTUM, momentum + amount * multiplier)
	if momentum >= MAX_MOMENTUM and not _momentum_was_full:
		_momentum_was_full = true
		_events.append({"type": "momentum_full", "source": source})

func _tick_cooldowns(delta: float) -> void:
	for skill_id: String in skill_cooldowns.keys():
		skill_cooldowns[skill_id] = maxf(0.0, float(skill_cooldowns[skill_id]) - delta)

func _auto_equip(skill_id: String, preferred_front: bool) -> void:
	if auto_skill_slots.has(skill_id):
		return
	if preferred_front:
		auto_skill_slots.push_front(skill_id)
		auto_skill_slots.resize(AUTO_SLOT_COUNT)
		return
	equip_auto_skill(skill_id)

func _new_unlocks(track: String, previous: int, current: int) -> Array[Dictionary]:
	var unlocks: Array[Dictionary] = []
	for skill_id: String in SKILL_DEFS:
		var definition: Dictionary = SKILL_DEFS[skill_id]
		var target := int(definition.level)
		if String(definition.track) == track and previous < target and current >= target:
			var description := String(definition.condition)
			if not bool(definition.get("implemented", false)):
				description += " · 後續實作"
			unlocks.append({"type": "unlock", "track": track, "level": target, "skill_id": skill_id, "name": String(definition.name), "description": description})
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

func _hero_max_hp() -> float:
	return _stat_value("hp", 100.0)

func _hero_max_mp() -> float:
	return _stat_value("mp", 0.0)

func _attack_power() -> float:
	return _stat_value("attack", 9.5)

func _defense() -> float:
	return _stat_value("defense", 2.0)

func _current_attack_interval() -> float:
	return AUTO_ATTACK_INTERVAL / (1.0 + _stat_value("attack_speed", 0.0))
