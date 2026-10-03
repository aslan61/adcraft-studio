# 🎬 AdCraft Studio (v1.1.0)
### AI-Powered High-Converting Video Ad & Creative Production Studio

> **Transform raw mobile app/gameplay screen recordings into high-converting 9:16, 1:1, 16:9, and 2:3 vertical ads for TikTok, Instagram Reels, YouTube Shorts, and App Stores.**

---

## 🌟 Overview

**AdCraft Studio** is a fullstack creative automation platform engineered for mobile game developers, User Acquisition (UA) teams, and performance marketers. With zero external video editing dependencies, it renders real-time 3D device framing, procedural Web Audio soundtracks, AI-generated retention hooks, and multi-format 60 FPS video exports directly inside the browser.

---

## 🚀 Key Features

* **📱 3D Interactive Device Frame Engine:**
  * Real-time hardware chassis simulation for **iPhone 16 Pro**, **Pixel 9 Pro**, **iPad Pro M4**, **MacBook Pro M3**, and **Minimalist Frame**.
  * 4 Metallic Titanium finishes (*Titanium Black*, *Natural Titanium*, *Desert Titanium*, *White Titanium*).
  * 8 Atmospheric 3D Environments (*Cyber Grid 3D*, *Neon Mesh*, *Obsidian Studio*, *Blurred Gameplay*, *Aurora*, etc.).
  * Dynamic motion presets (*Floating Drift*, *Zoom In Punch*, *Isometric 45°*, *Static*) with free yaw/pitch manipulation.

* **🎯 Computer Vision 9:16 Auto-Crop Engine:**
  * Auto-detects focal action centers, HUD scoreboards, touch steering, and character elements in widescreen (16:9) recordings.
  * Dynamically frames portrait 9:16 windows while respecting TikTok and Instagram safe zones.

* **⚡ Gemini 2.5 Flash & 2.0 Flash AI Cascade:**
  * High-retention psychological hook generation (Hype/Viral, Problem-Solver, Minimalist, FOMO Urgency).
  * 15-second timed video storyboard and director notes synthesis.
  * Direct-response Creative Audit with compliance and predictive CTR scoring.

* **🎵 Web Audio 808 Phonk Synthesizer & Speech Studio:**
  * Procedural 808 sub-bass, kick, and snare generation with zero MP3 dependencies.
  * Integrated Web Speech API AI Voiceover studio with timed retention cues.

* **💎 100% Free Sponsored Rewarded Ad Monetization:**
  * Zero paywalls or credit card requirements.
  * Interactive 15-second sponsor videos reward +50 AI render credits with Firebase Cloud sync and transaction receipts.

* **📦 Instant 60 FPS ProRes / MP4 & 4K PNG Export:**
  * One-click multi-format Ad Pack synthesis (9:16 TikTok, 1:1 Feed, 16:9 YouTube, 2:3 Store).
  * Full offline snapshot and zip bundling powered by `MediaStream.captureStream` and `JSZip`.

---

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, TailwindCSS v4, Lucide SVG Icons, Geist & JetBrains Mono fonts |
| **State Management** | Zustand (Persistent Local Storage + Cloud Hydration) |
| **Canvas & Graphics** | HTML5 2D/WebGL Canvas API, MediaStream Capture API (`captureStream`) |
| **Audio Engine** | Web Audio API (Synthesizer), Web Speech API (SpeechSynthesis) |
| **Backend API** | Node.js, Express, ESBuild, TSX |
| **AI Integration** | Google Gemini 2.5 Flash / 2.0 Flash API (Resilient Model Cascade) |
| **Database & Auth** | Firebase Authentication (Google & Email/Password), Cloud Firestore |

---

## ⌨️ Studio Keyboard Shortcuts

| Shortcut (Mac / Win) | Action |
|---|---|
| <kbd>Space</kbd> | Play / Pause Timeline Animation |
| <kbd>M</kbd> | Mute / Unmute Studio Soundtrack |
| <kbd>S</kbd> | Quick 4K Canvas Snapshot & Download |
| <kbd>V</kbd> | Quick 60 FPS MP4 Video Render |
| <kbd>⌘</kbd> + <kbd>E</kbd> / <kbd>Ctrl</kbd> + <kbd>E</kbd> | Open Ad Pack Export Modal |
| <kbd>⌘</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | Focus Global Asset Search |
| <kbd>1</kbd> / <kbd>2</kbd> / <kbd>3</kbd> | Switch Views: Editor / Performance Hub / Variations |
| <kbd>?</kbd> | Toggle Keyboard Shortcuts Guide |
| <kbd>Esc</kbd> | Dismiss Any Active Modal |

---

## 🛠️ Quick Start

### 1. Prerequisites
- **Node.js** (v18.0 or higher recommended)
- **npm** or **pnpm**

### 2. Installation
```bash
git clone https://github.com/aslan61/adcraft-studio.git
cd adcraft-studio
npm install
```

### 3. Environment Setup
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
*(Optional)* Add your Google Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key"
```
> Note: Even without an API key, AdCraft Studio includes an offline High-Conversion Preset Engine that provides 12 pre-computed variations, hooks, and storyboards seamlessly.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🔒 Security & Safe Zones Compliance

AdCraft Studio embeds verified TikTok Ads Manager and Instagram Reels safe margin guides:
- **Top 120px:** Protected from camera punch holes and Following/For You tabs.
- **Bottom 220px:** Protected from account handles, sound titles, captions, and seekbars.
- **Right 80px:** Protected from Like, Comment, and Share button rails.

---

## 📄 License

Apache License 2.0. Built with ❤️ for game developers and creative technologists.
