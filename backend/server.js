// ============================================
// CREDENTIALS & DEPENDENCIES
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http');
const path = require('path'); 
const { Server } = require('socket.io');
const cloudinary = require('cloudinary').v2;
const { OpenAI } = require('openai');
const fs = require('fs');
require('dotenv').config();

const localCredentialsPath = path.join(__dirname, '../credentials/master-credentials.js');
let CRED;

if (fs.existsSync(localCredentialsPath)) {
    CRED = require(localCredentialsPath);
    console.log("🔐 LOCAL: Credentials loaded from R-Drive");
} else {
    console.log("☁️  CLOUD: Falling back to Environment Variables");
    CRED = {
        DATABASE: { MONGODB_URI: process.env.MONGODB_URI },
        JWT: { SECRET: process.env.JWT_SECRET || 'fallback_secret_change_me' },
        SERVER: { PORT: process.env.PORT || 5000 },
        // Fixed: We use origin: true in middleware instead of a hardcoded list here
        CLOUDINARY: {
            CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
            API_KEY: process.env.CLOUDINARY_API_KEY,
            API_SECRET: process.env.CLOUDINARY_API_SECRET
        },
        OPENAI: { API_KEY: process.env.OPENAI_API_KEY },
        FEATURES: { ENABLE_MODERATION: !!process.env.OPENAI_API_KEY }
    };
}

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || CRED.SERVER.PORT;

// ============================================
// MIDDLEWARE (CORS FIX)
// ============================================
app.use(cors({ 
    origin: true, // Automatically matches the requesting origin (Vercel)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Services Initialization
if (CRED.CLOUDINARY.CLOUD_NAME) {
    cloudinary.config({ 
        cloud_name: CRED.CLOUDINARY.CLOUD_NAME, 
        api_key: CRED.CLOUDINARY.API_KEY, 
        api_secret: CRED.CLOUDINARY.API_SECRET 
    });
}

const openai = CRED.OPENAI.API_KEY ? new OpenAI({ apiKey: CRED.OPENAI.API_KEY }) : null;

// ============================================
// DATABASE MODELS
// ============================================
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: String,
    anonymousName: { full: String, creatureRarity: String },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
}));

const Confession = mongoose.models.Confession || mongoose.model('Confession', new mongoose.Schema({
    authorName: String,
    authorRarity: String,
    content: { type: String, required: true },
    categories: [String],
    createdAt: { type: Date, default: Date.now }
}));

// ============================================
// SOCKET.IO
// ============================================
const io = new Server(server, { cors: { origin: "*" } });
io.on('connection', (socket) => {
    socket.on('join_room', (room) => socket.join(room));
    socket.on('send_message', (data) => io.to(data.room).emit('receive_message', data));
});

// ============================================
// API ROUTES
// ============================================

// 1. Health Check (Test this first!)
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// 2. Auth: Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password, gender } = req.body;
        const hashed = await bcrypt.hash(password, 12);
        const newUser = new User({ 
            username, password: hashed, gender,
            anonymousName: { full: `Ghost_${Math.floor(Math.random()*9999)}`, creatureRarity: 'common' }
        });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, CRED.JWT.SECRET, { expiresIn: '7d' });
        res.status(201).json({ user: newUser, token });
    } catch (err) { 
        res.status(400).json({ error: "User already exists or missing data" }); 
    }
});

// 3. Auth: Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, CRED.JWT.SECRET, { expiresIn: '7d' });
        res.json({ user, token });
    } catch (err) {
        res.status(500).json({ error: "Login error" });
    }
});

// 4. Confessions: Post
app.post('/api/confessions', async (req, res) => {
    try {
        const { content, categories, userId } = req.body;

        if (CRED.FEATURES.ENABLE_MODERATION && openai) {
            const mod = await openai.moderations.create({ input: content });
            if (mod.results[0].flagged) return res.status(400).json({ error: "Harmful content detected." });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const newPost = new Confession({
            authorName: user.anonymousName.full,
            authorRarity: user.anonymousName.creatureRarity,
            content, categories
        });

        await newPost.save();
        
        user.xp += 20;
        if (user.xp >= 100) { user.level += 1; user.xp = 0; }
        await user.save();

        io.emit('new_confession', newPost);
        res.json({ post: newPost, user });
    } catch (err) { 
        res.status(500).json({ error: "Failed to post confession" }); 
    }
});

// 5. Confessions: Get Feed
app.get('/api/confessions', async (req, res) => {
    try {
        const list = await Confession.find().sort({ createdAt: -1 }).limit(50);
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch feed" });
    }
});

// ============================================
// LAUNCH
// ============================================
if (!CRED.DATABASE.MONGODB_URI) {
    console.error("❌ ERROR: MONGODB_URI is missing!");
    process.exit(1);
}

mongoose.connect(CRED.DATABASE.MONGODB_URI)
    .then(() => {
        console.log("🔋 Database Connected to Atlas");
        server.listen(PORT, () => console.log(`🚀 Confessly Server flying on port ${PORT}`));
    })
    .catch(err => console.error("❌ DB Error:", err));