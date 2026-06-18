import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import UnoCSS from 'unocss/vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'DLsite Plus',
        namespace: 'Leovikii',
        author: 'Leovikii',
        description: {
          '': 'Extract RJ codes on South Plus forums, automatically fetch and display DLSite work information.',
          'zh': '在南+论坛提取RJ号，自动获取并显示DLSite作品信息。',
          'zh-CN': '在南+论坛提取RJ号，自动获取并显示DLSite作品信息。'
        },
        match: [
          '*://*.south-plus.net/read.php*',
          '*://*.south-plus.net/thread.php*',
          '*://*.south-plus.net/thread_new.php*',
          '*://*.spring-plus.net/read.php*',
          '*://*.spring-plus.net/thread.php*',
          '*://*.spring-plus.net/thread_new.php*',
          '*://*.level-plus.net/read.php*',
          '*://*.level-plus.net/thread.php*',
          '*://*.level-plus.net/thread_new.php*',
          '*://*.imoutolove.me/read.php*',
          '*://*.imoutolove.me/thread.php*',
          '*://*.imoutolove.me/thread_new.php*'
        ],
        version: '1.0.0',
        connect: [
          'dlsite.com',
          'media.ci-en.jp',
          '*'
        ],
        grant: [
          'GM_setClipboard',
          'GM_openInTab',
          'GM_setValue',
          'GM_getValue',
          'GM_deleteValue',
          'GM_addElement',
          'GM.xmlHttpRequest',
          'GM_xmlhttpRequest'
        ],
        'run-at': 'document-start',

      },
    }),
  ],
});
