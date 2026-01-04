// ==UserScript==
// @name         Unstable Utilify V3
// @namespace    wee woo wee woo
// @version      1.1.1
// @description  Slowly rewriting this addon because I want to feel useful.
// @author       Simon
// @match        *://www.kogama.com/*
// @icon         https://avatars.githubusercontent.com/u/143356794?v=4
// @grant        GM_info
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @connect      fonts.googleapis.com
// @connect      kogama.com
// @connect      kogama.com.br
// @run-at       document-start
// ==/UserScript==
(() => {
  "use strict";

  const STATE = { query: "" };

  const SEL = {
    toolbar: "div._6cutH",
    listRoot: "div._1Yhgq",
    item: "div._1lvYU",
    name: "div._3zDi-"
  };

  const applyFilter = () => {
    const q = STATE.query;
    document.querySelectorAll(SEL.item).forEach(item => {
      const name =
        item.querySelector(SEL.name)?.textContent.toLowerCase() ?? "";
      const visible = name.includes(q);
      item.hidden = !visible;
      item.style.opacity = visible ? "1" : "0";
      item.style.transform = visible ? "translateY(0)" : "translateY(-4px)";
      item.style.transition = "opacity 160ms ease, transform 160ms ease";
      item.style.pointerEvents = visible ? "auto" : "none";
    });
  };

  const injectSearchBar = toolbar => {
    if (toolbar.querySelector("#kogama-friend-filter")) return;

    const input = document.createElement("input");
    input.id = "kogama-friend-filter";
    input.type = "search";
    input.placeholder = "Filter friends";

    Object.assign(input.style, {
      marginLeft: "12px",
      padding: "6px 10px",
      height: "32px",
      minWidth: "180px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.15)",
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      color: "#fff",
      fontSize: "13px",
      outline: "none",
      transition: "background 180ms ease, box-shadow 180ms ease"
    });

    input.addEventListener("focus", () => {
      input.style.background = "rgba(255,255,255,0.12)";
      input.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.25)";
    });

    input.addEventListener("blur", () => {
      input.style.background = "rgba(255,255,255,0.08)";
      input.style.boxShadow = "none";
    });

    input.addEventListener("input", e => {
      STATE.query = e.target.value.trim().toLowerCase();
      applyFilter();
    });

    toolbar.appendChild(input);
  };

  const observeFriendsList = root => {
    if (root.__filterObserver) return;
    root.__filterObserver = true;

    new MutationObserver(applyFilter).observe(root, {
      childList: true,
      subtree: true
    });
  };

  const observeToolbar = parent => {
    new MutationObserver(() => {
      const toolbar = parent.querySelector(SEL.toolbar);
      if (!toolbar) return;
      injectSearchBar(toolbar);
    }).observe(parent, { childList: true, subtree: true });
  };

  const bootstrap = () => {
    const listRoot = document.querySelector(SEL.listRoot);
    if (!listRoot) return;

    observeFriendsList(listRoot);
    observeToolbar(listRoot.parentElement);
    applyFilter();
  };

  new MutationObserver(bootstrap).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();

(() => {
  'use strict';

  const WHITELISTED_DOMAINS = ['youtube.com', 'youtu.be'];
  const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?([\w.-]+(?:\.[\w.-]+)+)(?:\/[\w-./?%=&]*)?/gi;

  const STYLE = `
.obf-wrap{position:relative;display:inline-block;width:100%}
.obf-btn{
  position:absolute;
  right:6px;
  top:50%;
  transform:translateY(-50%);
  width:22px;
  height:22px;
  border-radius:6px;
  background:#111;
  border:1px solid #2a2a2a;
  color:#bdbdbd;
  font-size:12px;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  transition:background .15s,color .15s,opacity .15s;
}
.obf-btn:hover{background:#1a1a1a;color:#fff}
.obf-btn[data-off="1"]{opacity:.4}
`;

  const styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  const isTextInput = el =>
    el &&
    (el.tagName === 'TEXTAREA' ||
      (el.tagName === 'INPUT' &&
        ['text','search','url','email','tel','password'].includes(el.type)));

  const isWhitelisted = d =>
    WHITELISTED_DOMAINS.some(w => d === w || d.endsWith('.' + w));

  const obfuscate = (text, enabled) =>
    enabled
      ? text.replace(URL_REGEX, (m, d) =>
          isWhitelisted(d) ? m : m.replace(/\./g, '%2E'))
      : text;

  const enhanceInput = input => {
    if (!isTextInput(input) || input.dataset.obfInit) return;
    input.dataset.obfInit = '1';
    input._disableObfuscation = false;

    const wrap = document.createElement('div');
    wrap.className = 'obf-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'obf-btn';
    btn.textContent = '⚡';
    wrap.appendChild(btn);

    const pr = parseInt(getComputedStyle(input).paddingRight || 0, 10);
    input.style.paddingRight = pr + 26 + 'px';

    btn.onclick = () => {
      input._disableObfuscation = !input._disableObfuscation;
      btn.dataset.off = input._disableObfuscation ? '1' : '0';
    };

    input.value = obfuscate(input.value, true);
  };

  document.addEventListener('input', e => {
    const t = e.target;
    if (!isTextInput(t) || t._disableObfuscation) return;
    if (e.inputType !== 'insertText' || !e.data) return;
    const s = t.selectionStart;
    const v = obfuscate(t.value, true);
    if (v !== t.value) {
      t.value = v;
      t.setSelectionRange(s, s);
    }
  }, true);

  document.addEventListener('paste', e => {
    if (!isTextInput(e.target)) return;
    e.preventDefault();
    const t = (e.clipboardData || window.clipboardData).getData('text');
    document.execCommand('insertText', false, t);
  }, true);

  const scan = root =>
    root.querySelectorAll?.('input,textarea').forEach(enhanceInput);

  scan(document);

  new MutationObserver(m =>
    m.forEach(r =>
      r.addedNodes.forEach(n => {
        if (n instanceof HTMLElement) {
          enhanceInput(n);
          scan(n);
        }
      })
    )
  ).observe(document.body, { childList: true, subtree: true });
})();


(async function() {
    "use strict";

    const SNOWFLAKE_SVGS = [
        "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="white" d="M50,10 L55,45 L50,50 L45,45 Z M50,90 L55,55 L50,50 L45,55 Z M10,50 L45,55 L50,50 L45,45 Z M90,50 L55,55 L50,50 L55,45 Z M25,25 L45,45 L50,40 L40,30 Z M75,75 L55,55 L50,60 L60,70 Z M75,25 L55,45 L60,50 L70,40 Z M25,75 L45,55 L40,50 L30,60 Z"/><circle cx="50" cy="50" r="8" fill="white"/></svg>`),
        "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="white"><rect x="47" y="5" width="6" height="90" rx="2"/><rect x="5" y="47" width="90" height="6" rx="2"/><rect x="47" y="5" width="6" height="90" rx="2" transform="rotate(45 50 50)"/><rect x="47" y="5" width="6" height="90" rx="2" transform="rotate(-45 50 50)"/><circle cx="50" cy="50" r="10"/></g></svg>`)
    ];

    const ROSE_SVG = "data:image/svg+xml," + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <path fill="#b3001b" d="M50 15c-15 0-25 10-25 22 0 10 7 18 17 20-4 6-6 10-6 15 0 7 6 13 14 13s14-6 14-13c0-5-2-9-6-15 10-2 17-10 17-20 0-12-10-22-25-22z"/>
        </svg>
    `);

    const AVAILABLE_FILTERS = ["rain", "snow", "fireflies", "roses", "ivy", "blur"];

    const waitForElement = async (sel, timeout = 10000) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const el = document.querySelector(sel);
            if (el) return el;
            await new Promise(r => requestAnimationFrame(r));
        }
        throw new Error(`Element ${sel} not found`);
    };

    let tooltip = null;
    function showTooltip(target) {
        if (tooltip) return;
        tooltip = document.createElement("div");
        Object.assign(tooltip.style, {
            position: "fixed",
            zIndex: "10000",
            background: "rgba(20,20,20,0.95)",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #555",
            fontSize: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            pointerEvents: "none",
            transition: "opacity 0.2s",
            backdropFilter: "blur(5px)",
            fontFamily: "sans-serif"
        });
        tooltip.innerHTML = `<strong style="color:#00e5ff;">Available Effects:</strong><br>${AVAILABLE_FILTERS.join(", ")}`;
        document.body.appendChild(tooltip);
        updateTooltipPos(target);
    }

    function updateTooltipPos(target) {
        if (!tooltip) return;
        const r = target.getBoundingClientRect();
        tooltip.style.left = r.left + "px";
        tooltip.style.top = (r.top - 55) + "px";
    }

    function removeTooltip() {
        if (tooltip) {
            tooltip.remove();
            tooltip = null;
        }
    }

    class ParticleSystem {
        constructor(targetEl) {
            this.target = targetEl;
            this.canvas = document.createElement("canvas");
            this.ctx = this.canvas.getContext("2d", { alpha: true });
            this.dpr = window.devicePixelRatio || 1;
            this.particles = [];
            this.container = document.createElement("div");
            Object.assign(this.container.style, {
                position: "absolute",
                pointerEvents: "none",
                zIndex: "9",
                overflow: "hidden"
            });
            this.canvas.style.width = "100%";
            this.canvas.style.height = "100%";
            this.container.appendChild(this.canvas);
            document.body.appendChild(this.container);
            this.observer = new ResizeObserver(() => this.resize());
            this.observer.observe(this.target);
            this.loop = this.loop.bind(this);
        }

        resize() {
            const r = this.target.getBoundingClientRect();
            this.container.style.top = r.top + scrollY + "px";
            this.container.style.left = r.left + scrollX + "px";
            this.container.style.width = r.width + "px";
            this.container.style.height = r.height + "px";
            this.w = r.width;
            this.h = r.height;
            this.canvas.width = this.w * this.dpr;
            this.canvas.height = this.h * this.dpr;
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        }

        start() {
            this.resize();
            this.initParticles();
            requestAnimationFrame(this.loop);
            addEventListener("scroll", () => this.resize());
        }

        loop() {
            if (!document.contains(this.container)) return;
            this.ctx.clearRect(0, 0, this.w, this.h);
            this.updateAndDraw();
            requestAnimationFrame(this.loop);
        }
    }

    class RainSystem extends ParticleSystem {
        initParticles() {
            for (let i = 0; i < 50; i++) this.particles.push(this.reset({}));
        }
        reset(p) {
            p.x = Math.random() * this.w;
            p.y = Math.random() * -this.h;
            p.z = Math.random() * 0.5 + 0.5;
            p.len = Math.random() * 15 + 10;
            p.vy = (Math.random() * 6 + 10) * p.z;
            return p;
        }
        updateAndDraw() {
            this.ctx.lineWidth = 1.2;
            this.ctx.lineCap = "round";
            this.ctx.strokeStyle = "rgba(255,255,255,0.35)";
            this.ctx.beginPath();
            for (const p of this.particles) {
                p.y += p.vy;
                if (p.y > this.h + p.len) this.reset(p);
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x, p.y + p.len * p.z);
            }
            this.ctx.stroke();
        }
    }

    class SnowSystem extends ParticleSystem {
        constructor(target) {
            super(target);
            this.imgs = SNOWFLAKE_SVGS.map(s => {
                const i = new Image();
                i.src = s;
                return i;
            });
            this.start();
        }
        initParticles() {
            for (let i = 0; i < 400; i++) this.particles.push(this.reset({}));
        }
        reset(p) {
            p.x = Math.random() * this.w;
            p.y = Math.random() * -this.h;
            p.z = Math.random() * 0.5 + 0.5;
            p.size = (Math.random() * 12 + 10) * p.z;
            p.vy = (Math.random() * 0.7 + 0.4) * p.z;
            p.sway = Math.random() * 0.06;
            p.swayOff = Math.random() * 6;
            p.rot = Math.random() * 360;
            p.img = this.imgs[Math.floor(Math.random() * this.imgs.length)];
            p.alpha = 0.5;
            return p;
        }
        updateAndDraw() {
            for (const p of this.particles) {
                p.y += p.vy;
                p.swayOff += p.sway;
                p.x += Math.sin(p.swayOff) * 0.5;
                p.rot += 0.4;
                if (p.y > this.h + 20) this.reset(p);
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rot * Math.PI / 180);
                this.ctx.globalAlpha = p.alpha;
                if (p.img.complete) this.ctx.drawImage(p.img, -p.size/2, -p.size/2, p.size, p.size);
                this.ctx.restore();
            }
        }
    }

    class FireflySystem extends ParticleSystem {
        constructor(target) {
            super(target);
            this.start();
        }
        initParticles() {
            for (let i = 0; i < 60; i++) this.particles.push(this.reset({}));
        }
        reset(p) {
            p.x = Math.random() * this.w;
            p.y = Math.random() * this.h;
            p.vx = (Math.random() - 0.5) * 0.6;
            p.vy = (Math.random() - 0.5) * 0.6;
            p.phase = Math.random() * Math.PI * 2;
            p.size = Math.random() * 1.8 + 1.2;
            return p;
        }
        updateAndDraw() {
            for (const p of this.particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.phase += 0.06;
                if (p.x < 0 || p.x > this.w) p.vx *= -1;
                if (p.y < 0 || p.y > this.h) p.vy *= -1;
                const g = (Math.sin(p.phase) + 1) / 2;
                this.ctx.shadowBlur = 18 * g;
                this.ctx.shadowColor = "rgba(255,255,160,1)";
                this.ctx.fillStyle = `rgba(255,255,180,${0.35 + g * 0.6})`;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size + g * 1.5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    class RoseSystem extends ParticleSystem {
        constructor(target) {
            super(target);
            this.img = new Image();
            this.img.src = ROSE_SVG;
            this.start();
        }
        initParticles() {
            for (let i = 0; i < 45; i++) this.particles.push(this.reset({}));
        }
        reset(p) {
            p.x = Math.random() * this.w;
            p.y = Math.random() * -this.h;
            p.vy = Math.random() * 0.6 + 0.4;
            p.vx = Math.sin(Math.random() * Math.PI * 2) * 0.4;
            p.rot = Math.random() * 360;
            p.size = Math.random() * 14 + 12;
            return p;
        }
        updateAndDraw() {
            for (const p of this.particles) {
                p.y += p.vy;
                p.x += p.vx;
                p.rot += 0.3;
                if (p.y > this.h + 30) this.reset(p);
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rot * Math.PI / 180);
                this.ctx.drawImage(this.img, -p.size/2, -p.size/2, p.size, p.size);
                this.ctx.restore();
            }
        }
    }

    function applyIvy(target) {
        const ivy = document.createElement("div");
        ivy.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,20 C20,10 40,30 60,20 80,10 100,25 100,25" stroke="#2f6b3c" stroke-width="2" fill="none"/><path d="M0,80 C25,70 50,90 75,80 90,75 100,85 100,85" stroke="#2f6b3c" stroke-width="2" fill="none"/></svg>`;
        Object.assign(ivy.style, {
            position: "absolute",
            pointerEvents: "none",
            opacity: "0.9",
            zIndex: "10000",
            animation: "ivySway 6s ease-in-out infinite alternate"
        });
        const s = document.createElement("style");
        s.textContent = `@keyframes ivySway{from{transform:rotate(-0.3deg)}to{transform:rotate(0.3deg)}}`;
        document.head.appendChild(s);
        document.body.appendChild(ivy);
        const r = target.getBoundingClientRect();
        ivy.style.top = r.top + scrollY + "px";
        ivy.style.left = r.left + scrollX + "px";
        ivy.style.width = r.width + "px";
        ivy.style.height = r.height + "px";
    }

    async function fetchImage(id) {
        try {
            const r = await fetch(`https://www.kogama.com/games/play/${id}/`);
            const h = await r.text();
            const j = JSON.parse(h.match(/options\.bootstrap\s*=\s*({.*?});/s)[1]);
            return j.object?.images?.large || Object.values(j.object?.images || {})[0] || "";
        } catch {
            return "";
        }
    }

    async function fetchImgur(id) {
        for (const ext of ["png", "jpg", "gif"]) {
            const url = `https://i.imgur.com/${id}.${ext}`;
            try {
                const r = await fetch(url, { method: "HEAD" });
                if (r.ok) return url;
            } catch {}
        }
        return "";
    }

    async function applyEffects() {
        try {
            const d = await waitForElement("div._1aUa_");
            const m = /(?:\|\|)?Background:\s*(?:i-([a-zA-Z0-9]+)|(\d+))(?:,\s*filter:\s*([a-z, ]+))?/i.exec(d.textContent || "");
            if (!m) return;
            const img = m[1] ? await fetchImgur(m[1]) : await fetchImage(m[2]);
            const b = document.querySelector("._33DXe");
            if (!b || !img) return;
            b.style.transition = "opacity 0.28s ease-in";
            b.style.opacity = "0.9";
            b.style.backgroundImage = `url("${img}")`;
            b.style.backgroundSize = "cover";
            b.style.backgroundPosition = "center";
            b.style.backgroundRepeat = "no-repeat";
            b.style.position = "absolute";
            b.style.filter = "blur(3px)";
            b.style.zIndex = "1";
            if (m[3]) {
                m[3].split(",").map(s => s.trim().toLowerCase()).forEach(f => {
                    if (f === "rain") new RainSystem(b).start();
                    if (f === "snow") new SnowSystem(b);
                    if (f === "fireflies") new FireflySystem(b);
                    if (f === "roses") new RoseSystem(b);
                    if (f === "ivy") applyIvy(b);
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    const inputObserver = new MutationObserver(() => {
        const area = document.querySelector("textarea#description");
        if (area && !area._monitored) {
            area._monitored = true;
            area.addEventListener("input", e => {
                if (e.target.value.toLowerCase().includes("filter:")) showTooltip(e.target);
                else removeTooltip();
            });
            area.addEventListener("blur", removeTooltip);
        }
    });

    inputObserver.observe(document.body, { childList: true, subtree: true });

    if (document.readyState === "loading") addEventListener("DOMContentLoaded", applyEffects);
    else applyEffects();

})();


(async () => { // Profile Banner & Gradient - Utilify Exclusive
  "use strict";

  const waitForElement = selector => new Promise(resolve => {
    const f = () => {
      const el = document.querySelector(selector);
      el ? resolve(el) : requestAnimationFrame(f);
    };
    f();
  });

  try {
    const descEl = await waitForElement("[itemprop='description'], div._1aUa_");
    const text = descEl.textContent.trim();

    const usernameEl = document.querySelector("div._2IqY6 > h1") ||
                       document.querySelector("div._1wqQ3 > h1") ||
                       document.querySelector("h1");

    if (!usernameEl) {
      console.log("Username element not found");
      return;
    }

    // Banner parsing
    const bannerMatch = /banner:\s*['"“”]([^'"“”]+)['"“”],\s*#([0-9a-f]{6});/i.exec(text);
    if (bannerMatch) {
      const [_, bannerTextRaw, bannerColor] = bannerMatch;
      const bannerText = bannerTextRaw.trim();

      if (bannerText) {
        const bannerWrapper = document.createElement("div");
        Object.assign(bannerWrapper.style, {
          display: "flex",
          alignItems: "center",
          margin: "1px 0 10px",
          zIndex: "10",
        });

        const separator = document.createElement("div");
        separator.textContent = "|";
        Object.assign(separator.style, {
          color: `#${bannerColor}`,
          fontSize: ".75em",
          display: "inline-block",
          marginRight: "5px",
        });

        const bannerTextEl = document.createElement("div");
        bannerTextEl.textContent = bannerText;
        Object.assign(bannerTextEl.style, {
          color: `#${bannerColor}`,
          fontWeight: 600,
          fontSize: ".75em",
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
        });

        bannerWrapper.append(separator, bannerTextEl);

        const headerContainer = usernameEl.closest('div._2IqY6') ||
                                usernameEl.closest('div._1wqQ3') ||
                                usernameEl.parentElement;

        headerContainer?.insertBefore(bannerWrapper, usernameEl.nextSibling);
      }
    }

    // Gradient parsing
    const gradientMatch = /linear-gradient\((?:\d+deg, )?(#[0-9a-f]{6}, #[0-9a-f]{6}(?: \d+%)?)\)/i.exec(text);
    if (gradientMatch) {
      const rootEl = document.querySelector('#root-page-mobile');
      if (rootEl) {
        rootEl.style.transition = 'opacity 0.5s ease, background-image 1.3s ease-in';
        rootEl.style.opacity = '0';
        requestAnimationFrame(() => {
          rootEl.style.backgroundImage = gradientMatch[0];
          rootEl.style.opacity = '1';
        });
      }
    }

  } catch (e) {
    console.error(e);
  }
})();

(function() { // Copy Description
    let observer;
    let buttonAdded = false;

    function addCopyButton() {
        if (buttonAdded) return;
        const bioContent = document.querySelector('div[itemprop="description"]');
        if (!bioContent) return;
        const bioContainer = bioContent.parentElement.querySelector('h2');
        if (!bioContainer || bioContainer.querySelector('.aero-copy-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'aero-copy-btn';
        btn.innerHTML = '⎘';
        btn.title = 'Copy';
        btn.style.cssText = `
            margin-left: 12px;
            width: 26px;
            height: 26px;
            border: none;
            border-radius: 4px;
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(8px);
            color: #333;
            font-size: 14px;
            font-family: 'Segoe UI', system-ui, sans-serif;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            vertical-align: middle;
            transition: all 0.2s ease;
            box-shadow: 0 1px 1px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.7);
            position: relative;
            top: -1px;
        `;

        btn.onmouseenter = () => {
            btn.style.background = 'rgba(220,240,255,0.95)';
            btn.style.boxShadow = '0 1px 3px rgba(0,120,215,0.3)';
        };
        btn.onmouseleave = () => {
            btn.style.background = 'rgba(255,255,255,0.85)';
            btn.style.boxShadow = '0 1px 1px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.7)';
        };

        btn.onclick = async () => {
            const textToCopy = bioContent.innerText.trim() || '';
            try {
                await navigator.clipboard.writeText(textToCopy);
                showAeroNotification('Copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        };

        bioContainer.style.display = 'inline-flex';
        bioContainer.style.alignItems = 'center';
        bioContainer.appendChild(btn);

        buttonAdded = true;
        if (observer) observer.disconnect();
    }

    function showAeroNotification(message) {
        const notif = document.createElement('div');
        notif.textContent = message;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 6px 20px;
            background: rgba(240,248,255,0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.8);
            border-radius: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.5);
            color: #333;
            font: 13px 'Segoe UI', system-ui, sans-serif;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(notif);
        setTimeout(() => { notif.style.opacity = '1'; }, 10);
        setTimeout(() => {
            notif.style.opacity = '0';
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    }

    addCopyButton();
    if (!buttonAdded) {
        observer = new MutationObserver(addCopyButton);
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => { if (observer) observer.disconnect(); }, 10000);
    }
})();
(() => { // Last Created, Last Seen, Last Played Game, InternetArchive
    'use strict';

    const enhance = () => {
        const container = document.querySelector('._13UrL ._23KvS ._1jTCU');
        const span = container?.querySelector('span._20K92');
        if (!container || !span || span.dataset.enhanced) return false;
        container.style.zIndex = '9';

        const script = [...document.scripts].find(s => s.textContent.includes('options.bootstrap = {'));
        if (!script) return false;

        try {
            const bootstrap = JSON.parse(script.textContent.match(/options\.bootstrap = (\{.*?\});/s)[1]);
            const {object: {created, last_ping}} = bootstrap;
            const gameInfo = JSON.parse(localStorage.getItem('__amplify__cache:game:last-played') || '{}')?.data;
            const formatCompactDate = d => new Date(d).toLocaleDateString([], {month: 'short', day: 'numeric', year: 'numeric'});

            const formatVerbose = d => {
                const date = new Date(d);
                const day = date.getDate();
                const daySuffix = (day % 100 >= 11 && day % 100 <= 13) ? 'th' : ['st', 'nd', 'rd'][day % 10 - 1] || 'th';
                const month = ['January','February','March','April','May','June','July','August','September','October','November','December'][date.getMonth()];
                const tzOffset = -date.getTimezoneOffset();
                return `${day}${daySuffix} of ${month} ${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} GMT${tzOffset >= 0 ? '+' : '-'}${Math.floor(Math.abs(tzOffset) / 60)}`;
            };

            const timeAgo = d => {
                const sec = Math.floor((Date.now() - new Date(d)) / 1000);
                const intervals = [31536000, 2592000, 86400, 3600, 60];
                const units = ['y', 'm', 'd', 'h', 'min'];
                for (let i = 0; i < intervals.length; i++) {
                    const val = Math.floor(sec / intervals[i]);
                    if (val >= 1) return `${val}${units[i]}`;
                }
                return 'now';
            };

            const createToggleInfo = (icon, compact, full) => {
                const container = document.createElement('div');
                container.style.cssText = `
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    margin: 0 8px 0 0;
                    font-size: 12px;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.3s ease;
                    max-width: 200px;
                    overflow: hidden;
                `;

                const iconSpan = document.createElement('span');
                iconSpan.textContent = icon;
                iconSpan.style.opacity = '0.7';

                const compactSpan = document.createElement('span');
                compactSpan.textContent = compact;
                compactSpan.style.transition = 'all 0.3s ease';

                const fullSpan = document.createElement('span');
                fullSpan.textContent = full;
                fullSpan.style.display = 'none';
                fullSpan.style.transition = 'all 0.3s ease';

                container.appendChild(iconSpan);
                container.appendChild(compactSpan);
                container.appendChild(fullSpan);

                container.addEventListener('click', () => {
                    const isExpanded = fullSpan.style.display === 'inline';

                    if (isExpanded) {
                        fullSpan.style.display = 'none';
                        compactSpan.style.display = 'inline';
                        container.style.maxWidth = '200px';
                    } else {
                        fullSpan.style.display = 'inline';
                        compactSpan.style.display = 'none';
                        container.style.maxWidth = '400px';
                    }
                });

                return container;
            };

            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                margin-top: 4px;
                opacity: 0;
                transition: opacity 0.3s ease;
                gap: 6px;
            `;
            wrapper.appendChild(createToggleInfo('📅', formatCompactDate(created), formatVerbose(created)));
            wrapper.appendChild(createToggleInfo('👁️', timeAgo(last_ping), formatVerbose(last_ping)));

            if (bootstrap.object?.is_me && gameInfo?.id) {
                const game = document.createElement('a');
                game.href = `https://www.kogama.com/games/play/${gameInfo.id}/`;
                game.textContent = '🎮 ' + (gameInfo.name.length > 15 ? gameInfo.name.substring(0, 15) + '...' : gameInfo.name);
                game.style.cssText = `
                    margin: 0;
                    font-size: 12px;
                    color: #8ab4f8;
                    text-decoration: none;
                    white-space: nowrap;
                `;
                game.title = gameInfo.name;
                wrapper.appendChild(game);
            }

            const archive = document.createElement('a');
            archive.href = `https://web.archive.org/web/*/${location.href}`;
            archive.textContent = '📜 Archive';
            archive.style.cssText = `
                margin: 0;
                font-size: 12px;
                color: #f8b38a;
                text-decoration: none;
                white-space: nowrap;
            `;
            wrapper.appendChild(archive);

            span.dataset.enhanced = 'true';
            span.innerHTML = '';
            span.appendChild(wrapper);
            setTimeout(() => wrapper.style.opacity = '1', 400);
            return true;
        } catch (e) {
            console.error('Profile Enhancer error:', e);
            return false;
        }
    };

    setTimeout(() => {
        if (!enhance()) {
            const observer = new MutationObserver((_, obs) => enhance() && obs.disconnect());
            observer.observe(document.body, {childList: true, subtree: true});
            setTimeout(() => observer.disconnect(), 5000);
        }
    }, 400);
})();



(() => {
    'use strict';
    const style = document.createElement('style');
    style.textContent = `
        ._2mwlM > div:first-child > button,
        ._3RptD:not(:has(a[href="/games/"])):not(:has(a[href="/build/"])):not(:has(a[href="/marketplace/"])) {
            display: none !important;
        }
        ._21Sfe { display: none !important; }
    `;
    document.head.appendChild(style);

function modifyLogo() {
        const logoContainer = document.querySelector('._2Jlgl');
        if (!logoContainer) return false;
        const logoLink = logoContainer.querySelector('a');
        if (logoLink) {
            logoLink.title = "You're using UtilifyV2 by Simon! Thank you!";
            logoLink.href = "https://github.com/wintrspark";
            const logoImg = logoLink.querySelector('img');
            if (logoImg) {
                logoImg.classList.add('utilify-logo-mod');
                logoImg.removeAttribute('srcset');
                logoImg.src = "https://avatars.githubusercontent.com/u/143356794?v=4";
                logoImg.alt = "You're using UtilifyV2 by Simon! Thank you!";
            }
            return true;
        }
        return false;
    }
    if (modifyLogo()) return;
    const observer = new MutationObserver(() => {
        if (modifyLogo()) {
            observer.disconnect();
        }
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();


(function() {
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
          ._3TORb ._2E1AL .tRx6U, .css-1wbcikz, .css-wog98n, .css-o4yc28, .css-z05bui,  {
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
      const MESSAGES = [
        "you are so loved <3",
        "streak check in, hi!",
        "keeping the streak alive <3",
        "quick hello from your streak bot"
      ];

      const sendMessage = async () => {
        const lastSent = parseInt(localStorage.getItem('ls_last_sent') || '0');
        if (Date.now() - lastSent < INTERVAL) return;

        try {
          const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
          await fetch(`https://www.kogama.com/chat/${userId}/`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to_profile_id: TARGET, message: msg })
          });
          localStorage.setItem('ls_last_sent', Date.now().toString());
        } catch {}
      };

      sendMessage();
      this.streakKeeper.timer = setInterval(sendMessage, 60 * 1000);
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



// Faster Friends V3 - Ethereal Edition
(function () {
    "use strict";
  
    const URL_PATTERN = /^https:\/\/www\.kogama\.com\/profile\/(\w+)\/friends\/$/i;
  
    function run() {
      if (!URL_PATTERN.test(window.location.href)) return;
  
      function getProfileIDFromURL() {
        const m = window.location.href.match(URL_PATTERN);
        return m ? m[1] : null;
      }
  
      function saveProfileID() {
        const id = getProfileIDFromURL();
        if (id) localStorage.setItem("kogamaProfileID", id);
      }
  
      function alphaFirstComparator(a, b) {
        const sa = String(a || "").toLowerCase();
        const sb = String(b || "").toLowerCase();
        const isLetter = s => /^[a-z]/.test(s);
        const aLetter = isLetter(sa);
        const bLetter = isLetter(sb);
        if (aLetter && !bLetter) return -1;
        if (!aLetter && bLetter) return 1;
        return sa.localeCompare(sb, undefined, { sensitivity: "base", numeric: false });
      }
  
      function ensureRootUIRemoved(rootId) {
        const existing = document.getElementById(rootId);
        if (existing) existing.remove();
        const existingStyle = document.getElementById("frlscrape-style");
        if (existingStyle) existingStyle.remove();
        const existingReopen = document.getElementById("frlscrape-reopen");
        if (existingReopen) existingReopen.remove();
      }
  
      function createStyle() {
        const css = `
  @keyframes sparkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  
  @keyframes shimmer {
    0% { background-position: -100% 0; }
    100% { background-position: 100% 0; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  #frlscrape-root {
    position: fixed;
    z-index: 99999;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
  
  #frlscrape-panel {
    position: fixed;
    z-index: 100000;
    width: min(920px, 92vw);
    max-height: 84vh;
    background: linear-gradient(135deg, #1a1b1e 0%, #252629 50%, #1a1b1e 100%);
    color: #e8e8ee;
    border-radius: 20px;
    box-shadow: 
      0 0 60px rgba(200, 190, 220, 0.15),
      0 20px 80px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    pointer-events: auto;
    border: 1px solid rgba(200, 190, 220, 0.2);
    backdrop-filter: blur(20px);
    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  #frlscrape-panel::before {
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
  
  /* Border sparkles */
  .panel-star-1, .panel-star-2, .panel-star-3, 
  .panel-star-4, .panel-star-5, .panel-star-6 {
    position: absolute;
    color: rgba(200, 190, 220, 0.6);
    font-size: 12px;
    animation: sparkle 3s ease-in-out infinite;
    pointer-events: none;
  }
  
  .panel-star-1 { left: -1px; top: 20%; animation-delay: 0.5s; }
  .panel-star-2 { left: -1px; top: 50%; animation-delay: 1s; font-size: 14px; }
  .panel-star-3 { left: -1px; top: 80%; animation-delay: 1.5s; }
  .panel-star-4 { right: -1px; top: 30%; animation-delay: 0.7s; font-size: 10px; color: rgba(255, 192, 203, 0.5); }
  .panel-star-5 { right: -1px; top: 60%; animation-delay: 1.2s; color: rgba(255, 192, 203, 0.5); }
  .panel-star-6 { right: -1px; top: 85%; animation-delay: 1.8s; font-size: 13px; color: rgba(255, 192, 203, 0.5); }
  
  #frlscrape-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    gap: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    cursor: grab;
    user-select: none;
    background: linear-gradient(135deg, rgba(40, 42, 48, 0.8) 0%, rgba(30, 32, 38, 0.9) 100%);
    position: relative;
  }
  
  #frlscrape-header::after {
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
  
  /* Header sparkles */
  .header-star-1, .header-star-2, .header-star-3 {
    position: absolute;
    color: rgba(255, 192, 203, 0.4);
    font-size: 10px;
    animation: sparkle 2.5s ease-in-out infinite;
    pointer-events: none;
  }
  .header-star-1 { left: 10%; top: 15px; animation-delay: 0.4s; }
  .header-star-2 { left: 40%; top: 12px; animation-delay: 1.1s; }
  .header-star-3 { right: 10%; top: 15px; animation-delay: 0.8s; }
  
  #frlscrape-header.dragging {
    cursor: grabbing;
  }
  
  #frlscrape-title {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 2px;
    color: rgba(200, 190, 220, 0.5);
    text-transform: uppercase;
    position: relative;
    white-space: nowrap;
  }
  
  #frlscrape-title::before,
  #frlscrape-title::after {
    content: '✦';
    position: absolute;
    color: rgba(255, 192, 203, 0.4);
    font-size: 10px;
    animation: sparkle 2s ease-in-out infinite;
  }
  
  #frlscrape-title::before {
    left: -14px;
    animation-delay: 0.3s;
  }
  
  #frlscrape-title::after {
    right: -14px;
    animation-delay: 0.8s;
  }
  
  #frlscrape-controls {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  #frlscrape-close {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #d8d8de;
    font-size: 18px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 10px;
    line-height: 1;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  #frlscrape-close:hover {
    background: rgba(255, 192, 203, 0.15);
    border-color: rgba(255, 192, 203, 0.3);
    color: #ffc0cb;
    transform: scale(1.05);
  }
  
  #frlscrape-search {
    flex: 1;
    max-width: 480px;
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  #frlscrape-search input {
    width: 100%;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid rgba(200, 190, 220, 0.15);
    background: rgba(0, 0, 0, 0.4);
    color: #e8e8ee;
    outline: none;
    font-size: 14px;
    transition: all 0.2s ease;
  }
  
  #frlscrape-search input::placeholder {
    color: rgba(200, 190, 220, 0.4);
  }
  
  #frlscrape-search input:focus {
    border-color: rgba(255, 192, 203, 0.5);
    box-shadow: 0 0 0 3px rgba(255, 192, 203, 0.1);
    background: rgba(0, 0, 0, 0.5);
  }
  
  #frlscrape-body {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 20px;
    overflow: auto;
    background: linear-gradient(180deg, rgba(26, 27, 30, 0.95) 0%, rgba(22, 23, 26, 0.98) 100%);
    position: relative;
  }
  
  /* Vertical "Made by Simon" text */
  #frlscrape-body::after {
    content: 'Made by Simon';
    position: absolute;
    right: 8px;
    bottom: 16px;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-size: 11px;
    letter-spacing: 2px;
    color: rgba(200, 190, 220, 0.4);
    font-weight: 500;
    text-transform: uppercase;
    pointer-events: none;
  }
  
  .frsection {
    background: linear-gradient(135deg, rgba(255, 192, 203, 0.03) 0%, rgba(200, 190, 220, 0.02) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 16px;
    border-radius: 12px;
    min-height: 140px;
    max-height: 56vh;
    overflow: auto;
    transition: all 0.2s ease;
  }
  
  .frsection:hover {
    background: linear-gradient(135deg, rgba(255, 192, 203, 0.05) 0%, rgba(200, 190, 220, 0.03) 100%);
    border-color: rgba(255, 192, 203, 0.15);
  }
  
  .frsection h3 {
    margin: 0 0 12px 0;
    font-size: 13px;
    font-weight: 600;
    background: linear-gradient(135deg, #ffc0cb 0%, #c8bed8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    position: relative;
  }
  
  .frsection h3::before {
    content: '✦';
    position: absolute;
    left: -16px;
    color: rgba(255, 192, 203, 0.4);
    font-size: 10px;
    animation: sparkle 2s ease-in-out infinite;
  }
  
  .entry {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    margin-right: 2px;
    margin-bottom: 6px;
  }
  
  .entry a {
    color: #c8c8d8;
    text-decoration: none;
    font-size: 14px;
    padding: 4px 8px;
    border-radius: 8px;
    display: inline-block;
    transition: all 0.15s ease;
  }
  
  .entry a:hover {
    background: rgba(255, 192, 203, 0.12);
    color: #ffc0cb;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(255, 192, 203, 0.2);
  }
  
  .separator {
    display: inline;
    margin-right: 4px;
    color: rgba(255, 255, 255, 0.3);
  }
  
  .empty-note {
    color: rgba(200, 190, 220, 0.5);
    font-size: 13px;
    padding: 8px 4px;
    font-style: italic;
  }
  
  #frlscrape-reopen {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: 24px;
    z-index: 100000;
    padding: 12px 24px;
    border-radius: 12px;
    border: 1px solid rgba(255, 192, 203, 0.3);
    background: linear-gradient(135deg, rgba(255, 192, 203, 0.2) 0%, rgba(200, 190, 220, 0.15) 100%);
    backdrop-filter: blur(10px);
    color: #ffc0cb;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(255, 192, 203, 0.3);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    display: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  #frlscrape-reopen:hover {
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 6px 30px rgba(255, 192, 203, 0.5);
    border-color: rgba(255, 192, 203, 0.5);
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
  
  @media (max-width: 880px) {
    #frlscrape-body {
      grid-template-columns: 1fr;
    }
    
    #frlscrape-body::after {
      display: none;
    }
  }
  `;
        const style = document.createElement("style");
        style.id = "frlscrape-style";
        style.textContent = css;
        document.head.appendChild(style);
      }
  
      function buildUI() {
        const rootId = "frlscrape-root";
        ensureRootUIRemoved(rootId);
        createStyle();
  
        const root = document.createElement("div");
        root.id = rootId;
  
        const panel = document.createElement("div");
        panel.id = "frlscrape-panel";
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-modal", "false");
  
        // Add sparkle stars to panel
        for (let i = 1; i <= 6; i++) {
          const star = document.createElement("div");
          star.className = `panel-star-${i}`;
          star.textContent = i % 2 === 0 ? '✧' : '✦';
          panel.appendChild(star);
        }
  
        const header = document.createElement("div");
        header.id = "frlscrape-header";
  
        // Add header sparkles
        for (let i = 1; i <= 3; i++) {
          const star = document.createElement("div");
          star.className = `header-star-${i}`;
          star.textContent = i % 2 === 0 ? '✧' : '✦';
          header.appendChild(star);
        }
  
        const leftWrap = document.createElement("div");
        leftWrap.style.display = "flex";
        leftWrap.style.alignItems = "center";
        leftWrap.style.gap = "16px";
  
        const title = document.createElement("div");
        title.id = "frlscrape-title";
        title.textContent = "Friends & Requests";
  
        const searchWrap = document.createElement("div");
        searchWrap.id = "frlscrape-search";
  
        const input = document.createElement("input");
        input.id = "frlscrape-search-input";
        input.type = "search";
        input.placeholder = "Search by username...";
        input.autocomplete = "off";
        input.addEventListener("input", () => filterAllLists(input.value.trim().toLowerCase()));
  
        searchWrap.appendChild(input);
        leftWrap.appendChild(title);
        leftWrap.appendChild(searchWrap);
  
        const controls = document.createElement("div");
        controls.id = "frlscrape-controls";
  
        const closeBtn = document.createElement("button");
        closeBtn.id = "frlscrape-close";
        closeBtn.setAttribute("aria-label", "Close");
        closeBtn.innerHTML = "×";
  
        controls.appendChild(closeBtn);
  
        header.appendChild(leftWrap);
        header.appendChild(controls);
  
        const body = document.createElement("div");
        body.id = "frlscrape-body";
  
        const friendsSection = document.createElement("div");
        friendsSection.className = "frsection";
        friendsSection.id = "friendsList";
        const fh = document.createElement("h3");
        fh.textContent = "Friends";
        friendsSection.appendChild(fh);
  
        const invitingSection = document.createElement("div");
        invitingSection.className = "frsection";
        invitingSection.id = "invitingList";
        const ih = document.createElement("h3");
        ih.textContent = "Inviting";
        invitingSection.appendChild(ih);
  
        const sentSection = document.createElement("div");
        sentSection.className = "frsection";
        sentSection.id = "sentList";
        const sh = document.createElement("h3");
        sh.textContent = "Sent";
        sentSection.appendChild(sh);
  
        body.appendChild(friendsSection);
        body.appendChild(invitingSection);
        body.appendChild(sentSection);
  
        panel.appendChild(header);
        panel.appendChild(body);
        root.appendChild(panel);
        document.body.appendChild(panel);
  
        panel.style.left = "50%";
        panel.style.top = "50%";
        panel.style.transform = "translate(-50%,-50%)";
        delete panel.dataset.dragged;
  
        const reopen = document.createElement("button");
        reopen.id = "frlscrape-reopen";
        reopen.type = "button";
        reopen.textContent = "Open Friends Panel";
        document.body.appendChild(reopen);
  
        const ui = { root, panel, header, input, friendsSection, invitingSection, sentSection, reopen };
  
        const centerPanel = () => {
          const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
          const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
          const w = panel.offsetWidth;
          const h = panel.offsetHeight;
          panel.style.left = `${Math.max(12, (vw - w) / 2)}px`;
          panel.style.top = `${Math.max(12, (vh - h) / 2)}px`;
        };
  
        centerPanel();
  
        function onWindowResize() {
          if (!panel.dataset.dragged) centerPanel();
        }
  
        window.addEventListener("resize", onWindowResize);
  
        let dragState = null;
  
        function startDrag(clientX, clientY) {
          const rect = panel.getBoundingClientRect();
          panel.style.left = `${rect.left}px`;
          panel.style.top = `${rect.top}px`;
          panel.style.transform = "";
          panel.classList.add("dragging");
          header.classList.add("dragging");
          dragState = {
            startX: clientX,
            startY: clientY,
            panelLeft: rect.left,
            panelTop: rect.top,
            panelW: rect.width,
            panelH: rect.height
          };
          panel.style.transition = "none";
        }
  
        function moveDrag(clientX, clientY) {
          if (!dragState) return;
          const dx = clientX - dragState.startX;
          const dy = clientY - dragState.startY;
          const left = dragState.panelLeft + dx;
          const top = dragState.panelTop + dy;
          const maxLeft = Math.max(8, window.innerWidth - dragState.panelW - 8);
          const maxTop = Math.max(8, window.innerHeight - dragState.panelH - 8);
          panel.style.left = `${Math.min(Math.max(8, left), maxLeft)}px`;
          panel.style.top = `${Math.min(Math.max(8, top), maxTop)}px`;
          panel.dataset.dragged = "1";
        }
  
        function endDrag() {
          if (!dragState) return;
          dragState = null;
          panel.classList.remove("dragging");
          header.classList.remove("dragging");
          panel.style.transition = "";
        }
  
        header.addEventListener("mousedown", (ev) => {
          if (ev.target.closest("#frlscrape-close")) return;
          startDrag(ev.clientX, ev.clientY);
          const onMove = (e) => moveDrag(e.clientX, e.clientY);
          const onUp = () => {
            endDrag();
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
          };
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
        });
  
        header.addEventListener("touchstart", (ev) => {
          if (ev.target.closest("#frlscrape-close")) return;
          const t = ev.touches[0];
          startDrag(t.clientX, t.clientY);
          const onMove = (e) => {
            const t2 = e.touches[0];
            moveDrag(t2.clientX, t2.clientY);
          };
          const onEnd = () => {
            endDrag();
            document.removeEventListener("touchmove", onMove);
            document.removeEventListener("touchend", onEnd);
            document.removeEventListener("touchcancel", onEnd);
          };
          document.addEventListener("touchmove", onMove, { passive: false });
          document.addEventListener("touchend", onEnd);
          document.addEventListener("touchcancel", onEnd);
        });
  
        closeBtn.addEventListener("click", () => {
          panel.style.display = "none";
          ui.reopen.style.display = "block";
        });
  
        ui.reopen.addEventListener("click", () => {
          panel.style.display = "";
          ui.reopen.style.display = "none";
          if (!panel.dataset.dragged) centerPanel();
        });
  
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            if (panel.style.display !== "none") {
              panel.style.display = "none";
              ui.reopen.style.display = "block";
            } else {
              panel.style.display = "";
              ui.reopen.style.display = "none";
              if (!panel.dataset.dragged) centerPanel();
            }
          }
        });
  
        function onDocClick(e) {
          if (panel.style.display === "none") return;
          if (!panel.contains(e.target) && e.target !== ui.reopen) {
            panel.style.display = "none";
            ui.reopen.style.display = "block";
          }
        }
  
        setTimeout(() => document.addEventListener("click", onDocClick), 50);
  
        return ui;
      }
  
      function createEntryLink(text, href, id) {
        const wrapper = document.createElement("span");
        wrapper.className = "entry";
        if (id) wrapper.dataset.entryId = id;
        const a = document.createElement("a");
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = text;
        const sep = document.createElement("span");
        sep.className = "separator";
        sep.textContent = ",";
        wrapper.appendChild(a);
        wrapper.appendChild(sep);
        return wrapper;
      }
  
      function updateSeparators(sectionEl) {
        if (!sectionEl) return;
        const entries = Array.from(sectionEl.querySelectorAll(".entry"));
        entries.forEach(e => (e.style.display = e.style.display || ""));
        const visible = entries.filter(e => e.style.display !== "none");
        sectionEl.querySelectorAll(".empty-note").forEach(n => n.remove());
        if (visible.length === 0) {
          entries.forEach(e => (e.style.display = "none"));
          const note = document.createElement("div");
          note.className = "empty-note";
          note.textContent = "No matches.";
          sectionEl.appendChild(note);
          return;
        }
        for (let i = 0; i < entries.length; i++) {
          const el = entries[i];
          const sep = el.querySelector(".separator");
          const isVisible = el.style.display !== "none";
          const hasVisibleAfter = entries.slice(i + 1).some(e => e.style.display !== "none");
          if (sep) sep.style.display = isVisible && hasVisibleAfter ? "inline" : "none";
        }
      }
  
      async function fetchJSON(url, opts = {}) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 12000);
        try {
          const res = await fetch(url, { ...opts, signal: controller.signal });
          clearTimeout(id);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return await res.json();
        } finally {
          clearTimeout(id);
        }
      }
  
      function appendSortedEntries(container, items) {
        if (!container) return;
        container.querySelectorAll(".entry").forEach(n => n.remove());
        container.querySelectorAll(".empty-note").forEach(n => n.remove());
        const mapped = items.slice();
        mapped.sort((a, b) => alphaFirstComparator(a.name, b.name));
        if (mapped.length === 0) {
          const n = document.createElement("div");
          n.className = "empty-note";
          n.textContent = "No entries.";
          container.appendChild(n);
          return;
        }
        mapped.forEach((it) => {
          const el = createEntryLink(it.name, it.href, it.id);
          container.appendChild(el);
        });
        updateSeparators(container);
      }
  
      async function fetchAndRenderFriends(ui) {
        const profileID = localStorage.getItem("kogamaProfileID");
        if (!profileID) return;
        const url = `https://www.kogama.com/user/${profileID}/friend/?count=555`;
        try {
          const data = await fetchJSON(url);
          const friends = Array.isArray(data.data) ? data.data.filter(f => f.friend_status === "accepted") : [];
          const items = friends.map(f => ({ name: f.friend_username || f.friend_profile_id, href: `https://www.kogama.com/profile/${f.friend_profile_id}/`, id: f.friend_profile_id }));
          appendSortedEntries(ui.friendsSection, items);
        } catch (err) {
          const note = document.createElement("div");
          note.className = "empty-note";
          note.textContent = "Failed to load friends.";
          ui.friendsSection.appendChild(note);
          console.error("Friends fetch error", err);
        }
      }
  
      async function fetchAndRenderRequests(ui) {
        const profileID = localStorage.getItem("kogamaProfileID");
        if (!profileID) return;
        const url = `https://www.kogama.com/user/${profileID}/friend/requests/?page=1&count=1000`;
        try {
          const data = await fetchJSON(url, { method: "GET", headers: { "Content-Type": "application/json" } });
          const arr = Array.isArray(data.data) ? data.data : [];
          const sent = arr.filter(r => String(r.profile_id) === String(profileID)).map(r => ({ name: r.friend_username || `id:${r.friend_profile_id}`, href: `https://www.kogama.com/profile/${r.friend_profile_id}/`, id: r.id }));
          const inviting = arr
            .filter(r => String(r.profile_id) !== String(profileID))
            .map(r => ({ name: r.profile_username || `id:${r.profile_id}`, href: `https://www.kogama.com/profile/${r.profile_id}/`, id: r.id }));
          appendSortedEntries(ui.sentSection, sent);
          appendSortedEntries(ui.invitingSection, inviting);
        } catch (err) {
          const note = document.createElement("div");
          note.className = "empty-note";
          note.textContent = "Failed to load requests.";
          ui.invitingSection.appendChild(note);
          ui.sentSection.appendChild(note.cloneNode(true));
          console.error("Requests fetch error", err);
        }
      }
  
      function filterAllLists(query) {
        const lists = ["friendsList", "invitingList", "sentList"];
        lists.forEach(id => {
          const root = document.getElementById(id);
          if (!root) return;
          const entries = Array.from(root.querySelectorAll(".entry"));
          entries.forEach(el => {
            const link = el.querySelector("a");
            const matches = !query || (link && link.textContent.toLowerCase().includes(query));
            el.style.display = matches ? "" : "none";
          });
          updateSeparators(root);
        });
      }
  
      saveProfileID();
      const ui = buildUI();
      fetchAndRenderFriends(ui);
      fetchAndRenderRequests(ui);
    }
  
    run();
  })();
  

// Extra CSS: Useless Footers begone, small fixes & improvements.
// DM BOX STYLES ARE HERE TOO, TEMPORARY HARD_CODED AND NOT PANEL HUE RELATED.

GM_addStyle(`

.uwn5j  { 
    background-color: #171414 !important;
    border: none !important;
}
._375XK ._2XaOw {
    scrollbar-width: thin !important;
    scrollbar-color: ##C3B398 transparent !important;
    background-color: #171414 !important;
    border: none !important;
}

._375XK .F3PyX {
    background-color: #171414 !important;
    border: none !important;
}
._375XK ._2drTe textarea {
    background-color: #171414 !important;
    border: none !important;
    color: #ffff !important;
}
.obf-wrap textarea:focus,
.obf-wrap textarea:active {
    border: 0;
    outline: 0;
    box-shadow: none;
}

.obf-wrap {
    background: transparent !important;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
}

.obf-wrap textarea {
    flex: 1;
    background: transparent;
    border: 0;
    outline: 0;
    box-shadow: none;
    appearance: none;
    resize: none;
    padding: 12px;
    color: #fff;
}

.obf-wrap textarea:focus {
    outline: 0;
    box-shadow: none;
}


MuiStack-root _2drTe css-u4p24i {
    background-color: #171414 !important;
    border: none !important;
    color: #ffff !important;
}


._375XK ._2XaOw ._1j2Cd._1Xzzq p { /* our chat-bubble */
    box-shadow: 0 0 4px #B59C6B !important;
    border-radius: 13px !important;
    background-color: #2E2D2C !important;
    color: #fff !important;
}

._375XK ._2XaOw ._1j2Cd p { /* incoming chat-bubble */
background-color: #302820 !important;
box-shadow: 0 0 2px #D9C6A3 !important;
color: #ffff !important;
border-radius: 7px !important;
}

._375XK .F3PyX ._2XzvN, .uwn5j ._3DYYr ._28mON header { color: #DEAB54 !important; }
.uwn5j ._3DYYr ._1j2Cd { display: none !important; }




._1RMYS { display: none !important; }
._3-qgq ._2uIZL { background-color: hsla(0, 5.9%, 13.3%, 0.51); }
.css-e5yc1l { background-color: transparent !important; text-shadow: 0 0 4px #fff !important; }
.css-1995t1d { background-color: transparent !important; text-shadow: 0 0 4px #fff !important; }
.css-16dac4n { display: none !important; }
.css-atlh4n { background-color: transparent !important; text-shadow: 0 0 4px #fff !important; }
.css-jm72ng {	background: linear-gradient(90deg,#ff1d1d,#ff1eec,#fc22ea,#0f93ff,#00ffb3,#00ff00,#fffb21,#e69706,#ff1111);
	background-size: 400% 100%;
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent !important;
	animation: avflow 9s ease-in-out infinite;
	font-weight: 700;
	cursor: pointer;
}
@keyframes avflow {
	0% { background-position: 0% 50% }
	50% { background-position: 100% 50% }
	100% { background-position: 0% 50% }
} 
`);


// AV Finder (fixed loading + proper card rendering)
;(function () {
	"use strict"

	if (!/^https:\/\/www\.kogama\.com\/profile\/\d+\/avatars\/?$/.test(location.href)) return

	const PAGE_COUNT = 400
	const MAX_PAGES = 25
	const CONCURRENCY = 3
	const BATCH_DELAY = 180

	let modal = null
	let overlay = null
	let closeBtn = null
	let fetching = false
	let controller = null

	function base(u) {
		return u ? u.split("?")[0] : ""
	}

	function openMarketplace(o) {
		window.open(`https://www.kogama.com/marketplace/avatar/${o.product_id}/`, "_blank")
	}

	function abortFetch() {
		if (controller) {
			controller.abort()
			controller = null
		}
		fetching = false
	}

	function ensurePanel() {
		if (modal) {
			modal.style.display = "grid"
			overlay.style.display = "block"
			closeBtn.style.display = "block"
			return
		}

		overlay = document.createElement("div")
		overlay.className = "rf76-overlay"
		overlay.onclick = closePanel

		modal = document.createElement("div")
		modal.className = "rf76-panel"

		closeBtn = document.createElement("div")
		closeBtn.className = "rf76-close"
		closeBtn.textContent = "✕"
		closeBtn.onclick = closePanel

		document.body.append(overlay, modal, closeBtn)
	}

	function closePanel() {
		if (!modal) return
		abortFetch()
		modal.style.display = "none"
		overlay.style.display = "none"
		closeBtn.style.display = "none"
	}

	function createLoading() {
		const loadingWrapper = document.createElement("div")
		loadingWrapper.className = "rf76-loading-wrapper"

		const loading = document.createElement("div")
		loading.className = "rf76-loading"

		loading.innerHTML = `<div class="rf76-spinner"></div><div style="margin-top:6px;font-size:12px;color:#ccc;text-align:center;">Loading...</div>`
		loadingWrapper.appendChild(loading)
		return loadingWrapper
	}

	async function searchMarketplace(name, imageUrl) {
		if (fetching) abortFetch()
		fetching = true

		controller = new AbortController()
		ensurePanel()
		modal.innerHTML = ""
		const loadingWrapper = createLoading()
		modal.appendChild(loadingWrapper)

		let page = 1
		let active = 0
		let found = false

		const run = async () => {
			if (found || page > MAX_PAGES || controller.signal.aborted) return
			active++

			const url = `https://www.kogama.com/model/market/?page=${page}&count=${PAGE_COUNT}&category=avatar&q=${encodeURIComponent(name)}`
			page++

			try {
				const res = await fetch(url, { signal: controller.signal })
				const json = await res.json()
				if (!json?.data?.length) {
					found = true
					return
				}

				// remove loading as soon as we have the first batch
				if (modal.contains(loadingWrapper)) modal.removeChild(loadingWrapper)

				// append all cards immediately
				for (const item of json.data) {
					if (controller.signal.aborted) break

					const card = document.createElement("div")
					card.className = "rf76-card"

					const img = document.createElement("img")
					img.src = item.image_large

					const label = document.createElement("av")
					label.textContent = item.name

					card.onclick = () => openMarketplace(item)
					card.append(img, label)
					modal.appendChild(card)

					// check match after appending
					if (!found && base(item.image_large) === base(imageUrl)) {
						found = true
						openMarketplace(item)
						closePanel()
						break
					}
				}
			} catch (e) {
				if (e.name !== "AbortError") console.error(e)
			} finally {
				active--
				if (!found && !controller.signal.aborted) {
					await new Promise(r => setTimeout(r, BATCH_DELAY))
					if (active < CONCURRENCY) run()
				}
			}
		}

		for (let i = 0; i < CONCURRENCY; i++) run()

		while (active > 0 && !controller.signal.aborted) {
			await new Promise(r => setTimeout(r, 50))
		}

		fetching = false
	}

	function enhanceAvatars() {
		document.querySelectorAll(".MuiGrid-root.MuiGrid-container.MuiGrid-spacing-xs-2 .MuiGrid-item").forEach(avatar => {
			if (avatar.querySelector("av")) return

			const wrap = avatar.querySelector("._2uIZL")
			const span = wrap?.querySelector("span")
			if (!span) return

			const name = span.textContent.trim()
			const style = avatar.querySelector("._3Up3H")?.getAttribute("style") || ""
			const match = style.match(/url\("([^"]+)"\)/)
			const imgUrl = match ? match[1] : ""

			const av = document.createElement("av")
			av.textContent = name
			av.onclick = () => searchMarketplace(name, imgUrl)

			wrap.innerHTML = ""
			wrap.appendChild(av)
		})
	}

	const style = document.createElement("style")
	style.textContent = `
av {
	background: linear-gradient(90deg,#ff1d1d,#ff1eec,#fc22ea,#0f93ff,#00ffb3,#00ff00,#fffb21,#e69706,#ff1111);
	background-size: 400% 100%;
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
	animation: avflow 9s ease-in-out infinite;
	font-weight: 700;
	cursor: pointer;
}

@keyframes avflow {
	0% { background-position: 0% 50% }
	50% { background-position: 100% 50% }
	100% { background-position: 0% 50% }
}

.rf76-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0,0,0,0.65);
	z-index: 9998;
}

.rf76-panel {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: min(1100px, 92vw);
	max-height: 75vh;
	padding: 16px;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
	gap: 14px;
	overflow-y: auto;
	background: #0f1016;
	border-radius: 14px;
	box-shadow: 0 25px 70px rgba(0,0,0,0.85);
	z-index: 9999;
}

.rf76-card {
	background: #161823;
	border-radius: 10px;
	overflow: hidden;
	transition: transform .18s ease, box-shadow .18s ease;
}

.rf76-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 12px 28px rgba(0,0,0,0.6);
}

.rf76-card img {
	width: 100%;
	display: block;
}

.rf76-card av {
	display: block;
	padding: 8px 6px;
	font-size: 13px;
	text-align: center;
}

.rf76-close {
	position: fixed;
	top: 14px;
	right: 18px;
	font-size: 20px;
	color: #fff;
	cursor: pointer;
	z-index: 10000;
}

.rf76-loading-wrapper {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 120px;
	height: 80px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	pointer-events: none;
	z-index: 10001;
}

.rf76-spinner {
	width: 30px;
	height: 30px;
	border: 3px solid rgba(255,255,255,0.2);
	border-top: 3px solid #fff;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
`
	document.head.appendChild(style)

	window.addEventListener("load", () => {
		setTimeout(() => {
			enhanceAvatars()
			setInterval(enhanceAvatars, 2000)
		}, 800)
	})
})();


(() => {
  "use strict";

  const IDS = [
    "24051519",
    "17037147",
    "16947158",
    "36355",
    "669433161"
  ];

  const match = location.pathname.match(/^\/profile\/(\d+)\/?$/);
  const uid = match ? match[1] : null;
  if (!uid || !IDS.includes(uid)) return;

  const badgeText = "Utilify Friend";
  const creditHTML = `
    This profile is associated with Utilify as a whole.<br>
    Their presence made a difference.<br>
    <a href="https://github.com/wintrspark/Utilify/" target="_blank" rel="noopener noreferrer">GitHub</a>
  `;

  const style = document.createElement("style");
  style.textContent = `
@keyframes sparkle {
  0%,100% { opacity: .35; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

@keyframes glow {
  0% { box-shadow: 0 0 18px rgba(255,192,203,.25); }
  50% { box-shadow: 0 0 32px rgba(200,190,220,.45); }
  100% { box-shadow: 0 0 18px rgba(255,192,203,.25); }
}

@keyframes shimmer {
  0% { background-position: -120% 0; }
  100% { background-position: 120% 0; }
}

.badge-panel {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  z-index: 99999;
  min-width: 240px;
  max-width: 72vw;
  padding: 14px 18px 16px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(26,27,30,.95), rgba(22,23,26,.98));
  border: 1px solid rgba(255,192,203,.25);
  color: #e8e8ee;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.35;
  text-align: center;
  animation: glow 4s ease-in-out infinite;
  backdrop-filter: blur(14px);
}

.badge-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,192,203,.25) 50%,
    transparent 100%
  );
  opacity: .35;
  animation: shimmer 6s ease-in-out infinite;
  pointer-events: none;
}

.badge-star {
  position: absolute;
  font-size: 11px;
  color: rgba(255,192,203,.6);
  animation: sparkle 3s ease-in-out infinite;
  pointer-events: none;
}

.badge-star.s1 { left: 10px; top: 10px; animation-delay: .2s; }
.badge-star.s2 { right: 12px; top: 18px; font-size: 13px; animation-delay: .9s; color: rgba(200,190,220,.7); }
.badge-star.s3 { left: 18px; bottom: 14px; animation-delay: 1.6s; }
.badge-star.s4 { right: 16px; bottom: 12px; font-size: 12px; animation-delay: 1.1s; color: rgba(200,190,220,.7); }

.badge-title {
  display: inline-block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  background: linear-gradient(135deg, #ffc0cb 0%, #c8bed8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.badge-credit {
  font-size: 12px;
  color: rgba(232,232,238,.85);
}

.badge-credit a {
  color: #ffc0cb;
  text-decoration: none;
  font-weight: 600;
}

.badge-credit a:hover {
  text-decoration: underline;
}
`;
  document.head.appendChild(style);

  const panel = document.createElement("div");
  panel.className = "badge-panel";

  ["s1","s2","s3","s4"].forEach((c,i) => {
    const s = document.createElement("div");
    s.className = `badge-star ${c}`;
    s.textContent = i % 2 ? "✧" : "✦";
    panel.appendChild(s);
  });

  const title = document.createElement("div");
  title.className = "badge-title";
  title.textContent = badgeText;

  const credit = document.createElement("div");
  credit.className = "badge-credit";
  credit.innerHTML = creditHTML;

  panel.appendChild(title);
  panel.appendChild(credit);
  document.body.appendChild(panel);
})();




(() => { // Leaderboard Fix, Credits to Zpayer as the idea was his lol
  const ENDPOINT_RE = /(^|https?:\/\/(?:www\.)?kogama\.com\/)(api\/leaderboard\/around_me\/)(\d+)(\/top\/?)(.*)$/i;
  const PROFILE_PATH_RE = /^\/profile\/(\d+)\/leaderboard(\/|$)/i;

  function getUidFromLocation() {
    const m = location.pathname.match(PROFILE_PATH_RE);
    return m ? m[1] : null;
  }

  function toAbsolute(urlLike) {
    try {
      return new URL(String(urlLike), location.href).toString();
    } catch (e) {
      return String(urlLike);
    }
  }

  function rewriteLeaderboardUrl(urlLike) {
    try {
      const abs = toAbsolute(urlLike);
      const parts = abs.match(ENDPOINT_RE);
      const pageUid = getUidFromLocation();
      if (!parts || !pageUid) return abs;
      const prefix = parts[1].startsWith('/') ? location.origin + '/' : parts[1];
      const rewritten = prefix + parts[2] + pageUid + parts[4] + (parts[5] || '');
      return rewritten;
    } catch (e) {
      return toAbsolute(urlLike);
    }
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function(input, init) {
    try {
      let originalRequest = null;
      let urlStr = null;
      if (input instanceof Request) {
        originalRequest = input;
        urlStr = originalRequest.url;
      } else {
        urlStr = String(input);
      }
      const rewritten = rewriteLeaderboardUrl(urlStr);
      if (rewritten !== urlStr) {
        if (originalRequest) {
          const newReqInit = {
            method: originalRequest.method,
            headers: originalRequest.headers,
            mode: originalRequest.mode,
            credentials: originalRequest.credentials,
            cache: originalRequest.cache,
            redirect: originalRequest.redirect,
            referrer: originalRequest.referrer,
            referrerPolicy: originalRequest.referrerPolicy,
            integrity: originalRequest.integrity,
            keepalive: originalRequest.keepalive,
            signal: originalRequest.signal
          };
          let body = null;
          try {
            const clone = originalRequest.clone();
            body = await clone.arrayBuffer().then(buf => buf.byteLength ? buf : null).catch(() => null);
          } catch (e) {
            body = null;
          }
          if (body) newReqInit.body = body;
          const newReq = new Request(rewritten, newReqInit);
          return nativeFetch(newReq);
        } else {
          return nativeFetch(rewritten, init);
        }
      }
      return nativeFetch(input, init);
    } catch (e) {
      return nativeFetch(input, init);
    }
  };

  const XHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    try {
      const rewritten = rewriteLeaderboardUrl(url);
      return XHROpen.call(this, method, rewritten, async === undefined ? true : async, user, password);
    } catch (e) {
      return XHROpen.call(this, method, url, async === undefined ? true : async, user, password);
    }
  };

  function applyHighlightToUid(uid) {
    if (!uid) return;
    const prev = document.querySelector('tr._13LmU');
    if (prev && prev.id !== uid + 'Row') prev.classList.remove('_13LmU');
    const tr = document.getElementById(uid + 'Row');
    if (tr && !tr.classList.contains('_13LmU')) tr.classList.add('_13LmU');
  }

  function installLocationChangeHook() {
    const _push = history.pushState;
    const _replace = history.replaceState;
    history.pushState = function(...args) {
      const rv = _push.apply(this, args);
      window.dispatchEvent(new Event('locationchange'));
      return rv;
    };
    history.replaceState = function(...args) {
      const rv = _replace.apply(this, args);
      window.dispatchEvent(new Event('locationchange'));
      return rv;
    };
    window.addEventListener('popstate', () => window.dispatchEvent(new Event('locationchange')));
  }

  let observer;
  function installObserver() {
    if (observer) return;
    observer = new MutationObserver(() => {
      applyHighlightToUid(getUidFromLocation());
    });
    observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
  }

  installLocationChangeHook();
  window.addEventListener('locationchange', () => {
    setTimeout(() => applyHighlightToUid(getUidFromLocation()), 50);
  });

  applyHighlightToUid(getUidFromLocation());
  installObserver();

  Object.defineProperty(window, 'kogamaLeaderboardInstalled', { value: true, configurable: false });
})();

(function tamperAutoBuyerIIFE() {
  // Only run on avatar/model pages
  const urlPath = location.pathname || '';
  if (!/^\/marketplace\/(model\/i-\d+\/|avatar\/a-\d+\/)/i.test(urlPath)) return;

  const ctx = (() => {
    const m1 = urlPath.match(/^\/marketplace\/avatar\/a-(\d+)\/?/i);
    if (m1) return { objectType: 'avatar', objectId: m1[1] };
    const m2 = urlPath.match(/^\/marketplace\/model\/i-(\d+)\/?/i);
    if (m2) return { objectType: 'model', objectId: m2[1] };
    return null;
  })();
  if (!ctx) return;

  const PRICE = { avatar: 140, model: 10 };
  const CREATOR_NON_ELITE = { avatar: 14, model: 1 };
  const CREATOR_ELITE = { avatar: 98, model: 7 };
  const INTERVAL_MS = 30000;
  const INTERVAL_SEC = INTERVAL_MS / 1000; // 30 seconds

  function css(id, rules) {
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = rules;
    document.head.appendChild(s);
  }

  css('kg-autobuy-styles', `
    /* Main Button Styling */
    #kg-ab-btn {
      margin-right: 8px;
      background: #f8d26f;
      color: #1f1f1f;
      border: none;
      padding: 8px 16px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
    }
    #kg-ab-btn:hover {
      background: #ffd36a;
      box-shadow: 0 8px 20px rgba(0,0,0,0.4);
    }

    /* Overlay */
    #kg-ab-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      z-index: 99998;
      display: none;
      backdrop-filter: blur(4px);
    }

    /* Panel */
    #kg-ab-panel {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 450px;
      max-width: 95%;
      background: #2a2a2a;
      color: #e0e0e0;
      border-radius: 16px;
      z-index: 99999;
      box-shadow: 0 40px 80px rgba(0,0,0,0.8);
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: none;
      border: 1px solid rgba(255,255,255,0.1);
    }

    /* Header */
    #kg-ab-panel .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
      font-weight: 900;
      font-size: 20px;
      color: #f8d26f;
      border-bottom: 2px solid rgba(248, 210, 111, 0.2);
      padding-bottom: 10px;
    }

    /* Close Button */
    #kg-ab-panel .close {
      background: transparent;
      border: none;
      color: #e0e0e0;
      font-size: 18px;
      cursor: pointer;
      transition: color 0.2s;
      padding: 4px;
      line-height: 1;
    }
    #kg-ab-panel .close:hover {
      color: #ffd36a;
    }

    /* Labels */
    #kg-ab-panel label {
      display: block;
      font-size: 14px;
      color: #b0b0b0;
      margin: 10px 0 6px 0;
      font-weight: 600;
    }

    /* Input */
    #kg-ab-panel input[type="number"] {
      width: 100%;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.15);
      background: #3c3c3c;
      color: #fff;
      box-sizing: border-box;
      font-size: 16px;
    }

    /* Action Buttons */
    #kg-ab-panel .btn {
      margin-top: 15px;
      width: 100%;
      padding: 12px 12px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      font-weight: 800;
      background: #f8d26f;
      color: #1f1f1f;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      transition: all 0.2s ease;
    }
    #kg-ab-panel .btn:hover {
      background: #ffd36a;
    }

    /* Pause/Resume Button */
    #kg-ab-panel .btn-pause {
      background: #e74c3c;
      color: #fff;
      display: none;
      margin-top: 10px;
    }
    #kg-ab-panel .btn-pause:hover {
      background: #c0392b;
    }

    /* Math Display (Counters) */
    #kg-ab-math {
      margin-top: 15px;
      padding: 12px;
      border-radius: 8px;
      background: #333333;
      font-size: 14px;
      color: #d0d0d0;
      line-height: 1.6;
    }
    #kg-ab-math strong {
      color: #f8d26f; /* Highlight the labels */
      font-weight: 700;
    }
    #kg-ab-math .value {
      text-align: right;
      font-weight: 600;
      color: #fff;
    }
    #kg-ab-math .compact-header {
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    #kg-ab-math .reward-grid {
        display: flex;
        justify-content: space-around;
        gap: 10px;
        margin-top: 8px;
        font-size: 13px;
        text-align: center;
    }
    #kg-ab-math .reward-item {
        flex-grow: 1;
        padding: 6px;
        border-radius: 6px;
        background: #2a2a2a;
    }

    /* ETA/Status Display */
    #kg-ab-eta-container {
      margin-top: 10px;
      font-size: 15px;
      color: #f8d26f;
      text-align: center;
      padding: 8px;
      border-radius: 8px;
      background: rgba(248, 210, 111, 0.1);
    }
    #kg-ab-eta-container strong {
      font-weight: 800;
      color: #ffd36a;
      font-size: 16px;
    }

    /* Logs */
    #kg-ab-logs {
      max-height: 150px;
      overflow-y: auto;
      margin-top: 15px;
      padding: 10px;
      border-radius: 8px;
      background: rgba(0,0,0,0.3);
      font-size: 12px;
      color: #a9c1d6;
      display: none;
      border: 1px solid rgba(255,255,255,0.05);
      white-space: nowrap;
      overflow-x: hidden;
    }
    #kg-ab-logs div {
      padding: 2px 0;
      border-bottom: 1px dashed rgba(255,255,255,0.05);
    }
    #kg-ab-logs div:last-child {
      border-bottom: none;
    }

    /* Footer */
    #kg-ab-footer {
      text-align: center;
      font-size: 10px;
      color: #777777;
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }

    /* Fixing the loop purchase button/display */
    #kg-ab-panel .controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Better formatting for the loop button's state */
    .purchase-running #kg-ab-start {
      display: none !important;
    }
    .purchase-running #kg-ab-pause {
      display: block !important;
    }
    .purchase-paused #kg-ab-pause {
      background: #2ecc71 !important;
      color: #fff !important;
    }
    .purchase-paused #kg-ab-pause:hover {
      background: #27ae60 !important;
    }
  `);

  function waitForParent(selector, callback) {
    const el = document.querySelector(selector);
    if (el) return callback(el);
    const obs = new MutationObserver(() => {
      const e = document.querySelector(selector);
      if (e) {
        obs.disconnect();
        callback(e);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  waitForParent('div.hR5CJ', (parent) => {
    const btn = document.createElement('button');
    btn.id = 'kg-ab-btn';
    btn.type = 'button';
    btn.textContent = 'LOOP PURCHASE';
    parent.insertBefore(btn, parent.firstChild);

    const overlay = document.createElement('div');
    overlay.id = 'kg-ab-overlay';
    document.body.appendChild(overlay);

    const panel = document.createElement('div');
    panel.id = 'kg-ab-panel';
    panel.innerHTML = `
      <div class="header">💰 Mass Purchase Tool <button class="close">✕</button></div>
      <label for="kg-ab-loops">Loops (times to buy)</label>
      <input id="kg-ab-loops" type="number" min="1" value="3" />

      <div id="kg-ab-math"></div>

      <div id="kg-ab-eta-container">Estimated Time Remaining: <strong id="kg-ab-eta">00:00:00</strong></div>

      <div class="controls">
        <div class="btn" id="kg-ab-start">Start Loop Purchase</div>
        <div class="btn btn-pause" id="kg-ab-pause">Pause</div>
      </div>

      <div id="kg-ab-logs"></div>
      <div id="kg-ab-footer">Usage might result in a punishment</div>
    `;
    document.body.appendChild(panel);

    const $loops = panel.querySelector('#kg-ab-loops');
    const $logs = panel.querySelector('#kg-ab-logs');
    const $start = panel.querySelector('#kg-ab-start');
    const $pause = panel.querySelector('#kg-ab-pause');
    const $close = panel.querySelector('.close');
    const $math = panel.querySelector('#kg-ab-math');
    const $eta = panel.querySelector('#kg-ab-eta');

    let running=false, paused=false;
    let etaInterval = null;
    let etaSeconds = 0;

    function log(msg) {
      const d = new Date().toLocaleTimeString();
      const el = document.createElement('div'); el.textContent = `[${d}] ${msg}`;
      $logs.prepend(el); $logs.style.display='block';
    }

    function formatTime(sec) {
      sec = Math.max(0, Math.round(sec || 0));
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function stopCountdown() {
      if (etaInterval) {
        clearInterval(etaInterval);
        etaInterval = null;
      }
    }

    function startCountdown() {
      if (etaInterval) clearInterval(etaInterval);

      etaInterval = setInterval(() => {
        if (!running || paused || etaSeconds <= 0) {
          if (!running || etaSeconds <= 0) {
              clearInterval(etaInterval);
              etaInterval = null;
              if (etaSeconds <= 0) $eta.textContent = '00:00:00';
          }
          return;
        }

        etaSeconds--;
        $eta.textContent = formatTime(etaSeconds);

      }, 1000);
    }
    function calculateTotalETASec(totalLoops, loopsCompleted) {
        const remainingPurchases = totalLoops - loopsCompleted;
        const intervalsNeeded = Math.max(0, remainingPurchases - 1);
        return intervalsNeeded * INTERVAL_SEC;
    }

    function updateMath(currentLoop = 0) {
      const loops = Math.max(1, parseInt($loops.value) || 1);

      const price = PRICE[ctx.objectType];
      const nonElite = CREATOR_NON_ELITE[ctx.objectType];
      const elite = CREATOR_ELITE[ctx.objectType];
      const totalCost = price * loops;
      const totalNonElite = nonElite * loops;
      const totalElite = elite * loops;

      const currentLoopDisplay = currentLoop > 0
        ? `<br/>Current Loop: <strong>${currentLoop}/${loops}</strong>`
        : '';

      $math.innerHTML = `
        <div class="compact-header">
          <strong>Object will be bought</strong> <span class="value">${loops} times</span><br/>
          <strong>Cost per object is</strong> <span class="value">${price} gold</span><br/>
          <strong>Total cost amounts to</strong> <span class="value">${totalCost} gold</span>
          ${currentLoopDisplay}
        </div>

        <strong>Creator receives:</strong>

        <div class="reward-grid">
          <div class="reward-item">
            <strong>If Elite:</strong><br/>
            <span class="value">${totalElite} gold</span>
          </div>
          <div class="reward-item">
            <strong>If Non Elite:</strong><br/>
            <span class="value">${totalNonElite} gold</span>
          </div>
        </div>
      `;

      if (!running) {
        const totalInitialETASec = calculateTotalETASec(loops, 0);
        etaSeconds = totalInitialETASec;
        $eta.textContent = formatTime(etaSeconds);
        stopCountdown();
      }
    }

    $loops.addEventListener('input', () => updateMath(0));
    updateMath();

    btn.addEventListener('click', ()=>{ overlay.style.display='block'; panel.style.display='block'; });
    $close.addEventListener('click', ()=>{
        overlay.style.display='none';
        panel.style.display='none';
        running=false;
        stopCountdown();
        $pause.style.display='none';
        panel.classList.remove('purchase-running', 'purchase-paused');
        updateMath(0);
    });
    overlay.addEventListener('click', ()=>{
        overlay.style.display='none';
        panel.style.display='none';
        running=false;
        stopCountdown();
        $pause.style.display='none';
        panel.classList.remove('purchase-running', 'purchase-paused');
        updateMath(0);
    });

    function purchaseOnce() {
      const fetchURL = ctx.objectType==='avatar'
        ? `https://www.kogama.com/model/market/a-${ctx.objectId}/purchase/`
        : `https://www.kogama.com/model/market/i-${ctx.objectId}/purchase/`;
      return fetch(fetchURL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({}) })
        .then(r=>r.ok).catch(()=>false);
    }

    async function runLoop() {
      if(running) return;
      running=true; paused=false;
      panel.classList.add('purchase-running');
      panel.classList.remove('purchase-paused');
      $logs.style.display='block';

      const loops = Math.max(1, parseInt($loops.value)||1);
      log(`Starting ${loops} purchases...`);
      etaSeconds = calculateTotalETASec(loops, 0);
      startCountdown();

      for (let i=0;i<loops;i++){
        while(paused) {
            stopCountdown();
            await new Promise(r=>setTimeout(r,500));
        }

        if (!etaInterval) startCountdown();
        updateMath(i + 1);

        const ok = await purchaseOnce();
        log(ok?`✅ Success ${i+1}/${loops}`:`❌ Failed ${i+1}/${loops}`);

        if (i < loops - 1) {
            const newRemainingETASec = calculateTotalETASec(loops, i + 1);
            etaSeconds = newRemainingETASec + INTERVAL_SEC;

            await new Promise(res=>setTimeout(res, INTERVAL_MS));
        } else {
             etaSeconds = 0;
        }
      }
      log('🎉 All purchases done.');
      running=false;
      stopCountdown();
      panel.classList.remove('purchase-running', 'purchase-paused');
      updateMath(loops);
    }

    $start.addEventListener('click', runLoop);
    $pause.addEventListener('click', ()=>{
      paused=!paused;
      $pause.textContent = paused ? 'Resume' : 'Pause';
      log(paused?'⏸️ Paused':'▶️ Resumed');
      if (paused) {
        panel.classList.add('purchase-paused');
      } else {
        panel.classList.remove('purchase-paused');
        startCountdown();
      }
    });
  });
})();
