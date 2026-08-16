extends SceneTree

const CombatModelScript = preload("res://scripts/combat_model.gd")
const BattlefieldScript = preload("res://scripts/battlefield.gd")
var failures := 0

func _init() -> void:
	call_deferred("_run_tests")

func _run_tests() -> void:
	_test_auto_attack_and_momentum()
	_test_training_growth_and_locked_tracks()
	_test_magic_sword_marks_and_auto_attack()
	_test_burning_cycle()
	_test_flame_burst_slash()
	_test_magic_sword_release()
	_test_four_mechanics_coexist()
	_test_skill_damage_scales_with_training()
	_test_physical_milestone_sequences()
	_test_secondary_elements_and_resonance()
	_test_elemental_boundary_and_mark_retention()
	_test_magic_specialization_and_minor_resonance()
	_test_advanced_release_cycle()
	_test_elemental_fusion()
	_test_magic_sword_manifestation()
	_test_magic_sword_complete_release()
	_test_holy_seal_cycle()
	_test_faith_active_cycle_and_divine_grace()
	_test_faith_branches_and_milestones()
	_test_command_momentum_and_follow_up()
	_test_ally_recruitment_and_auto_attack()
	_test_command_skills_and_branches()
	_test_command_milestones()
	_test_six_mechanics_coexist()
	_test_base_heavy_strike_and_stream_modifiers()
	_test_remaining_heart_refund()
	_test_armor_flash_and_auto_fallback()
	_test_one_slash_mastery()
	_test_execute_slash_condition()
	_test_martial_branches()
	_test_boss_spawn()
	_test_enemy_archetypes_and_route_rhythm()
	_test_journey_choice_controls_next_area()
	_test_return_blade_auto_counter()
	_test_guard_stance_window()
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
	_test_auto_tactic_conditions()
	_test_battlefield_impact_tiers()
	_test_playable_pace()
	await _test_navigation()
	if failures > 0:
		printerr("Godot tests failed: %d" % failures)
		quit(1)
	else:
		print("Godot tests passed: 55")
		quit(0)

func _test_auto_attack_and_momentum() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 10
	model.enemy_hp = 999.0
	var before: float = model.momentum
	var events: Array[Dictionary] = model.step(CombatModelScript.AUTO_ATTACK_INTERVAL + 0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "attack"), "沒有輸入時也必須自動普攻")
	_expect(model.momentum > before, "時間與普攻必須累積勢")
	_expect(model._current_attack_interval() <= 0.55, "取消點擊攻擊後，基礎 AUTO 節奏必須保持高速")
	model.training.agility = 200
	model.youren = CombatModelScript.MAX_YOUREN
	model.shadowless_remaining = 3.0
	_expect(model._current_attack_interval() >= CombatModelScript.MIN_AUTO_ATTACK_INTERVAL, "極限攻速仍必須保留最低可辨識間隔")

func _test_battlefield_impact_tiers() -> void:
	var battlefield = BattlefieldScript.new()
	_expect(battlefield.impact_tier_for_source("attack") == "light", "普通攻擊必須使用輕量命中回饋")
	_expect(battlefield.impact_tier_for_source("critical_attack") == "medium", "暴擊必須使用中量命中回饋")
	_expect(battlefield.impact_tier_for_source("heavy_strike_base") == "medium", "基礎重擊不可使用極勢等級的重型回饋")
	_expect(battlefield.impact_tier_for_source("heavy_strike_extreme") == "heavy", "滿勢重擊必須使用重型命中回饋")
	_expect(battlefield.impact_tier_for_source("heavy_strike_swift") == "medium", "敏捷迅擊必須使用中量高速回饋")
	_expect(battlefield.impact_tier_for_source("mountain_break") == "heavy", "斷嶽必須使用重型命中回饋")
	battlefield.free()

func _test_training_growth_and_locked_tracks() -> void:
	var model = CombatModelScript.new()
	var before: Dictionary = model.snapshot()
	var points_before: int = model.training_points
	model.spend_training("faith")
	_expect(int(model.training.faith) == 1 and model.hero_mp > 0.0, "信仰操練必須開放並同時成長 HP 與 MP")
	model.spend_training("magic")
	_expect(int(model.training.magic) == 1 and model.hero_mp > 0.0, "魔法操練必須開放並提高目前與最大 MP")
	model.spend_training("martial")
	var after: Dictionary = model.snapshot()
	_expect(int(model.training.martial) == 1 and model.training_points == points_before - 3, "每次有效操練必須消耗 1 點")
	_expect(float(after.hero_max_hp) > float(before.hero_max_hp) and float(after.attack) > float(before.attack) and float(after.defense) > float(before.defense), "任一流派都必須提供共通基礎成長")

func _test_physical_milestone_sequences() -> void:
	for track: String in ["martial", "physique", "agility"]:
		var model = CombatModelScript.new()
		model.training[track] = 14
		model.training_points = 1
		var events: Array[Dictionary] = model.spend_training(track)
		_expect(events.any(func(event: Dictionary) -> bool: return event.type in ["milestone", "unlock"] and int(event.level) == 15), "%s Lv.15 必須發出對應成長事件" % track)
	_expect(CombatModelScript.MARTIAL_MILESTONES.size() == 40, "武藝必須具備完整 Lv.5～200 成長節點")
	_expect(CombatModelScript.PHYSIQUE_MILESTONES.size() == 40, "體術必須具備完整 Lv.5～200 成長節點")
	_expect(CombatModelScript.AGILITY_MILESTONES.size() == 40, "敏捷必須具備完整 Lv.5～200 成長節點")

func _test_magic_sword_marks_and_auto_attack() -> void:
	var model = CombatModelScript.new()
	model.training.magic = 10
	model.hero_mp = model._hero_max_mp()
	model.enemy_hp = 99999.0
	model.enemy_armor = 0.0
	model._events.clear()
	model._basic_attack(false)
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "magic_enchant"), "魔法 Lv.10 後 AUTO 普攻必須觸發魔劍附傷")
	_expect(model.magic_marks == 1, "附魔攻擊必須累積 1 枚魔紋")
	for index in 4:
		model._events.clear()
		model._basic_attack(false)
	_expect(model.magic_marks == 5, "連續五次附魔攻擊必須集滿魔紋")
	model._events.clear()
	model._basic_attack(false)
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "magic_slash"), "滿魔紋後的下一次附魔攻擊必須觸發魔力斬")

func _test_burning_cycle() -> void:
	var model = CombatModelScript.new()
	model.training.magic = 25
	model.hero_mp = model._hero_max_mp()
	model.enemy_hp = 99999.0
	model.enemy_armor = 0.0
	model._events.clear()
	model._basic_attack(false)
	_expect(model.burn_stacks == 1, "魔法 Lv.20 後附魔攻擊必須疊加燃燒")
	var hp_before: float = model.enemy_hp
	var events := model.step(1.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "burn_tick") and model.enemy_hp < hp_before, "燃燒必須每秒造成元素傷害")
	model.magic_marks = 0
	model.burn_stacks = 1
	model.burning_hits = 0
	model._events.clear()
	model._basic_attack(false)
	model._basic_attack(false)
	_expect(model.magic_marks >= 3, "灼紋必須讓連續攻擊燃燒敵人時額外累積魔紋")

func _test_flame_burst_slash() -> void:
	var model = CombatModelScript.new()
	model.training.magic = 40
	model.hero_mp = model._hero_max_mp()
	model.auto_skill_slots[0] = "flame_burst_slash"
	model.magic_marks = 5
	model.burn_stacks = 5
	model.enemy_hp = 99999.0
	model.enemy_armor = 0.0
	var events := model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "flame_burst_slash"), "滿魔紋與滿燃燒時 AUTO 必須施放炎爆斬")
	var burst_events: Array = events.filter(func(event: Dictionary) -> bool: return event.type == "flame_burst_slash")
	_expect(not burst_events.is_empty() and is_equal_approx(float(burst_events[0].damage), model._magic_power() * 4.2 * 1.25 * model._skill_level_multiplier("flame_burst_slash")), "熾燃必須強化滿燃燒炎爆斬")
	_expect(model.magic_marks == 0 and model.burn_stacks == 0 and model.hero_mp < model._hero_max_mp(), "炎爆斬必須消耗魔紋、燃燒與 MP")

func _test_magic_sword_release() -> void:
	var model = CombatModelScript.new()
	model.training.magic = 50
	model.hero_mp = model._hero_max_mp()
	model.auto_skill_slots[0] = "magic_sword_release"
	model.enemy_hp = 99999.0
	var events := model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "magic_sword_release") and model.magic_release_remaining > 0.0, "魔法 Lv.50 必須能由 AUTO 進入魔劍解放")
	model._events.clear()
	model._basic_attack(false)
	_expect(model.magic_marks == 2 and model.burn_stacks == 2, "魔劍解放期間必須加快魔紋與燃燒獲取")

func _test_four_mechanics_coexist() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 100
	model.training.physique = 100
	model.training.agility = 100
	model.training.magic = 50
	model.momentum = 40.0
	model.immovable = 2
	model.youren = 4
	model.magic_marks = 3
	model.hero_mp = model._hero_max_mp()
	model.auto_attack_remaining = 999.0
	model.enemy_attack_remaining = 999.0
	model.step(0.1)
	var snapshot: Dictionary = model.snapshot()
	_expect(float(snapshot.momentum) > 40.0 and int(snapshot.immovable) == 2 and int(snapshot.youren) == 4 and int(snapshot.magic_marks) == 3, "勢、不動、游刃與魔紋必須能同時存在")

func _test_skill_damage_scales_with_training() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 10
	_expect(is_equal_approx(model._skill_level_multiplier("execute_slash"), 1.0), "技能剛解鎖時流派熟練倍率必須為 1")
	model.training.martial = 200
	_expect(is_equal_approx(model._skill_level_multiplier("execute_slash"), 1.68), "Lv.30 技能練到流派 Lv.200 時必須獲得 68% 熟練增傷")
	_expect(is_equal_approx(model._skill_level_multiplier("two_cut"), 1.0), "Lv.200 奧義剛解鎖時不可重複取得熟練增傷")

func _test_secondary_elements_and_resonance() -> void:
	var model = CombatModelScript.new()
	model.training.magic = 100
	model.hero_mp = model._hero_max_mp()
	model.enemy_hp = 999999.0
	model.enemy_armor = 0.0
	_expect(model.select_secondary_element("ice"), "魔法 Lv.70 後必須能選擇冰副元素")
	model._events.clear()
	model._basic_attack(false)
	_expect(model.burn_stacks > 0 and model.frost_stacks > 0, "雙元素附魔必須讓火與所選副元素同時累積")
	model.burn_stacks = 1
	model.frost_stacks = 3
	model.magic_marks = 0
	model._events.clear()
	_expect(model._try_elemental_resonance(), "火與冰達成條件時必須觸發元素共鳴")
	_expect(model.magic_marks == 2 and model.resonance_slash_ready, "Lv.100 魔劍共鳴必須返還魔紋並強化下一次魔力斬")

func _test_elemental_boundary_and_mark_retention() -> void:
	var model = CombatModelScript.new()
	model.training.magic = 150
	model.select_secondary_element("lightning")
	model.select_magic_specialization("ice")
	model.hero_mp = model._hero_max_mp()
	model.magic_marks = 5
	model.enemy_hp = 999999.0
	model.enemy_armor = 0.0
	model.auto_skill_slots[0] = "elemental_boundary_slash"
	var before_timer: float = model.enemy_attack_remaining
	var events := model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "elemental_boundary_slash" and String(event.element) == "ice"), "斷界斬必須依目前專精切換元素效果")
	_expect(model.magic_marks == 3, "Lv.140 魔紋留存必須讓斷界斬只消耗 2 枚魔紋")
	_expect(model.enemy_attack_remaining > before_timer, "冰元素斷界斬必須延緩敵人攻勢")

func _test_magic_specialization_and_minor_resonance() -> void:
	var model = CombatModelScript.new()
	model.training.magic = 160
	model.select_magic_specialization("ice")
	model.enemy_hp = 999999.0
	model.enemy_armor = 0.0
	model._events.clear()
	model._add_frost(5)
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "minor_resonance" and String(event.element) == "ice"), "Lv.160 專精元素滿層時必須自動觸發小型共鳴")

func _test_advanced_release_cycle() -> void:
	var model = CombatModelScript.new()
	model.training.magic = 170
	model.select_secondary_element("ice")
	model.hero_mp = model._hero_max_mp()
	model.magic_release_remaining = 5.0
	model.magic_marks = 5
	model.enemy_hp = 999999.0
	model.enemy_armor = 0.0
	model._events.clear()
	model._basic_attack(false)
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "magic_slash"), "解放期間滿魔紋必須正常觸發魔力斬")
	_expect(model.magic_marks >= 3, "Lv.170 解放循環必須在魔力斬後保留大部分魔紋")

func _test_elemental_fusion() -> void:
	var model = CombatModelScript.new()
	model.training.magic = 180
	model.select_secondary_element("lightning")
	model._events.clear()
	model._trigger_elemental_fusion()
	_expect(model.fusion_remaining == 6.0 and model._events.any(func(event: Dictionary) -> bool: return event.type == "elemental_fusion"), "Lv.180 大型元素爆發後必須取得六秒雙元素融合")

func _test_magic_sword_manifestation() -> void:
	var model = CombatModelScript.new()
	model.training.magic = 190
	model.magic_marks = 5
	model.burn_stacks = 1
	model.enemy_hp = 999999.0
	model.auto_attack_remaining = 999.0
	model.enemy_attack_remaining = 999.0
	var events := model.step(0.01)
	_expect(model._magic_manifest_active() and events.any(func(event: Dictionary) -> bool: return event.type == "magic_sword_manifestation"), "Lv.190 滿魔紋且敵人帶異常時必須進入魔劍顯現")

func _test_magic_sword_complete_release() -> void:
	var model = CombatModelScript.new()
	model.training.magic = 200
	model.select_secondary_element("lightning")
	model.select_magic_specialization("fire")
	model.hero_mp = model._hero_max_mp()
	model.enemy_hp = 999999.0
	model.auto_skill_slots[0] = "magic_sword_complete_release"
	var events := model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "magic_sword_complete_release") and model.complete_release_remaining > 0.0, "魔法 Lv.200 必須能自動施放魔劍完全解放")
	model._events.clear()
	model._basic_attack(false)
	_expect(model.magic_marks >= 3 and model.burn_stacks >= 3 and model.lightning_stacks >= 3, "完全解放必須高速生成魔紋並自動附著雙元素")

func _test_holy_seal_cycle() -> void:
	var model = CombatModelScript.new()
	model.training.faith = 30
	model.hero_mp = model._hero_max_mp()
	model.enemy_hp = 999999.0
	model.enemy_armor = 0.0
	for index in 6:
		model._events.clear()
		model._basic_attack(false)
	_expect(model.holy_seals >= 2, "信仰 Lv.10 後連續聖劍攻擊必須穩定累積聖印")
	model.hero_hp = model._hero_max_hp() * 0.5
	model._events.clear()
	model._try_grace_heal()
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "grace") and model.hero_hp > model._hero_max_hp() * 0.5, "恩典必須在低血時自動消耗聖印治療")
	_expect(model.holy_shield > 0.0, "Lv.25 恩典治療必須同時產生護盾")

func _test_faith_active_cycle_and_divine_grace() -> void:
	var model = CombatModelScript.new()
	model.training.faith = 200
	model.hero_mp = model._hero_max_mp()
	model.holy_seals = 5
	model.enemy_hp = 999999.0
	model.enemy_armor = 0.0
	model.auto_skill_slots[0] = "holy_sword_descent"
	var events := model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "holy_sword_descent") and model.holy_descent_remaining > 0.0, "信仰 Lv.200 滿聖印時必須自動施放聖劍降臨")
	model.holy_seals = 5
	model.hero_hp = 1.0
	model.holy_shield = 0.0
	model._events.clear()
	_expect(model._trigger_divine_grace(), "滿聖印承受致命傷害時必須觸發神恩")
	_expect(model.hero_hp > 1.0 and model.holy_shield > 0.0 and model.holy_seals == 0, "神恩必須消耗聖印、回復生命並展開護盾")

func _test_faith_branches_and_milestones() -> void:
	var model = CombatModelScript.new()
	model.training.faith = 150
	_expect(model.select_faith_branch("radiance") and model.faith_branch == "radiance", "信仰 Lv.150 必須能選擇光耀專精")
	_expect(model.select_faith_branch("guardian") and model.select_faith_branch("grace"), "守護與恩典專精必須可隨時切換測試")
	_expect(CombatModelScript.FAITH_MILESTONES.size() == 40, "信仰必須具備完整 Lv.5～200 成長節點")

func _test_command_momentum_and_follow_up() -> void:
	var model = CombatModelScript.new()
	model.training.command = 100
	model.enemy_hp = 999999.0
	model.enemy_armor = 0.0
	for index in 20:
		model._events.clear()
		model._basic_attack(false)
	_expect(model.military_momentum > 0.0, "統御 Lv.10 後主角與友軍行動必須累積軍勢")
	_expect(model._ally_count() >= 2, "統御成長必須增加可參與連攜的友軍")
	model._events.clear()
	for index in 30:
		model._try_command_follow_up("test")
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "coordinated_pursuit"), "協同追擊必須讓主角出劍後的友軍回應可見")

func _test_ally_recruitment_and_auto_attack() -> void:
	var model = CombatModelScript.new()
	model.training.command = 9
	model.training_points = 1
	var unlock_events := model.spend_training("command")
	_expect(unlock_events.any(func(event: Dictionary) -> bool: return event.type == "ally_joined" and String(event.name) == "王國步兵"), "統御 Lv.10 必須明確通知王國步兵入隊")
	_expect(model._ally_count() == 1 and model._unlocked_allies() == ["infantry"], "統御 Lv.10 必須實際擁有第一位友軍")
	model.enemy_hp = 999999.0
	model.enemy_armor = 0.0
	model.auto_attack_remaining = 999.0
	model.enemy_attack_remaining = 999.0
	model.ally_attack_remaining = 0.0
	var battle_events := model.step(0.01)
	_expect(battle_events.any(func(event: Dictionary) -> bool: return event.type == "ally_attack" and String(event.name) == "王國步兵"), "入隊後的王國步兵必須在戰場上定時自動攻擊")
	_expect(model.military_momentum > 0.0, "友軍自動攻擊必須為統御流累積軍勢")
	model.training.command = 80
	_expect(model._ally_count() == 2, "統御 Lv.80 必須明確解鎖第二位友軍王國斥候")

func _test_command_skills_and_branches() -> void:
	var model = CombatModelScript.new()
	model.training.command = 200
	model.enemy_hp = 999999.0
	model.enemy_armor = 30.0
	model.military_momentum = 100.0
	model.auto_skill_slots[0] = "ten_thousand_armies_one_sword"
	var events := model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "ten_thousand_armies_one_sword" and int(event.allies) == 4), "統御 Lv.200 必須讓所有友軍回應萬軍一劍")
	_expect(model.select_command_branch("vanguard") and model.select_command_branch("formation") and model.select_command_branch("orders"), "統御三種專精必須可隨時切換測試")

func _test_command_milestones() -> void:
	_expect(CombatModelScript.COMMAND_MILESTONES.size() == 40, "統御必須具備完整 Lv.5～200 成長節點")
	var model = CombatModelScript.new()
	model.training.command = 14
	model.training_points = 1
	var events := model.spend_training("command")
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "milestone" and int(event.level) == 15), "統御 Lv.15 必須發出對應成長事件")

func _test_six_mechanics_coexist() -> void:
	var model = CombatModelScript.new()
	for track: String in CombatModelScript.TRAINING_ORDER:
		model.training[track] = 100
	model.momentum = 40.0
	model.immovable = 2
	model.youren = 4
	model.magic_marks = 3
	model.holy_seals = 2
	model.military_momentum = 55.0
	model.hero_hp = model._hero_max_hp()
	model.auto_attack_remaining = 999.0
	model.enemy_attack_remaining = 999.0
	model.step(0.1)
	var snapshot: Dictionary = model.snapshot()
	_expect(float(snapshot.momentum) > 40.0 and int(snapshot.immovable) == 2 and int(snapshot.youren) == 4 and int(snapshot.magic_marks) == 3 and int(snapshot.holy_seals) == 2 and float(snapshot.military_momentum) == 55.0, "六流派核心機制必須能同時存在且各自獨立運作")

func _test_base_heavy_strike_and_stream_modifiers() -> void:
	var recruit = CombatModelScript.new()
	_expect(recruit.skill_is_unlocked("heavy_strike"), "Lv.1 必須直接解鎖基礎重擊")
	_expect(recruit.auto_skill_slots.has("heavy_strike"), "基礎重擊必須預設裝入 AUTO")
	recruit.enemy_hp = 9999.0
	recruit.skill_cooldowns.clear()
	var events: Array[Dictionary] = recruit.step(0.01)
	var base_hits := events.filter(func(event: Dictionary) -> bool: return event.type == "heavy_strike")
	_expect(not base_hits.is_empty(), "戰鬥開始後 AUTO 必須施放基礎重擊")
	_expect(is_equal_approx(float(recruit.skill_cooldowns.heavy_strike), 4.5), "基礎重擊冷卻必須維持 4.5 秒快節奏")
	var martial = CombatModelScript.new()
	martial.training.martial = 10
	martial.momentum = 100.0
	martial.enemy_hp = 9999.0
	martial.skill_cooldowns.clear()
	events = martial.step(0.01)
	var martial_hits := events.filter(func(event: Dictionary) -> bool: return event.type == "heavy_strike")
	_expect(not martial_hits.is_empty() and float(martial_hits[0].damage) > float(base_hits[0].damage), "武藝必須以勢強化同一招重擊")
	_expect(String(martial_hits[0].name) == "極勢重擊" and is_equal_approx(float(martial_hits[0].momentum_ratio), 1.0), "滿勢重擊必須送出極勢名稱與演出強度")
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "momentum_pierce"), "高勢重擊必須顯示破甲回饋")
	_expect(is_equal_approx(martial.momentum, 100.0), "基礎重擊的武藝改造不應把勢直接消耗掉")
	var hybrid = CombatModelScript.new()
	hybrid.training.martial = 10
	hybrid.training.physique = 10
	hybrid.training.agility = 10
	hybrid.training.magic = 10
	_expect(hybrid.heavy_strike_modifiers().size() == 4 and hybrid.skill_display_name("heavy_strike") == "複合重擊", "四種訓練必須能同時改造重擊")
	hybrid.youren = 5
	_expect(hybrid._heavy_strike_cooldown() < 4.5 and hybrid._heavy_strike_cooldown() >= 2.5, "敏捷必須縮短重擊冷卻，但保留 2.5 秒下限")
	var agile = CombatModelScript.new()
	agile.training.agility = 10
	agile.youren = 5
	agile.enemy_hp = 9999.0
	agile.skill_cooldowns.clear()
	events = agile.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "damage" and event.source == "heavy_strike_swift"), "敏捷改造後的重擊必須使用迅擊回饋")
	agile.skill_cooldowns.heavy_strike = 999.0
	agile.auto_attack_remaining = 0.0
	events = agile.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "attack" and int(event.youren) == 5), "滿游刃普攻必須把高速層數送給戰場演出")

func _test_guard_stance_window() -> void:
	var model = CombatModelScript.new()
	model.training.physique = 10
	model.auto_skill_slots[1] = "guard_stance"
	model.step(0.01)
	_expect(model.guard_stance_remaining > 3.9, "體術 Lv.10 的守勢必須自動開啟 4 秒格擋窗口")
	_expect(is_equal_approx(float(model.skill_cooldowns.guard_stance), 10.0), "守勢冷卻必須為 10 秒")
	_expect(is_equal_approx(model._block_chance(), 0.44), "Lv.10 守勢期間普通格擋率必須提高到 44%")
	_expect(is_equal_approx(model._perfect_block_chance(), 0.09), "Lv.10 守勢期間完美格擋率必須提高到 9%")
	model.immovable = CombatModelScript.MAX_IMMOVABLE
	model.guard_stance_remaining = 0.0
	model.skill_cooldowns.clear()
	_expect(not model._can_cast("guard_stance"), "不動滿層時 AUTO 不應浪費守勢")

func _test_remaining_heart_refund() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 130
	model.auto_skill_slots[0] = "armor_flash"
	model.enemy_hp = 9999.0
	model.enemy_armor = 30.0
	model.momentum = 70.0
	var events: Array[Dictionary] = model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "remaining_heart"), "Lv.130 一刀未擊殺時必須觸發殘心")
	_expect(model.momentum >= 20.0, "殘心必須返還勢")

func _test_armor_flash_and_auto_fallback() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 60
	model.auto_skill_slots[0] = "armor_flash"
	model.auto_skill_slots[1] = "heavy_strike"
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
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "heavy_strike"), "第一順位條件不符時必須往後判斷基礎重擊")

func _test_one_slash_mastery() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 100
	model.auto_skill_slots[0] = "armor_flash"
	model.enemy_hp = 99999.0
	model.enemy_armor = 30.0
	model.momentum = 100.0
	var events: Array[Dictionary] = model.step(0.01)
	var slash := events.filter(func(event: Dictionary) -> bool: return event.type == "armor_flash")
	_expect(not slash.is_empty() and is_equal_approx(float(slash[0].mastery), 1.85), "Lv.100 滿勢出刀必須疊加蓄勢與極意增傷")

func _test_execute_slash_condition() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 30
	model.auto_skill_slots[0] = "execute_slash"
	model.auto_skill_slots[1] = "heavy_strike"
	model.enemy_max_hp = 100.0
	model.enemy_hp = 25.0
	model.enemy_armor = 0.0
	model.momentum = 70.0
	var events: Array[Dictionary] = model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "execute_slash"), "敵人生命低於 25% 時必須優先斷首")

func _test_martial_branches() -> void:
	var execution = CombatModelScript.new()
	execution.training.martial = 150
	_expect(execution.select_martial_branch("execution"), "Lv.150 必須能選擇極斬專精")
	execution.enemy_max_hp = 100.0
	execution.enemy_hp = 20.0
	var normal_multiplier := execution._martial_slash_multiplier("execute_slash", 70.0)
	execution.select_martial_branch("army_break")
	execution.enemy_is_boss = true
	var boss_multiplier := execution._martial_slash_multiplier("mountain_break", 90.0)
	_expect(normal_multiplier > 1.5, "斬首專精必須強化低血斬殺")
	_expect(boss_multiplier > 1.3, "破軍專精必須強化 Boss 一刀")
	_expect(execution.select_martial_branch("chain_slash"), "連斬專精必須可以切換")

func _test_boss_spawn() -> void:
	var model = CombatModelScript.new()
	model.stage = 10
	model._spawn_enemy()
	_expect(model.enemy_is_boss and model.enemy_armor >= CombatModelScript.HIGH_ARMOR_THRESHOLD, "每 10 戰首領必須具備高護甲並啟用破甲需求")

func _test_enemy_archetypes_and_route_rhythm() -> void:
	var model = CombatModelScript.new()
	var expected := {2: "raider", 4: "brute", 5: "shield", 7: "caster", 10: "boss"}
	for target_stage: int in expected:
		model.stage = target_stage
		model._spawn_enemy()
		_expect(model.enemy_archetype == String(expected[target_stage]), "路段 %d 必須出現預定敵人類型" % target_stage)
	model.stage = 2
	model._spawn_enemy()
	var raider_interval := model._enemy_attack_interval()
	model.stage = 4
	model._spawn_enemy()
	_expect(model._enemy_attack_interval() > raider_interval, "巨槌重兵必須比快攻斥候更慢出手")
	_expect(model._attack_type_for_count(2) == "heavy", "巨槌重兵必須穩定使用重擊")
	model.stage = 7
	model._spawn_enemy()
	_expect(model._attack_type_for_count(1) == "area" and model._attack_type_for_count(3) == "sure_hit", "咒術師必須以範圍與必中術攻擊")
	model.stage = 9
	model._spawn_enemy()
	_expect(model.enemy_is_elite and model._route_phase() == "危機", "首領前必須有精英危機戰")

func _test_journey_choice_controls_next_area() -> void:
	var model = CombatModelScript.new()
	model.stage = 10
	model._spawn_enemy()
	model._enemy_defeated()
	_expect(model.awaiting_journey_choice, "Boss 擊敗後必須暫停並等待一次旅途抉擇")
	_expect(model.step(1.0).is_empty(), "旅途抉擇期間 AUTO 戰鬥不可偷偷推進")
	var events: Array[Dictionary] = model.choose_journey_route("mountain")
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "journey_selected"), "選擇路線後必須送出下一區提示")
	_expect(model.area_number == 2 and model.stage == 11 and model.journey_route == "mountain", "旅途抉擇必須套用到下一個完整十戰區域")
	_expect(model.enemy_archetype == "raider" and model._enemy_display_name() == "裂牙獵狼", "山道路線必須改變敵人配置與名稱")
	_expect(not model.awaiting_journey_choice, "完成路線選擇後必須恢復 AUTO 戰鬥")

func _test_return_blade_auto_counter() -> void:
	var model = CombatModelScript.new()
	model.training.physique = 30
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
	model.training.physique = 10
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
	model.training.physique = 50
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
	shock.select_physique_branch("borrowed_force")
	shock.enemy_hp = 99999.0
	shock.enemy_attack_count = 4
	shock._events.clear()
	shock._enemy_attack("perfect")
	_expect(shock._events.any(func(event: Dictionary) -> bool: return event.type == "shock_return"), "震返必須反制敵方重擊")
	var inch = CombatModelScript.new()
	inch.training.physique = 150
	inch.select_physique_branch("return_blade")
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
	model.training.agility = 15
	model.enemy_hp = 99999.0
	model._events.clear()
	for index in 2:
		model._basic_attack(false)
	_expect(model.youren == 1 and model.flow_hits == 0, "連續攻擊 2 次未被命中必須獲得 1 層游刃")
	model._resolve_dodge("normal", false)
	_expect(model.youren == 3, "成功閃避必須獲得 2 層游刃")
	model.youren = 5
	model._lose_youren("normal")
	_expect(model.youren == 4, "受到普通命中只失去 1 層游刃")
	model._lose_youren("heavy")
	_expect(model.youren == 0, "受到重擊必須打斷全部游刃與連擊")
	model.youren = 1
	_expect(is_equal_approx(model._youren_attack_speed_bonus(), 0.03), "每層游刃必須線性提供 3% 攻速")
	model.youren = 3
	_expect(is_equal_approx(model._youren_attack_speed_bonus(), 0.09) and is_equal_approx(model._youren_critical_bonus(), 0.03), "三層游刃必須提供 9% 攻速與 3% 暴擊")
	model.youren = 4
	model._events.clear()
	model._add_youren(1, "test")
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "flow_state_entered"), "進入五層時必須觸發游刃有餘事件")
	model.enemy_hp = 99999.0
	model._events.clear()
	model._basic_attack(false)
	model._basic_attack(false)
	model._basic_attack(false)
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "swift_cut"), "Lv.15 游刃有餘時每三次普攻必須追加疾斬")
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
	swallow.select_agility_branch("chase_wind")
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
	var events: Array[Dictionary] = model.step(3.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "shadowless"), "滿游刃維持三秒必須進入無影")
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
	model.auto_skill_slots[1] = "heavy_strike"
	model.enemy_hp = 99999.0
	model.momentum = 100.0
	var events: Array[Dictionary] = model.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "two_cut"), "第一順位奧義在滿勢時必須優先施放")
	_expect(not events.any(func(event: Dictionary) -> bool: return event.type == "heavy_strike"), "同一判斷週期不可再施放後順位技能")

func _test_auto_slot_configuration() -> void:
	var model = CombatModelScript.new()
	model.training.martial = 200
	_expect(model.unequip_auto_skill(0), "基礎重擊必須能從 AUTO 卸下")
	_expect(model.equip_auto_skill("heavy_strike", 0), "基礎重擊必須能重新裝備")
	_expect(model.equip_auto_skill("two_cut", 1), "奧義必須能裝入第二格")
	_expect(model.move_auto_skill(1, -1) and model.auto_skill_slots[0] == "two_cut", "AUTO 技能必須能調整優先序")
	_expect(model.unequip_auto_skill(1) and model.auto_skill_slots[1].is_empty(), "AUTO 技能必須能卸下")
	var locked = CombatModelScript.new()
	_expect(not locked.equip_auto_skill("two_cut"), "未解鎖技能不可裝備")

func _test_auto_tactic_conditions() -> void:
	var martial = CombatModelScript.new()
	martial.training.martial = 30
	martial.enemy_hp = 9999.0
	martial.momentum = 70.0
	martial.enemy_max_hp = 100.0
	martial.enemy_hp = 34.0
	martial.set_auto_tactic("execute_slash", "hp35")
	_expect(martial._can_cast("execute_slash"), "斬首戰術必須能改為生命 35% 觸發")
	var physique = CombatModelScript.new()
	physique.training.physique = 30
	physique.enemy_archetype = "brute"
	physique.enemy_attack_count = 1
	physique.enemy_attack_remaining = 0.6
	physique.set_auto_tactic("return_blade", "heavy")
	_expect(physique._can_cast("return_blade"), "返刃必須能保留給下一次重擊")
	var faith = CombatModelScript.new()
	faith.training.faith = 20
	faith.holy_seals = 1
	faith.hero_hp = faith._hero_max_hp() * 0.6
	faith.set_auto_tactic("grace_heal", "hp50")
	faith._events.clear()
	faith._try_grace_heal()
	_expect(not faith._events.any(func(event: Dictionary) -> bool: return event.type == "grace"), "恩典選擇 50% 後不可過早治療")
	faith.hero_hp = faith._hero_max_hp() * 0.49
	faith._try_grace_heal()
	_expect(faith._events.any(func(event: Dictionary) -> bool: return event.type == "grace"), "生命低於設定門檻必須自動治療")

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
	_expect(is_instance_valid(scene.journey_overlay) and scene.journey_buttons.size() == 3, "Boss 後旅途抉擇必須提供三條手機可操作路線")
	_expect(scene.section_overlay.mouse_filter == Control.MOUSE_FILTER_IGNORE, "功能頁透明遮罩不可攔截底部分頁")
	_expect(is_instance_valid(scene.section_scroll), "功能頁內容必須可捲動")
	scene.model.training.martial = 10
	scene.model.training.physique = 30
	scene.model.training.agility = 30
	scene.model.training.magic = 30
	scene.model.training.faith = 30
	scene.model.training.command = 30
	scene.model.momentum = 45.0
	scene.model.immovable = 2
	scene.model.youren = 3
	scene.model.magic_marks = 3
	scene.model.holy_seals = 3
	scene.model.military_momentum = 45.0
	scene._update_hud(scene.model.snapshot())
	_expect(scene.momentum_head.visible and scene.immovable_hud.visible and scene.youren_hud.visible and scene.magic_hud.visible and scene.faith_hud.visible and scene.command_hud.visible, "六流派機制同時存在時，HUD 必須完整顯示")
	scene._switch_page("character")
	await process_frame
	_expect(scene.current_page == "character" and scene.section_overlay.visible, "角色頁必須能開啟並暫停戰鬥")
	_expect(not scene.top_panel.visible and not scene.combat_panel.visible, "非戰鬥頁不可保留敵人與戰鬥 HUD")
	scene._switch_page("skills")
	await process_frame
	_expect(scene.current_page == "skills", "技能頁必須可切換")
	_expect(scene.skill_tab_buttons.size() == 7, "技能頁必須提供 AUTO 與六流派共七個分頁")
	scene._select_skill_tab("faith")
	await process_frame
	_expect(scene.current_skill_tab == "faith" and scene.skill_tab_buttons.has("command"), "信仰與統御必須提供完整獨立分頁")
	_expect(scene.section_box.get_child_count() > 10, "信仰分頁必須顯示核心技能、專精與成長路線")
	scene._select_skill_tab("command")
	await process_frame
	_expect(scene.current_skill_tab == "command" and scene.section_box.get_child_count() > 10, "統御分頁必須顯示完整 Lv.1～200 路線")
	scene._select_skill_tab("martial")
	await process_frame
	_expect(scene.current_skill_tab == "martial", "已完成流派必須能獨立切換成長路線")
	scene._switch_page("combat")
	await process_frame
	_expect(not scene.section_overlay.visible, "返回戰鬥頁必須關閉功能面板")
	scene.queue_free()
	await process_frame

func _expect(condition: bool, message: String) -> void:
	if not condition:
		failures += 1
		printerr("FAIL: %s" % message)
