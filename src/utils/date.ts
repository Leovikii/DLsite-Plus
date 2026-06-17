export const DateParser = {
    parseDateStr: function (dateStr: string, lang: string) {
        dateStr = dateStr.trim().replace(/ /g, "");
        lang = lang.trim().toLowerCase().replace(/_/g, "-");
        let nums = this.parseNumbers(dateStr);
        if (!nums || nums.length < 3 && lang !== "en-us" || nums.length < 2 && lang === "en-us") {
            return null;
        }

        let parsers = [
            this.parseAsiaDateStr,
            this.parseEnglishDateStr,
            this.parseEuropeanDateStr,
            this.parseSpanishDateStr
        ];
        let date = null;
        for (let i = 0; i < parsers.length; i++) {
            date = parsers[i](dateStr, nums, lang);
            if (date) {
                break;
            }
        }

        return date;
    },
    parseNumbers: function (dateStr: string) {
        let nums = dateStr.match(/\d+/g) as any[];
        if (!nums) return null;

        for (let i = 0; i < nums.length; i++) {
            nums[i] = Number(nums[i]);
        }
        return nums;
    },
    parseAsiaDateStr: function (dateStr: string, nums: number[], lang: string) {
        if (!dateStr.match(/\d{4}年\d{1,2}月\d{1,2}日/)
            && !dateStr.match(/\d{4}년\d{1,2}월\d{1,2}일/)) {
            return null;
        }
        return new Date(nums[0], nums[1] - 1, nums[2]);
    },
    parseEnglishDateStr: function (dateStr: string, nums: number[], lang: string) {
        if (!dateStr.match(/[a-zA-Z]{3}\/\d{1,2}\/\d{4}/)) {
            return null;
        }
        const monthMap: any = {
            "Jan": 0, "Feb": 1, "Mar": 2,
            "Apr": 3, "May": 4, "Jun": 5,
            "Jul": 6, "Aug": 7, "Sep": 8,
            "Oct": 9, "Nov": 10, "Dec": 11
        };
        let monthStr = dateStr.substring(0, dateStr.indexOf("/")).toLowerCase();
        monthStr = monthStr[0].toUpperCase() + monthStr.substring(1);
        return new Date(nums[1], monthMap[monthStr], nums[0]);
    },
    parseSpanishDateStr: function (dateStr: string, nums: number[], lang: string) {
        if (lang !== "es-es" || !dateStr.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
            return null;
        }
        return new Date(nums[2], nums[0] - 1, nums[1]);
    },
    parseEuropeanDateStr: function (dateStr: string, nums: number[], lang: string) {
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
};
