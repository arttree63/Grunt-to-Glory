extends SceneTree

const CombatModelScript = preload("res://scripts/combat_model.gd")
var failures := 0

func _init() -> void:
	call_deferred("_run_tests")

func _run_tests() -> void:
	_test_auto_attack_and_momentum()
	_test_manual_attack_and_shared_cooldown()
	_test_training_growth_and_locked_tracks()
	_test_heavy_slash_unlock_and_auto()
	_test_remaining_heart_refund()
	_test_armor_flash_and_auto_fallback()
	_test_one_slash_mastery()
	_test_execute_slash_condition()
	_test_martial_branches()
	_test_boss_spawn()
	_test_return_blade_auto_counter()
	_test_immovable_layers()
	_test_borrow_force_and_collapse_counter()
	_test_physique_branches()
	_test_heaven_return()
	_test_momentum_and_immovable_coexist()
	_test_dodge_stat_and_attack_modifiers()
	_test_swift_step_auto_dodge()
	_test_youren_gain_and_break()
	_test_shadow_assault_and_opening()
	_test_agility_branches()
	_test_shadowless()
	_test_three_mechanics_coexist()
	_test_physique_playable_pace()
	_test_agility_playable_pace()
	_test_ultimate_priority()
	_test_auto_slot_configuration()
	_test_playable_pace()
	await _test_navigation()
	if failures > 0:
		printerr("Godot tests failed: %d" % failures)
		quit(1)
	else:
		print("Godot tests passed: 29")
		quit(0)

func _test_auto_attack_and_momentum() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 1
	model.enemy_hp = 999.0
	var before: float = model.momentum
	var events: Array[Dictionary] = model.step(CombatModelScript.AUTO_ATTACK_INTERVAL + 0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "attack"), "沒有輸入時也必須自動普攻")
	_expect(model.momentum > before, "時間與普攻必須累積勢")

func _test_manual_attack_and_shared_cooldown() -> void:
	var model = CombatModelScript.new()
	model.enemy_hp = 9999.0
	var auto_before: float = model.auto_attack_remaining
	var first: Array[Dictionary] = model.manual_attack()
	_expect(first.any(func(event: Dictionary) -> bool: return event.type == "manual_attack"), "開場攻擊圖示必須能立即造成手動斬擊傷害")
	_expect(is_equal_approx(model.auto_attack_remaining, auto_before), "手動斬擊不可重置或延後 AUTO 普攻")
	var repeated: Array[Dictionary] = model.manual_attack()
	_expect(repeated.is_empty(), "手動攻擊冷卻中不可重複出刀")
	var automatic: Array[Dictionary] = model.step(maxf(model._current_attack_interval(), model._manual_attack_cooldown()) + 0.01)
	_expect(automatic.any(func(event: Dictionary) -> bool: return event.type == "attack"), "手動斬擊冷卻期間 AUTO 普攻仍必須獨立運作")
	_expect(model.manual_attack().any(func(event: Dictionary) -> bool: return event.type == "manual_attack"), "冷卻結束後攻擊圖示必須再次可用")

func _test_training_growth_and_locked_tracks() -> void:
	var model = CombatModelScript.new()
	var before: Dictionary = model.snapshot()
	var points_before: int = model.training_points
	_expect(model.spend_training("magic").is_empty(), "未完成流派不可消耗點數")
	model.spend_training("martial")
	var after: Dictionary = model.snapshot()
	_expect(int(model.training.martial) == 1 and model.training_points == points_before - 1, "武藝每級必須消耗 1 點")
	_expect(float(after.hero_max_hp) > float(before.hero_max_hp) and float(after.attack) > float(before.attack) and float(after.defense) > float(before.defense), "任一流派都必須提供共通基礎成長")

func _test_heavy_slash_unlock_and_auto() -> void:
	var model = CombatModelScript.new()
	model.training_points = 20
	for index in 10:
		model.spend_training("martial")
	_expect(model.skill_is_unlocked("heavy_slash"), "武藝 Lv.10 必須解鎖重斬")
	_expect(model.auto_skill_slots.has("heavy_slash"), "解鎖的第一個主動技能必須自動裝入 AUTO")
	model.enemy_hp = 999.0
	model.momentum = 50.0
	var events: Array[Dictionary] = model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "heavy_slash"), "勢達 50 時 AUTO 必須施放重斬")
	_expect(model.momentum < 1.0, "重斬必須消耗 50 點勢")

func _test_remaining_heart_refund() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 30
	model.auto_skill_slots[0] = "heavy_slash"
	model.enemy_hp = 9999.0
	model.momentum = 50.0
	var events: Array[Dictionary] = model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "remaining_heart"), "Lv.30 一刀未擊殺時必須觸發殘心")
	_expect(model.momentum >= 20.0, "殘心必須返還勢")

func _test_armor_flash_and_auto_fallback() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 50
	model.auto_skill_slots[0] = "armor_flash"
	model.auto_skill_slots[1] = "heavy_slash"
	model.enemy_hp = 9999.0
	model.enemy_armor = 25.0
	model.momentum = 70.0
	var events: Array[Dictionary] = model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "armor_flash"), "高護甲敵人必須優先觸發破甲一閃")
	_expect(model.enemy_armor == 13.0, "破甲一閃必須降低 12 點護甲")
	model.skill_cooldowns.clear()
	model.enemy_armor = 5.0
	model.momentum = 70.0
	events = model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "heavy_slash"), "第一順位條件不符時必須往後判斷重斬")

func _test_one_slash_mastery() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 100
	model.auto_skill_slots[0] = "heavy_slash"
	model.enemy_hp = 99999.0
	model.enemy_armor = 0.0
	model.momentum = 100.0
	var events: Array[Dictionary] = model.step(0.01)
	var slash := events.filter(func(event: Dictionary) -> bool: return event.type == "heavy_slash")
	_expect(not slash.is_empty() and is_equal_approx(float(slash[0].mastery), 1.6), "Lv.100 滿勢出刀必須獲得 60% 極意增傷")

func _test_execute_slash_condition() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 150
	model.auto_skill_slots[0] = "execute_slash"
	model.auto_skill_slots[1] = "heavy_slash"
	model.enemy_max_hp = 100.0
	model.enemy_hp = 25.0
	model.enemy_armor = 0.0
	model.momentum = 70.0
	var events: Array[Dictionary] = model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "execute_slash"), "敵人生命低於 25% 時必須優先斷首")

func _test_martial_branches() -> void:
	var no_beat = CombatModelScript.new()
	no_beat.training.martial = 150
	_expect(no_beat.select_martial_branch("no_beat"), "Lv.150 必須能選擇武藝分支")
	no_beat.enemy_hp = 1.0
	no_beat.enemy_armor = 0.0
	no_beat._auto_attack()
	_expect(no_beat._events.any(func(event: Dictionary) -> bool: return event.type == "no_beat"), "無拍子必須在擊殺後額外回勢")
	var spirit = CombatModelScript.new()
	spirit.training.martial = 150
	spirit.select_martial_branch("spirit_focus")
	spirit.enemy_engagement_time = 20.0
	spirit.auto_attack_remaining = 999.0
	spirit.enemy_attack_remaining = 999.0
	spirit.step(1.0)
	_expect(spirit.momentum > 9.0, "氣合必須隨交戰時間提高蓄勢速度")
	var first = CombatModelScript.new()
	first.training.martial = 150
	first.select_martial_branch("first_strike")
	first.enemy_hp = 9999.0
	first.momentum = 70.0
	first.auto_attack_remaining = 999.0
	first.enemy_attack_remaining = 0.0
	var events: Array[Dictionary] = first.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "first_strike"), "先之先必須在敵人出手前觸發")
	_expect(not events.any(func(event: Dictionary) -> bool: return event.type == "hero_hit"), "先之先成功時必須中斷敵人攻擊")

func _test_boss_spawn() -> void:
	var model = CombatModelScript.new()
	model.stage = 10
	model._spawn_enemy()
	_expect(model.enemy_is_boss and model.enemy_armor >= CombatModelScript.HIGH_ARMOR_THRESHOLD, "每 10 戰首領必須具備高護甲並啟用破甲需求")

func _test_return_blade_auto_counter() -> void:
	var model = CombatModelScript.new()
	model.training.physique = 10
	model.auto_skill_slots[0] = "return_blade"
	model.enemy_hp = 9999.0
	model.enemy_attack_remaining = 0.0
	model.auto_attack_remaining = 999.0
	var events: Array[Dictionary] = model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "return_blade"), "敵人即將攻擊時 AUTO 必須準備返刃")
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "block" or event.type == "perfect_block"), "返刃必須保證下一次攻擊被格擋")
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "counter"), "返刃格擋後必須立即反擊")

func _test_immovable_layers() -> void:
	var model = CombatModelScript.new()
	model.training.physique = 30
	model.enemy_hp = 99999.0
	model._events.clear()
	model._enemy_attack("block")
	_expect(model.immovable == 1, "普通格擋必須累積 1 層不動")
	model._enemy_attack("perfect")
	_expect(model.immovable == 3, "完美格擋必須累積 2 層不動且最高為 3")
	model._enemy_attack("none")
	_expect(model.immovable == 2, "未格擋攻擊必須失去 1 層不動")

func _test_borrow_force_and_collapse_counter() -> void:
	var model = CombatModelScript.new()
	model.training.physique = 100
	model.enemy_hp = 99999.0
	model._events.clear()
	model._enemy_attack("perfect")
	var counters: Array = model._events.filter(func(event: Dictionary) -> bool: return event.type == "counter")
	_expect(not counters.is_empty() and float(counters[0].borrowed) > 0.0, "借力必須把格擋減免量轉為反擊傷害")
	model.immovable = 3
	model.auto_skill_slots[0] = "collapse_counter"
	var events: Array[Dictionary] = model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "collapse_counter"), "滿 3 層不動時 AUTO 必須施放不動崩返")
	_expect(model.immovable == 0, "不動崩返必須消耗全部不動")

func _test_physique_branches() -> void:
	var iron = CombatModelScript.new()
	iron.training.physique = 150
	iron.select_physique_branch("iron_wall")
	iron.immovable = 3
	iron.enemy_hp = 99999.0
	iron._events.clear()
	iron._enemy_attack("block")
	_expect(iron._events.any(func(event: Dictionary) -> bool: return event.type == "perfect_block"), "鐵壁必須把滿層時的普通格擋提升為完美格擋")
	var shock = CombatModelScript.new()
	shock.training.physique = 150
	shock.select_physique_branch("shock_return")
	shock.enemy_hp = 99999.0
	shock.enemy_attack_count = 4
	shock._events.clear()
	shock._enemy_attack("block")
	_expect(shock._events.any(func(event: Dictionary) -> bool: return event.type == "shock_return"), "震返必須反制敵方重擊")
	var inch = CombatModelScript.new()
	inch.training.physique = 150
	inch.select_physique_branch("inch_power")
	inch.enemy_hp = 99999.0
	inch._events.clear()
	inch._enemy_attack("perfect")
	var first_damage := float(inch._events.filter(func(event: Dictionary) -> bool: return event.type == "counter")[0].damage)
	inch._events.clear()
	inch._enemy_attack("perfect")
	var second_damage := float(inch._events.filter(func(event: Dictionary) -> bool: return event.type == "counter")[0].damage)
	_expect(second_damage > first_damage, "寸勁必須讓連續反擊逐次增傷")

func _test_heaven_return() -> void:
	var model = CombatModelScript.new()
	model.training.physique = 200
	model.immovable = 3
	model.enemy_hp = 99999.0
	model.enemy_attack_count = 4
	model._events.clear()
	model._enemy_attack()
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "heaven_return"), "滿層不動承受重擊時必須觸發不動返天")
	_expect(model.immovable == 0 and model.hero_hp > 0.0, "不動返天必須消耗不動並避免被重擊擊倒")

func _test_momentum_and_immovable_coexist() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 100
	model.training.physique = 100
	model.momentum = 40.0
	model.immovable = 2
	model.auto_attack_remaining = 999.0
	model.enemy_attack_remaining = 999.0
	model.step(1.0)
	var snapshot: Dictionary = model.snapshot()
	_expect(float(snapshot.momentum) > 40.0 and int(snapshot.immovable) == 2, "勢與不動必須能同時存在且各自獨立運作")

func _test_dodge_stat_and_attack_modifiers() -> void:
	var model = CombatModelScript.new()
	var base_dodge: float = model._dodge_chance()
	var base_attack_interval: float = model._current_attack_interval()
	model.training.agility = 20
	_expect(is_equal_approx(model._agility_action_speed_bonus(), 0.24), "敏捷前 20 級必須先提供明顯攻速收益")
	_expect(model._current_attack_interval() < base_attack_interval, "敏捷攻速必須直接加快 AUTO 普通攻擊")
	_expect(is_equal_approx(model._critical_chance(), 0.09), "敏捷 Lv.20 必須同時提供穩定暴擊收益")
	_expect(is_equal_approx(model._dodge_chance(), 0.08), "敏捷前期閃避成長必須低於攻速成長")
	_expect(model._manual_attack_cooldown() < CombatModelScript.MANUAL_ATTACK_BASE_COOLDOWN, "敏捷必須縮短手動攻擊冷卻")
	model.training.agility = 200
	var trained_dodge: float = model._dodge_chance()
	_expect(trained_dodge > base_dodge and trained_dodge <= CombatModelScript.DODGE_CAP, "敏捷必須提高面板閃避率且不能超過上限")
	_expect(is_equal_approx(model._dodge_modifier("normal"), 1.0), "普通攻擊必須完整套用閃避率")
	_expect(is_equal_approx(model._dodge_modifier("area"), 0.55), "範圍攻擊必須降低閃避效果")
	_expect(is_zero_approx(model._dodge_modifier("sure_hit")), "必中技能不可用普通閃避規避")

func _test_swift_step_auto_dodge() -> void:
	var model = CombatModelScript.new()
	model.training.agility = 50
	model.auto_skill_slots[0] = "swift_step"
	model.enemy_hp = 99999.0
	model.enemy_attack_remaining = 999.0
	model.auto_attack_remaining = 999.0
	var events: Array[Dictionary] = model.step(0.01)
	_expect(model.swift_step_ready and events.any(func(event: Dictionary) -> bool: return event.type == "swift_step_ready"), "瞬步冷卻完成後 AUTO 必須自動進入待發")
	_expect(is_zero_approx(float(model.skill_cooldowns.get("swift_step", 0.0))), "瞬步待發時不可提前開始冷卻")
	model.enemy_attack_remaining = 0.0
	events = model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "swift_step"), "瞬步必須保證閃開下一次普通攻擊並反擊")
	_expect(not events.any(func(event: Dictionary) -> bool: return event.type == "hero_hit"), "瞬步成功時角色不可受到傷害")
	_expect(not model.swift_step_ready and float(model.skill_cooldowns.swift_step) > 0.0, "瞬步只能在成功觸發後開始 5 秒冷卻")
	model.swift_step_ready = true
	model.enemy_attack_count = 10
	model._events.clear()
	model._enemy_attack()
	_expect(model.swift_step_ready and model._events.any(func(event: Dictionary) -> bool: return event.type == "hero_hit"), "必中攻擊不可觸發或消耗瞬步")

func _test_youren_gain_and_break() -> void:
	var model = CombatModelScript.new()
	model.training.agility = 10
	model.enemy_hp = 99999.0
	model._events.clear()
	for index in 4:
		model._basic_attack(false)
	_expect(model.youren == 1 and model.flow_hits == 0, "連續攻擊 4 次未被命中必須獲得 1 層游刃")
	model._resolve_dodge("normal", false)
	_expect(model.youren == 3, "成功閃避必須獲得 2 層游刃")
	model.youren = 5
	model._lose_youren("normal")
	_expect(model.youren == 3, "受到普通命中必須失去 2 層游刃")
	model._lose_youren("heavy")
	_expect(model.youren == 0, "受到重擊必須打斷全部游刃與連擊")
	var finisher = CombatModelScript.new()
	finisher.training.agility = 10
	finisher.enemy_hp = 1.0
	finisher.enemy_armor = 0.0
	finisher._basic_attack(false)
	_expect(finisher.youren == 1, "擊殺敵人必須獲得 1 層游刃")

func _test_shadow_assault_and_opening() -> void:
	var model = CombatModelScript.new()
	model.training.agility = 100
	model.enemy_hp = 99999.0
	model.enemy_armor = 0.0
	model.youren = 3
	model._events.clear()
	model._resolve_dodge("normal", false)
	_expect(model.youren == 5 and model._events.any(func(event: Dictionary) -> bool: return event.type == "shadow_assault"), "Lv.30 滿層游刃閃避後必須觸發影襲")
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "opening"), "Lv.100 閃避後必須揭露乘隙破綻")
	model._events.clear()
	model._deal_damage(100.0, "test")
	var damage_events: Array = model._events.filter(func(event: Dictionary) -> bool: return event.type == "damage")
	_expect(not damage_events.is_empty() and is_equal_approx(float(damage_events[0].amount), 125.0), "乘隙期間必須提高對該敵人的傷害")

func _test_agility_branches() -> void:
	var traceless = CombatModelScript.new()
	traceless.training.agility = 150
	traceless.select_agility_branch("traceless")
	traceless.youren = 5
	traceless.enemy_hp = 99999.0
	traceless._events.clear()
	_expect(traceless._try_dodge_attack("normal", 1.0), "無蹤必須在自然閃避失敗後保住一次普通命中")
	_expect(traceless._events.any(func(event: Dictionary) -> bool: return event.type == "traceless"), "無蹤觸發時必須產生辨識事件")
	var instant = CombatModelScript.new()
	instant.training.agility = 150
	instant.select_agility_branch("instant_kill")
	instant.enemy_hp = 99999.0
	instant.enemy_armor = 0.0
	instant._resolve_dodge("normal", false)
	instant._events.clear()
	instant._auto_attack()
	_expect(instant._events.any(func(event: Dictionary) -> bool: return event.type == "attack" and bool(event.instant_kill)), "瞬殺必須強化閃避後的下一次普攻")
	var swallow = CombatModelScript.new()
	swallow.training.agility = 150
	swallow.select_agility_branch("flying_swallow")
	swallow.enemy_hp = 999999.0
	for index in 20:
		swallow._resolve_dodge("normal", false)
	_expect(swallow._events.any(func(event: Dictionary) -> bool: return event.type == "flying_swallow"), "飛燕必須有機率追加第二次追擊")

func _test_shadowless() -> void:
	var model = CombatModelScript.new()
	model.training.agility = 200
	model.youren = 5
	model.enemy_hp = 99999.0
	model.auto_attack_remaining = 999.0
	model.enemy_attack_remaining = 999.0
	var events: Array[Dictionary] = model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "shadowless"), "滿游刃時必須自動進入奧義無影")
	model._lose_youren("normal")
	_expect(model.youren == 5, "無影期間普通命中不可降低游刃")
	model._lose_youren("heavy")
	_expect(model.youren == 0, "無影仍不可免除重擊造成的節奏中斷")

func _test_three_mechanics_coexist() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 100
	model.training.physique = 100
	model.training.agility = 100
	model.momentum = 40.0
	model.immovable = 2
	model.youren = 4
	model.auto_attack_remaining = 999.0
	model.enemy_attack_remaining = 999.0
	model.step(1.0)
	var snapshot: Dictionary = model.snapshot()
	_expect(float(snapshot.momentum) > 40.0 and int(snapshot.immovable) == 2 and int(snapshot.youren) == 4, "勢、不動與游刃必須能同時存在且各自獨立運作")

func _test_physique_playable_pace() -> void:
	var model = CombatModelScript.new()
	var elapsed := 0.0
	while elapsed < 90.0 and int(model.training.physique) < 10:
		if model.training_points > 0:
			model.spend_training("physique")
		model.step(1.0 / 60.0)
		elapsed += 1.0 / 60.0
	print("Immovable unlock pace: %.1f seconds" % elapsed)
	_expect(int(model.training.physique) >= 10, "體術核心返刃應在 90 秒內解鎖")

func _test_agility_playable_pace() -> void:
	var model = CombatModelScript.new()
	var elapsed := 0.0
	while elapsed < 90.0 and int(model.training.agility) < 10:
		if model.training_points > 0:
			model.spend_training("agility")
		model.step(1.0 / 60.0)
		elapsed += 1.0 / 60.0
	print("Shadow-flow unlock pace: %.1f seconds" % elapsed)
	_expect(int(model.training.agility) >= 10, "敏捷核心游刃應在 90 秒內解鎖")

func _test_ultimate_priority() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 200
	model.auto_skill_slots[0] = "two_cut"
	model.auto_skill_slots[1] = "heavy_slash"
	model.enemy_hp = 99999.0
	model.momentum = 100.0
	var events: Array[Dictionary] = model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "two_cut"), "第一順位奧義在滿勢時必須優先施放")
	_expect(not events.any(func(event: Dictionary) -> bool: return event.type == "heavy_slash"), "同一判斷週期不可再施放後順位技能")

func _test_auto_slot_configuration() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 200
	_expect(model.equip_auto_skill("heavy_slash", 0), "已解鎖主動技能必須能裝備")
	_expect(model.equip_auto_skill("two_cut", 1), "奧義必須能裝入第二格")
	_expect(model.move_auto_skill(1, -1) and model.auto_skill_slots[0] == "two_cut", "AUTO 技能必須能調整優先序")
	_expect(model.unequip_auto_skill(1) and model.auto_skill_slots[1].is_empty(), "AUTO 技能必須能卸下")
	var locked = CombatModelScript.new()
	_expect(not locked.equip_auto_skill("heavy_slash"), "未解鎖技能不可裝備")

func _test_playable_pace() -> void:
	var model = CombatModelScript.new()
	var elapsed := 0.0
	while elapsed < 90.0 and int(model.training.martial) < 10:
		if model.training_points > 0:
			model.spend_training("martial")
		model.step(1.0 / 60.0)
		elapsed += 1.0 / 60.0
	print("One-slash unlock pace: %.1f seconds" % elapsed)
	_expect(int(model.training.martial) >= 10, "武藝首個核心技能應在 90 秒內解鎖")
	_expect(elapsed >= 8.0, "核心技能不應在玩家看懂戰鬥前直接傾倒")

func _test_navigation() -> void:
	var scene: Variant = load("res://main.tscn").instantiate()
	root.add_child(scene)
	await process_frame
	_expect(scene.nav_buttons.size() == 5, "主分頁必須維持五個入口")
	_expect(scene.auto_slot_buttons.size() == 5, "戰鬥 HUD 必須顯示五格 AUTO 優先序")
	_expect(is_instance_valid(scene.manual_attack_button) and not scene.manual_attack_button.disabled, "戰鬥 HUD 必須提供就緒的手動攻擊圖示")
	scene._manual_attack()
	_expect(scene.manual_attack_button.disabled and "s" in scene.manual_attack_button.text, "按下攻擊圖示後必須顯示冷卻並暫停再次攻擊")
	_expect(scene.section_overlay.mouse_filter == Control.MOUSE_FILTER_IGNORE, "功能頁透明遮罩不可攔截底部分頁")
	_expect(is_instance_valid(scene.section_scroll), "功能頁內容必須可捲動")
	scene.model.training.martial = 10
	scene.model.training.physique = 30
	scene.model.training.agility = 30
	scene.model.momentum = 45.0
	scene.model.immovable = 2
	scene.model.youren = 3
	scene._update_hud(scene.model.snapshot())
	_expect(scene.momentum_head.visible and scene.immovable_hud.visible and scene.youren_hud.visible, "勢、不動與游刃同時存在時，HUD 必須同時顯示三種流派狀態")
	scene._switch_page("character")
	await process_frame
	_expect(scene.current_page == "character" and scene.section_overlay.visible, "角色頁必須能開啟並暫停戰鬥")
	_expect(not scene.top_panel.visible and not scene.combat_panel.visible, "非戰鬥頁不可保留敵人與戰鬥 HUD")
	scene._switch_page("skills")
	await process_frame
	_expect(scene.current_page == "skills", "技能頁必須可切換")
	scene._switch_page("combat")
	await process_frame
	_expect(not scene.section_overlay.visible, "返回戰鬥頁必須關閉功能面板")
	scene.queue_free()
	await process_frame

func _expect(condition: bool, message: String) -> void:
	if not condition:
		failures += 1
		printerr("FAIL: %s" % message)
