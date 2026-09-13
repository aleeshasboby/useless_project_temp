Ragebait Player 🎯
Basic Details
Team Name: Sector 45
Team Members
Team Lead:  Aleesha - [SOE]
Member 2: Aishani - [SOE]
Project Description

Ragebait YouTube Player is a Chrome extension that hijacks your own YouTube playback with random volume swings, fake quality drops, sudden meme interruptions inside the actual player, and phantom background audio — all so watching a normal video becomes a small daily betrayal.

The Problem (that doesn't exist)

YouTube videos play back too smoothly, too predictably, and with far too little emotional betrayal. Nobody asked for a calm, reliable viewing experience, yet here we are, suffering through it every day.

The Solution (that nobody asked for)

We built a browser extension that randomly messes with volume, sabotages video quality, ambushes you with memes mid-video (right inside the YouTube player, no less), and plays phantom sounds that have nothing to do with what you're watching — all toggleable from a tidy little popup, because chaos should still be configurable.

Technical Details
Technologies/Components Used

For Software:

Languages used: JavaScript, Python, HTML, CSS
Frameworks used: FastAPI
Libraries used: Chrome Extensions API (Manifest V3)
Tools used: Chrome DevTools, Uvicorn, VS Code
Implementation

For Software:

Installation
bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
Run
bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

Then load the extension:

Go to chrome://extensions
Enable Developer mode
Click "Load unpacked"
Select the extension/ folder
Open YouTube and play a video
Project Documentation

For Software:

Screenshots (Add at least 3)

   ![Screenshot1](./ss/s2.png)
   *Screen blurring when we incease the volume*

  ![Screenshot1](./ss/s1.png)
  ![Screenshot3](./ss/s3.png)
   *Memes interupting the peaceful watching youtube experience*


Diagrams

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

Project Demo
Video
![Screen recording](./ss/sv.mp4)
*The video demonstrates the working of the extentions and its features which include, 
-Quality or Resolution dropping when we increase the volume
-Randomly the volume drops
-Memes interupting the video , which are usually meme clips
it can also be meme images, here we mainly used clips.
-Random funny audios interupting sound quality*

Team Contributions
Aleesha: Extension and Deployment
Aishani: Backend and resourse gathering.