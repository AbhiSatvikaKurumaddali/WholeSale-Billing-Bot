# Wholesale Billing Bot

A **MERN stack application** for managing wholesale inventory, billing, and customer records. Helps wholesalers streamline operations with stock tracking, invoice generation, a sales dashboard, customer management, and an AI-powered chatbot assistant.

**Live demo:**
- Frontend: https://wholesale-billing-bot.vercel.app
- Backend API: https://wholesale-billing-bot.onrender.com/api

> Note: the backend is hosted on Render's free tier, so the first request after a period of inactivity may take 30-60 seconds while the server wakes up.

---

## Features

- **Authentication & Authorization**
  - Role-based access (Admin, Staff)
  - JWT-secured login with bcrypt password hashing
  - New staff registrations require admin approval before login
- **Dashboard**
  - Sales analytics with charts (Recharts)
  - KPIs and quick-insight summary cards
- **Inventory Management**
  - Add, update, delete products
  - Category filters
  - Low-stock alerts based on configurable reorder levels
- **Billing System**
  - Create invoices with line items
  - Auto stock deduction on bill creation, with stock-availability checks
  - Auto-generated, race-condition-safe invoice numbers (`INV-YYYYMM-####`)
- **Customer Management**
  - Store customer details
  - Track purchase history
- **AI Chatbot**
  - Answers questions about stock levels, low-stock items, today's sales, and best sellers
  - Uses OpenAI (GPT-3.5) if an API key is configured, otherwise falls back to a built-in rule-based engine
- **Modern UI**
  - Tailwind CSS styling
  - Toast notifications via react-hot-toast

---

## Tech Stack

**Frontend**
- React 19 (Vite)
- Tailwind CSS
- Axios
- React Router DOM
- Recharts
- react-hook-form
- lucide-react (icons)
- react-hot-toast

**Backend**
- Node.js
- Express 5
- MongoDB + Mongoose 9
- JWT Authentication
- bcryptjs
- CORS
- OpenAI API (optional)

---

## 📂 Project Structure
```
wholesale-billing-bot/

├── server/

│   ├── controllers/   # API logic

│   ├── middleware/    # Auth & error handling

│   ├── models/        # Mongoose schemas (User, Product, Customer, Bill, Counter)

│   ├── routes/        # API endpoints

│   ├── utils/         # Shared helpers

│   ├── seed.js        # Database seeding script

│   ├── .env           # Environment variables 

│   └── server.js      # Backend entry point

│

└── client/

├── src/

│   ├── components/  # ChatBot, modals, layout

│   ├── contexts/    # AuthContext (auth state)

│   ├── pages/       # Home, Login, Register, Dashboard, Products, Billing, Bills, Customers, AdminUsers

│   ├── services/    # Axios API client

│   ├── utils/       # Formatting helpers

│   ├── App.jsx      # Routing

│   └── main.jsx     # React entry point

└── .env             # Frontend env variables 
```
