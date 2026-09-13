# Ragebait YouTube Player

## Project idea

An intentionally frustrating Chrome extension for YouTube.

When a user plays a YouTube video, the extension can:

1. Randomly increase or decrease YouTube volume.
2. Turn volume adjustments into a visual/quality punishment.
3. Attempt to lower YouTube's actual playback quality.
4. Pause the video and play a meme **inside the YouTube player**, rather than opening a separate popup.
5. Resume the original YouTube video after the meme.
6. Play random phantom background audio independently of the YouTube audio.
7. Work across YouTube's single-page navigation.
8. Provide a small extension popup for enabling/disabling individual chaos features.

## Architecture

```text
                    ┌─────────────────────────┐
                    │        YouTube          │
                    │  <video> + player UI    │
                    └────────────┬────────────┘
                                 │
                        Chrome Extension
                                 │
             ┌───────────────────┴───────────────────┐
             │                                       │
       content.js                               popup.js
             │                                       │
             └───────────────┬───────────────────────┘
                             │ HTTP
                             ▼
                    ┌───────────────────┐
                    │ FastAPI Backend   │
                    │ localhost:8000    │
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 memes/              sounds/
```

## Responsibilities

### Aleesha — Frontend / Extension

- Chrome MV3 extension
- YouTube DOM/video detection
- chaos timers
- volume manipulation
- quality sabotage
- in-player meme overlay
- phantom audio
- extension popup
- CSS effects

### Aishani — Backend

- FastAPI server
- CORS
- chaos configuration endpoint
- random meme endpoint
- random sound endpoint
- static asset serving

## Important YouTube note

A Chrome content script is not the same as changing the YouTube source code. YouTube's internal
player API can change, so the extension tries the exposed player quality methods and then falls
back to CSS degradation.

## Run order

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Extension

Open:

`chrome://extensions`

Then:

- Enable Developer mode.
- Load unpacked.
- Select the `extension` folder.
- Open YouTube.
- Play a video.

## Folder structure

```text
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
