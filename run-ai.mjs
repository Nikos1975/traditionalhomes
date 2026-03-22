import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "minimax/minimax-m2.7";

const MEMORY_DIR = path.join(ROOT, ".ai", "memory");
const LOGS_DIR = path.join(ROOT, ".ai", "logs", "sessions");
const ARCHIVE_DIR = path.join(ROOT, ".ai", "logs", "archive");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8").trim();
  } catch {
    return "";
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf-8");
}

function section(title, content) {
  if (!content) return "";
  return `\n## ${title}\n${content}\n`;
}

function getSessionFiles() {
  ensureDir(LOGS_DIR);
  return fs.readdirSync(LOGS_DIR).filter((f) => f.endsWith(".md")).sort();
}

function moveToArchive(files) {
  ensureDir(ARCHIVE_DIR);
  for (const file of files) {
    const from = path.join(LOGS_DIR, file);
    const to = path.join(ARCHIVE_DIR, file);
    fs.renameSync(from, to);
  }
}

function buildCodingPrompt(userTask, files = []) {
  const architecture = safeRead(path.join(MEMORY_DIR, "architecture.md"));
  const conventions = safeRead(path.join(MEMORY_DIR, "conventions.md"));
  const currentTask = safeRead(path.join(MEMORY_DIR, "current-task.md"));
  const decisions = safeRead(path.join(MEMORY_DIR, "decisions.md"));
  const bugs = safeRead(path.join(MEMORY_DIR, "bugs.md"));
  const rollingSummary = safeRead(path.join(MEMORY_DIR, "rolling-summary.md"));

  const fileSections = files
    .map((file) => {
      const fullPath = path.join(ROOT, file);
      const content = safeRead(fullPath);
      if (!content) return `\n## File: ${file}\n[File not found or empty]\n`;
      return `\n## File: ${file}\n\`\`\`\n${content}\n\`\`\`\n`;
    })
    .join("\n");

  return `
You are working inside an existing Astro codebase.

Priorities:
1. Maintainability
2. Performance
3. SEO durability
4. Minimal complexity

Rules:
- Prefer simple, safe fixes
- Avoid unnecessary dependencies
- Avoid heavy client-side JavaScript
- Preserve static-first design
- If uncertain, say so and flag the risk

${section("Architecture", architecture)}
${section("Conventions", conventions)}
${section("Current Task", currentTask)}
${section("Relevant Decisions", decisions)}
${section("Known Bugs", bugs)}
${section("Rolling Summary", rollingSummary)}

${fileSections}

## User Request
${userTask}

## Output Requirements
- Brief root cause
- Safest fix
- Exact code changes
- Risks / side effects
`.trim();
}

async function callOpenRouter(prompt) {
  if (!API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY environment variable");
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function saveSessionLog(userTask, response, files = []) {
  ensureDir(LOGS_DIR);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logFile = path.join(LOGS_DIR, `${timestamp}.md`);

  const content = `# Session ${timestamp}

## Request
${userTask}

## Files
${files.length ? files.map((f) => `- ${f}`).join("\n") : "- None specified"}

## Response
${response}
`;

  writeFile(logFile, content);
}

async function summarizeAndArchive(batchSize = 5) {
  const sessionFiles = getSessionFiles();
  if (sessionFiles.length < batchSize) return;

  const filesToSummarize = sessionFiles.slice(0, batchSize);
  const combined = filesToSummarize
    .map((file) => {
      const content = safeRead(path.join(LOGS_DIR, file));
      return `\n# ${file}\n${content}\n`;
    })
    .join("\n");

  const summaryPrompt = `
You are summarizing recent coding sessions for a project memory file.

Create a concise rolling summary with exactly these sections:

# Rolling Summary

## Period
## Completed
## Decisions made
## Open issues
## Next recommended task

Rules:
- Be concrete
- Do not invent work that was not done
- Use bullets
- Keep it compact and useful for future coding sessions

Sessions:
${combined}
`.trim();

  const summary = await callOpenRouter(summaryPrompt);
  writeFile(path.join(MEMORY_DIR, "rolling-summary.md"), summary);
  moveToArchive(filesToSummarize);
}

async function main() {
  ensureDir(MEMORY_DIR);
  ensureDir(LOGS_DIR);
  ensureDir(ARCHIVE_DIR);

  const userTask = process.argv[2] || "Explain the current task.";
  const files = process.argv.slice(3);

  const prompt = buildCodingPrompt(userTask, files);
  const response = await callOpenRouter(prompt);

  console.log("\n=== AI RESPONSE ===\n");
  console.log(response);

  saveSessionLog(userTask, response, files);

  await summarizeAndArchive(5);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});