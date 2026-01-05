// Update Checker
(function() {
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
      if (r[i] > c[i]) return 1;
      if (r[i] < c[i]) return -1;
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
