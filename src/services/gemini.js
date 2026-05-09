// ─── AI Service — Gemini primary, Groq fallback ───────────────────────────────
// Tries Gemini (gemini-2.0-flash-lite) first.
// If Gemini hits a 429 quota error, automatically falls back to Groq (llama-3.3-70b).
// Groq is completely free with very high rate limits.

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_KEY   = import.meta.env.VITE_GROQ_API_KEY;

// Gemini models to try in order (lite = highest free quota)
const GEMINI_MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-001",
  "gemini-2.5-flash-lite",
];

// Groq model — llama-3.3-70b is fast, accurate, and free
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ─── Gemini caller ────────────────────────────────────────────────────────────
async function callGemini(prompt) {
  let lastError;

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_KEY}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, topP: 0.85, topK: 40, maxOutputTokens: 4096 },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty response from Gemini");
        console.log(`✓ Gemini (${model}) responded`);
        return text;
      }

      const errText = await response.text();

      if (response.status === 404) {
        console.warn(`Gemini model ${model} not available, trying next...`);
        lastError = new Error(`404: ${model} not available`);
        continue;
      }

      if (response.status === 429) {
        console.warn(`Gemini quota exceeded on ${model}`);
        // All Gemini models share the same quota — no point trying others
        throw new Error("GEMINI_QUOTA_EXCEEDED");
      }

      throw new Error(`Gemini HTTP ${response.status}: ${errText.slice(0, 150)}`);
    } catch (e) {
      if (e.message === "GEMINI_QUOTA_EXCEEDED") throw e;
      if (e.message?.startsWith("Gemini HTTP")) throw e;
      lastError = e;
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

// ─── Groq caller (fallback) ───────────────────────────────────────────────────
async function callGroq(prompt) {
  if (!GROQ_KEY || GROQ_KEY === "your_groq_api_key_here") {
    throw new Error(
      "Groq API key not set. Add VITE_GROQ_API_KEY to your .env file.\n" +
      "Get a free key at: https://console.groq.com/keys"
    );
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert career analyst. Always respond with valid JSON only. No markdown fences, no explanation, no extra text. Start your response with { and end with }.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 429) {
      throw new Error("Groq rate limit hit. Please wait a moment and click Reanalyze.");
    }
    throw new Error(`Groq HTTP ${response.status}: ${errText.slice(0, 150)}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq");
  console.log(`✓ Groq (${GROQ_MODEL}) responded`);
  return text;
}

// ─── JSON extractor ───────────────────────────────────────────────────────────
function parseJSON(text) {
  if (!text) throw new Error("Empty response");
  try { return JSON.parse(text.trim()); } catch (_) {}
  const cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  try { return JSON.parse(cleaned); } catch (_) {}
  const s = cleaned.indexOf("{"), e = cleaned.lastIndexOf("}");
  if (s !== -1 && e > s) {
    try { return JSON.parse(cleaned.slice(s, e + 1).replace(/,(\s*[}\]])/g, "$1")); } catch (_) {}
  }
  throw new Error("Could not parse JSON from AI response: " + text.slice(0, 150));
}

// ─── Main caller — Gemini first, Groq fallback ────────────────────────────────
async function callAI(prompt) {
  // Try Gemini first
  if (GEMINI_KEY && GEMINI_KEY !== "your_gemini_api_key_here") {
    try {
      const text = await callGemini(prompt);
      return parseJSON(text);
    } catch (e) {
      if (e.message === "GEMINI_QUOTA_EXCEEDED") {
        console.warn("Gemini quota exceeded — switching to Groq fallback...");
        // Fall through to Groq
      } else {
        // Non-quota Gemini error — still try Groq before giving up
        console.warn("Gemini failed:", e.message, "— trying Groq...");
      }
    }
  }

  // Groq fallback
  const text = await callGroq(prompt);
  return parseJSON(text);
}

// ─── Module 1: Match Score ────────────────────────────────────────────────────
export async function analyzeMatchScore(resume, jd) {
  const prompt = `You are an expert recruiter. Analyze this resume vs job description.
Return ONLY valid JSON, no markdown:
{
  "overall": 76,
  "technical": 82,
  "experience": 70,
  "communication": 74,
  "trajectory": 78,
  "verdict": "Strong candidate with addressable gaps",
  "keyInsight": "One bold sentence: the single most important thing about this match",
  "summary": "2 sentence plain English match summary"
}
RESUME: ${resume.slice(0, 1500)}
JD: ${jd.slice(0, 800)}`;
  return callAI(prompt);
}

// ─── Module 2: Recruiter Personas ────────────────────────────────────────────
export async function analyzePersonas(resume, jd) {
  const prompt = `Simulate 3 recruiters reading this resume for this job.
Return ONLY valid JSON, no markdown:
{
  "keyInsight": "One sentence: the most surprising recruiter reaction",
  "personas": [
    {
      "type": "Startup CTO", "avatar": "CT", "verdict": "Pass",
      "monologue": "3 sentence internal reaction referencing specific resume details",
      "impressed": ["specific thing 1", "specific thing 2"],
      "concerns": ["specific concern 1", "specific concern 2"],
      "likelihood": 82
    },
    {
      "type": "HR Generalist", "avatar": "HR", "verdict": "Maybe",
      "monologue": "3 sentences about experience years, titles, keywords",
      "impressed": ["keyword match", "education or tenure"],
      "concerns": ["experience gap", "missing keyword"],
      "likelihood": 61
    },
    {
      "type": "Ex-FAANG Screener", "avatar": "FG", "verdict": "Lean No",
      "monologue": "3 sentences about scale, system design, technical depth",
      "impressed": ["scale metric or strong signal"],
      "concerns": ["system design gap", "scale concern"],
      "likelihood": 44
    }
  ]
}
RESUME: ${resume.slice(0, 1500)}
JD: ${jd.slice(0, 800)}`;
  return callAI(prompt);
}

// ─── Module 3: Skill Gap ──────────────────────────────────────────────────────
export async function analyzeSkillGap(resume, jd) {
  const prompt = `Analyze skill gaps between resume and job description.
Return ONLY valid JSON, no markdown:
{
  "keyInsight": "One sentence: the most critical gap or strength",
  "skills": [
    {"name": "Python", "status": "present", "importance": "required", "note": "Clearly demonstrated"},
    {"name": "Kubernetes", "status": "weak", "importance": "preferred", "note": "Mentioned once, no depth"},
    {"name": "System Design", "status": "missing", "importance": "required", "note": "No evidence found"}
  ],
  "rewrites": [
    {
      "original": "Worked on backend systems",
      "improved": "Designed 4 REST APIs serving 50k daily requests using Python FastAPI",
      "reason": "Added specificity and scale"
    }
  ]
}
status: present|weak|missing. importance: required|preferred. Include ALL JD skills. 2-3 rewrites.
RESUME: ${resume.slice(0, 1500)}
JD: ${jd.slice(0, 800)}`;
  return callAI(prompt);
}

// ─── Module 4: Skill Decay ────────────────────────────────────────────────────
export async function analyzeSkillDecay(resume, jd) {
  const prompt = `Analyze when each skill was last used based on job history dates.
Return ONLY valid JSON, no markdown:
{
  "keyInsight": "One sentence: the most dangerous decayed skill for this role",
  "skills": [
    {"name": "Python", "lastUsed": 2024, "status": "fresh", "inJD": true},
    {"name": "AWS Lambda", "lastUsed": 2021, "status": "aging", "inJD": true},
    {"name": "Kubernetes", "lastUsed": 2021, "status": "aging", "inJD": true}
  ],
  "riskSummary": "Plain English summary of decay risk for this specific role"
}
Status: fresh = 2024+, aging = 2021-2023, stale = 2020 or earlier. List every resume skill.
RESUME: ${resume.slice(0, 1500)}
JD: ${jd.slice(0, 800)}`;
  return callAI(prompt);
}

// ─── Module 5: Interview Questions ───────────────────────────────────────────
export async function analyzeInterview(resume, jd) {
  const prompt = `Predict 5 interview questions based on gaps between resume and JD.
Return ONLY valid JSON, no markdown:
{
  "keyInsight": "One sentence: the question they will definitely ask",
  "questions": [
    {
      "question": "Walk me through a system you designed from scratch",
      "why": "Resume shows no system design but JD requires it",
      "difficulty": "Probing",
      "star": {
        "situation": "Use your API project as context",
        "task": "Frame the architectural decision",
        "action": "Describe technical choices and tradeoffs",
        "result": "Quantify the outcome"
      },
      "anchor": "Reference your PayFlow API work"
    }
  ]
}
Difficulty: Standard, Probing, or Curveball. Provide exactly 5 questions.
RESUME: ${resume.slice(0, 1500)}
JD: ${jd.slice(0, 800)}`;
  return callAI(prompt);
}

// ─── Module 6: Job Discovery ──────────────────────────────────────────────────
export async function analyzeJobs(resume) {
  const prompt = `Based only on this resume, find 8 job roles this person fits.
Return ONLY valid JSON, no markdown:
{
  "keyInsight": "One sentence: the most unexpected role they qualify for",
  "roles": [
    {
      "title": "Staff Backend Engineer",
      "companyType": "Fintech scale-up",
      "fit": 91,
      "tier": "primary",
      "signals": ["Strong API design", "Python depth", "Payments exposure"],
      "whyUnexpected": null
    },
    {
      "title": "Developer Advocate",
      "companyType": "Developer tools company",
      "fit": 73,
      "tier": "adjacent",
      "signals": ["Technical writing", "API experience"],
      "whyUnexpected": "Most backend engineers overlook this — your communication skills make you a rare fit"
    }
  ]
}
Tier: primary (3 roles), adjacent (3 roles), stretch (2 roles). Total 8 roles.
RESUME: ${resume.slice(0, 2000)}`;
  return callAI(prompt);
}
