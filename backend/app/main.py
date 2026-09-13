import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import STATIC_DIR, MEMES_DIR, SOUNDS_DIR
from app.routes import assets, chaos

os.makedirs(MEMES_DIR, exist_ok=True)
os.makedirs(SOUNDS_DIR, exist_ok=True)

app = FastAPI(title="Ragebait YouTube Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.include_router(assets.router)
app.include_router(chaos.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ragebait-youtube-backend"}
