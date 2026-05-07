// ─── Direct REST API — bypasses SDK's hardcoded v1beta endpoint ───────────────
// Uses v1 which is what free API keys support

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY === "your_gemini_api_key_here") {
  console.error(
    "⚠️  VITE_GEMINI_API_KEY is not set.\n" +
    "Add it to your .env file: VITE_GEMINI_API_KEY=your_key\n" +
    "Get a free key at: https://aistudio.google.com/app/apikey"
  );
}

// Models available on this API key (confirmed via ListModels)
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-2.5-flash",
];

// ─── Core fetch caller ────────────────────────────────────────────────────────
async function callGeminiREST(prompt, modelName) {
  const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${API_KEY}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      topP: 0.85,
      topK: 40,
      maxOutputTokens: 8192,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Empty response from Gemini API");
  }

  return text;
}

// ─── Robust JSON extractor ────────────────────────────────────────────────────
function extractJSON(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Empty response from Gemini");
  }

  // 1. Direct parse
  try { return JSON.parse(text.trim()); } catch (_) {}

  // 2. Strip markdown fences
  let cleaned = text
    .replace(/```(?:json|JSON)?\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  try { return JSON.parse(cleaned); } catch (_) {}

  // 3. Extract outermost { } or [ ]
  const objStart = cleaned.indexOf("{");
  const arrStart = cleaned.indexOf("[");
  let start = -1;
  let endChar = "}";

  if (objStart !== -1 && (arrStart === -1 || objStart < arrStart)) {
    start = objStart; endChar = "}";
  } else if (arrStart !== -1) {
    start = arrStart; endChar = "]";
  }

  if (start !== -1) {
    const end = cleaned.lastIndexOf(endChar);
    if (end > start) {
      let slice = cleaned.slice(start, end + 1);
      // Fix trailing commas
      slice = slice.replace(/,(\s*[}\]])/g, "$1");
      try { return JSON.parse(slice); } catch (_) {}
    }
  }

  throw new Error(
    `Could not parse AI response as JSON. Raw (first 300 chars): ${text.slice(0, 300)}`
  );
}

// ─── Main caller: tries each model with retries ───────────────────────────────
async function callGemini(prompt) {
  let lastError;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const text = await callGeminiREST(prompt, model);
        const parsed = extractJSON(text);
        console.log(`✓ ${model} responded successfully`);
        return parsed;
      } catch (e) {
        lastError = e;
        const msg = e.message ?? "";

        // Model not found on this key — try next model immediately
        if (msg.includes("404") || msg.includes("not found") || msg.includes("not supported")) {
          console.warn(`Model ${model} not available, trying next...`);
          break;
        }

        // Rate limit — wait before retry
        if (msg.includes("429") || msg.includes("quota")) {
          console.warn(`Rate limited on ${model}, waiting...`);
          await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
          continue;
        }

        // Other error — short wait then retry once
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

// ─── Module 1: Match Score ────────────────────────────────────────────────────
export async function analyzeMatchScore(resume, jd) {
  const prompt = `You are a senior technical recruiter. Analyze the resume and job description below.

YOUR RESPONSE MUST BE ONLY A JSON OBJECT. Start your response with { and end with }. No other text.

{
  "overall": <integer 0-100>,
  "technical": <integer 0-100, tech stack match>,
  "experience": <integer 0-100, years/seniority match>,
  "communication": <integer 0-100, resume clarity>,
  "trajectory": <integer 0-100, career direction match>,
  "verdict": "<short phrase like Strong Match or Significant Gaps>",
  "summary": "<2-3 sentences analyzing the fit based on actual resume content>"
}

RESUME:
${resume}

JOB DESCRIPTION:
${jd}`;
  return callGemini(prompt);
}

// ─── Module 2: Recruiter Personas ────────────────────────────────────────────
export async function analyzePersonas(resume, jd) {
  const prompt = `Simulate 3 recruiters reading this resume for this job. Use actual resume details.

YOUR RESPONSE MUST BE ONLY A JSON OBJECT. Start your response with { and end with }. No other text.

{
  "personas": [
    {
      "type": "Startup CTO",
      "avatar": "CT",
      "verdict": "<Pass|Maybe|Lean No|No>",
      "monologue": "<3-4 sentences of internal thinking referencing specific resume details>",
      "impressed": ["<specific positive from resume>", "<another>"],
      "concerns": ["<specific concern from JD gap>", "<another>"],
      "likelihood": <integer 0-100>
    },
    {
      "type": "HR Generalist",
      "avatar": "HR",
      "verdict": "<Pass|Maybe|Lean No|No>",
      "monologue": "<3-4 sentences about experience years, titles, keywords>",
      "impressed": ["<keyword match>", "<education or tenure>"],
      "concerns": ["<experience gap>", "<missing keyword>"],
      "likelihood": <integer 0-100>
    },
    {
      "type": "Ex-FAANG Screener",
      "avatar": "FG",
      "verdict": "<Pass|Maybe|Lean No|No>",
      "monologue": "<3-4 sentences about scale, system design, technical depth>",
      "impressed": ["<scale metric or strong signal>"],
      "concerns": ["<system design gap>", "<scale concern>"],
      "likelihood": <integer 0-100>
    }
  ]
}

RESUME:
${resume}

JOB DESCRIPTION:
${jd}`;
  return callGemini(prompt);
}

// ─── Module 3: Skill Gap ──────────────────────────────────────────────────────
export async function analyzeSkillGap(resume, jd) {
  const prompt = `Analyze skill gaps between this resume and job description.

YOUR RESPONSE MUST BE ONLY A JSON OBJECT. Start your response with { and end with }. No other text.

Status: "present" = clearly shown in resume, "weak" = mentioned without depth, "missing" = in JD but not resume
Importance: "required" = explicitly required, "preferred" = nice to have

{
  "skills": [
    {
      "name": "<skill name>",
      "status": "<present|weak|missing>",
      "importance": "<required|preferred>",
      "note": "<one sentence explanation>"
    }
  ],
  "rewrites": [
    {
      "original": "<exact bullet from resume>",
      "improved": "<rewritten with metrics, tech, and impact>",
      "reason": "<why this improves the match>"
    }
  ]
}

List ALL skills from the JD. Provide 2-3 rewrites of actual resume bullets.

RESUME:
${resume}

JOB DESCRIPTION:
${jd}`;
  return callGemini(prompt);
}

// ─── Module 4: Skill Decay ────────────────────────────────────────────────────
export async function analyzeSkillDecay(resume, jd) {
  const currentYear = new Date().getFullYear();
  const prompt = `Analyze skill freshness from this resume. Current year is ${currentYear}.

YOUR RESPONSE MUST BE ONLY A JSON OBJECT. Start your response with { and end with }. No other text.

Status: "fresh" = used in last 2 years, "aging" = 2-4 years ago, "stale" = 4+ years ago

{
  "skills": [
    {
      "name": "<skill name>",
      "lastUsed": <year as integer>,
      "status": "<fresh|aging|stale>",
      "inJD": <true|false>
    }
  ],
  "riskSummary": "<describe stale skills required by JD, or null>"
}

List every skill from the resume.

RESUME:
${resume}

JOB DESCRIPTION:
${jd}`;
  return callGemini(prompt);
}

// ─── Module 5: Interview Questions ───────────────────────────────────────────
export async function analyzeInterviewQuestions(resume, jd) {
  const prompt = `Predict 6 interview questions that probe gaps between this resume and job description.

YOUR RESPONSE MUST BE ONLY A JSON OBJECT. Start your response with { and end with }. No other text.

Difficulty: "Standard", "Probing", or "Curveball"

{
  "questions": [
    {
      "question": "<specific interview question>",
      "why": "<why this will be asked, referencing specific gap>",
      "difficulty": "<Standard|Probing|Curveball>",
      "starFramework": {
        "situation": "<specific context from resume>",
        "task": "<challenge to frame answer around>",
        "action": "<technical actions to describe>",
        "result": "<outcome or metric to highlight>"
      },
      "anchorExperience": "<specific project or role from resume>"
    }
  ]
}

Provide exactly 6 questions.

RESUME:
${resume}

JOB DESCRIPTION:
${jd}`;
  return callGemini(prompt);
}

// ─── Module 6: Job Discovery ──────────────────────────────────────────────────
export async function analyzeJobDiscovery(resume) {
  const prompt = `Based ONLY on this resume, identify 9 job roles this candidate fits. Include obvious and non-obvious roles.

YOUR RESPONSE MUST BE ONLY A JSON OBJECT. Start your response with { and end with }. No other text.

Tiers: "primary" = direct match (3 roles), "adjacent" = transferable skills (3 roles), "stretch" = one gap to close (3 roles)

{
  "roles": [
    {
      "title": "<job title>",
      "company_type": "<type of company>",
      "fit": <integer 0-100>,
      "tier": "<primary|adjacent|stretch>",
      "signals": ["<signal from resume>", "<another signal>"],
      "why_unexpected": "<explanation for non-obvious roles, or null>"
    }
  ]
}

Return exactly 9 roles: 3 primary, 3 adjacent, 3 stretch.

RESUME:
${resume}`;
  return callGemini(prompt);
}
