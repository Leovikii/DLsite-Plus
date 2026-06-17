import { createApp, reactive, App } from 'vue';
import PopupComponent from './Popup.vue';
import { VOICELINK_CLASS, RJCODE_ATTRIBUTE } from '../config/constants';
import { getVoiceLinkTarget, isInDLSite, getOS } from '../utils/common';
import type { PopupState } from '../types';

export const popupState = reactive<PopupState>({
    display: false,
    rjCode: '',
    mouseX: 0,
    mouseY: 0,
    found: true,
    loading: false,
    pinned: false
});

let popupApp: App<Element> | null = null;
let popupMountPoint: HTMLElement | null = null;

// Track if pinned
let isPinned = false;
let pinRJ: string | null = null;

export const Popup = {
    makePopup(display = false) {
        if (!popupApp) {
            console.log("[RJ2Link Debug] makePopup initialized.");
            const container = document.createElement("div");
            container.id = `${VOICELINK_CLASS}-vue-container`;
            container.style.position = 'absolute';
            container.style.top = '0';
            container.style.left = '0';
            container.style.zIndex = '2147483647';
            container.style.pointerEvents = 'none'; // let the child popup manage pointer events
            document.body.appendChild(container);

            popupApp = createApp(PopupComponent, {
                state: popupState
            });
            popupMountPoint = document.createElement("div");
            container.appendChild(popupMountPoint);
            popupApp.mount(popupMountPoint);
            console.log("[RJ2Link Debug] Vue App mounted on", popupMountPoint);
        }
        popupState.display = display !== false;
        console.log("[RJ2Link Debug] popupState.display set to", popupState.display);
    },

    updatePopup(e: MouseEvent, rjCode: string, isParent = false) {
        console.log("[RJ2Link Debug] updatePopup called for RJ:", rjCode);
        popupState.display = true;
        popupState.rjCode = rjCode;
        Popup.move(e);
    },

    isHoldPinKey(e: KeyboardEvent | MouseEvent) {
        if (getOS() === "Mac") {
            return e.metaKey;
        }
        return e.ctrlKey;
    },

    isPinKeyDown(e: KeyboardEvent) {
        if (getOS() === "Mac") {
            return e.key === "Meta";
        }
        return e.key === "Control";
    },

    setPinState(rjCode: string | null, pin: boolean, close = true) {
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

    domMove(e: MouseEvent) {
        if (!Popup.hasPinned() || Popup.isHoldPinKey(e)) {
            return;
        }
        Popup.setPinState(null, false);
    },

    over(e: MouseEvent) {
        const target = isInDLSite() ? e.target as HTMLElement : getVoiceLinkTarget(e.target as HTMLElement);
        if (!target || !target.classList.contains(VOICELINK_CLASS)) return;

        const rjCode = target.getAttribute(RJCODE_ATTRIBUTE);
        if (!rjCode) return;
        
        console.log("[RJ2Link Debug] Mouse over on RJ Link:", rjCode, "Event coords:", e.clientX, e.clientY);

        popupState.mouseX = e.clientX;
        popupState.mouseY = e.clientY;

        if (Popup.isHoldPinKey(e) && pinRJ) {
            // Already pinned
        } else {
            pinRJ = null;
        }

        Popup.makePopup();
        Popup.updatePopup(e, rjCode);

        if (Popup.isHoldPinKey(e)) {
            Popup.setPinState(rjCode, true);
        } else {
            Popup.setPinState(rjCode, false, false);
        }

        target.focus();
        target.style.setProperty("outline", "none", "important");
    },

    out(e: MouseEvent) {
        if (Popup.isHoldPinKey(e)) return;

        const target = isInDLSite() ? e.target as HTMLElement : getVoiceLinkTarget(e.target as HTMLElement);
        if (!target || !target.classList.contains(VOICELINK_CLASS)) return;

        const rjCode = target.getAttribute(RJCODE_ATTRIBUTE);
        if (!rjCode) return;

        Popup.setPinState(rjCode, false);
        target.blur();
        target.style.setProperty("outline", "none");
    },

    move(e: MouseEvent) {
        const target = isInDLSite() ? e.target as HTMLElement : getVoiceLinkTarget(e.target as HTMLElement);
        if (!target || !target.classList.contains(VOICELINK_CLASS)) return;

        const rjCode = target.getAttribute(RJCODE_ATTRIBUTE);
        if (!rjCode) return;

        popupState.mouseX = e.clientX;
        popupState.mouseY = e.clientY;

        if (Popup.isHoldPinKey(e) && !pinRJ) {
            Popup.setPinState(rjCode, true);
        }

        if (pinRJ && rjCode !== pinRJ) {
            return;
        }
    },

    keydown(e: KeyboardEvent) {
        const target = isInDLSite() ? e.target as HTMLElement : getVoiceLinkTarget(e.target as HTMLElement);
        if (!target || !target.classList.contains(VOICELINK_CLASS)) return;

        const rjCode = target.getAttribute(RJCODE_ATTRIBUTE);
        if (!rjCode) return;

        if (popupState.display && Popup.isPinKeyDown(e)) {
            Popup.setPinState(rjCode, true);
        }
    },

    keyup(e: KeyboardEvent) {
        if (popupState.display && Popup.isPinKeyDown(e)) {
            Popup.setPinState(null, false);
        }
    }
};
