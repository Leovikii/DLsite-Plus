<template>
  <Transition name="fade">
    <div 
      v-if="state.display"
      ref="popupRef" 
      class="dlsite-plus-popup"
      :class="[isGirls ? 'theme-girls' : 'theme-maniax']"
      :style="positionStyle"
    >
      <div class="popup-close-btn" @click="closePopup">✕</div>

      <div v-if="loading" class="popup-loader">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>

      <div v-else-if="!workFound" class="popup-not-found">
        <div class="error-icon">?</div>
        <div>Work Not Found</div>
        <div class="error-sub">{{ state.rjCode }}</div>
      </div>

      <div v-else class="popup-content">
        <!-- Left Panel: Cover Image -->
        <div class="panel-left">
          <CoverImage :src="imgLink" />
        </div>

        <!-- Right Panel: Information -->
        <div class="panel-right">
          <div 
            class="work-title" 
            :title="titleHint"
            @click="onCopyTitle"
          >
            {{ title || 'Loading...' }}
          </div>
          
          <RJCodeChain 
            :chain="chain" 
            :currentRj="state.rjCode" 
            :isParent="state.isParent"
          />

          <WorkTags :tags="tags" />

          <div class="info-container">
            <InfoRow 
              v-for="row in infoRows" 
              :key="row.id"
              :title="row.title"
              :items="row.items"
              :separator="row.separator"
              :copyHint="copyHint"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import type { PopupState } from '../types';
import { WorkPromise } from '../core/scraper';
import { localizePopup, localizationMap } from '../config/localization';
import { VOICELINK_CLASS } from '../config/constants';

import CoverImage from './components/CoverImage.vue';
import RJCodeChain from './components/RJCodeChain.vue';
import WorkTags from './components/WorkTags.vue';
import InfoRow from './components/InfoRow.vue';

const props = defineProps<{
  state: PopupState;
}>();

const popupRef = ref<HTMLElement | null>(null);

// State variables
const workFound = ref(true);
const loading = ref(true);
const title = ref('');
const imgLink = ref('');
const chain = ref<string[]>([]);
const infoRows = ref<any[]>([]);
const tags = ref<any[]>([]);
const isGirls = ref(false);

const titleHint = computed(() => localizePopup(localizationMap.click_to_copy_title));
const copyHint = computed(() => localizePopup(localizationMap.click_to_copy));

// Calculate position based on mouse click coordinates
const positionStyle = computed(() => {
  // Use fixed positioning relative to viewport
  // Fallback widths
  const width = 650;
  const height = 400; // estimated
  
  let left = props.state.x + 15;
  let top = props.state.y + 15;
  
  // Keep within bounds
  if (typeof window !== 'undefined') {
    if (left + width > window.innerWidth) {
      left = props.state.x - width - 15;
      if (left < 0) left = 10;
    }
    // Very rough height bounding
    if (top + height > window.innerHeight) {
      top = window.innerHeight - height - 10;
      if (top < 0) top = 10;
    }
  }
  
  return {
    left: `${left}px`,
    top: `${top}px`
  };
});

const closePopup = () => {
  props.state.display = false;
};

const onCopyTitle = (e: MouseEvent) => {
  if (title.value && typeof GM_setClipboard !== 'undefined') {
    GM_setClipboard(title.value, 'text');
    const target = e.target as HTMLElement;
    const oldColor = target.style.color;
    target.style.color = '#4ade80';
    setTimeout(() => {
      target.style.color = oldColor;
    }, 500);
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
  isGirls.value = false;

  try {
    let found = await WorkPromise.getFound(rjCode);
    if (!found) {
      // Logic for fallback is in linkage.ts (to be refactored) but for now we'll call getParentRJ
      // Wait, currently scraper.ts is not fully rewritten.
      // I'll keep the logic using the current WorkPromise structure.
    }
    workFound.value = found;
    if (!found) {
      loading.value = false;
      return;
    }
  } catch (e) {
    console.error(e);
  }

  // Fetch parallel data
  Promise.allSettled([
    WorkPromise.getWorkTitle(rjCode).then(t => { if (rjCode === props.state.rjCode) title.value = t; }),
    WorkPromise.getRJChain(rjCode).then(c => { if (rjCode === props.state.rjCode) chain.value = c; }),
    WorkPromise.getImgLink(rjCode).then(link => {
      if (rjCode === props.state.rjCode && typeof link === 'string') imgLink.value = link;
    }),
    WorkPromise.getGirls(rjCode).then(g => { if (rjCode === props.state.rjCode) isGirls.value = !!g; }),
  ]);

  try {
    if (!props.state.display || rjCode !== props.state.rjCode) return;

    // Tags
    const newTags = [];
    const typeText = await WorkPromise.getWorkTypeText(rjCode).catch(() => '');
    if (typeText) newTags.push({ text: typeText, class: `voicelink-tag-orange` });

    const rateAvg = await WorkPromise.getRateAvg(rjCode).catch(() => 0);
    const rateCount = await WorkPromise.getRateCount(rjCode).catch(() => 0);
    if (rateAvg > 0) newTags.push({ text: `${rateAvg.toFixed(2)}★ (${rateCount})`, class: `voicelink-tag-yellow` });
    
    tags.value = newTags;

    // Rows
    const order = [
        "dl_count", "circle_name", "release_date", "age_rating",
        "scenario", "illustration", "voice_actor", "music", "genre", "file_size"
    ];
    
    const rowPromises = order.map(async (id: string) => {
      try {
        if (id === 'circle_name') {
            const val = await WorkPromise.getCircle(rjCode);
            if (val) return { id, title: localizePopup(localizationMap.circle_name), items: [{ text: val }] };
        } else if (id === 'dl_count') {
            const val = await WorkPromise.getDLCount(rjCode);
            if (val) return { id, title: localizePopup(localizationMap.dl_count), items: [{ text: val }] };
        } else if (id === 'voice_actor') {
            const vas = await WorkPromise.getCV(rjCode);
            if (vas && vas.length) return { id, title: localizePopup(localizationMap.voice_actor), items: vas.map((v: string) => ({ text: v })), separator: ' / ' };
        } else if (id === 'age_rating') {
            const val = await WorkPromise.getAgeRating(rjCode);
            if (val) return { id, title: localizePopup(localizationMap.age_rating), items: [{ text: val, class: val.includes('18') ? `voicelink-age-18` : `voicelink-age-all` }] };
        } else if (id === 'file_size') {
            const val = await WorkPromise.getFileSize(rjCode);
            if (val) return { id, title: localizePopup(localizationMap.file_size), items: [{ text: val }] };
        } else if (id === 'release_date') {
            const val = await WorkPromise.getReleaseDate(rjCode);
            if (val && val[0]) return { id, title: localizePopup(localizationMap.release_date), items: [{ text: val[0] }] };
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
      } catch(e) { }
      return null;
    });

    const results = await Promise.all(rowPromises);
    if (!props.state.display || rjCode !== props.state.rjCode) return;
    
    const validRows = results.filter(Boolean) as any[];
    const sortedRows = [];
    for (const id of order) {
      const matched = validRows.find(r => r.id === id);
      if (matched) sortedRows.push(matched);
    }
    infoRows.value = sortedRows;
    
  } catch (e) {
    console.error(e);
  } finally {
    if (rjCode === props.state.rjCode) {
      loading.value = false;
    }
  }
};

watch(() => props.state.rjCode, (newVal) => {
  if (newVal) updatePopupData();
});

watch(() => props.state.display, (newVal) => {
  if (newVal) updatePopupData();
});
</script>

<style scoped>
.dlsite-plus-popup {
  position: fixed;
  z-index: 2147483646;
  width: 650px;
  max-width: 90vw;
  min-height: 250px;
  max-height: 85vh;
  
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: #f1f5f9;
  
  background-color: rgba(30, 41, 59, 0.85); /* Slate 800 */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
  
  padding: 16px;
  box-sizing: border-box;
  
  display: flex;
  flex-direction: column;
}

.theme-maniax {
  /* Subtle tint for Maniax */
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(59, 30, 52, 0.85) 100%);
  border-top: 1px solid rgba(236, 72, 153, 0.3);
}

.theme-girls {
  /* Subtle tint for Girls */
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(59, 41, 30, 0.85) 100%);
  border-top: 1px solid rgba(249, 115, 22, 0.3);
}

.popup-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  z-index: 10;
  transition: all 0.2s ease;
}

.popup-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.popup-content {
  display: flex;
  flex-direction: row;
  height: 100%;
  gap: 20px;
}

.panel-left {
  flex: 0 0 240px;
  display: flex;
  flex-direction: column;
}

.panel-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 8px;
}

/* Custom scrollbar */
.panel-right::-webkit-scrollbar {
  width: 6px;
}
.panel-right::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
.panel-right::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.work-title {
  font-size: 1.4em;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 8px;
  cursor: pointer;
  transition: color 0.2s;
  padding-right: 20px; /* Space for close btn */
}

.work-title:hover {
  color: #93c5fd; /* Blue 300 */
}

.info-container {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Loader */
.popup-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
}

.dot {
  width: 12px;
  height: 12px;
  margin: 0 6px;
  background-color: #fff;
  border-radius: 50%;
  animation: pulse 1.2s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes pulse {
  0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}

/* Not Found */
.popup-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.6);
}

.error-icon {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.2);
}

.error-sub {
  font-family: monospace;
  margin-top: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
  transform-origin: top left;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@media screen and (max-width: 600px) {
  .popup-content {
    flex-direction: column;
  }
  .panel-left {
    flex: 0 0 auto;
    width: 100%;
    margin-bottom: 16px;
  }
  .dlsite-plus-popup {
    width: 95vw;
    left: 2.5vw !important;
  }
}
</style>
