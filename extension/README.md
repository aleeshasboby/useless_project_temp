# Ragebait YouTube Player — Chrome Extension

This version injects the ragebait effects into YouTube without continuously observing the
entire YouTube DOM. The player is checked only around the YouTube player and after navigation.

## Features

- Random YouTube volume spikes/drops
- Volume adjustment triggers quality sabotage
- Attempts to use YouTube's quality API (`small`/`tiny`) when exposed
- CSS degradation fallback
- Meme image/GIF/video appears **inside the YouTube player**
- Original YouTube video pauses for about 3 seconds and resumes
- Independent phantom audio
- Works with YouTube SPA navigation
- Popup controls for enabling/disabling effects and changing frequency

## Install

1. Start the backend.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select this `extension` folder.
6. Refresh YouTube.

## Backend

The extension expects:

`http://localhost:8000`

## Important

YouTube changes its internal player implementation periodically. Actual playback-quality forcing
is therefore best-effort. The CSS degradation is used as a visual fallback.

The extension deliberately avoids a whole-document MutationObserver because YouTube is a large
single-page application and aggressively observing its complete DOM can interfere with page loading.
