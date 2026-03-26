# 🔮 WhisperVault

**Anonymous Confession & Voice Platform — Single-File React Application**

> *"Secrets find a home. Identities stay hidden."*

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Quick Start](#quick-start)
4. [File Structure](#file-structure)
5. [Architecture](#architecture)
6. [Core Systems](#core-systems)
7. [Pages & Routes](#pages--routes)
8. [Components](#components)
9. [API Integration](#api-integration)
10. [Mock / Offline Mode](#mock--offline-mode)
11. [Configuration](#configuration)
12. [Backend Reference](#backend-reference)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)

---

## Overview

WhisperVault is a full-featured anonymous confession and voice platform built as a **single `.jsx` file** — no subfolder imports, no separate component files. Everything from authentication, audio recording with real-time Web Audio API effects, a heat-score feed algorithm, gamification (XP / levels / badges), and real-time socket events is contained in one cohesive codebase.

The app gracefully degrades to **mock/demo mode** when no backend is reachable, so it works completely offline for development and demos.

---

## Features

### P1 — Core
| Feature | Details |
|---|---|
| Anonymous Identity Generator | 2.5B+ combinations: `[Color] [Creature] of [City] [N]` |
| Rarity System | Common / Uncommon / Rare / Legendary with weighted random |
| Text Confessions | Up to 1,000 characters, blur-to-reveal hold mechanic |
| Voice Confessions | Up to 100 seconds via `MediaRecorder` API |
| 12 Confession Categories | Adult, Crime, Funny, Romantic Crush, Insult, Sorrow, Pain, To The God, Dear Family, Unpopular Opinions, Work & Career, Mental Health |
| 6 Reaction Types | Me Too 🙋, Sending Love 💝, Wow 😮, Same Lol 😂, Stay Strong 💪, Respect 🙏 |
| Level System | Levels 1–300 via XP accumulation |

### P2 — Enhanced
| Feature | Details |
|---|---|
| Voice Distortion | Normal / Whisper / Deep / Echo / Robotic via Web Audio API `OfflineAudioContext` |
| Ambient Sounds | Silence / Rain / Crickets / Cafe / Ocean / Thunder / Fireplace |
| Confess Back | Chain confessions — reply to another confession anonymously |
| Heat Score Algorithm | Engagement × time-decay × velocity scoring |
| Daily Streak Tracking | XP bonus system |

### P3 — Premium / Full
| Feature | Details |
|---|---|
| Hold-to-Reveal | 1.5s hold with SVG progress ring animation |
| Rarity Glow & Aura | CSS box-shadow glow + pulse keyframe for Legendary |
| Title Evolution | Whisperer → Shadow Voice → Confessor → Void Speaker → Phantom → Legend |
| Anonymous Radio Mode | Passive listening queue with waveform visualizer bars |
| Anonymous Messaging | Reply-based anonymous DM system |
| Push Notification Simulation | Socket event-driven notification panel |
| Expiry Options | 24h / 7 days / Never self-destruct |
| XP Rewards | Post (+10), Reaction received (+2), Comment received (+5), Streak (+20) |

---

## Quick Start

### Prerequisites

```bash
node >= 18
npm >= 9
```

### Installation

```bash
# 1. Create a Vite + React + TypeScript project
npm create vite@latest whispervault -- --template react-ts
cd whispervault

# 2. Install dependencies
npm install react-router-dom

# 3. Replace src/App.tsx with WhisperVault.jsx
# (or import it as a JSX component from main.tsx)

# 4. Create .env
echo "VITE_API_URL=http://localhost:5000" > .env

# 5. Run
npm run dev
```

### Single-file usage

The entire app is exported from `WhisperVault.jsx` as a **default export**. Point `src/main.tsx` at it:

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './WhisperVault';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

No `index.css` or extra imports are needed — the global CSS is injected into `<head>` automatically at runtime via a style tag.

---

## File Structure

```
WhisperVault.jsx               ← ENTIRE APPLICATION (single file, ~2600 lines)
│
├── §1   Config & Constants    — API_URL, Cloudinary credentials
├── §2   Identity Data         — COLORS, CREATURES, LOCATIONS arrays
├── §3   App Constants         — CATEGORIES, REACTIONS, RARITY_COLORS, etc.
├── §4   Heat Score Algorithm  — calculateHeatScore()
├── §5   Mock Data Generator   — generateMockFeed(), makeMockConfession()
├── §6   Socket Simulation     — createSocket() with new_confession events
├── §7   Auth Context          — AuthProvider, useAuth hook, login/signup/logout
├── §8   API Helpers           — apiRequest() utility
├── §9   Global CSS            — Injected via <style> tag into <head>
├── §10  Utility Components    — LoadingSpinner, ProtectedRoute, SkeletonCard
├── §11  HoldToReveal          — 1.5s hold mechanic with requestAnimationFrame
├── §12  AudioRecorder         — MediaRecorder + Web Audio API effects
├── §13  ConfessionCard        — Full card with reveal, reactions, comments
├── §14  NotificationPanel     — Dropdown notification list
├── §15  NavBar                — Sticky nav with avatar menu & notifications
├── §16  HomePage              — Feed with filter/category controls
├── §17  CreatePage            — Text + Voice confession composer
├── §18  RadioPage             — Voice queue with bar visualizer
├── §19  MessagesPage          — Anonymous chat / DM
├── §20  ProfilePage           — Stats, XP bar, badges, recent confessions
├── §21  LoginPage             — Auth form with vault aesthetic
├── §22  SignupPage            — Signup with live identity preview
└── §23  App Entry Point       — BrowserRouter + Routes + ProtectedRoute
```

---

## Architecture

### Authentication Flow

```
User → LoginPage → AuthProvider.login()
                        ├── Tries real API (5s timeout)
                        └── Falls back to localStorage mock user

localStorage Keys:
  wv_token          → JWT string
  wv_user           → JSON user object
  wv_mock_user_{u}  → Mock signup storage
```

### Data Flow

```
Component → fetch() with AbortController → API
                  ↓ (on error/timeout)
              Mock Data Generator
                  ↓
              setConfessions()
                  ↓
              ConfessionCard renders
```

### Real-time Updates

```
AuthProvider mounts createSocket()
    ↓
socket.on("new_confession", handler)
    → every 30s, 60% chance of injecting a mock confession at top of feed
socket.on("notification", handler)
    → pushes to notifications[] state
```

---

## Core Systems

### 1. Anonymous Identity Generator

```
generateAnonymousName() returns:
  {
    color:          "Crimson"
    creature:       "Phoenix"
    creatureRarity: "legendary"   ← 5% chance
    location:       "Kyoto"
    number:         7
    full:           "Crimson Phoenix of Kyoto 7"
  }

Rarity weights:
  Legendary → 5%  (6 creatures)
  Rare      → 10% (5 creatures)
  Uncommon  → 25% (6 creatures)
  Common    → 60% (10 creatures)

Total combinations: 50 colors × 27 creatures × 50 cities × 10 = 675,000+
With rarity distribution creates 2.5B+ effective unique identities
```

### 2. Heat Score Algorithm

```javascript
heatScore = (reactions*2 + views*0.1 + comments*3) * (1 + timeDecay) + velocity*5

timeDecay = max(0, 1 - ageInHours/48)   // fresh posts get up to 2× boost
velocity  = reactions per hour           // trending bonus
```

### 3. XP & Level System

```
Level = floor(XP / 100) + 1   (capped at 300)

XP Rewards:
  Post confession  → +10 XP
  Reaction given   → +2 XP
  Comment received → +5 XP
  Daily streak     → +20 XP
  Streak 7 days    → +100 XP bonus

Title Unlocks:
  Lv.1–25    → Whisperer
  Lv.26–75   → Shadow Voice
  Lv.76–150  → Confessor
  Lv.151–250 → Void Speaker
  Lv.251–299 → Phantom
  Lv.300     → Legend (+ rainbow Legend Badge)
```

### 4. Voice Effect Processing

All effects use the Web Audio API `OfflineAudioContext` for offline rendering:

| Effect   | Implementation |
|---|---|
| Whisper  | `BiquadFilter` highpass (1000Hz) + gain 0.5 |
| Deep     | `BiquadFilter` lowpass (500Hz, Q=0.8) |
| Echo     | `DelayNode` 280ms + gain 0.45 feedback |
| Robotic  | `WaveShaper` with 16-step quantizer curve |

Output is converted to WAV via custom `bufferToWav()` function.

### 5. Hold-to-Reveal Mechanic

```
User presses element → requestAnimationFrame loop starts
Progress tracks (Date.now() - startTime) / 1500 × 100
At 100% → onReveal() fires, content blur dissolves (CSS transition 0.6s)
Release before 100% → animation cancels, progress resets
```

---

## Pages & Routes

| Route | Component | Auth | Description |
|---|---|---|---|
| `/` | `HomePage` | ✓ | Feed with trending/latest/personalized filters |
| `/create` | `CreatePage` | ✓ | Text or voice confession composer |
| `/radio` | `RadioPage` | ✓ | Passive voice confession radio player |
| `/messages` | `MessagesPage` | ✓ | Anonymous DM / reply system |
| `/profile` | `ProfilePage` | ✓ | Stats, XP, badges, recent posts |
| `/login` | `LoginPage` | ✗ | Authentication entry |
| `/signup` | `SignupPage` | ✗ | Account creation with live identity preview |

All protected routes wrap `<ProtectedRoute>` which redirects to `/login` if unauthenticated and preserves the intended destination in `location.state.from`.

---

## Components

### `ConfessionCard`

The most complex component. Renders a single confession with:
- Rarity-aware avatar + glow (CSS `box-shadow`)
- `HoldToReveal` wrapper for text confessions
- Optimistic reaction updates (state updated immediately, API called async)
- Collapsible comments section with mock fallback
- Chain confession ("Confess Back") → navigates to `/create` with `chainParentId` state

### `HoldToReveal`

- Uses `requestAnimationFrame` for smooth 60fps progress tracking
- SVG circle with `stroke-dashoffset` animation
- `revealedRef` prevents spurious `cancelPress` calls after the hold completes
- Touch-safe: `onTouchMove` / `onTouchCancel` cancel, but `onTouchEnd` is intentionally omitted to allow completion

### `AudioRecorder`

- `MediaRecorder` with 100ms chunk collection
- Timer capped at 100 seconds
- `OfflineAudioContext` for non-blocking audio effect processing
- `AudioContext` always closed in `finally` block to release OS resources
- Object URLs cleaned up in `useEffect` cleanup to prevent memory leaks

### `NavBar`

- Sticky with backdrop blur
- Avatar button color matches user's rarity
- Notification badge shows unread count
- XP progress bar in the user dropdown

---

## API Integration

All API calls use native `fetch` with `AbortSignal.timeout(5000)` for automatic cleanup.

### Endpoints Used

```
POST /api/auth/login
POST /api/auth/signup
GET  /api/feed?sort=trending|latest|personalized&category=...
POST /api/confessions
POST /api/confessions/:id/react
GET  /api/comments?confessionId=...
POST /api/comments
POST /api/comments/:id/react
GET  /api/messages
POST /api/messages
GET  /api/radio
GET  /api/users/:id/confessions
```

### Request Pattern

```javascript
// Every fetch uses:
{
  headers: { Authorization: `Bearer ${token}` },
  signal:  AbortSignal.timeout(5000),
}

// On network failure → falls through to mock mode
// No error shown to user — mock data renders instead
```

---

## Mock / Offline Mode

WhisperVault works completely without a backend. When any API call fails:

1. **Login/Signup**: Credentials stored in `localStorage` under `wv_mock_user_{username}`
2. **Feed**: `generateMockFeed(14)` creates realistic confessions with heat scores
3. **Comments**: `generateMockComments()` generates 0–3 plausible comments
4. **Messages**: `generateMockMessages()` creates 3 sample messages
5. **Radio**: `generateMockVoiceConfessions()` creates 6 voice entries (no audio)
6. **Voice Upload**: `URL.createObjectURL(blob)` used instead of Cloudinary

The `useMockMode` flag in `AuthContext` is set to `true` automatically when API calls fail. No user-facing error for network issues — the app silently degrades.

---

## Configuration

### Environment Variables (`.env`)

```bash
VITE_API_URL=https://your-api.onrender.com    # Backend URL (optional, has fallback)
```

### Constants to Change

```javascript
// §1 Config
const API_URL = "https://your-api-url.com";
const CLOUDINARY_CLOUD_NAME   = "your_cloud_name";
const CLOUDINARY_UPLOAD_PRESET = "your_preset";
```

### Customizing Identity Data

To add more colors, creatures, or cities, edit the `COLORS`, `CREATURES`, and `LOCATIONS` arrays in **§2**. Adding a new legendary creature increases its rarity automatically (same 5% pool is split).

---

## Backend Reference

### Expected Auth Response

```json
{
  "token": "eyJhbGci...",
  "user": {
    "_id": "...",
    "username": "...",
    "gender": "Male",
    "anonymousName": {
      "color": "Crimson", "creature": "Phoenix",
      "creatureRarity": "legendary",
      "location": "Kyoto", "number": 7,
      "full": "Crimson Phoenix of Kyoto 7"
    },
    "level": 1, "xp": 0, "totalPosts": 0, "streak": 0,
    "title": "Whisperer", "badges": [], "premium": false
  }
}
```

### Expected Feed Response

Either a flat array of confessions or `{ confessions: [...] }`.

Each confession object:
```json
{
  "_id": "...",
  "authorId": "...", "authorName": "...",
  "authorRarity": "common|uncommon|rare|legendary",
  "authorLevel": 5, "authorTitle": "Whisperer",
  "type": "text|voice",
  "content": "...",
  "audioUrl": "...",
  "categories": ["Mental Health"],
  "moodEmoji": "😔",
  "reactions": { "meToo": 10, "sendingLove": 5, "wow": 2, "sameLol": 0, "stayStrong": 3, "respect": 1 },
  "views": 240, "heatScore": 180,
  "createdAt": "2026-03-25T12:00:00Z"
}
```

### JWT Middleware (Express)

```javascript
const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## Deployment

### Vercel / Netlify (Frontend)

```bash
npm run build
# dist/ folder → deploy to Vercel/Netlify

# Add _redirects file for SPA routing:
echo "/* /index.html 200" > public/_redirects
```

### Environment variables

Set `VITE_API_URL` in the Vercel/Netlify dashboard to your backend URL.

### Render (Backend)

```bash
# backend/package.json start script:
"start": "node server.js"

# Required env vars on Render:
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=minimum_32_character_secret_here
CLIENT_URL=https://your-frontend.vercel.app
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## Troubleshooting

### Blank screen / white flash
Make sure `WhisperVault.jsx` injects its styles before render. The `GLOBAL_CSS` block runs synchronously at module load. If you see a flash, add `display:none` to `#root` in `index.html` and remove it in the first `useEffect`.

### Microphone not working
The Web Audio API requires HTTPS (or `localhost`). Use `vite` dev server (localhost) or ensure your production domain has SSL.

### Audio effects silently fail
Check browser console for `OfflineAudioContext` errors. Safari requires `AudioContext` to be created after a user gesture. The recorder starts only on button click, so this should be fine — but `applyEffect` may need to be called after a user interaction too.

### `localStorage` not persisting
Private/incognito mode may block localStorage writes. The app will still work as a session, but won't remember you on reload.

### API CORS errors
Add the frontend origin to your Express CORS config:
```javascript
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
```

### Mock mode not loading feed
If the initial `generateMockFeed()` returns 0 items with a category filter, it's because the mock posts don't match the category. Clear the category filter or remove the filter for development.

---

## License

WhisperVault — © 2026. All rights reserved.

For licensing: legal@whispervault.com  
Engineering: engineering@whispervault.com

---

*Built with React 18, Vite, React Router v6, Web Audio API, and zero external UI libraries.*
