class_name Battlefield
extends Control

const GORGE_BACKGROUND := preload("res://assets/visual/battle_hud_v2/ruins-arena.png")
const RECRUIT_TEXTURE := preload("res://assets/visual/battle_hud_v2/hero-back.png")
const GRAY_WOLF_TEXTURE := preload("res://assets/visual/battle_hud_v2/gray-wolf.png")
const TARGET_RING_TEXTURE := preload("res://assets/visual/battle_hud_v2/target-ring.png")
const HERO_SLASH_FRAMES := [
	preload("res://assets/visual/animations/hero/slash-v1/attack-1.png"),
	preload("res://assets/visual/animations/hero/slash-v1/attack-2.png"),
	preload("res://assets/visual/animations/hero/slash-v1/attack-3.png"),
	preload("res://assets/visual/animations/hero/slash-v1/attack-4.png"),
	preload("res://assets/visual/animations/hero/slash-v1/attack-5.png"),
	preload("res://assets/visual/animations/hero/slash-v1/attack-6.png"),
]
const HERO_BLOCK_FRAMES := [
	preload("res://assets/visual/animations/hero/block-v1/block-1.png"),
	preload("res://assets/visual/animations/hero/block-v1/block-2.png"),
	preload("res://assets/visual/animations/hero/block-v1/block-3.png"),
	preload("res://assets/visual/animations/hero/block-v1/block-4.png"),
]
const HERO_DODGE_FRAMES := [
	preload("res://assets/visual/animations/hero/dodge-v1/dodge-1.png"),
	preload("res://assets/visual/animations/hero/dodge-v1/dodge-2.png"),
	preload("res://assets/visual/animations/hero/dodge-v1/dodge-3.png"),
	preload("res://assets/visual/animations/hero/dodge-v1/dodge-4.png"),
	preload("res://assets/visual/animations/hero/dodge-v1/dodge-5.png"),
	preload("res://assets/visual/animations/hero/dodge-v1/dodge-6.png"),
]
const WOLF_POUNCE_FRAMES := [
	preload("res://assets/visual/animations/wolf/pounce-v1/attack-1.png"),
	preload("res://assets/visual/animations/wolf/pounce-v1/attack-2.png"),
	preload("res://assets/visual/animations/wolf/pounce-v1/attack-3.png"),
	preload("res://assets/visual/animations/wolf/pounce-v1/attack-4.png"),
	preload("res://assets/visual/animations/wolf/pounce-v1/attack-5.png"),
	preload("res://assets/visual/animations/wolf/pounce-v1/attack-6.png"),
]

var reduced_motion := false
var momentum_ratio := 0.0
var enemy_armor_ratio := 0.0
var enemy_is_boss := false
var enemy_heavy_windup := false
var enemy_windup_ratio := 0.0
var hero_attack_windup_ratio := 0.0
var enemy_attack_type := "普通"
var enemy_archetype := "grunt"
var journey_route := "frontier"
var immovable_level := 0
var return_blade_ready := false
var guard_stance_active := false
var youren_level := 0
var shadowless_active := false
var magic_marks_level := 0
var burn_level := 0
var magic_release_active := false
var frost_level := 0
var lightning_level := 0
var magic_manifest_active := false
var complete_release_active := false
var ally_count := 0
var trauma := 0.0
var stage_top := 160.0
var stage_bottom := 610.0
var _time := 0.0
var _hero_action := 0.0
var _hero_slash_motion := 0.0
var _hero_block_motion := 0.0
var _hero_dodge_motion := 0.0
var _enemy_attack_recover := 0.0
var _enemy_death_motion := 0.0
var _heavy_slash := 0.0
var _heavy_strike_power := 0.0
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
var _flow_burst_strength := 0.0
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
var _ally_action := 0.0
var _momentum_pulse := 0.0
var _enemy_flash := 0.0
var _hero_flash := 0.0
var _visual_freeze_remaining := 0.0
var _enemy_knockback := 0.0
var _hero_recoil := 0.0
var _impact_burst := 0.0
var _impact_strength := 0.0
var _impact_color := Color("fff0b0")
var _hurt_vignette := 0.0
var _defeat_burst := 0.0
var _defeat_was_boss := false
var _damage_pool: Array[Label] = []
var _damage_cursor := 0
var _sfx_streams: Dictionary = {}
var _sfx_players: Array[AudioStreamPlayer] = []
var _sfx_cursor := 0

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
	_sfx_streams = {
		"light": _make_sfx("light"),
		"medium": _make_sfx("medium"),
		"heavy": _make_sfx("heavy"),
		"block": _make_sfx("block"),
		"perfect": _make_sfx("perfect"),
		"dodge": _make_sfx("dodge"),
		"hurt": _make_sfx("hurt"),
		"defeat": _make_sfx("defeat"),
		"boss_defeat": _make_sfx("boss_defeat"),
	}
	for index in 6:
		var player := AudioStreamPlayer.new()
		player.volume_db = -7.0
		add_child(player)
		_sfx_players.append(player)
	queue_redraw()

func _process(delta: float) -> void:
	_time += delta
	if _visual_freeze_remaining > 0.0:
		_visual_freeze_remaining = maxf(0.0, _visual_freeze_remaining - delta)
		queue_redraw()
		return
	trauma = maxf(0.0, trauma - delta * 1.45)
	_hero_action = maxf(0.0, _hero_action - delta * 3.4)
	_hero_slash_motion = maxf(0.0, _hero_slash_motion - delta / 0.3)
	_hero_block_motion = maxf(0.0, _hero_block_motion - delta / 0.44)
	_hero_dodge_motion = maxf(0.0, _hero_dodge_motion - delta / 0.46)
	_enemy_attack_recover = maxf(0.0, _enemy_attack_recover - delta / 0.34)
	_enemy_death_motion = maxf(0.0, _enemy_death_motion - delta / 0.62)
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
	_ally_action = maxf(0.0, _ally_action - delta / 0.48)
	_momentum_pulse = maxf(0.0, _momentum_pulse - delta * 1.8)
	_enemy_flash = maxf(0.0, _enemy_flash - delta * 8.0)
	_hero_flash = maxf(0.0, _hero_flash - delta * 7.0)
	_enemy_knockback = maxf(0.0, _enemy_knockback - delta * 5.8)
	_hero_recoil = maxf(0.0, _hero_recoil - delta * 6.5)
	_impact_burst = maxf(0.0, _impact_burst - delta * 7.0)
	_hurt_vignette = maxf(0.0, _hurt_vignette - delta * 4.8)
	_defeat_burst = maxf(0.0, _defeat_burst - delta * (1.25 if _defeat_was_boss else 2.5))
	queue_redraw()

func set_state(snapshot: Dictionary) -> void:
	momentum_ratio = float(snapshot.momentum) / maxf(1.0, float(snapshot.max_momentum))
	enemy_armor_ratio = clampf(float(snapshot.enemy_armor) / 50.0, 0.0, 1.0)
	enemy_is_boss = bool(snapshot.enemy_is_boss)
	enemy_attack_type = String(snapshot.enemy_attack_type)
	enemy_archetype = String(snapshot.enemy_archetype)
	journey_route = String(snapshot.journey_route)
	var attack_remaining := float(snapshot.enemy_attack_remaining)
	var windup_window := 0.75 if enemy_attack_type != "普通" else 0.35
	enemy_windup_ratio = clampf((windup_window - attack_remaining) / windup_window, 0.0, 1.0)
	enemy_heavy_windup = enemy_attack_type != "普通" and attack_remaining <= 0.8
	var auto_attack_remaining := float(snapshot.get("auto_attack_remaining", 1.0))
	hero_attack_windup_ratio = clampf((0.28 - auto_attack_remaining) / 0.28, 0.0, 1.0)
	immovable_level = int(snapshot.immovable)
	return_blade_ready = bool(snapshot.return_blade_ready)
	guard_stance_active = float(snapshot.guard_stance_remaining) > 0.0
	youren_level = int(snapshot.youren)
	shadowless_active = float(snapshot.shadowless_remaining) > 0.0
	magic_marks_level = int(snapshot.magic_marks)
	burn_level = int(snapshot.burn_stacks)
	magic_release_active = float(snapshot.magic_release_remaining) > 0.0
	frost_level = int(snapshot.frost_stacks)
	lightning_level = int(snapshot.lightning_stacks)
	magic_manifest_active = bool(snapshot.magic_manifest_active)
	complete_release_active = float(snapshot.complete_release_remaining) > 0.0
	ally_count = int(snapshot.ally_count)

func set_stage_bounds(top: float, bottom: float) -> void:
	stage_top = maxf(130.0, top)
	stage_bottom = maxf(stage_top + 250.0, bottom)

func play_events(events: Array[Dictionary]) -> void:
	for event: Dictionary in events:
		match String(event.type):
			"attack":
				var flow_level := int(event.get("youren", 0))
				_hero_action = minf(0.9, 0.5 + float(flow_level) * 0.07)
				_hero_slash_motion = 1.0
			"heavy_strike":
				_hero_slash_motion = 1.0
				_heavy_strike_power = clampf(float(event.get("momentum_ratio", 0.0)), 0.0, 1.0)
				_heavy_slash = 0.62 + _heavy_strike_power * 0.38
				var modifiers: Array = event.get("modifiers", [])
				if "體術・借力" in modifiers: _counter_slash = maxf(_counter_slash, 0.55)
				if "敏捷・迅擊" in modifiers: _swift_cut = maxf(_swift_cut, 0.6)
				if "魔法・附魔" in modifiers: _magic_slash = maxf(_magic_slash, 0.6)
				if _heavy_strike_power >= 1.0: _momentum_pulse = 1.0
				add_trauma(0.12 + _heavy_strike_power * 0.2)
			"momentum_pierce":
				_armor_break_flash = maxf(_armor_break_flash, 0.72 if float(event.get("armor_ignore", 0.0)) < 0.25 else 1.0)
			"mountain_break":
				_hero_slash_motion = 1.0
				_heavy_slash = 1.0
				add_trauma(0.62)
			"draw_stance":
				_flow_burst = 1.0
			"two_cut":
				_hero_slash_motion = 1.0
				_ultimate_slash = 1.0
				add_trauma(0.72)
			"armor_flash":
				_hero_slash_motion = 1.0
				_armor_flash = 1.0
				add_trauma(0.5)
			"execute_slash":
				_hero_slash_motion = 1.0
				_execute_slash = 1.0
				add_trauma(0.58)
			"first_strike":
				_hero_slash_motion = 1.0
				_first_strike = 1.0
				add_trauma(0.46)
			"armor_broken":
				_armor_break_flash = 1.0
			"return_blade":
				_block_flash = maxf(_block_flash, 0.45)
			"guard_stance":
				_hero_block_motion = 1.0
				_block_flash = maxf(_block_flash, 0.62)
			"block":
				_enemy_attack_recover = 1.0
				_hero_block_motion = 1.0
				_block_flash = 1.0
				add_trauma(0.1)
				_hit_stop(0.025)
				_play_sfx("block")
			"perfect_block":
				_enemy_attack_recover = 1.0
				_hero_block_motion = 1.0
				_perfect_block = 1.0
				add_trauma(0.28)
				_hit_stop(0.05)
				_play_sfx("perfect")
			"counter":
				_hero_slash_motion = 1.0
				_counter_slash = 1.0
				add_trauma(0.32)
			"collapse_counter":
				_hero_slash_motion = 1.0
				_collapse_counter = 1.0
				add_trauma(0.62)
			"heaven_return":
				_hero_slash_motion = 1.0
				_heaven_return = 1.0
				add_trauma(0.86)
			"immovable_king":
				_perfect_block = 1.0
				add_trauma(0.2)
			"dodge":
				_enemy_attack_recover = 1.0
				_hero_dodge_motion = 1.0
				_dodge_flash = 1.0
				_play_sfx("dodge")
			"swift_step_ready":
				_dodge_flash = maxf(_dodge_flash, 0.35)
			"swift_step":
				_hero_dodge_motion = 1.0
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
				_flow_burst_strength = 1.0
				_flow_burst = 1.0
				add_trauma(0.08)
			"youren_changed":
				if int(event.get("gain", 0)) > 0:
					_flow_burst_strength = 0.25 + float(event.get("value", 0)) * 0.1
					_flow_burst = maxf(_flow_burst, 0.55)
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
			"holy_enchant", "holy_light_slash", "judgment_slash":
				_magic_slash = 1.0
				_resonance_burst = 0.7
				_resonance_element = "holy"
				add_trauma(0.42 if String(event.type) == "judgment_slash" else 0.16)
			"holy_sword_release", "divine_manifestation":
				_release_burst = 1.0
				add_trauma(0.28)
			"holy_sword_descent", "divine_grace":
				_complete_release_burst = 1.0
				add_trauma(0.72)
			"coordinated_pursuit", "reverse_pursuit":
				_flying_swallow = 1.0
				add_trauma(0.18)
			"ally_attack":
				_ally_action = 1.0
				add_trauma(0.08)
			"vanguard_slash", "army_break_order":
				_heavy_slash = 1.0
				add_trauma(0.5)
			"legion_command", "war_god":
				_flow_burst = 1.0
				add_trauma(0.45)
			"ten_thousand_armies_one_sword":
				_ultimate_slash = 1.0
				add_trauma(0.85)
			"momentum_full":
				_momentum_pulse = 1.0
			"no_beat":
				_momentum_pulse = 1.0
			"remaining_heart":
				_momentum_pulse = maxf(_momentum_pulse, 0.5)
			"damage":
				_enemy_flash = 1.0
				var source := String(event.source)
				var tier := impact_tier_for_source(source)
				_spawn_damage(float(event.amount), source)
				_apply_impact(tier, source)
			"hero_hit":
				_enemy_attack_recover = 1.0
				_hero_flash = 1.0
				_hero_recoil = 1.0
				_hurt_vignette = 1.0
				add_trauma(0.16)
				_hit_stop(0.035)
				_play_sfx("hurt")
			"enemy_defeated":
				_enemy_death_motion = 1.0
				_defeat_burst = 1.0
				_defeat_was_boss = bool(event.get("boss", false))
				add_trauma(0.88 if _defeat_was_boss else 0.3)
				_hit_stop(0.13 if _defeat_was_boss else 0.055)
				_play_sfx("boss_defeat" if _defeat_was_boss else "defeat")

func impact_tier_for_source(source: String) -> String:
	if source in ["burn_tick", "lightning_tick", "holy_enchant", "magic_enchant"] or source.begins_with("ally_"):
		return "light"
	if source in ["heavy_strike_high", "heavy_strike_extreme", "mountain_break", "armor_flash", "execute_slash", "collapse_counter", "heaven_return", "two_cut", "flame_burst_slash", "elemental_resonance", "elemental_boundary_slash", "shadowless_extreme", "ten_thousand_armies_one_sword"]:
		return "heavy"
	if source in ["heavy_strike_base", "heavy_strike_martial", "heavy_strike_swift", "critical_attack", "counter", "first_strike", "swift_step", "shadow_assault", "flying_swallow", "magic_slash", "judgment_slash"]:
		return "medium"
	return "light"

func _apply_impact(tier: String, source: String) -> void:
	_impact_burst = 1.0
	_impact_strength = 0.45 if tier == "light" else (0.72 if tier == "medium" else 1.0)
	_impact_color = Color("aeefff") if source in ["armor_flash", "counter", "collapse_counter", "heaven_return"] else (Color("d7c4ff") if source in ["swift_step", "shadow_assault", "flying_swallow", "shadowless_extreme"] else (Color("ff9a52") if source in ["magic_enchant", "magic_slash", "burn_tick", "flame_burst_slash", "elemental_boundary_slash"] else Color("fff0b0")))
	_enemy_knockback = maxf(_enemy_knockback, _impact_strength)
	if tier == "heavy":
		add_trauma(0.48)
		_hit_stop(0.085)
	elif tier == "medium":
		add_trauma(0.24)
		_hit_stop(0.045)
	else:
		add_trauma(0.07)
		_hit_stop(0.018)
	_play_sfx(tier)

func _hit_stop(duration: float) -> void:
	if reduced_motion:
		return
	_visual_freeze_remaining = maxf(_visual_freeze_remaining, duration)

func add_trauma(amount: float) -> void:
	if reduced_motion:
		return
	trauma = clampf(trauma + amount, 0.0, 1.0)

func _draw() -> void:
	if journey_route == "frontier":
		_draw_cover_texture(GORGE_BACKGROUND, Rect2(0.0, -42.0, size.x, size.y + 42.0), Vector2(0.5, 0.54))
		draw_rect(Rect2(Vector2.ZERO, size), Color("284451", 0.07))
	else:
		var background := Color("819cab") if journey_route == "mountain" else (Color("a7bbb4") if journey_route == "village" else Color("8f91a5"))
		draw_rect(Rect2(Vector2.ZERO, size), background)
		for band in 7:
			var y := size.y * float(band) / 7.0
			var lower_color := Color("887966") if journey_route == "mountain" else (Color("aa805c") if journey_route == "village" else Color("796a80"))
			var color := background.darkened(0.08).lerp(lower_color, float(band) / 7.0)
			draw_rect(Rect2(0.0, y, size.x, size.y / 7.0 + 1.0), color)
	_draw_forest()
	var shake := trauma * trauma
	var shake_offset := Vector2(sin(_time * 31.0) * 10.0, sin(_time * 43.0) * 7.0) * shake
	var visible_bottom := minf(stage_bottom - 10.0, size.y - 120.0)
	var enemy_pos := Vector2(size.x * 0.69, lerpf(stage_top, visible_bottom, 0.62)) + shake_offset
	var hero_pos := Vector2(size.x * 0.33, lerpf(stage_top, visible_bottom, 0.97)) + shake_offset
	var enemy_strike := pow(_enemy_attack_recover, 1.7)
	var enemy_windup := enemy_windup_ratio * (1.0 - _enemy_attack_recover)
	enemy_pos += Vector2(enemy_windup * 12.0 - enemy_strike * minf(size.x * 0.24, 94.0), enemy_strike * 18.0)
	enemy_pos.x += sin(_enemy_knockback * PI) * minf(size.x * 0.055, 24.0) * _impact_strength
	hero_pos.x -= sin(_hero_recoil * PI) * minf(size.x * 0.045, 20.0)
	var ally_lunge := sin(_ally_action * PI) * minf(size.x * 0.12, 46.0)
	var lunge := sin(_hero_action * PI) * minf(size.x * 0.16, 72.0)
	var heavy_lunge := sin(_heavy_slash * PI) * minf(size.x * (0.17 + _heavy_strike_power * 0.08), 70.0 + _heavy_strike_power * 32.0)
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
	hero_pos.x = clampf(hero_pos.x, 54.0, size.x - 76.0)
	enemy_pos.x = clampf(enemy_pos.x, 92.0, size.x - 72.0)
	_draw_enemy(enemy_pos)
	for index in ally_count:
		var row := index / 2
		var column := index % 2
		var ally_pos := hero_pos + Vector2(-65.0 - float(column) * 36.0 + ally_lunge, 24.0 - float(row) * 56.0)
		_draw_ally(ally_pos, index)
	_draw_afterimages(hero_pos)
	_draw_hero(hero_pos)
	_draw_skill_fx(hero_pos, enemy_pos)
	if _hurt_vignette > 0.0:
		var vignette_alpha := _hurt_vignette * 0.2
		draw_rect(Rect2(Vector2.ZERO, size), Color("c83232", vignette_alpha), false, 14.0)

func _draw_forest() -> void:
	if journey_route == "frontier":
		return
	if journey_route == "village":
		for index in 5:
			var house_x := size.x * (0.08 + float(index) * 0.22)
			var house_y := size.y * 0.47
			draw_rect(Rect2(house_x, house_y - 42.0, 52.0, 42.0), Color("594534"))
			draw_polygon(PackedVector2Array([Vector2(house_x - 8.0, house_y - 42.0), Vector2(house_x + 26.0, house_y - 72.0), Vector2(house_x + 60.0, house_y - 42.0)]), PackedColorArray([Color("7a4a35")]))
		return
	if journey_route == "battlefield":
		for index in 11:
			var x := size.x * float(index) / 10.0
			var ground_y := size.y * 0.54 + float((index * 17) % 20)
			draw_line(Vector2(x, ground_y), Vector2(x + 12.0, ground_y - 54.0), Color("8b817c"), 4.0)
			draw_polygon(PackedVector2Array([Vector2(x + 12.0, ground_y - 54.0), Vector2(x + 40.0, ground_y - 43.0), Vector2(x + 12.0, ground_y - 30.0)]), PackedColorArray([Color("6f3f45", 0.7)]))
		return
	for index in 9:
		var x := size.x * (float(index) / 8.0)
		var height := (72.0 if journey_route == "mountain" else 48.0) + float((index * 23) % 64)
		var trunk_color := Color("574f43") if journey_route == "mountain" else Color("5b4635")
		var leaf_color := Color("626f5e") if journey_route == "mountain" else Color("55715a")
		draw_rect(Rect2(x - 7.0, size.y * 0.52 - height, 14.0, height), trunk_color)
		draw_circle(Vector2(x, size.y * 0.52 - height), 34.0, leaf_color)
	for index in 16:
		var x := fmod(float(index * 71), maxf(size.x, 1.0))
		var y := size.y * 0.53 + fmod(float(index * 37), size.y * 0.25)
		draw_circle(Vector2(x, y), 2.0, Color("d4aa62", 0.42))

func _draw_ally(origin: Vector2, index: int) -> void:
	var bob := sin(_time * 4.0 + float(index) * 0.8) * 1.5
	var body_colors := [Color("496477"), Color("566e50"), Color("5d4f79"), Color("d7c88b")]
	var body: Color = body_colors[mini(index, body_colors.size() - 1)]
	draw_polygon(PackedVector2Array([origin + Vector2(-13, 8 + bob), origin + Vector2(13, 8 + bob), origin + Vector2(10, -21 + bob), origin + Vector2(-10, -21 + bob)]), PackedColorArray([body]))
	draw_circle(origin + Vector2(0, -31 + bob), 10.0, Color("caa875"))
	draw_polygon(PackedVector2Array([origin + Vector2(-11, -34 + bob), origin + Vector2(0, -45 + bob), origin + Vector2(12, -34 + bob)]), PackedColorArray([Color("59656a")]))
	if index == 0:
		draw_circle(origin + Vector2(-14, -2 + bob), 11.0, Color("647981"))
		draw_line(origin + Vector2(9, -15 + bob), origin + Vector2(28, -39 + bob), Color("e7dec2"), 4.0)
	elif index == 1:
		draw_line(origin + Vector2(10, -16 + bob), origin + Vector2(30, -30 + bob), Color("d9e1d1"), 3.0)
	elif index == 2:
		draw_line(origin + Vector2(10, -14 + bob), origin + Vector2(24, -38 + bob), Color("a77f54"), 4.0)
		draw_circle(origin + Vector2(26, -42 + bob), 5.0, Color("cda8ff"))
	else:
		draw_line(origin + Vector2(10, -14 + bob), origin + Vector2(23, -37 + bob), Color("c7b36f"), 4.0)
		draw_circle(origin + Vector2(24, -40 + bob), 5.0, Color("fff1a8"))

func _draw_hero(origin: Vector2) -> void:
	var bob := sin(_time * 4.2) * 2.0
	var sprite_modulate := Color(1.8, 1.8, 1.8, 1.0) if _hero_flash > 0.0 else Color.WHITE
	var slash_pose := maxf(maxf(_hero_action, _heavy_slash), maxf(_counter_slash, _swift_cut))
	var guard_pose := maxf(_block_flash, _perfect_block)
	var dodge_pose := maxf(_dodge_flash, _swift_step)
	var pose_rotation := -0.085 * slash_pose + 0.045 * guard_pose - 0.11 * dodge_pose
	var pose_scale := Vector2(1.0 + dodge_pose * 0.055 - guard_pose * 0.025, 1.0 - dodge_pose * 0.04 + guard_pose * 0.035)
	if momentum_ratio > 0.68:
		var aura_alpha := (momentum_ratio - 0.68) * 1.2 + _momentum_pulse * 0.32
		draw_arc(origin + Vector2(0.0, -34.0), 50.0 + sin(_time * 8.0) * 3.0, 0.0, TAU, 32, Color("f1bb54", aura_alpha), 4.0)
	if immovable_level > 0 or return_blade_ready or guard_stance_active:
		var guard_alpha := 0.35 + float(immovable_level) * 0.16 + (0.25 if return_blade_ready else 0.0) + (0.18 if guard_stance_active else 0.0)
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
	var hero_texture: Texture2D = RECRUIT_TEXTURE
	var canvas_height := 252.0
	var feet_ratio := 1.0
	if _hero_dodge_motion > 0.0:
		var dodge_index := mini(5, floori((1.0 - _hero_dodge_motion) * 6.0))
		hero_texture = HERO_DODGE_FRAMES[dodge_index]
		canvas_height = 380.0
		feet_ratio = 0.92
	elif _hero_block_motion > 0.0:
		var block_index := mini(3, floori((1.0 - _hero_block_motion) * 4.0))
		hero_texture = HERO_BLOCK_FRAMES[block_index]
		canvas_height = 370.0
		feet_ratio = 0.882
	elif _hero_slash_motion > 0.0:
		var slash_index := 3 + mini(2, floori((1.0 - _hero_slash_motion) * 3.0))
		hero_texture = HERO_SLASH_FRAMES[slash_index]
		canvas_height = 380.0
		feet_ratio = 0.927
	elif hero_attack_windup_ratio > 0.0:
		var windup_index := mini(2, floori(hero_attack_windup_ratio * 3.0))
		hero_texture = HERO_SLASH_FRAMES[windup_index]
		canvas_height = 380.0
		feet_ratio = 0.927
	_draw_anchored_animation_frame(hero_texture, origin + Vector2(0.0, 45.0 + bob), canvas_height, feet_ratio, pose_rotation, pose_scale, sprite_modulate)

func _draw_enemy(origin: Vector2) -> void:
	var idle_breath := sin(_time * 3.2)
	var bob := idle_breath * 1.0
	var sprite_modulate := Color(1.8, 1.8, 1.8, 1.0) if _enemy_flash > 0.0 else Color.WHITE
	var body_scale := 1.18 if enemy_archetype == "brute" else (0.86 if enemy_archetype in ["raider", "caster"] else 1.0)
	var ring_size := 126.0 * body_scale + sin(_time * 2.4) * 4.0
	var ground_center := origin + Vector2(0.0, 31.0)
	_draw_ground_shadow(ground_center + Vector2(0.0, 4.0), Vector2(ring_size * 0.48, ring_size * 0.13))
	var ring_rect := Rect2(origin.x - ring_size * 0.5, ground_center.y - ring_size * 0.29, ring_size, ring_size * 0.58)
	draw_texture_rect(TARGET_RING_TEXTURE, ring_rect, false, Color(1.0, 1.0, 1.0, 0.5 if enemy_is_boss else 0.3))
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
	var enemy_height := 176.0 * body_scale
	var windup_pose := enemy_windup_ratio * (1.0 - _enemy_attack_recover)
	var strike_pose := pow(_enemy_attack_recover, 1.45)
	var hit_pose := sin(_enemy_knockback * PI)
	var death_phase := 1.0 - _enemy_death_motion
	var pose_rotation := -0.045 * windup_pose + 0.075 * strike_pose + 0.1 * hit_pose
	var pose_scale := Vector2(1.0 + strike_pose * 0.09 + hit_pose * 0.035, 1.0 - windup_pose * 0.1 - strike_pose * 0.055 + idle_breath * 0.008)
	var sprite_bottom := ground_center + Vector2(0.0, 20.0 + windup_pose * 5.0)
	if _enemy_death_motion > 0.0:
		pose_rotation += death_phase * 0.48
		pose_scale *= Vector2(1.0 + death_phase * 0.08, 1.0 - death_phase * 0.22)
		sprite_modulate.a = clampf(_enemy_death_motion * 1.8, 0.0, 1.0)
		sprite_bottom += Vector2(18.0 * death_phase, 10.0 * death_phase)
	var enemy_texture: Texture2D = GRAY_WOLF_TEXTURE
	var enemy_canvas_height := enemy_height
	var enemy_feet_ratio := 1.0
	if _enemy_attack_recover > 0.0:
		var recover_index := 3 + mini(2, floori((1.0 - _enemy_attack_recover) * 3.0))
		enemy_texture = WOLF_POUNCE_FRAMES[recover_index]
		enemy_canvas_height = 380.0 * body_scale
		enemy_feet_ratio = 0.834
	elif enemy_windup_ratio > 0.0:
		var pounce_index := mini(2, floori(enemy_windup_ratio * 3.0))
		enemy_texture = WOLF_POUNCE_FRAMES[pounce_index]
		enemy_canvas_height = 380.0 * body_scale
		enemy_feet_ratio = 0.834
	_draw_anchored_animation_frame(enemy_texture, sprite_bottom, enemy_canvas_height, enemy_feet_ratio, pose_rotation, pose_scale, sprite_modulate)
	if enemy_armor_ratio > 0.05:
		var armor_color := Color("e7eff2") if _armor_break_flash > 0.0 else Color("778a93")
		draw_arc(origin + Vector2(0, -16 + bob), 47.0, -2.65, -0.48, 18, armor_color, 5.0 + enemy_armor_ratio * 5.0)
		draw_arc(origin + Vector2(0, -16 + bob), 47.0, 0.48, 2.65, 18, armor_color, 5.0 + enemy_armor_ratio * 5.0)
	if enemy_is_boss:
		draw_polyline(PackedVector2Array([origin + Vector2(-24, -86 + bob), origin + Vector2(-13, -105 + bob), origin + Vector2(0, -89 + bob), origin + Vector2(14, -107 + bob), origin + Vector2(25, -86 + bob)]), Color("e6bd62"), 7.0)

func _draw_ground_shadow(center: Vector2, radius: Vector2) -> void:
	var points := PackedVector2Array()
	for index in 32:
		var angle := TAU * float(index) / 32.0
		points.append(center + Vector2(cos(angle) * radius.x, sin(angle) * radius.y))
	draw_colored_polygon(points, Color("293336", 0.3))

func _draw_sprite_bottom(texture: Texture2D, bottom_center: Vector2, target_height: float, modulate: Color = Color.WHITE) -> void:
	var texture_size := texture.get_size()
	if texture_size.y <= 0.0:
		return
	var target_width := target_height * texture_size.x / texture_size.y
	var rect := Rect2(bottom_center.x - target_width * 0.5, bottom_center.y - target_height, target_width, target_height)
	draw_texture_rect(texture, rect, false, modulate)

func _draw_sprite_bottom_transformed(texture: Texture2D, bottom_center: Vector2, target_height: float, rotation: float, sprite_scale: Vector2, modulate: Color = Color.WHITE) -> void:
	var texture_size := texture.get_size()
	if texture_size.y <= 0.0:
		return
	var target_width := target_height * texture_size.x / texture_size.y
	draw_set_transform(bottom_center, rotation, sprite_scale)
	draw_texture_rect(texture, Rect2(-target_width * 0.5, -target_height, target_width, target_height), false, modulate)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_anchored_animation_frame(texture: Texture2D, feet_center: Vector2, canvas_height: float, feet_ratio: float, rotation: float, sprite_scale: Vector2, modulate: Color = Color.WHITE) -> void:
	var corrected_bottom := feet_center + Vector2(0.0, canvas_height * (1.0 - feet_ratio))
	_draw_sprite_bottom_transformed(texture, corrected_bottom, canvas_height, rotation, sprite_scale, modulate)

func _draw_cover_texture(texture: Texture2D, destination: Rect2, focus: Vector2) -> void:
	var texture_size := texture.get_size()
	if texture_size.x <= 0.0 or texture_size.y <= 0.0:
		return
	var source_aspect := texture_size.x / texture_size.y
	var destination_aspect := destination.size.x / destination.size.y
	var source_rect := Rect2(Vector2.ZERO, texture_size)
	if source_aspect > destination_aspect:
		var crop_width := texture_size.y * destination_aspect
		source_rect.position.x = (texture_size.x - crop_width) * focus.x
		source_rect.size.x = crop_width
	else:
		var crop_height := texture_size.x / destination_aspect
		source_rect.position.y = (texture_size.y - crop_height) * focus.y
		source_rect.size.y = crop_height
	draw_texture_rect_region(texture, destination, source_rect)

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
		var reach := 62.0 + _heavy_strike_power * 38.0
		var core_color := Color("fff8c9") if _heavy_strike_power >= 1.0 else Color("fff0a3")
		draw_arc(center, reach, -2.2, 0.45, 28, Color(core_color, alpha), 9.0 + _heavy_strike_power * 8.0)
		draw_arc(center, reach - 16.0, -2.2, 0.45, 24, Color("f29a3d", alpha * 0.8), 4.0 + _heavy_strike_power * 4.0)
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
		var flow_radius := 42.0 + _flow_burst_strength * 20.0 + phase * 24.0
		draw_arc(hero_pos + Vector2(0, -35), flow_radius, 0.0, TAU, 32, Color("d8ccff", alpha * (0.55 + _flow_burst_strength * 0.45)), 3.0 + _flow_burst_strength * 5.0)
		for index in maxi(1, roundi(_flow_burst_strength * 5.0)):
			var angle := float(index) * 1.37 + phase * 3.0
			draw_line(hero_pos + Vector2(0, -35) + Vector2.from_angle(angle) * 30.0, hero_pos + Vector2(0, -35) + Vector2.from_angle(angle) * (48.0 + phase * 24.0), Color("c8b9ff", alpha * 0.8), 2.0)
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
		var color := Color("a8efff") if _resonance_element == "ice" else (Color("d6a7ff") if _resonance_element == "lightning" else (Color("fff0a8") if _resonance_element == "holy" else Color("ff9a52")))
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
	if _impact_burst > 0.0:
		var phase := 1.0 - _impact_burst
		var alpha := _impact_burst
		var center := enemy_pos + Vector2(0, -38)
		var radius := 12.0 + phase * (32.0 + 28.0 * _impact_strength)
		draw_circle(center, 9.0 * alpha * _impact_strength, Color("ffffff", alpha * 0.78))
		draw_arc(center, radius, 0.0, TAU, 28, Color(_impact_color, alpha * 0.9), 3.0 + 5.0 * _impact_strength)
		var ray_count := 5 if _impact_strength < 0.6 else (8 if _impact_strength < 0.9 else 12)
		for index in ray_count:
			var angle := float(index) * TAU / float(ray_count) + 0.2
			var inner := center + Vector2.from_angle(angle) * (16.0 + phase * 12.0)
			var outer := center + Vector2.from_angle(angle) * (28.0 + phase * 46.0 * _impact_strength)
			draw_line(inner, outer, Color(_impact_color, alpha * 0.9), 2.0 + 3.0 * _impact_strength)
	if _defeat_burst > 0.0:
		var phase := 1.0 - _defeat_burst
		var alpha := sin(clampf(phase * 1.45, 0.0, 1.0) * PI)
		var center := enemy_pos + Vector2(0, -38)
		var reach := 130.0 if _defeat_was_boss else 72.0
		draw_arc(center, 24.0 + phase * reach, 0.0, TAU, 40, Color("ffe09a", alpha), 10.0 if _defeat_was_boss else 5.0)
		if _defeat_was_boss:
			for index in 14:
				var angle := float(index) * TAU / 14.0
				draw_line(center + Vector2.from_angle(angle) * 34.0, center + Vector2.from_angle(angle) * (90.0 + phase * 90.0), Color("fff4c4", alpha * 0.85), 6.0)

func _spawn_damage(amount: float, source: String) -> void:
	var label := _damage_pool[_damage_cursor]
	_damage_cursor = (_damage_cursor + 1) % _damage_pool.size()
	label.visible = true
	label.modulate = Color.WHITE
	var large := source in ["heavy_strike_high", "heavy_strike_extreme", "mountain_break", "armor_flash", "execute_slash", "first_strike", "collapse_counter", "heaven_return", "swift_step", "shadow_assault", "flying_swallow", "swallow_return", "second_shadow", "shadowless_extreme", "two_cut", "magic_slash", "flame_burst_slash", "elemental_resonance", "elemental_boundary_slash", "minor_resonance"]
	label.scale = Vector2(1.75, 1.75) if source == "two_cut" else (Vector2(1.4, 1.4) if large else Vector2.ONE)
	var prefix := ""
	if source in ["execute_slash", "two_cut"]:
		prefix = "斬 "
	elif source in ["heavy_strike_high", "heavy_strike_extreme"]:
		prefix = "勢 "
	elif source == "heavy_strike_swift":
		prefix = "迅 "
	elif source in ["counter", "collapse_counter", "heaven_return", "first_strike"]:
		prefix = "反 "
	elif source in ["swift_step", "swift_cut", "shadow_assault", "flying_swallow", "swallow_return", "second_shadow", "shadowless_extreme"]:
		prefix = "影 "
	elif source in ["magic_slash", "flame_burst_slash", "elemental_resonance", "elemental_boundary_slash", "minor_resonance"]:
		prefix = "爆 "
	elif source.begins_with("ally_"):
		prefix = "援 "
	elif source == "critical_attack":
		prefix = "暴 "
	label.text = "%s%d%s" % [prefix, roundi(amount), "!" if source == "critical_attack" else ""]
	var color := Color("fff0a3") if source == "two_cut" else (Color("d7b2ff") if source in ["lightning_tick", "lightning_chain"] else (Color("a9edff") if source in ["elemental_resonance", "minor_resonance"] else (Color("ffb16f") if source in ["magic_enchant", "magic_slash", "burn_tick", "flame_burst_slash", "elemental_boundary_slash"] else (Color("f7c0b7") if source == "execute_slash" else (Color("d9ccff") if source in ["heavy_strike_swift", "flow_attack", "flow_attack_full", "swift_step", "swift_cut", "shadow_assault", "flying_swallow", "swallow_return", "second_shadow", "shadowless_extreme", "critical_attack"] else (Color("c7f6ff") if source in ["armor_flash", "first_strike", "counter", "collapse_counter", "heaven_return"] else (Color("ffe07a") if large else Color("f4eee0"))))))))
	label.add_theme_color_override("font_color", color)
	label.position = Vector2(size.x * 0.64 + randf_range(-18.0, 18.0), size.y * 0.28)
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position:y", label.position.y - 58.0, 0.62).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property(label, "modulate:a", 0.0, 0.62).set_delay(0.18)
	tween.tween_property(label, "scale", Vector2.ONE, 0.18).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tween.chain().tween_callback(func() -> void: label.visible = false)

func _play_sfx(kind: String) -> void:
	if _sfx_players.is_empty() or not _sfx_streams.has(kind):
		return
	var player := _sfx_players[_sfx_cursor]
	_sfx_cursor = (_sfx_cursor + 1) % _sfx_players.size()
	player.stream = _sfx_streams[kind]
	player.pitch_scale = 0.98 + float(_sfx_cursor % 3) * 0.015
	player.play()

func _make_sfx(kind: String) -> AudioStreamWAV:
	var duration := 0.07
	if kind in ["heavy", "perfect", "defeat"]:
		duration = 0.13
	elif kind == "boss_defeat":
		duration = 0.3
	var sample_rate := 22050
	var sample_count := roundi(duration * float(sample_rate))
	var data := PackedByteArray()
	data.resize(sample_count * 2)
	for index in sample_count:
		var time := float(index) / float(sample_rate)
		var progress := float(index) / float(sample_count)
		var envelope := pow(1.0 - progress, 2.4)
		var frequency := 560.0
		var noise_amount := 0.22
		match kind:
			"light":
				frequency = 720.0 - progress * 260.0
			"medium":
				frequency = 470.0 - progress * 190.0
				noise_amount = 0.32
			"heavy":
				frequency = 150.0 - progress * 45.0
				noise_amount = 0.42
			"block":
				frequency = 960.0 + progress * 180.0
				noise_amount = 0.12
			"perfect":
				frequency = 1380.0 + progress * 420.0
				noise_amount = 0.1
			"dodge":
				frequency = 840.0 + progress * 680.0
				noise_amount = 0.3
			"hurt":
				frequency = 115.0
				noise_amount = 0.48
			"defeat":
				frequency = 220.0 - progress * 80.0
				noise_amount = 0.35
			"boss_defeat":
				frequency = 92.0 + progress * 34.0
				noise_amount = 0.3
		var noise := sin(float(index) * 12.9898) * sin(float(index) * 4.1414)
		var sample := (sin(TAU * frequency * time) * (1.0 - noise_amount) + noise * noise_amount) * envelope * 0.62
		if kind in ["block", "perfect", "boss_defeat"]:
			sample += sin(TAU * frequency * 1.62 * time) * envelope * 0.22
		data.encode_s16(index * 2, clampi(roundi(sample * 32767.0), -32768, 32767))
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = sample_rate
	stream.stereo = false
	stream.data = data
	return stream
