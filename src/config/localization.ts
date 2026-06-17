import { Popup } from '../ui/popup';

    export const localizationMap = {
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
            en_US: '"Copy as filename" button'
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
            en_US: "AI Gen",
        },

        tag_aip: {
            zh_CN: "AI部分使用",
            zh_TW: "AI部分使用",
            en_US: "AI Partial",
        },

        tag_ai_tooltip: {
            zh_CN: "全部或部分使用AI的作品",
            zh_TW: "全部或部分使用AI的作品",
            en_US: "Full or partial use of AI",
        },

        button_save: {
            zh_CN: "保存设置",
            zh_TW: "保存設置",
            en_US: "Save",
        },

        button_cancel: {
            zh_CN: "取消设置",
            zh_TW: "取消設置",
            en_US: "Cancel",
        },

        button_reset: {
            zh_CN: "重置设置",
            zh_TW: "重置設置",
            en_US: "Reset",
        },

        need_reorder: {
            zh_CN: "检测到设置更新，可能添加了新的信息位，请重新设置对应设置项的排列",
            zh_TW: "檢查到設置更新，可能添加了新的信息位，请重新設置對應設置項的排列",
            en_US: "There is a new setting item added. Please reorder the corresponding setting item",
        },

        save_complete: {
            zh_CN: "设置已保存，部分设置需要刷新对应页面以生效",
            zh_TW: "設置已保存，部分設置需要刷新對應頁面以生效",
            en_US: "Settings saved, some settings need to refresh the corresponding page to take effect",
        },

        save_failed: {
            zh_CN: "设置保存失败",
            zh_TW: "設置保存失敗",
            en_US: "Settings save failed",
        },

        reset_confirm: {
            zh_CN: "确定要将设置重置到最初始的状态吗？（重置后，需要再点击保存才会生效）",
            zh_TW: "確定要將設置重置到最初始的狀態嗎？（重置後，需要再點擊保存才會生效）",
            en_US: "Are you sure you want to reset the settings to the initial state? (After resetting, you need to click Save to take effect)",
        },

        reset_complete: {
            zh_CN: "设置已重置",
            zh_TW: "設置已重置",
            en_US: "Settings reset",
        },

        reset_failed: {
            zh_CN: "设置重置失败",
            zh_TW: "設置重置失敗",
            en_US: "Settings reset failed",
        },

        reset_order: {
            zh_CN: "重置顺序",
            zh_TW: "重置順序",
            en_US: "Reset Order",
        },

        reset_order_confirm: {
            zh_CN: "确定要将元素顺序重置到最初始的状态吗？",
            zh_TW: "確定要將元素順序重置到最初始的狀態嗎？",
            en_US: "Are you sure you want to reset the element order to the initial state?",
        },

        reset_order_and_setting: {
            zh_CN: "重置元素顺序和各自的设置值",
            zh_TW: "重置元素順序和各自的設置值",
            en_US: "Reset element order and their settings",
        },

        hint_pin: {
            zh_CN: "按住{pin_key}以固定弹框，固定时可复制信息",
            zh_TW: "按住{pin_key}以固定彈窗，固定時可複製資訊",
            en_US: "Hold {pin_key} to pin the popup, info can be copied.",
        },

        hint_unpin: {
            zh_CN: "抬起{pin_key}以关闭弹框 & 查看其它作品RJ信息",
            zh_TW: "抬起{pin_key}以關閉彈窗 & 查看其它作品RJ信息",
            en_US: "Release {pin_key} to close the popup & view other works.",
        },

        hint_copy: {
            zh_CN: "左键单击以复制信息",
            zh_TW: "左鍵單擊以複製資訊",
            en_US: "Left click to copy info.",
        },

        hint_copy_all: {
            zh_CN: "左键单击以复制内部所有信息",
            zh_TW: "左鍵單擊以複製內部所有資訊",
            en_US: "Left click to copy all contained info.",
        },

        hint_copy_work_title: {
            zh_CN: "单击复制标题，Alt+单击复制为有效文件名",
            zh_TW: "單擊複製標題，Alt+單擊複製為有效檔名",
            en_US: "Click to copy title, Alt+click to copy as valid filename.",
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


        get: function (key: any) {
            let lang = navigator.language.toLowerCase();
            let langKey = "en_US";
            if (lang.includes("zh")) {
                if (lang.includes("cn") || lang.includes("sg") || lang === "zh") {
                    langKey = "zh_CN";
                } else {
                    langKey = "zh_TW";
                }
            }
            return typeof key === "string" ? (localizationMap as any)[key]?.[langKey] : key[langKey];
        }
    }

    export function localize(key: any) {
        return localizationMap.get(key);
    }

    export function localizePopup(key: any) {
        return localizationMap.get(key);
    }