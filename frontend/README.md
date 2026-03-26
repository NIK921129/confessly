# 🎭 Confessly (Frontend)

Confessly is a premium, anonymous social platform designed for sharing secrets, thoughts, and confessions in a visually immersive environment. Built with **React 18**, **TypeScript**, and **Tailwind CSS**, it features a high-end Glassmorphic UI and a unique "Hold to Reveal" mechanic.

## ✨ Core Features

* **Anonymous Identity System:** A name generator capable of over **2.5 Billion** unique combinations (Colors × Creatures × Locations × Numbers).
* **Glassmorphism UI:** A sleek, modern dark-themed interface with real-time backdrop blurring.
* **Hold to Reveal:** Secrets are blurred by default; users must hold a button to trigger a slow-fade reveal animation.
* **Rarity System:** Confessions from high-level users feature an **Animate Pulse Glow** (Common, Uncommon, Rare, Legendary).
* **Voice Confessions (Coming Soon):** Support for audio-based secrets with ambient sound integration.
* **XP & Leveling:** Users gain levels and unique titles as they participate in the community.

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 2. Installation
Navigate to the frontend directory and install dependencies:
```bash
cd R:\confessly\frontend
npm install
3. Environment Setup
Create a .env file in the root directory:

Code snippet
VITE_API_URL=http://localhost:5000
4. Run Development Server
Bash
npm run dev
The app will be available at http://localhost:5173.

🛠️ Tech Stack
Framework: React 18 (Vite)

Language: TypeScript

Styling: Tailwind CSS + Custom Keyframe Animations

Routing: React Router v6

State Management: React Context API

📁 File Structure
src/App.tsx: Main logic, Routing, and Components.

src/index.css: Global styles, Glassmorphism definitions, and Scrollbar styling.

src/main.tsx: Entry point.

tailwind.config.js: Custom animation and rarity glow configurations.

⚖️ License
Internal Project - All Rights Reserved.


---

### 💡 Why this README is useful:
1.  **Documentation:** It reminds you exactly which command to run and which port to look at.
2.  **Professionalism:** It explains the "2.5 Billion" logic and the tech stack, which is great if you ever want to put this in a portfolio.
3.  **Setup Guide:** If you ever move your code to a different computer, you can follow your own steps to get it running in seconds.

**Is there anything else you'd like to add to the documentation, such as a "Future Roadmap" section for your voice features?**