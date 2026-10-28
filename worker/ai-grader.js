/**
 * Mr Coach AI answer grader — Cloudflare Worker
 *
 * Setup:
 * 1. Create a Cloudflare Worker and paste this file.
 * 2. Add OPENAI_API_KEY as a Worker secret (never put it in the public app).
 * 3. Deploy. Copy the Worker URL and paste it into Mr Coach > Set up AI grading.
 */
const ALLOWED_ORIGIN = "https://soldierms.github.io";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (origin !== ALLOWED_ORIGIN) return json({ error: "Origin not allowed." }, 403, cors);
    if (request.method !== "POST") return json({ error: "Use POST." }, 405, cors);
    if (!env.OPENAI_API_KEY) return json({ error: "The server is missing its OPENAI_API_KEY secret." }, 500, cors);

    try {
      const body = await request.json();
      const question = String(body.question || "").slice(0, 2000);
      const answer = String(body.answer || "").slice(0, 8000);
      if (!question.trim() || !answer.trim()) return json({ error: "Question and answer are required." }, 400, cors);

      const prompt = `You are a fair, supportive technical interview coach for a Platform/DevOps Engineer. Evaluate only the answer provided, using the question and reference answer for context. Background provided by the learner: ${String(body.background || "").slice(0, 2000)}. Do not invent experience, tools, achievements, or metrics. Give credit for correct equivalent wording. Be constructive and specific. Score from 0 to 100 based on technical accuracy (35%), completeness (25%), clarity/structure (20%), and practical application/example (20%). If a category cannot reasonably apply, redistribute its weight. Return ONLY valid JSON with this schema:
{
 "score": number,
 "overall": "short assessment",
 "criteria": [{"name":"Technical accuracy","score":number,"feedback":"..."},{"name":"Completeness","score":number,"feedback":"..."},{"name":"Clarity and structure","score":number,"feedback":"..."},{"name":"Practical application","score":number,"feedback":"..."}],
 "strengths": ["..."],
 "improvements": ["..."],
 "sample_answer": "A natural interview-ready answer, not overstating experience",
 "note": "Brief reminder to keep examples truthful"
}
The score must reflect the learner's actual answer, not how good the sample answer is.`;

      const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: JSON.stringify({
              question,
              category: String(body.category || "").slice(0, 200),
              reference_answer: String(body.suggested_answer || "").slice(0, 5000),
              example: String(body.example || "").slice(0, 2000),
              learner_answer: answer
            }) }
          ]
        })
      });
      const data = await upstream.json();
      if (!upstream.ok) return json({ error: data.error?.message || "AI provider request failed." }, 502, cors);
      const content = data.choices?.[0]?.message?.content;
      if (!content) return json({ error: "AI provider returned no grading result." }, 502, cors);
      let grade;
      try { grade = JSON.parse(content); } catch { return json({ error: "AI returned invalid grading JSON. Please retry." }, 502, cors); }
      grade.score = Math.max(0, Math.min(100, Number(grade.score) || 0));
      return json(grade, 200, cors);
    } catch {
      return json({ error: "Invalid request or grading service unavailable." }, 400, cors);
    }
  }
};

function json(value, status, cors) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
