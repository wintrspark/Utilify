// ==UserScript==
// @name         UtilifyV2
// @namespace    A scuffed quality of life addon for the WWW kogama >W<
// @version      2.0.7
// @description  Slowly rewriting this addon because I want to feel useful.
// @author       S
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


(async function() { // bg + filters
    "use strict";

    const waitForElement = async(sel, timeout = 10000) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const el = document.querySelector(sel);
            if (el) return el;
            await new Promise(r => requestAnimationFrame(r));
        }
        throw new Error(`Element ${sel} not found`);
    };

    const effects = {
        blur: el => el.style.filter = "blur(5px)",
        none: el => {
            el.style.filter = "none";
            el.style.opacity = "unset";
        },
        dark: (el, img) => el.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.9),rgba(0,0,0,0.7)),url("${img}")`,
        rain: el => createRainEffect(el),
        snow: el => createSnowEffect(el)
    };


    const createRainEffect = (e) => {
        const bg = document.createElement("div");
        Object.assign(bg.style, {
            position: "absolute",
            inset: "0",
            zIndex: "1",
            backgroundImage: e.style.backgroundImage,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: e.style.filter
        });
        e.style.backgroundImage = "none";
        e.style.filter = "none";

        const container = document.createElement("div");
        Object.assign(container.style, {
            position: "absolute",
            inset: "0",
            pointerEvents: "none",
            zIndex: "2",
            overflow: "hidden"
        });

        let raf = 0;
        const drops = [];
        const MAX = 40; // max_amount

        const spawn = () => {
            if (drops.length > MAX) return;
            const d = {
                x: Math.random() * e.clientWidth,
                y: -10,
                len: Math.random() * 15 + 13,
                vx: (Math.random() - 0.8) * 0.7, // slower sway
                vy: Math.random() * 4.5 + 4, // slower fall
                opacity: Math.random() * 0.4 + 0.3
            };
            drops.push(d);
        };

        const draw = () => {
            if (!document.contains(e)) return cancel();
            if (!container._canvas) {
                const c = document.createElement("canvas");
                c.style.width = "100%";
                c.style.height = "100%";
                c.width = e.clientWidth * devicePixelRatio;
                c.height = e.clientHeight * devicePixelRatio;
                c.style.pointerEvents = "none";
                container.appendChild(c);
                container._canvas = c;
                container._ctx = c.getContext("2d");
            }
            const c = container._canvas;
            const ctx = container._ctx;
            if (c.width !== e.clientWidth * devicePixelRatio || c.height !== e.clientHeight * devicePixelRatio) {
                c.width = e.clientWidth * devicePixelRatio;
                c.height = e.clientHeight * devicePixelRatio;
            }
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.save();
            ctx.scale(devicePixelRatio, devicePixelRatio);
            for (let i = 0; i < 2; i++) spawn(); // fewer new drops
            for (let i = drops.length - 1; i >= 0; i--) {
                const d = drops[i];
                d.x += d.vx;
                d.y += d.vy;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255,255,255,${d.opacity})`;
                ctx.lineWidth = Math.max(1, d.len * 0.06);
                ctx.shadowBlur = 2; // blur so its seems more real?
                ctx.shadowColor = "rgba(255,255,255,0.5)";
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x + d.vx * 2, d.y + d.len);
                ctx.stroke();
                if (d.y - d.len > e.clientHeight + 20) drops.splice(i, 1);
            }
            ctx.restore();
            raf = requestAnimationFrame(draw);
        };

        const cancel = () => {
            if (raf) cancelAnimationFrame(raf);
            container.remove();
            bg.remove();
        };

        e.appendChild(bg);
        e.appendChild(container);
        draw();

        const obs = new MutationObserver(() => {
            if (!document.contains(e)) {
                obs.disconnect();
                cancel();
            }
        });
        obs.observe(document.body, {
            childList: true,
            subtree: true
        });
    };


    const createSnowEffect = (e) => {
        const bg = document.createElement("div");
        Object.assign(bg.style, {
            position: "absolute",
            inset: "0",
            zIndex: "1",
            backgroundImage: e.style.backgroundImage,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: e.style.filter
        });
        e.style.backgroundImage = "none";
        e.style.filter = "none";

        const container = document.createElement("div");
        Object.assign(container.style, {
            position: "absolute",
            inset: "0",
            pointerEvents: "none",
            zIndex: "2",
            overflow: "hidden"
        });

        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = Math.max(1, e.clientWidth * devicePixelRatio);
        canvas.height = Math.max(1, e.clientHeight * devicePixelRatio);
        container.appendChild(canvas);
        const ctx = canvas.getContext("2d");

        const FLAKES = Math.min(40, Math.max(16, Math.floor((e.clientWidth * e.clientHeight) / 80000))); // lower quantity
        const flakes = [];
        const now = () => performance.now();
        let last = now();
        let raf = 0;

        const makeFlake = () => ({
            x: Math.random() * canvas.width / devicePixelRatio,
            y: Math.random() * canvas.height / devicePixelRatio - canvas.height / devicePixelRatio,
            r: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.3, // slower
            vy: Math.random() * 0.5 + 0.2, // slower
            sway: Math.random() * 20 + 5, // subtle sway
            phase: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.5 + 0.3
        });

        for (let i = 0; i < FLAKES; i++) flakes.push(makeFlake());

        const resizeIfNeeded = () => {
            const w = Math.max(1, e.clientWidth * devicePixelRatio);
            const h = Math.max(1, e.clientHeight * devicePixelRatio);
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }
        };

        const step = () => {
            if (!document.contains(e)) return cancel();
            resizeIfNeeded();
            const nowT = now();
            const dt = Math.min(40, nowT - last) / 1000;
            last = nowT;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(devicePixelRatio, devicePixelRatio);
            for (let i = 0; i < flakes.length; i++) {
                const f = flakes[i];
                f.phase += dt;
                f.x += f.vx + Math.sin(f.phase) * (f.sway * 0.01);
                f.y += f.vy;
                if (f.y - f.r > canvas.height / devicePixelRatio + 10 || f.x < -50 || f.x > (canvas.width / devicePixelRatio) + 50) {
                    flakes[i] = makeFlake();
                    flakes[i].y = -10;
                }
                ctx.beginPath();
                ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
            raf = requestAnimationFrame(step);
        };

        const cancel = () => {
            if (raf) cancelAnimationFrame(raf);
            container.remove();
            bg.remove();
        };

        e.appendChild(bg);
        e.appendChild(container);
        step();

        const obs = new MutationObserver(() => {
            if (!document.contains(e)) {
                obs.disconnect();
                cancel();
            }
        });
        obs.observe(document.body, {
            childList: true,
            subtree: true
        });


        const onResize = () => resizeIfNeeded();
        window.addEventListener("resize", onResize);
        container._cleanup = () => window.removeEventListener("resize", onResize);
    };

    async function applyEffects() {
        try {
            const d = await waitForElement('div._9smi2 > div.MuiPaper-root._1rJI8.MuiPaper-rounded > div._1aUa_');
            const m = /(?:\|\|)?Background:\s*(\d+)(?:,\s*filter:\s*([a-z, ]+))?;?(?:\|\|)?/i.exec(d.textContent || "");
            if (!m) return;

            const img = await fetchImage(m[1]);
            const b = document.querySelector('._33DXe');
            if (!b) return;

            const fadeIn = () => b.style.opacity = '1';
            b.style.transition = 'opacity 0.28s ease-in';
            b.style.opacity = '0';
            b.style.backgroundImage = `
        linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.3) 100%),
        url("${img}")
      `;
            b.style.backgroundSize = 'cover';
            b.style.backgroundPosition = 'center';
            setTimeout(fadeIn, 300);

            (m[2] || "").split(',').map(s => s.trim()).filter(Boolean).forEach(f => {
                if (effects[f]) effects[f](b, img);
            });
        } catch (err) {
            // silent fail
        }
    }

    async function fetchImage(id) {
        const r = await fetch(`https://www.kogama.com/games/play/${id}/`);
        const h = await r.text();
        const m = h.match(/options\.bootstrap\s*=\s*({.*?});/s);
        if (!m) return "";
        try {
            const j = JSON.parse(m[1]);
            return j.object ? .images ? .large || Object.values(j.object ? .images || {})[0] || "";
        } catch {
            return "";
        }
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyEffects);
    else applyEffects();
})();

(async() => { // Profile Banner & Gradient - Utilify Exclusive
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

                headerContainer ? .insertBefore(bannerWrapper, usernameEl.nextSibling);
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

(function() { // Copy Description - Utilify Exclusive
    let observer;
    let buttonAdded = false;

    function addCopyButton() {
        if (buttonAdded) return;
        const bioContainer = document.querySelector('.MuiPaper-root h2');
        if (!bioContainer || !bioContainer.textContent.includes('Bio') || bioContainer.querySelector('.aero-copy-btn')) {
            return;
        }
        const btn = document.createElement('button');
        btn.className = 'aero-copy-btn';
        btn.innerHTML = '⎘';
        btn.title = 'Copy Bio';
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
            box-shadow:
                0 1px 1px rgba(0,0,0,0.1),
                inset 0 1px 1px rgba(255,255,255,0.7);
            position: relative;
            top: -1px;
        `;
        btn.onmouseenter = () => {
            btn.style.background = 'rgba(220,240,255,0.95)';
            btn.style.boxShadow = '0 1px 3px rgba(0,120,215,0.3)';
        };
        btn.onmouseleave = () => {
            btn.style.background = 'rgba(255,255,255,0.85)';
            btn.style.boxShadow = `
                0 1px 1px rgba(0,0,0,0.1),
                inset 0 1px 1px rgba(255,255,255,0.7)
            `;
        };
        btn.onclick = async() => {
            const bioContent = document.querySelector('div[itemprop="description"]') ? .innerText.trim() || '';
            try {
                await navigator.clipboard.writeText(bioContent);
                showAeroNotification('Bio copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        };
        bioContainer.style.display = 'inline-flex';
        bioContainer.style.alignItems = 'center';
        bioContainer.appendChild(btn);
        buttonAdded = true;
        if (observer) {
            observer.disconnect();
        }
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
            box-shadow:
                0 2px 10px rgba(0,0,0,0.15),
                inset 0 1px 1px rgba(255,255,255,0.5);
            color: #333;
            font: 13px 'Segoe UI', system-ui, sans-serif;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(notif);
        setTimeout(() => {
            notif.style.opacity = '1';
        }, 10);
        setTimeout(() => {
            notif.style.opacity = '0';
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    }
    addCopyButton();
    if (!buttonAdded) {
        observer = new MutationObserver(addCopyButton);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        setTimeout(() => {
            if (observer) {
                observer.disconnect();
            }
        }, 10000);
    }
})();
(() => { // Last Created, Last Seen, Last Played Game, InternetArchive
    'use strict';

    const enhance = () => {
        const container = document.querySelector('._13UrL ._23KvS ._1jTCU');
        const span = container ? .querySelector('span._20K92');
        if (!container || !span || span.dataset.enhanced) return false;
        container.style.zIndex = '9';

        const script = [...document.scripts].find(s => s.textContent.includes('options.bootstrap = {'));
        if (!script) return false;

        try {
            const bootstrap = JSON.parse(script.textContent.match(/options\.bootstrap = (\{.*?\});/s)[1]);
            const {
                object: {
                    created,
                    last_ping
                }
            } = bootstrap;
            const gameInfo = JSON.parse(localStorage.getItem('__amplify__cache:game:last-played') || '{}') ? .data;
            const formatCompactDate = d => new Date(d).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            const formatVerbose = d => {
                const date = new Date(d);
                const day = date.getDate();
                const daySuffix = (day % 100 >= 11 && day % 100 <= 13) ? 'th' : ['st', 'nd', 'rd'][day % 10 - 1] || 'th';
                const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()];
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

            if (bootstrap.object ? .is_me && gameInfo ? .id) {
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
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
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
            logoLink.href = "https://github.com/midweststatic";
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

(function() { //config
    "use strict";

    const PANEL_ID = "utilifyv2_panel";
    const STYLE_ID = "utilifyv2_style";
    const CACHE_KEY = "UConfig";
    const SETTINGS_BUTTON_ID = "utilifyv2_settings_btn";
    const SETTINGS_CONTAINER_ID = "utilifyv2_settings_container";
    const UPDATE_RAW_URL = "https://raw.githubusercontent.com/midweststatic/Utilify/main/Script/Rewrite/Utilify.user.js";
    const UPDATE_REPO_URL = "https://github.com/midweststatic/Utilify/raw/refs/heads/main/Script/Rewrite/Utilify.user.js";

    const defaultConfig = {
        gradient: null,
        gradientAngle: 45,
        gradientColor1: "#3a3a3a",
        gradientColor2: "#2b2a2a",
        fontFamily: null,
        onlineFont: null,
        glassPanels: {
            enabled: true,
            radius: 8,
            hue: 270,
            alpha: 0.16
        },
        invisibleAvatars: false,
        onlineStyles: "",
        customCSS: "",
        disableFriendslist: false,
        blurSensitive: false,
        blurComments: false,
        experimentalImageProcessing: false,
        appearOffline: false,
        openOnLoad: false,
        friendActivity: false,
        playerTypeDisplay: false,
        lazyStreakKeeper: false
    };

    function safeParse(raw, fallback) {
        try {
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }

    function gmGet(k, fallback) {
        try {
            if (typeof GM_getValue === "function") return GM_getValue(k, fallback);
            return safeParse(localStorage.getItem(k), fallback);
        } catch {
            return fallback;
        }
    }

    function gmSet(k, v) {
        try {
            if (typeof GM_setValue === "function") return GM_setValue(k, v);
            localStorage.setItem(k, JSON.stringify(v));
        } catch {}
    }

    function getInstalledVersion() {
        try {
            if (typeof GM_info !== "undefined" && GM_info && GM_info.script && GM_info.script.version) return GM_info.script.version;
        } catch {}
        return "0.0.0";
    }

    function ensureStyle() {
        if (document.getElementById(STYLE_ID)) return;
        const gold = "#ffb400";
        const css = `
  #${PANEL_ID} { position: fixed; left: 50%; top: 50%; width: min(680px, 92vw); max-height: 56vh; border-radius:10px; overflow:hidden; background:#1b1c1d; color:#f2efe6; box-shadow:0 18px 50px rgba(0,0,0,0.6); z-index:120000; display:none; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial; border:1px solid rgba(255,255,255,0.04); transition: box-shadow 180ms ease, transform 120ms ease; }
  #${PANEL_ID}.visible { display:flex; flex-direction:column; }
  #${PANEL_ID} .header { height:44px; display:flex; align-items:center; gap:10px; padding:0 12px; cursor:grab; user-select:none; background:linear-gradient(90deg,#262728,#1e1f20); border-bottom:1px solid rgba(255,255,255,0.03); }
  #${PANEL_ID} .title { font-weight:700; color:${gold}; font-size:15px; text-shadow:0 0 6px rgba(255,180,0,0.06); flex:1; letter-spacing:0.6px; }
  #${PANEL_ID} .close { background:transparent; border:0; color:inherit; cursor:pointer; padding:6px; border-radius:6px; font-weight:700; }
  #${PANEL_ID} .body { display:flex; gap:12px; padding:10px; height:calc(56vh - 44px); box-sizing:border-box; }
  #${PANEL_ID} .tabs { width:150px; background:#151516; border-right:1px solid rgba(255,255,255,0.02); padding:12px; overflow:auto; border-radius:6px; }
  #${PANEL_ID} .tab { padding:10px 12px; cursor:pointer; border-left:4px solid transparent; color:#d8d8d2; margin-bottom:8px; border-radius:6px; transition:all .12s; font-size:13px; }
  #${PANEL_ID} .tab.active { background: rgba(255,180,0,0.06); border-left-color:${gold}; color:${gold}; transform:translateX(4px); box-shadow: inset 0 -1px 0 rgba(255,255,255,0.02); }
  #${PANEL_ID} .content { flex:1; overflow:auto; padding:10px; }
  #${PANEL_ID} input[type="range"] { width:100%; }
  #${PANEL_ID} .small { font-size:13px; color:#dedbcf; }
  #${SETTINGS_CONTAINER_ID} { display:flex; align-items:center; margin-right:8px; z-index:1001; }
  #${SETTINGS_BUTTON_ID} { background:transparent; border:0; cursor:pointer; padding:6px; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#fff; }
  .field-row { margin:8px 0; display:flex; gap:8px; align-items:center; }
  .color-input { width:44px; height:30px; border:1px solid #333; border-radius:4px; cursor:pointer; background:#fff; }
  .text-input, .small-area, select, input[type="text"], input[type="number"] { width:100%; padding:7px; background:#111; border:1px solid #2a2a2a; border-radius:6px; color:#efe9d9; box-sizing:border-box; }
  .button { padding:8px 10px; background:${gold}; color:#111; border-radius:8px; border:0; cursor:pointer; font-weight:700; }
  .muted { color:#9a9a92; font-size:12px; }
  .warn { color:#ffbe66; font-weight:700; font-size:13px; margin:6px 0; }
  .small-note { font-size:12px; color:#bfbcae; margin-top:6px; }
  .status-badge { display:inline-block; padding:6px 8px; border-radius:8px; font-size:13px; margin-left:8px; }
  .update-available { background:linear-gradient(90deg,#ffb86b,#ff6b6b); color:#111; font-weight:700; }
  .update-ok { background:rgba(255,180,0,0.12); color:${gold}; font-weight:700; }
  `;
        const s = document.createElement("style");
        s.id = STYLE_ID;
        s.textContent = css;
        document.head.appendChild(s);
    }

    function getConfig() {
        const raw = gmGet(CACHE_KEY, null) || {};
        return Object.assign({}, defaultConfig, raw);
    }

    function saveConfig(cfg) {
        gmSet(CACHE_KEY, cfg);
    }

    function createPanel() {
        if (document.getElementById(PANEL_ID)) return document.getElementById(PANEL_ID);
        const panel = document.createElement("div");
        panel.id = PANEL_ID;
        panel.innerHTML = `
        <div class="header" role="toolbar">
          <div class="title">UtilifyV2 configuration</div>
          <div id="version_badge" class="status-badge update-ok">v${getInstalledVersion()}</div>
          <button class="close" aria-label="Close">✕</button>
        </div>
        <div class="body">
          <div class="tabs" role="tablist">
            <div class="tab active" data-tab="gradient" role="tab" tabindex="0">Gradient</div>
            <div class="tab" data-tab="experimental" role="tab" tabindex="0">Experimental</div>
            <div class="tab" data-tab="privacy" role="tab" tabindex="0">Privacy</div>
            <div class="tab" data-tab="styles" role="tab" tabindex="0">Styles</div>
            <div class="tab" data-tab="fonts" role="tab" tabindex="0">Fonts</div>
            <div class="tab" data-tab="risky" role="tab" tabindex="0">UAOR</div>
            <div class="tab" data-tab="credits" role="tab" tabindex="0">Credits</div>
          </div>
          <div class="content" role="region">
            <div class="tab-content" id="tab-gradient">
              <div class="field-row"><div class="small">Angle</div><input id="gradient-angle" type="range" min="0" max="360" value="45" /></div>
              <div class="field-row"><div class="small">Start color</div><input id="color1" class="color-input" type="color" value="#3a3a3a"/><input id="color1hex" class="text-input" placeholder="#HEX" /></div>
              <div class="field-row"><div class="small">End color</div><input id="color2" class="color-input" type="color" value="#2b2a2a"/><input id="color2hex" class="text-input" placeholder="#HEX" /></div>
              <div class="field-row"><input id="gradient-input" class="text-input" placeholder="linear-gradient(45deg, #3a3a3a, #2b2a2a)" /></div>
              <div style="display:flex;gap:8px;margin-top:8px"><button id="gradient-copy" class="button">Copy</button><button id="gradient-clear" class="button">Clear</button></div>
              <div class="small-note">Pick colors, adjust angle, or paste a custom linear-gradient. Changes save instantly.</div>
            </div>

            <div class="tab-content" id="tab-experimental" style="display:none;">
              <div class="warn">Experimental features may be unstable. Use only if you understand the effects.</div>
              <div class="field-row"><label><input type="checkbox" id="exp-image-process" /> Image Processing</label></div>
            </div>

            <div class="tab-content" id="tab-privacy" style="display:none;">
              <div class="small-note">Privacy toggles apply immediately and persist.</div>
              <div class="field-row"><label><input type="checkbox" id="disable-friendslist" /> Disable Friendslist</label></div>
              <div class="field-row"><label><input type="checkbox" id="blur-sensitive" /> Blur sensitive content</label></div>
              <div class="field-row"><label><input type="checkbox" id="blur-comments" /> Blur comments</label></div>
            </div>

            <div class="tab-content" id="tab-styles" style="display:none;">
              <div class="field-row"><label><input type="checkbox" id="glass-panels-toggle" /> Glass Panels</label></div>
              <div style="display:flex;gap:8px;margin-top:8px">
                <div style="flex:1"><div class="small">Border radius</div><input id="glass-radius" type="number" min="0" max="50" value="8" /></div>
                <div style="flex:1"><div class="small">Hue</div><input id="glass-hue" type="range" min="0" max="360" value="270" /><div id="glass-hue-value" class="small-note">270</div></div>
              </div>
              <div style="margin-top:8px"><div class="small">Transparency (alpha %)</div><input id="glass-alpha" type="range" min="1" max="50" value="16" /><div id="glass-alpha-value" class="small-note">16</div></div>
              <div style="margin-top:12px"><div class="small">Online CSS URLs (one per line)</div><textarea id="online-styles-input" class="small-area"></textarea></div>
              <div style="margin-top:8px"><div class="small">Custom CSS</div><textarea id="custom-css-input" class="small-area"></textarea></div>
            </div>

            <div class="tab-content" id="tab-fonts" style="display:none;">
              <div class="small">Main font</div>
              <select id="main-font" style="width:100%; margin-top:6px;">
                <option value="default">Default (system)</option>
                <option value="roboto">Roboto</option>
                <option value="comfortaa">Comfortaa</option>
                <option value="online">Online font</option>
              </select>
              <div style="margin-top:8px"><div class="small">Online font URL</div><input id="online-font-url" type="text" style="width:100%; padding:6px; margin-top:6px;" /></div>
              <div style="margin-top:8px"><div class="small">Preview</div><div id="font-preview" style="padding:8px; background:#111; margin-top:6px; border-radius:6px;">The quick brown fox jumps over the lazy dog</div></div>
            </div>

            <div class="tab-content" id="tab-risky" style="display:none;">
                <div class="warn">This is the collection of features that might potentially cause punishments. Use At Your Own Risk. UAOR.</div>
                <div class="field-row"><label><input type="checkbox" id="r-appear-offline" /> Appear Offline (blocks pulse POSTs)</label></div>
                <div class="field-row"><label><input type="checkbox" id="r-friend-activity" /> Friend Activity (observe friend list)</label></div>
                <div class="field-row"><label><input type="checkbox" id="r-player-type" /> Player Type Display (games page)</label></div>
                <div class="field-row"><label><input type="checkbox" id="r-lazy-streak" /> Lazy Streak Keeper</label></div>
                <div class="small-note">Friend Activity observes the friend list and resolves in-page game/project info without polling.<br> Player Type Display injects a compact chip with counts once.</div>
                <div class="small-note">Lazy Streak Keeper requires Friending profile/<a href="https://www.kogama.com/profile/670350173/" target="_blank" rel="noopener">670350173</a>.</div>
            </div>

            <div class="tab-content" id="tab-credits" style="display:none;">
                <div class="small">Credits</div>
                <div class="small-note" style="margin:8px 0">
                    UtilifyV2 maintained by <a href="https://www.kogama.com/profile/24051519/" target="_blank" rel="noopener noreferrer">Simon</a>
                    <br>Update notices appear only if a newer release is detected after a scan.
                </div>

                <div style="margin-top: 10px;">
                    <div><a href="https://www.kogama.com/profile/17037147/" target="_blank" rel="noopener noreferrer">S.</a> - Main motivation behind the addon. </div>
                    <div><a href="https://www.kogama.com/profile/669433161/" target="_blank" rel="noopener noreferrer">S.</a> - Tester of many features.</div>
                    <div><a href="https://www.kogama.com/profile/36355/" target="_blank" rel="noopener noreferrer">UDONGEIN</a> - Helped porting features of KB.</div>
                </div>

                <div style="display:flex;gap:8px;align-items:center; margin-top: 10px;"><button id="check-update" class="button">Check for updates</button><div id="update-status" class="status-badge"></div></div>
                <div id="update-info" class="small-note" style="margin-top:8px"></div>
            </div>
          </div>
        </div>
      `;
        document.body.appendChild(panel);
        return panel;
    }

    function clampPosition(left, top, panelW, panelH) {
        const pad = 8;
        const minLeft = pad;
        const maxLeft = Math.max(pad, Math.floor(window.innerWidth - panelW - pad));
        const minTop = pad;
        const maxTop = Math.max(pad, Math.floor(window.innerHeight - panelH - pad));
        return {
            left: Math.min(Math.max(minLeft, Math.floor(left)), maxLeft),
            top: Math.min(Math.max(minTop, Math.floor(top)), maxTop)
        };
    }

    function enableDrag(panel) {
        const header = panel.querySelector(".header");
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;
        let panelW = 0;
        let panelH = 0;

        function setTransition(enabled) {
            panel.style.transition = enabled ? "box-shadow 180ms ease, transform 120ms ease" : "none";
        }
        setTransition(true);

        function begin(px, py) {
            const rect = panel.getBoundingClientRect();
            const clamped = clampPosition(Math.round((window.innerWidth - rect.width) / 2), Math.round((window.innerHeight - rect.height) / 2), rect.width, rect.height);
            const currLeft = panel.style.left ? parseInt(panel.style.left, 10) : rect.left;
            const currTop = panel.style.top ? parseInt(panel.style.top, 10) : rect.top;
            const leftPx = isFinite(currLeft) ? currLeft : clamped.left;
            const topPx = isFinite(currTop) ? currTop : clamped.top;
            panel.style.left = leftPx + "px";
            panel.style.top = topPx + "px";
            panel.style.transform = "";
            startX = px;
            startY = py;
            startLeft = panel.offsetLeft;
            startTop = panel.offsetTop;
            panelW = panel.offsetWidth;
            panelH = panel.offsetHeight;
            isDragging = true;
            header.style.cursor = "grabbing";
            document.documentElement.style.userSelect = "none";
            setTransition(false);
        }

        function move(px, py) {
            if (!isDragging) return;
            const dx = px - startX;
            const dy = py - startY;
            let nl = startLeft + dx;
            let nt = startTop + dy;
            const clamped = clampPosition(nl, nt, panelW, panelH);
            nl = clamped.left;
            nt = clamped.top;
            panel.style.left = nl + "px";
            panel.style.top = nt + "px";
        }

        function end() {
            if (!isDragging) return;
            isDragging = false;
            header.style.cursor = "";
            document.documentElement.style.userSelect = "";
            setTransition(true);
        }

        header.addEventListener("pointerdown", (ev) => {
            if (ev.target && ev.target.closest && ev.target.closest(".close")) return;
            header.setPointerCapture && header.setPointerCapture(ev.pointerId);
            begin(ev.clientX, ev.clientY);
            ev.preventDefault();
        });

        document.addEventListener("pointermove", (ev) => {
            if (!isDragging) return;
            move(ev.clientX, ev.clientY);
        });

        document.addEventListener("pointerup", (ev) => {
            if (!isDragging) return;
            try {
                header.releasePointerCapture && header.releasePointerCapture(ev.pointerId);
            } catch {}
            end();
        });

        window.addEventListener("resize", debounce(() => {
            const rect = panel.getBoundingClientRect();
            const clamped = clampPosition(rect.left, rect.top, rect.width, rect.height);
            panel.style.left = clamped.left + "px";
            panel.style.top = clamped.top + "px";
        }, 120));
    }

    function debounce(fn, t) {
        let id = 0;
        return function(...a) {
            clearTimeout(id);
            id = setTimeout(() => fn.apply(this, a), t);
        };
    }

    function setupTabs(panel) {
        const tabs = panel.querySelectorAll(".tab");
        const contents = panel.querySelectorAll(".tab-content");
        tabs.forEach(t => t.addEventListener("click", () => {
            tabs.forEach(x => x.classList.remove("active"));
            contents.forEach(c => c.style.display = "none");
            t.classList.add("active");
            const id = "tab-" + t.dataset.tab;
            const node = panel.querySelector("#" + id);
            if (node) node.style.display = "";
        }));
    }

    function applyGradient(value, angle, c1, c2) {
        if (!value) {
            document.body.style.background = "";
            const c = getConfig();
            c.gradient = null;
            saveConfig(c);
            return;
        }
        document.body.style.background = value;
        document.body.style.backgroundAttachment = "fixed";
        const cfg = getConfig();
        cfg.gradient = value;
        if (angle) cfg.gradientAngle = angle;
        if (c1) cfg.gradientColor1 = c1;
        if (c2) cfg.gradientColor2 = c2;
        saveConfig(cfg);
    }

    function loadGradientTab(panel) {
        const angleInput = panel.querySelector("#gradient-angle");
        const color1 = panel.querySelector("#color1");
        const color2 = panel.querySelector("#color2");
        const color1hex = panel.querySelector("#color1hex");
        const color2hex = panel.querySelector("#color2hex");
        const gradientInput = panel.querySelector("#gradient-input");
        const copyBtn = panel.querySelector("#gradient-copy");
        const clearBtn = panel.querySelector("#gradient-clear");

        const cfg = getConfig();
        angleInput.value = cfg.gradientAngle || 45;
        color1.value = cfg.gradientColor1 || "#3a3a3a";
        color2.value = cfg.gradientColor2 || "#2b2a2a";
        color1hex.value = color1.value;
        color2hex.value = color2.value;
        gradientInput.value = cfg.gradient || `linear-gradient(${angleInput.value}deg, ${color1.value}, ${color2.value})`;

        function updateFromPickers() {
            const a = parseInt(angleInput.value, 10);
            const cA = color1.value;
            const cB = color2.value;
            color1hex.value = cA;
            color2hex.value = cB;
            const grad = `linear-gradient(${a}deg, ${cA}, ${cB})`;
            gradientInput.value = grad;
            applyGradient(grad, a, cA, cB);
        }

        angleInput.addEventListener("input", updateFromPickers);
        color1.addEventListener("input", updateFromPickers);
        color2.addEventListener("input", updateFromPickers);

        color1hex.addEventListener("change", () => {
            const v = color1hex.value.trim();
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
                color1.value = v;
                updateFromPickers();
            }
        });
        color2hex.addEventListener("change", () => {
            const v = color2hex.value.trim();
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
                color2.value = v;
                updateFromPickers();
            }
        });

        gradientInput.addEventListener("input", (e) => {
            const val = e.target.value.trim();
            if (!val) return;
            const m = val.match(/linear-gradient\((\d+)deg\s*,\s*(#[0-9a-f]{3,6}|rgba?\([^)]+\))\s*,\s*(#[0-9a-f]{3,6}|rgba?\([^)]+\))\)/i);
            if (m) {
                angleInput.value = parseInt(m[1], 10);
                color1.value = m[2];
                color2.value = m[3];
                color1hex.value = color1.value;
                color2hex.value = color2.value;
                applyGradient(val, parseInt(m[1], 10), color1.value, color2.value);
            }
        });

        copyBtn.addEventListener("click", () => {
            const v = gradientInput.value.trim();
            if (v) navigator.clipboard ? .writeText(v);
            copyBtn.textContent = "Copied!";
            setTimeout(() => copyBtn.textContent = "Copy", 1200);
        });
        clearBtn.addEventListener("click", () => {
            gradientInput.value = "";
            angleInput.value = 45;
            color1.value = "#3a3a3a";
            color2.value = "#2b2a2a";
            color1hex.value = color1.value;
            color2hex.value = color2.value;
            const c = getConfig();
            c.gradient = null;
            saveConfig(c);
            applyGradient(null);
        });
    }

    function ensurePrivacyStyle() {
        let el = document.getElementById("utilifyv2_privacy_style");
        if (!el) {
            el = document.createElement("style");
            el.id = "utilifyv2_privacy_style";
            document.head.appendChild(el);
        }
        return el;
    }

    function updatePrivacyStyles(cfg) {
        const el = ensurePrivacyStyle();
        let css = "";
        if (cfg.disableFriendslist) css += `._1Yhgq{display:none!important}\n`;
        if (cfg.blurSensitive) css += `.css-k9ok3b,.css-b2nqhh,._13UrL .kR267 ._9smi2 ._1rJI8 ._1aUa_,._13UrL ._23KvS ._25Vmr ._2IqY6 ._2O_AH .vKjpS ._2ydTi,._375XK ._2XaOw,._3TORb ._1lvYU ._1taAL ._3zDi-{filter:blur(5px)!important;transition:filter .25s ease}\n.css-k9ok3b:hover,.css-b2nqhh:hover,._13UrL .kR267 ._9smi2 ._1rJI8 ._1aUa_:hover,._13UrL ._23KvS ._25Vmr ._2IqY6 ._2O_AH .vKjpS ._2ydTi:hover,._375XK ._2XaOw:hover,._3TORb ._1lvYU ._1taAL ._3zDi-:hover{filter:blur(0)!important}`;
        if (cfg.blurComments) css += `._3Wsxf{filter:blur(5px) !important}\n._3Wsxf:hover{filter:none!important}\n`;
        el.textContent = css;
    }
    let __streakKeeper = {
        timer: null
    };

    function enableStreakKeeper() {
        if (__streakKeeper.timer) return;

        // CONFIG
        const userId = getProfileIdFromBootstrap(); // Dynamically read current user ID
        if (!userId) return; // Cannot run without current user ID

        const TARGET_PROFILE = 670350173; // UID OF THE STREAK KEEPER ACCOUNT

        const LAST_SENT_KEY = 'ls_last_sent';
        const FOLLOW_STATE_KEY = 'ls_follow_state';

        const MESSAGE_INTERVAL_MS = 7 * 60 * 60 * 1000;
        const POLL_INTERVAL_MS = 60 * 1000;

        const INITIAL_HISTORY_DELAY_MS = 1000;
        const HISTORY_RETRY_DELAY_MS = 10 * 1000;
        const RESPONSE_WAIT_MS = 3 * 60 * 1000;
        const SECOND_RESPONSE_WAIT_MS = 60 * 1000;

        const MESSAGES = [
            "you are so loved <3",
            "streak check in, hi!",
            "keeping the streak alive <3",
            "quick hello from your streak bot",
            "sending love and a tiny nudge",
            "streak maintained, hi!",
            "just popping in to keep things going",
            "cheering for the streak <3",
            "automated hello, have a nice day",
            "tiny reminder: you are awesome"
        ];

        function nowIso() {
            return new Date().toISOString();
        }

        function isoToTs(iso) {
            const t = Date.parse(iso || '');
            return Number.isFinite(t) ? t : 0;
        }

        function getStorage(k) {
            try {
                return localStorage.getItem(k)
            } catch (e) {
                return null
            }
        }

        function setStorage(k, v) {
            try {
                localStorage.setItem(k, v)
            } catch (e) {}
        }

        function chooseRandom(a) {
            return a[Math.floor(Math.random() * a.length)]
        }

        function sleep(ms) {
            return new Promise(r => setTimeout(r, ms))
        }

        async function postChat(message) {
            const url = `https://www.kogama.com/chat/${userId}/`; // Use dynamic userId
            const resp = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to_profile_id: TARGET_PROFILE,
                    message
                })
            });
            if (!resp.ok) throw new Error('POST failed ' + resp.status);
            return resp.json().catch(() => null);
        }

        async function fetchHistory() {
            const url = `https://www.kogama.com/chat/${userId}/history/${TARGET_PROFILE}/`; // Use dynamic userId
            const resp = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });
            if (!resp.ok) throw new Error('HISTORY GET failed ' + resp.status);
            return resp.json().catch(() => null);
        }

        async function waitForReply(timeoutMs) {
            const start = Date.now();
            await sleep(INITIAL_HISTORY_DELAY_MS);
            while (Date.now() - start < timeoutMs) {
                try {
                    const hist = await fetchHistory();
                    if (hist && Array.isArray(hist.data) && hist.data.length > 0) {
                        const latest = hist.data[0];
                        if (latest && Number(latest.from_profile_id) === Number(TARGET_PROFILE)) return latest;
                    }
                } catch (e) {}
                const timeLeft = timeoutMs - (Date.now() - start);
                if (timeLeft <= 0) break;
                await sleep(Math.min(HISTORY_RETRY_DELAY_MS, timeLeft));
            }
            return null;
        }

        async function sendIfDue() {
            const lastIso = getStorage(LAST_SENT_KEY) || '';
            const lastTs = isoToTs(lastIso);
            const now = Date.now();
            if (now - lastTs < MESSAGE_INTERVAL_MS) return;

            const followStateRaw = getStorage(FOLLOW_STATE_KEY) || '{}';
            let followState = {};
            try {
                followState = JSON.parse(followStateRaw)
            } catch (e) {
                followState = {}
            }

            const initialMsg = chooseRandom(MESSAGES);
            try {
                await postChat(initialMsg);
                const sentIso = nowIso();
                setStorage(LAST_SENT_KEY, sentIso);
                followState = {
                    cycleStart: sentIso,
                    sentCount: 1
                };
                setStorage(FOLLOW_STATE_KEY, JSON.stringify(followState));

                const reply = await waitForReply(RESPONSE_WAIT_MS);
                if (reply) {
                    const follow1 = chooseRandom(MESSAGES);
                    await postChat(follow1);
                    followState.sentCount = 2;
                    followState.lastFollow = nowIso();
                    setStorage(FOLLOW_STATE_KEY, JSON.stringify(followState));

                    const reply2 = await waitForReply(SECOND_RESPONSE_WAIT_MS);
                    if (reply2) {
                        const follow2 = chooseRandom(MESSAGES);
                        await postChat(follow2);
                        followState.sentCount = 3;
                        followState.lastFollow = nowIso();
                        setStorage(FOLLOW_STATE_KEY, JSON.stringify(followState));
                    }
                }
            } catch (e) {
                return;
            }
        }

        sendIfDue();
        __streakKeeper.timer = setInterval(sendIfDue, POLL_INTERVAL_MS);
    }

    function teardownStreakKeeper() {
        if (__streakKeeper.timer) {
            clearInterval(__streakKeeper.timer);
            __streakKeeper.timer = null;
        }
    }


    function applyGlassPanels(cfg) {
        let s = document.getElementById("utilifyv2_glass_style");
        if (!s) {
            s = document.createElement("style");
            s.id = "utilifyv2_glass_style";
            document.head.appendChild(s);
        }
        if (!cfg.glassPanels || !cfg.glassPanels.enabled) {
            s.textContent = "";
            return;
        }
        const {
            radius,
            hue,
            alpha
        } = cfg.glassPanels;
        s.textContent = `.css-1udp1s3, .css-zslu1c, .css-1rbdj9p { background-color: hsla(${hue},68%,43%,${alpha}) !important; backdrop-filter: blur(3px) !important; border-radius: ${radius}px !important; }
  ._3TORb { background-color: hsla(${hue},68%,43%,${alpha}) !important; border-radius: ${radius}px !important; }`;
    }

    function loadOnlineCSS(urls) {
        document.querySelectorAll('link[data_utilify_online]').forEach(el => el.remove());
        if (!urls) return;
        urls.split("\n").map(s => s.trim()).filter(Boolean).forEach(url => {
            try {
                const u = new URL(url);
                const l = document.createElement("link");
                l.rel = "stylesheet";
                l.href = u.href;
                l.dataset_utilify_online = "1";
                document.head.appendChild(l);
            } catch {}
        });
    }

    function applyCustomCSS(css) {
        let el = document.getElementById("utilifyv2_custom_css");
        if (!el) {
            el = document.createElement("style");
            el.id = "utilifyv2_custom_css";
            document.head.appendChild(el);
        }
        el.textContent = css || "";
    }

    function loadFont(url) {
        if (!url) return;
        try {
            new URL(url);
        } catch {
            return;
        }
        const existing = document.querySelector('link[data_utilify_font="1"]');
        if (existing) existing.remove();
        const l = document.createElement("link");
        l.rel = "stylesheet";
        l.href = url;
        l.dataset_utilify_font = "1";
        document.head.appendChild(l);
        const match = url.includes("fonts.googleapis.com") ? (url.match(/family=([^&:]+)/) || [])[1] : null;
        const family = match ? match.replace(/\+/g, " ") : "CustomFont";
        let st = document.getElementById("utilifyv2_font_var");
        if (!st) {
            st = document.createElement("style");
            st.id = "utilifyv2_font_var";
            document.head.appendChild(st);
        }
        st.textContent = `:root{--utilify-font:'${family}', system-ui, sans-serif}`;
        const cfg = getConfig();
        cfg.onlineFont = url;
        saveConfig(cfg);
        applyGlobalFont("var(--utilify-font), system-ui, sans-serif");
    }

    function applyGlobalFont(family) {
        let st = document.getElementById("utilifyv2_global_font");
        if (!st) {
            st = document.createElement("style");
            st.id = "utilifyv2_global_font";
            document.head.appendChild(st);
        }
        st.textContent = `*{font-family:${family} !important;}`;
    }

    function enableImageBackgroundProcessing() {
        const processed = new WeakSet();
        async function removeBlueBackgroundFromUrl(url) {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload = function() {
                    try {
                        const canvas = document.createElement("canvas");
                        const w = img.naturalWidth || img.width;
                        const h = img.naturalHeight || img.height;
                        if (!w || !h) return resolve(url);
                        canvas.width = w;
                        canvas.height = h;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, w, h);
                        const id = ctx.getImageData(0, 0, w, h);
                        const d = id.data;
                        for (let i = 0; i < d.length; i += 4) {
                            const r = d[i],
                                g = d[i + 1],
                                b = d[i + 2];
                            if (b > 150 && b > r && b > g) d[i + 3] = 0;
                        }
                        ctx.putImageData(id, 0, 0);
                        resolve(canvas.toDataURL());
                    } catch {
                        resolve(url);
                    }
                };
                img.onerror = () => resolve(url);
                img.src = url;
            });
        }

        async function processElement(el) {
            if (!el || processed.has(el)) return;
            processed.add(el);
            if (el.tagName === "IMG") {
                const src = el.currentSrc || el.src;
                if (!src) return;
                const newUrl = await removeBlueBackgroundFromUrl(src);
                if (newUrl && newUrl !== src) el.src = newUrl;
            } else if (el.tagName.toLowerCase() === "image") {
                const href = el.getAttribute("xlink:href") || el.getAttribute("href");
                if (!href) return;
                const newUrl = await removeBlueBackgroundFromUrl(href);
                if (newUrl && newUrl !== href) el.setAttribute("xlink:href", newUrl);
            } else {
                const bg = (getComputedStyle(el).backgroundImage || "").match(/url\((?:'|")?(.*?)(?:'|")?\)/);
                if (bg && bg[1]) {
                    const newUrl = await removeBlueBackgroundFromUrl(bg[1]);
                    el.style.backgroundImage = `url("${newUrl}")`;
                }
            }
        }

        function scanAndObserve() {
            document.querySelectorAll("img, image, .avatar, ._3tYRU").forEach(el => processElement(el));
            const mo = new MutationObserver(muts => {
                for (const m of muts) {
                    m.addedNodes && m.addedNodes.forEach(node => {
                        if (!(node instanceof Element)) return;
                        if (node.matches && (node.matches("img, image, .avatar, ._3tYRU"))) processElement(node);
                        node.querySelectorAll && node.querySelectorAll("img, image, .avatar, ._3tYRU").forEach(n => processElement(n));
                    });
                }
            });
            mo.observe(document.body, {
                childList: true,
                subtree: true
            });
            return mo;
        }
        return scanAndObserve();
    }

    function fetchWithTimeout(url, timeout = 9000) {
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), timeout);
        return fetch(url, {
            signal: ctrl.signal
        }).then(r => {
            clearTimeout(id);
            return r.text();
        }).finally(() => clearTimeout(id));
    }

    function compareSemver(a, b) {
        if (!a || !b) return 0;
        const pa = a.split(".").map(n => parseInt(n, 10) || 0);
        const pb = b.split(".").map(n => parseInt(n, 10) || 0);
        const len = Math.max(pa.length, pb.length);
        for (let i = 0; i < len; i++) {
            const na = pa[i] || 0;
            const nb = pb[i] || 0;
            if (na > nb) return 1;
            if (na < nb) return -1;
        }
        return 0;
    }

    async function checkForUpdatesUI(panel) {
        const status = panel.querySelector("#update-status");
        const info = panel.querySelector("#update-info");
        status.textContent = "";
        info.textContent = "Checking…";

        status.replaceWith(status.cloneNode(true));
        const newStatus = panel.querySelector("#update-status");

        try {
            const raw = await fetchWithTimeout(UPDATE_RAW_URL, 9000);
            const m = raw.match(/@version\s+([^\s]+)/);
            const remote = m ? m[1].trim() : null;
            const installed = getInstalledVersion();

            if (!remote) {
                newStatus.textContent = "";
                info.textContent = "Could not read remote version.";
                return;
            }

            const cmp = compareSemver(remote, installed);

            if (cmp > 0) {
                newStatus.className = "status-badge update-available";
                newStatus.textContent = "Update";
                newStatus.style.cursor = "pointer";
                newStatus.addEventListener("click", () => {
                    window.open(UPDATE_REPO_URL, "_blank", "noopener");
                });

                info.innerHTML = `Remote release ${remote} detected. Installed ${installed}.`;
                const repoLink = document.createElement("a");
                repoLink.href = UPDATE_REPO_URL;
                repoLink.target = "_blank";
                repoLink.rel = "noopener";
                repoLink.textContent = "Open repository";
                info.appendChild(document.createTextNode(" "));
                info.appendChild(repoLink);

            } else if (cmp === 0) {
                newStatus.className = "status-badge update-ok";
                newStatus.textContent = "Up to date";
                info.textContent = `Installed ${installed} is current.`;
            } else {
                newStatus.className = "status-badge update-ok";
                newStatus.textContent = "Local newer";
                info.textContent = `Installed ${installed} appears newer than remote ${remote}.`;
            }

        } catch {
            info.textContent = "Update check failed.";
        }
    }


    function centerAndClampPixel(panel) {
        const rect = panel.getBoundingClientRect();
        const desiredLeft = Math.round((window.innerWidth - rect.width) / 2);
        const desiredTop = Math.round((window.innerHeight - rect.height) / 2);
        const clamped = clampPosition(desiredLeft, desiredTop, rect.width, rect.height);
        panel.style.left = clamped.left + "px";
        panel.style.top = clamped.top + "px";
        panel.style.transform = "";
    }

    function installPulseAndChatBlocker() {
        if (window.__utilify_block_installed) return;
        window.__utilify_orig_xhr_open = XMLHttpRequest.prototype.open;
        window.__utilify_orig_xhr_send = XMLHttpRequest.prototype.send;
        window.__utilify_orig_fetch = window.fetch;

        function shouldBlockPostPath(pathname) {
            if (!pathname) return false;
            if (/^\/user\/\d+\/pulse\/?$/.test(pathname)) return true;
            return false;
        }
        XMLHttpRequest.prototype.open = function(method, url) {
            try {
                this.__utilify_target_method = (method || "").toString().toUpperCase();
                this.__utilify_target_url = typeof url === 'string' ? url : (url && url.url) || null;
            } catch {}
            return window.__utilify_orig_xhr_open.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function(body) {
            try {
                const m = this.__utilify_target_method || "GET";
                let full = this.__utilify_target_url || "";
                try {
                    full = new URL(full, location.href).href;
                } catch {}
                const u = new URL(full);
                if (m === "POST" && shouldBlockPostPath(u.pathname)) {
                    try {
                        this.abort && this.abort();
                    } catch {}
                    return;
                }
            } catch {}
            return window.__utilify_orig_xhr_send.apply(this, arguments);
        };
        window.fetch = function(resource, init) {
            try {
                const method = (init && init.method) ? ("" + init.method).toUpperCase() : "GET";
                let url = resource instanceof Request ? resource.url : resource;
                if (method === "POST" && typeof url === "string") {
                    let full = url;
                    try {
                        full = new URL(url, location.href).href;
                    } catch {}
                    try {
                        const u = new URL(full);
                        const path = u.pathname || "";
                        if (shouldBlockPostPath(path)) {
                            return Promise.resolve(new Response(null, {
                                status: 204
                            }));
                        }
                    } catch {}
                }
            } catch {}
            return window.__utilify_orig_fetch.apply(this, arguments);
        };
        window.__utilify_block_installed = true;
    }

    function uninstallPulseAndChatBlocker() {
        if (!window.__utilify_block_installed) return;
        if (window.__utilify_orig_xhr_open) {
            XMLHttpRequest.prototype.open = window.__utilify_orig_xhr_open;
            delete window.__utilify_orig_xhr_open;
        }
        if (window.__utilify_orig_xhr_send) {
            XMLHttpRequest.prototype.send = window.__utilify_orig_xhr_send;
            delete window.__utilify_orig_xhr_send;
        }
        if (window.__utilify_orig_fetch) {
            window.fetch = window.__utilify_orig_fetch;
            delete window.__utilify_orig_fetch;
        }
        window.__utilify_block_installed = false;
    }

    function applyConfigToUI(panel, cfg) {
        panel.querySelector("#gradient-angle").value = cfg.gradientAngle || 45;
        panel.querySelector("#color1").value = cfg.gradientColor1 || "#3a3a3a";
        panel.querySelector("#color2").value = cfg.gradientColor2 || "#2b2a2a";
        panel.querySelector("#color1hex").value = cfg.gradientColor1 || "#3a3a3a";
        panel.querySelector("#color2hex").value = cfg.gradientColor2 || "#2b2a2a";
        panel.querySelector("#gradient-input").value = cfg.gradient || `linear-gradient(${cfg.gradientAngle||45}deg, ${cfg.gradientColor1||"#3a3a3a"}, ${cfg.gradientColor2||"#2b2a2a"})`;
        panel.querySelector("#glass-panels-toggle").checked = !!cfg.glassPanels ? .enabled;
        panel.querySelector("#glass-radius").value = cfg.glassPanels ? .radius || 8;
        panel.querySelector("#glass-hue").value = cfg.glassPanels ? .hue || 270;
        panel.querySelector("#glass-hue-value").textContent = cfg.glassPanels ? .hue || 270;
        panel.querySelector("#glass-alpha").value = Math.round((cfg.glassPanels ? .alpha || 0.16) * 100);
        panel.querySelector("#glass-alpha-value").textContent = Math.round((cfg.glassPanels ? .alpha || 0.16) * 100);
        panel.querySelector("#online-styles-input").value = cfg.onlineStyles || "";
        panel.querySelector("#custom-css-input").value = cfg.customCSS || "";
        panel.querySelector("#disable-friendslist").checked = !!cfg.disableFriendslist;
        panel.querySelector("#blur-sensitive").checked = !!cfg.blurSensitive;
        panel.querySelector("#blur-comments").checked = !!cfg.blurComments;
        panel.querySelector("#main-font").value = cfg.fontFamily || "default";
        panel.querySelector("#online-font-url").value = cfg.onlineFont || "";
        panel.querySelector("#exp-image-process").checked = !!cfg.experimentalImageProcessing;
        panel.querySelector("#r-appear-offline").checked = !!cfg.appearOffline;
        panel.querySelector("#r-friend-activity").checked = !!cfg.friendActivity;
        panel.querySelector("#r-player-type").checked = !!cfg.playerTypeDisplay;
        panel.querySelector("#r-player-type").checked = !!cfg.playerTypeDisplay;
        panel.querySelector("#r-lazy-streak").checked = !!cfg.lazyStreakKeeper;
    }

    function wirePanel(panel) {
        setupTabs(panel);
        loadGradientTab(panel);
        panel.querySelector("#r-lazy-streak").addEventListener("change", (e) => {
            const c = getConfig();
            c.lazyStreakKeeper = e.target.checked;
            saveConfig(c);
            if (c.lazyStreakKeeper) enableStreakKeeper();
            else teardownStreakKeeper();
        });

        panel.querySelector("#gradient-angle").addEventListener("input", (e) => {
            const a = parseInt(e.target.value, 10);
            const c1 = panel.querySelector("#color1").value;
            const c2 = panel.querySelector("#color2").value;
            const g = `linear-gradient(${a}deg, ${c1}, ${c2})`;
            const cfg = getConfig();
            cfg.gradient = g;
            cfg.gradientAngle = a;
            cfg.gradientColor1 = c1;
            cfg.gradientColor2 = c2;
            saveConfig(cfg);
            applyGradient(g, a, c1, c2);
        });

        ["#color1", "#color2"].forEach(sel => {
            panel.querySelector(sel).addEventListener("input", () => {
                const a = parseInt(panel.querySelector("#gradient-angle").value, 10);
                const c1 = panel.querySelector("#color1").value;
                const c2 = panel.querySelector("#color2").value;
                panel.querySelector("#color1hex").value = c1;
                panel.querySelector("#color2hex").value = c2;
                const g = `linear-gradient(${a}deg, ${c1}, ${c2})`;
                const cfg = getConfig();
                cfg.gradient = g;
                cfg.gradientColor1 = c1;
                cfg.gradientColor2 = c2;
                saveConfig(cfg);
                applyGradient(g, a, c1, c2);
            });
        });

        panel.querySelector("#color1hex").addEventListener("change", (e) => {
            const v = e.target.value.trim();
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
                panel.querySelector("#color1").value = v;
                panel.querySelector("#color1hex").value = v;
                panel.querySelector("#color1").dispatchEvent(new Event('input'));
            }
        });
        panel.querySelector("#color2hex").addEventListener("change", (e) => {
            const v = e.target.value.trim();
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
                panel.querySelector("#color2").value = v;
                panel.querySelector("#color2hex").value = v;
                panel.querySelector("#color2").dispatchEvent(new Event('input'));
            }
        });

        panel.querySelector("#gradient-input").addEventListener("input", (e) => {
            const val = e.target.value.trim();
            if (!val) return;
            const m = val.match(/linear-gradient\((\d+)deg\s*,\s*(#[0-9a-f]{3,6}|rgba?\([^)]+\))\s*,\s*(#[0-9a-f]{3,6}|rgba?\([^)]+\))\)/i);
            if (m) {
                const ang = parseInt(m[1], 10);
                panel.querySelector("#gradient-angle").value = ang;
                panel.querySelector("#color1").value = m[2];
                panel.querySelector("#color2").value = m[3];
                panel.querySelector("#color1hex").value = m[2];
                panel.querySelector("#color2hex").value = m[3];
                const cfg = getConfig();
                cfg.gradient = val;
                cfg.gradientAngle = ang;
                cfg.gradientColor1 = m[2];
                cfg.gradientColor2 = m[3];
                saveConfig(cfg);
                applyGradient(val, ang, m[2], m[3]);
            }
        });

        panel.querySelector("#gradient-copy").addEventListener("click", () => {
            const v = panel.querySelector("#gradient-input").value.trim();
            if (v) navigator.clipboard ? .writeText(v);
            panel.querySelector("#gradient-copy").textContent = "Copied!";
            setTimeout(() => panel.querySelector("#gradient-copy").textContent = "Copy", 1200);
        });
        panel.querySelector("#gradient-clear").addEventListener("click", () => {
            panel.querySelector("#gradient-input").value = "";
            panel.querySelector("#gradient-angle").value = 45;
            panel.querySelector("#color1").value = "#3a3a3a";
            panel.querySelector("#color2").value = "#2b2a2a";
            panel.querySelector("#color1hex").value = "#3a3a3a";
            panel.querySelector("#color2hex").value = "#2b2a2a";
            const c = getConfig();
            c.gradient = null;
            saveConfig(c);
            applyGradient(null);
        });

        panel.querySelector("#glass-panels-toggle").addEventListener("change", () => {
            const c = getConfig();
            c.glassPanels.enabled = panel.querySelector("#glass-panels-toggle").checked;
            saveConfig(c);
            applyGlassPanels(c);
        });
        panel.querySelector("#glass-radius").addEventListener("input", () => {
            const c = getConfig();
            c.glassPanels.radius = parseInt(panel.querySelector("#glass-radius").value) || 8;
            saveConfig(c);
            applyGlassPanels(c);
        });
        panel.querySelector("#glass-hue").addEventListener("input", () => {
            const v = parseInt(panel.querySelector("#glass-hue").value) || 270;
            panel.querySelector("#glass-hue-value").textContent = v;
            const c = getConfig();
            c.glassPanels.hue = v;
            saveConfig(c);
            applyGlassPanels(c);
        });
        panel.querySelector("#glass-alpha").addEventListener("input", () => {
            const v = parseInt(panel.querySelector("#glass-alpha").value) || 16;
            panel.querySelector("#glass-alpha-value").textContent = v;
            const c = getConfig();
            c.glassPanels.alpha = v / 100;
            saveConfig(c);
            applyGlassPanels(c);
        });

        panel.querySelector("#online-styles-input").addEventListener("change", (e) => {
            const c = getConfig();
            c.onlineStyles = e.target.value || "";
            saveConfig(c);
            loadOnlineCSS(c.onlineStyles);
        });
        panel.querySelector("#custom-css-input").addEventListener("change", (e) => {
            const c = getConfig();
            c.customCSS = e.target.value || "";
            saveConfig(c);
            applyCustomCSS(c.customCSS);
        });

        ["disable-friendslist", "blur-sensitive", "blur-comments"].forEach(id => {
            const el = panel.querySelector("#" + id);
            el.addEventListener("change", () => {
                const c = getConfig();
                c.disableFriendslist = panel.querySelector("#disable-friendslist").checked;
                c.blurSensitive = panel.querySelector("#blur-sensitive").checked;
                c.blurComments = panel.querySelector("#blur-comments").checked;
                saveConfig(c);
                updatePrivacyStyles(c);
            });
        });

        panel.querySelector("#main-font").addEventListener("change", (e) => {
            const val = e.target.value;
            const c = getConfig();
            c.fontFamily = val;
            saveConfig(c);
            if (val === "roboto") applyGlobalFont("'Roboto', system-ui, sans-serif");
            else if (val === "comfortaa") {
                loadFont("https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;700&display=swap");
                applyGlobalFont("'Comfortaa', system-ui, sans-serif");
            } else if (val === "online") {
                if (c.onlineFont) loadFont(c.onlineFont);
            } else applyGlobalFont("system-ui, sans-serif");
            panel.querySelector("#font-preview").style.fontFamily = getComputedStyle(document.body).fontFamily;
        });
        panel.querySelector("#online-font-url").addEventListener("change", (e) => {
            const url = e.target.value.trim();
            const c = getConfig();
            c.onlineFont = url;
            saveConfig(c);
            if (url) loadFont(url);
        });

        panel.querySelector("#exp-image-process").addEventListener("change", (e) => {
            const c = getConfig();
            c.experimentalImageProcessing = e.target.checked;
            saveConfig(c);
            if (c.experimentalImageProcessing) {
                if (!window.__utilify_invisible_mo) window.__utilify_invisible_mo = enableImageBackgroundProcessing();
            } else {
                if (window.__utilify_invisible_mo) {
                    try {
                        window.__utilify_invisible_mo.disconnect();
                    } catch {}
                    window.__utilify_invisible_mo = null;
                }
            }
        });

        panel.querySelector("#r-appear-offline").addEventListener("change", (e) => {
            const c = getConfig();
            c.appearOffline = e.target.checked;
            saveConfig(c);
            if (c.appearOffline) installPulseAndChatBlocker();
            else uninstallPulseAndChatBlocker();
        });

        panel.querySelector("#r-friend-activity").addEventListener("change", (e) => {
            const c = getConfig();
            c.friendActivity = e.target.checked;
            saveConfig(c);
            if (c.friendActivity) ensureFriendActivity();
            else teardownFriendActivity();
        });

        panel.querySelector("#r-player-type").addEventListener("change", (e) => {
            const c = getConfig();
            c.playerTypeDisplay = e.target.checked;
            saveConfig(c);
            if (c.playerTypeDisplay) ensurePlayerTypeDisplay();
            else teardownPlayerTypeDisplay();
        });

        panel.querySelector("#check-update").addEventListener("click", () => checkForUpdatesUI(panel));
    }

    function waitForSelectors(selectors, timeout = 8000) {
        const start = Date.now();
        return new Promise((resolve) => {
            function lookup() {
                for (const s of selectors) {
                    const el = document.querySelector(s);
                    if (el) return el;
                }
                return null;
            }
            const initial = lookup();
            if (initial) return resolve(initial);
            const mo = new MutationObserver(() => {
                const found = lookup();
                if (found) {
                    mo.disconnect();
                    resolve(found);
                    return;
                }
            });
            mo.observe(document.documentElement || document.body, {
                childList: true,
                subtree: true
            });
            setTimeout(() => {
                try {
                    mo.disconnect();
                } catch {}
                resolve(null);
            }, timeout);
        });
    }

    function createSettingsButton() {
        if (document.getElementById(SETTINGS_BUTTON_ID)) return document.getElementById(SETTINGS_BUTTON_ID);
        const container = document.createElement("div");
        container.id = SETTINGS_CONTAINER_ID;
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.marginRight = "8px";
        container.style.zIndex = "1001";

        const btn = document.createElement("button");
        btn.id = SETTINGS_BUTTON_ID;
        btn.setAttribute("aria-label", "Open Utilify Settings");
        btn.style.background = "transparent";
        btn.style.border = "0";
        btn.style.cursor = "pointer";
        btn.style.padding = "6px";
        btn.style.borderRadius = "6px";
        btn.style.display = "flex";
        btn.style.alignItems = "center";
        btn.style.justifyContent = "center";
        btn.style.color = "#fff";
        btn.innerHTML = `<svg viewBox="0 0 512 512" height="18" width="18" fill="currentColor" aria-hidden="true"><path d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"></path></svg>`;

        container.appendChild(btn);

        const selectors = [
            "li._3WhKY" // ONLY target the specific list item in the main navbar
        ];

        function attemptInsertToTarget(target) {
            try {
                if (!target || !target.parentNode) return false;
                target.parentNode.insertBefore(container, target);
                return true;
            } catch (e) {
                return false;
            }
        }

        for (const sel of selectors) {
            const t = document.querySelector(sel);
            if (t && attemptInsertToTarget(t)) return btn;
        }

        const mo = new MutationObserver((mutations, obs) => {
            for (const sel of selectors) {
                const t = document.querySelector(sel);
                if (t && attemptInsertToTarget(t)) {
                    obs.disconnect();
                    return;
                }
            }
        });
        mo.observe(document.documentElement || document.body, {
            childList: true,
            subtree: true
        });

        return btn;
    }

    'use strict';

    let __friendActivity = {
        observer: null,
        games: {},
        projects: {},
        profileId: null
    };
    let __playerType = {
        attached: false,
        timer: null
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
                        if (options.current_user ? .id) return options.current_user.id;
                        if (options.object ? .id) return options.object.id;
                    }
                } catch {}
            }
        }
        return null;
    }

    async function fetchGameTitle(GID) {
        if (__friendActivity.games[GID]) return __friendActivity.games[GID];
        try {
            const res = await fetch(`https://www.kogama.com/games/play/${GID}/`);
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const title = doc.querySelector('title') ? .textContent.split(' - KoGaMa')[0] ? .trim() || null;
            if (title) __friendActivity.games[GID] = title;
            return title;
        } catch {
            return null;
        }
    }

    async function fetchProjectName(POID) {
        if (__friendActivity.projects[POID]) return __friendActivity.projects[POID];
        try {
            const res = await fetch(`https://www.kogama.com/game/${POID}/member`);
            if (!res.ok) return null;
            const data = await res.json();
            if (data.data ? .length) {
                const projectName = data.data[0].name;
                __friendActivity.projects[POID] = projectName;
                return projectName;
            }
        } catch {}
        return null;
    }

    function updateFriendStatusInDOM(name, text) {
        document.querySelectorAll('._1taAL').forEach(friendEl => {
            const nameEl = friendEl.querySelector('._3zDi-');
            const statusEl = friendEl.querySelector('._40qZj');
            if (nameEl ? .textContent ? .trim() === name && statusEl) {
                statusEl.textContent = text;
            }
        });
    }

    function extractLocationFromEntry(entry) {
        if (!entry) return null;
        const statusEl = entry.querySelector('._40qZj');
        if (statusEl && statusEl.textContent) {
            const t = statusEl.textContent.trim();
            const matchUrl = t.match(/(\/games\/play\/\d+\/|\/build\/\d+\/project\/\d+\/)/);
            if (matchUrl) return matchUrl[0];
        }
        const anchor = entry.querySelector('a[href]');
        if (anchor) return anchor.getAttribute('href');
        return null;
    }

    function processFriendEntry(entry) {
        const nameEl = entry.querySelector('._3zDi-');
        if (!nameEl) return;
        const name = nameEl.textContent ? .trim();
        if (!name) return;
        const loc = extractLocationFromEntry(entry);
        if (!loc) return;

        const gameMatch = loc.match(/\/games\/play\/(\d+)\//);
        if (gameMatch) {
            const gid = gameMatch[1];
            fetchGameTitle(gid).then(title => {
                if (title) updateFriendStatusInDOM(name, title);
            });
            return;
        }

        const projectMatch = loc.match(/\/build\/\d+\/project\/(\d+)\//) || loc.match(/\/game\/(\d+)\/member/);
        if (projectMatch) {
            const pid = projectMatch[1];
            fetchProjectName(pid).then(nameText => {
                if (nameText) updateFriendStatusInDOM(name, nameText);
            });
        }
    }

    function scanFriendListOnce(container) {
        if (!container) return;
        container.querySelectorAll('._1lvYU, ._1taAL').forEach(node => processFriendEntry(node));
    }

    async function fetchFriendChat(profileId) {
        if (!profileId) return;
        try {
            const res = await fetch(`https://www.kogama.com/user/${profileId}/friend/chat/`);
            if (!res.ok) return;
            const data = await res.json();
            if (!data.data || !Array.isArray(data.data)) return;

            data.data.forEach(friend => {
                const username = friend.username;
                const loc = friend.location || '/';

                const gameMatch = loc.match(/\/games\/play\/(\d+)\//);
                if (gameMatch) fetchGameTitle(gameMatch[1]).then(title => title && updateFriendStatusInDOM(username, title));

                const projectMatch = loc.match(/\/build\/\d+\/project\/(\d+)\//) || loc.match(/\/game\/(\d+)\/member/);
                if (projectMatch) fetchProjectName(projectMatch[1]).then(nameText => nameText && updateFriendStatusInDOM(username, nameText));
            });
        } catch (err) {
            console.error('Error fetching friend chat:', err);
        }
    }

    function attachFriendObserver(container) {
        scanFriendListOnce(container);
        const mo = new MutationObserver((muts) => {
            for (const m of muts) {
                m.addedNodes ? .forEach(node => {
                    if (!(node instanceof Element)) return;
                    if (node.matches('._1lvYU, ._1taAL')) processFriendEntry(node);
                    node.querySelectorAll('._1lvYU, ._1taAL').forEach(n => processFriendEntry(n));
                });
                if (m.type === 'childList' && m.target instanceof Element) {
                    m.target.querySelectorAll('._1lvYU, ._1taAL').forEach(n => processFriendEntry(n));
                }
            }
        });
        mo.observe(container, {
            childList: true,
            subtree: true,
            attributes: false
        });
        window.__utilify_friend_observer = mo;
    }

    function ensureFriendActivity() {
        if (window.__utilify_friend_observer) return;

        const profileId = getProfileIdFromBootstrap();
        if (!profileId) return;

        __friendActivity.profileId = profileId;
        const containers = ['._1Yhgq', '._3Wytz', 'div[role="list"]', '.friends-list', '#friends'];
        let target = null;

        const initScanAndObserve = (container) => {
            // Initial fetch
            fetchFriendChat(profileId);
            // Periodic fetch every ~30s
            __friendActivity.timer = setInterval(() => fetchFriendChat(profileId), 30000);
            // Initial DOM scan
            scanFriendListOnce(container);
            // Attach observer
            attachFriendObserver(container);
        };

        for (const sel of containers) {
            const el = document.querySelector(sel);
            if (el) {
                target = el;
                break;
            }
        }

        if (target) {
            initScanAndObserve(target);
        } else {
            const retry = setInterval(() => {
                for (const sel of containers) {
                    const el = document.querySelector(sel);
                    if (el) {
                        clearInterval(retry);
                        initScanAndObserve(el);
                        return;
                    }
                }
            }, 500);
            setTimeout(() => clearInterval(retry), 8000);
        }
    }

    function teardownFriendActivity() {
        if (__friendActivity.timer) {
            clearInterval(__friendActivity.timer);
            __friendActivity.timer = null;
        }
        if (window.__utilify_friend_observer) {
            try {
                window.__utilify_friend_observer.disconnect();
            } catch {}
            window.__utilify_friend_observer = null;
        }
    }


    const PLAYER_SELECTOR = ".MuiChip-colorPrimary, .PlayerCountChip, [data-player-chip], .player-chip, .playerCountChip";

    async function fetchTextWithTimeout(url, timeout = 8000) {
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), timeout);
        try {
            const r = await fetch(url, {
                signal: ctrl.signal
            });
            clearTimeout(id);
            if (!r.ok) throw new Error(r.status);
            return await r.text();
        } finally {
            clearTimeout(id);
        }
    }

    function parseCounts(html) {
        const m = html.match(/playing_now_members["']\s*:\s*(\d+).*?playing_now_tourists["']\s*:\s*(\d+)/s);
        return m ? {
            members: +m[1],
            tourists: +m[2]
        } : null;
    }

    function styleChip(el) {
        Object.assign(el.style, {
            background: "linear-gradient(180deg, rgba(8,14,24,0.65), rgba(6,10,16,0.55))",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "6px 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            color: "#eaf6ff",
            boxShadow: "0 6px 22px rgba(0,0,0,0.35)",
            cursor: "default",
            userSelect: "none",
            fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
            fontSize: "13px"
        });
    }

    function spanNode(title, val, color) {
        const s = document.createElement("span");
        s.innerHTML = `<span style="color:${color}; font-weight:600; margin-right:6px">${title}:</span> ${val}`;
        return s;
    }

    function cloneIcon(el) {
        try {
            return el.querySelector("svg") ? .cloneNode(true) ? ? null;
        } catch {
            return null;
        }
    }

    async function obtainCounts(url) {
        const key = "player_counts|" + url;
        try {
            const raw = sessionStorage.getItem(key);
            if (raw) {
                const obj = JSON.parse(raw);
                if (Date.now() - obj.t < 10000) return obj.v;
            }
        } catch {}
        try {
            const txt = await fetchTextWithTimeout(url, 8000);
            const parsed = parseCounts(txt) || {
                members: 0,
                tourists: 0
            };
            parsed.updatedAt = new Date().toLocaleTimeString();
            try {
                sessionStorage.setItem(key, JSON.stringify({
                    t: Date.now(),
                    v: parsed
                }));
            } catch {}
            return parsed;
        } catch {
            const fallback = {
                members: 0,
                tourists: 0,
                updatedAt: new Date().toLocaleTimeString()
            };
            try {
                sessionStorage.setItem(key, JSON.stringify({
                    t: Date.now(),
                    v: fallback
                }));
            } catch {}
            return fallback;
        }
    }

    async function renderPlayerChip(el) {
        if (!el) return;
        const counts = await obtainCounts(location.href);
        el.dataset.analytics = "1";
        el.innerHTML = "";
        styleChip(el);
        const ic = cloneIcon(el) || (() => {
            const s = document.createElement("span");
            s.textContent = "👥";
            s.style.fontSize = "14px";
            return s;
        })();
        const total = (counts.members || 0) + (counts.tourists || 0);
        const t = spanNode("Global", total, "#a5d8ff");
        const p = spanNode("Players", counts.members ? ? 0, "#b2f2bb");
        const u = spanNode("Tourists", counts.tourists ? ? 0, "#ffc9c9");
        const time = document.createElement("span");
        time.style.opacity = "0.6";
        time.style.fontSize = "12px";
        time.textContent = counts.updatedAt ? `• ${counts.updatedAt}` : "";
        el.append(ic, t, p, u, time);
    }

    function ensurePlayerTypeDisplay() {
        if (!location.pathname.includes("/games/play/")) return;
        if (window.__utilify_player_attached) return;
        const chip = document.querySelector(PLAYER_SELECTOR);
        if (chip) {
            renderPlayerChip(chip);
            window.__utilify_player_attached = true;
            return;
        }
        const mo = new MutationObserver(() => {
            const node = document.querySelector(PLAYER_SELECTOR);
            if (node) {
                renderPlayerChip(node);
                mo.disconnect();
                window.__utilify_player_attached = true;
            }
        });
        mo.observe(document.body, {
            childList: true,
            subtree: true
        });
        window.__utilify_player_mo = mo;
    }

    function teardownPlayerTypeDisplay() {
        if (window.__utilify_player_mo) {
            try {
                window.__utilify_player_mo.disconnect();
            } catch {}
            window.__utilify_player_mo = null;
        }
        window.__utilify_player_attached = false;
    }

    function applyAll(cfg) {
        applyGradient(cfg.gradient || `linear-gradient(${cfg.gradientAngle||45}deg, ${cfg.gradientColor1||"#3a3a3a"}, ${cfg.gradientColor2||"#2b2a2a"})`, cfg.gradientAngle, cfg.gradientColor1, cfg.gradientColor2);
        updatePrivacyStyles(cfg);
        applyGlassPanels(cfg);
        loadOnlineCSS(cfg.onlineStyles || "");
        applyCustomCSS(cfg.customCSS || "");
        if (cfg.onlineFont) loadFont(cfg.onlineFont);
        if (cfg.invisibleAvatars) {
            if (!window.__utilify_invisible_mo) window.__utilify_invisible_mo = enableImageBackgroundProcessing();
        } else {
            if (window.__utilify_invisible_mo) {
                try {
                    window.__utilify_invisible_mo.disconnect();
                } catch {}
                window.__utilify_invisible_mo = null;
            }
        }
        if (cfg.experimentalImageProcessing) {
            if (!window.__utilify_invisible_mo) window.__utilify_invisible_mo = enableImageBackgroundProcessing();
        }
        if (cfg.appearOffline) installPulseAndChatBlocker();
        else uninstallPulseAndChatBlocker();
        if (cfg.friendActivity) ensureFriendActivity();
        else teardownFriendActivity();
        if (cfg.playerTypeDisplay) ensurePlayerTypeDisplay();
        else teardownPlayerTypeDisplay();
        if (cfg.lazyStreakKeeper) enableStreakKeeper();
        else teardownStreakKeeper();
    }

    function initialize() {
        ensureStyle();
        const settingsBtn = createSettingsButton();
        const panel = createPanel();
        enableDrag(panel);
        setupTabs(panel);
        applyConfigToUI(panel, getConfig());
        wirePanel(panel);

        panel.querySelector(".close").addEventListener("click", () => panel.classList.remove("visible"));

        settingsBtn.addEventListener("click", () => {
            const visible = panel.classList.toggle("visible");
            if (visible) {
                const cfg = getConfig();
                applyConfigToUI(panel, cfg);
                applyAll(cfg);
                panel.style.transform = "translate(-50%,-50%)";
                panel.style.left = "50%";
                panel.style.top = "50%";
                requestAnimationFrame(() => centerAndClampPixel(panel));
                panel.setAttribute("tabindex", "-1");
                panel.focus();
                const badge = panel.querySelector("#version_badge");
                if (badge) badge.textContent = "v" + getInstalledVersion();
            } else {}
        });

        const cfg = getConfig();
        applyAll(cfg);
        if (cfg.openOnLoad) {
            setTimeout(() => {
                try {
                    settingsBtn.click();
                } catch {
                    settingsBtn.dispatchEvent(new Event("click"));
                }
            }, 50);
        }
    }

    if (document.readyState === "complete" || document.readyState === "interactive") initialize();
    else window.addEventListener("load", initialize);

    window.addEventListener("beforeunload", () => {
        teardownFriendActivity();
        teardownPlayerTypeDisplay();
        teardownStreakKeeper();
    });

})();







// AVATAR FINDER CURRENTLY UNAVAILABLE :(

// Faster Friends V3
(function() {
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
            return sa.localeCompare(sb, undefined, {
                sensitivity: "base",
                numeric: false
            });
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
#frlscrape-root { position: fixed; z-index: 99999; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
#frlscrape-panel { position: fixed; z-index: 100000; width: min(920px, 92vw); max-height: 84vh; background: linear-gradient(180deg, rgba(12,18,28,0.95), rgba(5,8,12,0.95)); color: #eef6ff; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); overflow: hidden; display: flex; flex-direction: column; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; pointer-events: auto; }
#frlscrape-header { display:flex; align-items:center; justify-content:space-between; padding:12px 14px; gap:12px; border-bottom: 1px solid rgba(255,255,255,0.04); cursor: grab; user-select: none; }
#frlscrape-header.dragging { cursor: grabbing; }
#frlscrape-title { font-size:18px; font-weight:600; letter-spacing:0.2px; }
#frlscrape-controls { display:flex; gap:8px; align-items:center; margin-left:8px; }
#frlscrape-close { background:transparent; border:none; color:inherit; font-size:16px; cursor:pointer; padding:6px 8px; border-radius:8px; }
#frlscrape-close:hover { background: rgba(255,255,255,0.03); }
#frlscrape-search { width: 100%; max-width: 560px; display:flex; gap:8px; align-items:center; }
#frlscrape-search input { width:100%; padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color:inherit; outline:none; font-size:14px; }
#frlscrape-body { display:grid; grid-template-columns: repeat(3, 1fr); gap:14px; padding:14px 18px; overflow:auto; }
.frsection { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding:10px; border-radius:8px; min-height:120px; max-height:56vh; overflow:auto; }
.frsection h3 { margin:0 0 8px 0; font-size:13px; font-weight:600; color: #dbeefd; letter-spacing:0.3px; text-transform:uppercase; }
.entry { display:inline-flex; align-items:center; gap:6px; white-space:nowrap; margin-right:2px; margin-bottom:4px; }
.entry a { color: inherit; text-decoration: none; font-size:14px; padding:2px 6px; border-radius:6px; display:inline-block; }
.entry a:hover { background: rgba(255,255,255,0.03); text-decoration:underline; }
.separator { display:inline; margin-right:6px; color: rgba(255,255,255,0.48); }
.empty-note { color: rgba(255,255,255,0.5); font-size:13px; padding:6px 2px; }
#frlscrape-reopen { position: fixed; left: 50%; transform: translateX(-50%); bottom: 22px; z-index: 100000; padding: 10px 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); background: linear-gradient(180deg, rgba(10,16,26,0.98), rgba(20,30,45,0.98)); color: #eef6ff; cursor: pointer; box-shadow: 0 8px 30px rgba(0,0,0,0.45); font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; display: none; }
#frlscrape-reopen:hover { filter: brightness(1.02); }
@media (max-width:880px) { #frlscrape-body { grid-template-columns: 1fr; } }
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

            const header = document.createElement("div");
            header.id = "frlscrape-header";

            const leftWrap = document.createElement("div");
            leftWrap.style.display = "flex";
            leftWrap.style.alignItems = "center";
            leftWrap.style.gap = "12px";

            const title = document.createElement("div");
            title.id = "frlscrape-title";
            title.textContent = "Friends & Requests";

            const searchWrap = document.createElement("div");
            searchWrap.id = "frlscrape-search";

            const input = document.createElement("input");
            input.id = "frlscrape-search-input";
            input.type = "search";
            input.placeholder = "Search by username";
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
            closeBtn.innerHTML = "✕";

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
            document.body.appendChild(root);
            panel.style.left = "50%";
            panel.style.top = "50%";
            panel.style.transform = "translate(-50%,-50%)";
            delete panel.dataset.dragged;

            const reopen = document.createElement("button");
            reopen.id = "frlscrape-reopen";
            reopen.type = "button";
            reopen.textContent = "Open Friends Panel";
            document.body.appendChild(reopen);

            const ui = {
                root,
                panel,
                header,
                input,
                friendsSection,
                invitingSection,
                sentSection,
                reopen
            };

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
                document.addEventListener("touchmove", onMove, {
                    passive: false
                });
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
                const res = await fetch(url, {...opts,
                    signal: controller.signal
                });
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
                const items = friends.map(f => ({
                    name: f.friend_username || f.friend_profile_id,
                    href: `https://www.kogama.com/profile/${f.friend_profile_id}/`,
                    id: f.friend_profile_id
                }));
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
                const data = await fetchJSON(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                const arr = Array.isArray(data.data) ? data.data : [];
                const sent = arr.filter(r => String(r.profile_id) === String(profileID)).map(r => ({
                    name: r.friend_username || `id:${r.friend_profile_id}`,
                    href: `https://www.kogama.com/profile/${r.friend_profile_id}/`,
                    id: r.id
                }));
                const inviting = arr.filter(r => String(r.profile_id) !== String(profileID)).map(r => ({
                    name: r.profile_username || `id:${r.profile_id}`,
                    href: `https://www.kogama.com/profile/${r.profile_id}/`,
                    id: r.id
                }));
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


GM_addStyle(`
._1RMYS { display: none !important; }
`);



;
(function() {
    "use strict"

    if (!/^https:\/\/www\.kogama\.com\/profile\/\d+\/avatars\/?$/.test(
            window.location.href,
        )) {
        return
    }

    function addButtonsToAvatar(avatar) {
        if (avatar.querySelector(".rf76-0v")) {
            return
        }
        const avatarNameElement = avatar.querySelector("._2uIZL")
        const avatarName = avatarNameElement.textContent.trim()
        const backgroundImageStyle = avatar
            .querySelector("._3Up3H")
            .getAttribute("style")
        const imageUrlMatch = backgroundImageStyle.match(/url\("([^"]+)"\)/)
        const imageUrl = imageUrlMatch ? imageUrlMatch[1] : ""

        const marketplaceDiv = document.createElement("div")
        marketplaceDiv.textContent = "Find"
        marketplaceDiv.className = "rf76-0v"
        marketplaceDiv.style.cssText = `
            position: absolute;
            bottom: 15%;
            left: 29%;
            z-index: 999;
            width: 100px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            cursor: pointer;
            color: #fff;
            background-color: rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            transition: background-color 0.3s ease-in-out, letter-spacing 0.3s ease-in-out, width 0.3s ease-in-out;
        `
        marketplaceDiv.addEventListener("mouseenter", () => {
            marketplaceDiv.style.backgroundColor = "rgba(0, 0, 0, 0.4)"
            marketplaceDiv.style.width = "90px"
        })
        marketplaceDiv.addEventListener("mouseleave", () => {
            marketplaceDiv.style.backgroundColor = "rgba(255, 255, 255, 0.3)"
            marketplaceDiv.style.width = "100px"
        })

        marketplaceDiv.addEventListener("click", function() {
            const requestUrl = `https://www.kogama.com/model/market/?page=1&count=7000&order=undefined&category=avatar&orderBy=created&q=${encodeURIComponent(
				avatarName,
			)}`

            fetch(requestUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.data.length === 1) {
                        openMarketplacePage(data.data[0])
                    } else {
                        let foundMatch = false
                        const results = []
                        for (const object of data.data) {
                            if (getBaseUrl(object.image_large) === getBaseUrl(imageUrl)) {
                                foundMatch = true
                                openMarketplacePage(object)
                                break
                            }
                            results.push(object)
                        }
                        if (!foundMatch) {
                            showModal(results)
                        }
                    }
                })
                .catch(error => {
                    console.error("Error fetching data:", error)
                })
        })

        avatar.style.position = "relative"
        avatar.appendChild(marketplaceDiv)
    }

    function openMarketplacePage(object) {
        const productId = object.product_id
        const marketplaceUrl = `https://www.kogama.com/marketplace/avatar/${productId}/`
        window.open(marketplaceUrl, "_blank")
    }

    function getBaseUrl(url) {
        return url ? url.split("?")[0] : ""
    }

    function rescanAvatars() {
        const avatars = document.querySelectorAll(
            ".MuiGrid-root.MuiGrid-container.MuiGrid-spacing-xs-2 .MuiGrid-item",
        )

        avatars.forEach(avatar => {
            addButtonsToAvatar(avatar)
        })
    }

    function showModal(results) {
        const existingModal = document.querySelector(".rf76-modal")
        if (existingModal) {
            existingModal.remove()
        }

        const overlay = document.createElement("div")
        overlay.className = "rf76-overlay"
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 9998;
        `
        overlay.addEventListener("click", () => {
            modal.remove()
            overlay.remove()
        })


        const modal = document.createElement("div")
        modal.className = "rf76-modal"
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            background-color: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(10px);
            color: #000;
            border-radius: 10px;
            z-index: 9999;
            width: 80%;
            max-width: 800px;
            max-height: 80%;
            overflow-y: auto;
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        `

        const closeButton = document.createElement("div")
        closeButton.textContent = "✖"
        closeButton.className = "rf76-close"
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.4);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `
        closeButton.addEventListener("click", () => {
            modal.remove()
            overlay.remove()
        })

        modal.appendChild(closeButton)
        results.forEach(result => {
            const resultDiv = document.createElement("div")
            resultDiv.style.cssText = `
                width: calc(50% - 10px);
                margin-bottom: 20px;
                position: relative;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease-in-out;
            `

            const avatarImg = document.createElement("img")
            avatarImg.onload = () => {
                avatarImg.style.opacity = "1"
            }
            avatarImg.onerror = error => {
                console.error("Error loading image:", error)
            }
            avatarImg.src = result.image_large
            avatarImg.style.cssText = `
                width: 100%;
                height: auto;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
            `

            const avatarLink = document.createElement("a")
            avatarLink.href = `https://www.kogama.com/marketplace/avatar/${result.product_id}/`
            avatarLink.textContent = result.name
            avatarLink.style.cssText = `
                position: absolute;
                font-size: 30px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #fff;
                text-shadow: 0 0 4px #fff;
                text-decoration: none;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
            `

            resultDiv.addEventListener("mouseenter", () => {
                avatarImg.style.filter = "blur(7px)"
                avatarLink.style.opacity = "1"
            })

            resultDiv.addEventListener("mouseleave", () => {
                avatarImg.style.filter = "none"
                avatarLink.style.opacity = "0"
            })

            resultDiv.appendChild(avatarImg)
            resultDiv.appendChild(avatarLink)

            modal.appendChild(resultDiv)
        })

        document.body.appendChild(overlay)
        document.body.appendChild(modal)
    }

    window.addEventListener("load", function() {
        setTimeout(function() {
            rescanAvatars()

            setInterval(function() {
                const missingButtons = document.querySelectorAll(".rf76-0v")
                if (missingButtons.length === 0) {
                    rescanAvatars()
                }
            }, 2000)
        }, 1000)
    })
})();
(() => {
    const map = {
        "24051519": "owner",
        "17037147": "owner",
        "16947158": "friend",
        "36355": "friend",
        "669433161": "friend"
    };
    const uid = location.pathname.match(/profile\/(\d+)\/?/) ? .[1];
    if (!uid || !map[uid]) return;

    const badgeText = "Utilify Friend";
    const creditText = `This profile is associated with Utilify as a whole. <br> Their presence made a difference. <br> <a href="https://github.com/midweststatic/Utilify/" target="_blank" rel="noopener noreferrer">GitHub</a>`;


    const style = document.createElement("style");
    style.textContent = `
    @keyframes rainbow_animation {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    a {
      background: linear-gradient(to right, #ff1d1d, #ff1eec, #fc22ea, #0f93ff, #00ffb3, #00ff00, #fffb21, #e69706, #ff1111);
      -webkit-background-clip: text;
      background-clip: text;
      animation: rainbow_animation 10s ease-in-out infinite;
      background-size: 400% 100%;
      font-weight: bold;
      }
      .css-bho9d5 svg {
    fill: #fff !important;
    stroke: #fff !important;
    color: rgba(0, 0, 0, 0.1) !important;
}
      ._1u05O { color: white !important; }
      ._1q4mD ._1sUGu ._1u05O ._3RptD { color: white !important; }
      ._1dXzR {
      max-height: 430px !important;
      }
    .badge-panel {
      position: fixed;
      left: 50%;
      bottom: 28px;
      transform: translateX(-50%);
      z-index: 9999;
      min-width: 220px;
      max-width: 70vw;
      padding: 10px 14px;
      border-radius: 14px;
      background: #222;
      box-shadow: 0 0 15px rgba(0,0,0,0.6);
      font-family: Inter, system-ui, Arial, sans-serif;
      font-size: 13px;
      line-height: 1.25;
      text-align: center;
    }

    .badge-title {
      background: linear-gradient(to right, #ff1d1d, #ff1eec, #fc22ea, #0f93ff, #00ffb3, #00ff00, #fffb21, #e69706, #ff1111);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent !important;
      animation: rainbow_animation 10s ease-in-out infinite;
      background-size: 400% 100%;
      font-weight: bold;
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
    }

    .badge-credit {
      color: #eaeaea;
      font-size: 12px;
    }

    .badge-panel a { color: #aaf; text-decoration: underline; }
  `;
    document.head.appendChild(style);

    const panel = document.createElement("div");
    panel.className = "badge-panel";

    const title = document.createElement("span");
    title.className = "badge-title";
    title.textContent = badgeText;

    const credit = document.createElement("div");
    credit.className = "badge-credit";
    credit.innerHTML = creditText;

    panel.appendChild(title);
    panel.appendChild(credit);
    document.body.appendChild(panel);
})();
