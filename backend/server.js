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

// ============================================
// CREDENTIALS LOADING (DYNAMIC & DRIVE SAFE)
// ============================================
const localCredentialsPath = path.join(__dirname, '../../credentials/master-credentials.js');
let CRED;

if (fs.existsSync(localCredentialsPath)) {
    CRED = require(localCredentialsPath);
    console.log("🔐 LOCAL: Credentials loaded from R:\\confessly\\credentials");
} else {
    console.log("☁️  CLOUD: Falling back to Environment Variables");
    CRED = {
        DATABASE: { MONGODB_URI: process.env.MONGODB_URI },
        JWT: { SECRET: process.env.JWT_SECRET },
        SERVER: { PORT: process.env.PORT || 5000 },
        SOCKET: { CORS_ORIGINS: ["*"] }, 
        CLOUDINARY: {
            CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
            API_KEY: process.env.CLOUDINARY_API_KEY,
            API_SECRET: process.env.CLOUDINARY_API_SECRET
        },
        OPENAI: { API_KEY: process.env.OPENAI_API_KEY },
        FEATURES: { ENABLE_MODERATION: true }
    };
}

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || CRED.SERVER.PORT;

// Middleware
app.use(cors({ origin: CRED.SOCKET.CORS_ORIGINS, credentials: true }));
app.use(express.json());

// Services Initialization
cloudinary.config({ 
    cloud_name: CRED.CLOUDINARY.CLOUD_NAME, 
    api_key: CRED.CLOUDINARY.API_KEY, 
    api_secret: CRED.CLOUDINARY.API_SECRET 
});
const openai = new OpenAI({ apiKey: CRED.OPENAI.API_KEY });

// ============================================
// DATABASE MODELS
// ============================================
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: String,
    anonymousName: { full: String, creatureRarity: String },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
}));

const Confession = mongoose.model('Confession', new mongoose.Schema({
    authorName: String,
    authorRarity: String,
    content: String,
    categories: [String],
    createdAt: { type: Date, default: Date.now }
}));

// ============================================
// SOCKET.IO LOGIC
// ============================================
const io = new Server(server, { cors: { origin: "*" } });
io.on('connection', (socket) => {
    socket.on('join_room', (room) => socket.join(room));
    socket.on('send_message', (data) => io.to(data.room).emit('receive_message', data));
});

// ============================================
// API ROUTES
// ============================================

// Auth: Signup
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
    } catch (err) { res.status(400).json({ error: "User already exists" }); }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id }, CRED.JWT.SECRET, { expiresIn: '7d' });
    res.json({ user, token });
});

// Confessions: Post (With OpenAI Moderation & XP)
app.post('/api/confessions', async (req, res) => {
    try {
        const { content, categories, userId } = req.body;

        if (CRED.FEATURES.ENABLE_MODERATION) {
            const mod = await openai.moderations.create({ input: content });
            if (mod.results[0].flagged) return res.status(400).json({ error: "Harmful content detected." });
        }

        const user = await User.findById(userId);
        const newPost = new Confession({
            authorName: user.anonymousName.full,
            authorRarity: user.anonymousName.creatureRarity,
            content, categories
        });

        await newPost.save();
        
        // Reward user with XP
        user.xp += 20;
        if (user.xp >= 100) { user.level += 1; user.xp = 0; }
        await user.save();

        io.emit('new_confession', newPost);
        res.json({ post: newPost, user });
    } catch (err) { res.status(500).json({ error: "Failed to post confession" }); }
});

// Confessions: Get Feed
app.get('/api/confessions', async (req, res) => {
    const list = await Confession.find().sort({ createdAt: -1 }).limit(50);
    res.json(list);
});

// ============================================
// LAUNCH
// ============================================
mongoose.connect(CRED.DATABASE.MONGODB_URI)
    .then(() => {
        console.log("🔋 Database Connected to Atlas");
        server.listen(PORT, () => console.log(`🚀 Confessly Server flying on port ${PORT}`));
    })
    .catch(err => console.error("❌ DB Error:", err));