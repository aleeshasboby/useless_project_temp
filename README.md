# Project Report: Ragebait YouTube Player

## 1. Overview

**Project Name:** Ragebait YouTube Player
**Type:** Chrome Extension (Manifest V3) + FastAPI Backend Service
**Category:** Entertainment / Prank Tooling
**Status:** In development

Ragebait YouTube Player is an intentionally disruptive Chrome extension designed to inject chaotic, unpredictable behavior into a user's own YouTube playback experience for comedic effect. Rather than opening separate popups or overlays outside the page, all chaos effects — including meme playback — are designed to occur **inside the native YouTube player**, preserving the illusion that YouTube itself is misbehaving.

The system is composed of two decoupled components: a browser-side extension responsible for DOM manipulation and playback interference, and a lightweight backend service responsible for supplying randomized chaos assets (memes, sounds) and configuration.

---

## 2. Objectives

The extension should, on a running YouTube video:

| # | Feature | Description |
|---|---------|-------------|
| 1 | Volume Chaos | Randomly increase or decrease YouTube's playback volume |
| 2 | Visual/Quality Punishment | Tie volume adjustments to a visual or quality-based penalty |
| 3 | Quality Sabotage | Attempt to lower YouTube's actual playback resolution/quality |
| 4 | In-Player Meme Interrupt | Pause the video and play a meme *inside* the existing YouTube player element |
| 5 | Playback Resume | Resume the original video automatically once the meme finishes |
| 6 | Phantom Audio | Play random background audio independent of and unrelated to the YouTube video's own audio track |
| 7 | SPA Navigation Support | Continue functioning correctly across YouTube's single-page-app style navigation (video-to-video transitions without full page reloads) |
| 8 | User Control | Provide a popup UI allowing individual chaos features to be toggled on/off |

---

## 3. System Architecture

```
                    ┌─────────────────────────┐
                    │        YouTube           │
                    │  <video> + player UI     │
                    └────────────┬─────────────┘
                                 │
                        Chrome Extension
                                 │
             ┌───────────────────┴───────────────────┐
             │                                         │
       content.js                                 popup.js
             │                                         │
             └───────────────┬─────────────────────────┘
                              │ HTTP
                              ▼
                    ┌───────────────────┐
                    │  FastAPI Backend   │
                    │  localhost:8000    │
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 memes/               sounds/
```

### 3.1 Component Summary

- **content.js** — injected into `youtube.com`, handles DOM/video detection, chaos timers, volume manipulation, quality sabotage attempts, in-player meme overlay injection, and phantom audio playback.
- **page-bridge.js** — a page-context script (not isolated-world) used to reach YouTube's internal player API where content scripts cannot, communicating back to `content.js` via `window.postMessage` or custom events.
- **popup.js / popup.html** — the extension's toolbar popup UI, allowing the user to enable/disable individual chaos features.
- **FastAPI backend** — serves chaos configuration, and random meme/sound assets over HTTP to the extension.

### 3.2 Important Technical Note

A Chrome content script cannot modify YouTube's actual source code or its internal player logic — it can only interact with the page as rendered, through the DOM and any APIs YouTube chooses to expose. Because YouTube's internal player API (`ytplayer`, `movie_player`, etc.) is undocumented and subject to change without notice, the extension follows a **fallback strategy**:

1. Attempt to use YouTube's exposed player quality-control methods (e.g. `setPlaybackQualityRange`) via `page-bridge.js`.
2. If unavailable or non-functional, fall back to **CSS-based visual degradation** (blur, pixelation filters, downscaling the video element) to simulate a quality drop.

---

## 4. Team Responsibilities

### 4.1 Aleesha — Frontend / Extension

- Chrome MV3 extension scaffolding and manifest configuration
- YouTube DOM and `<video>` element detection
- Chaos timer scheduling logic
- Volume manipulation logic
- Quality sabotage (player API + CSS fallback)
- In-player meme overlay implementation
- Phantom background audio playback
- Extension popup UI and feature toggles
- CSS-based visual effects

### 4.2 Aishani — Backend

- FastAPI server setup
- CORS configuration for extension-origin requests
- Chaos configuration endpoint
- Random meme endpoint
- Random sound endpoint
- Static asset serving (`memes/`, `sounds/`)

---

## 5. Folder Structure

```
ragebait-youtube/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── assets.py
│   │   │   └── chaos.py
│   │   ├── static/
│   │   │   ├── memes/
│   │   │   └── sounds/
│   │   ├── config.py
│   │   └── main.py
│   ├── requirements.txt
│   └── README.md
├── extension/
│   ├── icons/
│   ├── content.css
│   ├── content.js
│   ├── manifest.json
│   ├── page-bridge.js
│   ├── popup.html
│   ├── popup.js
│   └── README.md
└── README.md
```

---

## 6. Setup & Run Instructions

### 6.1 Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 6.2 Extension

1. Navigate to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Open YouTube and play a video

---

## 7. Risks & Limitations

- **API fragility:** YouTube's internal player API is undocumented and may change at any time, breaking the quality-sabotage feature until the CSS fallback is verified to still work.
- **CORS/local backend dependency:** The extension depends on a locally running FastAPI server (`localhost:8000`); if the backend is not running, meme/sound features will silently fail unless error handling is added.
- **SPA navigation edge cases:** YouTube's client-side routing means `content.js` must re-attach listeners on navigation events (e.g. `yt-navigate-finish`) rather than relying on a single page load.
- **Autoplay/audio policy:** Chrome's autoplay policies may block phantom audio playback until user interaction has occurred on the page.

---

## 8. Future Enhancements (Not Yet Scoped)

- Persisted user preferences (chaos intensity levels, per-channel exclusions)
- Expanded meme/sound libraries with tagging/categorization
- A "chaos intensity" slider rather than binary per-feature toggles
- Packaging for the Chrome Web Store
