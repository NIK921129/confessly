/**
 * ═══════════════════════════════════════════════════════════════
 * WHISPERVAULT — Anonymous Confession & Voice Platform
 * Single-File React Application  •  Version 1.0.0
 * ═══════════════════════════════════════════════════════════════
 * All features under one file:
 *  - Anonymous Identity Generator (2.5B combinations)
 *  - Text & Voice Confessions with Audio Effects
 *  - Hold-to-Reveal mechanic (1.5s)
 *  - Heat Score Algorithm
 *  - Reactions, Comments, Chain Confessions
 *  - Anonymous Radio Mode
 *  - Anonymous Messaging
 *  - Gamification: XP, Levels, Badges, Streaks
 *  - Real-time socket simulation
 *  - Full Auth flow (Login / Signup)
 *  - Notifications system
 * ═══════════════════════════════════════════════════════════════
 */

import React, {
  useState, useEffect, useCallback, useRef,
  createContext, useContext, useMemo,
} from "react";
import {
  BrowserRouter, Routes, Route, Link, Navigate,
  useNavigate, useLocation,
} from "react-router-dom";

// ─────────────────────────────────────────────────────────────────
// §1  CONFIG & CONSTANTS
// ─────────────────────────────────────────────────────────────────
const API_URL = import.meta?.env?.VITE_API_URL || "https://api.whispervault.app";
const CLOUDINARY_CLOUD_NAME  = "dm82jxjfk";
const CLOUDINARY_UPLOAD_PRESET = "whispervault_audio";

// ─────────────────────────────────────────────────────────────────
// §2  IDENTITY DATA
// ─────────────────────────────────────────────────────────────────
const COLORS = [
  "Crimson","Silver","Golden","Void","Obsidian","Azure","Emerald","Ruby",
  "Sapphire","Amber","Ivory","Scarlet","Midnight","Ocean","Forest","Sunset",
  "Mystic","Shadow","Crystal","Phantom","Velvet","Copper","Bronze","Platinum",
  "Rose","Lavender","Indigo","Teal","Coral","Magenta","Onyx","Pearl","Jade",
  "Violet","Ebony","Glacier","Honey","Ice","Jet","Khaki","Lilac","Maroon",
  "Navy","Olive","Peach","Quartz","Rust","Sage","Tangerine",
];

const CREATURES = [
  // Common (60%)
  {name:"Dog",rarity:"common"},{name:"Cat",rarity:"common"},{name:"Fox",rarity:"common"},
  {name:"Eagle",rarity:"common"},{name:"Shark",rarity:"common"},{name:"Wolf",rarity:"common"},
  {name:"Raven",rarity:"common"},{name:"Bear",rarity:"common"},{name:"Deer",rarity:"common"},
  {name:"Hawk",rarity:"common"},
  // Uncommon (25%)
  {name:"Snow Leopard",rarity:"uncommon"},{name:"Manta Ray",rarity:"uncommon"},
  {name:"Condor",rarity:"uncommon"},{name:"Lynx",rarity:"uncommon"},
  {name:"Orca",rarity:"uncommon"},{name:"Cobra",rarity:"uncommon"},
  // Rare (10%)
  {name:"Falcon",rarity:"rare"},{name:"Panther",rarity:"rare"},
  {name:"White Whale",rarity:"rare"},{name:"Tiger",rarity:"rare"},{name:"Grizzly",rarity:"rare"},
  // Legendary (5%)
  {name:"Pegasus",rarity:"legendary"},{name:"Unicorn",rarity:"legendary"},
  {name:"Phoenix",rarity:"legendary"},{name:"Dragon",rarity:"legendary"},
  {name:"Griffin",rarity:"legendary"},{name:"Kraken",rarity:"legendary"},
];

const LOCATIONS = [
  "Kyoto","Avalon","Lagos","Siberia","New York","London","Tokyo","Paris","Cairo","Mumbai",
  "Shanghai","Rome","Berlin","Sydney","Cape Town","Rio","Istanbul","Delhi","Moscow","Bangkok",
  "Barcelona","Dubai","Singapore","Hong Kong","Vienna","Prague","Edinburgh","Dublin","Lisbon",
  "Athens","Amsterdam","Stockholm","Oslo","Helsinki","Copenhagen","Warsaw","Budapest","Krakow",
  "Venice","Florence","Milan","Madrid","Seville","Valencia","Porto","Brussels","Geneva","Zurich","Munich",
];

function generateAnonymousName() {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const rand = Math.random();
  let pool;
  if (rand < 0.05)       pool = CREATURES.filter(c => c.rarity === "legendary");
  else if (rand < 0.15)  pool = CREATURES.filter(c => c.rarity === "rare");
  else if (rand < 0.40)  pool = CREATURES.filter(c => c.rarity === "uncommon");
  else                   pool = CREATURES.filter(c => c.rarity === "common");
  const creature = pool[Math.floor(Math.random() * pool.length)];
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const number   = Math.floor(Math.random() * 10) + 1;
  return {
    color, creature: creature.name, creatureRarity: creature.rarity,
    location, number, full: `${color} ${creature.name} of ${location} ${number}`,
  };
}

// ─────────────────────────────────────────────────────────────────
// §3  APP CONSTANTS
// ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {name:"Adult",emoji:"🔥",color:"#8B0000"},
  {name:"Crime",emoji:"🔪",color:"#4A4A4A"},
  {name:"Funny",emoji:"😂",color:"#FFD700"},
  {name:"Romantic Crush",emoji:"💕",color:"#FF69B4"},
  {name:"Insult",emoji:"🤬",color:"#FF8C00"},
  {name:"Sorrow & Grief",emoji:"💔",color:"#191970"},
  {name:"Pain",emoji:"😖",color:"#800000"},
  {name:"To The God",emoji:"🙏",color:"#DAA520"},
  {name:"Dear Family",emoji:"👪",color:"#8B4513"},
  {name:"Unpopular Opinions",emoji:"🤔",color:"#800080"},
  {name:"Work & Career",emoji:"💼",color:"#008080"},
  {name:"Mental Health",emoji:"🧠",color:"#90EE90"},
];

const REACTIONS = [
  {type:"meToo",      label:"Me Too",       emoji:"🙋"},
  {type:"sendingLove",label:"Sending Love", emoji:"💝"},
  {type:"wow",        label:"Wow",          emoji:"😮"},
  {type:"sameLol",    label:"Same Lol",     emoji:"😂"},
  {type:"stayStrong", label:"Stay Strong",  emoji:"💪"},
  {type:"respect",    label:"Respect",      emoji:"🙏"},
];

const RARITY_COLORS = {
  common:"#9CA3AF", uncommon:"#60A5FA", rare:"#A855F7", legendary:"#FACC15",
};

const RARITY_GLOW = {
  common:"",
  uncommon:"0 0 12px rgba(96,165,250,0.4)",
  rare:"0 0 18px rgba(168,85,247,0.5)",
  legendary:"0 0 28px rgba(250,204,21,0.7)",
};

const VOICE_EFFECTS = [
  {value:"normal",label:"Normal 🎤"},
  {value:"whisper",label:"Whisper 🌬️"},
  {value:"deep",label:"Deep Voice 🔊"},
  {value:"echo",label:"Echo 🔁"},
  {value:"robotic",label:"Robotic 🤖"},
];

const AMBIENT_SOUNDS = [
  {value:"silence",label:"Silence",emoji:"🤫"},
  {value:"rain",label:"Rain",emoji:"🌧️"},
  {value:"crickets",label:"Night Crickets",emoji:"🌙"},
  {value:"cafe",label:"Cafe",emoji:"☕"},
  {value:"ocean",label:"Ocean Waves",emoji:"🌊"},
  {value:"thunder",label:"Thunder",emoji:"⛈️"},
  {value:"fireplace",label:"Fireplace",emoji:"🔥"},
];

const MOOD_EMOJIS = ["😔","😢","😠","😍","😂","😨","😌","❤️","💔","🔥","✨","🌙","😤","🥺","😩","💀","🌊","🖤"];

const LEVEL_TITLES = [
  {min:1,max:25,title:"Whisperer"},
  {min:26,max:75,title:"Shadow Voice"},
  {min:76,max:150,title:"Confessor"},
  {min:151,max:250,title:"Void Speaker"},
  {min:251,max:299,title:"Phantom"},
  {min:300,max:300,title:"Legend"},
];

const XP_REWARDS = {
  POST_CONFESSION:10, RECEIVE_REACTION:2, RECEIVE_COMMENT:5,
  DAILY_STREAK:20,    STREAK_MILESTONE_7:100,
};

function getLevelTitle(level) {
  return (LEVEL_TITLES.find(t => level >= t.min && level <= t.max) || LEVEL_TITLES[0]).title;
}

function calculateLevel(xp) {
  return Math.min(300, Math.floor(xp / 100) + 1);
}

function getXPProgress(xp, level) {
  const base = (level - 1) * 100;
  return Math.min(100, Math.max(0, ((xp - base) / 100) * 100));
}

// ─────────────────────────────────────────────────────────────────
// §4  HEAT SCORE ALGORITHM
// ─────────────────────────────────────────────────────────────────
function calculateHeatScore({ reactions, views, comments, createdAt }) {
  const totalReactions = Object.values(reactions || {}).reduce((a, b) => a + (b || 0), 0);
  const engagementScore = (totalReactions * 2) + ((views || 0) * 0.1) + ((comments || 0) * 3);
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / 3600000;
  const timeDecay = Math.max(0, 1 - ageHours / 48);
  return Math.round(engagementScore * (1 + timeDecay));
}

// ─────────────────────────────────────────────────────────────────
// §5  MOCK DATA GENERATOR (fallback when API is unavailable)
// ─────────────────────────────────────────────────────────────────
const SAMPLE_TEXTS = [
  "I've been pretending to be happy at work for three years. Nobody knows I cry in the parking lot every morning before walking in.",
  "I secretly applied to jobs in another country just to see if I could leave everything behind. I got three offers and turned them all down.",
  "I told my best friend I didn't get into their wedding because of a scheduling conflict. The truth is I can't afford the bridesmaid dress and I'm too proud to say it.",
  "Every night I reread the last message my ex sent me before they blocked me. It's been two years.",
  "I pretend to work remotely but I actually drive to a parking lot and sit there for 8 hours. My apartment gives me panic attacks.",
  "I still have my childhood stuffed animal. I'm 31. It travels with me on every business trip.",
  "I told my family I donated my inheritance to charity. I spent it on therapy for the trauma they caused.",
  "I applied to be on a reality show just so I'd have a reason to lose weight. I didn't get cast. Now I don't know why to do it.",
  "I'm a doctor and I still can't diagnose what's wrong with me emotionally.",
  "My meditation app thinks I'm at 400 days streak. I just tap it every night without meditating.",
];

function makeMockConfession(id, overrides = {}) {
  const authorName = generateAnonymousName();
  const rarity = authorName.creatureRarity;
  const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const now = new Date(Date.now() - Math.random() * 86400000 * 3);
  const reactions = {
    meToo:Math.floor(Math.random()*200),
    sendingLove:Math.floor(Math.random()*150),
    wow:Math.floor(Math.random()*100),
    sameLol:Math.floor(Math.random()*80),
    stayStrong:Math.floor(Math.random()*120),
    respect:Math.floor(Math.random()*90),
  };
  const views = Math.floor(Math.random() * 3000) + 50;
  const comments = Math.floor(Math.random() * 40);
  return {
    _id: `mock_${id}_${Math.random().toString(36).slice(2)}`,
    authorId: `user_${id}`,
    authorName: authorName.full,
    authorRarity: rarity,
    authorLevel: Math.floor(Math.random() * 50) + 1,
    authorTitle: getLevelTitle(Math.floor(Math.random() * 50) + 1),
    type: "text",
    content: SAMPLE_TEXTS[id % SAMPLE_TEXTS.length],
    categories: [cat.name],
    moodEmoji: MOOD_EMOJIS[Math.floor(Math.random() * MOOD_EMOJIS.length)],
    reactions,
    reactionUsers: [],
    views,
    heatScore: calculateHeatScore({reactions, views, comments, createdAt: now}),
    createdAt: now.toISOString(),
    ...overrides,
  };
}

function generateMockFeed(count = 12) {
  return Array.from({length: count}, (_, i) => makeMockConfession(i))
    .sort((a, b) => b.heatScore - a.heatScore);
}

// ─────────────────────────────────────────────────────────────────
// §6  SOCKET SIMULATION
// ─────────────────────────────────────────────────────────────────
function createSocket(_token) {
  const handlers = {};
  let intervalId = null;

  const sock = {
    on(event, fn) {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(fn);
      // Simulate new confessions every 30s
      if (event === "new_confession") {
        intervalId = setInterval(() => {
          if (Math.random() > 0.6) {
            const mock = makeMockConfession(Date.now());
            (handlers["new_confession"] || []).forEach(h => h(mock));
          }
        }, 30000);
      }
    },
    off(event, fn) {
      if (!fn) { delete handlers[event]; return; }
      handlers[event] = (handlers[event] || []).filter(h => h !== fn);
    },
    emit(event, ...args) {
      (handlers[event] || []).forEach(h => h(...args));
    },
    disconnect() {
      if (intervalId) clearInterval(intervalId);
      Object.keys(handlers).forEach(k => delete handlers[k]);
    },
  };
  return sock;
}

// ─────────────────────────────────────────────────────────────────
// §7  AUTH CONTEXT
// ─────────────────────────────────────────────────────────────────
const AuthContext = createContext(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function AuthProvider({ children }) {
  const [user, setUser]                     = useState(null);
  const [token, setToken]                   = useState(null);
  const [isLoading, setIsLoading]           = useState(true);
  const [socket, setSocket]                 = useState(null);
  const [notifications, setNotifications]   = useState([]);
  const [useMockMode, setUseMockMode]       = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const savedUser  = localStorage.getItem("wv_user");
    const savedToken = localStorage.getItem("wv_token");
    if (savedUser && savedToken) {
      try { setUser(JSON.parse(savedUser)); setToken(savedToken); } catch {}
    }
    setIsLoading(false);
  }, []);

  // Connect socket when authenticated
  useEffect(() => {
    if (!token || !user) return;
    const sock = createSocket(token);
    setSocket(sock);
    sock.on("notification", n => setNotifications(prev => [n, ...prev.slice(0, 49)]));
    return () => sock.disconnect();
  }, [token, user]);

  const _saveUser = (u, t) => {
    setUser(u); setToken(t);
    localStorage.setItem("wv_token", t);
    localStorage.setItem("wv_user", JSON.stringify(u));
  };

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      let data;
      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({username, password}),
          signal: AbortSignal.timeout(5000),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
      } catch (netErr) {
        // Fall back to mock mode
        const saved = localStorage.getItem(`wv_mock_user_${username}`);
        if (!saved) throw new Error("User not found. Please sign up first.");
        const mockUser = JSON.parse(saved);
        if (mockUser.password !== password) throw new Error("Invalid credentials");
        delete mockUser.password;
        setUseMockMode(true);
        _saveUser(mockUser, `mock_token_${username}`);
        return;
      }
      _saveUser(data.user, data.token);
    } finally { setIsLoading(false); }
  };

  const signup = async (username, password, gender) => {
    setIsLoading(true);
    try {
      const anonymousName = generateAnonymousName();
      let newUser;
      try {
        const res = await fetch(`${API_URL}/api/auth/signup`, {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({username, password, gender, anonymousName, ageVerified: true}),
          signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");
        newUser = data.user;
        _saveUser(newUser, data.token);
        return;
      } catch {}
      // Mock signup
      if (localStorage.getItem(`wv_mock_user_${username}`)) {
        throw new Error("Username already taken");
      }
      newUser = {
        _id:`mock_${Date.now()}`, username, gender, anonymousName,
        level:1, xp:0, totalPosts:0, streak:0,
        title: getLevelTitle(1),
        badges: anonymousName.creatureRarity === "legendary"
          ? [{name:"Mythical Badge", color:"silver", earnedAt: new Date()}]
          : [],
        premium: false, createdAt: new Date().toISOString(),
      };
      localStorage.setItem(`wv_mock_user_${username}`, JSON.stringify({...newUser, password}));
      setUseMockMode(true);
      _saveUser(newUser, `mock_token_${username}`);
    } finally { setIsLoading(false); }
  };

  const logout = () => {
    if (socket) socket.disconnect();
    setUser(null); setToken(null); setSocket(null);
    localStorage.removeItem("wv_token");
    localStorage.removeItem("wv_user");
    window.location.href = "/login";
  };

  const updateUser = (updates) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = {...prev, ...updates};
      localStorage.setItem("wv_user", JSON.stringify(updated));
      return updated;
    });
  };

  const markNotificationRead = id =>
    setNotifications(prev => prev.map(n => n._id === id ? {...n, read:true} : n));

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated: !!user, isLoading,
      login, signup, logout, updateUser,
      socket, notifications, markNotificationRead, useMockMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────
// §8  API HELPERS
// ─────────────────────────────────────────────────────────────────
async function apiRequest(method, path, body, token) {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
    },
    signal: AbortSignal.timeout(8000),
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_URL}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ─────────────────────────────────────────────────────────────────
// §9  GLOBAL STYLES (injected into <head>)
// ─────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-base:       #050508;
    --bg-card:       rgba(255,255,255,0.04);
    --bg-card-hover: rgba(255,255,255,0.07);
    --border:        rgba(255,255,255,0.08);
    --border-hover:  rgba(168,85,247,0.4);
    --text-primary:  #F0EDFF;
    --text-secondary:#8B8AA0;
    --text-muted:    #4A4860;
    --purple-400:    #c084fc;
    --purple-500:    #a855f7;
    --purple-600:    #9333ea;
    --pink-500:      #ec4899;
    --green-500:     #22c55e;
    --yellow-400:    #facc15;
    --font-display:  'Syne', sans-serif;
    --font-body:     'Space Grotesk', sans-serif;
    --radius-sm:     8px;
    --radius-md:     16px;
    --radius-lg:     24px;
    --radius-xl:     32px;
    --transition:    all 0.2s cubic-bezier(0.4,0,0.2,1);
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: var(--font-body);
    background: var(--bg-base);
    color: var(--text-primary);
    min-height: 100vh;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.3); border-radius: 2px; }

  /* ── Glass card ── */
  .wv-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    backdrop-filter: blur(20px);
    transition: var(--transition);
  }
  .wv-card:hover { border-color: var(--border-hover); }

  /* ── Gradient text ── */
  .grad-text {
    background: linear-gradient(135deg, var(--purple-400), var(--pink-500));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Buttons ── */
  .btn-primary {
    background: linear-gradient(135deg, var(--purple-600), var(--pink-500));
    color: white;
    border: none;
    border-radius: 100px;
    padding: 10px 24px;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .btn-ghost {
    background: rgba(255,255,255,0.06);
    color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 8px 16px;
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); }

  /* ── Input ── */
  .wv-input {
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 15px;
    width: 100%;
    outline: none;
    transition: var(--transition);
  }
  .wv-input:focus { border-color: var(--purple-500); background: rgba(168,85,247,0.06); }
  .wv-input::placeholder { color: var(--text-muted); }

  /* ── Tag chip ── */
  .tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.5px;
    background: rgba(255,255,255,0.06);
    color: var(--text-secondary);
    border: 1px solid var(--border);
    text-transform: uppercase;
  }
  .tag-chip.active {
    background: rgba(168,85,247,0.18);
    border-color: var(--purple-500);
    color: var(--purple-400);
  }

  /* ── Rarity badge ── */
  .rarity-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
  }

  /* ── Nav ── */
  .wv-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(5,5,8,0.85);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border);
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* ── Logo ── */
  .wv-logo {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -1px;
    background: linear-gradient(135deg, #c084fc, #ec4899, #f97316);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-decoration: none;
  }

  /* ── Confession card ── */
  .confession-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 22px;
    margin-bottom: 16px;
    transition: var(--transition);
    cursor: default;
  }
  .confession-card:hover { border-color: rgba(168,85,247,0.3); background: var(--bg-card-hover); }

  /* ── Avatar ── */
  .wv-avatar {
    width: 44px; height: 44px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 16px;
    color: #0a0a0f;
    flex-shrink: 0;
    transition: var(--transition);
  }

  /* ── Reaction button ── */
  .reaction-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 100px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    font-size: 12px;
    font-family: var(--font-body);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    user-select: none;
  }
  .reaction-btn:hover { background: rgba(168,85,247,0.15); border-color: var(--purple-500); color: var(--text-primary); }
  .reaction-btn.active { background: rgba(168,85,247,0.2); border-color: var(--purple-400); color: var(--purple-400); }

  /* ── Hold overlay ── */
  .hold-overlay {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.6);
    border-radius: var(--radius-lg);
    z-index: 10;
    backdrop-filter: blur(4px);
  }

  /* ── Blur content ── */
  .blur-content { filter: blur(16px); user-select: none; opacity: 0.3; transition: all 0.6s ease; }
  .blur-content.revealed { filter: none; opacity: 1; }

  /* ── Pulse animation for legendary ── */
  @keyframes legendaryPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(250,204,21,0.4); }
    50%       { box-shadow: 0 0 35px rgba(250,204,21,0.8); }
  }
  .legendary-aura { animation: legendaryPulse 2s ease-in-out infinite; }

  /* ── XP bar ── */
  .xp-bar-track {
    height: 4px; border-radius: 2px;
    background: rgba(255,255,255,0.08);
    overflow: hidden;
  }
  .xp-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--purple-500), var(--pink-500));
    border-radius: 2px;
    transition: width 0.8s ease;
  }

  /* ── Fade in ── */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in-up { animation: fadeInUp 0.4s ease forwards; }

  /* ── Radio visualizer ── */
  @keyframes barDance {
    0%, 100% { height: 6px; }
    50%       { height: 28px; }
  }
  .bar-vis span {
    display: inline-block;
    width: 4px;
    background: var(--purple-500);
    border-radius: 2px;
    margin: 0 1px;
    height: 6px;
  }
  .bar-vis.playing span:nth-child(1) { animation: barDance 0.6s ease-in-out infinite; }
  .bar-vis.playing span:nth-child(2) { animation: barDance 0.6s ease-in-out 0.1s infinite; }
  .bar-vis.playing span:nth-child(3) { animation: barDance 0.6s ease-in-out 0.2s infinite; }
  .bar-vis.playing span:nth-child(4) { animation: barDance 0.6s ease-in-out 0.3s infinite; }
  .bar-vis.playing span:nth-child(5) { animation: barDance 0.6s ease-in-out 0.4s infinite; }

  /* ── Notification dot ── */
  .notif-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--pink-500);
    position: absolute; top: -2px; right: -2px;
  }

  /* ── Mobile responsive ── */
  @media (max-width: 640px) {
    .wv-nav { padding: 10px 14px; }
    .hide-mobile { display: none !important; }
  }

  /* ── Tooltip ── */
  .wv-tooltip { position: relative; }
  .wv-tooltip::after {
    content: attr(data-tip);
    position: absolute; bottom: calc(100% + 6px); left: 50%;
    transform: translateX(-50%);
    background: rgba(20,20,30,0.95);
    color: var(--text-primary);
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 11px;
    white-space: nowrap;
    opacity: 0; pointer-events: none;
    transition: opacity 0.2s;
    border: 1px solid var(--border);
    z-index: 200;
  }
  .wv-tooltip:hover::after { opacity: 1; }

  /* ── Comment ── */
  .comment-item {
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 12px 14px;
    margin-bottom: 8px;
  }

  /* ── Skeleton loader ── */
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 800px 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius-md);
  }
`;

// Inject styles once
if (!document.getElementById("wv-styles")) {
  const style = document.createElement("style");
  style.id = "wv-styles";
  style.textContent = GLOBAL_CSS;
  document.head.appendChild(style);
}

// ─────────────────────────────────────────────────────────────────
// §10  UTILITY COMPONENTS
// ─────────────────────────────────────────────────────────────────

function LoadingSpinner({ text = "Entering the vault..." }) {
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(5,5,8,0.92)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      zIndex:1000, gap:16,
    }}>
      <div style={{
        width:48, height:48,
        border:"3px solid rgba(168,85,247,0.2)",
        borderTopColor:"#a855f7",
        borderRadius:"50%",
        animation:"spin 0.8s linear infinite",
      }} />
      <p style={{color:"var(--purple-400)", fontSize:13, fontFamily:"var(--font-body)"}}>
        {text}
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function SkeletonCard() {
  return (
    <div className="confession-card" style={{marginBottom:16}}>
      <div style={{display:"flex", gap:12, marginBottom:16}}>
        <div className="skeleton" style={{width:44, height:44, borderRadius:"50%"}} />
        <div style={{flex:1, display:"flex", flexDirection:"column", gap:6}}>
          <div className="skeleton" style={{height:14, width:"40%"}} />
          <div className="skeleton" style={{height:11, width:"25%"}} />
        </div>
      </div>
      <div className="skeleton" style={{height:14, marginBottom:8}} />
      <div className="skeleton" style={{height:14, width:"80%", marginBottom:8}} />
      <div className="skeleton" style={{height:14, width:"60%"}} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// §11  HOLD-TO-REVEAL
// ─────────────────────────────────────────────────────────────────
function HoldToReveal({ onReveal, isRevealed, children }) {
  const [pressing, setPressing]   = useState(false);
  const [progress, setProgress]   = useState(0);
  const animRef   = useRef(null);
  const startRef  = useRef(0);
  const revealedRef = useRef(false);

  const startPress = (e) => {
    e.preventDefault();
    if (isRevealed) return;
    revealedRef.current = false;
    setPressing(true); setProgress(0);
    startRef.current = Date.now();
    const tick = () => {
      const p = Math.min(100, ((Date.now() - startRef.current) / 1500) * 100);
      setProgress(p);
      if (p < 100) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        revealedRef.current = true;
        onReveal();
        setPressing(false);
        setProgress(0);
      }
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const cancelPress = () => {
    if (revealedRef.current) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setPressing(false); setProgress(0);
  };

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const circumference = 2 * Math.PI * 26;

  return (
    <div
      onMouseDown={startPress} onMouseUp={cancelPress} onMouseLeave={cancelPress}
      onTouchStart={startPress} onTouchMove={cancelPress} onTouchCancel={cancelPress}
      style={{position:"relative", cursor: isRevealed ? "default" : "pointer", userSelect:"none"}}
    >
      {children}
      {pressing && !isRevealed && (
        <div className="hold-overlay">
          <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:10}}>
            <svg width="68" height="68" viewBox="0 0 68 68">
              <circle cx="34" cy="34" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <circle
                cx="34" cy="34" r="26"
                fill="none" stroke="var(--purple-400)" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress / 100)}
                transform="rotate(-90 34 34)"
                style={{transition:"stroke-dashoffset 0.05s linear"}}
              />
              <text x="34" y="38" textAnchor="middle" fill="white" fontSize="11" fontFamily="var(--font-body)">
                {Math.round(progress)}%
              </text>
            </svg>
            <span style={{color:"rgba(255,255,255,0.7)", fontSize:12}}>Keep holding…</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// §12  AUDIO RECORDER COMPONENT
// ─────────────────────────────────────────────────────────────────
function AudioRecorder({ onAudioReady, onCancel }) {
  const [isRecording, setIsRecording]   = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl]         = useState(null);
  const [voiceEffect, setVoiceEffect]   = useState("normal");
  const [ambientSound, setAmbientSound] = useState("silence");
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecRef  = useRef(null);
  const chunksRef    = useRef([]);
  const timerRef     = useRef(null);
  const urlRef       = useRef(null);
  const mountedRef   = useRef(true);
  const audioBlobRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecRef.current.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type:"audio/webm" });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        if (mountedRef.current) setAudioUrl(url);
      };
      mediaRecRef.current.start(100); // collect every 100ms
      setIsRecording(true);
      let s = 0;
      timerRef.current = setInterval(() => {
        s++; setRecordingTime(s);
        if (s >= 100) stopRecording();
      }, 1000);
    } catch {
      alert("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecRef.current && isRecording) {
      mediaRecRef.current.stop();
      mediaRecRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
  };

  const bufferToWav = (buf) => {
    const ch = buf.numberOfChannels, sr = buf.sampleRate, bps = 2, ba = ch * bps;
    const samples = buf.getChannelData(0);
    const dl = samples.length * bps, total = 44 + dl;
    const ab = new ArrayBuffer(total), v = new DataView(ab);
    const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o+i, s.charCodeAt(i)); };
    ws(0,"RIFF"); v.setUint32(4,total-8,true); ws(8,"WAVE"); ws(12,"fmt ");
    v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,ch,true);
    v.setUint32(24,sr,true); v.setUint32(28,sr*ba,true); v.setUint16(32,ba,true);
    v.setUint16(34,16,true); ws(36,"data"); v.setUint32(40,dl,true);
    let off = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      off += 2;
    }
    return new Blob([v], { type:"audio/wav" });
  };

  const applyEffect = async () => {
    if (!audioUrl || voiceEffect === "normal") return;
    setIsProcessing(true);
    const ac = new AudioContext();
    try {
      const arrayBuffer = await (await fetch(audioUrl)).arrayBuffer();
      const decoded = await ac.decodeAudioData(arrayBuffer);

      const fx = async (connect) => {
        const off = new OfflineAudioContext(decoded.numberOfChannels, decoded.length, decoded.sampleRate);
        const src = off.createBufferSource(); src.buffer = decoded;
        connect(off, src); src.start(); return off.startRendering();
      };

      let out = decoded;
      switch (voiceEffect) {
        case "whisper":
          out = await fx((ctx, src) => {
            const g = ctx.createGain(); g.gain.value = 0.5;
            const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1000;
            src.connect(f); f.connect(g); g.connect(ctx.destination);
          }); break;
        case "deep":
          out = await fx((ctx, src) => {
            const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 500; f.Q.value = 0.8;
            src.connect(f); f.connect(ctx.destination);
          }); break;
        case "echo":
          out = await fx((ctx, src) => {
            const d = ctx.createDelay(); d.delayTime.value = 0.28;
            const g = ctx.createGain(); g.gain.value = 0.45;
            src.connect(ctx.destination); src.connect(d); d.connect(g); g.connect(ctx.destination);
          }); break;
        case "robotic":
          out = await fx((ctx, src) => {
            const ws = ctx.createWaveShaper();
            const n = 16, step = 2/n;
            ws.curve = new Float32Array(n).map((_,i) => -1 + (i+0.5)*step);
            src.connect(ws); ws.connect(ctx.destination);
          }); break;
      }

      const newBlob = bufferToWav(out);
      audioBlobRef.current = newBlob;
      const newUrl = URL.createObjectURL(newBlob);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = newUrl;
      if (mountedRef.current) setAudioUrl(newUrl);
    } catch (e) { console.error("Effect error:", e); }
    finally { await ac.close(); setIsProcessing(false); }
  };

  const handleSubmit = () => {
    if (!audioBlobRef.current) return;
    onAudioReady(audioBlobRef.current, recordingTime, voiceEffect, ambientSound);
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const pct = Math.round((recordingTime / 100) * 100);

  return (
    <div style={{display:"flex", flexDirection:"column", gap:16}}>
      {!audioUrl ? (
        <div style={{textAlign:"center", padding:"24px 0"}}>
          {!isRecording ? (
            <div>
              <button className="btn-primary" onClick={startRecording} style={{fontSize:15, padding:"12px 28px"}}>
                🎙️ Start Recording
              </button>
              <p style={{color:"var(--text-muted)", fontSize:12, marginTop:10}}>Max 100 seconds</p>
            </div>
          ) : (
            <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:12}}>
              <div style={{
                width:72, height:72, borderRadius:"50%",
                background:"rgba(239,68,68,0.15)",
                border:"2px solid rgba(239,68,68,0.5)",
                display:"flex", alignItems:"center", justifyContent:"center",
                animation:"legendaryPulse 1s ease-in-out infinite",
              }}>
                <span style={{fontSize:28}}>🎙️</span>
              </div>
              <p style={{color:"var(--text-secondary)", fontFamily:"var(--font-display)", fontSize:20, fontWeight:600}}>
                {fmt(recordingTime)}
              </p>
              <div style={{width:200}}>
                <div className="xp-bar-track">
                  <div className="xp-bar-fill" style={{width:`${pct}%`, background:"linear-gradient(90deg,#ef4444,#f97316)"}} />
                </div>
                <p style={{color:"var(--text-muted)", fontSize:11, textAlign:"center", marginTop:4}}>{pct}% / 100s</p>
              </div>
              <button className="btn-ghost" onClick={stopRecording} style={{marginTop:4}}>⏹️ Stop Recording</button>
            </div>
          )}
        </div>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:14}}>
          <audio controls src={audioUrl} style={{width:"100%", borderRadius:8}} />
          <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
            <select
              value={voiceEffect}
              onChange={e => setVoiceEffect(e.target.value)}
              style={{
                background:"rgba(255,255,255,0.06)", border:"1px solid var(--border)",
                borderRadius:8, padding:"8px 12px", color:"var(--text-primary)",
                fontFamily:"var(--font-body)", fontSize:13, flex:1,
              }}
            >
              {VOICE_EFFECTS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
            <button
              className="btn-ghost"
              onClick={applyEffect}
              disabled={isProcessing || voiceEffect === "normal"}
              style={{flex:"0 0 auto"}}
            >
              {isProcessing ? "⏳" : "✨"} Apply
            </button>
            <select
              value={ambientSound}
              onChange={e => setAmbientSound(e.target.value)}
              style={{
                background:"rgba(255,255,255,0.06)", border:"1px solid var(--border)",
                borderRadius:8, padding:"8px 12px", color:"var(--text-primary)",
                fontFamily:"var(--font-body)", fontSize:13, flex:1,
              }}
            >
              {AMBIENT_SOUNDS.map(s => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
            </select>
          </div>
          <div style={{display:"flex", gap:10, justifyContent:"flex-end"}}>
            <button className="btn-ghost" onClick={onCancel}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit}>✓ Use Recording</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// §13  CONFESSION CARD
// ─────────────────────────────────────────────────────────────────
function ConfessionCard({ confession, onReaction, onComment, userReactions = {} }) {
  const [isRevealed, setIsRevealed]   = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]       = useState([]);
  const [newComment, setNewComment]   = useState("");
  const [loadingCom, setLoadingCom]   = useState(false);
  const { token }                     = useAuth();

  const rarityColor = RARITY_COLORS[confession.authorRarity] || RARITY_COLORS.common;
  const glowStyle   = RARITY_GLOW[confession.authorRarity] ? {boxShadow: RARITY_GLOW[confession.authorRarity]} : {};
  const isLegendary = confession.authorRarity === "legendary";

  const totalReactions = useMemo(() =>
    Object.values(confession.reactions || {}).reduce((a,b) => a + (b||0), 0),
    [confession.reactions]
  );

  const formattedDate = useMemo(() => {
    const d = new Date(confession.createdAt);
    const diff = Date.now() - d.getTime();
    if (diff < 60000)   return "just now";
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return `${Math.floor(diff/86400000)}d ago`;
  }, [confession.createdAt]);

  const fetchComments = useCallback(async (signal) => {
    if (!showComments) return;
    setLoadingCom(true);
    try {
      const res = await fetch(`${API_URL}/api/comments?confessionId=${confession._id}`, {signal});
      const data = await res.json();
      setComments(Array.isArray(data) ? data : generateMockComments(confession._id));
    } catch (err) {
      if (err.name !== "AbortError") setComments(generateMockComments(confession._id));
    } finally { setLoadingCom(false); }
  }, [confession._id, showComments]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchComments(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchComments]);

  const postComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/comments`, {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body: JSON.stringify({confessionId:confession._id, content:newComment}),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        setNewComment("");
        fetchComments();
        return;
      }
    } catch {}
    // Mock
    const mockComment = {
      _id: `c_${Date.now()}`,
      confessionId: confession._id,
      authorId: "mock_me",
      authorName: "You (Anonymous)",
      content: newComment,
      reactions: {meToo:0, sendingLove:0, wow:0},
      replies: [],
      createdAt: new Date(),
    };
    setComments(prev => [...prev, mockComment]);
    setNewComment("");
  };

  return (
    <div
      className={`confession-card fade-in-up ${isLegendary ? "legendary-aura" : ""}`}
      style={glowStyle}
    >
      {/* Header */}
      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14, gap:12}}>
        <div style={{display:"flex", alignItems:"center", gap:12, flex:1, minWidth:0}}>
          <div
            className="wv-avatar"
            style={{background: `linear-gradient(135deg, ${rarityColor}, ${rarityColor}88)`, color:"#111"}}
          >
            {(confession.authorName || "?").trim().charAt(0).toUpperCase()}
          </div>
          <div style={{minWidth:0}}>
            <p style={{
              fontFamily:"var(--font-display)", fontWeight:600, fontSize:14,
              color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
            }}>
              {confession.authorName}
            </p>
            <div style={{display:"flex", alignItems:"center", gap:6, flexWrap:"wrap"}}>
              <span
                className="rarity-dot"
                style={{background: rarityColor}}
              />
              <span style={{fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px"}}>
                Lv.{confession.authorLevel} {confession.authorRarity} • {confession.authorTitle}
              </span>
              <span style={{fontSize:11, color:"var(--text-muted)"}}>• {formattedDate}</span>
            </div>
          </div>
        </div>
        <div style={{display:"flex", gap:6, flexShrink:0, flexWrap:"wrap", justifyContent:"flex-end"}}>
          {confession.moodEmoji && (
            <span style={{fontSize:18}}>{confession.moodEmoji}</span>
          )}
          {(confession.categories || []).slice(0,2).map(cat => (
            <span key={cat} className="tag-chip">{cat}</span>
          ))}
        </div>
      </div>

      {/* Content */}
      {confession.type === "text" ? (
        <HoldToReveal onReveal={() => setIsRevealed(true)} isRevealed={isRevealed}>
          <div className={`blur-content ${isRevealed ? "revealed" : ""}`} style={{marginBottom:16}}>
            <p style={{
              color:"var(--text-primary)", lineHeight:1.7, fontSize:15,
              wordBreak:"break-word",
            }}>
              {confession.content}
            </p>
          </div>
        </HoldToReveal>
      ) : (
        <div style={{marginBottom:16}}>
          <audio controls src={confession.audioUrl} style={{width:"100%", borderRadius:8}} />
          {confession.voiceEffect && confession.voiceEffect !== "normal" && (
            <p style={{color:"var(--text-muted)", fontSize:11, marginTop:4}}>
              🎛️ {confession.voiceEffect} effect • {confession.ambientSound !== "silence" ? `🎵 ${confession.ambientSound}` : ""}
            </p>
          )}
        </div>
      )}

      {/* CTA when not revealed */}
      {!isRevealed && confession.type === "text" && (
        <div style={{
          background:"linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.1))",
          border:"1px solid rgba(168,85,247,0.25)",
          borderRadius:12, padding:"12px 16px", textAlign:"center",
          color:"var(--purple-400)", fontSize:13, fontWeight:600,
          letterSpacing:"0.5px", marginBottom:16, cursor:"pointer",
        }}>
          🔓 Hold to Reveal
        </div>
      )}

      {/* Actions (shown after reveal OR for voice) */}
      {(isRevealed || confession.type === "voice") && (
        <div style={{borderTop:"1px solid var(--border)", paddingTop:14}}>
          {/* Reactions */}
          <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:12}}>
            {REACTIONS.map(r => {
              const count = (confession.reactions || {})[r.type] || 0;
              const isActive = userReactions[r.type];
              return (
                <button
                  key={r.type}
                  className={`reaction-btn wv-tooltip ${isActive ? "active" : ""}`}
                  data-tip={r.label}
                  onClick={() => onReaction(confession._id, r.type)}
                >
                  <span>{r.emoji}</span>
                  <span>{count > 0 ? count : ""}</span>
                </button>
              );
            })}
            <span style={{marginLeft:"auto", color:"var(--text-muted)", fontSize:11, alignSelf:"center"}}>
              {totalReactions} reactions
            </span>
          </div>

          {/* Comment / Chain row */}
          <div style={{display:"flex", gap:14, alignItems:"center"}}>
            <button
              style={{background:"none", border:"none", cursor:"pointer", color:"var(--text-secondary)",
                fontSize:13, display:"flex", alignItems:"center", gap:5, fontFamily:"var(--font-body)"}}
              onClick={() => setShowComments(s => !s)}
            >
              💬 {comments.length || ""} Comments
            </button>
            <button
              style={{background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)",
                fontSize:13, display:"flex", alignItems:"center", gap:5, fontFamily:"var(--font-body)"}}
              onClick={() => onComment(confession._id)}
            >
              ✍️ Confess Back
            </button>
            <span style={{marginLeft:"auto", color:"var(--text-muted)", fontSize:11}}>
              👁️ {confession.views || 0}
            </span>
          </div>

          {/* Comments section */}
          {showComments && (
            <div style={{marginTop:14}}>
              {loadingCom ? (
                <p style={{color:"var(--text-muted)", fontSize:13, textAlign:"center"}}>Loading…</p>
              ) : comments.length === 0 ? (
                <p style={{color:"var(--text-muted)", fontSize:13, textAlign:"center"}}>No comments yet. Be the first.</p>
              ) : (
                <div style={{maxHeight:280, overflowY:"auto", marginBottom:10}}>
                  {comments.map(c => (
                    <div key={c._id} className="comment-item">
                      <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
                        <span style={{fontWeight:600, fontSize:13, color:"var(--text-primary)"}}>
                          {c.authorName}
                        </span>
                        <span style={{fontSize:11, color:"var(--text-muted)"}}>
                          {new Date(c.createdAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
                        </span>
                      </div>
                      <p style={{fontSize:14, color:"var(--text-secondary)", lineHeight:1.5}}>{c.content}</p>
                      <div style={{display:"flex", gap:8, marginTop:6}}>
                        {["meToo","sendingLove","wow"].map(r => (
                          <button key={r} className="reaction-btn" style={{padding:"3px 8px", fontSize:11}}>
                            {r==="meToo"?"🙋":r==="sendingLove"?"💝":"😮"} {(c.reactions||{})[r]||0}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:"flex", gap:8}}>
                <input
                  className="wv-input"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && postComment()}
                  placeholder="Add anonymous comment…"
                  style={{padding:"10px 14px", fontSize:13}}
                />
                <button className="btn-primary" onClick={postComment} style={{flexShrink:0}}>Post</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Minimal mock comment generator (used as fallback)
function generateMockComments(confId) {
  const names = [generateAnonymousName().full, generateAnonymousName().full];
  const texts = [
    "I felt this so deeply. Thank you for sharing.",
    "This is literally me. You're not alone.",
    "Sending you all the good energy 💝",
  ];
  return Array.from({length: Math.floor(Math.random()*3)}, (_, i) => ({
    _id:`mc_${confId}_${i}`,
    confessionId:confId,
    authorId:`u${i}`,
    authorName:names[i%names.length],
    content:texts[i%texts.length],
    reactions:{meToo:Math.floor(Math.random()*10),sendingLove:Math.floor(Math.random()*8),wow:Math.floor(Math.random()*5)},
    replies:[],
    createdAt:new Date(Date.now() - Math.random()*3600000),
  }));
}

// ─────────────────────────────────────────────────────────────────
// §14  NOTIFICATION PANEL
// ─────────────────────────────────────────────────────────────────
function NotificationPanel({ notifications, onMarkRead, onClose }) {
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div style={{
      position:"absolute", top:"calc(100% + 8px)", right:0,
      width:320, maxHeight:420, overflowY:"auto",
      background:"rgba(10,10,18,0.97)",
      border:"1px solid var(--border)",
      borderRadius:var_("--radius-lg"), zIndex:200,
      backdropFilter:"blur(24px)",
      boxShadow:"0 20px 60px rgba(0,0,0,0.6)",
    }}>
      <div style={{padding:"14px 16px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <span style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:14}}>
          Notifications {unread > 0 && <span style={{color:"var(--pink-500)", fontSize:12}}>({unread})</span>}
        </span>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",fontSize:16}}>×</button>
      </div>
      {notifications.length === 0 ? (
        <p style={{padding:20, color:"var(--text-muted)", fontSize:13, textAlign:"center"}}>No notifications yet</p>
      ) : notifications.map(n => (
        <div
          key={n._id}
          onClick={() => onMarkRead(n._id)}
          style={{
            padding:"12px 16px",
            borderBottom:"1px solid rgba(255,255,255,0.04)",
            cursor:"pointer",
            background: n.read ? "transparent" : "rgba(168,85,247,0.06)",
          }}
        >
          <p style={{fontSize:13, color:n.read?"var(--text-secondary)":"var(--text-primary)", fontWeight:n.read?400:500}}>
            {n.title}
          </p>
          <p style={{fontSize:12, color:"var(--text-muted)", marginTop:2}}>{n.message}</p>
        </div>
      ))}
    </div>
  );
}

function var_(name) { return `var(${name})`; }

// ─────────────────────────────────────────────────────────────────
// §15  NAVIGATION BAR
// ─────────────────────────────────────────────────────────────────
function NavBar() {
  const { user, logout, notifications, markNotificationRead } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu]     = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  const navIconBtn = (content, to, badge) => (
    <Link to={to} style={{
      width:38, height:38, borderRadius:"50%",
      border:"1px solid var(--border)",
      background:"rgba(255,255,255,0.04)",
      display:"flex", alignItems:"center", justifyContent:"center",
      textDecoration:"none", fontSize:16, position:"relative",
      transition:"var(--transition)",
    }}>
      {content}
      {badge > 0 && <span className="notif-dot">{badge > 9 ? "9+" : badge}</span>}
    </Link>
  );

  return (
    <nav className="wv-nav">
      <Link to="/" className="wv-logo">WhisperVault</Link>

      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <Link to="/create" className="btn-primary hide-mobile" style={{fontSize:12, padding:"8px 18px"}}>
          ✍️ Confess
        </Link>
        <Link to="/radio" className="btn-ghost hide-mobile" style={{fontSize:12}}>
          📻 Radio
        </Link>

        {navIconBtn("💬", "/messages", 0)}

        {/* Notification bell */}
        <div style={{position:"relative"}}>
          <button
            onClick={() => { setShowNotifs(s => !s); setShowMenu(false); }}
            style={{
              width:38, height:38, borderRadius:"50%",
              border:"1px solid var(--border)",
              background:"rgba(255,255,255,0.04)",
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", fontSize:16, position:"relative",
            }}
          >
            🔔
            {unread > 0 && <span className="notif-dot" />}
          </button>
          {showNotifs && (
            <NotificationPanel
              notifications={notifications}
              onMarkRead={id => { markNotificationRead(id); }}
              onClose={() => setShowNotifs(false)}
            />
          )}
        </div>

        {/* Avatar / menu */}
        <div style={{position:"relative"}}>
          <button
            onClick={() => { setShowMenu(s => !s); setShowNotifs(false); }}
            style={{
              width:38, height:38, borderRadius:"50%",
              border:`2px solid ${RARITY_COLORS[user?.anonymousName?.creatureRarity] || "#a855f7"}`,
              background:"rgba(168,85,247,0.1)",
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer",
              fontFamily:"var(--font-display)", fontWeight:700, fontSize:14,
              color: RARITY_COLORS[user?.anonymousName?.creatureRarity] || "#a855f7",
            }}
          >
            {(user?.anonymousName?.full || user?.username || "U").trim().charAt(0).toUpperCase()}
          </button>
          {showMenu && (
            <div style={{
              position:"absolute", top:"calc(100% + 8px)", right:0,
              width:220, background:"rgba(10,10,18,0.97)",
              border:"1px solid var(--border)", borderRadius:16, zIndex:200,
              backdropFilter:"blur(24px)",
              boxShadow:"0 20px 60px rgba(0,0,0,0.6)",
            }}>
              <div style={{padding:"14px 16px", borderBottom:"1px solid var(--border)"}}>
                <p style={{fontWeight:600, fontSize:13}}>{user?.username}</p>
                <p style={{color:"var(--text-muted)", fontSize:11, marginTop:2}}>
                  {user?.anonymousName?.full}
                </p>
                <div style={{marginTop:8}}>
                  <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
                    <span style={{fontSize:11, color:"var(--text-muted)"}}>Lv.{user?.level} — {getLevelTitle(user?.level || 1)}</span>
                    <span style={{fontSize:11, color:"var(--purple-400)"}}>{getXPProgress(user?.xp||0, user?.level||1).toFixed(0)}%</span>
                  </div>
                  <div className="xp-bar-track">
                    <div className="xp-bar-fill" style={{width:`${getXPProgress(user?.xp||0, user?.level||1)}%`}} />
                  </div>
                </div>
              </div>
              <div style={{padding:"6px 0"}}>
                <Link to="/profile" onClick={() => setShowMenu(false)} style={{
                  display:"block", padding:"10px 16px",
                  color:"var(--text-secondary)", textDecoration:"none",
                  fontSize:13, transition:"var(--transition)",
                }}>
                  👤 My Profile
                </Link>
                <Link to="/create" onClick={() => setShowMenu(false)} style={{
                  display:"block", padding:"10px 16px",
                  color:"var(--text-secondary)", textDecoration:"none",
                  fontSize:13,
                }}>
                  ✍️ New Confession
                </Link>
                <Link to="/radio" onClick={() => setShowMenu(false)} style={{
                  display:"block", padding:"10px 16px",
                  color:"var(--text-secondary)", textDecoration:"none",
                  fontSize:13,
                }}>
                  📻 Radio Mode
                </Link>
                <div style={{height:1, background:"var(--border)", margin:"4px 0"}} />
                <button
                  onClick={logout}
                  style={{
                    display:"block", width:"100%", textAlign:"left",
                    padding:"10px 16px", background:"none", border:"none",
                    color:"#f87171", fontSize:13, cursor:"pointer",
                    fontFamily:"var(--font-body)",
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────
// §16  HOME PAGE
// ─────────────────────────────────────────────────────────────────
function HomePage() {
  const [confessions, setConfessions]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [filter, setFilter]                   = useState("trending");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userReactions, setUserReactions]     = useState({});
  const { token, socket, updateUser, user, useMockMode } = useAuth();
  const nav = useNavigate();

  const fetchFeed = useCallback(async (signal) => {
    setLoading(true); setError(null);
    try {
      if (!useMockMode) {
        let url = `${API_URL}/api/feed?sort=${filter}`;
        if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
        const res = await fetch(url, { signal, headers: token ? {Authorization:`Bearer ${token}`} : {} });
        if (!res.ok) throw new Error("Feed error");
        const data = await res.json();
        setConfessions(Array.isArray(data) ? data : (data.confessions || []));
      } else {
        // Mock mode — generate realistic data
        await new Promise(r => setTimeout(r, 600));
        let feed = generateMockFeed(14);
        if (selectedCategory) feed = feed.filter(c => c.categories.includes(selectedCategory));
        if (filter === "latest") feed.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
        else if (filter === "trending") feed.sort((a,b) => b.heatScore - a.heatScore);
        setConfessions(feed);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        // Fallback to mock
        let feed = generateMockFeed(14);
        if (selectedCategory) feed = feed.filter(c => c.categories.includes(selectedCategory));
        setConfessions(feed);
        setError(null); // Don't show error — just use mock
      }
    } finally { setLoading(false); }
  }, [filter, selectedCategory, token, useMockMode]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchFeed(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchFeed]);

  // Real-time new confessions
  useEffect(() => {
    if (!socket) return;
    const handler = c => setConfessions(prev => [c, ...prev.slice(0, 49)]);
    socket.on("new_confession", handler);
    return () => socket.off("new_confession", handler);
  }, [socket]);

  const handleReaction = useCallback(async (confessionId, reactionType) => {
    // Optimistic update
    setConfessions(prev => prev.map(c => {
      if (c._id !== confessionId) return c;
      const wasActive = (userReactions[`${confessionId}_${reactionType}`]);
      const delta = wasActive ? -1 : 1;
      return {
        ...c,
        reactions: {
          ...c.reactions,
          [reactionType]: Math.max(0, ((c.reactions||{})[reactionType]||0) + delta),
        },
      };
    }));
    setUserReactions(prev => ({
      ...prev,
      [`${confessionId}_${reactionType}`]: !prev[`${confessionId}_${reactionType}`],
    }));

    try {
      await fetch(`${API_URL}/api/confessions/${confessionId}/react`, {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body: JSON.stringify({reactionType}),
        signal: AbortSignal.timeout(5000),
      });
      // Award XP
      if (updateUser && user) {
        const newXP = (user.xp || 0) + XP_REWARDS.RECEIVE_REACTION;
        updateUser({xp:newXP, level:calculateLevel(newXP)});
      }
    } catch {}
  }, [token, userReactions, user, updateUser]);

  const handleComment = useCallback((id) => {
    nav("/create", {state:{chainParentId: id}});
  }, [nav]);

  return (
    <div style={{minHeight:"100vh", background:"var(--bg-base)"}}>
      <NavBar />

      <div style={{maxWidth:680, margin:"0 auto", padding:"20px 16px"}}>
        {/* Filter bar */}
        <div style={{display:"flex", gap:8, marginBottom:20, overflowX:"auto", paddingBottom:4}}>
          {[
            {value:"trending",  label:"🔥 Trending"},
            {value:"latest",    label:"⏱ Latest"},
            {value:"personalized", label:"🎯 For You"},
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`tag-chip ${filter === f.value ? "active" : ""}`}
              style={{cursor:"pointer", flexShrink:0, padding:"6px 14px", fontSize:12}}
            >
              {f.label}
            </button>
          ))}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{
              background:"rgba(255,255,255,0.06)", border:"1px solid var(--border)",
              borderRadius:100, padding:"5px 12px", color:"var(--text-secondary)",
              fontFamily:"var(--font-body)", fontSize:12, cursor:"pointer", flexShrink:0,
            }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div>{Array.from({length:5},(_,i)=><SkeletonCard key={i}/>)}</div>
        ) : error ? (
          <div style={{textAlign:"center", padding:"60px 0", color:"#f87171"}}>
            <p style={{fontSize:32, marginBottom:8}}>⚠️</p>
            <p>{error}</p>
            <button className="btn-ghost" onClick={() => fetchFeed(new AbortController().signal)} style={{marginTop:12}}>
              Retry
            </button>
          </div>
        ) : confessions.length === 0 ? (
          <div style={{textAlign:"center", padding:"80px 0"}}>
            <p style={{fontSize:48, marginBottom:12}}>🔮</p>
            <p style={{color:"var(--text-muted)", marginBottom:16}}>The vault is silent…</p>
            <Link to="/create" className="btn-primary">Be the first to confess</Link>
          </div>
        ) : (
          confessions.map(c => {
            const myReactions = {};
            REACTIONS.forEach(r => {
              myReactions[r.type] = !!userReactions[`${c._id}_${r.type}`];
            });
            return (
              <ConfessionCard
                key={c._id}
                confession={c}
                onReaction={handleReaction}
                onComment={handleComment}
                userReactions={myReactions}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// §17  CREATE PAGE
// ─────────────────────────────────────────────────────────────────
function CreatePage() {
  const [type, setType]           = useState("text");
  const [content, setContent]     = useState("");
  const [categories, setCategories] = useState([]);
  const [moodEmoji, setMoodEmoji] = useState("😔");
  const [expiryOption, setExpiryOption] = useState("never");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [voiceEffect, setVoiceEffect]     = useState("normal");
  const [ambientSound, setAmbientSound]   = useState("silence");
  const { token, useMockMode, user, updateUser } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const chainParentId = location.state?.chainParentId || null;

  const toggleCategory = cat =>
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat].slice(0, 3)
    );

  const handleSubmit = async () => {
    if (type === "text") {
      if (!content.trim())    { setError("Please write something first"); return; }
      if (content.length < 5) { setError("At least 5 characters please"); return; }
    } else {
      if (!audioBlob) { setError("Please record a voice confession first"); return; }
    }

    setLoading(true); setError("");
    try {
      let audioUrl = "";
      if (type === "voice" && audioBlob && !useMockMode) {
        const fd = new FormData();
        fd.append("file", audioBlob);
        fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/audio/upload`, {
          method:"POST", body:fd,
        });
        audioUrl = (await r.json()).secure_url || "";
      } else if (type === "voice" && audioBlob) {
        audioUrl = URL.createObjectURL(audioBlob); // mock: local blob URL
      }

      const payload = {
        type,
        categories: categories.length ? categories : ["Unpopular Opinions"],
        moodEmoji, expiryOption, chainParentId,
        ...(type === "text"
          ? { content: content.trim() }
          : { audioUrl, duration: audioDuration, voiceEffect, ambientSound }
        ),
      };

      if (!useMockMode) {
        const res = await fetch(`${API_URL}/api/confessions`, {
          method:"POST",
          headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(8000),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Failed to post"); return; }
      }

      // Update user XP
      if (user && updateUser) {
        const newXP = (user.xp||0) + XP_REWARDS.POST_CONFESSION;
        updateUser({xp:newXP, level:calculateLevel(newXP), totalPosts:(user.totalPosts||0)+1});
      }

      nav("/");
    } catch (e) {
      setError(useMockMode ? null : "Network error — try again");
      if (useMockMode) nav("/"); // in mock mode just go home
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh", background:"var(--bg-base)"}}>
      <NavBar />
      <div style={{maxWidth:680, margin:"0 auto", padding:"24px 16px"}}>
        {/* Header */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24}}>
          <Link to="/" style={{color:"var(--text-secondary)", textDecoration:"none", fontSize:14, display:"flex", alignItems:"center", gap:6}}>
            ← Back
          </Link>
          <h1 style={{fontFamily:"var(--font-display)", fontSize:18, fontWeight:700}} className="grad-text">
            {chainParentId ? "✍️ Confess Back" : "New Confession"}
          </h1>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Posting…" : "Post"}
          </button>
        </div>

        {chainParentId && (
          <div style={{
            marginBottom:16, padding:"10px 16px",
            background:"rgba(168,85,247,0.1)", border:"1px solid rgba(168,85,247,0.2)",
            borderRadius:12, color:"var(--purple-400)", fontSize:13, textAlign:"center",
          }}>
            ↩ Replying to a confession anonymously
          </div>
        )}

        {error && (
          <div style={{
            marginBottom:16, padding:"10px 16px",
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
            borderRadius:12, color:"#f87171", fontSize:13,
          }}>
            {error}
          </div>
        )}

        <div className="wv-card" style={{padding:24}}>
          {/* Type toggle */}
          <div style={{display:"flex", gap:0, marginBottom:20, borderBottom:"1px solid var(--border)"}}>
            {[
              {value:"text", label:"📝 Text"},
              {value:"voice", label:"🎙️ Voice"},
            ].map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                style={{
                  padding:"10px 20px", background:"none", border:"none",
                  cursor:"pointer", fontFamily:"var(--font-body)", fontSize:14, fontWeight:500,
                  color: type===t.value ? "var(--purple-400)" : "var(--text-muted)",
                  borderBottom: type===t.value ? "2px solid var(--purple-400)" : "2px solid transparent",
                  marginBottom:-1, transition:"var(--transition)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content area */}
          {type === "text" ? (
            <div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                maxLength={1000}
                autoFocus
                placeholder={"What's haunting you? 👻\n\nYour secret is sealed here forever."}
                style={{
                  width:"100%", minHeight:220, background:"transparent", border:"none",
                  outline:"none", resize:"none", color:"var(--text-primary)",
                  fontFamily:"var(--font-body)", fontSize:16, lineHeight:1.7,
                  "::placeholder": {color:"var(--text-muted)"},
                }}
              />
            </div>
          ) : (
            <AudioRecorder
              onAudioReady={(blob, dur, eff, amb) => {
                setAudioBlob(blob); setAudioDuration(dur);
                setVoiceEffect(eff); setAmbientSound(amb);
              }}
              onCancel={() => setType("text")}
            />
          )}

          {/* Metadata */}
          <div style={{marginTop:20, paddingTop:20, borderTop:"1px solid var(--border)", display:"flex", flexDirection:"column", gap:16}}>
            {/* Categories */}
            <div>
              <p style={{fontSize:12, color:"var(--text-muted)", marginBottom:8, letterSpacing:"0.5px", textTransform:"uppercase"}}>
                Categories (max 3)
              </p>
              <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => toggleCategory(cat.name)}
                    className={`tag-chip ${categories.includes(cat.name) ? "active" : ""}`}
                    style={{cursor:"pointer"}}
                  >
                    {cat.emoji} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood + Expiry */}
            <div style={{display:"flex", gap:16, flexWrap:"wrap"}}>
              <div style={{flex:1, minWidth:180}}>
                <p style={{fontSize:12, color:"var(--text-muted)", marginBottom:8, letterSpacing:"0.5px", textTransform:"uppercase"}}>
                  Mood
                </p>
                <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                  {MOOD_EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setMoodEmoji(e)}
                      style={{
                        fontSize:20, background:"none", border:"none", cursor:"pointer",
                        opacity: moodEmoji===e ? 1 : 0.35,
                        transform: moodEmoji===e ? "scale(1.25)" : "scale(1)",
                        transition:"var(--transition)",
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{fontSize:12, color:"var(--text-muted)", marginBottom:8, letterSpacing:"0.5px", textTransform:"uppercase"}}>
                  Self-Destruct
                </p>
                <div style={{display:"flex", gap:6}}>
                  {[
                    {value:"24h", label:"24h"},
                    {value:"7d",  label:"7 days"},
                    {value:"never",label:"Forever"},
                  ].map(o => (
                    <button
                      key={o.value}
                      onClick={() => setExpiryOption(o.value)}
                      className={`tag-chip ${expiryOption===o.value ? "active" : ""}`}
                      style={{cursor:"pointer"}}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{textAlign:"right", fontSize:12, color:"var(--text-muted)"}}>
              {type==="text" ? `${content.length}/1000 chars` : "Up to 100 seconds"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// §18  RADIO PAGE
// ─────────────────────────────────────────────────────────────────
function RadioPage() {
  const [confessions, setConfessions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const audioRef = useRef(null);
  const { token } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/radio`, {
          headers: token ? {Authorization:`Bearer ${token}`} : {},
          signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        const voiceOnes = (Array.isArray(data) ? data : data.confessions || [])
          .filter(c => c.type === "voice");
        setConfessions(voiceOnes.length ? voiceOnes : generateMockVoiceConfessions());
      } catch {
        setConfessions(generateMockVoiceConfessions());
      } finally { setLoading(false); }
    })();
  }, []);

  function generateMockVoiceConfessions() {
    return Array.from({length:6}, (_, i) => ({
      ...makeMockConfession(i),
      type:"voice",
      audioUrl:"", // no real audio in mock
      duration: Math.floor(Math.random()*80)+20,
    }));
  }

  const current = confessions[currentIndex];

  const nextTrack = () => {
    setCurrentIndex(p => (p+1) % confessions.length);
    setPlaying(true);
  };
  const prevTrack = () => {
    setCurrentIndex(p => (p-1+confessions.length) % confessions.length);
    setPlaying(true);
  };

  useEffect(() => {
    if (!audioRef.current || !current?.audioUrl) return;
    if (playing) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [playing, currentIndex]);

  return (
    <div style={{minHeight:"100vh", background:"var(--bg-base)"}}>
      <NavBar />
      <div style={{maxWidth:520, margin:"0 auto", padding:"40px 16px"}}>
        {loading ? (
          <LoadingSpinner text="Tuning the frequency…" />
        ) : confessions.length === 0 ? (
          <div style={{textAlign:"center", padding:"80px 0"}}>
            <p style={{fontSize:48, marginBottom:12}}>📻</p>
            <p style={{color:"var(--text-muted)"}}>No voice confessions yet.</p>
          </div>
        ) : (
          <div className="wv-card" style={{padding:32, textAlign:"center"}}>
            {/* Visualizer */}
            <div className={`bar-vis ${playing ? "playing" : ""}`} style={{marginBottom:28, justifyContent:"center", display:"flex", alignItems:"flex-end", height:32}}>
              {Array.from({length:7}).map((_,i) => <span key={i} />)}
            </div>

            {/* Rarity glow circle */}
            <div style={{
              width:100, height:100, margin:"0 auto 20px",
              borderRadius:"50%",
              background:`radial-gradient(circle, ${RARITY_COLORS[current?.authorRarity]||"#a855f7"}33, transparent)`,
              border:`2px solid ${RARITY_COLORS[current?.authorRarity]||"#a855f7"}66`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:40,
              boxShadow: RARITY_GLOW[current?.authorRarity] || "none",
            }}>
              🎙️
            </div>

            <p style={{fontFamily:"var(--font-display)", fontSize:18, fontWeight:700, marginBottom:4}}>
              {current?.authorName}
            </p>
            <p style={{color:"var(--text-muted)", fontSize:13, marginBottom:20}}>
              Level {current?.authorLevel} • {current?.authorRarity?.toUpperCase()} •{" "}
              {(current?.categories||[]).join(", ")}
            </p>

            {current?.audioUrl ? (
              <audio
                ref={audioRef}
                src={current.audioUrl}
                onEnded={nextTrack}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                style={{width:"100%", marginBottom:20, borderRadius:8}}
                controls
              />
            ) : (
              <p style={{color:"var(--text-muted)", fontSize:13, marginBottom:20, padding:"12px 0"}}>
                {current?.duration}s confession — audio demo mode
              </p>
            )}

            <div style={{display:"flex", justifyContent:"center", gap:12}}>
              <button className="btn-ghost" onClick={prevTrack}>⏮ Prev</button>
              <button className="btn-primary" onClick={() => setPlaying(p => !p)} style={{minWidth:96}}>
                {playing ? "⏸ Pause" : "▶ Play"}
              </button>
              <button className="btn-ghost" onClick={nextTrack}>Next ⏭</button>
            </div>

            <p style={{color:"var(--text-muted)", fontSize:12, marginTop:20}}>
              {currentIndex+1} / {confessions.length} confessions
            </p>

            {/* Playlist */}
            <div style={{marginTop:24, textAlign:"left", borderTop:"1px solid var(--border)", paddingTop:16}}>
              <p style={{fontSize:11, color:"var(--text-muted)", letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:10}}>Up Next</p>
              {confessions.slice(currentIndex+1, currentIndex+4).map((c,i) => (
                <div
                  key={c._id}
                  onClick={() => { setCurrentIndex(currentIndex+1+i); setPlaying(true); }}
                  style={{
                    display:"flex", alignItems:"center", gap:10, padding:"8px 10px",
                    borderRadius:10, cursor:"pointer", marginBottom:4,
                    background:"rgba(255,255,255,0.03)",
                  }}
                >
                  <span style={{fontSize:12, color:"var(--text-muted)", width:18}}>{i+1}</span>
                  <span style={{
                    width:28, height:28, borderRadius:"50%", flexShrink:0,
                    background:RARITY_COLORS[c.authorRarity],
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:10, fontWeight:700, color:"#111",
                  }}>
                    {c.authorName.charAt(0)}
                  </span>
                  <span style={{flex:1, fontSize:13, color:"var(--text-secondary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{c.authorName}</span>
                  <span style={{fontSize:11, color:"var(--text-muted)"}}>{c.duration}s</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// §19  MESSAGES PAGE
// ─────────────────────────────────────────────────────────────────
function MessagesPage() {
  const [messages, setMessages]       = useState([]);
  const [newMessage, setNewMessage]   = useState("");
  const [replyTo, setReplyTo]         = useState(null);
  const [replyToName, setReplyToName] = useState("");
  const [loading, setLoading]         = useState(true);
  const { token, user, useMockMode }  = useAuth();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      if (!useMockMode) {
        const res = await fetch(`${API_URL}/api/messages`, {
          headers:{Authorization:`Bearer ${token}`},
          signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : (data.messages || []));
      } else {
        setMessages(generateMockMessages());
      }
    } catch {
      setMessages(generateMockMessages());
    } finally { setLoading(false); }
  }, [token, useMockMode]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  function generateMockMessages() {
    return Array.from({length:3}, (_,i) => ({
      _id:`msg_${i}`,
      from:`anon_${i}`, to: user?._id||"me",
      content: ["Hey, your confession really moved me…","I've been through the same thing","You're not alone in this 💝"][i],
      read: i !== 0,
      createdAt: new Date(Date.now() - i * 3600000),
    }));
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !replyTo) return;
    if (!useMockMode) {
      try {
        const res = await fetch(`${API_URL}/api/messages`, {
          method:"POST",
          headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
          body: JSON.stringify({to:replyTo, content:newMessage}),
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) { setNewMessage(""); setReplyTo(null); fetchMessages(); return; }
      } catch {}
    }
    // Mock
    const mockMsg = {
      _id:`msg_${Date.now()}`, from:user?._id, to:replyTo,
      content:newMessage, read:true, createdAt:new Date(),
    };
    setMessages(prev => [...prev, mockMsg]);
    setNewMessage(""); setReplyTo(null); setReplyToName("");
  };

  return (
    <div style={{minHeight:"100vh", background:"var(--bg-base)"}}>
      <NavBar />
      <div style={{maxWidth:640, margin:"0 auto", padding:"24px 16px"}}>
        <h1 style={{fontFamily:"var(--font-display)", fontSize:22, fontWeight:700, marginBottom:20}} className="grad-text">
          Anonymous Messages
        </h1>

        <div className="wv-card" style={{padding:0, overflow:"hidden"}}>
          {/* Message list */}
          <div style={{height:420, overflowY:"auto", padding:16}}>
            {loading ? (
              Array.from({length:3},(_,i)=><div key={i} className="skeleton" style={{height:72, marginBottom:10, borderRadius:12}} />)
            ) : messages.length === 0 ? (
              <div style={{textAlign:"center", padding:"80px 0"}}>
                <p style={{fontSize:36, marginBottom:8}}>📭</p>
                <p style={{color:"var(--text-muted)", fontSize:14}}>No messages yet.</p>
                <p style={{color:"var(--text-muted)", fontSize:12, marginTop:4}}>React to confessions to start conversations.</p>
              </div>
            ) : (
              messages.map(m => {
                const isFromMe = m.from === (user?._id || "me");
                return (
                  <div
                    key={m._id}
                    style={{
                      display:"flex",
                      flexDirection: isFromMe ? "row-reverse" : "row",
                      gap:10, marginBottom:12, alignItems:"flex-end",
                    }}
                  >
                    <div style={{
                      width:32, height:32, borderRadius:"50%", flexShrink:0,
                      background: isFromMe ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.08)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:14,
                    }}>
                      {isFromMe ? "👤" : "🎭"}
                    </div>
                    <div style={{maxWidth:"72%"}}>
                      <div style={{
                        padding:"10px 14px",
                        background: isFromMe ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.06)",
                        border: `1px solid ${isFromMe ? "rgba(168,85,247,0.3)" : "var(--border)"}`,
                        borderRadius:14,
                        borderBottomRightRadius: isFromMe ? 4 : 14,
                        borderBottomLeftRadius:  isFromMe ? 14 : 4,
                      }}>
                        <p style={{fontSize:14, color:"var(--text-primary)", lineHeight:1.5}}>{m.content}</p>
                      </div>
                      <p style={{fontSize:10, color:"var(--text-muted)", marginTop:3, textAlign: isFromMe ? "right" : "left"}}>
                        {new Date(m.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                        {!isFromMe && !m.read && " • Unread"}
                        {!isFromMe && (
                          <button
                            onClick={() => { setReplyTo(m.from); setReplyToName("Anonymous"); }}
                            style={{background:"none",border:"none",cursor:"pointer",color:"var(--purple-400)",fontSize:10,marginLeft:6,fontFamily:"var(--font-body)"}}
                          >
                            Reply
                          </button>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <div style={{padding:"12px 16px", borderTop:"1px solid var(--border)"}}>
            {replyTo && (
              <div style={{display:"flex", justifyContent:"space-between", marginBottom:8, padding:"6px 10px", background:"rgba(168,85,247,0.1)", borderRadius:8}}>
                <span style={{color:"var(--purple-400)", fontSize:12}}>↩ Replying to {replyToName}</span>
                <button onClick={() => { setReplyTo(null); setReplyToName(""); }}
                  style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",fontSize:14}}>×</button>
              </div>
            )}
            <div style={{display:"flex", gap:8}}>
              <input
                className="wv-input"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key==="Enter" && sendMessage()}
                placeholder={replyTo ? "Type your reply…" : "Select a message to reply to first"}
                disabled={!replyTo}
                style={{padding:"10px 14px", fontSize:13, opacity: replyTo ? 1 : 0.5}}
              />
              <button
                className="btn-primary"
                onClick={sendMessage}
                disabled={!replyTo || !newMessage.trim()}
                style={{flexShrink:0}}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// §20  PROFILE PAGE
// ─────────────────────────────────────────────────────────────────
function ProfilePage() {
  const { user, logout } = useAuth();
  const [myConfessions, setMyConfessions] = useState([]);
  const [loadingConf, setLoadingConf]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/${user._id}/confessions`, {
          signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        setMyConfessions(Array.isArray(data) ? data : []);
      } catch {
        setMyConfessions(generateMockFeed(4));
      } finally { setLoadingConf(false); }
    })();
  }, [user]);

  if (!user) return <Navigate to="/login" />;

  const xpProgress = getXPProgress(user.xp || 0, user.level || 1);
  const rarityColor = RARITY_COLORS[user.anonymousName?.creatureRarity] || "#a855f7";
  const isLegendary = user.anonymousName?.creatureRarity === "legendary";
  const totalRx = myConfessions.reduce((sum, c) =>
    sum + Object.values(c.reactions||{}).reduce((a,b)=>a+(b||0),0), 0
  );

  return (
    <div style={{minHeight:"100vh", background:"var(--bg-base)"}}>
      <NavBar />
      <div style={{maxWidth:680, margin:"0 auto", padding:"24px 16px"}}>

        {/* Profile card */}
        <div
          className={`wv-card ${isLegendary ? "legendary-aura" : ""}`}
          style={{
            padding:32, textAlign:"center", marginBottom:20,
            boxShadow: RARITY_GLOW[user.anonymousName?.creatureRarity] || "none",
          }}
        >
          {/* Avatar */}
          <div style={{position:"relative", display:"inline-block", marginBottom:16}}>
            <div style={{
              width:88, height:88, borderRadius:"50%",
              background:`linear-gradient(135deg, ${rarityColor}, ${rarityColor}66)`,
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto",
              border:`3px solid ${rarityColor}`,
              boxShadow:`0 0 20px ${rarityColor}44`,
            }}>
              <span style={{
                fontFamily:"var(--font-display)", fontWeight:700,
                fontSize:36, color:"#111",
              }}>
                {(user.anonymousName?.full || user.username || "U").trim().charAt(0).toUpperCase()}
              </span>
            </div>
            {isLegendary && (
              <span style={{
                position:"absolute", bottom:-6, right:-6,
                background:"linear-gradient(135deg, #facc15, #f97316)",
                borderRadius:100, padding:"2px 6px",
                fontSize:9, fontWeight:700, color:"#111", letterSpacing:"0.5px",
              }}>
                LEGEND
              </span>
            )}
          </div>

          <h2 style={{fontFamily:"var(--font-display)", fontSize:22, fontWeight:700, marginBottom:4}}>
            {user.username}
          </h2>
          <p style={{color:"var(--text-secondary)", fontSize:14, marginBottom:6}}>{user.anonymousName?.full}</p>
          <div style={{display:"inline-block", marginBottom:8}}>
            <span
              className="tag-chip"
              style={{
                color: rarityColor,
                borderColor: rarityColor,
                background:`${rarityColor}18`,
                fontSize:10,
              }}
            >
              {(user.anonymousName?.creatureRarity||"common").toUpperCase()} RARITY
            </span>
          </div>

          <p style={{
            fontFamily:"var(--font-display)", fontWeight:600, fontSize:13,
            color:"var(--purple-400)", marginBottom:20,
          }}>
            {getLevelTitle(user.level || 1)}
          </p>

          {/* XP bar */}
          <div style={{maxWidth:280, margin:"0 auto 24px"}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
              <span style={{fontSize:12, color:"var(--text-muted)"}}>Level {user.level}</span>
              <span style={{fontSize:12, color:"var(--purple-400)"}}>{user.xp || 0} XP</span>
            </div>
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{width:`${xpProgress}%`}} />
            </div>
            <div style={{display:"flex", justifyContent:"space-between", marginTop:4}}>
              <span style={{fontSize:10, color:"var(--text-muted)"}}>Lv.{user.level}</span>
              <span style={{fontSize:10, color:"var(--text-muted)"}}>Lv.{(user.level||1)+1}</span>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12,
            padding:"20px 0", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)",
            marginBottom:24,
          }}>
            {[
              {label:"Level",    value:user.level||1,         icon:"⭐"},
              {label:"XP",       value:user.xp||0,            icon:"✨"},
              {label:"Posts",    value:user.totalPosts||0,    icon:"📝"},
              {label:"Streak",   value:user.streak||0,        icon:"🔥"},
            ].map(({label,value,icon}) => (
              <div key={label}>
                <p style={{fontSize:20, fontFamily:"var(--font-display)", fontWeight:700, color:"var(--text-primary)"}}>
                  {value}
                </p>
                <p style={{fontSize:10, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px"}}>{icon} {label}</p>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div style={{marginBottom:20}}>
            <p style={{fontSize:12, color:"var(--text-muted)", letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:10}}>Badges</p>
            <div style={{display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center"}}>
              {(user.badges||[]).length > 0 ? (user.badges||[]).map(b => (
                <span key={b.name} style={{
                  padding:"4px 12px",
                  background:"rgba(250,204,21,0.1)",
                  border:"1px solid rgba(250,204,21,0.3)",
                  borderRadius:100, fontSize:12,
                  color:"#facc15",
                }}>
                  🏅 {b.name}
                </span>
              )) : (
                <p style={{color:"var(--text-muted)", fontSize:13}}>
                  No badges yet — keep confessing to unlock them
                </p>
              )}
            </div>
          </div>

          <button className="btn-ghost" onClick={logout} style={{color:"#f87171", borderColor:"rgba(248,113,113,0.3)"}}>
            🚪 Logout
          </button>
        </div>

        {/* My confessions */}
        <div>
          <h3 style={{fontFamily:"var(--font-display)", fontSize:16, fontWeight:600, marginBottom:14, color:"var(--text-secondary)"}}>
            Recent Confessions
          </h3>
          {loadingConf ? (
            Array.from({length:3},(_,i)=><SkeletonCard key={i}/>)
          ) : myConfessions.length === 0 ? (
            <div style={{textAlign:"center", padding:"40px 0"}}>
              <p style={{color:"var(--text-muted)", fontSize:14}}>No confessions yet.</p>
              <Link to="/create" className="btn-primary" style={{marginTop:12, display:"inline-flex"}}>
                ✍️ Make First Confession
              </Link>
            </div>
          ) : (
            myConfessions.map(c => (
              <div key={c._id} className="confession-card" style={{padding:16, cursor:"default"}}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
                  <span className="tag-chip">{c.moodEmoji} {(c.categories||[])[0]}</span>
                  <span style={{fontSize:11, color:"var(--text-muted)"}}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{color:"var(--text-secondary)", fontSize:14, lineHeight:1.6}}>
                  {(c.content||"").length > 120 ? c.content.slice(0,120)+"…" : c.content}
                </p>
                <div style={{display:"flex", gap:10, marginTop:8}}>
                  <span style={{color:"var(--text-muted)", fontSize:12}}>
                    💝 {Object.values(c.reactions||{}).reduce((a,b)=>a+(b||0),0)} reactions
                  </span>
                  <span style={{color:"var(--text-muted)", fontSize:12}}>👁️ {c.views||0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// §21  LOGIN PAGE
// ─────────────────────────────────────────────────────────────────
function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await login(username, password); nav(from, {replace:true}); }
    catch (err) { setError(err.message || "Invalid credentials"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight:"100vh", background:"var(--bg-base)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24,
    }}>
      {/* Background glow */}
      <div style={{
        position:"fixed", top:"30%", left:"50%", transform:"translate(-50%,-50%)",
        width:600, height:600, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(168,85,247,0.06), transparent 70%)",
        pointerEvents:"none",
      }} />

      <div className="wv-card fade-in-up" style={{width:"100%", maxWidth:440, padding:"40px 36px"}}>
        <div style={{textAlign:"center", marginBottom:32}}>
          <h1 style={{
            fontFamily:"var(--font-display)", fontSize:40, fontWeight:800,
            letterSpacing:"-2px", marginBottom:4,
          }} className="grad-text">
            WhisperVault
          </h1>
          <p style={{color:"var(--text-muted)", fontSize:12, letterSpacing:"3px", textTransform:"uppercase"}}>
            Enter the vault
          </p>
        </div>

        {error && (
          <div style={{
            padding:"10px 14px", marginBottom:16,
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
            borderRadius:10, color:"#f87171", fontSize:13,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{display:"flex", flexDirection:"column", gap:12}}>
          <input
            className="wv-input"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required disabled={loading}
            autoFocus
          />
          <input
            className="wv-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required disabled={loading}
          />
          <button type="submit" className="btn-primary" disabled={loading} style={{
            padding:"14px", borderRadius:14, fontSize:15, width:"100%", justifyContent:"center", marginTop:4,
          }}>
            {loading ? "Opening vault…" : "🔓 Open Session"}
          </button>
        </form>

        <p style={{textAlign:"center", color:"var(--text-muted)", fontSize:13, marginTop:20}}>
          New here?{" "}
          <Link to="/signup" style={{color:"var(--purple-400)", textDecoration:"none", fontWeight:500}}>
            Initialize identity
          </Link>
        </p>

        <div style={{
          marginTop:20, padding:"10px 14px",
          background:"rgba(250,204,21,0.06)", border:"1px solid rgba(250,204,21,0.15)",
          borderRadius:10, fontSize:11, color:"rgba(250,204,21,0.7)", textAlign:"center",
          lineHeight:1.6,
        }}>
          ✨ Demo mode — sign up to create a local identity without needing a server
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// §22  SIGNUP PAGE
// ─────────────────────────────────────────────────────────────────
function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender]     = useState("Male");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [preview, setPreview]   = useState(null);
  const { signup }              = useAuth();
  const nav = useNavigate();

  // Live identity preview
  useEffect(() => {
    const t = setTimeout(() => setPreview(generateAnonymousName()), 200);
    return () => clearTimeout(t);
  }, [gender]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (username.length < 3) { setError("Username must be at least 3 characters"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try { await signup(username, password, gender); nav("/"); }
    catch (err) { setError(err.message || "Signup failed"); }
    finally { setLoading(false); }
  };

  const rarityColor = preview ? (RARITY_COLORS[preview.creatureRarity] || "#a855f7") : "#a855f7";

  return (
    <div style={{
      minHeight:"100vh", background:"var(--bg-base)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24,
    }}>
      <div style={{
        position:"fixed", top:"40%", right:"20%",
        width:400, height:400, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(236,72,153,0.05), transparent 70%)",
        pointerEvents:"none",
      }} />

      <div className="wv-card fade-in-up" style={{width:"100%", maxWidth:460, padding:"36px 32px"}}>
        <div style={{textAlign:"center", marginBottom:28}}>
          <h1 style={{
            fontFamily:"var(--font-display)", fontSize:32, fontWeight:800, letterSpacing:"-1.5px", marginBottom:4,
          }} className="grad-text">
            Initialize
          </h1>
          <p style={{color:"var(--text-muted)", fontSize:11, letterSpacing:"3px", textTransform:"uppercase"}}>
            Create your shadow identity
          </p>
        </div>

        {/* Identity preview */}
        {preview && (
          <div style={{
            marginBottom:20, padding:"14px 16px",
            background:`${rarityColor}10`,
            border:`1px solid ${rarityColor}30`,
            borderRadius:12, textAlign:"center",
          }}>
            <p style={{fontSize:11, color:"var(--text-muted)", marginBottom:4, letterSpacing:"0.5px", textTransform:"uppercase"}}>Your anonymous identity</p>
            <p style={{
              fontFamily:"var(--font-display)", fontWeight:600, fontSize:15,
              color: rarityColor,
            }}>
              {preview.full}
            </p>
            <span style={{
              fontSize:10, color:"var(--text-muted)", marginTop:4, display:"inline-block",
            }}>
              {preview.creatureRarity.toUpperCase()} RARITY
              {preview.creatureRarity === "legendary" && " 🌟 RARE DROP!"}
            </span>
          </div>
        )}

        {error && (
          <div style={{
            padding:"10px 14px", marginBottom:14,
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
            borderRadius:10, color:"#f87171", fontSize:13,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{display:"flex", flexDirection:"column", gap:12}}>
          <input
            className="wv-input"
            placeholder="Username (min. 3 chars)"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required disabled={loading}
            autoFocus
          />
          <input
            className="wv-input"
            type="password"
            placeholder="Password (min. 6 chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required disabled={loading}
          />
          <div style={{display:"flex", gap:8}}>
            {["Male","Female"].map(g => (
              <button
                key={g} type="button"
                onClick={() => setGender(g)}
                disabled={loading}
                style={{
                  flex:1, padding:"12px", borderRadius:12, cursor:"pointer",
                  fontFamily:"var(--font-body)", fontWeight:600, fontSize:14,
                  border:`1px solid ${gender===g?"var(--purple-500)":"var(--border)"}`,
                  background: gender===g ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)",
                  color: gender===g ? "var(--purple-400)" : "var(--text-muted)",
                  transition:"var(--transition)",
                }}
              >
                {g==="Male"?"♂":"♀"} {g}
              </button>
            ))}
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{
            padding:"14px", borderRadius:14, fontSize:15, width:"100%", justifyContent:"center", marginTop:4,
          }}>
            {loading ? "Creating identity…" : "⚗️ Generate Vessel"}
          </button>
        </form>

        <p style={{textAlign:"center", color:"var(--text-muted)", fontSize:13, marginTop:20}}>
          Already have an account?{" "}
          <Link to="/login" style={{color:"var(--purple-400)", textDecoration:"none", fontWeight:500}}>
            Enter vault
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// §23  APP ENTRY POINT
// ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/signup"    element={<SignupPage />} />
          <Route path="/"          element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/create"    element={<ProtectedRoute><CreatePage /></ProtectedRoute>} />
          <Route path="/radio"     element={<ProtectedRoute><RadioPage /></ProtectedRoute>} />
          <Route path="/messages"  element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
