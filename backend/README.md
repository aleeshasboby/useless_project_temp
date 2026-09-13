# Ragebait YouTube Backend

FastAPI serves random meme and phantom-audio assets to the Chrome extension.

## Start

From this `backend` folder:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Test:

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/api/random-meme
curl http://127.0.0.1:8000/api/random-sound
```

Put more meme videos/images into:

`app/static/memes/`

Put more sound files into:

`app/static/sounds/`
