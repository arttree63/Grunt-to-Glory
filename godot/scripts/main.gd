extends Control

const FIXED_STEP := 1.0 / 60.0
const SAVE_PATH := "user://grunt_to_glory_save_v1.json"
const SAVE_FILE_NAME := "grunt_to_glory_save_v1.json"
const AUTO_SAVE_INTERVAL := 10.0
const PAGE_NAMES := {"combat": "戰鬥", "character": "角色", "skills": "技能", "equipment": "裝備", "shop": "商店"}
const CORE_UNLOCK_NAMES := {
	"martial": "蓄勢・一閃", "physique": "不動", "agility": "雙燕疾斬",
	"magic": "魔劍・魔紋", "faith": "聖劍・聖印", "command": "軍勢",
}
const CORE_UNLOCK_DESCRIPTIONS := {
	"martial": "普攻與時間會累積勢；滿勢時下一次普攻化為 280% 一閃並穿透 15% 護甲",
	"physique": "守勢提高格擋率，成功格擋會累積不動",
	"agility": "兩段各自判定暴擊的高速斬擊已解鎖，並自動加入 AUTO",
	"magic": "普通攻擊開始附魔，並逐步累積魔紋",
	"faith": "攻擊開始附加聖傷，並逐步累積聖印",
	"command": "王國步兵正式入隊，主角與友軍會累積軍勢",
}
const SIGNATURE_TREE := {
	"martial": [
		{"level": 10, "name": "蓄勢・一閃", "description": "勢滿後，普攻化為 280% ATK 的集中一閃，並穿透 15% 護甲。"},
		{"level": 30, "name": "一閃劍路", "description": "在追命與斷鋼之間選擇，決定蓄勢一閃如何終結敵人。"},
		{"level": 50, "name": "拔刀・無拍", "description": "進入爆發架勢，加速蓄勢並強化第一刀。"},
		{"level": 100, "name": "一刀極意・斷界", "description": "滿勢斬擊開始造成破防與失衡，Boss 也必須接下這一刀。"},
		{"level": 200, "name": "奧義・一刀兩斷", "description": "消耗滿勢揮出 1200% ATK 終極斬擊。"},
	],
	"physique": [
		{"level": 10, "name": "守勢・鐵門", "description": "進入守勢提高格擋率，成功格擋開始累積不動。"},
		{"level": 30, "name": "返刃架勢", "description": "在鎮岳與借勢之間選擇，決定返刃偏向穩定完美格擋或借力爆發。"},
		{"level": 50, "name": "崩勢反擊", "description": "將不動、防禦與借來的力量一次打回敵人身上。"},
		{"level": 100, "name": "返刃極意・山崩", "description": "完美格擋串聯不動、借力、失衡與返刃。"},
		{"level": 200, "name": "奧義・不動返天", "description": "正面接下致命重擊，再把敵人的力量完整反還。"},
	],
	"agility": [
		{"level": 10, "name": "雙燕疾斬", "description": "快速斬擊兩次，每一刀都能獨立暴擊。"},
		{"level": 30, "name": "影襲身法", "description": "在折返與流風之間選擇，決定影襲轉為追加傷害或高速循環。"},
		{"level": 50, "name": "瞬步・留影", "description": "面對危險攻擊留下殘影，保證閃開下一次可閃攻擊。"},
		{"level": 100, "name": "流轉・千葉", "description": "追擊反過來維持游刃，快劍循環開始自行運轉。"},
		{"level": 200, "name": "奧義・無影極境", "description": "一次閃避展開影襲、飛燕、燕返與疾斬連攜。"},
	],
	"magic": [
		{"level": 10, "name": "魔劍・刻紋", "description": "劍刃附魔並留下魔紋，普通斬擊正式成為施法媒介。"},
		{"level": 30, "name": "炎爆刻印", "description": "在焚盡與餘燼之間選擇，決定炎爆追求一次引爆或保留燃燒循環。"},
		{"level": 50, "name": "魔劍解放", "description": "短時間加速魔紋、燃燒與魔劍傷害循環。"},
		{"level": 100, "name": "魔劍共鳴", "description": "兩種元素彼此反應，爆發後返還資源並強化下一輪。"},
		{"level": 200, "name": "奧義・魔劍完全解放", "description": "劍、魔力與元素完全融合，連續引發元素共鳴。"},
	],
	"faith": [
		{"level": 10, "name": "聖劍・初誓", "description": "攻擊附帶聖傷並凝聚聖印，劍與誓言開始合一。"},
		{"level": 30, "name": "聖光斬・恩典", "description": "斬擊敵人的同時回復生命，聖印會進一步化為護盾。"},
		{"level": 50, "name": "聖劍解放", "description": "加速聖印生成，讓攻擊、治療與護盾同時運轉。"},
		{"level": 100, "name": "聖劍極意・光環", "description": "聖印同時強化制裁、恩典與守護。"},
		{"level": 200, "name": "奧義・聖劍降臨", "description": "每一次斬擊都化為聖光，每一次治療都溢出為護盾。"},
	],
	"command": [
		{"level": 10, "name": "第一名戰友", "description": "王國步兵永久入隊；你的旅途第一次不再是單人作戰。"},
		{"level": 30, "name": "先鋒斬・同袍", "description": "主角先出劍，前排友軍立刻響應追擊。"},
		{"level": 50, "name": "軍團號令", "description": "消耗軍勢，命令所有存活友軍同時發動特殊攻擊。"},
		{"level": 100, "name": "軍團劍陣", "description": "主角、先鋒與後排形成連續響應的軍團劍術。"},
		{"level": 200, "name": "奧義・萬軍一劍", "description": "主角揮出一劍，所有存活友軍以自己的方式響應。"},
	],
}
const UI_FONT := preload("res://assets/fonts/NotoSansTC-Regular.otf")
const CREST_ICON := preload("res://assets/ui/hud_v2/crest.png")
const SKILL_SLOT_ICONS: Array[Texture2D] = [
	preload("res://assets/ui/hud_v2/skill-heavy.png"),
	preload("res://assets/ui/hud_v2/skill-guard.png"),
	preload("res://assets/ui/hud_v2/skill-thrust.png"),
	preload("res://assets/ui/hud_v2/skill-wind.png"),
	preload("res://assets/ui/hud_v2/skill-roar.png"),
]
const NAV_ICONS := {
	"combat": preload("res://assets/ui/hud_v2/nav-combat.png"),
	"character": preload("res://assets/ui/hud_v2/nav-character.png"),
	"skills": preload("res://assets/ui/hud_v2/nav-skills.png"),
	"equipment": preload("res://assets/ui/hud_v2/nav-equipment.png"),
	"shop": preload("res://assets/ui/hud_v2/nav-shop.png"),
}

var model := CombatModel.new()
var accumulator := 0.0
var autosave_elapsed := 0.0
var save_loaded := false
var persistence_enabled := true
var game_started := false
var training_open := false
var journey_open := false
var journey_pending := false
var boss_reward_open := false
var failure_open := false
var tutorial_open := false
var current_page := "combat"
var current_skill_tab := "auto"
var current_major_milestone := 10
var selected_equipment_slot := "weapon"
var selected_equipment_id := ""
var battlefield: Battlefield
var enemy_label: Label
var kills_label: Label
var top_panel: PanelContainer
var combat_panel: PanelContainer
var hp_bar: ProgressBar
var hp_label: Label
var mp_bar: ProgressBar
var mp_label: Label
var mp_hud: VBoxContainer
var momentum_bar: ProgressBar
var momentum_label: Label
var momentum_head: HBoxContainer
var momentum_hud: VBoxContainer
var state_panel: PanelContainer
var immovable_hud: VBoxContainer
var immovable_label: Label
var immovable_pips: Array[PanelContainer] = []
var youren_hud: VBoxContainer
var youren_label: Label
var youren_pips: Array[PanelContainer] = []
var magic_hud: VBoxContainer
var magic_label: Label
var magic_pips: Array[PanelContainer] = []
var faith_hud: VBoxContainer
var faith_label: Label
var faith_pips: Array[PanelContainer] = []
var command_hud: VBoxContainer
var command_label: Label
var command_bar: ProgressBar
var enemy_bar: ProgressBar
var auto_slot_buttons: Array[Button] = []
var training_alert_button: Button
var retry_button: Button
var failure_button: Button
var failure_status: HBoxContainer
var training_overlay: Control
var training_rows: Dictionary = {}
var section_overlay: Control
var section_margin: MarginContainer
var section_scroll: ScrollContainer
var section_box: VBoxContainer
var nav_buttons: Dictionary = {}
var skill_tab_buttons: Dictionary = {}
var toast_panel: PanelContainer
var toast_title: Label
var toast_detail: Label
var toast_tween: Tween
var pending_style_formation_tracks: Array[String] = []
var pending_style_formation_equipment := false
var journey_overlay: Control
var journey_title: Label
var journey_detail: Label
var journey_buttons: Dictionary = {}
var boss_reward_overlay: Control
var boss_reward_box: VBoxContainer
var failure_overlay: Control
var failure_detail: Label
var boss_reward_summary := {}
var start_overlay: Control
var new_game_button: Button
var continue_button: Button
var save_preview_label: Label
var tutorial_overlay: Control
var tutorial_title: Label
var tutorial_detail: Label
var tutorial_action_button: Button
var tutorial_action := Callable()
var tutorial_core_hint_shown := false

func _ready() -> void:
	_build_ui()
	get_viewport().size_changed.connect(_apply_safe_area)
	_apply_safe_area()
	_update_hud(model.snapshot())
	if persistence_enabled:
		_show_start_screen()
	else:
		game_started = true
		start_overlay.visible = false
		_update_hud(model.snapshot())
		auto_slot_buttons[0].grab_focus()

func _process(delta: float) -> void:
	if not game_started:
		return
	if persistence_enabled:
		autosave_elapsed += delta
		if autosave_elapsed >= AUTO_SAVE_INTERVAL:
			_save_game()
	if battlefield != null and battlefield.defeat_sequence_active():
		accumulator = 0.0
		return
	if tutorial_open or training_open or journey_open or journey_pending or boss_reward_open or failure_open or current_page != "combat":
		return
	if battlefield.navigation_blocks_combat():
		accumulator = 0.0
		return
	accumulator = minf(accumulator + delta, FIXED_STEP * 5.0)
	var stepped := false
	while accumulator >= FIXED_STEP:
		accumulator -= FIXED_STEP
		_handle_events(model.step(FIXED_STEP))
		if battlefield.defeat_sequence_active():
			accumulator = 0.0
			break
		stepped = true
	if stepped:
		_update_hud(model.snapshot())

func _notification(what: int) -> void:
	if persistence_enabled and game_started and (what == NOTIFICATION_WM_CLOSE_REQUEST or what == NOTIFICATION_PREDELETE):
		_save_game()

func _save_game() -> bool:
	if not persistence_enabled or not game_started:
		return false
	autosave_elapsed = 0.0
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		return false
	file.store_string(JSON.stringify(model.save_data()))
	file.flush()
	return true

func _load_game() -> bool:
	if not FileAccess.file_exists(SAVE_PATH):
		return false
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return false
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	return parsed is Dictionary and model.load_save_data(parsed)

func _restore_pending_choice() -> void:
	if not model.awaiting_journey_choice:
		return
	if model.boss_reward_claimed:
		journey_pending = true
		_show_journey_choice()
	else:
		_show_boss_reward(model.boss_reward_options())

func _show_start_screen() -> void:
	start_overlay.visible = true
	continue_button.disabled = not FileAccess.file_exists(SAVE_PATH)
	save_preview_label.text = _save_preview_text()
	(continue_button if not continue_button.disabled else new_game_button).grab_focus()

func _save_preview_text() -> String:
	if not FileAccess.file_exists(SAVE_PATH):
		return "目前沒有紀錄，從一名普通小兵開始。"
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return "紀錄無法讀取"
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	if not parsed is Dictionary or int(parsed.get("version", 0)) != 1:
		return "紀錄版本不相容，請開始新遊戲。"
	return "第 %d 戰｜擊倒 %d｜金幣 %d｜可用修練 %d" % [int(parsed.get("stage", 1)), int(parsed.get("kills", 0)), int(parsed.get("gold", 0)), int(parsed.get("training_points", 0))]

func _start_new_game() -> void:
	var user_dir := DirAccess.open("user://")
	if user_dir != null and user_dir.file_exists(SAVE_FILE_NAME):
		user_dir.remove(SAVE_FILE_NAME)
	model = CombatModel.new()
	model.equip_item("black_iron_armor")
	model.tutorial_step = "intro"
	tutorial_core_hint_shown = false
	save_loaded = false
	_finish_startup("新遊戲開始")
	_save_game()

func _continue_game() -> void:
	if not _load_game():
		continue_button.disabled = true
		save_preview_label.text = "紀錄無法讀取，請開始新遊戲。"
		new_game_button.grab_focus()
		return
	save_loaded = true
	tutorial_core_hint_shown = false
	_finish_startup("進度已載入")
	if model.awaiting_journey_choice:
		call_deferred("_restore_pending_choice")

func _finish_startup(title: String) -> void:
	game_started = true
	start_overlay.visible = false
	accumulator = 0.0
	battlefield.set_exploration_enabled(true)
	_update_hud(model.snapshot())
	auto_slot_buttons[0].grab_focus()
	if model.tutorial_step == "intro":
		call_deferred("_show_tutorial_intro")
	elif model.tutorial_step == "training":
		call_deferred("_show_training_tutorial")
	elif model.tutorial_step == "spend":
		call_deferred("_resume_spend_tutorial")
	else:
		var detail := "角色會自動尋敵；先選接敵路線，再點右上「第一步：修練」" if _total_base_training() == 0 else "角色會自動尋敵與攻擊；你負責路線、流派與技能編成"
		if String(battlefield.exploration_status().phase) != "choosing":
			_show_toast(title, detail)
		if model.tutorial_step == "core":
			call_deferred("_highlight_core_training_button")

func _show_tutorial(title: String, detail: String, action_text: String, action: Callable) -> void:
	tutorial_open = true
	tutorial_overlay.visible = true
	tutorial_title.text = title
	tutorial_detail.text = detail
	tutorial_action_button.text = action_text
	tutorial_action = action
	tutorial_action_button.add_theme_stylebox_override("normal", _panel_style(Color("8d6528"), Color("ffe5a3"), 3))
	_pulse_tutorial_target(tutorial_action_button)
	tutorial_action_button.grab_focus()

func _show_tutorial_intro() -> void:
	_show_tutorial("你只是一名小兵", "角色會自動尋找敵人。接敵前可點選高地、直行或補給；不操作也會自動直行。", "開始探索", _tutorial_begin_observe)

func _tutorial_begin_observe() -> void:
	model.tutorial_step = "observe"
	_close_tutorial()
	_update_hud(model.snapshot())
	_refresh_navigation()
	_save_game()

func _show_training_tutorial() -> void:
	model.tutorial_step = "training"
	_show_tutorial("第一次成長", "擊倒敵人會獲得修練點。現在只做一件事：選一條你想嘗試的流派，投入第一點。", "前往修練", _tutorial_open_training)
	_save_game()

func _tutorial_open_training() -> void:
	_close_tutorial()
	model.tutorial_step = "spend"
	_open_training()
	call_deferred("_highlight_training_choices")
	_save_game()

func _resume_spend_tutorial() -> void:
	_open_training()
	_show_tutorial("選擇第一條道路", "先在任一流派按一次＋。這不會鎖死流派，以後仍可以混修。", "我知道了", _tutorial_reveal_training_choices)

func _tutorial_reveal_training_choices() -> void:
	_close_tutorial()
	call_deferred("_highlight_training_choices")

func _show_first_training_complete(track: String) -> void:
	var definition: Dictionary = CombatModel.TRAINING_DEFS[track]
	_show_tutorial("道路開始形成", "你投入了%s。修練會同時提高基礎能力；有效 Lv.10 會解鎖這條流派的核心機制。" % String(definition.name), "回到戰鬥", _tutorial_return_to_combat)

func _tutorial_return_to_combat() -> void:
	model.tutorial_step = "core"
	tutorial_core_hint_shown = false
	_close_tutorial()
	_close_training()
	_update_hud(model.snapshot())
	_refresh_navigation()
	call_deferred("_highlight_core_training_button")
	_save_game()

func _show_core_tutorial(track: String) -> void:
	model.tutorial_step = "complete"
	_show_tutorial("%s流派成形" % String(CombatModel.TRAINING_DEFS[track].style), "%s：%s。從現在開始，你再自由研究技能、裝備與其他流派。" % [String(CORE_UNLOCK_NAMES[track]), String(CORE_UNLOCK_DESCRIPTIONS[track])], "完成教學", _tutorial_finish)
	_save_game()

func _tutorial_finish() -> void:
	_close_tutorial()
	if training_open:
		_close_training()
	_save_game()

func _run_tutorial_action() -> void:
	if tutorial_action.is_valid():
		tutorial_action.call()

func _close_tutorial() -> void:
	tutorial_open = false
	tutorial_overlay.visible = false
	tutorial_action = Callable()

func _pulse_tutorial_target(control: Control) -> void:
	if not is_instance_valid(control) or bool(control.get_meta("tutorial_pulsing", false)):
		return
	control.set_meta("tutorial_pulsing", true)
	control.modulate = Color.WHITE
	var tween := create_tween()
	tween.tween_property(control, "modulate", Color("fff0a8"), 0.18).set_trans(Tween.TRANS_SINE)
	tween.tween_property(control, "modulate", Color.WHITE, 0.34).set_trans(Tween.TRANS_SINE)
	tween.tween_callback(func() -> void:
		if is_instance_valid(control):
			control.set_meta("tutorial_pulsing", false)
	)

func _highlight_training_choices() -> void:
	if model.tutorial_step != "spend" or not training_open:
		return
	for track: String in CombatModel.TRAINING_ORDER:
		var button := training_rows[track].button as Button
		if button.disabled:
			continue
		button.add_theme_stylebox_override("normal", _panel_style(Color("926520"), Color("ffe39a"), 4))
		_pulse_tutorial_target(button)

func _highlight_core_training_button() -> void:
	if tutorial_core_hint_shown or model.tutorial_step != "core" or model.training_points <= 0:
		return
	tutorial_core_hint_shown = true
	training_alert_button.add_theme_stylebox_override("normal", _panel_style(Color("fff0c7"), Color("efae38"), 4))
	_pulse_tutorial_target(training_alert_button)

func _skip_tutorial() -> void:
	model.tutorial_step = "complete"
	_close_tutorial()
	if training_open:
		_close_training()
	_update_hud(model.snapshot())
	_refresh_navigation()
	_save_game()

func _unhandled_input(event: InputEvent) -> void:
	if journey_open or journey_pending or boss_reward_open:
		return
	if event.is_action_pressed("training") and current_page == "character":
		_toggle_training()
	elif event.is_action_pressed("ui_cancel") and training_open:
		_close_training()
	elif event.is_action_pressed("ui_cancel") and current_page != "combat":
		_switch_page("combat")

func _build_ui() -> void:
	var ui_theme := Theme.new()
	ui_theme.default_font = UI_FONT
	theme = ui_theme

	battlefield = Battlefield.new()
	battlefield.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	battlefield.approach_selected.connect(_select_exploration_approach)
	add_child(battlefield)
	var shade := ColorRect.new()
	shade.color = Color("6d7c87", 0.035)
	shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(shade)

	var safe := MarginContainer.new()
	safe.name = "SafeArea"
	safe.mouse_filter = Control.MOUSE_FILTER_IGNORE
	safe.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(safe)
	var layout := VBoxContainer.new()
	layout.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layout.add_theme_constant_override("separation", 7)
	safe.add_child(layout)

	top_panel = PanelContainer.new()
	top_panel.add_theme_stylebox_override("panel", _panel_style(Color("fffaf0", 0.96), Color("b98532"), 2))
	layout.add_child(top_panel)
	var top_box := VBoxContainer.new()
	top_box.add_theme_constant_override("separation", 5)
	top_panel.add_child(top_box)
	var identity := HBoxContainer.new()
	top_box.add_child(identity)
	var crest := TextureRect.new()
	crest.texture = CREST_ICON
	crest.custom_minimum_size = Vector2(44, 44)
	crest.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	crest.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	crest.mouse_filter = Control.MOUSE_FILTER_IGNORE
	identity.add_child(crest)
	var hero_name := _label("無名小兵", 22, Color("292824"))
	hero_name.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	identity.add_child(hero_name)
	training_alert_button = _button("可用修練 0", Color("f5ead0"), 44)
	training_alert_button.custom_minimum_size.x = 116
	training_alert_button.size_flags_horizontal = Control.SIZE_SHRINK_END
	training_alert_button.add_theme_font_size_override("font_size", 14)
	training_alert_button.add_theme_color_override("font_color", Color("8a5b16"))
	training_alert_button.add_theme_color_override("font_hover_color", Color("2b1e10"))
	training_alert_button.add_theme_color_override("font_pressed_color", Color("2b1e10"))
	training_alert_button.pressed.connect(_open_training)
	identity.add_child(training_alert_button)
	enemy_label = _label("林地哥布林 · 第 1 戰", 16, Color("373733"))
	enemy_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	top_box.add_child(enemy_label)
	enemy_bar = _progress_bar(Color("d8cbbb"), Color("9c4138"), 16)
	top_box.add_child(enemy_bar)
	kills_label = _label("擊倒 0", 14, Color("4e514f"))
	kills_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	top_box.add_child(kills_label)
	failure_status = HBoxContainer.new()
	failure_status.visible = false
	failure_status.add_theme_constant_override("separation", 4)
	top_box.add_child(failure_status)
	failure_button = _button("突破失敗", Color("6a4a2f"), 42)
	failure_button.add_theme_font_size_override("font_size", 14)
	failure_button.pressed.connect(_open_failure_report)
	failure_status.add_child(failure_button)
	retry_button = _button("再次挑戰", Color("913b31"), 42)
	retry_button.visible = false
	retry_button.custom_minimum_size.x = 116
	retry_button.size_flags_horizontal = Control.SIZE_SHRINK_END
	retry_button.add_theme_font_size_override("font_size", 16)
	retry_button.add_theme_color_override("font_color", Color("fff4df"))
	retry_button.tooltip_text = "停止刷上一戰，重新挑戰剛才戰敗的關卡"
	retry_button.pressed.connect(_retry_failed_stage)
	failure_status.add_child(retry_button)

	var spacer := Control.new()
	spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	spacer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layout.add_child(spacer)
	toast_panel = PanelContainer.new()
	toast_panel.visible = false
	toast_panel.z_index = 80
	toast_panel.set_anchors_preset(Control.PRESET_TOP_WIDE)
	toast_panel.anchor_left = 0.06
	toast_panel.anchor_right = 0.94
	toast_panel.offset_top = 184.0
	toast_panel.offset_bottom = 246.0
	toast_panel.add_theme_stylebox_override("panel", _panel_style(Color("2c2218", 0.96), Color("f0c365")))
	add_child(toast_panel)
	var toast_box := VBoxContainer.new()
	toast_panel.add_child(toast_box)
	toast_title = _label("", 17, Color("ffe09a"))
	toast_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toast_box.add_child(toast_title)
	toast_detail = _label("", 12, Color("f4eee0"))
	toast_detail.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toast_detail.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	toast_box.add_child(toast_detail)

	combat_panel = PanelContainer.new()
	combat_panel.add_theme_stylebox_override("panel", _panel_style(Color("fffaf1", 0.97), Color("b99258"), 2))
	layout.add_child(combat_panel)
	var bottom_box := VBoxContainer.new()
	bottom_box.add_theme_constant_override("separation", 7)
	combat_panel.add_child(bottom_box)
	var resource_row := HBoxContainer.new()
	resource_row.add_theme_constant_override("separation", 8)
	bottom_box.add_child(resource_row)
	var hp_box := VBoxContainer.new()
	hp_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	resource_row.add_child(hp_box)
	hp_label = _label("♥ 生命", 15, Color("a33d32"))
	hp_box.add_child(hp_label)
	hp_bar = _progress_bar(Color("d9cbc0"), Color("b85245"), 18)
	hp_box.add_child(hp_bar)
	mp_hud = VBoxContainer.new()
	mp_hud.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	resource_row.add_child(mp_hud)
	mp_label = _label("◆ MP  尚未啟用", 15, Color("36586a"))
	mp_hud.add_child(mp_label)
	mp_bar = _progress_bar(Color("c8d1d3"), Color("477d91"), 18)
	mp_hud.add_child(mp_bar)
	momentum_hud = VBoxContainer.new()
	momentum_hud.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	resource_row.add_child(momentum_hud)
	momentum_head = HBoxContainer.new()
	momentum_hud.add_child(momentum_head)
	momentum_label = _label("♨ 勢  0/100", 15, Color("9c4a24"))
	momentum_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	momentum_head.add_child(momentum_label)
	momentum_bar = _progress_bar(Color("dac9b7"), Color("c65d20"), 18)
	momentum_hud.add_child(momentum_bar)

	state_panel = PanelContainer.new()
	state_panel.add_theme_stylebox_override("panel", _panel_style(Color("f4eee3", 0.9), Color("cfbea5"), 1))
	bottom_box.add_child(state_panel)
	var state_grid := GridContainer.new()
	state_grid.columns = 3
	state_grid.add_theme_constant_override("h_separation", 7)
	state_grid.add_theme_constant_override("v_separation", 6)
	state_panel.add_child(state_grid)
	immovable_hud = VBoxContainer.new()
	immovable_hud.add_theme_constant_override("separation", 3)
	immovable_hud.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	state_grid.add_child(immovable_hud)
	immovable_label = _label("不動  0/3", 14, Color("315b70"))
	immovable_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	immovable_hud.add_child(immovable_label)
	var immovable_row := HBoxContainer.new()
	immovable_row.add_theme_constant_override("separation", 5)
	immovable_hud.add_child(immovable_row)
	for index in CombatModel.MAX_IMMOVABLE:
		var pip := PanelContainer.new()
		pip.custom_minimum_size = Vector2(18, 15)
		pip.add_theme_stylebox_override("panel", _state_pip_style(Color("bdc7c9"), Color("70848b"), "shield"))
		immovable_row.add_child(pip)
		immovable_pips.append(pip)
	youren_hud = VBoxContainer.new()
	youren_hud.add_theme_constant_override("separation", 3)
	youren_hud.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	state_grid.add_child(youren_hud)
	youren_label = _label("游刃  0/5", 14, Color("28766f"))
	youren_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	youren_hud.add_child(youren_label)
	var youren_row := HBoxContainer.new()
	youren_row.add_theme_constant_override("separation", 4)
	youren_hud.add_child(youren_row)
	for index in CombatModel.MAX_YOUREN:
		var pip := PanelContainer.new()
		pip.custom_minimum_size = Vector2(14, 10)
		pip.add_theme_stylebox_override("panel", _state_pip_style(Color("bdcbc8"), Color("5d8781"), "slash"))
		youren_row.add_child(pip)
		youren_pips.append(pip)
	magic_hud = VBoxContainer.new()
	magic_hud.add_theme_constant_override("separation", 3)
	magic_hud.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	state_grid.add_child(magic_hud)
	magic_label = _label("魔紋  0/5", 14, Color("67458f"))
	magic_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	magic_hud.add_child(magic_label)
	var magic_row := HBoxContainer.new()
	magic_row.add_theme_constant_override("separation", 4)
	magic_hud.add_child(magic_row)
	for index in CombatModel.MAX_MAGIC_MARKS:
		var pip := PanelContainer.new()
		pip.custom_minimum_size = Vector2(14, 14)
		pip.add_theme_stylebox_override("panel", _state_pip_style(Color("c9bfd1"), Color("79638e"), "rune"))
		magic_row.add_child(pip)
		magic_pips.append(pip)
	faith_hud = VBoxContainer.new()
	faith_hud.add_theme_constant_override("separation", 3)
	faith_hud.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	state_grid.add_child(faith_hud)
	faith_label = _label("聖印  0/5", 14, Color("8a6a24"))
	faith_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	faith_hud.add_child(faith_label)
	var faith_row := HBoxContainer.new()
	faith_row.add_theme_constant_override("separation", 4)
	faith_hud.add_child(faith_row)
	for index in CombatModel.MAX_HOLY_SEALS:
		var pip := PanelContainer.new()
		pip.custom_minimum_size = Vector2(14, 14)
		pip.add_theme_stylebox_override("panel", _state_pip_style(Color("d5ccb0"), Color("9d8849"), "seal"))
		faith_row.add_child(pip)
		faith_pips.append(pip)
	command_hud = VBoxContainer.new()
	command_hud.add_theme_constant_override("separation", 3)
	command_hud.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	state_grid.add_child(command_hud)
	command_label = _label("軍勢  0/100", 14, Color("813d34"))
	command_hud.add_child(command_label)
	command_bar = _progress_bar(Color("cabdb2"), Color("9b4b3d"), 10)
	command_hud.add_child(command_bar)

	var slot_heading := HBoxContainer.new()
	bottom_box.add_child(slot_heading)
	var slot_title := _label("主技能 AUTO", 14, Color("344750"))
	slot_title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	slot_heading.add_child(slot_title)
	slot_heading.add_child(_label("完整 5 格於技能頁", 14, Color("66767b")))
	var actions := HBoxContainer.new()
	actions.add_theme_constant_override("separation", 5)
	bottom_box.add_child(actions)
	for index in CombatModel.AUTO_SLOT_COUNT:
		var slot := _skill_button("", Color("252c2b"), SKILL_SLOT_ICONS[index])
		slot.custom_minimum_size.x = 0
		slot.size_flags_stretch_ratio = 1.0
		slot.tooltip_text = "空槽會開啟技能頁；已裝備技能可點擊切換戰術"
		slot.pressed.connect(_on_auto_slot_pressed.bind(index))
		actions.add_child(slot)
		auto_slot_buttons.append(slot)
	_build_navigation(layout)
	_build_section_overlay()
	_build_training_overlay()
	_build_journey_overlay()
	_build_boss_reward_overlay()
	_build_failure_overlay()
	_build_tutorial_overlay()
	_build_start_overlay()

func _build_start_overlay() -> void:
	start_overlay = Control.new()
	start_overlay.z_index = 100
	start_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	start_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(start_overlay)
	var dim := ColorRect.new()
	dim.color = Color("101917", 0.96)
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	start_overlay.add_child(dim)
	var safe := MarginContainer.new()
	safe.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side: String in ["left", "right"]:
		safe.add_theme_constant_override("margin_%s" % side, 28)
	safe.add_theme_constant_override("margin_top", 72)
	safe.add_theme_constant_override("margin_bottom", 72)
	start_overlay.add_child(safe)
	var center := CenterContainer.new()
	safe.add_child(center)
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(300, 0)
	panel.add_theme_stylebox_override("panel", _panel_style(Color("fff8e9", 0.98), Color("c4933e"), 3))
	center.add_child(panel)
	var margin := MarginContainer.new()
	for side: String in ["left", "right", "top", "bottom"]:
		margin.add_theme_constant_override("margin_%s" % side, 24)
	panel.add_child(margin)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 14)
	margin.add_child(box)
	var title := _label("小兵的故事", 32, Color("32291f"))
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(title)
	var subtitle := _label("從無名小兵，走出自己的劍術。", 15, Color("6e6254"))
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(subtitle)
	var separator := HSeparator.new()
	box.add_child(separator)
	save_preview_label = _label("", 14, Color("675d50"))
	save_preview_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	save_preview_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(save_preview_label)
	continue_button = _button("讀取紀錄", Color("71552f"), 56)
	continue_button.pressed.connect(_continue_game)
	box.add_child(continue_button)
	new_game_button = _button("開始新遊戲", Color("435a65"), 56)
	new_game_button.pressed.connect(_start_new_game)
	box.add_child(new_game_button)

func _build_navigation(parent: VBoxContainer) -> void:
	var nav := HBoxContainer.new()
	nav.z_index = 30
	nav.add_theme_constant_override("separation", 2)
	parent.add_child(nav)
	for page: String in PAGE_NAMES:
		var button := _nav_button(String(PAGE_NAMES[page]), NAV_ICONS[page])
		button.pressed.connect(_switch_page.bind(page))
		nav.add_child(button)
		nav_buttons[page] = button
	_refresh_navigation()

func _build_section_overlay() -> void:
	section_overlay = Control.new()
	section_overlay.visible = false
	section_overlay.z_index = 20
	section_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	section_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(section_overlay)
	section_margin = MarginContainer.new()
	section_margin.mouse_filter = Control.MOUSE_FILTER_IGNORE
	section_margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	section_margin.add_theme_constant_override("margin_left", 16)
	section_margin.add_theme_constant_override("margin_top", 20)
	section_margin.add_theme_constant_override("margin_right", 16)
	section_margin.add_theme_constant_override("margin_bottom", 82)
	section_overlay.add_child(section_margin)
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _panel_style(Color("111a17", 0.99), Color("7d8f7d"), 2))
	section_margin.add_child(panel)
	section_scroll = ScrollContainer.new()
	section_scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	section_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	section_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	section_scroll.follow_focus = false
	section_scroll.scroll_deadzone = 14
	panel.add_child(section_scroll)
	section_box = VBoxContainer.new()
	section_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	section_box.add_theme_constant_override("separation", 9)
	section_scroll.add_child(section_box)

func _build_tutorial_overlay() -> void:
	tutorial_overlay = Control.new()
	tutorial_overlay.visible = false
	tutorial_overlay.z_index = 90
	tutorial_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	tutorial_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(tutorial_overlay)
	var dim := ColorRect.new()
	dim.color = Color("08100e", 0.78)
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	tutorial_overlay.add_child(dim)
	var safe := MarginContainer.new()
	safe.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side: String in ["left", "right"]:
		safe.add_theme_constant_override("margin_%s" % side, 24)
	safe.add_theme_constant_override("margin_top", 120)
	safe.add_theme_constant_override("margin_bottom", 120)
	tutorial_overlay.add_child(safe)
	var center := CenterContainer.new()
	safe.add_child(center)
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(310, 0)
	panel.add_theme_stylebox_override("panel", _panel_style(Color("fff8e9", 0.99), Color("c18a31"), 3))
	center.add_child(panel)
	var margin := MarginContainer.new()
	for side: String in ["left", "right", "top", "bottom"]:
		margin.add_theme_constant_override("margin_%s" % side, 22)
	panel.add_child(margin)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 12)
	margin.add_child(box)
	var step_label := _label("專注教學", 13, Color("9a6a20"))
	step_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(step_label)
	tutorial_title = _label("", 26, Color("30291f"))
	tutorial_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(tutorial_title)
	tutorial_detail = _label("", 15, Color("62594e"))
	tutorial_detail.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	tutorial_detail.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(tutorial_detail)
	tutorial_action_button = _button("繼續", Color("75562c"), 52)
	tutorial_action_button.pressed.connect(_run_tutorial_action)
	box.add_child(tutorial_action_button)
	var skip := _button("跳過新手教學", Color("ebe3d3"), 42)
	skip.add_theme_color_override("font_color", Color("6a6258"))
	skip.pressed.connect(_skip_tutorial)
	box.add_child(skip)

func _build_journey_overlay() -> void:
	journey_overlay = Control.new()
	journey_overlay.visible = false
	journey_overlay.z_index = 60
	journey_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	journey_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(journey_overlay)
	var dim := ColorRect.new()
	dim.color = Color("090d0c", 0.9)
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	journey_overlay.add_child(dim)
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 18)
	margin.add_theme_constant_override("margin_top", 42)
	margin.add_theme_constant_override("margin_right", 18)
	margin.add_theme_constant_override("margin_bottom", 42)
	journey_overlay.add_child(margin)
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _panel_style(Color("151d1a", 0.99), Color("d8b565"), 3))
	margin.add_child(panel)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 10)
	panel.add_child(box)
	journey_title = _label("旅途抉擇", 29, Color("ffe09a"))
	journey_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(journey_title)
	journey_detail = _label("據點已突破。下一段旅程，要往哪裡走？", 15, Color("d8e0d8"))
	journey_detail.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	journey_detail.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(journey_detail)
	for route_id: String in CombatModel.JOURNEY_ROUTES:
		var definition: Dictionary = CombatModel.JOURNEY_ROUTES[route_id]
		var color: Color = {"mountain": Color("485044"), "village": Color("654b35"), "battlefield": Color("4e4258")}[route_id]
		var button := _button("%s\n%s" % [String(definition.name), String(definition.effect)], color, 88)
		button.add_theme_font_size_override("font_size", 14)
		button.tooltip_text = String(definition.intro)
		button.pressed.connect(_choose_journey_route.bind(route_id))
		box.add_child(button)
		journey_buttons[route_id] = button

func _build_boss_reward_overlay() -> void:
	boss_reward_overlay = Control.new()
	boss_reward_overlay.visible = false
	boss_reward_overlay.z_index = 70
	boss_reward_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	boss_reward_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(boss_reward_overlay)
	var dim := ColorRect.new()
	dim.color = Color("090d0c", 0.92)
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	boss_reward_overlay.add_child(dim)
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side: String in ["left", "right"]:
		margin.add_theme_constant_override("margin_%s" % side, 18)
	margin.add_theme_constant_override("margin_top", 54)
	margin.add_theme_constant_override("margin_bottom", 54)
	boss_reward_overlay.add_child(margin)
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _panel_style(Color("171d1a", 0.99), Color("e1b85e"), 3))
	margin.add_child(panel)
	boss_reward_box = VBoxContainer.new()
	boss_reward_box.add_theme_constant_override("separation", 10)
	panel.add_child(boss_reward_box)

func _build_failure_overlay() -> void:
	failure_overlay = Control.new()
	failure_overlay.visible = false
	failure_overlay.z_index = 65
	failure_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	failure_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(failure_overlay)
	var dim := ColorRect.new()
	dim.color = Color("090d0c", 0.86)
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	failure_overlay.add_child(dim)
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side: String in ["left", "right"]:
		margin.add_theme_constant_override("margin_%s" % side, 20)
	margin.add_theme_constant_override("margin_top", 86)
	margin.add_theme_constant_override("margin_bottom", 86)
	failure_overlay.add_child(margin)
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _panel_style(Color("17211e", 0.99), Color("c98d4e"), 3))
	margin.add_child(panel)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 10)
	panel.add_child(box)
	var title := _label("突破情報", 26, Color("ffd487"))
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(title)
	failure_detail = _label("", 15, Color("e6e0d4"))
	failure_detail.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(failure_detail)
	var links := HBoxContainer.new()
	links.add_theme_constant_override("separation", 6)
	box.add_child(links)
	for page: String in ["character", "equipment"]:
		var button := _button("流派" if page == "character" else "裝備", Color("4d5d54"), 46)
		button.pressed.connect(_open_failure_target.bind(page))
		links.add_child(button)
	var retry := _button("再次挑戰", Color("873f35"), 46)
	retry.pressed.connect(_retry_from_failure)
	links.add_child(retry)
	var close := _button("收合情報", Color("39463f"), 44)
	close.pressed.connect(_close_failure_report)
	box.add_child(close)

func _switch_page(page: String) -> void:
	if not PAGE_NAMES.has(page):
		return
	current_page = page
	accumulator = 0.0
	var combat_visible := page == "combat"
	top_panel.visible = combat_visible
	combat_panel.visible = combat_visible
	if not combat_visible:
		toast_panel.visible = false
	section_overlay.visible = not combat_visible
	if not combat_visible:
		_render_section(page)
	_refresh_navigation()
	(nav_buttons[page] as Button).grab_focus()
	if combat_visible:
		call_deferred("_play_pending_style_formation")

func _render_section(page: String, reset_scroll := true) -> void:
	var previous_scroll := section_scroll.scroll_vertical
	for child: Node in section_box.get_children():
		section_box.remove_child(child)
		child.queue_free()
	var snapshot := model.snapshot()
	if reset_scroll:
		section_scroll.scroll_vertical = 0
	section_box.add_child(_label(String(PAGE_NAMES[page]), 27, Color("ffe09a")))
	match page:
		"character": _render_character_page(snapshot)
		"skills": _render_skills_page(snapshot)
		"equipment": _render_equipment_page(snapshot)
		"shop": _render_shop_page()
	if not reset_scroll:
		call_deferred("_restore_section_scroll", previous_scroll)

func _restore_section_scroll(value: int) -> void:
	if is_instance_valid(section_scroll):
		section_scroll.scroll_vertical = value

func _render_character_page(snapshot: Dictionary) -> void:
	section_box.add_child(_label("無名小兵 · 擊倒 %d" % int(snapshot.kills), 17, Color("d8e0d8")))
	var resources := HBoxContainer.new()
	resources.add_theme_constant_override("separation", 8)
	section_box.add_child(resources)
	resources.add_child(_resource_card("HP  %d/%d" % [roundi(snapshot.hero_hp), roundi(snapshot.hero_max_hp)], float(snapshot.hero_hp), float(snapshot.hero_max_hp), Color("b85245")))
	resources.add_child(_resource_card("MP  %d/%d" % [roundi(snapshot.hero_mp), roundi(snapshot.hero_max_mp)], float(snapshot.hero_mp), maxf(1.0, float(snapshot.hero_max_mp)), Color("477d91")))
	section_box.add_child(_label("戰鬥數值", 17, Color("f6d27d")))
	section_box.add_child(_section_row("基礎戰力", "攻擊 %d · 防禦 %d · 普攻 %.2fs" % [roundi(snapshot.attack), roundi(snapshot.defense), float(snapshot.attack_interval)]))
	section_box.add_child(_section_row("行動效率", "攻速 +%d%% · 移速 +%d%%" % [roundi(float(snapshot.attack_speed_bonus) * 100.0), roundi(float(snapshot.move_speed_bonus) * 100.0)]))
	section_box.add_child(_section_row("命中收益", "暴擊 %d%% · 閃避 %d%%" % [roundi(float(snapshot.critical_chance) * 100.0), roundi(float(snapshot.dodge_chance) * 100.0)]))
	section_box.add_child(_label("六種流派 · %d 點修練可用" % int(snapshot.style_points), 17, Color("f6d27d")))
	var base_levels: Dictionary = snapshot.base_style_levels
	var equipment_bonuses: Dictionary = snapshot.equipment_style_bonuses
	var effective_levels: Dictionary = snapshot.effective_style_levels
	for track: String in CombatModel.TRAINING_ORDER:
		var definition: Dictionary = CombatModel.TRAINING_DEFS[track]
		var level_text := "Base %d" % int(base_levels[track])
		if int(equipment_bonuses[track]) > 0:
			level_text += " + 裝備 %d = 有效 %d" % [int(equipment_bonuses[track]), int(effective_levels[track])]
		section_box.add_child(_section_row("%s｜%s" % [String(definition.name), String(definition.style)], "%s · %s" % [level_text, model.training_hint(track)]))
	var training_link := _button("前往流派修練", Color("685737"), 46)
	training_link.pressed.connect(_open_training)
	section_box.add_child(training_link)
	var reduce_motion_toggle := CheckButton.new()
	reduce_motion_toggle.text = "減少戰場震動"
	reduce_motion_toggle.button_pressed = battlefield.reduced_motion
	reduce_motion_toggle.toggled.connect(func(value: bool) -> void: battlefield.reduced_motion = value)
	section_box.add_child(reduce_motion_toggle)

func _render_skills_page(snapshot: Dictionary) -> void:
	_render_skill_tabs()
	_render_skill_level_summary(snapshot)
	var slots: Array = snapshot.auto_skill_slots
	if current_skill_tab == "auto":
		_render_auto_setup(slots)
		return
	var definition: Dictionary = CombatModel.TRAINING_DEFS[current_skill_tab]
	section_box.add_child(_label("%s｜%s" % [String(definition.name), String(definition.style)], 20, _track_color(current_skill_tab)))
	var skill_level_text := "Base Lv.%d｜裝備 +%d｜目前加總 Lv.%d" % [
		int(snapshot.base_style_levels[current_skill_tab]),
		int(snapshot.equipment_style_bonuses[current_skill_tab]),
		int(snapshot.effective_style_levels[current_skill_tab]),
	]
	section_box.add_child(_label("%s｜%s" % [skill_level_text, String(definition.special)], 14, Color("cbd5cc")))
	if current_skill_tab == "command":
		_render_command_allies(snapshot)
	_render_signature_tree(current_skill_tab, snapshot)
	_render_major_milestone_choices(current_skill_tab, snapshot)
	_render_track_skills(current_skill_tab, "可編成招式與被動", slots)
	if current_skill_tab != "magic":
		_render_branch_choices(current_skill_tab, snapshot)
		_render_track_milestones(current_skill_tab, snapshot)
	else:
		_render_magic_choices(snapshot)
		_render_magic_milestones(snapshot)

func _render_skill_level_summary(snapshot: Dictionary) -> void:
	var base_total := 0
	var equipment_total := 0
	var effective_total := 0
	for track: String in CombatModel.TRAINING_ORDER:
		base_total += int(snapshot.base_style_levels[track])
		equipment_total += int(snapshot.equipment_style_bonuses[track])
		effective_total += int(snapshot.effective_style_levels[track])
	section_box.add_child(_section_row(
		"目前流派加總｜Lv.%d" % effective_total,
		"Base %d + 裝備 %d = 有效 %d｜技能解鎖看有效等級" % [base_total, equipment_total, effective_total]
	))

func _render_skill_tabs() -> void:
	skill_tab_buttons.clear()
	var grid := GridContainer.new()
	grid.columns = 4
	grid.add_theme_constant_override("h_separation", 5)
	grid.add_theme_constant_override("v_separation", 5)
	section_box.add_child(grid)
	var tabs := {"auto": "編成", "martial": "武藝", "physique": "體術", "agility": "敏捷", "magic": "魔法", "faith": "信仰", "command": "統御"}
	for tab_id: String in tabs:
		var active := tab_id == current_skill_tab
		var button := _button("● %s" % String(tabs[tab_id]) if active else String(tabs[tab_id]), _track_color(tab_id) if active else Color("354039"), 44)
		button.add_theme_font_size_override("font_size", 14)
		button.tooltip_text = "%s分頁%s" % [String(tabs[tab_id]), "｜目前顯示" if active else ""]
		button.pressed.connect(_select_skill_tab.bind(tab_id))
		grid.add_child(button)
		skill_tab_buttons[tab_id] = button

func _render_auto_setup(slots: Array) -> void:
	section_box.add_child(_label("基礎劍技", 18, Color("f1d590")))
	var base_row := HBoxContainer.new()
	base_row.add_theme_constant_override("separation", 6)
	section_box.add_child(base_row)
	var base_card := _section_row(model.skill_display_name("heavy_strike"), model.base_skill_description("heavy_strike"))
	base_card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	base_row.add_child(base_card)
	if not slots.has("heavy_strike"):
		var equip_base := _button("裝備", Color("71552f"), 44)
		equip_base.disabled = not slots.has("")
		equip_base.pressed.connect(_equip_auto_skill.bind("heavy_strike"))
		base_row.add_child(equip_base)
	section_box.add_child(_label("由 1 → 5 判斷；每次施放第一個符合條件的技能。", 14, Color("cbd5cc")))
	for index in CombatModel.AUTO_SLOT_COUNT:
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 5)
		section_box.add_child(row)
		var skill_id := String(slots[index])
		var title := "%d  空槽" % (index + 1)
		var detail := "不參與 AUTO 判斷"
		if not skill_id.is_empty():
			var definition: Dictionary = CombatModel.SKILL_DEFS[skill_id]
			title = "%d  %s" % [index + 1, model.skill_display_name(skill_id)]
			detail = "%s｜戰術：%s" % [String(definition.condition), model.auto_tactic_label(skill_id)]
		var card := _section_row(title, detail)
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(card)
		for action: String in ["↑", "↓", "卸"]:
			var button := _button(action, Color("45534a"), 44)
			button.custom_minimum_size.x = 42
			button.size_flags_horizontal = Control.SIZE_SHRINK_END
			button.disabled = skill_id.is_empty() or (action == "↑" and index == 0) or (action == "↓" and index == CombatModel.AUTO_SLOT_COUNT - 1)
			if action == "卸":
				button.pressed.connect(_remove_auto_slot.bind(index))
			else:
				button.pressed.connect(_move_auto_slot.bind(index, -1 if action == "↑" else 1))
			row.add_child(button)
		if not skill_id.is_empty() and CombatModel.AUTO_TACTIC_DEFS.has(skill_id):
			var tactic_button := _button("戰術\n%s" % model.auto_tactic_label(skill_id), Color("5a4930"), 44)
			tactic_button.custom_minimum_size.x = 82
			tactic_button.tooltip_text = model.auto_tactic_description(skill_id)
			tactic_button.pressed.connect(_cycle_auto_tactic.bind(skill_id))
			row.add_child(tactic_button)
	var grace_unlocked := model.skill_is_unlocked("grace")
	var grace_card := _section_row("被動戰術｜恩典治療", model.auto_tactic_description("grace_heal") if grace_unlocked else "信仰 Lv.20 解鎖")
	section_box.add_child(grace_card)
	var grace_button := _button(model.auto_tactic_label("grace_heal"), Color("6b6335"), 44)
	grace_button.disabled = not grace_unlocked
	grace_button.pressed.connect(_cycle_auto_tactic.bind("grace_heal"))
	section_box.add_child(grace_button)
	section_box.add_child(_label("到各流派分頁選擇要裝入的主動技能。", 13, Color("9fb0a5")))

func _render_command_allies(snapshot: Dictionary) -> void:
	section_box.add_child(_label("友軍入隊", 18, Color("bfe3c7")))
	section_box.add_child(_label("友軍不是技能召喚；統御達到指定等級後會永久入隊。", 13, Color("cbd5cc")))
	var level := int(snapshot.training.command)
	for ally_id: String in CombatModel.ALLY_DEFS:
		var ally: Dictionary = CombatModel.ALLY_DEFS[ally_id]
		var unlock_level := int(ally.unlock_level)
		var joined := level >= unlock_level
		var status := "已入隊 · 會自動參戰" if joined else "Lv.%d 入隊" % unlock_level
		var marker := "●" if joined else "○"
		section_box.add_child(_section_row("%s %s" % [marker, String(ally.name)], "%s｜%s" % [status, String(ally.role)]))

func _render_signature_tree(track: String, snapshot: Dictionary) -> void:
	section_box.add_child(_label("流派劍技樹", 19, _track_color(track).lightened(0.35)))
	var explanation := _label("修練點提高主幹等級，重大劍技會自動解鎖；主動技仍由 AUTO 欄決定是否編成。", 13, Color("cbd5cc"))
	explanation.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	section_box.add_child(explanation)
	var base_level := int(snapshot.base_style_levels[track])
	var effective_level := int(snapshot.effective_style_levels[track])
	var next_found := false
	for node: Dictionary in SIGNATURE_TREE[track]:
		var target := int(node.level)
		var unlocked := effective_level >= target
		var is_next := not unlocked and not next_found
		if is_next:
			next_found = true
		var state := "未解鎖"
		if unlocked:
			state = "裝備支撐" if base_level < target else "已掌握"
			if CombatModel.MAJOR_MILESTONES.has(target):
				var chosen := model.milestone_choice_definition(track, target)
				state += "・%s" % String(chosen.get("name", "未選擇"))
		elif is_next:
			state = "下一個目標"
		var card := PanelContainer.new()
		card.mouse_filter = Control.MOUSE_FILTER_IGNORE
		card.name = "Signature_%s_%d" % [track, target]
		var fill := _track_color(track).darkened(0.42) if unlocked else (Color("493b27") if is_next else Color("232a26"))
		var border := _track_color(track).lightened(0.35) if unlocked else (Color("e5bd65") if is_next else Color("59645d"))
		card.add_theme_stylebox_override("panel", _panel_style(fill, border, 2 if unlocked or is_next else 1))
		var content := VBoxContainer.new()
		content.add_theme_constant_override("separation", 3)
		card.add_child(content)
		content.add_child(_label("Lv.%d｜%s" % [target, String(node.name)], 15, Color("fff0c7") if is_next else Color("f4eee0")))
		var detail := _label("%s｜%s" % [state, String(node.description)], 12, Color("e6c676") if is_next else Color("aebfb4"))
		detail.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		content.add_child(detail)
		section_box.add_child(card)
		if target < 200:
			var connector := _label("↓", 14, border)
			connector.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
			section_box.add_child(connector)

func _render_track_skills(track: String, heading: String, slots: Array) -> void:
	var heading_color := _track_color(track).lightened(0.35)
	section_box.add_child(_label(heading, 18, heading_color))
	var skill_ids: Array[String] = []
	for skill_id: String in CombatModel.SKILL_DEFS:
		var definition: Dictionary = CombatModel.SKILL_DEFS[skill_id]
		if String(definition.track) == track:
			skill_ids.append(skill_id)
	skill_ids.sort_custom(func(left: String, right: String) -> bool: return int(CombatModel.SKILL_DEFS[left].level) < int(CombatModel.SKILL_DEFS[right].level))
	for skill_id: String in skill_ids:
		var definition: Dictionary = CombatModel.SKILL_DEFS[skill_id]
		var type_text := "被動" if String(definition.type) == "passive" else ("奧義" if String(definition.type) == "ultimate" else "主動")
		var status := "%s · Lv.%d" % [type_text, int(definition.level)]
		if model.skill_is_unlocked(skill_id):
			status += " · 裝備支撐" if model.skill_is_equipment_supported(skill_id) else " · 已解鎖"
		else:
			status += " 解鎖"
		var skill_row := HBoxContainer.new()
		skill_row.add_theme_constant_override("separation", 6)
		section_box.add_child(skill_row)
		var skill_card := _section_row(model.skill_display_name(skill_id), "%s｜%s｜%s" % [status, String(definition.condition), model.skill_power_hint(skill_id)])
		skill_card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		skill_row.add_child(skill_card)
		if String(definition.type) == "active" or (String(definition.type) == "ultimate" and not bool(definition.get("reactive", false))):
			var equip := _button("裝備", Color("71552f"), 44)
			equip.custom_minimum_size.x = 58
			equip.size_flags_horizontal = Control.SIZE_SHRINK_END
			equip.disabled = not model.skill_is_unlocked(skill_id) or slots.has(skill_id) or not slots.has("")
			equip.pressed.connect(_equip_auto_skill.bind(skill_id))
			skill_row.add_child(equip)

func _render_major_milestone_choices(track: String, snapshot: Dictionary) -> void:
	var effective_level := int(snapshot.effective_style_levels[track])
	section_box.add_child(_label("重大劍技選擇", 18, _track_color(track).lightened(0.35)))
	var tabs := HBoxContainer.new()
	tabs.add_theme_constant_override("separation", 4)
	section_box.add_child(tabs)
	for level: int in CombatModel.MAJOR_MILESTONES:
		var unlocked := effective_level >= level
		var active := current_major_milestone == level
		var tab := _button("Lv.%d" % level, _track_color(track).darkened(0.3) if active else Color("303a34"), 44)
		tab.name = "MilestoneTab_%s_%d" % [track, level]
		tab.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		tab.tooltip_text = "已解鎖" if unlocked else "有效等級 Lv.%d 解鎖" % level
		tab.pressed.connect(_select_major_milestone_tab.bind(level))
		tabs.add_child(tab)
	var level := current_major_milestone
	var choices: Dictionary = CombatModel.MILESTONE_CHOICES[track][level]
	var selected := model.milestone_choice(track, level)
	var selected_name := String(choices[selected].name) if effective_level >= level else "尚未解鎖"
	section_box.add_child(_label("Lv.%d｜目前：%s｜可自由切換測試" % [level, selected_name], 14, Color("cbd5cc")))
	for choice_id: String in choices:
		var choice: Dictionary = choices[choice_id]
		var card := PanelContainer.new()
		card.name = "MilestoneChoice_%s_%d_%s" % [track, level, choice_id]
		var selected_choice := choice_id == selected and effective_level >= level
		card.add_theme_stylebox_override("panel", _panel_style(Color("29352f") if selected_choice else Color("222925"), _track_color(track).lightened(0.2) if selected_choice else Color("59645d"), 2 if selected_choice else 1))
		var content := VBoxContainer.new()
		content.add_theme_constant_override("separation", 5)
		card.add_child(content)
		content.add_child(_label("%s｜%s型" % [String(choice.name), "爆發" if String(choice.get("mode", "impact")) == "impact" else "循環"], 16, Color("fff0c7") if selected_choice else Color("f4eee0")))
		var detail := _label(String(choice.description), 13, Color("b7c7bd"))
		detail.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		content.add_child(detail)
		var button_text := "Lv.%d 解鎖" % level if effective_level < level else ("使用中" if selected_choice else "選擇這條劍路")
		var choose := _button(button_text, _track_color(track).darkened(0.35), 46)
		choose.disabled = effective_level < level or selected_choice
		choose.pressed.connect(_select_milestone_choice.bind(track, level, choice_id))
		content.add_child(choose)
		section_box.add_child(card)

func _render_branch_choices(track: String, snapshot: Dictionary) -> void:
	var branches: Dictionary = {
		"martial": CombatModel.MARTIAL_BRANCHES, "physique": CombatModel.PHYSIQUE_BRANCHES,
		"agility": CombatModel.AGILITY_BRANCHES, "faith": CombatModel.FAITH_BRANCHES,
		"command": CombatModel.COMMAND_BRANCHES,
	}[track]
	var branch_id := String(snapshot.get("%s_branch" % track, ""))
	var level := int(snapshot.training[track])
	var style_name := String(CombatModel.TRAINING_DEFS[track].style)
	var style_color := _track_color(track).lightened(0.35)
	section_box.add_child(_label("Lv.150 %s分支" % style_name, 18, style_color))
	var branch_name := "尚未選擇"
	if branches.has(branch_id):
		branch_name = String(branches[branch_id].name)
	section_box.add_child(_label("目前：%s｜可隨時切換測試" % branch_name, 14, Color("cbd5cc")))
	for choice_id: String in branches:
		var branch: Dictionary = branches[choice_id]
		var branch_row := HBoxContainer.new()
		branch_row.add_theme_constant_override("separation", 6)
		section_box.add_child(branch_row)
		var branch_card := _section_row(String(branch.name), String(branch.description))
		branch_card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		branch_row.add_child(branch_card)
		var choose := _button("使用中" if choice_id == branch_id else "選擇", Color("71552f"), 44)
		choose.custom_minimum_size.x = 64
		choose.size_flags_horizontal = Control.SIZE_SHRINK_END
		choose.disabled = level < 150 or choice_id == branch_id
		if track == "martial":
			choose.pressed.connect(_select_martial_branch.bind(choice_id))
		elif track == "physique":
			choose.pressed.connect(_select_physique_branch.bind(choice_id))
		elif track == "agility":
			choose.pressed.connect(_select_agility_branch.bind(choice_id))
		elif track == "faith":
			choose.pressed.connect(_select_faith_branch.bind(choice_id))
		else:
			choose.pressed.connect(_select_command_branch.bind(choice_id))
		branch_row.add_child(choose)

func _render_magic_choices(snapshot: Dictionary) -> void:
	section_box.add_child(_label("Lv.70 第二元素", 18, Color("9fdcff")))
	section_box.add_child(_label("目前：%s｜可隨時切換" % _magic_choice_name(CombatModel.MAGIC_SECONDARIES, String(snapshot.secondary_element)), 14, Color("cbd5cc")))
	for choice_id: String in CombatModel.MAGIC_SECONDARIES:
		var choice: Dictionary = CombatModel.MAGIC_SECONDARIES[choice_id]
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 6)
		section_box.add_child(row)
		var card := _section_row(String(choice.name), String(choice.description))
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(card)
		var button := _button("使用中" if choice_id == String(snapshot.secondary_element) else "選擇", Color("3d6170"), 44)
		button.custom_minimum_size.x = 64
		button.disabled = int(snapshot.training.magic) < 70 or choice_id == String(snapshot.secondary_element)
		button.pressed.connect(_select_secondary_element.bind(choice_id))
		row.add_child(button)
	section_box.add_child(_label("Lv.150 元素專精", 18, Color("ffc28f")))
	section_box.add_child(_label("目前：%s｜可隨時切換" % _magic_choice_name(CombatModel.MAGIC_SPECIALIZATIONS, String(snapshot.magic_specialization)), 14, Color("cbd5cc")))
	for choice_id: String in CombatModel.MAGIC_SPECIALIZATIONS:
		var choice: Dictionary = CombatModel.MAGIC_SPECIALIZATIONS[choice_id]
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 6)
		section_box.add_child(row)
		var card := _section_row(String(choice.name), String(choice.description))
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(card)
		var button := _button("使用中" if choice_id == String(snapshot.magic_specialization) else "選擇", Color("71482f"), 44)
		button.custom_minimum_size.x = 64
		button.disabled = int(snapshot.training.magic) < 150 or choice_id == String(snapshot.magic_specialization)
		button.pressed.connect(_select_magic_specialization.bind(choice_id))
		row.add_child(button)

func _render_magic_milestones(snapshot: Dictionary) -> void:
	section_box.add_child(_label("成長路線", 18, Color("ffc28f")))
	var base_level := int(snapshot.base_style_levels.magic)
	var effective_level := int(snapshot.effective_style_levels.magic)
	for level: int in CombatModel.MAGIC_MILESTONES:
		if level in [55, 105, 155]:
			section_box.add_child(_label(_route_stage_name(level), 15, Color("d6c5a2")))
		var milestone: Dictionary = CombatModel.MAGIC_MILESTONES[level]
		var unlocked := effective_level >= level
		var marker := "◆" if level in [100, 150, 200] else ("●" if unlocked else "○")
		var state := ("裝備支撐" if base_level < level else "已取得") if unlocked else "未解鎖"
		section_box.add_child(_section_row("%s Lv.%d｜%s" % [marker, level, String(milestone.name)], "%s · %s" % [state, String(milestone.description)]))

func _render_track_milestones(track: String, snapshot: Dictionary) -> void:
	var table: Dictionary = {
		"martial": CombatModel.MARTIAL_MILESTONES,
		"physique": CombatModel.PHYSIQUE_MILESTONES,
		"agility": CombatModel.AGILITY_MILESTONES,
		"faith": CombatModel.FAITH_MILESTONES,
		"command": CombatModel.COMMAND_MILESTONES,
	}[track]
	var base_level := int(snapshot.base_style_levels[track])
	var level := int(snapshot.effective_style_levels[track])
	var style_name := String(CombatModel.TRAINING_DEFS[track].style)
	var color := _track_color(track).lightened(0.35)
	section_box.add_child(_label("詳細修練節點｜%s" % style_name, 18, color))
	for target: int in table:
		if target in [5, 55, 105, 155]:
			section_box.add_child(_label(_route_stage_name(target), 15, Color("d6c5a2")))
		var milestone: Dictionary = table[target]
		var unlocked := level >= target
		var marker := "◆" if target in [50, 100, 150, 200] else ("●" if unlocked else "○")
		var state := ("裝備支撐" if base_level < target else "已取得") if unlocked else "未解鎖"
		section_box.add_child(_section_row("%s Lv.%d｜%s" % [marker, target, String(milestone.name)], "%s · %s" % [state, String(milestone.description)]))

func _route_stage_name(level: int) -> String:
	if level <= 50: return "I｜Lv.1～50 · 流派成形"
	if level <= 100: return "II｜Lv.51～100 · 機制深化"
	if level <= 150: return "III｜Lv.101～150 · 高階專精"
	return "IV｜Lv.151～200 · 純流極境"

func _track_color(track: String) -> Color:
	return {
		"auto": Color("8a6b39"), "martial": Color("8a6835"), "physique": Color("47717a"),
		"agility": Color("64558c"), "magic": Color("8a5135"), "faith": Color("77745a"), "command": Color("5b665e"),
	}.get(track, Color("53675b"))

func _magic_choice_name(choices: Dictionary, choice_id: String) -> String:
	return String(choices[choice_id].name) if choices.has(choice_id) else "尚未選擇"

func _render_equipment_page(snapshot: Dictionary) -> void:
	var equipment_intro := _label("欄位決定穿戴，背包用來挑選。裝備提高有效流派等級，可直接支撐技能解鎖。", 14, Color("cbd5cc"))
	equipment_intro.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	section_box.add_child(equipment_intro)
	section_box.add_child(_section_row("持有金幣", "%d" % int(snapshot.gold)))
	section_box.add_child(_label("裝備欄位", 18, Color("f6d27d")))
	var slots := HBoxContainer.new()
	slots.add_theme_constant_override("separation", 6)
	section_box.add_child(slots)
	for slot: String in CombatModel.EQUIPMENT_SLOT_NAMES:
		var equipped_id := String(snapshot.equipped_items[slot])
		var item_name := "空欄位" if equipped_id.is_empty() else String(CombatModel.EQUIPMENT_DEFS[equipped_id].name)
		var enhancement := 0 if equipped_id.is_empty() else int(snapshot.equipment_enhancements[equipped_id])
		var selected := slot == selected_equipment_slot
		var button := _button("%s\n%s%s" % [String(CombatModel.EQUIPMENT_SLOT_NAMES[slot]), item_name, " +%d" % enhancement if enhancement > 0 else ""], Color("6a5635") if selected else Color("34433c"), 60)
		button.add_theme_font_size_override("font_size", 13)
		button.pressed.connect(_select_equipment_slot.bind(slot))
		slots.add_child(button)
	_ensure_equipment_selection(snapshot)
	_render_equipment_detail(snapshot)
	section_box.add_child(_label("背包", 18, Color("f6d27d")))
	var owned_ids := _owned_equipment_ids_for_slot(snapshot, selected_equipment_slot)
	var total_owned := 0
	for item_id: String in CombatModel.EQUIPMENT_DEFS:
		if int(snapshot.owned_equipment.get(item_id, 0)) > 0:
			total_owned += 1
	section_box.add_child(_label("已取得 %d / %d｜目前顯示%s" % [total_owned, CombatModel.EQUIPMENT_DEFS.size(), String(CombatModel.EQUIPMENT_SLOT_NAMES[selected_equipment_slot])], 13, Color("aebfb4")))
	if owned_ids.is_empty():
		section_box.add_child(_section_row("尚無裝備", "擊敗敵人或從商店取得"))
		return
	var grid := GridContainer.new()
	grid.columns = 2
	grid.add_theme_constant_override("h_separation", 6)
	grid.add_theme_constant_override("v_separation", 6)
	section_box.add_child(grid)
	for item_id: String in owned_ids:
		var item: Dictionary = CombatModel.EQUIPMENT_DEFS[item_id]
		var enhancement := int(snapshot.equipment_enhancements.get(item_id, 0))
		var equipped := String(snapshot.equipped_items[selected_equipment_slot]) == item_id
		var selected := selected_equipment_id == item_id
		var state := "裝備中" if equipped else String(CombatModel.EQUIPMENT_QUALITY_NAMES[String(item.get("quality", "common"))])
		var button := _button("%s%s\n%s" % [String(item.name), " +%d" % enhancement if enhancement > 0 else "", state], Color("665437") if selected else Color("2d3b35"), 64)
		button.add_theme_font_size_override("font_size", 13)
		button.pressed.connect(_select_equipment_item.bind(item_id))
		grid.add_child(button)

func _ensure_equipment_selection(snapshot: Dictionary) -> void:
	if selected_equipment_slot not in CombatModel.EQUIPMENT_SLOT_NAMES:
		selected_equipment_slot = "weapon"
	if CombatModel.EQUIPMENT_DEFS.has(selected_equipment_id) and String(CombatModel.EQUIPMENT_DEFS[selected_equipment_id].slot) == selected_equipment_slot and int(snapshot.owned_equipment.get(selected_equipment_id, 0)) > 0:
		return
	selected_equipment_id = String(snapshot.equipped_items[selected_equipment_slot])
	if selected_equipment_id.is_empty():
		var owned_ids := _owned_equipment_ids_for_slot(snapshot, selected_equipment_slot)
		selected_equipment_id = "" if owned_ids.is_empty() else String(owned_ids[0])

func _owned_equipment_ids_for_slot(snapshot: Dictionary, slot: String) -> Array[String]:
	var result: Array[String] = []
	for item_id: String in CombatModel.EQUIPMENT_DEFS:
		if String(CombatModel.EQUIPMENT_DEFS[item_id].slot) == slot and int(snapshot.owned_equipment.get(item_id, 0)) > 0:
			result.append(item_id)
	return result

func _render_equipment_detail(snapshot: Dictionary) -> void:
	var panel := PanelContainer.new()
	panel.name = "EquipmentDetail"
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_theme_stylebox_override("panel", _panel_style(Color("1f2b27"), Color("b78b48"), 2))
	section_box.add_child(panel)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 6)
	panel.add_child(box)
	if selected_equipment_id.is_empty():
		box.add_child(_label("這個欄位還沒有裝備", 16, Color("d8e0d8")))
		return
	var item: Dictionary = CombatModel.EQUIPMENT_DEFS[selected_equipment_id]
	var enhancement := int(snapshot.equipment_enhancements.get(selected_equipment_id, 0))
	var quality := String(item.get("quality", "common"))
	var equipped := String(snapshot.equipped_items[selected_equipment_slot]) == selected_equipment_id
	box.add_child(_label("%s%s｜%s" % [String(item.name), " +%d" % enhancement if enhancement > 0 else "", "裝備中" if equipped else String(CombatModel.EQUIPMENT_QUALITY_NAMES[quality])], 18, _equipment_quality_color(quality)))
	var details := _label("%s\n%s" % [_equipment_style_text(item, enhancement), String(item.description)], 13, Color("cbd5cc"))
	details.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(details)
	var equipped_id := String(snapshot.equipped_items[selected_equipment_slot])
	if not equipped and not equipped_id.is_empty():
		var current: Dictionary = CombatModel.EQUIPMENT_DEFS[equipped_id]
		box.add_child(_label("比較目前：%s → %s" % [_equipment_style_text(current, int(snapshot.equipment_enhancements[equipped_id])), _equipment_style_text(item, enhancement)], 12, Color("aebfb4")))
	var actions := HBoxContainer.new()
	actions.add_theme_constant_override("separation", 6)
	box.add_child(actions)
	var equip_button := _button("裝備中" if equipped else "穿上", Color("4f6657") if equipped else Color("76592f"), 46)
	equip_button.disabled = equipped
	equip_button.pressed.connect(_equip_item.bind(selected_equipment_id))
	actions.add_child(equip_button)
	var cost := model.equipment_enhancement_cost(selected_equipment_id)
	var enhance_text := "已達 +5" if cost < 0 else "強化 +%d｜%d 金" % [enhancement + 1, cost]
	var enhance_button := _button(enhance_text, Color("435a65"), 46)
	enhance_button.disabled = cost < 0 or int(snapshot.gold) < cost
	enhance_button.pressed.connect(_enhance_equipment.bind(selected_equipment_id))
	actions.add_child(enhance_button)

func _select_equipment_slot(slot: String) -> void:
	selected_equipment_slot = slot
	selected_equipment_id = ""
	_render_section("equipment", false)

func _select_equipment_item(item_id: String) -> void:
	selected_equipment_id = item_id
	selected_equipment_slot = String(CombatModel.EQUIPMENT_DEFS[item_id].slot)
	_render_section("equipment", false)

func _equipment_style_text(item: Dictionary, enhancement := 0) -> String:
	var parts: Array[String] = []
	var bonuses: Dictionary = item.get("style_bonuses", {})
	for track: String in CombatModel.TRAINING_ORDER:
		var bonus := int(bonuses.get(track, 0))
		if String(item.get("primary_style", "")) == track:
			bonus += enhancement
		if bonus > 0:
			parts.append("%s +%d" % [String(CombatModel.TRAINING_DEFS[track].name), bonus])
	return "、".join(parts)

func _equipment_quality_color(quality: String) -> Color:
	return {
		"common": Color("c8c5ba"), "uncommon": Color("6fbf89"),
		"rare": Color("6fa8df"), "epic": Color("b783d7"),
	}.get(quality, Color("c8c5ba"))

func _equip_item(item_id: String) -> void:
	var previous_levels := _effective_style_levels()
	if not model.equip_item(item_id):
		return
	var item: Dictionary = CombatModel.EQUIPMENT_DEFS[item_id]
	var formed_tracks := _newly_formed_tracks(previous_levels)
	var unlocks := _new_effective_unlock_names(previous_levels)
	var detail := _equipment_style_text(item, model.equipment_enhancement(item_id))
	if not unlocks.is_empty():
		detail = "新解鎖：%s｜已可在技能頁編入 AUTO" % "、".join(unlocks.slice(0, 3))
	_show_toast("已裝備：%s" % String(item.name), detail)
	_update_hud(model.snapshot())
	_queue_style_formation(formed_tracks, true)
	_save_game()

func _enhance_equipment(item_id: String) -> void:
	var previous_levels := _effective_style_levels()
	if not model.enhance_equipment(item_id):
		return
	var item: Dictionary = CombatModel.EQUIPMENT_DEFS[item_id]
	var formed_tracks := _newly_formed_tracks(previous_levels)
	var unlocks := _new_effective_unlock_names(previous_levels)
	var detail := _equipment_style_text(item, model.equipment_enhancement(item_id))
	if not unlocks.is_empty():
		detail = "新解鎖：%s｜裝備加成已立即生效" % "、".join(unlocks.slice(0, 3))
	_show_toast("強化成功：%s +%d" % [String(item.name), model.equipment_enhancement(item_id)], detail)
	_update_hud(model.snapshot())
	_queue_style_formation(formed_tracks, true)
	_save_game()

func _effective_style_levels() -> Dictionary:
	var result := {}
	for track: String in CombatModel.TRAINING_ORDER:
		result[track] = model.effective_style_level(track)
	return result

func _new_effective_unlock_names(previous_levels: Dictionary) -> Array[String]:
	var result: Array[String] = []
	for track: String in CombatModel.TRAINING_ORDER:
		var previous := int(previous_levels.get(track, 0))
		var current := model.effective_style_level(track)
		if previous < 10 and current >= 10:
			result.append(String(CORE_UNLOCK_NAMES[track]))
		for skill_id: String in CombatModel.SKILL_DEFS:
			var definition: Dictionary = CombatModel.SKILL_DEFS[skill_id]
			if String(definition.track) != track or not bool(definition.get("implemented", false)):
				continue
			var required_level := int(definition.level)
			var skill_name := String(definition.name)
			if previous < required_level and current >= required_level and not result.has(skill_name):
				result.append(skill_name)
	return result

func _newly_formed_tracks(previous_levels: Dictionary) -> Array[String]:
	var result: Array[String] = []
	for track: String in CombatModel.TRAINING_ORDER:
		if int(previous_levels.get(track, 0)) < 10 and model.effective_style_level(track) >= 10:
			result.append(track)
	return result

func _queue_style_formation(tracks: Array[String], equipment_supported: bool) -> void:
	for track: String in tracks:
		if not pending_style_formation_tracks.has(track):
			pending_style_formation_tracks.append(track)
	pending_style_formation_equipment = pending_style_formation_equipment or equipment_supported
	if current_page == "combat" and not training_open:
		_play_pending_style_formation()

func _play_pending_style_formation() -> void:
	if pending_style_formation_tracks.is_empty() or current_page != "combat" or training_open:
		return
	var formed_tracks := pending_style_formation_tracks.duplicate()
	var equipment_supported := pending_style_formation_equipment
	pending_style_formation_tracks.clear()
	pending_style_formation_equipment = false
	var names: Array[String] = []
	var cores: Array[String] = []
	for track: String in formed_tracks:
		names.append(String(CombatModel.TRAINING_DEFS[track].style))
		cores.append("%s「%s」" % [String(CombatModel.TRAINING_DEFS[track].style), String(CORE_UNLOCK_NAMES[track])])
	var title := "%s成形" % names[0] if names.size() == 1 else "多流派同時成形"
	var detail := String(CORE_UNLOCK_DESCRIPTIONS[formed_tracks[0]]) if formed_tracks.size() == 1 else "、".join(cores)
	if equipment_supported:
		detail += "｜目前由裝備支撐"
	battlefield.play_events([{"type": "style_formed", "track": formed_tracks[0]}])
	_show_toast(title, detail, 3.0, _track_color(formed_tracks[0]).lightened(0.35), true)

func _render_shop_page() -> void:
	var snapshot := model.snapshot()
	section_box.add_child(_section_row("持有資源", "%d 金幣｜%d 戰魂" % [int(snapshot.gold), int(snapshot.battle_souls)]))
	section_box.add_child(_label("戰地商店", 20, Color("f6d27d")))
	section_box.add_child(_label("每批 3 件商品，至少 1 件符合目前最高 Base 流派。新區域會補貨並重置刷新價格。", 13, Color("cbd5cc")))
	var shop_items: Array = snapshot.shop_items
	if shop_items.is_empty():
		section_box.add_child(_section_row("本批售罄", "刷新商品或前往下一區"))
	for index in shop_items.size():
		var item_id := String(shop_items[index])
		var item: Dictionary = CombatModel.EQUIPMENT_DEFS[item_id]
		var quality := String(item.get("quality", "common"))
		var price := int(CombatModel.EQUIPMENT_QUALITY_COSTS.get(quality, 60))
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 6)
		section_box.add_child(row)
		var card := _section_row("%s｜%s" % [String(item.name), String(CombatModel.EQUIPMENT_QUALITY_NAMES[quality])], "%s｜%d 金" % [_equipment_style_text(item), price])
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(card)
		var buy := _button("購買", Color("685737"), 44)
		buy.custom_minimum_size.x = 64
		buy.size_flags_horizontal = Control.SIZE_SHRINK_END
		buy.disabled = int(snapshot.gold) < price
		buy.pressed.connect(_buy_shop_item.bind(index))
		row.add_child(buy)
	var refresh_cost := int(snapshot.shop_refresh_cost)
	var refresh := _button("刷新商品｜%d 金" % refresh_cost, Color("435a65"), 44)
	refresh.disabled = int(snapshot.gold) < refresh_cost
	refresh.pressed.connect(_refresh_shop)
	section_box.add_child(refresh)

	section_box.add_child(_label("出售裝備", 20, Color("f6d27d")))
	var has_sellable := false
	for item_id: String in CombatModel.EQUIPMENT_DEFS:
		var count := int(snapshot.owned_equipment.get(item_id, 0))
		if count <= 0:
			continue
		has_sellable = true
		var item: Dictionary = CombatModel.EQUIPMENT_DEFS[item_id]
		var quality := String(item.get("quality", "common"))
		var value := maxi(10, int(CombatModel.EQUIPMENT_QUALITY_COSTS.get(quality, 60)) / 2)
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 6)
		section_box.add_child(row)
		var equipped := String(snapshot.equipped_items.get(String(item.slot), "")) == item_id
		var card := _section_row("%s ×%d" % [String(item.name), count], "%s%d 金" % ["裝備中｜出售會卸下｜" if equipped else "", value])
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(card)
		var sell := _button("出售", Color("70452d"), 44)
		sell.custom_minimum_size.x = 64
		sell.size_flags_horizontal = Control.SIZE_SHRINK_END
		sell.pressed.connect(_sell_shop_item.bind(item_id))
		row.add_child(sell)
	if not has_sellable:
		section_box.add_child(_section_row("沒有裝備", "擊敗敵人或從商店購買"))

	section_box.add_child(_label("戰魂傳承", 20, Color("f6d27d")))
	if not bool(snapshot.inheritance_unlocked):
		section_box.add_child(_section_row("尚未解鎖", "擊敗第 30 戰首領後，可以選擇是否重返第 1 戰"))
		return
	section_box.add_child(_label("傳承會回到第 1 戰並重置流派、金幣與強化。收藏永久保留；每次只能選一項遺產。", 13, Color("e2cdb3")))
	section_box.add_child(_label("記憶｜下輪指定 Base 流派 +5", 16, Color("d8e0d8")))
	var memory_grid := GridContainer.new()
	memory_grid.columns = 3
	memory_grid.add_theme_constant_override("h_separation", 5)
	memory_grid.add_theme_constant_override("v_separation", 5)
	section_box.add_child(memory_grid)
	for track: String in CombatModel.TRAINING_ORDER:
		var button := _button(String(CombatModel.TRAINING_DEFS[track].name), _track_color(track), 42)
		button.pressed.connect(_perform_inheritance.bind("memory", track))
		memory_grid.add_child(button)
	section_box.add_child(_label("舊裝｜保留一件裝備，強化歸零", 16, Color("d8e0d8")))
	var equipment_grid := GridContainer.new()
	equipment_grid.columns = 2
	equipment_grid.add_theme_constant_override("h_separation", 5)
	equipment_grid.add_theme_constant_override("v_separation", 5)
	section_box.add_child(equipment_grid)
	for item_id: String in CombatModel.EQUIPMENT_DEFS:
		if int(snapshot.owned_equipment.get(item_id, 0)) <= 0:
			continue
		var button := _button(String(CombatModel.EQUIPMENT_DEFS[item_id].name), Color("4f6657"), 42)
		button.pressed.connect(_perform_inheritance.bind("equipment", item_id))
		equipment_grid.add_child(button)
	section_box.add_child(_label("商路｜下輪指定流派商品權重 ×2", 16, Color("d8e0d8")))
	var trade_grid := GridContainer.new()
	trade_grid.columns = 3
	trade_grid.add_theme_constant_override("h_separation", 5)
	trade_grid.add_theme_constant_override("v_separation", 5)
	section_box.add_child(trade_grid)
	for track: String in CombatModel.TRAINING_ORDER:
		var button := _button(String(CombatModel.TRAINING_DEFS[track].name), _track_color(track), 42)
		button.pressed.connect(_perform_inheritance.bind("trade", track))
		trade_grid.add_child(button)

func _buy_shop_item(index: int) -> void:
	var result := model.buy_shop_item(index)
	if result.is_empty():
		return
	_show_toast("購買：%s" % String(result.name), "花費 %d 金" % int(result.price))
	_render_section("shop")
	_save_game()

func _sell_shop_item(item_id: String) -> void:
	var value := model.sell_equipment(item_id)
	if value <= 0:
		return
	_show_toast("已出售", "%s｜獲得 %d 金" % [String(CombatModel.EQUIPMENT_DEFS[item_id].name), value])
	_render_section("shop")
	_save_game()

func _refresh_shop() -> void:
	if not model.refresh_shop():
		return
	_show_toast("商品已刷新", "下一次刷新需要 %d 金" % model.shop_refresh_cost())
	_render_section("shop")
	_save_game()

func _perform_inheritance(choice: String, target: String) -> void:
	var events := model.perform_inheritance(choice, target)
	if events.is_empty():
		return
	_show_toast("傳承完成", "帶著遺產回到第 1 戰")
	_update_hud(model.snapshot())
	_switch_page("combat")
	_save_game()

func _build_training_overlay() -> void:
	training_overlay = Control.new()
	training_overlay.visible = false
	training_overlay.z_index = 40
	training_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	training_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(training_overlay)
	var dim := ColorRect.new()
	dim.color = Color("08100d", 0.78)
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	training_overlay.add_child(dim)
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side: String in ["left", "right"]:
		margin.add_theme_constant_override("margin_%s" % side, 16)
	margin.add_theme_constant_override("margin_top", 40)
	margin.add_theme_constant_override("margin_bottom", 40)
	training_overlay.add_child(margin)
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _panel_style(Color("17221e", 0.99), Color("d0a553"), 3))
	margin.add_child(panel)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 6)
	panel.add_child(box)
	var heading := HBoxContainer.new()
	box.add_child(heading)
	var title := _label("六種流派", 25, Color("ffe09a"))
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	heading.add_child(title)
	var close := _button("返回", Color("4e5a50"), 44)
	close.custom_minimum_size.x = 72
	close.size_flags_horizontal = Control.SIZE_SHRINK_END
	close.pressed.connect(_close_training)
	heading.add_child(close)
	var explain := _label("六種流派已開放；勢、不動、游刃、魔紋、聖印與軍勢可以同時存在。", 13, Color("cbd5cc"))
	explain.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(explain)
	for track: String in CombatModel.TRAINING_ORDER:
		var row := PanelContainer.new()
		row.add_theme_stylebox_override("panel", _panel_style(Color("202e28"), Color("53675b"), 1))
		box.add_child(row)
		var row_box := HBoxContainer.new()
		row_box.add_theme_constant_override("separation", 6)
		row.add_child(row_box)
		var text_box := VBoxContainer.new()
		text_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row_box.add_child(text_box)
		var definition: Dictionary = CombatModel.TRAINING_DEFS[track]
		text_box.add_child(_label("%s｜%s" % [String(definition.name), String(definition.style)], 16, Color("f4eee0")))
		var hint_label := _label("", 12, Color("aebfb4"))
		hint_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		text_box.add_child(hint_label)
		var level_label := _label("Base 0\n裝備 +0\n有效 0", 12, Color("f6d27d"))
		level_label.custom_minimum_size.x = 72
		level_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		row_box.add_child(level_label)
		var add_button := _button("+", Color("71552f"), 44)
		add_button.custom_minimum_size.x = 46
		add_button.size_flags_horizontal = Control.SIZE_SHRINK_END
		add_button.pressed.connect(func() -> void: _spend_training(track))
		row_box.add_child(add_button)
		training_rows[track] = {"level": level_label, "hint": hint_label, "button": add_button}

func _handle_events(events: Array[Dictionary]) -> void:
	if events.is_empty():
		return
	battlefield.play_events(events)
	if model.tutorial_step == "observe" and events.any(func(event: Dictionary) -> bool: return String(event.type) == "enemy_defeated"):
		_show_training_tutorial()
	for event: Dictionary in events:
		match String(event.type):
			"exploration_approach": _show_toast(String(event.name), String(event.effect), 1.5, Color("e7bd65"))
			"wave_started": _show_toast("第 %d/%d 波" % [int(event.wave), int(event.wave_count)], String(event.enemy))
			"boss_reward_choice":
				journey_pending = true
				_show_toast("黑鐵哨站突破", "選擇一件戰利品，讓流派立即變強")
				get_tree().create_timer(1.1).timeout.connect(_show_boss_reward.bind(event.options))
			"boss_reward_claimed":
				boss_reward_summary = Dictionary(event.summary).duplicate(true)
				_show_toast("獲得：%s" % String(event.name), "已自動裝備，有效流派等級立即更新")
			"journey_choice":
				journey_pending = true
				_show_toast("區域突破", "戰鬥暫歇，決定下一段旅程")
				get_tree().create_timer(1.15).timeout.connect(_show_journey_choice)
			"journey_selected": _show_toast("前往：%s" % String(event.name), String(event.intro))
			"boss_howl": _show_toast(String(event.name), "下一擊：%s" % String(event.next_attack))
			"boss_enraged": _show_toast("首領狂怒", "攻擊速度提高，重擊與必中技更加頻繁")
			"enemy_guard_broken": _show_toast("盾勢瓦解", "後續攻擊將造成完整傷害")
			"unlock": _show_toast("解鎖：%s" % String(event.name), String(event.description))
			"milestone": _show_toast("流派強化：%s" % String(event.name), String(event.description))
			"training_point": _show_toast("獲得 %d 點修練" % int(event.get("gain", 1)), "現在有 %d 點可分配" % int(event.points))
			"equipment_drop": _show_toast("獲得裝備：%s" % String(event.name), "%s｜前往裝備頁查看" % String(CombatModel.EQUIPMENT_QUALITY_NAMES[String(event.quality)]))
			"equipment_duplicate": _show_toast("重複裝備：%s" % String(event.name), "轉換為 %d 金幣" % int(event.gold))
			"momentum_full": _show_toast("勢已滿", "下一次普通攻擊將自動發動勢斬")
			"momentum_slash": _show_toast("蓄勢・一閃", "滿勢化為 280% 一閃，並穿透 15% 護甲")
			"branch_unlocked": _show_toast("解鎖：%s" % String(event.name), String(event.description))
			"ally_joined": _show_toast("友軍入隊：%s" % String(event.name), String(event.description))
			"armor_broken": _show_toast("破甲一閃", "敵方護甲降低 %d" % roundi(float(event.amount)))
			"no_beat": _show_toast("無拍子", "擊殺後額外回復 %d 勢" % roundi(float(event.amount)))
			"draw_stance": _show_toast("拔刀", "蓄勢加速，第一刀降低消耗並提高傷害")
			"mindless": _show_toast("無心", "極勢與一念合一，下一刀全面強化")
			"perfect_block": _show_toast("完美格擋", "減免 %d 傷害並立即反擊" % roundi(float(event.prevented)))
			"heaven_return": _show_toast("奧義・不動返天", "硬接重擊，將敵人的力量反還")
			"immovable_king": _show_toast("不動明王", "連續格擋完成，期間每次格擋必定返刃")
			"shadowless": _show_toast("無影", "六秒內攻速與影襲大幅提升")
			"shadowless_extreme": _show_toast("奧義・無影極境", "影襲連攜完整展開")
			"flow_state_entered": _show_toast("游刃有餘", "快劍節奏啟動 · 疾斬開始運作")
			"traceless": _show_toast("無蹤", "消耗滿層游刃，閃開原本會命中的攻擊")
			"blazing_magic_entered": _show_toast("魔紋已滿", "下一次附魔攻擊將觸發魔力斬")
			"scorching_entered": _show_toast("燃燒已滿", "炎爆斬的爆發條件已成立")
			"flame_burst_slash": _show_toast("炎爆斬", "消耗魔紋與燃燒，造成元素爆發")
			"magic_sword_release": _show_toast("魔劍解放", "八秒內魔紋、燃燒與魔劍傷害全面加速")
			"elemental_resonance": _show_toast(String(event.name), "元素共鳴觸發，返還魔紋並強化循環")
			"minor_resonance": _show_toast("小型共鳴", "專精元素滿層，自動釋放元素力量")
			"elemental_boundary_slash": _show_toast("元素斷界斬", "%s元素效果已釋放" % {"fire": "火", "ice": "冰", "lightning": "雷"}.get(String(event.element), "火"))
			"elemental_fusion": _show_toast("雙元素融合", "六秒內追加副元素附魔")
			"magic_sword_manifestation": _show_toast("魔劍顯現", "滿魔紋與元素異常使魔劍進入高階狀態")
			"magic_sword_complete_release": _show_toast("奧義・魔劍完全解放", "劍、魔力與元素完全融合")
			"holy_sword_release": _show_toast("聖劍解放", "聖印生成、聖傷與治療全面提高")
			"holy_sword_descent": _show_toast("奧義・聖劍降臨", "攻擊、治療與護盾進入神聖循環")
			"divine_grace": _show_toast("神恩", "避免致命傷害，恢復生命並展開護盾")
			"divine_manifestation": _show_toast("神聖顯現", "滿聖印已強化聖傷與溢出治療")
			"legion_command": _show_toast("軍團號令", "全體存活友軍同時進攻")
			"legion_fervor": _show_toast("奮戰", "全軍攻速、追擊與軍勢獲取提高")
			"war_god": _show_toast("軍神", "主角與友軍進入雙向連攜")
			"ten_thousand_armies_one_sword": _show_toast("奧義・萬軍一劍", "一劍起，萬軍動")
			"retry_started": _show_toast("再次挑戰", "重新進入第 %d 戰" % int(event.stage))
			"defeat": _show_toast("第 %d 戰突破失敗" % int(event.failed_stage), "已退回第 %d 戰整備，AUTO 持續進行" % int(event.fallback_stage))
	if events.any(func(event: Dictionary) -> bool: return String(event.type) in ["enemy_defeated", "defeat", "equipment_drop", "equipment_duplicate", "boss_reward_choice", "inheritance_unlocked"]):
		_save_game()

func _show_boss_reward(options: Array) -> void:
	journey_pending = false
	boss_reward_open = true
	boss_reward_overlay.visible = true
	for child: Node in boss_reward_box.get_children():
		child.queue_free()
	var title := _label("黑鐵哨站突破", 29, Color("ffe09a"))
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	boss_reward_box.add_child(title)
	var detail := _label("選擇一件戰利品。裝備後會立刻改變有效流派等級。", 15, Color("d8e0d8"))
	detail.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	detail.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	boss_reward_box.add_child(detail)
	for option: Dictionary in options:
		var style_name := String(CombatModel.TRAINING_DEFS[String(option.style)].name)
		var button := _button("%s｜%s\n%s" % [String(option.name), style_name, String(option.description)], Color("514634"), 88)
		button.add_theme_font_size_override("font_size", 14)
		button.pressed.connect(_claim_boss_reward.bind(String(option.item_id)))
		boss_reward_box.add_child(button)

func _claim_boss_reward(item_id: String) -> void:
	var events := model.claim_boss_reward(item_id)
	if events.is_empty():
		return
	boss_reward_open = false
	boss_reward_overlay.visible = false
	_handle_events(events)
	_update_hud(model.snapshot())
	_save_game()

func _open_failure_report() -> void:
	var report: Dictionary = model.last_failure_report
	if report.is_empty():
		return
	failure_open = true
	failure_overlay.visible = true
	failure_detail.text = "上次失敗：第 %d 戰・第 %d 波\n致命來源：%s\n最大承傷：%s（%d）\n敵人特性：%s\n尚有修練：%d\n\n遊戲仍在上一戰持續 AUTO 掛機。" % [int(report.failed_stage), int(report.failed_wave), String(report.killer), String(report.highest_damage_source), roundi(float(report.highest_damage_amount)), String(report.enemy_traits), int(report.unspent_style_points)]

func _close_failure_report() -> void:
	failure_open = false
	failure_overlay.visible = false

func _open_failure_target(page: String) -> void:
	_close_failure_report()
	_switch_page(page)

func _retry_from_failure() -> void:
	_close_failure_report()
	_retry_failed_stage()

func _retry_failed_stage() -> void:
	if battlefield.defeat_sequence_active():
		return
	var events := model.retry_failed_stage()
	if events.is_empty():
		return
	accumulator = 0.0
	_handle_events(events)
	_update_hud(model.snapshot())

func _select_exploration_approach(approach_id: String) -> void:
	_handle_events(model.choose_exploration_approach(approach_id))
	_update_hud(model.snapshot())
	_save_game()

func _spend_training(track: String) -> void:
	var first_training := _total_base_training() == 0
	var previous_levels := _effective_style_levels()
	var events := model.spend_training(track)
	_handle_events(events)
	_update_hud(model.snapshot())
	var formed_tracks := _newly_formed_tracks(previous_levels)
	if model.tutorial_step == "spend" and not events.is_empty():
		_show_first_training_complete(track)
	elif model.tutorial_step == "core" and not formed_tracks.is_empty():
		_show_core_tutorial(String(formed_tracks[0]))
	elif not formed_tracks.is_empty():
		_queue_style_formation(formed_tracks, false)
	elif first_training and not events.is_empty():
		_show_toast("第一步完成：%s" % String(CombatModel.TRAINING_DEFS[track].name), "有效 Lv.10 將解鎖流派核心；裝備加成也會計入")
	elif not events.is_empty() and not events.any(func(event: Dictionary) -> bool: return event.type == "unlock"):
		_show_toast("%s提升" % String(CombatModel.TRAINING_DEFS[track].name), "現在是 Lv.%d" % int(model.training[track]))
	if not events.is_empty():
		_save_game()

func _total_base_training() -> int:
	var total := 0
	for track: String in CombatModel.TRAINING_ORDER:
		total += model.base_style_level(track)
	return total

func _equip_auto_skill(skill_id: String) -> void:
	if not model.equip_auto_skill(skill_id):
		return
	_update_hud(model.snapshot())
	_save_game()

func _on_auto_slot_pressed(index: int) -> void:
	var skill_id := String(model.auto_skill_slots[index])
	if skill_id.is_empty():
		_switch_page("skills")
		return
	if model.cycle_auto_tactic(skill_id):
		_show_toast("戰術：%s" % model.auto_tactic_label(skill_id), model.auto_tactic_description(skill_id))
		_save_game()
	_update_hud(model.snapshot())

func _cycle_auto_tactic(skill_id: String) -> void:
	if not model.cycle_auto_tactic(skill_id):
		return
	_show_toast("戰術：%s" % model.auto_tactic_label(skill_id), model.auto_tactic_description(skill_id))
	_update_hud(model.snapshot())
	_save_game()

func _remove_auto_slot(index: int) -> void:
	model.unequip_auto_skill(index)
	_update_hud(model.snapshot())
	_save_game()

func _move_auto_slot(index: int, direction: int) -> void:
	model.move_auto_skill(index, direction)
	_update_hud(model.snapshot())
	_save_game()

func _select_skill_tab(tab_id: String) -> void:
	if tab_id not in ["auto", "martial", "physique", "agility", "magic", "faith", "command"]:
		return
	current_skill_tab = tab_id
	_render_section("skills")

func _select_martial_branch(branch_id: String) -> void:
	if not model.select_martial_branch(branch_id):
		return
	var branch: Dictionary = CombatModel.MARTIAL_BRANCHES[branch_id]
	_show_toast("已選擇：%s" % String(branch.name), String(branch.description))
	_update_hud(model.snapshot())
	_save_game()

func _select_major_milestone_tab(level: int) -> void:
	current_major_milestone = level
	_render_section("skills")

func _select_milestone_choice(track: String, level: int, choice_id: String) -> void:
	if not model.select_milestone_choice(track, level, choice_id):
		return
	var choices: Dictionary = CombatModel.MILESTONE_CHOICES[track][level]
	var choice: Dictionary = choices[choice_id]
	_show_toast("Lv.%d 劍路：%s" % [level, String(choice.name)], String(choice.description))
	_update_hud(model.snapshot())
	_save_game()

func _select_physique_branch(branch_id: String) -> void:
	if not model.select_physique_branch(branch_id):
		return
	var branch: Dictionary = CombatModel.PHYSIQUE_BRANCHES[branch_id]
	_show_toast("已選擇：%s" % String(branch.name), String(branch.description))
	_update_hud(model.snapshot())
	_save_game()

func _select_agility_branch(branch_id: String) -> void:
	if not model.select_agility_branch(branch_id):
		return
	var branch: Dictionary = CombatModel.AGILITY_BRANCHES[branch_id]
	_show_toast("已選擇：%s" % String(branch.name), String(branch.description))
	_update_hud(model.snapshot())
	_save_game()

func _select_faith_branch(branch_id: String) -> void:
	if not model.select_faith_branch(branch_id):
		return
	var branch: Dictionary = CombatModel.FAITH_BRANCHES[branch_id]
	_show_toast("已選擇：%s" % String(branch.name), String(branch.description))
	_update_hud(model.snapshot())
	_save_game()

func _select_command_branch(branch_id: String) -> void:
	if not model.select_command_branch(branch_id):
		return
	var branch: Dictionary = CombatModel.COMMAND_BRANCHES[branch_id]
	_show_toast("已選擇：%s" % String(branch.name), String(branch.description))
	_update_hud(model.snapshot())
	_save_game()

func _select_secondary_element(element_id: String) -> void:
	if not model.select_secondary_element(element_id):
		return
	var choice: Dictionary = CombatModel.MAGIC_SECONDARIES[element_id]
	_show_toast("副元素：%s" % String(choice.name), String(choice.description))
	_update_hud(model.snapshot())
	_save_game()

func _select_magic_specialization(specialization_id: String) -> void:
	if not model.select_magic_specialization(specialization_id):
		return
	var choice: Dictionary = CombatModel.MAGIC_SPECIALIZATIONS[specialization_id]
	_show_toast("元素專精：%s" % String(choice.name), String(choice.description))
	_update_hud(model.snapshot())
	_save_game()

func _toggle_training() -> void:
	if training_open: _close_training()
	else: _open_training()

func _open_training() -> void:
	training_open = true
	training_overlay.visible = true
	_update_training_rows(model.snapshot())
	(training_rows["martial"].button as Button).grab_focus()

func _close_training() -> void:
	training_open = false
	training_overlay.visible = false
	if current_page == "combat": auto_slot_buttons[0].grab_focus()
	else: (nav_buttons[current_page] as Button).grab_focus()
	call_deferred("_play_pending_style_formation")

func _show_journey_choice() -> void:
	journey_pending = false
	journey_open = true
	journey_overlay.visible = true
	journey_overlay.modulate = Color(1.0, 1.0, 1.0, 0.0)
	journey_title.text = "區域 %d 突破｜旅途抉擇" % int(model.area_number)
	journey_detail.text = _boss_reward_summary_text() + "\n\n選擇下一段旅程。"
	var tween := create_tween()
	tween.tween_property(journey_overlay, "modulate:a", 1.0, 0.25)
	(journey_buttons["mountain"] as Button).grab_focus()

func _boss_reward_summary_text() -> String:
	if boss_reward_summary.is_empty():
		return "據點已突破。"
	var before: Dictionary = boss_reward_summary.before
	var after: Dictionary = boss_reward_summary.after
	var item_id := String(model.slice_metrics.boss_reward)
	var slot := String(CombatModel.EQUIPMENT_DEFS[item_id].slot) if CombatModel.EQUIPMENT_DEFS.has(item_id) else ""
	var lines: Array[String] = ["%s有效 Lv.%d → Lv.%d（+%d）" % [String(boss_reward_summary.style), int(before.effective), int(after.effective), int(after.effective) - int(before.effective)]]
	if slot == "weapon":
		lines.append("ATK %d → %d" % [roundi(float(before.attack)), roundi(float(after.attack))])
	elif slot == "armor":
		lines.append("HP %d → %d｜DEF %d → %d" % [roundi(float(before.hp)), roundi(float(after.hp)), roundi(float(before.defense)), roundi(float(after.defense))])
	else:
		lines.append("攻速加成 %.2f → %.2f" % [float(before.attack_speed), float(after.attack_speed)])
	if not String(boss_reward_summary.modifier_text).is_empty():
		lines.append(String(boss_reward_summary.modifier_text))
	lines.append("永久進度：Base Lv.%d｜下一節點 Lv.%d" % [int(after.base), int(boss_reward_summary.next_base_milestone)])
	lines.append("技能與里程碑依有效流派等級解鎖")
	return "\n".join(lines)

func _choose_journey_route(route_id: String) -> void:
	var events := model.choose_journey_route(route_id)
	if events.is_empty():
		return
	journey_open = false
	journey_overlay.visible = false
	accumulator = 0.0
	_handle_events(events)
	_update_hud(model.snapshot())
	auto_slot_buttons[0].grab_focus()
	_save_game()

func _update_hud(snapshot: Dictionary) -> void:
	var boss_mark := "首領 · " if bool(snapshot.enemy_is_boss) else ("精英 · " if bool(snapshot.enemy_is_elite) else "")
	var rage_mark := " · 狂怒" if bool(snapshot.get("boss_enraged", false)) else ""
	var attack_hint := " · %s準備" % String(snapshot.enemy_attack_type) if String(snapshot.enemy_attack_type) != "普通" and float(snapshot.enemy_attack_remaining) <= 0.8 else ""
	var wave_text := "｜波 %d/%d" % [int(snapshot.wave), int(snapshot.wave_count)] if int(snapshot.wave_count) > 1 else ""
	enemy_label.text = "第%d區・%s｜%d/10・%s%s\n%s%s｜%s · 護甲 %d%s%s" % [int(snapshot.area_number), String(snapshot.journey_name), int(snapshot.route_position), String(snapshot.route_phase), wave_text, boss_mark, String(snapshot.enemy_name), String(snapshot.enemy_role), roundi(float(snapshot.enemy_armor)), rage_mark, attack_hint]
	enemy_label.tooltip_text = String(snapshot.enemy_hint)
	kills_label.text = "擊倒 %d｜金幣 %d" % [int(snapshot.kills), int(snapshot.gold)]
	var training_points := int(snapshot.training_points)
	var first_training := game_started and _total_base_training() == 0 and training_points > 0
	training_alert_button.text = "第一步：修練" if first_training else "可用修練 %d" % training_points
	training_alert_button.tooltip_text = "選擇一條流派投入第一點修練" if first_training else "前往修練分配可用點數"
	training_alert_button.disabled = model.tutorial_step in ["intro", "observe"]
	var emphasize_training := model.tutorial_step == "core" and training_points > 0
	training_alert_button.add_theme_stylebox_override("normal", _panel_style(Color("fff0c7") if emphasize_training else (Color("fff5df") if training_points > 0 else Color("e0d9ce")), Color("efae38") if emphasize_training else (Color("c58a28") if training_points > 0 else Color("81796f")), 4 if emphasize_training else 2))
	if emphasize_training and not tutorial_core_hint_shown:
		call_deferred("_highlight_core_training_button")
	var retry_pending := bool(snapshot.get("retry_pending", false))
	var retry_stage := int(snapshot.get("retry_stage", 0))
	retry_button.visible = retry_pending and not battlefield.defeat_sequence_active()
	retry_button.text = "再次挑戰"
	failure_status.visible = retry_pending and not battlefield.defeat_sequence_active()
	failure_button.text = "第 %d 戰突破失敗｜查看情報" % retry_stage
	enemy_bar.max_value = float(snapshot.enemy_max_hp)
	enemy_bar.value = float(snapshot.enemy_hp)
	hp_bar.max_value = float(snapshot.hero_max_hp)
	hp_bar.value = float(snapshot.hero_hp)
	hp_label.text = "♥ 生命  %d/%d" % [roundi(snapshot.hero_hp), roundi(snapshot.hero_max_hp)]
	mp_bar.max_value = maxf(1.0, float(snapshot.hero_max_mp))
	mp_bar.value = float(snapshot.hero_mp)
	mp_label.text = "◆ MP  %d/%d" % [roundi(snapshot.hero_mp), roundi(snapshot.hero_max_mp)]
	mp_hud.visible = float(snapshot.hero_max_mp) > 0.0
	momentum_bar.max_value = float(snapshot.max_momentum)
	momentum_bar.value = float(snapshot.momentum)
	var draw_text := " · 拔刀 %.1fs" % float(snapshot.draw_stance_remaining) if float(snapshot.draw_stance_remaining) > 0.0 else ""
	momentum_label.text = "♨ 勢  %d/%d%s" % [roundi(snapshot.momentum), roundi(snapshot.max_momentum), draw_text]
	var martial_active := int(snapshot.effective_style_levels.martial) >= 10
	momentum_hud.visible = martial_active
	var physique_active := int(snapshot.effective_style_levels.physique) >= 10
	immovable_hud.visible = physique_active
	var guard_text := " · 守勢 %.1f" % float(snapshot.guard_stance_remaining) if float(snapshot.guard_stance_remaining) > 0.0 else (" · 返刃" if bool(snapshot.return_blade_ready) else "")
	immovable_label.text = "不動  %d/%d%s" % [int(snapshot.immovable), int(snapshot.max_immovable), guard_text]
	for index in immovable_pips.size():
		var filled := index < int(snapshot.immovable)
		immovable_pips[index].add_theme_stylebox_override("panel", _state_pip_style(Color("6a98aa") if filled else Color("bdc7c9"), Color("dff5fa") if filled else Color("70848b"), "shield", 2 if filled else 1))
	var agility_active := int(snapshot.effective_style_levels.agility) >= 10
	youren_hud.visible = agility_active
	var shadowless_text := " · 無影" if float(snapshot.shadowless_remaining) > 0.0 else ""
	var swift_text := " · 瞬步" if bool(snapshot.swift_step_ready) else ""
	var flow_text := ""
	if int(snapshot.training.agility) >= 15:
		flow_text = " · 追%d/%d" % [int(snapshot.swift_cut_hits), int(snapshot.swift_cut_hits_required)] if int(snapshot.youren) >= int(snapshot.max_youren) else ""
	youren_label.text = "游刃  %d/%d%s%s%s" % [int(snapshot.youren), int(snapshot.max_youren), flow_text, swift_text, shadowless_text]
	for index in youren_pips.size():
		var filled := index < int(snapshot.youren)
		youren_pips[index].add_theme_stylebox_override("panel", _state_pip_style(Color("45a69b") if filled else Color("bdcbc8"), Color("dcfff8") if filled else Color("5d8781"), "slash", 2 if filled else 1))
	var magic_active := int(snapshot.effective_style_levels.magic) >= 10
	magic_hud.visible = magic_active
	var release_text := " · 全解放" if float(snapshot.complete_release_remaining) > 0.0 else (" · 解放" if float(snapshot.magic_release_remaining) > 0.0 else "")
	var element_text := "火%d" % int(snapshot.burn_stacks)
	if String(snapshot.secondary_element) == "ice": element_text += " 冰%d" % int(snapshot.frost_stacks)
	elif String(snapshot.secondary_element) == "lightning": element_text += " 雷%d" % int(snapshot.lightning_stacks)
	var manifest_text := " · 顯現" if bool(snapshot.magic_manifest_active) else ""
	magic_label.text = "魔紋 %d/%d · %s%s%s" % [int(snapshot.magic_marks), int(snapshot.max_magic_marks), element_text, manifest_text, release_text]
	for index in magic_pips.size():
		var filled := index < int(snapshot.magic_marks)
		magic_pips[index].add_theme_stylebox_override("panel", _state_pip_style(Color("865caf") if filled else Color("c9bfd1"), Color("ead7ff") if filled else Color("79638e"), "rune", 2 if filled else 1))
	var faith_active := int(snapshot.effective_style_levels.faith) >= 10
	faith_hud.visible = faith_active
	var holy_state := " · 降臨" if float(snapshot.holy_descent_remaining) > 0.0 else (" · 解放" if float(snapshot.holy_release_remaining) > 0.0 else "")
	faith_label.text = "聖印 %d/%d · 盾%d%s" % [int(snapshot.holy_seals), int(snapshot.max_holy_seals), roundi(float(snapshot.holy_shield)), holy_state]
	for index in faith_pips.size():
		var filled := index < int(snapshot.holy_seals)
		faith_pips[index].add_theme_stylebox_override("panel", _state_pip_style(Color("d8b94f") if filled else Color("d5ccb0"), Color("fff2ae") if filled else Color("9d8849"), "seal", 2 if filled else 1))
	var command_active := int(snapshot.effective_style_levels.command) >= 10
	command_hud.visible = command_active
	command_bar.max_value = float(snapshot.max_military_momentum)
	command_bar.value = float(snapshot.military_momentum)
	var war_text := " · 軍神" if bool(snapshot.war_god_active) else (" · 奮戰" if float(snapshot.legion_fervor_remaining) > 0.0 else "")
	command_label.text = "軍勢 %d%% · 友%d%s" % [roundi(float(snapshot.military_momentum)), int(snapshot.ally_count), war_text]
	state_panel.visible = physique_active or agility_active or magic_active or faith_active or command_active
	var slots: Array = snapshot.auto_skill_slots
	for index in CombatModel.AUTO_SLOT_COUNT:
		var skill_id := String(slots[index])
		var button := auto_slot_buttons[index]
		if skill_id.is_empty():
			_set_skill_card(button, "%d" % (index + 1), "未解鎖", false, false)
			button.tooltip_text = "第 %d 優先：尚未配置" % (index + 1)
			button.add_theme_stylebox_override("normal", _slot_style(Color("313833"), Color("667169"), 1))
		else:
			var definition: Dictionary = CombatModel.SKILL_DEFS[skill_id]
			var state := model.auto_skill_state(skill_id)
			_set_skill_card(button, "%d  %s" % [index + 1, model.skill_display_name(skill_id, true)], state, state == "就緒", true)
			button.tooltip_text = "第 %d 優先｜%s｜%s" % [index + 1, model.auto_tactic_description(skill_id), model.skill_power_hint(skill_id)]
			var track := String(definition.track)
			var base: Color = {
				"common": Color("5a4f38"),
				"martial": Color("654c27"), "physique": Color("31545c"), "agility": Color("4b416d"),
				"magic": Color("70452d"), "faith": Color("6b6335"), "command": Color("36533e"),
			}.get(track, Color("3a403b"))
			var border := Color("f1d590") if state == "就緒" else Color("7b817a")
			button.add_theme_stylebox_override("normal", _slot_style(base if state == "就緒" else base.darkened(0.32), border, 2 if state == "就緒" else 1))
	battlefield.set_state(snapshot)
	battlefield.set_stage_bounds(top_panel.position.y + top_panel.size.y, combat_panel.position.y)
	if String(battlefield.exploration_status().phase) == "choosing" and is_instance_valid(toast_panel):
		toast_panel.visible = false
	_update_training_rows(snapshot)
	if current_page != "combat" and is_instance_valid(section_box):
		_render_section(current_page, false)

func _update_training_rows(snapshot: Dictionary) -> void:
	if training_rows.is_empty(): return
	for track: String in CombatModel.TRAINING_ORDER:
		var widgets: Dictionary = training_rows[track]
		var definition: Dictionary = CombatModel.TRAINING_DEFS[track]
		var level := int(snapshot.base_style_levels[track])
		var equipment_bonus := int(snapshot.equipment_style_bonuses[track])
		var effective_level := int(snapshot.effective_style_levels[track])
		(widgets.level as Label).text = "Base %d\n裝備 +%d\n有效 %d" % [level, equipment_bonus, effective_level]
		(widgets.hint as Label).text = _training_tree_hint(track, effective_level)
		var add_button := widgets.button as Button
		add_button.text = "+" if bool(definition.implemented) else "鎖"
		add_button.disabled = not bool(definition.implemented) or int(snapshot.training_points) <= 0 or level >= CombatModel.MAX_TRAINING_LEVEL
		var tutorial_choice := model.tutorial_step == "spend" and not add_button.disabled
		add_button.add_theme_stylebox_override("normal", _panel_style(Color("926520") if tutorial_choice else Color("71552f"), Color("ffe39a") if tutorial_choice else Color("c8aa70"), 4 if tutorial_choice else 2))

func _training_tree_hint(track: String, effective_level: int) -> String:
	for node: Dictionary in SIGNATURE_TREE[track]:
		if effective_level < int(node.level):
			return "下一劍技 Lv.%d｜%s\n%s" % [int(node.level), String(node.name), String(node.description)]
	return "劍途已完成｜終極奧義已掌握"

func _refresh_navigation() -> void:
	for page: String in PAGE_NAMES:
		var button := nav_buttons[page] as Button
		var selected := page == current_page
		button.disabled = model.tutorial_step in ["intro", "observe"] and page != "combat"
		var label := button.get_node("Content/Label") as Label
		label.text = String(PAGE_NAMES[page])
		label.add_theme_color_override("font_color", Color("8a5b16") if selected else Color("595b57"))
		button.add_theme_stylebox_override("normal", _slot_style(Color("f8e9c6") if selected else Color("f4efe5"), Color("c68e2f") if selected else Color("d3c6b3"), 2 if selected else 1))

func _show_toast(title: String, detail: String, duration := 1.8, accent := Color("f0c365"), emphasized := false) -> void:
	if toast_tween != null and toast_tween.is_valid():
		toast_tween.kill()
	toast_title.text = title
	toast_detail.text = detail
	toast_title.add_theme_font_size_override("font_size", 21 if emphasized else 17)
	toast_panel.add_theme_stylebox_override("panel", _panel_style(Color("2c2218", 0.96), accent, 3 if emphasized else 1))
	toast_panel.visible = true
	toast_panel.modulate = Color.WHITE
	toast_panel.scale = Vector2(0.96, 0.96)
	toast_tween = create_tween()
	toast_tween.set_parallel(true)
	toast_tween.tween_property(toast_panel, "scale", Vector2.ONE, 0.18).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	toast_tween.tween_property(toast_panel, "modulate:a", 0.0, 0.3).set_delay(duration)
	toast_tween.chain().tween_callback(func() -> void: toast_panel.visible = false)

func _apply_safe_area() -> void:
	var safe := get_node("SafeArea") as MarginContainer
	var inset := maxi(16, roundi(minf(size.x, size.y) * 0.05))
	for side: String in ["left", "top", "right", "bottom"]:
		safe.add_theme_constant_override("margin_%s" % side, inset)

func _resource_card(text_value: String, value: float, max_value: float, color: Color) -> VBoxContainer:
	var box := VBoxContainer.new()
	box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	box.add_child(_label(text_value, 15, Color("f2ded8")))
	var bar := _progress_bar(Color("293238"), color, 18)
	bar.max_value = max_value
	bar.value = value
	box.add_child(bar)
	return box

func _section_row(title_value: String, detail_value: String) -> PanelContainer:
	var panel := PanelContainer.new()
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_theme_stylebox_override("panel", _panel_style(Color("202e28"), Color("53675b"), 1))
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	panel.add_child(row)
	var title := _label(title_value, 15, Color("f4eee0"))
	title.custom_minimum_size.x = 86
	row.add_child(title)
	var detail := _label(detail_value, 12, Color("aebfb4"))
	detail.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	detail.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	detail.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	row.add_child(detail)
	return panel

func _progress_bar(background: Color, fill: Color, height: int) -> ProgressBar:
	var bar := ProgressBar.new()
	bar.max_value = 100.0
	bar.show_percentage = false
	bar.custom_minimum_size.y = height
	bar.add_theme_stylebox_override("background", _bar_style(background))
	bar.add_theme_stylebox_override("fill", _bar_style(fill))
	return bar

func _label(text_value: String, font_size: int, color: Color) -> Label:
	var label := Label.new()
	label.text = text_value
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", color)
	var dark_text := color.get_luminance() < 0.45
	label.add_theme_color_override("font_outline_color", Color("f5eee2") if dark_text else Color("171310"))
	label.add_theme_constant_override("outline_size", 1 if dark_text else 3)
	return label

func _button(text_value: String, color: Color, height := 58) -> Button:
	var button := Button.new()
	button.text = text_value
	button.custom_minimum_size.y = height
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.focus_mode = Control.FOCUS_ALL
	button.add_theme_font_size_override("font_size", 16)
	button.add_theme_stylebox_override("normal", _panel_style(color, Color("c8aa70")))
	button.add_theme_stylebox_override("hover", _panel_style(color.lightened(0.12), Color("f1d590")))
	button.add_theme_stylebox_override("pressed", _panel_style(color.darkened(0.12), Color("fff0b8")))
	button.add_theme_stylebox_override("focus", _panel_style(color.lightened(0.08), Color("fff2ac"), 4))
	button.add_theme_stylebox_override("disabled", _panel_style(Color("383a36"), Color("686d65")))
	return button

func _skill_button(text_value: String, color: Color, icon_texture: Texture2D) -> Button:
	var button := _button(text_value, color, 104)
	button.add_theme_font_size_override("font_size", 14)
	button.add_theme_color_override("font_color", Color("f2ede3"))
	button.add_theme_color_override("font_hover_color", Color.WHITE)
	button.add_theme_color_override("font_disabled_color", Color("b8b8b0"))
	button.add_theme_stylebox_override("normal", _slot_style(color, Color("c8aa70")))
	button.add_theme_stylebox_override("hover", _slot_style(color.lightened(0.12), Color("f1d590")))
	button.add_theme_stylebox_override("focus", _slot_style(color.lightened(0.08), Color("fff2ac"), 4))
	var content := VBoxContainer.new()
	content.name = "Content"
	content.mouse_filter = Control.MOUSE_FILTER_IGNORE
	content.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	content.offset_left = 4
	content.offset_top = 4
	content.offset_right = -4
	content.offset_bottom = -4
	content.add_theme_constant_override("separation", 1)
	button.add_child(content)
	var title := _label("", 14, Color("f5f2ea"))
	title.name = "Title"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	content.add_child(title)
	var icon := TextureRect.new()
	icon.name = "Icon"
	icon.texture = icon_texture
	icon.custom_minimum_size = Vector2(34, 48)
	icon.size_flags_vertical = Control.SIZE_EXPAND_FILL
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	content.add_child(icon)
	var status := _label("", 14, Color("d9d7cf"))
	status.name = "Status"
	status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	status.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	content.add_child(status)
	return button

func _set_skill_card(button: Button, title_text: String, status_text: String, ready: bool, has_skill: bool) -> void:
	var title := button.get_node("Content/Title") as Label
	var icon := button.get_node("Content/Icon") as TextureRect
	var status := button.get_node("Content/Status") as Label
	title.text = title_text
	status.text = status_text
	icon.visible = has_skill
	icon.modulate = Color.WHITE if ready else Color(0.72, 0.75, 0.75, 0.72)
	status.add_theme_color_override("font_color", Color("fff0a8") if ready else Color("c8cbc8"))

func _nav_button(text_value: String, icon_texture: Texture2D) -> Button:
	var button := _button("", Color("f4efe5"), 50)
	button.add_theme_stylebox_override("normal", _slot_style(Color("f4efe5"), Color("d3c6b3"), 1))
	button.add_theme_stylebox_override("hover", _slot_style(Color("fff4dc"), Color("b88a3d"), 2))
	button.add_theme_stylebox_override("focus", _slot_style(Color("fff0ce"), Color("704f1f"), 4))
	var content := HBoxContainer.new()
	content.name = "Content"
	content.mouse_filter = Control.MOUSE_FILTER_IGNORE
	content.alignment = BoxContainer.ALIGNMENT_CENTER
	content.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	content.add_theme_constant_override("separation", 2)
	button.add_child(content)
	var icon := TextureRect.new()
	icon.texture = icon_texture
	icon.custom_minimum_size = Vector2(24, 24)
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	content.add_child(icon)
	var label := _label(text_value, 14, Color("344750"))
	label.name = "Label"
	content.add_child(label)
	return button

func _state_pip_style(color: Color, border: Color, kind: String, border_width := 1) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.border_color = border
	style.set_border_width_all(border_width)
	match kind:
		"shield":
			style.corner_radius_top_left = 3
			style.corner_radius_top_right = 3
			style.corner_radius_bottom_left = 8
			style.corner_radius_bottom_right = 8
		"slash":
			style.set_corner_radius_all(8)
		"rune":
			style.set_corner_radius_all(9)
		"seal":
			style.set_corner_radius_all(3)
	return style

func _slot_style(color: Color, border: Color, border_width := 2) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.border_color = border
	style.set_border_width_all(border_width)
	style.set_corner_radius_all(8)
	style.content_margin_left = 4
	style.content_margin_right = 4
	style.content_margin_top = 5
	style.content_margin_bottom = 5
	return style

func _panel_style(color: Color, border: Color, border_width := 2) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.border_color = border
	style.set_border_width_all(border_width)
	style.set_corner_radius_all(10)
	style.content_margin_left = 10
	style.content_margin_right = 10
	style.content_margin_top = 7
	style.content_margin_bottom = 7
	return style

func _bar_style(color: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.set_corner_radius_all(6)
	return style
