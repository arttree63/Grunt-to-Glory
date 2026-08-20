extends SceneTree

const CombatModelScript = preload("res://scripts/combat_model.gd")
const BattlefieldScript = preload("res://scripts/battlefield.gd")
var failures := 0

func _init() -> void:
	call_deferred("_run_tests")

func _run_tests() -> void:
	_test_auto_attack_and_momentum()
	_test_training_growth_and_locked_tracks()
	_test_equipment_style_levels_and_unlock_boundary()
	_test_equipment_skill_unlocks_all_tiers()
	_test_equipment_drop_quality_and_enhancement()
	_test_experience_progression()
	_test_shop_loop()
	_test_inheritance_loop()
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
	_test_early_art_choices()
	_test_major_milestone_choices()
	_test_boss_spawn()
	_test_boss_rage_phase()
	_test_enemy_archetypes_and_route_rhythm()
	_test_enemy_traits_and_boss_phases()
	_test_journey_choice_controls_next_area()
	_test_auto_roaming()
	_test_defeat_farms_previous_stage_until_retry()
	_test_frontier_stage_waves()
	_test_area_kills_summon_boss()
	_test_failure_report_keeps_idle_loop()
	_test_boss_fixed_reward_choice()
	_test_slice_metrics_capture_adjustment()
	_test_save_data_roundtrip()
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
	_test_first_area_progression_pace()
	await _test_navigation()
	if failures > 0:
		printerr("Godot tests failed: %d" % failures)
		quit(1)
	else:
		print("Godot tests passed: 74")
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
	model.momentum = CombatModelScript.MAX_MOMENTUM
	model.auto_attack_remaining = 0.0
	var momentum_events: Array[Dictionary] = model.step(0.01)
	_expect(momentum_events.any(func(event: Dictionary) -> bool: return event.type == "momentum_slash" and String(event.name) == "蓄勢・一閃"), "武藝 Lv.10 滿勢後，下一次普攻必須自動轉化為蓄勢一閃")
	_expect(model.momentum < CombatModelScript.MAX_MOMENTUM, "勢斬發動後必須消耗勢，完成 Lv.10 核心循環")
	model.training.agility = 200
	model.youren = CombatModelScript.MAX_YOUREN
	model.shadowless_remaining = 3.0
	_expect(model._current_attack_interval() >= CombatModelScript.MIN_AUTO_ATTACK_INTERVAL, "極限攻速仍必須保留最低可辨識間隔")

func _test_equipment_style_levels_and_unlock_boundary() -> void:
	var model = CombatModelScript.new()
	model.training.physique = 5
	var hp_before := float(model.snapshot().hero_max_hp)
	_expect(model.equip_item("black_iron_armor"), "裝備頁必須能穿上有效的防具")
	_expect(model.base_style_level("physique") == 5, "裝備不可改寫 Base 流派等級")
	_expect(model.equipment_style_bonus("physique") == 6 and model.effective_style_level("physique") == 11, "有效流派等級必須等於 Base 加裝備加成")
	_expect(float(model.snapshot().hero_max_hp) > hp_before, "角色數值必須使用有效流派等級")
	_expect(model.skill_is_unlocked("guard_stance"), "裝備提高有效流派等級後必須能解鎖技能")
	_expect(model.skill_is_equipment_supported("guard_stance"), "技能必須能辨識是否由裝備支撐解鎖")
	_expect(model.auto_skill_slots.has("guard_stance"), "裝備跨過技能門檻時，主動技必須自動加入 AUTO 編成")
	model.training.martial = 2
	model.grant_equipment("momentum_talisman")
	model.equipment_enhancements.black_iron_sword = 5
	_expect(model.equip_item("black_iron_sword") and model.equip_item("momentum_talisman"), "測試必須能裝備武藝加成武器與飾品")
	_expect(model.effective_style_level("martial") >= 10, "裝備叠加必須能讓有效武藝跨過 Lv.10")
	var momentum_before: float = model.momentum
	model.step(0.2)
	_expect(model.momentum > momentum_before, "有效武藝 Lv.10 必須立即解鎖勢的累積，不可只看 Base")
	model.grant_equipment("temple_armor")
	_expect(model.equip_item("temple_armor"), "同欄位裝備必須可以直接替換")
	_expect(String(model.equipped_items.armor) == "temple_armor" and model.equipment_style_bonus("physique") == 5, "同欄位只能保留目前裝備的加成")
	_expect(model.skill_is_unlocked("guard_stance"), "替換裝備後有效等級仍達門檻時技能必須保持解鎖")
	_expect(model.unequip_item("armor"), "必須可以卸下裝備")
	_expect(not model.skill_is_unlocked("guard_stance"), "卸下支撐裝備後，有效等級不足的技能必須停用")
	_expect(not model._can_cast("guard_stance"), "已在 AUTO 欄的裝備支撐技能，卸裝後不可繼續施放")
	_expect(model.equip_item("temple_armor"), "測試後續數值前必須能重新穿上裝備")
	model.training.martial = 10
	model.grant_equipment("momentum_talisman")
	model.equip_item("momentum_talisman")
	model.momentum = 0.0
	model._add_momentum(10.0, "test")
	_expect(model.momentum > 10.0, "特殊飾品效果必須真正影響流派戰鬥資源")
	var snapshot: Dictionary = model.snapshot()
	_expect(int(snapshot.base_style_levels.physique) == 5 and int(snapshot.effective_style_levels.physique) == 10, "HUD 快照必須同時提供 Base 與有效等級")

func _test_equipment_drop_quality_and_enhancement() -> void:
	var model = CombatModelScript.new()
	_expect(String(CombatModelScript.EQUIPMENT_DEFS.magic_rune_sword.quality) == "rare", "裝備資料必須包含品質")
	_expect(is_equal_approx(model.equipment_drop_chance(false, false), 0.18), "普通敵人必須有可感知的隨機裝備掉率")
	_expect(is_equal_approx(model.equipment_drop_chance(false, true), 0.55), "精英敵人的裝備掉率必須明顯較高")
	_expect(is_equal_approx(model.equipment_drop_chance(true, false), 1.0), "Boss 必須保證掉落裝備")
	model.gold = 1000
	model.equip_item("black_iron_sword")
	var effective_before := model.effective_style_level("martial")
	var cost_before := model.equipment_enhancement_cost("black_iron_sword")
	_expect(model.enhance_equipment("black_iron_sword"), "持有足夠金幣時必須可以強化裝備")
	_expect(model.equipment_enhancement("black_iron_sword") == 1 and model.gold == 1000 - cost_before, "強化必須提高等級並扣除正確金幣")
	_expect(model.effective_style_level("martial") == effective_before + 1, "每次強化必須提高裝備主流派 1 級")
	for index in 4:
		model.enhance_equipment("black_iron_sword")
	_expect(model.equipment_enhancement("black_iron_sword") == 5 and model.equipment_enhancement_cost("black_iron_sword") == -1, "裝備強化上限必須為 +5")
	model._events.clear()
	model._award_gold_and_equipment(true, false)
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type in ["equipment_drop", "equipment_duplicate"]), "首領必須保證產生裝備或重複裝備補償")
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "gold_gain"), "每場戰鬥必須固定獲得金幣")
	var wave_model = CombatModelScript.new()
	wave_model.stage = 2
	wave_model.current_wave = 0
	wave_model._events.clear()
	wave_model._enemy_defeated()
	_expect(wave_model.current_wave == 1 and wave_model._events.any(func(event: Dictionary) -> bool: return event.type == "gold_gain"), "敵群內每一隻敵人都必須獨立結算戰利品，不可只算最後一隻")

func _test_experience_progression() -> void:
	var model = CombatModelScript.new()
	_expect(model.experience_required_for_level(1) == 32 and model.experience_required_for_level(10) == 104, "升級需求必須隨角色等級提高")
	_expect(model.enemy_experience_reward(false, false, 1) == 10, "Lv.1 普通怪必須給 10 經驗")
	_expect(model.enemy_experience_reward(false, true, 10) == 70, "Lv.10 精英必須套用 2.5 倍經驗")
	_expect(model.enemy_experience_reward(true, false, 10) == 140, "Lv.10 Boss 必須套用 5 倍經驗")
	model.journey_route = "mountain"
	_expect(model.enemy_experience_reward(false, false, 10) == 34, "灰狼山道必須提供 20% 擊倒經驗加成")
	model.journey_route = "frontier"
	model.training_points = 0
	model.experience = 31
	model._events.clear()
	model._award_experience(false, false)
	_expect(model.player_level == 2 and model.experience == 9 and model.training_points == 1, "經驗達標時必須升級、扣除門檻並給 1 修練點")
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "level_up" and int(event.level) == 2), "升級必須發出可供 HUD 更新的事件")

func _test_equipment_skill_unlocks_all_tiers() -> void:
	var model = CombatModelScript.new()
	model.training.magic = 44
	model.grant_equipment("magic_rune_sword")
	model.equip_item("magic_rune_sword")
	_expect(model.effective_style_level("magic") >= 50, "測試裝備必須能把魔法有效等級推到 Lv.50")
	_expect(model.skill_is_unlocked("magic_sword_release") and model.skill_is_equipment_supported("magic_sword_release"), "裝備必須可以支援 Lv.50 以上技能")
	model.equip_auto_skill("magic_sword_release")
	model.unequip_item("weapon")
	_expect(model.auto_skill_slots.has("magic_sword_release"), "失去裝備支援時技能必須保留原本欄位")
	_expect(not model._can_cast("magic_sword_release"), "失去裝備支援後 AUTO 不可施放該技能")

func _test_shop_loop() -> void:
	var model = CombatModelScript.new()
	model.training.agility = 12
	model._generate_shop_items()
	_expect(model.shop_items.size() == 3, "戰地商店每批必須產生 3 件商品")
	_expect(model.shop_items.any(func(item_id: String) -> bool: return int(CombatModelScript.EQUIPMENT_DEFS[item_id].get("style_bonuses", {}).get("agility", 0)) > 0), "商店至少一件商品必須符合目前最高 Base 流派")
	model.gold = 500
	var bought: Dictionary = model.buy_shop_item(0)
	_expect(not bought.is_empty() and bool(model.equipment_collection.get(String(bought.item_id), false)), "購買裝備必須扣款、加入持有與永久收藏")
	var first_refresh_cost := model.shop_refresh_cost()
	_expect(first_refresh_cost == 30 and model.refresh_shop(), "第一次刷新必須花費 30 金")
	_expect(model.shop_refresh_cost() == 60, "第二次刷新價格必須提升為 60 金")
	var gold_before_sell: int = model.gold
	var sell_value := model.sell_equipment(String(bought.item_id))
	_expect(sell_value > 0 and model.gold == gold_before_sell + sell_value, "出售裝備必須回收金幣")

func _test_inheritance_loop() -> void:
	var memory = CombatModelScript.new()
	memory.inheritance_unlocked = true
	memory.stage = 41
	memory.gold = 999
	memory.training.agility = 80
	memory.perform_inheritance("memory", "agility")
	_expect(memory.stage == 1 and memory.gold == 0 and memory.base_style_level("agility") == 5, "記憶傳承必須回到第 1 戰並讓指定 Base 流派 +5")
	_expect(memory.battle_souls == 1 and memory.inheritance_count == 1, "完成傳承必須累積永久戰魂與次數")
	var equipment = CombatModelScript.new()
	equipment.inheritance_unlocked = true
	equipment.grant_equipment("swift_wind_feather")
	equipment.equipment_enhancements.swift_wind_feather = 5
	equipment.perform_inheritance("equipment", "swift_wind_feather")
	_expect(int(equipment.owned_equipment.get("swift_wind_feather", 0)) == 1 and equipment.equipment_enhancement("swift_wind_feather") == 0, "舊裝傳承必須保留一件裝備但強化歸零")
	_expect(bool(equipment.equipment_collection.get("swift_wind_feather", false)), "傳承後裝備收藏必須永久保留")
	var trade = CombatModelScript.new()
	trade.inheritance_unlocked = true
	trade.perform_inheritance("trade", "magic")
	_expect(trade.legacy_track == "magic" and trade.shop_items.size() == 3, "商路傳承必須保存指定流派並立即產生新商店")

func _test_defeat_farms_previous_stage_until_retry() -> void:
	var model = CombatModelScript.new()
	model.stage = 6
	model._spawn_enemy()
	model._defeat_hero()
	_expect(model.stage == 5, "戰敗後必須回到上一戰")
	_expect(model.retry_pending and model.retry_stage == 6, "戰敗關卡必須鎖定到玩家再次挑戰")
	var snapshot: Dictionary = model.snapshot()
	_expect(bool(snapshot.retry_pending) and int(snapshot.retry_stage) == 6, "HUD 快照必須提供再次挑戰狀態")
	model._events.clear()
	model._enemy_defeated()
	_expect(model.stage == 5 and model.retry_pending, "刷完上一戰後不可自動推回失敗關卡")
	var retry_events: Array[Dictionary] = model.retry_failed_stage()
	_expect(model.stage == 6 and not model.retry_pending, "按下再次挑戰才可回到失敗關卡")
	_expect(retry_events.any(func(event: Dictionary) -> bool: return event.type == "retry_started"), "再次挑戰必須送出明確戰鬥事件")

func _test_auto_roaming() -> void:
	var battlefield = BattlefieldScript.new()
	battlefield.size = Vector2(390.0, 844.0)
	battlefield.set_stage_bounds(112.0, 590.0)
	battlefield.set_exploration_enabled(true)
	battlefield._begin_exploration("1:1")
	var world_size: Vector2 = battlefield._exploration_world_size()
	var visible_size: Vector2 = battlefield._visible_map_size()
	_expect(world_size.x > visible_size.x and world_size.y > visible_size.y, "探索世界必須大於手機單一可視畫面")
	_expect(battlefield.navigation_blocks_combat() and battlefield._enemy_map_position != Vector2.ZERO, "自動巡敵開始時必須生成目標並暫停交戰")
	_expect(battlefield._enemy_camps.size() == 3 and battlefield._active_enemy_camp_index >= 0, "大地圖必須同時生成三群可見敵人並自動鎖定最近一群")
	var hero_before_drag: Vector2 = battlefield._hero_map_position
	var camera_before_drag: Vector2 = battlefield._camera_top_left
	var drag_press := InputEventMouseButton.new()
	drag_press.button_index = MOUSE_BUTTON_LEFT
	drag_press.pressed = true
	drag_press.position = Vector2(120.0, 420.0)
	battlefield._on_map_input(drag_press)
	var drag_motion := InputEventMouseMotion.new()
	drag_motion.position = Vector2(190.0, 420.0)
	battlefield._on_map_input(drag_motion)
	battlefield._update_exploration(0.5)
	_expect(battlefield._hero_map_position.x > hero_before_drag.x + 40.0 and battlefield._camera_top_left.x > camera_before_drag.x, "按住拖曳必須直接移動角色並推動世界鏡頭")
	var drag_release := InputEventMouseButton.new()
	drag_release.button_index = MOUSE_BUTTON_LEFT
	drag_release.pressed = false
	drag_release.position = drag_motion.position
	battlefield._on_map_input(drag_release)
	_expect(not battlefield._steering_active and battlefield._hero_map_target == battlefield._enemy_map_position, "放開拖曳後必須恢復 AUTO 尋敵")
	var initial_camp_target: Vector2 = battlefield._enemy_map_position
	var alternate_camp_index: int = (battlefield._active_enemy_camp_index + 1) % battlefield._enemy_camps.size()
	var camp_click := InputEventMouseButton.new()
	camp_click.button_index = MOUSE_BUTTON_LEFT
	camp_click.pressed = true
	camp_click.position = battlefield._world_to_screen(battlefield._enemy_camps[alternate_camp_index])
	battlefield._on_map_input(camp_click)
	_expect(battlefield._enemy_map_position != initial_camp_target and battlefield._active_enemy_camp_index == alternate_camp_index, "點擊其他敵群必須立即切換半自動狩獵目標")
	_expect(not battlefield._enemy_visible_on_map(Vector2(195.0, battlefield.stage_top + 150.0)) and battlefield._enemy_visible_on_map(Vector2(195.0, battlefield.stage_top + 175.0)), "接敵安全區必須容納完整敵人 Sprite，不可只判斷腳底進入畫面")
	var target_indicator := battlefield._active_enemy_indicator_position(Vector2(-180.0, battlefield.stage_top - 90.0))
	_expect(target_indicator.x == 46.0 and target_indicator.y == battlefield.stage_top + 96.0, "AUTO 目標離開安全區時必須留在邊緣指示位置")
	battlefield._encounter_wave = 1
	battlefield._encounter_wave_count = 3
	var encounter_status: Dictionary = battlefield.exploration_status()
	_expect(String(encounter_status.landmark) != "" and int(encounter_status.enemy_group_size) == 3, "巡敵目標必須提供地標與剩餘敵群數量")
	_expect(String(encounter_status.landmark_effect).is_empty(), "尚未接敵時不可提前取得地標效果")
	var hero_screen: Vector2 = battlefield._world_to_screen(battlefield._hero_map_position)
	_expect(hero_screen.x >= 0.0 and hero_screen.x <= battlefield.size.x and hero_screen.y >= battlefield.stage_top, "鏡頭必須把巡敵中的角色留在可視戰場")
	var traveling_focus := battlefield._camera_focus_position(visible_size)
	_expect(traveling_focus == battlefield._hero_map_position, "巡敵鏡頭必須穩定跟隨角色，不可因目標方向讓人物在畫面內漂移")
	battlefield._camera_top_left = Vector2(37.0, 23.0)
	var source_before := battlefield._exploration_background_source_rect(Vector2(1536.0, 1024.0), visible_size)
	battlefield._camera_top_left += Vector2(41.0, 29.0)
	var source_after := battlefield._exploration_background_source_rect(Vector2(1536.0, 1024.0), visible_size)
	var rendered_background_shift := (source_after.position - source_before.position) * visible_size / source_before.size
	_expect(rendered_background_shift.distance_to(Vector2(41.0, 29.0)) < 0.1, "背景與地標必須使用同一世界投影，不可在鏡頭移動時彼此漂移")
	battlefield._update_exploration(10.0)
	_expect(not battlefield.navigation_blocks_combat(), "角色抵達敵人後才可恢復 AUTO 戰鬥")
	var combat_focus := battlefield._camera_focus_position(visible_size)
	_expect(combat_focus == battlefield._hero_map_position, "接敵後鏡頭仍必須鎖定英雄，不可在英雄與敵人之間來回拉扯")
	var framed_enemy_screen := battlefield._world_to_screen(battlefield._enemy_map_position)
	_expect(framed_enemy_screen.x >= 82.0 and framed_enemy_screen.x <= battlefield.size.x - 82.0, "接敵鏡頭必須保留敵人完整橫向輪廓")
	var edge_enemy := battlefield._enemy_presentation_position(Vector2(-120.0, battlefield.stage_top - 80.0))
	_expect(edge_enemy.x == 86.0 and edge_enemy.y == battlefield.stage_top + 164.0, "接戰敵人越過安全區時必須停在畫面邊緣，不可突然消失")
	battlefield._enemy_death_motion = 0.0
	battlefield._enemy_map_position = Vector2(120.0, 300.0)
	battlefield._hero_map_position = Vector2(260.0, 300.0)
	battlefield._update_enemy_facing()
	_expect(battlefield._enemy_facing == -1.0, "主角移到敵人右側時，敵人 Sprite 必須轉向主角")
	battlefield._enemy_death_motion = 1.0
	battlefield._hero_map_position = Vector2(60.0, 300.0)
	battlefield._update_enemy_facing()
	_expect(battlefield._enemy_facing == -1.0, "敵人死亡期間必須鎖定最後朝向，不可讓屍體突然翻面")
	battlefield._enemy_death_motion = 0.0
	battlefield._update_enemy_facing()
	_expect(battlefield._enemy_facing == 1.0, "敵人存活且主角穿越左側後必須重新轉向")
	var first_target: Vector2 = battlefield._enemy_map_position
	var banner: Dictionary = battlefield._landmarks()[1]
	battlefield._enemy_map_position = Vector2(banner.position)
	battlefield._exploration_phase = "engaged"
	_expect(battlefield.active_landmark_effect() == "direct", "斷旗丘接敵必須提供先手戰意效果")
	battlefield._begin_exploration("1:2")
	_expect(battlefield._enemy_map_position != first_target, "下一波敵人必須出現在地圖的不同位置")
	var waypoint_screen := Vector2(90.0, 360.0)
	var waypoint_world := battlefield._screen_to_world(waypoint_screen)
	_expect(waypoint_world != waypoint_screen, "捲動後點地座標必須換算成大地圖世界座標")
	battlefield._hero_map_target = Vector2(world_size.x * 0.5, world_size.y * 0.5)
	battlefield._manual_waypoint_active = true
	battlefield._update_exploration(10.0)
	_expect(battlefield.navigation_blocks_combat() and not battlefield._manual_waypoint_active, "手動路點完成後必須自動接回巡敵路線")
	battlefield._update_exploration(10.0)
	_expect(not battlefield.navigation_blocks_combat(), "巡敵接回後必須能正常接戰")
	battlefield._begin_exploration("1:3")
	var detour_landmark: Dictionary = battlefield._landmarks()[1]
	battlefield._hero_map_position = Vector2(detour_landmark.position) + Vector2(100.0, 0.0)
	battlefield._discovered_landmarks.clear()
	battlefield._update_landmark_discovery_hint()
	_expect(battlefield._nearby_landmark_name == "斷旗丘" and battlefield._roaming_hint_remaining >= 2.4, "首次靠近地標必須出現一次可繞行情境提示")
	var detour_click := InputEventMouseButton.new()
	detour_click.button_index = MOUSE_BUTTON_LEFT
	detour_click.pressed = true
	detour_click.position = battlefield._world_to_screen(Vector2(detour_landmark.position))
	battlefield._on_map_input(detour_click)
	_expect(battlefield._selected_landmark_name == "斷旗丘" and battlefield._manual_waypoint_active, "點擊地標必須改為地標繞行目標")
	battlefield._update_exploration(10.0)
	_expect(battlefield._claimed_landmark_effect == "direct" and battlefield.navigation_blocks_combat(), "抵達地標必須取得優勢並自動接回巡敵")
	_expect(battlefield._landmark_acquire_fx > 0.0 and battlefield._landmark_acquire_name == "斷旗丘", "取得地標時必須啟動短暫世界回饋並顯示來源")
	battlefield._update_exploration(10.0)
	_expect(battlefield.active_landmark_effect() == "direct" and not battlefield.navigation_blocks_combat(), "完成繞行後必須在接敵時啟用所選地標效果")
	var group_model = CombatModelScript.new()
	group_model.stage = 2
	group_model.current_wave = 0
	group_model._spawn_enemy()
	battlefield._encounter_key = "2"
	battlefield._exploration_phase = "engaged"
	var held_target: Vector2 = battlefield._enemy_map_position
	battlefield.set_state(group_model.snapshot())
	group_model.current_wave = 1
	group_model._spawn_enemy()
	battlefield.set_state(group_model.snapshot())
	_expect(battlefield._exploration_phase == "engaged" and battlefield._enemy_map_position == held_target, "同一戰的後續敵人必須留在原遭遇點，不可重新巡路")
	battlefield.free()
	var landmark_model = CombatModelScript.new()
	var armor_before: float = landmark_model.enemy_armor
	var landmark_events: Array[Dictionary] = landmark_model.choose_exploration_approach("scout")
	_expect(is_equal_approx(landmark_model.enemy_armor, armor_before * 0.8), "瞭望塔效果必須實際降低敵方護甲")
	_expect(landmark_events.any(func(event: Dictionary) -> bool: return event.type == "exploration_approach" and event.name == "哨塔視野"), "地標效果必須產生可讀的戰鬥回饋")

func _test_frontier_stage_waves() -> void:
	var model = CombatModelScript.new()
	model.stage = 2
	model.current_wave = 0
	model._spawn_enemy()
	var points_before: int = model.training_points
	model._events.clear()
	model._enemy_defeated()
	_expect(model.stage == 2 and model.current_wave == 1, "第2戰第一名新兵倒下後必須進入同戰第二波")
	_expect(is_equal_approx(model.wave_transition_remaining, CombatModelScript.WAVE_TRANSITION_DURATION), "Wave 切換必須保留 0.8 秒辨識節拍")
	_expect(model.training_points == points_before and model.experience == 12, "每隻敵人必須給經驗，但未升級前不可提前發放修練點")
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "experience_gain" and int(event.gain) == 12), "第一波敵人必須產生經驗事件")
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "wave_transition_started" and int(event.wave) == 2), "連續波次必須發出清楚的換場事件")
	var preserved_hp: float = model.hero_hp
	var preserved_momentum: float = model.momentum
	model.step(0.79)
	_expect(model.enemy_hp <= 0.0 and model.current_wave == 1, "0.8 秒換場結束前不可提早生成敵人")
	var transition_events := model.step(0.02)
	_expect(model.enemy_hp > 0.0 and transition_events.any(func(event: Dictionary) -> bool: return event.type == "wave_started"), "0.8 秒後必須生成下一 Wave")
	_expect(is_equal_approx(model.hero_hp, preserved_hp) and model.momentum >= preserved_momentum, "Wave 切換不得重置玩家生命與流派資源")
	model._events.clear()
	model._enemy_defeated()
	_expect(model.stage == 3 and model.current_wave == 0, "清除全部 Wave 後才可推進下一戰")
	_expect(model.training_points == points_before and model.experience == 24, "同戰第二隻敵人必須繼續累積經驗，不再固定送修練點")
	model.stage = 9
	model.current_wave = 0
	_expect(model._stage_waves(9).size() == 3, "第9戰必須依序測試劍兵、盾衛與重槌兵")

func _test_area_kills_summon_boss() -> void:
	var model = CombatModelScript.new()
	model.stage = 9
	model.area_kills = CombatModelScript.BOSS_KILLS_REQUIRED - CombatModelScript.BOSS_WARNING_REMAINING - 1
	model.current_wave = 0
	model._spawn_enemy()
	model._events.clear()
	model._enemy_defeated()
	_expect(model.area_kills == 9 and model._events.any(func(event: Dictionary) -> bool: return event.type == "boss_warning" and int(event.remaining) == 3), "距離首領剩三名敵人時必須只發出一次預警")
	model.area_kills = CombatModelScript.BOSS_KILLS_REQUIRED - 1
	model.current_wave = 0
	model._spawn_enemy()
	model._events.clear()
	model._enemy_defeated()
	_expect(model.stage == 10 and is_equal_approx(model.wave_transition_remaining, 1.35), "擊倒第12名敵人後必須進入首領登場節拍")
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "boss_imminent"), "首領生成前必須提供明確預告")
	var spawn_events := model.step(1.36)
	_expect(model.enemy_is_boss and spawn_events.any(func(event: Dictionary) -> bool: return event.type == "boss_entered"), "登場節拍結束後必須生成首領並發出登場事件")
	var snapshot: Dictionary = model.snapshot()
	_expect(int(snapshot.area_kills) == 12 and int(snapshot.boss_kills_remaining) == 0, "HUD 快照必須提供本區擊殺進度")

func _test_failure_report_keeps_idle_loop() -> void:
	var model = CombatModelScript.new()
	model.stage = 6
	model.current_wave = 0
	model._spawn_enemy()
	model._record_incoming_damage(42.0, "heavy")
	model._defeat_hero()
	_expect(model.stage == 5 and model.retry_pending, "失敗分析不可改變退回上一戰掛機規則")
	_expect(not model.last_failure_report.is_empty(), "戰敗必須保存突破分析")
	_expect(String(model.last_failure_report.highest_damage_source).contains("重擊"), "突破分析必須指出最大承傷來源")
	var events := model.step(0.2)
	_expect(model.stage == 5 and not events.any(func(event: Dictionary) -> bool: return event.type == "defeat"), "玩家不開分析時上一戰仍必須繼續 AUTO")

func _test_boss_fixed_reward_choice() -> void:
	var model = CombatModelScript.new()
	model.stage = 10
	model.current_wave = 0
	model.training.agility = 12
	model._spawn_enemy()
	model._events.clear()
	model._enemy_defeated()
	_expect(model.awaiting_journey_choice, "擊敗黑鐵統領後必須暫停於戰利品選擇")
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "boss_reward_choice"), "Boss 必須開啟固定三選一")
	var options: Array[Dictionary] = model.boss_reward_options()
	_expect(options.size() == 3 and String(options[2].item_id) == "swift_wind_feather", "第三件戰利品必須依最高 Base 流派決定")
	var before: int = model.effective_style_level("agility")
	var reward_events := model.claim_boss_reward("swift_wind_feather")
	_expect(model.effective_style_level("agility") > before, "選擇 Boss 戰利品後必須立即提高有效流派等級")
	_expect(reward_events.any(func(event: Dictionary) -> bool: return event.type == "journey_choice"), "選完戰利品後才可進入下一區選擇")
	var reward_event: Dictionary = reward_events.filter(func(event: Dictionary) -> bool: return event.type == "boss_reward_claimed")[0]
	var summary: Dictionary = reward_event.summary
	_expect(int(summary.before.base) == int(summary.after.base) and int(summary.after.effective) > int(summary.before.effective), "Boss 摘要必須只改 Effective，永久 Base 不可被裝備改寫")
	_expect(int(summary.next_base_milestone) == 15, "永久節點距離必須由 Base 流派等級計算")

func _test_slice_metrics_capture_adjustment() -> void:
	var model = CombatModelScript.new()
	model.stage = 4
	model._defeat_hero()
	model.step(1.0)
	model.spend_training("martial")
	model.equip_item("black_iron_sword")
	_expect(float(model.slice_metrics.retry_wait) >= 1.0, "測試紀錄必須保存失敗後掛機時間")
	_expect(bool(model.slice_metrics.retry_training_spent), "測試紀錄必須保存再次挑戰前是否修練")
	_expect(bool(model.slice_metrics.retry_equipment_changed), "測試紀錄必須保存再次挑戰前是否換裝")

func _test_save_data_roundtrip() -> void:
	var source = CombatModelScript.new()
	source.stage = 27
	source.area_number = 3
	source.journey_route = "mountain"
	source.awaiting_journey_choice = true
	source.boss_reward_claimed = true
	source.retry_pending = true
	source.retry_stage = 26
	source.tutorial_step = "core"
	source.training.magic = 44
	source.training_points = 7
	source.player_level = 18
	source.experience = 27
	source.gold = 345
	source.kills = 89
	source.area_kills = 7
	source.boss_warning_sent = true
	source.grant_equipment("magic_rune_sword")
	source.equip_item("magic_rune_sword")
	source.equipment_enhancements.magic_rune_sword = 3
	source.inheritance_unlocked = true
	source.battle_souls = 2
	source.legacy_choice = "memory"
	source.legacy_track = "magic"
	source.secondary_element = "ice"
	source.auto_skill_slots[0] = "heavy_strike"
	source.auto_skill_slots[1] = "magic_sword_release"
	source.auto_tactics.magic_sword_release = "boss"
	source.hero_hp = 42.0
	var restored = CombatModelScript.new()
	_expect(restored.load_save_data(source.save_data()), "版本相容的存檔必須可以載入")
	_expect(restored.stage == 27 and restored.area_number == 3 and restored.journey_route == "mountain", "存檔必須恢復關卡與旅途")
	_expect(restored.awaiting_journey_choice and restored.boss_reward_claimed and restored.retry_pending, "Boss 獎勵、旅途與再挑戰狀態必須恢復")
	_expect(restored.tutorial_step == "core", "專注教學進度必須跟著存檔恢復")
	_expect(int(restored.training.magic) == 44 and restored.training_points == 7, "修練等級與未分配點數必須恢復")
	_expect(restored.player_level == 18 and restored.experience == 27, "角色等級與目前經驗必須跟著存檔恢復")
	_expect(restored.area_kills == 7 and restored.boss_warning_sent, "本區首領擊殺進度與預警狀態必須跟著存檔恢復")
	_expect(String(restored.equipped_items.weapon) == "magic_rune_sword" and int(restored.equipment_enhancements.magic_rune_sword) == 3, "裝備與強化必須恢復")
	_expect(restored.inheritance_unlocked and restored.battle_souls == 2 and restored.legacy_track == "magic", "轉生與遺產必須恢復")
	_expect(restored.secondary_element == "ice" and String(restored.auto_skill_slots[1]) == "magic_sword_release", "流派選擇與 AUTO 編成必須恢復")
	_expect(restored.enemy_hp > 0.0 and restored.hero_hp == 42.0, "載入後應重建當前敵人並恢復角色生命")
	var legacy_save := source.save_data()
	legacy_save.erase("player_level")
	legacy_save.erase("experience")
	var migrated = CombatModelScript.new()
	_expect(migrated.load_save_data(legacy_save) and migrated.player_level == 47, "舊存檔缺少經驗欄位時必須依既有修練總量換算等級")
	_expect(not restored.load_save_data({"version": 999}), "不相容存檔版本不可盲目載入")

func _test_battlefield_impact_tiers() -> void:
	var battlefield = BattlefieldScript.new()
	_expect(BattlefieldScript.PIXEL_HERO_DODGE_FRAMES.size() == 4, "像素主角閃避必須載入完整四幀")
	_expect(BattlefieldScript.PIXEL_HERO_DEATH_FRAMES.size() == 4, "像素主角倒下必須載入完整四幀")
	_expect(BattlefieldScript.PIXEL_RAIDER_COMBAT_FRAMES.size() == 4, "快攻斥候必須使用獨立四幀戰鬥素材")
	_expect(BattlefieldScript.PIXEL_BRUTE_COMBAT_FRAMES.size() == 4, "巨槌重兵必須使用獨立四幀戰鬥素材")
	_expect(BattlefieldScript.PIXEL_SHIELD_COMBAT_FRAMES.size() == 4, "黑鐵盾衛必須使用獨立四幀戰鬥素材")
	_expect(BattlefieldScript.PIXEL_CASTER_COMBAT_FRAMES.size() == 4, "咒術師必須使用獨立四幀戰鬥素材")
	_expect(BattlefieldScript.HERO_SLASH_FRAMES.size() == 12, "主角揮劍必須載入完整十二幀")
	_expect(BattlefieldScript.HERO_BLOCK_FRAMES.size() == 8, "主角格擋必須載入完整八幀")
	_expect(BattlefieldScript.HERO_DODGE_FRAMES.size() == 10, "主角閃躲必須載入完整十幀")
	_expect(BattlefieldScript.HERO_HURT_FRAMES.size() == 6, "主角受擊必須載入完整六幀")
	_expect(BattlefieldScript.HERO_DEATH_FRAMES.size() == 10, "主角倒下必須載入完整十幀")
	_expect(BattlefieldScript.WOLF_POUNCE_FRAMES.size() == 12, "狼撲擊必須載入完整十二幀")
	_expect(BattlefieldScript.WOLF_HURT_FRAMES.size() == 6, "狼受擊必須載入完整六幀")
	_expect(BattlefieldScript.WOLF_DEATH_FRAMES.size() == 10, "狼倒下必須載入完整十幀")
	_expect(BattlefieldScript.MOTION_TRAUMA_CAP <= 0.42, "戰場震動必須限制在舒適範圍")
	_expect(BattlefieldScript.CAMERA_SHAKE_OFFSET.x <= 6.0, "戰場水平震動不可干擾持續觀看")
	_expect(BattlefieldScript.STABLE_CHARACTER_PRESENTATION, "高速 AUTO 戰鬥必須使用固定角色本體避免輪廓閃爍")
	_expect(BattlefieldScript.SLASH_FX_FRAMES.size() == 6, "刀光必須以獨立六幀特效載入")
	_expect(BattlefieldScript.IMPACT_FX_FRAMES.size() == 6, "命中火花必須以獨立六幀特效載入")
	_expect(battlefield.impact_tier_for_source("attack") == "light", "普通攻擊必須使用輕量命中回饋")
	_expect(battlefield.impact_tier_for_source("critical_attack") == "medium", "暴擊必須使用中量命中回饋")
	_expect(battlefield.impact_tier_for_source("heavy_strike_base") == "medium", "基礎重擊不可使用極勢等級的重型回饋")
	_expect(battlefield.impact_tier_for_source("momentum_slash") == "medium", "Lv.10 勢斬必須有明顯但不超越高階奧義的命中回饋")
	_expect(battlefield.impact_tier_for_source("heavy_strike_extreme") == "heavy", "滿勢重擊必須使用重型命中回饋")
	_expect(battlefield.impact_tier_for_source("heavy_strike_swift") == "medium", "敏捷迅擊必須使用中量高速回饋")
	_expect(battlefield.impact_tier_for_source("mountain_break") == "heavy", "斷嶽必須使用重型命中回饋")
	battlefield.play_events([{"type": "block"}, {"type": "dodge"}])
	_expect(battlefield._hero_block_motion == 1.0 and battlefield._hero_dodge_motion == 1.0, "格擋與閃躲事件必須啟動對應逐格動作")
	var normal_health_bar: Rect2 = battlefield.enemy_health_bar_rect(Vector2(240.0, 420.0), 164.0, 1.0)
	battlefield.enemy_is_boss = true
	var boss_health_bar: Rect2 = battlefield.enemy_health_bar_rect(Vector2(240.0, 420.0), 176.0, 1.15)
	_expect(boss_health_bar.size.x > normal_health_bar.size.x and normal_health_bar.size.y == 9.0, "敵人頭頂必須使用精簡血條，Boss 僅以較寬血條區分")
	battlefield.play_events([{"type": "equipment_drop", "name": "游風羽飾", "quality": "rare"}])
	_expect(battlefield._loot_drop_fx == 1.0 and battlefield._loot_drop_name == "游風羽飾" and battlefield._loot_drop_quality == "rare", "隨機裝備掉落必須改用戰場內短暫提示，不可依賴中央 Toast")
	battlefield.play_events([{"type": "experience_gain", "gain": 18}, {"type": "level_up", "level": 4}, {"type": "boss_warning", "remaining": 3}])
	_expect(battlefield._experience_orb_fx == 1.0 and battlefield._experience_gain == 18, "擊殺經驗必須在戰場內形成吸收演出")
	_expect(battlefield._level_up_fx == 1.0 and battlefield._level_up_level == 4, "升級必須有不遮擋戰鬥的短暫回饋")
	_expect(battlefield._boss_warning_fx == 1.0 and battlefield._boss_warning_remaining == 3, "首領預警事件必須啟動獨立戰場演出")
	battlefield.play_events([{"type": "style_formed", "track": "martial"}])
	_expect(battlefield._style_formed_burst == 1.0 and battlefield._style_formed_color == Color("e07845"), "流派成形事件必須啟動對應色彩的低位移視覺回饋")
	battlefield.play_events([{"type": "swift_cut", "milestone_track": "agility", "milestone_level": 100, "milestone_mode": "flow"}])
	_expect(battlefield._milestone_fx == 1.0 and battlefield._milestone_color == Color("66d2b1") and battlefield._milestone_mode == "flow", "重大劍技必須啟動依流派與爆發／循環區分的通用演出")
	battlefield.play_events([{"type": "defeat"}])
	_expect(battlefield._hero_defeated, "主角死亡後必須停留在倒下狀態，直到真正復活")
	_expect(battlefield.defeat_sequence_active(), "戰敗後必須啟動回到上一戰的視覺演出")
	_expect(BattlefieldScript.DEFEAT_REWIND_DURATION <= 2.0, "戰敗回溯不可長時間中斷 AUTO 戰鬥")
	battlefield._visual_freeze_remaining = 0.0
	battlefield._process(BattlefieldScript.DEFEAT_REWIND_DURATION * 0.5)
	_expect(battlefield.defeat_sequence_active(), "回溯演出中途必須保持戰鬥暫停")
	var rewind_origin := Vector2(140.0, 520.0)
	var rewind_target: Vector2 = battlefield._defeat_soul_position(rewind_origin, 1.0)
	_expect(rewind_target.x < rewind_origin.x and rewind_target.y < rewind_origin.y, "戰敗光影必須飛向畫面左上方")
	battlefield._process(BattlefieldScript.DEFEAT_REWIND_DURATION * 0.51)
	_expect(not battlefield.defeat_sequence_active() and not battlefield._hero_defeated, "回溯結束後必須恢復上一戰 AUTO 戰鬥")
	battlefield.play_events([{"type": "boss_entered"}, {"type": "boss_enraged"}])
	_expect(battlefield._boss_intro_motion == 1.0 and battlefield._boss_enrage_burst == 1.0, "首領登場與狂怒必須有獨立、低位移的視覺提示")
	battlefield.trauma = 0.4
	battlefield._hero_recoil = 1.0
	battlefield.play_events([{"type": "defeat"}])
	_expect(battlefield.trauma == 0.0 and battlefield._hero_recoil == 0.0, "角色死亡時必須立即停止震動與位移")
	battlefield.trauma = 0.4
	battlefield._enemy_knockback = 1.0
	battlefield.play_events([{"type": "enemy_defeated", "boss": false}])
	_expect(battlefield.trauma == 0.0 and battlefield._enemy_knockback == 0.0, "怪物死亡時必須立即停止震動與擊退")
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
	_expect(not burst_events.is_empty() and is_equal_approx(float(burst_events[0].damage), model._magic_power() * 4.2 * 1.25 * 1.3 * model._skill_level_multiplier("flame_burst_slash")), "熾燃與預設焚盡式必須共同強化滿燃燒炎爆斬")
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
	model.training_points = 3
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
	_expect(not martial_hits.is_empty() and String(martial_hits[0].name) == "重擊", "武藝訓練後共通重擊仍必須維持原名")
	_expect(is_equal_approx(float(martial_hits[0].momentum_ratio), 0.0) and not events.any(func(event: Dictionary) -> bool: return event.type == "momentum_pierce"), "共通重擊不可再套用勢或流派破甲")
	var hybrid = CombatModelScript.new()
	hybrid.training.martial = 10
	hybrid.training.physique = 10
	hybrid.training.agility = 10
	hybrid.training.magic = 10
	_expect(hybrid.heavy_strike_modifiers().is_empty() and hybrid.skill_display_name("heavy_strike") == "重擊", "多流派訓練不可改造共通重擊")
	hybrid.youren = 5
	_expect(is_equal_approx(hybrid._heavy_strike_cooldown(), 4.5), "共通重擊冷卻不可受敏捷改造")
	var agile = CombatModelScript.new()
	agile.training.agility = 10
	agile.youren = 5
	agile.enemy_hp = 9999.0
	agile.skill_cooldowns.clear()
	events = agile.step(0.01)
	_expect(events.any(func(event: Dictionary) -> bool: return event.type == "damage" and event.source == "heavy_strike_base"), "敏捷訓練後重擊仍必須使用共通傷害來源")
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
	_expect(is_equal_approx(model._block_chance(), 0.59), "鐵門式守勢期間普通格擋率必須提高到 59%")
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

func _test_early_art_choices() -> void:
	var locked = CombatModelScript.new()
	_expect(not locked.select_early_art_choice("martial", "steel_break"), "Lv.30 前不可選擇劍路分岔")
	var pursuit = CombatModelScript.new()
	pursuit.training.martial = 30
	pursuit.select_early_art_choice("martial", "pursuit")
	pursuit.enemy_hp = 8.0
	pursuit.enemy_max_hp = 100.0
	pursuit.enemy_armor = 0.0
	pursuit.momentum = CombatModelScript.MAX_MOMENTUM
	pursuit._events.clear()
	pursuit._basic_attack(false)
	_expect(pursuit._events.any(func(event: Dictionary) -> bool: return event.type == "momentum_slash" and String(event.variant) == "pursuit" and String(event.name) == "蓄勢・追命一閃"), "追命式必須改變滿勢一閃的名稱與戰鬥事件")
	_expect(pursuit.momentum >= 20.0, "追命式完成擊殺後必須返還勢")
	var steel = CombatModelScript.new()
	steel.training.martial = 30
	steel.select_early_art_choice("martial", "steel_break")
	steel.enemy_is_boss = true
	steel.enemy_hp = 99999.0
	steel.enemy_max_hp = 99999.0
	steel.enemy_armor = 80.0
	steel.momentum = CombatModelScript.MAX_MOMENTUM
	steel._events.clear()
	steel._basic_attack(false)
	_expect(steel._events.any(func(event: Dictionary) -> bool: return event.type == "momentum_slash" and String(event.variant) == "steel_break" and is_equal_approx(float(event.armor_ignore), 0.4)), "斷鋼式必須把滿勢一閃改為高穿甲首領技")
	var returning = CombatModelScript.new()
	returning.training.agility = 30
	returning.select_early_art_choice("agility", "returning_shadow")
	returning.enemy_hp = 99999.0
	returning._events.clear()
	returning._cast_shadow_assault()
	_expect(returning._events.any(func(event: Dictionary) -> bool: return event.type == "shadow_return"), "折返式影襲必須追加第二次斬擊")
	var flowing = CombatModelScript.new()
	flowing.training.agility = 30
	flowing.select_early_art_choice("agility", "flowing_shadow")
	flowing.enemy_hp = 99999.0
	flowing.skill_cooldowns["swift_cut"] = 2.0
	flowing._events.clear()
	flowing._cast_shadow_assault()
	_expect(flowing.youren == 2 and is_equal_approx(float(flowing.skill_cooldowns.swift_cut), 1.2), "流風式影襲必須建立游刃並加速雙燕疾斬")
	_expect(flowing._events.any(func(event: Dictionary) -> bool: return event.type == "flowing_shadow"), "流風式必須產生可辨識戰鬥事件")
	var mountain = CombatModelScript.new()
	mountain.training.physique = 30
	mountain.select_early_art_choice("physique", "mountain_guard")
	mountain.return_blade_ready = true
	mountain._events.clear()
	mountain._enemy_attack("block")
	_expect(mountain._events.any(func(event: Dictionary) -> bool: return event.type == "perfect_block"), "鎮岳式返刃必須把下一次格擋提升為完美格擋")
	_expect(mountain._events.any(func(event: Dictionary) -> bool: return event.type == "counter" and String(event.variant) == "mountain_guard"), "鎮岳式必須產生可辨識返刃事件")
	var borrowed = CombatModelScript.new()
	borrowed.training.physique = 30
	borrowed.select_early_art_choice("physique", "borrowed_edge")
	borrowed._events.clear()
	borrowed._counter_attack(100.0, false, "heavy", true)
	var borrowed_counters: Array = borrowed._events.filter(func(event: Dictionary) -> bool: return event.type == "counter")
	_expect(not borrowed_counters.is_empty() and is_equal_approx(float(borrowed_counters[0].borrowed), 85.0), "借勢式返刃必須額外轉化 50% 格擋傷害")
	var detonation = CombatModelScript.new()
	detonation.training.magic = 30
	detonation.select_early_art_choice("magic", "detonation")
	detonation.enemy_hp = 99999.0
	detonation.enemy_max_hp = 99999.0
	detonation.enemy_armor = 0.0
	detonation.magic_marks = 5
	detonation.burn_stacks = 5
	detonation._events.clear()
	detonation._cast_flame_burst_slash()
	var detonation_events: Array = detonation._events.filter(func(event: Dictionary) -> bool: return event.type == "flame_burst_slash")
	var ember = CombatModelScript.new()
	ember.training.magic = 30
	ember.select_early_art_choice("magic", "ember_cycle")
	ember.enemy_hp = 99999.0
	ember.enemy_max_hp = 99999.0
	ember.enemy_armor = 0.0
	ember.magic_marks = 5
	ember.burn_stacks = 5
	ember._events.clear()
	ember._cast_flame_burst_slash()
	var ember_events: Array = ember._events.filter(func(event: Dictionary) -> bool: return event.type == "flame_burst_slash")
	_expect(not detonation_events.is_empty() and not ember_events.is_empty() and float(detonation_events[0].damage) > float(ember_events[0].damage) * 1.25, "焚盡式炎爆必須提供明顯的一次性爆發")
	_expect(ember.burn_stacks == 2 and String(ember_events[0].variant) == "ember_cycle", "餘燼式炎爆必須保留兩層燃燒以銜接下一輪")

func _test_major_milestone_choices() -> void:
	var model = CombatModelScript.new()
	for track: String in CombatModelScript.TRAINING_ORDER:
		model.training[track] = 200
		for level: int in CombatModelScript.MAJOR_MILESTONES:
			var choices: Dictionary = CombatModelScript.MILESTONE_CHOICES[track][level]
			var second_choice := String(choices.keys()[1])
			_expect(model.select_milestone_choice(track, level, second_choice), "%s Lv.%d 必須能選擇第二條重大劍路" % [track, level])
			_expect(model.milestone_choice(track, level) == second_choice, "%s Lv.%d 必須保存目前重大劍路" % [track, level])
	model.momentum = CombatModelScript.MAX_MOMENTUM
	model.enemy_hp = 99999.0
	model._events.clear()
	model._basic_attack(false)
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "momentum_slash" and int(event.milestone_level) == 10 and String(event.milestone_mode) == "flow"), "重大劍技事件必須把節點與演出模式送到戰場")
	var loaded = CombatModelScript.new()
	_expect(loaded.load_save_data(model.save_data()), "重大劍技選擇存檔必須可讀回")
	_expect(loaded.milestone_choice("faith", 200) == model.milestone_choice("faith", 200), "重大劍技選擇必須跨存檔保存")

func _test_boss_spawn() -> void:
	var model = CombatModelScript.new()
	model.stage = 10
	model._spawn_enemy()
	_expect(model.enemy_is_boss and model.enemy_armor >= CombatModelScript.HIGH_ARMOR_THRESHOLD, "每 10 戰首領必須具備高護甲並啟用破甲需求")

func _test_boss_rage_phase() -> void:
	var model = CombatModelScript.new()
	model.stage = 10
	model._spawn_enemy()
	model.enemy_max_hp = 100.0
	model.enemy_hp = 31.0
	model.enemy_armor = 0.0
	var calm_interval := model._enemy_attack_interval()
	model._events.clear()
	model._deal_damage(2.0, "test")
	_expect(model.boss_enraged and model._events.any(func(event: Dictionary) -> bool: return event.type == "boss_enraged"), "首領生命降至 30% 時必須只進入一次狂怒階段")
	_expect(model._enemy_attack_interval() < calm_interval and model._attack_type_for_count(2) == "heavy", "狂怒首領必須提高攻擊頻率並更常使用重擊")

func _test_enemy_archetypes_and_route_rhythm() -> void:
	var model = CombatModelScript.new()
	var expected := {1: "grunt", 3: "raider", 4: "shield", 6: "brute", 8: "centurion", 10: "boss"}
	for target_stage: int in expected:
		model.stage = target_stage
		model._spawn_enemy()
		_expect(model.enemy_archetype == String(expected[target_stage]), "路段 %d 必須出現預定敵人類型" % target_stage)
	model.stage = 3
	model._spawn_enemy()
	var raider_interval := model._enemy_attack_interval()
	model.stage = 6
	model._spawn_enemy()
	_expect(model._enemy_attack_interval() > raider_interval, "巨槌重兵必須比快攻斥候更慢出手")
	_expect(model._attack_type_for_count(2) == "heavy", "巨槌重兵必須穩定使用重擊")
	model.journey_route = "village"
	model.stage = 6
	model._spawn_enemy()
	_expect(model._attack_type_for_count(1) == "area" and model._attack_type_for_count(3) == "sure_hit", "咒術師必須以範圍與必中術攻擊")
	model.stage = 9
	model._spawn_enemy()
	_expect(model.enemy_is_elite and model._route_phase() == "危機", "首領前必須有精英危機戰")

func _test_enemy_traits_and_boss_phases() -> void:
	var shield = CombatModelScript.new()
	shield.stage = 4
	shield._spawn_enemy()
	shield.enemy_max_hp = 1000.0
	shield.enemy_hp = 1000.0
	shield.enemy_armor = 0.0
	shield._events.clear()
	shield._deal_damage(100.0, "attack")
	_expect(is_equal_approx(shield.enemy_hp, 945.0) and shield.enemy_guard_stacks == 2, "盾衛必須以盾勢明確降低普通物理傷害")
	shield._deal_damage(100.0, "attack")
	shield._deal_damage(100.0, "attack")
	_expect(shield.enemy_guard_stacks == 0 and shield._events.any(func(event: Dictionary) -> bool: return event.type == "enemy_guard_broken"), "連續攻擊必須能打破盾衛防線")
	var magic = CombatModelScript.new()
	magic.stage = 4
	magic._spawn_enemy()
	magic.enemy_max_hp = 1000.0
	magic.enemy_hp = 1000.0
	magic.enemy_armor = 0.0
	magic._deal_damage(100.0, "magic_enchant")
	_expect(is_equal_approx(magic.enemy_hp, 900.0) and magic.enemy_guard_stacks == 3, "魔劍傷害必須能繞過盾衛的物理盾勢")
	var boss = CombatModelScript.new()
	boss.stage = 10
	boss._spawn_enemy()
	boss.enemy_max_hp = 100.0
	boss.enemy_hp = 100.0
	boss.enemy_armor = 0.0
	boss._events.clear()
	boss._deal_damage(31.0, "test")
	_expect(boss.boss_howl_triggered and boss.boss_empowered_attack, "Boss 降至 70% 生命時必須進入戰吼階段")
	_expect(boss._next_enemy_attack_type_id() == "heavy" and boss._events.any(func(event: Dictionary) -> bool: return event.type == "boss_howl"), "戰吼後下一擊必須明確預告為蓄力重擊")
	boss._enemy_attack("none")
	_expect(not boss.boss_empowered_attack and boss._events.any(func(event: Dictionary) -> bool: return event.type == "enemy_attack" and bool(event.empowered)), "戰吼強化只可消耗於下一次首領攻擊")

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
	model.training.agility = 20
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
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "swift_cut" and String(event.name) == "追斬"), "Lv.20 游刃有餘時每兩次普攻必須追加追斬")
	var finisher = CombatModelScript.new()
	finisher.training.agility = 20
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
	_expect(model.youren == 5 and model.shadow_assault_ready and model._events.any(func(event: Dictionary) -> bool: return event.type == "shadow_assault_ready"), "Lv.30 閃避後必須讓影襲進入可施放狀態")
	_expect(model._events.any(func(event: Dictionary) -> bool: return event.type == "opening"), "Lv.100 閃避後必須揭露乘隙破綻")
	model._events.clear()
	model._cast_skill("shadow_assault")
	_expect(not model.shadow_assault_ready and model._events.any(func(event: Dictionary) -> bool: return event.type == "shadow_assault"), "影襲必須是技能欄中的條件式主動技能")
	model._events.clear()
	model._deal_damage(100.0, "test")
	var damage_events: Array = model._events.filter(func(event: Dictionary) -> bool: return event.type == "damage")
	_expect(not damage_events.is_empty() and is_equal_approx(float(damage_events[0].amount), 125.0), "乘隙期間必須提高對該敵人的傷害")
	var swift = CombatModelScript.new()
	swift.training.agility = 10
	swift.enemy_hp = 99999.0
	swift.enemy_armor = 0.0
	swift._events.clear()
	swift._cast_skill("swift_cut")
	_expect(swift._events.any(func(event: Dictionary) -> bool: return event.type == "swift_cut" and int(event.hits) == 2 and String(event.name) == "雙燕疾斬"), "敏捷 Lv.10 雙燕疾斬必須造成兩段高速斬擊")
	_expect(is_equal_approx(float(swift.skill_cooldowns.swift_cut), 2.8), "雙燕疾斬必須使用 2.8 秒冷卻")

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
		swallow._cast_skill("shadow_assault")
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

func _test_first_area_progression_pace() -> void:
	var model = CombatModelScript.new()
	model.equip_item("black_iron_armor")
	var elapsed := 0.0
	var core_unlock_time := -1.0
	var retry_wait := 0.0
	var retry_count := 0
	while elapsed < 360.0 and not model.awaiting_journey_choice:
		if model.training_points > 0:
			model.spend_training("martial")
		if model.retry_pending:
			retry_wait += 1.0 / 60.0
			if retry_wait >= 5.0:
				model.retry_failed_stage()
				retry_wait = 0.0
				retry_count += 1
		model.step(1.0 / 60.0)
		elapsed += 1.0 / 60.0
		if core_unlock_time < 0.0 and model.effective_style_level("martial") >= 10:
			core_unlock_time = elapsed
	print("First area pace: core %.1fs, boss %.1fs, retries %d, stage %d/%d, Base Lv.%d" % [core_unlock_time, elapsed, retry_count, model.stage, model.retry_stage, model.base_style_level("martial")])
	print("First area deaths: %s" % str(model.slice_metrics.stage_deaths))
	if not model.last_failure_report.is_empty():
		print("First area last failure: %s" % str(model.last_failure_report))
	_expect(core_unlock_time >= 8.0 and core_unlock_time <= 45.0, "第一次流派成形應發生在玩家看懂 AUTO 後、首分鐘之前")
	_expect(model.awaiting_journey_choice and elapsed <= 360.0, "集中單修應能在六分鐘內完成第一區並進入 Boss 獎勵")
	_expect(not model.slice_metrics.stage_deaths.keys().any(func(value: Variant) -> bool: return int(value) < 10), "第一區前九戰必須能讓集中單修的新玩家穩定通過")
	_expect(retry_count <= 1, "第一區只允許 Boss 教學性戰敗一次，不可反覆卡關")
	_expect(model.base_style_level("martial") >= 10, "第一區結束前必須已形成至少一個完整流派核心")

func _test_navigation() -> void:
	var scene: Variant = load("res://main.tscn").instantiate()
	scene.persistence_enabled = false
	root.add_child(scene)
	await process_frame
	_expect(is_instance_valid(scene.start_overlay) and is_instance_valid(scene.new_game_button) and is_instance_valid(scene.continue_button), "開場必須提供新遊戲與讀取紀錄入口")
	_expect(not scene.start_overlay.visible and scene.game_started, "無存檔測試模式必須直接進入遊戲")
	_expect(scene.nav_buttons.size() == 5, "主分頁必須維持五個入口")
	_expect(scene.auto_slot_buttons.size() == 5, "AUTO 編成底層必須保留五格優先序")
	var visible_auto_slots := 0
	for button: Button in scene.auto_slot_buttons:
		if button.visible: visible_auto_slots += 1
	_expect(visible_auto_slots == 5, "手機戰鬥 HUD 必須呈現完整五格技能優先序")
	_expect(not scene.enemy_label.visible and not scene.enemy_bar.visible, "敵人說明與大型血條不可再佔據頂部戰鬥空間")
	_expect(not scene.mp_hud.visible and not scene.momentum_hud.visible and not scene.state_panel.visible, "未投入的流派資源不可預先出現在戰鬥 HUD")
	_expect(is_instance_valid(scene.training_alert_button) and scene.training_alert_button.text == "第一步：修練", "新遊戲必須把既有修練入口轉成第一個可操作目標")
	_expect(scene.objective_label.text.begins_with("第1區・第1關"), "戰鬥 HUD 必須持續顯示目前區域與關卡")
	_expect(scene.model.tutorial_step == "complete" and not scene.tutorial_overlay.visible, "新遊戲不可用連續講解框打斷 AUTO 戰鬥")
	var ui_font: Font = load("res://assets/fonts/NotoSansTC-Regular.otf")
	for character: String in ["教", "學", "裝", "備", "解", "鎖", "流", "派", "強", "化", "背", "包", "較"]:
		_expect(ui_font.has_char(character.unicode_at(0)), "中文字型子集必須保留目前介面用字：%s" % character)
	scene.model.tutorial_step = "spend"
	scene.model.training_points = 1
	scene._open_training()
	scene._highlight_training_choices()
	_expect(bool((scene.training_rows.martial.button as Button).get_meta("tutorial_pulsing", false)), "專注教學必須讓目前可操作的＋按鈕短暫亮起")
	scene._close_training()
	scene.model.tutorial_step = "complete"
	scene.toast_panel.visible = false
	scene.toast_title.text = ""
	var repetitive_events: Array[Dictionary] = [{"type": "momentum_full"}, {"type": "perfect_block", "prevented": 10.0}, {"type": "flow_state_entered"}]
	scene._handle_events(repetitive_events)
	_expect(not scene.toast_panel.visible and scene.toast_title.text.is_empty(), "高頻戰鬥觸發只能使用戰場特效，不可反覆跳出講解框")
	scene._spend_training("martial")
	_expect(scene.training_alert_button.text == "流派" and scene.experience_label.text.begins_with("成長") and not scene.toast_panel.visible and scene.toast_title.text.is_empty(), "普通修練升級只更新常駐成長資訊，不可反覆跳出提示")
	scene.model.training.martial = 9
	scene.model.training_points = 1
	scene._spend_training("martial")
	_expect("一刀流成形" in scene.toast_title.text and "累積勢" in scene.toast_detail.text, "有效武藝首次到 Lv.10 時必須說明一刀流核心循環")
	_expect(scene.battlefield._style_formed_burst == 1.0, "流派成形時戰場必須同步顯示低位移光環")
	_expect(is_instance_valid(scene.retry_button) and not scene.retry_button.visible, "未戰敗時不可顯示再次挑戰按鈕")
	_expect(is_instance_valid(scene.journey_overlay) and scene.journey_buttons.size() == 3, "Boss 後旅途抉擇必須提供三條手機可操作路線")
	_expect(scene.section_overlay.mouse_filter == Control.MOUSE_FILTER_IGNORE, "功能頁透明遮罩不可攔截底部分頁")
	_expect(is_instance_valid(scene.section_scroll), "功能頁內容必須可捲動")
	_expect(not scene.section_scroll.follow_focus and scene.section_scroll.scroll_deadzone >= 12, "手機滑動不可被卡片焦點搶走")
	scene.model.training.martial = 10
	scene.model.training.physique = 30
	scene.model.training.agility = 30
	scene.model.training.magic = 30
	scene.model.training.faith = 30
	scene.model.training.command = 30
	scene.model.equip_item("black_iron_sword")
	scene.model.momentum = 45.0
	scene.model.immovable = 2
	scene.model.youren = 3
	scene.model.magic_marks = 3
	scene.model.holy_seals = 3
	scene.model.military_momentum = 45.0
	scene.model.retry_pending = true
	scene.model.retry_stage = 8
	scene._update_hud(scene.model.snapshot())
	_expect(scene.failure_status.visible and scene.retry_button.visible and "第 8 戰" in scene.failure_button.text, "戰敗後必須以單一狀態條提供情報與再次挑戰")
	_expect(scene.failure_button.custom_minimum_size.y <= 30.0 and scene.retry_button.custom_minimum_size.y <= 30.0 and scene.retry_button.text == "再戰", "戰敗狀態列不得以大型按鈕壓縮戰場")
	_expect(scene.mp_hud.visible and scene.momentum_hud.visible and scene.immovable_hud.visible and scene.youren_hud.visible and scene.magic_hud.visible and scene.faith_hud.visible and scene.command_hud.visible, "六流派機制同時存在時，HUD 必須完整顯示")
	scene._open_training()
	await process_frame
	var martial_level_text := (scene.training_rows.martial.level as Label).text
	_expect("Base 10" in martial_level_text and "裝備 +5" in martial_level_text and "有效 15" in martial_level_text, "修練加點介面必須同時顯示 Base、裝備加成與有效等級")
	_expect("一閃劍路" in (scene.training_rows.martial.hint as Label).text, "修練介面必須直接顯示下一個重大劍技幻想")
	scene._close_training()
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
	_expect(scene.section_box.get_node_or_null("Signature_martial_10") != null and scene.section_box.get_node_or_null("Signature_martial_200") != null, "技能頁必須以 Lv.10～200 重大節點呈現流派劍技樹")
	_expect(scene.section_box.find_child("MilestoneTab_martial_30", true, false) != null, "武藝技能頁必須提供 Lv.30 重大劍技分頁")
	_expect(scene.section_box.get_node_or_null("MilestoneChoice_martial_10_concentrated_edge") != null, "武藝技能頁必須呈現目前重大劍技選擇")
	scene._switch_page("equipment")
	await process_frame
	_expect(scene.section_box.get_node_or_null("EquipmentDetail") != null, "裝備頁必須以欄位、選中詳情與背包呈現")
	scene.selected_equipment_id = "black_iron_sword"
	scene.model.gold = 1000
	scene._enhance_equipment("black_iron_sword")
	await process_frame
	await process_frame
	_expect(scene.selected_equipment_id == "black_iron_sword", "裝備強化後必須保留目前選中裝備")
	scene._switch_page("skills")
	scene._select_skill_tab("martial")
	await process_frame
	scene.section_scroll.scroll_vertical = 80
	await process_frame
	scene._update_hud(scene.model.snapshot())
	await process_frame
	await process_frame
	_expect(scene.section_scroll.scroll_vertical == 80, "技能或裝備頁更新後不可自動跳回頂部")
	scene._switch_page("combat")
	await process_frame
	_expect(not scene.section_overlay.visible, "返回戰鬥頁必須關閉功能面板")
	scene.queue_free()
	await process_frame

func _expect(condition: bool, message: String) -> void:
	if not condition:
		failures += 1
		printerr("FAIL: %s" % message)
