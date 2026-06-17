<template>
  <div ref="popupRef" v-show="state.display"
       :class="[`${VOICELINK_CLASS}_voicepopup`, `${VOICELINK_CLASS}_voicepopup-maniax`, additionalClasses, isGirls ? `${VOICELINK_CLASS}_voicepopup-girls` : '']"
       :style="{ display: state.display ? 'flex' : 'none', top: computedTop + 'px', left: computedLeft + 'px', fontSize: computedFontSize + 'px', pointerEvents: state.pinned ? 'auto' : 'auto' }"
       @mouseenter="onMouseEnter"
       @mouseleave="onMouseLeave">
       
    <div v-show="!workFound" class="not-found" style="width: 100%; height: 100%;">
      Work Not Found.
    </div>

    <template v-if="workFound">
      <div :class="`${VOICELINK_CLASS}_left_panel`">
        <div :class="`${VOICELINK_CLASS}_img_container`">
          <img v-if="imgLink" :src="imgLink" :style="imgStyle" @mouseenter="isImgHovered = true" @mouseleave="isImgHovered = false" />
        </div>
        <div :id="`${VOICELINK_CLASS}_hint`" style="display: block;">{{ currentHint }}</div>
      </div>

      <div :class="`${VOICELINK_CLASS}_right_panel`" style="padding-bottom: 3px; flex-grow: 1;">
        <div :class="[`${VOICELINK_CLASS}_voice-title`, 'info-title']" :copy-text="title" :sec-copy-text="secTitle" @click="onCopy" @mouseenter="currentHint = titleHint" @mouseleave="currentHint = defaultHint">
          {{ title || 'Loading...' }}
        </div>
        <div :class="`${VOICELINK_CLASS}_rjcode`">
          [ <span v-if="state.isParent"> ↑ </span>
          <span v-for="(rj, index) in chain" :key="rj">
            <span :class="`${VOICELINK_CLASS}_ignore_class`" :style="index === 0 ? 'font-weight: bold; text-decoration: underline;' : ''">{{ rj }}</span>
            <span v-if="index < chain.length - 1"> → </span>
          </span>
          <span v-if="chain.length === 0">
            <span :class="`${VOICELINK_CLASS}_ignore_class`" style="font-weight: bold; text-decoration: underline;">{{ state.rjCode }}</span>
          </span>
          ]
        </div>

        <div :id="`${VOICELINK_CLASS}_info-container`" style="position: relative; min-height: 70px;">
          <div v-if="loading" :class="`${VOICELINK_CLASS}_loader`" style="display: flex;">
            <div :class="`${VOICELINK_CLASS}_dot`"></div>
            <div :class="`${VOICELINK_CLASS}_dot`"></div>
            <div :class="`${VOICELINK_CLASS}_dot`"></div>
          </div>
          
          <div :class="`${VOICELINK_CLASS}_tags`" v-if="tags.length > 0">
             <span v-for="(tag, index) in tags" :key="index" :class="[`${VOICELINK_CLASS}_tag_tight`, tag.class, tag.small ? `${VOICELINK_CLASS}_tag_small` : '']" @click="tag.onClick ? tag.onClick() : null" :style="tag.onClick ? 'cursor: pointer;' : ''">
               {{ tag.text }}
             </span>
          </div>

          <template v-for="row in infoRows" :key="row.id">
            <div v-if="row.items && row.items.length > 0">
              <span class="info-title" :copy-text="row.copyText" @click="onCopy" @mouseenter="currentHint = copyHint" @mouseleave="currentHint = defaultHint">{{ row.title }}</span>
              <span>
                <template v-for="(c, index) in row.items" :key="index">
                  <a v-if="c.text" :class="c.class" :copy-text="c.text" @click="onCopy" @mouseenter="currentHint = copyHint" @mouseleave="currentHint = defaultHint">{{ c.text }}</a>
                  <component v-else :is="c" />
                  <span v-if="Number(index) < row.items.length - 1">{{ row.separator || ' ' }}</span>
                </template>
              </span>
              <component v-if="row.suffix" :is="row.suffix" />
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUpdated, nextTick } from 'vue';
import { WorkPromise } from '../core/scraper';
import { localizePopup, localizationMap } from '../config/localization';
import { getAdditionalPopupClasses, convertToValidFileName, getOS } from '../utils/common';
import { VOICELINK_CLASS } from '../config/constants';
import type { PopupState } from '../types';

const props = defineProps<{
  state: PopupState;
}>();

const popupRef = ref<HTMLElement | null>(null);
const popupHeight = ref(400);
const popupWidth = ref(400);

const updateSize = () => {
  if (popupRef.value && popupRef.value.style.display !== 'none') {
    const rect = popupRef.value.getBoundingClientRect();
    if (rect.height > 0) popupHeight.value = rect.height;
    if (rect.width > 0) popupWidth.value = rect.width;
  }
};

onUpdated(() => {
  updateSize();
});

const emit = defineEmits(['update-popup']);

// State
const workFound = ref(true);
const loading = ref(true);
const isGirls = ref(false);
const imgLink = ref('');
const title = ref('');
const secTitle = ref('');
const chain = ref<string[]>([]);
const tags = ref<any[]>([]);
const infoRows = ref<any[]>([]);
const isHovered = ref(false);
const isImgHovered = ref(false);

const additionalClasses = getAdditionalPopupClasses() || '';

const copyHint = localizePopup(localizationMap.hint_copy);
const titleHint = localizePopup(localizationMap.hint_copy_work_title);
const currentHint = ref('');
const defaultHint = computed(() => {
  const pinKey = getOS() === 'Mac' ? 'Command' : 'CTRL';
  return props.state.pinned
    ? localizePopup(localizationMap.hint_unpin).replace(/{pin_key}/g, pinKey)
    : localizePopup(localizationMap.hint_pin).replace(/{pin_key}/g, pinKey);
});

// Calculate dynamic position based on state mouse coords and actual popup dimensions
const computedTop = computed(() => {
  if (props.state.mouseY > window.innerHeight / 2) {
    return Math.max(props.state.mouseY - popupHeight.value - 8, 0);
  } else {
    return Math.min(props.state.mouseY + 20, window.innerHeight - popupHeight.value);
  }
});

const computedLeft = computed(() => {
  if (popupWidth.value + props.state.mouseX + 10 < window.innerWidth - 10) {
    return props.state.mouseX + 10;
  } else {
    return Math.max(window.innerWidth - popupWidth.value - 10, 0);
  }
});

const computedFontSize = computed(() => {
  if (popupHeight.value > window.innerHeight) {
    const sizeLevel = [15, 14.5, 14, 13.5, 13, 12.5, 12];
    let size = sizeLevel[sizeLevel.length - 1];
    for (const s of sizeLevel) {
      if (popupHeight.value / window.innerHeight < 15.4 / s) {
        size = s;
        break;
      }
    }
    return size;
  }
  return 15.4;
});

// Blur
const imgStyle = computed(() => {
  if (!settings._s_sfw_mode) return {};
  if (isImgHovered.value && settings._s_sfw_remove_when_hover) return { filter: 'inherit', transition: 'all 0.3s' };
  
  const blurMap = { low: '6px', medium: '12px', high: '24px' };
  return { 
    filter: `blur(${blurMap[settings._s_sfw_blur_level as keyof typeof blurMap] || '12px'})`,
    transition: settings._s_sfw_blur_transition ? 'all 0.3s' : 'none'
  };
});

const onMouseEnter = () => { isHovered.value = true; currentHint.value = defaultHint.value; };
const onMouseLeave = () => { isHovered.value = false; currentHint.value = ''; };

const onCopy = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement;
  const text = e.altKey ? target.getAttribute('sec-copy-text') : target.getAttribute('copy-text');
  if (text && typeof GM_setClipboard !== 'undefined') {
    GM_setClipboard(text, 'text');
  }
};

const updatePopupData = async () => {
  if (!props.state.display || !props.state.rjCode) return;
  const rjCode = props.state.rjCode;
  
  loading.value = true;
  workFound.value = false;
  title.value = '';
  imgLink.value = '';
  chain.value = [];
  infoRows.value = [];
  tags.value = [];

  try {
    let found = await WorkPromise.getFound(rjCode);
    let parentRJ = rjCode;
    
    if (!found) {
      parentRJ = await WorkPromise.getParentRJ(rjCode);
      if (parentRJ && parentRJ !== rjCode) {
        found = await WorkPromise.getFound(parentRJ);
      }
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

  // Fetch title, chain, image in parallel
  Promise.allSettled([
    WorkPromise.getWorkTitle(rjCode).then(t => { if (rjCode === props.state.rjCode) title.value = t; }),
    WorkPromise.getRJChain(rjCode).then(c => { if (rjCode === props.state.rjCode) chain.value = c; }),
    WorkPromise.getImgLink(rjCode).then(link => {
      if (rjCode === props.state.rjCode && typeof link === 'string') imgLink.value = link;
    }),
    WorkPromise.getGirls(rjCode).then(g => { if (rjCode === props.state.rjCode) isGirls.value = !!g; }),
  ]);

  try {
    const category = await WorkPromise.getWorkCategory(rjCode);
    console.log("[RJ2Link Debug] category resolved:", category);
    if (!props.state.display || rjCode !== props.state.rjCode) return;

    if (true) { // Replaced settings._s_tag_main_switch
      const typeText = await WorkPromise.getWorkTypeText(rjCode).catch(() => '');
      if (typeText) tags.value.push({ text: typeText, class: `${VOICELINK_CLASS}_tag-orange`, small: false });

      const rateAvg = await WorkPromise.getRateAvg(rjCode).catch(() => 0);
      const rateCount = await WorkPromise.getRateCount(rjCode).catch(() => 0);
      if (rateAvg > 0) tags.value.push({ text: `${rateAvg.toFixed(2)}★ (${rateCount})`, class: `${VOICELINK_CLASS}_tag-yellow`, small: false });
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
    
    const rowPromises = order.map(async (id: string) => {
      try {
        if (id === 'circle_name') {
            const val = await WorkPromise.getCircle(rjCode);
            if (val) return { id, title: localizePopup(localizationMap.circle_name), items: [{ text: val }], separator: ' / ' };
        } else if (id === 'dl_count') {
            const val = await WorkPromise.getDLCount(rjCode);
            if (val) return { id, title: localizePopup(localizationMap.dl_count), items: [{ text: val }], separator: '' };
        } else if (id === 'voice_actor') {
            const vas = await WorkPromise.getCV(rjCode);
            if (vas && vas.length) return { id, title: localizePopup(localizationMap.voice_actor), items: vas.map((v: string) => ({ text: v })), separator: ' / ' };
        } else if (id === 'age_rating') {
            const val = await WorkPromise.getAgeRating(rjCode);
            if (val) return { id, title: localizePopup(localizationMap.age_rating), items: [{ text: val, class: val.includes('18') ? `${VOICELINK_CLASS}_age-18` : `${VOICELINK_CLASS}_age-all` }], separator: '' };
        } else if (id === 'file_size') {
            const val = await WorkPromise.getFileSize(rjCode);
            if (val) return { id, title: localizePopup(localizationMap.file_size), items: [{ text: val }], separator: '' };
        } else if (id === 'release_date') {
            const val = await WorkPromise.getReleaseDate(rjCode);
            if (val && val[0]) return { id, title: localizePopup(localizationMap.release_date), items: [{ text: val[0] }], separator: '' };
        } else if (id === 'scenario') {
            const val = await WorkPromise.getScenario(rjCode);
            if (val && val.length) return { id, title: localizePopup(localizationMap.scenario), items: val.map((v: string) => ({ text: v })), separator: ' / ' };
        } else if (id === 'illustration') {
            const val = await WorkPromise.getIllustrator(rjCode);
            if (val && val.length) return { id, title: localizePopup(localizationMap.illustration), items: val.map((v: string) => ({ text: v })), separator: ' / ' };
        } else if (id === 'genre') {
            const val = await WorkPromise.getTags(rjCode);
            if (val && val.length) return { id, title: localizePopup(localizationMap.genre), items: val.map((v: string) => ({ text: v })), separator: ' ' };
        }
      } catch(e) {
          console.warn(`[RJ2Link Debug] Error fetching ${id}:`, e);
      }
      return null;
    });

    const results = await Promise.all(rowPromises);
    console.log("[RJ2Link Debug] row results:", results);
    if (!props.state.display || rjCode !== props.state.rjCode) return;
    
    const validRows = results.filter(Boolean) as any[];
    // Order info rows based on `order`
    const sortedRows = [];
    for (const id of order) {
      const matched = validRows.find(r => r.id === id);
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
</script>

<style scoped>
/* Inherited via UnoCSS / global styles */
</style>
