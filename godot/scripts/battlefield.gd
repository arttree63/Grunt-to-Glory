class_name Battlefield
extends Control

var reduced_motion := false
var momentum_ratio := 0.0
var enemy_armor_ratio := 0.0
var enemy_is_boss := false
var trauma := 0.0
var _time := 0.0
var _hero_action := 0.0
var _heavy_slash := 0.0
var _ultimate_slash := 0.0
var _armor_flash := 0.0
var _execute_slash := 0.0
var _first_strike := 0.0
var _armor_break_flash := 0.0
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
	_momentum_pulse = maxf(0.0, _momentum_pulse - delta * 1.8)
	_enemy_flash = maxf(0.0, _enemy_flash - delta * 8.0)
	_hero_flash = maxf(0.0, _hero_flash - delta * 7.0)
	queue_redraw()

func set_state(snapshot: Dictionary) -> void:
	momentum_ratio = float(snapshot.momentum) / maxf(1.0, float(snapshot.max_momentum))
	enemy_armor_ratio = clampf(float(snapshot.enemy_armor) / 50.0, 0.0, 1.0)
	enemy_is_boss = bool(snapshot.enemy_is_boss)

func play_events(events: Array[Dictionary]) -> void:
	for event: Dictionary in events:
		match String(event.type):
			"attack":
				_hero_action = 0.5
			"heavy_slash":
				_heavy_slash = 1.0
				add_trauma(0.42)
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
	hero_pos.x += lunge + heavy_lunge + ultimate_lunge + armor_lunge + execute_lunge + first_lunge
	_draw_enemy(enemy_pos)
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

func _spawn_damage(amount: float, source: String) -> void:
	var label := _damage_pool[_damage_cursor]
	_damage_cursor = (_damage_cursor + 1) % _damage_pool.size()
	label.visible = true
	label.modulate = Color.WHITE
	var large := source in ["heavy_slash", "armor_flash", "execute_slash", "first_strike", "two_cut"]
	label.scale = Vector2(1.75, 1.75) if source == "two_cut" else (Vector2(1.4, 1.4) if large else Vector2.ONE)
	label.text = str(roundi(amount))
	var color := Color("fff0a3") if source == "two_cut" else (Color("f7c0b7") if source == "execute_slash" else (Color("bfeeff") if source in ["armor_flash", "first_strike"] else (Color("ffe07a") if large else Color("f4eee0"))))
	label.add_theme_color_override("font_color", color)
	label.position = Vector2(size.x * 0.64 + randf_range(-18.0, 18.0), size.y * 0.28)
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position:y", label.position.y - 58.0, 0.62).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property(label, "modulate:a", 0.0, 0.62).set_delay(0.18)
	tween.tween_property(label, "scale", Vector2.ONE, 0.18).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tween.chain().tween_callback(func() -> void: label.visible = false)
