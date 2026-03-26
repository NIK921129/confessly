import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';

// ============================================
// CONFIG & CONSTANTS
// ============================================
const API_URL = "https://confessly-api.onrender.com"; // Your live backend

type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

interface User {
  _id: string;
  username: string;
  gender: 'Male' | 'Female';
  anonymousName: { full: string; creatureRarity: Rarity; };
  level: number;
  xp: number;
}

interface Confession {
  _id: string;
  authorName: string;
  authorRarity: Rarity;
  content: string;
  categories: string[];
  createdAt: Date | string;
}

const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9CA3AF', uncommon: '#60A5FA', rare: '#A855F7', legendary: '#FACC15'
};

// ============================================
// AUTH CONTEXT
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
    const res = await fetch(`${API_URL}/api/auth/login`, {
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
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p, gender: g })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    await login(u, p);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// UI COMPONENTS
// ============================================
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const ConfessionCard = ({ confession }: { confession: Confession }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const rarityColor = RARITY_COLORS[confession.authorRarity] || '#9CA3AF';

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-6 mb-6 transition-all hover:border-purple-500/50">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black" style={{ backgroundColor: rarityColor }}>
          {(confession.authorName || 'G').charAt(0)}
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">{confession.authorName || "Anonymous Ghost"}</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">{confession.authorRarity}</p>
        </div>
      </div>

      <div className={`mb-6 transition-all duration-700 ${isRevealed ? 'blur-0 opacity-100' : 'blur-xl opacity-10 select-none'}`}>
        <p className="text-gray-200 leading-relaxed text-lg">{confession.content}</p>
      </div>

      {!isRevealed && (
        <button onClick={() => setIsRevealed(true)} className="w-full py-3 bg-purple-600 rounded-2xl font-bold text-white text-xs tracking-widest hover:bg-purple-500 transition-all">
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
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/confessions`)
      .then(res => res.json())
      .then(data => {
        setConfessions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl p-4 border-b border-white/5 flex justify-between items-center px-6">
        <h1 className="text-2xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">CONFESSLY</h1>
        <div className="flex items-center space-x-4">
          <Link to="/create" className="bg-white text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-purple-400 transition-all">Post</Link>
          <Link to="/profile" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-purple-400 font-bold">P</Link>
        </div>
      </nav>
      <main className="max-w-xl mx-auto p-6">
        {loading ? <div className="text-center py-20 text-gray-600">Decrypting the vault...</div> : 
         confessions.length === 0 ? <div className="text-center py-20 text-gray-600">The vault is empty. Be the first to confess.</div> :
         confessions.map(c => <ConfessionCard key={c._id} confession={c} />)}
      </main>
    </div>
  );
};

const CreatePage = () => {
  const [content, setContent] = useState('');
  const { user } = useAuth();
  const nav = useNavigate();

  const handlePost = async () => {
    if (!content.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/confessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, userId: user._id, categories: ['General'] })
      });
      if (res.ok) nav('/');
    } catch (err) { alert("Server busy. Try again."); }
  };

  return (
    <div className="min-h-screen bg-black p-6 flex flex-col items-center">
      <div className="w-full max-w-xl">
        <div className="flex justify-between items-center mb-10">
          <Link to="/" className="text-gray-500 text-sm">← Back</Link>
          <h2 className="text-xl font-bold">New Confession</h2>
          <button onClick={handlePost} className="text-purple-400 font-bold uppercase text-xs tracking-widest">Post</button>
        </div>
        <textarea 
          className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-xl text-white outline-none focus:border-purple-500/50 min-h-[300px]"
          placeholder="What's on your mind? (Fully Anonymous)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <form onSubmit={handle} className="bg-white/5 backdrop-blur-2xl p-10 rounded-[40px] border border-white/10 w-full max-w-sm shadow-2xl">
        <h2 className="text-4xl font-black text-center mb-2 text-white tracking-tighter">Enter Vault</h2>
        <p className="text-gray-500 text-center mb-10 text-[10px] uppercase tracking-[0.3em]">Accessing Private Sector</p>
        <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl mb-4 text-white outline-none focus:border-purple-500 transition-all" placeholder="Username" value={u} onChange={e => setU(e.target.value)} required />
        <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl mb-10 text-white outline-none focus:border-purple-500 transition-all" type="password" placeholder="Password" value={p} onChange={e => setP(e.target.value)} required />
        <button className="w-full py-5 bg-purple-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-purple-900/40 hover:bg-purple-500 transition-all">Open Session</button>
        <p className="text-center text-gray-500 text-[10px] mt-8 uppercase tracking-widest">New Shadow? <Link to="/signup" className="text-purple-400">Initialize</Link></p>
      </form>
    </div>
  );
};

const SignupPage = () => {
  const [form, setForm] = useState({ u: '', p: '', g: 'Male' });
  const { signup } = useAuth();
  const nav = useNavigate();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await signup(form.u, form.p, form.g); nav('/'); } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <form onSubmit={handle} className="bg-white/5 backdrop-blur-2xl p-10 rounded-[40px] border border-white/10 w-full max-w-sm shadow-2xl">
        <h2 className="text-4xl font-black text-center mb-2 text-white tracking-tighter">Initialize</h2>
        <p className="text-gray-500 text-center mb-10 text-[10px] uppercase tracking-[0.3em]">Identity Creation</p>
        <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl mb-4 text-white outline-none focus:border-purple-500 transition-all" placeholder="Username" onChange={e => setForm({...form, u: e.target.value})} required />
        <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl mb-8 text-white outline-none focus:border-purple-500 transition-all" type="password" placeholder="Password" onChange={e => setForm({...form, p: e.target.value})} required />
        <div className="flex gap-3 mb-10">
          {['Male', 'Female'].map(g => (
            <button key={g} type="button" onClick={() => setForm({...form, g})} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${form.g === g ? 'bg-white text-black' : 'bg-white/5 text-gray-500'}`}>{g}</button>
          ))}
        </div>
        <button className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-purple-900/40">Generate Vessel</button>
        <p className="text-center text-gray-500 text-[10px] mt-8 uppercase tracking-widest">In the database? <Link to="/login" className="text-purple-400">Enter Vault</Link></p>
      </form>
    </div>
  );
};

// ============================================
// APP ENTRY
// ============================================
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreatePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><div className="p-20 text-center">Profile Under Construction</div></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}