class_name Battlefield
extends Control

var reduced_motion := false
var momentum_ratio := 0.0
var enemy_armor_ratio := 0.0
var enemy_is_boss := false
var enemy_heavy_windup := false
var enemy_attack_type := "普通"
var immovable_level := 0
var return_blade_ready := false
var youren_level := 0
var shadowless_active := false
var magic_marks_level := 0
var burn_level := 0
var magic_release_active := false
var frost_level := 0
var lightning_level := 0
var magic_manifest_active := false
var complete_release_active := false
var trauma := 0.0
var _time := 0.0
var _hero_action := 0.0
var _heavy_slash := 0.0
var _ultimate_slash := 0.0
var _armor_flash := 0.0
var _execute_slash := 0.0
var _first_strike := 0.0
var _armor_break_flash := 0.0
var _block_flash := 0.0
var _perfect_block := 0.0
var _counter_slash := 0.0
var _collapse_counter := 0.0
var _heaven_return := 0.0
var _dodge_flash := 0.0
var _swift_step := 0.0
var _shadow_assault := 0.0
var _flying_swallow := 0.0
var _opening_flash := 0.0
var _shadowless_burst := 0.0
var _flow_burst := 0.0
var _swift_cut := 0.0
var _magic_enchant := 0.0
var _magic_slash := 0.0
var _flame_burst := 0.0
var _release_burst := 0.0
var _burn_pulse := 0.0
var _resonance_burst := 0.0
var _resonance_element := "fire"
var _boundary_slash := 0.0
var _boundary_element := "fire"
var _manifest_burst := 0.0
var _complete_release_burst := 0.0
var _manual_slash := 0.0
var _manual_slash_side := 1.0
var _momentum_pulse := 0.0
var _enemy_flash := 0.0
var _hero_flash := 0.0
var _damage_pool: Array[Label] = []
var _damage_cursor := 0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	for index in 8:
		var label := Label.new()
		label.visible = false
		label.z_index = 20
		label.add_theme_font_size_override("font_size", 24)
		label.add_theme_color_override("font_outline_color", Color("241b18"))
		label.add_theme_constant_override("outline_size", 5)
		add_child(label)
		_damage_pool.append(label)
	queue_redraw()

func _process(delta: float) -> void:
	_time += delta
	trauma = maxf(0.0, trauma - delta * 1.45)
	_hero_action = maxf(0.0, _hero_action - delta * 3.4)
	_heavy_slash = maxf(0.0, _heavy_slash - delta / 0.72)
	_ultimate_slash = maxf(0.0, _ultimate_slash - delta / 0.92)
	_armor_flash = maxf(0.0, _armor_flash - delta / 0.78)
	_execute_slash = maxf(0.0, _execute_slash - delta / 0.7)
	_first_strike = maxf(0.0, _first_strike - delta / 0.62)
	_armor_break_flash = maxf(0.0, _armor_break_flash - delta * 2.2)
	_block_flash = maxf(0.0, _block_flash - delta / 0.42)
	_perfect_block = maxf(0.0, _perfect_block - delta / 0.62)
	_counter_slash = maxf(0.0, _counter_slash - delta / 0.56)
	_collapse_counter = maxf(0.0, _collapse_counter - delta / 0.82)
	_heaven_return = maxf(0.0, _heaven_return - delta / 1.05)
	_dodge_flash = maxf(0.0, _dodge_flash - delta / 0.5)
	_swift_step = maxf(0.0, _swift_step - delta / 0.68)
	_shadow_assault = maxf(0.0, _shadow_assault - delta / 0.52)
	_flying_swallow = maxf(0.0, _flying_swallow - delta / 0.64)
	_opening_flash = maxf(0.0, _opening_flash - delta / 0.8)
	_shadowless_burst = maxf(0.0, _shadowless_burst - delta / 1.0)
	_flow_burst = maxf(0.0, _flow_burst - delta / 0.72)
	_swift_cut = maxf(0.0, _swift_cut - delta / 0.28)
	_magic_enchant = maxf(0.0, _magic_enchant - delta / 0.24)
	_magic_slash = maxf(0.0, _magic_slash - delta / 0.58)
	_flame_burst = maxf(0.0, _flame_burst - delta / 0.9)
	_release_burst = maxf(0.0, _release_burst - delta / 1.0)
	_burn_pulse = maxf(0.0, _burn_pulse - delta / 0.55)
	_resonance_burst = maxf(0.0, _resonance_burst - delta / 0.78)
	_boundary_slash = maxf(0.0, _boundary_slash - delta / 0.95)
	_manifest_burst = maxf(0.0, _manifest_burst - delta / 0.9)
	_complete_release_burst = maxf(0.0, _complete_release_burst - delta / 1.25)
	_manual_slash = maxf(0.0, _manual_slash - delta / 0.18)
	_momentum_pulse = maxf(0.0, _momentum_pulse - delta * 1.8)
	_enemy_flash = maxf(0.0, _enemy_flash - delta * 8.0)
	_hero_flash = maxf(0.0, _hero_flash - delta * 7.0)
	queue_redraw()

func set_state(snapshot: Dictionary) -> void:
	momentum_ratio = float(snapshot.momentum) / maxf(1.0, float(snapshot.max_momentum))
	enemy_armor_ratio = clampf(float(snapshot.enemy_armor) / 50.0, 0.0, 1.0)
	enemy_is_boss = bool(snapshot.enemy_is_boss)
	enemy_attack_type = String(snapshot.enemy_attack_type)
	enemy_heavy_windup = enemy_attack_type != "普通" and float(snapshot.enemy_attack_remaining) <= 0.8
	immovable_level = int(snapshot.immovable)
	return_blade_ready = bool(snapshot.return_blade_ready)
	youren_level = int(snapshot.youren)
	shadowless_active = float(snapshot.shadowless_remaining) > 0.0
	magic_marks_level = int(snapshot.magic_marks)
	burn_level = int(snapshot.burn_stacks)
	magic_release_active = float(snapshot.magic_release_remaining) > 0.0
	frost_level = int(snapshot.frost_stacks)
	lightning_level = int(snapshot.lightning_stacks)
	magic_manifest_active = bool(snapshot.magic_manifest_active)
	complete_release_active = float(snapshot.complete_release_remaining) > 0.0

func play_events(events: Array[Dictionary]) -> void:
	for event: Dictionary in events:
		match String(event.type):
			"attack":
				_hero_action = 0.5
			"manual_attack":
				_hero_action = 0.5
				_manual_slash = 1.0
				_manual_slash_side *= -1.0
				add_trauma(0.05)
			"heavy_slash", "mountain_break":
				_heavy_slash = 1.0
				add_trauma(0.62 if String(event.type) == "mountain_break" else 0.42)
			"draw_stance":
				_flow_burst = 1.0
			"two_cut":
				_ultimate_slash = 1.0
				add_trauma(0.72)
			"armor_flash":
				_armor_flash = 1.0
				add_trauma(0.5)
			"execute_slash":
				_execute_slash = 1.0
				add_trauma(0.58)
			"first_strike":
				_first_strike = 1.0
				add_trauma(0.46)
			"armor_broken":
				_armor_break_flash = 1.0
			"return_blade":
				_block_flash = maxf(_block_flash, 0.45)
			"block":
				_block_flash = 1.0
				add_trauma(0.1)
			"perfect_block":
				_perfect_block = 1.0
				add_trauma(0.28)
			"counter":
				_counter_slash = 1.0
				add_trauma(0.32)
			"collapse_counter":
				_collapse_counter = 1.0
				add_trauma(0.62)
			"heaven_return":
				_heaven_return = 1.0
				add_trauma(0.86)
			"immovable_king":
				_perfect_block = 1.0
				add_trauma(0.2)
			"dodge":
				_dodge_flash = 1.0
			"swift_step_ready":
				_dodge_flash = maxf(_dodge_flash, 0.35)
			"swift_step":
				_swift_step = 1.0
				add_trauma(0.22)
			"shadow_assault":
				_shadow_assault = 1.0
				add_trauma(0.25)
			"flying_swallow":
				_flying_swallow = 1.0
				add_trauma(0.34)
			"opening":
				_opening_flash = 1.0
			"shadowless", "shadowless_extreme":
				_shadowless_burst = 1.0
				add_trauma(0.65 if String(event.type) == "shadowless_extreme" else 0.45)
			"flow_state_entered":
				_flow_burst = 1.0
				add_trauma(0.08)
			"swift_cut":
				_swift_cut = 1.0
				add_trauma(0.12)
			"magic_enchant":
				_magic_enchant = 1.0
			"magic_slash":
				_magic_slash = 1.0
				add_trauma(0.24)
			"burn_tick":
				_burn_pulse = 1.0
			"flame_burst_slash":
				_flame_burst = 1.0
				add_trauma(0.62)
			"magic_sword_release":
				_release_burst = 1.0
				add_trauma(0.34)
			"elemental_resonance", "minor_resonance":
				_resonance_burst = 1.0
				_resonance_element = String(event.get("element", "fire"))
				add_trauma(0.34 if String(event.type) == "elemental_resonance" else 0.14)
			"elemental_boundary_slash":
				_boundary_slash = 1.0
				_boundary_element = String(event.get("element", "fire"))
				add_trauma(0.58)
			"magic_sword_manifestation":
				_manifest_burst = 1.0
				add_trauma(0.24)
			"magic_sword_complete_release":
				_complete_release_burst = 1.0
				add_trauma(0.82)
			"momentum_full":
				_momentum_pulse = 1.0
			"no_beat":
				_momentum_pulse = 1.0
			"remaining_heart":
				_momentum_pulse = maxf(_momentum_pulse, 0.5)
			"damage":
				_enemy_flash = 1.0
				_spawn_damage(float(event.amount), String(event.source))
			"hero_hit":
				_hero_flash = 1.0
				add_trauma(0.16)

func add_trauma(amount: float) -> void:
	if reduced_motion:
		return
	trauma = clampf(trauma + amount, 0.0, 1.0)

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color("17251f"))
	for band in 7:
		var y := size.y * float(band) / 7.0
		var color := Color("1d3028").lerp(Color("6b4c2f"), float(band) / 7.0)
		draw_rect(Rect2(0.0, y, size.x, size.y / 7.0 + 1.0), color)
	_draw_forest()
	var shake := trauma * trauma
	var shake_offset := Vector2(sin(_time * 31.0) * 10.0, sin(_time * 43.0) * 7.0) * shake
	var enemy_pos := Vector2(size.x * 0.68, size.y * 0.36) + shake_offset
	var hero_pos := Vector2(size.x * 0.33, size.y * 0.68) + shake_offset
	var lunge := sin(_hero_action * PI) * minf(size.x * 0.16, 72.0)
	var heavy_lunge := sin(_heavy_slash * PI) * minf(size.x * 0.22, 92.0)
	var ultimate_lunge := sin(_ultimate_slash * PI) * minf(size.x * 0.27, 110.0)
	var armor_lunge := sin(_armor_flash * PI) * minf(size.x * 0.24, 96.0)
	var execute_lunge := sin(_execute_slash * PI) * minf(size.x * 0.28, 112.0)
	var first_lunge := sin(_first_strike * PI) * minf(size.x * 0.3, 120.0)
	var counter_lunge := sin(_counter_slash * PI) * minf(size.x * 0.2, 84.0)
	var collapse_lunge := sin(_collapse_counter * PI) * minf(size.x * 0.25, 104.0)
	var heaven_lunge := sin(_heaven_return * PI) * minf(size.x * 0.28, 114.0)
	var agility_lunge := sin(maxf(maxf(_swift_step, _shadow_assault), _swift_cut) * PI) * minf(size.x * 0.3, 120.0)
	var dodge_shift := sin(_dodge_flash * PI) * minf(size.x * 0.15, 64.0)
	hero_pos.x += lunge + heavy_lunge + ultimate_lunge + armor_lunge + execute_lunge + first_lunge + counter_lunge + collapse_lunge + heaven_lunge + agility_lunge - dodge_shift
	_draw_enemy(enemy_pos)
	_draw_afterimages(hero_pos)
	_draw_hero(hero_pos)
	_draw_skill_fx(hero_pos, enemy_pos)

func _draw_forest() -> void:
	for index in 9:
		var x := size.x * (float(index) / 8.0)
		var height := 48.0 + float((index * 23) % 64)
		draw_rect(Rect2(x - 7.0, size.y * 0.52 - height, 14.0, height), Color("26382b"))
		draw_circle(Vector2(x, size.y * 0.52 - height), 34.0, Color("304b35"))
	for index in 16:
		var x := fmod(float(index * 71), maxf(size.x, 1.0))
		var y := size.y * 0.53 + fmod(float(index * 37), size.y * 0.25)
		draw_circle(Vector2(x, y), 2.0, Color("d4aa62", 0.42))

func _draw_hero(origin: Vector2) -> void:
	var bob := sin(_time * 4.2) * 2.0
	var color := Color.WHITE if _hero_flash > 0.0 else Color("d7b071")
	if momentum_ratio > 0.68:
		var aura_alpha := (momentum_ratio - 0.68) * 1.2 + _momentum_pulse * 0.32
		draw_arc(origin + Vector2(0.0, -34.0), 50.0 + sin(_time * 8.0) * 3.0, 0.0, TAU, 32, Color("f1bb54", aura_alpha), 4.0)
	if immovable_level > 0 or return_blade_ready:
		var guard_alpha := 0.35 + float(immovable_level) * 0.16 + (0.25 if return_blade_ready else 0.0)
		draw_arc(origin + Vector2(-4, -32), 45.0 + float(immovable_level) * 4.0, -2.35, 0.65, 28, Color("9ee7f2", guard_alpha), 5.0)
		for index in immovable_level:
			draw_circle(origin + Vector2(-26.0 + float(index) * 26.0, 30.0), 6.0, Color("bceef4", 0.9))
	if magic_marks_level > 0 or magic_release_active or magic_manifest_active:
		var magic_alpha := 0.18 + float(magic_marks_level) * 0.07 + (0.28 if magic_release_active else 0.0) + (0.18 if magic_manifest_active else 0.0)
		var aura_color := Color("fff2c7") if complete_release_active else Color("ff8a45")
		draw_arc(origin + Vector2(5, -38), 42.0 + sin(_time * 7.0) * 3.0, -2.6, 0.6, 28, Color(aura_color, magic_alpha), 7.0 if magic_manifest_active else 5.0)
		for index in magic_marks_level:
			var angle := _time * 0.8 + float(index) * TAU / 5.0
			draw_circle(origin + Vector2(0, -35) + Vector2.from_angle(angle) * 48.0, 3.5, Color("ffd09c", 0.9))
	draw_polygon(PackedVector2Array([origin + Vector2(-26, 18 + bob), origin + Vector2(20, 15 + bob), origin + Vector2(16, -36 + bob), origin + Vector2(-18, -42 + bob)]), PackedColorArray([Color("7d2f2a")]))
	draw_circle(origin + Vector2(0, -55 + bob), 18.0, color)
	draw_polygon(PackedVector2Array([origin + Vector2(-20, -58 + bob), origin + Vector2(0, -82 + bob), origin + Vector2(21, -58 + bob)]), PackedColorArray([Color("495a63")]))
	draw_line(origin + Vector2(16, -34 + bob), origin + Vector2(52, -72 + bob), Color("e9e0c8"), 7.0)
	draw_line(origin + Vector2(52, -72 + bob), origin + Vector2(60, -82 + bob), Color("fff2be"), 3.0)
	draw_circle(origin + Vector2(-22, -16 + bob), 19.0, Color("596b71"))
	draw_arc(origin + Vector2(-22, -16 + bob), 14.0, 0.0, TAU, 24, Color("c99b4f"), 3.0)

func _draw_enemy(origin: Vector2) -> void:
	var bob := sin(_time * 3.2) * 3.0
	var skin := Color.WHITE if _enemy_flash > 0.0 else Color("71964a")
	if enemy_heavy_windup:
		var pulse := 0.55 + sin(_time * 14.0) * 0.18
		var warning_color := Color("e85a3d") if enemy_attack_type == "重擊" else (Color("b76be0") if enemy_attack_type == "範圍" else Color("f0d55a"))
		draw_arc(origin + Vector2(0, -30 + bob), 68.0, 0.0, TAU, 32, Color(warning_color, pulse), 7.0)
	if burn_level > 0:
		for index in mini(burn_level, 5):
			var flame_x := -24.0 + float(index) * 12.0
			var flame_height := 14.0 + sin(_time * 11.0 + float(index)) * 5.0
			draw_polygon(PackedVector2Array([origin + Vector2(flame_x - 5.0, 24.0), origin + Vector2(flame_x, 24.0 - flame_height), origin + Vector2(flame_x + 5.0, 24.0)]), PackedColorArray([Color("f47a32", 0.62 + float(burn_level) * 0.05)]))
	if frost_level > 0:
		for index in frost_level:
			var angle := float(index) * TAU / 5.0 + _time * 0.15
			var point := origin + Vector2(0, -30) + Vector2.from_angle(angle) * 48.0
			draw_polygon(PackedVector2Array([point + Vector2(0, -8), point + Vector2(6, 6), point + Vector2(-6, 6)]), PackedColorArray([Color("9eeaff", 0.75)]))
	if lightning_level > 0:
		for index in lightning_level:
			var x := -30.0 + float(index) * 15.0
			draw_polyline(PackedVector2Array([origin + Vector2(x, -82), origin + Vector2(x + 7, -65), origin + Vector2(x - 2, -48)]), Color("e7c8ff", 0.72), 3.0)
	draw_circle(origin + Vector2(0, -46 + bob), 30.0, skin)
	draw_polygon(PackedVector2Array([origin + Vector2(-30, -52 + bob), origin + Vector2(-54, -67 + bob), origin + Vector2(-27, -31 + bob)]), PackedColorArray([skin]))
	draw_polygon(PackedVector2Array([origin + Vector2(30, -52 + bob), origin + Vector2(54, -67 + bob), origin + Vector2(27, -31 + bob)]), PackedColorArray([skin]))
	draw_circle(origin + Vector2(-10, -51 + bob), 4.5, Color("f6d56a"))
	draw_circle(origin + Vector2(10, -51 + bob), 4.5, Color("f6d56a"))
	draw_polygon(PackedVector2Array([origin + Vector2(-28, -20 + bob), origin + Vector2(30, -20 + bob), origin + Vector2(38, 31 + bob), origin + Vector2(-38, 31 + bob)]), PackedColorArray([Color("4d382d")]))
	draw_line(origin + Vector2(-27, 5 + bob), origin + Vector2(-52, 42 + bob), Color("8f6743"), 8.0)
	draw_line(origin + Vector2(27, 5 + bob), origin + Vector2(52, 42 + bob), Color("8f6743"), 8.0)
	if enemy_armor_ratio > 0.05:
		var armor_color := Color("e7eff2") if _armor_break_flash > 0.0 else Color("778a93")
		draw_arc(origin + Vector2(0, -16 + bob), 47.0, -2.65, -0.48, 18, armor_color, 5.0 + enemy_armor_ratio * 5.0)
		draw_arc(origin + Vector2(0, -16 + bob), 47.0, 0.48, 2.65, 18, armor_color, 5.0 + enemy_armor_ratio * 5.0)
	if enemy_is_boss:
		draw_polyline(PackedVector2Array([origin + Vector2(-24, -86 + bob), origin + Vector2(-13, -105 + bob), origin + Vector2(0, -89 + bob), origin + Vector2(14, -107 + bob), origin + Vector2(25, -86 + bob)]), Color("e6bd62"), 7.0)

func _draw_afterimages(origin: Vector2) -> void:
	var count := 0
	if youren_level > 0:
		count = mini(2, 1 + floori(float(youren_level) / 3.0))
	if shadowless_active:
		count = 4
	for index in count:
		var distance := 20.0 + float(index) * 18.0
		var offset := Vector2(-distance, sin(_time * 9.0 + float(index)) * 7.0)
		var alpha := 0.12 + float(count - index) * 0.045
		draw_polygon(PackedVector2Array([origin + offset + Vector2(-20, 15), origin + offset + Vector2(16, 13), origin + offset + Vector2(13, -34), origin + offset + Vector2(-15, -38)]), PackedColorArray([Color("8c72cf", alpha)]))
		draw_circle(origin + offset + Vector2(0, -52), 15.0, Color("d9ceff", alpha))

func _draw_skill_fx(hero_pos: Vector2, enemy_pos: Vector2) -> void:
	if _heavy_slash > 0.0:
		var phase := 1.0 - _heavy_slash
		var alpha := sin(clampf(phase * 1.7, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.63)
		draw_arc(center, 74.0, -2.2, 0.45, 28, Color("fff0a3", alpha), 12.0)
		draw_arc(center, 58.0, -2.2, 0.45, 24, Color("f29a3d", alpha * 0.8), 5.0)
	if _ultimate_slash > 0.0:
		var phase := 1.0 - _ultimate_slash
		var alpha := sin(clampf(phase * 1.55, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.62)
		draw_arc(center, 100.0, -2.35, 0.55, 36, Color("fff7c7", alpha), 16.0)
		draw_arc(center + Vector2(12, -5), 86.0, 2.35, 5.45, 36, Color("e88136", alpha * 0.9), 10.0)
		draw_circle(center, 24.0 * alpha, Color("fff3a0", alpha * 0.45))
	if _armor_flash > 0.0:
		var phase := 1.0 - _armor_flash
		var alpha := sin(clampf(phase * 1.7, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.7)
		draw_line(center + Vector2(-64, 58), center + Vector2(65, -62), Color("dff7ff", alpha), 13.0)
		draw_line(center + Vector2(-54, 65), center + Vector2(73, -54), Color("69b7cf", alpha * 0.85), 5.0)
		for index in 4:
			var angle := float(index) * 1.35 + phase * 2.0
			draw_circle(enemy_pos + Vector2.from_angle(angle) * (35.0 + phase * 48.0), 5.0, Color("b8d5dd", alpha))
	if _execute_slash > 0.0:
		var phase := 1.0 - _execute_slash
		var alpha := sin(clampf(phase * 1.8, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.66)
		draw_arc(center, 86.0, -1.1, 1.12, 28, Color("fff1d0", alpha), 15.0)
		draw_arc(center, 70.0, -1.1, 1.12, 24, Color("be3b32", alpha * 0.9), 7.0)
	if _first_strike > 0.0:
		var phase := 1.0 - _first_strike
		var alpha := sin(clampf(phase * 2.0, 0.0, 1.0) * PI)
		draw_line(hero_pos + Vector2(12, -46), enemy_pos + Vector2(14, -48), Color("f5ffff", alpha), 11.0)
		draw_line(hero_pos + Vector2(2, -34), enemy_pos + Vector2(28, -61), Color("7ed5e3", alpha * 0.7), 4.0)
	if _block_flash > 0.0 or _perfect_block > 0.0:
		var strength := maxf(_block_flash, _perfect_block)
		var phase := 1.0 - strength
		var alpha := sin(clampf(phase * 1.8, 0.0, 1.0) * PI)
		var radius := 48.0 + phase * 22.0
		draw_arc(hero_pos + Vector2(4, -36), radius, -1.55, 1.55, 28, Color("f4ffff", alpha), 10.0 if _perfect_block > 0.0 else 6.0)
		draw_arc(hero_pos + Vector2(4, -36), radius + 9.0, -1.55, 1.55, 28, Color("64c7d8", alpha * 0.75), 4.0)
		if _perfect_block > 0.0:
			for index in 6:
				var angle := -1.4 + float(index) * 0.55
				draw_line(hero_pos + Vector2.from_angle(angle) * 54.0, hero_pos + Vector2.from_angle(angle) * 82.0, Color("eaffff", alpha), 4.0)
	if _counter_slash > 0.0:
		var phase := 1.0 - _counter_slash
		var alpha := sin(clampf(phase * 1.9, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.6)
		draw_arc(center, 68.0, -2.0, 0.5, 26, Color("eaffff", alpha), 11.0)
		draw_arc(center, 56.0, -2.0, 0.5, 22, Color("61b8ca", alpha * 0.85), 5.0)
	if _collapse_counter > 0.0:
		var phase := 1.0 - _collapse_counter
		var alpha := sin(clampf(phase * 1.65, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.64)
		draw_circle(hero_pos + Vector2(0, -34), 62.0 * alpha, Color("73c6d4", alpha * 0.22))
		draw_line(center + Vector2(-74, 56), center + Vector2(72, -62), Color("efffff", alpha), 16.0)
		draw_line(center + Vector2(-58, 70), center + Vector2(86, -48), Color("4ba1b3", alpha * 0.9), 7.0)
	if _heaven_return > 0.0:
		var phase := 1.0 - _heaven_return
		var alpha := sin(clampf(phase * 1.5, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.58)
		draw_arc(hero_pos + Vector2(0, -35), 90.0 + phase * 28.0, -2.5, 0.75, 36, Color("eaffff", alpha), 18.0)
		draw_line(center + Vector2(-96, 74), center + Vector2(94, -82), Color("ffffff", alpha), 20.0)
		draw_circle(center, 32.0 * alpha, Color("81ddea", alpha * 0.5))
	if _dodge_flash > 0.0:
		var phase := 1.0 - _dodge_flash
		var alpha := sin(clampf(phase * 1.8, 0.0, 1.0) * PI)
		for index in 3:
			var y := -68.0 + float(index) * 24.0
			draw_line(hero_pos + Vector2(-64, y), hero_pos + Vector2(-10, y - 8), Color("c8b9ff", alpha * (0.75 - float(index) * 0.12)), 4.0)
	if _swift_step > 0.0:
		var phase := 1.0 - _swift_step
		var alpha := sin(clampf(phase * 1.8, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.63)
		draw_line(hero_pos + Vector2(-70, -45), enemy_pos + Vector2(35, -50), Color("f1edff", alpha), 8.0)
		draw_arc(center, 58.0, -2.3, 0.25, 24, Color("9d83e8", alpha), 7.0)
	if _shadow_assault > 0.0:
		var phase := 1.0 - _shadow_assault
		var alpha := sin(clampf(phase * 2.0, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.72)
		draw_arc(center, 64.0, 1.8, 4.8, 26, Color("eee9ff", alpha), 10.0)
		draw_line(center + Vector2(-42, 42), center + Vector2(48, -48), Color("8165cf", alpha * 0.85), 5.0)
	if _swift_cut > 0.0:
		var phase := 1.0 - _swift_cut
		var alpha := sin(clampf(phase * 2.2, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.68)
		draw_line(center + Vector2(-46, 34), center + Vector2(48, -38), Color("f6f2ff", alpha), 8.0)
		draw_line(center + Vector2(-32, -42), center + Vector2(42, 30), Color("9d83e8", alpha * 0.9), 5.0)
	if _flying_swallow > 0.0:
		var phase := 1.0 - _flying_swallow
		var alpha := sin(clampf(phase * 1.9, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.7)
		draw_arc(center + Vector2(18, -4), 76.0, -1.2, 1.55, 28, Color("c2afff", alpha), 9.0)
	if _opening_flash > 0.0:
		var alpha := _opening_flash * 0.55
		draw_arc(enemy_pos + Vector2(0, -34), 52.0 + (1.0 - _opening_flash) * 14.0, 0.0, TAU, 28, Color("c49aff", alpha), 4.0)
	if _shadowless_burst > 0.0:
		var phase := 1.0 - _shadowless_burst
		var alpha := sin(clampf(phase * 1.5, 0.0, 1.0) * PI)
		draw_arc(hero_pos + Vector2(0, -35), 78.0 + phase * 34.0, 0.0, TAU, 36, Color("d9ccff", alpha), 8.0)
	if _flow_burst > 0.0:
		var phase := 1.0 - _flow_burst
		var alpha := sin(clampf(phase * 1.6, 0.0, 1.0) * PI)
		draw_arc(hero_pos + Vector2(0, -35), 56.0 + phase * 24.0, 0.0, TAU, 32, Color("d8ccff", alpha), 6.0)
	if _magic_enchant > 0.0:
		var alpha := sin((1.0 - _magic_enchant) * PI)
		draw_line(hero_pos + Vector2(25, -48), enemy_pos + Vector2(-16, -42), Color("ffad68", alpha * 0.7), 4.0)
	if _magic_slash > 0.0:
		var phase := 1.0 - _magic_slash
		var alpha := sin(clampf(phase * 1.8, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.62)
		draw_arc(center, 78.0 + phase * 18.0, -2.3, 0.45, 30, Color("fff0c2", alpha), 12.0)
		draw_arc(center, 62.0, -2.3, 0.45, 26, Color("f06a32", alpha * 0.9), 6.0)
	if _burn_pulse > 0.0:
		var alpha := sin((1.0 - _burn_pulse) * PI)
		draw_circle(enemy_pos + Vector2(0, -26), 36.0 * alpha, Color("ef5d2f", alpha * 0.3))
	if _flame_burst > 0.0:
		var phase := 1.0 - _flame_burst
		var alpha := sin(clampf(phase * 1.45, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.7)
		draw_circle(center, (28.0 + phase * 92.0) * alpha, Color("ff7a32", alpha * 0.42))
		draw_arc(center, 54.0 + phase * 76.0, 0.0, TAU, 36, Color("fff0b2", alpha), 14.0)
		draw_line(hero_pos + Vector2(8, -42), enemy_pos + Vector2(18, -52), Color("ffffff", alpha), 16.0)
	if _release_burst > 0.0:
		var phase := 1.0 - _release_burst
		var alpha := sin(clampf(phase * 1.5, 0.0, 1.0) * PI)
		draw_arc(hero_pos + Vector2(0, -36), 62.0 + phase * 48.0, 0.0, TAU, 36, Color("ffad68", alpha), 9.0)
		draw_arc(hero_pos + Vector2(0, -36), 46.0 + phase * 34.0, 0.0, TAU, 32, Color("fff4c7", alpha * 0.8), 5.0)
	if _resonance_burst > 0.0:
		var phase := 1.0 - _resonance_burst
		var alpha := sin(clampf(phase * 1.65, 0.0, 1.0) * PI)
		var color := Color("a8efff") if _resonance_element == "ice" else (Color("d6a7ff") if _resonance_element == "lightning" else Color("ff9a52"))
		draw_arc(enemy_pos + Vector2(0, -34), 42.0 + phase * 82.0, 0.0, TAU, 34, Color(color, alpha), 10.0)
		draw_circle(enemy_pos + Vector2(0, -34), 34.0 * alpha, Color(color, alpha * 0.28))
	if _boundary_slash > 0.0:
		var phase := 1.0 - _boundary_slash
		var alpha := sin(clampf(phase * 1.45, 0.0, 1.0) * PI)
		var color := Color("9eeaff") if _boundary_element == "ice" else (Color("d5a2ff") if _boundary_element == "lightning" else Color("ff8c45"))
		var center := hero_pos.lerp(enemy_pos, 0.64)
		draw_line(center + Vector2(-92, 74), center + Vector2(96, -82), Color("ffffff", alpha), 19.0)
		draw_arc(center, 104.0, -2.35, 0.55, 36, Color(color, alpha), 13.0)
	if _manifest_burst > 0.0:
		var phase := 1.0 - _manifest_burst
		var alpha := sin(clampf(phase * 1.6, 0.0, 1.0) * PI)
		draw_arc(hero_pos + Vector2(0, -36), 66.0 + phase * 36.0, 0.0, TAU, 36, Color("ffd49c", alpha), 9.0)
	if _complete_release_burst > 0.0:
		var phase := 1.0 - _complete_release_burst
		var alpha := sin(clampf(phase * 1.35, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.55)
		for index in 3:
			var color: Color = [Color("ff8a45"), Color("9eeaff"), Color("d5a2ff")][index]
			draw_arc(center, 82.0 + float(index) * 24.0 + phase * 62.0, 0.0, TAU, 40, Color(color, alpha * (1.0 - float(index) * 0.15)), 12.0)
		draw_line(hero_pos + Vector2(-20, 18), enemy_pos + Vector2(32, -76), Color("ffffff", alpha), 24.0)
	if _manual_slash > 0.0:
		var phase := 1.0 - _manual_slash
		var alpha := sin(clampf(phase * 2.4, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.58)
		var diagonal := Vector2(50.0, 58.0 * _manual_slash_side)
		draw_line(center - diagonal, center + diagonal, Color("ffe8a8", alpha), 7.0)

func _spawn_damage(amount: float, source: String) -> void:
	var label := _damage_pool[_damage_cursor]
	_damage_cursor = (_damage_cursor + 1) % _damage_pool.size()
	label.visible = true
	label.modulate = Color.WHITE
	var large := source in ["heavy_slash", "mountain_break", "armor_flash", "execute_slash", "first_strike", "collapse_counter", "heaven_return", "swift_step", "shadow_assault", "flying_swallow", "swallow_return", "second_shadow", "shadowless_extreme", "two_cut", "magic_slash", "flame_burst_slash", "elemental_resonance", "elemental_boundary_slash", "minor_resonance"]
	label.scale = Vector2(1.75, 1.75) if source == "two_cut" else (Vector2(1.4, 1.4) if large else Vector2.ONE)
	label.text = str(roundi(amount))
	var color := Color("fff0a3") if source == "two_cut" else (Color("d7b2ff") if source in ["lightning_tick", "lightning_chain"] else (Color("a9edff") if source in ["elemental_resonance", "minor_resonance"] else (Color("ffb16f") if source in ["magic_enchant", "magic_slash", "burn_tick", "flame_burst_slash", "elemental_boundary_slash"] else (Color("f7c0b7") if source == "execute_slash" else (Color("d9ccff") if source in ["swift_step", "swift_cut", "shadow_assault", "flying_swallow", "swallow_return", "second_shadow", "shadowless_extreme", "critical_attack"] else (Color("c7f6ff") if source in ["armor_flash", "first_strike", "counter", "collapse_counter", "heaven_return"] else (Color("ffe07a") if large else Color("f4eee0"))))))))
	label.add_theme_color_override("font_color", color)
	label.position = Vector2(size.x * 0.64 + randf_range(-18.0, 18.0), size.y * 0.28)
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position:y", label.position.y - 58.0, 0.62).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property(label, "modulate:a", 0.0, 0.62).set_delay(0.18)
	tween.tween_property(label, "scale", Vector2.ONE, 0.18).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tween.chain().tween_callback(func() -> void: label.visible = false)
