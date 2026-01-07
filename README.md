# ⚡ Utilify

A modern, high-performance userscript suite for **KoGaMa** featuring a complete visual overhaul with an "Ethereal" aesthetic, enhanced UI components, and powerful utilities for profile customization and social features.

***

## 🛑 Safety & Compliance Notice

Utilify is a third-party extension. Users are solely responsible for its use and should adhere strictly to the platform's rules.

### Official KoGaMa Developer Guidelines
The lead web developer at KoGaMa has stated that extensions are welcome as long as:
1. **Privacy is respected:** No violation of other users' privacy.
2. **Responsible API use:** No spam-polling (cache where sensible).
3. **No client interference:** The extension must not interfere with the game client itself.

> [!WARNING]  
> **Risk Assessment:** Features under the "Use At Your Own Risk" section (UAOR) include network interception and frequent polling. While functional, they push the boundaries of these guidelines and should be used with caution.

***

## ✨ Highlights (V2.3)

### 🎨 Complete Visual Overhaul
Experience a completely new "Ethereal" aesthetic with glassmorphism, gradients, and particle animations throughout the interface.

* **Glassmorphic UI:** Semi-transparent panels with backdrop blur and gradient borders
* **Animated Elements:** Floating buttons, sparkle effects (✦ ✧), and smooth transitions
* **Cohesive Color Scheme:** Deep dark blues (#1a1b1e) with pastel pink/purple accents (#ffc0cb, #c8bed8)

### 🔧 Enhanced Features
* **Smart Link Obfuscation:** Automatically replaces dots with `%2E` in text fields (except whitelisted domains like YouTube)
* **Feed Manager:** New ✦ button on profiles to view and manage your feed posts/comments with delete options
* **Profile Effect Tooltips:** Floating tooltips when typing `filter:` to list available effects

### 🌟 New Profile Effects
* **Sparkles:** Floating particle system with shimmering effects
* **September:** Combined rain and sparkles for an autumn aesthetic
* **Imgur Backgrounds:** Support for external images via `Background: imgur:IMAGE_ID`

***

## 🚀 Key Features

* **Profile Customization:** Client-side rendering of Rain, Snow, Fireflies, Roses, Sparkles, and September effects
* **Smart URL Tools:** Automatic link obfuscation to bypass filters
* **Bio Utilities:** Quick-copy button and "📜 Archive" shortcut for the Wayback Machine
* **Friends List Search:** Real-time filtering with glassmorphic UI
* **Custom Styling:** Support for `linear-gradient` backgrounds and global CSS injection
* **Feed Management:** Delete individual or all posts/comments from your profile feed

***

## 🛠️ Installation Guide

### Step 1: Install a Userscript Manager
While Tampermonkey is the traditional choice, we highly recommend **ScriptCat** for better performance and modern feature support.

* **Recommended:** [**ScriptCat**](https://scriptcat.org/) (Modern & Optimized)
* **Alternative:** [Tampermonkey](https://www.tampermonkey.net/)

### Step 2: Install Utilify
Once your manager is ready, click the link below to install:
👉 [**Install Utilify (Ethereal Edition)**](https://raw.githubusercontent.com/gxthickitty/Utilify/refs/heads/main/Utilify.user.js)

***

## ⚙️ Configuration & Usage

### Profile Backgrounds
Apply custom backgrounds using tags in your profile bio:

* **Gradients:** `Background: linear-gradient(45deg, #ff0000, #0000ff)`
* **Imgur Images:** `Background: imgur:aBcDeFg`
* **Multiple Effects:** `background:i-IMGID,filter:roses,rain;`

### Available Filters
- `rain` - Raindrops falling
- `snow` - Snowflakes drifting
- `fireflies` - Pulsing light particles
- `roses` - Falling floral animation
- `sparkles` - Shimmering particle effects
- `september` - Combined rain and sparkles

### Smart Obfuscation
Simply type or paste a URL into any text field. Dots will automatically be converted to `%2E` except for whitelisted domains (YouTube, etc.).

***

## 🔄 Update Log

### **v2.3.0** *(Current)*
* **COMPLETE REWRITE:** Object-oriented codebase with UI, Storage, and RiskyFeatures objects
* **VISUAL OVERHAUL:** New "Ethereal" aesthetic with glassmorphism, gradients, and animations
* **NEW SETTINGS PANEL:** Draggable, animated panel with contributor credits and improved organization
* **NEW FEATURES:**
  - Feed Manager for deleting posts/comments
  - Profile effect tooltips
  - Sparkles and September particle effects
  - Smart automatic link obfuscation
* **UI ENHANCEMENTS:**
  - Floating settings button with rotating star (✦)
  - Redesigned contributor badge as shimmering card
  - Animated tabs and buttons throughout
* **REMOVED:** Mass purchase tool (Auto Buyer) and Ivy effect
* **REPOSITORY CHANGE:** Now maintained at `gxthickitty/Utilify`

### **v2.1.0 -- December 2025**
* **NEW:** Integrated Search Bar for the Friends list
* **NEW:** Support for Imgur IDs in the Background system (`imgur:ID`)
* **NEW:** Added **Roses** and **Ivy** particle effects
* **IMPROVED:** URL Obfuscation button moved inside input fields
* **IMPROVED:** Optimized Firefly system with pulsing glow effects

### **v2.0.9**
* Core rewrite release including CSS fixes for glass panels
* Fixed AvatarFinder logic and improved bio-copy selectors
* Introduced initial background effects: Snow, Rain, Fireflies, and Blur

***

## ⚠️ Use At Your Own Risk (UAOR) Features

These features are functional but push the boundaries of KoGaMa's extension guidelines:

* **Pulse Blocker:** Appear offline by intercepting network requests
* **Friend Activity:** Monitor friend game/project links via observation
* **Player Type Display:** Show Global/Players/Tourists chip on game pages
* **Streak Keeper:** Automate chat messages to specific bot accounts

> [!WARNING]
> I am not responsible for any inappropriate content (including NSFW images) set via the Imgur background system. Use external image hosting at your own discretion.

***
## 👥 Credits

**Developer:** Simon (`gxthickitty`)  
**Contributors:** Death Wolf, Snowy, Awoi, and other community members

*Utilify is not affiliated with or endorsed by KoGaMa.*



<img width="1885" height="1042" alt="{846F2600-EA2E-4AD8-A67F-3F19DAB04651}" src="https://github.com/user-attachments/assets/d47cdc60-32d9-4be6-8e80-cafa8623293b" />
