// ==UserScript==
// @name         UtilifyV2
// @namespace    wee woo wee woo
// @version      2.3.1
// @description  A rewrite of previous niche adaptation with goal to enhance visuals & experience
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
// @run-at       document-start
// ==/UserScript==


// Extra CSS: Useless Footers begone, small fixes & improvements.
// DM BOX STYLES ARE HERE TOO, TEMPORARY HARD_CODED AND NOT PANEL HUE RELATED.
const style = document.createElement("style");
style.textContent = `
   ._33DXe { 
    position: relative; 
    overflow: hidden; 
}

._33DXe::before { /* accessibility shadowing, to be improved */
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        to right,
        rgba(0, 0, 0, 0.3) 40%,
        rgba(0, 0, 0, 0.2) 58%,
        rgba(0, 0, 0, 0.2) 63%,
        rgba(0, 0, 0, 0.1) 100%
    );
    z-index: 2; /* Higher than the element's z-index: 1 */
    pointer-events: none; /* Allows clicks to pass through */
}
._1q4mD ._1sUGu ._1u05O { background: none !important; background-color: transparent !important;}
/* badges margin increase */ .css-15830to {margin-bottom: 23px !important;}
.uwn5j  { 
    background-color: #171414 !important;
    border: none !important;
}
._375XK ._2XaOw {
    scrollbar-width: thin !important;
    scrollbar-color: #C3B398 transparent !important;
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
`;

(document.head || document.documentElement).appendChild(style);


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

(() => { // dot obfuscation (smarter, automatic)
  'use strict';
  const WHITELISTED_DOMAINS = ['youtube.com', 'youtu.be',"fonts.googleapis.com"];

  const URL_REGEX =
    /\bhttps?:\/\/(?:www\.)?([\w.-]+\.[a-z]{2,})(?:\/[^\s]*)?/gi;

  const isTextInput = el =>
    el &&
    (el.tagName === 'TEXTAREA' ||
      (el.tagName === 'INPUT' &&
        ['text', 'search', 'url', 'email', 'tel', 'password'].includes(el.type)));

  const isWhitelisted = domain =>
    WHITELISTED_DOMAINS.some(w => domain === w || domain.endsWith('.' + w));

  const obfuscateURLs = text =>
    text.replace(URL_REGEX, (match, domain) =>
      isWhitelisted(domain)
        ? match
        : match.replace(/\./g, '%2E')
    );

  const processValue = el => {
    const start = el.selectionStart;
    const end = el.selectionEnd;

    const next = obfuscateURLs(el.value);
    if (next === el.value) return;

    el.value = next;
    el.setSelectionRange(start, end);
  };

  document.addEventListener(
    'input',
    e => {
      if (!isTextInput(e.target)) return;
      if (e.inputType && !e.inputType.startsWith('insert')) return;
      processValue(e.target);
    },
    true
  );

  document.addEventListener(
    'paste',
    e => {
      if (!isTextInput(e.target)) return;

      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      document.execCommand('insertText', false, obfuscateURLs(text));
    },
    true
  );
})();



// Background Profile +  Effects 

(async function() {
    "use strict";
    const AVAILABLE_FILTERS = ["rain", "snow", "fireflies", "roses", "sparkles", "september"];

    const SNOWFLAKE_SVGS = [
        "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="white" d="M50,10 L55,45 L50,50 L45,45 Z M50,90 L55,55 L50,50 L45,55 Z M10,50 L45,55 L50,50 L45,45 Z M90,50 L55,55 L50,50 L55,45 Z M25,25 L45,45 L50,40 L40,30 Z M75,75 L55,55 L50,60 L60,70 Z M75,25 L55,45 L60,50 L70,40 Z M25,75 L45,55 L40,50 L30,60 Z"/><circle cx="50" cy="50" r="8" fill="white"/></svg>`),
        "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="white"><rect x="47" y="5" width="6" height="90" rx="2"/><rect x="5" y="47" width="90" height="6" rx="2"/><rect x="47" y="5" width="6" height="90" rx="2" transform="rotate(45 50 50)"/><rect x="47" y="5" width="6" height="90" rx="2" transform="rotate(-45 50 50)"/><circle cx="50" cy="50" r="10"/></g></svg>`)
    ];

    const ROSE_SVG = "data:image/svg+xml," + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <defs>
                <radialGradient id="roseGrad" cx="50%" cy="40%">
                    <stop offset="0%" style="stop-color:#ff6b9d;stop-opacity:1" />
                    <stop offset="60%" style="stop-color:#c9184a;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#a4133c;stop-opacity:1" />
                </radialGradient>
            </defs>
            <path fill="url(#roseGrad)" d="M50 20c-4 0-7 3-9 6-2-3-5-6-9-6-6 0-11 5-11 11 0 8 9 16 20 26 11-10 20-18 20-26 0-6-5-11-11-11z"/>
            <ellipse cx="50" cy="30" rx="8" ry="10" fill="#ff8fa3" opacity="0.6"/>
            <path d="M45 35c0 3 2 5 5 5s5-2 5-5" stroke="#c9184a" stroke-width="1.5" fill="none"/>
            <path fill="#2d6a4f" d="M50 46l-2 8c-1 4 0 8 3 10l-1-18zm0 0l2 8c1 4 0 8-3 10l1-18z"/>
        </svg>
    `);

    const SPARKLE_SVG = "data:image/svg+xml," + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <defs>
                <radialGradient id="sparkleGrad">
                    <stop offset="0%" style="stop-color:#ffc0cb;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#ffb3c6;stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:#c8bed8;stop-opacity:0" />
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#sparkleGrad)"/>
            <path fill="#fff" d="M50 10l3 37 37 3-37 3-3 37-3-37-37-3 37-3z"/>
        </svg>
    `);

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

    function injectTooltipStyles() {
        if (document.getElementById('bg-effects-tooltip-style')) return;
        
        const css = `
            @keyframes tooltip-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
            }
            
            .bg-effects-tooltip {
                animation: tooltip-float 2s ease-in-out infinite;
            }
            
            .bg-effects-badge {
                display: inline-block;
                padding: 3px 8px;
                margin: 2px;
                background: linear-gradient(135deg, rgba(255, 192, 203, 0.2), rgba(200, 190, 220, 0.15));
                border: 1px solid rgba(255, 192, 203, 0.3);
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                color: #ffc0cb;
                letter-spacing: 0.3px;
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'bg-effects-tooltip-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function showTooltip(target) {
        if (tooltip) return;
        
        injectTooltipStyles();
        
        tooltip = document.createElement("div");
        tooltip.className = 'bg-effects-tooltip';
        Object.assign(tooltip.style, {
            position: "fixed",
            zIndex: "100000",
            background: "linear-gradient(135deg, rgba(26, 27, 30, 0.98), rgba(35, 36, 40, 0.98))",
            color: "#e8e8ee",
            padding: "14px 18px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 192, 203, 0.3)",
            fontSize: "13px",
            boxShadow: "0 8px 32px rgba(255, 192, 203, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            pointerEvents: "none",
            backdropFilter: "blur(12px)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            maxWidth: "320px"
        });
        
        const badges = AVAILABLE_FILTERS.map(f => 
            `<span class="bg-effects-badge">${f}</span>`
        ).join('');
        
        tooltip.innerHTML = `
            <div style="margin-bottom:8px; font-weight:600; color:#ffc0cb; letter-spacing:0.5px;">
                ✦ Available Effects
            </div>
            <div style="line-height:1.8;">
                ${badges}
            </div>
            <div style="margin-top:10px; font-size:11px; color:rgba(200, 190, 220, 0.6); font-style:italic;">
                Use: filter: effect1, effect2
            </div>
        `;
        
        document.body.appendChild(tooltip);
        updateTooltipPos(target);
    }

    function updateTooltipPos(target) {
        if (!tooltip) return;
        const r = target.getBoundingClientRect();
        const tooltipHeight = tooltip.offsetHeight;
        tooltip.style.left = Math.max(10, r.left) + "px";
        tooltip.style.top = Math.max(10, r.top - tooltipHeight - 10) + "px";
    }

    function removeTooltip() {
        if (tooltip) {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                tooltip?.remove();
                tooltip = null;
            }, 200);
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
            
            const scrollHandler = () => this.resize();
            addEventListener("scroll", scrollHandler);
            this.cleanup = () => removeEventListener("scroll", scrollHandler);
        }

        loop() {
            if (!document.contains(this.container)) {
                this.cleanup?.();
                return;
            }
            this.ctx.clearRect(0, 0, this.w, this.h);
            this.updateAndDraw();
            requestAnimationFrame(this.loop);
        }

        destroy() {
            this.observer?.disconnect();
            this.container?.remove();
            this.cleanup?.();
        }
    }

    class RainSystem extends ParticleSystem {
        initParticles() {
            for (let i = 0; i < 60; i++) {
                this.particles.push(this.reset({}));
            }
        }
        
        reset(p) {
            p.x = Math.random() * this.w;
            p.y = Math.random() * -this.h;
            p.z = Math.random() * 0.6 + 0.4;
            p.len = Math.random() * 20 + 15;
            p.vy = (Math.random() * 8 + 12) * p.z;
            return p;
        }
        
        updateAndDraw() {
            this.ctx.lineWidth = 1.5;
            this.ctx.lineCap = "round";
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.h);
            gradient.addColorStop(0, "rgba(200, 220, 255, 0.4)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0.2)");
            this.ctx.strokeStyle = gradient;
            
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
                const img = new Image();
                img.src = s;
                return img;
            });
            this.start();
        }
        
        initParticles() {
            for (let i = 0; i < 80; i++) {
                this.particles.push(this.reset({}));
            }
        }
        
        reset(p) {
            p.x = Math.random() * this.w;
            p.y = Math.random() * -this.h;
            p.z = Math.random() * 0.6 + 0.4;
            p.size = (Math.random() * 15 + 12) * p.z;
            p.vy = (Math.random() * 0.8 + 0.5) * p.z;
            p.sway = Math.random() * 0.08;
            p.swayOff = Math.random() * Math.PI * 2;
            p.rot = Math.random() * 360;
            p.rotSpeed = (Math.random() - 0.5) * 0.6;
            p.img = this.imgs[Math.floor(Math.random() * this.imgs.length)];
            p.alpha = 0.6 + Math.random() * 0.3;
            return p;
        }
        
        updateAndDraw() {
            for (const p of this.particles) {
                p.y += p.vy;
                p.swayOff += p.sway;
                p.x += Math.sin(p.swayOff) * 0.6;
                p.rot += p.rotSpeed;
                
                if (p.y > this.h + 30) this.reset(p);
                
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rot * Math.PI / 180);
                this.ctx.globalAlpha = p.alpha;
                
                if (p.img.complete) {
                    this.ctx.drawImage(p.img, -p.size/2, -p.size/2, p.size, p.size);
                }
                
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
            for (let i = 0; i < 50; i++) {
                this.particles.push(this.reset({}));
            }
        }
        
        reset(p) {
            p.x = Math.random() * this.w;
            p.y = Math.random() * this.h;
            p.vx = (Math.random() - 0.5) * 0.8;
            p.vy = (Math.random() - 0.5) * 0.8;
            p.phase = Math.random() * Math.PI * 2;
            p.phaseSpeed = 0.04 + Math.random() * 0.04;
            p.size = Math.random() * 2 + 1.5;
            return p;
        }
        
        updateAndDraw() {
            for (const p of this.particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.phase += p.phaseSpeed;
                
                if (p.x < -10) p.x = this.w + 10;
                if (p.x > this.w + 10) p.x = -10;
                if (p.y < -10) p.y = this.h + 10;
                if (p.y > this.h + 10) p.y = -10;
                
                const glow = (Math.sin(p.phase) + 1) / 2;
                const alpha = 0.4 + glow * 0.6;
                
                this.ctx.shadowBlur = 20 * glow;
                this.ctx.shadowColor = "rgba(255, 250, 200, 1)";
                this.ctx.fillStyle = `rgba(255, 250, 200, ${alpha})`;
                
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size + glow * 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.shadowBlur = 0;
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
            for (let i = 0; i < 35; i++) {
                this.particles.push(this.reset({}));
            }
        }
        
        reset(p) {
            p.x = Math.random() * this.w;
            p.y = Math.random() * -this.h - 50;
            p.vy = Math.random() * 0.7 + 0.5;
            p.vx = (Math.random() - 0.5) * 0.3;
            p.rot = Math.random() * 360;
            p.rotSpeed = (Math.random() - 0.5) * 0.8;
            p.size = Math.random() * 18 + 15;
            p.sway = Math.random() * 0.05;
            p.swayOff = Math.random() * Math.PI * 2;
            return p;
        }
        
        updateAndDraw() {
            for (const p of this.particles) {
                p.y += p.vy;
                p.swayOff += p.sway;
                p.x += p.vx + Math.sin(p.swayOff) * 0.4;
                p.rot += p.rotSpeed;
                
                if (p.y > this.h + 50) this.reset(p);
                
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rot * Math.PI / 180);
                this.ctx.globalAlpha = 0.9;
                
                if (this.img.complete) {
                    this.ctx.drawImage(this.img, -p.size/2, -p.size/2, p.size, p.size);
                }
                
                this.ctx.restore();
            }
        }
    }
    class SparkleSystem extends ParticleSystem {
        constructor(target) {
            super(target);
            this.img = new Image();
            this.img.src = SPARKLE_SVG;
            this.start();
        }
        
        initParticles() {
            for (let i = 0; i < 40; i++) {
                this.particles.push(this.reset({}));
            }
        }
        
        reset(p) {
            p.x = Math.random() * this.w;
            p.y = Math.random() * this.h;
            p.phase = Math.random() * Math.PI * 2;
            p.phaseSpeed = 0.03 + Math.random() * 0.03;
            p.size = Math.random() * 25 + 20;
            p.floatSpeed = (Math.random() - 0.5) * 0.3;
            p.lifetime = Math.random() * 200 + 150;
            p.age = 0;
            return p;
        }
        
        updateAndDraw() {
            for (const p of this.particles) {
                p.age++;
                p.phase += p.phaseSpeed;
                p.y += p.floatSpeed;
                
                if (p.age > p.lifetime) this.reset(p);
                
                const twinkle = (Math.sin(p.phase) + 1) / 2;
                const lifeFade = Math.min(p.age / 50, 1) * Math.min((p.lifetime - p.age) / 50, 1);
                const alpha = twinkle * 0.7 * lifeFade;
                
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.globalAlpha = alpha;
                
                if (this.img.complete) {
                    this.ctx.drawImage(this.img, -p.size/2, -p.size/2, p.size, p.size);
                }
                
                this.ctx.restore();
            }
        }
    }
    class SeptemberSystem {
        constructor(target) {
            this.rain = new RainSystem(target);
            this.sparkles = new SparkleSystem(target);
            this.rain.start();
        }
        
        destroy() {
            this.rain?.destroy();
            this.sparkles?.destroy();
        }
    }

    async function fetchGameImage(id) {
        try {
            const response = await fetch(`https://www.kogama.com/games/play/${id}/`);
            const html = await response.text();
            const match = html.match(/options\.bootstrap\s*=\s*({.*?});/s);
            if (!match) return "";
            
            const data = JSON.parse(match[1]);
            return data.object?.images?.large || 
                   Object.values(data.object?.images || {})[0] || "";
        } catch (err) {
            console.error('Failed to fetch game image:', err);
            return "";
        }
    }

    async function fetchImgurImage(id) {
        for (const ext of ["png", "jpg", "gif", "jpeg"]) {
            const url = `https://i.imgur.com/${id}.${ext}`;
            try {
                const response = await fetch(url, { method: "HEAD" });
                if (response.ok) return url;
            } catch {}
        }
        return "";
    }

    const activeSystems = [];

    async function applyEffects() {
        try {
            activeSystems.forEach(sys => sys.destroy?.());
            activeSystems.length = 0;
            
            const descElement = await waitForElement("div._1aUa_");
            const text = descElement.textContent || "";
            const match = /(?:\|\|)?Background:\s*(?:i-([a-zA-Z0-9]+)|(\d+))(?:,\s*filter:\s*([a-z, ]+))?/i.exec(text);
            
            if (!match) return;
            
            const imgurId = match[1];
            const gameId = match[2];
            const imageUrl = imgurId 
                ? await fetchImgurImage(imgurId) 
                : await fetchGameImage(gameId);
            
            if (!imageUrl) {
                console.warn('No image URL found');
                return;
            }
            
            const bgElement = document.querySelector("._33DXe");
            if (!bgElement) return;
            
            Object.assign(bgElement.style, {
                transition: "opacity 0.3s ease-in",
                opacity: "1",
                backgroundImage: `url("${imageUrl}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                position: "absolute",
                filter: "blur(4px)",
                zIndex: "1"
            });
            
            // Apply filters if specified
            if (match[3]) {
                const filters = match[3].split(",").map(f => f.trim().toLowerCase());
                
                filters.forEach(filter => {
                    let system;
                    switch(filter) {
                        case "rain":
                            system = new RainSystem(bgElement);
                            system.start();
                            activeSystems.push(system);
                            break;
                        case "snow":
                            system = new SnowSystem(bgElement);
                            activeSystems.push(system);
                            break;
                        case "fireflies":
                            system = new FireflySystem(bgElement);
                            activeSystems.push(system);
                            break;
                        case "roses":
                            system = new RoseSystem(bgElement);
                            activeSystems.push(system);
                            break;
                        case "sparkles":
                            system = new SparkleSystem(bgElement);
                            activeSystems.push(system);
                            break;
                        case "september":
                            system = new SeptemberSystem(bgElement);
                            activeSystems.push(system);
                            break;
                    }
                });
            }
            
            console.log('Background effects applied successfully');
            
        } catch (err) {
            console.error('Failed to apply effects:', err);
        }
    }
    const inputObserver = new MutationObserver(() => {
        const textarea = document.querySelector("textarea#description");
        
        if (textarea && !textarea._bgEffectsMonitored) {
            textarea._bgEffectsMonitored = true;
            
            textarea.addEventListener("input", (e) => {
                const value = e.target.value.toLowerCase();
                if (value.includes("filter:")) {
                    showTooltip(e.target);
                } else {
                    removeTooltip();
                }
            });
            
            textarea.addEventListener("blur", removeTooltip);
            textarea.addEventListener("focus", (e) => {
                if (e.target.value.toLowerCase().includes("filter:")) {
                    showTooltip(e.target);
                }
            });
        }
    });

    inputObserver.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
    if (document.readyState === "loading") {
        addEventListener("DOMContentLoaded", applyEffects);
    } else {
        applyEffects();
    }

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

(function() { // copy description
    'use strict';
    
    let observer = null;
    let buttonAdded = false;
    const injectStyles = () => {
        if (document.getElementById('ethereal-copy-style')) return;
        
        const css = `
            @keyframes sparkle-pulse {
                0%, 100% { opacity: 0.6; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.1); }
            }
            
            @keyframes shimmer-sweep {
                0% { background-position: -200% center; }
                100% { background-position: 200% center; }
            }
            
            @keyframes float-up {
                from { opacity: 0; transform: translate(-50%, 10px); }
                to { opacity: 1; transform: translate(-50%, 0); }
            }
            
            .ethereal-copy-btn {
                margin-left: 8px !important;
                width: 26px !important;
                height: 26px !important;
                border: 1px solid rgba(255, 192, 203, 0.3) !important;
                border-radius: 6px !important;
                background: linear-gradient(135deg, rgba(255, 192, 203, 0.15), rgba(200, 190, 220, 0.1)) !important;
                backdrop-filter: blur(8px) !important;
                color: #ffc0cb !important;
                font-size: 14px !important;
                cursor: pointer !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                vertical-align: middle !important;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                position: relative !important;
                top: -1px !important;
                box-shadow: 0 2px 8px rgba(255, 192, 203, 0.2) !important;
                overflow: hidden !important;
            }
            
            .ethereal-copy-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -200%;
                width: 200%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(255, 192, 203, 0.3) 50%, 
                    transparent 100%);
                transition: left 0.6s ease;
            }
            
            .ethereal-copy-btn:hover {
                background: linear-gradient(135deg, rgba(255, 192, 203, 0.25), rgba(200, 190, 220, 0.2)) !important;
                border-color: rgba(255, 192, 203, 0.5) !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 16px rgba(255, 192, 203, 0.3) !important;
            }
            
            .ethereal-copy-btn:hover::before {
                left: 200%;
            }
            
            .ethereal-copy-btn:active {
                transform: translateY(0) !important;
            }
            
            .ethereal-copy-btn-icon {
                animation: sparkle-pulse 3s ease-in-out infinite;
            }
            
            .ethereal-notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                background: linear-gradient(135deg, rgba(255, 192, 203, 0.95) 0%, rgba(200, 190, 220, 0.9) 100%);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 10px;
                box-shadow: 0 8px 24px rgba(255, 192, 203, 0.4);
                color: #1a1b1e;
                font: 600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                z-index: 999999;
                opacity: 0;
                animation: float-up 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                pointer-events: none;
            }
            
            .ethereal-notification::before {
                content: '✓';
                margin-right: 8px;
                font-size: 14px;
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'ethereal-copy-style';
        style.textContent = css;
        document.head.appendChild(style);
    };

    const showNotification = (message) => {
        document.querySelectorAll('.ethereal-notification').forEach(n => n.remove());
        
        const notif = document.createElement('div');
        notif.className = 'ethereal-notification';
        notif.textContent = message;
        
        document.body.appendChild(notif);
        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transform = 'translate(-50%, -10px)';
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    };

    const addCopyButton = () => {
        if (buttonAdded) return;
        const bioContent = document.querySelector('div[itemprop="description"]');
        if (!bioContent) return;
        
        const bioContainer = bioContent.parentElement?.querySelector('h2');
        if (!bioContainer) return;
        if (bioContainer.querySelector('.ethereal-copy-btn')) {
            buttonAdded = true;
            return;
        }
        
        const btn = document.createElement('button');
        btn.className = 'ethereal-copy-btn';
        btn.title = 'Copy bio to clipboard';
        btn.innerHTML = '<span class="ethereal-copy-btn-icon">⎘</span>';
        
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            const textToCopy = bioContent.innerText?.trim() || '';
            
            if (!textToCopy) {
                showNotification('Bio is empty');
                return;
            }
            
            try {
                await navigator.clipboard.writeText(textToCopy);
                showNotification('Copied to clipboard');
                btn.style.transform = 'translateY(-2px) scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);
            } catch (err) {
                console.error('Failed to copy:', err);
                showNotification('Copy failed');
            }
        });
        
        bioContainer.style.display = 'inline-flex';
        bioContainer.style.alignItems = 'center';
        bioContainer.appendChild(btn);
        buttonAdded = true;
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    };

    const init = () => {
        injectStyles();
        addCopyButton();
        if (!buttonAdded) {
            observer = new MutationObserver(() => {
                addCopyButton();
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            setTimeout(() => {
                if (observer) {
                    observer.disconnect();
                    observer = null;
                }
            }, 10000);
        }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// Last Created, Last Seen, Last Played Game, InternetArchive
(() => {
    'use strict';
    const injectStyles = () => {
        const css = `
            @keyframes sparkle {
                0%, 100% { opacity: 0.4; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.15); }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes shimmer {
                0% { background-position: -200% center; }
                100% { background-position: 200% center; }
            }
            
            .profile-info-wrapper {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                margin-top: 6px;
                gap: 10px;
                animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .profile-info-item {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: linear-gradient(135deg, rgba(255, 192, 203, 0.08) 0%, rgba(200, 190, 220, 0.05) 100%);
                border: 1px solid rgba(255, 192, 203, 0.2);
                border-radius: 8px;
                font-size: 12px;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(8px);
                position: relative;
                overflow: hidden;
            }
            
            .profile-info-item::before {
                content: '';
                position: absolute;
                top: 0;
                left: -200%;
                width: 200%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(255, 192, 203, 0.15) 50%, 
                    transparent 100%);
                transition: left 0.6s ease;
            }
            
            .profile-info-item:hover {
                background: linear-gradient(135deg, rgba(255, 192, 203, 0.15) 0%, rgba(200, 190, 220, 0.1) 100%);
                border-color: rgba(255, 192, 203, 0.4);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(255, 192, 203, 0.2);
            }
            
            .profile-info-item:hover::before {
                left: 200%;
            }
            
            .profile-info-item.expanded {
                max-width: 450px;
                background: linear-gradient(135deg, rgba(255, 192, 203, 0.12) 0%, rgba(200, 190, 220, 0.08) 100%);
            }
            
            .profile-info-icon {
                font-size: 14px;
                opacity: 0.8;
                animation: sparkle 3s ease-in-out infinite;
            }
            
            .profile-info-text {
                color: #e8e8ee;
                font-weight: 500;
                transition: all 0.25s ease;
            }
            
            .profile-info-full {
                color: rgba(255, 192, 203, 0.9);
                font-weight: 400;
                font-size: 11px;
                display: none;
            }
            
            .profile-link-item {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: linear-gradient(135deg, rgba(200, 190, 220, 0.1) 0%, rgba(255, 192, 203, 0.08) 100%);
                border: 1px solid rgba(200, 190, 220, 0.25);
                border-radius: 8px;
                font-size: 12px;
                color: #ffc0cb;
                text-decoration: none;
                white-space: nowrap;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(8px);
                font-weight: 500;
            }
            
            .profile-link-item:hover {
                background: linear-gradient(135deg, rgba(200, 190, 220, 0.18) 0%, rgba(255, 192, 203, 0.15) 100%);
                border-color: rgba(255, 192, 203, 0.5);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(200, 190, 220, 0.25);
                color: #ffb0bb;
            }
            
            .profile-link-icon {
                font-size: 14px;
                animation: sparkle 3.5s ease-in-out infinite;
                animation-delay: 0.5s;
            }
            
            .copy-success {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                background: linear-gradient(135deg, rgba(255, 192, 203, 0.95) 0%, rgba(200, 190, 220, 0.9) 100%);
                color: #1a1b1e;
                border-radius: 10px;
                font-size: 13px;
                font-weight: 600;
                box-shadow: 0 8px 24px rgba(255, 192, 203, 0.4);
                z-index: 999999;
                animation: fadeIn 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(10px);
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };

    const showCopySuccess = (text) => {
        const notification = document.createElement('div');
        notification.className = 'copy-success';
        notification.textContent = `✓ ${text}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    };

    const formatCompactDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatVerbose = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const daySuffix = (day % 100 >= 11 && day % 100 <= 13) 
            ? 'th' 
            : ['st', 'nd', 'rd'][day % 10 - 1] || 'th';
        
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        const tzOffset = -date.getTimezoneOffset();
        const tzString = `GMT${tzOffset >= 0 ? '+' : '-'}${Math.floor(Math.abs(tzOffset) / 60)}`;
        
        return `${day}${daySuffix} of ${month} ${year}, ${hours}:${minutes} ${tzString}`;
    };

    const timeAgo = (dateString) => {
        const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
        
        const intervals = [
            { value: 31536000, unit: 'y' },
            { value: 2592000, unit: 'mo' },
            { value: 86400, unit: 'd' },
            { value: 3600, unit: 'h' },
            { value: 60, unit: 'm' }
        ];
        
        for (const interval of intervals) {
            const val = Math.floor(seconds / interval.value);
            if (val >= 1) return `${val}${interval.unit} ago`;
        }
        
        return 'just now';
    };

    const createToggleInfo = (icon, compact, full, iconDelay = 0) => {
        const container = document.createElement('div');
        container.className = 'profile-info-item';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'profile-info-icon';
        iconSpan.textContent = icon;
        iconSpan.style.animationDelay = `${iconDelay}s`;
        
        const compactSpan = document.createElement('span');
        compactSpan.className = 'profile-info-text';
        compactSpan.textContent = compact;
        
        const fullSpan = document.createElement('span');
        fullSpan.className = 'profile-info-full';
        fullSpan.textContent = full;
        
        container.appendChild(iconSpan);
        container.appendChild(compactSpan);
        container.appendChild(fullSpan);
        
        let isExpanded = false;
        
        container.addEventListener('click', (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                container.classList.add('expanded');
                compactSpan.style.display = 'none';
                fullSpan.style.display = 'inline';
                
                // Copy to clipboard
                navigator.clipboard?.writeText(full).then(() => {
                    showCopySuccess('Copied to clipboard');
                });
            } else {
                container.classList.remove('expanded');
                compactSpan.style.display = 'inline';
                fullSpan.style.display = 'none';
            }
        });
        
        return container;
    };

    const getBootstrapData = () => {
        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
            const text = script.textContent;
            if (!text || !text.includes('options.bootstrap')) continue;
            
            try {
                const match = text.match(/options\.bootstrap\s*=\s*({[\s\S]*?});/);
                if (!match) continue;
                
                const data = Function(`"use strict"; return (${match[1]});`)();
                return data?.object || null;
            } catch (err) {
                console.error('Bootstrap parse error:', err);
            }
        }
        return null;
    };

    const getLastPlayedGame = () => {
        try {
            const cached = localStorage.getItem('__amplify__cache:game:last-played');
            if (!cached) return null;
            
            const parsed = JSON.parse(cached);
            return parsed?.data || null;
        } catch {
            return null;
        }
    };

    const enhance = () => {
        const container = document.querySelector('._13UrL ._23KvS ._1jTCU');
        const span = container?.querySelector('span._20K92');
        
        if (!container || !span || span.dataset.enhanced === 'true') {
            return false;
        }
        
        container.style.zIndex = '9';
        const bootstrap = getBootstrapData();
        if (!bootstrap || !bootstrap.created || !bootstrap.last_ping) {
            return false;
        }
        
        const { created, last_ping, is_me } = bootstrap;
        const gameInfo = getLastPlayedGame();

        const wrapper = document.createElement('div');
        wrapper.className = 'profile-info-wrapper';
        wrapper.appendChild(createToggleInfo(
            '📅',
            formatCompactDate(created),
            formatVerbose(created),
            0
        ));
        wrapper.appendChild(createToggleInfo(
            '👁️',
            timeAgo(last_ping),
            formatVerbose(last_ping),
            0.3
        ));
        if (is_me && gameInfo?.id && gameInfo?.name) {
            const gameLink = document.createElement('a');
            gameLink.className = 'profile-link-item';
            gameLink.href = `https://www.kogama.com/games/play/${gameInfo.id}/`;
            gameLink.target = '_blank';
            gameLink.rel = 'noopener';
            gameLink.title = gameInfo.name;
            
            const gameIcon = document.createElement('span');
            gameIcon.className = 'profile-link-icon';
            gameIcon.textContent = '🎮';
            
            const gameName = document.createElement('span');
            gameName.textContent = gameInfo.name.length > 18 
                ? gameInfo.name.substring(0, 18) + '...' 
                : gameInfo.name;
            
            gameLink.appendChild(gameIcon);
            gameLink.appendChild(gameName);
            wrapper.appendChild(gameLink);
        }
        const archiveLink = document.createElement('a');
        archiveLink.className = 'profile-link-item';
        archiveLink.href = `https://web.archive.org/web/*/${location.href}`;
        archiveLink.target = '_blank';
        archiveLink.rel = 'noopener';
        archiveLink.title = 'View on Internet Archive';
        
        const archiveIcon = document.createElement('span');
        archiveIcon.className = 'profile-link-icon';
        archiveIcon.textContent = '📜';
        
        const archiveText = document.createElement('span');
        archiveText.textContent = 'Archive';
        
        archiveLink.appendChild(archiveIcon);
        archiveLink.appendChild(archiveText);
        wrapper.appendChild(archiveLink);
        
        span.dataset.enhanced = 'true';
        span.innerHTML = '';
        span.appendChild(wrapper);
        
        return true;
    };

    const init = () => {
        injectStyles();
        setTimeout(() => {
            if (!enhance()) {
                const observer = new MutationObserver((mutations, obs) => {
                    if (enhance()) {
                        obs.disconnect();
                    }
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                setTimeout(() => observer.disconnect(), 5000);
            }
        }, 400);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
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
        if (!logoLink) return false;

        logoLink.title = "You're using UtilifyV2 by Simon! Thank you!";
        logoLink.href = "https://github.com/gxthickitty";

        const logoImg = logoLink.querySelector('img');
        if (!logoImg) return false;

        logoImg.removeAttribute('srcset');
        logoImg.src = "https://i.imgur.com/me1hlBB.gif";
        logoImg.alt = "You're using UtilifyV2 by Simon! Thank you!";

        logoImg.style.setProperty('object-fit', 'cover', 'important');
        logoImg.style.setProperty('object-position', 'center', 'important');

        return true;
    }

    if (modifyLogo()) return;

    const observer = new MutationObserver(() => {
        if (modifyLogo()) observer.disconnect();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();




(function() {
  'use strict';
  function getBootstrapData() {
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const text = script.textContent;
      if (!text || !text.includes('options.bootstrap')) continue;
      
      try {
        const match = text.match(/options\.bootstrap\s*=\s*({[\s\S]*?});/);
        if (!match) continue;
        
        const data = Function(`"use strict"; return (${match[1]});`)();
        return data?.object || null;
      } catch {}
    }
    return null;
  }

  function shouldRun() {
    const bootstrap = getBootstrapData();
    if (!bootstrap) return false;
    
    //  EXACT PROFILE CHECK [ IS_ME = TRUE ]
    if (!bootstrap.is_me || bootstrap.is_me !== true) return false;
    
    const userId = bootstrap.id;
    if (!userId) return false;
    
    // Must be on exact own-profile URL, no subpages
    const urlPattern = new RegExp(`^https://www\\.kogama\\.com/profile/${userId}/?$`);
    if (!urlPattern.test(window.location.href)) return false;
    
    return { userId, username: bootstrap.username };
  }

  const profileData = shouldRun();
  if (!profileData) return;

  const { userId, username } = profileData;
  function injectStyles() {
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
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.feed-manager-btn {
  margin-left: 8px !important;
  width: 26px !important;
  height: 26px !important;
  border: 1px solid rgba(255, 192, 203, 0.3) !important;
  border-radius: 6px !important;
  background: linear-gradient(135deg, rgba(255, 192, 203, 0.15), rgba(200, 190, 220, 0.1)) !important;
  backdrop-filter: blur(8px) !important;
  color: #ffc0cb !important;
  font-size: 14px !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  vertical-align: middle !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative !important;
  top: -1px !important;
  box-shadow: 0 2px 8px rgba(255, 192, 203, 0.2) !important;
}

.feed-manager-btn:hover {
  background: linear-gradient(135deg, rgba(255, 192, 203, 0.25), rgba(200, 190, 220, 0.2)) !important;
  border-color: rgba(255, 192, 203, 0.5) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 16px rgba(255, 192, 203, 0.3) !important;
}

#feed-manager-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 100000;
  display: none;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

#feed-manager-overlay.visible {
  display: flex;
}

#feed-manager-panel {
  width: min(800px, 92vw);
  max-height: 85vh;
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
  border: 1px solid rgba(200, 190, 220, 0.2);
  backdrop-filter: blur(20px);
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

#feed-manager-panel::before {
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

.panel-star-1, .panel-star-2, .panel-star-3,
.panel-star-4, .panel-star-5, .panel-star-6 {
  position: absolute;
  font-size: 12px;
  animation: sparkle 3s ease-in-out infinite;
  pointer-events: none;
}

.panel-star-1 { left: -1px; top: 20%; animation-delay: 0.5s; color: rgba(200, 190, 220, 0.6); }
.panel-star-2 { left: -1px; top: 50%; animation-delay: 1s; font-size: 14px; color: rgba(200, 190, 220, 0.6); }
.panel-star-3 { left: -1px; top: 80%; animation-delay: 1.5s; color: rgba(200, 190, 220, 0.6); }
.panel-star-4 { right: -1px; top: 30%; animation-delay: 0.7s; font-size: 10px; color: rgba(255, 192, 203, 0.5); }
.panel-star-5 { right: -1px; top: 60%; animation-delay: 1.2s; color: rgba(255, 192, 203, 0.5); }
.panel-star-6 { right: -1px; top: 85%; animation-delay: 1.8s; font-size: 13px; color: rgba(255, 192, 203, 0.5); }

#feed-manager-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(135deg, rgba(40, 42, 48, 0.8) 0%, rgba(30, 32, 38, 0.9) 100%);
  position: relative;
}

#feed-manager-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 192, 203, 0.3) 50%, transparent 100%);
}

.header-star-1, .header-star-2, .header-star-3 {
  position: absolute;
  color: rgba(255, 192, 203, 0.4);
  font-size: 10px;
  animation: sparkle 2.5s ease-in-out infinite;
}
.header-star-1 { left: 10%; top: 15px; animation-delay: 0.4s; }
.header-star-2 { left: 50%; top: 12px; animation-delay: 1.1s; }
.header-star-3 { right: 10%; top: 15px; animation-delay: 0.8s; }

#feed-manager-title {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 2px;
  color: rgba(200, 190, 220, 0.5);
  text-transform: uppercase;
  position: relative;
}

#feed-manager-title::before,
#feed-manager-title::after {
  content: '✦';
  position: absolute;
  color: rgba(255, 192, 203, 0.4);
  font-size: 10px;
  animation: sparkle 2s ease-in-out infinite;
}

#feed-manager-title::before { left: -14px; animation-delay: 0.3s; }
#feed-manager-title::after { right: -14px; animation-delay: 0.8s; }

.header-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.fm-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(255, 192, 203, 0.2) 0%, rgba(200, 190, 220, 0.15) 100%);
  color: #ffc0cb;
  border-radius: 10px;
  border: 1px solid rgba(255, 192, 203, 0.3);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 192, 203, 0.3);
  border-color: rgba(255, 192, 203, 0.5);
}

.fm-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.fm-btn-close {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d8d8de;
  padding: 8px 12px;
  font-size: 18px;
  line-height: 1;
}

.fm-btn-close:hover {
  background: rgba(255, 192, 203, 0.15);
  border-color: rgba(255, 192, 203, 0.3);
  color: #ffc0cb;
}

#feed-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(180deg, rgba(26, 27, 30, 0.95) 0%, rgba(22, 23, 26, 0.98) 100%);
  position: relative;
}

#feed-content::after {
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

.feed-item {
  background: linear-gradient(135deg, rgba(255, 192, 203, 0.03) 0%, rgba(200, 190, 220, 0.02) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  animation: slideUp 0.3s ease;
  position: relative;
}

.feed-item:hover {
  background: linear-gradient(135deg, rgba(255, 192, 203, 0.05) 0%, rgba(200, 190, 220, 0.03) 100%);
  border-color: rgba(255, 192, 203, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.feed-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #a8a8b8;
}

.feed-date {
  color: rgba(255, 192, 203, 0.6);
}

.feed-type-badge {
  display: inline-block;
  padding: 4px 10px;
  background: linear-gradient(135deg, rgba(255, 192, 203, 0.15), rgba(200, 190, 220, 0.1));
  border: 1px solid rgba(255, 192, 203, 0.3);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #ffc0cb;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.feed-text {
  color: #e8e8ee;
  line-height: 1.6;
  margin-bottom: 10px;
  word-wrap: break-word;
}

.feed-text a {
  color: #ffc0cb;
  text-decoration: none;
  transition: all 0.15s ease;
}

.feed-text a:hover {
  color: #ffb0bb;
  text-decoration: underline;
}

.feed-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.feed-btn {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: #c8c8d8;
  cursor: pointer;
  transition: all 0.15s ease;
}

.feed-btn:hover {
  background: rgba(255, 192, 203, 0.1);
  border-color: rgba(255, 192, 203, 0.3);
  color: #ffc0cb;
}

.feed-btn-delete {
  background: rgba(255, 100, 100, 0.1);
  border-color: rgba(255, 100, 100, 0.3);
  color: #ff6b6b;
}

.feed-btn-delete:hover {
  background: rgba(255, 100, 100, 0.2);
  border-color: rgba(255, 100, 100, 0.5);
}

.comments-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.comment-item {
  background: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #c8c8d8;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.comment-author {
  font-weight: 600;
  color: #ffc0cb;
  margin-bottom: 4px;
}

.comment-delete-btn {
  background: rgba(255, 100, 100, 0.1);
  border: 1px solid rgba(255, 100, 100, 0.3);
  color: #ff6b6b;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  padding: 0;
}

.comment-delete-btn:hover {
  background: rgba(255, 100, 100, 0.2);
  border-color: rgba(255, 100, 100, 0.5);
  transform: scale(1.1);
}

.loading-msg {
  text-align: center;
  padding: 40px 20px;
  color: rgba(200, 190, 220, 0.6);
  font-size: 14px;
}

.empty-msg {
  text-align: center;
  padding: 60px 20px;
  color: rgba(200, 190, 220, 0.5);
  font-size: 14px;
  font-style: italic;
}

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
`;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function createButton() {
    const checkBio = setInterval(() => {
      const bioHeader = document.querySelector('h2');
      if (!bioHeader) return;
      
      const copyBtn = bioHeader.querySelector('.ethereal-copy-btn');
      if (!copyBtn) return;
      
      clearInterval(checkBio);
      
      const btn = document.createElement('button');
      btn.className = 'feed-manager-btn';
      btn.title = 'Manage Feed';
      btn.innerHTML = '✦';
      
      btn.addEventListener('click', () => openPanel());
      
      copyBtn.parentNode.insertBefore(btn, copyBtn.nextSibling);
    }, 100);
  }

  function createPanel() {
    const overlay = document.createElement('div');
    overlay.id = 'feed-manager-overlay';
    
    overlay.innerHTML = `
      <div id="feed-manager-panel">
        <div class="panel-star-1">✦</div>
        <div class="panel-star-2">✧</div>
        <div class="panel-star-3">✦</div>
        <div class="panel-star-4">✧</div>
        <div class="panel-star-5">✦</div>
        <div class="panel-star-6">✧</div>
        
        <div id="feed-manager-header">
          <div class="header-star-1">✦</div>
          <div class="header-star-2">✧</div>
          <div class="header-star-3">✦</div>
          
          <div id="feed-manager-title">Feed Manager</div>
          
          <div class="header-controls">
            <button class="fm-btn" id="fm-delete-all">Delete All</button>
            <button class="fm-btn fm-btn-close" id="fm-close">×</button>
          </div>
        </div>
        
        <div id="feed-content">
          <div class="loading-msg">Loading feed...</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePanel();
    });
    
    document.getElementById('fm-close').addEventListener('click', closePanel);
    document.getElementById('fm-delete-all').addEventListener('click', deleteAllPosts);
    
    return overlay;
  }

  let panel = null;
  let feedData = [];
  let isLoading = false;
  let currentPage = 1;
  let hasMore = true;

  function openPanel() {
    if (!panel) panel = createPanel();
    panel.classList.add('visible');
    loadFeed();
  }

  function closePanel() {
    if (panel) panel.classList.remove('visible');
  }

  async function loadFeed(page = 1) {
    if (isLoading || (!hasMore && page > 1)) return;
    
    isLoading = true;
    const content = document.getElementById('feed-content');
    
    if (page === 1) {
      content.innerHTML = '<div class="loading-msg">Loading feed...</div>';
      feedData = [];
      currentPage = 1;
      hasMore = true;
    }
    
    try {
      const res = await fetch(`https://www.kogama.com/api/feed/${userId}/?page=${page}&count=20`, {
        method: 'GET',
        credentials: 'omit',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store' // Avoid disrupting native feed requests
      });
      
      if (!res.ok) throw new Error('Failed to load');
      
      const data = await res.json();
      let items = [];
      
      if (Array.isArray(data)) items = data;
      else if (Array.isArray(data?.feed)) items = data.feed;
      else if (Array.isArray(data?.data)) items = data.data;
      
      if (items.length === 0) {
        hasMore = false;
        if (page === 1) {
          content.innerHTML = '<div class="empty-msg">No feed posts found.</div>';
        }
      } else {
        feedData.push(...items);
        renderFeed();
        currentPage = page;
      }
    } catch (err) {
      content.innerHTML = '<div class="empty-msg">Failed to load feed.</div>';
      console.error('Feed load error:', err);
    } finally {
      isLoading = false;
    }
  }

  function renderFeed() {
    const content = document.getElementById('feed-content');
    content.innerHTML = '';
    
    feedData.forEach((item, index) => {
      const feedItem = createFeedItem(item, index);
      content.appendChild(feedItem);
    });
    
    // Infinite scroll
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    content.appendChild(sentinel);
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadFeed(currentPage + 1);
      }
    });
    
    observer.observe(sentinel);
  }

  function formatTimeAgo(dateString) {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function parseFeedData(item) {
    const feedType = item.feed_type || 'status_updated';
    let data = {};
    
    try {
      if (item._data && typeof item._data === 'string') {
        data = JSON.parse(item._data);
      } else if (item.data) {
        data = item.data;
      }
    } catch {
      data = item.data || {};
    }
    
    return { feedType, data };
  }

  function renderFeedContent(item) {
    const { feedType, data } = parseFeedData(item);
    
    // Check for YouTube URLs
    const youtubeMatch = (data.status_message || '').match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    
    if (youtubeMatch) {
      return `
        <div class="feed-type-badge">Shared a video</div>
        <div class="feed-text">
          <a href="https://youtube.com/watch?v=${youtubeMatch[1]}" target="_blank" rel="noopener" style="color:#ffc0cb;">
            🎥 YouTube Video
          </a>
        </div>
      `;
    }
    
    switch (feedType) {
      case 'marketplace_buy':
        const productName = data.product_name || 'Unknown Item';
        const productId = data.product_id || '';
        const creditorName = data.creditor_username || 'Unknown';
        const creditorId = data.creditor_profile_id || '';
        
        return `
          <div class="feed-type-badge">Marketplace Purchase</div>
          <div class="feed-text">
            Purchased <a href="https://www.kogama.com/marketplace/avatar/${productId}/" target="_blank" rel="noopener" style="color:#ffc0cb;">${escapeHtml(productName)}</a>
            ${creditorId ? `from <a href="https://www.kogama.com/profile/${creditorId}/" target="_blank" rel="noopener" style="color:#c8bed8;">${escapeHtml(creditorName)}</a>` : ''}
          </div>
        `;
        
      case 'badge_earned':
        const badgeName = item.badge_name || 'Unknown Badge';
        return `
          <div class="feed-type-badge">Badge Earned</div>
          <div class="feed-text">
            🏆 Earned the <span style="color:#ffc0cb; font-weight:600;">${escapeHtml(badgeName)}</span> badge
          </div>
        `;
        
      case 'wall_post':
        const authorName = item.profile_username || 'Someone';
        const authorId = item.profile_id || '';
        const message = data.status_message || '';
        
        return `
          <div class="feed-type-badge">Wall Post</div>
          <div class="feed-text">
            <a href="https://www.kogama.com/profile/${authorId}/" target="_blank" rel="noopener" style="color:#c8bed8; font-weight:600;">${escapeHtml(authorName)}</a> posted:
            <div style="margin-top:8px; padding-left:12px; border-left:2px solid rgba(255,192,203,0.3);">${escapeHtml(message)}</div>
          </div>
        `;
        
      case 'status_updated':
      default:
        const statusMessage = data.status_message || data.message || item.message || 'No content';
        return `
          <div class="feed-type-badge">Status Update</div>
          <div class="feed-text">${escapeHtml(statusMessage)}</div>
        `;
    }
  }

  function createFeedItem(item, index) {
    const div = document.createElement('div');
    div.className = 'feed-item';
    div.dataset.feedId = item.id;
    div.style.animationDelay = `${index * 0.05}s`;
    
    const timeAgo = formatTimeAgo(item.created);
    const fullDate = item.created ? new Date(item.created).toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : 'Unknown date';
    
    div.innerHTML = `
      <div class="feed-header">
        <div class="feed-meta">
          <span class="feed-date" title="${fullDate}">${timeAgo}</span>
        </div>
      </div>
      ${renderFeedContent(item)}
      <div class="feed-actions">
        <button class="feed-btn feed-btn-comments" data-feed-id="${item.id}">
          View Comments
        </button>
        <button class="feed-btn feed-btn-delete" data-feed-id="${item.id}">
          Delete Post
        </button>
      </div>
      <div class="comments-section" id="comments-${item.id}" style="display:none;"></div>
    `;
    
    // Event listeners
    div.querySelector('.feed-btn-comments').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleComments(item.id);
    });
    div.querySelector('.feed-btn-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      deletePost(item.id);
    });
    
    return div;
  }

  async function toggleComments(feedId) {
    const section = document.getElementById(`comments-${feedId}`);
    const btn = document.querySelector(`.feed-btn-comments[data-feed-id="${feedId}"]`);
    
    if (section.style.display === 'none') {
      section.innerHTML = '<div class="loading-msg" style="padding:20px;">Loading comments...</div>';
      section.style.display = 'block';
      
      try {
        const res = await fetch(`https://www.kogama.com/api/feed/${feedId}/comment/?count=50`, {
          method: 'GET',
          credentials: 'include'
        });
        
        const data = await res.json();
        const comments = Array.isArray(data?.data) ? data.data : [];
        
        if (comments.length === 0) {
          section.innerHTML = '<div class="empty-msg" style="padding:20px;">No comments</div>';
        } else {
          section.innerHTML = '';
          comments.forEach(comment => {
            const timeAgo = formatTimeAgo(comment.created);
            
            let commentText = '';
            try {
              if (comment._data && typeof comment._data === 'string') {
                const parsed = JSON.parse(comment._data);
                commentText = parsed.data || parsed.message || '';
              }
            } catch {
              commentText = comment.message || '';
            }
            
            const div = document.createElement('div');
            div.className = 'comment-item';
            div.dataset.commentId = comment.id;
            div.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <div class="comment-author">${escapeHtml(comment.profile_username || 'Unknown')}</div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <div style="font-size:11px; color:rgba(200,190,220,0.5);">${timeAgo}</div>
                  ${comment.can_delete ? `<button class="comment-delete-btn" data-comment-id="${comment.id}" data-feed-id="${feedId}" title="Delete comment">×</button>` : ''}
                </div>
              </div>
              <div>${escapeHtml(commentText)}</div>
            `;
            
            if (comment.can_delete) {
              div.querySelector('.comment-delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteComment(feedId, comment.id);
              });
            }
            
            section.appendChild(div);
          });
        }
        
        btn.textContent = 'Hide Comments';
      } catch (err) {
        section.innerHTML = '<div class="empty-msg" style="padding:20px;">Failed to load comments</div>';
        console.error('Comments load error:', err);
      }
    } else {
      section.style.display = 'none';
      section.innerHTML = '';
      btn.textContent = 'View Comments';
    }
  }

  async function deleteComment(feedId, commentId) {
    const commentEl = document.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
    if (!commentEl) return;
    
    if (!confirm('Delete this comment?')) return;
    
    try {
      await fetch(`https://www.kogama.com/api/feed/${feedId}/comment/${commentId}/`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      commentEl.style.opacity = '0';
      commentEl.style.transform = 'translateX(-10px)';
      setTimeout(() => {
        commentEl.remove();
        
        const section = document.getElementById(`comments-${feedId}`);
        if (section && section.querySelectorAll('.comment-item').length === 0) {
          section.innerHTML = '<div class="empty-msg" style="padding:20px;">No comments</div>';
        }
      }, 200);
    } catch (err) {
      alert('Failed to delete comment');
      console.error('Comment delete error:', err);
    }
  }

  async function deletePost(feedId) {
    const item = document.querySelector(`[data-feed-id="${feedId}"]`).closest('.feed-item');
    if (!item) return;
    
    if (!confirm('Delete this post?')) return;
    
    try {
      await fetch(`https://www.kogama.com/api/feed/${userId}/${feedId}/`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      setTimeout(() => {
        item.remove();
        feedData = feedData.filter(f => f.id !== feedId);
        if (feedData.length === 0) {
          document.getElementById('feed-content').innerHTML = '<div class="empty-msg">No feed posts found.</div>';
        }
      }, 200);
    } catch (err) {
      alert('Failed to delete post');
      console.error('Delete error:', err);
    }
  }

  async function deleteAllPosts() {
    if (!confirm(`Delete all ${feedData.length} posts? This cannot be undone.`)) return;
    
    const btn = document.getElementById('fm-delete-all');
    btn.disabled = true;
    btn.textContent = 'Deleting...';
    
    let deleted = 0;
    for (const item of feedData) {
      try {
        await fetch(`https://www.kogama.com/api/feed/${userId}/${item.id}/`, {
          method: 'DELETE',
          credentials: 'include'
        });
        deleted++;
        btn.textContent = `Deleted ${deleted}/${feedData.length}`;
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
    
    btn.textContent = 'Delete All';
    btn.disabled = false;
    feedData = [];
    document.getElementById('feed-content').innerHTML = '<div class="empty-msg">All posts deleted.</div>';
  }


  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  injectStyles();
  createButton();
})();

(function() { // Update Scan
  'use strict';
  
  const UPDATE_CHECK_URL = 'https://raw.githubusercontent.com/gxthickitty/Utilify/refs/heads/main/Script/Rewrite/Utilify.user.js';
  const INSTALL_URL = 'https://github.com/gxthickitty/Utilify/raw/refs/heads/main/Script/Rewrite/Utilify.user.js';
  const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  const STORAGE_KEY = 'utilify_last_update_check';
  function injectStyles() {
    if (document.getElementById('update-checker-style')) return;
    
    const css = `
      @keyframes sparkle-rotate {
        0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.6; }
        50% { transform: rotate(180deg) scale(1.2); opacity: 1; }
      }
      
      @keyframes float-in {
        from { 
          opacity: 0; 
          transform: translate(-50%, 20px) scale(0.9);
        }
        to { 
          opacity: 1; 
          transform: translate(-50%, 0) scale(1);
        }
      }
      
      @keyframes shimmer-bg {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      
      .update-notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        padding: 16px 24px;
        background: linear-gradient(
          135deg,
          rgba(255, 192, 203, 0.95) 0%,
          rgba(200, 190, 220, 0.95) 50%,
          rgba(255, 192, 203, 0.95) 100%
        );
        background-size: 200% 100%;
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.4);
        border-radius: 12px;
        box-shadow: 
          0 8px 32px rgba(255, 192, 203, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.5);
        animation: float-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        max-width: 420px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .update-notification.shimmer {
        animation: float-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards,
                   shimmer-bg 3s linear infinite;
      }
      
      .update-icon {
        font-size: 28px;
        animation: sparkle-rotate 3s ease-in-out infinite;
        flex-shrink: 0;
      }
      
      .update-content {
        flex: 1;
      }
      
      .update-title {
        font-size: 15px;
        font-weight: 700;
        color: #1a1b1e;
        margin-bottom: 4px;
        letter-spacing: 0.3px;
      }
      
      .update-message {
        font-size: 13px;
        color: rgba(26, 27, 30, 0.8);
        line-height: 1.4;
      }
      
      .update-version {
        font-weight: 600;
        color: #1a1b1e;
      }
      
      .update-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }
      
      .update-btn {
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        text-decoration: none;
        display: inline-block;
        border: none;
      }
      
      .update-btn-primary {
        background: rgba(26, 27, 30, 0.9);
        color: #ffc0cb;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
      
      .update-btn-primary:hover {
        background: #1a1b1e;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      
      .update-btn-secondary {
        background: rgba(255, 255, 255, 0.4);
        color: #1a1b1e;
      }
      
      .update-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.6);
        transform: translateY(-1px);
      }
      
      .update-close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        border: none;
        color: #1a1b1e;
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
      }
      
      .update-close:hover {
        background: rgba(255, 255, 255, 0.5);
        transform: scale(1.1);
      }
    `;
    
    const style = document.createElement('style');
    style.id = 'update-checker-style';
    style.textContent = css;
    document.head.appendChild(style);
  }
  function getInstalledVersion() {
    try {
      if (typeof GM_info !== 'undefined' && GM_info?.script?.version) {
        return GM_info.script.version;
      }
    } catch {}
    return null;
  }
  
  function parseVersion(versionString) {
    if (!versionString) return [0, 0, 0];
    const parts = versionString.split('.').map(n => parseInt(n) || 0);
    while (parts.length < 3) parts.push(0);
    return parts;
  }
  
  function compareVersions(current, remote) {
    const c = parseVersion(current);
    const r = parseVersion(remote);
    
    for (let i = 0; i < 3; i++) {
      if (r[i] > c[i]) return 1; // Remote is newer
      if (r[i] < c[i]) return -1; // Current is newer
    }
    return 0;
  }

  async function fetchRemoteVersion() {
    try {
      const response = await fetch(UPDATE_CHECK_URL, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Accept': 'text/plain'
        }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const text = await response.text();
      const match = text.match(/@version\s+([^\s\n]+)/);
      
      return match ? match[1].trim() : null;
    } catch (err) {
      console.error('Update check failed:', err);
      return null;
    }
  }

  function showUpdateNotification(currentVersion, remoteVersion) {
    document.querySelectorAll('.update-notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'update-notification shimmer';
    
    notification.innerHTML = `
      <button class="update-close" aria-label="Dismiss">×</button>
      <div class="update-icon">✦</div>
      <div class="update-content">
        <div class="update-title">Update Available!</div>
        <div class="update-message">
          <span class="update-version">v${remoteVersion}</span> is ready
          ${currentVersion ? ` (you have v${currentVersion})` : ''}
        </div>
      </div>
      <div class="update-actions">
        <a href="${INSTALL_URL}" class="update-btn update-btn-primary" target="_blank" rel="noopener">
          Update Now
        </a>
        <button class="update-btn update-btn-secondary" id="update-dismiss">
          Later
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    notification.querySelector('.update-close').addEventListener('click', () => {
      notification.style.opacity = '0';
      notification.style.transform = 'translate(-50%, -20px) scale(0.9)';
      setTimeout(() => notification.remove(), 300);
    });
    
    notification.querySelector('#update-dismiss').addEventListener('click', () => {
      notification.style.opacity = '0';
      notification.style.transform = 'translate(-50%, -20px) scale(0.9)';
      setTimeout(() => notification.remove(), 300);
    });
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -20px) scale(0.9)';
        setTimeout(() => notification.remove(), 300);
      }
    }, 30000);
  }
  function shouldCheckForUpdates() {
    try {
      const lastCheck = localStorage.getItem(STORAGE_KEY);
      if (!lastCheck) return true;
      
      const lastCheckTime = parseInt(lastCheck);
      const now = Date.now();
      
      return (now - lastCheckTime) >= CHECK_INTERVAL;
    } catch {
      return true;
    }
  }
  
  function updateLastCheckTime() {
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {}
  }
  
  async function checkForUpdates(force = false) {
    if (!force && !shouldCheckForUpdates()) {
      console.log('Update check: Skipping (checked recently)');
      return;
    }
    
    console.log('Update check: Starting...');
    
    const currentVersion = getInstalledVersion();
    if (!currentVersion) {
      console.log('Update check: Cannot determine installed version');
      return;
    }
    
    const remoteVersion = await fetchRemoteVersion();
    if (!remoteVersion) {
      console.log('Update check: Failed to fetch remote version');
      return;
    }
    
    console.log(`Update check: Current v${currentVersion}, Remote v${remoteVersion}`);
    
    const comparison = compareVersions(currentVersion, remoteVersion);
    
    if (comparison > 0) {
      console.log('Update check: Update available!');
      showUpdateNotification(currentVersion, remoteVersion);
    } else if (comparison === 0) {
      console.log('Update check: Up to date');
    } else {
      console.log('Update check: Local version is newer');
    }
    
    updateLastCheckTime();
  }
  window.UtilifyUpdateChecker = {
    check: () => checkForUpdates(true),
    getVersion: getInstalledVersion
  };
  function init() {
    injectStyles();   
    setTimeout(() => checkForUpdates(), 2000);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

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
  
       // Fonts
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
        const url = e.target.value.trim();
        const cfg = Storage.getConfig();
        cfg.onlineFont = url;
        Storage.saveConfig(cfg);
        
        if (url) {
          // Apply font immediately
          Styles.loadOnlineFont(url);
          // Also update the font selector to "online" if not already
          if (cfg.fontFamily !== 'online') {
            cfg.fontFamily = 'online';
            this.panel.querySelector('#main-font').value = 'online';
            Storage.saveConfig(cfg);
          }
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
  if (document.getElementById('utilify_settings_btn')) return;

  const tryInject = () => {
    const targetList = document.querySelector('ol._3hI0M');
    if (!targetList) return false;

    const li = document.createElement('li');
    li.className = '_3WhKY';

    const btn = document.createElement('button');
    btn.id = 'utilify_settings_btn';
    btn.setAttribute('aria-label', 'Open Utilify Settings');
    btn.innerHTML = '✦';

    btn.style.cssText = `
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255, 192, 203, 0.3), rgba(200, 190, 220, 0.3));
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 192, 203, 0.4);
    color: #ffc0cb;
    font-size: 11px;
    line-height: 1;
    margin-right: 8px;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(255, 192, 203, 0.3);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: 50% 50%;
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

    li.appendChild(btn);
    targetList.insertBefore(li, targetList.firstElementChild);

    return true;
  };

  if (tryInject()) return;

  const observer = new MutationObserver(() => {
    if (tryInject()) observer.disconnect();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
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


// Utilify Contributor Badge
(() => {
  "use strict";

  const CONTRIBUTORS = ["24051519", "17037147", "16947158", "36355", "669433161", "9610391", "669082809", "17506905","50117938", "669722541", "16947158"];
  const match = location.pathname.match(/^\/profile\/(\d+)\/?$/);
  if (!match || !CONTRIBUTORS.includes(match[1])) return;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes sparkle-rotate {
      0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
      50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
    }

    @keyframes glow-pulse {
      0%, 100% { box-shadow: 0 4px 20px rgba(255, 192, 203, 0.3); }
      50% { box-shadow: 0 6px 30px rgba(255, 192, 203, 0.5); }
    }

    @keyframes shimmer-sweep {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes float-in {
      from { opacity: 0; transform: translate(-50%, 20px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }

    .utilify-badge {
      position: fixed;
      left: 50%;
      bottom: 24px;
      transform: translateX(-50%);
      z-index: 99999;
      max-height: 150px;
      min-width: 140px;
      max-width: 280px;
      padding: 16px 24px;
      border-radius: 16px;
      background: linear-gradient(135deg, 
        rgba(255, 192, 203, 0.95) 0%, 
        rgba(200, 190, 220, 0.95) 50%, 
        rgba(255, 192, 203, 0.95) 100%);
      background-size: 200% 100%;
      border: 1px solid rgba(255, 255, 255, 0.4);
      color: #1a1b1e;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      text-align: center;
      animation: float-in 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                 shimmer-sweep 4s linear infinite,
                 glow-pulse 3s ease-in-out infinite;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px rgba(255, 192, 203, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.5);
    }

    .utilify-badge-icon {
      font-size: 24px;
      margin-bottom: 8px;
      animation: sparkle-rotate 3s ease-in-out infinite;
    }

    .utilify-badge-title {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 6px;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
    }

    .utilify-badge-text {
      font-size: 12px;
      line-height: 1.6;
      color: rgba(26, 27, 30, 0.85);
      margin-bottom: 8px;
    }

    .utilify-badge-link {
      display: inline-block;
      margin-top: 4px;
      padding: 6px 14px;
      background: rgba(26, 27, 30, 0.15);
      border-radius: 8px;
      color: #1a1b1e;
      text-decoration: none;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .utilify-badge-link:hover {
      background: rgba(26, 27, 30, 0.25);
      transform: translateY(-2px);
    }

    .badge-sparkle {
      position: absolute;
      font-size: 12px;
      animation: sparkle-rotate 3s ease-in-out infinite;
      pointer-events: none;
      opacity: 0.6;
    }

    .badge-sparkle:nth-child(1) { left: 12px; top: 12px; animation-delay: 0.2s; color: rgba(26, 27, 30, 0.4); }
    .badge-sparkle:nth-child(2) { right: 12px; top: 12px; animation-delay: 0.8s; color: rgba(26, 27, 30, 0.3); }
    .badge-sparkle:nth-child(3) { left: 12px; bottom: 12px; animation-delay: 1.4s; color: rgba(26, 27, 30, 0.35); }
    .badge-sparkle:nth-child(4) { right: 12px; bottom: 12px; animation-delay: 0.5s; color: rgba(26, 27, 30, 0.4); }
  `;
  document.head.appendChild(style);

  // Create badge
  const badge = document.createElement("div");
  badge.className = "utilify-badge";
  badge.innerHTML = `
    <div class="badge-sparkle">✦</div>
    <div class="badge-sparkle">✧</div>
    <div class="badge-sparkle">✦</div>
    <div class="badge-sparkle">✧</div>
    <div class="utilify-badge-icon">✦</div>
    <div class="utilify-badge-title">Utilify Contributor</div>
    <div class="utilify-badge-text">
      This person helped shape Utilify and made it better for everyone.
    </div>
    <a href="https://github.com/gxthickitty/utilify" class="utilify-badge-link" target="_blank" rel="noopener">
      View on GitHub →
    </a>
  `;

  document.body.appendChild(badge);
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
