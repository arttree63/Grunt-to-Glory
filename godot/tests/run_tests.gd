extends SceneTree

const CombatModelScript = preload("res://scripts/combat_model.gd")
var failures := 0

func _init() -> void:
	call_deferred("_run_tests")

func _run_tests() -> void:
	_test_auto_attack_and_momentum()
	_test_training_growth_and_locked_tracks()
	_test_heavy_slash_unlock_and_auto()
	_test_remaining_heart_refund()
	_test_ultimate_priority()
	_test_auto_slot_configuration()
	_test_playable_pace()
	await _test_navigation()
	if failures > 0:
		printerr("Godot tests failed: %d" % failures)
		quit(1)
	else:
		print("Godot tests passed: 8")
		quit(0)

func _test_auto_attack_and_momentum() -> void:
	var model = CombatModelScript.new()
	model.enemy_hp = 999.0
	var before: float = model.momentum
	var events: Array[Dictionary] = model.step(CombatModelScript.AUTO_ATTACK_INTERVAL + 0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "attack"), "沒有輸入時也必須自動普攻")
	_expect(model.momentum > before, "時間與普攻必須累積勢")

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
	_expect(scene.section_overlay.mouse_filter == Control.MOUSE_FILTER_IGNORE, "功能頁透明遮罩不可攔截底部分頁")
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
