# ClosestCloset RAG Chatbot Implementation Plan

## 📋 Tech Stack Recommendation

### Backend (Node.js)
- **LLM API**: OpenAI (GPT-4 or GPT-4 mini for cost efficiency)
- **Vector Database**: Pinecone (free tier: 1 pod, sufficient for personal closet)
- **Embedding Model**: OpenAI's `text-embedding-3-small` (built into OpenAI API)
- **Additional Packages**:
  - `openai` - for LLM and embeddings
  - `@pinecone-database/pinecone` - vector DB client
  - `dotenv` - environment variables

### Frontend (React)
- Add a new Chat page/component
- Socket.io (optional but recommended for streaming responses)
- Simple UI: message input + chat history display

---

## 🏗️ Architecture Overview

```
User Question (React Chat UI)
    ↓
Backend Chat Endpoint
    ↓
1. Query Pinecone (retrieve relevant closet items)
    ↓
2. Build prompt with retrieved items + user question
    ↓
3. Call OpenAI API (with context)
    ↓
4. Stream response back to frontend
```

### Data Flow - Indexing (happens when user uploads items):
```
New Clothing Item Created in MongoDB
    ↓
Trigger embedding process
    ↓
Generate text description: "navy blue cotton t-shirt, casual, summer"
    ↓
Create embedding (vector) via OpenAI
    ↓
Store in Pinecone with item metadata (ID, color, category, etc.)
```

---

## 📦 Backend Implementation Steps

### Step 1: Install Dependencies
```bash
cd server
npm install openai @pinecone-database/pinecone dotenv
```

### Step 2: Set Up Environment Variables
Add to `server/.env`:
```
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=us-east-1-aws (or your region)
PINECONE_INDEX_NAME=closestcloset-items
```

### Step 3: Create Pinecone Service (`server/services/pineconeService.js`)
```javascript
const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize index (you'll do this once)
async function initializeIndex() {
  const indexName = process.env.PINECONE_INDEX_NAME;
  // Check if index exists, create if not
}

// Generate embedding for item description
async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

// Index a clothing item
async function indexClothingItem(item) {
  const description = `${item.type} ${item.color} ${item.material} ${item.occasion} ${item.season}`;
  const embedding = await generateEmbedding(description);
  
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
  await index.upsert([
    {
      id: item._id.toString(),
      values: embedding,
      metadata: {
        type: item.type,
        color: item.color,
        material: item.material,
        occasion: item.occasion,
        season: item.season,
        userId: item.userId.toString(),
      },
    },
  ]);
}

// Search for relevant items
async function searchRelevantItems(query, userId, topK = 5) {
  const queryEmbedding = await generateEmbedding(query);
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
  
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    filter: { userId: userId },
    includeMetadata: true,
  });
  
  return results.matches;
}

module.exports = {
  generateEmbedding,
  indexClothingItem,
  searchRelevantItems,
};
```

### Step 4: Create Chat Controller (`server/controllers/chatController.js`)
```javascript
const { OpenAI } = require('openai');
const { searchRelevantItems } = require('../services/pineconeService');
const User = require('../models/usersModel');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function chat(req, res) {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Step 1: Search for relevant clothing items from user's closet
    const relevantItems = await searchRelevantItems(message, userId.toString());

    // Step 2: Build context from retrieved items
    let context = 'User\'s Closet Items:\n';
    if (relevantItems.length > 0) {
      relevantItems.forEach((item) => {
        context += `- ${item.metadata.color} ${item.metadata.type} (${item.metadata.occasion})\n`;
      });
    } else {
      context += '(No specific items found, providing general advice)\n';
    }

    // Step 3: Create system prompt
    const systemPrompt = `You are a personal styling assistant for a digital closet app. 
You help users find outfits and style advice based on their actual wardrobe. 
Be friendly, practical, and specific to their clothing items.

${context}`;

    // Step 4: Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4-mini', // or 'gpt-3.5-turbo' for cost savings
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    res.json({
      message: response.choices[0].message.content,
      sources: relevantItems.map(item => ({
        id: item.id,
        metadata: item.metadata,
      })),
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
}

module.exports = { chat };
```

### Step 5: Create Chat Route (`server/routes/chatRouter.js`)
```javascript
const express = require('express');
const requireAuth = require('../middlewares/requireAuth');
const { chat } = require('../controllers/chatController');

const router = express.Router();

router.post('/', requireAuth, chat);

module.exports = router;
```

### Step 6: Update `server/server.js`
Add to your server initialization:
```javascript
const chatRouter = require('./routes/chatRouter');

// ... existing routes ...

app.use('/api/chat', chatRouter);
```

### Step 7: Update Item Creation to Index Items
Modify `server/controllers/itemCardsController.js` (or wherever items are created):
```javascript
const { indexClothingItem } = require('../services/pineconeService');

// In your createItem function, after saving to MongoDB:
try {
  await indexClothingItem(newItem);
} catch (error) {
  console.error('Failed to index item:', error);
  // Don't fail the whole request, but log it
}
```

---

## 🎨 Frontend Implementation

### Step 1: Create Chat Page (`client/src/pages/ChatBot.jsx`)
```javascript
import { useState, useRef, useEffect } from 'react';
import '../styles/chatbot.css';

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMessage = {
        role: 'assistant',
        content: data.message,
        sources: data.sources,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h1>Style Assistant</h1>
        <p>Ask me for outfit ideas and styling tips!</p>
      </div>
      
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <p>{msg.content}</p>
            {msg.sources && msg.sources.length > 0 && (
              <div className="message-sources">
                <small>Based on: {msg.sources.map(s => `${s.metadata.color} ${s.metadata.type}`).join(', ')}</small>
              </div>
            )}
          </div>
        ))}
        {loading && <div className="message assistant loading">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask me anything about your style..."
          disabled={loading}
        />
        <button onClick={handleSendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
```

### Step 2: Add Chat Route (`client/src/routes/routes.jsx`)
```javascript
import ChatBot from '../pages/ChatBot';

// Add to your routes array:
{
  path: '/chat',
  element: <ChatBot />,
}
```

### Step 3: Style the Chat (`client/src/styles/chatbot.css`)
```css
.chatbot-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  max-width: 700px;
  margin: 0 auto;
}

.chatbot-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
  word-wrap: break-word;
}

.message.user {
  align-self: flex-end;
  background-color: #007AFF;
  color: white;
}

.message.assistant {
  align-self: flex-start;
  background-color: #f0f0f0;
  color: #333;
}

.message-sources {
  margin-top: 8px;
  font-size: 0.85em;
  opacity: 0.8;
  font-style: italic;
}

.input-container {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.input-container input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 1em;
}

.input-container button {
  padding: 12px 24px;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
}

.loading {
  opacity: 0.6;
  font-style: italic;
}
```

---

## 🚀 Deployment Checklist

1. **Set up Pinecone account**: https://www.pinecone.io (free tier available)
2. **Get OpenAI API key**: https://platform.openai.com/api-keys
3. **Create Pinecone index**: Name it `closestcloset-items` with dimension 1536
4. **Add environment variables** to your deployment platform (Render, Vercel, etc.)
5. **Index existing items**: Run a script to embed all existing clothing items in your DB

### Optional: Indexing Script (`server/scripts/indexExistingItems.js`)
```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const ItemCard = require('../models/itemCardsModel');
const { indexClothingItem } = require('../services/pineconeService');

async function indexAllItems() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const items = await ItemCard.find();
    
    for (const item of items) {
      try {
        await indexClothingItem(item);
        console.log(`Indexed: ${item.type}`);
      } catch (error) {
        console.error(`Failed to index ${item._id}:`, error);
      }
    }
    
    console.log('All items indexed!');
    process.exit(0);
  } catch (error) {
    console.error('Indexing failed:', error);
    process.exit(1);
  }
}

indexAllItems();
```

Run with: `node server/scripts/indexExistingItems.js`

---

## 💰 Cost Estimation

- **OpenAI API**: ~$0.005-0.02 per chat message (depending on model)
- **Pinecone**: Free tier = sufficient for personal use
- **Total monthly**: $5-20 for moderate usage

---

## 🎯 Next Steps

1. Set up Pinecone account and get API keys
2. Install backend dependencies
3. Implement Pinecone service
4. Create chat controller & routes
5. Build React chat UI
6. Test with sample messages
7. Index existing items
8. Deploy!

---

## 📚 Useful Resources

- Pinecone Docs: https://docs.pinecone.io/
- OpenAI API Docs: https://platform.openai.com/docs/api-reference
- RAG Best Practices: https://docs.pinecone.io/guides/retrieval-augmented-generation

