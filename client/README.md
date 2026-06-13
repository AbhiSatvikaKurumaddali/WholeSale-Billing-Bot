# Client — Wholesale Billing Bot (Frontend)

React + Vite frontend for the Wholesale Billing Bot. Provides the UI for authentication, product/customer/billing management, a sales dashboard, and an AI chatbot assistant.

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Recharts (dashboard charts)
- react-hook-form
- lucide-react (icons)
- react-hot-toast (notifications)

## Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` by default.

## Environment Variables

`.env` file:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, `https://wholesale-billing-bot.onrender.com`. Defaults to `http://localhost:5000/api` if not set. |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Folder Structure

```
client/

├── public/        # Static files served as-is (favicon, icons)

└── src/

├── pages/        # Top-level routed pages — see src/pages/README.md

├── components/   # Reusable UI components — see src/components/README.md

├── contexts/      # React context providers — see src/contexts/README.md

├── services/       # API client — see src/services/README.md

├── utils/           # Formatting helpers — see src/utils/README.md

├── assets/           # Images and static assets

├── App.jsx           # Route definitions

└── main.jsx           # App entry point
```
