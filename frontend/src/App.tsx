import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';

// ============================================
// CONFIG & CONSTANTS
// ============================================
const API_URL = "https://confessly-api.onrender.com";

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface User {
  _id: string;
  username: string;
  gender: 'Male' | 'Female';
  anonymousName: { full: string; creatureRarity: Rarity; };
  level: number;
  xp: number;
  totalPosts?: number;
  streak?: number;
  createdAt?: string;
}

export interface Confession {
  _id: string;
  authorName: string;
  authorRarity: Rarity;
  content: string;
  categories: string[];
  likes?: number;
  comments?: number;
  createdAt: Date | string;
}

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9CA3AF', 
  uncommon: '#60A5FA', 
  rare: '#A855F7', 
  legendary: '#FACC15'
};

export const RARITY_GLOW: Record<Rarity, string> = {
  common: '',
  uncommon: 'shadow-blue-500/20',
  rare: 'shadow-purple-500/30',
  legendary: 'animate-pulse-glow shadow-pink-500/40'
};

// ============================================
// AUTH CONTEXT (Improved with loading states)
// ============================================
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, gender: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('confessly_user');
    const savedToken = localStorage.getItem('confessly_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        console.error('Failed to parse saved user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('confessly_token', data.token);
      localStorage.setItem('confessly_user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, password: string, gender: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, gender })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      await login(username, password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, isAuthenticated: !!user, isLoading, login, signup, logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// LOADING SPINNER COMPONENT
// ============================================
const LoadingSpinner: React.FC = () => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      <p className="text-purple-400 text-sm font-medium">Decrypting vault...</p>
    </div>
  </div>
);

// ============================================
// PROTECTED ROUTE (With redirect)
// ============================================
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// ============================================
// CONFESSION CARD (Improved)
// ============================================
const ConfessionCard: React.FC<{ confession: Confession }> = ({ confession }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const rarityColor = RARITY_COLORS[confession.authorRarity] || '#9CA3AF';
  const glowClass = RARITY_GLOW[confession.authorRarity] || '';
  const formattedDate = new Date(confession.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`glass rounded-2xl p-6 mb-5 transition-all duration-300 hover:scale-[1.01] hover:border-purple-500/50 ${glowClass}`}>
      {/* Author Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-black text-lg shadow-lg"
            style={{ backgroundColor: rarityColor }}
          >
            {(confession.authorName || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">
              {confession.authorName || "Anonymous Soul"}
            </h3>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              {confession.authorRarity.toUpperCase()} • {formattedDate}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {confession.categories?.map(cat => (
            <span key={cat} className="text-[10px] px-2 py-1 bg-white/5 rounded-full text-gray-400">
              #{cat}
            </span>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className={`mb-5 transition-all duration-700 ${!isRevealed ? 'blur-xl opacity-20 select-none' : 'blur-0 opacity-100'}`}>
        <p className="text-gray-200 leading-relaxed text-base">{confession.content}</p>
      </div>

      {/* Action Buttons */}
      {!isRevealed ? (
        <button
          onClick={() => setIsRevealed(true)}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white text-sm tracking-wider hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
        >
          🔓 REVEAL SECRET
        </button>
      ) : (
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex gap-4">
            <button className="flex items-center gap-1 text-gray-400 hover:text-pink-500 transition text-sm">
              ❤️ {confession.likes || 0}
            </button>
            <button className="flex items-center gap-1 text-gray-400 hover:text-purple-500 transition text-sm">
              💬 {confession.comments || 0}
            </button>
          </div>
          <button className="text-gray-400 hover:text-white transition text-sm">
            🔗 Share
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================
// HOME PAGE (Feed)
// ============================================
const HomePage: React.FC = () => {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchConfessions = async () => {
      try {
        const res = await fetch(`${API_URL}/api/confessions`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setConfessions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Unable to load confessions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchConfessions();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-50 px-4 md:px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl md:text-3xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          CONFESSLY
        </Link>
        <div className="flex items-center gap-3">
          <Link 
            to="/create" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-lg"
          >
            ✍️ Confess
          </Link>
          <div className="relative group">
            <Link 
              to="/profile" 
              className="w-10 h-10 rounded-full border-2 border-purple-500/50 flex items-center justify-center bg-white/5 hover:bg-purple-500/20 transition"
            >
              <span className="text-purple-400 font-bold text-sm">
                {user?.anonymousName?.full?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </Link>
            <div className="absolute right-0 mt-2 w-48 bg-black/95 backdrop-blur-xl rounded-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="py-2">
                <div className="px-4 py-2 border-b border-white/10">
                  <p className="text-sm font-semibold">{user?.username}</p>
                  <p className="text-xs text-gray-500">Level {user?.level || 1}</p>
                </div>
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Feed Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4 text-sm">Decrypting the vault...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        ) : confessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔮</div>
            <p className="text-gray-500 text-lg">The vault is empty...</p>
            <p className="text-gray-600 text-sm mt-2">Be the first to share a secret</p>
            <Link 
              to="/create"
              className="inline-block mt-6 px-6 py-3 bg-purple-600 rounded-xl font-semibold hover:bg-purple-700 transition"
            >
              Create Your First Confession
            </Link>
          </div>
        ) : (
          confessions.map(c => <ConfessionCard key={c._id} confession={c} />)
        )}
      </main>
    </div>
  );
};

// ============================================
// CREATE PAGE
// ============================================
const CreatePage: React.FC = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const nav = useNavigate();

  const handlePost = async () => {
    if (!content.trim()) {
      alert('Please write something before posting');
      return;
    }
    if (content.length < 10) {
      alert('Your confession must be at least 10 characters');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/confessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: content.trim(), 
          userId: user?._id, 
          categories: ['General'] 
        })
      });
      
      if (res.ok) {
        nav('/');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to post. Please try again.');
      }
    } catch (err) {
      alert('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-gray-400 hover:text-white transition flex items-center gap-2">
            ← Back
          </Link>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            New Confession
          </h1>
          <button 
            onClick={handlePost}
            disabled={loading || !content.trim()}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
        
        <div className="glass rounded-2xl p-6">
          <textarea
            className="w-full bg-transparent border-0 text-white text-lg outline-none resize-none min-h-[300px] placeholder:text-gray-600"
            placeholder="What's on your mind? 👻\n\nYour secret is safe here. Confessions are completely anonymous."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            autoFocus
          />
          <div className="border-t border-white/10 pt-4 flex justify-between items-center text-sm text-gray-500">
            <span>{content.length}/1000 characters</span>
            <span>🔒 Anonymous & Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// LOGIN PAGE
// ============================================
const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      nav(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="glass rounded-[40px] p-8 md:p-10 w-full max-w-md border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            CONFESSLY
          </h1>
          <p className="text-gray-500 text-sm mt-2 tracking-wider">ENTER THE VAULT</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-4 text-white outline-none focus:border-purple-500 transition"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-white outline-none focus:border-purple-500 transition"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Opening vault...' : 'Open Session'}
        </button>
        
        <p className="text-center text-gray-500 text-sm mt-6">
          New here?{' '}
          <Link to="/signup" className="text-purple-400 hover:text-purple-300 transition">
            Initialize Identity
          </Link>
        </p>
      </form>
    </div>
  );
};

// ============================================
// SIGNUP PAGE
// ============================================
const SignupPage: React.FC = () => {
  const [form, setForm] = useState({ username: '', password: '', gender: 'Male' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (form.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await signup(form.username, form.password, form.gender);
      nav('/');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Username may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="glass rounded-[40px] p-8 md:p-10 w-full max-w-md border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Initialize
          </h1>
          <p className="text-gray-500 text-sm mt-2">CREATE YOUR SHADOW IDENTITY</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-4 text-white outline-none focus:border-purple-500 transition"
          placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          disabled={loading}
        />
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-4 text-white outline-none focus:border-purple-500 transition"
          type="password"
          placeholder="Password (min. 6 characters)"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          disabled={loading}
        />
        
        <div className="flex gap-3 mb-6">
          {['Male', 'Female'].map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setForm({ ...form, gender: g })}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                form.gender === g 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
              disabled={loading}
            >
              {g === 'Male' ? '♂️' : '♀️'} {g}
            </button>
          ))}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Creating identity...' : 'Generate Vessel'}
        </button>
        
        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 transition">
            Enter Vault
          </Link>
        </p>
      </form>
    </div>
  );
};

// ============================================
// PROFILE PAGE (Placeholder - Ready for expansion)
// ============================================
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#050505] p-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-gray-400 hover:text-white transition inline-flex items-center gap-2 mb-6">
          ← Back
        </Link>
        
        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-white">
              {user?.anonymousName?.full?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </span>
          </div>
          <h2 className="text-2xl font-bold">{user?.username}</h2>
          <p className="text-gray-400 mt-1">{user?.anonymousName?.full}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-400">
            {user?.anonymousName?.creatureRarity?.toUpperCase() || 'COMMON'} RARITY
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-2xl font-bold">{user?.level || 1}</p>
              <p className="text-xs text-gray-500">LEVEL</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{user?.xp || 0}</p>
              <p className="text-xs text-gray-500">XP</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">Coming soon: Your confession history, badges, and more!</p>
        </div>
      </div>
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
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}