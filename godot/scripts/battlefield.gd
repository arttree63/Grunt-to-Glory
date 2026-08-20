class_name Battlefield
extends Control

const GORGE_BACKGROUND := preload("res://assets/visual/battle_hud_v2/ruins-arena.png")
const PIXEL_BACKGROUND := preload("res://assets/visual/pixel_vertical_slice/background/frontier-ruins.png")
const EXPLORATION_BACKGROUND := preload("res://assets/visual/exploration_map_v1/frontier-roaming-map.png")
const UI_FONT := preload("res://assets/fonts/NotoSansTC-Regular.otf")
const PIXEL_HERO_IDLE_FRAMES := [
	preload("res://assets/visual/pixel_vertical_slice/hero/idle/idle-1.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/idle/idle-2.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/idle/idle-3.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/idle/idle-4.png"),
]
const PIXEL_HERO_ATTACK_FRAMES := [
	preload("res://assets/visual/pixel_vertical_slice/hero/attack/attack-1.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/attack/attack-2.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/attack/attack-3.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/attack/attack-4.png"),
]
const PIXEL_HERO_BLOCK_FRAMES := [
	preload("res://assets/visual/pixel_vertical_slice/hero/block/block-1.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/block/block-2.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/block/block-3.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/block/block-4.png"),
]
const PIXEL_HERO_DODGE_FRAMES := [
	preload("res://assets/visual/pixel_vertical_slice/hero/dodge/dodge-1.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/dodge/dodge-2.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/dodge/dodge-3.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/dodge/dodge-4.png"),
]
const PIXEL_HERO_DEATH_FRAMES := [
	preload("res://assets/visual/pixel_vertical_slice/hero/death/death-1.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/death/death-2.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/death/death-3.png"),
	preload("res://assets/visual/pixel_vertical_slice/hero/death/death-4.png"),
]
const PIXEL_WOLF_IDLE_FRAMES := [
	preload("res://assets/visual/pixel_vertical_slice/wolf/idle/idle-1.png"),
	preload("res://assets/visual/pixel_vertical_slice/wolf/idle/idle-2.png"),
	preload("res://assets/visual/pixel_vertical_slice/wolf/idle/idle-3.png"),
	preload("res://assets/visual/pixel_vertical_slice/wolf/idle/idle-4.png"),
]
const PIXEL_WOLF_ATTACK_FRAMES := [
	preload("res://assets/visual/pixel_vertical_slice/wolf/attack/attack-1.png"),
	preload("res://assets/visual/pixel_vertical_slice/wolf/attack/attack-2.png"),
	preload("res://assets/visual/pixel_vertical_slice/wolf/attack/attack-3.png"),
	preload("res://assets/visual/pixel_vertical_slice/wolf/attack/attack-4.png"),
]
const PIXEL_WOLF_DEATH_FRAMES := [
	preload("res://assets/visual/pixel_vertical_slice/wolf/death/death-1.png"),
	preload("res://assets/visual/pixel_vertical_slice/wolf/death/death-2.png"),
	preload("res://assets/visual/pixel_vertical_slice/wolf/death/death-3.png"),
	preload("res://assets/visual/pixel_vertical_slice/wolf/death/death-4.png"),
]
const PIXEL_RAIDER_COMBAT_FRAMES := [
	preload("res://assets/visual/pixel_vertical_slice/enemies/raider/combat/combat-1.png"),
	preload("res://assets/visual/pixel_vertical_slice/enemies/raider/combat/combat-2.png"),
	preload("res://assets/visual/pixel_vertical_slice/enemies/raider/combat/combat-3.png"),
	preload("res://assets/visual/pixel_vertical_slice/enemies/raider/combat/combat-4.png"),
]
const PIXEL_BRUTE_COMBAT_FRAMES := [
	preload("res://assets/visual/pixel_vertical_slice/enemies/brute/combat/combat-1.png"),
	preload("res://assets/visual/pixel_vertical_slice/enemies/brute/combat/combat-2.png"),
	preload("res://assets/visual/pixel_vertical_slice/enemies/brute/combat/combat-3.png"),
	preload("res://assets/visual/pixel_vertical_slice/enemies/brute/combat/combat-4.png"),
]
const PIXEL_SHIELD_COMBAT_FRAMES := [
	preload("res://assets/visual/pixel_vertical_slice/enemies/shield/combat/combat-1.png"),
	preload("res://assets/visual/pixel_vertical_slice/enemies/shield/combat/combat-2.png"),
	preload("res://assets/visual/pixel_vertical_slice/enemies/shield/combat/combat-3.png"),
	preload("res://assets/visual/pixel_vertical_slice/enemies/shield/combat/combat-4.png"),
]
const PIXEL_CASTER_COMBAT_FRAMES := [
	preload("res://assets/visual/pixel_vertical_slice/enemies/caster/combat/combat-1.png"),
	preload("res://assets/visual/pixel_vertical_slice/enemies/caster/combat/combat-2.png"),
	preload("res://assets/visual/pixel_vertical_slice/enemies/caster/combat/combat-3.png"),
	preload("res://assets/visual/pixel_vertical_slice/enemies/caster/combat/combat-4.png"),
]
const RECRUIT_TEXTURE := preload("res://assets/visual/battle_hud_v2/hero-back.png")
const HERO_RIG_BODY := preload("res://assets/visual/rig_prototype/hero_cutout_v1/runtime/body.png")
const HERO_RIG_UPPER_ARM := preload("res://assets/visual/rig_prototype/hero_cutout_v1/runtime/upper-arm.png")
const HERO_RIG_FOREARM := preload("res://assets/visual/rig_prototype/hero_cutout_v1/runtime/forearm.png")
const HERO_RIG_SWORD := preload("res://assets/visual/rig_prototype/hero_cutout_v1/runtime/sword.png")
const GRAY_WOLF_TEXTURE := preload("res://assets/visual/battle_hud_v2/gray-wolf.png")
const TARGET_RING_TEXTURE := preload("res://assets/visual/battle_hud_v2/target-ring.png")
const HERO_SLASH_FRAMES := [
	preload("res://assets/visual/animations/hero/slash-v2/attack-1.png"),
	preload("res://assets/visual/animations/hero/slash-v2/attack-2.png"),
	preload("res://assets/visual/animations/hero/slash-v2/attack-3.png"),
	preload("res://assets/visual/animations/hero/slash-v2/attack-4.png"),
	preload("res://assets/visual/animations/hero/slash-v2/attack-5.png"),
	preload("res://assets/visual/animations/hero/slash-v2/attack-6.png"),
	preload("res://assets/visual/animations/hero/slash-v2/attack-7.png"),
	preload("res://assets/visual/animations/hero/slash-v2/attack-8.png"),
	preload("res://assets/visual/animations/hero/slash-v2/attack-9.png"),
	preload("res://assets/visual/animations/hero/slash-v2/attack-10.png"),
	preload("res://assets/visual/animations/hero/slash-v2/attack-11.png"),
	preload("res://assets/visual/animations/hero/slash-v2/attack-12.png"),
]
const HERO_BLOCK_FRAMES := [
	preload("res://assets/visual/animations/hero/block-v2/block-1.png"),
	preload("res://assets/visual/animations/hero/block-v2/block-2.png"),
	preload("res://assets/visual/animations/hero/block-v2/block-3.png"),
	preload("res://assets/visual/animations/hero/block-v2/block-4.png"),
	preload("res://assets/visual/animations/hero/block-v2/block-5.png"),
	preload("res://assets/visual/animations/hero/block-v2/block-6.png"),
	preload("res://assets/visual/animations/hero/block-v2/block-7.png"),
	preload("res://assets/visual/animations/hero/block-v2/block-8.png"),
]
const HERO_DODGE_FRAMES := [
	preload("res://assets/visual/animations/hero/dodge-v2/dodge-1.png"),
	preload("res://assets/visual/animations/hero/dodge-v2/dodge-2.png"),
	preload("res://assets/visual/animations/hero/dodge-v2/dodge-3.png"),
	preload("res://assets/visual/animations/hero/dodge-v2/dodge-4.png"),
	preload("res://assets/visual/animations/hero/dodge-v2/dodge-5.png"),
	preload("res://assets/visual/animations/hero/dodge-v2/dodge-6.png"),
	preload("res://assets/visual/animations/hero/dodge-v2/dodge-7.png"),
	preload("res://assets/visual/animations/hero/dodge-v2/dodge-8.png"),
	preload("res://assets/visual/animations/hero/dodge-v2/dodge-9.png"),
	preload("res://assets/visual/animations/hero/dodge-v2/dodge-10.png"),
]
const HERO_HURT_FRAMES := [
	preload("res://assets/visual/animations/hero/hurt-v1/hurt-1.png"),
	preload("res://assets/visual/animations/hero/hurt-v1/hurt-2.png"),
	preload("res://assets/visual/animations/hero/hurt-v1/hurt-3.png"),
	preload("res://assets/visual/animations/hero/hurt-v1/hurt-4.png"),
	preload("res://assets/visual/animations/hero/hurt-v1/hurt-5.png"),
	preload("res://assets/visual/animations/hero/hurt-v1/hurt-6.png"),
]
const HERO_DEATH_FRAMES := [
	preload("res://assets/visual/animations/hero/death-v1/death-1.png"),
	preload("res://assets/visual/animations/hero/death-v1/death-2.png"),
	preload("res://assets/visual/animations/hero/death-v1/death-3.png"),
	preload("res://assets/visual/animations/hero/death-v1/death-4.png"),
	preload("res://assets/visual/animations/hero/death-v1/death-5.png"),
	preload("res://assets/visual/animations/hero/death-v1/death-6.png"),
	preload("res://assets/visual/animations/hero/death-v1/death-7.png"),
	preload("res://assets/visual/animations/hero/death-v1/death-8.png"),
	preload("res://assets/visual/animations/hero/death-v1/death-9.png"),
	preload("res://assets/visual/animations/hero/death-v1/death-10.png"),
]
const WOLF_POUNCE_FRAMES := [
	preload("res://assets/visual/animations/wolf/pounce-v2/attack-1.png"),
	preload("res://assets/visual/animations/wolf/pounce-v2/attack-2.png"),
	preload("res://assets/visual/animations/wolf/pounce-v2/attack-3.png"),
	preload("res://assets/visual/animations/wolf/pounce-v2/attack-4.png"),
	preload("res://assets/visual/animations/wolf/pounce-v2/attack-5.png"),
	preload("res://assets/visual/animations/wolf/pounce-v2/attack-6.png"),
	preload("res://assets/visual/animations/wolf/pounce-v2/attack-7.png"),
	preload("res://assets/visual/animations/wolf/pounce-v2/attack-8.png"),
	preload("res://assets/visual/animations/wolf/pounce-v2/attack-9.png"),
	preload("res://assets/visual/animations/wolf/pounce-v2/attack-10.png"),
	preload("res://assets/visual/animations/wolf/pounce-v2/attack-11.png"),
	preload("res://assets/visual/animations/wolf/pounce-v2/attack-12.png"),
]
const WOLF_HURT_FRAMES := [
	preload("res://assets/visual/animations/wolf/hurt-v1/hurt-1.png"),
	preload("res://assets/visual/animations/wolf/hurt-v1/hurt-2.png"),
	preload("res://assets/visual/animations/wolf/hurt-v1/hurt-3.png"),
	preload("res://assets/visual/animations/wolf/hurt-v1/hurt-4.png"),
	preload("res://assets/visual/animations/wolf/hurt-v1/hurt-5.png"),
	preload("res://assets/visual/animations/wolf/hurt-v1/hurt-6.png"),
]
const WOLF_DEATH_FRAMES := [
	preload("res://assets/visual/animations/wolf/death-v1/death-1.png"),
	preload("res://assets/visual/animations/wolf/death-v1/death-2.png"),
	preload("res://assets/visual/animations/wolf/death-v1/death-3.png"),
	preload("res://assets/visual/animations/wolf/death-v1/death-4.png"),
	preload("res://assets/visual/animations/wolf/death-v1/death-5.png"),
	preload("res://assets/visual/animations/wolf/death-v1/death-6.png"),
	preload("res://assets/visual/animations/wolf/death-v1/death-7.png"),
	preload("res://assets/visual/animations/wolf/death-v1/death-8.png"),
	preload("res://assets/visual/animations/wolf/death-v1/death-9.png"),
	preload("res://assets/visual/animations/wolf/death-v1/death-10.png"),
]
const SLASH_FX_FRAMES := [
	preload("res://assets/visual/fx/slash-warm-v2/slash-1.png"),
	preload("res://assets/visual/fx/slash-warm-v2/slash-2.png"),
	preload("res://assets/visual/fx/slash-warm-v2/slash-3.png"),
	preload("res://assets/visual/fx/slash-warm-v2/slash-4.png"),
	preload("res://assets/visual/fx/slash-warm-v2/slash-5.png"),
	preload("res://assets/visual/fx/slash-warm-v2/slash-6.png"),
]
const IMPACT_FX_FRAMES := [
	preload("res://assets/visual/fx/hit-impact-v2/impact-1.png"),
	preload("res://assets/visual/fx/hit-impact-v2/impact-2.png"),
	preload("res://assets/visual/fx/hit-impact-v2/impact-3.png"),
	preload("res://assets/visual/fx/hit-impact-v2/impact-4.png"),
	preload("res://assets/visual/fx/hit-impact-v2/impact-5.png"),
	preload("res://assets/visual/fx/hit-impact-v2/impact-6.png"),
]
const HERO_SLASH_WINDUP_WEIGHTS := [0.11, 0.13, 0.15, 0.16, 0.14, 0.12, 0.1, 0.09]
const HERO_SLASH_RECOVERY_WEIGHTS := [0.2, 0.24, 0.27, 0.29]
const HERO_BLOCK_WEIGHTS := [0.08, 0.1, 0.12, 0.18, 0.18, 0.12, 0.1, 0.12]
const HERO_DODGE_WEIGHTS := [0.1, 0.1, 0.09, 0.08, 0.08, 0.08, 0.1, 0.11, 0.12, 0.14]
const HERO_HURT_WEIGHTS := [0.12, 0.13, 0.19, 0.2, 0.18, 0.18]
const HERO_DEATH_WEIGHTS := [0.07, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.12, 0.11, 0.13]
const WOLF_POUNCE_WINDUP_WEIGHTS := [0.14, 0.18, 0.21, 0.2, 0.13, 0.08, 0.06]
const WOLF_POUNCE_RECOVERY_WEIGHTS := [0.17, 0.14, 0.2, 0.23, 0.26]
const WOLF_HURT_WEIGHTS := [0.1, 0.13, 0.22, 0.2, 0.17, 0.18]
const WOLF_DEATH_WEIGHTS := [0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.12, 0.11, 0.14]
const MOTION_TRAUMA_SCALE := 0.22
const MOTION_TRAUMA_CAP := 0.42
const CAMERA_SHAKE_OFFSET := Vector2(6.0, 4.0)
const STABLE_CHARACTER_PRESENTATION := true
const PIXEL_VERTICAL_SLICE := true
const PIXEL_FEET_RATIO := 228.0 / 256.0
const PIXEL_WOLF_FEET_RATIO := 244.0 / 256.0
const DEFEAT_REWIND_DURATION := 1.8
const ROAMING_HINT_DURATION := 2.8
const EXPLORATION_WORLD_SCALE := Vector2(1.65, 1.6)
const HERO_MAP_SPEED := 146.0
const ENEMY_CHASE_SPEED := 112.0
const ENCOUNTER_DISTANCE := 104.0
const COMBAT_DISTANCE := 122.0
const DRAG_THRESHOLD := 14.0

var reduced_motion := false
var momentum_ratio := 0.0
var enemy_armor_ratio := 0.0
var enemy_is_boss := false
var boss_enraged := false
var enemy_heavy_windup := false
var enemy_windup_ratio := 0.0
var hero_attack_windup_ratio := 0.0
var enemy_attack_type := "普通"
var _enemy_behavior := {"movement": "chase", "preferred_distance": 94.0, "chase_speed": 112.0}
var _enemy_attack_contract := {"movement_lock": false, "targeting": "tracking", "shape": "contact", "recovery": 0.32}
var _enemy_cast_active := false
var _enemy_cast_attack_type := ""
var _enemy_cast_origin := Vector2.ZERO
var _enemy_cast_target := Vector2.ZERO
var _enemy_cast_facing := 1.0
var _enemy_recovery_remaining := 0.0
var enemy_archetype := "grunt"
var enemy_role := ""
var enemy_hp_ratio := 1.0
var current_stage := 0
var enemy_guard_stacks := 0
var journey_route := "frontier"
var _map_region_name := "沉眠古戰場"
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
var _hero_hurt_motion := 0.0
var _hero_death_motion := 0.0
var _hero_defeated := false
var _defeat_rewind_motion := 0.0
var _enemy_attack_recover := 0.0
var _enemy_hurt_motion := 0.0
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
var _style_formed_burst := 0.0
var _style_formed_color := Color("f0c365")
var _milestone_fx := 0.0
var _milestone_mode := "impact"
var _milestone_level := 10
var _milestone_color := Color("e07845")
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
var _boss_intro_motion := 0.0
var _boss_enrage_burst := 0.0
var _boss_howl_burst := 0.0
var _enemy_guard_flash := 0.0
var _enemy_cast_burst := 0.0
var _enemy_entry_motion := 0.0
var _enemy_guard_break_burst := 0.0
var _damage_pool: Array[Label] = []
var _damage_cursor := 0
var _sfx_streams: Dictionary = {}
var _sfx_players: Array[AudioStreamPlayer] = []
var _sfx_cursor := 0
var _pixel_enemy_position := Vector2.ZERO
var exploration_enabled := false
var _exploration_phase := "disabled"
var _encounter_key := ""
var _hero_map_position := Vector2.ZERO
var _hero_map_target := Vector2.ZERO
var _enemy_map_position := Vector2.ZERO
var _enemy_camps: Array[Vector2] = []
var _active_enemy_camp_index := -1
var _last_consumed_camp_position := Vector2.ZERO
var _move_speed_bonus := 0.0
var _patrol_cursor := -1
var _encounter_wave := 1
var _encounter_wave_count := 1
var _enemy_group_members: Array = []
var _enemy_attack_member_index := 0
var _manual_waypoint_active := false
var _selected_landmark_name := ""
var _selected_landmark_effect := ""
var _claimed_landmark_name := ""
var _claimed_landmark_effect := ""
var _nearby_landmark_name := ""
var _discovered_landmarks: Dictionary = {}
var _roaming_hint_remaining := 0.0
var _landmark_acquire_fx := 0.0
var _landmark_acquire_name := ""
var _landmark_acquire_effect := ""
var _loot_drop_fx := 0.0
var _loot_drop_name := ""
var _loot_drop_quality := "common"
var _loot_drop_duplicate := false
var _loot_drop_gold := 0
var _experience_orb_fx := 0.0
var _experience_gain := 0
var _level_up_fx := 0.0
var _level_up_level := 1
var _boss_warning_fx := 0.0
var _boss_warning_remaining := 0
var _boss_imminent_fx := 0.0
var _spatial_evade_fx := 0.0
var _hero_facing := 1.0
var _enemy_facing := 1.0
var _navigation_paused := false
var _camera_top_left := Vector2.ZERO
var _pointer_down := false
var _pointer_origin := Vector2.ZERO
var _pointer_position := Vector2.ZERO
var _steering_active := false
var _steering_vector := Vector2.ZERO

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	gui_input.connect(_on_map_input)
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
		"landmark": _make_sfx("landmark"),
	}
	for index in 6:
		var player := AudioStreamPlayer.new()
		player.volume_db = -14.0
		add_child(player)
		_sfx_players.append(player)
	queue_redraw()

func _process(delta: float) -> void:
	_time += delta
	_update_exploration(delta)
	if _visual_freeze_remaining > 0.0:
		_visual_freeze_remaining = maxf(0.0, _visual_freeze_remaining - delta)
		queue_redraw()
		return
	trauma = maxf(0.0, trauma - delta * 1.45)
	_hero_action = maxf(0.0, _hero_action - delta * 3.4)
	_hero_slash_motion = maxf(0.0, _hero_slash_motion - delta / 0.26)
	_hero_block_motion = maxf(0.0, _hero_block_motion - delta / 0.5)
	_hero_dodge_motion = maxf(0.0, _hero_dodge_motion - delta / 0.48)
	_hero_hurt_motion = maxf(0.0, _hero_hurt_motion - delta / 0.38)
	_hero_death_motion = maxf(0.0, _hero_death_motion - delta / 1.05)
	_defeat_rewind_motion = maxf(0.0, _defeat_rewind_motion - delta / DEFEAT_REWIND_DURATION)
	if _hero_defeated and _defeat_rewind_motion <= 0.0:
		_hero_defeated = false
	_enemy_attack_recover = maxf(0.0, _enemy_attack_recover - delta / 0.38)
	_enemy_recovery_remaining = maxf(0.0, _enemy_recovery_remaining - delta)
	_enemy_hurt_motion = maxf(0.0, _enemy_hurt_motion - delta / 0.36)
	_enemy_death_motion = maxf(0.0, _enemy_death_motion - delta / 0.92)
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
	_style_formed_burst = maxf(0.0, _style_formed_burst - delta / 0.95)
	_milestone_fx = maxf(0.0, _milestone_fx - delta / (0.45 if _milestone_mode == "impact" else 0.7))
	_landmark_acquire_fx = maxf(0.0, _landmark_acquire_fx - delta / 1.05)
	_loot_drop_fx = maxf(0.0, _loot_drop_fx - delta / 1.45)
	_experience_orb_fx = maxf(0.0, _experience_orb_fx - delta / 0.82)
	_level_up_fx = maxf(0.0, _level_up_fx - delta / 1.25)
	_boss_warning_fx = maxf(0.0, _boss_warning_fx - delta / 1.65)
	_boss_imminent_fx = maxf(0.0, _boss_imminent_fx - delta / 1.55)
	_spatial_evade_fx = maxf(0.0, _spatial_evade_fx - delta / 0.72)
	_enemy_flash = maxf(0.0, _enemy_flash - delta * 8.0)
	_hero_flash = maxf(0.0, _hero_flash - delta * 7.0)
	_enemy_knockback = maxf(0.0, _enemy_knockback - delta * 5.8)
	_hero_recoil = maxf(0.0, _hero_recoil - delta * 6.5)
	_impact_burst = maxf(0.0, _impact_burst - delta * 7.0)
	_hurt_vignette = maxf(0.0, _hurt_vignette - delta * 4.8)
	_defeat_burst = maxf(0.0, _defeat_burst - delta * (1.25 if _defeat_was_boss else 2.5))
	_boss_intro_motion = maxf(0.0, _boss_intro_motion - delta / 1.15)
	_boss_enrage_burst = maxf(0.0, _boss_enrage_burst - delta / 0.85)
	_boss_howl_burst = maxf(0.0, _boss_howl_burst - delta / 0.9)
	_enemy_guard_flash = maxf(0.0, _enemy_guard_flash - delta / 0.45)
	_enemy_cast_burst = maxf(0.0, _enemy_cast_burst - delta / 0.5)
	_enemy_entry_motion = maxf(0.0, _enemy_entry_motion - delta / 0.48)
	_enemy_guard_break_burst = maxf(0.0, _enemy_guard_break_burst - delta / 0.56)
	queue_redraw()

func set_state(snapshot: Dictionary) -> void:
	var was_windup := enemy_heavy_windup
	var previous_attack_type := enemy_attack_type
	if float(snapshot.hero_hp) > 0.0 and not defeat_sequence_active():
		_hero_defeated = false
	momentum_ratio = float(snapshot.momentum) / maxf(1.0, float(snapshot.max_momentum))
	enemy_armor_ratio = clampf(float(snapshot.enemy_armor) / 50.0, 0.0, 1.0)
	enemy_is_boss = bool(snapshot.enemy_is_boss)
	boss_enraged = bool(snapshot.get("boss_enraged", false))
	enemy_attack_type = String(snapshot.enemy_attack_type)
	_enemy_behavior = Dictionary(snapshot.get("enemy_behavior", _enemy_behavior)).duplicate(true)
	_enemy_attack_contract = Dictionary(snapshot.get("enemy_attack_contract", _enemy_attack_contract)).duplicate(true)
	var next_archetype := String(snapshot.enemy_archetype)
	var next_stage := int(snapshot.stage)
	if current_stage > 0 and next_stage != current_stage:
		_enemy_entry_motion = 1.0
	elif current_stage == 0:
		_enemy_entry_motion = 0.72
	enemy_archetype = next_archetype
	enemy_role = String(snapshot.get("enemy_role", ""))
	enemy_hp_ratio = clampf(float(snapshot.enemy_hp) / maxf(1.0, float(snapshot.enemy_max_hp)), 0.0, 1.0)
	current_stage = next_stage
	enemy_guard_stacks = int(snapshot.get("enemy_guard_stacks", 0))
	journey_route = String(snapshot.journey_route)
	_map_region_name = String(snapshot.get("journey_name", "沉眠古戰場"))
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
	_encounter_wave = int(snapshot.get("wave", 1))
	_encounter_wave_count = int(snapshot.get("wave_count", 1))
	_enemy_group_members = Array(snapshot.get("enemy_group_members", [])).duplicate(true)
	_move_speed_bonus = float(snapshot.get("move_speed_bonus", 0.0))
	if exploration_enabled and float(snapshot.enemy_hp) > 0.0:
		var next_key := str(int(snapshot.stage))
		if next_key != _encounter_key:
			_begin_exploration(next_key)
	if enemy_heavy_windup and (not was_windup or previous_attack_type != enemy_attack_type):
		_begin_enemy_cast(enemy_attack_type)
	elif was_windup and not enemy_heavy_windup and _enemy_cast_active:
		_finish_enemy_cast()

func set_exploration_enabled(value: bool) -> void:
	exploration_enabled = value
	if not value:
		_exploration_phase = "disabled"
		return
	if _exploration_phase == "disabled":
		_encounter_key = ""
	queue_redraw()

func navigation_blocks_combat() -> bool:
	if not exploration_enabled:
		return false
	if _exploration_phase == "traveling":
		return true
	var outside_combat_range := _hero_map_position.distance_to(_enemy_map_position) > COMBAT_DISTANCE
	return outside_combat_range and not enemy_heavy_windup

func spatial_combat_state() -> Dictionary:
	var valid_positions := _hero_map_position != Vector2.ZERO and _enemy_map_position != Vector2.ZERO
	var enemy_distance := _hero_map_position.distance_to(_enemy_map_position) if valid_positions else 0.0
	var danger_distance := enemy_distance
	if _enemy_cast_active:
		var targeting := String(_enemy_attack_contract.get("targeting", "tracking"))
		if targeting == "locked_ground":
			danger_distance = _hero_map_position.distance_to(_enemy_cast_target)
		elif targeting == "locked_origin":
			danger_distance = _hero_map_position.distance_to(_enemy_cast_origin)
	return {
		"enabled": exploration_enabled and _exploration_phase == "engaged" and valid_positions,
		"distance": enemy_distance,
		"danger_distance": danger_distance,
	}

func _begin_enemy_cast(attack_type: String) -> void:
	if not exploration_enabled or _exploration_phase != "engaged":
		return
	_enemy_cast_active = true
	_enemy_cast_attack_type = attack_type
	_enemy_cast_origin = _enemy_map_position
	_enemy_cast_target = _hero_map_position
	_enemy_cast_facing = _enemy_facing

func _finish_enemy_cast() -> void:
	_enemy_cast_active = false
	_enemy_cast_attack_type = ""
	_enemy_recovery_remaining = maxf(_enemy_recovery_remaining, float(_enemy_attack_contract.get("recovery", 0.38)))

func _clear_enemy_cast() -> void:
	_enemy_cast_active = false
	_enemy_cast_attack_type = ""
	_enemy_cast_origin = Vector2.ZERO
	_enemy_cast_target = Vector2.ZERO
	_enemy_recovery_remaining = 0.0

func _enemy_action_state() -> String:
	if _enemy_death_motion > 0.0:
		return "dead"
	if _enemy_cast_active:
		return "windup"
	if _enemy_recovery_remaining > 0.0:
		return "recover"
	if _exploration_phase == "traveling":
		return "seek"
	return "approach" if _hero_map_position.distance_to(_enemy_map_position) > float(_enemy_behavior.get("preferred_distance", 94.0)) else "ready"

func set_navigation_paused(value: bool) -> void:
	_navigation_paused = value

func exploration_status() -> Dictionary:
	return {
		"phase": _exploration_phase,
		"enemy_action": _enemy_action_state(),
		"target": _enemy_map_position,
		"manual_waypoint": _manual_waypoint_active,
		"landmark": _current_landmark_name(),
		"landmark_effect": active_landmark_effect(),
		"selected_landmark": _selected_landmark_name,
		"claimed_landmark": _claimed_landmark_name,
		"nearby_landmark": _nearby_landmark_name,
		"enemy_group_size": maxi(1, _encounter_wave_count - _encounter_wave + 1),
		"visible_enemy_camps": _enemy_camps.size(),
	}

func active_landmark_effect() -> String:
	if _exploration_phase != "engaged" or _enemy_map_position == Vector2.ZERO:
		return ""
	if not _claimed_landmark_effect.is_empty():
		return _claimed_landmark_effect
	var nearest_kind := ""
	var nearest_distance := INF
	for landmark: Dictionary in _landmarks():
		var distance := _enemy_map_position.distance_to(Vector2(landmark.position))
		if distance < nearest_distance:
			nearest_distance = distance
			nearest_kind = String(landmark.kind)
	if nearest_distance > 190.0:
		return ""
	return _landmark_effect_for_kind(nearest_kind)

func _begin_exploration(key: String) -> void:
	_clear_enemy_cast()
	if not _encounter_key.is_empty() and key != _encounter_key:
		_consume_active_enemy_camp()
	_encounter_key = key
	var world_size := _exploration_world_size()
	var first_spawn := _hero_map_position == Vector2.ZERO
	if _hero_map_position == Vector2.ZERO:
		_hero_map_position = Vector2(world_size.x * 0.5, world_size.y * 0.82)
	else:
		_hero_map_position.x = clampf(_hero_map_position.x, 52.0, world_size.x - 52.0)
		_hero_map_position.y = clampf(_hero_map_position.y, 150.0, world_size.y - 36.0)
	_ensure_enemy_camps()
	_select_nearest_enemy_camp()
	_manual_waypoint_active = false
	_selected_landmark_name = ""
	_selected_landmark_effect = ""
	_claimed_landmark_name = ""
	_claimed_landmark_effect = ""
	_nearby_landmark_name = ""
	_roaming_hint_remaining = ROAMING_HINT_DURATION
	_set_enemy_approach_target()
	_exploration_phase = "traveling"
	_update_exploration_camera(1.0, first_spawn)
	queue_redraw()

func _ensure_enemy_camps() -> void:
	var patrol_points := _patrol_points()
	var attempts := 0
	while _enemy_camps.size() < 3 and attempts < patrol_points.size() * 2:
		_patrol_cursor = (_patrol_cursor + 1) % patrol_points.size()
		var candidate := patrol_points[_patrol_cursor]
		attempts += 1
		if _hero_map_position.distance_to(candidate) < 150.0:
			continue
		if _last_consumed_camp_position != Vector2.ZERO and _last_consumed_camp_position.distance_to(candidate) < 80.0:
			continue
		if _landmarks().any(func(landmark: Dictionary) -> bool: return Vector2(landmark.position).distance_to(candidate) < 96.0):
			continue
		if _enemy_camps.any(func(position: Vector2) -> bool: return position.distance_to(candidate) < 80.0):
			continue
		_enemy_camps.append(candidate)

func _consume_active_enemy_camp() -> void:
	if _active_enemy_camp_index >= 0 and _active_enemy_camp_index < _enemy_camps.size():
		_last_consumed_camp_position = _enemy_camps[_active_enemy_camp_index]
		_enemy_camps.remove_at(_active_enemy_camp_index)
	_active_enemy_camp_index = -1

func _select_nearest_enemy_camp() -> void:
	if _enemy_camps.is_empty():
		_enemy_map_position = Vector2.ZERO
		_active_enemy_camp_index = -1
		return
	var nearest_index := 0
	var nearest_distance := INF
	for index in _enemy_camps.size():
		var distance := _hero_map_position.distance_to(_enemy_camps[index])
		if distance < nearest_distance:
			nearest_distance = distance
			nearest_index = index
	_active_enemy_camp_index = nearest_index
	_enemy_map_position = _enemy_camps[nearest_index]

func _enemy_camp_at(world_position: Vector2) -> int:
	for index in _enemy_camps.size():
		if world_position.distance_to(_enemy_camps[index]) <= 58.0:
			return index
	return -1

func _nearest_enemy_camp_index(max_distance: float) -> int:
	var nearest_index := -1
	var nearest_distance := max_distance
	for index in _enemy_camps.size():
		var distance := _hero_map_position.distance_to(_enemy_camps[index])
		if distance <= nearest_distance:
			nearest_distance = distance
			nearest_index = index
	return nearest_index

func _patrol_points() -> Array[Vector2]:
	var world_size := _exploration_world_size()
	return [
		Vector2(world_size.x * 0.78, world_size.y * 0.48),
		Vector2(world_size.x * 0.16, world_size.y * 0.46),
		Vector2(world_size.x * 0.66, world_size.y * 0.78),
		Vector2(world_size.x * 0.48, world_size.y * 0.44),
		Vector2(world_size.x * 0.55, world_size.y * 0.62),
		Vector2(world_size.x * 0.18, world_size.y * 0.76),
	]

func _landmarks() -> Array[Dictionary]:
	var world_size := _exploration_world_size()
	return [
		{"name": "殘破哨塔", "kind": "tower", "position": Vector2(world_size.x * 0.42, world_size.y * 0.28)},
		{"name": "斷旗丘", "kind": "banner", "position": Vector2(world_size.x * 0.23, world_size.y * 0.5)},
		{"name": "古戰場石環", "kind": "stones", "position": Vector2(world_size.x * 0.76, world_size.y * 0.72)},
	]

func _landmark_effect_for_kind(kind: String) -> String:
	return {"tower": "scout", "banner": "direct", "stones": "supply"}.get(kind, "")

func _landmark_at(world_position: Vector2) -> Dictionary:
	for landmark: Dictionary in _landmarks():
		if world_position.distance_to(Vector2(landmark.position)) <= 54.0:
			return landmark
	return {}

func _current_landmark_name() -> String:
	if _enemy_map_position == Vector2.ZERO:
		return ""
	var nearest_name := "荒地巡路"
	var nearest_distance := INF
	for landmark: Dictionary in _landmarks():
		var distance := _enemy_map_position.distance_to(Vector2(landmark.position))
		if distance < nearest_distance:
			nearest_distance = distance
			nearest_name = String(landmark.name)
	return nearest_name if nearest_distance <= 190.0 else "荒地巡路"

func _set_enemy_approach_target() -> void:
	var world_size := _exploration_world_size()
	_hero_map_target = _enemy_map_position
	_hero_map_target.x = clampf(_hero_map_target.x, 52.0, world_size.x - 52.0)
	_hero_map_target.y = clampf(_hero_map_target.y, 150.0, world_size.y - 36.0)

func _visible_map_size() -> Vector2:
	var bottom := minf(stage_bottom, size.y - 112.0)
	return Vector2(size.x, maxf(260.0, bottom - stage_top))

func _exploration_world_size() -> Vector2:
	var view_size := _visible_map_size()
	return Vector2(
		maxf(view_size.x * EXPLORATION_WORLD_SCALE.x, view_size.x + 220.0),
		maxf(view_size.y * EXPLORATION_WORLD_SCALE.y, view_size.y + 220.0)
	)

func _update_exploration_camera(delta: float, snap := false) -> void:
	var view_size := _visible_map_size()
	var world_size := _exploration_world_size()
	var focus := _camera_focus_position(view_size)
	var desired := focus - view_size * 0.5
	desired.x = clampf(desired.x, 0.0, world_size.x - view_size.x)
	desired.y = clampf(desired.y, 0.0, world_size.y - view_size.y)
	_camera_top_left = Vector2(roundf(desired.x), roundf(desired.y))

func _camera_focus_position(view_size: Vector2) -> Vector2:
	return _hero_map_position

func _world_to_screen(world_position: Vector2) -> Vector2:
	return Vector2(world_position.x - _camera_top_left.x, stage_top + world_position.y - _camera_top_left.y)

func _screen_to_world(screen_position: Vector2) -> Vector2:
	return Vector2(screen_position.x + _camera_top_left.x, screen_position.y - stage_top + _camera_top_left.y)

func _update_exploration(delta: float) -> void:
	if not exploration_enabled or _navigation_paused:
		return
	_roaming_hint_remaining = maxf(0.0, _roaming_hint_remaining - delta)
	var manual_route_completed := _update_hero_map_movement(delta)
	if _exploration_phase == "traveling":
		var contacted_camp := _nearest_enemy_camp_index(ENCOUNTER_DISTANCE)
		if contacted_camp >= 0 and _selected_landmark_name.is_empty() and not manual_route_completed:
			_active_enemy_camp_index = contacted_camp
			_enemy_map_position = _enemy_camps[contacted_camp]
			_manual_waypoint_active = false
			_hero_facing = 1.0 if _enemy_map_position.x >= _hero_map_position.x else -1.0
			_exploration_phase = "engaged"
		_update_landmark_discovery_hint()
	elif _exploration_phase == "engaged":
		_update_enemy_chase(delta)
	_update_enemy_facing()
	_update_exploration_camera(delta)
	queue_redraw()

func _update_hero_map_movement(delta: float) -> bool:
	var world_size := _exploration_world_size()
	var speed := HERO_MAP_SPEED * (1.0 + _move_speed_bonus)
	if _steering_active:
		_manual_waypoint_active = false
		_selected_landmark_name = ""
		_selected_landmark_effect = ""
		_hero_facing = signf(_steering_vector.x) if absf(_steering_vector.x) > 0.08 else _hero_facing
		_hero_map_position += _steering_vector * speed * delta
		_hero_map_position.x = clampf(_hero_map_position.x, 52.0, world_size.x - 52.0)
		_hero_map_position.y = clampf(_hero_map_position.y, 150.0, world_size.y - 36.0)
		return false
	if not _manual_waypoint_active and _exploration_phase != "traveling":
		return false
	var move_vector := _hero_map_position.direction_to(_hero_map_target)
	_hero_facing = signf(move_vector.x) if absf(move_vector.x) > 0.08 else _hero_facing
	_hero_map_position = _hero_map_position.move_toward(_hero_map_target, speed * delta)
	if _hero_map_position.distance_to(_hero_map_target) > 1.0:
		return false
	_hero_map_position = _hero_map_target
	if not _manual_waypoint_active:
		return false
	_manual_waypoint_active = false
	if not _selected_landmark_effect.is_empty():
		_claimed_landmark_name = _selected_landmark_name
		_claimed_landmark_effect = _selected_landmark_effect
		_play_landmark_acquired(_claimed_landmark_name, _claimed_landmark_effect)
		_selected_landmark_name = ""
		_selected_landmark_effect = ""
		_roaming_hint_remaining = 1.8
	if _exploration_phase == "traveling":
		_select_nearest_enemy_camp()
		_set_enemy_approach_target()
	return true

func _update_enemy_chase(delta: float) -> void:
	if _enemy_cast_active or _enemy_recovery_remaining > 0.0:
		return
	var distance := _enemy_map_position.distance_to(_hero_map_position)
	var movement := String(_enemy_behavior.get("movement", "chase"))
	var preferred_distance := float(_enemy_behavior.get("preferred_distance", COMBAT_DISTANCE * 0.78))
	var chase_speed := float(_enemy_behavior.get("chase_speed", ENEMY_CHASE_SPEED))
	var moved := false
	if movement == "keep_range" and distance < preferred_distance - 12.0:
		var retreat_direction := _hero_map_position.direction_to(_enemy_map_position)
		_enemy_map_position += retreat_direction * chase_speed * delta
		var world_size := _exploration_world_size()
		_enemy_map_position.x = clampf(_enemy_map_position.x, 52.0, world_size.x - 52.0)
		_enemy_map_position.y = clampf(_enemy_map_position.y, 150.0, world_size.y - 36.0)
		moved = true
	elif distance > preferred_distance:
		_enemy_map_position = _enemy_map_position.move_toward(_hero_map_position, chase_speed * delta)
		moved = true
	if moved:
		if _active_enemy_camp_index >= 0 and _active_enemy_camp_index < _enemy_camps.size():
			_enemy_camps[_active_enemy_camp_index] = _enemy_map_position
	if not _steering_active:
		_hero_facing = 1.0 if _enemy_map_position.x >= _hero_map_position.x else -1.0

func _update_enemy_facing() -> void:
	if not exploration_enabled or _enemy_death_motion > 0.0 or _hero_map_position == Vector2.ZERO or _enemy_map_position == Vector2.ZERO:
		return
	if _enemy_cast_active and String(_enemy_attack_contract.get("targeting", "tracking")) != "tracking":
		_enemy_facing = _enemy_cast_facing
		return
	var horizontal_distance := _hero_map_position.x - _enemy_map_position.x
	if absf(horizontal_distance) <= 3.0:
		return
	_enemy_facing = -1.0 if horizontal_distance > 0.0 else 1.0

func _enemy_facing_for_world_position(world_position: Vector2) -> float:
	if _hero_map_position == Vector2.ZERO or absf(_hero_map_position.x - world_position.x) <= 3.0:
		return 1.0
	return -1.0 if _hero_map_position.x > world_position.x else 1.0

func _play_landmark_acquired(landmark_name: String, effect: String) -> void:
	_landmark_acquire_fx = 1.0
	_landmark_acquire_name = landmark_name
	_landmark_acquire_effect = effect
	_play_sfx("landmark")

func _update_landmark_discovery_hint() -> void:
	if not _selected_landmark_name.is_empty() or not _claimed_landmark_name.is_empty():
		return
	var nearest_name := ""
	var nearest_distance := 221.0
	for landmark: Dictionary in _landmarks():
		var landmark_name := String(landmark.name)
		if _discovered_landmarks.has(landmark_name):
			continue
		var distance := _hero_map_position.distance_to(Vector2(landmark.position))
		if distance < nearest_distance:
			nearest_name = landmark_name
			nearest_distance = distance
	if not nearest_name.is_empty():
		_discovered_landmarks[nearest_name] = true
		_nearby_landmark_name = nearest_name
		_roaming_hint_remaining = 2.4

func _on_map_input(event: InputEvent) -> void:
	if not exploration_enabled or _exploration_phase == "disabled":
		return
	if event is InputEventScreenTouch:
		if event.pressed:
			_begin_pointer_move(event.position)
			_handle_map_tap(event.position)
		else:
			_end_pointer_move()
		accept_event()
		return
	if event is InputEventScreenDrag:
		_update_pointer_move(event.position)
		accept_event()
		return
	elif event is InputEventMouseButton:
		if event.button_index != MOUSE_BUTTON_LEFT:
			return
		if event.pressed:
			_begin_pointer_move(event.position)
			_handle_map_tap(event.position)
		else:
			_end_pointer_move()
		accept_event()
		return
	elif event is InputEventMouseMotion and _pointer_down:
		_update_pointer_move(event.position)
		accept_event()

func _begin_pointer_move(pointer: Vector2) -> void:
	if pointer.y < stage_top or pointer.y > minf(stage_bottom, size.y - 112.0):
		return
	_pointer_down = true
	_pointer_origin = pointer
	_pointer_position = pointer
	_steering_active = false
	_steering_vector = Vector2.ZERO

func _update_pointer_move(pointer: Vector2) -> void:
	if not _pointer_down:
		return
	_pointer_position = pointer
	var drag_vector := pointer - _pointer_origin
	if drag_vector.length() >= DRAG_THRESHOLD:
		_steering_active = true
		_steering_vector = drag_vector.normalized()
		_manual_waypoint_active = false
		_selected_landmark_name = ""
		_selected_landmark_effect = ""
		_roaming_hint_remaining = 0.0

func _end_pointer_move() -> void:
	_pointer_down = false
	_steering_active = false
	_steering_vector = Vector2.ZERO
	if _exploration_phase == "traveling":
		_select_nearest_enemy_camp()
		_set_enemy_approach_target()

func _handle_map_tap(pointer: Vector2) -> void:
	if not _pointer_down:
		return
	var world_size := _exploration_world_size()
	var world_pointer := _screen_to_world(pointer)
	var enemy_camp_index := _enemy_camp_at(world_pointer)
	var landmark := _landmark_at(world_pointer)
	if enemy_camp_index >= 0 and _exploration_phase == "traveling":
		_active_enemy_camp_index = enemy_camp_index
		_enemy_map_position = _enemy_camps[enemy_camp_index]
		_selected_landmark_name = ""
		_selected_landmark_effect = ""
		_manual_waypoint_active = false
		_set_enemy_approach_target()
		_roaming_hint_remaining = 1.2
	elif landmark.is_empty():
		_selected_landmark_name = ""
		_selected_landmark_effect = ""
		_hero_map_target = Vector2(
			clampf(world_pointer.x, 52.0, world_size.x - 52.0),
			clampf(world_pointer.y, 150.0, world_size.y - 36.0)
		)
	elif _exploration_phase == "traveling":
		_selected_landmark_name = String(landmark.name)
		_selected_landmark_effect = _landmark_effect_for_kind(String(landmark.kind))
		_hero_map_target = Vector2(landmark.position)
		_manual_waypoint_active = true
		_roaming_hint_remaining = 1.8 if not _selected_landmark_name.is_empty() else 1.2
	if enemy_camp_index < 0 and landmark.is_empty():
		_manual_waypoint_active = true
		_roaming_hint_remaining = 1.2
	queue_redraw()

func set_stage_bounds(top: float, bottom: float) -> void:
	stage_top = maxf(96.0, top + 2.0)
	stage_bottom = maxf(stage_top + 250.0, bottom - 2.0)

func play_events(events: Array[Dictionary]) -> void:
	for event: Dictionary in events:
		if event.has("milestone_track"):
			_play_milestone_choice_fx(event)
		match String(event.type):
			"exploration_approach":
				var effect := String(event.get("approach", ""))
				if _landmark_acquire_fx <= 0.0 or _landmark_acquire_effect != effect:
					_play_landmark_acquired(String(event.get("name", "地標優勢")), effect)
			"wave_started":
				_clear_enemy_cast()
				_enemy_death_motion = 0.0
				_enemy_hurt_motion = 0.0
				_enemy_attack_recover = 0.0
				_enemy_entry_motion = 1.0
				_enemy_attack_member_index = 0
			"boss_entered":
				_enemy_death_motion = 0.0
				_enemy_hurt_motion = 0.0
				_enemy_attack_recover = 0.0
				trauma = 0.0
				_boss_intro_motion = 1.0
				_hit_stop(0.06)
			"boss_warning":
				_boss_warning_fx = 1.0
				_boss_warning_remaining = int(event.get("remaining", 3))
			"boss_imminent":
				_boss_imminent_fx = 1.0
				add_trauma(0.08)
			"experience_gain":
				_experience_orb_fx = 1.0
				_experience_gain = int(event.get("gain", 0))
			"level_up":
				_level_up_fx = 1.0
				_level_up_level = int(event.get("level", 1))
				_play_sfx("landmark")
			"equipment_drop":
				_loot_drop_fx = 1.0
				_loot_drop_name = String(event.get("name", "未知裝備"))
				_loot_drop_quality = String(event.get("quality", "common"))
				_loot_drop_duplicate = false
				_loot_drop_gold = 0
				_play_sfx("landmark")
			"equipment_duplicate":
				_loot_drop_fx = 1.0
				_loot_drop_name = String(event.get("name", "重複裝備"))
				_loot_drop_quality = String(event.get("quality", "common"))
				_loot_drop_duplicate = true
				_loot_drop_gold = int(event.get("gold", 0))
			"boss_enraged":
				_boss_enrage_burst = 1.0
				add_trauma(0.14)
				_hit_stop(0.045)
			"boss_howl":
				_boss_howl_burst = 1.0
				add_trauma(0.1)
			"enemy_attack":
				if _enemy_cast_active:
					_finish_enemy_cast()
				_enemy_attack_recover = 1.0
				_enemy_attack_member_index = int(event.get("attacker_index", 0))
				if String(event.get("attack_type", "normal")) != "normal":
					_enemy_cast_burst = 1.0
			"spatial_evade":
				_spatial_evade_fx = 1.0
				_hero_dodge_motion = maxf(_hero_dodge_motion, 0.45)
				_dodge_flash = maxf(_dodge_flash, 0.72)
				_play_sfx("dodge")
			"enemy_guard":
				_enemy_guard_flash = 1.0
				_hit_stop(0.02)
			"enemy_guard_broken":
				_enemy_guard_flash = 1.0
				_enemy_guard_break_burst = 1.0
				_armor_break_flash = 1.0
				add_trauma(0.18)
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
			"shadow_assault", "shadow_return":
				_hero_slash_motion = 1.0
				_shadow_assault = 1.0
				add_trauma(0.25 if String(event.type) == "shadow_assault" else 0.16)
			"flowing_shadow":
				_flow_burst_strength = 0.75
				_flow_burst = 1.0
			"flying_swallow":
				_hero_slash_motion = 1.0
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
				_hero_slash_motion = 1.0
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
			"momentum_slash":
				_hero_slash_motion = 1.0
				_heavy_slash = maxf(_heavy_slash, 0.78)
				_momentum_pulse = 1.0
				add_trauma(0.18)
			"style_formed":
				_style_formed_burst = 1.0
				_style_formed_color = {
					"martial": Color("e07845"), "physique": Color("73a9bd"),
					"agility": Color("8c79c6"), "magic": Color("b56eae"),
					"faith": Color("e8cf72"), "command": Color("ba705a"),
				}.get(String(event.get("track", "martial")), Color("f0c365"))
				_hero_flash = 0.7
			"damage":
				_enemy_flash = 1.0
				_enemy_hurt_motion = 1.0
				var source := String(event.source)
				var tier := impact_tier_for_source(source)
				_spawn_damage(float(event.amount), source)
				_apply_impact(tier, source)
			"hero_hit":
				_enemy_attack_recover = 1.0
				_hero_flash = 1.0
				_hero_recoil = 1.0
				_hero_hurt_motion = 1.0
				_hurt_vignette = 1.0
				add_trauma(0.16)
				_hit_stop(0.035)
				_play_sfx("hurt")
			"enemy_defeated":
				_clear_enemy_cast()
				_enemy_death_motion = 1.0
				_enemy_hurt_motion = 0.0
				_enemy_attack_recover = 0.0
				_enemy_knockback = 0.0
				trauma = 0.0
				_defeat_burst = 1.0
				_defeat_was_boss = bool(event.get("boss", false))
				_hit_stop(0.13 if _defeat_was_boss else 0.055)
				_play_sfx("boss_defeat" if _defeat_was_boss else "defeat")
			"defeat":
				_hero_death_motion = 1.0
				_hero_defeated = true
				_defeat_rewind_motion = 1.0
				_hero_hurt_motion = 0.0
				_hero_slash_motion = 0.0
				_hero_block_motion = 0.0
				_hero_dodge_motion = 0.0
				_hero_action = 0.0
				_hero_recoil = 0.0
				trauma = 0.0
				_hit_stop(0.08)
				_play_sfx("defeat")

func _play_milestone_choice_fx(event: Dictionary) -> void:
	_milestone_fx = 1.0
	_milestone_mode = String(event.get("milestone_mode", "impact"))
	_milestone_level = int(event.get("milestone_level", 10))
	_milestone_color = {
		"martial": Color("ef794f"), "physique": Color("73b5d2"), "agility": Color("66d2b1"),
		"magic": Color("bd75e2"), "faith": Color("f0d978"), "command": Color("c85f4f"),
	}.get(String(event.get("milestone_track", "martial")), Color("f0c365"))
	if _milestone_mode == "impact":
		_hit_stop(0.025 + float(_milestone_level) / 2000.0)
		add_trauma(0.06 + float(_milestone_level) / 800.0)

func defeat_sequence_active() -> bool:
	return _defeat_rewind_motion > 0.0

func defeat_rewind_progress() -> float:
	return clampf(1.0 - _defeat_rewind_motion, 0.0, 1.0)

func impact_tier_for_source(source: String) -> String:
	if source in ["burn_tick", "lightning_tick", "holy_enchant", "magic_enchant"] or source.begins_with("ally_"):
		return "light"
	if source in ["heavy_strike_high", "heavy_strike_extreme", "mountain_break", "armor_flash", "execute_slash", "collapse_counter", "heaven_return", "two_cut", "flame_burst_slash", "elemental_resonance", "elemental_boundary_slash", "shadowless_extreme", "ten_thousand_armies_one_sword"]:
		return "heavy"
	if source in ["heavy_strike_base", "heavy_strike_martial", "heavy_strike_swift", "momentum_slash", "critical_attack", "counter", "first_strike", "swift_step", "shadow_assault", "shadow_return", "flying_swallow", "magic_slash", "judgment_slash"]:
		return "medium"
	return "light"

func _apply_impact(tier: String, source: String) -> void:
	_impact_burst = 1.0
	_impact_strength = 0.45 if tier == "light" else (0.72 if tier == "medium" else 1.0)
	_impact_color = Color("aeefff") if source in ["armor_flash", "counter", "collapse_counter", "heaven_return"] else (Color("d7c4ff") if source in ["swift_step", "shadow_assault", "shadow_return", "flying_swallow", "shadowless_extreme"] else (Color("ff9a52") if source in ["magic_enchant", "magic_slash", "burn_tick", "flame_burst_slash", "elemental_boundary_slash"] else Color("fff0b0")))
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
	trauma = clampf(trauma + amount * MOTION_TRAUMA_SCALE, 0.0, MOTION_TRAUMA_CAP)

func _weighted_frame_index(progress: float, first_index: int, weights: Array) -> int:
	var cursor := 0.0
	var normalized_progress := clampf(progress, 0.0, 0.9999)
	for index in weights.size():
		cursor += float(weights[index])
		if normalized_progress < cursor:
			return first_index + index
	return first_index + weights.size() - 1

func _draw() -> void:
	if PIXEL_VERTICAL_SLICE:
		_draw_pixel_vertical_slice()
		return
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
	var death_active := _hero_death_motion > 0.0 or _enemy_death_motion > 0.0
	var shake := 0.0 if death_active else trauma * trauma
	var shake_offset := Vector2(sin(_time * 25.0) * CAMERA_SHAKE_OFFSET.x, sin(_time * 33.0) * CAMERA_SHAKE_OFFSET.y) * shake
	var visible_bottom := minf(stage_bottom - 10.0, size.y - 120.0)
	var enemy_pos := Vector2(size.x * 0.69, lerpf(stage_top, visible_bottom, 0.62)) + shake_offset
	var hero_pos := Vector2(size.x * 0.33, lerpf(stage_top, visible_bottom, 0.97)) + shake_offset
	var ally_lunge := sin(_ally_action * PI) * minf(size.x * 0.12, 46.0)
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

func _draw_pixel_vertical_slice() -> void:
	var rewind_progress := defeat_rewind_progress()
	var rewind_pan := 0.0
	if defeat_sequence_active() and rewind_progress >= 0.42 and rewind_progress <= 0.84:
		rewind_pan = sin((rewind_progress - 0.42) / 0.42 * PI) * 0.075
	var background_texture: Texture2D = EXPLORATION_BACKGROUND if exploration_enabled else PIXEL_BACKGROUND
	var background_focus := Vector2(0.5 + rewind_pan, 0.59)
	if exploration_enabled:
		var world_size := _exploration_world_size()
		var view_size := _visible_map_size()
		background_focus = Vector2(
			clampf((_camera_top_left.x + view_size.x * 0.5) / world_size.x + rewind_pan, 0.18, 0.82),
			clampf((_camera_top_left.y + view_size.y * 0.5) / world_size.y, 0.2, 0.8)
		)
	if exploration_enabled:
		var map_view_size := _visible_map_size()
		_draw_exploration_background(background_texture, Rect2(Vector2(0.0, stage_top), map_view_size))
	else:
		_draw_cover_texture(background_texture, Rect2(Vector2.ZERO, size), background_focus)
	draw_rect(Rect2(Vector2.ZERO, size), Color("193041", 0.05))
	if exploration_enabled:
		_draw_landmarks()
		_draw_roaming_enemy_camps()
		_draw_active_enemy_indicator()
	var visible_bottom := minf(stage_bottom - 8.0, size.y - 112.0)
	var battle_line := lerpf(stage_top, visible_bottom, 0.79)
	var hero_pos := _world_to_screen(_hero_map_position) if exploration_enabled and _hero_map_position != Vector2.ZERO else Vector2(clampf(size.x * 0.29, 66.0, size.x - 160.0), battle_line + 20.0)
	var enemy_world_screen := _world_to_screen(_enemy_map_position) if exploration_enabled and _enemy_map_position != Vector2.ZERO else Vector2(clampf(size.x * 0.72, 170.0, size.x - 66.0), battle_line)
	var enemy_pos := _enemy_presentation_position(enemy_world_screen) if exploration_enabled else enemy_world_screen
	var enemy_in_view := not exploration_enabled or _exploration_phase == "engaged" or _enemy_visible_on_map(enemy_world_screen)
	_pixel_enemy_position = enemy_pos
	if exploration_enabled:
		_draw_drag_control()

	if not defeat_sequence_active() or rewind_progress < 0.45:
		for index in ally_count:
			var row := index / 2
			var column := index % 2
			_draw_ally(hero_pos + Vector2(-55.0 - float(column) * 30.0, -10.0 - float(row) * 42.0), index)

	if enemy_in_view and (not defeat_sequence_active() or rewind_progress < 0.44):
		_draw_enemy_group_reserves(enemy_pos)
		_draw_pixel_enemy(enemy_pos)
	_draw_pixel_hero(hero_pos)
	_draw_landmark_acquire_fx(hero_pos)
	_draw_style_formed_burst(hero_pos)
	_draw_pixel_combat_fx(hero_pos, enemy_pos)
	_draw_progression_fx(hero_pos, enemy_pos)
	_draw_loot_drop_fx(enemy_pos)
	_draw_exploration_minimap()
	_draw_boss_arrival_notice()
	if _hurt_vignette > 0.0:
		draw_rect(Rect2(Vector2.ZERO, size), Color("a82e2e", _hurt_vignette * 0.13), false, 10.0)

func _enemy_visible_on_map(screen_position: Vector2) -> bool:
	var visible_bottom := minf(stage_bottom - 8.0, size.y - 112.0)
	return screen_position.x >= 22.0 and screen_position.x <= size.x - 22.0 \
		and screen_position.y >= stage_top + 168.0 and screen_position.y <= visible_bottom + 16.0

func _enemy_presentation_position(screen_position: Vector2) -> Vector2:
	if _exploration_phase != "engaged":
		return screen_position
	var visible_bottom := minf(stage_bottom - 8.0, size.y - 112.0)
	return Vector2(
		clampf(screen_position.x, 86.0, size.x - 86.0),
		clampf(screen_position.y, stage_top + 164.0, visible_bottom)
	)

func _draw_landmarks() -> void:
	var visible_bottom := minf(stage_bottom - 8.0, size.y - 112.0)
	for landmark: Dictionary in _landmarks():
		var world_position := Vector2(landmark.position)
		var screen_position := _world_to_screen(world_position)
		if screen_position.x < -36.0 or screen_position.x > size.x + 36.0 \
			or screen_position.y < stage_top + 74.0 or screen_position.y > visible_bottom + 20.0:
			continue
		var distance_to_hero := _hero_map_position.distance_to(world_position)
		var interactable := _exploration_phase == "traveling" and distance_to_hero <= 220.0
		_draw_landmark_symbol(screen_position, String(landmark.kind), String(landmark.name) == _selected_landmark_name, interactable)
		if distance_to_hero <= 140.0 or String(landmark.name) == _selected_landmark_name:
			var label_position := screen_position + Vector2(-72.0, -43.0)
			draw_string(UI_FONT, label_position + Vector2(1.0, 2.0), String(landmark.name), HORIZONTAL_ALIGNMENT_CENTER, 144.0, 15, Color("172229", 0.8))
			draw_string(UI_FONT, label_position, String(landmark.name), HORIZONTAL_ALIGNMENT_CENTER, 144.0, 15, Color("fff0bf", 0.92))

func _minimap_plot_rect(map_rect: Rect2) -> Rect2:
	var plot := map_rect.grow(-8.0)
	plot.position.y += 12.0
	plot.size.y -= 12.0
	return plot

func _minimap_viewport_rect(plot: Rect2) -> Rect2:
	var world_size := _exploration_world_size()
	var view_size := _visible_map_size()
	return Rect2(
		plot.position + _camera_top_left / world_size * plot.size,
		view_size / world_size * plot.size
	)

func _draw_exploration_minimap() -> void:
	if not exploration_enabled or _hero_map_position == Vector2.ZERO:
		return
	var map_rect := Rect2(size.x - 114.0, stage_top + 10.0, 102.0, 74.0)
	draw_style_box(_exploration_panel_style(), map_rect)
	draw_string(UI_FONT, map_rect.position + Vector2(8.0, 16.0), _map_region_name, HORIZONTAL_ALIGNMENT_LEFT, map_rect.size.x - 16.0, 11, Color("e8ddbe", 0.9))
	var plot := _minimap_plot_rect(map_rect)
	var world_size := _exploration_world_size()
	var viewport_rect := _minimap_viewport_rect(plot)
	draw_rect(viewport_rect, Color("7fc6d9", 0.1), true)
	draw_rect(viewport_rect, Color("bdebf3", 0.68), false, 1.0)
	for landmark: Dictionary in _landmarks():
		var landmark_position := Vector2(landmark.position)
		var point := plot.position + Vector2(landmark_position.x / world_size.x * plot.size.x, landmark_position.y / world_size.y * plot.size.y)
		draw_rect(Rect2(point - Vector2(2.0, 2.0), Vector2(4.0, 4.0)), Color("d6bb70", 0.78))
	for index in _enemy_camps.size():
		var camp_position := _enemy_camps[index]
		var camp_point := plot.position + Vector2(camp_position.x / world_size.x * plot.size.x, camp_position.y / world_size.y * plot.size.y)
		if index == _active_enemy_camp_index:
			var target_shape := PackedVector2Array([camp_point + Vector2(0.0, -4.5), camp_point + Vector2(4.5, 0.0), camp_point + Vector2(0.0, 4.5), camp_point + Vector2(-4.5, 0.0)])
			draw_colored_polygon(target_shape, Color("ef8d62", 0.98))
			draw_polyline(PackedVector2Array([target_shape[0], target_shape[1], target_shape[2], target_shape[3], target_shape[0]]), Color("fff0ca", 0.94), 1.2)
		else:
			draw_circle(camp_point, 2.7, Color("c85d4d", 0.82))
	var hero_point := plot.position + Vector2(_hero_map_position.x / world_size.x * plot.size.x, _hero_map_position.y / world_size.y * plot.size.y)
	var hero_direction := Vector2(_hero_facing, 0.0)
	var hero_side := Vector2(0.0, 3.2)
	var hero_shape := PackedVector2Array([hero_point + hero_direction * 5.0, hero_point - hero_direction * 3.0 + hero_side, hero_point - hero_direction * 3.0 - hero_side])
	draw_colored_polygon(hero_shape, Color("79cce2", 0.98))
	draw_polyline(PackedVector2Array([hero_shape[0], hero_shape[1], hero_shape[2], hero_shape[0]]), Color("ecfbff", 0.94), 1.2)

func _draw_progression_fx(hero_position: Vector2, enemy_position: Vector2) -> void:
	if _spatial_evade_fx > 0.0:
		var evade_progress := 1.0 - _spatial_evade_fx
		var evade_alpha := sin(clampf(evade_progress, 0.0, 1.0) * PI)
		var evade_center := hero_position + Vector2(0.0, -42.0)
		draw_arc(evade_center, 18.0 + evade_progress * 34.0, -2.65, -0.45, 20, Color("8fe8e7", evade_alpha), 4.0)
		draw_string(UI_FONT, evade_center + Vector2(-34.0, -34.0 - evade_progress * 8.0), "避開", HORIZONTAL_ALIGNMENT_CENTER, 68.0, 16, Color("caffff", evade_alpha))
	if _experience_orb_fx > 0.0:
		var progress := 1.0 - _experience_orb_fx
		var control := enemy_position.lerp(hero_position, 0.5) + Vector2(0.0, -78.0)
		var orb_position := enemy_position.lerp(control, progress).lerp(control.lerp(hero_position, progress), progress)
		var orb_alpha := sin(clampf(progress, 0.0, 1.0) * PI)
		draw_circle(orb_position, 9.0, Color("77d8dc", orb_alpha * 0.18))
		draw_circle(orb_position, 4.0, Color("bafcff", orb_alpha))
		if progress < 0.58:
			draw_string(UI_FONT, orb_position + Vector2(-28.0, -12.0), "+%d EXP" % _experience_gain, HORIZONTAL_ALIGNMENT_CENTER, 56.0, 12, Color("d5ffff", orb_alpha))
	if _level_up_fx > 0.0:
		var level_progress := 1.0 - _level_up_fx
		var alpha := sin(clampf(level_progress, 0.0, 1.0) * PI)
		var center := hero_position + Vector2(0.0, -46.0)
		draw_arc(center, 24.0 + level_progress * 54.0, 0.0, TAU, 28, Color("8fe6e3", alpha * 0.8), 4.0)
		draw_string(UI_FONT, center + Vector2(-72.0, -40.0 - level_progress * 9.0), "LEVEL UP · Lv.%d" % _level_up_level, HORIZONTAL_ALIGNMENT_CENTER, 144.0, 16, Color("e7ffff", alpha))

func _draw_boss_arrival_notice() -> void:
	var strength := maxf(_boss_warning_fx, _boss_imminent_fx)
	if strength <= 0.0:
		return
	var imminent := _boss_imminent_fx > _boss_warning_fx
	var progress := 1.0 - strength
	var alpha := sin(clampf(progress, 0.0, 1.0) * PI)
	var width := minf(size.x - 84.0, 280.0)
	var rect := Rect2((size.x - width) * 0.5, stage_top + 82.0, width, 44.0)
	var panel := _exploration_panel_style()
	panel.border_color = Color("efb45d", alpha * 0.9) if imminent else Color("d9845b", alpha * 0.76)
	panel.bg_color = Color("241d1c", alpha * 0.88)
	draw_style_box(panel, rect)
	var text := "首領即將現身" if imminent else "首領氣息逼近 · 還差 %d 名" % _boss_warning_remaining
	draw_string(UI_FONT, rect.position + Vector2(0.0, 28.0), text, HORIZONTAL_ALIGNMENT_CENTER, rect.size.x, 16, Color("ffe6b0", alpha))

func _draw_landmark_symbol(position: Vector2, kind: String, selected: bool, interactable: bool) -> void:
	draw_circle(position + Vector2(0.0, 4.0), 18.0, Color("17262a", 0.34))
	if selected:
		draw_arc(position + Vector2(0.0, 1.0), 27.0, 0.0, TAU, 24, Color("ffe49a", 0.9), 4.0)
	elif interactable:
		draw_arc(position + Vector2(0.0, 1.0), 25.0, 0.0, TAU, 24, Color("e8cd78", 0.46), 3.0)
	match kind:
		"tower":
			draw_rect(Rect2(position + Vector2(-8.0, -20.0), Vector2(16.0, 24.0)), Color("819096", 0.72))
			draw_polyline(PackedVector2Array([position + Vector2(-11.0, -20.0), position + Vector2(-3.0, -28.0), position + Vector2(3.0, -22.0), position + Vector2(10.0, -27.0)]), Color("c1c9c5", 0.72), 4.0)
		"banner":
			draw_line(position + Vector2(-6.0, -25.0), position + Vector2(-6.0, 7.0), Color("b7a27b", 0.86), 4.0)
			draw_polygon(PackedVector2Array([position + Vector2(-4.0, -24.0), position + Vector2(14.0, -19.0), position + Vector2(-4.0, -11.0)]), PackedColorArray([Color("a44f43", 0.84)]))
		"stones":
			for offset in [Vector2(-12.0, -3.0), Vector2(0.0, -10.0), Vector2(12.0, -2.0)]:
				draw_circle(position + offset, 7.0, Color("9aa5a0", 0.76))

func _draw_landmark_acquire_fx(hero_position: Vector2) -> void:
	if _landmark_acquire_fx <= 0.0 or _hero_defeated:
		return
	var progress := 1.0 - _landmark_acquire_fx
	var alpha := sin(clampf(progress, 0.0, 1.0) * PI)
	var effect_color := {
		"scout": Color("9cd9e8"),
		"direct": Color("f2b06b"),
		"supply": Color("b9df9b"),
	}.get(_landmark_acquire_effect, Color("f0d58a")) as Color
	var center := hero_position + Vector2(0.0, -38.0)
	draw_arc(center, 20.0 + progress * 54.0, 0.0, TAU, 32, Color(effect_color, alpha * 0.72), 4.0)
	draw_arc(center, 34.0 + progress * 32.0, -2.65, -0.48, 20, Color(effect_color.lightened(0.28), alpha * 0.58), 3.0)
	match _landmark_acquire_effect:
		"scout":
			for index in 3:
				var radius := 22.0 + float(index) * 12.0 + progress * 14.0
				draw_arc(center, radius, -2.7, -0.44, 18, Color(effect_color, alpha * (0.72 - float(index) * 0.14)), 2.5)
		"direct":
			for index in 6:
				var angle := float(index) * TAU / 6.0
				draw_line(center + Vector2.from_angle(angle) * 20.0, center + Vector2.from_angle(angle) * (40.0 + progress * 22.0), Color(effect_color, alpha * 0.66), 3.0)
		"supply":
			for index in 5:
				var offset := Vector2((float(index) - 2.0) * 13.0, 18.0 - progress * (34.0 + float(index % 2) * 9.0))
				draw_circle(center + offset, 3.5, Color(effect_color.lightened(0.22), alpha * 0.72))
	if progress <= 0.86:
		var detail := {
			"scout": "敵方護甲 -20%",
			"direct": "先手削減生命 8%",
			"supply": "回復生命與魔力 8%",
		}.get(_landmark_acquire_effect, "獲得地標優勢") as String
		var panel_width := minf(size.x - 46.0, 236.0)
		var panel_y := maxf(stage_top + 64.0, hero_position.y - 142.0 - sin(progress * PI) * 8.0)
		var panel_rect := Rect2((size.x - panel_width) * 0.5, panel_y, panel_width, 52.0)
		draw_style_box(_exploration_panel_style(), panel_rect)
		draw_string(UI_FONT, panel_rect.position + Vector2(0.0, 21.0), "取得 · %s" % _landmark_acquire_name, HORIZONTAL_ALIGNMENT_CENTER, panel_rect.size.x, 16, Color("fff1c8", alpha))
		draw_string(UI_FONT, panel_rect.position + Vector2(0.0, 42.0), detail, HORIZONTAL_ALIGNMENT_CENTER, panel_rect.size.x, 14, Color(effect_color, alpha * 0.96))

func _draw_loot_drop_fx(enemy_position: Vector2) -> void:
	if _loot_drop_fx <= 0.0:
		return
	var progress := 1.0 - _loot_drop_fx
	var alpha := clampf(_loot_drop_fx * 2.4, 0.0, 1.0)
	var quality_color := {
		"common": Color("d8d2c4"), "uncommon": Color("75d292"),
		"rare": Color("72b9f0"), "epic": Color("c591eb"),
	}.get(_loot_drop_quality, Color("d8d2c4")) as Color
	var center := enemy_position + Vector2(0.0, -104.0 - progress * 18.0)
	center.x = clampf(center.x, 88.0, size.x - 88.0)
	var diamond := PackedVector2Array([
		center + Vector2(0.0, -9.0), center + Vector2(9.0, 0.0),
		center + Vector2(0.0, 9.0), center + Vector2(-9.0, 0.0),
	])
	draw_colored_polygon(diamond, Color(quality_color, alpha))
	draw_polyline(PackedVector2Array([diamond[0], diamond[1], diamond[2], diamond[3], diamond[0]]), Color("fff4d0", alpha), 2.0)
	var detail := "+%d 金" % _loot_drop_gold if _loot_drop_duplicate else "已放入裝備背包"
	var panel_rect := Rect2(center.x - 78.0, center.y + 14.0, 156.0, 40.0)
	draw_rect(panel_rect, Color("172126", 0.82 * alpha), true)
	draw_rect(panel_rect, Color(quality_color, 0.72 * alpha), false, 1.5)
	draw_string(UI_FONT, panel_rect.position + Vector2(0.0, 17.0), _loot_drop_name, HORIZONTAL_ALIGNMENT_CENTER, panel_rect.size.x, 14, Color(quality_color, alpha))
	draw_string(UI_FONT, panel_rect.position + Vector2(0.0, 34.0), detail, HORIZONTAL_ALIGNMENT_CENTER, panel_rect.size.x, 11, Color("eee8da", alpha))

func _draw_enemy_group_reserves(enemy_position: Vector2) -> void:
	var reserve_count := mini(3, maxi(0, _enemy_group_members.size() - 1))
	if reserve_count <= 0:
		return
	for index in reserve_count:
		var member: Dictionary = _enemy_group_members[index + 1]
		var archetype := String(member.get("archetype", "grunt"))
		var texture := _pixel_enemy_preview_texture_for(archetype)
		var reserve_position := _reserve_enemy_position(enemy_position, index)
		var member_index := index + 1
		var attacking := _enemy_attack_recover > 0.0 and _enemy_attack_member_index == member_index
		if attacking:
			var progress := 1.0 - _enemy_attack_recover
			var hero_screen := _world_to_screen(_hero_map_position)
			reserve_position += (hero_screen - reserve_position).normalized() * sin(progress * PI) * 10.0
			var combat_frames := _pixel_enemy_combat_frames_for(archetype)
			if not combat_frames.is_empty():
				texture = combat_frames[2] if progress < 0.45 else combat_frames[3]
		elif not _pixel_enemy_combat_frames_for(archetype).is_empty():
			var combat_frames := _pixel_enemy_combat_frames_for(archetype)
			texture = combat_frames[int(floor(_time * 5.0)) % combat_frames.size()]
		var canvas_height := 138.0 * _enemy_archetype_scale(archetype)
		_draw_ground_shadow(reserve_position + Vector2(0.0, 2.0), Vector2(43.0, 8.0))
		_draw_anchored_animation_frame(texture, reserve_position, canvas_height, PIXEL_WOLF_FEET_RATIO, 0.0, Vector2(_enemy_facing, 1.0), Color(0.92, 0.94, 0.94, 0.98))
		_draw_reserve_health_bar(reserve_position, canvas_height)

func _reserve_enemy_position(enemy_position: Vector2, reserve_index: int) -> Vector2:
	var offsets := [Vector2(72.0, -50.0), Vector2(58.0, 52.0), Vector2(104.0, 16.0)]
	var offset: Vector2 = offsets[clampi(reserve_index, 0, offsets.size() - 1)]
	offset.x *= -_enemy_facing
	var visible_bottom := minf(stage_bottom - 8.0, size.y - 112.0)
	return Vector2(
		clampf(enemy_position.x + offset.x, 52.0, size.x - 52.0),
		clampf(enemy_position.y + offset.y, stage_top + 174.0, visible_bottom - 2.0)
	)

func _draw_reserve_health_bar(feet_position: Vector2, canvas_height: float) -> void:
	var bar_rect := Rect2(feet_position.x - 25.0, maxf(stage_top + 5.0, feet_position.y - canvas_height * PIXEL_WOLF_FEET_RATIO - 9.0), 50.0, 6.0)
	draw_rect(bar_rect, Color("172126", 0.86), true)
	draw_rect(bar_rect.grow(-1.5), Color("a83d37", 0.94), true)
	draw_rect(bar_rect, Color("ded8c9", 0.76), false, 1.0)

func _draw_roaming_enemy_camps() -> void:
	if _exploration_phase != "traveling":
		return
	var visible_bottom := minf(stage_bottom - 8.0, size.y - 112.0)
	var texture := _pixel_enemy_preview_texture()
	for index in _enemy_camps.size():
		if index == _active_enemy_camp_index:
			continue
		var screen_position := _world_to_screen(_enemy_camps[index])
		if screen_position.x < 30.0 or screen_position.x > size.x - 30.0 \
			or screen_position.y < stage_top + 120.0 or screen_position.y > visible_bottom + 12.0:
			continue
		_draw_ground_shadow(screen_position + Vector2(0.0, 2.0), Vector2(28.0, 7.0))
		_draw_anchored_animation_frame(texture, screen_position, 96.0, PIXEL_WOLF_FEET_RATIO, 0.0, Vector2(_enemy_facing_for_world_position(_enemy_camps[index]), 1.0), Color(0.72, 0.76, 0.76, 0.78))

func _draw_active_enemy_indicator() -> void:
	if _exploration_phase != "traveling" or _active_enemy_camp_index < 0 or _active_enemy_camp_index >= _enemy_camps.size():
		return
	var screen_position := _world_to_screen(_enemy_camps[_active_enemy_camp_index])
	if _enemy_visible_on_map(screen_position):
		return
	var marker_position := _active_enemy_indicator_position(screen_position)
	var direction := marker_position.direction_to(screen_position)
	if direction.length_squared() < 0.01:
		direction = Vector2.UP
	var side := direction.orthogonal() * 8.0
	var arrow := PackedVector2Array([
		marker_position + direction * 11.0,
		marker_position - direction * 7.0 + side,
		marker_position - direction * 7.0 - side,
	])
	draw_colored_polygon(arrow, Color("ffe28a", 0.94))
	draw_polyline(PackedVector2Array([arrow[0], arrow[1], arrow[2], arrow[0]]), Color("4b3b24", 0.9), 2.0)

func _active_enemy_indicator_position(screen_position: Vector2) -> Vector2:
	var visible_bottom := minf(stage_bottom - 8.0, size.y - 112.0)
	return Vector2(
		clampf(screen_position.x, 46.0, size.x - 46.0),
		clampf(screen_position.y, stage_top + 96.0, visible_bottom - 28.0)
	)

func _pixel_enemy_preview_texture() -> Texture2D:
	return _pixel_enemy_preview_texture_for(enemy_archetype)

func _pixel_enemy_preview_texture_for(archetype: String) -> Texture2D:
	var combat_frames := _pixel_enemy_combat_frames_for(archetype)
	return combat_frames[0] if not combat_frames.is_empty() else PIXEL_WOLF_IDLE_FRAMES[0]

func _draw_drag_control() -> void:
	if not _pointer_down:
		return
	var drag_vector := (_pointer_position - _pointer_origin).limit_length(42.0)
	draw_circle(_pointer_origin, 44.0, Color("15252c", 0.34))
	draw_arc(_pointer_origin, 44.0, 0.0, TAU, 32, Color("f4dfaa", 0.42), 2.0)
	draw_circle(_pointer_origin + drag_vector, 18.0, Color("f4dfaa", 0.6 if _steering_active else 0.38))

func _exploration_panel_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color("142329", 0.86)
	style.border_color = Color("d7b45a", 0.88)
	style.set_border_width_all(2)
	style.set_corner_radius_all(10)
	return style

func _draw_style_formed_burst(feet_position: Vector2) -> void:
	if _style_formed_burst <= 0.0 or _hero_defeated:
		return
	var progress := 1.0 - _style_formed_burst
	var alpha := sin(progress * PI)
	var center := feet_position + Vector2(0.0, -64.0)
	var radius := lerpf(30.0, 82.0, progress)
	draw_arc(center, radius, 0.0, TAU, 40, Color(_style_formed_color, alpha * 0.72), 4.0)
	draw_arc(center, radius * 0.72, 0.0, TAU, 32, Color(_style_formed_color.lightened(0.45), alpha * 0.42), 2.0)
	for index in 6:
		var angle := TAU * float(index) / 6.0
		var start := center + Vector2.from_angle(angle) * (radius + 5.0)
		var finish := center + Vector2.from_angle(angle) * (radius + 17.0)
		draw_line(start, finish, Color(_style_formed_color, alpha * 0.62), 3.0)

func _draw_pixel_hero(feet_position: Vector2) -> void:
	if defeat_sequence_active():
		_draw_pixel_rewind_hero(feet_position)
		return
	var texture: Texture2D = PIXEL_HERO_IDLE_FRAMES[floori(_time / 0.34) % PIXEL_HERO_IDLE_FRAMES.size()]
	var tint := Color.WHITE
	var offset := Vector2.ZERO
	if _hero_defeated:
		var death_progress := 1.0 - _hero_death_motion if _hero_death_motion > 0.0 else 1.0
		var death_frame := 0 if death_progress < 0.18 else (1 if death_progress < 0.4 else (2 if death_progress < 0.66 else 3))
		texture = PIXEL_HERO_DEATH_FRAMES[death_frame]
		if death_frame == 3:
			tint = Color(0.82, 0.84, 0.88, 1.0)
	elif _hero_slash_motion > 0.0:
		var progress := 1.0 - _hero_slash_motion
		texture = PIXEL_HERO_ATTACK_FRAMES[mini(3, floori(progress * 4.0))]
	elif _hero_block_motion > 0.0 or guard_stance_active:
		var progress := 0.55 if guard_stance_active else 1.0 - _hero_block_motion
		texture = PIXEL_HERO_BLOCK_FRAMES[mini(3, floori(progress * 4.0))]
	elif _hero_dodge_motion > 0.0:
		var progress := 1.0 - _hero_dodge_motion
		texture = PIXEL_HERO_DODGE_FRAMES[mini(3, floori(progress * 4.0))]
		tint.a = 0.78
	if _hero_recoil > 0.0 and not _hero_defeated:
		offset.x -= sin(_hero_recoil * PI) * 2.0
	if _hero_flash > 0.0 and not _hero_defeated:
		tint = Color(1.35, 1.35, 1.35, tint.a)

	var shadow_size := Vector2(60.0, 8.0) if _hero_defeated else Vector2(43.0, 9.0)
	_draw_ground_shadow(feet_position + Vector2(0.0, 2.0), shadow_size)
	var facing_scale := Vector2(_hero_facing if exploration_enabled else 1.0, 1.0)
	_draw_anchored_animation_frame(texture, feet_position + offset, 158.0 if exploration_enabled else 226.0, PIXEL_FEET_RATIO, 0.0, facing_scale, tint)

func _draw_pixel_rewind_hero(feet_position: Vector2) -> void:
	var progress := defeat_rewind_progress()
	if progress < 0.34:
		var death_progress := progress / 0.34
		var death_frame := 0 if death_progress < 0.18 else (1 if death_progress < 0.4 else (2 if death_progress < 0.66 else 3))
		_draw_ground_shadow(feet_position + Vector2(0.0, 2.0), Vector2(60.0, 8.0))
		_draw_anchored_animation_frame(PIXEL_HERO_DEATH_FRAMES[death_frame], feet_position, 226.0, PIXEL_FEET_RATIO, 0.0, Vector2.ONE)
		return
	if progress < 0.48:
		var gather := (progress - 0.34) / 0.14
		var lift := gather * gather
		var tint := Color(0.72, 0.94, 1.18, 1.0 - gather * 0.2)
		_draw_ground_shadow(feet_position + Vector2(0.0, 2.0), Vector2(60.0 - lift * 20.0, 8.0 - lift * 2.0))
		_draw_anchored_animation_frame(PIXEL_HERO_DEATH_FRAMES[3], feet_position + Vector2(0.0, -lift * 14.0), 226.0, PIXEL_FEET_RATIO, 0.0, Vector2.ONE, tint)
		return
	if progress < 0.8:
		var flight := (progress - 0.48) / 0.32
		var soul_position := _defeat_soul_position(feet_position, flight)
		var soul_scale := Vector2.ONE * lerpf(1.0, 0.42, flight * flight)
		var soul_alpha := 0.88 - flight * 0.35
		_draw_anchored_animation_frame(PIXEL_HERO_DODGE_FRAMES[1], soul_position, 226.0, PIXEL_FEET_RATIO, -0.12, soul_scale, Color(0.68, 0.94, 1.2, soul_alpha))
		return
	var landing := clampf((progress - 0.84) / 0.16, 0.0, 1.0)
	var eased_landing := 1.0 - pow(1.0 - landing, 3.0)
	var landing_texture: Texture2D = PIXEL_HERO_DODGE_FRAMES[3] if landing < 0.72 else PIXEL_HERO_IDLE_FRAMES[0]
	_draw_ground_shadow(feet_position + Vector2(0.0, 2.0), Vector2(43.0 * eased_landing, 9.0 * eased_landing))
	_draw_anchored_animation_frame(landing_texture, feet_position + Vector2(0.0, -28.0 * (1.0 - eased_landing)), 226.0, PIXEL_FEET_RATIO, 0.0, Vector2.ONE, Color(0.78, 0.96, 1.12, eased_landing))

func _defeat_soul_position(origin: Vector2, progress: float) -> Vector2:
	var target := Vector2(18.0, stage_top + 18.0)
	var control := Vector2(origin.x - size.x * 0.12, origin.y - minf(size.y * 0.34, 210.0))
	var inverse := 1.0 - progress
	return inverse * inverse * origin + 2.0 * inverse * progress * control + progress * progress * target

func _pixel_enemy_combat_frames() -> Array:
	return _pixel_enemy_combat_frames_for(enemy_archetype)

func _pixel_enemy_combat_frames_for(archetype: String) -> Array:
	return {
		"raider": PIXEL_RAIDER_COMBAT_FRAMES,
		"brute": PIXEL_BRUTE_COMBAT_FRAMES,
		"shield": PIXEL_SHIELD_COMBAT_FRAMES,
		"centurion": PIXEL_BRUTE_COMBAT_FRAMES,
		"caster": PIXEL_CASTER_COMBAT_FRAMES,
	}.get(archetype, [])

func _enemy_archetype_scale(archetype: String) -> float:
	return {
		"raider": 0.88, "brute": 1.03, "shield": 0.98, "caster": 0.94, "boss": 1.15,
	}.get(archetype, 1.0)

func _enemy_accent_color() -> Color:
	return {
		"raider": Color("55c8ae"),
		"brute": Color("d56c4d"),
		"shield": Color("6faac1"),
		"centurion": Color("d9aa55"),
		"caster": Color("ad72d6"),
		"boss": Color("d9aa55"),
	}.get(enemy_archetype, Color("9aa5a2"))

func _draw_enemy_ground_marker(feet_position: Vector2, alpha: float) -> void:
	var accent := _enemy_accent_color()
	accent.a = 0.38 * alpha
	match enemy_archetype:
		"raider":
			var points := PackedVector2Array([
				feet_position + Vector2(0.0, -10.0), feet_position + Vector2(42.0, 0.0),
				feet_position + Vector2(0.0, 10.0), feet_position + Vector2(-42.0, 0.0),
			])
			draw_polyline(points, accent, 3.0)
		"brute":
			draw_arc(feet_position, 51.0, PI, TAU, 24, accent, 6.0)
		"shield":
			for side in [-1.0, 1.0]:
				draw_line(feet_position + Vector2(side * 48.0, -7.0), feet_position + Vector2(side * 48.0, 7.0), accent, 4.0)
				draw_line(feet_position + Vector2(side * 48.0, 7.0), feet_position + Vector2(side * 28.0, 11.0), accent, 4.0)
		"centurion":
			draw_arc(feet_position, 55.0, PI, TAU, 24, accent, 6.0)
			draw_line(feet_position + Vector2(-42.0, 0.0), feet_position + Vector2(42.0, 0.0), accent, 3.0)
		"caster":
			draw_arc(feet_position, 45.0, 0.0, TAU, 28, accent, 3.0)
			for index in 4:
				var angle := float(index) * TAU / 4.0
				draw_circle(feet_position + Vector2.from_angle(angle) * 38.0, 3.0, accent)
		"boss":
			draw_arc(feet_position, 62.0, 0.0, TAU, 32, accent, 5.0)

func _draw_enemy_role_badge(feet_position: Vector2, alpha: float) -> void:
	if enemy_archetype in ["grunt", "boss"]:
		return
	var accent := _enemy_accent_color()
	accent.a = 0.92 * alpha
	var badge_center := feet_position + Vector2(0.0, -96.0 if exploration_enabled else -139.0)
	draw_circle(badge_center, 12.0, Color("182329", 0.82 * alpha))
	draw_arc(badge_center, 13.0, 0.0, TAU, 20, accent, 3.0)
	match enemy_archetype:
		"raider":
			draw_line(badge_center + Vector2(-5.0, 4.0), badge_center + Vector2(5.0, -4.0), accent, 3.0)
		"brute":
			draw_rect(Rect2(badge_center - Vector2(5.0, 5.0), Vector2(10.0, 10.0)), accent)
		"shield":
			draw_arc(badge_center, 6.0, -PI * 0.82, -PI * 0.18, 10, accent, 4.0)
		"centurion":
			draw_line(badge_center + Vector2(-6.0, 4.0), badge_center + Vector2(0.0, -6.0), accent, 3.0)
			draw_line(badge_center + Vector2(0.0, -6.0), badge_center + Vector2(6.0, 4.0), accent, 3.0)
		"caster":
			for index in 4:
				draw_circle(badge_center + Vector2.from_angle(float(index) * TAU / 4.0) * 5.0, 2.0, accent)
	if enemy_hp_ratio <= 0.3:
		var danger_alpha := (0.7 + sin(_time * 4.0) * 0.2) * alpha
		draw_arc(badge_center, 18.0, -2.7, -0.45, 14, Color("ffb05f", danger_alpha), 3.0)

func enemy_health_bar_rect(feet_position: Vector2, enemy_height: float, archetype_scale: float) -> Rect2:
	var bar_width := 96.0 if enemy_is_boss else 74.0
	var sprite_top := feet_position.y - enemy_height * archetype_scale * PIXEL_WOLF_FEET_RATIO
	var bar_y := maxf(stage_top + 5.0, sprite_top - 13.0)
	return Rect2(feet_position.x - bar_width * 0.5, bar_y, bar_width, 9.0)

func _draw_enemy_health_bar(feet_position: Vector2, enemy_height: float, archetype_scale: float, alpha: float) -> void:
	if _enemy_death_motion > 0.0:
		return
	var bar_rect := enemy_health_bar_rect(feet_position, enemy_height, archetype_scale)
	var border_color := Color("edc56c", 0.94 * alpha) if enemy_is_boss else Color("e8e1d2", 0.82 * alpha)
	draw_rect(bar_rect, Color("172126", 0.86 * alpha), true)
	var fill_rect := bar_rect.grow(-2.0)
	fill_rect.size.x *= enemy_hp_ratio
	if fill_rect.size.x > 0.0:
		draw_rect(fill_rect, Color("bd443b", 0.96 * alpha), true)
	draw_rect(bar_rect, border_color, false, 1.5)

func _draw_pixel_enemy(feet_position: Vector2) -> void:
	var combat_frames := _pixel_enemy_combat_frames()
	var uses_custom_enemy := not combat_frames.is_empty()
	var texture: Texture2D = combat_frames[0] if uses_custom_enemy else PIXEL_WOLF_IDLE_FRAMES[0]
	var tint := Color(1.08, 0.92, 0.78) if enemy_archetype == "boss" else Color.WHITE
	var archetype_scale := _enemy_archetype_scale(enemy_archetype)
	var offset := Vector2.ZERO
	var action_scale := Vector2.ONE
	var entry_alpha := 1.0
	if _enemy_entry_motion > 0.0:
		var entry_progress := 1.0 - _enemy_entry_motion
		entry_alpha = clampf(entry_progress * 2.4, 0.12, 1.0)
		if not reduced_motion:
			offset.x += (1.0 - entry_progress) * 18.0
	if _enemy_death_motion > 0.0:
		var death_progress := 1.0 - _enemy_death_motion
		if uses_custom_enemy:
			texture = combat_frames[0]
			offset.y += death_progress * 7.0
			tint = Color(0.62, 0.66, 0.69, clampf(_enemy_death_motion * 2.1, 0.0, 1.0))
		else:
			var death_frame := 0 if death_progress < 0.18 else (1 if death_progress < 0.4 else (2 if death_progress < 0.66 else 3))
			texture = PIXEL_WOLF_DEATH_FRAMES[death_frame]
		tint = Color(0.68, 0.7, 0.74, clampf(_enemy_death_motion * 2.4, 0.0, 1.0))
	elif _enemy_attack_recover > 0.0 and _enemy_attack_member_index == 0:
		var progress := 1.0 - _enemy_attack_recover
		if uses_custom_enemy:
			texture = combat_frames[2] if progress < 0.42 else combat_frames[3]
		else:
			var attack_frame := 1 if progress < 0.2 else (2 if progress < 0.58 else 3)
			texture = PIXEL_WOLF_ATTACK_FRAMES[attack_frame]
		var lunge_distance: float = 7.0 if enemy_archetype == "raider" else (2.0 if enemy_archetype == "caster" else 4.0)
		offset.x += _enemy_attack_lunge_direction() * sin(progress * PI) * lunge_distance
	elif enemy_heavy_windup:
		texture = combat_frames[2] if uses_custom_enemy else PIXEL_WOLF_ATTACK_FRAMES[0]
	if _enemy_knockback > 0.0:
		offset.x += sin(_enemy_knockback * PI) * 5.0
	if _enemy_flash > 0.0:
		tint = Color(1.4, 1.4, 1.4, 1.0)
	if enemy_archetype == "raider" and _enemy_death_motion <= 0.0:
		for index in 3:
			var trail_y := feet_position.y - 32.0 - float(index) * 18.0
			draw_line(Vector2(feet_position.x + 25.0, trail_y), Vector2(feet_position.x + 56.0 + float(index) * 7.0, trail_y - 5.0), Color("72d6c4", 0.24), 3.0)
	elif enemy_archetype == "caster" and _enemy_death_motion <= 0.0:
		var rune_center := feet_position + Vector2(0.0, 2.0)
		draw_arc(rune_center, 48.0, 0.0, TAU, 24, Color("c77bea", 0.38), 3.0)
		for index in 4:
			var angle := _time * 0.4 + float(index) * TAU / 4.0
			draw_circle(rune_center + Vector2.from_angle(angle) * 42.0, 3.0, Color("e5b1ff", 0.62))
	elif enemy_archetype == "shield" and enemy_guard_stacks > 0 and _enemy_death_motion <= 0.0:
		var guard_center := feet_position + Vector2(-43.0 * _enemy_facing, -58.0)
		draw_arc(guard_center, 34.0, -PI * 0.72, PI * 0.72, 20, Color("8dd5ed", 0.72), 5.0)
		for index in enemy_guard_stacks:
			draw_rect(Rect2(guard_center + Vector2(-14.0 + float(index) * 11.0, -43.0), Vector2(7.0, 7.0)), Color("c9f4ff", 0.9))
	if _enemy_guard_flash > 0.0:
		var guard_alpha := sin((1.0 - _enemy_guard_flash) * PI)
		draw_arc(feet_position + Vector2(-38.0 * _enemy_facing, -60.0), 40.0, -PI * 0.75, PI * 0.75, 24, Color("d8f7ff", guard_alpha), 8.0)

	if enemy_is_boss and _enemy_death_motion <= 0.0:
		var aura_center := feet_position + Vector2(0.0, -64.0)
		var aura_color := Color("d54b42", 0.24 if boss_enraged else 0.13)
		draw_circle(aura_center, 70.0, aura_color)
		draw_arc(aura_center, 78.0, -2.7, 0.2, 32, Color("e8b35b", 0.72), 3.0)
		if boss_enraged:
			draw_arc(aura_center, 86.0, 0.45, 2.75, 28, Color("ef6650", 0.74), 5.0)
	_draw_enemy_ground_marker(feet_position, entry_alpha)
	_draw_ground_shadow(feet_position + Vector2(0.0, 3.0), Vector2((61.0 if enemy_is_boss else 55.0) * archetype_scale, (11.0 if enemy_is_boss else 10.0) * archetype_scale))
	tint.a *= entry_alpha
	var enemy_height := (176.0 if enemy_is_boss else 164.0) if exploration_enabled else (252.0 if enemy_is_boss else 238.0)
	if exploration_enabled:
		action_scale.x *= _enemy_facing
	_draw_anchored_animation_frame(texture, feet_position + offset, enemy_height * archetype_scale, PIXEL_WOLF_FEET_RATIO, 0.0, action_scale, tint)
	_draw_enemy_health_bar(feet_position, enemy_height, archetype_scale, entry_alpha)
	if enemy_heavy_windup and _enemy_death_motion <= 0.0:
		var intent_center := feet_position + Vector2(0.0, -91.0 if exploration_enabled else -128.0)
		var intent_color := Color("ef684f") if enemy_attack_type == "重擊" else Color("d594ef")
		draw_circle(intent_center, 19.0, Color("17232a", 0.88))
		draw_arc(intent_center, 23.0, -PI * 0.5, -PI * 0.5 + TAU * enemy_windup_ratio, 24, intent_color, 5.0)
		draw_line(intent_center + Vector2(0.0, -10.0), intent_center + Vector2(0.0, 4.0), Color.WHITE, 4.0)
		draw_circle(intent_center + Vector2(0.0, 10.0), 2.5, Color.WHITE)

func _enemy_attack_lunge_direction() -> float:
	if exploration_enabled and _hero_map_position != Vector2.ZERO and _enemy_map_position != Vector2.ZERO:
		return 1.0 if _hero_map_position.x > _enemy_map_position.x else -1.0
	return -1.0

func _enemy_cast_origin_screen(fallback: Vector2) -> Vector2:
	if exploration_enabled and _enemy_cast_active and _enemy_cast_origin != Vector2.ZERO:
		return _world_to_screen(_enemy_cast_origin)
	return fallback

func _enemy_cast_target_screen(fallback: Vector2) -> Vector2:
	if exploration_enabled and _enemy_cast_active and _enemy_cast_target != Vector2.ZERO:
		return _world_to_screen(_enemy_cast_target)
	return fallback

func _draw_pixel_combat_fx(hero_pos: Vector2, enemy_pos: Vector2) -> void:
	if defeat_sequence_active():
		_draw_defeat_rewind_fx(hero_pos)
		return
	var impact_point := enemy_pos + Vector2(-28.0, -58.0)
	if enemy_heavy_windup:
		var telegraph_alpha := 0.2 + enemy_windup_ratio * 0.62
		match enemy_attack_type:
			"重擊":
				var heavy_center := _enemy_cast_origin_screen(enemy_pos) + Vector2(0.0, -4.0)
				var heavy_target := _enemy_cast_target_screen(hero_pos)
				draw_circle(heavy_center, CombatModel.SPATIAL_HEAVY_REACH, Color("d84a3b", telegraph_alpha * 0.12))
				draw_arc(heavy_center, CombatModel.SPATIAL_HEAVY_REACH, 0.0, TAU, 48, Color("f15d48", telegraph_alpha), 5.0)
				draw_line(heavy_center + Vector2(-18.0, -68.0), heavy_target + Vector2(18.0, -38.0), Color("ff8a68", telegraph_alpha * 0.52), 4.0)
			"範圍":
				var area_center := _enemy_cast_target_screen(hero_pos) + Vector2(0.0, 1.0)
				var area_radius := lerpf(42.0, CombatModel.SPATIAL_AREA_REACH, enemy_windup_ratio)
				draw_circle(area_center, area_radius, Color("9c4fbd", telegraph_alpha * 0.12))
				draw_arc(area_center, area_radius, 0.0, TAU, 40, Color("c879e8", telegraph_alpha), 5.0)
			"必中":
				draw_line(enemy_pos + Vector2(-24.0, -72.0), hero_pos + Vector2(10.0, -58.0), Color("f4d564", telegraph_alpha), 5.0)
				for index in 4:
					var marker := hero_pos + Vector2(10.0, -58.0) + Vector2.from_angle(float(index) * TAU / 4.0) * 20.0
					draw_circle(marker, 3.5, Color("fff0a2", telegraph_alpha))
		var warning_text: String = {"重擊": "重擊", "範圍": "範圍", "必中": "必中"}.get(enemy_attack_type, "危險")
		var warning_color := Color("ff8268") if enemy_attack_type == "重擊" else (Color("db96f0") if enemy_attack_type == "範圍" else Color("ffe47e"))
		var warning_center := enemy_pos + Vector2(0.0, -166.0)
		var warning_rect := Rect2(warning_center - Vector2(34.0, 15.0), Vector2(68.0, 27.0))
		draw_rect(warning_rect, Color("172126", telegraph_alpha * 0.88), true)
		draw_rect(warning_rect, Color(warning_color, telegraph_alpha), false, 2.0)
		draw_string(get_theme_default_font(), warning_center + Vector2(-30.0, 7.0), warning_text, HORIZONTAL_ALIGNMENT_CENTER, 60.0, 17, Color("fff8e8", telegraph_alpha))
	if _boss_intro_motion > 0.0:
		var intro_progress := 1.0 - _boss_intro_motion
		var intro_alpha := sin(clampf(intro_progress, 0.0, 1.0) * PI)
		draw_rect(Rect2(0.0, enemy_pos.y - 122.0, size.x, 98.0), Color("16151b", intro_alpha * 0.2))
		draw_arc(enemy_pos + Vector2(0.0, -62.0), 44.0 + intro_progress * 58.0, 0.0, TAU, 36, Color("f0c16b", intro_alpha * 0.9), 5.0)
	if _boss_enrage_burst > 0.0:
		var rage_progress := 1.0 - _boss_enrage_burst
		var rage_alpha := 1.0 - rage_progress
		var rage_center := enemy_pos + Vector2(0.0, -64.0)
		draw_arc(rage_center, 58.0 + rage_progress * 68.0, 0.0, TAU, 36, Color("ff6752", rage_alpha), 7.0)
		for index in 8:
			var angle := float(index) * TAU / 8.0
			draw_line(rage_center + Vector2.from_angle(angle) * 42.0, rage_center + Vector2.from_angle(angle) * (64.0 + rage_progress * 30.0), Color("ff9a62", rage_alpha), 4.0)
	if _boss_howl_burst > 0.0:
		var howl_progress := 1.0 - _boss_howl_burst
		var howl_center := enemy_pos + Vector2(0.0, -70.0)
		for index in 3:
			var radius := 42.0 + howl_progress * 70.0 + float(index) * 15.0
			draw_arc(howl_center, radius, -2.65, -0.5, 30, Color("ffd07a", (1.0 - howl_progress) * (0.72 - float(index) * 0.16)), 5.0)
	if _enemy_cast_burst > 0.0:
		var cast_progress := 1.0 - _enemy_cast_burst
		var cast_color := Color("f06a52") if enemy_attack_type == "重擊" else (Color("cf7bea") if enemy_attack_type == "範圍" else Color("f1d66e"))
		draw_arc(enemy_pos + Vector2(0.0, -58.0), 30.0 + cast_progress * 32.0, 0.0, TAU, 28, Color(cast_color, 1.0 - cast_progress), 5.0)
	if _enemy_guard_break_burst > 0.0:
		var break_progress := 1.0 - _enemy_guard_break_burst
		var break_center := enemy_pos + Vector2(-34.0, -62.0)
		for index in 7:
			var angle := -2.4 + float(index) * 0.34
			var start := break_center + Vector2.from_angle(angle) * (12.0 + break_progress * 10.0)
			var finish := break_center + Vector2.from_angle(angle) * (27.0 + break_progress * 35.0)
			draw_line(start, finish, Color("c7f4ff", 1.0 - break_progress), 4.0 if index % 2 == 0 else 2.0)
	if _hero_dodge_motion > 0.0:
		var dodge_alpha := sin((1.0 - _hero_dodge_motion) * PI) * 0.38
		for index in 3:
			var trail_x := hero_pos.x - 18.0 - float(index) * 13.0
			draw_line(Vector2(trail_x, hero_pos.y - 90.0), Vector2(trail_x + 20.0, hero_pos.y - 76.0), Color("82d9c8", dodge_alpha), 3.0)

	if _hero_slash_motion > 0.0:
		var progress := 1.0 - _hero_slash_motion
		var alpha := sin(clampf(progress, 0.0, 1.0) * PI)
		var center := hero_pos.lerp(enemy_pos, 0.64) + Vector2(0.0, -58.0)
		var heavy := _heavy_slash > 0.0 or _ultimate_slash > 0.0
		var outer_color := Color("ffd36b", alpha) if heavy else Color("88cfff", alpha)
		draw_arc(center, 72.0 if heavy else 58.0, -2.25, 0.42, 22, Color("f8fcff", alpha), 12.0 if heavy else 8.0)
		draw_arc(center, 64.0 if heavy else 51.0, -2.25, 0.42, 22, outer_color, 6.0 if heavy else 4.0)

	if _block_flash > 0.0 or _perfect_block > 0.0:
		var strength := maxf(_block_flash, _perfect_block)
		var alpha := sin((1.0 - strength) * PI)
		var block_center := hero_pos + Vector2(36.0, -68.0)
		draw_arc(block_center, 34.0, -1.5, 1.5, 18, Color("e9ffff", alpha), 7.0)
		for index in 5:
			var angle := -1.2 + float(index) * 0.6
			draw_line(block_center + Vector2.from_angle(angle) * 24.0, block_center + Vector2.from_angle(angle) * 43.0, Color("72d7e5", alpha), 3.0)

	if _counter_slash > 0.0 or _shadow_assault > 0.0 or _swift_cut > 0.0:
		var strength := maxf(_counter_slash, maxf(_shadow_assault, _swift_cut))
		var alpha := sin((1.0 - strength) * PI)
		var color := Color("7de0cb", alpha) if _shadow_assault > 0.0 or _swift_cut > 0.0 else Color("a9efff", alpha)
		draw_line(hero_pos + Vector2(12.0, -40.0), impact_point + Vector2(18.0, -26.0), Color("ffffff", alpha), 8.0)
		draw_line(hero_pos + Vector2(8.0, -32.0), impact_point + Vector2(22.0, -18.0), color, 4.0)

	if _impact_burst > 0.0:
		var progress := 1.0 - _impact_burst
		var alpha := 1.0 - progress
		var radius := 11.0 + progress * 24.0 * _impact_strength
		for index in 8:
			var angle := float(index) * TAU / 8.0
			draw_line(impact_point + Vector2.from_angle(angle) * 4.0, impact_point + Vector2.from_angle(angle) * radius, Color(_impact_color, alpha), 4.0 if index % 2 == 0 else 2.0)
		draw_circle(impact_point, 8.0 * alpha, Color("ffffff", alpha))

	if _defeat_burst > 0.0:
		var progress := 1.0 - _defeat_burst
		var alpha := sin(clampf(progress * 1.4, 0.0, 1.0) * PI)
		draw_arc(enemy_pos + Vector2(0.0, -54.0), 28.0 + progress * (82.0 if _defeat_was_boss else 42.0), 0.0, TAU, 28, Color("ffe5a0", alpha), 6.0)

func _draw_defeat_rewind_fx(hero_pos: Vector2) -> void:
	var progress := defeat_rewind_progress()
	if progress >= 0.34 and progress < 0.48:
		var gather := (progress - 0.34) / 0.14
		var center := hero_pos + Vector2(0.0, -54.0 - gather * 14.0)
		draw_circle(center, 18.0 + gather * 12.0, Color("d9f8ff", 0.12 + gather * 0.16))
		for index in 6:
			var angle := float(index) * TAU / 6.0 + gather
			draw_line(center + Vector2.from_angle(angle) * 34.0, center + Vector2.from_angle(angle) * (18.0 - gather * 8.0), Color("91e8ff", 0.7), 2.0)
	elif progress < 0.8 and progress >= 0.48:
		var flight := (progress - 0.48) / 0.32
		for index in 5:
			var trail_progress := maxf(0.0, flight - float(index) * 0.055)
			var trail_pos := _defeat_soul_position(hero_pos, trail_progress) + Vector2(0.0, -48.0)
			var radius := 12.0 - float(index) * 1.6
			draw_circle(trail_pos, radius, Color("9cecff", 0.34 - float(index) * 0.05))
		var soul_pos := _defeat_soul_position(hero_pos, flight) + Vector2(0.0, -48.0)
		draw_circle(soul_pos, 16.0 * (1.0 - flight * 0.35), Color("efffff", 0.72))
	if progress >= 0.72 and progress <= 0.88:
		var transition := sin((progress - 0.72) / 0.16 * PI)
		draw_rect(Rect2(Vector2.ZERO, size), Color("d8f7ff", transition * 0.22))
	if progress >= 0.84:
		var landing := clampf((progress - 0.84) / 0.16, 0.0, 1.0)
		var center := hero_pos + Vector2(0.0, -8.0)
		draw_arc(center, 12.0 + landing * 34.0, 0.0, TAU, 24, Color("9eeaff", (1.0 - landing) * 0.7), 4.0)

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
	var bob := 0.0
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
	var sprite_modulate := Color(1.18, 1.18, 1.18, 1.0) if _hero_flash > 0.0 else Color.WHITE
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
	if _hero_death_motion > 0.0:
		sprite_modulate = Color(0.55, 0.58, 0.62, 0.28 + _hero_death_motion * 0.72)
	_draw_rigged_hero(origin + Vector2(0.0, 45.0), sprite_modulate)

func _draw_rigged_hero(feet_origin: Vector2, modulate: Color) -> void:
	var body_scale := 0.55
	var limb_scale := 0.38
	var shoulder_rotation := 0.0
	var elbow_rotation := 0.0
	var sword_rotation := -0.12

	if _hero_slash_motion > 0.0:
		var progress := 1.0 - _hero_slash_motion
		if progress < 0.24:
			var windup := smoothstep(0.0, 0.24, progress)
			shoulder_rotation = lerpf(0.0, -0.13, windup)
			elbow_rotation = lerpf(0.0, -0.16, windup)
		elif progress < 0.58:
			var strike := smoothstep(0.24, 0.58, progress)
			shoulder_rotation = lerpf(-0.13, 0.2, strike)
			elbow_rotation = lerpf(-0.16, 0.22, strike)
		else:
			var recovery := smoothstep(0.58, 1.0, progress)
			shoulder_rotation = lerpf(0.2, 0.0, recovery)
			elbow_rotation = lerpf(0.22, 0.0, recovery)
	elif _hero_block_motion > 0.0:
		var block_progress := 1.0 - _hero_block_motion
		var block_weight := sin(clampf(block_progress, 0.0, 1.0) * PI)
		shoulder_rotation = -0.17 * block_weight
		elbow_rotation = -0.46 * block_weight
		sword_rotation -= 0.18 * block_weight

	var body_pivot := Vector2(HERO_RIG_BODY.get_width() * 0.5, HERO_RIG_BODY.get_height() - 4.0)
	_draw_rig_part(HERO_RIG_BODY, feet_origin, body_pivot, body_scale, 0.0, modulate)

	var body_top_left := feet_origin - body_pivot * body_scale
	var shoulder := body_top_left + Vector2(179.0, 108.0) * body_scale
	var upper_pivot := Vector2(76.0, 38.0)
	var upper_to_elbow := Vector2(-7.0, 152.0) * limb_scale
	_draw_rig_part(HERO_RIG_UPPER_ARM, shoulder, upper_pivot, limb_scale, shoulder_rotation, modulate)

	var elbow := shoulder + upper_to_elbow.rotated(shoulder_rotation)
	var forearm_rotation := shoulder_rotation + elbow_rotation
	var forearm_pivot := Vector2(56.0, 24.0)
	var forearm_to_hand := Vector2(61.0, 169.0) * limb_scale
	var hand := elbow + forearm_to_hand.rotated(forearm_rotation)
	var sword_pivot := Vector2(43.0, 39.0)
	_draw_rig_part(HERO_RIG_SWORD, hand, sword_pivot, limb_scale, forearm_rotation + sword_rotation, modulate)
	_draw_rig_part(HERO_RIG_FOREARM, elbow, forearm_pivot, limb_scale, forearm_rotation, modulate)

func _draw_rig_part(texture: Texture2D, pivot_position: Vector2, pivot_pixel: Vector2, part_scale: float, rotation: float, modulate: Color) -> void:
	var texture_size := texture.get_size()
	draw_set_transform(pivot_position, rotation, Vector2.ONE)
	draw_texture_rect(texture, Rect2(-pivot_pixel * part_scale, texture_size * part_scale), false, modulate)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_enemy(origin: Vector2) -> void:
	var bob := 0.0
	var sprite_modulate := Color(1.18, 1.18, 1.18, 1.0) if _enemy_flash > 0.0 else Color.WHITE
	var body_scale := 1.18 if enemy_archetype == "brute" else (0.86 if enemy_archetype in ["raider", "caster"] else 1.0)
	var ring_size := 126.0 * body_scale
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
	var pose_rotation := 0.0
	var pose_scale := Vector2.ONE
	var sprite_bottom := ground_center + Vector2(0.0, 20.0)
	var enemy_texture: Texture2D = GRAY_WOLF_TEXTURE
	var enemy_canvas_height := enemy_height
	var enemy_feet_ratio := 1.0
	if _enemy_death_motion > 0.0:
		pose_rotation = 0.0
		pose_scale = Vector2.ONE
		sprite_modulate = Color(0.58, 0.58, 0.58, clampf(_enemy_death_motion * 3.0, 0.0, 1.0))
	elif _enemy_hurt_motion > 0.0:
		pose_scale = Vector2.ONE
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

func _draw_fx_frame(texture: Texture2D, center: Vector2, target_size: float, rotation: float = 0.0, sprite_scale: Vector2 = Vector2.ONE, modulate: Color = Color.WHITE) -> void:
	draw_set_transform(center, rotation, sprite_scale)
	draw_texture_rect(texture, Rect2(-target_size * 0.5, -target_size * 0.5, target_size, target_size), false, modulate)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

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

func _draw_exploration_background(texture: Texture2D, destination: Rect2) -> void:
	var source_rect := _exploration_background_source_rect(texture.get_size(), destination.size)
	draw_texture_rect_region(texture, destination, source_rect)

func _exploration_background_source_rect(texture_size: Vector2, destination_size: Vector2) -> Rect2:
	if texture_size.x <= 0.0 or texture_size.y <= 0.0 or destination_size.x <= 0.0 or destination_size.y <= 0.0:
		return Rect2(Vector2.ZERO, texture_size)
	var world_size := _exploration_world_size()
	var world_aspect := world_size.x / world_size.y
	var world_source := Rect2(Vector2.ZERO, texture_size)
	if texture_size.x / texture_size.y > world_aspect:
		world_source.size.x = texture_size.y * world_aspect
		world_source.position.x = (texture_size.x - world_source.size.x) * 0.5
	else:
		world_source.size.y = texture_size.x / world_aspect
		world_source.position.y = (texture_size.y - world_source.size.y) * 0.5
	var view_ratio := Vector2(destination_size.x / world_size.x, destination_size.y / world_size.y)
	var source_size := world_source.size * view_ratio
	var source_position := world_source.position + world_source.size * Vector2(
		_camera_top_left.x / world_size.x,
		_camera_top_left.y / world_size.y
	)
	return Rect2(source_position, source_size)

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
	var slash_fx_center := hero_pos.lerp(enemy_pos, 0.58) + Vector2(0.0, -34.0)
	if _hero_slash_motion > 0.0:
		var slash_fx_progress := 1.0 - _hero_slash_motion
		var slash_fx_index := 3 + mini(2, floori(slash_fx_progress * 3.0))
		_draw_fx_frame(SLASH_FX_FRAMES[slash_fx_index], slash_fx_center, 175.0, -0.08, Vector2.ONE, Color(1.0, 1.0, 1.0, 0.96))
	elif hero_attack_windup_ratio > 0.35:
		var slash_fx_index := mini(2, floori(remap(hero_attack_windup_ratio, 0.35, 1.0, 0.0, 2.99)))
		_draw_fx_frame(SLASH_FX_FRAMES[slash_fx_index], slash_fx_center, 165.0, -0.08, Vector2.ONE, Color(1.0, 1.0, 1.0, 0.82))
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
	if _milestone_fx > 0.0:
		var phase := 1.0 - _milestone_fx
		var alpha := sin(clampf(phase * 1.65, 0.0, 1.0) * PI)
		var strength := 0.75 + float(_milestone_level) / 400.0
		if _milestone_mode == "impact":
			var center := enemy_pos + Vector2(0, -40)
			draw_arc(center, 34.0 + phase * 72.0 * strength, 0.0, TAU, 36, Color(_milestone_color, alpha), 5.0 + 6.0 * strength)
			for index in 4:
				var angle := -0.8 + float(index) * 0.52
				draw_line(center - Vector2.from_angle(angle) * 22.0, center + Vector2.from_angle(angle) * (48.0 + phase * 36.0), Color(_milestone_color.lightened(0.45), alpha * 0.8), 3.0 + strength)
		else:
			var center := hero_pos.lerp(enemy_pos, 0.55) + Vector2(0, -36)
			for index in 3:
				var offset := Vector2(-18.0 * float(index), 9.0 * float(index - 1))
				draw_arc(center + offset, 48.0 + float(index) * 13.0 + phase * 28.0, -2.3, 0.45, 26, Color(_milestone_color.lightened(float(index) * 0.12), alpha * (0.9 - float(index) * 0.18)), 3.0 + strength)
	if _impact_burst > 0.0:
		var phase := 1.0 - _impact_burst
		var center := enemy_pos + Vector2(0, -38)
		var impact_index := mini(5, floori(phase * 6.0))
		var impact_size := 85.0 + _impact_strength * 55.0
		_draw_fx_frame(IMPACT_FX_FRAMES[impact_index], center, impact_size, 0.0, Vector2.ONE, Color(_impact_color, 1.0))
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
	var damage_lane := _damage_cursor % 4
	_damage_cursor = (_damage_cursor + 1) % _damage_pool.size()
	label.visible = true
	label.modulate = Color.WHITE
	var large := source in ["heavy_strike_high", "heavy_strike_extreme", "mountain_break", "armor_flash", "execute_slash", "first_strike", "collapse_counter", "heaven_return", "swift_step", "shadow_assault", "shadow_return", "flying_swallow", "swallow_return", "second_shadow", "shadowless_extreme", "two_cut", "magic_slash", "flame_burst_slash", "elemental_resonance", "elemental_boundary_slash", "minor_resonance"]
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
	elif source in ["swift_step", "swift_cut", "shadow_assault", "shadow_return", "flying_swallow", "swallow_return", "second_shadow", "shadowless_extreme"]:
		prefix = "影 "
	elif source in ["magic_slash", "flame_burst_slash", "elemental_resonance", "elemental_boundary_slash", "minor_resonance"]:
		prefix = "爆 "
	elif source.begins_with("ally_"):
		prefix = "援 "
	elif source == "critical_attack":
		prefix = "暴 "
	label.text = "%s%d%s" % [prefix, roundi(amount), "!" if source == "critical_attack" else ""]
	var color := Color("fff0a3") if source == "two_cut" else (Color("d7b2ff") if source in ["lightning_tick", "lightning_chain"] else (Color("a9edff") if source in ["elemental_resonance", "minor_resonance"] else (Color("ffb16f") if source in ["magic_enchant", "magic_slash", "burn_tick", "flame_burst_slash", "elemental_boundary_slash"] else (Color("f7c0b7") if source == "execute_slash" else (Color("d9ccff") if source in ["heavy_strike_swift", "flow_attack", "flow_attack_full", "swift_step", "swift_cut", "shadow_assault", "shadow_return", "flying_swallow", "swallow_return", "second_shadow", "shadowless_extreme", "critical_attack"] else (Color("c7f6ff") if source in ["armor_flash", "first_strike", "counter", "collapse_counter", "heaven_return"] else (Color("ffe07a") if large else Color("f4eee0"))))))))
	label.add_theme_color_override("font_color", color)
	var damage_origin := _pixel_enemy_position + Vector2(-18.0, -128.0) if PIXEL_VERTICAL_SLICE and _pixel_enemy_position != Vector2.ZERO else Vector2(size.x * 0.64, size.y * 0.28)
	var lane_offsets := [Vector2(-20.0, 5.0), Vector2(9.0, -8.0), Vector2(-4.0, -21.0), Vector2(22.0, -34.0)]
	label.position = damage_origin + lane_offsets[damage_lane]
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position:y", label.position.y - 50.0, 0.56).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property(label, "modulate:a", 0.0, 0.56).set_delay(0.16)
	tween.tween_property(label, "scale", Vector2.ONE, 0.18).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tween.chain().tween_callback(func() -> void: label.visible = false)

func _play_sfx(kind: String) -> void:
	if _sfx_players.is_empty() or not _sfx_streams.has(kind):
		return
	var player := _sfx_players[_sfx_cursor]
	_sfx_cursor = (_sfx_cursor + 1) % _sfx_players.size()
	player.stream = _sfx_streams[kind]
	player.volume_db = {
		"light": -20.0,
		"medium": -16.0,
		"heavy": -11.0,
		"block": -14.0,
		"perfect": -12.0,
		"dodge": -19.0,
		"hurt": -17.0,
		"defeat": -15.0,
		"boss_defeat": -11.0,
		"landmark": -18.0,
	}.get(kind, -16.0)
	player.pitch_scale = 0.99 + float(_sfx_cursor % 3) * 0.008
	player.play()

func _make_sfx(kind: String) -> AudioStreamWAV:
	var duration: float = {
		"light": 0.045,
		"medium": 0.065,
		"heavy": 0.1,
		"block": 0.075,
		"perfect": 0.1,
		"dodge": 0.075,
		"hurt": 0.07,
		"defeat": 0.14,
		"boss_defeat": 0.24,
		"landmark": 0.18,
	}.get(kind, 0.065)
	var sample_rate := 22050
	var sample_count := roundi(duration * float(sample_rate))
	var data := PackedByteArray()
	data.resize(sample_count * 2)
	var noise_state := 0.0
	for index in sample_count:
		var time := float(index) / float(sample_rate)
		var progress := float(index) / float(sample_count)
		var attack := minf(progress / 0.045, 1.0)
		var envelope := attack * pow(1.0 - progress, 2.8)
		var frequency := 360.0
		var noise_amount := 0.1
		match kind:
			"light":
				frequency = 390.0 - progress * 150.0
			"medium":
				frequency = 310.0 - progress * 125.0
				noise_amount = 0.14
			"heavy":
				frequency = 115.0 - progress * 45.0
				noise_amount = 0.18
			"block":
				frequency = 570.0 - progress * 170.0
				noise_amount = 0.08
			"perfect":
				frequency = 720.0 - progress * 210.0
				noise_amount = 0.06
			"dodge":
				frequency = 280.0 + progress * 330.0
				noise_amount = 0.12
			"hurt":
				frequency = 105.0 - progress * 24.0
				noise_amount = 0.2
			"defeat":
				frequency = 180.0 - progress * 76.0
				noise_amount = 0.13
			"boss_defeat":
				frequency = 88.0 - progress * 22.0
				noise_amount = 0.12
			"landmark":
				frequency = 480.0 + progress * 210.0
				noise_amount = 0.0
		var raw_noise := sin(float(index) * 12.9898) * sin(float(index) * 4.1414)
		noise_state = lerpf(noise_state, raw_noise, 0.1)
		var body := sin(TAU * frequency * time)
		var sample := (body * (1.0 - noise_amount) + noise_state * noise_amount) * envelope * 0.48
		if kind in ["block", "perfect", "boss_defeat", "landmark"]:
			sample += sin(TAU * frequency * 1.48 * time) * envelope * 0.11
		data.encode_s16(index * 2, clampi(roundi(sample * 32767.0), -32768, 32767))
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = sample_rate
	stream.stereo = false
	stream.data = data
	return stream
