// ─── Single combined Gemini call — 1 API request for all 6 modules ───────────

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-2.0-flash";

if (!API_KEY || API_KEY === "your_gemini_api_key_here") {
  console.error(
    "⚠️  VITE_GEMINI_API_KEY is not set.\n" +
    "Add it to your .env file: VITE_GEMINI_API_KEY=your_key\n" +
    "Get a free key at: https://aistudio.google.com/app/apikey"
  );
}

// ─── Core fetch caller ────────────────────────────────────────────────────────
async function callGeminiREST(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.85,
        topK: 40,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini API");
  return text;
}

// ─── Robust JSON extractor ────────────────────────────────────────────────────
function extractJSON(text) {
  if (!text || typeof text !== "string") throw new Error("Empty response from Gemini");

  try { return JSON.parse(text.trim()); } catch (_) {}

  let cleaned = text
    .replace(/```(?:json|JSON)?\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  try { return JSON.parse(cleaned); } catch (_) {}

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
      slice = slice.replace(/,(\s*[}\]])/g, "$1");
      try { return JSON.parse(slice); } catch (_) {}
    }
  }

  throw new Error(
    `Could not parse AI response as JSON. Raw (first 300 chars): ${text.slice(0, 300)}`
  );
}

// ─── Single combined prompt — all 6 modules in one API call ──────────────────
export async function analyzeAll(resume, jd) {
  const currentYear = new Date().getFullYear();

  const prompt = `Analyze this resume and job description and return ONE JSON object containing all of these keys: matchScore, personas, skillGap, skillDecay, interviewQuestions, jobDiscovery. Each key contains the full analysis for that module.

YOUR RESPONSE MUST BE ONLY A SINGLE JSON OBJECT. Start with { and end with }. No markdown, no explanation, no extra text.

Required structure:

{
  "matchScore": {
    "overall": <integer 0-100>,
    "technical": <integer 0-100>,
    "experience": <integer 0-100>,
    "communication": <integer 0-100>,
    "trajectory": <integer 0-100>,
    "verdict": "<short phrase e.g. Strong Match or Significant Gaps>",
    "summary": "<2-3 sentences analyzing the fit using actual resume details>"
  },

  "personas": {
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
  },

  "skillGap": {
    "skills": [
      {
        "name": "<skill name from JD>",
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
  },

  "skillDecay": {
    "skills": [
      {
        "name": "<skill name>",
        "lastUsed": <year as integer>,
        "status": "<fresh|aging|stale>",
        "inJD": <true|false>
      }
    ],
    "riskSummary": "<describe stale skills required by JD, or null>"
  },

  "interviewQuestions": {
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
  },

  "jobDiscovery": {
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
}

Rules:
- matchScore.overall must be a weighted average of the 4 sub-scores
- skillGap.skills must include ALL skills mentioned in the JD
- skillGap.rewrites must include 2-3 rewrites of actual resume bullets
- skillDecay.skills must list every skill from the resume; current year is ${currentYear}; fresh = last 2 years, aging = 2-4 years ago, stale = 4+ years ago
- interviewQuestions.questions must contain exactly 6 questions
- jobDiscovery.roles must contain exactly 9 roles: 3 primary, 3 adjacent, 3 stretch
- personas verdicts should differ: one Pass, one Maybe, one Lean No or No

RESUME:
${resume}

JOB DESCRIPTION:
${jd}`;

  const text = await callGeminiREST(prompt);
  const parsed = extractJSON(text);

  // Return each module's data keyed the same way App.jsx expects
  return {
    match: parsed.matchScore,
    personas: parsed.personas,
    skillgap: parsed.skillGap,
    skilldecay: parsed.skillDecay,
    interview: parsed.interviewQuestions,
    jobs: parsed.jobDiscovery,
  };
}
