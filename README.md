# Utilify (Rewrite)

A modern, modular, and enhanced userscript designed for the KoGaMa platform.

***

## 🛑 Safety & Compliance Notice

Utilify is a third-party extension. Users are solely responsible for its use and should adhere strictly to the platform's rules.

### Official KoGaMa Developer Guidelines

The following message was provided by the KoGaMa lead web developer regarding extensions:

> "Hello. Tokeeto here. I'm the lead web developer at KoGaMa. I'm not entirely sure what a 'Vencord like extension' would entail, but you're very welcome to create any extension, as long as:
> 1. **It doesn't violate the privacy of other users.**
> 2. **You are responsible with your use of our APIs** (Do not spam-poll them, cache where sensible, etc.).
> 3. **It doesn't interfere with the game client at all.**
> Best of luck!"

### Feature Risk Assessment

The table below outlines features within the script that may violate the above guidelines, potentially leading to account consequences. **Use features marked as HIGH Risk with extreme caution.**

| Feature | Violation Type & Rationale | Risk Level |
| :--- | :--- | :--- |
| **Friend Activity Stalking** | **Unresponsible API Use (Spam-Polling)**. The script polls the `/friend/chat/` API endpoint every **5 seconds (5000ms)**. This aggressive, frequent polling is a violation of the "Do not spam-poll them" rule. | **HIGH** |
| **Appear Offline** | **Interference with the Game Client**. The feature actively intercepts and blocks network requests (pulse/status updates) intended by the official client, directly preventing it from communicating its intended status to the server. | **HIGH** |
| **Player Analytics** | **Unresponsible API Use (Efficiency)**. The module polls the entire game page HTML every 15 seconds to extract only two numbers. This inefficient resource usage (downloading and parsing large documents repeatedly) may violate the "cache where sensible" guideline. | **MEDIUM** |

***

## 🗒️ Update Log - December 2, 2025 (v2.0.7)

* **A) Configuration Menu Overhaul:** Create & Moved multiple options under ``Use At Own Risk`` Category.
* **B) Feature Added:** Implemented [LazyStreakKeeper](https://github.com/midweststatic/LazyStreakKeeper).
* **C) WebGL Fix:** SVG Button to add settings no longer displays and attaches to WebGL windows.
* **D) Proper Credits:** Decided to finally creater proper Credits, kinda.

> <img width="1735" height="1052" alt="{40022F24-8752-4BAD-A685-2B133E122A20}" src="https://github.com/user-attachments/assets/d242e11b-5fef-404c-a56a-aaf592823dba" />

***

## 📦 About Utilify (Rewrite)

This version is a **full rewrite** of the original Utilify userscript, focusing on improved performance, maintainability, and extensibility.

**Note:** This is an early alpha version. Expect missing features and placeholder modules as the rewrite progresses.

***

## ✨ Current Features List

### 1. Aesthetic and User Interface
* **Custom Backgrounds and Effects:** Allows setting a page background image (configured via the user's profile description) with optional client-side effects such as **Rain** animation, **Snow** animation, **Blur**, and a **Dark** gradient overlay.
* **Profile Customization:** Enables a custom-colored **Profile Banner** text and color, and applies a custom **CSS Gradient** to the main page root element, both controlled via profile bio settings.
* **UI Tuning:** Implements CSS to hide various native KoGaMa UI elements and replaces the default KoGaMa logo with a custom image and link.

### 2. Quality of Life (QoL) Enhancements
* **Configuration Panel V2:** A custom, draggable settings panel with multiple tabs for managing all script features and settings.
* **Profile Data Enhancement:** Extracts and displays detailed user metadata, including **Account Creation Date** and verbose **Last Seen/Ping** time, with a toggle for compact/detailed view.
* **Copy Bio Button:** Adds a dedicated button next to the "Bio" header on a profile page to copy the full description to the clipboard.
* **Last Played Game:** Displays a link to the user's last played game (retrieved from local storage, only for the current user's profile).
* **Internet Archive Link:** Adds a quick link to view the current profile page on the Wayback Machine.

### 3. Data & Network Features
* **Player Analytics:** On a game's play page, fetches and displays a real-time breakdown of current players into **Members** (logged-in users) and **Tourists** (guests).
* **Friend Activity Stalking (HIGH RISK):** Intended to fetch friend location/activity by periodically polling the friend chat API (polling interval is set to 5 seconds).

### 4. Privacy and Experimental (Configurable)
* **Blur Sensitive Data:** Applies a configurable CSS filter blur to various elements containing sensitive account information (e.g., balance chips, profile info).
* **Disable Friendslist:** Hides the native friends list module from the user interface.
* **Appear Offline (HIGH RISK):** Intercepts and blocks network requests to `/pulse/post/` and `/user/{id}/pulse/` endpoints to prevent the user's online status from being updated on the server.
* **Image Background Processing:** An experimental feature using a client-side Canvas operation to attempt to remove the blue background from images (likely avatars).
* **Input Obfuscation:** Automatically replaces dots (`.`) in URLs (excluding whitelisted domains) with `%2E` in text input fields to bypass potential client-side filters.

***

## 🛠️ Installation Guide

Utilify is a userscript and requires a userscript manager to run in your browser.

### Step 1: Install a Userscript Manager
You must first install a browser extension that can manage and run userscripts.

* **For Chrome, Firefox, Edge, and Opera:** Install **Tampermonkey**.
    * [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
    * [Tampermonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

### Step 2: Install Utilify
Once your userscript manager is installed, click the installation link below. Tampermonkey will automatically recognize the file and prompt you to install it.

1.  Click the installation link:
    👉 [Install Utilify (Rewrite)](https://raw.githubusercontent.com/7v6a/Utilify/refs/heads/main/Script/Rewrite/Utilify.user.js)
2.  Review the script's code/metadata in the Tampermonkey editor window.
3.  Click the **Install** button to finalize the installation.

### Step 3: Verify and Use
The script will activate the next time you load or refresh any KoGaMa page (`*://www.kogama.com/*`). Look for the custom configuration panel to access and manage the features.
