import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';

// ============================================
// TYPES & INTERFACES
// ============================================
type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

interface User {
  _id: string;
  username: string;
  gender: 'Male' | 'Female';
  anonymousName: { full: string; creatureRarity: Rarity; };
  level: number;
  xp: number;
  totalPosts: number;
  streak: number;
  badges: Array<{ name: string; color: string }>;
}

interface Confession {
  _id: string;
  authorName: string;
  authorRarity: Rarity;
  content: string;
  categories: string[];
  moodEmoji: string;
  createdAt: Date | string;
}

// ============================================
// CONSTANTS (Extended for Billion+ Combinations)
// ============================================
const CATEGORIES = [
  { name: 'Adult', emoji: '🔥', color: '#8B0000' },
  { name: 'Funny', emoji: '😂', color: '#FFD700' },
  { name: 'Romantic Crush', emoji: '💕', color: '#FF69B4' },
  { name: 'Sorrow & Grief', emoji: '💔', color: '#191970' },
  { name: 'Work & Career', emoji: '💼', color: '#008080' },
  { name: 'Mental Health', emoji: '🧠', color: '#90EE90' },
];

const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9CA3AF', uncommon: '#C0C0C0', rare: '#FFD700', legendary: '#FF00FF'
};

// ============================================
// AUTH PROVIDER (Crash-Proof)
// ============================================
const AuthContext = createContext<any>(undefined);
export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('confessly_user');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('confessly_token'));

  const login = async (u: string, p: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('confessly_token', data.token);
    localStorage.setItem('confessly_user', JSON.stringify(data.user));
  };

  const signup = async (u: string, p: string, g: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p, gender: g, ageVerified: true })
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Signup failed'); }
    await login(u, p);
  };

  const logout = () => {
  setUser(null);
  setToken(null);
  // Target only Confessly data to be safe
  localStorage.removeItem('confessly_token');
  localStorage.removeItem('confessly_user');
  // Optional: redirect to login immediately
  window.location.href = '/login'; 
};

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// SHARED UI COMPONENTS
// ============================================
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const ConfessionCard = ({ confession }: { confession: Confession }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const rarityColor = RARITY_COLORS[confession.authorRarity] || '#9CA3AF';
  const glow = confession.authorRarity === 'legendary' ? 'animate-pulse-glow' : '';

  return (
    <div className={`glass rounded-2xl border border-white/10 p-6 mb-6 transition-all hover:scale-[1.01] ${glow}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black text-lg" style={{ backgroundColor: rarityColor }}>
          {confession.authorName?.charAt(0) || '?'}
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">{confession.authorName}</h3>
          <p className="text-[10px] text-gray-500">Just now</p>
        </div>
      </div>

      <div className={`mb-6 transition-all duration-700 ${isRevealed ? 'animate-slow-fade' : 'blur-xl opacity-20 select-none'}`}>
        <p className="text-gray-200 leading-relaxed text-lg">{confession.content}</p>
      </div>

      {!isRevealed && (
        <button 
          onClick={() => setIsRevealed(true)}
          className="w-full py-3 bg-purple-600 rounded-xl font-bold text-white text-sm tracking-widest hover:bg-purple-500 transition-colors"
        >
          REVEAL SECRET
        </button>
      )}
    </div>
  );
};

// ============================================
// PAGES
// ============================================
const HomePage = () => {
  const { user } = useAuth();
  const [confessions, setConfessions] = useState<Confession[]>([]);

  useEffect(() => {
    setConfessions([{
      _id: 'demo1', authorName: 'Obsidian Phoenix of London 4', authorRarity: 'legendary',
      content: 'I told everyone I was working late, but I was actually sitting in my car eating a whole pizza by myself.',
      categories: ['Funny'], moodEmoji: '🍕', createdAt: new Date()
    }]);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="glass sticky top-0 z-50 p-4 border-b border-white/10 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gradient">Confessly</h1>
        <div className="flex items-center space-x-4">
          <Link to="/create" className="bg-purple-600 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-tighter">Confess</Link>
          <Link to="/profile" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-purple-500/40">
            <span className="text-purple-400 font-bold">
              {user?.anonymousName?.full?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </span>
          </Link>
        </div>
      </nav>
      <main className="max-w-xl mx-auto p-4 py-8">
        {confessions.map(c => <ConfessionCard key={c._id} confession={c} />)}
      </main>
    </div>
  );
};

const SignupPage = () => {
  const [form, setForm] = useState({ u: '', p: '', g: 'Male' as 'Male' | 'Female' });
  const { signup } = useAuth();
  const nav = useNavigate();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await signup(form.u, form.p, form.g); nav('/'); } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <form onSubmit={handle} className="glass p-10 rounded-3xl border border-white/10 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-2 text-white">Shadow Identity</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">Create your anonymous vessel</p>
        <input className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl mb-4 text-white focus:border-purple-500 outline-none transition-all" placeholder="Username" onChange={e => setForm({...form, u: e.target.value})} required />
        <input className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl mb-6 text-white focus:border-purple-500 outline-none transition-all" type="password" placeholder="Password" onChange={e => setForm({...form, p: e.target.value})} required />
        <div className="flex gap-4 mb-8">
          {['Male', 'Female'].map(g => (
            <button key={g} type="button" onClick={() => setForm({...form, g: g as any})} className={`flex-1 py-3 rounded-xl font-bold transition-all ${form.g === g ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'bg-gray-900 text-gray-500'}`}>{g}</button>
          ))}
        </div>
        <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-lg">Initialize Account</button>
        <p className="text-center text-gray-500 text-sm mt-8">Known to the vault? <Link to="/login" className="text-purple-400">Login</Link></p>
      </form>
    </div>
  );
};

const LoginPage = () => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await login(u, p); nav('/'); } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <form onSubmit={handle} className="glass p-10 rounded-3xl border border-white/10 w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">Enter Vault</h2>
        <input className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl mb-4 text-white outline-none focus:border-purple-500 transition-all" placeholder="Username" value={u} onChange={e => setU(e.target.value)} required />
        <input className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl mb-8 text-white outline-none focus:border-purple-500 transition-all" type="password" placeholder="Password" value={p} onChange={e => setP(e.target.value)} required />
        <button className="w-full py-4 bg-purple-600 rounded-2xl font-bold text-lg shadow-xl shadow-purple-900/20">Login</button>
        <p className="text-center text-gray-500 text-sm mt-8">New shadow? <Link to="/signup" className="text-purple-400">Join Us</Link></p>
      </form>
    </div>
  );
};

// ============================================
// APP ENTRY & ROUTES
// ============================================
const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><div className="p-20 text-center text-white">Create Page (WIP)</div></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><div className="p-20 text-center text-white">Profile Page (WIP)</div></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;