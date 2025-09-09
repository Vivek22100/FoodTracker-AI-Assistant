## FoodTracker – Food Expiry & Nutrition Tracker (with AI Assistant)

A full‑stack app to track your food inventory, monitor expiry dates, view nutrition, and chat with an AI assistant for quick insights and actions.

### 🛠️ Tech Stack
- **Frontend**: React + Vite (port 5173, proxy to API)
- **Backend**: Node.js, Express, MongoDB
- **Auth**: JWT (Bearer token)
- **AI**: Hugging Face Inference API
- **Nutrition**: Nutritionix (or your preferred provider)

### ✨ Features
- **Auth**: Register, Login, Protected routes
- **Inventory**: Add/Edit/Delete food items; dashboard groups by Fresh / Expiring Soon / Expired
- **Shelf Life**: Auto-calculate expiry from default shelf‑life data
- **Nutrition**: Fetch and display nutrition info
- **AI Chatbot**: Natural language queries (what’s expiring, add items, nutrition Q&A)
- **Notifications**: Email/push hooks for upcoming expiries (service layer included)

---

## 📂 Project Structure
```text
FoodTracker/
├─ backend/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ middleware/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ scripts/
│  │  ├─ services/
│  │  └─ server.js
│  ├─ package.json
│  └─ env.example
├─ frontend/
│  ├─ src/
│  │  ├─ api/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ App.jsx, main.jsx
│  │  └─ styles
│  ├─ vite.config.js
│  └─ package.json
└─ README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally or connection string

### 1) Backend setup
```bash
cd backend
npm install

# Create environment file
copy env.example .env  # Windows (PowerShell)
# or: cp env.example .env  # macOS/Linux

# Start API (port 5000)
npm run dev
```

Backend will connect to MongoDB (default: `mongodb://localhost:27017/foodtracker`) and initialize shelf‑life data on first run.

### 2) Frontend setup
```bash
cd frontend
npm install

# Start Vite dev server (port 5173)
npm run dev
```

The frontend proxies `/api/*` to `http://localhost:5000` (configured in `vite.config.js`).

---

## 🔧 Environment Variables (backend/.env)

Required (see `backend/env.example` for full list):

- `PORT` (default `5000`)
- `NODE_ENV` (`development` | `production`)
- `MONGODB_URI` (e.g., `mongodb://localhost:27017/foodtracker`)
- `JWT_SECRET` (set a strong random string)
- `JWT_EXPIRE` (e.g., `7d`)
- `HUGGING_FACE_API_KEY` (for AI)
- `HF_CHAT_MODEL` (e.g., `meta-llama/Meta-Llama-3-8B-Instruct`)
- `NUTRITIONIX_APP_ID`, `NUTRITIONIX_API_KEY`
- `FRONTEND_URL` (default `http://localhost:5173`)

---

## 📘 Usage Notes

### Auth
- Token is stored in `localStorage` on successful login/register
- Frontend attaches `Authorization: Bearer <token>` for all API calls via Axios interceptors

### Food data model (important)
- `quantity` is an object: `{ amount: number, unit: string }`
- `category` must be one of: `fruits, vegetables, dairy, meat, poultry, seafood, grains, nuts, legumes, beverages, snacks, condiments, frozen, canned, bakery, other`

### Key Routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/food` → returns `{ foodItems, pagination }`
- `POST /api/food` → create item (requires auth)
- `PUT /api/food/:id`, `DELETE /api/food/:id`
- `GET /api/ai/...` → chatbot endpoints

---

## 🧪 Scripts

Backend
```bash
npm run dev        # start with nodemon
npm start          # start with node
npm run init-data  # optional data initialization script
```

Frontend
```bash
npm run dev
npm run build
npm run preview
```

---

## 🐛 Troubleshooting

- Frontend loads but API calls fail with 401/403
  - Ensure you’re logged in and a token exists in `localStorage`
  - Verify backend running on 5000; CORS `FRONTEND_URL` matches Vite URL

- 400 Bad Request when creating food
  - Ensure the request body matches the backend schema (notably `quantity.amount` and `quantity.unit`)
  - `category` must be a valid enum value (lowercase)

- Port conflicts
  - Frontend uses 5173; backend uses 5000. Update `vite.config.js`/`.env` if needed

- MongoDB connection issues
  - Check your `MONGODB_URI`; verify mongod is running

---
