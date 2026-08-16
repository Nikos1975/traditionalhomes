import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REQUIRED_HEADINGS = [
  "# Article Visual Plan",
  "## Plan Metadata",
  "## Visual Strategy",
  "## Rights and Evidence Preconditions",
  "## Proposed Visuals",
  "## Exclusions",
  "## Approval Summary",
  "## Next Allowed Action",
];

const PLAN_STATUSES = new Set(["draft", "approved", "blocked"]);
const PLAN_DECISIONS = new Set(["visuals-proposed", "text-only"]);
const VISUAL_TYPES = new Set(["photograph", "archival-image", "map", "diagram", "generated-illustration"]);
const SOURCE_CLASSES = new Set(["owned", "licensed-third-party", "public-domain", "generated", "not-applicable"]);
const RIGHTS_STATUSES = new Set(["approved", "blocked", "not-applicable"]);
const DOCUMENTARY_STATUSES = new Set(["documentary", "contextual", "reconstruction", "diagram", "generated-illustration"]);
const DESTINATION_ROLES = new Set(["hero", "inline", "map", "diagram", "open-graph", "social"]);
const PROCESSING_PROFILES = new Set(["blog-hero", "social-image", "not-applicable", "pending"]);
const APPROVAL_STATES = new Set(["proposed", "approved", "blocked"]);
const YES_NO = new Set(["yes", "no"]);

const VISUAL_FIELDS = [
  "Visual ID",
  "Placement anchor",
  "Information purpose",
  "Visual type",
  "Source class",
  "Source path or URL",
  "Evidence or claim source",
  "Rights status",
  "Owner or licensor",
  "Permission record",
  "Attribution",
  "Modification and crop permission",
  "Documentary status",
  "Destination role",
  "Proposed output path",
  "Processing profile",
  "Crop and focal point",
  "Alt text draft",
  "Caption draft",
  "Approval state",
  "Blockers",
];

function markdownFields(markdown) {
  const fields = new Map();
  for (const match of markdown.matchAll(/^\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*$/gm)) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (key === "Field" || /^-+$/.test(key)) continue;
    fields.set(key, value);
  }
  return fields;
}

function section(markdown, heading, nextHeading) {
  const start = markdown.indexOf(heading);
  if (start < 0) return "";
  const end = nextHeading ? markdown.indexOf(nextHeading, start + heading.length) : markdown.length;
  return markdown.slice(start, end < 0 ? markdown.length : end);
}

function isPlaceholder(value) {
  return !value || /<[^>]+>/.test(value);
}

function requireField(errors, fields, field, scope) {
  const value = fields.get(field);
  if (isPlaceholder(value)) errors.push(`${scope}: "${field}" must contain a concrete value.`);
  return value ?? "";
}

function requireAllowed(errors, value, allowed, field, scope) {
  if (!allowed.has(value)) {
    errors.push(`${scope}: "${field}" must be one of: ${[...allowed].join(", ")}.`);
  }
}

function countValue(fields, field, errors) {
  const value = fields.get(field);
  if (!/^\d+$/.test(value ?? "")) {
    errors.push(`Approval Summary: "${field}" must be a non-negative integer.`);
    return Number.NaN;
  }
  return Number(value);
}

export function validateVisualPlan(markdown, { expectedSlug } = {}) {
  const errors = [];

  for (const heading of REQUIRED_HEADINGS) {
    if (!markdown.includes(heading)) errors.push(`Missing required heading: ${heading}`);
  }

  const metadata = markdownFields(section(markdown, "## Plan Metadata", "## Visual Strategy"));
  const slug = requireField(errors, metadata, "Article slug", "Plan Metadata");
  requireField(errors, metadata, "Article path", "Plan Metadata");
  requireField(errors, metadata, "Research folder", "Plan Metadata");
  const planStatus = requireField(errors, metadata, "Plan status", "Plan Metadata");
  const planDecision = requireField(errors, metadata, "Plan decision", "Plan Metadata");
  const preparedCommit = requireField(errors, metadata, "Prepared from commit", "Plan Metadata");
  const preparedDate = requireField(errors, metadata, "Prepared date", "Plan Metadata");
  requireAllowed(errors, planStatus, PLAN_STATUSES, "Plan status", "Plan Metadata");
  requireAllowed(errors, planDecision, PLAN_DECISIONS, "Plan decision", "Plan Metadata");
  if (preparedCommit && !/^[0-9a-f]{40}$/.test(preparedCommit)) {
    errors.push('Plan Metadata: "Prepared from commit" must be a full lowercase 40-character commit SHA.');
  }
  if (preparedDate && !/^\d{4}-\d{2}-\d{2}$/.test(preparedDate)) {
    errors.push('Plan Metadata: "Prepared date" must use YYYY-MM-DD.');
  }
  if (expectedSlug && slug !== expectedSlug) {
    errors.push(`Plan Metadata: article slug "${slug}" does not match expected slug "${expectedSlug}".`);
  }

  const visualArea = section(markdown, "## Proposed Visuals", "## Exclusions");
  const visualMatches = [...visualArea.matchAll(/^### Visual\s+\d+:\s+.+$[\s\S]*?(?=^### Visual\s+\d+:|\n## Exclusions|$)/gm)];
  const visuals = visualMatches.map((match, index) => {
    const heading = match[0].split("\n", 1)[0];
    const fields = markdownFields(match[0]);
    const scope = `Visual ${index + 1}`;
    for (const field of VISUAL_FIELDS) requireField(errors, fields, field, scope);

    const id = fields.get("Visual ID") ?? "";
    if (!/^VIS-\d{2}$/.test(id)) errors.push(`${scope}: "Visual ID" must match VIS-01 format.`);
    requireAllowed(errors, fields.get("Visual type"), VISUAL_TYPES, "Visual type", scope);
    requireAllowed(errors, fields.get("Source class"), SOURCE_CLASSES, "Source class", scope);
    requireAllowed(errors, fields.get("Rights status"), RIGHTS_STATUSES, "Rights status", scope);
    requireAllowed(errors, fields.get("Documentary status"), DOCUMENTARY_STATUSES, "Documentary status", scope);
    requireAllowed(errors, fields.get("Destination role"), DESTINATION_ROLES, "Destination role", scope);
    requireAllowed(errors, fields.get("Processing profile"), PROCESSING_PROFILES, "Processing profile", scope);
    requireAllowed(errors, fields.get("Approval state"), APPROVAL_STATES, "Approval state", scope);

    if (fields.get("Source class") === "generated") {
      if (fields.get("Visual type") !== "generated-illustration") {
        errors.push(`${scope}: generated sources must use visual type "generated-illustration".`);
      }
      if (!new Set(["generated-illustration", "reconstruction"]).has(fields.get("Documentary status"))) {
        errors.push(`${scope}: generated sources cannot be labelled documentary or contextual.`);
      }
      if (!/(illustrat|reconstruct)/i.test(fields.get("Caption draft") ?? "")) {
        errors.push(`${scope}: generated or reconstructed visuals need an explicit caption disclosure.`);
      }
    }

    if (fields.get("Documentary status") === "documentary" && fields.get("Source class") === "generated") {
      errors.push(`${scope}: a generated visual must never be labelled documentary.`);
    }

    return { heading, fields };
  });

  const ids = visuals.map((visual) => visual.fields.get("Visual ID"));
  if (new Set(ids).size !== ids.length) errors.push("Visual IDs must be unique.");

  const textOnlyReason = metadata.get("Text-only reason") ?? "";
  if (planDecision === "visuals-proposed" && visuals.length === 0) {
    errors.push('Plan decision "visuals-proposed" requires at least one visual section.');
  }
  if (planDecision === "text-only") {
    if (visuals.length > 0) errors.push('Plan decision "text-only" must not include visual sections.');
    if (isPlaceholder(textOnlyReason) || /^not applicable$/i.test(textOnlyReason)) {
      errors.push('Plan decision "text-only" requires a specific Text-only reason.');
    }
  }

  if (planStatus === "approved") {
    for (const [index, visual] of visuals.entries()) {
      const fields = visual.fields;
      if (fields.get("Approval state") !== "approved") {
        errors.push(`Visual ${index + 1}: an approved plan requires Approval state "approved".`);
      }
      if (!new Set(["approved", "not-applicable"]).has(fields.get("Rights status"))) {
        errors.push(`Visual ${index + 1}: an approved plan cannot retain blocked rights.`);
      }
      if (!/^(none|not applicable)$/i.test(fields.get("Blockers") ?? "")) {
        errors.push(`Visual ${index + 1}: an approved plan cannot retain blockers.`);
      }
    }
  }

  const summary = markdownFields(section(markdown, "## Approval Summary", "## Next Allowed Action"));
  const proposedCount = countValue(summary, "Proposed visuals", errors);
  const approvedCount = countValue(summary, "Approved visuals", errors);
  const blockedCount = countValue(summary, "Blocked visuals", errors);
  const actualApproved = visuals.filter((visual) => visual.fields.get("Approval state") === "approved").length;
  const actualBlocked = visuals.filter((visual) => visual.fields.get("Approval state") === "blocked").length;
  if (Number.isFinite(proposedCount) && proposedCount !== visuals.length) {
    errors.push(`Approval Summary: proposed count ${proposedCount} does not match ${visuals.length} visual sections.`);
  }
  if (Number.isFinite(approvedCount) && approvedCount !== actualApproved) {
    errors.push(`Approval Summary: approved count ${approvedCount} does not match ${actualApproved} approved visuals.`);
  }
  if (Number.isFinite(blockedCount) && blockedCount !== actualBlocked) {
    errors.push(`Approval Summary: blocked count ${blockedCount} does not match ${actualBlocked} blocked visuals.`);
  }

  for (const field of ["Rights review complete", "Evidence review complete", "Crop review complete"]) {
    const value = (summary.get(field) ?? "").toLowerCase();
    requireAllowed(errors, value, YES_NO, field, "Approval Summary");
  }
  for (const field of [
    "Article edits authorized",
    "Image generation authorized",
    "Image processing authorized",
    "Publication authorized",
  ]) {
    const value = (summary.get(field) ?? "").toLowerCase();
    if (value !== "no") errors.push(`Approval Summary: "${field}" must remain "no" in a visual plan.`);
  }

  return {
    ok: errors.length === 0,
    errors,
    summary: {
      slug,
      planStatus,
      planDecision,
      proposed: visuals.length,
      approved: actualApproved,
      blocked: actualBlocked,
    },
  };
}

async function main(argv) {
  const args = [...argv];
  const file = args.shift();
  if (!file) throw new Error("Usage: validate-visual-plan.mjs <visual-plan.md> [--slug <slug>]");
  let expectedSlug;
  if (args.length) {
    if (args[0] !== "--slug" || !args[1] || args.length !== 2) {
      throw new Error("Usage: validate-visual-plan.mjs <visual-plan.md> [--slug <slug>]");
    }
    expectedSlug = args[1];
  }
  const markdown = await readFile(path.resolve(file), "utf8");
  const result = validateVisualPlan(markdown, { expectedSlug });
  if (!result.ok) {
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `Validated visual plan for ${result.summary.slug}: ${result.summary.planDecision}; ${result.summary.proposed} proposed, ${result.summary.approved} approved, ${result.summary.blocked} blocked.`,
  );
}

const invokedUrl = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;

if (import.meta.url === invokedUrl) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
