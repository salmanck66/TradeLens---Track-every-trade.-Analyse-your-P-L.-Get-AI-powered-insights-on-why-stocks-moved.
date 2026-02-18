# 📈 TradeLens — AI-Powered Trade Journal & P/L Analyzer

<div align="center">

![TradeLens Banner](https://img.shields.io/badge/TradeLens-P%2FL%20Analyzer-30d158?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0yMyA2bC0zLjUgMy41LTQtNC03IDcuNS0yLjUtMi41TDAgMTZsMSAxIDUuNS02IDIuNSAyLjUgNy03LjUgNCA0IDQuNS00LjV6Ii8+PC9zdmc+)
![Next.js](https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth.js-black?style=for-the-badge&logo=auth0&logoColor=white)

**Track every trade. Analyse your P/L. Get AI-powered insights on why stocks moved.**

[✨ Features](#features) · [🚀 Quick Start](#quick-start) · [📸 Screenshots](#screenshots) · [🛠 Tech Stack](#tech-stack) · [🔮 Roadmap](#roadmap)

</div>

---

## ✨ Features

### 📊 Trade Tracking
- Log trades with **Date, Symbol, Qty, Entry, Exit, SL, Target**
- Supports **LONG & SHORT** positions
- SL and Target are **optional** — add them only when needed
- **Edit any trade** anytime — especially useful to add Exit price when closing positions
- One-click **delete** with confirmation

### 💰 P/L Analytics
- Real-time **Total P/L, Win Rate, Avg Win/Loss** stats
- **Monthly P/L bar chart** — see your best and worst months visually
- **R:R ratio** auto-calculated when SL & Target are set
- Filter trades by **WIN / LOSS / OPEN / ALL**

### 🤖 AI-Powered Insights
- Click **"✦ AI"** on any trade to get Claude AI analysis
- For **open positions**: key factors, risk assessment, news to watch
- For **closed trades**: why the stock moved, risk management review, key lesson
- **Market Intelligence panel**: AI-generated top movers + market news (Results, Orders, Policy, IPO, Macro)

### 🔐 Authentication
- **Google login** and **GitHub login** via NextAuth.js
- Each user sees only **their own trades** — fully isolated
- Session-based auth, no tokens to manage manually

### ☁️ Cloud Storage
- All trades saved to **MongoDB Atlas** — persists across devices
- Works on **phone, tablet, desktop** — fully responsive
- iOS-style **glass morphism design**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Google OAuth credentials
- GitHub OAuth credentials

### 1. Clone & Install

```bash
git clone https://github.com/salmanck66/tradelens.git
cd tradelens
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tradelens

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here   # run: openssl rand -base64 32

# Google OAuth → console.cloud.google.com
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx

# GitHub OAuth → github.com/settings/developers
GITHUB_CLIENT_ID=xxxx
GITHUB_CLIENT_SECRET=xxxx
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — login with Google or GitHub and start tracking!

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | NextAuth.js (Google + GitHub) |
| Database | MongoDB Atlas + Mongoose |
| AI | Claude API (Anthropic) |
| Styling | Pure CSS (Glass morphism) |
| Hosting | Vercel (recommended) |

> **No separate backend needed** — Next.js API routes handle everything in one project.

---

## 📁 Project Structure

```
tradelens/
├── app/
│   ├── page.js                          # Main UI (login + dashboard)
│   ├── layout.js                        # Root layout with SessionProvider
│   └── api/
│       ├── auth/[...nextauth]/route.js  # Google + GitHub auth
│       └── trades/
│           ├── route.js                 # GET all, POST new trade
│           └── [id]/route.js            # PUT edit, DELETE trade
├── lib/
│   └── mongodb.js                       # DB connection (cached)
├── models/
│   └── Trade.js                         # Mongoose trade schema
└── .env.local                           # Your secrets (never commit!)
```

---

## ☁️ Deploy to Vercel (Free)

```bash
npm install -g vercel
vercel
```

Add your environment variables in Vercel dashboard → Settings → Environment Variables.

Update your OAuth redirect URLs to your Vercel domain:
```
https://yourapp.vercel.app/api/auth/callback/google
https://yourapp.vercel.app/api/auth/callback/github
```

---

## 🔮 Roadmap

- [ ] Real-time stock price integration (NSE API)
- [ ] Weekly/monthly PDF report export
- [ ] Portfolio heat map
- [ ] Trade screenshot upload
- [ ] Broker import (Zerodha, Groww CSV)
- [ ] Push notifications for open positions
- [ ] Dark/light theme toggle

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

```bash
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">

Built with ♥ by [Salman CK](https://github.com/salmanck66)

⭐ Star this repo if it helped you!

</div>