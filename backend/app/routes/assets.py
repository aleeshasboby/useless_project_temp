import os
import random
from urllib.parse import quote
from fastapi import APIRouter, HTTPException, Request

from app.config import MEMES_DIR, SOUNDS_DIR

router = APIRouter(prefix="/api", tags=["Assets"])

MEME_EXTENSIONS = {".gif", ".jpeg", ".jpg", ".mp4", ".png", ".webm", ".webp"}
SOUND_EXTENSIONS = {".aac", ".m4a", ".mp3", ".ogg", ".wav", ".webm"}

# Queue state to prevent repeated assets until all files are shown
meme_queue = []
sound_queue = []


def asset_files(directory, extensions):
    if not os.path.isdir(directory):
        return []
    return [
        filename
        for filename in os.listdir(directory)
        if not filename.startswith(".")
        and os.path.isfile(os.path.join(directory, filename))
        and os.path.splitext(filename)[1].lower() in extensions
    ]


@router.get("/random-meme")
def get_random_meme(request: Request):
    global meme_queue

    files = asset_files(MEMES_DIR, MEME_EXTENSIONS)
    if not files:
        raise HTTPException(status_code=404, detail="No meme assets found")

    # Refill and shuffle queue when empty or out of sync with directory files
    if not meme_queue or not set(meme_queue).issubset(set(files)):
        meme_queue = files.copy()
        random.shuffle(meme_queue)

    chosen = meme_queue.pop(0)
    ext = os.path.splitext(chosen)[1].lower()
    media_type = "video" if ext in {".mp4", ".webm"} else "image"

    return {
        "url": str(request.base_url).rstrip("/") + f"/static/memes/{quote(chosen)}",
        "media_type": media_type,
        "filename": chosen
    }


@router.get("/random-sound")
def get_random_sound(request: Request):
    global sound_queue

    files = asset_files(SOUNDS_DIR, SOUND_EXTENSIONS)
    if not files:
        raise HTTPException(status_code=404, detail="No sound assets found")

    if not sound_queue or not set(sound_queue).issubset(set(files)):
        sound_queue = files.copy()
        random.shuffle(sound_queue)

    chosen = sound_queue.pop(0)
    return {
        "url": str(request.base_url).rstrip("/") + f"/static/sounds/{quote(chosen)}",
        "filename": chosen
    }


@router.get("/assets")
def list_assets():
    return {
        "memes": asset_files(MEMES_DIR, MEME_EXTENSIONS),
        "sounds": asset_files(SOUNDS_DIR, SOUND_EXTENSIONS)
    }