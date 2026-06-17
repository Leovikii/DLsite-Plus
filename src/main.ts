import { POPUP_CSS, VOICELINK_CLASS } from "./config/constants";
import { Parser } from "./core/parser";
import { Popup } from "./ui/popup";
import { Csp } from "./utils/csp";

export let isInit = false;
export let observing = false;

export function init() {
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
        if (!document.body || observing) {
            return;
        }

        Parser.walkNodes(document.body);
        if (!document.getElementById(`${VOICELINK_CLASS}-vue-container`)) Popup.makePopup(false);

        const observer = new MutationObserver(function (m) {
            for (let i = 0; i < m.length; ++i) {
                let addedNodes = m[i].addedNodes;
                
                for (let j = 0; j < addedNodes.length; ++j) {
                    Parser.walkNodes(addedNodes[j]);
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        observing = true;
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}