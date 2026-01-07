
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
