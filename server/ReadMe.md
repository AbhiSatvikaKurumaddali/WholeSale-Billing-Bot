# Server — Wholesale Billing Bot (Backend)

Express + MongoDB API for the Wholesale Billing Bot. Handles authentication, product/customer/billing CRUD, dashboard analytics, and the chatbot endpoint.

## Tech Stack

- Node.js, Express 5
- MongoDB with Mongoose 9
- JWT authentication, bcrypt password hashing
- OpenAI API (optional) for the chatbot

## Setup

```bash
npm install
cp .env.example .env   
npm run seed           
npm run dev              
```

API runs on `http://localhost:5000/api` by default.

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port to listen on (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs — use a long random string |
| `OPENAI_API_KEY` | (Optional) enables AI-powered chatbot responses; leave empty to use the rule-based fallback |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend URL, used for CORS |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start` | Start normally |
| `npm run seed` | Drop and reseed the database with sample users, products, customers, and bills |

## Folder Structure
```
server/

├── controllers/   # Request handlers / business logic — see controllers/README.md

├── models/         # Mongoose schemas — see models/README.md

├── routes/          # Express route definitions — see routes/README.md

├── middleware/        # Auth guard and error handler — see middleware/README.md

├── seed.js               # Database seeding script

└── server.js              # App entry point — middleware, routes, DB connection
```
