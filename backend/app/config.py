import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
MEMES_DIR = os.path.join(STATIC_DIR, "memes")
SOUNDS_DIR = os.path.join(STATIC_DIR, "sounds")

CHAOS_CONFIG = {
    "default_interval_seconds": 10,
    "min_interval_seconds": 5,
    "max_interval_seconds": 30,
    "meme_duration_seconds": 3,
    "phantom_audio_min_seconds": 7,
    "phantom_audio_max_seconds": 20
}
