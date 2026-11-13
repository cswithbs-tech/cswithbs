import cloudinary from "@/lib/cloudinary";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";

export async function getGeminiApiKey(): Promise<string> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your .env.local file on the server. Never store API keys in the database."
    );
  }
  return key;
}

export const GEMINI_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3-flash-preview",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite-preview",
  "gemma-4-26b-a4b-it",
];

export async function testGeminiConnection(): Promise<{ ok: boolean; model?: string; latencyMs?: number; error?: string }> {
  let apiKey: string;
  try {
    apiKey = await getGeminiApiKey();
  } catch (err: any) {
    return { ok: false, error: err.message };
  }

  const start = Date.now();
  let lastError = "";

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello! Reply with 'OK' only." }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        return { ok: true, model, latencyMs: Date.now() - start };
      }

      const errData = await res.json().catch(() => ({}));
      lastError = errData.error?.message || `API returned status ${res.status}`;
    } catch (err: any) {
      lastError = err.message || "Failed to reach Google Gemini API.";
    }
  }

  return { ok: false, error: lastError || "Connection failed across tested models." };
}

export interface GenerateDraftOptions {
  topic: string;
  contentType: "post" | "note";
  categoryOrSubject?: string;
  targetLevel?: string;
  language?: string;
  customInstructions?: string;
  generateImage?: boolean;
  userId?: string;
  selectedModel?: string;
}

export interface GeneratedDraftResult {
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  contentHtml: string;
  seoTitle: string;
  seoDescription: string;
  image?: string;
  imagePrompt?: string;
  modelUsed?: string;
}

export async function generateAiDraft(options: GenerateDraftOptions): Promise<GeneratedDraftResult> {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please add GEMINI_API_KEY in .env.local or in Admin Settings.");
  }

  const {
    topic,
    contentType = "post",
    categoryOrSubject = "Computer Science",
    targetLevel = "Intermediate (BTech/MCA)",
    language = "English",
    customInstructions = "",
    selectedModel = "auto",
  } = options;

  const systemInstructions = `
You are the Lead Academic Computer Science Writer and Senior Technical Editor for CSwithBS (cswithbs.com), a premier academic computer science and research platform.
Your task is to write a comprehensive, crystal-clear, pedagogically sound, and visually structured ${contentType === "note" ? "Academic Course Lesson / Curriculum Note" : "In-depth Technical Blog Post / Tutorial"}.

Target Audience Level: ${targetLevel}.
Subject / Category: ${categoryOrSubject}.
Language: ${language}.
Topic / Outline: "${topic}".
${customInstructions ? `Additional User Instructions: "${customInstructions}".` : ""}

CRITICAL FORMATTING RULES FOR THE CONTENT HTML:
1. Output semantic HTML markup ready for direct injection into a TipTap Rich Text Editor (Tailwind Typography 'prose prose-invert').
2. Start directly with an opening introduction paragraph. DO NOT include the h1 title in the content body (it is stored in the title field).
3. Use <h2> for major sections and <h3> for subsections.
4. Provide concrete, working code examples inside <pre><code class="language-cpp"> (or language-python, language-java, language-javascript, language-sql as appropriate).
5. Include a structured <table> where appropriate (e.g., Time & Space Complexity analysis or Algorithm Comparisons).
6. Use <blockquote> for Important Key Takeaways, Exam/Viva Tips, or Academic Definitions.
7. Use <ul> and <ol> with <li> for step-by-step mechanisms and bulleted takeaways.
8. If mathematical formulas are needed, write standard clean notation or LaTeX wrapped in $...$ (e.g. $O(n \\log n)$).
9. Make the content thorough, detailed, and completely free of placeholders.

YOU MUST RESPOND ONLY WITH A VALID JSON OBJECT WITH THE FOLLOWING EXACT SCHEMA:
{
  "title": "A compelling, academic, and engaging title",
  "slug": "url-friendly-lowercase-slug-without-special-characters",
  "excerpt": "A high-impact 1-2 sentence summary (120-160 chars) explaining what students will learn",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "seoTitle": "SEO title under 60 characters",
  "seoDescription": "Meta description under 155 characters",
  "imagePrompt": "A highly descriptive visual prompt for generating a modern 3D isometric dark-mode technical cover illustration (e.g., 'Minimalist 3D isometric glowing data structure nodes, dark technical diagram, cyan and rose gold neon lighting, 4k')",
  "contentHtml": "<p>Introduction paragraph...</p><h2>First Major Concept</h2>..."
}
`;

  let jsonResponseText = "";
  let lastError = "";
  let successfulModel = "";

  const prioritizedModels =
    selectedModel && selectedModel !== "auto"
      ? [selectedModel, ...GEMINI_MODELS.filter((m) => m !== selectedModel)]
      : GEMINI_MODELS;

  for (const model of prioritizedModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemInstructions }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(35000),
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          jsonResponseText = candidate;
          successfulModel = model;
          break;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastError = errJson.error?.message || `Status ${res.status}`;
      }
    } catch (err: any) {
      lastError = err.message || "Network error";
    }
  }

  if (!jsonResponseText) {
    throw new Error(`AI generation failed: ${lastError}`);
  }

  const parsed = robustJsonParse(jsonResponseText);

  const result: GeneratedDraftResult = {
    title: parsed.title || topic,
    slug: (parsed.slug || topic)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    excerpt: parsed.excerpt || "",
    tags: Array.isArray(parsed.tags) ? parsed.tags : ["Computer Science", "Academic"],
    seoTitle: parsed.seoTitle || parsed.title || topic,
    seoDescription: parsed.seoDescription || parsed.excerpt || "",
    contentHtml: parsed.contentHtml || "<p>Draft content generated.</p>",
    imagePrompt: parsed.imagePrompt || `3D isometric illustration of ${topic}, dark aesthetic`,
    modelUsed: successfulModel || "gemini-flash-lite-latest",
  };

  // If image generation requested, create and upload to Cloudinary
  if (options.generateImage !== false && result.imagePrompt) {
    try {
      const uploadedImageUrl = await generateAndUploadCoverImage(
        result.imagePrompt,
        result.slug,
        options.userId
      );
      if (uploadedImageUrl) {
        result.image = uploadedImageUrl;
      }
    } catch (imgErr) {
      console.error("Cover image generation/upload failed, continuing without image:", imgErr);
    }
  }

  return result;
}

export async function generateAndUploadCoverImage(
  prompt: string,
  slug: string,
  userId?: string
): Promise<string> {
  const cleanPrompt = prompt
    .replace(/[^\w\s,.-]/gi, "")
    .trim()
    .slice(0, 300);

  // Use Pollinations Flux high-resolution image engine
  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1200&height=630&nologo=true&seed=${seed}&model=flux`;

  // Fetch the image stream and upload to Cloudinary under folder cswithbs/posts
  const uploadResult = await cloudinary.uploader.upload(imageUrl, {
    folder: "cswithbs/posts",
    public_id: `ai_${slug.slice(0, 40)}_${Date.now()}`,
    resource_type: "image",
  });

  if (!uploadResult?.secure_url) {
    throw new Error("Cloudinary did not return a secure_url");
  }

  // Record in Media collection
  try {
    await dbConnect();
    await Media.create({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      filename: `ai_${slug}.webp`,
      format: uploadResult.format || "webp",
      size: uploadResult.bytes || 0,
      width: uploadResult.width || 1200,
      height: uploadResult.height || 630,
      folder: "posts",
      altText: cleanPrompt,
      uploadedBy: userId,
    });
  } catch (dbErr) {
    console.error("Failed to record generated media in MongoDB:", dbErr);
  }

  return uploadResult.secure_url;
}

function robustJsonParse(text: string): any {
  let clean = text.trim();
  if (clean.startsWith("```json")) {
    clean = clean.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  }

  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(clean);
  } catch (err1) {
    // Fix invalid backslash escapes (e.g. \log, \frac, \O in LaTeX or \s in regex)
    const fixedEscapes = clean.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");
    try {
      return JSON.parse(fixedEscapes);
    } catch (err2) {
      // Fix unescaped control characters inside string literals
      const fixedControls = fixedEscapes.replace(/[\u0000-\u001F]+/g, (match) => {
        if (match === "\n") return "\\n";
        if (match === "\r") return "\\r";
        if (match === "\t") return "\\t";
        return "";
      });
      return JSON.parse(fixedControls);
    }
  }
}

export interface GeminiChatMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export async function callGeminiChat(
  history: GeminiChatMessage[],
  systemInstruction?: string,
  selectedModel?: string
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Set GEMINI_API_KEY in .env.local or Admin Settings.");
  }

  const modelOrder = selectedModel && GEMINI_MODELS.includes(selectedModel)
    ? [selectedModel, ...GEMINI_MODELS.filter((m) => m !== selectedModel)]
    : GEMINI_MODELS;

  let lastError = "";

  for (const model of modelOrder) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload: any = {
        contents: history,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(45000),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        lastError = errJson.error?.message || `HTTP ${res.status}`;
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return { text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err.message || "Failed to call model";
    }
  }

  throw new Error(`Failed to generate response across models: ${lastError}`);
}

export interface PostReviewInput {
  title: string;
  excerpt: string;
  content: string;
  tags?: string[];
  categoryName?: string;
  authorName?: string;
  selectedModel?: string;
}

export interface PostReviewResult {
  score: number;
  verdict: "APPROVE" | "NEEDS_REVISION" | "REJECT";
  summary: string;
  strengths: string[];
  issues: string[];
  suggestions: string[];
  seoScore: number;
  readability: string;
  technicalDepth: string;
  modelUsed: string;
}

export async function reviewPostWithAi(input: PostReviewInput): Promise<PostReviewResult> {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Set GEMINI_API_KEY in .env.local or Admin Settings.");
  }

  const prompt = `You are the Principal Technical Editor and Senior Computer Science Reviewer for "CSWITHBS", a premier educational platform for Computer Science students and software engineers.
Carefully inspect and review the following blog post submitted by a writer:

TITLE: ${input.title}
EXCERPT: ${input.excerpt}
CATEGORY: ${input.categoryName || "General CS"}
TAGS: ${input.tags?.join(", ") || "None"}
AUTHOR: ${input.authorName || "Contributor"}

CONTENT (MARKDOWN/HTML):
${input.content.slice(0, 15000)}

Perform an exhaustive editorial and technical review. Evaluate:
1. Technical accuracy, depth, and validity of explanations.
2. Code block quality (syntax, indentation, correctness, best practices).
3. Structure, clarity, and readability for engineering students.
4. Completeness (is there an introduction, step-by-step body, conclusion?).
5. SEO appropriateness of title, excerpt, and keywords.
6. Red flags (plagiarism risk, lazy AI fluff, hallucinations, broken formatting).

Respond ONLY with a valid JSON object matching this exact schema:
{
  "score": 85,
  "verdict": "APPROVE",
  "summary": "1-2 sentence overall executive assessment",
  "strengths": ["Clear breakdown of...", "Good code example..."],
  "issues": ["Missing explanation of edge cases...", "Excerpt could be more engaging..."],
  "suggestions": ["Add a summary table comparing X and Y...", "Clarify line 4 in the code..."],
  "seoScore": 90,
  "readability": "Intermediate / Clear",
  "technicalDepth": "High / Practical"
}`;

  const modelOrder = input.selectedModel && GEMINI_MODELS.includes(input.selectedModel)
    ? [input.selectedModel, ...GEMINI_MODELS.filter((m) => m !== input.selectedModel)]
    : ["gemini-3-flash-preview", ...GEMINI_MODELS.filter((m) => m !== "gemini-3-flash-preview")];

  let lastError = "";

  for (const model of modelOrder) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
            maxOutputTokens: 2500,
          },
        }),
        signal: AbortSignal.timeout(35000),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        lastError = errJson.error?.message || `HTTP ${res.status}`;
        continue;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = robustJsonParse(rawText);
        return {
          score: typeof parsed.score === "number" ? Math.min(100, Math.max(0, parsed.score)) : 75,
          verdict: ["APPROVE", "NEEDS_REVISION", "REJECT"].includes(parsed.verdict) ? parsed.verdict : "NEEDS_REVISION",
          summary: parsed.summary || "Editorial inspection complete.",
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Well-structured topic."],
          issues: Array.isArray(parsed.issues) ? parsed.issues : [],
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
          seoScore: typeof parsed.seoScore === "number" ? parsed.seoScore : 80,
          readability: parsed.readability || "Standard",
          technicalDepth: parsed.technicalDepth || "Moderate",
          modelUsed: model,
        };
      }
    } catch (err: any) {
      lastError = err.message || "Failed model call";
    }
  }

  throw new Error(`Post review failed across models: ${lastError}`);
}

export interface AiCurriculumSubjectPlan {
  name: string;
  slug: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  alignments: string[];
  suggestedChapters: Array<{
    name: string;
    description: string;
    order: number;
    sampleNotes: string[];
  }>;
  modelUsed: string;
}

export interface AiSuggestedChapter {
  name: string;
  description: string;
  order: number;
  sampleNotes: string[];
  priority: "High" | "Medium" | "Optional";
}

export async function generateCurriculumSubjectPlan(
  topic: string,
  targetLevel?: string
): Promise<AiCurriculumSubjectPlan> {
  const apiKey = await getGeminiApiKey();

  const prompt = `You are a Principal Curriculum Architect for Computer Science at premier universities (MIT, Stanford, IITs).
Design a comprehensive, modern curriculum syllabus for the following subject/domain:
TOPIC: "${topic}"
TARGET LEVEL: "${targetLevel || "All Levels"}"

Return ONLY a valid JSON object matching this schema:
{
  "name": "Standard Academic Subject Name",
  "slug": "url-friendly-slug",
  "description": "2-3 sentences comprehensive overview of what the student will master.",
  "level": "Beginner" | "Intermediate" | "Advanced" | "All Levels",
  "alignments": ["GATE CS", "ABET Accredited", "Core Curriculum"],
  "suggestedChapters": [
    {
      "name": "Chapter 1: ...",
      "description": "Clear learning objective of this chapter",
      "order": 1,
      "sampleNotes": ["Topic 1", "Topic 2", "Topic 3"]
    }
  ]
}
Include between 5 and 8 sequential, structured chapters covering fundamentals to advanced topics.`;

  for (const model of ["gemini-3-flash-preview", "gemini-3.8-flash", "gemini-flash-latest"]) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.4,
            maxOutputTokens: 3500,
          },
        }),
        signal: AbortSignal.timeout(35000),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = robustJsonParse(rawText);
        return {
          name: parsed.name || topic,
          slug: (parsed.slug || topic)
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-"),
          description: parsed.description || "",
          level: ["Beginner", "Intermediate", "Advanced", "All Levels"].includes(parsed.level)
            ? parsed.level
            : "All Levels",
          alignments: Array.isArray(parsed.alignments) ? parsed.alignments : ["Computer Science"],
          suggestedChapters: Array.isArray(parsed.suggestedChapters) ? parsed.suggestedChapters : [],
          modelUsed: model,
        };
      }
    } catch (err) {
      console.error(`Curriculum generation error with model ${model}:`, err);
    }
  }

  throw new Error("Failed to generate curriculum subject plan across available models.");
}

export async function generateMissingChaptersForSubject(
  subjectName: string,
  existingChapters: string[],
  level?: string
): Promise<{ missingChapters: AiSuggestedChapter[]; modelUsed: string }> {
  const apiKey = await getGeminiApiKey();

  const prompt = `You are a Senior Academic Evaluator and CS Curriculum Inspector.
We are auditing our curriculum for the subject: "${subjectName}" (Level: ${level || "University Undergrad"}).

EXISTING CHAPTERS ALREADY IN THE SYSTEM:
${existingChapters.length > 0 ? existingChapters.map((c, i) => `${i + 1}. ${c}`).join("\n") : "(None yet)"}

Identify critical missing chapters required for a complete, competitive Computer Science curriculum (e.g. per GATE / ABET / ACM-IEEE CS guidelines).
Do NOT suggest chapters that are already covered above.

Return ONLY a valid JSON object matching this schema:
{
  "missingChapters": [
    {
      "name": "Chapter Name",
      "description": "Why this chapter is essential and what it covers.",
      "order": ${existingChapters.length + 1},
      "sampleNotes": ["Key Topic 1", "Key Topic 2", "Key Topic 3"],
      "priority": "High" | "Medium" | "Optional"
    }
  ]
}
Return between 2 and 6 missing chapters.`;

  for (const model of ["gemini-3-flash-preview", "gemini-3.8-flash", "gemini-flash-latest"]) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
            maxOutputTokens: 3000,
          },
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = robustJsonParse(rawText);
        return {
          missingChapters: Array.isArray(parsed.missingChapters) ? parsed.missingChapters : [],
          modelUsed: model,
        };
      }
    } catch (err) {
      console.error(`Missing chapters audit error with ${model}:`, err);
    }
  }

  throw new Error("Failed to audit missing chapters.");
}

export async function generateNotesOutlineForChapter(
  subjectName: string,
  chapterName: string
): Promise<{ notes: Array<{ title: string; slug: string; brief: string; tags: string[] }>; modelUsed: string }> {
  const apiKey = await getGeminiApiKey();

  const prompt = `You are a Technical Writer and Lead Content Architect for "CSWITHBS".
Generate a structured, logical sequence of notes / tutorials for:
SUBJECT: "${subjectName}"
CHAPTER: "${chapterName}"

Return ONLY a valid JSON object matching this schema:
{
  "notes": [
    {
      "title": "Clear Technical Note Title",
      "slug": "url-friendly-slug",
      "brief": "1-2 sentence synopsis of what this note teaches.",
      "tags": ["Tag1", "Tag2"]
    }
  ]
}
Return between 3 and 7 sequential notes that thoroughly teach this chapter.`;

  for (const model of ["gemini-3-flash-preview", "gemini-3.5-flash-lite", "gemini-flash-lite-latest"]) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.4,
            maxOutputTokens: 2500,
          },
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = robustJsonParse(rawText);
        return {
          notes: Array.isArray(parsed.notes) ? parsed.notes : [],
          modelUsed: model,
        };
      }
    } catch (err) {
      console.error(`Notes plan error with ${model}:`, err);
    }
  }

  throw new Error("Failed to generate notes plan.");
}



