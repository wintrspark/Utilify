# ⚡ Utilify (Rewrite)

A modern, high-performance, and modular userscript suite designed to enhance the **KoGaMa** experience through UI improvements, social tools, and advanced profile customization.

***

## 🛑 Safety & Compliance Notice

Utilify is a third-party extension. Users are solely responsible for its use and should adhere strictly to the platform's rules.

### Official KoGaMa Developer Guidelines
The lead web developer at KoGaMa has stated that extensions are welcome as long as:
1. **Privacy is respected:** No violation of other users' privacy.
2. **Responsible API use:** No spam-polling (cache where sensible).
3. **No client interference:** The extension must not interfere with the game client itself.

> [!WARNING]  
> **Risk Assessment:** Features like "Friend Activity Stalking" (frequent polling) and "Appear Offline" (network interception) are included for power users but should be used with caution as they push the boundaries of these guidelines.

***

## ✨ What's New in v2.1.0

### 🖼️ Enhanced Backgrounds (Imgur Support)
The profile background system has been upgraded to support external images.
* **How to use:** Add the tag `Background: imgur:IMAGE_ID` to your profile bio.
* **Example:** Using `Background: imgur:aBcDeFg` will fetch that specific image and apply it as your profile backdrop.

### 🔍 Friends List Search
A new, sleek search bar is now integrated directly into your friends list.
* **Real-time Filtering:** Type a name to instantly filter your friends.
* **Glassmorphism UI:** Features a modern "glass" design with smooth fade-in animations.


### 🌿 New Particle Effects
> [!WARNING]
> These are still in their early stage of development, only concept-versions have been added, it may not look as good as you might think.   
Expanded the visual library with "Nature" themed overlays for profiles:
* **Roses:** Falling floral animation.
* **Ivy:** A swaying, organic overlay for a lush aesthetic.

***

## 🛠️ Installation Guide

### Step 1: Install a Userscript Manager
While Tampermonkey is the traditional choice, we highly recommend **ScriptCat** for better performance and modern feature support.

* **Recommended:** [**ScriptCat**](https://scriptcat.org/) (Modern & Optimized)
* **Alternative:** [Tampermonkey](https://www.tampermonkey.net/)

### Step 2: Install Utilify
Once your manager is ready, click the link below to install:
👉 [**Install Utilify (Rewrite)**](https://raw.githubusercontent.com/7v6a/Utilify/refs/heads/main/Script/Rewrite/Utilify.user.js)

***

## 🚀 Key Features

* **URL Obfuscation:** In-field "⚡" toggle to bypass link filters by replacing dots with `%2E`.
* **Atmospheric Profiles:** Client-side rendering of Rain, Snow, Fireflies, Roses, and Ivy.
* **Bio Utilities:** Includes a "⎘" quick-copy button for bios and a "📜 Archive" shortcut for the Wayback Machine.
* **Custom Styling:** Support for `linear-gradient` profile backgrounds and global custom CSS injection.
* **Marketplace Tools:** Automated mass-purchase loops with real-time logs and ETA calculations.

***

## 🔄 Update Log

### **v2.1.0 -- December 2025**
* **NEW:** Integrated Search Bar for the Friends list.
* **NEW:** Support for Imgur IDs in the Background system (`imgur:ID`).
   > Usage example: ```background:i-Otrskld,filter:roses,rain;```   
   > Syntax: ```background:i-IMGID,filter:roses,rain;```   
   > So in our example by using `Otrskld` we can resolve:  ``i.imgur.com/Otrskld.jpeg``.   
   > Supported: PNG, JPG, JPGED, GIF.   
* **NEW:** Added **Roses** and **Ivy** particle effects.
* **IMPROVED:** Redesigned the URL Obfuscation button to live *inside* the input field for a cleaner look.
* **IMPROVED:** Optimized the Firefly system with pulsing glow effects and better performance.

### **v2.0.9**
* Core rewrite release including CSS fixes for glass panels and notification divs.
* Fixed AvatarFinder logic and improved bio-copy selectors for multi-language support.
* Introduced initial background effects: Snow, Rain, Fireflies, and Blur.
