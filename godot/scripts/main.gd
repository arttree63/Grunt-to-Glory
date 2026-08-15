extends Control

const FIXED_STEP := 1.0 / 60.0
const PAGE_NAMES := {"combat": "戰鬥", "character": "角色", "skills": "技能", "equipment": "裝備", "shop": "商店"}
const UI_FONT := preload("res://assets/fonts/NotoSansTC-Variable.ttf")

var model := CombatModel.new()
var accumulator := 0.0
var training_open := false
var current_page := "combat"
var current_skill_tab := "auto"
var battlefield: Battlefield
var manual_attack_button: Button
var enemy_label: Label
var kills_label: Label
var top_panel: PanelContainer
var combat_panel: PanelContainer
var hp_bar: ProgressBar
var hp_label: Label
var mp_bar: ProgressBar
var mp_label: Label
var momentum_bar: ProgressBar
var momentum_label: Label
var momentum_head: HBoxContainer
var immovable_hud: HBoxContainer
var immovable_label: Label
var immovable_pips: Array[PanelContainer] = []
var youren_hud: HBoxContainer
var youren_label: Label
var youren_pips: Array[PanelContainer] = []
var magic_hud: HBoxContainer
var magic_label: Label
var magic_pips: Array[PanelContainer] = []
var faith_hud: HBoxContainer
var faith_label: Label
var faith_pips: Array[PanelContainer] = []
var command_hud: VBoxContainer
var command_label: Label
var command_bar: ProgressBar
var enemy_bar: ProgressBar
var auto_slot_buttons: Array[Button] = []
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

func _ready() -> void:
	_build_ui()
	get_viewport().size_changed.connect(_apply_safe_area)
	_apply_safe_area()
	_update_hud(model.snapshot())
	auto_slot_buttons[0].grab_focus()
	_show_toast("手動攻擊已就緒", "點擊攻擊圖示出刀；不操作時仍會自動戰鬥")

func _process(delta: float) -> void:
	if training_open or current_page != "combat":
		return
	accumulator = minf(accumulator + delta, FIXED_STEP * 5.0)
	var stepped := false
	while accumulator >= FIXED_STEP:
		accumulator -= FIXED_STEP
		_handle_events(model.step(FIXED_STEP))
		stepped = true
	if stepped:
		_update_hud(model.snapshot())

func _unhandled_input(event: InputEvent) -> void:
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
	add_child(battlefield)
	var shade := ColorRect.new()
	shade.color = Color("101916", 0.2)
	shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(shade)

	var safe := MarginContainer.new()
	safe.name = "SafeArea"
	safe.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(safe)
	var layout := VBoxContainer.new()
	layout.add_theme_constant_override("separation", 10)
	safe.add_child(layout)

	top_panel = PanelContainer.new()
	top_panel.add_theme_stylebox_override("panel", _panel_style(Color("17221e", 0.92), Color("c89b52")))
	layout.add_child(top_panel)
	var top_box := VBoxContainer.new()
	top_box.add_theme_constant_override("separation", 5)
	top_panel.add_child(top_box)
	var identity := HBoxContainer.new()
	top_box.add_child(identity)
	var hero_name := _label("無名小兵", 22, Color("f6d27d"))
	hero_name.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	identity.add_child(hero_name)
	kills_label = _label("擊倒 0", 16, Color("c9d4cb"))
	kills_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	identity.add_child(kills_label)
	enemy_label = _label("林地哥布林 · 第 1 戰", 18, Color("e9ddd0"))
	top_box.add_child(enemy_label)
	enemy_bar = _progress_bar(Color("332b26"), Color("9c4138"), 16)
	top_box.add_child(enemy_bar)

	var spacer := Control.new()
	spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	spacer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layout.add_child(spacer)
	toast_panel = PanelContainer.new()
	toast_panel.visible = false
	toast_panel.add_theme_stylebox_override("panel", _panel_style(Color("2c2218", 0.96), Color("f0c365")))
	layout.add_child(toast_panel)
	var toast_box := VBoxContainer.new()
	toast_panel.add_child(toast_box)
	toast_title = _label("", 22, Color("ffe09a"))
	toast_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toast_box.add_child(toast_title)
	toast_detail = _label("", 15, Color("f4eee0"))
	toast_detail.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toast_detail.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	toast_box.add_child(toast_detail)

	combat_panel = PanelContainer.new()
	combat_panel.add_theme_stylebox_override("panel", _panel_style(Color("111a17", 0.96), Color("6f846d")))
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
	hp_label = _label("生命", 15, Color("f2ded8"))
	hp_box.add_child(hp_label)
	hp_bar = _progress_bar(Color("332d2a"), Color("b85245"), 18)
	hp_box.add_child(hp_bar)
	var mp_box := VBoxContainer.new()
	mp_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	resource_row.add_child(mp_box)
	mp_label = _label("MP  尚未啟用", 15, Color("9eb2b6"))
	mp_box.add_child(mp_label)
	mp_bar = _progress_bar(Color("293238"), Color("477d91"), 18)
	mp_box.add_child(mp_bar)

	momentum_head = HBoxContainer.new()
	bottom_box.add_child(momentum_head)
	momentum_label = _label("勢  0/100", 14, Color("ffe09a"))
	momentum_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	momentum_head.add_child(momentum_label)
	momentum_head.add_child(_label("隨時間、攻擊、擊殺累積", 12, Color("9fb0a5")))
	momentum_bar = _progress_bar(Color("30291e"), Color("e0a541"), 12)
	bottom_box.add_child(momentum_bar)
	immovable_hud = HBoxContainer.new()
	immovable_hud.add_theme_constant_override("separation", 6)
	bottom_box.add_child(immovable_hud)
	immovable_label = _label("不動  0/3", 14, Color("cce9ef"))
	immovable_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	immovable_hud.add_child(immovable_label)
	for index in CombatModel.MAX_IMMOVABLE:
		var pip := PanelContainer.new()
		pip.custom_minimum_size = Vector2(34, 16)
		pip.add_theme_stylebox_override("panel", _slot_style(Color("26353a"), Color("70848b"), 1))
		immovable_hud.add_child(pip)
		immovable_pips.append(pip)
	youren_hud = HBoxContainer.new()
	youren_hud.add_theme_constant_override("separation", 5)
	bottom_box.add_child(youren_hud)
	youren_label = _label("游刃  0/5", 14, Color("d8ccff"))
	youren_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	youren_hud.add_child(youren_label)
	for index in CombatModel.MAX_YOUREN:
		var pip := PanelContainer.new()
		pip.custom_minimum_size = Vector2(24, 14)
		pip.add_theme_stylebox_override("panel", _slot_style(Color("2e293b"), Color("756a96"), 1))
		youren_hud.add_child(pip)
		youren_pips.append(pip)
	magic_hud = HBoxContainer.new()
	magic_hud.add_theme_constant_override("separation", 5)
	bottom_box.add_child(magic_hud)
	magic_label = _label("魔紋  0/5", 14, Color("ffc28f"))
	magic_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	magic_hud.add_child(magic_label)
	for index in CombatModel.MAX_MAGIC_MARKS:
		var pip := PanelContainer.new()
		pip.custom_minimum_size = Vector2(24, 14)
		pip.add_theme_stylebox_override("panel", _slot_style(Color("3b2b25"), Color("8f674f"), 1))
		magic_hud.add_child(pip)
		magic_pips.append(pip)
	faith_hud = HBoxContainer.new()
	faith_hud.add_theme_constant_override("separation", 5)
	bottom_box.add_child(faith_hud)
	faith_label = _label("聖印  0/5", 14, Color("fff0a8"))
	faith_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	faith_hud.add_child(faith_label)
	for index in CombatModel.MAX_HOLY_SEALS:
		var pip := PanelContainer.new()
		pip.custom_minimum_size = Vector2(24, 14)
		pip.add_theme_stylebox_override("panel", _slot_style(Color("3b3926"), Color("8f895c"), 1))
		faith_hud.add_child(pip)
		faith_pips.append(pip)
	command_hud = VBoxContainer.new()
	command_hud.add_theme_constant_override("separation", 3)
	bottom_box.add_child(command_hud)
	command_label = _label("軍勢  0/100", 14, Color("c7e0ca"))
	command_hud.add_child(command_label)
	command_bar = _progress_bar(Color("253229"), Color("5d9a6c"), 11)
	command_hud.add_child(command_bar)

	var manual_row := HBoxContainer.new()
	manual_row.add_theme_constant_override("separation", 8)
	bottom_box.add_child(manual_row)
	var manual_text := VBoxContainer.new()
	manual_text.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	manual_row.add_child(manual_text)
	manual_text.add_child(_label("手動攻擊", 14, Color("ffe09a")))
	manual_text.add_child(_label("獨立冷卻 · 敏捷會加快再次出刀", 12, Color("aebfb4")))
	manual_attack_button = _button("斬  攻擊", Color("78552d"), 54)
	manual_attack_button.custom_minimum_size.x = 118
	manual_attack_button.size_flags_horizontal = Control.SIZE_SHRINK_END
	manual_attack_button.tooltip_text = "手動斬擊｜不會延後 AUTO 普攻"
	manual_attack_button.pressed.connect(_manual_attack)
	manual_row.add_child(manual_attack_button)

	var slot_heading := HBoxContainer.new()
	bottom_box.add_child(slot_heading)
	var slot_title := _label("AUTO 編成｜依序判斷", 13, Color("cbd5cc"))
	slot_title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	slot_heading.add_child(slot_title)
	slot_heading.add_child(_label("1 → 5", 13, Color("9fb0a5")))
	var actions := HBoxContainer.new()
	actions.add_theme_constant_override("separation", 5)
	bottom_box.add_child(actions)
	for index in CombatModel.AUTO_SLOT_COUNT:
		var slot := _skill_button("%d\n＋" % (index + 1), Color("3a403b"))
		slot.tooltip_text = "前往技能頁配置 AUTO 優先序"
		slot.pressed.connect(_switch_page.bind("skills"))
		actions.add_child(slot)
		auto_slot_buttons.append(slot)
	_build_navigation(layout)
	_build_section_overlay()
	_build_training_overlay()

func _build_navigation(parent: VBoxContainer) -> void:
	var nav := HBoxContainer.new()
	nav.z_index = 30
	nav.add_theme_constant_override("separation", 4)
	parent.add_child(nav)
	for page: String in PAGE_NAMES:
		var button := _nav_button(String(PAGE_NAMES[page]))
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
	panel.add_child(section_scroll)
	section_box = VBoxContainer.new()
	section_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	section_box.add_theme_constant_override("separation", 9)
	section_scroll.add_child(section_box)

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

func _render_section(page: String) -> void:
	for child: Node in section_box.get_children():
		section_box.remove_child(child)
		child.queue_free()
	var snapshot := model.snapshot()
	section_scroll.scroll_vertical = 0
	section_box.add_child(_label(String(PAGE_NAMES[page]), 27, Color("ffe09a")))
	match page:
		"character": _render_character_page(snapshot)
		"skills": _render_skills_page(snapshot)
		"equipment": _render_equipment_page()
		"shop": _render_shop_page()

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
	section_box.add_child(_label("六種操練 · %d 點可用" % int(snapshot.training_points), 17, Color("f6d27d")))
	var levels: Dictionary = snapshot.training
	for track: String in CombatModel.TRAINING_ORDER:
		var definition: Dictionary = CombatModel.TRAINING_DEFS[track]
		section_box.add_child(_section_row("%s｜%s" % [String(definition.name), String(definition.style)], "Lv.%d · %s" % [int(levels[track]), model.training_hint(track)]))
	var training_link := _button("前往操練配置", Color("685737"), 46)
	training_link.pressed.connect(_open_training)
	section_box.add_child(training_link)
	var reduce_motion_toggle := CheckButton.new()
	reduce_motion_toggle.text = "減少戰場震動"
	reduce_motion_toggle.button_pressed = battlefield.reduced_motion
	reduce_motion_toggle.toggled.connect(func(value: bool) -> void: battlefield.reduced_motion = value)
	section_box.add_child(reduce_motion_toggle)

func _render_skills_page(snapshot: Dictionary) -> void:
	_render_skill_tabs()
	var slots: Array = snapshot.auto_skill_slots
	if current_skill_tab == "auto":
		_render_auto_setup(slots)
		return
	var definition: Dictionary = CombatModel.TRAINING_DEFS[current_skill_tab]
	section_box.add_child(_label("%s｜%s" % [String(definition.name), String(definition.style)], 20, _track_color(current_skill_tab)))
	section_box.add_child(_label("目前 Lv.%d｜%s" % [int(snapshot.training[current_skill_tab]), String(definition.special)], 14, Color("cbd5cc")))
	if current_skill_tab == "command":
		_render_command_allies(snapshot)
	_render_track_skills(current_skill_tab, "核心技能", slots)
	if current_skill_tab != "magic":
		_render_branch_choices(current_skill_tab, snapshot)
		_render_track_milestones(current_skill_tab, snapshot)
	else:
		_render_magic_choices(snapshot)
		_render_magic_milestones(snapshot)

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
			title = "%d  %s" % [index + 1, String(definition.name)]
			detail = String(definition.condition)
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
			status += " · 已解鎖"
		else:
			status += " 解鎖"
		var skill_row := HBoxContainer.new()
		skill_row.add_theme_constant_override("separation", 6)
		section_box.add_child(skill_row)
		var skill_card := _section_row(String(definition.name), "%s｜%s｜%s" % [status, String(definition.condition), model.skill_power_hint(skill_id)])
		skill_card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		skill_row.add_child(skill_card)
		if String(definition.type) == "active" or (String(definition.type) == "ultimate" and not bool(definition.get("reactive", false))):
			var equip := _button("裝備", Color("71552f"), 44)
			equip.custom_minimum_size.x = 58
			equip.size_flags_horizontal = Control.SIZE_SHRINK_END
			equip.disabled = not model.skill_is_unlocked(skill_id) or slots.has(skill_id) or not slots.has("")
			equip.pressed.connect(_equip_auto_skill.bind(skill_id))
			skill_row.add_child(equip)

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
	for level: int in CombatModel.MAGIC_MILESTONES:
		if level in [55, 105, 155]:
			section_box.add_child(_label(_route_stage_name(level), 15, Color("d6c5a2")))
		var milestone: Dictionary = CombatModel.MAGIC_MILESTONES[level]
		var unlocked := int(snapshot.training.magic) >= level
		var marker := "◆" if level in [100, 150, 200] else ("●" if unlocked else "○")
		var state := "已取得" if unlocked else "未解鎖"
		section_box.add_child(_section_row("%s Lv.%d｜%s" % [marker, level, String(milestone.name)], "%s · %s" % [state, String(milestone.description)]))

func _render_track_milestones(track: String, snapshot: Dictionary) -> void:
	var table: Dictionary = {
		"martial": CombatModel.MARTIAL_MILESTONES,
		"physique": CombatModel.PHYSIQUE_MILESTONES,
		"agility": CombatModel.AGILITY_MILESTONES,
		"faith": CombatModel.FAITH_MILESTONES,
		"command": CombatModel.COMMAND_MILESTONES,
	}[track]
	var level := int(snapshot.training[track])
	var style_name := String(CombatModel.TRAINING_DEFS[track].style)
	var color := _track_color(track).lightened(0.35)
	section_box.add_child(_label("%s成長路線" % style_name, 18, color))
	for target: int in table:
		if target in [5, 55, 105, 155]:
			section_box.add_child(_label(_route_stage_name(target), 15, Color("d6c5a2")))
		var milestone: Dictionary = table[target]
		var unlocked := level >= target
		var marker := "◆" if target in [50, 100, 150, 200] else ("●" if unlocked else "○")
		var state := "已取得" if unlocked else "未解鎖"
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

func _render_equipment_page() -> void:
	section_box.add_child(_label("裝備會改變數值與戰法，但規則尚未定案。", 16, Color("cbd5cc")))
	section_box.add_child(_section_row("武器", "尚未裝備"))
	section_box.add_child(_section_row("防具", "尚未裝備"))
	section_box.add_child(_section_row("飾品", "尚未裝備"))

func _render_shop_page() -> void:
	section_box.add_child(_label("商店尚未營業", 21, Color("d8e0d8")))
	section_box.add_child(_section_row("商品", "等待裝備與貨幣規則確認"))
	section_box.add_child(_section_row("出售", "尚未開放"))

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
	var title := _label("六種操練", 25, Color("ffe09a"))
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
		text_box.add_child(hint_label)
		var level_label := _label("Lv.0", 15, Color("f6d27d"))
		level_label.custom_minimum_size.x = 50
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
	for event: Dictionary in events:
		match String(event.type):
			"unlock": _show_toast("解鎖：%s" % String(event.name), String(event.description))
			"milestone": _show_toast("流派強化：%s" % String(event.name), String(event.description))
			"training_point": _show_toast("獲得 %d 點操練" % int(event.get("gain", 1)), "現在有 %d 點可分配" % int(event.points))
			"momentum_full": _show_toast("勢已滿", "AUTO 將依技能優先序判斷")
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
			"defeat": _show_toast("戰敗後重整", "保留操練，退回上一戰")

func _manual_attack() -> void:
	if training_open or current_page != "combat":
		return
	var events := model.manual_attack()
	_handle_events(events)
	_update_hud(model.snapshot())

func _spend_training(track: String) -> void:
	var events := model.spend_training(track)
	_handle_events(events)
	_update_hud(model.snapshot())
	if not events.is_empty() and not events.any(func(event: Dictionary) -> bool: return event.type == "unlock"):
		_show_toast("%s提升" % String(CombatModel.TRAINING_DEFS[track].name), "現在是 Lv.%d" % int(model.training[track]))

func _equip_auto_skill(skill_id: String) -> void:
	model.equip_auto_skill(skill_id)
	_update_hud(model.snapshot())

func _remove_auto_slot(index: int) -> void:
	model.unequip_auto_skill(index)
	_update_hud(model.snapshot())

func _move_auto_slot(index: int, direction: int) -> void:
	model.move_auto_skill(index, direction)
	_update_hud(model.snapshot())

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

func _select_physique_branch(branch_id: String) -> void:
	if not model.select_physique_branch(branch_id):
		return
	var branch: Dictionary = CombatModel.PHYSIQUE_BRANCHES[branch_id]
	_show_toast("已選擇：%s" % String(branch.name), String(branch.description))
	_update_hud(model.snapshot())

func _select_agility_branch(branch_id: String) -> void:
	if not model.select_agility_branch(branch_id):
		return
	var branch: Dictionary = CombatModel.AGILITY_BRANCHES[branch_id]
	_show_toast("已選擇：%s" % String(branch.name), String(branch.description))
	_update_hud(model.snapshot())

func _select_faith_branch(branch_id: String) -> void:
	if not model.select_faith_branch(branch_id):
		return
	var branch: Dictionary = CombatModel.FAITH_BRANCHES[branch_id]
	_show_toast("已選擇：%s" % String(branch.name), String(branch.description))
	_update_hud(model.snapshot())

func _select_command_branch(branch_id: String) -> void:
	if not model.select_command_branch(branch_id):
		return
	var branch: Dictionary = CombatModel.COMMAND_BRANCHES[branch_id]
	_show_toast("已選擇：%s" % String(branch.name), String(branch.description))
	_update_hud(model.snapshot())

func _select_secondary_element(element_id: String) -> void:
	if not model.select_secondary_element(element_id):
		return
	var choice: Dictionary = CombatModel.MAGIC_SECONDARIES[element_id]
	_show_toast("副元素：%s" % String(choice.name), String(choice.description))
	_update_hud(model.snapshot())

func _select_magic_specialization(specialization_id: String) -> void:
	if not model.select_magic_specialization(specialization_id):
		return
	var choice: Dictionary = CombatModel.MAGIC_SPECIALIZATIONS[specialization_id]
	_show_toast("元素專精：%s" % String(choice.name), String(choice.description))
	_update_hud(model.snapshot())

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

func _update_hud(snapshot: Dictionary) -> void:
	var boss_mark := "首領 · " if bool(snapshot.enemy_is_boss) else ""
	var attack_hint := " · %s準備" % String(snapshot.enemy_attack_type) if String(snapshot.enemy_attack_type) != "普通" and float(snapshot.enemy_attack_remaining) <= 0.8 else ""
	enemy_label.text = "%s%s · 第 %d 戰 · 護甲 %d%s" % [boss_mark, String(snapshot.enemy_name), int(snapshot.stage), roundi(float(snapshot.enemy_armor)), attack_hint]
	kills_label.text = "擊倒 %d" % int(snapshot.kills)
	enemy_bar.max_value = float(snapshot.enemy_max_hp)
	enemy_bar.value = float(snapshot.enemy_hp)
	hp_bar.max_value = float(snapshot.hero_max_hp)
	hp_bar.value = float(snapshot.hero_hp)
	hp_label.text = "生命  %d/%d" % [roundi(snapshot.hero_hp), roundi(snapshot.hero_max_hp)]
	mp_bar.max_value = maxf(1.0, float(snapshot.hero_max_mp))
	mp_bar.value = float(snapshot.hero_mp)
	mp_label.text = "MP  %d/%d" % [roundi(snapshot.hero_mp), roundi(snapshot.hero_max_mp)]
	momentum_bar.max_value = float(snapshot.max_momentum)
	momentum_bar.value = float(snapshot.momentum)
	var draw_text := " · 拔刀 %.1fs" % float(snapshot.draw_stance_remaining) if float(snapshot.draw_stance_remaining) > 0.0 else ""
	momentum_label.text = "勢  %d/%d%s" % [roundi(snapshot.momentum), roundi(snapshot.max_momentum), draw_text]
	var martial_active := int(snapshot.training.martial) >= 10
	momentum_head.visible = martial_active
	momentum_bar.visible = martial_active
	var physique_active := int(snapshot.training.physique) >= 10
	immovable_hud.visible = physique_active
	immovable_label.text = "不動  %d/%d%s" % [int(snapshot.immovable), int(snapshot.max_immovable), " · 返刃待發" if bool(snapshot.return_blade_ready) else ""]
	for index in immovable_pips.size():
		var filled := index < int(snapshot.immovable)
		immovable_pips[index].add_theme_stylebox_override("panel", _slot_style(Color("8ec5d1") if filled else Color("26353a"), Color("e8fbff") if filled else Color("70848b"), 2 if filled else 1))
	var agility_active := int(snapshot.training.agility) >= 10
	youren_hud.visible = agility_active
	var shadowless_text := " · 無影 %.1fs" % float(snapshot.shadowless_remaining) if float(snapshot.shadowless_remaining) > 0.0 else ""
	var swift_text := " · 瞬步待發" if bool(snapshot.swift_step_ready) else ""
	var flow_text := ""
	if int(snapshot.training.agility) >= 15:
		flow_text = " · 疾斬 %d/%d" % [int(snapshot.swift_cut_hits), int(snapshot.swift_cut_hits_required)] if int(snapshot.youren) >= int(snapshot.max_youren) else " · 連擊 %d/%d" % [int(snapshot.flow_hits), int(snapshot.flow_hits_required)]
	youren_label.text = "游刃  %d/%d%s%s%s" % [int(snapshot.youren), int(snapshot.max_youren), flow_text, swift_text, shadowless_text]
	for index in youren_pips.size():
		var filled := index < int(snapshot.youren)
		youren_pips[index].add_theme_stylebox_override("panel", _slot_style(Color("9b86d6") if filled else Color("2e293b"), Color("f0eaff") if filled else Color("756a96"), 2 if filled else 1))
	var magic_active := int(snapshot.training.magic) >= 10
	magic_hud.visible = magic_active
	var release_text := " · 全解放 %.1fs" % float(snapshot.complete_release_remaining) if float(snapshot.complete_release_remaining) > 0.0 else (" · 解放 %.1fs" % float(snapshot.magic_release_remaining) if float(snapshot.magic_release_remaining) > 0.0 else "")
	var element_text := "火%d" % int(snapshot.burn_stacks)
	if String(snapshot.secondary_element) == "ice": element_text += " 冰%d" % int(snapshot.frost_stacks)
	elif String(snapshot.secondary_element) == "lightning": element_text += " 雷%d" % int(snapshot.lightning_stacks)
	var manifest_text := " · 顯現" if bool(snapshot.magic_manifest_active) else ""
	magic_label.text = "魔紋 %d/%d · %s%s%s" % [int(snapshot.magic_marks), int(snapshot.max_magic_marks), element_text, manifest_text, release_text]
	for index in magic_pips.size():
		var filled := index < int(snapshot.magic_marks)
		magic_pips[index].add_theme_stylebox_override("panel", _slot_style(Color("d96a36") if filled else Color("3b2b25"), Color("ffd0a1") if filled else Color("8f674f"), 2 if filled else 1))
	var faith_active := int(snapshot.training.faith) >= 10
	faith_hud.visible = faith_active
	var holy_state := " · 聖劍降臨 %.1fs" % float(snapshot.holy_descent_remaining) if float(snapshot.holy_descent_remaining) > 0.0 else (" · 聖劍解放 %.1fs" % float(snapshot.holy_release_remaining) if float(snapshot.holy_release_remaining) > 0.0 else "")
	faith_label.text = "聖印  %d/%d · 護盾 %d%s" % [int(snapshot.holy_seals), int(snapshot.max_holy_seals), roundi(float(snapshot.holy_shield)), holy_state]
	for index in faith_pips.size():
		var filled := index < int(snapshot.holy_seals)
		faith_pips[index].add_theme_stylebox_override("panel", _slot_style(Color("d9bd55") if filled else Color("3b3926"), Color("fff2ae") if filled else Color("8f895c"), 2 if filled else 1))
	var command_active := int(snapshot.training.command) >= 10
	command_hud.visible = command_active
	command_bar.max_value = float(snapshot.max_military_momentum)
	command_bar.value = float(snapshot.military_momentum)
	var war_text := " · 軍神" if bool(snapshot.war_god_active) else (" · 奮戰 %.1fs" % float(snapshot.legion_fervor_remaining) if float(snapshot.legion_fervor_remaining) > 0.0 else "")
	command_label.text = "軍勢  %d/%d · 友軍 %d · 援攻 %.1fs%s" % [roundi(float(snapshot.military_momentum)), roundi(float(snapshot.max_military_momentum)), int(snapshot.ally_count), float(snapshot.ally_attack_remaining), war_text]
	var manual_remaining := float(snapshot.manual_attack_remaining)
	manual_attack_button.disabled = not bool(snapshot.manual_attack_ready)
	manual_attack_button.text = "斬  攻擊" if manual_remaining <= 0.0 else "斬  %.1fs" % manual_remaining
	manual_attack_button.add_theme_stylebox_override("normal", _panel_style(Color("8a6230") if manual_remaining <= 0.0 else Color("383a36"), Color("f1d590") if manual_remaining <= 0.0 else Color("686d65"), 3 if manual_remaining <= 0.0 else 2))
	manual_attack_button.tooltip_text = "手動斬擊｜冷卻 %.2f 秒｜不會延後 AUTO 普攻" % float(snapshot.manual_attack_cooldown)
	var slots: Array = snapshot.auto_skill_slots
	for index in CombatModel.AUTO_SLOT_COUNT:
		var skill_id := String(slots[index])
		var button := auto_slot_buttons[index]
		if skill_id.is_empty():
			button.text = "%d\n＋" % (index + 1)
			button.tooltip_text = "第 %d 優先：尚未配置" % (index + 1)
			button.add_theme_stylebox_override("normal", _slot_style(Color("313833"), Color("667169"), 1))
		else:
			var definition: Dictionary = CombatModel.SKILL_DEFS[skill_id]
			var state := model.auto_skill_state(skill_id)
			button.text = "%d  %s\n%s" % [index + 1, String(definition.short), state]
			button.tooltip_text = "第 %d 優先｜%s｜%s" % [index + 1, String(definition.condition), model.skill_power_hint(skill_id)]
			var track := String(definition.track)
			var base: Color = {
				"martial": Color("654c27"), "physique": Color("31545c"), "agility": Color("4b416d"),
				"magic": Color("70452d"), "faith": Color("6b6335"), "command": Color("36533e"),
			}.get(track, Color("3a403b"))
			var border := Color("f1d590") if state == "就緒" else Color("7b817a")
			button.add_theme_stylebox_override("normal", _slot_style(base if state == "就緒" else base.darkened(0.32), border, 2 if state == "就緒" else 1))
	battlefield.set_state(snapshot)
	_update_training_rows(snapshot)
	if current_page != "combat" and is_instance_valid(section_box):
		_render_section(current_page)

func _update_training_rows(snapshot: Dictionary) -> void:
	if training_rows.is_empty(): return
	for track: String in CombatModel.TRAINING_ORDER:
		var widgets: Dictionary = training_rows[track]
		var definition: Dictionary = CombatModel.TRAINING_DEFS[track]
		var level := int(snapshot.training[track])
		(widgets.level as Label).text = "Lv.%d" % level
		(widgets.hint as Label).text = model.training_hint(track)
		var add_button := widgets.button as Button
		add_button.text = "+" if bool(definition.implemented) else "鎖"
		add_button.disabled = not bool(definition.implemented) or int(snapshot.training_points) <= 0 or level >= CombatModel.MAX_TRAINING_LEVEL

func _refresh_navigation() -> void:
	for page: String in PAGE_NAMES:
		var button := nav_buttons[page] as Button
		var selected := page == current_page
		button.text = ("● " if selected else "") + String(PAGE_NAMES[page])
		button.add_theme_stylebox_override("normal", _slot_style(Color("80683c") if selected else Color("303a34"), Color("e1bf72") if selected else Color("59665d"), 2))

func _show_toast(title: String, detail: String) -> void:
	toast_title.text = title
	toast_detail.text = detail
	toast_panel.visible = true
	toast_panel.modulate = Color.WHITE
	toast_panel.scale = Vector2(0.96, 0.96)
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(toast_panel, "scale", Vector2.ONE, 0.18).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tween.tween_property(toast_panel, "modulate:a", 0.0, 0.3).set_delay(1.8)
	tween.chain().tween_callback(func() -> void: toast_panel.visible = false)

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
	label.add_theme_color_override("font_outline_color", Color("171310"))
	label.add_theme_constant_override("outline_size", 3)
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

func _skill_button(text_value: String, color: Color) -> Button:
	var button := _button(text_value, color, 62)
	button.add_theme_font_size_override("font_size", 12)
	button.add_theme_stylebox_override("normal", _slot_style(color, Color("c8aa70")))
	button.add_theme_stylebox_override("hover", _slot_style(color.lightened(0.12), Color("f1d590")))
	button.add_theme_stylebox_override("focus", _slot_style(color.lightened(0.08), Color("fff2ac"), 4))
	return button

func _nav_button(text_value: String) -> Button:
	var button := _button(text_value, Color("303a34"), 48)
	button.add_theme_font_size_override("font_size", 13)
	button.add_theme_stylebox_override("normal", _slot_style(Color("303a34"), Color("59665d"), 1))
	button.add_theme_stylebox_override("hover", _slot_style(Color("475449"), Color("c8aa70"), 2))
	button.add_theme_stylebox_override("focus", _slot_style(Color("475449"), Color("fff2ac"), 4))
	return button

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
