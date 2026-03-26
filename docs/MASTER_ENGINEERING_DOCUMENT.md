# CONFESSLY - MASTER ENGINEERING DOCUMENT
## Complete Technical Documentation for Anonymous Confession Platform

---

**Project:** Confessly  
**Version:** 1.0.0  
**Owner:** Nikunj Singh  
**Contact:** nikunj.singh.2007@outlook.com  
**Phone:** +91 9211293576  
**Date:** March 2025  

---

# TABLE OF CONTENTS

1. Executive Summary
2. System Architecture Overview
3. Technology Stack
4. Database Design
5. Backend API Specification
6. Frontend Architecture
7. Authentication & Security
8. Real-time Communication (Socket.IO)
9. Audio Processing
10. Deployment Guide
11. Environment Configuration
12. Master Credentials File
13. API Endpoints Reference
14. Code Structure
15. Algorithms & Business Logic
16. Testing Strategy
17. Troubleshooting Guide
18. Maintenance & Updates

---

# 1. EXECUTIVE SUMMARY

## 1.1 Project Overview

Confessly is a full-stack anonymous confession platform that allows users to share their thoughts, secrets, and experiences without revealing their identity. The platform features:

- **Anonymous Identity System:** Users get unique anonymous names with weighted rarity
- **Text & Voice Confessions:** Support for both text and audio confessions
- **Real-time Interactions:** Live messaging, reactions, and comments via Socket.IO
- **Gamification:** Level system, badges, and streaks to encourage engagement
- **Radio Mode:** Listen to voice confessions like a podcast
- **Social Features:** Follow users, private messaging, notifications

## 1.2 Key Features

### P1 (Core Features)
- Anonymous identity generation with rarity system
- Text confessions with blur-to-reveal
- Voice confessions with audio recording
- Reaction system (6 types)
- Comment system with replies
- Real-time messaging
- User profiles with levels/badges

### P2 (Enhanced Features)
- Radio mode for voice confessions
- Follow/unfollow users
- Notification system
- Search functionality
- Category filtering
- Trending/Hot feeds

### P3 (Advanced Features)
- Voice effects (whisper, deep, echo, robotic)
- Ambient sounds (rain, cafe, ocean, etc.)
- Confession chains (reply to confessions)
- Streak system
- Heat score algorithm
- Content moderation

## 1.3 Project Structure

```
confessly/
├── backend/           # Node.js/Express API
│   ├── server.js      # Main server file
│   ├── routes/        # API routes
│   ├── models/        # Mongoose models
│   ├── middleware/    # Auth & validation
│   ├── socket/        # Socket.IO handlers
│   └── utils/         # Helper functions
├── frontend/          # React/Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/     # Zustand stores
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   └── public/
├── credentials/       # Master credentials file
└── docs/              # Documentation
```

---

# 2. SYSTEM ARCHITECTURE OVERVIEW

## 2.1 High-Level Architecture

```
+-------------------------------------------------------------+
|                        CLIENT LAYER                          |
|  +-------------+  +-------------+  +---------------------+  |
|  |   Web App   |  |  Mobile App |  |    Future Apps      |  |
|  |  (React)    |  |   (TBD)     |  |                     |  |
|  +------+------+  +------+------+  +---------------------+  |
+--------+----------------+-----------------------------------+
         |                |
         +----------------+
                  |
                  v HTTPS/WSS
+-------------------------------------------------------------+
|                      API GATEWAY LAYER                       |
|  +-------------------------------------------------------+  |
|  |              Express.js + Socket.IO Server             |  |
|  |  - REST API endpoints                                  |  |
|  |  - WebSocket real-time communication                   |  |
|  |  - JWT authentication                                  |  |
|  |  - Rate limiting                                       |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
                  |
                  v
+-------------------------------------------------------------+
|                     SERVICE LAYER                            |
|  +--------------+ +--------------+ +---------------------+  |
|  |   Auth       | |  Confession  | |     Messaging       |  |
|  |   Service    | |   Service    | |     Service         |  |
|  +--------------+ +--------------+ +---------------------+  |
|  +--------------+ +--------------+ +---------------------+  |
|  | Notification | |   Upload     | |     Feed            |  |
|  |   Service    | |   Service    | |     Service         |  |
|  +--------------+ +--------------+ +---------------------+  |
+-------------------------------------------------------------+
                  |
                  v
+-------------------------------------------------------------+
|                     DATA LAYER                               |
|  +-----------------+  +---------------------------------+   |
|  |   MongoDB       |  |        Cloudinary               |   |
|  |  (Primary DB)   |  |      (File Storage)             |   |
|  +-----------------+  +---------------------------------+   |
+-------------------------------------------------------------+
```

## 2.2 Communication Flow

### REST API Flow
1. Client sends HTTP request with JWT token
2. Express server validates token
3. Route handler processes request
4. Service layer executes business logic
5. Database operations via Mongoose
6. Response returned to client

### WebSocket Flow
1. Client connects with JWT token in auth header
2. Socket.IO middleware validates token
3. Connection established, user added to rooms
4. Real-time events exchanged
5. Disconnection cleanup

---

# 3. TECHNOLOGY STACK

## 3.1 Backend Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Node.js | 18+ | JavaScript runtime |
| Framework | Express.js | 4.18+ | Web framework |
| Database | MongoDB | 6.0+ | Document database |
| ODM | Mongoose | 8.0+ | MongoDB object modeling |
| Real-time | Socket.IO | 4.7+ | WebSocket communication |
| Auth | JWT | 9.0+ | Token-based authentication |
| Password Hash | bcryptjs | 2.4+ | Password encryption |
| File Upload | Cloudinary | 1.41+ | Media storage |
| Validation | express-validator | 7.0+ | Input validation |
| Security | Helmet | 7.1+ | Security headers |
| Rate Limit | express-rate-limit | 7.1+ | API rate limiting |
| Logging | Morgan | 1.10+ | HTTP request logging |
| CORS | cors | 2.8+ | Cross-origin requests |

## 3.2 Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | React | 18.2+ | UI library |
| Language | TypeScript | 5.2+ | Type safety |
| Build Tool | Vite | 5.0+ | Fast development |
| Routing | React Router | 6.21+ | Client-side routing |
| State Management | Zustand | 4.4+ | Global state |
| Styling | Tailwind CSS | 3.4+ | Utility-first CSS |
| Animation | Framer Motion | 10.16+ | UI animations |
| Icons | Lucide React | 0.303+ | Icon library |
| Audio | Web Audio API | Native | Audio recording |
| Waveform | WaveSurfer.js | 7.7+ | Audio visualization |
| Date | date-fns | 3.0+ | Date formatting |
| HTTP | Fetch API | Native | API requests |

## 3.3 Infrastructure

| Component | Service | Purpose |
|-----------|---------|---------|
| Frontend Hosting | Vercel | Static site deployment |
| Backend Hosting | Render | Node.js server deployment |
| Database | MongoDB Atlas | Managed MongoDB |
| File Storage | Cloudinary | Image/audio storage |
| Email | Resend | Transactional emails |
| Monitoring | TBD | Application monitoring |

---

# 4. DATABASE DESIGN

## 4.1 Entity Relationship Diagram

```
+-------------+     +-------------+     +-------------+
|    User     |-----|  Confession |-----|   Comment   |
+-------------+     +-------------+     +-------------+
       |                   |
       |            +------+------+
       |            |             |
       v            v             v
+-------------+  +---------+  +-------------+
|   Message   |  |  Follow |  | Notification|
+-------------+  +---------+  +-------------+
```

## 4.2 User Schema

```javascript
{
  // Authentication
  username: String (unique, required),
  password: String (hashed, required),
  
  // Profile
  gender: Enum['Male', 'Female'],
  ageVerified: Boolean,
  
  // Anonymous Identity
  anonymousName: {
    color: String,
    creature: String,
    creatureRarity: Enum['common', 'uncommon', 'rare', 'legendary'],
    location: String,
    number: Number (1-10),
    full: String
  },
  
  // Gamification
  level: Number (default: 1, max: 300),
  xp: Number (default: 0),
  totalPosts: Number (default: 0),
  totalReactionsReceived: Number (default: 0),
  streak: Number (default: 0),
  lastPostDate: Date,
  
  // Badges
  badges: [{
    name: String,
    color: String,
    earnedAt: Date
  }],
  
  // Settings
  settings: {
    notifications: {
      email: Boolean (default: true),
      push: Boolean (default: true),
      reactions: Boolean (default: true),
      messages: Boolean (default: true),
      follows: Boolean (default: true)
    },
    privacy: {
      showLevel: Boolean (default: true),
      showBadges: Boolean (default: true),
      allowMessages: Boolean (default: true)
    }
  },
  
  // Status
  isActive: Boolean (default: true),
  isBanned: Boolean (default: false),
  banReason: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

## 4.3 Confession Schema

```javascript
{
  // Author
  authorId: ObjectId (ref: User),
  authorName: String,
  authorLevel: Number,
  authorRarity: String,
  
  // Content
  type: Enum['text', 'voice'],
  content: String (max: 2000),
  audioUrl: String,
  audioPublicId: String,
  duration: Number (max: 100),
  
  // Categorization
  categories: [String] (max: 3),
  moodEmoji: String,
  
  // Expiry
  expiryOption: Enum['24h', '7d', 'never'],
  expiresAt: Date,
  
  // Voice Features
  voiceEffect: Enum['normal', 'whisper', 'deep', 'echo', 'robotic'],
  ambientSound: Enum['rain', 'crickets', 'cafe', 'ocean', 'thunder', 'fireplace', 'silence'],
  
  // Chain (reply to confession)
  chainParentId: ObjectId (ref: Confession),
  chainDepth: Number,
  
  // Engagement
  reactions: {
    meToo: Number,
    sendingLove: Number,
    wow: Number,
    sameLol: Number,
    stayStrong: Number,
    respect: Number
  },
  reactionUsers: [{ userId: ObjectId, type: String }],
  views: Number,
  commentsCount: Number,
  heatScore: Number,
  
  // Moderation
  isFlagged: Boolean,
  isHidden: Boolean,
  isDeleted: Boolean,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

## 4.4 Message Schema

```javascript
{
  from: ObjectId (ref: User),
  to: ObjectId (ref: User),
  content: String (max: 2000),
  anonymous: Boolean (default: true),
  read: Boolean (default: false),
  readAt: Date,
  isDeleted: Boolean (default: false),
  createdAt: Date
}
```

## 4.5 Comment Schema

```javascript
{
  confessionId: ObjectId (ref: Confession),
  authorId: ObjectId (ref: User),
  authorName: String,
  content: String (max: 1000),
  reactions: {
    meToo: Number,
    sendingLove: Number,
    wow: Number
  },
  replies: [{
    authorId: ObjectId,
    authorName: String,
    content: String,
    createdAt: Date
  }],
  isDeleted: Boolean (default: false),
  createdAt: Date
}
```

## 4.6 Notification Schema

```javascript
{
  userId: ObjectId (ref: User),
  type: Enum['reaction', 'comment', 'message', 'follow', 'chain', 'streak', 'level', 'mention', 'system'],
  title: String,
  message: String,
  read: Boolean (default: false),
  readAt: Date,
  data: {
    confessionId: ObjectId,
    commentId: ObjectId,
    messageId: ObjectId,
    userId: ObjectId,
    reactionType: String,
    level: Number,
    streak: Number
  },
  createdAt: Date
}
```

## 4.7 Follow Schema

```javascript
{
  followerId: ObjectId (ref: User),
  followingId: ObjectId (ref: User),
  createdAt: Date
}
// Unique index on (followerId, followingId)
```

---

# 5. BACKEND API SPECIFICATION

## 5.1 Authentication Endpoints

### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "username": "string (3-30 chars, alphanumeric + underscore)",
  "password": "string (min 6 chars)",
  "gender": "Male | Female",
  "ageVerified": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "jwt_token",
  "user": { "user object" }
}
```

### POST /api/auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token",
  "user": { "user object" }
}
```

### GET /api/auth/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": { "user object" }
}
```

## 5.2 Confession Endpoints

### POST /api/confessions
Create a new confession.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "text | voice",
  "content": "string (for text)",
  "audioUrl": "string (for voice)",
  "duration": "number",
  "categories": ["string"],
  "mood": "string",
  "voiceEffect": "normal | whisper | deep | echo | robotic",
  "ambientSound": "rain | crickets | cafe | ocean | thunder | fireplace | silence",
  "expiryOption": "24h | 7d | never",
  "chainParentId": "string (optional)"
}
```

### GET /api/confessions/:id
Get a single confession.

**Response:**
```json
{
  "success": true,
  "confession": { "confession object" }
}
```

### POST /api/confessions/:id/react
Add reaction to confession.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reactionType": "meToo | sendingLove | wow | sameLol | stayStrong | respect"
}
```

## 5.3 Feed Endpoints

### GET /api/feed
Get main feed with pagination.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `category`: string (default: 'all')
- `sortBy`: 'latest' | 'trending' | 'hot'

**Response:**
```json
{
  "success": true,
  "confessions": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### GET /api/feed/following
Get feed from followed users.

**Headers:** `Authorization: Bearer <token>`

### GET /api/feed/trending
Get trending confessions.

### GET /api/feed/hot
Get hot confessions (last 24h).

### GET /api/feed/search
Search confessions.

**Query Parameters:**
- `q`: search query
- `page`: number
- `limit`: number

## 5.4 User Endpoints

### GET /api/users/profile
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

### GET /api/users/:id
Get user by ID.

### POST /api/users/:id/follow
Follow a user.

**Headers:** `Authorization: Bearer <token>`

### POST /api/users/:id/unfollow
Unfollow a user.

**Headers:** `Authorization: Bearer <token>`

### GET /api/users/leaderboard
Get top users by level.

**Query Parameters:**
- `limit`: number (default: 10)

## 5.5 Message Endpoints

### GET /api/messages
Get all conversations.

**Headers:** `Authorization: Bearer <token>`

### GET /api/messages/:userId
Get conversation with specific user.

**Headers:** `Authorization: Bearer <token>`

### POST /api/messages/:userId
Send message to user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "string"
}
```

### GET /api/messages/unread/count
Get unread message count.

**Headers:** `Authorization: Bearer <token>`

## 5.6 Comment Endpoints

### GET /api/comments/:confessionId
Get comments for confession.

### POST /api/comments/:confessionId
Add comment to confession.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "string"
}
```

### POST /api/comments/:commentId/reply
Reply to comment.

**Headers:** `Authorization: Bearer <token>`

## 5.7 Notification Endpoints

### GET /api/notifications
Get all notifications.

**Headers:** `Authorization: Bearer <token>`

### GET /api/notifications/unread-count
Get unread count.

**Headers:** `Authorization: Bearer <token>`

### PUT /api/notifications/:id/read
Mark notification as read.

**Headers:** `Authorization: Bearer <token>`

### PUT /api/notifications/read-all
Mark all as read.

**Headers:** `Authorization: Bearer <token>`

## 5.8 Upload Endpoints

### POST /api/upload/audio
Upload audio file.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "audioData": "base64_string",
  "duration": "number"
}
```

---

# 6. FRONTEND ARCHITECTURE

## 6.1 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── ConfessionCard.tsx
│   │   └── CategoryFilter.tsx
│   ├── pages/               # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── CreateConfession.tsx
│   │   ├── Profile.tsx
│   │   ├── Messages.tsx
│   │   ├── Chat.tsx
│   │   ├── Radio.tsx
│   │   ├── Notifications.tsx
│   │   ├── Search.tsx
│   │   ├── ConfessionDetail.tsx
│   │   └── UserProfile.tsx
│   ├── store/               # Zustand stores
│   │   ├── authStore.ts
│   │   ├── socketStore.ts
│   │   ├── feedStore.ts
│   │   └── notificationStore.ts
│   ├── hooks/               # Custom hooks
│   │   ├── useAudioRecorder.ts
│   │   ├── useInfiniteScroll.ts
│   │   └── useDebounce.ts
│   ├── utils/               # Utility functions
│   │   ├── nameGenerator.ts
│   │   ├── formatters.ts
│   │   └── audio.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── constants/           # Constants
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 6.2 State Management

### Auth Store (Zustand)
```typescript
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  login: (credentials: LoginCredentials) => Promise<boolean>
  signup: (data: SignupData) => Promise<boolean>
  logout: () => void
  checkAuth: () => void
  updateUser: (user: Partial<User>) => void
  clearError: () => void
}
```

### Socket Store (Zustand)
```typescript
interface SocketState {
  socket: Socket | null
  isConnected: boolean
  onlineUsers: string[]
  typingUsers: Map<string, boolean>
  
  connect: (token: string) => void
  disconnect: () => void
  sendMessage: (to: string, content: string) => Promise<boolean>
  markMessageRead: (messageId: string) => void
  sendTyping: (to: string, isTyping: boolean) => void
  addReaction: (confessionId: string, reactionType: string) => Promise<boolean>
  addComment: (confessionId: string, content: string) => Promise<boolean>
  joinConfession: (confessionId: string) => void
  leaveConfession: (confessionId: string) => void
  markNotificationRead: (notificationId: string) => void
  markAllNotificationsRead: () => void
  joinRadio: (category?: string) => void
  leaveRadio: (category?: string) => void
}
```

## 6.3 Component Hierarchy

```
App
├── Routes
│   ├── /login -> Login
│   ├── /signup -> Signup
│   └── Protected Routes (Layout)
│       ├── / -> Home
│       ├── /create -> CreateConfession
│       ├── /profile -> Profile
│       ├── /messages -> Messages
│       │   └── /messages/:userId -> Chat
│       ├── /radio -> Radio
│       ├── /notifications -> Notifications
│       ├── /search -> Search
│       ├── /confession/:id -> ConfessionDetail
│       └── /user/:id -> UserProfile
```

---

# 7. AUTHENTICATION & SECURITY

## 7.1 JWT Authentication Flow

```
+---------+                    +---------+                    +---------+
| Client  | ---Login Request--> | Server  | ---Verify Credentials-->|  DB     |
+---------+                    +---------+                    +---------+
     |                              |                              |
     |                              |<--User Data-------------------|
     |                              |                              |
     |<--JWT Token-------------------|                              |
     |                              |                              |
     |----API Request + Token----->|                              |
     |                              |-Verify Token-->|
     |                              |                              |
     |<--Protected Data--------------|                              |
```

## 7.2 Token Structure

```javascript
// JWT Payload
{
  "userId": "string",
  "username": "string",
  "iat": 1234567890,
  "exp": 1234571490  // 7 days
}
```

## 7.3 Security Measures

### Password Security
- bcrypt with 12 salt rounds
- Minimum 6 characters
- Server-side validation

### API Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests/15min)
- Input validation
- XSS protection

### Socket Security
- JWT token in auth header
- Token validation on connection
- Room-based access control

---

# 8. REAL-TIME COMMUNICATION (SOCKET.IO)

## 8.1 Event Handlers

### Connection Events
```javascript
// Server-side
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`)
  
  // Join user's room
  socket.join(`user_${socket.userId}`)
  
  // Track multiple connections per user
  if (!userSockets.has(socket.userId)) {
    userSockets.set(socket.userId, new Set())
  }
  userSockets.get(socket.userId).add(socket.id)
  
  // Broadcast online status
  socket.broadcast.emit('user_online', { userId: socket.userId })
  
  socket.on('disconnect', () => {
    // Cleanup
  })
})
```

### Message Events
```javascript
// Send message
socket.on('send_message', async (data, callback) => {
  const { to, content } = data
  
  // Save to database
  const message = new Message({
    from: socket.userId,
    to,
    content,
    anonymous: true
  })
  await message.save()
  
  // Emit to recipient
  io.to(`user_${to}`).emit('new_message', { message })
  
  // Create notification
  const notification = new Notification({
    userId: to,
    type: 'message',
    title: 'Anonymous Message',
    message: 'Someone has something to say'
  })
  await notification.save()
  io.to(`user_${to}`).emit('new_notification', notification)
  
  callback({ success: true })
})
```

### Reaction Events
```javascript
socket.on('add_reaction', async (data, callback) => {
  const { confessionId, reactionType } = data
  
  // Update confession
  const confession = await Confession.findById(confessionId)
  confession.reactions[reactionType]++
  confession.reactionUsers.push({
    userId: socket.userId,
    type: reactionType
  })
  await confession.save()
  
  // Broadcast to all clients
  io.emit('reaction_updated', {
    confessionId,
    reactionType,
    count: confession.reactions[reactionType]
  })
  
  callback({ success: true })
})
```

### Typing Indicators
```javascript
// Client sends typing event
socket.emit('typing', { to: userId, isTyping: true })

// Server broadcasts to recipient
socket.on('typing', (data) => {
  const { to, isTyping } = data
  io.to(`user_${to}`).emit('typing', {
    from: socket.userId,
    isTyping
  })
})
```

## 8.2 Room Structure

| Room Name | Purpose |
|-----------|---------|
| `user_${userId}` | Private messages & notifications for user |
| `confession_${id}` | Real-time updates for specific confession |
| `radio_${category}` | Radio mode listeners |

---

# 9. AUDIO PROCESSING

## 9.1 Recording Flow

```
+-------------+     +-------------+     +-------------+
|  Get Media  |---->|  Record     |---->|   Stop      |
|  Permission |     |  Audio      |     |  Recording  |
+-------------+     +-------------+     +------+------+
                                                |
                                                v
+-------------+     +-------------+     +-------------+
|   Upload    |<----|  Convert    |<----| Create Blob |
|  to Cloud   |     |  to MP3     |     |             |
+-------------+     +-------------+     +-------------+
```

## 9.2 Audio Recorder Hook

```typescript
function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    // ... recording logic
  }
  
  const stopRecording = () => {
    mediaRecorder.stop()
    // Create blob from chunks
  }
  
  return { isRecording, duration, audioBlob, startRecording, stopRecording }
}
```

## 9.3 Voice Effects (Future Implementation)

| Effect | Description | Implementation |
|--------|-------------|----------------|
| Normal | No effect | Direct playback |
| Whisper | Soft, intimate | Pitch shift + low-pass filter |
| Deep | Lower pitch | Pitch shift down |
| Echo | Mysterious | Delay + reverb |
| Robotic | Complete anonymity | Vocoder effect |

## 9.4 Ambient Sounds

| Sound | Use Case |
|-------|----------|
| Rain | Sad, reflective confessions |
| Crickets | Night-time, intimate |
| Cafe | Casual, everyday |
| Ocean | Calming, peaceful |
| Thunder | Intense, dramatic |
| Fireplace | Warm, cozy |

---

# 10. DEPLOYMENT GUIDE

## 10.1 Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- GitHub account
- Vercel account
- Render account

## 10.2 Backend Deployment (Render)

### Step 1: Create Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/confessly-backend.git
git push -u origin main
```

### Step 2: Create Web Service on Render
1. Go to https://render.com
2. Click "New +" -> "Web Service"
3. Connect GitHub repository
4. Configure:
   - Name: confessly-api
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables
6. Click "Create Web Service"

### Step 3: Environment Variables
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/confessly
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 10.3 Frontend Deployment (Vercel)

### Step 1: Create Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/confessly-frontend.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Click "Add New..." -> "Project"
3. Import GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables
6. Click "Deploy"

### Step 3: Environment Variables
```
VITE_API_URL=https://confessly-api.onrender.com
VITE_SOCKET_URL=https://confessly-api.onrender.com
```

## 10.4 Database Setup (MongoDB Atlas)

1. Create cluster at https://mongodb.com/atlas
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for all)
4. Get connection string
5. Add to environment variables

## 10.5 Cloudinary Setup

1. Create account at https://cloudinary.com
2. Get cloud name, API key, API secret
3. Create upload preset: `confessly_audio`
4. Add credentials to environment variables

---

# 11. ENVIRONMENT CONFIGURATION

## 11.1 Backend .env

```env
# Server
NODE_ENV=development
PORT=5000
SERVER_URL=https://confessly-api.onrender.com
CLIENT_URL=https://confessly.vercel.app

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/confessly?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_64_chars_long
JWT_REFRESH_SECRET=your_refresh_token_secret_different_from_main

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI (optional)
OPENAI_API_KEY=sk-your_openai_api_key

# Email (optional)
RESEND_API_KEY=re_your_resend_api_key
```

## 11.2 Frontend .env

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_ENV=development
VITE_APP_NAME=Confessly
```

---

# 12. MASTER CREDENTIALS FILE

## 12.1 Location
`/confessly/credentials/master-credentials.js`

## 12.2 Structure

```javascript
module.exports = {
  // Database
  DATABASE: {
    MONGODB_URI: 'mongodb+srv://...',
    DB_NAME: 'confessly',
  },
  
  // JWT
  JWT: {
    SECRET: 'your_secret',
    EXPIRES_IN: '7d',
    REFRESH_SECRET: 'your_refresh_secret',
    REFRESH_EXPIRES_IN: '30d',
  },
  
  // Server
  SERVER: {
    URL: 'https://confessly-api.onrender.com',
    PORT: 5000,
  },
  
  // Client
  CLIENT: {
    URL: 'https://confessly.vercel.app',
  },
  
  // Socket.IO
  SOCKET: {
    CORS_ORIGINS: ['https://confessly.vercel.app'],
  },
  
  // Cloudinary
  CLOUDINARY: {
    CLOUD_NAME: 'your_cloud_name',
    API_KEY: 'your_api_key',
    API_SECRET: 'your_api_secret',
  },
  
  // OpenAI
  OPENAI: {
    API_KEY: 'sk-your_key',
    MODEL: 'text-moderation-latest',
  },
  
  // Email
  EMAIL: {
    PROVIDER: 'resend',
    API_KEY: 're_your_key',
    FROM: 'Confessly <noreply@confessly.app>',
  },
  
  // Security
  SECURITY: {
    BCRYPT_SALT_ROUNDS: 12,
    PASSWORD_MIN_LENGTH: 6,
  },
  
  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
    MAX_REQUESTS: 100,
  },
}
```

---

# 13. API ENDPOINTS REFERENCE

## 13.1 Complete Endpoint List

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | No | Register user |
| POST | /api/auth/login | No | Login user |
| POST | /api/auth/logout | Yes | Logout user |
| GET | /api/auth/me | Yes | Get current user |
| PUT | /api/auth/profile | Yes | Update profile |
| POST | /api/auth/change-password | Yes | Change password |
| GET | /api/feed | No | Get feed |
| GET | /api/feed/following | Yes | Get following feed |
| GET | /api/feed/trending | No | Get trending |
| GET | /api/feed/hot | No | Get hot |
| GET | /api/feed/search | No | Search |
| POST | /api/confessions | Yes | Create confession |
| GET | /api/confessions/:id | No | Get confession |
| DELETE | /api/confessions/:id | Yes | Delete confession |
| POST | /api/confessions/:id/react | Yes | Add reaction |
| GET | /api/confessions/:id/chain | No | Get chain |
| GET | /api/users/profile | Yes | Get profile |
| GET | /api/users/:id | No | Get user |
| POST | /api/users/:id/follow | Yes | Follow user |
| POST | /api/users/:id/unfollow | Yes | Unfollow user |
| GET | /api/users/leaderboard | No | Get leaderboard |
| GET | /api/messages | Yes | Get conversations |
| GET | /api/messages/:userId | Yes | Get messages |
| POST | /api/messages/:userId | Yes | Send message |
| GET | /api/messages/unread/count | Yes | Get unread count |
| GET | /api/comments/:confessionId | No | Get comments |
| POST | /api/comments/:confessionId | Yes | Add comment |
| POST | /api/comments/:commentId/reply | Yes | Add reply |
| GET | /api/notifications | Yes | Get notifications |
| PUT | /api/notifications/:id/read | Yes | Mark as read |
| PUT | /api/notifications/read-all | Yes | Mark all read |
| POST | /api/upload/audio | Yes | Upload audio |
| GET | /api/health | No | Health check |

---

# 14. CODE STRUCTURE

## 14.1 Backend File Structure

```
backend/
├── server.js              # Main server entry
├── package.json           # Dependencies
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── confessions.js    # Confession routes
│   ├── feed.js           # Feed routes
│   ├── users.js          # User routes
│   ├── messages.js       # Message routes
│   ├── comments.js       # Comment routes
│   ├── notifications.js  # Notification routes
│   └── upload.js         # Upload routes
├── models/
│   ├── User.js           # User model
│   ├── Confession.js     # Confession model
│   ├── Comment.js        # Comment model
│   ├── Message.js        # Message model
│   ├── Notification.js   # Notification model
│   ├── Follow.js         # Follow model
│   └── index.js          # Model exports
├── middleware/
│   └── auth.js           # Auth middleware
├── socket/
│   └── handlers.js       # Socket event handlers
└── utils/
    └── nameGenerator.js  # Anonymous name generator
```

## 14.2 Frontend File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── ConfessionCard.tsx
│   │   └── CategoryFilter.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── CreateConfession.tsx
│   │   ├── Profile.tsx
│   │   ├── Messages.tsx
│   │   ├── Chat.tsx
│   │   ├── Radio.tsx
│   │   ├── Notifications.tsx
│   │   ├── Search.tsx
│   │   ├── ConfessionDetail.tsx
│   │   └── UserProfile.tsx
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── socketStore.ts
│   │   ├── feedStore.ts
│   │   └── notificationStore.ts
│   ├── hooks/
│   │   ├── useAudioRecorder.ts
│   │   ├── useInfiniteScroll.ts
│   │   └── useDebounce.ts
│   ├── utils/
│   │   ├── nameGenerator.ts
│   │   ├── formatters.ts
│   │   └── audio.ts
│   ├── types/
│   │   └── index.ts
│   ├── constants/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

---

# 15. ALGORITHMS & BUSINESS LOGIC

## 15.1 Anonymous Name Generator (Weighted Rarity)

```javascript
function selectCreatureByRarity() {
  const roll = Math.random() * 100
  
  // Legendary: 5% chance
  if (roll < 5) {
    return legendaryCreatures[random(legendaryCreatures.length)]
  }
  
  // Rare: 10% chance (5-15)
  if (roll < 15) {
    return rareCreatures[random(rareCreatures.length)]
  }
  
  // Uncommon: 25% chance (15-40)
  if (roll < 40) {
    return uncommonCreatures[random(uncommonCreatures.length)]
  }
  
  // Common: 60% chance (40-100)
  return commonCreatures[random(commonCreatures.length)]
}

function generateAnonymousName() {
  const color = COLORS[random(COLORS.length)]
  const creature = selectCreatureByRarity()
  const location = LOCATIONS[random(LOCATIONS.length)]
  const number = random(10) + 1
  
  return {
    color,
    creature: creature.name,
    creatureRarity: creature.rarity,
    location,
    number,
    full: `${color} ${creature.name} of ${location} #${number}`
  }
}
```

## 15.2 Heat Score Algorithm

```javascript
function calculateHeatScore(confession) {
  const reactions = sum(Object.values(confession.reactions))
  const views = confession.views
  const comments = confession.commentsCount
  const hoursSincePosted = (Date.now() - confession.createdAt) / (1000 * 60 * 60)
  
  // Engagement score
  const engagementScore = (reactions * 2) + (views * 0.1) + (comments * 3)
  
  // Time decay (posts older than 48h get reduced score)
  const timeDecay = Math.max(0, 1 - (hoursSincePosted / 48))
  
  return Math.round(engagementScore * (1 + timeDecay))
}
```

## 15.3 XP & Level System

```javascript
// XP Rewards
const XP_REWARDS = {
  POST_CONFESSION: 10,
  RECEIVE_REACTION: 2,
  POST_COMMENT: 5,
  RECEIVE_COMMENT: 3,
  FOLLOW_USER: 3,
  SEND_MESSAGE: 1,
  DAILY_LOGIN: 5,
}

// Level calculation
function calculateLevel(xp) {
  return Math.floor(xp / 100) + 1
}

// Level titles
const LEVEL_TITLES = [
  { min: 1, max: 9, title: 'New Whisperer' },
  { min: 10, max: 24, title: 'Curious Soul' },
  { min: 25, max: 49, title: 'Open Heart' },
  { min: 50, max: 99, title: 'Truth Seeker' },
  { min: 100, max: 199, title: 'Confession Master' },
  { min: 200, max: 299, title: 'Legendary Voice' },
  { min: 300, max: 300, title: 'Eternal Whisper' },
]
```

## 15.4 Streak System

```javascript
function updateStreak(user) {
  const now = new Date()
  const lastPost = user.lastPostDate
  
  if (!lastPost) {
    user.streak = 1
    user.lastPostDate = now
    return { streak: 1, milestone: null }
  }
  
  const lastPostDate = new Date(lastPost)
  lastPostDate.setHours(0, 0, 0, 0)
  
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  
  const diffDays = Math.floor((today - lastPostDate) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    // Already posted today
    return { streak: user.streak, milestone: null }
  } else if (diffDays === 1) {
    // Posted yesterday, increment streak
    user.streak += 1
    user.lastPostDate = now
    
    // Check milestones
    const milestones = [7, 30, 100, 365]
    const milestone = milestones.includes(user.streak) ? user.streak : null
    
    return { streak: user.streak, milestone }
  } else {
    // Streak broken
    user.streak = 1
    user.lastPostDate = now
    return { streak: 1, milestone: null, broken: true }
  }
}
```

---

# 16. TESTING STRATEGY

## 16.1 Unit Testing

### Backend (Jest)
```javascript
// Example test
describe('Auth Service', () => {
  test('should register new user', async () => {
    const userData = {
      username: 'testuser',
      password: 'password123',
      gender: 'Male',
      ageVerified: true
    }
    
    const response = await request(app)
      .post('/api/auth/signup')
      .send(userData)
    
    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.token).toBeDefined()
  })
})
```

### Frontend (Vitest)
```typescript
// Example test
describe('Auth Store', () => {
  test('should login user', async () => {
    const store = useAuthStore.getState()
    
    const result = await store.login({
      username: 'test',
      password: 'password'
    })
    
    expect(result).toBe(true)
    expect(store.isAuthenticated).toBe(true)
  })
})
```

## 16.2 Integration Testing

- API endpoint testing
- Database operations
- Socket.IO events
- File upload/download

## 16.3 E2E Testing

- User registration flow
- Create confession flow
- Messaging flow
- Follow/unfollow flow

---

# 17. TROUBLESHOOTING GUIDE

## 17.1 Common Issues

### Backend Won't Start
```
Error: Cannot find module 'express'
Solution: Run npm install
```

### MongoDB Connection Failed
```
Error: MongoNetworkError
Solution: Check MONGODB_URI, whitelist IP in Atlas
```

### JWT Verification Failed
```
Error: JsonWebTokenError: invalid token
Solution: Check JWT_SECRET matches, token not expired
```

### Socket.IO Connection Failed
```
Error: Connection refused
Solution: Check CORS origins, server running
```

### Frontend Build Failed
```
Error: Cannot find module '@/components/...'
Solution: Check vite.config.ts path aliases
```

## 17.2 Debug Mode

### Backend
```javascript
// Enable debug logging
DEBUG=* npm run dev
```

### Frontend
```javascript
// React DevTools
// Install browser extension
```

## 17.3 Logs Location

| Service | Log Location |
|---------|--------------|
| Backend | Console / Render Dashboard |
| Frontend | Browser DevTools Console |
| MongoDB | Atlas Dashboard |

---

# 18. MAINTENANCE & UPDATES

## 18.1 Regular Maintenance

### Weekly
- Check error logs
- Monitor server performance
- Review user reports

### Monthly
- Update dependencies
- Review security patches
- Backup database

### Quarterly
- Performance optimization
- Feature usage analysis
- Security audit

## 18.2 Dependency Updates

```bash
# Backend
cd backend
npm outdated
npm update

# Frontend
cd frontend
npm outdated
npm update
```

## 18.3 Database Backup

```bash
# MongoDB Atlas provides automated backups
# For manual backup:
mongodump --uri="mongodb+srv://..." --out=backup/
```

## 18.4 Scaling Considerations

### Horizontal Scaling
- Use MongoDB replica sets
- Deploy multiple API servers
- Use load balancer

### Caching
- Redis for session storage
- CDN for static assets
- API response caching

### Performance
- Database indexing
- Query optimization
- Connection pooling

---

# APPENDIX

## A. Glossary

| Term | Definition |
|------|------------|
| Confession | Anonymous post (text or voice) |
| Heat Score | Engagement metric for trending |
| XP | Experience points for gamification |
| Streak | Consecutive days posting |
| Chain | Reply to another confession |
| Ambient | Background sound for voice |

## B. Abbreviations

| Abbreviation | Full Form |
|--------------|-----------|
| API | Application Programming Interface |
| JWT | JSON Web Token |
| CORS | Cross-Origin Resource Sharing |
| ODM | Object Document Mapper |
| REST | Representational State Transfer |
| WS | WebSocket |
| DB | Database |

## C. References

1. Express.js Documentation: https://expressjs.com
2. MongoDB Documentation: https://docs.mongodb.com
3. Socket.IO Documentation: https://socket.io/docs
4. React Documentation: https://react.dev
5. Tailwind CSS Documentation: https://tailwindcss.com

## D. Contact Information

**Project Owner:** Nikunj Singh  
**Email:** nikunj.singh.2007@outlook.com  
**Phone:** +91 9211293576  

---

**END OF DOCUMENT**

*This document contains complete technical specifications for the Confessly platform. For updates and changes, refer to the project repository.*
