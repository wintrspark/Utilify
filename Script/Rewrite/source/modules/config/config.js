(function() { // config, settings
    'use strict';
    const CONFIG = {
      PANEL_ID: 'utilify_panel',
      STYLE_ID: 'utilify_style',
      STORAGE_KEY: 'UtilifyConfig',
      UPDATE_URL: 'https://raw.githubusercontent.com/gxthickitty/Utilify/main/Script/Rewrite/Utilify.user.js',
      
      defaults: {
        gradient: null,
        gradientAngle: 45,
        gradientColor1: '#3a3a3a',
        gradientColor2: '#2b2a2a',
        fontFamily: null,
        onlineFont: null,
        glassPanels: { enabled: true, radius: 8, hue: 270, alpha: 0.16 },
        onlineStyles: '',
        customCSS: '',
        disableFriendslist: false,
        blurSensitive: false,
        blurComments: false,
        appearOffline: false,
        friendActivity: false,
        playerTypeDisplay: false,
        lazyStreakKeeper: false
      }
    };
  

    const Storage = {
      get(key, fallback) {
        try {
          if (typeof GM_getValue === 'function') return GM_getValue(key, fallback);
          const raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : fallback;
        } catch {
          return fallback;
        }
      },
      
      set(key, value) {
        try {
          if (typeof GM_setValue === 'function') return GM_setValue(key, value);
          localStorage.setItem(key, JSON.stringify(value));
        } catch {}
      },
      
      getConfig() {
        return { ...CONFIG.defaults, ...this.get(CONFIG.STORAGE_KEY, {}) };
      },
      
      saveConfig(cfg) {
        this.set(CONFIG.STORAGE_KEY, cfg);
      }
    };
  

    function getProfileIdFromBootstrap() {
      const scripts = document.querySelectorAll('script');
      for (let script of scripts) {
        if (!script.textContent) continue;
        if (script.textContent.includes('options.bootstrap')) {
          try {
            const match = /options\.bootstrap\s*=\s*({[\s\S]*?});/.exec(script.textContent);
            if (match && match[1]) {
              const options = eval(`(${match[1]})`);
              if (options.current_user?.id) return options.current_user.id;
              if (options.object?.id) return options.object.id;
            }
          } catch {}
        }
      }
      return null;
    }
  
    function debounce(fn, ms) {
      let timer;
      return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), ms);
      };
    }
  
    const Styles = {
      inject(id, css) {
        let el = document.getElementById(id);
        if (!el) {
          el = document.createElement('style');
          el.id = id;
          document.head.appendChild(el);
        }
        el.textContent = css;
        return el;
      },
      
      initBase() {
        this.inject(CONFIG.STYLE_ID, `
          @keyframes sparkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          
          @keyframes shimmer {
            0% { background-position: -100% 0; }
            100% { background-position: 100% 0; }
          }
  
          #${CONFIG.PANEL_ID} {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: min(720px, 94vw);
            max-height: 64vh;
            border-radius: 20px;
            overflow: hidden;
            background: linear-gradient(135deg, #1a1b1e 0%, #252629 50%, #1a1b1e 100%);
            color: #e8e8ee;
            box-shadow: 
              0 0 60px rgba(200, 190, 220, 0.15),
              0 20px 80px rgba(0, 0, 0, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
            z-index: 120000;
            display: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            border: 1px solid rgba(200, 190, 220, 0.2);
            transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0;
            backdrop-filter: blur(20px);
          }
          
          #${CONFIG.PANEL_ID}.visible {
            display: flex;
            flex-direction: column;
            opacity: 1;
          }
  
          #${CONFIG.PANEL_ID}::before {
            content: '';
            position: absolute;
            top: -2px;
            right: -2px;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(255, 192, 203, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            animation: shimmer 4s ease-in-out infinite;
          }
  
          /* Sparkle stars on left border */
          #${CONFIG.PANEL_ID}::after {
            content: '✦';
            position: absolute;
            left: -1px;
            top: 20%;
            color: rgba(255, 192, 203, 0.5);
            font-size: 16px;
            animation: sparkle 2s ease-in-out infinite;
            text-shadow: 0 0 10px rgba(255, 192, 203, 0.8);
          }
  
          .star-1, .star-2, .star-3, .star-4, .star-5, .star-6 {
            position: absolute;
            color: rgba(200, 190, 220, 0.6);
            font-size: 12px;
            animation: sparkle 3s ease-in-out infinite;
            pointer-events: none;
          }
          .star-1 { left: -1px; top: 40%; animation-delay: 0.5s; }
          .star-2 { left: -1px; top: 60%; animation-delay: 1s; font-size: 14px; }
          .star-3 { left: -1px; top: 80%; animation-delay: 1.5s; }
          .star-4 { right: -1px; top: 30%; animation-delay: 0.7s; font-size: 10px; color: rgba(255, 192, 203, 0.5); }
          .star-5 { right: -1px; top: 50%; animation-delay: 1.2s; color: rgba(255, 192, 203, 0.5); }
          .star-6 { right: -1px; top: 70%; animation-delay: 1.8s; font-size: 13px; color: rgba(255, 192, 203, 0.5); }
          
          /* Header sparkles */
          .header-star-1, .header-star-2, .header-star-3 {
            position: absolute;
            color: rgba(255, 192, 203, 0.4);
            font-size: 10px;
            animation: sparkle 2.5s ease-in-out infinite;
            pointer-events: none;
          }
          .header-star-1 { left: 10%; top: 15px; animation-delay: 0.4s; }
          .header-star-2 { left: 30%; top: 12px; animation-delay: 1.1s; }
          .header-star-3 { right: 10%; top: 15px; animation-delay: 0.8s; }
  
          #${CONFIG.PANEL_ID} .header {
            height: 60px;
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 0 24px;
            cursor: grab;
            user-select: none;
            background: linear-gradient(135deg, rgba(40, 42, 48, 0.8) 0%, rgba(30, 32, 38, 0.9) 100%);
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            position: relative;
          }
  
          #${CONFIG.PANEL_ID} .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, 
              transparent 0%, 
              rgba(255, 192, 203, 0.3) 50%, 
              transparent 100%);
          }
  
          #${CONFIG.PANEL_ID} .title {
            font-weight: 500;
            font-size: 12px;
            letter-spacing: 2px;
            color: rgba(200, 190, 220, 0.5);
            text-transform: uppercase;
            flex: 1;
            text-align: center;
            position: relative;
          }
          
          #${CONFIG.PANEL_ID} .title::before,
          #${CONFIG.PANEL_ID} .title::after {
            content: '✦';
            position: absolute;
            color: rgba(255, 192, 203, 0.4);
            font-size: 10px;
            animation: sparkle 2s ease-in-out infinite;
          }
          
          #${CONFIG.PANEL_ID} .title::before {
            left: -16px;
            animation-delay: 0.3s;
          }
          
          #${CONFIG.PANEL_ID} .title::after {
            right: -16px;
            animation-delay: 0.8s;
          }
  
          #${CONFIG.PANEL_ID} .close {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #d8d8de;
            cursor: pointer;
            padding: 8px 12px;
            border-radius: 10px;
            font-size: 18px;
            line-height: 1;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          #${CONFIG.PANEL_ID} .close:hover {
            background: rgba(255, 192, 203, 0.15);
            border-color: rgba(255, 192, 203, 0.3);
            color: #ffc0cb;
            transform: scale(1.05);
          }
  
          #${CONFIG.PANEL_ID} .body {
            display: flex;
            gap: 2px;
            height: calc(64vh - 60px);
            background: rgba(0, 0, 0, 0.2);
            position: relative;
          }
  
          /* Vertical text on right */
          #${CONFIG.PANEL_ID} .body::after {
            content: 'Made by Simon';
            position: absolute;
            right: 12px;
            bottom: 20px;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            font-size: 11px;
            letter-spacing: 2px;
            color: rgba(200, 190, 220, 0.4);
            font-weight: 500;
            text-transform: uppercase;
            pointer-events: none;
          }
  
          #${CONFIG.PANEL_ID} .tabs {
            width: 180px;
            background: linear-gradient(180deg, rgba(30, 32, 38, 0.6) 0%, rgba(20, 22, 28, 0.8) 100%);
            padding: 16px 12px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
  
          #${CONFIG.PANEL_ID} .tab {
            padding: 14px 16px;
            cursor: pointer;
            border-left: 3px solid transparent;
            color: #a8a8b8;
            border-radius: 10px;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 14px;
            font-weight: 500;
            position: relative;
            overflow: hidden;
          }
  
          #${CONFIG.PANEL_ID} .tab::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 192, 203, 0.1) 0%, rgba(200, 190, 220, 0.05) 100%);
            opacity: 0;
            transition: opacity 0.25s ease;
          }
  
          #${CONFIG.PANEL_ID} .tab:hover {
            background: rgba(255, 255, 255, 0.03);
            color: #d8d8e8;
            transform: translateX(4px);
          }
  
          #${CONFIG.PANEL_ID} .tab:hover::before {
            opacity: 1;
          }
  
          #${CONFIG.PANEL_ID} .tab.active {
            background: linear-gradient(135deg, rgba(255, 192, 203, 0.15) 0%, rgba(200, 190, 220, 0.1) 100%);
            border-left-color: #ffc0cb;
            color: #ffc0cb;
            transform: translateX(6px);
            box-shadow: 0 4px 12px rgba(255, 192, 203, 0.2);
            position: relative;
          }
  
          #${CONFIG.PANEL_ID} .tab.active::after {
            content: '✦';
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 192, 203, 0.6);
            font-size: 12px;
            animation: sparkle 2s ease-in-out infinite;
          }
  
          #${CONFIG.PANEL_ID} .tab.active::before {
            opacity: 1;
          }
  
          #${CONFIG.PANEL_ID} .content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
            background: linear-gradient(180deg, rgba(26, 27, 30, 0.95) 0%, rgba(22, 23, 26, 0.98) 100%);
            position: relative;
          }
  
          .field-row {
            margin: 16px 0;
            display: flex;
            gap: 12px;
            align-items: center;
          }
  
          .field-label {
            font-size: 13px;
            color: #c8c8d8;
            min-width: 110px;
            font-weight: 500;
          }
  
          .color-input {
            width: 54px;
            height: 38px;
            border: 2px solid rgba(200, 190, 220, 0.2);
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: rgba(0, 0, 0, 0.3);
          }
          
          .color-input:hover {
            transform: scale(1.05);
            border-color: rgba(255, 192, 203, 0.4);
            box-shadow: 0 4px 16px rgba(255, 192, 203, 0.2);
          }
  
          input[type="text"], input[type="number"], select, textarea {
            padding: 10px 14px;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(200, 190, 220, 0.15);
            border-radius: 10px;
            color: #e8e8ee;
            font-size: 13px;
            transition: all 0.2s ease;
          }
          
          input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: rgba(255, 192, 203, 0.5);
            box-shadow: 0 0 0 3px rgba(255, 192, 203, 0.1);
            background: rgba(0, 0, 0, 0.5);
          }
  
          input[type="range"] {
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: linear-gradient(90deg, rgba(200, 190, 220, 0.2) 0%, rgba(255, 192, 203, 0.4) 100%);
            outline: none;
            -webkit-appearance: none;
          }
          
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ffc0cb 0%, #c8bed8 100%);
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(255, 192, 203, 0.3);
          }
          
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 4px 16px rgba(255, 192, 203, 0.5);
          }
  
          input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: #ffc0cb;
          }
  
          .button {
            padding: 11px 20px;
            background: linear-gradient(135deg, rgba(255, 192, 203, 0.2) 0%, rgba(200, 190, 220, 0.15) 100%);
            color: #ffc0cb;
            border-radius: 10px;
            border: 1px solid rgba(255, 192, 203, 0.3);
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }
  
          .button::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            transform: translate(-50%, -50%);
            transition: width 0.3s ease, height 0.3s ease;
          }
  
          .button:hover::before {
            width: 300px;
            height: 300px;
          }
  
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 192, 203, 0.3);
            border-color: rgba(255, 192, 203, 0.5);
          }
  
          .button:active {
            transform: translateY(0);
          }
  
          .small-note {
            font-size: 12px;
            color: #9898a8;
            margin-top: 8px;
            line-height: 1.6;
          }
  
          label {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            color: #c8c8d8;
            font-size: 14px;
            transition: color 0.2s ease;
          }
  
          label:hover {
            color: #e8e8ee;
          }
  
          /* Scrollbars */
          ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(255, 192, 203, 0.3) 0%, rgba(200, 190, 220, 0.3) 100%);
            border-radius: 5px;
            border: 2px solid transparent;
            background-clip: padding-box;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, rgba(255, 192, 203, 0.5) 0%, rgba(200, 190, 220, 0.5) 100%);
            background-clip: padding-box;
          }
  
          a {
            color: #ffc0cb;
            text-decoration: none;
            transition: color 0.2s ease;
          }
  
          a:hover {
            color: #ffb0bb;
            text-decoration: underline;
          }
        `);
      },
      
      applyGradient(value, angle, c1, c2) {
        if (!value) {
          document.body.style.background = '';
          return;
        }
        document.body.style.background = value;
        document.body.style.backgroundAttachment = 'fixed';
      },
      
      applyPrivacy(cfg) {
        let css = '';
        if (cfg.disableFriendslist) css += `._1Yhgq{display:none!important}\n`;
        if (cfg.blurSensitive) css += `._13UrL .kR267 ._9smi2 ._1rJI8 ._1aUa_{filter:blur(8px);transition:filter .25s ease}\n._13UrL .kR267 ._9smi2 ._1rJI8 ._1aUa_:hover{filter:blur(0)}\n._3zDi-{filter:blur(8px);transition:filter .25s ease}\n._3zDi-:hover{filter:blur(0)}\n._2O_AH{filter:blur(8px);transition:filter .25s ease}\n._2O_AH:hover{filter: blur(0)}\n._3hI0M{filter:blur(8px);transition:filter .25s ease}\n._3hI0M:hover{filter: blur(0)}\n._2IqY6{filter:blur(8px);transition:filter .25s ease}\n._2IqY6:hover{filter: blur(0)}\n.css-1hitfzb{filter:blur(8px);transition:filter .25s ease}\n.css-1hitfzb:hover{filter: blur(0)}`;
        if (cfg.blurComments) css += `._3Wsxf{filter:blur(8px);transition:filter .25s ease}\n._3Wsxf:hover{filter:none}\n`;
        this.inject('utilify_privacy', css);
      },
      
      applyGlass(cfg) {
        if (!cfg.glassPanels?.enabled) {
          this.inject('utilify_glass', '');
          return;
        }
        const { radius, hue, alpha } = cfg.glassPanels;
        this.inject('utilify_glass', `
          ._3TORb ._2E1AL .tRx6U, .css-1wbcikz, .css-wog98n, .css-o4yc28, .css-z05bui, ._1q4mD {
            background-color: hsla(${hue},68%,43%,${alpha}) !important;
            backdrop-filter: blur(6px) !important;
            border-radius: ${radius}px !important;
            transition: all 0.25s ease !important;
          }
          ._3TORb {
            background-color: hsla(${hue},68%,43%,${alpha}) !important;
            border-radius: ${radius}px !important;
            transition: all 0.25s ease !important;            
          }
        `);
      },
      
      applyCustomCSS(css) {
        this.inject('utilify_custom', css || '');
      },
  
      loadOnlineCSS(urls) {
        document.querySelectorAll('link[data-utilify-online]').forEach(el => el.remove());
        if (!urls) return;
        urls.split('\n').map(s => s.trim()).filter(Boolean).forEach(url => {
          try {
            const u = new URL(url);
            const l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = u.href;
            l.dataset.utilifyOnline = '1';
            document.head.appendChild(l);
          } catch {}
        });
      },
  
      applyFont(fontName, fontUrl) {
        document.querySelectorAll('link[data-utilify-font]').forEach(el => el.remove());
        document.querySelectorAll('style[data-utilify-font-style]').forEach(el => el.remove());
        
        if (!fontName || !fontUrl) {
          const st = document.createElement('style');
          st.dataset.utilifyFontStyle = '1';
          st.textContent = `* { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; }`;
          document.head.appendChild(st);
          return;
        }
  
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        link.dataset.utilifyFont = '1';
        document.head.appendChild(link);
  
        // Apply font
        const st = document.createElement('style');
        st.dataset.utilifyFontStyle = '1';
        st.textContent = `* { font-family: '${fontName}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; }`;
        document.head.appendChild(st);
      },
  
      loadOnlineFont(url) {
        if (!url) return;
        try {
          new URL(url);
          const match = url.includes('fonts.googleapis.com') ? (url.match(/family=([^&:]+)/) || [])[1] : null;
          const family = match ? match.replace(/\+/g, ' ') : 'CustomFont';
          this.applyFont(family, url);
        } catch {}
      }
    };
  
const RiskyFeatures = {
    pulseBlocker: { installed: false },
    friendActivity: { timer: null, observer: null, profileId: null },
    playerType: { attached: false, observer: null },
    streakKeeper: { timer: null },

    // Pulse blocker (appear offline)
    installPulseBlocker() {
      if (this.pulseBlocker.installed) return;
      
      window.__utilify_orig_xhr_open = XMLHttpRequest.prototype.open;
      window.__utilify_orig_xhr_send = XMLHttpRequest.prototype.send;
      window.__utilify_orig_fetch = window.fetch;

      XMLHttpRequest.prototype.open = function(method, url) {
        this.__utilify_method = (method || '').toUpperCase();
        this.__utilify_url = typeof url === 'string' ? url : null;
        return window.__utilify_orig_xhr_open.apply(this, arguments);
      };

      XMLHttpRequest.prototype.send = function(body) {
        try {
          if (this.__utilify_method === 'POST' && this.__utilify_url) {
            const u = new URL(this.__utilify_url, location.href);
            if (/^\/user\/\d+\/pulse\/?$/.test(u.pathname)) {
              this.abort && this.abort();
              return;
            }
          }
        } catch {}
        return window.__utilify_orig_xhr_send.apply(this, arguments);
      };

      window.fetch = function(resource, init) {
        try {
          const method = (init?.method || 'GET').toUpperCase();
          if (method === 'POST') {
            const url = resource instanceof Request ? resource.url : resource;
            const u = new URL(url, location.href);
            if (/^\/user\/\d+\/pulse\/?$/.test(u.pathname)) {
              return Promise.resolve(new Response(null, { status: 204 }));
            }
          }
        } catch {}
        return window.__utilify_orig_fetch.apply(this, arguments);
      };

      this.pulseBlocker.installed = true;
    },

    uninstallPulseBlocker() {
      if (!this.pulseBlocker.installed) return;
      if (window.__utilify_orig_xhr_open) XMLHttpRequest.prototype.open = window.__utilify_orig_xhr_open;
      if (window.__utilify_orig_xhr_send) XMLHttpRequest.prototype.send = window.__utilify_orig_xhr_send;
      if (window.__utilify_orig_fetch) window.fetch = window.__utilify_orig_fetch;
      this.pulseBlocker.installed = false;
    },

    // --- Friend Activity Logic (Fixed) ---

    // Cache to store game/project names so we don't spam fetch
    cache: { games: {}, projects: {} },

    async fetchGameTitle(gid) {
      if (this.cache.games[gid]) return this.cache.games[gid];
      try {
        const res = await fetch(`https://www.kogama.com/games/play/${gid}/`);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const title = doc.querySelector('title')?.textContent.split(' - KoGaMa')[0]?.trim() || null;
        if (title) this.cache.games[gid] = title;
        return title;
      } catch { return null; }
    },

    async fetchProjectName(pid) {
      if (this.cache.projects[pid]) return this.cache.projects[pid];
      try {
        const res = await fetch(`https://www.kogama.com/game/${pid}/member`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.data?.length) {
          const name = data.data[0].name;
          this.cache.projects[pid] = name;
          return name;
        }
      } catch {}
      return null;
    },

    updateFriendStatus(name, text) {
      // Updates the DOM text for a specific username
      document.querySelectorAll('._1taAL').forEach(el => {
        const nameEl = el.querySelector('._3zDi-');
        const statusEl = el.querySelector('._40qZj');
        if (nameEl?.textContent?.trim() === name && statusEl) {
          statusEl.textContent = text;
        }
      });
    },

    // The API Fetcher (Restored from your snippet)
    async fetchFriendChat() {
      if (!this.friendActivity.profileId) return;
      try {
        const res = await fetch(`https://www.kogama.com/user/${this.friendActivity.profileId}/friend/chat/`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach(friend => {
            const username = friend.username;
            const loc = friend.location || '/';
            
            // Check for Game
            const gameMatch = loc.match(/\/games\/play\/(\d+)\//);
            if (gameMatch) {
              this.fetchGameTitle(gameMatch[1]).then(title => {
                if (title) this.updateFriendStatus(username, title);
              });
            }

            // Check for Project
            const projectMatch = loc.match(/\/build\/\d+\/project\/(\d+)\//) || loc.match(/\/game\/(\d+)\/member/);
            if (projectMatch) {
              this.fetchProjectName(projectMatch[1]).then(nameText => {
                if (nameText) this.updateFriendStatus(username, nameText);
              });
            }
          });
        }
      } catch (err) {
        console.error('Utilify Friend Fetch Error:', err);
      }
    },

    // Process DOM nodes immediately (in case links exist)
    processFriendEntry(entry) {
      const nameEl = entry.querySelector('._3zDi-');
      if (!nameEl) return;
      const name = nameEl.textContent?.trim();
      
      const statusEl = entry.querySelector('._40qZj');
      // Look for ID in text OR in href
      const loc = statusEl?.textContent?.trim() || entry.querySelector('a[href]')?.getAttribute('href');
      
      if (!loc) return;

      const gameMatch = loc.match(/\/games\/play\/(\d+)\//);
      if (gameMatch) {
        this.fetchGameTitle(gameMatch[1]).then(title => {
          if (title) this.updateFriendStatus(name, title);
        });
        return;
      }

      const projectMatch = loc.match(/\/build\/\d+\/project\/(\d+)\//) || loc.match(/\/game\/(\d+)\/member/);
      if (projectMatch) {
        this.fetchProjectName(projectMatch[1]).then(name => {
          if (name) this.updateFriendStatus(name, name);
        });
      }
    },

    enableFriendActivity() {
      // Prevent double activation
      if (this.friendActivity.observer || this.friendActivity.timer) return;
      
      const profileId = getProfileIdFromBootstrap();
      if (!profileId) return;

      this.friendActivity.profileId = profileId;

      // 1. Initial API Fetch
      this.fetchFriendChat();

      // 2. Start Polling Interval (every 30s)
      this.friendActivity.timer = setInterval(() => {
        this.fetchFriendChat();
      }, 30000);

      // 3. Observer for scrolling/loading DOM elements
      const scanList = (container) => {
        container?.querySelectorAll('._1lvYU, ._1taAL').forEach(node => 
          this.processFriendEntry(node)
        );
      };

      const containers = ['._1Yhgq', '._3Wytz', 'div[role="list"]'];
      let target = null;
      for (const sel of containers) {
        target = document.querySelector(sel);
        if (target) break;
      }

      if (target) {
        scanList(target);
        const mo = new MutationObserver((mutations) => {
          for (const m of mutations) {
             m.addedNodes.forEach(node => {
               if (node.nodeType === 1 && (node.matches?._1lvYU || node.querySelector?._1lvYU)) {
                 this.processFriendEntry(node);
               }
             });
          }
        });
        mo.observe(target, { childList: true, subtree: true });
        this.friendActivity.observer = mo;
      }
    },

    disableFriendActivity() {
      if (this.friendActivity.observer) {
        this.friendActivity.observer.disconnect();
        this.friendActivity.observer = null;
      }
      if (this.friendActivity.timer) {
        clearInterval(this.friendActivity.timer);
        this.friendActivity.timer = null;
      }
    },

    // --- End Friend Activity ---

    // Player Type Display
    async renderPlayerChip(el) {
      if (!el) return;
      try {
        const res = await fetch(location.href);
        const html = await res.text();
        const m = html.match(/playing_now_members["']\s*:\s*(\d+).*?playing_now_tourists["']\s*:\s*(\d+)/s);
        const counts = m ? { members: +m[1], tourists: +m[2] } : { members: 0, tourists: 0 };
        
        el.innerHTML = '';
        el.style.cssText = `
          background: linear-gradient(135deg, rgba(255, 192, 203, 0.15), rgba(200, 190, 220, 0.1));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 192, 203, 0.2);
          border-radius: 12px;
          padding: 8px 16px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #e8e8ee;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          font-size: 13px;
        `;

        const total = counts.members + counts.tourists;
        el.innerHTML = `
          <span style="font-weight:600; color:#ffc0cb;">Global: ${total}</span>
          <span style="color:#c8bed8;">Players: ${counts.members}</span>
          <span style="color:#a8a8b8;">Tourists: ${counts.tourists}</span>
        `;
      } catch {}
    },

    enablePlayerTypeDisplay() {
      if (!location.pathname.includes('/games/play/')) return;
      if (this.playerType.attached) return;

      const selectors = ['.MuiChip-colorPrimary', '.PlayerCountChip', '[data-player-chip]'];
      const findAndRender = () => {
        for (const sel of selectors) {
          const chip = document.querySelector(sel);
          if (chip) {
            this.renderPlayerChip(chip);
            this.playerType.attached = true;
            return true;
          }
        }
        return false;
      };

      if (findAndRender()) return;

      const mo = new MutationObserver(() => {
        if (findAndRender()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
      this.playerType.observer = mo;
    },

    disablePlayerTypeDisplay() {
      if (this.playerType.observer) {
        this.playerType.observer.disconnect();
        this.playerType.observer = null;
      }
      this.playerType.attached = false;
    },

// Lazy Streak Keeper
enableStreakKeeper() {
  if (this.streakKeeper.timer) return;

  const userId = getProfileIdFromBootstrap();
  if (!userId) return;

  const TARGET = 670350173;
  const INTERVAL = 7 * 60 * 60 * 1000;
  const POLL_INTERVAL = 60 * 1000;

  const INITIAL_HISTORY_DELAY_MS = 1000;
  const HISTORY_RETRY_DELAY_MS = 10 * 1000;
  const RESPONSE_WAIT_MS = 3 * 60 * 1000;
  const SECOND_RESPONSE_WAIT_MS = 60 * 1000;

  const MESSAGES = [
    "you are so loved <3",
    "streak check in, hi!",
    "keeping the streak alive <3",
    "quick hello from your streak bot"
  ];

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const postChat = async message => {
    await fetch(`https://www.kogama.com/chat/${userId}/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_profile_id: TARGET, message })
    });
  };

  const fetchHistory = async () => {
    const r = await fetch(
      `https://www.kogama.com/chat/${userId}/history/${TARGET}/`,
      { credentials: 'include' }
    );
    return r.json().catch(() => null);
  };

  const waitForReply = async timeoutMs => {
    const start = Date.now();
    await sleep(INITIAL_HISTORY_DELAY_MS);

    while (Date.now() - start < timeoutMs) {
      try {
        const h = await fetchHistory();
        if (h && Array.isArray(h.data) && h.data[0]?.from_profile_id == TARGET) {
          return h.data[0];
        }
      } catch {}
      await sleep(HISTORY_RETRY_DELAY_MS);
    }
    return null;
  };

  const sendMessage = async () => {
    const lastSent = parseInt(localStorage.getItem('ls_last_sent') || '0');
    if (Date.now() - lastSent < INTERVAL) return;

    try {
      const msg1 = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      await postChat(msg1);
      localStorage.setItem('ls_last_sent', Date.now().toString());

      const reply1 = await waitForReply(RESPONSE_WAIT_MS);
      if (!reply1) return;

      const msg2 = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      await postChat(msg2);

      const reply2 = await waitForReply(SECOND_RESPONSE_WAIT_MS);
      if (!reply2) return;

      const msg3 = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      await postChat(msg3);
    } catch {}
  };

  sendMessage();
  this.streakKeeper.timer = setInterval(sendMessage, POLL_INTERVAL);
},

disableStreakKeeper() {
  if (this.streakKeeper.timer) {
    clearInterval(this.streakKeeper.timer);
    this.streakKeeper.timer = null;
  }
}
};

    const UI = {
      panel: null,
      
      create() {
        if (this.panel) return this.panel;
        
        this.panel = document.createElement('div');
        this.panel.id = CONFIG.PANEL_ID;
        this.panel.innerHTML = `
          <div class="star-1">✦</div>
          <div class="star-2">✧</div>
          <div class="star-3">✦</div>
          <div class="star-4">✧</div>
          <div class="star-5">✦</div>
          <div class="star-6">✧</div>
          <div class="header">
            <div class="header-star-1">✦</div>
            <div class="header-star-2">✧</div>
            <div class="header-star-3">✦</div>
            <div class="title">Utilify V2</div>
            <button class="close" aria-label="Close">×</button>
          </div>
          <div class="body">
            <div class="tabs">
              <div class="tab active" data-tab="gradient">Gradient</div>
              <div class="tab" data-tab="privacy">Privacy</div>
              <div class="tab" data-tab="styles">Styles</div>
              <div class="tab" data-tab="fonts">Fonts</div>
              <div class="tab" data-tab="risky">UAOR</div>
              <div class="tab" data-tab="about">About</div>
            </div>
            <div class="content">
              ${this.renderTabs()}
            </div>
          </div>
        `;
        
        document.body.appendChild(this.panel);
        this.setupEvents();
        this.enableDrag();
        return this.panel;
      },
      
      renderTabs() {
        return `
          <div class="tab-content" id="tab-gradient">
            <div class="field-row">
              <span class="field-label">Angle</span>
              <input id="gradient-angle" type="range" min="0" max="360" value="45" style="flex:1"/>
              <span id="angle-val" style="min-width:40px; text-align:right; color:#ffc0cb;">45°</span>
            </div>
            <div class="field-row">
              <span class="field-label">Color 1</span>
              <input id="color1" class="color-input" type="color" value="#3a3a3a"/>
              <input id="color1hex" type="text" placeholder="#HEX" style="flex:1"/>
            </div>
            <div class="field-row">
              <span class="field-label">Color 2</span>
              <input id="color2" class="color-input" type="color" value="#2b2a2a"/>
              <input id="color2hex" type="text" placeholder="#HEX" style="flex:1"/>
            </div>
            <div class="field-row">
              <span class="field-label">Gradient CSS</span>
              <input id="gradient-input" type="text" placeholder="linear-gradient(...)" style="flex:1"/>
            </div>
            <div class="field-row" style="margin-top:20px;">
              <button id="gradient-apply" class="button">Apply</button>
              <button id="gradient-copy" class="button">Copy CSS</button>
              <button id="gradient-clear" class="button">Clear</button>
            </div>
            <div class="small-note" style="margin-top:12px;">
              Changes apply live as you adjust colors and angle. Paste custom gradient CSS in the input above.
            </div>
          </div>
  
          <div class="tab-content" id="tab-privacy" style="display:none">
            <div class="small-note" style="margin-bottom:20px;">
              Privacy controls to manage your browsing experience.
            </div>
            <div class="field-row">
              <label><input type="checkbox" id="disable-friendslist" /> Hide Friendslist</label>
            </div>
            <div class="field-row">
              <label><input type="checkbox" id="blur-sensitive" /> Blur Sensitive Content</label>
            </div>
            <div class="field-row">
              <label><input type="checkbox" id="blur-comments" /> Blur Comments</label>
            </div>
            <div class="small-note" style="margin-top:16px;">
              Hover over blurred content to reveal it.
            </div>
          </div>
  
          <div class="tab-content" id="tab-styles" style="display:none">
            <div class="field-row">
              <label><input type="checkbox" id="glass-toggle" /> Enable Glass Panels</label>
            </div>
            <div class="field-row">
              <span class="field-label">Border Radius</span>
              <input id="glass-radius" type="number" min="0" max="50" value="8" style="width:80px"/>
              <span style="color:#a8a8b8;">px</span>
            </div>
            <div class="field-row">
              <span class="field-label">Hue</span>
              <input id="glass-hue" type="range" min="0" max="360" value="270" style="flex:1"/>
              <span id="glass-hue-val" style="min-width:40px; text-align:right; color:#ffc0cb;">270</span>
            </div>
            <div class="field-row">
              <span class="field-label">Alpha</span>
              <input id="glass-alpha" type="range" min="1" max="50" value="16" style="flex:1"/>
              <span id="glass-alpha-val" style="min-width:40px; text-align:right; color:#ffc0cb;">16</span>
            </div>
            <div style="margin-top:24px">
              <span class="field-label" style="display:block; margin-bottom:8px;">Online CSS URLs (one per line)</span>
              <textarea id="online-styles" rows="4" style="width:100%; resize:vertical;"></textarea>
            </div>
            <div style="margin-top:16px">
              <span class="field-label" style="display:block; margin-bottom:8px;">Custom CSS</span>
              <textarea id="custom-css" rows="6" style="width:100%; resize:vertical;"></textarea>
            </div>
          </div>
  
          <div class="tab-content" id="tab-fonts" style="display:none">
            <div class="field-row">
              <span class="field-label">Font Family</span>
              <select id="main-font" style="flex:1">
                <option value="default">System Default</option>
                <option value="roboto">Roboto</option>
                <option value="comfortaa">Comfortaa</option>
                <option value="online">Custom Online Font</option>
              </select>
            </div>
            <div class="field-row">
              <span class="field-label">Font URL</span>
              <input id="online-font-url" type="text" placeholder="https://fonts.googleapis.com/..." style="flex:1"/>
            </div>
            <div class="small-note" style="margin-top:16px;">
              For Google Fonts, copy the &lt;link&gt; href URL.
            </div>
          </div>
  
          <div class="tab-content" id="tab-risky" style="display:none">
            <div style="background:rgba(255,100,100,0.1); border:1px solid rgba(255,100,100,0.3); border-radius:10px; padding:16px; margin-bottom:24px;">
              <strong style="color:#ff6b6b;">⚠️ Use At Your Own Risk</strong>
              <p class="small-note" style="margin-top:8px;">These features may potentially violate Terms of Service.</p>
            </div>
            <div class="field-row">
              <label><input type="checkbox" id="appear-offline" /> Appear Offline (blocks pulse requests)</label>
            </div>
            <div class="field-row">
              <label><input type="checkbox" id="friend-activity" /> Friend Activity Monitor</label>
            </div>
            <div class="field-row">
              <label><input type="checkbox" id="player-type" /> Player Type Display</label>
            </div>
            <div class="field-row">
              <label><input type="checkbox" id="lazy-streak" /> Lazy Streak Keeper</label>
            </div>
            <div class="small-note" style="margin-top:16px;">
              Streak Keeper requires friending profile <a href="https://www.kogama.com/profile/670350173/" target="_blank">670350173</a>.
            </div>
          </div>
  
          <div class="tab-content" id="tab-about" style="display:none">
            <div style="text-align:center; padding:20px 0;">
              <h3 style="color:#ffc0cb; margin-bottom:16px; font-size:20px;">✦ Utilify V2 ✦</h3>
              <p class="small-note" style="font-size:13px; line-height:1.8; margin-bottom:24px;">
                Made by Community For Community.<br>
                A project of passion & love.<br><br>
                Fully maintained by <a href="https://www.github.com/gxthickitty/utilify" target="_blank">Simon</a>
              </p>
              <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:20px;">
                <h4 style="color:#c8bed8; font-size:14px; margin-bottom:16px;">Contributors</h4>
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; font-size:13px; color:#a8a8b8;">
                  <div>Death Wolf.</div>
                  <div>Snowy</div>
                  <div>Awoi</div>
                  <div>Selene</div>
                  <div>Tungsten</div>
                  <div>Raptor</div>
                  <div>Comenxo</div>
                  <div>Idealism</div>
                  <div>Sorry</div>
                </div>
                <p class="small-note" style="margin-top:16px;">Thank you to all testers and supporters! ✨</p>
              </div>
            </div>
          </div>
        `;
      },
      
      setupEvents() {
        // Tab switching
        this.panel.querySelectorAll('.tab').forEach(tab => {
          tab.addEventListener('click', () => {
            this.panel.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.panel.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            tab.classList.add('active');
            this.panel.querySelector(`#tab-${tab.dataset.tab}`).style.display = '';
          });
        });
        
        this.panel.querySelector('.close').addEventListener('click', () => this.hide());
        
        // Gradient controls
        const angleInput = this.panel.querySelector('#gradient-angle');
        const angleVal = this.panel.querySelector('#angle-val');
        const color1 = this.panel.querySelector('#color1');
        const color2 = this.panel.querySelector('#color2');
        const color1hex = this.panel.querySelector('#color1hex');
        const color2hex = this.panel.querySelector('#color2hex');
        const gradientInput = this.panel.querySelector('#gradient-input');
  
        let gradientTimeout = null;
        const updateGradientLive = debounce(() => {
          const angle = angleInput.value;
          const c1 = color1.value;
          const c2 = color2.value;
          const grad = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
          
          gradientInput.value = grad;
          Styles.applyGradient(grad, angle, c1, c2);
          
          const cfg = Storage.getConfig();
          cfg.gradient = grad;
          cfg.gradientAngle = angle;
          cfg.gradientColor1 = c1;
          cfg.gradientColor2 = c2;
          Storage.saveConfig(cfg);
        }, 150);
  
        angleInput.addEventListener('input', () => {
          angleVal.textContent = angleInput.value + '°';
          updateGradientLive();
        });
  
        color1.addEventListener('input', () => {
          color1hex.value = color1.value;
          updateGradientLive();
        });
  
        color2.addEventListener('input', () => {
          color2hex.value = color2.value;
          updateGradientLive();
        });
  
        color1hex.addEventListener('change', (e) => {
          const val = e.target.value.trim();
          if (/^#[0-9a-f]{3,6}$/i.test(val)) {
            color1.value = val;
            updateGradientLive();
          }
        });
  
        color2hex.addEventListener('change', (e) => {
          const val = e.target.value.trim();
          if (/^#[0-9a-f]{3,6}$/i.test(val)) {
            color2.value = val;
            updateGradientLive();
          }
        });
  
        gradientInput.addEventListener('input', debounce(() => {
          const val = gradientInput.value.trim();
          if (!val) return;
          const match = val.match(/linear-gradient\((\d+)deg\s*,\s*(#[0-9a-f]{3,6})\s*,\s*(#[0-9a-f]{3,6})\)/i);
          if (match) {
            angleInput.value = match[1];
            angleVal.textContent = match[1] + '°';
            color1.value = match[2];
            color2.value = match[3];
            color1hex.value = match[2];
            color2hex.value = match[3];
            Styles.applyGradient(val, match[1], match[2], match[3]);
            
            const cfg = Storage.getConfig();
            cfg.gradient = val;
            cfg.gradientAngle = match[1];
            cfg.gradientColor1 = match[2];
            cfg.gradientColor2 = match[3];
            Storage.saveConfig(cfg);
          }
        }, 300));
  
        this.panel.querySelector('#gradient-apply').addEventListener('click', updateGradientLive);
        
        this.panel.querySelector('#gradient-copy').addEventListener('click', () => {
          const val = gradientInput.value.trim();
          if (val && navigator.clipboard) {
            navigator.clipboard.writeText(val);
            const btn = this.panel.querySelector('#gradient-copy');
            const orig = btn.textContent;
            btn.textContent = 'Copied! ✓';
            setTimeout(() => btn.textContent = orig, 1500);
          }
        });
        
        this.panel.querySelector('#gradient-clear').addEventListener('click', () => {
          const cfg = Storage.getConfig();
          cfg.gradient = null;
          Storage.saveConfig(cfg);
          Styles.applyGradient(null);
          gradientInput.value = '';
        });
        
        // Privacy toggles
        ['disable-friendslist', 'blur-sensitive', 'blur-comments'].forEach(id => {
          this.panel.querySelector(`#${id}`).addEventListener('change', (e) => {
            const cfg = Storage.getConfig();
            const key = id.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
            cfg[key] = e.target.checked;
            Storage.saveConfig(cfg);
            Styles.applyPrivacy(cfg);
          });
        });
        
        // Glass panels
        this.panel.querySelector('#glass-toggle').addEventListener('change', (e) => {
          const cfg = Storage.getConfig();
          cfg.glassPanels.enabled = e.target.checked;
          Storage.saveConfig(cfg);
          Styles.applyGlass(cfg);
        });
  
        this.panel.querySelector('#glass-radius').addEventListener('change', (e) => {
          const cfg = Storage.getConfig();
          cfg.glassPanels.radius = parseInt(e.target.value) || 8;
          Storage.saveConfig(cfg);
          Styles.applyGlass(cfg);
        });
        
        const hueInput = this.panel.querySelector('#glass-hue');
        const hueVal = this.panel.querySelector('#glass-hue-val');
        const alphaInput = this.panel.querySelector('#glass-alpha');
        const alphaVal = this.panel.querySelector('#glass-alpha-val');
        
        hueInput.addEventListener('input', debounce(() => {
          hueVal.textContent = hueInput.value;
          const cfg = Storage.getConfig();
          cfg.glassPanels.hue = parseInt(hueInput.value);
          Storage.saveConfig(cfg);
          Styles.applyGlass(cfg);
        }, 150));
  
        alphaInput.addEventListener('input', debounce(() => {
          alphaVal.textContent = alphaInput.value;
          const cfg = Storage.getConfig();
          cfg.glassPanels.alpha = parseInt(alphaInput.value) / 100;
          Storage.saveConfig(cfg);
          Styles.applyGlass(cfg);
        }, 150));
  
        this.panel.querySelector('#online-styles').addEventListener('change', (e) => {
          const cfg = Storage.getConfig();
          cfg.onlineStyles = e.target.value;
          Storage.saveConfig(cfg);
          Styles.loadOnlineCSS(cfg.onlineStyles);
        });
        
        this.panel.querySelector('#custom-css').addEventListener('change', (e) => {
          const cfg = Storage.getConfig();
          cfg.customCSS = e.target.value;
          Storage.saveConfig(cfg);
          Styles.applyCustomCSS(cfg.customCSS);
        });
  
        this.panel.querySelector('#main-font').addEventListener('change', (e) => {
          const cfg = Storage.getConfig();
          cfg.fontFamily = e.target.value;
          Storage.saveConfig(cfg);
          
          if (e.target.value === 'roboto') {
            Styles.applyFont('Roboto', 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
          } else if (e.target.value === 'comfortaa') {
            Styles.applyFont('Comfortaa', 'https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;700&display=swap');
          } else if (e.target.value === 'online' && cfg.onlineFont) {
            Styles.loadOnlineFont(cfg.onlineFont);
          } else {
            Styles.applyFont(null, null);
          }
        });
  
        this.panel.querySelector('#online-font-url').addEventListener('change', (e) => {
          const cfg = Storage.getConfig();
          cfg.onlineFont = e.target.value;
          Storage.saveConfig(cfg);
          if (e.target.value && cfg.fontFamily === 'online') {
            Styles.loadOnlineFont(e.target.value);
          }
        });
  
        // Risky features
        this.panel.querySelector('#appear-offline').addEventListener('change', (e) => {
          const cfg = Storage.getConfig();
          cfg.appearOffline = e.target.checked;
          Storage.saveConfig(cfg);
          e.target.checked ? RiskyFeatures.installPulseBlocker() : RiskyFeatures.uninstallPulseBlocker();
        });
  
        this.panel.querySelector('#friend-activity').addEventListener('change', (e) => {
          const cfg = Storage.getConfig();
          cfg.friendActivity = e.target.checked;
          Storage.saveConfig(cfg);
          e.target.checked ? RiskyFeatures.enableFriendActivity() : RiskyFeatures.disableFriendActivity();
        });
  
        this.panel.querySelector('#player-type').addEventListener('change', (e) => {
          const cfg = Storage.getConfig();
          cfg.playerTypeDisplay = e.target.checked;
          Storage.saveConfig(cfg);
          e.target.checked ? RiskyFeatures.enablePlayerTypeDisplay() : RiskyFeatures.disablePlayerTypeDisplay();
        });
  
        this.panel.querySelector('#lazy-streak').addEventListener('change', (e) => {
          const cfg = Storage.getConfig();
          cfg.lazyStreakKeeper = e.target.checked;
          Storage.saveConfig(cfg);
          e.target.checked ? RiskyFeatures.enableStreakKeeper() : RiskyFeatures.disableStreakKeeper();
        });
      },
      
      enableDrag() {
        const header = this.panel.querySelector('.header');
        let isDragging = false;
        let startX = 0, startY = 0, startLeft = 0, startTop = 0;
        
        header.addEventListener('mousedown', (e) => {
          if (e.target.closest('.close')) return;
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;
          const rect = this.panel.getBoundingClientRect();
          startLeft = rect.left;
          startTop = rect.top;
          header.style.cursor = 'grabbing';
          this.panel.style.transition = 'none';
        });
        
        document.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          this.panel.style.left = (startLeft + dx) + 'px';
          this.panel.style.top = (startTop + dy) + 'px';
          this.panel.style.transform = 'none';
        });
        
        document.addEventListener('mouseup', () => {
          if (!isDragging) return;
          isDragging = false;
          header.style.cursor = '';
          setTimeout(() => {
            this.panel.style.transition = '';
          }, 50);
        });
      },
      
      show() {
        this.panel.classList.add('visible');
        const cfg = Storage.getConfig();
        this.loadConfig(cfg);
      },
      
      hide() {
        this.panel.classList.remove('visible');
      },
      
      loadConfig(cfg) {
        this.panel.querySelector('#gradient-angle').value = cfg.gradientAngle;
        this.panel.querySelector('#angle-val').textContent = cfg.gradientAngle + '°';
        this.panel.querySelector('#color1').value = cfg.gradientColor1;
        this.panel.querySelector('#color2').value = cfg.gradientColor2;
        this.panel.querySelector('#color1hex').value = cfg.gradientColor1;
        this.panel.querySelector('#color2hex').value = cfg.gradientColor2;
        this.panel.querySelector('#gradient-input').value = cfg.gradient || `linear-gradient(${cfg.gradientAngle}deg, ${cfg.gradientColor1}, ${cfg.gradientColor2})`;
        this.panel.querySelector('#disable-friendslist').checked = cfg.disableFriendslist;
        this.panel.querySelector('#blur-sensitive').checked = cfg.blurSensitive;
        this.panel.querySelector('#blur-comments').checked = cfg.blurComments;
        this.panel.querySelector('#glass-toggle').checked = cfg.glassPanels.enabled;
        this.panel.querySelector('#glass-radius').value = cfg.glassPanels.radius;
        this.panel.querySelector('#glass-hue').value = cfg.glassPanels.hue;
        this.panel.querySelector('#glass-hue-val').textContent = cfg.glassPanels.hue;
        this.panel.querySelector('#glass-alpha').value = Math.round((cfg.glassPanels.alpha || 0.16) * 100);
        this.panel.querySelector('#glass-alpha-val').textContent = Math.round((cfg.glassPanels.alpha || 0.16) * 100);
        this.panel.querySelector('#online-styles').value = cfg.onlineStyles;
        this.panel.querySelector('#custom-css').value = cfg.customCSS;
        this.panel.querySelector('#main-font').value = cfg.fontFamily || 'default';
        this.panel.querySelector('#online-font-url').value = cfg.onlineFont || '';
        this.panel.querySelector('#appear-offline').checked = cfg.appearOffline;
        this.panel.querySelector('#friend-activity').checked = cfg.friendActivity;
        this.panel.querySelector('#player-type').checked = cfg.playerTypeDisplay;
        this.panel.querySelector('#lazy-streak').checked = cfg.lazyStreakKeeper;
      }
    };

    function createSettingsButton() {
      const btn = document.createElement('button');
      btn.id = 'utilify_settings_btn';
      btn.setAttribute('aria-label', 'Open Utilify Settings');
      btn.innerHTML = '✦';
      btn.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(255, 192, 203, 0.3), rgba(200, 190, 220, 0.3));
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 192, 203, 0.4);
        color: #ffc0cb;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(255, 192, 203, 0.3);
        z-index: 119999;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.1) rotate(90deg)';
        btn.style.boxShadow = '0 6px 30px rgba(255, 192, 203, 0.5)';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1) rotate(0deg)';
        btn.style.boxShadow = '0 4px 20px rgba(255, 192, 203, 0.3)';
      });
      
      btn.addEventListener('click', () => UI.show());
      document.body.appendChild(btn);
    }
  
    function init() {
      Styles.initBase();
      UI.create();
      createSettingsButton();
      
      const cfg = Storage.getConfig();
      Styles.applyGradient(cfg.gradient);
      Styles.applyPrivacy(cfg);
      Styles.applyGlass(cfg);
      Styles.applyCustomCSS(cfg.customCSS);
      Styles.loadOnlineCSS(cfg.onlineStyles);
  
      if (cfg.fontFamily === 'roboto') {
        Styles.applyFont('Roboto', 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
      } else if (cfg.fontFamily === 'comfortaa') {
        Styles.applyFont('Comfortaa', 'https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;700&display=swap');
      } else if (cfg.fontFamily === 'online' && cfg.onlineFont) {
        Styles.loadOnlineFont(cfg.onlineFont);
      }
  
      if (cfg.appearOffline) RiskyFeatures.installPulseBlocker();
      if (cfg.friendActivity) RiskyFeatures.enableFriendActivity();
      if (cfg.playerTypeDisplay) RiskyFeatures.enablePlayerTypeDisplay();
      if (cfg.lazyStreakKeeper) RiskyFeatures.enableStreakKeeper();
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }

    window.addEventListener('beforeunload', () => {
      RiskyFeatures.disableFriendActivity();
      RiskyFeatures.disablePlayerTypeDisplay();
      RiskyFeatures.disableStreakKeeper();
    });
  })();
