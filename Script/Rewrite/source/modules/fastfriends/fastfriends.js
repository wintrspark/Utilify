// Faster Friends V3
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
  
