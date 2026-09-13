import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import STATIC_DIR, MEMES_DIR, SOUNDS_DIR
from app.routes import assets, chaos

# Create directories safely (won't fail on read-only serverless filesystems)
try:
    os.makedirs(MEMES_DIR, exist_ok=True)
    os.makedirs(SOUNDS_DIR, exist_ok=True)
except Exception as e:
    print(f"Directory creation skipped: {e}")

app = FastAPI(title="Ragebait YouTube Backend")

# Allow Chrome extension origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory if it exists
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.include_router(assets.router)
app.include_router(chaos.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ragebait-youtube-backend"}