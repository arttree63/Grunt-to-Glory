class_name ImpactVfx
extends Node2D

signal finished(effect: Node)

const BASE_DURATION := 0.52
const TIER_STRENGTH := {"light": 0.72, "medium": 1.0, "heavy": 1.28}
const TIER_SPEED := {"light": 1.18, "medium": 1.0, "heavy": 0.88}

var contact_alpha := 0.0:
	set(value):
		contact_alpha = value
		queue_redraw()
var contact_scale := 0.55:
	set(value):
		contact_scale = value
		queue_redraw()
var debris_alpha := 0.0:
	set(value):
		debris_alpha = value
		queue_redraw()
var debris_progress := 0.0:
	set(value):
		debris_progress = value
		queue_redraw()
var ring_alpha := 0.0:
	set(value):
		ring_alpha = value
		queue_redraw()
var ring_progress := 0.0:
	set(value):
		ring_progress = value
		queue_redraw()
var dust_alpha := 0.0:
	set(value):
		dust_alpha = value
		queue_redraw()
var dust_progress := 0.0:
	set(value):
		dust_progress = value
		queue_redraw()

var tier := "light"
var effect_color := Color("fff0b0")
var attack_direction := Vector2.RIGHT
var effect_strength := 0.72
var motion_scale := 1.0
var event_payload: Dictionary = {}

@onready var animation_player: AnimationPlayer = $AnimationPlayer

func _ready() -> void:
	z_index = 19
	_build_impact_animation()
	animation_player.animation_finished.connect(_on_animation_finished)
	visible = false

static func layer_timing_contract() -> Dictionary:
	return {
		"contact": Vector2(0.0, 0.085),
		"ring": Vector2(0.018, 0.24),
		"debris": Vector2(0.04, 0.28),
		"dust": Vector2(0.09, BASE_DURATION),
	}

static func playback_speed_for_tier(value: String) -> float:
	return float(TIER_SPEED.get(value, TIER_SPEED.light))

static func payload_is_valid(payload: Dictionary) -> bool:
	for key in ["event_id", "position", "normal", "source", "target", "outcome"]:
		if not payload.has(key):
			return false
	return typeof(payload.position) == TYPE_VECTOR2 and typeof(payload.normal) == TYPE_VECTOR2 and String(payload.outcome) == "hit"

func configure(payload: Dictionary, value_tier: String, value_color: Color, reduced_motion: bool) -> void:
	event_payload = payload.duplicate(true)
	position = event_payload.position
	tier = value_tier if TIER_STRENGTH.has(value_tier) else "light"
	effect_color = value_color
	var contact_normal: Vector2 = event_payload.normal
	attack_direction = -contact_normal.normalized()
	if attack_direction == Vector2.ZERO:
		attack_direction = Vector2.RIGHT
	effect_strength = float(TIER_STRENGTH[tier])
	motion_scale = 0.66 if reduced_motion else 1.0
	animation_player.speed_scale = playback_speed_for_tier(tier)

func play_impact() -> void:
	if not payload_is_valid(event_payload):
		finish_now()
		return
	visible = true
	animation_player.stop()
	animation_player.play("impact")

func finish_now() -> void:
	if not is_inside_tree():
		return
	finished.emit(self)
	queue_free()

func _build_impact_animation() -> void:
	if animation_player.has_animation("impact"):
		return
	var animation := Animation.new()
	animation.length = BASE_DURATION
	_add_value_track(animation, ".:contact_alpha", [[0.0, 0.0], [0.008, 1.0], [0.055, 0.82], [0.085, 0.0]])
	_add_value_track(animation, ".:contact_scale", [[0.0, 0.55], [0.02, 0.95], [0.085, 1.35]])
	_add_value_track(animation, ".:ring_alpha", [[0.0, 0.0], [0.018, 0.0], [0.04, 0.9], [0.13, 0.65], [0.24, 0.0]])
	_add_value_track(animation, ".:ring_progress", [[0.0, 0.0], [0.018, 0.0], [0.24, 1.0]])
	_add_value_track(animation, ".:debris_alpha", [[0.0, 0.0], [0.04, 0.0], [0.055, 1.0], [0.18, 0.7], [0.28, 0.0]])
	_add_value_track(animation, ".:debris_progress", [[0.0, 0.0], [0.04, 0.0], [0.28, 1.0]])
	_add_value_track(animation, ".:dust_alpha", [[0.0, 0.0], [0.09, 0.0], [0.13, 0.62], [0.3, 0.4], [BASE_DURATION, 0.0]])
	_add_value_track(animation, ".:dust_progress", [[0.0, 0.0], [0.09, 0.0], [BASE_DURATION, 1.0]])
	var library := AnimationLibrary.new()
	library.add_animation("impact", animation)
	animation_player.add_animation_library("", library)

func _add_value_track(animation: Animation, path: NodePath, keys: Array) -> void:
	var track := animation.add_track(Animation.TYPE_VALUE)
	animation.track_set_path(track, path)
	animation.track_set_interpolation_type(track, Animation.INTERPOLATION_LINEAR)
	for key: Array in keys:
		animation.track_insert_key(track, float(key[0]), key[1])

func _draw() -> void:
	var forward := attack_direction
	var normal := Vector2(-forward.y, forward.x)
	_draw_contact_flash(forward, normal)
	_draw_shock_ring(forward, normal)
	_draw_delayed_debris(forward, normal)
	_draw_residual_dust(forward, normal)

func _draw_contact_flash(forward: Vector2, normal: Vector2) -> void:
	if contact_alpha <= 0.0:
		return
	var alpha := contact_alpha * (0.74 if motion_scale < 1.0 else 1.0)
	var radius := (5.0 + effect_strength * 5.0) * contact_scale
	draw_circle(Vector2.ZERO, radius * 1.5, _color_with_alpha(effect_color, alpha * 0.38))
	draw_circle(Vector2.ZERO, radius * 0.72, _color_with_alpha(Color.WHITE, alpha))
	for index in 6:
		var spread := (float(index) - 2.5) / 2.5
		var ray_direction := (forward + normal * spread * 0.62).normalized()
		var length := radius * (2.2 - absf(spread) * 0.55)
		draw_line(-ray_direction * 2.0, ray_direction * length, _color_with_alpha(effect_color.lightened(0.35), alpha * (0.88 - absf(spread) * 0.22)), 3.5 if index in [2, 3] else 2.0)

func _draw_shock_ring(forward: Vector2, normal: Vector2) -> void:
	if ring_alpha <= 0.0:
		return
	var radius := (8.0 + ring_progress * (24.0 + effect_strength * 15.0)) * motion_scale
	var points := PackedVector2Array()
	for index in 29:
		var angle := TAU * float(index) / 28.0
		points.append(forward * cos(angle) * radius * 1.12 + normal * sin(angle) * radius * 0.72)
	draw_polyline(points, _color_with_alpha(effect_color.lightened(0.28), ring_alpha * 0.72), 1.8 + effect_strength * 1.6, true)

func _draw_delayed_debris(forward: Vector2, normal: Vector2) -> void:
	if debris_alpha <= 0.0:
		return
	var count := 4 if tier == "light" else (7 if tier == "medium" else 10)
	for index in count:
		var spread := (float(index) - float(count - 1) * 0.5) / maxf(1.0, float(count - 1) * 0.5)
		var distance := (8.0 + debris_progress * (18.0 + float(index % 3) * 6.0)) * effect_strength * motion_scale
		var offset := forward * distance + normal * spread * (8.0 + debris_progress * 18.0) * motion_scale
		var fragment_direction := (forward + normal * spread * 0.48).normalized()
		var fragment_color := effect_color.lightened(0.18) if index % 2 == 0 else Color("806d52")
		draw_line(offset, offset + fragment_direction * (4.0 + effect_strength * 5.0), _color_with_alpha(fragment_color, debris_alpha * 0.82), 1.8 + effect_strength)

func _draw_residual_dust(forward: Vector2, normal: Vector2) -> void:
	if dust_alpha <= 0.0:
		return
	var count := 3 if tier == "light" else (5 if tier == "medium" else 7)
	for index in count:
		var spread := (float(index) - float(count - 1) * 0.5) / maxf(1.0, float(count - 1) * 0.5)
		var drift := forward * (-5.0 + dust_progress * 13.0) + normal * spread * (10.0 + dust_progress * 20.0)
		drift.y += 8.0 + dust_progress * (5.0 + float(index % 2) * 3.0)
		var radius := (3.0 + float(index % 3) * 1.5 + dust_progress * 4.0) * effect_strength * motion_scale
		var dust_color := Color("9c8a72") if index % 2 == 0 else Color("c4b69d")
		draw_circle(drift, radius, _color_with_alpha(dust_color, dust_alpha * (0.42 + float(index % 3) * 0.08)))

func _color_with_alpha(color: Color, alpha: float) -> Color:
	var result := color
	result.a = clampf(alpha, 0.0, 1.0)
	return result

func _on_animation_finished(animation_name: StringName) -> void:
	if animation_name == &"impact":
		finish_now()
