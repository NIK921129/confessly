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
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,   // 🚨 CRITICAL: ensures no two users share the same username
        trim: true
    },
    password: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female'] },
    anonymousName: {
        full: { type: String, default: 'Anonymous' },
        creatureRarity: { type: String, default: 'common' }
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now }
});

const ConfessionSchema = new mongoose.Schema({
    authorName: { type: String, required: true },
    authorRarity: { type: String, default: 'common' },
    content: { type: String, required: true },
    categories: { type: [String], default: ['General'] },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Confession = mongoose.models.Confession || mongoose.model('Confession', ConfessionSchema);

// ============================================
// SOCKET.IO
// ============================================

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('🔌 New client connected');
    socket.on('join_room', (room) => socket.join(room));
    socket.on('send_message', (data) => io.to(data.room).emit('receive_message', data));
    socket.on('disconnect', () => console.log('🔌 Client disconnected'));
});

// ============================================
// API ROUTES
// ============================================

// 1. Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// 2. Auth: Signup
app.post('/api/auth/signup', async (req, res) => {
    console.log("📝 Signup request:", { username: req.body.username, gender: req.body.gender });

    try {
        const { username, password, gender } = req.body;

        // Validation
        if (!username || username.length < 3) {
            return res.status(400).json({ error: "Username must be at least 3 characters" });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        const hashed = await bcrypt.hash(password, 12);

        // Generate anonymous name
        const prefixes = ['Ghost', 'Shadow', 'Phantom', 'Mystic', 'Void', 'Silent', 'Whisper', 'Dark', 'Echo'];
        const suffixes = ['Soul', 'Spirit', 'Walker', 'Seeker', 'Wanderer', 'Watcher', 'Guardian', 'Hunter'];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const randomNum = Math.floor(Math.random() * 9999);

        const newUser = new User({
            username,
            password: hashed,
            gender,
            anonymousName: {
                full: `${randomPrefix} ${randomSuffix} ${randomNum}`,
                creatureRarity: 'common'
            }
        });

        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, CRED.JWT.SECRET, { expiresIn: '7d' });

        console.log("✅ User created:", username);
        res.status(201).json({ user: newUser, token });

    } catch (err) {
        console.error("❌ Signup error:", err.message);
        if (err.code === 11000) {
            res.status(400).json({ error: "Username already exists" });
        } else {
            res.status(400).json({ error: err.message || "Signup failed" });
        }
    }
});

// 3. Auth: Login
app.post('/api/auth/login', async (req, res) => {
    console.log("🔐 Login request:", req.body.username);

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            console.log("❌ User not found:", username);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            console.log("❌ Invalid password for:", username);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, CRED.JWT.SECRET, { expiresIn: '7d' });
        console.log("✅ Login successful:", username);
        res.json({ user, token });

    } catch (err) {
        console.error("❌ Login error:", err.message);
        res.status(500).json({ error: "Login error" });
    }
});

// 4. Confessions: Post
app.post('/api/confessions', async (req, res) => {
    console.log("📝 POST /api/confessions - Request received");
    console.log("Body:", JSON.stringify(req.body, null, 2));

    try {
        const { content, categories, userId } = req.body;

        // Validation
        if (!content) {
            console.log("❌ Missing content");
            return res.status(400).json({ error: "Content is required" });
        }

        if (!userId) {
            console.log("❌ Missing userId");
            return res.status(400).json({ error: "User ID is required. Please log in again." });
        }

        if (content.length < 5) {
            return res.status(400).json({ error: "Content must be at least 5 characters" });
        }

        console.log(`Looking for user with ID: ${userId}`);

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            console.log("❌ User not found:", userId);
            return res.status(404).json({ error: "User not found. Please log in again." });
        }

        console.log(`✅ User found: ${user.username} (Level ${user.level})`);

        // Optional moderation
        if (CRED.FEATURES.ENABLE_MODERATION && openai) {
            try {
                console.log("🔍 Running moderation check...");
                const mod = await openai.moderations.create({ input: content });
                if (mod.results[0].flagged) {
                    console.log("⚠️ Content flagged as harmful");
                    return res.status(400).json({ error: "Harmful content detected." });
                }
                console.log("✅ Content passed moderation");
            } catch (modErr) {
                console.warn("⚠️ Moderation skipped:", modErr.message);
            }
        }

        // Create confession
        const newPost = new Confession({
            authorName: user.anonymousName.full,
            authorRarity: user.anonymousName.creatureRarity,
            content: content,
            categories: categories && categories.length > 0 ? categories : ['General']
        });

        console.log("💾 Saving confession...");
        await newPost.save();
        console.log(`✅ Confession saved with ID: ${newPost._id}`);

        // Update XP
        const oldLevel = user.level;
        user.xp = (user.xp || 0) + 20;

        while (user.xp >= 100) {
            user.level += 1;
            user.xp -= 100;
        }

        if (user.level > oldLevel) {
            console.log(`🎉 User ${user.username} leveled up from ${oldLevel} to ${user.level}!`);
        }

        await user.save();

        // Emit via Socket.IO
        io.emit('new_confession', newPost);

        // Return success response
        res.json({
            success: true,
            post: newPost,
            user: {
                _id: user._id,
                username: user.username,
                level: user.level,
                xp: user.xp
            }
        });

    } catch (err) {
        console.error("❌ Post confession error:", err.message);
        console.error("Error stack:", err.stack);
        res.status(500).json({ error: err.message || "Failed to post confession" });
    }
});

// 5. Confessions: Get Feed
app.get('/api/confessions', async (req, res) => {
    console.log("📋 GET /api/confessions - Fetching feed");

    try {
        const list = await Confession.find()
            .sort({ createdAt: -1 })
            .limit(50);

        console.log(`✅ Returning ${list.length} confessions`);
        res.json(list);

    } catch (err) {
        console.error("❌ Fetch feed error:", err.message);
        res.status(500).json({ error: "Failed to fetch feed" });
    }
});

// 6. Get User Profile
app.get('/api/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user" });
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