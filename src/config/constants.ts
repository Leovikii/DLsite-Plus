import { toString } from '../../function toString() { [native code] }';
import { localizePopup, localizationMap } from './localization';

    export const RJ_REGEX = new RegExp("(R[JE][0-9]{8})|(R[JE][0-9]{6})|([VB]J[0-9]{8})|([VB]J[0-9]{6})", "gi");
    export const URL_REGEX = new RegExp("dlsite.com/.*/product_id/((R[JE][0-9]{8})|(R[JE][0-9]{6})|([VB]J[0-9]{8})|([VB]J[0-9]{6}))", "g");
    export const VOICELINK_CLASS = 'voicelink-' + Math.random().toString(36).slice(2);
    export const VOICELINK_IGNORED_CLASS = `${VOICELINK_CLASS}_ignored`;
    export const RJCODE_ATTRIBUTE = 'rjcode';
    export const LANG_MAP = {
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
        POL: localizePopup(localizationMap.language_polish),
    };
    export const LANG_MAP_ABBR = {
        JPN: localizePopup(localizationMap.language_japanese_abbr),
        ENG: localizePopup(localizationMap.language_english_abbr),
        CHI_HANS: localizePopup(localizationMap.language_simplified_chinese_abbr),
        CHI_HANT: localizePopup(localizationMap.language_traditional_chinese_abbr),
        KO_KR: localizePopup(localizationMap.language_korean_abbr),
        SPA: localizePopup(localizationMap.language_spanish_abbr),
        FRE: localizePopup(localizationMap.language_french_abbr),
        THA: localizePopup(localizationMap.language_thai_abbr),
        GER: localizePopup(localizationMap.language_german_abbr),
        POR: localizePopup(localizationMap.language_portuguese_abbr),
        VIE: localizePopup(localizationMap.language_vietnamese_abbr),
        ITA: localizePopup(localizationMap.language_italian_abbr),
    };
    export const POPUP_CSS = `
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
    
  `
    export const SETTINGS_CSS = `
        #${VOICELINK_CLASS}_settings-container {
            font-family: Arial, sans-serif !important;
            background-color: #f4f4f9 !important;
            margin: auto !important;
            padding: 20px 30px !important;
            line-height: unset !important;
            
            position: fixed !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            top: 20px !important;
            bottom: 20px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            box-sizing: border-box !important;
            max-width: 800px !important;
            width: 100% !important;
            height: calc(100% - 40px) !important;
            z-index: 2147483647 !important;
            border-radius: 20px !important;
            box-shadow: darkgray 0px 0px 17px 2px !important;
            
            /*scrollbar-width: none;*/
            /*-ms-overflow-style: none;*/
        }
        #${VOICELINK_CLASS}_settings-container::-webkit-scrollbar {
            width: 5px !important;
            height: 5px !important;
        }
        #${VOICELINK_CLASS}_settings-container::-webkit-scrollbar-track {
            background-color: #f4f4f9 !important;
            border-radius: 5px !important;
        }
        #${VOICELINK_CLASS}_settings-container::-webkit-scrollbar-thumb {
            background-color: #888 !important;
            border-radius: 5px !important; 
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_container {
            max-width: 800px !important;
            margin: auto !important;
            background: #fff !important;
            padding: 20px !important;
            border-radius: 10px !important;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1) !important;
        }
        #${VOICELINK_CLASS}_settings-container h1 {
            display: block !important;
            text-align: center !important;
            color: #333 !important;
            font-size: 32px !important;
            margin: 21.44px 0 !important;
            font-weight: bold !important;
            line-height: normal !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_section-container {
            margin: 20px 0 !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_section-container h2 {
            display: block !important;
            color: #007bff !important;
            font-size: 24px !important;
            margin: 22px 0 14px 0 !important;
            font-weight: bold !important;
            line-height: normal !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_setting {
            /*display: flex;*/
            /*align-items: center;*/
            /*justify-content: space-between;*/
            margin: 10px 0 !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_setting .${VOICELINK_CLASS}_row-title {
            margin: 0 0 0 10px !important;
            color: #555 !important;
            font-size: 18px !important;
            font-weight: normal !important;
            /*flex-grow: 1;*/
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_setting input[type="text"],
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_setting input[type="password"],
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_setting input[type="number"],
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_setting input[type="email"],
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_setting select {
            width: 100% !important;
            padding: 10px !important;
            border: 1px solid #ddd !important;
            border-radius: 5px !important;
            background: #fafafa !important;
            box-sizing: border-box !important;
            color: #666666FF !important;
            font-size: 13.3333px !important;
            height: unset !important;
            max-height: unset !important;
            max-width: unset !important;
            /*margin-bottom: 10px;*/
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_setting input[type="checkbox"] {
            display: none !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_toggle-container {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: flex-end !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_setting .${VOICELINK_CLASS}_toggle {
            display: inline-block !important;
            margin: 0 !important;
            width: 60px !important;
            height: 30px !important;
            padding: 0 !important;
            background: #ccc !important;
            border-radius: 15px !important;
            position: relative !important;
            cursor: pointer !important;
            transition: background 0.3s !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_toggle:before {
            content: "" !important;
            display: block !important;
            width: 24px !important;
            height: 24px !important;
            background: #fff !important;
            border-radius: 50% !important;
            position: absolute !important;
            top: 3px !important;
            left: 3px !important;
            transition: transform 0.3s !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_setting input[type="checkbox"]:checked + label {
            background: #007bff !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_setting input[type="checkbox"]:checked + label:before {
            transform: translateX(30px) !important;
        }
        #${VOICELINK_CLASS}_button-close{
            position: absolute !important;
            top: 20px !important;
            right: 20px !important;
            font-size: 24px !important;
            cursor: pointer !important;
            background: rgba(0, 0, 0, 0.05) !important;
            border: none !important;
            width: 42px !important;
            height: 42px !important;
            border-radius: 50% !important;
        }
        #${VOICELINK_CLASS}_button-save,
        #${VOICELINK_CLASS}_button-cancel,
        #${VOICELINK_CLASS}_button-reset{
            display: block !important;
            width: 100% !important;
            padding: 10px !important;
            border: none !important;
            border-radius: 5px !important;
            background: #007bff !important;
            color: #fff !important;
            font-size: 16px !important;
            cursor: pointer !important;
            margin-top: 10px !important;

            transition: background 0.3s, filter 0.3s !important;
        }
        #${VOICELINK_CLASS}_button-reset{
            background: #999 !important;
        }
        #${VOICELINK_CLASS}_button-save:hover,
        #${VOICELINK_CLASS}_button-cancel:hover,
        #${VOICELINK_CLASS}_button-reset:hover{
            filter: brightness(1.3) !important;
        }
        #${VOICELINK_CLASS}_button-save:active,
        #${VOICELINK_CLASS}_button-cancel:active,
        #${VOICELINK_CLASS}_button-reset:active{
            filter: brightness(0.9) !important;
        }

        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_tooltip {
            position: relative !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_tooltip .${VOICELINK_CLASS}_tooltip-text {
            visibility: hidden !important;
            min-width: 200px !important;
            max-width: 100% !important;
            background-color: #555 !important;
            color: #fff !important;
            font-size: 14px !important;
            text-align: center !important;
            border-radius: 5px !important;
            padding: 8px 10px !important;
            position: absolute !important;
            z-index: 1 !important;
            bottom: 125% !important;
            left: 0 !important;
            /*margin-left: -100px;*/
            opacity: 0 !important;
            filter: brightness(1.0) !important;
            transition: opacity 0.3s !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_tooltip:hover .${VOICELINK_CLASS}_tooltip-text {
            visibility: visible !important;
            opacity: 1 !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_sortable {
            cursor: move !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_sortable span{
            cursor: default !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_dragging{
            background-color: #1e82ff38 !important;
            user-select: none !important;
            transition: background-color 0.3s !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_sortable .${VOICELINK_CLASS}_setting {
            cursor: move !important;
        }
        #${VOICELINK_CLASS}_settings-container table {
            width: 100% !important;
            margin-bottom: 20px !important;
            border-collapse: collapse !important;
            font-size: unset !important;
        }
        #${VOICELINK_CLASS}_settings-container table,
        #${VOICELINK_CLASS}_settings-container th,
        #${VOICELINK_CLASS}_settings-container td {
            border: 0 solid #ddd !important;
        }
        #${VOICELINK_CLASS}_settings-container th,
        #${VOICELINK_CLASS}_settings-container td {
            border-bottom: 1px dashed rgba(221, 221, 221, 0.64) !important;
            /*border-top: 1px solid #ddd;*/
            padding: 8px 10px !important;
            text-align: left !important;
            vertical-align: middle !important;
        }

        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_hidden{
            display: none !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_input-cell{
            text-align: right !important;
            padding-right: 20px !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_indent-1 > td {
            padding: 8px 24px !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_indent-1 .${VOICELINK_CLASS}_input-cell {
            padding: 8px 20px !important;
        }

        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_tags {
            font-size: 14px;
        }
        .${VOICELINK_CLASS}_tags {
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: left !important;
            align-items: stretch !important;
        }
        .${VOICELINK_CLASS}_tags > label,
        .${VOICELINK_CLASS}_tags > span {
            border-radius: 5px !important;
            font-size: 1em !important;
            margin-right: 8px !important;
            margin-bottom: 8px !important;
            padding: 5px 8px !important;
            
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;

            transition: color 0.3s, background-color 0.3s !important;
        }
        .${VOICELINK_CLASS}_tags > label.${VOICELINK_CLASS}_tag_tight,
        .${VOICELINK_CLASS}_tags > span.${VOICELINK_CLASS}_tag_tight{
            padding: 2px 7px !important;
        }
        .${VOICELINK_CLASS}_tags > label.${VOICELINK_CLASS}_tag_small,
        .${VOICELINK_CLASS}_tags > span.${VOICELINK_CLASS}_tag_small{
            padding: 2px 7px !important;
            font-size: 0.857143em !important;
        }

        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_tag-off{
            background-color: #ffffff !important;
            color: #aaaaaa !important;
        }

        .${VOICELINK_CLASS}_tag-purple{
            background-color: #EED9F2 !important;
            color: #7B1FA2 !important;
        }

        .${VOICELINK_CLASS}_tag-blue{
            background-color: #d9eefc !important;
            color: #4285F4 !important;
        }

        .${VOICELINK_CLASS}_tag-red{
            background-color: #ffd6da !important;
            color: #EA4335 !important;
        }

        .${VOICELINK_CLASS}_tag-yellow{
            background-color: #FFF8E1 !important;
            color: #F57F17 !important;
        }

        .${VOICELINK_CLASS}_tag-green{
            background-color: #dcf5e4 !important;
            color: #34A853 !important;
        }

        .${VOICELINK_CLASS}_tag-teal{
            background-color: #d8eced !important;
            color: #0097A7 !important;
        }

        .${VOICELINK_CLASS}_tag-gray{
            background-color: #E0E0E0 !important;
            color: #424242 !important;
        }

        .${VOICELINK_CLASS}_tag-pink{
            background-color: #ffd9e7 !important;
            color: #f032a7 !important;
        }

        .${VOICELINK_CLASS}_tag-orange{
            background-color: #ffebcc !important;
            color: #f04000 !important;
        }

        .${VOICELINK_CLASS}_tag-darkblue{
            background-color: #d2e7fa !important;
            color: #0D47A1 !important;
        }

        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_reset-btn-small {
            position: relative !important;
            display: inline-block !important;
            width: 16px !important;
            height: 16px !important;
            margin-right: 4px !important;
            padding: 0 !important;
            color: transparent !important;
            background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAA6xJREFUeF7tmlFy2jAQhn+ZHIScJOEixYQ++BYJt/BDSU0vUnKSuvcoVkeq3RpXsndlScYAMzwwyLL20+rXarUCN/4RN24/7gDuHnDjBO5LYEoHSF+ytHjPiynHMJkHrLfZVwApgOKwzzdTQZgEQMv4xu7JIEQHYDB+UghRAfQYDyGwKr7kx9hLIRqASzRewY4C4FKNjwKgz3gAZesLIfGhBhVzawzqAQPG9y13DUZIHFDhWBS5+h3kEwxA+jl7lhLfPYxaGX8UJ+xCgAgHIM2WVYK1EHjzAEF1UUqJ4tt7vvPUn+4mGADVeeofggYhTlj58oagAAgQSiGwwS+UeMASFZZS4KkOkXs1wpc3BAdAgmCYUeU9coHXPhhS4m3skogCwBVC85xcQB2cnk0uMRZCNAAECMfDPl+ZjBzQEr2MXMPoqAB6IJSHff44pO6fXrJXy67iLIzRARggkIxv4KgkihR6SXQ/rH6ahycB0IbgImI2TxASG24YPRmAIXcf+t8Cge0FswVQb5Mq1F62YXG9YLYA9DIy6wHLC+YN4E+w9F+MwMkuzRqA8gKTFnCCo9kDqLXgR0c0rUFVV1xnD0AZtN5mSgzPQuXDPifZRmo0tCVN/b8JgDjhkXJkvhYAzS3T37mgCuFVADAJoVcASmiQdI6jgZOVnGVligeoARHJA0wJTs5WwzHGpa3RA4jngqsAYEq/exXBsXuty6xyngkOoN5rZWdQrJibYxC37XqbqUDo7FDkPQ4w7rUT3eh2Aa23WXdy4B3A2JibO6vU9pYTIbnggiSCTQZHLuAcc1MN4rYbEwWqd5EB2GJuasDBNYzS3pYfpLo/G4CPBATFMGobk/hx4xOWB1i2Q3BfSjWwr50tMcqZfbYHaC2wpKGExI6bkXUFYbt6p4a/7feyPKAlhqarqlE3NFQYNi9Ut8aUy5Xue9gANAR78YPzDQ0FQF/RhasYOwFQg+27pvJ1dd2G0ms88eBjguwMYACCFsakwoGSlembfUKRBTn/5x0AYXDOZS2EvpU9o4x32gW6FIkD/Vf1laC0XWW3+lIJTmM9QPN+X1vvqCXQhtGjCTYPb5e+nZ3khgTRVfC8LwGTNwyVtQwZN/C/KpfbjNWVUXEAxYB6r7aWtVD66LQJFmN4WwImo+qokVL1ZXpcC2gC/AwZYQYF0Fils8oPWFYVnoTQmZv2t9ECLZRSokwSfLjW/HC9KwoA7qBitr8DiEn7Et9194BLnJWYY7p5D/gNXP0HX03p5E0AAAAASUVORK5CYII=") !important;
            background-position: center !important;
            background-size: contain !important;
            background-color: transparent !important;
            border-radius: 3px !important;
            border: none !important;
            opacity: 0.5 !important;
        }
        #${VOICELINK_CLASS}_settings-container button.${VOICELINK_CLASS}_reset-btn-small:hover {
            opacity: 1 !important;
        }

        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_button-flat {
            background-color: transparent !important;
            border: none !important;
            color: #aaa !important;
            cursor: pointer !important;
            border-radius: 5px !important;
            padding: 5px 5px !important;
            margin-bottom: 6px !important;
            margin-right: 6px !important;

            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;

            transition: background-color 0.3s !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_button-flat:hover {
            background-color: rgba(0, 0, 0, 0.1) !important;
        }
        #${VOICELINK_CLASS}_settings-container .${VOICELINK_CLASS}_button-flat span{
            display: inline-block !important;
        }
    `