(() => {
  const API = "http://localhost:8000";

  const DEFAULTS = {
    enabled: true,
    interval: 10,
    volumeChaos: true,
    memeChaos: true,
    phantomAudio: true
  };

  let settings = { ...DEFAULTS };
  let video = null;
  let playerContainer = null;
  let overlay = null;
  let memeMedia = null;
  let memeTimeout = null;
  let chaosTimer = null;
  let phantomTimer = null;
  let phantomAudio = null;
  let lastVolume = null;
  let internalVolumeChange = false;
  let internalVolumeTimer = null;
  let currentVideoListener = null;
  let navigationTimer = null;
  let playerCheckTimer = null;
  let lastUrl = location.href;
  let active = false;

  // Resolution degradation tracking
  let currentQualityLevel = 0;
  let qualityResetTimer = null;

  function getVideo() {
    const player = document.getElementById("movie_player");
    if (!player) return null;
    return player.querySelector("video.html5-main-video") ||
           player.querySelector("video");
  }

  function getPlayerContainer(v) {
    if (!v) return null;
    return document.getElementById("movie_player") ||
           v.closest(".html5-video-player") ||
           v.parentElement;
  }

  function ensureOverlay() {
    if (!playerContainer) return;

    if (!overlay || !document.contains(overlay)) {
      overlay = document.createElement("div");
      overlay.id = "ragebait-overlay";
      overlay.setAttribute("aria-hidden", "true");
      playerContainer.appendChild(overlay);
    }
  }

  function detachVideo() {
    if (video && currentVideoListener) {
      video.removeEventListener("volumechange", currentVideoListener);
    }
    video = null;
    playerContainer = null;
    overlay = null;
    currentVideoListener = null;
    lastVolume = null;
  }

  function attachToVideo() {
    const found = getVideo();

    if (!found) {
      return false;
    }

    if (found === video && document.contains(found)) {
      ensureOverlay();
      return true;
    }

    detachVideo();

    video = found;
    playerContainer = getPlayerContainer(found);
    ensureOverlay();

    lastVolume = video.volume;

    currentVideoListener = onVolumeChange;
    video.addEventListener("volumechange", currentVideoListener);

    return true;
  }

  function checkPlayer() {
    if (!settings.enabled) return;

    const found = getVideo();

    if (found && found !== video) {
      attachToVideo();
      restartTimers();
    } else if (!found && video) {
      detachVideo();
    }
  }

  function schedulePlayerCheck() {
    clearTimeout(playerCheckTimer);
    playerCheckTimer = setTimeout(() => {
      checkPlayer();
      playerCheckTimer = null;
    }, 500);
  }

  function onVolumeChange() {
    if (!video || !settings.enabled) return;

    // Ignore volume shifts triggered automatically by volumeChaos
    if (internalVolumeChange) return;

    const changedByUser =
      lastVolume !== null &&
      Math.abs(video.volume - lastVolume) > 0.001;

    lastVolume = video.volume;

    if (changedByUser) {
      // Degrade resolution whenever user manually adjusts volume
      currentQualityLevel++;
      sabotageQuality(currentQualityLevel);
    }
  }

  function setVolumeChaos() {
    if (!video || !settings.enabled || !settings.volumeChaos || video.paused) {
      return;
    }

    const old = video.volume;
    const spike = Math.random() < 0.5;

    const next = spike
      ? Math.min(1, old + (0.25 + Math.random() * 0.55))
      : Math.max(0.03, old - (0.20 + Math.random() * 0.45));

    // Flag internal update
    internalVolumeChange = true;
    video.volume = next;
    
    // Capture exact fractional volume assigned by the browser
    lastVolume = video.volume;

    // Wait for the async DOM volumechange event to settle before clearing flag
    clearTimeout(internalVolumeTimer);
    internalVolumeTimer = setTimeout(() => {
      internalVolumeChange = false;
    }, 500);
  }

  function sabotageQuality(level) {
    if (!video) return;

    // Step down quality progressively based on manual adjustments
    let targetQuality = "large"; // 480p default start drop
    let heavyVisual = false;

    if (level === 1) {
      targetQuality = "large";  // 480p
    } else if (level === 2) {
      targetQuality = "medium"; // 360p
    } else if (level === 3) {
      targetQuality = "small";  // 240p
      heavyVisual = true;
    } else if (level >= 4) {
      targetQuality = "tiny";   // 144p
      heavyVisual = true;
    }

    video.classList.add("ragebait-sabotaged");
    if (heavyVisual) {
      video.classList.add("ragebait-heavy-sabotage");
    }

    try {
      const player = document.getElementById("movie_player");

      if (player) {
        if (typeof player.setPlaybackQualityRange === "function") {
          player.setPlaybackQualityRange(targetQuality, targetQuality);
        }

        if (typeof player.setPlaybackQuality === "function") {
          player.setPlaybackQuality(targetQuality);
        }
      }
    } catch (_) {}

    // Reset resolution timer back to 5 seconds on every manual adjust
    clearTimeout(qualityResetTimer);

    qualityResetTimer = setTimeout(() => {
      restoreQuality();
    }, 5000);
  }

  function restoreQuality() {
    currentQualityLevel = 0;

    if (video) {
      video.classList.remove(
        "ragebait-sabotaged",
        "ragebait-heavy-sabotage"
      );
    }

    try {
      const player = document.getElementById("movie_player");

      if (player) {
        if (typeof player.setPlaybackQualityRange === "function") {
          player.setPlaybackQualityRange("auto", "default");
        }

        if (typeof player.setPlaybackQuality === "function") {
          player.setPlaybackQuality("auto");
        }
      }
    } catch (_) {}
  }

  async function getJson(path) {
    const response = await fetch(`${API}${path}`);

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    return response.json();
  }

  async function showMeme() {
    if (
      !video ||
      !settings.enabled ||
      !settings.memeChaos ||
      video.paused ||
      !overlay
    ) {
      return;
    }

    try {
      const data = await getJson("/api/random-meme");

      overlay.innerHTML = "";

      if (data.media_type === "video") {
        memeMedia = document.createElement("video");
        memeMedia.src = data.url;
        memeMedia.autoplay = true;
        memeMedia.muted = false;
        memeMedia.playsInline = true;
        memeMedia.controls = false;
      } else {
        memeMedia = document.createElement("img");
        memeMedia.src = data.url;
        memeMedia.alt = "Ragebait meme";
      }

      overlay.appendChild(memeMedia);

      const wasPlaying = !video.paused;
      video.pause();
      overlay.classList.add("ragebait-visible");

      // Pause/resume handlers to sync meme playback with user controls
      const syncPause = () => {
        if (memeMedia && memeMedia.tagName === "VIDEO") {
          memeMedia.pause();
        }
      };

      const syncPlay = () => {
        if (memeMedia && memeMedia.tagName === "VIDEO" && overlay.classList.contains("ragebait-visible")) {
          memeMedia.play().catch(() => {});
        }
      };

      video.addEventListener("pause", syncPause);
      video.addEventListener("play", syncPlay);

      const hideMemeAndResume = () => {
        clearTimeout(memeTimeout);
        overlay.classList.remove("ragebait-visible");

        video.removeEventListener("pause", syncPause);
        video.removeEventListener("play", syncPlay);

        if (memeMedia?.tagName === "VIDEO") {
          memeMedia.pause();
          memeMedia.removeAttribute("src");
          memeMedia.load();
        }

        if (wasPlaying && video && !video.ended) {
          video.play().catch(() => {});
        }
      };

      if (memeMedia.tagName === "VIDEO") {
        memeMedia.addEventListener("ended", hideMemeAndResume, { once: true });
        memeTimeout = setTimeout(hideMemeAndResume, 30000);

        try {
          await memeMedia.play();
        } catch (_) {
          memeMedia.muted = true;
          try {
            await memeMedia.play();
          } catch (_) {}
        }
      } else {
        clearTimeout(memeTimeout);
        memeTimeout = setTimeout(hideMemeAndResume, 5000);
      }

    } catch (error) {
      console.warn("Ragebait meme request failed:", error);
    }
  }

  async function playPhantomAudio() {
    if (!settings.enabled || !settings.phantomAudio) return;

    // Block sound if a meme is active on screen
    if (overlay && overlay.classList.contains("ragebait-visible")) {
      return;
    }

    try {
      const data = await getJson("/api/random-sound");

      if (!phantomAudio) {
        phantomAudio = new Audio();
        phantomAudio.volume = 0.45;
        phantomAudio.preload = "auto";
      }

      phantomAudio.src = data.url;
      phantomAudio.currentTime = 0;

      await phantomAudio.play();
    } catch (_) {}
  }

  function schedulePhantom() {
    clearTimeout(phantomTimer);

    if (!settings.enabled || !settings.phantomAudio) return;

    phantomTimer = setTimeout(async () => {
      // Only play phantom sound if video is playing AND no meme overlay is visible
      const isMemeActive = overlay && overlay.classList.contains("ragebait-visible");

      if (video && !video.paused && !isMemeActive) {
        await playPhantomAudio();
      }

      schedulePhantom();
    }, 15000);
  }

  function restartTimers() {
    clearTimeout(chaosTimer);

    if (!settings.enabled) return;

    chaosTimer = setTimeout(async function chaosTick() {
      if (!settings.enabled) return;

      attachToVideo();

      if (video && !video.paused) {
        if (settings.volumeChaos) {
          setVolumeChaos();
        }

        if (settings.memeChaos) {
          await showMeme();
        }
      }

      const intervalMs = (Number(settings.interval) || 15) * 1000;
      chaosTimer = setTimeout(chaosTick, intervalMs);
    }, 4000);

    schedulePhantom();
  }

  function disableEffects() {
    clearTimeout(chaosTimer);
    clearTimeout(phantomTimer);
    clearTimeout(memeTimeout);
    clearTimeout(playerCheckTimer);
    clearTimeout(qualityResetTimer);
    clearTimeout(internalVolumeTimer);

    restoreQuality();

    if (overlay) {
      overlay.classList.remove("ragebait-visible");
      overlay.innerHTML = "";
    }

    if (phantomAudio) {
      phantomAudio.pause();
      phantomAudio.removeAttribute("src");
      phantomAudio.load();
    }
  }

  function handleUrlChange() {
    if (location.href === lastUrl) return;

    lastUrl = location.href;

    clearTimeout(navigationTimer);

    navigationTimer = setTimeout(() => {
      detachVideo();
      checkPlayer();
      restartTimers();
    }, 1200);
  }

  function setupNavigationHooks() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      handleUrlChange();
      schedulePlayerCheck();
      return result;
    };

    history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      handleUrlChange();
      schedulePlayerCheck();
      return result;
    };

    window.addEventListener("popstate", () => {
      handleUrlChange();
      schedulePlayerCheck();
    });

    setInterval(() => {
      if (location.href !== lastUrl) {
        handleUrlChange();
      }
    }, 1500);
  }

  async function loadSettings() {
    settings = {
      ...DEFAULTS,
      ...(await chrome.storage.local.get(DEFAULTS))
    };

    if (!settings.enabled) {
      disableEffects();
      return;
    }

    active = true;
    schedulePlayerCheck();
    restartTimers();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;

    for (const [key, change] of Object.entries(changes)) {
      settings[key] = change.newValue;
    }

    if (!settings.enabled) {
      active = false;
      disableEffects();
      return;
    }

    active = true;
    schedulePlayerCheck();
    restartTimers();
  });

  setupNavigationHooks();

  window.setTimeout(() => {
    if (!active) {
      loadSettings();
    }
  }, 2000);
})();