import { getHttpAsync } from '../utils/common';
import { DataCacheStorage } from '../utils/cache';
import { WorkPromise } from './scraper';

export function mergeLinkage(l1, l2) {
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
        }

export function cacheLinkage(originalWorkno, linkage) {
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
                data = mergeLinkage(data, linkage);
            } else {
                data = linkage;
            }
            linkCache.commit(`${originalWorkno}|${langs}`, data, getExpireTime());
        }

export function getLinkageFromCache(originalWorkno) {
            const hashKey = `${originalWorkno}|${settings._ss_cue_lang.join()}`
            let storage = DataCacheStorage.open("work-linkages", 128, true, true, true);
            return storage.get(hashKey);
        }

export async function getLinkedWorks(rjCode) {
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

        }

export async function getLinkedWorksFull(rjCode, useCache = true, saveCache = true) {
            let trans = await WorkPromise.getTranslationInfo(rjCode);
            if (trans.is_original === undefined || trans.is_original === null) return {};
            if (!trans.is_original) {
                //TODO 将结果和待搜索RJ号的本地关联搜索结果merge一下再返回（不存缓存，否则会破坏缓存内语言和cue_lang的对应性
                //TODO 上面那个不算，改成临时添加cue lang，然后方法改成用参数接收cue lang而不是读设置项，缓存那边也要改成参数传递
                let result = await getLinkedWorksFull(trans.original_workno, useCache, saveCache);
                result = mergeLinkage(result, await getLinkedWorks(rjCode));
                return result;
            }

            //先尝试从缓存获取
            let cache = getLinkageFromCache(rjCode)
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
                result = mergeLinkage(result, await getLinkedWorks(edition.workno));
            }

            if (saveCache) cacheLinkage(rjCode, result);
            return result;
        }

export async function getKikoeruSearchResult(rjCode, searchProfile, linkages) {
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

        }

