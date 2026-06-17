import { work_promise, getHttpAsync } from '../utils/common';
import { LANG_MAP } from '../config/constants';
import { localizePopup, localizationMap } from '../config/localization';
import { DateParser } from '../utils/date';
import { DataCacheStorage } from '../utils/cache';
import { Csp } from '../utils/csp';


    export const WorkPromise = {

        checkNotNull: function (obj) {
            if (obj === null || obj === undefined) throw new Error();
            return obj;
        },

        getWorkPromise: function (rjCode) {
            if (work_promise[rjCode]) {
                return work_promise[rjCode];
            }
            work_promise[rjCode] = DLsite.getWorkRequestPromise(rjCode);
            return work_promise[rjCode];
        },

        getFound: async function (rjCode) {
            try {
                const data = await WorkPromise.getWorkPromise(rjCode).api2;
                if (data && data.product_id !== undefined) return true;

                //否则再次检查api1
                const api = await WorkPromise.getWorkPromise(rjCode).api;
                return api && api.is_sale !== undefined;
            } catch (e) {
                //说明是网络问题，删除缓存并返回true
                delete work_promise[rjCode];
                return true;
            }
        },

        getTranslationInfo: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            let data = await p.api2;
            if (data.translation_info) return data.translation_info;

            data = await p.api;
            return data.translation_info ? data.translation_info : {};
        },

        getRJChain: async function (rjCode) {
            //RJxxx → RJxxx → RJxxx，这样从子级指向父级
            const trans = await WorkPromise.getTranslationInfo(rjCode);
            let chain = [rjCode];
            if (trans.is_child) {
                chain.push(trans.parent_workno, trans.original_workno);
            } else if (trans.is_parent) {
                chain.push(trans.original_workno);
            }
            return chain;
        },

        getParentRJ: async function (rjCode) {
            try {
                const p = WorkPromise.getWorkPromise(rjCode);
                let trans = await WorkPromise.getTranslationInfo(rjCode);
                if (trans.is_original || trans.is_parent) return rjCode;
                if (trans.parent_workno) return trans.parent_workno;

                let data = await p.info;
                return data.parentWork;
            } catch (e) {
                return null;
            }
        },

        getGirls: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            let data = await p.api2;
            if (data.sex_category && data.sex_category === 2) return true;
            if (data.site_id === "girls") return true;

            //否则再次检查api1
            data = await WorkPromise.getWorkPromise(rjCode).api;
            WorkPromise.checkNotNull(data.is_girls)
            return data.is_girls;
        },

        getAnnounce: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            const info = await p.info;
            return info.is_announce;
        },

        getSale: async function (rjCode, checkAnnounce = true) {
            const p = WorkPromise.getWorkPromise(rjCode);
            let data = await p.api;
            if (!checkAnnounce) {
                return data.is_sale;
            }
            return data.is_sale || await WorkPromise.getAnnounce(rjCode);
        },

        getDLCount: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            let data = await p.api;
            WorkPromise.checkNotNull(data.dl_count);
            return data.dl_count;
        },

        getRateAvg: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            let data = await p.api;
            if (data.rate_average_2dp) return data.rate_average_2dp;

            //还可以累加api2的结果获得
            data = await p.api2;
            this.checkNotNull(data.rate_count_detail);
            let sum = 0;
            let count = 0;
            for (const key in data.rate_count_detail) {
                let rate = parseInt(key);
                let cot = parseInt(data.rate_count_detail[key]);
                count += cot
                sum += rate * cot;
            }
            return sum / count;
        },

        getRateCount: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            let data = await p.api;
            if (data.rate_count) return data.rate_count;

            //还可以累加api2的结果获得
            data = await p.api2;
            this.checkNotNull(data.rate_count_detail);
            let count = 0;
            for (const key in data.rate_count_detail) {
                count += parseInt(data.rate_count_detail[key]);
            }
            return count;
        },

        getWishlistCount: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            let data = await p.api;
            this.checkNotNull(data.wishlist_count);
            return data.wishlist_count;
        },

        getPriceText: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            //TODO: 价格以后再加，还要考虑汇率和添加设置项
        },

        getBonus: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            let data = await p.api;
            return !data.is_sale && data.is_free && data.is_oly && data.wishlist_count === 0;
            // return data.is_bonus;
        },

        getHasBonus: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            let data = await p.api;
            return data.bonuses && data.bonuses.length > 0;
        },

        getTranslatable: async function (rjCode) {
            const trans = await WorkPromise.getTranslationInfo(rjCode);
            return trans.is_translation_agree === true;
        },

        getTranslated: async function (rjCode) {
            const trans = await WorkPromise.getTranslationInfo(rjCode);
            return trans.is_parent === true || trans.is_child === true;
        },

        getLanguages: async function (rjCode) {
            //返回字符串数组，根据popup设置的语言返回支持的语言列表
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

        getFileFormats: async function (rjCode) {
            //返回字符串数组，返回文件格式列表
            const result = [];
            const p = WorkPromise.getWorkPromise(rjCode);
            let api = await p.api2;
            if (api.file_type === "EXE") {
                result.push("EXE");
            } else if (api.file_type_string) {
                result.push(api.file_type_string);
            }
            if (api.file_type_special) result.push(api.file_type_special);

            if (!api.options) api = await p.api;
            if (api.options && api.options.includes("WPD")) {
                result.push("PDF");
            }
            if (api.options && api.options.includes("WAP")) {
                result.push("APK");
            }

            return result;
        },

        getAIUsedText: async function (rjCode) {
            //返回是否使用或部分使用AI，根据popup语言返回字符串。
            const p = WorkPromise.getWorkPromise(rjCode);
            let api = await p.api2;
            api = api.options ? api : await p.api;
            const options = api.options ? api.options : "";
            if (options.includes("AIG")) {
                return localizePopup(localizationMap.tag_aig);
            } else if (options.includes("AIP")) {
                return localizePopup(localizationMap.tag_aip);
            }
            return null;
        },

        getDebug: async function (rjCode) {
            return "";
            const work = WorkPromise.getWorkPromise(rjCode);
            const api2 = await work.api2;
            const api = await work.api;
            const info = await work.info;
            const circle = work.circle;

            return `is_ana_api2: ${api2.is_ana}<br/>
                    is_ana_api: ${api.is_ana}`;
        },

        getWorkCategory: async function (rjCode) {
            const type = await WorkPromise.getWorkType(rjCode);
            /* voice: 音声
             * game: 游戏
             * manga: 漫画/插画/音声漫画
             * video: 视频
             * novel: 小说
             * other: 其它
            */
            switch (type) {
                case 0:
                    return "voice";
                case 1:
                    return "game";
                case 2 || 3 || 8:
                    return "manga";
                case 5:
                    return "video";
                case 4:
                    return "novel";
                default:
                    return "other";
            }
        },

        getWorkTypeText: async function (rjCode) {
            const mapping = [
                localizePopup(localizationMap.work_type_voice),
                localizePopup(localizationMap.work_type_game),
                localizePopup(localizationMap.work_type_comic),
                localizePopup(localizationMap.work_type_illustration),
                localizePopup(localizationMap.work_type_novel),
                localizePopup(localizationMap.work_type_video),
                localizePopup(localizationMap.work_type_music),
                localizePopup(localizationMap.work_type_tool),
                localizePopup(localizationMap.work_type_voice_comic),
                localizePopup(localizationMap.work_type_other),
            ];
            return mapping[await WorkPromise.getWorkType(rjCode)];
        },

        getWorkType: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            const api2 = await p.api2;
            let workType = api2.work_type;
            if (!workType) workType = (await p.api).work_type;

            switch (workType) {
                case "SOU":
                    return 0;
                case (["ACN", "QIZ", "ADV", "RPG", "TBL", "DNV", "SLN", "TYP", "STG", "PZL", "ETC"]
                    .includes(workType) ? workType : "ERR"):
                    return 1;
                case (["MNG", "SCM", "WBT"]
                    .includes(workType) ? workType : "ERR"):
                    return 2;
                case "ICG":
                    return 3;
                case (["NRE", "KSV"].includes(workType) ? workType : "ERR"):
                    return 4;
                case "MOV":
                    return 5;
                case "MUS":
                    return 6;
                case (["TOL", "IMT", "AMT"]
                    .includes(workType) ? workType : "ERR"):
                    return 7;
                case "VCM":
                    return 8;
                case "ET3":
                    return 9;
                default:
                    throw new Error("无法获取作品类型/未知作品类型：" + workType);
            }
        },

        getImgLink: async function (rjCode) {
            let link = undefined;
            const p = WorkPromise.getWorkPromise(rjCode);

            try {
                let data = await p.api2;
                if (data.image_main && data.image_main.url) link = "https:" + data.image_main.url;
            } catch (e) { }

            if (link && !link.includes("no_img_main.gif")) {
                return link;
            }

            try {
                const info = await p.info;
                WorkPromise.checkNotNull(info.img);
                return info.img;
            } catch (e) {
            }

            try {
                const apiData = await WorkPromise.getWorkPromise(rjCode).api;
                if (apiData.work_image) return "https:" + apiData.work_image;
            } catch (e) { }

            throw new Error("无法获取图片链接");
        },

        getWorkTitle: async function (rjCode) {
            return await WorkPromise.getWorkPromise(rjCode).translated_title;
        },

        getAgeRating: async function (rjCode) {
            let p = WorkPromise.getWorkPromise(rjCode);
            let api = await p.api2;
            if (!api.age_category) api = await p.api;
            switch (api.age_category) {
                case 1:
                    return "All";
                case 2:
                    return "R15";
                case 3:
                    return "R18";
            }

            const info = await p.info;
            WorkPromise.checkNotNull(info.rating);
            return info.rating;
        },

        getCircle: async function (rjCode, findOriginal = true) {
            let trans = await WorkPromise.getTranslationInfo(rjCode);
            if (!trans.is_original && findOriginal) {
                //使用原作RJ号开始寻找，如果找不到翻译信息就没办法了
                rjCode = trans.original_workno ? trans.original_workno : rjCode;
            }

            let work = WorkPromise.getWorkPromise(rjCode);
            let api2 = await work.api2;
            if (api2.maker_name) return api2.maker_name;

            /**
             * 接下来有两种搜索方式：
             * 1. api1 + circle接口
             * 2. info搜索
             * 前者成功率更高（下架后还能获取到api1，社团没解散就能获得社团信息），两个加载速度不确定谁快谁慢，所以把1放在前面
             */

            const circleInfo = await work.circle;
            if (circleInfo && circleInfo.name) return circleInfo.name;

            let info = await work.info;
            if (info.circle) return info.circle.trim();

            throw new Error("无法获取社团信息");
        },

        getTranslatorName: async function (rjCode) {
            let trans = await WorkPromise.getTranslationInfo(rjCode);
            if (!trans.is_child) throw new Error("非翻译作品RJ号");
            return await WorkPromise.getCircle(rjCode, false);
        },

        getReleaseDate: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            const info = await p.info;
            if (info && !info.is_announce && info.date) return [info.date.trim(), false];
            if (info && info.is_announce && info.dateAnnounce) return [info.dateAnnounce.trim(), true];

            //从api中查找发售时间
            let api = await p.api2;
            api = api.regist_date ? api : await p.api;
            WorkPromise.checkNotNull(api.regist_date)

            return [api.regist_date, api.is_announce];
        },

        getReleaseCountDownElement: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            const info = await p.info;
            if (info && info.is_announce && info.dateAnnounce) {
                return DateParser.getCountDownDateElement(DateParser.parseDateStr(info.dateAnnounce, info.lang));
            }
            return null;
        },

        getUpdateDate: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            const info = await p.info;
            if (info["update"]) return info["update"].trim();

            throw new Error();
        },

        getScenario: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            const api2 = await p.api2;
            if (api2.creaters && api2.creaters.scenario_by && api2.creaters.scenario_by.length > 0) {
                return api2.creaters.scenario_by.map(v => v.name);
            }

            //无法获取api2则直接通过html获取
            const info = await WorkPromise.getWorkPromise(rjCode).info;
            WorkPromise.checkNotNull(info.scenario);
            return info.scenario;
        },

        getIllustrator: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            const api2 = await p.api2;
            if (api2.creaters && api2.creaters.illust_by && api2.creaters.illust_by.length > 0) {
                return api2.creaters.illust_by.map(v => v.name);
            }

            //无法获取api2则直接通过html获取
            const info = await WorkPromise.getWorkPromise(rjCode).info;
            WorkPromise.checkNotNull(info.illustration);
            return info.illustration;
        },

        getCV: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            const api2 = await p.api2;
            if (api2.creaters && api2.creaters.voice_by && api2.creaters.voice_by.length > 0) {
                return api2.creaters.voice_by.map(v => v.name);
            }

            //无法获取api2则直接通过html获取
            const info = await WorkPromise.getWorkPromise(rjCode).info;
            WorkPromise.checkNotNull(info.cv);
            return info.cv;
        },

        getMusic: async function (rjCode) {
            const p = WorkPromise.getWorkPromise(rjCode);
            const api2 = await p.api2;
            if (api2.creaters && api2.creaters.music_by && api2.creaters.music_by.length > 0) {
                return api2.creaters.music_by.map(v => v.name);
            }

            //无法获取api2则直接通过html获取
            const info = await WorkPromise.getWorkPromise(rjCode).info;
            WorkPromise.checkNotNull(info.music);
            return info.music;
        },

        getTags: async function (rjCode) {
            //注意该方法返回字符串数组而不是纯字符串
            const p = WorkPromise.getWorkPromise(rjCode);
            const api2 = await p.api2;
            if (api2.genres && api2.genres.length > 0) {
                return api2.genres.map(genre => genre.name);
            }

            //无法获取api2时通过html获取
            const info = await p.info;
            WorkPromise.checkNotNull(info.tags);
            return info.tags;
        },

        getFileSizeStr: function (byteCount = 0) {
            const units = ["B", "KB", "MB", "GB", "TB"];
            let unit = "B";
            for (let i = 1; byteCount >= 1024; i++) {
                byteCount /= 1024;
                unit = units[i];
            }
            return `${Math.round(byteCount * 100) / 100}${unit}`;
        },

        getFileSize: async function (rjCode) {
            const trans = await WorkPromise.getTranslationInfo(rjCode);
            if (trans.is_parent) {
                //翻译版本的父级没有内容信息，自然无法显示文件大小，所以需要获得原作品的大小信息
                //Child和Original都有各自的大小信息，正常获取计算即可
                rjCode = trans.original_workno ? trans.original_workno : rjCode;
            }

            const p = WorkPromise.getWorkPromise(rjCode);
            let api2 = await p.api2;
            if (api2.contents_file_size && api2.contents_file_size > 0) {
                return WorkPromise.getFileSizeStr(api2.contents_file_size);
            }

            //通过html获取
            let info = trans.is_child && trans.original_workno ? await WorkPromise.getWorkPromise(trans.original_workno).info : await p.info;
            if (info.filesize) return info.filesize;

            throw new Error("无法获取文件大小信息");
        },

        mergeLinkage: function (l1, l2) {
            let linkage = {}
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

        cacheLinkage: function (originalWorkno, linkage) {
            //缓存与rjCode相关的关联作品信息，任意一个关联作品RJ均能找到此关联信息

            function getExpireTime() {
                //UTC+9第二天的0点
                const now = new Date();
                const nowMs = now.getTime();
                const utc9Ms = nowMs + now.getTimezoneOffset() * 60000 + 9 * 3600 * 1000;
                const localeOffset = utc9Ms - nowMs;
                const dayMs = 24 * 3600 * 1000;
                const nextDayUtc9 = utc9Ms - (utc9Ms % dayMs) + dayMs;
                return nextDayUtc9 - localeOffset;
            }

            let maxLinkMapSize = 128;
            let linkCache = DataCacheStorage.open(
                "work-linkages", maxLinkMapSize, true, true, true);

            //存入Linkage
            let langs = settings._ss_cue_lang.join();
            let data = linkCache.get(originalWorkno);
            if (Array.isArray(data)) {
                //已存在部分Linkage则合并它们
                data = WorkPromise.mergeLinkage(data, linkage);
            } else {
                data = linkage;
            }
            linkCache.commit(`${originalWorkno}|${langs}`, data, getExpireTime());
        },

        getLinkageFromCache: function (originalWorkno) {
            const hashKey = `${originalWorkno}|${settings._ss_cue_lang.join()}`
            let storage = DataCacheStorage.open("work-linkages", 128, true, true, true);
            return storage.get(hashKey);
        },

        getLinkedWorks: async function (rjCode) {
            try {
                let trans = await WorkPromise.getTranslationInfo(rjCode);
                let p = await WorkPromise.getWorkPromise(rjCode);
                let api = await p.api2;
                let result = {};
                if (trans.is_original) {
                    result[rjCode] = { workno: rjCode, type: "original", lang: "JPN" };
                    let languageEditions = api.language_editions;
                    if (!Array.isArray(languageEditions)) languageEditions = Object.values(languageEditions);
                    for (let edition of languageEditions) {
                        result[edition.workno] = { workno: edition.workno, type: "parent", lang: edition.lang };
                    }
                } else if (trans.is_parent) {
                    //parent作品可以获取当前语言下所有的作品关联，但无法获取其它语言作品关联，作品数更新时也无法注意到
                    result[trans.original_workno] = { workno: trans.original_workno, type: "original", lang: "JPN" };
                    result[rjCode] = { workno: rjCode, type: "parent", lang: trans.lang };
                    for (let workno of trans.child_worknos) {
                        result[workno] = { workno: workno, type: "child", lang: trans.lang }
                    }
                } else if (trans.is_child) {
                    result[trans.original_workno] = { workno: trans.original_workno, type: "original", lang: "JPN" };
                    result[trans.parent_workno] = { workno: trans.parent_workno, type: "parent", lang: trans.lang };
                    result[rjCode] = { workno: rjCode, type: "child", lang: trans.lang };
                }

                return result;
            } catch (e) {
                console.error(e);
                return {};
            }

        },

        /**
         * 查找指定作品的所有语言版本作品关联
         * @param rjCode 查找关联的RJ号
         * @param useCache 是否使用缓存中的记录
         * @param saveCache 是否记录/更新至缓存
         */
        getLinkedWorksFull: async function (rjCode, useCache = true, saveCache = true) {
            let trans = await WorkPromise.getTranslationInfo(rjCode);
            if (trans.is_original === undefined || trans.is_original === null) return {};
            if (!trans.is_original) {
                //TODO 将结果和待搜索RJ号的本地关联搜索结果merge一下再返回（不存缓存，否则会破坏缓存内语言和cue_lang的对应性
                //TODO 上面那个不算，改成临时添加cue lang，然后方法改成用参数接收cue lang而不是读设置项，缓存那边也要改成参数传递
                let result = await WorkPromise.getLinkedWorksFull(trans.original_workno, useCache, saveCache);
                result = WorkPromise.mergeLinkage(result, await WorkPromise.getLinkedWorks(rjCode));
                return result;
            }

            //先尝试从缓存获取
            let cache = WorkPromise.getLinkageFromCache(rjCode)
            if (cache) {
                return cache;
            }

            let p = await WorkPromise.getWorkPromise(rjCode);
            let api = await p.api2;
            let result = {};

            result[rjCode] = { workno: rjCode, type: "original", lang: "JPN" };
            let languageEditions = api.language_editions;
            if (!Array.isArray(languageEditions)) languageEditions = Object.values(languageEditions);
            for (let edition of languageEditions) {
                if (!settings._ss_cue_lang.includes(edition.lang)) continue;
                //是需要的查询语言，进行Link递归查询
                result = WorkPromise.mergeLinkage(result, await WorkPromise.getLinkedWorks(edition.workno));
            }

            if (saveCache) WorkPromise.cacheLinkage(rjCode, result);
            return result;
        },

        //仓库搜索

        cacheSearchResult(rjCode, searchProfileHash, fullSearch, data) {
            const hashKey = `${rjCode}|${searchProfileHash}|${fullSearch}`;
            const storage = DataCacheStorage.open("search-results", 128, true, true, true)
            storage.commit(hashKey, data, Date.now() + 3 * 60 * 1000)
        },

        getSearchResultFromCache(rjCode, searchProfileHash, fullSearch) {
            const hashKey = `${rjCode}|${searchProfileHash}|${fullSearch}`;
            const storage = DataCacheStorage.open("search-results", 128, true, true, true)
            return storage.get(hashKey);
        },

        /**
         * 获取来自Kikoeru API的搜索结果
         * @param rjCode {string}
         * @param searchProfile {SearchProfile}
         * @param linkages {{}}
         * @returns {[SearchWorkInfo]}
         */
        getKikoeruSearchResult: async function (rjCode, searchProfile, linkages) {
            let url = searchProfile.searchUrlTemplate?.replaceAll("%s", rjCode);

            try {
                let resp = await getHttpAsync(url, false, 180, searchProfile.customHeaders);
                if (!(resp.readyState === 4 && resp.status === 200)) {
                    return;
                }

                let data = JSON.parse(resp.responseText);
                if (!Array.isArray(data.works)) {
                    throw new Error("Invalid Response.");
                } else if (data.works.length <= 0) {
                    return [];
                }

                let result = [];
                for (const work of data.works) {
                    let rj = work.id > 999999 ? `RJ0${work.id}` : `RJ${work.id}`;
                    let link = linkages[rj];
                    if (!link) continue;

                    result.push(new SearchWorkInfo(link.workno, link.type, link.lang));
                }

                return result;
            } catch (e) {
                console.error(e);
                return null;
            }

        },
    }

    export const DLsite = {
        parseWorkDOM: function (dom, rj) {
            // workInfo: {
            //     rj: any;
            //     img: string;
            //     title: any;
            //     circle: any;
            //     date: any;
            //     rating: any;
            //     tags: any[];
            //     cv: any;
            //     filesize: any;
            //     dateAnnounce: any;
            // }
            const workInfo = {};
            workInfo.rj = rj;

            let metaList = dom.getElementsByTagName("meta")
            for (let i = 0; i < metaList.length; i++) {
                let meta = metaList[i];
                if (meta.getAttribute("property") === 'og:image') {
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
                const lambda = text => row_header === text;
                switch (true) {
                    case (["販売日", "发售日", "販賣日", "Release date", "판매일", "Lanzamiento", "Veröffentlicht",
                        "Date de sortie", "Tanggal rilis", "Data di rilascio", "Lançamento", "Utgivningsdatum",
                        "วันที่ขาย", "Ngày phát hành"].some(lambda)):
                        workInfo.date = row_data.innerText.trim();
                        break;
                    case (["更新情報", "更新信息", "更新資訊", "Update information", "갱신 정보", "Actualizar información",
                        "Aktualisierungen", "Mise à jour des informations", "Perbarui informasi", "Aggiorna informazioni",
                        "Atualizar informações", "Uppdatera information", "ข้อมูลอัปเดต", "Thông tin cập nhật"].some(lambda)):
                        workInfo.update = row_data.firstChild.data.trim();
                        break;
                    case (["年齢指定", "年龄指定", "年齡指定", "Age", "연령 지정", "Edad", "Altersfreigabe", "Âge", "Batas usia",
                        "Età", "Idade", "Ålder", "การกำหนดอายุ", "Độ tuổi chỉ định"].some(lambda)):
                        workInfo.rating = row_data.innerText.trim();
                        break;
                    case (["ジャンル", "分类", "分類", "Genre", "장르", "Género", "Genre", "Genre", "Genre", "Genere", "Gênero",
                        "Genre", "ประเภท", "Thể loại"].some(lambda)):
                        const tag_nodes = row_data.querySelectorAll("a");
                        workInfo.tags = [...tag_nodes].map(a => { return a.innerText.trim() });
                        break;
                    case (["シナリオ", "Scenario", "剧情", "劇本", "시나리오", "Guión", "Szenario", "Scénario", "Skenario",
                        "Scenario", "Cenário", "Scenario", "บทละคร", "Kịch bản"].some(lambda)):
                        workInfo.scenario = row_data.innerText.trim();
                        break;
                    case (["イラスト", "Illustration", "插画", "插畫", "일러스트", "Ilustración", "AbbilDung", "Illustration",
                        "Ilustrasi", "Illustrazione", "Ilustração", "Illustration", "ภาพประกอบ", "Tranh minh họa"].some(lambda)):
                        workInfo.illustration = row_data.innerText.trim();
                        break;
                    case (["声優", "声优", "聲優", "Voice Actor", "성우", "Doblador", "Synchronsprecher", "Doubleur",
                        "Pengisi suara", "Doppiatore/Doppiatrice", "Ator de voz", "Röstskådespelare", "นักพากย์",
                        "Diễn viên lồng tiếng"].some(lambda)):
                        workInfo.cv = row_data.innerText.trim();
                        break;
                    case (["音楽", "Music", "音乐", "音樂", "음악", "Música", "Musik", "Musique", "Musik", "Musica.",
                        "Música", "musik", "ดนตรี", "Âm nhạc"].some(lambda)):
                        workInfo.music = row_data.innerText.trim();
                        break;
                    case (["ファイル容量", "文件容量", "檔案容量", "File size", "파일 용량", "Tamaño del Archivo", "Dateigröße",
                        "Taille du fichier", "Ukuran file", "Dimensione del file", "Tamanho do arquivo", "Filstorlek",
                        "ขนาดไฟล์", "Dung lượng tệp"].some(lambda)):
                        workInfo.filesize = row_data.innerText.trim();
                        break;
                    default:
                        break;
                }
            }

            //获取发售预告时间
            const work_date_ana = dom.querySelector("strong.work_date_ana");
            if (work_date_ana) {
                workInfo.dateAnnounce = work_date_ana.innerText;
                //workInfo.img = "https://img.dlsite.jp/modpub/images2/ana/doujin/" + rj_group + "/" + rj + "_ana_img_main.jpg"
            }

            return workInfo;
        },

        // Get language code for DLSite API
        getLangCode: function (lang) {
            if (!lang) return "ja-JP";

            switch (lang.toUpperCase()) {
                case "JPN":
                    return "ja-JP";
                case "ENG":
                    return "en-US";
                case "KO_KR":
                    return "ko-KR";
                case "CHI_HANS":
                    return "zh-CN";
                case "CHI_HANT":
                    return "zh-TW";
                default:
                    return "ja-JP"
            }
        },

        parseApiData: function (rjCode, data) {
            if (!data) data = {};
            let apiData = data;
            apiData.is_bonus = !data.is_sale && data.is_free && data.is_oly && data.wishlist_count === false;
            apiData.is_girls = (data.options && data.options.indexOf("OTM") >= 0) || (data.site_id === "girls");

            if (data.regist_date) {
                let reg_date = data.regist_date.replace(/-/g, '/');
                let releaseDate = new Date(reg_date);
                apiData.regist_timestamp = releaseDate.getTime();
                apiData.regist_date = `${releaseDate.getFullYear()} / ${releaseDate.getMonth() + 1} / ${releaseDate.getDate()}`;
                if (apiData.regist_timestamp > Date.now()) {
                    apiData.is_announce = true;
                }
            }
            return apiData;
        },

        parseApi2Data: function (rjCode, data) {
            const translation_info = data.translation_info ? data.translation_info : {};
            data.lang = DLsite.getLangCode(translation_info.lang);

            if (data.regist_date) {
                let reg_date = data.regist_date.replace(/-/g, '/');
                let releaseDate = new Date(reg_date);
                data.regist_timestamp = releaseDate.getTime();
                data.regist_date = `${releaseDate.getFullYear()} / ${releaseDate.getMonth() + 1} / ${releaseDate.getDate()}`;
                if (data.regist_timestamp > Date.now()) {
                    data.is_announce = true;
                }
            }

            return data;
        },

        getAnnouncePromise: async function (rjCode, parentRJ) {
            const url = `https://www.dlsite.com/maniax/announce/=/product_id/${rjCode}.html`;
            let resp = await getHttpAsync(url);
            if (resp.readyState === 4 && resp.status === 200) {
                const dom = new DOMParser().parseFromString(Csp.createHTML(resp.responseText), "text/html");
                const workInfo = DLsite.parseWorkDOM(dom, rjCode);
                workInfo.parentWork = parentRJ === rjCode ? null : parentRJ;
                workInfo.is_announce = true;
                return workInfo;
            }
            else if (resp.readyState === 4 && resp.status === 404) {
                return {
                    parentWork: parentRJ === rjCode ? null : parentRJ,
                    is_announce: false
                };
            }

        },

        getHtmlPromise: async function (rjCode) {
            const url = `https://www.dlsite.com/maniax/work/=/product_id/${rjCode}.html`;
            let resp = await getHttpAsync(url);
            if (resp.readyState === 4 && resp.status === 200) {
                const dom = new DOMParser().parseFromString(Csp.createHTML(resp.responseText), "text/html");
                const workInfo = DLsite.parseWorkDOM(dom, rjCode);
                workInfo.parentWork = DLsite.getParentWorkRjCode(resp.finalUrl);
                workInfo.parentWork = workInfo.parentWork === rjCode ? null : workInfo.parentWork;
                workInfo.is_announce = false;
                return workInfo;
            }
            else if (resp.readyState === 4 && resp.status === 404) {
                return await DLsite.getAnnouncePromise(rjCode, DLsite.getParentWorkRjCode(resp.finalUrl));
            }
        },

        getApi2Promise: async function (rjCode, locale = undefined) {
            let url = `https://www.dlsite.com/maniax/api/=/product.json?workno=${rjCode}` + (locale ? `&locale=${locale}` : "");
            let resp = await getHttpAsync(url);
            let data;
            if (resp.readyState === 4 && resp.status === 200) {
                data = JSON.parse(resp.responseText);
                data = data ? data[0] : {};
                data = data ? data : {}
            }
            else if (resp.readyState === 4 && resp.status === 404) {
                return {};
            }
            else {
                throw new Error(`无法通过API2获取${rjCode}的信息：${resp.status} ${resp.statusText}`);
            }

            return DLsite.parseApi2Data(rjCode, data);
        },

        getApiPromise: async function (rjCode, locale = undefined) {
            //获取对应语言下的实际信息
            let url = `https://www.dlsite.com/maniax/product/info/ajax?product_id=${rjCode}&cdn_cache_min=1` + (locale ? `&locale=${locale}` : "");
            let resp = await getHttpAsync(url);
            let data;
            if (resp.readyState === 4 && resp.status === 200) {
                data = JSON.parse(resp.responseText);
                data = data ? data[rjCode] : {};
                data = data ? data : {};
            }
            else if (resp.readyState === 4 && resp.status === 404) {
                return {};
            }
            else {
                throw new Error(`无法通过API获取${rjCode}的信息：${resp.status} ${resp.statusText}`);
            }

            const translation_info = data.translation_info ? data.translation_info : {};
            data.lang = DLsite.getLangCode(translation_info.lang);

            return DLsite.parseApiData(rjCode, data);
        },

        getCirclePromise: async function (rjCode, apiPromise) {
            let apiData = await apiPromise;
            if (!apiData.maker_id) return null;
            const maker_id = apiData.maker_id;

            let url;
            let resp;
            let data;
            try {
                url = `https://media.ci-en.jp/dlsite/lookup/${maker_id}.json`;
                resp = await getHttpAsync(url);
                data = undefined;
                if (resp.readyState === 4 && resp.status === 200) {
                    data = JSON.parse(resp.responseText);
                    data = data ? data[0] : {};
                    data = data ? data : {};
                    data.maker_id = maker_id;
                }
            } catch (e) { }

            if (!data || !data.name) {
                //未获取到社团名称则使用html解析获取
                url = `https://www.dlsite.com/maniax/circle/profile/=/maker_id/${maker_id}.html`;
                resp = await getHttpAsync(url);
                data = data ? data : {};
                if (resp.readyState === 4 && resp.status === 200) {
                    let doc = new DOMParser().parseFromString(Csp.createHTML(resp.responseText), "text/html");
                    let name = doc.querySelector("strong.prof_maker_name");
                    name = name ? name.innerText : null;
                    data.name = name;
                }
            }

            return data;
        },

        getTranslatablePromise: async function (rjCode, site = "maniax") {
            rjCode = rjCode.toUpperCase();
            const result = {
                translation_request_english: {
                    agree: undefined,
                    request: undefined,
                    sale: undefined
                },
                translation_request_simplified_chinese: {
                    agree: undefined,
                    request: undefined,
                    sale: undefined
                },
                translation_request_traditional_chinese: {
                    agree: undefined,
                    request: undefined,
                    sale: undefined
                },
                translation_request_korean: {
                    agree: undefined,
                    request: undefined,
                    sale: undefined
                },
                translation_request_spanish: {
                    agree: undefined,
                    request: undefined,
                    sale: undefined
                },
                translation_request_german: {
                    agree: undefined,
                    request: undefined,
                    sale: undefined
                },
                translation_request_french: {
                    agree: undefined,
                    request: undefined,
                    sale: undefined
                },
                translation_request_indonesian: {
                    agree: undefined,
                    request: undefined,
                    sale: undefined
                },
                translation_request_italian: {
                    agree: undefined,
                    request: undefined,
                    sale: undefined
                },
                translation_request_portuguese: {
                    agree: undefined,
                    request: undefined,
                    sale: undefined
                },
                translation_request_swedish: {
                    agree: undefined,
                    request: undefined,
                    sale: undefined
                },
                translation_request_thai: {
                    agree: undefined,
                    request: undefined,
                    sale: undefined
                },
                translation_request_vietnamese: {
                    agree: undefined,
                    request: undefined,
                    sale: undefined
                },
            };
            const data = await DLsite.getTranslatableApiPromise(rjCode, site);
            if (!data.translationStatusForTranslator) {
                return result;
            }

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
                translation_request_vietnamese: "VIE",
            };
            for (let key in map) {
                let lang = map[key];
                let status = data.translationStatusForTranslator[lang];
                if (!status) {
                    //状况未知
                    continue;
                }
                result[key].agree = status.available;
                result[key].request = status.count;
                result[key].sale = status.on_sale_count;
            }

            return result;
        },

        getTranslatableApiPromise: async function (rjCode, site = "maniax") {
            //新的可用api，用于搜索作品翻译情况，但也可以获得其它信息。
            rjCode = rjCode.toUpperCase();
            let url = `https://www.dlsite.com/${site}/api/=/translatableProducts.json?keyword=${rjCode}`;    //可以使用locale参数指定语言，但这里不需要
            let resp = await getHttpAsync(url, true);
            let data;
            if (resp.readyState === 4 && resp.status === 200) {
                data = JSON.parse(resp.responseText);
            }
            else {
                throw new Error(`无法通过API获取${rjCode}的翻译信息：${resp.status} ${resp.statusText}`);
            }

            //从结果中找到对应RJ号，由于关键字是RJ号的话结果一般都在第一页，所以就放弃翻页寻找了
            if (data.meta && data.meta.code !== 200) {
                throw new Error(`无法通过API查询${rjCode}的翻译信息：${data.meta.code} - ${data.meta.errorType} - ${data.meta.errorMessage}`);
            }
            if (!data.data || !Array.isArray(data.data.products)) {
                throw new Error(`无法通过API查询${rjCode}的翻译信息：未预料到的响应格式。`);
            }

            for (const work of data.data.products) {
                if (work.id === rjCode) {
                    return work;
                }
            }

            //未找到则返回空对象
            return {};

        },

        getWorkRequestPromise: function (rjCode) {
            return {
                _info: undefined,
                _api: undefined,
                _api2: undefined,
                _circle: undefined,
                _translatable: undefined,
                _translated_title: undefined,
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

                        return t._translatable ? t._translatable : t._translatable = DLsite.getTranslatablePromise(rjCode,
                            api.site_id ? api.site_id : "maniax");
                    }
                    return getter(this);
                },
                get translated_title() {
                    async function getter(t) {
                        if (t._translated_title) return t._translated_title;

                        let api = await t.api2;
                        if (api.translation_info) {
                            //api2有效
                            if (!api.translation_info.is_original) {
                                //通过再次查询获得翻译标题
                                api = await DLsite.getApi2Promise(rjCode, api.lang);
                            }
                            t._translated_title = api.work_name;
                            return t._translated_title;
                        }

                        //api2无效，通过api查询
                        api = await t.api;
                        if (!api.translation_info) {
                            //api无效则无法获取标题（网页获取希望渺茫）
                            t._translated_title = null;
                            return null;
                        }

                        if (!api.translation_info.is_original) {
                            //非原作则再次查询
                            api = await DLsite.getApiPromise(rjCode, api.lang);
                        }
                        t._translated_title = api.work_name;
                        return t._translated_title;
                    }

                    return getter(this);
                }
            }
        },

        getParentWorkRjCode: function (redirectUrl) {
            const reg = new RegExp("(?<=product_id/)((R[JE][0-9]{8})|(R[JE][0-9]{6})|([VB]J[0-9]{8})|([VB]J[0-9]{6}))")
            return redirectUrl.match(reg)[0];
        }
    }

