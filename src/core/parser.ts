import { URL_REGEX, VOICELINK_IGNORED_CLASS, RJCODE_ATTRIBUTE, VOICELINK_CLASS, RJ_REGEX } from '../config/constants';
import { Popup } from '../ui/popup';

export const Parser = {
    walkNodes: function (elem: Node) {
        const rjNodeTreeWalker = document.createTreeWalker(
            elem,
            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node: any) {
                    if (node.nodeName === "SCRIPT" || node.parentElement && node.parentElement.nodeName === "SCRIPT") {
                        return NodeFilter.FILTER_REJECT;
                    }

                    if (node.parentElement?.isContentEditable) {
                        return NodeFilter.FILTER_SKIP;
                    }

                    if (node.nodeName === "A") {
                        let href = (node as HTMLAnchorElement).href;
                        if (href.match(URL_REGEX) && !(node as HTMLElement).classList.contains(VOICELINK_IGNORED_CLASS)) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                    }

                    if (node.nodeName !== "#text") return NodeFilter.FILTER_SKIP;
                    if (node.parentElement?.classList.contains(VOICELINK_IGNORED_CLASS)
                        || node.parentElement?.hasAttribute(RJCODE_ATTRIBUTE)) {
                        return NodeFilter.FILTER_SKIP;
                    }

                    if (node.parentElement?.classList.contains(VOICELINK_CLASS))
                        return NodeFilter.FILTER_ACCEPT;
                    if (node.nodeValue?.match(RJ_REGEX))
                        return NodeFilter.FILTER_ACCEPT;

                    return NodeFilter.FILTER_SKIP;
                }
            },
        );
        while (rjNodeTreeWalker.nextNode()) {
            const node = rjNodeTreeWalker.currentNode;

            if (node.parentElement?.nodeName === "TEXTAREA") {
                continue;
            }

            if (node.parentElement?.classList.contains(VOICELINK_CLASS)) {
                Parser.rebindEvents(node.parentElement as HTMLElement);
            } else if (node.nodeName === "A") {
                Parser.linkifyURL(node as HTMLAnchorElement);
            } else {
                Parser.linkify(node as Text);
            }
        }
    },

    wrapPlaceholder: function (content: string) {
        let e = document.createElement("span");
        e.classList.add(VOICELINK_CLASS);
        e.innerText = content;
        e.classList.add(VOICELINK_IGNORED_CLASS);
        e.setAttribute(RJCODE_ATTRIBUTE, "");
        return e;
    },

    wrapRJCode: function (rjCode: string) {
        let e = document.createElement("a");
        e.classList.add(VOICELINK_CLASS);
        e.href = `https://www.dlsite.com/maniax/work/=/product_id/${rjCode.toUpperCase()}.html`
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

    calculateCoverage: function (text: string) {
        const matches = text.match(RJ_REGEX);
        if (!matches) return 0;
        const coverSize = matches.reduce((total, current) => total + current.length, 0);
        return (coverSize / text.length) * 100;
    },

    linkifyURL: function (node: HTMLAnchorElement) {
        const e = node;
        const href = e.href;
        const rjs = href.match(RJ_REGEX);
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

    linkify: function (textNode: Text) {
        const nodeOriginalText = textNode.nodeValue || "";
        const matches: any[] = [];

        let insert = "before_rj";
        let tagA = textNode.parentElement?.closest("a");
        let tagB = textNode.parentElement?.closest("button");
        let tag = tagA ? tagA : tagB;
        if ((!tagA && !tagB) || insert.trim() !== "none" && this.calculateCoverage(tag?.innerText || "") < 71) {
            insert = "none";
        }

        let match;
        while (match = RJ_REGEX.exec(nodeOriginalText)) {
            matches.push({
                index: match.index,
                value: match[0],
            });
        }
        if (matches.length === 0) return;

        textNode.nodeValue = nodeOriginalText.substring(0, matches[0].index);
        
        let prevNode: Node | null = null;
        for (let i = 0; i < matches.length; ++i) {
            let code = matches[i].value;
            let rjLinkNode: HTMLElement = Parser.wrapRJCode(code);
            
            if (insert.startsWith("before_rj")) {
                rjLinkNode.innerText = "🔗";
                textNode.parentNode?.insertBefore(
                    rjLinkNode,
                    prevNode ? prevNode.nextSibling : textNode.nextSibling,
                );
                prevNode = rjLinkNode;
                rjLinkNode = Parser.wrapPlaceholder(code);
            }
            
            textNode.parentNode?.insertBefore(
                rjLinkNode,
                prevNode ? prevNode.nextSibling : textNode.nextSibling,
            );
            
            let nextRJ = undefined;
            if (i < matches.length - 1) {
                nextRJ = matches[i + 1].index;
            }
            let substring = nodeOriginalText.substring(matches[i].index + matches[i].value.length, nextRJ);

            if (substring) {
                const subtextNode = document.createTextNode(substring);
                textNode.parentNode?.insertBefore(
                    subtextNode,
                    rjLinkNode.nextElementSibling,
                );
                prevNode = subtextNode;
            } else {
                prevNode = rjLinkNode;
            }
        }
    },

    rebindEvents: function (elem: HTMLElement) {
        if (elem.nodeName === "A") {
            elem.addEventListener("mouseover", Popup.over);
            elem.addEventListener("mouseout", Popup.out);
            elem.addEventListener("mousemove", Popup.move);
            elem.addEventListener("keydown", Popup.keydown);
        } else {
            const voicelinks = elem.querySelectorAll("." + VOICELINK_CLASS);
            for (let i = 0, j = voicelinks.length; i < j; i++) {
                const voicelink = voicelinks[i] as HTMLElement;
                voicelink.addEventListener("mouseover", Popup.over);
                voicelink.addEventListener("mouseout", Popup.out);
                voicelink.addEventListener("mousemove", Popup.move);
                voicelink.addEventListener("keydown", Popup.keydown);
            }
        }
    },

    parseEnglishDateStr: function (dateStr: string, nums: any[], lang: string) {
        if (!dateStr.match(/[a-zA-Z]{3}\/\d{1,2}\/\d{4}/)) {
            return null;
        }
        const monthMap: Record<string, number> = {
            "Jan": 0, "Feb": 1, "Mar": 2,
            "Apr": 3, "May": 4, "Jun": 5,
            "Jul": 6, "Aug": 7, "Sep": 8,
            "Oct": 9, "Nov": 10, "Dec": 11
        }
        let monthStr = dateStr.substring(0, dateStr.indexOf("/")).toLowerCase();
        monthStr = monthStr[0].toUpperCase() + monthStr.substring(1);
        return new Date(nums[1], monthMap[monthStr], nums[0])
    },
    parseSpanishDateStr: function (dateStr: string, nums: any[], lang: string) {
        if (lang !== "es-es" || !dateStr.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
            return null;
        }
        return new Date(nums[2], nums[0] - 1, nums[1]);
    },
    parseEuropeanDateStr: function (dateStr: string, nums: any[], lang: string) {
        if (lang === "es-es" || !dateStr.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
            return null;
        }
        return new Date(nums[2], nums[1] - 1, nums[0]);
    },
    getCountDownDateElement: function (date: Date) {
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
        let days = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        let element = document.createElement("span");
        element.innerText = `(Coming in ${days} day${(days > 1 ? "s" : "")})`;
        element.style.setProperty("color", "#ffeb3b", "important");
        element.style.setProperty("font-style", "italic", "important");
        return element;
    }
}