import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const RUN_STATES = [
  "initialized",
  "overlap-checked",
  "researched",
  "claims-reviewed",
  "drafted",
  "media-ready",
  "validated",
  "draft-pr-open",
  "editorial-approved",
];

function compactTimestamp(date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

export function createRunRecord({
  topic,
  slug,
  distinctAngle,
  baseCommit,
  now = new Date(),
  entropy,
}) {
  if (!topic?.trim()) throw new Error("topic is required.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? ""))
    throw new Error("slug must be lowercase kebab-case.");
  if (!/^[0-9a-f]{40}$/i.test(baseCommit ?? ""))
    throw new Error("baseCommit must be a full Git commit hash.");
  const suffix = entropy ?? randomBytes(3).toString("hex");
  if (!/^[a-z0-9]+$/.test(suffix))
    throw new Error("entropy must contain only lowercase letters and numbers.");
  const timestamp = now.toISOString();
  return {
    schemaVersion: 1,
    runId: `${compactTimestamp(now)}-${slug}-${suffix}`,
    topic: topic.trim(),
    slug,
    distinctAngle: distinctAngle?.trim() || null,
    baseCommit,
    state: "initialized",
    completedStates: ["initialized"],
    createdAt: timestamp,
    updatedAt: timestamp,
    blocked: null,
    operations: {},
    approvals: {},
    artifacts: {},
    checks: {},
  };
}

export function advanceRun(run, nextState, now = new Date()) {
  const currentIndex = RUN_STATES.indexOf(run.state);
  const nextIndex = RUN_STATES.indexOf(nextState);
  if (currentIndex < 0 || nextIndex !== currentIndex + 1) {
    throw new Error(`Invalid run transition: ${run.state} -> ${nextState}`);
  }
  return {
    ...run,
    state: nextState,
    completedStates: [...run.completedStates, nextState],
    updatedAt: now.toISOString(),
    blocked: null,
  };
}

export function markRunBlocked(run, reason, now = new Date()) {
  if (!reason?.trim()) throw new Error("A blocked-state reason is required.");
  return {
    ...run,
    state: "blocked",
    updatedAt: now.toISOString(),
    blocked: {
      reason: reason.trim(),
      previousState: run.state,
      at: now.toISOString(),
    },
  };
}

export function resumeBlockedRun(run, now = new Date()) {
  if (run?.state !== "blocked") {
    throw new Error("Run must be blocked before it can be resumed.");
  }
  const previousState = run.blocked?.previousState;
  if (!RUN_STATES.includes(previousState)) {
    throw new Error(`Invalid blocked previous state: ${previousState}`);
  }
  return {
    ...run,
    state: previousState,
    updatedAt: now.toISOString(),
    blocked: null,
  };
}

export function runDirectory(rootDir, runId) {
  if (
    !/^[0-9]{8}T[0-9]{6}Z-[a-z0-9]+(?:-[a-z0-9]+)*-[a-z0-9]+$/.test(runId ?? "")
  ) {
    throw new Error("Invalid run ID.");
  }
  return path.join(rootDir, ".blog-runs", runId);
}

export async function loadRun({ rootDir, runId }) {
  return JSON.parse(
    await readFile(path.join(runDirectory(rootDir, runId), "run.json"), "utf8"),
  );
}

export async function saveRun({ rootDir, run }) {
  const existing = await loadRun({ rootDir, runId: run.runId });
  for (const key of [
    "runId",
    "topic",
    "slug",
    "distinctAngle",
    "baseCommit",
    "createdAt",
  ]) {
    if (existing[key] !== run[key])
      throw new Error(`Immutable run field changed: ${key}`);
  }
  await writeFile(
    path.join(runDirectory(rootDir, run.runId), "run.json"),
    `${JSON.stringify(run, null, 2)}\n`,
  );
}

export async function initializeRunFiles({ rootDir, run, resume = false }) {
  const parent = path.join(rootDir, ".blog-runs");
  const directory = runDirectory(rootDir, run.runId);
  await mkdir(parent, { recursive: true });
  try {
    await mkdir(directory);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    if (!resume)
      throw new Error(
        `Refusing to overwrite existing run directory: ${path.relative(rootDir, directory)}`,
      );
    const existing = await loadRun({ rootDir, runId: run.runId });
    for (const key of [
      "runId",
      "topic",
      "slug",
      "distinctAngle",
      "baseCommit",
      "createdAt",
    ]) {
      if (existing[key] !== run[key])
        throw new Error(`Resume mismatch for immutable run field: ${key}`);
    }
    return { run: existing, directory, resumed: true };
  }

  await writeFile(
    path.join(directory, "run.json"),
    `${JSON.stringify(run, null, 2)}\n`,
    { flag: "wx" },
  );
  await writeFile(path.join(directory, "command-log.json"), "[]\n", {
    flag: "wx",
  });
  await writeFile(path.join(directory, "transient-checks.json"), "{}\n", {
    flag: "wx",
  });
  return { run, directory, resumed: false };
}

function assertNoSensitiveFields(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (
      /(?:token|secret|password|authorization|header|environment|env)/i.test(
        key,
      )
    ) {
      throw new Error(`Sensitive command-log field is not allowed: ${key}`);
    }
    assertNoSensitiveFields(child);
  }
}

export async function appendCommandLog({ rootDir, runId, entry }) {
  assertNoSensitiveFields(entry);
  const logPath = path.join(runDirectory(rootDir, runId), "command-log.json");
  const log = JSON.parse(await readFile(logPath, "utf8"));
  if (!Array.isArray(log))
    throw new Error("command-log.json must contain an array.");
  log.push(entry);
  await writeFile(logPath, `${JSON.stringify(log, null, 2)}\n`);
}

export async function saveTransientChecks({ rootDir, runId, checks }) {
  assertNoSensitiveFields(checks);
  await writeFile(
    path.join(runDirectory(rootDir, runId), "transient-checks.json"),
    `${JSON.stringify(checks, null, 2)}\n`,
  );
}
