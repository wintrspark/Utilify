
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
