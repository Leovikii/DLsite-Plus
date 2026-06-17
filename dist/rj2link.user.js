// ==UserScript==
// @name               RJ2Link
// @namespace          Leovikii
// @version            1.0.0
// @author             Leovikii
// @description        Extract RJ codes on South Plus forums, automatically fetch and display DLSite work information.
// @description:zh     在南+论坛提取RJ号，自动获取并显示DLSite作品信息。
// @description:zh-CN  在南+论坛提取RJ号，自动获取并显示DLSite作品信息。
// @license            ISC
// @match              *://*.south-plus.net/read.php*
// @match              *://*.south-plus.net/thread.php*
// @match              *://*.spring-plus.net/read.php*
// @match              *://*.spring-plus.net/thread.php*
// @match              *://*.level-plus.net/read.php*
// @match              *://*.level-plus.net/thread.php*
// @match              *://*.imoutolove.me/read.php*
// @match              *://*.imoutolove.me/thread.php*
// @require            https://cdnjs.cloudflare.com/ajax/libs/js-sha256/0.11.0/sha256.min.js
// @connect            dlsite.com
// @connect            media.ci-en.jp
// @connect            *
// @grant              GM.xmlHttpRequest
// @grant              GM_addElement
// @grant              GM_addStyle
// @grant              GM_deleteValue
// @grant              GM_getValue
// @grant              GM_openInTab
// @grant              GM_setClipboard
// @grant              GM_setValue
// @grant              GM_xmlhttpRequest
// @run-at             document-start
// ==/UserScript==

(function() {
	"use strict";
	var s = new Set();
	var _css = async (t) => {
		if (s.has(t)) return;
		s.add(t);
		((c) => {
			if (typeof GM_addStyle === "function") GM_addStyle(c);
			else (document.head || document.documentElement).appendChild(document.createElement("style")).append(c);
		})(t);
	};
	_css(" /*$vite$:1*/ ");
	var localizationMap = {
		notice_update: {
			zh_CN: "VoiceLinks公告更新，可能包含重要的新功能说明，是否跳转至说明页面？\n\n注意：如果你需要仓库检查功能，请查看说明页面。",
			zh_TW: "VoiceLinks公告更新，可能包含重要的新功能説明，是否跳轉至説明頁面？\n\n注意：如果你需要仓库检查功能，请查看说明页面。",
			en_US: "VoiceLinks Notice Update, may contain important new features, do you want to jump to the notice page?\n\nNote: If you need repo check (kikoeru), please check notice page."
		},
		title_settings: {
			zh_CN: "VoiceLinks 设置",
			zh_TW: "VoiceLinks 設定",
			en_US: "VoiceLinks Settings"
		},
		title_language_settings: {
			zh_CN: "语言设置",
			zh_TW: "語言設定",
			en_US: "Language Settings"
		},
		display_language: {
			zh_CN: "显示语言",
			zh_TW: "顯示語言",
			en_US: "Language"
		},
		popup_language: {
			zh_CN: "弹窗语言",
			zh_TW: "彈窗語言",
			en_US: "Popup Language"
		},
		popup_language_tooltip: {
			zh_CN: "仅修改标题和标签显示语言，信息本身的语言以DLSite网页设置的语言为准。",
			zh_TW: "只修改標題和標籤顯示語言，資訊本身的語言以DLSite網頁設定的語言為準。",
			en_US: "Only modify the title and tag display language, the language of the information itself is determined by the language of the DLSite page settings."
		},
		title_general_settings: {
			zh_CN: "常规",
			zh_TW: "常規",
			en_US: "General"
		},
		parse_url: {
			zh_CN: "解析URL",
			zh_TW: "解析URL",
			en_US: "Parse URL"
		},
		parse_url_tooltip: {
			zh_CN: "鼠标悬停导指向DLSite作品页面的URL时，同样显示作品信息",
			zh_TW: "鼠標懸停導向DLSite作品頁面的URL時，同樣顯示作品資訊",
			en_US: "Show work info when hovering over DLSite work URL"
		},
		parse_url_in_dl: {
			zh_CN: "在DLSite上解析URL",
			zh_TW: "在DLSite上解析URL",
			en_US: "Parse URL in DLSite"
		},
		parse_url_in_dl_tooltip: {
			zh_CN: "URL较多可能影响正常阅读",
			zh_TW: "URL較多可能影響正常閱讀",
			en_US: "URL is more likely to affect normal reading"
		},
		show_translated_title_in_dl: {
			zh_CN: "在DLSite显示对应语言的翻译标题",
			zh_TW: "在DLSite顯示對應語言的翻譯標題",
			en_US: "Show translated title in DLSite"
		},
		show_translated_title_in_dl_tooltip: {
			zh_CN: "作品信息页面的标题将会被修改为与翻译语言对应的标题，避免简中看繁中作品标题为日文的问题",
			zh_TW: "作品資訊頁面的標題將會被修改為與翻譯語言對應的標題，避免繁中看簡中作品標題為日文的問題",
			en_US: "The title of the work info page will be modified to match the corresponding translation language, to avoid viewing the title as Japanese when viewing a work in non-English language."
		},
		copy_as_filename_btn: {
			zh_CN: "“复制为有效文件名”按钮",
			zh_TW: "“複製為有效檔案名”按鈕",
			en_US: "\"Copy as filename\" button"
		},
		copy_as_filename_btn_tooltip: {
			zh_CN: "鼠标悬停至DLSite作品标题部分将会出现该按钮，点击即可将标题复制为有效文件名，有效文件名指的是会将标题中的非法部分用相似的符号代替",
			zh_TW: "鼠標懸停至DLSite作品標題部分將會出現按鈕，點擊即可將標題複製為有效檔案名，有效檔案名指的是會將標題中的非法部分用相似的符號代替",
			en_US: "Show button when hovering over DLSite work title. Clicking it will copy the title to a valid filename, which will replace the illegal part of the title with similar symbols."
		},
		show_compatibility_warning: {
			zh_CN: "显示兼容性警告",
			zh_TW: "顯示兼容性警告",
			en_US: "Show compatibility warning"
		},
		show_compatibility_warning_tooltip: {
			zh_CN: "如果脚本中，修改DLSite页面元素的功能覆盖了其它脚本的修改，则会触发该弹窗警告",
			zh_TW: "如果腳本中，修改DLSite頁面元素的功能覆蓋了其它腳本的修改，则會觸發該彈窗警告",
			en_US: "If the script modifies the functionality of DLSite elements that are covered by other scripts, the warning will be triggered"
		},
		url_insert_mode: {
			zh_CN: "导向文本的插入方式",
			zh_TW: "導向文本的插入方式",
			en_US: "Type of the insertion"
		},
		url_insert_mode_tooltip: {
			zh_CN: "如果某段链接中的RJ号被解析成功，为了保证原链接不被完全覆盖，会根据需要，在URL的文本前/后插入特定导向文本",
			zh_TW: "如果某段連結中的RJ號被解析成功，為了保證原連結不被完全覆蓋，會根據需要，在URL的文本前/後插入特定導向文本",
			en_US: "If the RJ number in a link is parsed successfully, it is necessary to insert a specific text in the URL before/after the link when the link is almost completely covered by the script"
		},
		url_insert_mode_none: {
			zh_CN: "不插入",
			zh_TW: "不插入",
			en_US: "None"
		},
		url_insert_mode_prefix: {
			zh_CN: "前缀插入代替原链接",
			zh_TW: "前綴插入代替原連結",
			en_US: "Insert before the link as original link."
		},
		url_insert_mode_before_rj: {
			zh_CN: "插入到RJ号前代替RJ链接",
			zh_TW: "插入到RJ號前代替RJ連結",
			en_US: "Insert before the RJ link as the RJ link."
		},
		url_insert_text: {
			zh_CN: "导向文本",
			zh_TW: "導向文本",
			en_US: "Text to insert"
		},
		sfw_mode: {
			zh_CN: "SFW 模式",
			zh_TW: "SFW 模式",
			en_US: "SFW Mode"
		},
		sfw_mode_tooltip: {
			zh_CN: "启用后，所有作品封面均会模糊处理（固定窗口时将鼠标移动到图片上可临时去除模糊）",
			zh_TW: "啟用後，所有作品封面均會模糊處理（固定視窗時將滑鼠移動到圖片上可暫時去除模糊）",
			en_US: "Turn on to blur the cover of all works (temporarily remove the blur by moving the mouse over the image when the window is fixed)."
		},
		sfw_blur_level: {
			zh_CN: "模糊程度",
			zh_TW: "模糊程度",
			en_US: "Blur level"
		},
		sfw_remove_when_hover: {
			zh_CN: "鼠标移到图片上时移除模糊",
			zh_TW: "滑鼠移到圖片上時移除模糊",
			en_US: "Remove the blur when the mouse moves over the image"
		},
		sfw_blur_transition: {
			zh_CN: "模糊动画（卡顿请关闭）",
			zh_TW: "模糊動畫（卡頓請關閉）",
			en_US: "Blur animation"
		},
		low: {
			zh_CN: "低 - 仅模糊细节",
			zh_TW: "低 - 僅模糊細節",
			en_US: "Low - Only blur details"
		},
		medium: {
			zh_CN: "中 - 依稀可见",
			zh_TW: "中 - 依稀可見",
			en_US: "Medium - Hard to see"
		},
		high: {
			zh_CN: "高 - 完全无法辨认",
			zh_TW: "高 - 完全無法辨識",
			en_US: "High - Unrecognizable"
		},
		title_info_settings: {
			zh_CN: "信息显示",
			zh_TW: "信息顯示",
			en_US: "Info Display"
		},
		category_preset: {
			zh_CN: "类别预设",
			zh_TW: "類別預設",
			en_US: "Category Preset"
		},
		category_preset_tooltip: {
			zh_CN: "使不同类别的作品根据需要显示不同的信息<br/><br/>注意：即使勾选了显示，若作品中不存在该信息则也会隐藏。",
			zh_TW: "使不同類別的作品根據需要顯示不同的信息<br/><br/>注意：即使勾選了顯示，若作品中不存在該信息則也會隱藏。",
			en_US: "Show the information of different categories of works. <br/><br/>Note: even if checked, the information of a work that does not exist will be hidden."
		},
		rate: {
			zh_CN: "评分",
			zh_TW: "評分",
			en_US: "Rate"
		},
		rate_tooltip: {
			zh_CN: "星数★ (评分人数 (设置开启))",
			zh_TW: "星數★ (評分人數 (設置開啟))",
			en_US: "Star★ (number of ratings (enable in settings))"
		},
		dl_count: {
			zh_CN: "销量",
			zh_TW: "銷量",
			en_US: "Sales"
		},
		circle_name: {
			zh_CN: "社团名",
			zh_TW: "社團名",
			en_US: "Circle Name"
		},
		translator_name: {
			zh_CN: "翻译者",
			zh_TW: "翻譯者",
			en_US: "Translator"
		},
		release_date: {
			zh_CN: "发售日",
			zh_TW: "發售日",
			en_US: "Release Date"
		},
		update_date: {
			zh_CN: "更新日",
			zh_TW: "更新日",
			en_US: "Update Date"
		},
		age_rating: {
			zh_CN: "年龄指定",
			zh_TW: "年齡指定",
			en_US: "Age Rating"
		},
		scenario: {
			zh_CN: "剧情",
			zh_TW: "劇情",
			en_US: "Scenario"
		},
		illustration: {
			zh_CN: "插画",
			zh_TW: "插圖",
			en_US: "Illustration"
		},
		voice_actor: {
			zh_CN: "声优",
			zh_TW: "聲優",
			en_US: "Voice Actor"
		},
		music: {
			zh_CN: "音乐",
			zh_TW: "音樂",
			en_US: "Music"
		},
		genre: {
			zh_CN: "分类",
			zh_TW: "分類",
			en_US: "Genre"
		},
		file_size: {
			zh_CN: "文件容量",
			zh_TW: "檔案容量",
			en_US: "File Size"
		},
		title_tag_settings: {
			zh_CN: "标签显示",
			zh_TW: "標籤顯示",
			en_US: "Tag Display"
		},
		tag_main_switch: {
			zh_CN: "标签总开关",
			zh_TW: "標籤總開關",
			en_US: "Tag Main Switch"
		},
		tag_main_switch_tooltip: {
			zh_CN: "关闭则所有标签均不显示",
			zh_TW: "關閉則所有標籤都不顯示",
			en_US: "If turned off, all tags will not be displayed"
		},
		tag_work_type: {
			zh_CN: "作品类型",
			zh_TW: "作品類型",
			en_US: "Work Type"
		},
		work_type_game: {
			zh_CN: "游戏",
			zh_TW: "遊戲",
			en_US: "Game"
		},
		work_type_comic: {
			zh_CN: "漫画",
			zh_TW: "漫畫",
			en_US: "Manga"
		},
		work_type_illustration: {
			zh_CN: "CG・插画",
			zh_TW: "CG・插畫",
			en_US: "CG + Illustrations"
		},
		work_type_novel: {
			zh_CN: "小说",
			zh_TW: "小說",
			en_US: "Novel"
		},
		work_type_video: {
			zh_CN: "视频",
			zh_TW: "影片",
			en_US: "Video"
		},
		work_type_voice: {
			zh_CN: "音声・ASMR",
			zh_TW: "聲音作品・ASMR",
			en_US: "Voice / ASMR"
		},
		work_type_music: {
			zh_CN: "音乐",
			zh_TW: "音樂",
			en_US: "Music"
		},
		work_type_tool: {
			zh_CN: "工具/装饰",
			zh_TW: "工具/配件",
			en_US: "Tools / Accessories"
		},
		work_type_voice_comic: {
			zh_CN: "音声漫画",
			zh_TW: "有聲漫畫",
			en_US: "Voiced Comics"
		},
		work_type_other: {
			zh_CN: "其他",
			zh_TW: "其他",
			en_US: "Miscellaneous"
		},
		tag_translatable: {
			zh_CN: "可翻译",
			zh_TW: "可翻譯",
			en_US: "Translatable"
		},
		tag_translatable_tooltip: {
			zh_CN: "大家一起来翻译 授权作品",
			zh_TW: "大家一起翻譯 授权作品",
			en_US: "Translators Unite translation permitted work"
		},
		tag_not_translatable: {
			zh_CN: "不可翻译",
			zh_TW: "不可翻譯",
			en_US: "Not Translatable"
		},
		tag_not_translatable_tooltip: {
			zh_CN: "未授权 大家一起来翻译",
			zh_TW: "未授權 大家一起來翻譯",
			en_US: "Not Translators Unite translation permitted work"
		},
		tag_translated: {
			zh_CN: "翻译作品",
			zh_TW: "翻譯作品",
			en_US: "Translated"
		},
		tag_translated_tooltip: {
			zh_CN: "当前作品为 大家一起来翻译 作品",
			zh_TW: "當前作品為 大家一起來翻譯 作品",
			en_US: "Current work is Translators Unite translation work"
		},
		tag_language_support: {
			zh_CN: "语言支持",
			zh_TW: "語言支援",
			en_US: "Language Support"
		},
		language_japanese: {
			zh_CN: "日文",
			zh_TW: "日文",
			en_US: "Japanese"
		},
		language_english: {
			zh_CN: "英文",
			zh_TW: "英文",
			en_US: "English"
		},
		language_korean: {
			zh_CN: "韩语",
			zh_TW: "韓語",
			en_US: "Korean"
		},
		language_simplified_chinese: {
			zh_CN: "简体中文",
			zh_TW: "簡體中文",
			en_US: "Simplified Chinese"
		},
		language_traditional_chinese: {
			zh_CN: "繁体中文",
			zh_TW: "繁體中文",
			en_US: "Traditional Chinese"
		},
		language_german: {
			zh_CN: "德语",
			zh_TW: "德語",
			en_US: "German"
		},
		language_french: {
			zh_CN: "法语",
			zh_TW: "法語",
			en_US: "French"
		},
		language_russian: {
			zh_CN: "俄语",
			zh_TW: "俄語",
			en_US: "Russian"
		},
		language_spanish: {
			zh_CN: "西班牙语",
			zh_TW: "西班牙語",
			en_US: "Spanish"
		},
		language_indonesian: {
			zh_CN: "印尼文",
			zh_TW: "印尼文",
			en_US: "Indonesian"
		},
		language_italian: {
			zh_CN: "意大利语",
			zh_TW: "義大利語",
			en_US: "Italian"
		},
		language_arabic: {
			zh_CN: "阿拉伯语",
			zh_TW: "阿拉伯語",
			en_US: "Arabic"
		},
		language_portuguese: {
			zh_CN: "葡萄牙语",
			zh_TW: "葡萄牙語",
			en_US: "Portuguese"
		},
		language_finnish: {
			zh_CN: "芬兰语",
			zh_TW: "芬蘭語",
			en_US: "Finnish"
		},
		language_polish: {
			zh_CN: "波兰语",
			zh_TW: "波蘭語",
			en_US: "Polish"
		},
		language_swedish: {
			zh_CN: "瑞典文",
			zh_TW: "瑞典文",
			en_US: "Swedish"
		},
		language_thai: {
			zh_CN: "泰语",
			zh_TW: "泰語",
			en_US: "Thai"
		},
		language_vietnamese: {
			zh_CN: "越南语",
			zh_TW: "越南語",
			en_US: "Vietnamese"
		},
		language_japanese_abbr: {
			zh_CN: "日",
			zh_TW: "日",
			en_US: "JP"
		},
		language_english_abbr: {
			zh_CN: "英",
			zh_TW: "英",
			en_US: "EN"
		},
		language_korean_abbr: {
			zh_CN: "韩",
			zh_TW: "韩",
			en_US: "KO"
		},
		language_simplified_chinese_abbr: {
			zh_CN: "简中",
			zh_TW: "簡中",
			en_US: "ZH"
		},
		language_traditional_chinese_abbr: {
			zh_CN: "繁中",
			zh_TW: "繁中",
			en_US: "TW"
		},
		language_german_abbr: {
			zh_CN: "德",
			zh_TW: "德",
			en_US: "DE"
		},
		language_french_abbr: {
			zh_CN: "法",
			zh_TW: "法",
			en_US: "FR"
		},
		language_spanish_abbr: {
			zh_CN: "西",
			zh_TW: "西",
			en_US: "ES"
		},
		language_indonesian_abbr: {
			zh_CN: "印",
			zh_TW: "印",
			en_US: "ID"
		},
		language_italian_abbr: {
			zh_CN: "意",
			zh_TW: "意",
			en_US: "IT"
		},
		language_portuguese_abbr: {
			zh_CN: "葡",
			zh_TW: "葡",
			en_US: "PT"
		},
		language_swedish_abbr: {
			zh_CN: "瑞典",
			zh_TW: "瑞典",
			en_US: "SV"
		},
		language_thai_abbr: {
			zh_CN: "泰",
			zh_TW: "泰",
			en_US: "TH"
		},
		language_vietnamese_abbr: {
			zh_CN: "越",
			zh_TW: "越",
			en_US: "VN"
		},
		show_rate_count: {
			zh_CN: "显示评分人数",
			zh_TW: "顯示評分人數",
			en_US: "Show Rate Count"
		},
		tag_translation_request: {
			zh_CN: "翻译申请情况",
			zh_TW: "翻譯申請情况",
			en_US: "Translation Request"
		},
		tag_translation_request_tooltip: {
			zh_CN: "当前作品目前的翻译申请情况，格式为：语言简写 申请数-发售数",
			zh_TW: "當前作品目前的翻譯申請情況，格式為：语言簡稱 申請數-發售數",
			en_US: "Current work's translation request. Format: Language_Abbr Number_of_Requests - Number_of_Sales"
		},
		tag_bonus_work: {
			zh_CN: "特典",
			zh_TW: "特典",
			en_US: "Bonus"
		},
		tag_bonus_work_tooltip: {
			zh_CN: "当前作品是某部作品的特典",
			zh_TW: "當前作品是某部作品的特典",
			en_US: "Current work is a bonus work"
		},
		tag_has_bonus: {
			zh_CN: "有特典",
			zh_TW: "有特典",
			en_US: "Has Bonus"
		},
		tag_has_bonus_tooltip: {
			zh_CN: "当前作品目前附赠特典，若特典已下架则不会显示该标签",
			zh_TW: "當前作品目前附赠特典，若特典已下架則不會顯示該標籤",
			en_US: "Current work has bonus. If bonus is not available, the tag will not be displayed."
		},
		tag_file_format: {
			zh_CN: "文件格式",
			zh_TW: "檔案形式",
			en_US: "File Format"
		},
		tag_file_format_tooltip: {
			zh_CN: "WAV、EXE、MP3等",
			zh_TW: "WAV、EXE、MP3等",
			en_US: "WAV, EXE, MP3, etc."
		},
		tag_no_longer_available: {
			zh_CN: "已下架",
			zh_TW: "已下架",
			en_US: "Unavailable"
		},
		tag_announce: {
			zh_CN: "预告",
			zh_TW: "預告",
			en_US: "Announce"
		},
		tag_ai: {
			zh_CN: "AI & 部分AI",
			zh_TW: "AI & 部分AI",
			en_US: "AI & Partial AI"
		},
		tag_aig: {
			zh_CN: "AI生成",
			zh_TW: "AI生成",
			en_US: "AI Gen"
		},
		tag_aip: {
			zh_CN: "AI部分使用",
			zh_TW: "AI部分使用",
			en_US: "AI Partial"
		},
		tag_ai_tooltip: {
			zh_CN: "全部或部分使用AI的作品",
			zh_TW: "全部或部分使用AI的作品",
			en_US: "Full or partial use of AI"
		},
		button_save: {
			zh_CN: "保存设置",
			zh_TW: "保存設置",
			en_US: "Save"
		},
		button_cancel: {
			zh_CN: "取消设置",
			zh_TW: "取消設置",
			en_US: "Cancel"
		},
		button_reset: {
			zh_CN: "重置设置",
			zh_TW: "重置設置",
			en_US: "Reset"
		},
		need_reorder: {
			zh_CN: "检测到设置更新，可能添加了新的信息位，请重新设置对应设置项的排列",
			zh_TW: "檢查到設置更新，可能添加了新的信息位，请重新設置對應設置項的排列",
			en_US: "There is a new setting item added. Please reorder the corresponding setting item"
		},
		save_complete: {
			zh_CN: "设置已保存，部分设置需要刷新对应页面以生效",
			zh_TW: "設置已保存，部分設置需要刷新對應頁面以生效",
			en_US: "Settings saved, some settings need to refresh the corresponding page to take effect"
		},
		save_failed: {
			zh_CN: "设置保存失败",
			zh_TW: "設置保存失敗",
			en_US: "Settings save failed"
		},
		reset_confirm: {
			zh_CN: "确定要将设置重置到最初始的状态吗？（重置后，需要再点击保存才会生效）",
			zh_TW: "確定要將設置重置到最初始的狀態嗎？（重置後，需要再點擊保存才會生效）",
			en_US: "Are you sure you want to reset the settings to the initial state? (After resetting, you need to click Save to take effect)"
		},
		reset_complete: {
			zh_CN: "设置已重置",
			zh_TW: "設置已重置",
			en_US: "Settings reset"
		},
		reset_failed: {
			zh_CN: "设置重置失败",
			zh_TW: "設置重置失敗",
			en_US: "Settings reset failed"
		},
		reset_order: {
			zh_CN: "重置顺序",
			zh_TW: "重置順序",
			en_US: "Reset Order"
		},
		reset_order_confirm: {
			zh_CN: "确定要将元素顺序重置到最初始的状态吗？",
			zh_TW: "確定要將元素順序重置到最初始的狀態嗎？",
			en_US: "Are you sure you want to reset the element order to the initial state?"
		},
		reset_order_and_setting: {
			zh_CN: "重置元素顺序和各自的设置值",
			zh_TW: "重置元素順序和各自的設置值",
			en_US: "Reset element order and their settings"
		},
		hint_pin: {
			zh_CN: "按住{pin_key}以固定弹框，固定时可复制信息",
			zh_TW: "按住{pin_key}以固定彈窗，固定時可複製資訊",
			en_US: "Hold {pin_key} to pin the popup, info can be copied."
		},
		hint_unpin: {
			zh_CN: "抬起{pin_key}以关闭弹框 & 查看其它作品RJ信息",
			zh_TW: "抬起{pin_key}以關閉彈窗 & 查看其它作品RJ信息",
			en_US: "Release {pin_key} to close the popup & view other works."
		},
		hint_copy: {
			zh_CN: "左键单击以复制信息",
			zh_TW: "左鍵單擊以複製資訊",
			en_US: "Left click to copy info."
		},
		hint_copy_all: {
			zh_CN: "左键单击以复制内部所有信息",
			zh_TW: "左鍵單擊以複製內部所有資訊",
			en_US: "Left click to copy all contained info."
		},
		hint_copy_work_title: {
			zh_CN: "单击复制标题，Alt+单击复制为有效文件名",
			zh_TW: "單擊複製標題，Alt+單擊複製為有效檔名",
			en_US: "Click to copy title, Alt+click to copy as valid filename."
		},
		search_result_this: {
			zh_CN: "本作",
			zh_TW: "本作",
			en_US: "This"
		},
		search_result_this_lang: {
			zh_CN: "该语言",
			zh_TW: "该语言",
			en_US: "Lang"
		},
		search_result_orig: {
			zh_CN: "原版",
			zh_TW: "原版",
			en_US: "Orig"
		},
		search_result_translation: {
			zh_CN: "翻译",
			zh_TW: "翻译",
			en_US: "🌐"
		},
		get: function(key) {
			let lang = navigator.language.toLowerCase();
			let langKey = "en_US";
			if (lang.includes("zh")) if (lang.includes("cn") || lang.includes("sg") || lang === "zh") langKey = "zh_CN";
			else langKey = "zh_TW";
			return typeof key === "string" ? localizationMap[key]?.[langKey] : key[langKey];
		}
	};
	function localizePopup(key) {
		return localizationMap.get(key);
	}
	var RJ_REGEX = new RegExp("(R[JE][0-9]{8})|(R[JE][0-9]{6})|([VB]J[0-9]{8})|([VB]J[0-9]{6})", "gi");
	var URL_REGEX = new RegExp("dlsite.com/.*/product_id/((R[JE][0-9]{8})|(R[JE][0-9]{6})|([VB]J[0-9]{8})|([VB]J[0-9]{6}))", "g");
	var VOICELINK_CLASS = "voicelink-" + Math.random().toString(36).slice(2);
	var VOICELINK_IGNORED_CLASS = `${VOICELINK_CLASS}_ignored`;
	var RJCODE_ATTRIBUTE = "rjcode";
	var LANG_MAP = {
		JPN: localizePopup(localizationMap.language_japanese),
		ENG: localizePopup(localizationMap.language_english),
		CHI_HANS: localizePopup(localizationMap.language_simplified_chinese),
		CHI_HANT: localizePopup(localizationMap.language_traditional_chinese),
		KO_KR: localizePopup(localizationMap.language_korean),
		SPA: localizePopup(localizationMap.language_spanish),
		FRE: localizePopup(localizationMap.language_french),
		RUS: localizePopup(localizationMap.language_russian),
		THA: localizePopup(localizationMap.language_thai),
		GER: localizePopup(localizationMap.language_german),
		FIN: localizePopup(localizationMap.language_finnish),
		POR: localizePopup(localizationMap.language_portuguese),
		VIE: localizePopup(localizationMap.language_vietnamese),
		ITA: localizePopup(localizationMap.language_italian),
		ARA: localizePopup(localizationMap.language_arabic),
		POL: localizePopup(localizationMap.language_polish)
	};
	localizePopup(localizationMap.language_japanese_abbr), localizePopup(localizationMap.language_english_abbr), localizePopup(localizationMap.language_simplified_chinese_abbr), localizePopup(localizationMap.language_traditional_chinese_abbr), localizePopup(localizationMap.language_korean_abbr), localizePopup(localizationMap.language_spanish_abbr), localizePopup(localizationMap.language_french_abbr), localizePopup(localizationMap.language_thai_abbr), localizePopup(localizationMap.language_german_abbr), localizePopup(localizationMap.language_portuguese_abbr), localizePopup(localizationMap.language_vietnamese_abbr), localizePopup(localizationMap.language_italian_abbr);
	var POPUP_CSS = `
    .${VOICELINK_CLASS}_voicepopup {
        min-width: 630px !important;
        z-index: 2147483646 !important;
        max-width: 80% !important;
        position: fixed !important;
        line-height: normal !important;  /*原1.4em !important;*/
        font-size:1.1em!important;
        margin-bottom: 10px !important;
        box-shadow: 0 0 .125em 0 rgba(0,0,0,.5) !important;
        border-radius: 0.5em !important;
        background-color:#8080C0 !important;
        color:#F6F6F6 !important;
        text-align: left !important;
        padding: 10px !important;
        pointer-events: none !important;
    }
    
    .${VOICELINK_CLASS}_voicepopup[pin][mouse-in] *[copy-text] {
        text-decoration: underline !important;
        cursor: pointer !important;
    }
    .${VOICELINK_CLASS}_voicepopup[pin][mouse-in] *[copy-text]:active {
        opacity: 0.5 !important;
    }
    
    #${VOICELINK_CLASS}_info-container {
        font-size: 1em !important;
    }
    #${VOICELINK_CLASS}_info-container > div {
        margin-bottom: 3px !important;
        font-size: 1em !important;
    }
    #${VOICELINK_CLASS}_info-container > div > a {
        display: inline;
    }
    #${VOICELINK_CLASS}_info-container > div > .info-title {
        margin-right: 5px !important;
        display: inline-block;
    }
    #${VOICELINK_CLASS}_info-container > div > .info-title::after {
        content: ":" !important;
        text-decoration: none !important;
        display: inline-block !important;
    }
    #${VOICELINK_CLASS}_info-container .${VOICELINK_CLASS}_tags {
        margin-top: 12px !important;
        margin-bottom: 0 !important;
        font-size: 0.909091em !important;
    }
    
    .${VOICELINK_CLASS}_loader {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 100% !important;
        height: 100% !important;
        min-width: 300px !important;
        min-height: 30px !important;
        z-index: -1 !important;
    }
    .${VOICELINK_CLASS}_dot {
        width: 20px !important;
        height: 20px !important;
        margin: 0 8px !important;
        background-color: #fbfbfb !important;
        border-radius: 50% !important;
        animation: ${VOICELINK_CLASS}_scale 1s infinite !important;
    }
    .${VOICELINK_CLASS}_dot:nth-child(1) {
        animation-delay: 0s !important;
    }
    .${VOICELINK_CLASS}_dot:nth-child(2) {
        animation-delay: 0.2s !important;
    }
    .${VOICELINK_CLASS}_dot:nth-child(3) {
        animation-delay: 0.4s !important;
    }
    @keyframes ${VOICELINK_CLASS}_scale {
      0%, 100% {
          transform: scale(1);
      }
      50% {
          transform: scale(1.5);
      }
    }
    
    .${VOICELINK_CLASS}_voicepopup-maniax{
        background-color:#8080C0 !important;
    }
    
    .${VOICELINK_CLASS}_voicepopup-girls{
        background-color:#B33761 !important;
    }
    
    .${VOICELINK_CLASS}_voicepopup .${VOICELINK_CLASS}_left_panel{
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        margin: 0 16px 0 0 !important;
        width: 310px !important;
        flex-shrink: 0 !important;
    }
    
    .${VOICELINK_CLASS}_voicepopup .${VOICELINK_CLASS}_img_container{
        width: 100% !important;
        padding: 3px !important;
        position: relative;
    }

    .${VOICELINK_CLASS}_img_container img {
        width: 100% !important;
        height: auto !important;
    }
    
    #${VOICELINK_CLASS}_hint {
        font-size: 0.8em !important;
        opacity: 0.5 !important;
        max-width: 300px !important;
        margin-top: 5px !important;
    }
    
    .${VOICELINK_CLASS}_voicepopup a {
        text-decoration: none !important;
        color: pink !important;
    }
    
    .${VOICELINK_CLASS}_voicepopup .${VOICELINK_CLASS}_age-18{
        color: hsl(300deg 76% 77%) !important;
    }
    
    .${VOICELINK_CLASS}_voicepopup .${VOICELINK_CLASS}_age-all{
        color: hsl(157deg 82% 52%) !important;
    }

    .${VOICELINK_CLASS}_voice-title {
        font-size: 1.363636em !important;   /*原1.4em*/
        font-weight: bold !important;
        text-align: center !important;
        margin: 5px 10px 0 0 !important;
        display: block !important;
    }

    .${VOICELINK_CLASS}_rjcode {
        text-align: center !important;
        margin: 5px 0 !important;
        font-size: 1.2012987em !important;  /*原1.2em !important;*/
        font-style: italic !important;
        opacity: 0.3 !important;
    }

    .${VOICELINK_CLASS}_error {
        height: 210px !important;
        line-height: 210px !important;
        text-align: center !important;
    }

    .${VOICELINK_CLASS}_discord-dark {
        background-color: #36393f !important;
        color: #dcddde !important;
        font-size: 0.9375rem !important;
    }
    
    .${VOICELINK_CLASS}_work_title:hover #${VOICELINK_CLASS}_copy_btn {
        opacity: 1 !important;
    }
    
    #${VOICELINK_CLASS}_copy_btn {
        background: transparent !important;
        border-color: transparent !important;
        cursor: pointer !important;
        transition: all 0.3s !important;
        opacity: 0 !important;
        font-size: 0.75em !important;
        user-select: none !important;
        position: absolute !important;
    }
    
    #${VOICELINK_CLASS}_copy_btn:hover {
        scale: 1.2 !important;
    }
    
    #${VOICELINK_CLASS}_copy_btn:active {
        scale: 1.1 !important;
    }
    
  `;
	`${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}${VOICELINK_CLASS}`;
	function makeMap(str) {
		const map = Object.create(null);
		for (const key of str.split(",")) map[key] = 1;
		return (val) => val in map;
	}
	var EMPTY_OBJ = {};
	var EMPTY_ARR = [];
	var NOOP = () => {};
	var NO = () => false;
	var isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
	var isModelListener = (key) => key.startsWith("onUpdate:");
	var extend = Object.assign;
	var remove = (arr, el) => {
		const i = arr.indexOf(el);
		if (i > -1) arr.splice(i, 1);
	};
	var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
	var hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
	var isArray = Array.isArray;
	var isMap = (val) => toTypeString(val) === "[object Map]";
	var isSet = (val) => toTypeString(val) === "[object Set]";
	var isDate = (val) => toTypeString(val) === "[object Date]";
	var isFunction = (val) => typeof val === "function";
	var isString = (val) => typeof val === "string";
	var isSymbol = (val) => typeof val === "symbol";
	var isObject = (val) => val !== null && typeof val === "object";
	var isPromise = (val) => {
		return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
	};
	var objectToString = Object.prototype.toString;
	var toTypeString = (value) => objectToString.call(value);
	var toRawType = (value) => {
		return toTypeString(value).slice(8, -1);
	};
	var isPlainObject = (val) => toTypeString(val) === "[object Object]";
	var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
	var isReservedProp = makeMap(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted");
	var cacheStringFunction = (fn) => {
		const cache = Object.create(null);
		return ((str) => {
			return cache[str] || (cache[str] = fn(str));
		});
	};
	var camelizeRE = /-\w/g;
	var camelize = cacheStringFunction((str) => {
		return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
	});
	var hyphenateRE = /\B([A-Z])/g;
	var hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
	var capitalize = cacheStringFunction((str) => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	});
	var toHandlerKey = cacheStringFunction((str) => {
		return str ? `on${capitalize(str)}` : ``;
	});
	var hasChanged = (value, oldValue) => !Object.is(value, oldValue);
	var invokeArrayFns = (fns, ...arg) => {
		for (let i = 0; i < fns.length; i++) fns[i](...arg);
	};
	var def = (obj, key, value, writable = false) => {
		Object.defineProperty(obj, key, {
			configurable: true,
			enumerable: false,
			writable,
			value
		});
	};
	var looseToNumber = (val) => {
		const n = parseFloat(val);
		return isNaN(n) ? val : n;
	};
	var _globalThis;
	var getGlobalThis = () => {
		return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	};
	function normalizeStyle(value) {
		if (isArray(value)) {
			const res = {};
			for (let i = 0; i < value.length; i++) {
				const item = value[i];
				const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
				if (normalized) for (const key in normalized) res[key] = normalized[key];
			}
			return res;
		} else if (isString(value) || isObject(value)) return value;
	}
	var listDelimiterRE = /;(?![^(]*\))/g;
	var propertyDelimiterRE = /:([^]+)/;
	var styleCommentRE = /\/\*[^]*?\*\//g;
	function parseStringStyle(cssText) {
		const ret = {};
		cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
			if (item) {
				const tmp = item.split(propertyDelimiterRE);
				tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
			}
		});
		return ret;
	}
	function normalizeClass(value) {
		let res = "";
		if (isString(value)) res = value;
		else if (isArray(value)) for (let i = 0; i < value.length; i++) {
			const normalized = normalizeClass(value[i]);
			if (normalized) res += normalized + " ";
		}
		else if (isObject(value)) {
			for (const name in value) if (value[name]) res += name + " ";
		}
		return res.trim();
	}
	var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
	var isSpecialBooleanAttr = makeMap(specialBooleanAttrs);
	specialBooleanAttrs + "";
	function includeBooleanAttr(value) {
		return !!value || value === "";
	}
	function looseCompareArrays(a, b) {
		if (a.length !== b.length) return false;
		let equal = true;
		for (let i = 0; equal && i < a.length; i++) equal = looseEqual(a[i], b[i]);
		return equal;
	}
	function looseEqual(a, b) {
		if (a === b) return true;
		let aValidType = isDate(a);
		let bValidType = isDate(b);
		if (aValidType || bValidType) return aValidType && bValidType ? a.getTime() === b.getTime() : false;
		aValidType = isSymbol(a);
		bValidType = isSymbol(b);
		if (aValidType || bValidType) return a === b;
		aValidType = isArray(a);
		bValidType = isArray(b);
		if (aValidType || bValidType) return aValidType && bValidType ? looseCompareArrays(a, b) : false;
		aValidType = isObject(a);
		bValidType = isObject(b);
		if (aValidType || bValidType) {
			if (!aValidType || !bValidType) return false;
			if (Object.keys(a).length !== Object.keys(b).length) return false;
			for (const key in a) {
				const aHasKey = a.hasOwnProperty(key);
				const bHasKey = b.hasOwnProperty(key);
				if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) return false;
			}
		}
		return String(a) === String(b);
	}
	var isRef$1 = (val) => {
		return !!(val && val["__v_isRef"] === true);
	};
	var toDisplayString = (val) => {
		return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef$1(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
	};
	var replacer = (_key, val) => {
		if (isRef$1(val)) return replacer(_key, val.value);
		else if (isMap(val)) return { [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2], i) => {
			entries[stringifySymbol(key, i) + " =>"] = val2;
			return entries;
		}, {}) };
		else if (isSet(val)) return { [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v)) };
		else if (isSymbol(val)) return stringifySymbol(val);
		else if (isObject(val) && !isArray(val) && !isPlainObject(val)) return String(val);
		return val;
	};
	var stringifySymbol = (v, i = "") => {
		var _a;
		return isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v;
	};
	var activeEffectScope;
	var EffectScope = class {
		constructor(detached = false) {
			this.detached = detached;
			this._active = true;
			this._on = 0;
			this.effects = [];
			this.cleanups = [];
			this._isPaused = false;
			this._warnOnRun = true;
			this.__v_skip = true;
			if (!detached && activeEffectScope) if (activeEffectScope.active) {
				this.parent = activeEffectScope;
				this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
			} else {
				this._active = false;
				this._warnOnRun = false;
			}
		}
		get active() {
			return this._active;
		}
		pause() {
			if (this._active) {
				this._isPaused = true;
				let i, l;
				if (this.scopes) for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].pause();
				for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].pause();
			}
		}
		resume() {
			if (this._active) {
				if (this._isPaused) {
					this._isPaused = false;
					let i, l;
					if (this.scopes) for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].resume();
					for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].resume();
				}
			}
		}
		run(fn) {
			if (this._active) {
				const currentEffectScope = activeEffectScope;
				try {
					activeEffectScope = this;
					return fn();
				} finally {
					activeEffectScope = currentEffectScope;
				}
			}
		}
		on() {
			if (++this._on === 1) {
				this.prevScope = activeEffectScope;
				activeEffectScope = this;
			}
		}
		off() {
			if (this._on > 0 && --this._on === 0) {
				if (activeEffectScope === this) activeEffectScope = this.prevScope;
				else {
					let current = activeEffectScope;
					while (current) {
						if (current.prevScope === this) {
							current.prevScope = this.prevScope;
							break;
						}
						current = current.prevScope;
					}
				}
				this.prevScope = void 0;
			}
		}
		stop(fromParent) {
			if (this._active) {
				this._active = false;
				let i, l;
				for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].stop();
				this.effects.length = 0;
				for (i = 0, l = this.cleanups.length; i < l; i++) this.cleanups[i]();
				this.cleanups.length = 0;
				if (this.scopes) {
					for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].stop(true);
					this.scopes.length = 0;
				}
				if (!this.detached && this.parent && !fromParent) {
					const last = this.parent.scopes.pop();
					if (last && last !== this) {
						this.parent.scopes[this.index] = last;
						last.index = this.index;
					}
				}
				this.parent = void 0;
			}
		}
	};
	function getCurrentScope() {
		return activeEffectScope;
	}
	var activeSub;
	var pausedQueueEffects = new WeakSet();
	var ReactiveEffect = class {
		constructor(fn) {
			this.fn = fn;
			this.deps = void 0;
			this.depsTail = void 0;
			this.flags = 5;
			this.next = void 0;
			this.cleanup = void 0;
			this.scheduler = void 0;
			if (activeEffectScope) if (activeEffectScope.active) activeEffectScope.effects.push(this);
			else this.flags &= -2;
		}
		pause() {
			this.flags |= 64;
		}
		resume() {
			if (this.flags & 64) {
				this.flags &= -65;
				if (pausedQueueEffects.has(this)) {
					pausedQueueEffects.delete(this);
					this.trigger();
				}
			}
		}
		notify() {
			if (this.flags & 2 && !(this.flags & 32)) return;
			if (!(this.flags & 8)) batch(this);
		}
		run() {
			if (!(this.flags & 1)) return this.fn();
			this.flags |= 2;
			cleanupEffect(this);
			prepareDeps(this);
			const prevEffect = activeSub;
			const prevShouldTrack = shouldTrack;
			activeSub = this;
			shouldTrack = true;
			try {
				return this.fn();
			} finally {
				cleanupDeps(this);
				activeSub = prevEffect;
				shouldTrack = prevShouldTrack;
				this.flags &= -3;
			}
		}
		stop() {
			if (this.flags & 1) {
				for (let link = this.deps; link; link = link.nextDep) removeSub(link);
				this.deps = this.depsTail = void 0;
				cleanupEffect(this);
				this.onStop && this.onStop();
				this.flags &= -2;
			}
		}
		trigger() {
			if (this.flags & 64) pausedQueueEffects.add(this);
			else if (this.scheduler) this.scheduler();
			else this.runIfDirty();
		}
		runIfDirty() {
			if (isDirty(this)) this.run();
		}
		get dirty() {
			return isDirty(this);
		}
	};
	var batchDepth = 0;
	var batchedSub;
	var batchedComputed;
	function batch(sub, isComputed = false) {
		sub.flags |= 8;
		if (isComputed) {
			sub.next = batchedComputed;
			batchedComputed = sub;
			return;
		}
		sub.next = batchedSub;
		batchedSub = sub;
	}
	function startBatch() {
		batchDepth++;
	}
	function endBatch() {
		if (--batchDepth > 0) return;
		if (batchedComputed) {
			let e = batchedComputed;
			batchedComputed = void 0;
			while (e) {
				const next = e.next;
				e.next = void 0;
				e.flags &= -9;
				e = next;
			}
		}
		let error;
		while (batchedSub) {
			let e = batchedSub;
			batchedSub = void 0;
			while (e) {
				const next = e.next;
				e.next = void 0;
				e.flags &= -9;
				if (e.flags & 1) try {
					e.trigger();
				} catch (err) {
					if (!error) error = err;
				}
				e = next;
			}
		}
		if (error) throw error;
	}
	function prepareDeps(sub) {
		for (let link = sub.deps; link; link = link.nextDep) {
			link.version = -1;
			link.prevActiveLink = link.dep.activeLink;
			link.dep.activeLink = link;
		}
	}
	function cleanupDeps(sub) {
		let head;
		let tail = sub.depsTail;
		let link = tail;
		while (link) {
			const prev = link.prevDep;
			if (link.version === -1) {
				if (link === tail) tail = prev;
				removeSub(link);
				removeDep(link);
			} else head = link;
			link.dep.activeLink = link.prevActiveLink;
			link.prevActiveLink = void 0;
			link = prev;
		}
		sub.deps = head;
		sub.depsTail = tail;
	}
	function isDirty(sub) {
		for (let link = sub.deps; link; link = link.nextDep) if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) return true;
		if (sub._dirty) return true;
		return false;
	}
	function refreshComputed(computed) {
		if (computed.flags & 4 && !(computed.flags & 16)) return;
		computed.flags &= -17;
		if (computed.globalVersion === globalVersion) return;
		computed.globalVersion = globalVersion;
		if (!computed.isSSR && computed.flags & 128 && (!computed.deps && !computed._dirty || !isDirty(computed))) return;
		computed.flags |= 2;
		const dep = computed.dep;
		const prevSub = activeSub;
		const prevShouldTrack = shouldTrack;
		activeSub = computed;
		shouldTrack = true;
		try {
			prepareDeps(computed);
			const value = computed.fn(computed._value);
			if (dep.version === 0 || hasChanged(value, computed._value)) {
				computed.flags |= 128;
				computed._value = value;
				dep.version++;
			}
		} catch (err) {
			dep.version++;
			throw err;
		} finally {
			activeSub = prevSub;
			shouldTrack = prevShouldTrack;
			cleanupDeps(computed);
			computed.flags &= -3;
		}
	}
	function removeSub(link, soft = false) {
		const { dep, prevSub, nextSub } = link;
		if (prevSub) {
			prevSub.nextSub = nextSub;
			link.prevSub = void 0;
		}
		if (nextSub) {
			nextSub.prevSub = prevSub;
			link.nextSub = void 0;
		}
		if (dep.subs === link) {
			dep.subs = prevSub;
			if (!prevSub && dep.computed) {
				dep.computed.flags &= -5;
				for (let l = dep.computed.deps; l; l = l.nextDep) removeSub(l, true);
			}
		}
		if (!soft && !--dep.sc && dep.map) dep.map.delete(dep.key);
	}
	function removeDep(link) {
		const { prevDep, nextDep } = link;
		if (prevDep) {
			prevDep.nextDep = nextDep;
			link.prevDep = void 0;
		}
		if (nextDep) {
			nextDep.prevDep = prevDep;
			link.nextDep = void 0;
		}
	}
	var shouldTrack = true;
	var trackStack = [];
	function pauseTracking() {
		trackStack.push(shouldTrack);
		shouldTrack = false;
	}
	function resetTracking() {
		const last = trackStack.pop();
		shouldTrack = last === void 0 ? true : last;
	}
	function cleanupEffect(e) {
		const { cleanup } = e;
		e.cleanup = void 0;
		if (cleanup) {
			const prevSub = activeSub;
			activeSub = void 0;
			try {
				cleanup();
			} finally {
				activeSub = prevSub;
			}
		}
	}
	var globalVersion = 0;
	var Link = class {
		constructor(sub, dep) {
			this.sub = sub;
			this.dep = dep;
			this.version = dep.version;
			this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
		}
	};
	var Dep = class {
		constructor(computed) {
			this.computed = computed;
			this.version = 0;
			this.activeLink = void 0;
			this.subs = void 0;
			this.map = void 0;
			this.key = void 0;
			this.sc = 0;
			this.__v_skip = true;
		}
		track(debugInfo) {
			if (!activeSub || !shouldTrack || activeSub === this.computed) return;
			let link = this.activeLink;
			if (link === void 0 || link.sub !== activeSub) {
				link = this.activeLink = new Link(activeSub, this);
				if (!activeSub.deps) activeSub.deps = activeSub.depsTail = link;
				else {
					link.prevDep = activeSub.depsTail;
					activeSub.depsTail.nextDep = link;
					activeSub.depsTail = link;
				}
				addSub(link);
			} else if (link.version === -1) {
				link.version = this.version;
				if (link.nextDep) {
					const next = link.nextDep;
					next.prevDep = link.prevDep;
					if (link.prevDep) link.prevDep.nextDep = next;
					link.prevDep = activeSub.depsTail;
					link.nextDep = void 0;
					activeSub.depsTail.nextDep = link;
					activeSub.depsTail = link;
					if (activeSub.deps === link) activeSub.deps = next;
				}
			}
			return link;
		}
		trigger(debugInfo) {
			this.version++;
			globalVersion++;
			this.notify(debugInfo);
		}
		notify(debugInfo) {
			startBatch();
			try {
				for (let link = this.subs; link; link = link.prevSub) if (link.sub.notify()) link.sub.dep.notify();
			} finally {
				endBatch();
			}
		}
	};
	function addSub(link) {
		link.dep.sc++;
		if (link.sub.flags & 4) {
			const computed = link.dep.computed;
			if (computed && !link.dep.subs) {
				computed.flags |= 20;
				for (let l = computed.deps; l; l = l.nextDep) addSub(l);
			}
			const currentTail = link.dep.subs;
			if (currentTail !== link) {
				link.prevSub = currentTail;
				if (currentTail) currentTail.nextSub = link;
			}
			link.dep.subs = link;
		}
	}
	var targetMap = new WeakMap();
	var ITERATE_KEY = Symbol("");
	var MAP_KEY_ITERATE_KEY = Symbol("");
	var ARRAY_ITERATE_KEY = Symbol("");
	function track(target, type, key) {
		if (shouldTrack && activeSub) {
			let depsMap = targetMap.get(target);
			if (!depsMap) targetMap.set(target, depsMap = new Map());
			let dep = depsMap.get(key);
			if (!dep) {
				depsMap.set(key, dep = new Dep());
				dep.map = depsMap;
				dep.key = key;
			}
			dep.track();
		}
	}
	function trigger(target, type, key, newValue, oldValue, oldTarget) {
		const depsMap = targetMap.get(target);
		if (!depsMap) {
			globalVersion++;
			return;
		}
		const run = (dep) => {
			if (dep) dep.trigger();
		};
		startBatch();
		if (type === "clear") depsMap.forEach(run);
		else {
			const targetIsArray = isArray(target);
			const isArrayIndex = targetIsArray && isIntegerKey(key);
			if (targetIsArray && key === "length") {
				const newLength = Number(newValue);
				depsMap.forEach((dep, key2) => {
					if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) run(dep);
				});
			} else {
				if (key !== void 0 || depsMap.has(void 0)) run(depsMap.get(key));
				if (isArrayIndex) run(depsMap.get(ARRAY_ITERATE_KEY));
				switch (type) {
					case "add":
						if (!targetIsArray) {
							run(depsMap.get(ITERATE_KEY));
							if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
						} else if (isArrayIndex) run(depsMap.get("length"));
						break;
					case "delete":
						if (!targetIsArray) {
							run(depsMap.get(ITERATE_KEY));
							if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
						}
						break;
					case "set":
						if (isMap(target)) run(depsMap.get(ITERATE_KEY));
						break;
				}
			}
		}
		endBatch();
	}
	function reactiveReadArray(array) {
		const raw = toRaw(array);
		if (raw === array) return raw;
		track(raw, "iterate", ARRAY_ITERATE_KEY);
		return isShallow(array) ? raw : raw.map(toReactive);
	}
	function shallowReadArray(arr) {
		track(arr = toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
		return arr;
	}
	function toWrapped(target, item) {
		if (isReadonly(target)) return isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
		return toReactive(item);
	}
	var arrayInstrumentations = {
		__proto__: null,
		[Symbol.iterator]() {
			return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
		},
		concat(...args) {
			return reactiveReadArray(this).concat(...args.map((x) => isArray(x) ? reactiveReadArray(x) : x));
		},
		entries() {
			return iterator(this, "entries", (value) => {
				value[1] = toWrapped(this, value[1]);
				return value;
			});
		},
		every(fn, thisArg) {
			return apply(this, "every", fn, thisArg, void 0, arguments);
		},
		filter(fn, thisArg) {
			return apply(this, "filter", fn, thisArg, (v) => v.map((item) => toWrapped(this, item)), arguments);
		},
		find(fn, thisArg) {
			return apply(this, "find", fn, thisArg, (item) => toWrapped(this, item), arguments);
		},
		findIndex(fn, thisArg) {
			return apply(this, "findIndex", fn, thisArg, void 0, arguments);
		},
		findLast(fn, thisArg) {
			return apply(this, "findLast", fn, thisArg, (item) => toWrapped(this, item), arguments);
		},
		findLastIndex(fn, thisArg) {
			return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
		},
		forEach(fn, thisArg) {
			return apply(this, "forEach", fn, thisArg, void 0, arguments);
		},
		includes(...args) {
			return searchProxy(this, "includes", args);
		},
		indexOf(...args) {
			return searchProxy(this, "indexOf", args);
		},
		join(separator) {
			return reactiveReadArray(this).join(separator);
		},
		lastIndexOf(...args) {
			return searchProxy(this, "lastIndexOf", args);
		},
		map(fn, thisArg) {
			return apply(this, "map", fn, thisArg, void 0, arguments);
		},
		pop() {
			return noTracking(this, "pop");
		},
		push(...args) {
			return noTracking(this, "push", args);
		},
		reduce(fn, ...args) {
			return reduce(this, "reduce", fn, args);
		},
		reduceRight(fn, ...args) {
			return reduce(this, "reduceRight", fn, args);
		},
		shift() {
			return noTracking(this, "shift");
		},
		some(fn, thisArg) {
			return apply(this, "some", fn, thisArg, void 0, arguments);
		},
		splice(...args) {
			return noTracking(this, "splice", args);
		},
		toReversed() {
			return reactiveReadArray(this).toReversed();
		},
		toSorted(comparer) {
			return reactiveReadArray(this).toSorted(comparer);
		},
		toSpliced(...args) {
			return reactiveReadArray(this).toSpliced(...args);
		},
		unshift(...args) {
			return noTracking(this, "unshift", args);
		},
		values() {
			return iterator(this, "values", (item) => toWrapped(this, item));
		}
	};
	function iterator(self, method, wrapValue) {
		const arr = shallowReadArray(self);
		const iter = arr[method]();
		if (arr !== self && !isShallow(self)) {
			iter._next = iter.next;
			iter.next = () => {
				const result = iter._next();
				if (!result.done) result.value = wrapValue(result.value);
				return result;
			};
		}
		return iter;
	}
	var arrayProto = Array.prototype;
	function apply(self, method, fn, thisArg, wrappedRetFn, args) {
		const arr = shallowReadArray(self);
		const needsWrap = arr !== self && !isShallow(self);
		const methodFn = arr[method];
		if (methodFn !== arrayProto[method]) {
			const result2 = methodFn.apply(self, args);
			return needsWrap ? toReactive(result2) : result2;
		}
		let wrappedFn = fn;
		if (arr !== self) {
			if (needsWrap) wrappedFn = function(item, index) {
				return fn.call(this, toWrapped(self, item), index, self);
			};
			else if (fn.length > 2) wrappedFn = function(item, index) {
				return fn.call(this, item, index, self);
			};
		}
		const result = methodFn.call(arr, wrappedFn, thisArg);
		return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
	}
	function reduce(self, method, fn, args) {
		const arr = shallowReadArray(self);
		const needsWrap = arr !== self && !isShallow(self);
		let wrappedFn = fn;
		let wrapInitialAccumulator = false;
		if (arr !== self) {
			if (needsWrap) {
				wrapInitialAccumulator = args.length === 0;
				wrappedFn = function(acc, item, index) {
					if (wrapInitialAccumulator) {
						wrapInitialAccumulator = false;
						acc = toWrapped(self, acc);
					}
					return fn.call(this, acc, toWrapped(self, item), index, self);
				};
			} else if (fn.length > 3) wrappedFn = function(acc, item, index) {
				return fn.call(this, acc, item, index, self);
			};
		}
		const result = arr[method](wrappedFn, ...args);
		return wrapInitialAccumulator ? toWrapped(self, result) : result;
	}
	function searchProxy(self, method, args) {
		const arr = toRaw(self);
		track(arr, "iterate", ARRAY_ITERATE_KEY);
		const res = arr[method](...args);
		if ((res === -1 || res === false) && isProxy(args[0])) {
			args[0] = toRaw(args[0]);
			return arr[method](...args);
		}
		return res;
	}
	function noTracking(self, method, args = []) {
		pauseTracking();
		startBatch();
		const res = toRaw(self)[method].apply(self, args);
		endBatch();
		resetTracking();
		return res;
	}
	var isNonTrackableKeys = makeMap(`__proto__,__v_isRef,__isVue`);
	var builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol));
	function hasOwnProperty(key) {
		if (!isSymbol(key)) key = String(key);
		const obj = toRaw(this);
		track(obj, "has", key);
		return obj.hasOwnProperty(key);
	}
	var BaseReactiveHandler = class {
		constructor(_isReadonly = false, _isShallow = false) {
			this._isReadonly = _isReadonly;
			this._isShallow = _isShallow;
		}
		get(target, key, receiver) {
			if (key === "__v_skip") return target["__v_skip"];
			const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
			if (key === "__v_isReactive") return !isReadonly2;
			else if (key === "__v_isReadonly") return isReadonly2;
			else if (key === "__v_isShallow") return isShallow2;
			else if (key === "__v_raw") {
				if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) return target;
				return;
			}
			const targetIsArray = isArray(target);
			if (!isReadonly2) {
				let fn;
				if (targetIsArray && (fn = arrayInstrumentations[key])) return fn;
				if (key === "hasOwnProperty") return hasOwnProperty;
			}
			const res = Reflect.get(target, key, isRef(target) ? target : receiver);
			if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) return res;
			if (!isReadonly2) track(target, "get", key);
			if (isShallow2) return res;
			if (isRef(res)) {
				const value = targetIsArray && isIntegerKey(key) ? res : res.value;
				return isReadonly2 && isObject(value) ? readonly(value) : value;
			}
			if (isObject(res)) return isReadonly2 ? readonly(res) : reactive(res);
			return res;
		}
	};
	var MutableReactiveHandler = class extends BaseReactiveHandler {
		constructor(isShallow2 = false) {
			super(false, isShallow2);
		}
		set(target, key, value, receiver) {
			let oldValue = target[key];
			const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
			if (!this._isShallow) {
				const isOldValueReadonly = isReadonly(oldValue);
				if (!isShallow(value) && !isReadonly(value)) {
					oldValue = toRaw(oldValue);
					value = toRaw(value);
				}
				if (!isArrayWithIntegerKey && isRef(oldValue) && !isRef(value)) if (isOldValueReadonly) return true;
				else {
					oldValue.value = value;
					return true;
				}
			}
			const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
			const result = Reflect.set(target, key, value, isRef(target) ? target : receiver);
			if (target === toRaw(receiver)) {
				if (!hadKey) trigger(target, "add", key, value);
				else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
			}
			return result;
		}
		deleteProperty(target, key) {
			const hadKey = hasOwn(target, key);
			const oldValue = target[key];
			const result = Reflect.deleteProperty(target, key);
			if (result && hadKey) trigger(target, "delete", key, void 0, oldValue);
			return result;
		}
		has(target, key) {
			const result = Reflect.has(target, key);
			if (!isSymbol(key) || !builtInSymbols.has(key)) track(target, "has", key);
			return result;
		}
		ownKeys(target) {
			track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
			return Reflect.ownKeys(target);
		}
	};
	var ReadonlyReactiveHandler = class extends BaseReactiveHandler {
		constructor(isShallow2 = false) {
			super(true, isShallow2);
		}
		set(target, key) {
			return true;
		}
		deleteProperty(target, key) {
			return true;
		}
	};
	var mutableHandlers = new MutableReactiveHandler();
	var readonlyHandlers = new ReadonlyReactiveHandler();
	var shallowReactiveHandlers = new MutableReactiveHandler(true);
	var toShallow = (value) => value;
	var getProto = (v) => Reflect.getPrototypeOf(v);
	function createIterableMethod(method, isReadonly2, isShallow2) {
		return function(...args) {
			const target = this["__v_raw"];
			const rawTarget = toRaw(target);
			const targetIsMap = isMap(rawTarget);
			const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
			const isKeyOnly = method === "keys" && targetIsMap;
			const innerIterator = target[method](...args);
			const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
			!isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
			return extend(Object.create(innerIterator), { next() {
				const { value, done } = innerIterator.next();
				return done ? {
					value,
					done
				} : {
					value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
					done
				};
			} });
		};
	}
	function createReadonlyMethod(type) {
		return function(...args) {
			return type === "delete" ? false : type === "clear" ? void 0 : this;
		};
	}
	function createInstrumentations(readonly, shallow) {
		const instrumentations = {
			get(key) {
				const target = this["__v_raw"];
				const rawTarget = toRaw(target);
				const rawKey = toRaw(key);
				if (!readonly) {
					if (hasChanged(key, rawKey)) track(rawTarget, "get", key);
					track(rawTarget, "get", rawKey);
				}
				const { has } = getProto(rawTarget);
				const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
				if (has.call(rawTarget, key)) return wrap(target.get(key));
				else if (has.call(rawTarget, rawKey)) return wrap(target.get(rawKey));
				else if (target !== rawTarget) target.get(key);
			},
			get size() {
				const target = this["__v_raw"];
				!readonly && track(toRaw(target), "iterate", ITERATE_KEY);
				return target.size;
			},
			has(key) {
				const target = this["__v_raw"];
				const rawTarget = toRaw(target);
				const rawKey = toRaw(key);
				if (!readonly) {
					if (hasChanged(key, rawKey)) track(rawTarget, "has", key);
					track(rawTarget, "has", rawKey);
				}
				return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
			},
			forEach(callback, thisArg) {
				const observed = this;
				const target = observed["__v_raw"];
				const rawTarget = toRaw(target);
				const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
				!readonly && track(rawTarget, "iterate", ITERATE_KEY);
				return target.forEach((value, key) => {
					return callback.call(thisArg, wrap(value), wrap(key), observed);
				});
			}
		};
		extend(instrumentations, readonly ? {
			add: createReadonlyMethod("add"),
			set: createReadonlyMethod("set"),
			delete: createReadonlyMethod("delete"),
			clear: createReadonlyMethod("clear")
		} : {
			add(value) {
				const target = toRaw(this);
				const proto = getProto(target);
				const rawValue = toRaw(value);
				const valueToAdd = !shallow && !isShallow(value) && !isReadonly(value) ? rawValue : value;
				if (!(proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue))) {
					target.add(valueToAdd);
					trigger(target, "add", valueToAdd, valueToAdd);
				}
				return this;
			},
			set(key, value) {
				if (!shallow && !isShallow(value) && !isReadonly(value)) value = toRaw(value);
				const target = toRaw(this);
				const { has, get } = getProto(target);
				let hadKey = has.call(target, key);
				if (!hadKey) {
					key = toRaw(key);
					hadKey = has.call(target, key);
				}
				const oldValue = get.call(target, key);
				target.set(key, value);
				if (!hadKey) trigger(target, "add", key, value);
				else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
				return this;
			},
			delete(key) {
				const target = toRaw(this);
				const { has, get } = getProto(target);
				let hadKey = has.call(target, key);
				if (!hadKey) {
					key = toRaw(key);
					hadKey = has.call(target, key);
				}
				const oldValue = get ? get.call(target, key) : void 0;
				const result = target.delete(key);
				if (hadKey) trigger(target, "delete", key, void 0, oldValue);
				return result;
			},
			clear() {
				const target = toRaw(this);
				const hadItems = target.size !== 0;
				const oldTarget = void 0;
				const result = target.clear();
				if (hadItems) trigger(target, "clear", void 0, void 0, oldTarget);
				return result;
			}
		});
		[
			"keys",
			"values",
			"entries",
			Symbol.iterator
		].forEach((method) => {
			instrumentations[method] = createIterableMethod(method, readonly, shallow);
		});
		return instrumentations;
	}
	function createInstrumentationGetter(isReadonly2, shallow) {
		const instrumentations = createInstrumentations(isReadonly2, shallow);
		return (target, key, receiver) => {
			if (key === "__v_isReactive") return !isReadonly2;
			else if (key === "__v_isReadonly") return isReadonly2;
			else if (key === "__v_raw") return target;
			return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
		};
	}
	var mutableCollectionHandlers = { get: createInstrumentationGetter(false, false) };
	var shallowCollectionHandlers = { get: createInstrumentationGetter(false, true) };
	var readonlyCollectionHandlers = { get: createInstrumentationGetter(true, false) };
	var reactiveMap = new WeakMap();
	var shallowReactiveMap = new WeakMap();
	var readonlyMap = new WeakMap();
	var shallowReadonlyMap = new WeakMap();
	function targetTypeMap(rawType) {
		switch (rawType) {
			case "Object":
			case "Array": return 1;
			case "Map":
			case "Set":
			case "WeakMap":
			case "WeakSet": return 2;
			default: return 0;
		}
	}
	function reactive(target) {
		if (isReadonly(target)) return target;
		return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
	}
	function shallowReactive(target) {
		return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
	}
	function readonly(target) {
		return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
	}
	function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
		if (!isObject(target)) return target;
		if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) return target;
		if (target["__v_skip"] || !Object.isExtensible(target)) return target;
		const existingProxy = proxyMap.get(target);
		if (existingProxy) return existingProxy;
		const targetType = targetTypeMap(toRawType(target));
		if (targetType === 0) return target;
		const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
		proxyMap.set(target, proxy);
		return proxy;
	}
	function isReactive(value) {
		if (isReadonly(value)) return isReactive(value["__v_raw"]);
		return !!(value && value["__v_isReactive"]);
	}
	function isReadonly(value) {
		return !!(value && value["__v_isReadonly"]);
	}
	function isShallow(value) {
		return !!(value && value["__v_isShallow"]);
	}
	function isProxy(value) {
		return value ? !!value["__v_raw"] : false;
	}
	function toRaw(observed) {
		const raw = observed && observed["__v_raw"];
		return raw ? toRaw(raw) : observed;
	}
	function markRaw(value) {
		if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) def(value, "__v_skip", true);
		return value;
	}
	var toReactive = (value) => isObject(value) ? reactive(value) : value;
	var toReadonly = (value) => isObject(value) ? readonly(value) : value;
	function isRef(r) {
		return r ? r["__v_isRef"] === true : false;
	}
	function ref(value) {
		return createRef(value, false);
	}
	function createRef(rawValue, shallow) {
		if (isRef(rawValue)) return rawValue;
		return new RefImpl(rawValue, shallow);
	}
	var RefImpl = class {
		constructor(value, isShallow2) {
			this.dep = new Dep();
			this["__v_isRef"] = true;
			this["__v_isShallow"] = false;
			this._rawValue = isShallow2 ? value : toRaw(value);
			this._value = isShallow2 ? value : toReactive(value);
			this["__v_isShallow"] = isShallow2;
		}
		get value() {
			this.dep.track();
			return this._value;
		}
		set value(newValue) {
			const oldValue = this._rawValue;
			const useDirectValue = this["__v_isShallow"] || isShallow(newValue) || isReadonly(newValue);
			newValue = useDirectValue ? newValue : toRaw(newValue);
			if (hasChanged(newValue, oldValue)) {
				this._rawValue = newValue;
				this._value = useDirectValue ? newValue : toReactive(newValue);
				this.dep.trigger();
			}
		}
	};
	function unref(ref2) {
		return isRef(ref2) ? ref2.value : ref2;
	}
	var shallowUnwrapHandlers = {
		get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
		set: (target, key, value, receiver) => {
			const oldValue = target[key];
			if (isRef(oldValue) && !isRef(value)) {
				oldValue.value = value;
				return true;
			} else return Reflect.set(target, key, value, receiver);
		}
	};
	function proxyRefs(objectWithRefs) {
		return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
	}
	var ComputedRefImpl = class {
		constructor(fn, setter, isSSR) {
			this.fn = fn;
			this.setter = setter;
			this._value = void 0;
			this.dep = new Dep(this);
			this.__v_isRef = true;
			this.deps = void 0;
			this.depsTail = void 0;
			this.flags = 16;
			this.globalVersion = globalVersion - 1;
			this.next = void 0;
			this.effect = this;
			this["__v_isReadonly"] = !setter;
			this.isSSR = isSSR;
		}
		notify() {
			this.flags |= 16;
			if (!(this.flags & 8) && activeSub !== this) {
				batch(this, true);
				return true;
			}
		}
		get value() {
			const link = this.dep.track();
			refreshComputed(this);
			if (link) link.version = this.dep.version;
			return this._value;
		}
		set value(newValue) {
			if (this.setter) this.setter(newValue);
		}
	};
	function computed$1(getterOrOptions, debugOptions, isSSR = false) {
		let getter;
		let setter;
		if (isFunction(getterOrOptions)) getter = getterOrOptions;
		else {
			getter = getterOrOptions.get;
			setter = getterOrOptions.set;
		}
		return new ComputedRefImpl(getter, setter, isSSR);
	}
	var INITIAL_WATCHER_VALUE = {};
	var cleanupMap = new WeakMap();
	var activeWatcher = void 0;
	function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
		if (owner) {
			let cleanups = cleanupMap.get(owner);
			if (!cleanups) cleanupMap.set(owner, cleanups = []);
			cleanups.push(cleanupFn);
		}
	}
	function watch$1(source, cb, options = EMPTY_OBJ) {
		const { immediate, deep, once, scheduler, augmentJob, call } = options;
		const reactiveGetter = (source2) => {
			if (deep) return source2;
			if (isShallow(source2) || deep === false || deep === 0) return traverse(source2, 1);
			return traverse(source2);
		};
		let effect;
		let getter;
		let cleanup;
		let boundCleanup;
		let forceTrigger = false;
		let isMultiSource = false;
		if (isRef(source)) {
			getter = () => source.value;
			forceTrigger = isShallow(source);
		} else if (isReactive(source)) {
			getter = () => reactiveGetter(source);
			forceTrigger = true;
		} else if (isArray(source)) {
			isMultiSource = true;
			forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
			getter = () => source.map((s) => {
				if (isRef(s)) return s.value;
				else if (isReactive(s)) return reactiveGetter(s);
				else if (isFunction(s)) return call ? call(s, 2) : s();
			});
		} else if (isFunction(source)) if (cb) getter = call ? () => call(source, 2) : source;
		else getter = () => {
			if (cleanup) {
				pauseTracking();
				try {
					cleanup();
				} finally {
					resetTracking();
				}
			}
			const currentEffect = activeWatcher;
			activeWatcher = effect;
			try {
				return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
			} finally {
				activeWatcher = currentEffect;
			}
		};
		else getter = NOOP;
		if (cb && deep) {
			const baseGetter = getter;
			const depth = deep === true ? Infinity : deep;
			getter = () => traverse(baseGetter(), depth);
		}
		const scope = getCurrentScope();
		const watchHandle = () => {
			effect.stop();
			if (scope && scope.active) remove(scope.effects, effect);
		};
		if (once && cb) {
			const _cb = cb;
			cb = (...args) => {
				const res = _cb(...args);
				watchHandle();
				return res;
			};
		}
		let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
		const job = (immediateFirstRun) => {
			if (!(effect.flags & 1) || !effect.dirty && !immediateFirstRun) return;
			if (cb) {
				const newValue = effect.run();
				if (immediateFirstRun || deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
					if (cleanup) cleanup();
					const currentWatcher = activeWatcher;
					activeWatcher = effect;
					try {
						const args = [
							newValue,
							oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
							boundCleanup
						];
						oldValue = newValue;
						call ? call(cb, 3, args) : cb(...args);
					} finally {
						activeWatcher = currentWatcher;
					}
				}
			} else effect.run();
		};
		if (augmentJob) augmentJob(job);
		effect = new ReactiveEffect(getter);
		effect.scheduler = scheduler ? () => scheduler(job, false) : job;
		boundCleanup = (fn) => onWatcherCleanup(fn, false, effect);
		cleanup = effect.onStop = () => {
			const cleanups = cleanupMap.get(effect);
			if (cleanups) {
				if (call) call(cleanups, 4);
				else for (const cleanup2 of cleanups) cleanup2();
				cleanupMap.delete(effect);
			}
		};
		if (cb) if (immediate) job(true);
		else oldValue = effect.run();
		else if (scheduler) scheduler(job.bind(null, true), true);
		else effect.run();
		watchHandle.pause = effect.pause.bind(effect);
		watchHandle.resume = effect.resume.bind(effect);
		watchHandle.stop = watchHandle;
		return watchHandle;
	}
	function traverse(value, depth = Infinity, seen) {
		if (depth <= 0 || !isObject(value) || value["__v_skip"]) return value;
		seen = seen || new Map();
		if ((seen.get(value) || 0) >= depth) return value;
		seen.set(value, depth);
		depth--;
		if (isRef(value)) traverse(value.value, depth, seen);
		else if (isArray(value)) for (let i = 0; i < value.length; i++) traverse(value[i], depth, seen);
		else if (isSet(value) || isMap(value)) value.forEach((v) => {
			traverse(v, depth, seen);
		});
		else if (isPlainObject(value)) {
			for (const key in value) traverse(value[key], depth, seen);
			for (const key of Object.getOwnPropertySymbols(value)) if (Object.prototype.propertyIsEnumerable.call(value, key)) traverse(value[key], depth, seen);
		}
		return value;
	}
	function callWithErrorHandling(fn, instance, type, args) {
		try {
			return args ? fn(...args) : fn();
		} catch (err) {
			handleError(err, instance, type);
		}
	}
	function callWithAsyncErrorHandling(fn, instance, type, args) {
		if (isFunction(fn)) {
			const res = callWithErrorHandling(fn, instance, type, args);
			if (res && isPromise(res)) res.catch((err) => {
				handleError(err, instance, type);
			});
			return res;
		}
		if (isArray(fn)) {
			const values = [];
			for (let i = 0; i < fn.length; i++) values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
			return values;
		}
	}
	function handleError(err, instance, type, throwInDev = true) {
		const contextVNode = instance ? instance.vnode : null;
		const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
		if (instance) {
			let cur = instance.parent;
			const exposedInstance = instance.proxy;
			const errorInfo = `https://vuejs.org/error-reference/#runtime-${type}`;
			while (cur) {
				const errorCapturedHooks = cur.ec;
				if (errorCapturedHooks) {
					for (let i = 0; i < errorCapturedHooks.length; i++) if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) return;
				}
				cur = cur.parent;
			}
			if (errorHandler) {
				pauseTracking();
				callWithErrorHandling(errorHandler, null, 10, [
					err,
					exposedInstance,
					errorInfo
				]);
				resetTracking();
				return;
			}
		}
		logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
	}
	function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
		if (throwInProd) throw err;
		else console.error(err);
	}
	var queue = [];
	var flushIndex = -1;
	var pendingPostFlushCbs = [];
	var activePostFlushCbs = null;
	var postFlushIndex = 0;
	var resolvedPromise = Promise.resolve();
	var currentFlushPromise = null;
	function nextTick(fn) {
		const p = currentFlushPromise || resolvedPromise;
		return fn ? p.then(this ? fn.bind(this) : fn) : p;
	}
	function findInsertionIndex(id) {
		let start = flushIndex + 1;
		let end = queue.length;
		while (start < end) {
			const middle = start + end >>> 1;
			const middleJob = queue[middle];
			const middleJobId = getId(middleJob);
			if (middleJobId < id || middleJobId === id && middleJob.flags & 2) start = middle + 1;
			else end = middle;
		}
		return start;
	}
	function queueJob(job) {
		if (!(job.flags & 1)) {
			const jobId = getId(job);
			const lastJob = queue[queue.length - 1];
			if (!lastJob || !(job.flags & 2) && jobId >= getId(lastJob)) queue.push(job);
			else queue.splice(findInsertionIndex(jobId), 0, job);
			job.flags |= 1;
			queueFlush();
		}
	}
	function queueFlush() {
		if (!currentFlushPromise) currentFlushPromise = resolvedPromise.then(flushJobs);
	}
	function queuePostFlushCb(cb) {
		if (!isArray(cb)) {
			if (activePostFlushCbs && cb.id === -1) activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
			else if (!(cb.flags & 1)) {
				pendingPostFlushCbs.push(cb);
				cb.flags |= 1;
			}
		} else pendingPostFlushCbs.push(...cb);
		queueFlush();
	}
	function flushPreFlushCbs(instance, seen, i = flushIndex + 1) {
		for (; i < queue.length; i++) {
			const cb = queue[i];
			if (cb && cb.flags & 2) {
				if (instance && cb.id !== instance.uid) continue;
				queue.splice(i, 1);
				i--;
				if (cb.flags & 4) cb.flags &= -2;
				cb();
				if (!(cb.flags & 4)) cb.flags &= -2;
			}
		}
	}
	function flushPostFlushCbs(seen) {
		if (pendingPostFlushCbs.length) {
			const deduped = [...new Set(pendingPostFlushCbs)].sort((a, b) => getId(a) - getId(b));
			pendingPostFlushCbs.length = 0;
			if (activePostFlushCbs) {
				activePostFlushCbs.push(...deduped);
				return;
			}
			activePostFlushCbs = deduped;
			for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
				const cb = activePostFlushCbs[postFlushIndex];
				if (cb.flags & 4) cb.flags &= -2;
				if (!(cb.flags & 8)) cb();
				cb.flags &= -2;
			}
			activePostFlushCbs = null;
			postFlushIndex = 0;
		}
	}
	var getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
	function flushJobs(seen) {
		try {
			for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
				const job = queue[flushIndex];
				if (job && !(job.flags & 8)) {
					if (job.flags & 4) job.flags &= -2;
					callWithErrorHandling(job, job.i, job.i ? 15 : 14);
					if (!(job.flags & 4)) job.flags &= -2;
				}
			}
		} finally {
			for (; flushIndex < queue.length; flushIndex++) {
				const job = queue[flushIndex];
				if (job) job.flags &= -2;
			}
			flushIndex = -1;
			queue.length = 0;
			flushPostFlushCbs(seen);
			currentFlushPromise = null;
			if (queue.length || pendingPostFlushCbs.length) flushJobs(seen);
		}
	}
	var currentRenderingInstance = null;
	var currentScopeId = null;
	function setCurrentRenderingInstance(instance) {
		const prev = currentRenderingInstance;
		currentRenderingInstance = instance;
		currentScopeId = instance && instance.type.__scopeId || null;
		return prev;
	}
	function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
		if (!ctx) return fn;
		if (fn._n) return fn;
		const renderFnWithContext = (...args) => {
			if (renderFnWithContext._d) setBlockTracking(-1);
			const prevInstance = setCurrentRenderingInstance(ctx);
			let res;
			try {
				res = fn(...args);
			} finally {
				setCurrentRenderingInstance(prevInstance);
				if (renderFnWithContext._d) setBlockTracking(1);
			}
			return res;
		};
		renderFnWithContext._n = true;
		renderFnWithContext._c = true;
		renderFnWithContext._d = true;
		return renderFnWithContext;
	}
	function withDirectives(vnode, directives) {
		if (currentRenderingInstance === null) return vnode;
		const instance = getComponentPublicInstance(currentRenderingInstance);
		const bindings = vnode.dirs || (vnode.dirs = []);
		for (let i = 0; i < directives.length; i++) {
			let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
			if (dir) {
				if (isFunction(dir)) dir = {
					mounted: dir,
					updated: dir
				};
				if (dir.deep) traverse(value);
				bindings.push({
					dir,
					instance,
					value,
					oldValue: void 0,
					arg,
					modifiers
				});
			}
		}
		return vnode;
	}
	function invokeDirectiveHook(vnode, prevVNode, instance, name) {
		const bindings = vnode.dirs;
		const oldBindings = prevVNode && prevVNode.dirs;
		for (let i = 0; i < bindings.length; i++) {
			const binding = bindings[i];
			if (oldBindings) binding.oldValue = oldBindings[i].value;
			let hook = binding.dir[name];
			if (hook) {
				pauseTracking();
				callWithAsyncErrorHandling(hook, instance, 8, [
					vnode.el,
					binding,
					vnode,
					prevVNode
				]);
				resetTracking();
			}
		}
	}
	function provide(key, value) {
		if (currentInstance) {
			let provides = currentInstance.provides;
			const parentProvides = currentInstance.parent && currentInstance.parent.provides;
			if (parentProvides === provides) provides = currentInstance.provides = Object.create(parentProvides);
			provides[key] = value;
		}
	}
	function inject(key, defaultValue, treatDefaultAsFactory = false) {
		const instance = getCurrentInstance();
		if (instance || currentApp) {
			let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
			if (provides && key in provides) return provides[key];
			else if (arguments.length > 1) return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
		}
	}
	var ssrContextKey = Symbol.for("v-scx");
	var useSSRContext = () => {
		{
			const ctx = inject(ssrContextKey);
			if (!ctx) {}
			return ctx;
		}
	};
	function watch(source, cb, options) {
		return doWatch(source, cb, options);
	}
	function doWatch(source, cb, options = EMPTY_OBJ) {
		const { immediate, deep, flush, once } = options;
		const baseWatchOptions = extend({}, options);
		const runsImmediately = cb && immediate || !cb && flush !== "post";
		let ssrCleanup;
		if (isInSSRComponentSetup) {
			if (flush === "sync") {
				const ctx = useSSRContext();
				ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
			} else if (!runsImmediately) {
				const watchStopHandle = () => {};
				watchStopHandle.stop = NOOP;
				watchStopHandle.resume = NOOP;
				watchStopHandle.pause = NOOP;
				return watchStopHandle;
			}
		}
		const instance = currentInstance;
		baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
		let isPre = false;
		if (flush === "post") baseWatchOptions.scheduler = (job) => {
			queuePostRenderEffect(job, instance && instance.suspense);
		};
		else if (flush !== "sync") {
			isPre = true;
			baseWatchOptions.scheduler = (job, isFirstRun) => {
				if (isFirstRun) job();
				else queueJob(job);
			};
		}
		baseWatchOptions.augmentJob = (job) => {
			if (cb) job.flags |= 4;
			if (isPre) {
				job.flags |= 2;
				if (instance) {
					job.id = instance.uid;
					job.i = instance;
				}
			}
		};
		const watchHandle = watch$1(source, cb, baseWatchOptions);
		if (isInSSRComponentSetup) {
			if (ssrCleanup) ssrCleanup.push(watchHandle);
			else if (runsImmediately) watchHandle();
		}
		return watchHandle;
	}
	function instanceWatch(source, value, options) {
		const publicThis = this.proxy;
		const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
		let cb;
		if (isFunction(value)) cb = value;
		else {
			cb = value.handler;
			options = value;
		}
		const reset = setCurrentInstance(this);
		const res = doWatch(getter, cb.bind(publicThis), options);
		reset();
		return res;
	}
	function createPathGetter(ctx, path) {
		const segments = path.split(".");
		return () => {
			let cur = ctx;
			for (let i = 0; i < segments.length && cur; i++) cur = cur[segments[i]];
			return cur;
		};
	}
	var TeleportEndKey = Symbol("_vte");
	var isTeleport = (type) => type.__isTeleport;
	var leaveCbKey = Symbol("_leaveCb");
	function setTransitionHooks(vnode, hooks) {
		if (vnode.shapeFlag & 6 && vnode.component) {
			vnode.transition = hooks;
			setTransitionHooks(vnode.component.subTree, hooks);
		} else if (vnode.shapeFlag & 128) {
			vnode.ssContent.transition = hooks.clone(vnode.ssContent);
			vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
		} else vnode.transition = hooks;
	}
	function defineComponent(options, extraOptions) {
		return isFunction(options) ? (() => extend({ name: options.name }, extraOptions, { setup: options }))() : options;
	}
	function markAsyncBoundary(instance) {
		instance.ids = [
			instance.ids[0] + instance.ids[2]++ + "-",
			0,
			0
		];
	}
	function isTemplateRefKey(refs, key) {
		let desc;
		return !!((desc = Object.getOwnPropertyDescriptor(refs, key)) && !desc.configurable);
	}
	var pendingSetRefMap = new WeakMap();
	function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
		if (isArray(rawRef)) {
			rawRef.forEach((r, i) => setRef(r, oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
			return;
		}
		if (isAsyncWrapper(vnode) && !isUnmount) {
			if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
			return;
		}
		const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
		const value = isUnmount ? null : refValue;
		const { i: owner, r: ref } = rawRef;
		const oldRef = oldRawRef && oldRawRef.r;
		const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
		const setupState = owner.setupState;
		const rawSetupState = toRaw(setupState);
		const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
			if (isTemplateRefKey(refs, key)) return false;
			return hasOwn(rawSetupState, key);
		};
		const canSetRef = (ref2, key) => {
			if (key && isTemplateRefKey(refs, key)) return false;
			return true;
		};
		if (oldRef != null && oldRef !== ref) {
			invalidatePendingSetRef(oldRawRef);
			if (isString(oldRef)) {
				refs[oldRef] = null;
				if (canSetSetupRef(oldRef)) setupState[oldRef] = null;
			} else if (isRef(oldRef)) {
				const oldRawRefAtom = oldRawRef;
				if (canSetRef(oldRef, oldRawRefAtom.k)) oldRef.value = null;
				if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
			}
		}
		if (isFunction(ref)) callWithErrorHandling(ref, owner, 12, [value, refs]);
		else {
			const _isString = isString(ref);
			const _isRef = isRef(ref);
			if (_isString || _isRef) {
				const doSet = () => {
					if (rawRef.f) {
						const existing = _isString ? canSetSetupRef(ref) ? setupState[ref] : refs[ref] : canSetRef(ref) || !rawRef.k ? ref.value : refs[rawRef.k];
						if (isUnmount) isArray(existing) && remove(existing, refValue);
						else if (!isArray(existing)) if (_isString) {
							refs[ref] = [refValue];
							if (canSetSetupRef(ref)) setupState[ref] = refs[ref];
						} else {
							const newVal = [refValue];
							if (canSetRef(ref, rawRef.k)) ref.value = newVal;
							if (rawRef.k) refs[rawRef.k] = newVal;
						}
						else if (!existing.includes(refValue)) existing.push(refValue);
					} else if (_isString) {
						refs[ref] = value;
						if (canSetSetupRef(ref)) setupState[ref] = value;
					} else if (_isRef) {
						if (canSetRef(ref, rawRef.k)) ref.value = value;
						if (rawRef.k) refs[rawRef.k] = value;
					}
				};
				if (value) {
					const job = () => {
						doSet();
						pendingSetRefMap.delete(rawRef);
					};
					job.id = -1;
					pendingSetRefMap.set(rawRef, job);
					queuePostRenderEffect(job, parentSuspense);
				} else {
					invalidatePendingSetRef(rawRef);
					doSet();
				}
			}
		}
	}
	function invalidatePendingSetRef(rawRef) {
		const pendingSetRef = pendingSetRefMap.get(rawRef);
		if (pendingSetRef) {
			pendingSetRef.flags |= 8;
			pendingSetRefMap.delete(rawRef);
		}
	}
	getGlobalThis().requestIdleCallback;
	getGlobalThis().cancelIdleCallback;
	var isAsyncWrapper = (i) => !!i.type.__asyncLoader;
	var isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
	function onActivated(hook, target) {
		registerKeepAliveHook(hook, "a", target);
	}
	function onDeactivated(hook, target) {
		registerKeepAliveHook(hook, "da", target);
	}
	function registerKeepAliveHook(hook, type, target = currentInstance) {
		const wrappedHook = hook.__wdc || (hook.__wdc = () => {
			let current = target;
			while (current) {
				if (current.isDeactivated) return;
				current = current.parent;
			}
			return hook();
		});
		injectHook(type, wrappedHook, target);
		if (target) {
			let current = target.parent;
			while (current && current.parent) {
				if (isKeepAlive(current.parent.vnode)) injectToKeepAliveRoot(wrappedHook, type, target, current);
				current = current.parent;
			}
		}
	}
	function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
		const injected = injectHook(type, hook, keepAliveRoot, true);
		onUnmounted(() => {
			remove(keepAliveRoot[type], injected);
		}, target);
	}
	function injectHook(type, hook, target = currentInstance, prepend = false) {
		if (target) {
			const hooks = target[type] || (target[type] = []);
			const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
				pauseTracking();
				const reset = setCurrentInstance(target);
				const res = callWithAsyncErrorHandling(hook, target, type, args);
				reset();
				resetTracking();
				return res;
			});
			if (prepend) hooks.unshift(wrappedHook);
			else hooks.push(wrappedHook);
			return wrappedHook;
		}
	}
	var createHook = (lifecycle) => (hook, target = currentInstance) => {
		if (!isInSSRComponentSetup || lifecycle === "sp") injectHook(lifecycle, (...args) => hook(...args), target);
	};
	var onBeforeMount = createHook("bm");
	var onMounted = createHook("m");
	var onBeforeUpdate = createHook("bu");
	var onUpdated = createHook("u");
	var onBeforeUnmount = createHook("bum");
	var onUnmounted = createHook("um");
	var onServerPrefetch = createHook("sp");
	var onRenderTriggered = createHook("rtg");
	var onRenderTracked = createHook("rtc");
	function onErrorCaptured(hook, target = currentInstance) {
		injectHook("ec", hook, target);
	}
	var COMPONENTS = "components";
	var NULL_DYNAMIC_COMPONENT = Symbol.for("v-ndc");
	function resolveDynamicComponent(component) {
		if (isString(component)) return resolveAsset(COMPONENTS, component, false) || component;
		else return component || NULL_DYNAMIC_COMPONENT;
	}
	function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
		const instance = currentRenderingInstance || currentInstance;
		if (instance) {
			const Component = instance.type;
			if (type === COMPONENTS) {
				const selfName = getComponentName(Component, false);
				if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) return Component;
			}
			const res = resolve(instance[type] || Component[type], name) || resolve(instance.appContext[type], name);
			if (!res && maybeSelfReference) return Component;
			return res;
		}
	}
	function resolve(registry, name) {
		return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
	}
	function renderList(source, renderItem, cache, index) {
		let ret;
		const cached = cache && cache[index];
		const sourceIsArray = isArray(source);
		if (sourceIsArray || isString(source)) {
			const sourceIsReactiveArray = sourceIsArray && isReactive(source);
			let needsWrap = false;
			let isReadonlySource = false;
			if (sourceIsReactiveArray) {
				needsWrap = !isShallow(source);
				isReadonlySource = isReadonly(source);
				source = shallowReadArray(source);
			}
			ret = new Array(source.length);
			for (let i = 0, l = source.length; i < l; i++) ret[i] = renderItem(needsWrap ? isReadonlySource ? toReadonly(toReactive(source[i])) : toReactive(source[i]) : source[i], i, void 0, cached && cached[i]);
		} else if (typeof source === "number") {
			ret = new Array(source);
			for (let i = 0; i < source; i++) ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
		} else if (isObject(source)) if (source[Symbol.iterator]) ret = Array.from(source, (item, i) => renderItem(item, i, void 0, cached && cached[i]));
		else {
			const keys = Object.keys(source);
			ret = new Array(keys.length);
			for (let i = 0, l = keys.length; i < l; i++) {
				const key = keys[i];
				ret[i] = renderItem(source[key], key, i, cached && cached[i]);
			}
		}
		else ret = [];
		if (cache) cache[index] = ret;
		return ret;
	}
	var getPublicInstance = (i) => {
		if (!i) return null;
		if (isStatefulComponent(i)) return getComponentPublicInstance(i);
		return getPublicInstance(i.parent);
	};
	var publicPropertiesMap = extend(Object.create(null), {
		$: (i) => i,
		$el: (i) => i.vnode.el,
		$data: (i) => i.data,
		$props: (i) => i.props,
		$attrs: (i) => i.attrs,
		$slots: (i) => i.slots,
		$refs: (i) => i.refs,
		$parent: (i) => getPublicInstance(i.parent),
		$root: (i) => getPublicInstance(i.root),
		$host: (i) => i.ce,
		$emit: (i) => i.emit,
		$options: (i) => resolveMergedOptions(i),
		$forceUpdate: (i) => i.f || (i.f = () => {
			queueJob(i.update);
		}),
		$nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
		$watch: (i) => instanceWatch.bind(i)
	});
	var hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
	var PublicInstanceProxyHandlers = {
		get({ _: instance }, key) {
			if (key === "__v_skip") return true;
			const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
			if (key[0] !== "$") {
				const n = accessCache[key];
				if (n !== void 0) switch (n) {
					case 1: return setupState[key];
					case 2: return data[key];
					case 4: return ctx[key];
					case 3: return props[key];
				}
				else if (hasSetupBinding(setupState, key)) {
					accessCache[key] = 1;
					return setupState[key];
				} else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
					accessCache[key] = 2;
					return data[key];
				} else if (hasOwn(props, key)) {
					accessCache[key] = 3;
					return props[key];
				} else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
					accessCache[key] = 4;
					return ctx[key];
				} else if (shouldCacheAccess) accessCache[key] = 0;
			}
			const publicGetter = publicPropertiesMap[key];
			let cssModule, globalProperties;
			if (publicGetter) {
				if (key === "$attrs") track(instance.attrs, "get", "");
				return publicGetter(instance);
			} else if ((cssModule = type.__cssModules) && (cssModule = cssModule[key])) return cssModule;
			else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
				accessCache[key] = 4;
				return ctx[key];
			} else if (globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)) return globalProperties[key];
		},
		set({ _: instance }, key, value) {
			const { data, setupState, ctx } = instance;
			if (hasSetupBinding(setupState, key)) {
				setupState[key] = value;
				return true;
			} else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
				data[key] = value;
				return true;
			} else if (hasOwn(instance.props, key)) return false;
			if (key[0] === "$" && key.slice(1) in instance) return false;
			else ctx[key] = value;
			return true;
		},
		has({ _: { data, setupState, accessCache, ctx, appContext, props, type } }, key) {
			let cssModules;
			return !!(accessCache[key] || data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
		},
		defineProperty(target, key, descriptor) {
			if (descriptor.get != null) target._.accessCache[key] = 0;
			else if (hasOwn(descriptor, "value")) this.set(target, key, descriptor.value, null);
			return Reflect.defineProperty(target, key, descriptor);
		}
	};
	function normalizePropsOrEmits(props) {
		return isArray(props) ? props.reduce((normalized, p) => (normalized[p] = null, normalized), {}) : props;
	}
	var shouldCacheAccess = true;
	function applyOptions(instance) {
		const options = resolveMergedOptions(instance);
		const publicThis = instance.proxy;
		const ctx = instance.ctx;
		shouldCacheAccess = false;
		if (options.beforeCreate) callHook(options.beforeCreate, instance, "bc");
		const { data: dataOptions, computed: computedOptions, methods, watch: watchOptions, provide: provideOptions, inject: injectOptions, created, beforeMount, mounted, beforeUpdate, updated, activated, deactivated, beforeDestroy, beforeUnmount, destroyed, unmounted, render, renderTracked, renderTriggered, errorCaptured, serverPrefetch, expose, inheritAttrs, components, directives, filters } = options;
		const checkDuplicateProperties = null;
		if (injectOptions) resolveInjections(injectOptions, ctx, checkDuplicateProperties);
		if (methods) for (const key in methods) {
			const methodHandler = methods[key];
			if (isFunction(methodHandler)) ctx[key] = methodHandler.bind(publicThis);
		}
		if (dataOptions) {
			const data = dataOptions.call(publicThis, publicThis);
			if (!isObject(data)) {} else instance.data = reactive(data);
		}
		shouldCacheAccess = true;
		if (computedOptions) for (const key in computedOptions) {
			const opt = computedOptions[key];
			const c = computed({
				get: isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP,
				set: !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP
			});
			Object.defineProperty(ctx, key, {
				enumerable: true,
				configurable: true,
				get: () => c.value,
				set: (v) => c.value = v
			});
		}
		if (watchOptions) for (const key in watchOptions) createWatcher(watchOptions[key], ctx, publicThis, key);
		if (provideOptions) {
			const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
			Reflect.ownKeys(provides).forEach((key) => {
				provide(key, provides[key]);
			});
		}
		if (created) callHook(created, instance, "c");
		function registerLifecycleHook(register, hook) {
			if (isArray(hook)) hook.forEach((_hook) => register(_hook.bind(publicThis)));
			else if (hook) register(hook.bind(publicThis));
		}
		registerLifecycleHook(onBeforeMount, beforeMount);
		registerLifecycleHook(onMounted, mounted);
		registerLifecycleHook(onBeforeUpdate, beforeUpdate);
		registerLifecycleHook(onUpdated, updated);
		registerLifecycleHook(onActivated, activated);
		registerLifecycleHook(onDeactivated, deactivated);
		registerLifecycleHook(onErrorCaptured, errorCaptured);
		registerLifecycleHook(onRenderTracked, renderTracked);
		registerLifecycleHook(onRenderTriggered, renderTriggered);
		registerLifecycleHook(onBeforeUnmount, beforeUnmount);
		registerLifecycleHook(onUnmounted, unmounted);
		registerLifecycleHook(onServerPrefetch, serverPrefetch);
		if (isArray(expose)) {
			if (expose.length) {
				const exposed = instance.exposed || (instance.exposed = {});
				expose.forEach((key) => {
					Object.defineProperty(exposed, key, {
						get: () => publicThis[key],
						set: (val) => publicThis[key] = val,
						enumerable: true
					});
				});
			} else if (!instance.exposed) instance.exposed = {};
		}
		if (render && instance.render === NOOP) instance.render = render;
		if (inheritAttrs != null) instance.inheritAttrs = inheritAttrs;
		if (components) instance.components = components;
		if (directives) instance.directives = directives;
		if (serverPrefetch) markAsyncBoundary(instance);
	}
	function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
		if (isArray(injectOptions)) injectOptions = normalizeInject(injectOptions);
		for (const key in injectOptions) {
			const opt = injectOptions[key];
			let injected;
			if (isObject(opt)) if ("default" in opt) injected = inject(opt.from || key, opt.default, true);
			else injected = inject(opt.from || key);
			else injected = inject(opt);
			if (isRef(injected)) Object.defineProperty(ctx, key, {
				enumerable: true,
				configurable: true,
				get: () => injected.value,
				set: (v) => injected.value = v
			});
			else ctx[key] = injected;
		}
	}
	function callHook(hook, instance, type) {
		callWithAsyncErrorHandling(isArray(hook) ? hook.map((h) => h.bind(instance.proxy)) : hook.bind(instance.proxy), instance, type);
	}
	function createWatcher(raw, ctx, publicThis, key) {
		let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
		if (isString(raw)) {
			const handler = ctx[raw];
			if (isFunction(handler)) watch(getter, handler);
		} else if (isFunction(raw)) watch(getter, raw.bind(publicThis));
		else if (isObject(raw)) if (isArray(raw)) raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
		else {
			const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
			if (isFunction(handler)) watch(getter, handler, raw);
		}
	}
	function resolveMergedOptions(instance) {
		const base = instance.type;
		const { mixins, extends: extendsOptions } = base;
		const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
		const cached = cache.get(base);
		let resolved;
		if (cached) resolved = cached;
		else if (!globalMixins.length && !mixins && !extendsOptions) resolved = base;
		else {
			resolved = {};
			if (globalMixins.length) globalMixins.forEach((m) => mergeOptions(resolved, m, optionMergeStrategies, true));
			mergeOptions(resolved, base, optionMergeStrategies);
		}
		if (isObject(base)) cache.set(base, resolved);
		return resolved;
	}
	function mergeOptions(to, from, strats, asMixin = false) {
		const { mixins, extends: extendsOptions } = from;
		if (extendsOptions) mergeOptions(to, extendsOptions, strats, true);
		if (mixins) mixins.forEach((m) => mergeOptions(to, m, strats, true));
		for (const key in from) if (asMixin && key === "expose") {} else {
			const strat = internalOptionMergeStrats[key] || strats && strats[key];
			to[key] = strat ? strat(to[key], from[key]) : from[key];
		}
		return to;
	}
	var internalOptionMergeStrats = {
		data: mergeDataFn,
		props: mergeEmitsOrPropsOptions,
		emits: mergeEmitsOrPropsOptions,
		methods: mergeObjectOptions,
		computed: mergeObjectOptions,
		beforeCreate: mergeAsArray,
		created: mergeAsArray,
		beforeMount: mergeAsArray,
		mounted: mergeAsArray,
		beforeUpdate: mergeAsArray,
		updated: mergeAsArray,
		beforeDestroy: mergeAsArray,
		beforeUnmount: mergeAsArray,
		destroyed: mergeAsArray,
		unmounted: mergeAsArray,
		activated: mergeAsArray,
		deactivated: mergeAsArray,
		errorCaptured: mergeAsArray,
		serverPrefetch: mergeAsArray,
		components: mergeObjectOptions,
		directives: mergeObjectOptions,
		watch: mergeWatchOptions,
		provide: mergeDataFn,
		inject: mergeInject
	};
	function mergeDataFn(to, from) {
		if (!from) return to;
		if (!to) return from;
		return function mergedDataFn() {
			return extend(isFunction(to) ? to.call(this, this) : to, isFunction(from) ? from.call(this, this) : from);
		};
	}
	function mergeInject(to, from) {
		return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
	}
	function normalizeInject(raw) {
		if (isArray(raw)) {
			const res = {};
			for (let i = 0; i < raw.length; i++) res[raw[i]] = raw[i];
			return res;
		}
		return raw;
	}
	function mergeAsArray(to, from) {
		return to ? [...new Set([].concat(to, from))] : from;
	}
	function mergeObjectOptions(to, from) {
		return to ? extend(Object.create(null), to, from) : from;
	}
	function mergeEmitsOrPropsOptions(to, from) {
		if (to) {
			if (isArray(to) && isArray(from)) return [...new Set([...to, ...from])];
			return extend(Object.create(null), normalizePropsOrEmits(to), normalizePropsOrEmits(from != null ? from : {}));
		} else return from;
	}
	function mergeWatchOptions(to, from) {
		if (!to) return from;
		if (!from) return to;
		const merged = extend(Object.create(null), to);
		for (const key in from) merged[key] = mergeAsArray(to[key], from[key]);
		return merged;
	}
	function createAppContext() {
		return {
			app: null,
			config: {
				isNativeTag: NO,
				performance: false,
				globalProperties: {},
				optionMergeStrategies: {},
				errorHandler: void 0,
				warnHandler: void 0,
				compilerOptions: {}
			},
			mixins: [],
			components: {},
			directives: {},
			provides: Object.create(null),
			optionsCache: new WeakMap(),
			propsCache: new WeakMap(),
			emitsCache: new WeakMap()
		};
	}
	var uid$1 = 0;
	function createAppAPI(render, hydrate) {
		return function createApp(rootComponent, rootProps = null) {
			if (!isFunction(rootComponent)) rootComponent = extend({}, rootComponent);
			if (rootProps != null && !isObject(rootProps)) rootProps = null;
			const context = createAppContext();
			const installedPlugins = new WeakSet();
			const pluginCleanupFns = [];
			let isMounted = false;
			const app = context.app = {
				_uid: uid$1++,
				_component: rootComponent,
				_props: rootProps,
				_container: null,
				_context: context,
				_instance: null,
				version,
				get config() {
					return context.config;
				},
				set config(v) {},
				use(plugin, ...options) {
					if (installedPlugins.has(plugin)) {} else if (plugin && isFunction(plugin.install)) {
						installedPlugins.add(plugin);
						plugin.install(app, ...options);
					} else if (isFunction(plugin)) {
						installedPlugins.add(plugin);
						plugin(app, ...options);
					}
					return app;
				},
				mixin(mixin) {
					if (!context.mixins.includes(mixin)) context.mixins.push(mixin);
					return app;
				},
				component(name, component) {
					if (!component) return context.components[name];
					context.components[name] = component;
					return app;
				},
				directive(name, directive) {
					if (!directive) return context.directives[name];
					context.directives[name] = directive;
					return app;
				},
				mount(rootContainer, isHydrate, namespace) {
					if (!isMounted) {
						const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
						vnode.appContext = context;
						if (namespace === true) namespace = "svg";
						else if (namespace === false) namespace = void 0;
						if (isHydrate && hydrate) hydrate(vnode, rootContainer);
						else render(vnode, rootContainer, namespace);
						isMounted = true;
						app._container = rootContainer;
						rootContainer.__vue_app__ = app;
						return getComponentPublicInstance(vnode.component);
					}
				},
				onUnmount(cleanupFn) {
					pluginCleanupFns.push(cleanupFn);
				},
				unmount() {
					if (isMounted) {
						callWithAsyncErrorHandling(pluginCleanupFns, app._instance, 16);
						render(null, app._container);
						delete app._container.__vue_app__;
					}
				},
				provide(key, value) {
					context.provides[key] = value;
					return app;
				},
				runWithContext(fn) {
					const lastApp = currentApp;
					currentApp = app;
					try {
						return fn();
					} finally {
						currentApp = lastApp;
					}
				}
			};
			return app;
		};
	}
	var currentApp = null;
	var getModelModifiers = (props, modelName) => {
		return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
	};
	function emit(instance, event, ...rawArgs) {
		if (instance.isUnmounted) return;
		const props = instance.vnode.props || EMPTY_OBJ;
		let args = rawArgs;
		const isModelListener = event.startsWith("update:");
		const modifiers = isModelListener && getModelModifiers(props, event.slice(7));
		if (modifiers) {
			if (modifiers.trim) args = rawArgs.map((a) => isString(a) ? a.trim() : a);
			if (modifiers.number) args = rawArgs.map(looseToNumber);
		}
		let handlerName;
		let handler = props[handlerName = toHandlerKey(event)] || props[handlerName = toHandlerKey(camelize(event))];
		if (!handler && isModelListener) handler = props[handlerName = toHandlerKey(hyphenate(event))];
		if (handler) callWithAsyncErrorHandling(handler, instance, 6, args);
		const onceHandler = props[handlerName + `Once`];
		if (onceHandler) {
			if (!instance.emitted) instance.emitted = {};
			else if (instance.emitted[handlerName]) return;
			instance.emitted[handlerName] = true;
			callWithAsyncErrorHandling(onceHandler, instance, 6, args);
		}
	}
	var mixinEmitsCache = new WeakMap();
	function normalizeEmitsOptions(comp, appContext, asMixin = false) {
		const cache = asMixin ? mixinEmitsCache : appContext.emitsCache;
		const cached = cache.get(comp);
		if (cached !== void 0) return cached;
		const raw = comp.emits;
		let normalized = {};
		let hasExtends = false;
		if (!isFunction(comp)) {
			const extendEmits = (raw2) => {
				const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
				if (normalizedFromExtend) {
					hasExtends = true;
					extend(normalized, normalizedFromExtend);
				}
			};
			if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendEmits);
			if (comp.extends) extendEmits(comp.extends);
			if (comp.mixins) comp.mixins.forEach(extendEmits);
		}
		if (!raw && !hasExtends) {
			if (isObject(comp)) cache.set(comp, null);
			return null;
		}
		if (isArray(raw)) raw.forEach((key) => normalized[key] = null);
		else extend(normalized, raw);
		if (isObject(comp)) cache.set(comp, normalized);
		return normalized;
	}
	function isEmitListener(options, key) {
		if (!options || !isOn(key)) return false;
		key = key.slice(2).replace(/Once$/, "");
		return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
	}
	function renderComponentRoot(instance) {
		const { type: Component, vnode, proxy, withProxy, propsOptions: [propsOptions], slots, attrs, emit, render, renderCache, props, data, setupState, ctx, inheritAttrs } = instance;
		const prev = setCurrentRenderingInstance(instance);
		let result;
		let fallthroughAttrs;
		try {
			if (vnode.shapeFlag & 4) {
				const proxyToUse = withProxy || proxy;
				const thisProxy = proxyToUse;
				result = normalizeVNode(render.call(thisProxy, proxyToUse, renderCache, props, setupState, data, ctx));
				fallthroughAttrs = attrs;
			} else {
				const render2 = Component;
				result = normalizeVNode(render2.length > 1 ? render2(props, {
					attrs,
					slots,
					emit
				}) : render2(props, null));
				fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
			}
		} catch (err) {
			blockStack.length = 0;
			handleError(err, instance, 1);
			result = createVNode(Comment);
		}
		let root = result;
		if (fallthroughAttrs && inheritAttrs !== false) {
			const keys = Object.keys(fallthroughAttrs);
			const { shapeFlag } = root;
			if (keys.length) {
				if (shapeFlag & 7) {
					if (propsOptions && keys.some(isModelListener)) fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
					root = cloneVNode(root, fallthroughAttrs, false, true);
				}
			}
		}
		if (vnode.dirs) {
			root = cloneVNode(root, null, false, true);
			root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
		}
		if (vnode.transition) setTransitionHooks(root, vnode.transition);
		result = root;
		setCurrentRenderingInstance(prev);
		return result;
	}
	var getFunctionalFallthrough = (attrs) => {
		let res;
		for (const key in attrs) if (key === "class" || key === "style" || isOn(key)) (res || (res = {}))[key] = attrs[key];
		return res;
	};
	var filterModelListeners = (attrs, props) => {
		const res = {};
		for (const key in attrs) if (!isModelListener(key) || !(key.slice(9) in props)) res[key] = attrs[key];
		return res;
	};
	function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
		const { props: prevProps, children: prevChildren, component } = prevVNode;
		const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
		const emits = component.emitsOptions;
		if (nextVNode.dirs || nextVNode.transition) return true;
		if (optimized && patchFlag >= 0) {
			if (patchFlag & 1024) return true;
			if (patchFlag & 16) {
				if (!prevProps) return !!nextProps;
				return hasPropsChanged(prevProps, nextProps, emits);
			} else if (patchFlag & 8) {
				const dynamicProps = nextVNode.dynamicProps;
				for (let i = 0; i < dynamicProps.length; i++) {
					const key = dynamicProps[i];
					if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emits, key)) return true;
				}
			}
		} else {
			if (prevChildren || nextChildren) {
				if (!nextChildren || !nextChildren.$stable) return true;
			}
			if (prevProps === nextProps) return false;
			if (!prevProps) return !!nextProps;
			if (!nextProps) return true;
			return hasPropsChanged(prevProps, nextProps, emits);
		}
		return false;
	}
	function hasPropsChanged(prevProps, nextProps, emitsOptions) {
		const nextKeys = Object.keys(nextProps);
		if (nextKeys.length !== Object.keys(prevProps).length) return true;
		for (let i = 0; i < nextKeys.length; i++) {
			const key = nextKeys[i];
			if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emitsOptions, key)) return true;
		}
		return false;
	}
	function hasPropValueChanged(nextProps, prevProps, key) {
		const nextProp = nextProps[key];
		const prevProp = prevProps[key];
		if (key === "style" && isObject(nextProp) && isObject(prevProp)) return !looseEqual(nextProp, prevProp);
		return nextProp !== prevProp;
	}
	function updateHOCHostEl({ vnode, parent, suspense }, el) {
		while (parent) {
			const root = parent.subTree;
			if (root.suspense && root.suspense.activeBranch === vnode) {
				root.suspense.vnode.el = root.el = el;
				vnode = root;
			}
			if (root === vnode) {
				(vnode = parent.vnode).el = el;
				parent = parent.parent;
			} else break;
		}
		if (suspense && suspense.activeBranch === vnode) suspense.vnode.el = el;
	}
	var internalObjectProto = {};
	var createInternalObject = () => Object.create(internalObjectProto);
	var isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
	function initProps(instance, rawProps, isStateful, isSSR = false) {
		const props = {};
		const attrs = createInternalObject();
		instance.propsDefaults = Object.create(null);
		setFullProps(instance, rawProps, props, attrs);
		for (const key in instance.propsOptions[0]) if (!(key in props)) props[key] = void 0;
		if (isStateful) instance.props = isSSR ? props : shallowReactive(props);
		else if (!instance.type.props) instance.props = attrs;
		else instance.props = props;
		instance.attrs = attrs;
	}
	function updateProps(instance, rawProps, rawPrevProps, optimized) {
		const { props, attrs, vnode: { patchFlag } } = instance;
		const rawCurrentProps = toRaw(props);
		const [options] = instance.propsOptions;
		let hasAttrsChanged = false;
		if ((optimized || patchFlag > 0) && !(patchFlag & 16)) {
			if (patchFlag & 8) {
				const propsToUpdate = instance.vnode.dynamicProps;
				for (let i = 0; i < propsToUpdate.length; i++) {
					let key = propsToUpdate[i];
					if (isEmitListener(instance.emitsOptions, key)) continue;
					const value = rawProps[key];
					if (options) if (hasOwn(attrs, key)) {
						if (value !== attrs[key]) {
							attrs[key] = value;
							hasAttrsChanged = true;
						}
					} else {
						const camelizedKey = camelize(key);
						props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false);
					}
					else if (value !== attrs[key]) {
						attrs[key] = value;
						hasAttrsChanged = true;
					}
				}
			}
		} else {
			if (setFullProps(instance, rawProps, props, attrs)) hasAttrsChanged = true;
			let kebabKey;
			for (const key in rawCurrentProps) if (!rawProps || !hasOwn(rawProps, key) && ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) if (options) {
				if (rawPrevProps && (rawPrevProps[key] !== void 0 || rawPrevProps[kebabKey] !== void 0)) props[key] = resolvePropValue(options, rawCurrentProps, key, void 0, instance, true);
			} else delete props[key];
			if (attrs !== rawCurrentProps) {
				for (const key in attrs) if (!rawProps || !hasOwn(rawProps, key) && true) {
					delete attrs[key];
					hasAttrsChanged = true;
				}
			}
		}
		if (hasAttrsChanged) trigger(instance.attrs, "set", "");
	}
	function setFullProps(instance, rawProps, props, attrs) {
		const [options, needCastKeys] = instance.propsOptions;
		let hasAttrsChanged = false;
		let rawCastValues;
		if (rawProps) for (let key in rawProps) {
			if (isReservedProp(key)) continue;
			const value = rawProps[key];
			let camelKey;
			if (options && hasOwn(options, camelKey = camelize(key))) if (!needCastKeys || !needCastKeys.includes(camelKey)) props[camelKey] = value;
			else (rawCastValues || (rawCastValues = {}))[camelKey] = value;
			else if (!isEmitListener(instance.emitsOptions, key)) {
				if (!(key in attrs) || value !== attrs[key]) {
					attrs[key] = value;
					hasAttrsChanged = true;
				}
			}
		}
		if (needCastKeys) {
			const rawCurrentProps = toRaw(props);
			const castValues = rawCastValues || EMPTY_OBJ;
			for (let i = 0; i < needCastKeys.length; i++) {
				const key = needCastKeys[i];
				props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !hasOwn(castValues, key));
			}
		}
		return hasAttrsChanged;
	}
	function resolvePropValue(options, props, key, value, instance, isAbsent) {
		const opt = options[key];
		if (opt != null) {
			const hasDefault = hasOwn(opt, "default");
			if (hasDefault && value === void 0) {
				const defaultValue = opt.default;
				if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
					const { propsDefaults } = instance;
					if (key in propsDefaults) value = propsDefaults[key];
					else {
						const reset = setCurrentInstance(instance);
						value = propsDefaults[key] = defaultValue.call(null, props);
						reset();
					}
				} else value = defaultValue;
				if (instance.ce) instance.ce._setProp(key, value);
			}
			if (opt[0]) {
				if (isAbsent && !hasDefault) value = false;
				else if (opt[1] && (value === "" || value === hyphenate(key))) value = true;
			}
		}
		return value;
	}
	var mixinPropsCache = new WeakMap();
	function normalizePropsOptions(comp, appContext, asMixin = false) {
		const cache = asMixin ? mixinPropsCache : appContext.propsCache;
		const cached = cache.get(comp);
		if (cached) return cached;
		const raw = comp.props;
		const normalized = {};
		const needCastKeys = [];
		let hasExtends = false;
		if (!isFunction(comp)) {
			const extendProps = (raw2) => {
				hasExtends = true;
				const [props, keys] = normalizePropsOptions(raw2, appContext, true);
				extend(normalized, props);
				if (keys) needCastKeys.push(...keys);
			};
			if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendProps);
			if (comp.extends) extendProps(comp.extends);
			if (comp.mixins) comp.mixins.forEach(extendProps);
		}
		if (!raw && !hasExtends) {
			if (isObject(comp)) cache.set(comp, EMPTY_ARR);
			return EMPTY_ARR;
		}
		if (isArray(raw)) for (let i = 0; i < raw.length; i++) {
			const normalizedKey = camelize(raw[i]);
			if (validatePropName(normalizedKey)) normalized[normalizedKey] = EMPTY_OBJ;
		}
		else if (raw) for (const key in raw) {
			const normalizedKey = camelize(key);
			if (validatePropName(normalizedKey)) {
				const opt = raw[key];
				const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
				const propType = prop.type;
				let shouldCast = false;
				let shouldCastTrue = true;
				if (isArray(propType)) for (let index = 0; index < propType.length; ++index) {
					const type = propType[index];
					const typeName = isFunction(type) && type.name;
					if (typeName === "Boolean") {
						shouldCast = true;
						break;
					} else if (typeName === "String") shouldCastTrue = false;
				}
				else shouldCast = isFunction(propType) && propType.name === "Boolean";
				prop[0] = shouldCast;
				prop[1] = shouldCastTrue;
				if (shouldCast || hasOwn(prop, "default")) needCastKeys.push(normalizedKey);
			}
		}
		const res = [normalized, needCastKeys];
		if (isObject(comp)) cache.set(comp, res);
		return res;
	}
	function validatePropName(key) {
		if (key[0] !== "$" && !isReservedProp(key)) return true;
		return false;
	}
	var isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
	var normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
	var normalizeSlot = (key, rawSlot, ctx) => {
		if (rawSlot._n) return rawSlot;
		const normalized = withCtx((...args) => {
			return normalizeSlotValue(rawSlot(...args));
		}, ctx);
		normalized._c = false;
		return normalized;
	};
	var normalizeObjectSlots = (rawSlots, slots, instance) => {
		const ctx = rawSlots._ctx;
		for (const key in rawSlots) {
			if (isInternalKey(key)) continue;
			const value = rawSlots[key];
			if (isFunction(value)) slots[key] = normalizeSlot(key, value, ctx);
			else if (value != null) {
				const normalized = normalizeSlotValue(value);
				slots[key] = () => normalized;
			}
		}
	};
	var normalizeVNodeSlots = (instance, children) => {
		const normalized = normalizeSlotValue(children);
		instance.slots.default = () => normalized;
	};
	var assignSlots = (slots, children, optimized) => {
		for (const key in children) if (optimized || !isInternalKey(key)) slots[key] = children[key];
	};
	var initSlots = (instance, children, optimized) => {
		const slots = instance.slots = createInternalObject();
		if (instance.vnode.shapeFlag & 32) {
			const type = children._;
			if (type) {
				assignSlots(slots, children, optimized);
				if (optimized) def(slots, "_", type, true);
			} else normalizeObjectSlots(children, slots);
		} else if (children) normalizeVNodeSlots(instance, children);
	};
	var updateSlots = (instance, children, optimized) => {
		const { vnode, slots } = instance;
		let needDeletionCheck = true;
		let deletionComparisonTarget = EMPTY_OBJ;
		if (vnode.shapeFlag & 32) {
			const type = children._;
			if (type) if (optimized && type === 1) needDeletionCheck = false;
			else assignSlots(slots, children, optimized);
			else {
				needDeletionCheck = !children.$stable;
				normalizeObjectSlots(children, slots);
			}
			deletionComparisonTarget = children;
		} else if (children) {
			normalizeVNodeSlots(instance, children);
			deletionComparisonTarget = { default: 1 };
		}
		if (needDeletionCheck) {
			for (const key in slots) if (!isInternalKey(key) && deletionComparisonTarget[key] == null) delete slots[key];
		}
	};
	var queuePostRenderEffect = queueEffectWithSuspense;
	function createRenderer(options) {
		return baseCreateRenderer(options);
	}
	function baseCreateRenderer(options, createHydrationFns) {
		const target = getGlobalThis();
		target.__VUE__ = true;
		const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, insertStaticContent: hostInsertStaticContent } = options;
		const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
			if (n1 === n2) return;
			if (n1 && !isSameVNodeType(n1, n2)) {
				anchor = getNextHostNode(n1);
				unmount(n1, parentComponent, parentSuspense, true);
				n1 = null;
			}
			if (n2.patchFlag === -2) {
				optimized = false;
				n2.dynamicChildren = null;
			}
			const { type, ref, shapeFlag } = n2;
			switch (type) {
				case Text:
					processText(n1, n2, container, anchor);
					break;
				case Comment:
					processCommentNode(n1, n2, container, anchor);
					break;
				case Static:
					if (n1 == null) mountStaticNode(n2, container, anchor, namespace);
					break;
				case Fragment:
					processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					break;
				default: if (shapeFlag & 1) processElement(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else if (shapeFlag & 6) processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else if (shapeFlag & 64) type.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
				else if (shapeFlag & 128) type.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
			}
			if (ref != null && parentComponent) setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
			else if (ref == null && n1 && n1.ref != null) setRef(n1.ref, null, parentSuspense, n1, true);
		};
		const processText = (n1, n2, container, anchor) => {
			if (n1 == null) hostInsert(n2.el = hostCreateText(n2.children), container, anchor);
			else {
				const el = n2.el = n1.el;
				if (n2.children !== n1.children) hostSetText(el, n2.children);
			}
		};
		const processCommentNode = (n1, n2, container, anchor) => {
			if (n1 == null) hostInsert(n2.el = hostCreateComment(n2.children || ""), container, anchor);
			else n2.el = n1.el;
		};
		const mountStaticNode = (n2, container, anchor, namespace) => {
			[n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, namespace, n2.el, n2.anchor);
		};
		const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
			let next;
			while (el && el !== anchor) {
				next = hostNextSibling(el);
				hostInsert(el, container, nextSibling);
				el = next;
			}
			hostInsert(anchor, container, nextSibling);
		};
		const removeStaticNode = ({ el, anchor }) => {
			let next;
			while (el && el !== anchor) {
				next = hostNextSibling(el);
				hostRemove(el);
				el = next;
			}
			hostRemove(anchor);
		};
		const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			if (n2.type === "svg") namespace = "svg";
			else if (n2.type === "math") namespace = "mathml";
			if (n1 == null) mountElement(n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else {
				const customElement = n1.el && n1.el._isVueCE ? n1.el : null;
				try {
					if (customElement) customElement._beginPatch();
					patchElement(n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				} finally {
					if (customElement) customElement._endPatch();
				}
			}
		};
		const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			let el;
			let vnodeHook;
			const { props, shapeFlag, transition, dirs } = vnode;
			el = vnode.el = hostCreateElement(vnode.type, namespace, props && props.is, props);
			if (shapeFlag & 8) hostSetElementText(el, vnode.children);
			else if (shapeFlag & 16) mountChildren(vnode.children, el, null, parentComponent, parentSuspense, resolveChildrenNamespace(vnode, namespace), slotScopeIds, optimized);
			if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "created");
			setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
			if (props) {
				for (const key in props) if (key !== "value" && !isReservedProp(key)) hostPatchProp(el, key, null, props[key], namespace, parentComponent);
				if ("value" in props) hostPatchProp(el, "value", null, props.value, namespace);
				if (vnodeHook = props.onVnodeBeforeMount) invokeVNodeHook(vnodeHook, parentComponent, vnode);
			}
			if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
			const needCallTransitionHooks = needTransition(parentSuspense, transition);
			if (needCallTransitionHooks) transition.beforeEnter(el);
			hostInsert(el, container, anchor);
			if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) queuePostRenderEffect(() => {
				try {
					vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
					needCallTransitionHooks && transition.enter(el);
					dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
				} finally {}
			}, parentSuspense);
		};
		const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
			if (scopeId) hostSetScopeId(el, scopeId);
			if (slotScopeIds) for (let i = 0; i < slotScopeIds.length; i++) hostSetScopeId(el, slotScopeIds[i]);
			if (parentComponent) {
				let subTree = parentComponent.subTree;
				if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
					const parentVNode = parentComponent.vnode;
					setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
				}
			}
		};
		const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
			for (let i = start; i < children.length; i++) patch(null, children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]), container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		};
		const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			const el = n2.el = n1.el;
			let { patchFlag, dynamicChildren, dirs } = n2;
			patchFlag |= n1.patchFlag & 16;
			const oldProps = n1.props || EMPTY_OBJ;
			const newProps = n2.props || EMPTY_OBJ;
			let vnodeHook;
			parentComponent && toggleRecurse(parentComponent, false);
			if (vnodeHook = newProps.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
			if (dirs) invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
			parentComponent && toggleRecurse(parentComponent, true);
			if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) hostSetElementText(el, "");
			if (dynamicChildren) patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, resolveChildrenNamespace(n2, namespace), slotScopeIds);
			else if (!optimized) patchChildren(n1, n2, el, null, parentComponent, parentSuspense, resolveChildrenNamespace(n2, namespace), slotScopeIds, false);
			if (patchFlag > 0) {
				if (patchFlag & 16) patchProps(el, oldProps, newProps, parentComponent, namespace);
				else {
					if (patchFlag & 2) {
						if (oldProps.class !== newProps.class) hostPatchProp(el, "class", null, newProps.class, namespace);
					}
					if (patchFlag & 4) hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
					if (patchFlag & 8) {
						const propsToUpdate = n2.dynamicProps;
						for (let i = 0; i < propsToUpdate.length; i++) {
							const key = propsToUpdate[i];
							const prev = oldProps[key];
							const next = newProps[key];
							if (next !== prev || key === "value") hostPatchProp(el, key, prev, next, namespace, parentComponent);
						}
					}
				}
				if (patchFlag & 1) {
					if (n1.children !== n2.children) hostSetElementText(el, n2.children);
				}
			} else if (!optimized && dynamicChildren == null) patchProps(el, oldProps, newProps, parentComponent, namespace);
			if ((vnodeHook = newProps.onVnodeUpdated) || dirs) queuePostRenderEffect(() => {
				vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
				dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
			}, parentSuspense);
		};
		const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
			for (let i = 0; i < newChildren.length; i++) {
				const oldVNode = oldChildren[i];
				const newVNode = newChildren[i];
				patch(oldVNode, newVNode, oldVNode.el && (oldVNode.type === Fragment || !isSameVNodeType(oldVNode, newVNode) || oldVNode.shapeFlag & 198) ? hostParentNode(oldVNode.el) : fallbackContainer, null, parentComponent, parentSuspense, namespace, slotScopeIds, true);
			}
		};
		const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
			if (oldProps !== newProps) {
				if (oldProps !== EMPTY_OBJ) {
					for (const key in oldProps) if (!isReservedProp(key) && !(key in newProps)) hostPatchProp(el, key, oldProps[key], null, namespace, parentComponent);
				}
				for (const key in newProps) {
					if (isReservedProp(key)) continue;
					const next = newProps[key];
					const prev = oldProps[key];
					if (next !== prev && key !== "value") hostPatchProp(el, key, prev, next, namespace, parentComponent);
				}
				if ("value" in newProps) hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
			}
		};
		const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
			const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
			let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
			if (fragmentSlotScopeIds) slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
			if (n1 == null) {
				hostInsert(fragmentStartAnchor, container, anchor);
				hostInsert(fragmentEndAnchor, container, anchor);
				mountChildren(n2.children || [], container, fragmentEndAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			} else if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
				patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, namespace, slotScopeIds);
				if (n2.key != null || parentComponent && n2 === parentComponent.subTree) traverseStaticChildren(n1, n2, true);
			} else patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		};
		const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			n2.slotScopeIds = slotScopeIds;
			if (n1 == null) if (n2.shapeFlag & 512) parentComponent.ctx.activate(n2, container, anchor, namespace, optimized);
			else mountComponent(n2, container, anchor, parentComponent, parentSuspense, namespace, optimized);
			else updateComponent(n1, n2, optimized);
		};
		const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
			const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense);
			if (isKeepAlive(initialVNode)) instance.ctx.renderer = internals;
			setupComponent(instance, false, optimized);
			if (instance.asyncDep) {
				parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
				if (!initialVNode.el) {
					const placeholder = instance.subTree = createVNode(Comment);
					processCommentNode(null, placeholder, container, anchor);
					initialVNode.placeholder = placeholder.el;
				}
			} else setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, namespace, optimized);
		};
		const updateComponent = (n1, n2, optimized) => {
			const instance = n2.component = n1.component;
			if (shouldUpdateComponent(n1, n2, optimized)) if (instance.asyncDep && !instance.asyncResolved) {
				updateComponentPreRender(instance, n2, optimized);
				return;
			} else {
				instance.next = n2;
				instance.update();
			}
			else {
				n2.el = n1.el;
				instance.vnode = n2;
			}
		};
		const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
			const componentUpdateFn = () => {
				if (!instance.isMounted) {
					let vnodeHook;
					const { el, props } = initialVNode;
					const { bm, m, parent, root, type } = instance;
					const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
					toggleRecurse(instance, false);
					if (bm) invokeArrayFns(bm);
					if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) invokeVNodeHook(vnodeHook, parent, initialVNode);
					toggleRecurse(instance, true);
					if (el && hydrateNode) {
						const hydrateSubTree = () => {
							instance.subTree = renderComponentRoot(instance);
							hydrateNode(el, instance.subTree, instance, parentSuspense, null);
						};
						if (isAsyncWrapperVNode && type.__asyncHydrate) type.__asyncHydrate(el, instance, hydrateSubTree);
						else hydrateSubTree();
					} else {
						if (root.ce && root.ce._hasShadowRoot()) root.ce._injectChildStyle(type, instance.parent ? instance.parent.type : void 0);
						const subTree = instance.subTree = renderComponentRoot(instance);
						patch(null, subTree, container, anchor, instance, parentSuspense, namespace);
						initialVNode.el = subTree.el;
					}
					if (m) queuePostRenderEffect(m, parentSuspense);
					if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
						const scopedInitialVNode = initialVNode;
						queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
					}
					if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) instance.a && queuePostRenderEffect(instance.a, parentSuspense);
					instance.isMounted = true;
					initialVNode = container = anchor = null;
				} else {
					let { next, bu, u, parent, vnode } = instance;
					{
						const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
						if (nonHydratedAsyncRoot) {
							if (next) {
								next.el = vnode.el;
								updateComponentPreRender(instance, next, optimized);
							}
							nonHydratedAsyncRoot.asyncDep.then(() => {
								queuePostRenderEffect(() => {
									if (!instance.isUnmounted) update();
								}, parentSuspense);
							});
							return;
						}
					}
					let originNext = next;
					let vnodeHook;
					toggleRecurse(instance, false);
					if (next) {
						next.el = vnode.el;
						updateComponentPreRender(instance, next, optimized);
					} else next = vnode;
					if (bu) invokeArrayFns(bu);
					if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parent, next, vnode);
					toggleRecurse(instance, true);
					const nextTree = renderComponentRoot(instance);
					const prevTree = instance.subTree;
					instance.subTree = nextTree;
					patch(prevTree, nextTree, hostParentNode(prevTree.el), getNextHostNode(prevTree), instance, parentSuspense, namespace);
					next.el = nextTree.el;
					if (originNext === null) updateHOCHostEl(instance, nextTree.el);
					if (u) queuePostRenderEffect(u, parentSuspense);
					if (vnodeHook = next.props && next.props.onVnodeUpdated) queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
				}
			};
			instance.scope.on();
			const effect = instance.effect = new ReactiveEffect(componentUpdateFn);
			instance.scope.off();
			const update = instance.update = effect.run.bind(effect);
			const job = instance.job = effect.runIfDirty.bind(effect);
			job.i = instance;
			job.id = instance.uid;
			effect.scheduler = () => queueJob(job);
			toggleRecurse(instance, true);
			update();
		};
		const updateComponentPreRender = (instance, nextVNode, optimized) => {
			nextVNode.component = instance;
			const prevProps = instance.vnode.props;
			instance.vnode = nextVNode;
			instance.next = null;
			updateProps(instance, nextVNode.props, prevProps, optimized);
			updateSlots(instance, nextVNode.children, optimized);
			pauseTracking();
			flushPreFlushCbs(instance);
			resetTracking();
		};
		const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
			const c1 = n1 && n1.children;
			const prevShapeFlag = n1 ? n1.shapeFlag : 0;
			const c2 = n2.children;
			const { patchFlag, shapeFlag } = n2;
			if (patchFlag > 0) {
				if (patchFlag & 128) {
					patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					return;
				} else if (patchFlag & 256) {
					patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					return;
				}
			}
			if (shapeFlag & 8) {
				if (prevShapeFlag & 16) unmountChildren(c1, parentComponent, parentSuspense);
				if (c2 !== c1) hostSetElementText(container, c2);
			} else if (prevShapeFlag & 16) if (shapeFlag & 16) patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else unmountChildren(c1, parentComponent, parentSuspense, true);
			else {
				if (prevShapeFlag & 8) hostSetElementText(container, "");
				if (shapeFlag & 16) mountChildren(c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			}
		};
		const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			c1 = c1 || EMPTY_ARR;
			c2 = c2 || EMPTY_ARR;
			const oldLength = c1.length;
			const newLength = c2.length;
			const commonLength = Math.min(oldLength, newLength);
			let i;
			for (i = 0; i < commonLength; i++) {
				const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
				patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			}
			if (oldLength > newLength) unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
			else mountChildren(c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, commonLength);
		};
		const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			let i = 0;
			const l2 = c2.length;
			let e1 = c1.length - 1;
			let e2 = l2 - 1;
			while (i <= e1 && i <= e2) {
				const n1 = c1[i];
				const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
				if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else break;
				i++;
			}
			while (i <= e1 && i <= e2) {
				const n1 = c1[e1];
				const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
				if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else break;
				e1--;
				e2--;
			}
			if (i > e1) {
				if (i <= e2) {
					const nextPos = e2 + 1;
					const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
					while (i <= e2) {
						patch(null, c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]), container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
						i++;
					}
				}
			} else if (i > e2) while (i <= e1) {
				unmount(c1[i], parentComponent, parentSuspense, true);
				i++;
			}
			else {
				const s1 = i;
				const s2 = i;
				const keyToNewIndexMap = new Map();
				for (i = s2; i <= e2; i++) {
					const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
					if (nextChild.key != null) keyToNewIndexMap.set(nextChild.key, i);
				}
				let j;
				let patched = 0;
				const toBePatched = e2 - s2 + 1;
				let moved = false;
				let maxNewIndexSoFar = 0;
				const newIndexToOldIndexMap = new Array(toBePatched);
				for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
				for (i = s1; i <= e1; i++) {
					const prevChild = c1[i];
					if (patched >= toBePatched) {
						unmount(prevChild, parentComponent, parentSuspense, true);
						continue;
					}
					let newIndex;
					if (prevChild.key != null) newIndex = keyToNewIndexMap.get(prevChild.key);
					else for (j = s2; j <= e2; j++) if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
						newIndex = j;
						break;
					}
					if (newIndex === void 0) unmount(prevChild, parentComponent, parentSuspense, true);
					else {
						newIndexToOldIndexMap[newIndex - s2] = i + 1;
						if (newIndex >= maxNewIndexSoFar) maxNewIndexSoFar = newIndex;
						else moved = true;
						patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
						patched++;
					}
				}
				const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
				j = increasingNewIndexSequence.length - 1;
				for (i = toBePatched - 1; i >= 0; i--) {
					const nextIndex = s2 + i;
					const nextChild = c2[nextIndex];
					const anchorVNode = c2[nextIndex + 1];
					const anchor = nextIndex + 1 < l2 ? anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode) : parentAnchor;
					if (newIndexToOldIndexMap[i] === 0) patch(null, nextChild, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					else if (moved) if (j < 0 || i !== increasingNewIndexSequence[j]) move(nextChild, container, anchor, 2);
					else j--;
				}
			}
		};
		const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
			const { el, type, transition, children, shapeFlag } = vnode;
			if (shapeFlag & 6) {
				move(vnode.component.subTree, container, anchor, moveType);
				return;
			}
			if (shapeFlag & 128) {
				vnode.suspense.move(container, anchor, moveType);
				return;
			}
			if (shapeFlag & 64) {
				type.move(vnode, container, anchor, internals);
				return;
			}
			if (type === Fragment) {
				hostInsert(el, container, anchor);
				for (let i = 0; i < children.length; i++) move(children[i], container, anchor, moveType);
				hostInsert(vnode.anchor, container, anchor);
				return;
			}
			if (type === Static) {
				moveStaticNode(vnode, container, anchor);
				return;
			}
			if (moveType !== 2 && shapeFlag & 1 && transition) if (moveType === 0) if (transition.persisted && !el[leaveCbKey]) hostInsert(el, container, anchor);
			else {
				transition.beforeEnter(el);
				hostInsert(el, container, anchor);
				queuePostRenderEffect(() => transition.enter(el), parentSuspense);
			}
			else {
				const { leave, delayLeave, afterLeave } = transition;
				const remove2 = () => {
					if (vnode.ctx.isUnmounted) hostRemove(el);
					else hostInsert(el, container, anchor);
				};
				const performLeave = () => {
					const wasLeaving = el._isLeaving || !!el[leaveCbKey];
					if (el._isLeaving) el[leaveCbKey](true);
					if (transition.persisted && !wasLeaving) remove2();
					else leave(el, () => {
						remove2();
						afterLeave && afterLeave();
					});
				};
				if (delayLeave) delayLeave(el, remove2, performLeave);
				else performLeave();
			}
			else hostInsert(el, container, anchor);
		};
		const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
			const { type, props, ref, children, dynamicChildren, shapeFlag, patchFlag, dirs, cacheIndex, memo } = vnode;
			if (patchFlag === -2) optimized = false;
			if (ref != null) {
				pauseTracking();
				setRef(ref, null, parentSuspense, vnode, true);
				resetTracking();
			}
			if (cacheIndex != null) parentComponent.renderCache[cacheIndex] = void 0;
			if (shapeFlag & 256) {
				parentComponent.ctx.deactivate(vnode);
				return;
			}
			const shouldInvokeDirs = shapeFlag & 1 && dirs;
			const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
			let vnodeHook;
			if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) invokeVNodeHook(vnodeHook, parentComponent, vnode);
			if (shapeFlag & 6) unmountComponent(vnode.component, parentSuspense, doRemove);
			else {
				if (shapeFlag & 128) {
					vnode.suspense.unmount(parentSuspense, doRemove);
					return;
				}
				if (shouldInvokeDirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
				if (shapeFlag & 64) vnode.type.remove(vnode, parentComponent, parentSuspense, internals, doRemove);
				else if (dynamicChildren && !dynamicChildren.hasOnce && (type !== Fragment || patchFlag > 0 && patchFlag & 64)) unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
				else if (type === Fragment && patchFlag & 384 || !optimized && shapeFlag & 16) unmountChildren(children, parentComponent, parentSuspense);
				if (doRemove) remove(vnode);
			}
			const shouldInvalidateMemo = memo != null && cacheIndex == null;
			if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs || shouldInvalidateMemo) queuePostRenderEffect(() => {
				vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
				shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
				if (shouldInvalidateMemo) vnode.el = null;
			}, parentSuspense);
		};
		const remove = (vnode) => {
			const { type, el, anchor, transition } = vnode;
			if (type === Fragment) {
				removeFragment(el, anchor);
				return;
			}
			if (type === Static) {
				removeStaticNode(vnode);
				return;
			}
			const performRemove = () => {
				hostRemove(el);
				if (transition && !transition.persisted && transition.afterLeave) transition.afterLeave();
			};
			if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
				const { leave, delayLeave } = transition;
				const performLeave = () => leave(el, performRemove);
				if (delayLeave) delayLeave(vnode.el, performRemove, performLeave);
				else performLeave();
			} else performRemove();
		};
		const removeFragment = (cur, end) => {
			let next;
			while (cur !== end) {
				next = hostNextSibling(cur);
				hostRemove(cur);
				cur = next;
			}
			hostRemove(end);
		};
		const unmountComponent = (instance, parentSuspense, doRemove) => {
			const { bum, scope, job, subTree, um, m, a } = instance;
			invalidateMount(m);
			invalidateMount(a);
			if (bum) invokeArrayFns(bum);
			scope.stop();
			if (job) {
				job.flags |= 8;
				unmount(subTree, instance, parentSuspense, doRemove);
			}
			if (um) queuePostRenderEffect(um, parentSuspense);
			queuePostRenderEffect(() => {
				instance.isUnmounted = true;
			}, parentSuspense);
		};
		const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
			for (let i = start; i < children.length; i++) unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
		};
		const getNextHostNode = (vnode) => {
			if (vnode.shapeFlag & 6) return getNextHostNode(vnode.component.subTree);
			if (vnode.shapeFlag & 128) return vnode.suspense.next();
			const el = hostNextSibling(vnode.anchor || vnode.el);
			const teleportEnd = el && el[TeleportEndKey];
			return teleportEnd ? hostNextSibling(teleportEnd) : el;
		};
		let isFlushing = false;
		const render = (vnode, container, namespace) => {
			let instance;
			if (vnode == null) {
				if (container._vnode) {
					unmount(container._vnode, null, null, true);
					instance = container._vnode.component;
				}
			} else patch(container._vnode || null, vnode, container, null, null, null, namespace);
			container._vnode = vnode;
			if (!isFlushing) {
				isFlushing = true;
				flushPreFlushCbs(instance);
				flushPostFlushCbs();
				isFlushing = false;
			}
		};
		const internals = {
			p: patch,
			um: unmount,
			m: move,
			r: remove,
			mt: mountComponent,
			mc: mountChildren,
			pc: patchChildren,
			pbc: patchBlockChildren,
			n: getNextHostNode,
			o: options
		};
		let hydrate;
		let hydrateNode;
		if (createHydrationFns) [hydrate, hydrateNode] = createHydrationFns(internals);
		return {
			render,
			hydrate,
			createApp: createAppAPI(render, hydrate)
		};
	}
	function resolveChildrenNamespace({ type, props }, currentNamespace) {
		return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
	}
	function toggleRecurse({ effect, job }, allowed) {
		if (allowed) {
			effect.flags |= 32;
			job.flags |= 4;
		} else {
			effect.flags &= -33;
			job.flags &= -5;
		}
	}
	function needTransition(parentSuspense, transition) {
		return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
	}
	function traverseStaticChildren(n1, n2, shallow = false) {
		const ch1 = n1.children;
		const ch2 = n2.children;
		if (isArray(ch1) && isArray(ch2)) for (let i = 0; i < ch1.length; i++) {
			const c1 = ch1[i];
			let c2 = ch2[i];
			if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
				if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
					c2 = ch2[i] = cloneIfMounted(ch2[i]);
					c2.el = c1.el;
				}
				if (!shallow && c2.patchFlag !== -2) traverseStaticChildren(c1, c2);
			}
			if (c2.type === Text) {
				if (c2.patchFlag === -1) c2 = ch2[i] = cloneIfMounted(c2);
				c2.el = c1.el;
			}
			if (c2.type === Comment && !c2.el) c2.el = c1.el;
		}
	}
	function getSequence(arr) {
		const p = arr.slice();
		const result = [0];
		let i, j, u, v, c;
		const len = arr.length;
		for (i = 0; i < len; i++) {
			const arrI = arr[i];
			if (arrI !== 0) {
				j = result[result.length - 1];
				if (arr[j] < arrI) {
					p[i] = j;
					result.push(i);
					continue;
				}
				u = 0;
				v = result.length - 1;
				while (u < v) {
					c = u + v >> 1;
					if (arr[result[c]] < arrI) u = c + 1;
					else v = c;
				}
				if (arrI < arr[result[u]]) {
					if (u > 0) p[i] = result[u - 1];
					result[u] = i;
				}
			}
		}
		u = result.length;
		v = result[u - 1];
		while (u-- > 0) {
			result[u] = v;
			v = p[v];
		}
		return result;
	}
	function locateNonHydratedAsyncRoot(instance) {
		const subComponent = instance.subTree.component;
		if (subComponent) if (subComponent.asyncDep && !subComponent.asyncResolved) return subComponent;
		else return locateNonHydratedAsyncRoot(subComponent);
	}
	function invalidateMount(hooks) {
		if (hooks) for (let i = 0; i < hooks.length; i++) hooks[i].flags |= 8;
	}
	function resolveAsyncComponentPlaceholder(anchorVnode) {
		if (anchorVnode.placeholder) return anchorVnode.placeholder;
		const instance = anchorVnode.component;
		if (instance) return resolveAsyncComponentPlaceholder(instance.subTree);
		return null;
	}
	var isSuspense = (type) => type.__isSuspense;
	function queueEffectWithSuspense(fn, suspense) {
		if (suspense && suspense.pendingBranch) if (isArray(fn)) suspense.effects.push(...fn);
		else suspense.effects.push(fn);
		else queuePostFlushCb(fn);
	}
	var Fragment = Symbol.for("v-fgt");
	var Text = Symbol.for("v-txt");
	var Comment = Symbol.for("v-cmt");
	var Static = Symbol.for("v-stc");
	var blockStack = [];
	var currentBlock = null;
	function openBlock(disableTracking = false) {
		blockStack.push(currentBlock = disableTracking ? null : []);
	}
	function closeBlock() {
		blockStack.pop();
		currentBlock = blockStack[blockStack.length - 1] || null;
	}
	var isBlockTreeEnabled = 1;
	function setBlockTracking(value, inVOnce = false) {
		isBlockTreeEnabled += value;
		if (value < 0 && currentBlock && inVOnce) currentBlock.hasOnce = true;
	}
	function setupBlock(vnode) {
		vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
		closeBlock();
		if (isBlockTreeEnabled > 0 && currentBlock) currentBlock.push(vnode);
		return vnode;
	}
	function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
		return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true));
	}
	function createBlock(type, props, children, patchFlag, dynamicProps) {
		return setupBlock(createVNode(type, props, children, patchFlag, dynamicProps, true));
	}
	function isVNode(value) {
		return value ? value.__v_isVNode === true : false;
	}
	function isSameVNodeType(n1, n2) {
		return n1.type === n2.type && n1.key === n2.key;
	}
	var normalizeKey = ({ key }) => key != null ? key : null;
	var normalizeRef = ({ ref, ref_key, ref_for }) => {
		if (typeof ref === "number") ref = "" + ref;
		return ref != null ? isString(ref) || isRef(ref) || isFunction(ref) ? {
			i: currentRenderingInstance,
			r: ref,
			k: ref_key,
			f: !!ref_for
		} : ref : null;
	};
	function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
		const vnode = {
			__v_isVNode: true,
			__v_skip: true,
			type,
			props,
			key: props && normalizeKey(props),
			ref: props && normalizeRef(props),
			scopeId: currentScopeId,
			slotScopeIds: null,
			children,
			component: null,
			suspense: null,
			ssContent: null,
			ssFallback: null,
			dirs: null,
			transition: null,
			el: null,
			anchor: null,
			target: null,
			targetStart: null,
			targetAnchor: null,
			staticCount: 0,
			shapeFlag,
			patchFlag,
			dynamicProps,
			dynamicChildren: null,
			appContext: null,
			ctx: currentRenderingInstance
		};
		if (needFullChildrenNormalization) {
			normalizeChildren(vnode, children);
			if (shapeFlag & 128) type.normalize(vnode);
		} else if (children) vnode.shapeFlag |= isString(children) ? 8 : 16;
		if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock && (vnode.patchFlag > 0 || shapeFlag & 6) && vnode.patchFlag !== 32) currentBlock.push(vnode);
		return vnode;
	}
	var createVNode = _createVNode;
	function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
		if (!type || type === NULL_DYNAMIC_COMPONENT) type = Comment;
		if (isVNode(type)) {
			const cloned = cloneVNode(type, props, true);
			if (children) normalizeChildren(cloned, children);
			if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) if (cloned.shapeFlag & 6) currentBlock[currentBlock.indexOf(type)] = cloned;
			else currentBlock.push(cloned);
			cloned.patchFlag = -2;
			return cloned;
		}
		if (isClassComponent(type)) type = type.__vccOpts;
		if (props) {
			props = guardReactiveProps(props);
			let { class: klass, style } = props;
			if (klass && !isString(klass)) props.class = normalizeClass(klass);
			if (isObject(style)) {
				if (isProxy(style) && !isArray(style)) style = extend({}, style);
				props.style = normalizeStyle(style);
			}
		}
		const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
		return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
	}
	function guardReactiveProps(props) {
		if (!props) return null;
		return isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
	}
	function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
		const { props, ref, patchFlag, children, transition } = vnode;
		const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
		const cloned = {
			__v_isVNode: true,
			__v_skip: true,
			type: vnode.type,
			props: mergedProps,
			key: mergedProps && normalizeKey(mergedProps),
			ref: extraProps && extraProps.ref ? mergeRef && ref ? isArray(ref) ? ref.concat(normalizeRef(extraProps)) : [ref, normalizeRef(extraProps)] : normalizeRef(extraProps) : ref,
			scopeId: vnode.scopeId,
			slotScopeIds: vnode.slotScopeIds,
			children,
			target: vnode.target,
			targetStart: vnode.targetStart,
			targetAnchor: vnode.targetAnchor,
			staticCount: vnode.staticCount,
			shapeFlag: vnode.shapeFlag,
			patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
			dynamicProps: vnode.dynamicProps,
			dynamicChildren: vnode.dynamicChildren,
			appContext: vnode.appContext,
			dirs: vnode.dirs,
			transition,
			component: vnode.component,
			suspense: vnode.suspense,
			ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
			ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
			placeholder: vnode.placeholder,
			el: vnode.el,
			anchor: vnode.anchor,
			ctx: vnode.ctx,
			ce: vnode.ce
		};
		if (transition && cloneTransition) setTransitionHooks(cloned, transition.clone(cloned));
		return cloned;
	}
	function createTextVNode(text = " ", flag = 0) {
		return createVNode(Text, null, text, flag);
	}
	function createCommentVNode(text = "", asBlock = false) {
		return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
	}
	function normalizeVNode(child) {
		if (child == null || typeof child === "boolean") return createVNode(Comment);
		else if (isArray(child)) return createVNode(Fragment, null, child.slice());
		else if (isVNode(child)) return cloneIfMounted(child);
		else return createVNode(Text, null, String(child));
	}
	function cloneIfMounted(child) {
		return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
	}
	function normalizeChildren(vnode, children) {
		let type = 0;
		const { shapeFlag } = vnode;
		if (children == null) children = null;
		else if (isArray(children)) type = 16;
		else if (typeof children === "object") if (shapeFlag & 65) {
			const slot = children.default;
			if (slot) {
				slot._c && (slot._d = false);
				normalizeChildren(vnode, slot());
				slot._c && (slot._d = true);
			}
			return;
		} else {
			type = 32;
			const slotFlag = children._;
			if (!slotFlag && !isInternalObject(children)) children._ctx = currentRenderingInstance;
			else if (slotFlag === 3 && currentRenderingInstance) if (currentRenderingInstance.slots._ === 1) children._ = 1;
			else {
				children._ = 2;
				vnode.patchFlag |= 1024;
			}
		}
		else if (isFunction(children)) {
			children = {
				default: children,
				_ctx: currentRenderingInstance
			};
			type = 32;
		} else {
			children = String(children);
			if (shapeFlag & 64) {
				type = 16;
				children = [createTextVNode(children)];
			} else type = 8;
		}
		vnode.children = children;
		vnode.shapeFlag |= type;
	}
	function mergeProps(...args) {
		const ret = {};
		for (let i = 0; i < args.length; i++) {
			const toMerge = args[i];
			for (const key in toMerge) if (key === "class") {
				if (ret.class !== toMerge.class) ret.class = normalizeClass([ret.class, toMerge.class]);
			} else if (key === "style") ret.style = normalizeStyle([ret.style, toMerge.style]);
			else if (isOn(key)) {
				const existing = ret[key];
				const incoming = toMerge[key];
				if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) ret[key] = existing ? [].concat(existing, incoming) : incoming;
				else if (incoming == null && existing == null && !isModelListener(key)) ret[key] = incoming;
			} else if (key !== "") ret[key] = toMerge[key];
		}
		return ret;
	}
	function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
		callWithAsyncErrorHandling(hook, instance, 7, [vnode, prevVNode]);
	}
	var emptyAppContext = createAppContext();
	var uid = 0;
	function createComponentInstance(vnode, parent, suspense) {
		const type = vnode.type;
		const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
		const instance = {
			uid: uid++,
			vnode,
			type,
			parent,
			appContext,
			root: null,
			next: null,
			subTree: null,
			effect: null,
			update: null,
			job: null,
			scope: new EffectScope(true),
			render: null,
			proxy: null,
			exposed: null,
			exposeProxy: null,
			withProxy: null,
			provides: parent ? parent.provides : Object.create(appContext.provides),
			ids: parent ? parent.ids : [
				"",
				0,
				0
			],
			accessCache: null,
			renderCache: [],
			components: null,
			directives: null,
			propsOptions: normalizePropsOptions(type, appContext),
			emitsOptions: normalizeEmitsOptions(type, appContext),
			emit: null,
			emitted: null,
			propsDefaults: EMPTY_OBJ,
			inheritAttrs: type.inheritAttrs,
			ctx: EMPTY_OBJ,
			data: EMPTY_OBJ,
			props: EMPTY_OBJ,
			attrs: EMPTY_OBJ,
			slots: EMPTY_OBJ,
			refs: EMPTY_OBJ,
			setupState: EMPTY_OBJ,
			setupContext: null,
			suspense,
			suspenseId: suspense ? suspense.pendingId : 0,
			asyncDep: null,
			asyncResolved: false,
			isMounted: false,
			isUnmounted: false,
			isDeactivated: false,
			bc: null,
			c: null,
			bm: null,
			m: null,
			bu: null,
			u: null,
			um: null,
			bum: null,
			da: null,
			a: null,
			rtg: null,
			rtc: null,
			ec: null,
			sp: null
		};
		instance.ctx = { _: instance };
		instance.root = parent ? parent.root : instance;
		instance.emit = emit.bind(null, instance);
		if (vnode.ce) vnode.ce(instance);
		return instance;
	}
	var currentInstance = null;
	var getCurrentInstance = () => currentInstance || currentRenderingInstance;
	var internalSetCurrentInstance;
	var setInSSRSetupState;
	{
		const g = getGlobalThis();
		const registerGlobalSetter = (key, setter) => {
			let setters;
			if (!(setters = g[key])) setters = g[key] = [];
			setters.push(setter);
			return (v) => {
				if (setters.length > 1) setters.forEach((set) => set(v));
				else setters[0](v);
			};
		};
		internalSetCurrentInstance = registerGlobalSetter(`__VUE_INSTANCE_SETTERS__`, (v) => currentInstance = v);
		setInSSRSetupState = registerGlobalSetter(`__VUE_SSR_SETTERS__`, (v) => isInSSRComponentSetup = v);
	}
	var setCurrentInstance = (instance) => {
		const prev = currentInstance;
		internalSetCurrentInstance(instance);
		instance.scope.on();
		return () => {
			instance.scope.off();
			internalSetCurrentInstance(prev);
		};
	};
	var unsetCurrentInstance = () => {
		currentInstance && currentInstance.scope.off();
		internalSetCurrentInstance(null);
	};
	function isStatefulComponent(instance) {
		return instance.vnode.shapeFlag & 4;
	}
	var isInSSRComponentSetup = false;
	function setupComponent(instance, isSSR = false, optimized = false) {
		isSSR && setInSSRSetupState(isSSR);
		const { props, children } = instance.vnode;
		const isStateful = isStatefulComponent(instance);
		initProps(instance, props, isStateful, isSSR);
		initSlots(instance, children, optimized || isSSR);
		const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
		isSSR && setInSSRSetupState(false);
		return setupResult;
	}
	function setupStatefulComponent(instance, isSSR) {
		const Component = instance.type;
		instance.accessCache = Object.create(null);
		instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
		const { setup } = Component;
		if (setup) {
			pauseTracking();
			const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
			const reset = setCurrentInstance(instance);
			const setupResult = callWithErrorHandling(setup, instance, 0, [instance.props, setupContext]);
			const isAsyncSetup = isPromise(setupResult);
			resetTracking();
			reset();
			if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) markAsyncBoundary(instance);
			if (isAsyncSetup) {
				setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
				if (isSSR) return setupResult.then((resolvedResult) => {
					handleSetupResult(instance, resolvedResult, isSSR);
				}).catch((e) => {
					handleError(e, instance, 0);
				});
				else instance.asyncDep = setupResult;
			} else handleSetupResult(instance, setupResult, isSSR);
		} else finishComponentSetup(instance, isSSR);
	}
	function handleSetupResult(instance, setupResult, isSSR) {
		if (isFunction(setupResult)) if (instance.type.__ssrInlineRender) instance.ssrRender = setupResult;
		else instance.render = setupResult;
		else if (isObject(setupResult)) instance.setupState = proxyRefs(setupResult);
		finishComponentSetup(instance, isSSR);
	}
	var compile;
	var installWithProxy;
	function finishComponentSetup(instance, isSSR, skipOptions) {
		const Component = instance.type;
		if (!instance.render) {
			if (!isSSR && compile && !Component.render) {
				const template = Component.template || resolveMergedOptions(instance).template;
				if (template) {
					const { isCustomElement, compilerOptions } = instance.appContext.config;
					const { delimiters, compilerOptions: componentCompilerOptions } = Component;
					Component.render = compile(template, extend(extend({
						isCustomElement,
						delimiters
					}, compilerOptions), componentCompilerOptions));
				}
			}
			instance.render = Component.render || NOOP;
			if (installWithProxy) installWithProxy(instance);
		}
		{
			const reset = setCurrentInstance(instance);
			pauseTracking();
			try {
				applyOptions(instance);
			} finally {
				resetTracking();
				reset();
			}
		}
	}
	var attrsProxyHandlers = { get(target, key) {
		track(target, "get", "");
		return target[key];
	} };
	function createSetupContext(instance) {
		const expose = (exposed) => {
			instance.exposed = exposed || {};
		};
		return {
			attrs: new Proxy(instance.attrs, attrsProxyHandlers),
			slots: instance.slots,
			emit: instance.emit,
			expose
		};
	}
	function getComponentPublicInstance(instance) {
		if (instance.exposed) return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
			get(target, key) {
				if (key in target) return target[key];
				else if (key in publicPropertiesMap) return publicPropertiesMap[key](instance);
			},
			has(target, key) {
				return key in target || key in publicPropertiesMap;
			}
		}));
		else return instance.proxy;
	}
	function getComponentName(Component, includeInferred = true) {
		return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
	}
	function isClassComponent(value) {
		return isFunction(value) && "__vccOpts" in value;
	}
	var computed = (getterOrOptions, debugOptions) => {
		return computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
	};
	var version = "3.5.38";
	var policy = void 0;
	var tt = typeof window !== "undefined" && window.trustedTypes;
	if (tt) try {
		policy = tt.createPolicy("vue", { createHTML: (val) => val });
	} catch (e) {}
	var unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
	var svgNS = "http://www.w3.org/2000/svg";
	var mathmlNS = "http://www.w3.org/1998/Math/MathML";
	var doc = typeof document !== "undefined" ? document : null;
	var templateContainer = doc && doc.createElement("template");
	var nodeOps = {
		insert: (child, parent, anchor) => {
			parent.insertBefore(child, anchor || null);
		},
		remove: (child) => {
			const parent = child.parentNode;
			if (parent) parent.removeChild(child);
		},
		createElement: (tag, namespace, is, props) => {
			const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
			if (tag === "select" && props && props.multiple != null) el.setAttribute("multiple", props.multiple);
			return el;
		},
		createText: (text) => doc.createTextNode(text),
		createComment: (text) => doc.createComment(text),
		setText: (node, text) => {
			node.nodeValue = text;
		},
		setElementText: (el, text) => {
			el.textContent = text;
		},
		parentNode: (node) => node.parentNode,
		nextSibling: (node) => node.nextSibling,
		querySelector: (selector) => doc.querySelector(selector),
		setScopeId(el, id) {
			el.setAttribute(id, "");
		},
		insertStaticContent(content, parent, anchor, namespace, start, end) {
			const before = anchor ? anchor.previousSibling : parent.lastChild;
			if (start && (start === end || start.nextSibling)) while (true) {
				parent.insertBefore(start.cloneNode(true), anchor);
				if (start === end || !(start = start.nextSibling)) break;
			}
			else {
				templateContainer.innerHTML = unsafeToTrustedHTML(namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content);
				const template = templateContainer.content;
				if (namespace === "svg" || namespace === "mathml") {
					const wrapper = template.firstChild;
					while (wrapper.firstChild) template.appendChild(wrapper.firstChild);
					template.removeChild(wrapper);
				}
				parent.insertBefore(template, anchor);
			}
			return [before ? before.nextSibling : parent.firstChild, anchor ? anchor.previousSibling : parent.lastChild];
		}
	};
	var vtcKey = Symbol("_vtc");
	function patchClass(el, value, isSVG) {
		const transitionClasses = el[vtcKey];
		if (transitionClasses) value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
		if (value == null) el.removeAttribute("class");
		else if (isSVG) el.setAttribute("class", value);
		else el.className = value;
	}
	var vShowOriginalDisplay = Symbol("_vod");
	var vShowHidden = Symbol("_vsh");
	var vShow = {
		name: "show",
		beforeMount(el, { value }, { transition }) {
			el[vShowOriginalDisplay] = el.style.display === "none" ? "" : el.style.display;
			if (transition && value) transition.beforeEnter(el);
			else setDisplay(el, value);
		},
		mounted(el, { value }, { transition }) {
			if (transition && value) transition.enter(el);
		},
		updated(el, { value, oldValue }, { transition }) {
			if (!value === !oldValue) return;
			if (transition) if (value) {
				transition.beforeEnter(el);
				setDisplay(el, true);
				transition.enter(el);
			} else transition.leave(el, () => {
				setDisplay(el, false);
			});
			else setDisplay(el, value);
		},
		beforeUnmount(el, { value }) {
			setDisplay(el, value);
		}
	};
	function setDisplay(el, value) {
		el.style.display = value ? el[vShowOriginalDisplay] : "none";
		el[vShowHidden] = !value;
	}
	var CSS_VAR_TEXT = Symbol("");
	var displayRE = /(?:^|;)\s*display\s*:/;
	function patchStyle(el, prev, next) {
		const style = el.style;
		const isCssString = isString(next);
		let hasControlledDisplay = false;
		if (next && !isCssString) {
			if (prev) if (!isString(prev)) {
				for (const key in prev) if (next[key] == null) setStyle(style, key, "");
			} else for (const prevStyle of prev.split(";")) {
				const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
				if (next[key] == null) setStyle(style, key, "");
			}
			for (const key in next) {
				if (key === "display") hasControlledDisplay = true;
				const value = next[key];
				if (value != null) {
					if (!shouldPreserveTextareaResizeStyle(el, key, !isString(prev) && prev ? prev[key] : void 0, value)) setStyle(style, key, value);
				} else setStyle(style, key, "");
			}
		} else if (isCssString) {
			if (prev !== next) {
				const cssVarText = style[CSS_VAR_TEXT];
				if (cssVarText) next += ";" + cssVarText;
				style.cssText = next;
				hasControlledDisplay = displayRE.test(next);
			}
		} else if (prev) el.removeAttribute("style");
		if (vShowOriginalDisplay in el) {
			el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
			if (el[vShowHidden]) style.display = "none";
		}
	}
	var importantRE = /\s*!important$/;
	function setStyle(style, name, val) {
		if (isArray(val)) val.forEach((v) => setStyle(style, name, v));
		else {
			if (val == null) val = "";
			if (name.startsWith("--")) style.setProperty(name, val);
			else {
				const prefixed = autoPrefix(style, name);
				if (importantRE.test(val)) style.setProperty(hyphenate(prefixed), val.replace(importantRE, ""), "important");
				else style[prefixed] = val;
			}
		}
	}
	var prefixes = [
		"Webkit",
		"Moz",
		"ms"
	];
	var prefixCache = {};
	function autoPrefix(style, rawName) {
		const cached = prefixCache[rawName];
		if (cached) return cached;
		let name = camelize(rawName);
		if (name !== "filter" && name in style) return prefixCache[rawName] = name;
		name = capitalize(name);
		for (let i = 0; i < prefixes.length; i++) {
			const prefixed = prefixes[i] + name;
			if (prefixed in style) return prefixCache[rawName] = prefixed;
		}
		return rawName;
	}
	function shouldPreserveTextareaResizeStyle(el, key, prev, next) {
		return el.tagName === "TEXTAREA" && (key === "width" || key === "height") && isString(next) && prev === next;
	}
	var xlinkNS = "http://www.w3.org/1999/xlink";
	function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
		if (isSVG && key.startsWith("xlink:")) if (value == null) el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
		else el.setAttributeNS(xlinkNS, key, value);
		else if (value == null || isBoolean && !includeBooleanAttr(value)) el.removeAttribute(key);
		else el.setAttribute(key, isBoolean ? "" : isSymbol(value) ? String(value) : value);
	}
	function patchDOMProp(el, key, value, parentComponent, attrName) {
		if (key === "innerHTML" || key === "textContent") {
			if (value != null) el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
			return;
		}
		const tag = el.tagName;
		if (key === "value" && tag !== "PROGRESS" && !tag.includes("-")) {
			const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
			const newValue = value == null ? el.type === "checkbox" ? "on" : "" : String(value);
			if (oldValue !== newValue || !("_value" in el)) el.value = newValue;
			if (value == null) el.removeAttribute(key);
			el._value = value;
			return;
		}
		let needRemove = false;
		if (value === "" || value == null) {
			const type = typeof el[key];
			if (type === "boolean") value = includeBooleanAttr(value);
			else if (value == null && type === "string") {
				value = "";
				needRemove = true;
			} else if (type === "number") {
				value = 0;
				needRemove = true;
			}
		}
		try {
			el[key] = value;
		} catch (e) {}
		needRemove && el.removeAttribute(attrName || key);
	}
	function addEventListener(el, event, handler, options) {
		el.addEventListener(event, handler, options);
	}
	function removeEventListener(el, event, handler, options) {
		el.removeEventListener(event, handler, options);
	}
	var veiKey = Symbol("_vei");
	function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
		const invokers = el[veiKey] || (el[veiKey] = {});
		const existingInvoker = invokers[rawName];
		if (nextValue && existingInvoker) existingInvoker.value = nextValue;
		else {
			const [name, options] = parseName(rawName);
			if (nextValue) addEventListener(el, name, invokers[rawName] = createInvoker(nextValue, instance), options);
			else if (existingInvoker) {
				removeEventListener(el, name, existingInvoker, options);
				invokers[rawName] = void 0;
			}
		}
	}
	var optionsModifierRE = /(?:Once|Passive|Capture)$/;
	function parseName(name) {
		let options;
		if (optionsModifierRE.test(name)) {
			options = {};
			let m;
			while (m = name.match(optionsModifierRE)) {
				name = name.slice(0, name.length - m[0].length);
				options[m[0].toLowerCase()] = true;
			}
		}
		return [name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2)), options];
	}
	var cachedNow = 0;
	var p = Promise.resolve();
	var getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
	function createInvoker(initialValue, instance) {
		const invoker = (e) => {
			if (!e._vts) e._vts = Date.now();
			else if (e._vts <= invoker.attached) return;
			const value = invoker.value;
			if (isArray(value)) {
				const originalStop = e.stopImmediatePropagation;
				e.stopImmediatePropagation = () => {
					originalStop.call(e);
					e._stopped = true;
				};
				const handlers = value.slice();
				const args = [e];
				for (let i = 0; i < handlers.length; i++) {
					if (e._stopped) break;
					const handler = handlers[i];
					if (handler) callWithAsyncErrorHandling(handler, instance, 5, args);
				}
			} else callWithAsyncErrorHandling(value, instance, 5, [e]);
		};
		invoker.value = initialValue;
		invoker.attached = getNow();
		return invoker;
	}
	var isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
	var patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
		const isSVG = namespace === "svg";
		if (key === "class") patchClass(el, nextValue, isSVG);
		else if (key === "style") patchStyle(el, prevValue, nextValue);
		else if (isOn(key)) {
			if (!isModelListener(key)) patchEvent(el, key, prevValue, nextValue, parentComponent);
		} else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
			patchDOMProp(el, key, nextValue);
			if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
		} else if (el._isVueCE && (shouldSetAsPropForVueCE(el, key) || el._def.__asyncLoader && (/[A-Z]/.test(key) || !isString(nextValue)))) patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
		else {
			if (key === "true-value") el._trueValue = nextValue;
			else if (key === "false-value") el._falseValue = nextValue;
			patchAttr(el, key, nextValue, isSVG);
		}
	};
	function shouldSetAsProp(el, key, value, isSVG) {
		if (isSVG) {
			if (key === "innerHTML" || key === "textContent") return true;
			if (key in el && isNativeOn(key) && isFunction(value)) return true;
			return false;
		}
		if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") return false;
		if (key === "sandbox" && el.tagName === "IFRAME") return false;
		if (key === "form") return false;
		if (key === "list" && el.tagName === "INPUT") return false;
		if (key === "type" && el.tagName === "TEXTAREA") return false;
		if (key === "width" || key === "height") {
			const tag = el.tagName;
			if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") return false;
		}
		if (isNativeOn(key) && isString(value)) return false;
		return key in el;
	}
	function shouldSetAsPropForVueCE(el, key) {
		const props = el._def.props;
		if (!props) return false;
		const camelKey = camelize(key);
		return Array.isArray(props) ? props.some((prop) => camelize(prop) === camelKey) : Object.keys(props).some((prop) => camelize(prop) === camelKey);
	}
	var rendererOptions = extend({ patchProp }, nodeOps);
	var renderer;
	function ensureRenderer() {
		return renderer || (renderer = createRenderer(rendererOptions));
	}
	var createApp = ((...args) => {
		const app = ensureRenderer().createApp(...args);
		const { mount } = app;
		app.mount = (containerOrSelector) => {
			const container = normalizeContainer(containerOrSelector);
			if (!container) return;
			const component = app._component;
			if (!isFunction(component) && !component.render && !component.template) component.template = container.innerHTML;
			if (container.nodeType === 1) container.textContent = "";
			const proxy = mount(container, false, resolveRootNamespace(container));
			if (container instanceof Element) {
				container.removeAttribute("v-cloak");
				container.setAttribute("data-v-app", "");
			}
			return proxy;
		};
		return app;
	});
	function resolveRootNamespace(container) {
		if (container instanceof SVGElement) return "svg";
		if (typeof MathMLElement === "function" && container instanceof MathMLElement) return "mathml";
	}
	function normalizeContainer(container) {
		if (isString(container)) return document.querySelector(container);
		return container;
	}
	var work_promise = {};
	function getAdditionalPopupClasses() {
		switch (document.location.hostname) {
			case "boards.4chan.org": return "post reply";
			case "discordapp.com": return `${VOICELINK_CLASS}_discord-dark`;
			default: return null;
		}
	}
	function getOS() {
		const userAgent = navigator.userAgent;
		if (userAgent.indexOf("Windows NT 10.0") !== -1) return "Windows 10";
		if (userAgent.indexOf("Windows NT 6.2") !== -1) return "Windows 8";
		if (userAgent.indexOf("Windows NT 6.1") !== -1) return "Windows 7";
		if (userAgent.indexOf("Windows NT 6.0") !== -1) return "Windows Vista";
		if (userAgent.indexOf("Windows NT 5.1") !== -1) return "Windows XP";
		if (userAgent.indexOf("Windows NT 5.0") !== -1) return "Windows 2000";
		if (userAgent.indexOf("Mac") !== -1) return "Mac";
		if (userAgent.indexOf("X11") !== -1) return "UNIX";
		if (userAgent.indexOf("Linux") !== -1) return "Linux";
		return "Other";
	}
	function getVoiceLinkTarget(target) {
		while (target && !target.classList.contains(VOICELINK_CLASS)) target = target.parentElement;
		return target;
	}
	function isInDLSite() {
		return document.location.hostname.endsWith("dlsite.com");
	}
	function getXmlHttpRequest() {
		return typeof GM !== "undefined" && GM !== null ? GM.xmlHttpRequest : GM_xmlhttpRequest;
	}
	function getHttpAsync(url, anonymous = false, cacheAge = 0, customHeaders = {}) {
		let headers = { ...customHeaders };
		headers["Accept"] = "text/xml";
		headers["User-Agent"] = "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:67.0)";
		headers["Cache-Control"] = cacheAge <= 0 ? "no-cache" : "max-age=" + cacheAge;
		return new Promise((resolve, reject) => {
			getXmlHttpRequest()({
				method: "GET",
				url,
				headers,
				onload: resolve,
				onerror: (resp) => {
					reject(resp);
				},
				anonymous
			});
		});
	}
	var DateParser = {
		parseDateStr: function(dateStr, lang) {
			dateStr = dateStr.trim().replace(/ /g, "");
			lang = lang.trim().toLowerCase().replace(/_/g, "-");
			let nums = this.parseNumbers(dateStr);
			if (!nums || nums.length < 3 && lang !== "en-us" || nums.length < 2 && lang === "en-us") return null;
			let parsers = [
				this.parseAsiaDateStr,
				this.parseEnglishDateStr,
				this.parseEuropeanDateStr,
				this.parseSpanishDateStr
			];
			let date = null;
			for (let i = 0; i < parsers.length; i++) {
				date = parsers[i](dateStr, nums, lang);
				if (date) break;
			}
			return date;
		},
		parseNumbers: function(dateStr) {
			let nums = dateStr.match(/\d+/g);
			if (!nums) return null;
			for (let i = 0; i < nums.length; i++) nums[i] = Number(nums[i]);
			return nums;
		},
		parseAsiaDateStr: function(dateStr, nums, lang) {
			if (!dateStr.match(/\d{4}年\d{1,2}月\d{1,2}日/) && !dateStr.match(/\d{4}년\d{1,2}월\d{1,2}일/)) return null;
			return new Date(nums[0], nums[1] - 1, nums[2]);
		},
		parseEnglishDateStr: function(dateStr, nums, lang) {
			if (!dateStr.match(/[a-zA-Z]{3}\/\d{1,2}\/\d{4}/)) return null;
			const monthMap = {
				"Jan": 0,
				"Feb": 1,
				"Mar": 2,
				"Apr": 3,
				"May": 4,
				"Jun": 5,
				"Jul": 6,
				"Aug": 7,
				"Sep": 8,
				"Oct": 9,
				"Nov": 10,
				"Dec": 11
			};
			let monthStr = dateStr.substring(0, dateStr.indexOf("/")).toLowerCase();
			monthStr = monthStr[0].toUpperCase() + monthStr.substring(1);
			return new Date(nums[1], monthMap[monthStr], nums[0]);
		},
		parseSpanishDateStr: function(dateStr, nums, lang) {
			if (lang !== "es-es" || !dateStr.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) return null;
			return new Date(nums[2], nums[0] - 1, nums[1]);
		},
		parseEuropeanDateStr: function(dateStr, nums, lang) {
			if (lang === "es-es" || !dateStr.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) return null;
			return new Date(nums[2], nums[1] - 1, nums[0]);
		},
		getCountDownDateElement: function(date) {
			if (!date) return "";
			const today = new Date();
			today.setHours(0);
			today.setMinutes(0);
			today.setSeconds(0);
			today.setMilliseconds(0);
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
			if (date.getTime() < today.getTime()) return "";
			let days = (date.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24);
			let element = document.createElement("span");
			element.innerText = `(Coming in ${days} day${days > 1 ? "s" : ""})`;
			element.style.setProperty("color", "#ffeb3b", "important");
			element.style.setProperty("font-style", "italic", "important");
			return element;
		}
	};
	var DataCache = class {
		_data;
		_timeAdd;
		_timeUpdate;
		_timeAccess;
		_timeExpire = 0;
		constructor(data, timeExp = 0) {
			this._data = data;
			this._timeAdd = Date.now();
			this._timeUpdate = void 0;
			this._timeAccess = void 0;
			this._timeExpire = timeExp;
		}
		get data() {
			this._timeAccess = Date.now();
			return this._data;
		}
		get timeAdd() {
			return this._timeAdd;
		}
		get timeUpdate() {
			return this._timeUpdate;
		}
		get timeAccess() {
			return this._timeAccess;
		}
		get timeExpire() {
			return this._timeExpire;
		}
		get hasExpired() {
			return this._timeExpire > 0 && this._timeExpire < Date.now();
		}
		set timeExpire(value) {
			if (typeof value !== "number" || value < 0) return;
			this._timeExpire = value;
		}
		update(data, expTime = -1) {
			this._data = data;
			this._timeUpdate = Date.now();
			this.timeExpire = expTime;
		}
	};
	var DataCacheStorage = class DataCacheStorage {
		static #activeStorages = {};
		_name;
		_maxSize;
		_autoSave;
		_dropExpired;
		_dataMap;
		get #head() {
			return this._dataMap["-head"];
		}
		get #tail() {
			return this._dataMap["-tail"];
		}
		get name() {
			return this._name;
		}
		get maxSize() {
			return this._maxSize;
		}
		get autoSave() {
			return this._autoSave;
		}
		get dropExpired() {
			return this._dropExpired;
		}
		set name(value) {
			if (typeof value !== "string") throw new Error("Invalid Storage Name");
			this._name = value;
		}
		set maxSize(value) {
			if (typeof value !== "number" || value <= 0) return;
			this._maxSize = value;
		}
		set autoSave(value) {
			if (typeof value !== "boolean") return;
			this._autoSave = value;
		}
		set dropExpired(value) {
			if (typeof value !== "boolean") return;
			this._dropExpired = value;
		}
		constructor(name, maxSize = 128, dropExpired = false, autoSave = true) {
			this.name = name;
			this._dataMap = {
				"-head": {
					next: "-tail",
					prev: null
				},
				"-tail": {
					next: null,
					prev: "-head"
				}
			};
			this.maxSize = maxSize;
			this.dropExpired = dropExpired;
			this.autoSave = autoSave;
		}
		static fromObject(obj, name) {
			if (!obj._name) return new DataCacheStorage(name);
			let storage = Object.assign(new DataCacheStorage(name), obj);
			for (const keyX in storage._dataMap) {
				let node = storage._dataMap[keyX];
				let cache = node.cache;
				if (cache) {
					cache = Object.assign(new DataCache(null, -1), cache);
					node.cache = cache;
				}
			}
			return storage;
		}
		static open(storageName, maxSize = void 0, dropExpired = void 0, autoSave = void 0, replaceProp = false) {
			if (!(storageName in this.#activeStorages)) this.#activeStorages[storageName] = DataCacheStorage.fromObject(GM_getValue(`cache_${storageName}`, new DataCacheStorage(storageName, maxSize, dropExpired, autoSave)), storageName);
			let storage = this.#activeStorages[storageName];
			if (replaceProp) {
				storage.maxSize = maxSize;
				storage.dropExpired = dropExpired;
				storage.autoSave = autoSave;
			}
			if (storage.dropExpired) storage.dropExpiredCache();
			return this.#activeStorages[storageName];
		}
		static dropStorage(storageName) {
			if (storageName in this.#activeStorages) delete this.#activeStorages[storageName];
			GM_deleteValue(`cache_${storageName}`);
		}
		save() {
			GM_setValue(`cache_${this.name}`, this);
		}
		#disconnectNode(node) {
			if (node.next) this._dataMap[node.next].prev = node.prev;
			if (node.prev) this._dataMap[node.prev].next = node.next;
			node.next = null;
			node.prev = null;
		}
		#moveNodeNextTo(key, node, prevKey) {
			let keyX = "_" + key;
			let prevKeyX = prevKey ? "_" + prevKey : "-head";
			this.#disconnectNode(node);
			node.prev = prevKeyX;
			node.next = this._dataMap[prevKeyX].next;
			this._dataMap[prevKeyX].next = keyX;
			this._dataMap[node.next].prev = keyX;
		}
		#moveNodeBefore(key, node, nextKey) {
			let keyX = "_" + key;
			let nextKeyX = nextKey ? "_" + nextKey : "-tail";
			this.#disconnectNode(node);
			node.next = nextKeyX;
			node.prev = this._dataMap[nextKeyX].prev;
			this._dataMap[nextKeyX].prev = keyX;
			this._dataMap[node.prev].next = keyX;
		}
		#sizeLimitCheck() {
			let overflow = Object.keys(this._dataMap).length - 2 - this.maxSize;
			for (let i = 0; i < overflow; i++) {
				if (this.#head.next === "-tail") break;
				this.drop(this.#head.next);
			}
		}
		#isExpired(key) {
			let keyX = "_" + key;
			if (!(keyX in this._dataMap)) return true;
			let expired = this._dataMap[keyX].cache.hasExpired;
			if (expired && this.dropExpired) this.drop(key);
			return expired;
		}
		commit(key, data, expTime = -1) {
			let keyX = "_" + key;
			let node = this._dataMap[keyX];
			if (node) node.cache.update(data, expTime);
			else {
				node = {
					cache: new DataCache(data, expTime),
					next: null,
					prev: null
				};
				this._dataMap[keyX] = node;
				this.#sizeLimitCheck();
			}
			this.#moveNodeBefore(key, node, null);
			if (this.autoSave) this.save();
		}
		drop(key) {
			let keyX = "_" + key;
			if (!(keyX in this._dataMap)) return;
			this.#disconnectNode(this._dataMap[keyX]);
			delete this._dataMap[keyX];
			if (this.autoSave) this.save();
		}
		dropExpiredCache() {
			for (let keyX in this._dataMap) {
				if (keyX.startsWith("-")) continue;
				if (!this._dataMap[keyX].cache.hasExpired) continue;
				this.drop(keyX.substring(1));
			}
		}
		get(key) {
			let keyX = "_" + key;
			let value;
			if (keyX in this._dataMap && !this.#isExpired(key)) {
				this.#moveNodeBefore(key, this._dataMap[keyX], null);
				value = this._dataMap[keyX].cache.data;
			}
			if (this.autoSave) this.save();
			return value;
		}
		getCache(key, keepExpired) {
			let keyX = "_" + key;
			let value;
			if (keyX in this._dataMap && (keepExpired || !this.#isExpired(key))) {
				this.#moveNodeBefore(key, this._dataMap[keyX], null);
				value = this._dataMap[keyX].cache;
			}
			return value;
		}
	};
	var Csp = { createHTML: (str) => str };
	if (window.isSecureContext === true && window.trustedTypes) Csp = window.trustedTypes.createPolicy(window.trustedTypes.defaultPolicy ? "VoiceLinkTrustedTypes" : "VoiceLinkTrustedTypes", Csp);
	var WorkPromise = {
		checkNotNull: function(obj) {
			if (obj === null || obj === void 0) throw new Error();
			return obj;
		},
		getWorkPromise: function(rjCode) {
			if (work_promise[rjCode]) return work_promise[rjCode];
			work_promise[rjCode] = DLsite.getWorkRequestPromise(rjCode);
			return work_promise[rjCode];
		},
		getFound: async function(rjCode) {
			try {
				const data = await WorkPromise.getWorkPromise(rjCode).api2;
				if (data && data.product_id !== void 0) return true;
				const api = await WorkPromise.getWorkPromise(rjCode).api;
				return api && api.is_sale !== void 0;
			} catch (e) {
				delete work_promise[rjCode];
				return true;
			}
		},
		getTranslationInfo: async function(rjCode) {
			const p = WorkPromise.getWorkPromise(rjCode);
			let data = await p.api2;
			if (data.translation_info) return data.translation_info;
			data = await p.api;
			return data.translation_info ? data.translation_info : {};
		},
		getRJChain: async function(rjCode) {
			const trans = await WorkPromise.getTranslationInfo(rjCode);
			let chain = [rjCode];
			if (trans.is_child) chain.push(trans.parent_workno, trans.original_workno);
			else if (trans.is_parent) chain.push(trans.original_workno);
			return chain;
		},
		getParentRJ: async function(rjCode) {
			try {
				const p = WorkPromise.getWorkPromise(rjCode);
				let trans = await WorkPromise.getTranslationInfo(rjCode);
				if (trans.is_original || trans.is_parent) return rjCode;
				if (trans.parent_workno) return trans.parent_workno;
				return (await p.info).parentWork;
			} catch (e) {
				return null;
			}
		},
		getGirls: async function(rjCode) {
			let data = await WorkPromise.getWorkPromise(rjCode).api2;
			if (data.sex_category && data.sex_category === 2) return true;
			if (data.site_id === "girls") return true;
			data = await WorkPromise.getWorkPromise(rjCode).api;
			WorkPromise.checkNotNull(data.is_girls);
			return data.is_girls;
		},
		getAnnounce: async function(rjCode) {
			return (await WorkPromise.getWorkPromise(rjCode).info).is_announce;
		},
		getSale: async function(rjCode, checkAnnounce = true) {
			let data = await WorkPromise.getWorkPromise(rjCode).api;
			if (!checkAnnounce) return data.is_sale;
			return data.is_sale || await WorkPromise.getAnnounce(rjCode);
		},
		getDLCount: async function(rjCode) {
			let data = await WorkPromise.getWorkPromise(rjCode).api;
			WorkPromise.checkNotNull(data.dl_count);
			return data.dl_count;
		},
		getRateAvg: async function(rjCode) {
			const p = WorkPromise.getWorkPromise(rjCode);
			let data = await p.api;
			if (data.rate_average_2dp) return data.rate_average_2dp;
			data = await p.api2;
			this.checkNotNull(data.rate_count_detail);
			let sum = 0;
			let count = 0;
			for (const key in data.rate_count_detail) {
				let rate = parseInt(key);
				let cot = parseInt(data.rate_count_detail[key]);
				count += cot;
				sum += rate * cot;
			}
			return sum / count;
		},
		getRateCount: async function(rjCode) {
			const p = WorkPromise.getWorkPromise(rjCode);
			let data = await p.api;
			if (data.rate_count) return data.rate_count;
			data = await p.api2;
			this.checkNotNull(data.rate_count_detail);
			let count = 0;
			for (const key in data.rate_count_detail) count += parseInt(data.rate_count_detail[key]);
			return count;
		},
		getWishlistCount: async function(rjCode) {
			let data = await WorkPromise.getWorkPromise(rjCode).api;
			this.checkNotNull(data.wishlist_count);
			return data.wishlist_count;
		},
		getPriceText: async function(rjCode) {
			WorkPromise.getWorkPromise(rjCode);
		},
		getBonus: async function(rjCode) {
			let data = await WorkPromise.getWorkPromise(rjCode).api;
			return !data.is_sale && data.is_free && data.is_oly && data.wishlist_count === 0;
		},
		getHasBonus: async function(rjCode) {
			let data = await WorkPromise.getWorkPromise(rjCode).api;
			return data.bonuses && data.bonuses.length > 0;
		},
		getTranslatable: async function(rjCode) {
			return (await WorkPromise.getTranslationInfo(rjCode)).is_translation_agree === true;
		},
		getTranslated: async function(rjCode) {
			const trans = await WorkPromise.getTranslationInfo(rjCode);
			return trans.is_parent === true || trans.is_child === true;
		},
		getLanguages: async function(rjCode) {
			const p = WorkPromise.getWorkPromise(rjCode);
			let api = await p.api2;
			api = api.options ? api : await p.api;
			const options = api.options?.split("#");
			const result = [];
			for (const key in LANG_MAP) {
				const lang = LANG_MAP[key];
				if (options?.includes(key)) result.push(lang);
			}
			return result;
		},
		getFileFormats: async function(rjCode) {
			const result = [];
			const p = WorkPromise.getWorkPromise(rjCode);
			let api = await p.api2;
			if (api.file_type === "EXE") result.push("EXE");
			else if (api.file_type_string) result.push(api.file_type_string);
			if (api.file_type_special) result.push(api.file_type_special);
			if (!api.options) api = await p.api;
			if (api.options && api.options.includes("WPD")) result.push("PDF");
			if (api.options && api.options.includes("WAP")) result.push("APK");
			return result;
		},
		getAIUsedText: async function(rjCode) {
			const p = WorkPromise.getWorkPromise(rjCode);
			let api = await p.api2;
			api = api.options ? api : await p.api;
			const options = api.options ? api.options : "";
			if (options.includes("AIG")) return localizePopup(localizationMap.tag_aig);
			else if (options.includes("AIP")) return localizePopup(localizationMap.tag_aip);
			return null;
		},
		getDebug: async function(rjCode) {
			return "";
		},
		getWorkCategory: async function(rjCode) {
			switch (await WorkPromise.getWorkType(rjCode)) {
				case 0: return "voice";
				case 1: return "game";
				case 2: return "manga";
				case 5: return "video";
				case 4: return "novel";
				default: return "other";
			}
		},
		getWorkTypeText: async function(rjCode) {
			return [
				localizePopup(localizationMap.work_type_voice),
				localizePopup(localizationMap.work_type_game),
				localizePopup(localizationMap.work_type_comic),
				localizePopup(localizationMap.work_type_illustration),
				localizePopup(localizationMap.work_type_novel),
				localizePopup(localizationMap.work_type_video),
				localizePopup(localizationMap.work_type_music),
				localizePopup(localizationMap.work_type_tool),
				localizePopup(localizationMap.work_type_voice_comic),
				localizePopup(localizationMap.work_type_other)
			][await WorkPromise.getWorkType(rjCode)];
		},
		getWorkType: async function(rjCode) {
			const p = WorkPromise.getWorkPromise(rjCode);
			let workType = (await p.api2).work_type;
			if (!workType) workType = (await p.api).work_type;
			switch (workType) {
				case "SOU": return 0;
				case [
					"ACN",
					"QIZ",
					"ADV",
					"RPG",
					"TBL",
					"DNV",
					"SLN",
					"TYP",
					"STG",
					"PZL",
					"ETC"
				].includes(workType) ? workType : "ERR": return 1;
				case [
					"MNG",
					"SCM",
					"WBT"
				].includes(workType) ? workType : "ERR": return 2;
				case "ICG": return 3;
				case ["NRE", "KSV"].includes(workType) ? workType : "ERR": return 4;
				case "MOV": return 5;
				case "MUS": return 6;
				case [
					"TOL",
					"IMT",
					"AMT"
				].includes(workType) ? workType : "ERR": return 7;
				case "VCM": return 8;
				case "ET3": return 9;
				default: throw new Error("无法获取作品类型/未知作品类型：" + workType);
			}
		},
		getImgLink: async function(rjCode) {
			let link = void 0;
			const p = WorkPromise.getWorkPromise(rjCode);
			try {
				let data = await p.api2;
				if (data.image_main && data.image_main.url) link = "https:" + data.image_main.url;
			} catch (e) {}
			if (link && !link.includes("no_img_main.gif")) return link;
			try {
				const info = await p.info;
				WorkPromise.checkNotNull(info.img);
				return info.img;
			} catch (e) {}
			try {
				const apiData = await WorkPromise.getWorkPromise(rjCode).api;
				if (apiData.work_image) return "https:" + apiData.work_image;
			} catch (e) {}
			throw new Error("无法获取图片链接");
		},
		getWorkTitle: async function(rjCode) {
			return await WorkPromise.getWorkPromise(rjCode).translated_title;
		},
		getAgeRating: async function(rjCode) {
			let p = WorkPromise.getWorkPromise(rjCode);
			let api = await p.api2;
			if (!api.age_category) api = await p.api;
			switch (api.age_category) {
				case 1: return "All";
				case 2: return "R15";
				case 3: return "R18";
			}
			const info = await p.info;
			WorkPromise.checkNotNull(info.rating);
			return info.rating;
		},
		getCircle: async function(rjCode, findOriginal = true) {
			let trans = await WorkPromise.getTranslationInfo(rjCode);
			if (!trans.is_original && findOriginal) rjCode = trans.original_workno ? trans.original_workno : rjCode;
			let work = WorkPromise.getWorkPromise(rjCode);
			let api2 = await work.api2;
			if (api2.maker_name) return api2.maker_name;
			const circleInfo = await work.circle;
			if (circleInfo && circleInfo.name) return circleInfo.name;
			let info = await work.info;
			if (info.circle) return info.circle.trim();
			throw new Error("无法获取社团信息");
		},
		getTranslatorName: async function(rjCode) {
			if (!(await WorkPromise.getTranslationInfo(rjCode)).is_child) throw new Error("非翻译作品RJ号");
			return await WorkPromise.getCircle(rjCode, false);
		},
		getReleaseDate: async function(rjCode) {
			const p = WorkPromise.getWorkPromise(rjCode);
			const info = await p.info;
			if (info && !info.is_announce && info.date) return [info.date.trim(), false];
			if (info && info.is_announce && info.dateAnnounce) return [info.dateAnnounce.trim(), true];
			let api = await p.api2;
			api = api.regist_date ? api : await p.api;
			WorkPromise.checkNotNull(api.regist_date);
			return [api.regist_date, api.is_announce];
		},
		getReleaseCountDownElement: async function(rjCode) {
			const info = await WorkPromise.getWorkPromise(rjCode).info;
			if (info && info.is_announce && info.dateAnnounce) return DateParser.getCountDownDateElement(DateParser.parseDateStr(info.dateAnnounce, info.lang));
			return null;
		},
		getUpdateDate: async function(rjCode) {
			const info = await WorkPromise.getWorkPromise(rjCode).info;
			if (info["update"]) return info["update"].trim();
			throw new Error();
		},
		getScenario: async function(rjCode) {
			const api2 = await WorkPromise.getWorkPromise(rjCode).api2;
			if (api2.creaters && api2.creaters.scenario_by && api2.creaters.scenario_by.length > 0) return api2.creaters.scenario_by.map((v) => v.name);
			const info = await WorkPromise.getWorkPromise(rjCode).info;
			WorkPromise.checkNotNull(info.scenario);
			return info.scenario;
		},
		getIllustrator: async function(rjCode) {
			const api2 = await WorkPromise.getWorkPromise(rjCode).api2;
			if (api2.creaters && api2.creaters.illust_by && api2.creaters.illust_by.length > 0) return api2.creaters.illust_by.map((v) => v.name);
			const info = await WorkPromise.getWorkPromise(rjCode).info;
			WorkPromise.checkNotNull(info.illustration);
			return info.illustration;
		},
		getCV: async function(rjCode) {
			const api2 = await WorkPromise.getWorkPromise(rjCode).api2;
			if (api2.creaters && api2.creaters.voice_by && api2.creaters.voice_by.length > 0) return api2.creaters.voice_by.map((v) => v.name);
			const info = await WorkPromise.getWorkPromise(rjCode).info;
			WorkPromise.checkNotNull(info.cv);
			return info.cv;
		},
		getMusic: async function(rjCode) {
			const api2 = await WorkPromise.getWorkPromise(rjCode).api2;
			if (api2.creaters && api2.creaters.music_by && api2.creaters.music_by.length > 0) return api2.creaters.music_by.map((v) => v.name);
			const info = await WorkPromise.getWorkPromise(rjCode).info;
			WorkPromise.checkNotNull(info.music);
			return info.music;
		},
		getTags: async function(rjCode) {
			const p = WorkPromise.getWorkPromise(rjCode);
			const api2 = await p.api2;
			if (api2.genres && api2.genres.length > 0) return api2.genres.map((genre) => genre.name);
			const info = await p.info;
			WorkPromise.checkNotNull(info.tags);
			return info.tags;
		},
		getFileSizeStr: function(byteCount = 0) {
			const units = [
				"B",
				"KB",
				"MB",
				"GB",
				"TB"
			];
			let unit = "B";
			for (let i = 1; byteCount >= 1024; i++) {
				byteCount /= 1024;
				unit = units[i];
			}
			return `${Math.round(byteCount * 100) / 100}${unit}`;
		},
		getFileSize: async function(rjCode) {
			const trans = await WorkPromise.getTranslationInfo(rjCode);
			if (trans.is_parent) rjCode = trans.original_workno ? trans.original_workno : rjCode;
			const p = WorkPromise.getWorkPromise(rjCode);
			let api2 = await p.api2;
			if (api2.contents_file_size && api2.contents_file_size > 0) return WorkPromise.getFileSizeStr(api2.contents_file_size);
			let info = trans.is_child && trans.original_workno ? await WorkPromise.getWorkPromise(trans.original_workno).info : await p.info;
			if (info.filesize) return info.filesize;
			throw new Error("无法获取文件大小信息");
		},
		mergeLinkage: function(l1, l2) {
			let linkage = {};
			for (const work of Object.values(l1)) {
				if (!work.workno) continue;
				linkage[work.workno] = work;
			}
			for (const work of Object.values(l2)) {
				if (!work.workno) continue;
				linkage[work.workno] = work;
			}
			return linkage;
		},
		cacheLinkage: function(originalWorkno, linkage) {
			function getExpireTime() {
				const now = new Date();
				const nowMs = now.getTime();
				const utc9Ms = nowMs + now.getTimezoneOffset() * 6e4 + 9 * 3600 * 1e3;
				const localeOffset = utc9Ms - nowMs;
				const dayMs = 24 * 3600 * 1e3;
				return utc9Ms - utc9Ms % dayMs + dayMs - localeOffset;
			}
			let linkCache = DataCacheStorage.open("work-linkages", 128, true, true, true);
			let langs = settings._ss_cue_lang.join();
			let data = linkCache.get(originalWorkno);
			if (Array.isArray(data)) data = WorkPromise.mergeLinkage(data, linkage);
			else data = linkage;
			linkCache.commit(`${originalWorkno}|${langs}`, data, getExpireTime());
		},
		getLinkageFromCache: function(originalWorkno) {
			const hashKey = `${originalWorkno}|${settings._ss_cue_lang.join()}`;
			return DataCacheStorage.open("work-linkages", 128, true, true, true).get(hashKey);
		},
		getLinkedWorks: async function(rjCode) {
			try {
				let trans = await WorkPromise.getTranslationInfo(rjCode);
				let api = await (await WorkPromise.getWorkPromise(rjCode)).api2;
				let result = {};
				if (trans.is_original) {
					result[rjCode] = {
						workno: rjCode,
						type: "original",
						lang: "JPN"
					};
					let languageEditions = api.language_editions;
					if (!Array.isArray(languageEditions)) languageEditions = Object.values(languageEditions);
					for (let edition of languageEditions) result[edition.workno] = {
						workno: edition.workno,
						type: "parent",
						lang: edition.lang
					};
				} else if (trans.is_parent) {
					result[trans.original_workno] = {
						workno: trans.original_workno,
						type: "original",
						lang: "JPN"
					};
					result[rjCode] = {
						workno: rjCode,
						type: "parent",
						lang: trans.lang
					};
					for (let workno of trans.child_worknos) result[workno] = {
						workno,
						type: "child",
						lang: trans.lang
					};
				} else if (trans.is_child) {
					result[trans.original_workno] = {
						workno: trans.original_workno,
						type: "original",
						lang: "JPN"
					};
					result[trans.parent_workno] = {
						workno: trans.parent_workno,
						type: "parent",
						lang: trans.lang
					};
					result[rjCode] = {
						workno: rjCode,
						type: "child",
						lang: trans.lang
					};
				}
				return result;
			} catch (e) {
				console.error(e);
				return {};
			}
		},
		getLinkedWorksFull: async function(rjCode, useCache = true, saveCache = true) {
			let trans = await WorkPromise.getTranslationInfo(rjCode);
			if (trans.is_original === void 0 || trans.is_original === null) return {};
			if (!trans.is_original) {
				let result = await WorkPromise.getLinkedWorksFull(trans.original_workno, useCache, saveCache);
				result = WorkPromise.mergeLinkage(result, await WorkPromise.getLinkedWorks(rjCode));
				return result;
			}
			let cache = WorkPromise.getLinkageFromCache(rjCode);
			if (cache) return cache;
			let api = await (await WorkPromise.getWorkPromise(rjCode)).api2;
			let result = {};
			result[rjCode] = {
				workno: rjCode,
				type: "original",
				lang: "JPN"
			};
			let languageEditions = api.language_editions;
			if (!Array.isArray(languageEditions)) languageEditions = Object.values(languageEditions);
			for (let edition of languageEditions) {
				if (!settings._ss_cue_lang.includes(edition.lang)) continue;
				result = WorkPromise.mergeLinkage(result, await WorkPromise.getLinkedWorks(edition.workno));
			}
			if (saveCache) WorkPromise.cacheLinkage(rjCode, result);
			return result;
		},
		cacheSearchResult(rjCode, searchProfileHash, fullSearch, data) {
			const hashKey = `${rjCode}|${searchProfileHash}|${fullSearch}`;
			DataCacheStorage.open("search-results", 128, true, true, true).commit(hashKey, data, Date.now() + 180 * 1e3);
		},
		getSearchResultFromCache(rjCode, searchProfileHash, fullSearch) {
			const hashKey = `${rjCode}|${searchProfileHash}|${fullSearch}`;
			return DataCacheStorage.open("search-results", 128, true, true, true).get(hashKey);
		},
		getKikoeruSearchResult: async function(rjCode, searchProfile, linkages) {
			let url = searchProfile.searchUrlTemplate?.replaceAll("%s", rjCode);
			try {
				let resp = await getHttpAsync(url, false, 180, searchProfile.customHeaders);
				if (!(resp.readyState === 4 && resp.status === 200)) return;
				let data = JSON.parse(resp.responseText);
				if (!Array.isArray(data.works)) throw new Error("Invalid Response.");
				else if (data.works.length <= 0) return [];
				let result = [];
				for (const work of data.works) {
					let link = linkages[work.id > 999999 ? `RJ0${work.id}` : `RJ${work.id}`];
					if (!link) continue;
					result.push(new SearchWorkInfo(link.workno, link.type, link.lang));
				}
				return result;
			} catch (e) {
				console.error(e);
				return null;
			}
		}
	};
	var DLsite = {
		parseWorkDOM: function(dom, rj) {
			const workInfo = {};
			workInfo.rj = rj;
			let metaList = dom.getElementsByTagName("meta");
			for (let i = 0; i < metaList.length; i++) {
				let meta = metaList[i];
				if (meta.getAttribute("property") === "og:image") {
					workInfo.img = meta.content;
					break;
				}
			}
			workInfo.lang = dom.querySelector("html").getAttribute("lang");
			workInfo.title = dom.getElementById("work_name").innerText;
			workInfo.circle = dom.querySelector("span.maker_name").innerText;
			workInfo.circleId = dom.querySelector("#work_maker a").href;
			workInfo.circleId = workInfo.circleId.substring(workInfo.circleId.lastIndexOf("/") + 1, workInfo.circleId.lastIndexOf(".")).trim();
			const table_outline = dom.querySelector("table#work_outline");
			for (let i = 0, ii = table_outline.rows.length; i < ii; i++) {
				const row = table_outline.rows[i];
				const row_header = row.cells[0].innerText.trim();
				const row_data = row.cells[1];
				const lambda = (text) => row_header === text;
				switch (true) {
					case [
						"販売日",
						"发售日",
						"販賣日",
						"Release date",
						"판매일",
						"Lanzamiento",
						"Veröffentlicht",
						"Date de sortie",
						"Tanggal rilis",
						"Data di rilascio",
						"Lançamento",
						"Utgivningsdatum",
						"วันที่ขาย",
						"Ngày phát hành"
					].some(lambda):
						workInfo.date = row_data.innerText.trim();
						break;
					case [
						"更新情報",
						"更新信息",
						"更新資訊",
						"Update information",
						"갱신 정보",
						"Actualizar información",
						"Aktualisierungen",
						"Mise à jour des informations",
						"Perbarui informasi",
						"Aggiorna informazioni",
						"Atualizar informações",
						"Uppdatera information",
						"ข้อมูลอัปเดต",
						"Thông tin cập nhật"
					].some(lambda):
						workInfo.update = row_data.firstChild.data.trim();
						break;
					case [
						"年齢指定",
						"年龄指定",
						"年齡指定",
						"Age",
						"연령 지정",
						"Edad",
						"Altersfreigabe",
						"Âge",
						"Batas usia",
						"Età",
						"Idade",
						"Ålder",
						"การกำหนดอายุ",
						"Độ tuổi chỉ định"
					].some(lambda):
						workInfo.rating = row_data.innerText.trim();
						break;
					case [
						"ジャンル",
						"分类",
						"分類",
						"Genre",
						"장르",
						"Género",
						"Genre",
						"Genre",
						"Genre",
						"Genere",
						"Gênero",
						"Genre",
						"ประเภท",
						"Thể loại"
					].some(lambda):
						workInfo.tags = [...row_data.querySelectorAll("a")].map((a) => {
							return a.innerText.trim();
						});
						break;
					case [
						"シナリオ",
						"Scenario",
						"剧情",
						"劇本",
						"시나리오",
						"Guión",
						"Szenario",
						"Scénario",
						"Skenario",
						"Scenario",
						"Cenário",
						"Scenario",
						"บทละคร",
						"Kịch bản"
					].some(lambda):
						workInfo.scenario = row_data.innerText.trim();
						break;
					case [
						"イラスト",
						"Illustration",
						"插画",
						"插畫",
						"일러스트",
						"Ilustración",
						"AbbilDung",
						"Illustration",
						"Ilustrasi",
						"Illustrazione",
						"Ilustração",
						"Illustration",
						"ภาพประกอบ",
						"Tranh minh họa"
					].some(lambda):
						workInfo.illustration = row_data.innerText.trim();
						break;
					case [
						"声優",
						"声优",
						"聲優",
						"Voice Actor",
						"성우",
						"Doblador",
						"Synchronsprecher",
						"Doubleur",
						"Pengisi suara",
						"Doppiatore/Doppiatrice",
						"Ator de voz",
						"Röstskådespelare",
						"นักพากย์",
						"Diễn viên lồng tiếng"
					].some(lambda):
						workInfo.cv = row_data.innerText.trim();
						break;
					case [
						"音楽",
						"Music",
						"音乐",
						"音樂",
						"음악",
						"Música",
						"Musik",
						"Musique",
						"Musik",
						"Musica.",
						"Música",
						"musik",
						"ดนตรี",
						"Âm nhạc"
					].some(lambda):
						workInfo.music = row_data.innerText.trim();
						break;
					case [
						"ファイル容量",
						"文件容量",
						"檔案容量",
						"File size",
						"파일 용량",
						"Tamaño del Archivo",
						"Dateigröße",
						"Taille du fichier",
						"Ukuran file",
						"Dimensione del file",
						"Tamanho do arquivo",
						"Filstorlek",
						"ขนาดไฟล์",
						"Dung lượng tệp"
					].some(lambda):
						workInfo.filesize = row_data.innerText.trim();
						break;
					default: break;
				}
			}
			const work_date_ana = dom.querySelector("strong.work_date_ana");
			if (work_date_ana) workInfo.dateAnnounce = work_date_ana.innerText;
			return workInfo;
		},
		getLangCode: function(lang) {
			if (!lang) return "ja-JP";
			switch (lang.toUpperCase()) {
				case "JPN": return "ja-JP";
				case "ENG": return "en-US";
				case "KO_KR": return "ko-KR";
				case "CHI_HANS": return "zh-CN";
				case "CHI_HANT": return "zh-TW";
				default: return "ja-JP";
			}
		},
		parseApiData: function(rjCode, data) {
			if (!data) data = {};
			let apiData = data;
			apiData.is_bonus = !data.is_sale && data.is_free && data.is_oly && data.wishlist_count === false;
			apiData.is_girls = data.options && data.options.indexOf("OTM") >= 0 || data.site_id === "girls";
			if (data.regist_date) {
				let reg_date = data.regist_date.replace(/-/g, "/");
				let releaseDate = new Date(reg_date);
				apiData.regist_timestamp = releaseDate.getTime();
				apiData.regist_date = `${releaseDate.getFullYear()} / ${releaseDate.getMonth() + 1} / ${releaseDate.getDate()}`;
				if (apiData.regist_timestamp > Date.now()) apiData.is_announce = true;
			}
			return apiData;
		},
		parseApi2Data: function(rjCode, data) {
			const translation_info = data.translation_info ? data.translation_info : {};
			data.lang = DLsite.getLangCode(translation_info.lang);
			if (data.regist_date) {
				let reg_date = data.regist_date.replace(/-/g, "/");
				let releaseDate = new Date(reg_date);
				data.regist_timestamp = releaseDate.getTime();
				data.regist_date = `${releaseDate.getFullYear()} / ${releaseDate.getMonth() + 1} / ${releaseDate.getDate()}`;
				if (data.regist_timestamp > Date.now()) data.is_announce = true;
			}
			return data;
		},
		getAnnouncePromise: async function(rjCode, parentRJ) {
			let resp = await getHttpAsync(`https://www.dlsite.com/maniax/announce/=/product_id/${rjCode}.html`);
			if (resp.readyState === 4 && resp.status === 200) {
				const dom = new DOMParser().parseFromString(Csp.createHTML(resp.responseText), "text/html");
				const workInfo = DLsite.parseWorkDOM(dom, rjCode);
				workInfo.parentWork = parentRJ === rjCode ? null : parentRJ;
				workInfo.is_announce = true;
				return workInfo;
			} else if (resp.readyState === 4 && resp.status === 404) return {
				parentWork: parentRJ === rjCode ? null : parentRJ,
				is_announce: false
			};
		},
		getHtmlPromise: async function(rjCode) {
			let resp = await getHttpAsync(`https://www.dlsite.com/maniax/work/=/product_id/${rjCode}.html`);
			if (resp.readyState === 4 && resp.status === 200) {
				const dom = new DOMParser().parseFromString(Csp.createHTML(resp.responseText), "text/html");
				const workInfo = DLsite.parseWorkDOM(dom, rjCode);
				workInfo.parentWork = DLsite.getParentWorkRjCode(resp.finalUrl);
				workInfo.parentWork = workInfo.parentWork === rjCode ? null : workInfo.parentWork;
				workInfo.is_announce = false;
				return workInfo;
			} else if (resp.readyState === 4 && resp.status === 404) return await DLsite.getAnnouncePromise(rjCode, DLsite.getParentWorkRjCode(resp.finalUrl));
		},
		getApi2Promise: async function(rjCode, locale = void 0) {
			let resp = await getHttpAsync(`https://www.dlsite.com/maniax/api/=/product.json?workno=${rjCode}` + (locale ? `&locale=${locale}` : ""));
			let data;
			if (resp.readyState === 4 && resp.status === 200) {
				data = JSON.parse(resp.responseText);
				data = data ? data[0] : {};
				data = data ? data : {};
			} else if (resp.readyState === 4 && resp.status === 404) return {};
			else throw new Error(`无法通过API2获取${rjCode}的信息：${resp.status} ${resp.statusText}`);
			return DLsite.parseApi2Data(rjCode, data);
		},
		getApiPromise: async function(rjCode, locale = void 0) {
			let resp = await getHttpAsync(`https://www.dlsite.com/maniax/product/info/ajax?product_id=${rjCode}&cdn_cache_min=1` + (locale ? `&locale=${locale}` : ""));
			let data;
			if (resp.readyState === 4 && resp.status === 200) {
				data = JSON.parse(resp.responseText);
				data = data ? data[rjCode] : {};
				data = data ? data : {};
			} else if (resp.readyState === 4 && resp.status === 404) return {};
			else throw new Error(`无法通过API获取${rjCode}的信息：${resp.status} ${resp.statusText}`);
			const translation_info = data.translation_info ? data.translation_info : {};
			data.lang = DLsite.getLangCode(translation_info.lang);
			return DLsite.parseApiData(rjCode, data);
		},
		getCirclePromise: async function(rjCode, apiPromise) {
			let apiData = await apiPromise;
			if (!apiData.maker_id) return null;
			const maker_id = apiData.maker_id;
			let url;
			let resp;
			let data;
			try {
				url = `https://media.ci-en.jp/dlsite/lookup/${maker_id}.json`;
				resp = await getHttpAsync(url);
				data = void 0;
				if (resp.readyState === 4 && resp.status === 200) {
					data = JSON.parse(resp.responseText);
					data = data ? data[0] : {};
					data = data ? data : {};
					data.maker_id = maker_id;
				}
			} catch (e) {}
			if (!data || !data.name) {
				url = `https://www.dlsite.com/maniax/circle/profile/=/maker_id/${maker_id}.html`;
				resp = await getHttpAsync(url);
				data = data ? data : {};
				if (resp.readyState === 4 && resp.status === 200) {
					let name = new DOMParser().parseFromString(Csp.createHTML(resp.responseText), "text/html").querySelector("strong.prof_maker_name");
					name = name ? name.innerText : null;
					data.name = name;
				}
			}
			return data;
		},
		getTranslatablePromise: async function(rjCode, site = "maniax") {
			rjCode = rjCode.toUpperCase();
			const result = {
				translation_request_english: {
					agree: void 0,
					request: void 0,
					sale: void 0
				},
				translation_request_simplified_chinese: {
					agree: void 0,
					request: void 0,
					sale: void 0
				},
				translation_request_traditional_chinese: {
					agree: void 0,
					request: void 0,
					sale: void 0
				},
				translation_request_korean: {
					agree: void 0,
					request: void 0,
					sale: void 0
				},
				translation_request_spanish: {
					agree: void 0,
					request: void 0,
					sale: void 0
				},
				translation_request_german: {
					agree: void 0,
					request: void 0,
					sale: void 0
				},
				translation_request_french: {
					agree: void 0,
					request: void 0,
					sale: void 0
				},
				translation_request_indonesian: {
					agree: void 0,
					request: void 0,
					sale: void 0
				},
				translation_request_italian: {
					agree: void 0,
					request: void 0,
					sale: void 0
				},
				translation_request_portuguese: {
					agree: void 0,
					request: void 0,
					sale: void 0
				},
				translation_request_swedish: {
					agree: void 0,
					request: void 0,
					sale: void 0
				},
				translation_request_thai: {
					agree: void 0,
					request: void 0,
					sale: void 0
				},
				translation_request_vietnamese: {
					agree: void 0,
					request: void 0,
					sale: void 0
				}
			};
			const data = await DLsite.getTranslatableApiPromise(rjCode, site);
			if (!data.translationStatusForTranslator) return result;
			const map = {
				translation_request_english: "ENG",
				translation_request_simplified_chinese: "CHI_HANS",
				translation_request_traditional_chinese: "CHI_HANT",
				translation_request_korean: "KO_KR",
				translation_request_spanish: "SPA",
				translation_request_german: "GER",
				translation_request_french: "FRE",
				translation_request_indonesian: "IND",
				translation_request_italian: "ITA",
				translation_request_portuguese: "POR",
				translation_request_swedish: "SWE",
				translation_request_thai: "THA",
				translation_request_vietnamese: "VIE"
			};
			for (let key in map) {
				let lang = map[key];
				let status = data.translationStatusForTranslator[lang];
				if (!status) continue;
				result[key].agree = status.available;
				result[key].request = status.count;
				result[key].sale = status.on_sale_count;
			}
			return result;
		},
		getTranslatableApiPromise: async function(rjCode, site = "maniax") {
			rjCode = rjCode.toUpperCase();
			let resp = await getHttpAsync(`https://www.dlsite.com/${site}/api/=/translatableProducts.json?keyword=${rjCode}`, true);
			let data;
			if (resp.readyState === 4 && resp.status === 200) data = JSON.parse(resp.responseText);
			else throw new Error(`无法通过API获取${rjCode}的翻译信息：${resp.status} ${resp.statusText}`);
			if (data.meta && data.meta.code !== 200) throw new Error(`无法通过API查询${rjCode}的翻译信息：${data.meta.code} - ${data.meta.errorType} - ${data.meta.errorMessage}`);
			if (!data.data || !Array.isArray(data.data.products)) throw new Error(`无法通过API查询${rjCode}的翻译信息：未预料到的响应格式。`);
			for (const work of data.data.products) if (work.id === rjCode) return work;
			return {};
		},
		getWorkRequestPromise: function(rjCode) {
			return {
				_info: void 0,
				_api: void 0,
				_api2: void 0,
				_circle: void 0,
				_translatable: void 0,
				_translated_title: void 0,
				get info() {
					return this._info ? this._info : this._info = DLsite.getHtmlPromise(rjCode);
				},
				get api() {
					return this._api ? this._api : this._api = DLsite.getApiPromise(rjCode);
				},
				get api2() {
					return this._api2 ? this._api2 : this._api2 = DLsite.getApi2Promise(rjCode);
				},
				get circle() {
					return this._circle ? this._circle : this._circle = DLsite.getCirclePromise(rjCode, this.api);
				},
				get translatable() {
					async function getter(t) {
						let api = await t.api2;
						if (!api.site_id) api = await t.api;
						return t._translatable ? t._translatable : t._translatable = DLsite.getTranslatablePromise(rjCode, api.site_id ? api.site_id : "maniax");
					}
					return getter(this);
				},
				get translated_title() {
					async function getter(t) {
						if (t._translated_title) return t._translated_title;
						let api = await t.api2;
						if (api.translation_info) {
							if (!api.translation_info.is_original) api = await DLsite.getApi2Promise(rjCode, api.lang);
							t._translated_title = api.work_name;
							return t._translated_title;
						}
						api = await t.api;
						if (!api.translation_info) {
							t._translated_title = null;
							return null;
						}
						if (!api.translation_info.is_original) api = await DLsite.getApiPromise(rjCode, api.lang);
						t._translated_title = api.work_name;
						return t._translated_title;
					}
					return getter(this);
				}
			};
		},
		getParentWorkRjCode: function(redirectUrl) {
			const reg = new RegExp("(?<=product_id/)((R[JE][0-9]{8})|(R[JE][0-9]{6})|([VB]J[0-9]{8})|([VB]J[0-9]{6}))");
			return redirectUrl.match(reg)[0];
		}
	};
	var _hoisted_1 = {
		class: "not-found",
		style: {
			"width": "100%",
			"height": "100%"
		}
	};
	var _hoisted_2 = ["src"];
	var _hoisted_3 = ["id"];
	var _hoisted_4 = ["copy-text", "sec-copy-text"];
	var _hoisted_5 = { key: 0 };
	var _hoisted_6 = { key: 0 };
	var _hoisted_7 = { key: 1 };
	var _hoisted_8 = ["id"];
	var _hoisted_9 = ["onClick"];
	var _hoisted_10 = { key: 0 };
	var _hoisted_11 = ["copy-text"];
	var _hoisted_12 = ["copy-text"];
	var _hoisted_13 = { key: 2 };
	var Popup_vue_vue_type_script_setup_true_lang_default = defineComponent({
		__name: "Popup",
		props: { state: {} },
		emits: ["update-popup"],
		setup(__props, { emit: __emit }) {
			const props = __props;
			const popupRef = ref(null);
			const popupHeight = ref(400);
			const popupWidth = ref(400);
			const updateSize = () => {
				if (popupRef.value && popupRef.value.style.display !== "none") {
					const rect = popupRef.value.getBoundingClientRect();
					if (rect.height > 0) popupHeight.value = rect.height;
					if (rect.width > 0) popupWidth.value = rect.width;
				}
			};
			onUpdated(() => {
				updateSize();
			});
			const workFound = ref(true);
			const loading = ref(true);
			const isGirls = ref(false);
			const imgLink = ref("");
			const title = ref("");
			const secTitle = ref("");
			const chain = ref([]);
			const tags = ref([]);
			const infoRows = ref([]);
			const isHovered = ref(false);
			const isImgHovered = ref(false);
			const additionalClasses = getAdditionalPopupClasses() || "";
			const copyHint = localizePopup(localizationMap.hint_copy);
			const titleHint = localizePopup(localizationMap.hint_copy_work_title);
			const currentHint = ref("");
			const defaultHint = computed(() => {
				const pinKey = getOS() === "Mac" ? "Command" : "CTRL";
				return props.state.pinned ? localizePopup(localizationMap.hint_unpin).replace(/{pin_key}/g, pinKey) : localizePopup(localizationMap.hint_pin).replace(/{pin_key}/g, pinKey);
			});
			const computedTop = computed(() => {
				if (props.state.mouseY > window.innerHeight / 2) return Math.max(props.state.mouseY - popupHeight.value - 8, 0);
				else return Math.min(props.state.mouseY + 20, window.innerHeight - popupHeight.value);
			});
			const computedLeft = computed(() => {
				if (popupWidth.value + props.state.mouseX + 10 < window.innerWidth - 10) return props.state.mouseX + 10;
				else return Math.max(window.innerWidth - popupWidth.value - 10, 0);
			});
			const computedFontSize = computed(() => {
				if (popupHeight.value > window.innerHeight) {
					const sizeLevel = [
						15,
						14.5,
						14,
						13.5,
						13,
						12.5,
						12
					];
					let size = sizeLevel[sizeLevel.length - 1];
					for (const s of sizeLevel) if (popupHeight.value / window.innerHeight < 15.4 / s) {
						size = s;
						break;
					}
					return size;
				}
				return 15.4;
			});
			const imgStyle = computed(() => {
				if (!settings._s_sfw_mode) return {};
				if (isImgHovered.value && settings._s_sfw_remove_when_hover) return {
					filter: "inherit",
					transition: "all 0.3s"
				};
				return {
					filter: `blur(${{
						low: "6px",
						medium: "12px",
						high: "24px"
					}[settings._s_sfw_blur_level] || "12px"})`,
					transition: settings._s_sfw_blur_transition ? "all 0.3s" : "none"
				};
			});
			const onMouseEnter = () => {
				isHovered.value = true;
				currentHint.value = defaultHint.value;
			};
			const onMouseLeave = () => {
				isHovered.value = false;
				currentHint.value = "";
			};
			const onCopy = (e) => {
				const target = e.currentTarget;
				const text = e.altKey ? target.getAttribute("sec-copy-text") : target.getAttribute("copy-text");
				if (text && typeof GM_setClipboard !== "undefined") GM_setClipboard(text, "text");
			};
			const updatePopupData = async () => {
				if (!props.state.display || !props.state.rjCode) return;
				const rjCode = props.state.rjCode;
				loading.value = true;
				workFound.value = false;
				title.value = "";
				imgLink.value = "";
				chain.value = [];
				infoRows.value = [];
				tags.value = [];
				try {
					let found = await WorkPromise.getFound(rjCode);
					let parentRJ = rjCode;
					if (!found) {
						parentRJ = await WorkPromise.getParentRJ(rjCode);
						if (parentRJ && parentRJ !== rjCode) found = await WorkPromise.getFound(parentRJ);
					}
					if (!props.state.display || rjCode !== props.state.rjCode) return;
					workFound.value = found;
					if (!found) {
						loading.value = false;
						return;
					}
				} catch (e) {
					console.error(e);
				}
				Promise.allSettled([
					WorkPromise.getWorkTitle(rjCode).then((t) => {
						if (rjCode === props.state.rjCode) title.value = t;
					}),
					WorkPromise.getRJChain(rjCode).then((c) => {
						if (rjCode === props.state.rjCode) chain.value = c;
					}),
					WorkPromise.getImgLink(rjCode).then((link) => {
						if (rjCode === props.state.rjCode && typeof link === "string") imgLink.value = link;
					}),
					WorkPromise.getGirls(rjCode).then((g) => {
						if (rjCode === props.state.rjCode) isGirls.value = !!g;
					})
				]);
				try {
					const category = await WorkPromise.getWorkCategory(rjCode);
					console.log("[RJ2Link Debug] category resolved:", category);
					if (!props.state.display || rjCode !== props.state.rjCode) return;
					{
						const typeText = await WorkPromise.getWorkTypeText(rjCode).catch(() => "");
						if (typeText) tags.value.push({
							text: typeText,
							class: `${VOICELINK_CLASS}_tag-orange`,
							small: false
						});
						const rateAvg = await WorkPromise.getRateAvg(rjCode).catch(() => 0);
						const rateCount = await WorkPromise.getRateCount(rjCode).catch(() => 0);
						if (rateAvg > 0) tags.value.push({
							text: `${rateAvg.toFixed(2)}★ (${rateCount})`,
							class: `${VOICELINK_CLASS}_tag-yellow`,
							small: false
						});
					}
					const order = [
						"dl_count",
						"circle_name",
						"translator_name",
						"release_date",
						"update_date",
						"age_rating",
						"scenario",
						"illustration",
						"voice_actor",
						"music",
						"genre",
						"file_size"
					];
					console.log("[RJ2Link Debug] order for category:", order);
					const rowPromises = order.map(async (id) => {
						try {
							if (id === "circle_name") {
								const val = await WorkPromise.getCircle(rjCode);
								if (val) return {
									id,
									title: localizePopup(localizationMap.circle_name),
									items: [{ text: val }],
									separator: " / "
								};
							} else if (id === "dl_count") {
								const val = await WorkPromise.getDLCount(rjCode);
								if (val) return {
									id,
									title: localizePopup(localizationMap.dl_count),
									items: [{ text: val }],
									separator: ""
								};
							} else if (id === "voice_actor") {
								const vas = await WorkPromise.getCV(rjCode);
								if (vas && vas.length) return {
									id,
									title: localizePopup(localizationMap.voice_actor),
									items: vas.map((v) => ({ text: v })),
									separator: " / "
								};
							} else if (id === "age_rating") {
								const val = await WorkPromise.getAgeRating(rjCode);
								if (val) return {
									id,
									title: localizePopup(localizationMap.age_rating),
									items: [{
										text: val,
										class: val.includes("18") ? `${VOICELINK_CLASS}_age-18` : `${VOICELINK_CLASS}_age-all`
									}],
									separator: ""
								};
							} else if (id === "file_size") {
								const val = await WorkPromise.getFileSize(rjCode);
								if (val) return {
									id,
									title: localizePopup(localizationMap.file_size),
									items: [{ text: val }],
									separator: ""
								};
							} else if (id === "release_date") {
								const val = await WorkPromise.getReleaseDate(rjCode);
								if (val && val[0]) return {
									id,
									title: localizePopup(localizationMap.release_date),
									items: [{ text: val[0] }],
									separator: ""
								};
							} else if (id === "scenario") {
								const val = await WorkPromise.getScenario(rjCode);
								if (val && val.length) return {
									id,
									title: localizePopup(localizationMap.scenario),
									items: val.map((v) => ({ text: v })),
									separator: " / "
								};
							} else if (id === "illustration") {
								const val = await WorkPromise.getIllustrator(rjCode);
								if (val && val.length) return {
									id,
									title: localizePopup(localizationMap.illustration),
									items: val.map((v) => ({ text: v })),
									separator: " / "
								};
							} else if (id === "genre") {
								const val = await WorkPromise.getTags(rjCode);
								if (val && val.length) return {
									id,
									title: localizePopup(localizationMap.genre),
									items: val.map((v) => ({ text: v })),
									separator: " "
								};
							}
						} catch (e) {
							console.warn(`[RJ2Link Debug] Error fetching ${id}:`, e);
						}
						return null;
					});
					const results = await Promise.all(rowPromises);
					console.log("[RJ2Link Debug] row results:", results);
					if (!props.state.display || rjCode !== props.state.rjCode) return;
					const validRows = results.filter(Boolean);
					const sortedRows = [];
					for (const id of order) {
						const matched = validRows.find((r) => r.id === id);
						if (matched) sortedRows.push(matched);
					}
					infoRows.value = sortedRows;
					console.log("[RJ2Link Debug] final infoRows:", sortedRows);
				} catch (e) {
					console.error(e);
				} finally {
					if (rjCode === props.state.rjCode) {
						loading.value = false;
						nextTick(() => updateSize());
					}
				}
			};
			watch(() => props.state.rjCode, () => {
				updatePopupData();
			}, { immediate: true });
			return (_ctx, _cache) => {
				return withDirectives((openBlock(), createElementBlock("div", {
					ref_key: "popupRef",
					ref: popupRef,
					class: normalizeClass([
						`${unref(VOICELINK_CLASS)}_voicepopup`,
						`${unref(VOICELINK_CLASS)}_voicepopup-maniax`,
						unref(additionalClasses),
						isGirls.value ? `${unref(VOICELINK_CLASS)}_voicepopup-girls` : ""
					]),
					style: normalizeStyle({
						display: __props.state.display ? "flex" : "none",
						top: computedTop.value + "px",
						left: computedLeft.value + "px",
						fontSize: computedFontSize.value + "px",
						pointerEvents: __props.state.pinned ? "auto" : "auto"
					}),
					onMouseenter: onMouseEnter,
					onMouseleave: onMouseLeave
				}, [withDirectives(createBaseVNode("div", _hoisted_1, " Work Not Found. ", 512), [[vShow, !workFound.value]]), workFound.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createBaseVNode("div", { class: normalizeClass(`${unref(VOICELINK_CLASS)}_left_panel`) }, [createBaseVNode("div", { class: normalizeClass(`${unref(VOICELINK_CLASS)}_img_container`) }, [imgLink.value ? (openBlock(), createElementBlock("img", {
					key: 0,
					src: imgLink.value,
					style: normalizeStyle(imgStyle.value),
					onMouseenter: _cache[0] || (_cache[0] = ($event) => isImgHovered.value = true),
					onMouseleave: _cache[1] || (_cache[1] = ($event) => isImgHovered.value = false)
				}, null, 44, _hoisted_2)) : createCommentVNode("", true)], 2), createBaseVNode("div", {
					id: `${unref(VOICELINK_CLASS)}_hint`,
					style: { "display": "block" }
				}, toDisplayString(currentHint.value), 9, _hoisted_3)], 2), createBaseVNode("div", {
					class: normalizeClass(`${unref(VOICELINK_CLASS)}_right_panel`),
					style: {
						"padding-bottom": "3px",
						"flex-grow": "1"
					}
				}, [
					createBaseVNode("div", {
						class: normalizeClass([`${unref(VOICELINK_CLASS)}_voice-title`, "info-title"]),
						"copy-text": title.value,
						"sec-copy-text": secTitle.value,
						onClick: onCopy,
						onMouseenter: _cache[2] || (_cache[2] = ($event) => currentHint.value = unref(titleHint)),
						onMouseleave: _cache[3] || (_cache[3] = ($event) => currentHint.value = defaultHint.value)
					}, toDisplayString(title.value || "Loading..."), 43, _hoisted_4),
					createBaseVNode("div", { class: normalizeClass(`${unref(VOICELINK_CLASS)}_rjcode`) }, [
						_cache[8] || (_cache[8] = createTextVNode(" [ ", -1)),
						__props.state.isParent ? (openBlock(), createElementBlock("span", _hoisted_5, " ↑ ")) : createCommentVNode("", true),
						(openBlock(true), createElementBlock(Fragment, null, renderList(chain.value, (rj, index) => {
							return openBlock(), createElementBlock("span", { key: rj }, [createBaseVNode("span", {
								class: normalizeClass(`${unref(VOICELINK_CLASS)}_ignore_class`),
								style: normalizeStyle(index === 0 ? "font-weight: bold; text-decoration: underline;" : "")
							}, toDisplayString(rj), 7), index < chain.value.length - 1 ? (openBlock(), createElementBlock("span", _hoisted_6, " → ")) : createCommentVNode("", true)]);
						}), 128)),
						chain.value.length === 0 ? (openBlock(), createElementBlock("span", _hoisted_7, [createBaseVNode("span", {
							class: normalizeClass(`${unref(VOICELINK_CLASS)}_ignore_class`),
							style: {
								"font-weight": "bold",
								"text-decoration": "underline"
							}
						}, toDisplayString(__props.state.rjCode), 3)])) : createCommentVNode("", true),
						_cache[9] || (_cache[9] = createTextVNode(" ] ", -1))
					], 2),
					createBaseVNode("div", {
						id: `${unref(VOICELINK_CLASS)}_info-container`,
						style: {
							"position": "relative",
							"min-height": "70px"
						}
					}, [
						loading.value ? (openBlock(), createElementBlock("div", {
							key: 0,
							class: normalizeClass(`${unref(VOICELINK_CLASS)}_loader`),
							style: { "display": "flex" }
						}, [
							createBaseVNode("div", { class: normalizeClass(`${unref(VOICELINK_CLASS)}_dot`) }, null, 2),
							createBaseVNode("div", { class: normalizeClass(`${unref(VOICELINK_CLASS)}_dot`) }, null, 2),
							createBaseVNode("div", { class: normalizeClass(`${unref(VOICELINK_CLASS)}_dot`) }, null, 2)
						], 2)) : createCommentVNode("", true),
						tags.value.length > 0 ? (openBlock(), createElementBlock("div", {
							key: 1,
							class: normalizeClass(`${unref(VOICELINK_CLASS)}_tags`)
						}, [(openBlock(true), createElementBlock(Fragment, null, renderList(tags.value, (tag, index) => {
							return openBlock(), createElementBlock("span", {
								key: index,
								class: normalizeClass([
									`${unref(VOICELINK_CLASS)}_tag_tight`,
									tag.class,
									tag.small ? `${unref(VOICELINK_CLASS)}_tag_small` : ""
								]),
								onClick: ($event) => tag.onClick ? tag.onClick() : null,
								style: normalizeStyle(tag.onClick ? "cursor: pointer;" : "")
							}, toDisplayString(tag.text), 15, _hoisted_9);
						}), 128))], 2)) : createCommentVNode("", true),
						(openBlock(true), createElementBlock(Fragment, null, renderList(infoRows.value, (row) => {
							return openBlock(), createElementBlock(Fragment, { key: row.id }, [row.items && row.items.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_10, [
								createBaseVNode("span", {
									class: "info-title",
									"copy-text": row.copyText,
									onClick: onCopy,
									onMouseenter: _cache[4] || (_cache[4] = ($event) => currentHint.value = unref(copyHint)),
									onMouseleave: _cache[5] || (_cache[5] = ($event) => currentHint.value = defaultHint.value)
								}, toDisplayString(row.title), 41, _hoisted_11),
								createBaseVNode("span", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(row.items, (c, index) => {
									return openBlock(), createElementBlock(Fragment, { key: index }, [c.text ? (openBlock(), createElementBlock("a", {
										key: 0,
										class: normalizeClass(c.class),
										"copy-text": c.text,
										onClick: onCopy,
										onMouseenter: _cache[6] || (_cache[6] = ($event) => currentHint.value = unref(copyHint)),
										onMouseleave: _cache[7] || (_cache[7] = ($event) => currentHint.value = defaultHint.value)
									}, toDisplayString(c.text), 43, _hoisted_12)) : (openBlock(), createBlock(resolveDynamicComponent(c), { key: 1 })), Number(index) < row.items.length - 1 ? (openBlock(), createElementBlock("span", _hoisted_13, toDisplayString(row.separator || " "), 1)) : createCommentVNode("", true)], 64);
								}), 128))]),
								row.suffix ? (openBlock(), createBlock(resolveDynamicComponent(row.suffix), { key: 0 })) : createCommentVNode("", true)
							])) : createCommentVNode("", true)], 64);
						}), 128))
					], 8, _hoisted_8)
				], 2)], 64)) : createCommentVNode("", true)], 38)), [[vShow, __props.state.display]]);
			};
		}
	});
	var _plugin_vue_export_helper_default = (sfc, props) => {
		const target = sfc.__vccOpts || sfc;
		for (const [key, val] of props) target[key] = val;
		return target;
	};
	var Popup_default = _plugin_vue_export_helper_default(Popup_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-c7ee841d"]]);
	var popupState = reactive({
		display: false,
		rjCode: "",
		mouseX: 0,
		mouseY: 0,
		found: true,
		loading: false,
		pinned: false
	});
	var popupApp = null;
	var popupMountPoint = null;
	var isPinned = false;
	var pinRJ = null;
	var Popup = {
		makePopup(display = false) {
			if (!popupApp) {
				console.log("[RJ2Link Debug] makePopup initialized.");
				const container = document.createElement("div");
				container.id = `${VOICELINK_CLASS}-vue-container`;
				container.style.position = "absolute";
				container.style.top = "0";
				container.style.left = "0";
				container.style.zIndex = "2147483647";
				container.style.pointerEvents = "none";
				document.body.appendChild(container);
				popupApp = createApp(Popup_default, { state: popupState });
				popupMountPoint = document.createElement("div");
				container.appendChild(popupMountPoint);
				popupApp.mount(popupMountPoint);
				console.log("[RJ2Link Debug] Vue App mounted on", popupMountPoint);
			}
			popupState.display = display !== false;
			console.log("[RJ2Link Debug] popupState.display set to", popupState.display);
		},
		updatePopup(e, rjCode, isParent = false) {
			console.log("[RJ2Link Debug] updatePopup called for RJ:", rjCode);
			popupState.display = true;
			popupState.rjCode = rjCode;
			Popup.move(e);
		},
		isHoldPinKey(e) {
			if (getOS() === "Mac") return e.metaKey;
			return e.ctrlKey;
		},
		isPinKeyDown(e) {
			if (getOS() === "Mac") return e.key === "Meta";
			return e.key === "Control";
		},
		setPinState(rjCode, pin, close = true) {
			if (!pin) {
				isPinned = false;
				popupState.pinned = false;
				pinRJ = null;
				if (close) popupState.display = false;
				document.removeEventListener("keyup", Popup.keyup);
				document.removeEventListener("mousemove", Popup.domMove);
				return;
			}
			isPinned = true;
			popupState.pinned = true;
			pinRJ = rjCode;
			document.addEventListener("keyup", Popup.keyup);
			document.addEventListener("mousemove", Popup.domMove);
		},
		hasPinned() {
			return isPinned;
		},
		domMove(e) {
			if (!Popup.hasPinned() || Popup.isHoldPinKey(e)) return;
			Popup.setPinState(null, false);
		},
		over(e) {
			const target = isInDLSite() ? e.target : getVoiceLinkTarget(e.target);
			if (!target || !target.classList.contains(VOICELINK_CLASS)) return;
			const rjCode = target.getAttribute(RJCODE_ATTRIBUTE);
			if (!rjCode) return;
			console.log("[RJ2Link Debug] Mouse over on RJ Link:", rjCode, "Event coords:", e.clientX, e.clientY);
			popupState.mouseX = e.clientX;
			popupState.mouseY = e.clientY;
			if (Popup.isHoldPinKey(e) && pinRJ) {} else pinRJ = null;
			Popup.makePopup();
			Popup.updatePopup(e, rjCode);
			if (Popup.isHoldPinKey(e)) Popup.setPinState(rjCode, true);
			else Popup.setPinState(rjCode, false, false);
			target.focus();
			target.style.setProperty("outline", "none", "important");
		},
		out(e) {
			if (Popup.isHoldPinKey(e)) return;
			const target = isInDLSite() ? e.target : getVoiceLinkTarget(e.target);
			if (!target || !target.classList.contains(VOICELINK_CLASS)) return;
			const rjCode = target.getAttribute(RJCODE_ATTRIBUTE);
			if (!rjCode) return;
			Popup.setPinState(rjCode, false);
			target.blur();
			target.style.setProperty("outline", "none");
		},
		move(e) {
			const target = isInDLSite() ? e.target : getVoiceLinkTarget(e.target);
			if (!target || !target.classList.contains(VOICELINK_CLASS)) return;
			const rjCode = target.getAttribute(RJCODE_ATTRIBUTE);
			if (!rjCode) return;
			popupState.mouseX = e.clientX;
			popupState.mouseY = e.clientY;
			if (Popup.isHoldPinKey(e) && !pinRJ) Popup.setPinState(rjCode, true);
			if (pinRJ && rjCode !== pinRJ) return;
		},
		keydown(e) {
			const target = isInDLSite() ? e.target : getVoiceLinkTarget(e.target);
			if (!target || !target.classList.contains(VOICELINK_CLASS)) return;
			const rjCode = target.getAttribute(RJCODE_ATTRIBUTE);
			if (!rjCode) return;
			if (popupState.display && Popup.isPinKeyDown(e)) Popup.setPinState(rjCode, true);
		},
		keyup(e) {
			if (popupState.display && Popup.isPinKeyDown(e)) Popup.setPinState(null, false);
		}
	};
	var Parser = {
		walkNodes: function(elem) {
			const rjNodeTreeWalker = document.createTreeWalker(elem, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, { acceptNode: function(node) {
				if (node.nodeName === "SCRIPT" || node.parentElement && node.parentElement.nodeName === "SCRIPT") return NodeFilter.FILTER_REJECT;
				if (node.parentElement?.isContentEditable) return NodeFilter.FILTER_SKIP;
				if (node.nodeName === "A") {
					if (node.href.match(URL_REGEX) && !node.classList.contains(VOICELINK_IGNORED_CLASS)) return NodeFilter.FILTER_ACCEPT;
				}
				if (node.nodeName !== "#text") return NodeFilter.FILTER_SKIP;
				if (node.parentElement?.classList.contains(VOICELINK_IGNORED_CLASS) || node.parentElement?.hasAttribute("rjcode")) return NodeFilter.FILTER_SKIP;
				if (node.parentElement?.classList.contains(VOICELINK_CLASS)) return NodeFilter.FILTER_ACCEPT;
				if (node.nodeValue?.match(RJ_REGEX)) return NodeFilter.FILTER_ACCEPT;
				return NodeFilter.FILTER_SKIP;
			} });
			while (rjNodeTreeWalker.nextNode()) {
				const node = rjNodeTreeWalker.currentNode;
				if (node.parentElement?.nodeName === "TEXTAREA") continue;
				if (node.parentElement?.classList.contains(VOICELINK_CLASS)) Parser.rebindEvents(node.parentElement);
				else if (node.nodeName === "A") Parser.linkifyURL(node);
				else Parser.linkify(node);
			}
		},
		wrapPlaceholder: function(content) {
			let e = document.createElement("span");
			e.classList.add(VOICELINK_CLASS);
			e.innerText = content;
			e.classList.add(VOICELINK_IGNORED_CLASS);
			e.setAttribute(RJCODE_ATTRIBUTE, "");
			return e;
		},
		wrapRJCode: function(rjCode) {
			let e = document.createElement("a");
			e.classList.add(VOICELINK_CLASS);
			e.href = `https://www.dlsite.com/maniax/work/=/product_id/${rjCode.toUpperCase()}.html`;
			e.innerText = rjCode;
			e.target = "_blank";
			e.rel = "noreferrer";
			e.classList.add(VOICELINK_IGNORED_CLASS);
			e.style.setProperty("display", "inline", "important");
			e.setAttribute(RJCODE_ATTRIBUTE, rjCode.toUpperCase());
			e.setAttribute("voicelink-linkified", "true");
			e.addEventListener("mouseover", Popup.over);
			e.addEventListener("mouseout", Popup.out);
			e.addEventListener("mousemove", Popup.move);
			e.addEventListener("keydown", Popup.keydown);
			return e;
		},
		calculateCoverage: function(text) {
			const matches = text.match(RJ_REGEX);
			if (!matches) return 0;
			return matches.reduce((total, current) => total + current.length, 0) / text.length * 100;
		},
		linkifyURL: function(node) {
			const e = node;
			const rjs = e.href.match(RJ_REGEX);
			if (!rjs) return;
			const rj = rjs[rjs.length - 1];
			if (!rj) return;
			e.classList.add(VOICELINK_CLASS);
			e.setAttribute(RJCODE_ATTRIBUTE, rj.toUpperCase());
			e.addEventListener("mouseover", Popup.over);
			e.addEventListener("mouseout", Popup.out);
			e.addEventListener("mousemove", Popup.move);
			e.addEventListener("keydown", Popup.keydown);
		},
		linkify: function(textNode) {
			const nodeOriginalText = textNode.nodeValue || "";
			const matches = [];
			let insert = "before_rj";
			let tagA = textNode.parentElement?.closest("a");
			let tagB = textNode.parentElement?.closest("button");
			let tag = tagA ? tagA : tagB;
			if (!tagA && !tagB || insert.trim() !== "none" && this.calculateCoverage(tag?.innerText || "") < 71) insert = "none";
			let match;
			while (match = RJ_REGEX.exec(nodeOriginalText)) matches.push({
				index: match.index,
				value: match[0]
			});
			if (matches.length === 0) return;
			textNode.nodeValue = nodeOriginalText.substring(0, matches[0].index);
			let prevNode = null;
			for (let i = 0; i < matches.length; ++i) {
				let code = matches[i].value;
				let rjLinkNode = Parser.wrapRJCode(code);
				if (insert.startsWith("before_rj")) {
					rjLinkNode.innerText = "🔗";
					textNode.parentNode?.insertBefore(rjLinkNode, prevNode ? prevNode.nextSibling : textNode.nextSibling);
					prevNode = rjLinkNode;
					rjLinkNode = Parser.wrapPlaceholder(code);
				}
				textNode.parentNode?.insertBefore(rjLinkNode, prevNode ? prevNode.nextSibling : textNode.nextSibling);
				let nextRJ = void 0;
				if (i < matches.length - 1) nextRJ = matches[i + 1].index;
				let substring = nodeOriginalText.substring(matches[i].index + matches[i].value.length, nextRJ);
				if (substring) {
					const subtextNode = document.createTextNode(substring);
					textNode.parentNode?.insertBefore(subtextNode, rjLinkNode.nextElementSibling);
					prevNode = subtextNode;
				} else prevNode = rjLinkNode;
			}
		},
		rebindEvents: function(elem) {
			if (elem.nodeName === "A") {
				elem.addEventListener("mouseover", Popup.over);
				elem.addEventListener("mouseout", Popup.out);
				elem.addEventListener("mousemove", Popup.move);
				elem.addEventListener("keydown", Popup.keydown);
			} else {
				const voicelinks = elem.querySelectorAll("." + VOICELINK_CLASS);
				for (let i = 0, j = voicelinks.length; i < j; i++) {
					const voicelink = voicelinks[i];
					voicelink.addEventListener("mouseover", Popup.over);
					voicelink.addEventListener("mouseout", Popup.out);
					voicelink.addEventListener("mousemove", Popup.move);
					voicelink.addEventListener("keydown", Popup.keydown);
				}
			}
		},
		parseEnglishDateStr: function(dateStr, nums, lang) {
			if (!dateStr.match(/[a-zA-Z]{3}\/\d{1,2}\/\d{4}/)) return null;
			const monthMap = {
				"Jan": 0,
				"Feb": 1,
				"Mar": 2,
				"Apr": 3,
				"May": 4,
				"Jun": 5,
				"Jul": 6,
				"Aug": 7,
				"Sep": 8,
				"Oct": 9,
				"Nov": 10,
				"Dec": 11
			};
			let monthStr = dateStr.substring(0, dateStr.indexOf("/")).toLowerCase();
			monthStr = monthStr[0].toUpperCase() + monthStr.substring(1);
			return new Date(nums[1], monthMap[monthStr], nums[0]);
		},
		parseSpanishDateStr: function(dateStr, nums, lang) {
			if (lang !== "es-es" || !dateStr.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) return null;
			return new Date(nums[2], nums[0] - 1, nums[1]);
		},
		parseEuropeanDateStr: function(dateStr, nums, lang) {
			if (lang === "es-es" || !dateStr.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) return null;
			return new Date(nums[2], nums[1] - 1, nums[0]);
		},
		getCountDownDateElement: function(date) {
			if (!date) return "";
			const today = new Date();
			today.setHours(0);
			today.setMinutes(0);
			today.setSeconds(0);
			today.setMilliseconds(0);
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
			if (date.getTime() < today.getTime()) return "";
			let days = (date.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24);
			let element = document.createElement("span");
			element.innerText = `(Coming in ${days} day${days > 1 ? "s" : ""})`;
			element.style.setProperty("color", "#ffeb3b", "important");
			element.style.setProperty("font-style", "italic", "important");
			return element;
		}
	};
	var isInit = false;
	var observing = false;
	function init() {
		if (document.location.hostname.endsWith("dlsite.com")) {
			console.log("[RJ2Link] Disabled on DLSite to avoid layout conflicts.");
			return;
		}
		if (!isInit) {
			const style = document.createElement("style");
			style.innerHTML = Csp.createHTML(POPUP_CSS);
			document.head.appendChild(style);
			isInit = true;
		}
		setTimeout(() => {
			if (!document.body || observing) return;
			Parser.walkNodes(document.body);
			if (!document.getElementById(`${VOICELINK_CLASS}-vue-container`)) Popup.makePopup(false);
			new MutationObserver(function(m) {
				for (let i = 0; i < m.length; ++i) {
					let addedNodes = m[i].addedNodes;
					for (let j = 0; j < addedNodes.length; ++j) Parser.walkNodes(addedNodes[j]);
				}
			}).observe(document.body, {
				childList: true,
				subtree: true
			});
			observing = true;
		}, 100);
	}
	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
	else init();
})();
