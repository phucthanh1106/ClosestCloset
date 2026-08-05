# ClosestCloset 👕

A digital closet app where you can store, organize, and manage all your favorite pieces of clothing in one place. No more scrolling through endless Instagram posts or screenshots to remember what you bought—just open the app and find your fit!

**Live Demo:** [https://closestcloset.onrender.com/](https://closestcloset.onrender.com/)
---

## 🎯 What's This About?

Ever had that moment where you came across something that you really really want to get but now you're just a broke college student earning below minimum wage from your on-campus job and you still want to save that piece of clothing somewhere in case you get an internship and suddenly feel like you're living the lavish life of a billionaire? This project serves that purpose for digitally storing your wishlist of clothes.

---

## 🚀 Getting Started

### Installation

1. **Clone the repo:**
```bash
git clone https://github.com/yourusername/ClosestCloset.git
cd ClosestCloset
```

2. **Set up the backend:**
```bash
cd server
npm install
```

3. **Create a `.env` file in the `server` directory:**
```
PORT=4000
MONGO_URI=your_mongodb_connection_string
SECRET=your_jwt_secret_key
```

4. **Start the backend:**
```bash
node server
```

5. **Set up the frontend:**
```bash
cd ../client
npm install
```

6. **Start the frontend dev server:**
```bash
npm run dev
```

The app should open at `http://localhost:5173` (or whatever Vite tells you).

---

## 🏗️ Project Structure

```
ClosestCloset/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components (Login, Signup, MyCloset, etc.)
│   │   ├── hooks/         # Custom React hooks (useLogin, useSignup, etc.)
│   │   ├── context/       # React Context for auth state
│   │   └── styles/        # Tailwind CSS configuration
│   └── vite.config.js
│
└── server/                 # Express backend
    ├── controllers/       # Business logic
    ├── models/           # MongoDB schemas
    ├── routes/           # API routes
    ├── middlewares/      # Middleware (auth, etc.)
    └── server.js         # Main server file
```

--- 

## 💡 Why I Built This


