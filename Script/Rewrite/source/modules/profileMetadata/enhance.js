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
