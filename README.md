<div align="center">

# FitForge

### AI Resume Intelligence & Career Matching Platform

**Know your fit. Close the gap.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-6C5FE6?style=for-the-badge&logo=vercel)](YOUR_VERCEL_LINK_HERE)
[![Built With](https://img.shields.io/badge/Built%20With-React%20%2B%20Gemini-blue?style=for-the-badge&logo=react)](https://github.com/2345-aleena/fitforge)
[![Hackathon](https://img.shields.io/badge/Code%20With%20Kiro-Hackathon%202026-orange?style=for-the-badge)](https://github.com/2345-aleena/fitforge)

</div>

---

## What is FitForge?

Most resume tools tell you a match percentage and stop there.

**FitForge thinks like a recruiter.**

Paste your resume. Paste a job description. In under 20 seconds, FitForge runs 6 deep analysis modules and tells you not just *if* you fit — but *how* three different types of recruiters would read your resume, which of your skills are silently aging, what interview questions your gaps will trigger, and which roles you qualify for that you never even considered.

---

## Live Demo

🔗 **[Try FitForge Live →](YOUR_VERCEL_LINK_HERE)**

> No sign-up required. Click **"Try with sample data"** for an instant demo.

---

## Features

### 1. 🎯 Semantic Match Score
Goes beyond keyword matching. Analyzes required vs preferred vs nice-to-have skills with importance weighting and returns an overall fit score with 4 sub-dimensions: **Technical, Experience, Communication, and Trajectory**.

### 2. 🎭 Recruiter Persona Simulator ⭐ Most Unique Feature
Simulates how 3 different recruiter archetypes — a **Startup CTO**, a **Corporate HR Generalist**, and an **Ex-FAANG Technical Screener** — would each independently read and react to your resume. Each persona gives a pass/fail verdict, an internal monologue, what impressed them, and their red flags.

### 3. 🔍 Skill Gap Analysis
Identifies every skill in the JD and classifies your match as **Present**, **Weak**, or **Missing**. Generates before/after rewrites of your existing resume bullets to better highlight transferable skills.

### 4. ⏳ Skill Decay Timeline
Tracks when each skill on your resume was last actively used. Skills from 4+ years ago are flagged as **"stale"** — especially dangerous when they are required by the target role. Visualized as a color-coded freshness timeline.

### 5. 💬 Interview Question Predictor
Predicts the 6 most likely interview questions a recruiter will ask based specifically on your skill gaps and the JD requirements. Each question comes with the recruiter's hidden concern and a **STAR-framework answer outline** anchored to your real experience.

### 6. 🚀 Passive Job Discovery
Analyzes your resume in isolation (no JD needed) and surfaces 9 roles you qualify for — including adjacent and unexpected roles you may never have considered. Groups results into **Primary Fit**, **Adjacent Fit**, and **Stretch Fit** tiers.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| AI Engine | Google Gemini 2.0 Flash |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/2345-aleena/fitforge.git
cd fitforge

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Then edit .env and add your Gemini API key

# Start development server
npm run dev
```

Open **http://localhost:5173** and click **"Try with sample data"** to see it in action immediately.

---

## How It Works

```
User Input (Resume + JD)
         │
         ▼
  6 Gemini API calls fired in parallel (Promise.all)
         │
   ┌─────┴────┬─────────┬──────────┬──────────┬──────────┐
   ▼          ▼         ▼          ▼          ▼          ▼
Match      Persona   Skill Gap  Skill      Interview  Job
Score     Simulator  Analysis   Decay      Predictor  Discovery
   │          │         │          │          │          │
   └─────┬────┴─────────┴──────────┴──────────┴──────────┘
         ▼
  Career Intelligence Report rendered in UI
```

All 6 modules run **simultaneously** — average total analysis time under 15 seconds.

---

## Project Structure

```
fitforge/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   └── modules/
│   │       ├── MatchScore.jsx
│   │       ├── PersonaSimulator.jsx
│   │       ├── SkillGap.jsx
│   │       ├── SkillDecay.jsx
│   │       ├── InterviewPrep.jsx
│   │       └── JobDiscovery.jsx
│   ├── services/
│   │   └── gemini.js          ← All AI calls, model fallback, JSON parsing
│   └── constants/
│       └── sampleData.js      ← Sample resume + JD for demo
├── .env.example               ← Copy to .env and add your key
└── README.md
```

---

## Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

Get your free key at [Google AI Studio](https://aistudio.google.com/app/apikey) — no credit card required.

> ⚠️ **Never commit your `.env` file.** It is already in `.gitignore`.

---

## Built At

This project was built during the **Code with Kiro Hackathon 2026** — a competitive hackathon focused on building practical, innovative AI-powered applications using the Kiro IDE.

- **Challenge:** AI Resume & Job Matching System
- **Builder:** Aleena Sehar
- **Time to build:** 1 hr 35 min

---

## Roadmap

- [ ] PDF resume upload and parsing
- [ ] Lie detector / overstatement flagging
- [ ] Culture fit signal extractor
- [ ] Multi-JD batch comparison (upload 1 resume, compare 3 jobs)
- [ ] Cover letter gap-bridge generator
- [ ] Export full report as PDF

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## License

MIT

---

<div align="center">

Made with 🔮 during **Code with Kiro Hackathon 2026**

⭐ Star this repo if FitForge helped you

</div>
