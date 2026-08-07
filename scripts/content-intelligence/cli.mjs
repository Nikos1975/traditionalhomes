#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadConfig } from "./config.mjs";
import { buildInventory, inventoryMarkdown } from "./inventory.mjs";
import { discoverTopics } from "./discovery.mjs";
import { seasonalPlan, seasonalMarkdown } from "./seasonal.mjs";
import { createVideoPlan, videoPlanMarkdown } from "./video-plan.mjs";
import { validateVideoPlan } from "./schemas.mjs";
import { importSearchConsoleCsv } from "./gsc-import.mjs";
import { analyzeSearchConsole, searchConsoleMarkdown } from "./gsc-analysis.mjs";
import { LocalUserAdcAuthProvider } from "./gsc-auth.mjs";
import { SearchConsoleTransport } from "./gsc-transport.mjs";
import { normalizeProperties, validateProperty } from "./gsc-api-normalize.mjs";
import { fetchSearchAnalyticsPages } from "./gsc-acquire.mjs";
import { buildApiDataset, persistDataset } from "./gsc-dataset.mjs";
import { assertMonth, assertSlug, atomicJson, atomicText, contentPath } from "./utils.mjs";
const flags = { inventory: ["published-only"], discover: ["month"], seasonal: ["month"], video: ["slug"], status: ["json"], "gsc-import": ["file", "property"], "gsc-analyze": ["high-impressions", "low-clicks", "near-rank"], "gsc-status": ["json"], "gsc-properties": ["json"], "gsc-fetch": ["property", "start-date", "end-date", "dimensions", "row-limit"] };
function parse(command, argv) { const result = { _: [] }; for (let i = 0; i < argv.length; i += 1) { const token = argv[i]; if (!token.startsWith("--")) { result._.push(token); continue; } const key = token.slice(2); if (!flags[command]?.includes(key) || result[key] !== undefined) throw new Error(`Invalid argument: ${token}.`); if (["json", "published-only"].includes(key)) result[key] = true; else { const value = argv[++i]; if (!value || value.startsWith("--")) throw new Error(`Invalid argument: ${token} requires a value.`); result[key] = value; } } return result; }
const positional = (args, named, label) => { if (args._.length > 1 || (args._.length && named !== undefined)) throw new Error(`Invalid argument: ${label} accepts one value only.`); return named ?? args._[0]; };
const discoveryMarkdown = (items) => `# Discovery\n\n${items.map((item) => `## ${item.title}\n- Score: ${item.finalScore}/100\n- Status: ${item.recommendedStatus}\n- Evidence: ${item.evidenceState}\n- Next action: ${item.nextAction}`).join("\n\n")}\n`;
const isoDate = (value, label) => { if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) throw new Error(`Invalid argument: ${label} must be an ISO date.`); return value; };
const gscRequest = (args) => {
  for (const key of ["property", "start-date", "end-date", "dimensions"]) if (!args[key]) throw new Error("Invalid argument: gsc-fetch requires --property, --start-date, --end-date, and --dimensions.");
  validateProperty(args.property); const startDate = isoDate(args["start-date"], "--start-date"); const endDate = isoDate(args["end-date"], "--end-date");
  const days = Math.round((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86400000) + 1;
  if (days < 1) throw new Error("Invalid argument: --start-date must not be after --end-date."); if (days > 365) throw new Error("Invalid argument: requested range must be at most 365 days.");
  const dimensions = args.dimensions.split(","); const allowed = new Set(["query", "page", "date", "query,page", "query,date", "page,date"]);
  if (!allowed.has(args.dimensions)) throw new Error("Invalid argument: --dimensions is unsupported.");
  const rowLimit = args["row-limit"] === undefined ? 25000 : Number(args["row-limit"]); if (!Number.isInteger(rowLimit) || rowLimit < 1 || rowLimit > 25000) throw new Error("Invalid argument: --row-limit must be an integer from 1 to 25000.");
  return { property: args.property, startDate, endDate, dimensions, rowLimit, type: "web", dataState: "final", aggregationType: "auto" };
};
export async function runContentCli({ command, argv, rootDir = process.cwd(), authProvider = new LocalUserAdcAuthProvider(), transport = new SearchConsoleTransport() }) {
  const args = parse(command, argv);
  const processed = contentPath(rootDir, "search-console", "processed");
  const listProcessed = async () => { try { return (await readdir(processed)).filter((name) => name.endsWith(".json")).sort(); } catch { return []; } };
  if (command === "gsc-status") {
    if (args._.length) throw new Error("Invalid argument: gsc-status accepts no positional arguments.");
    const names = await listProcessed();
    const result = { processedDatasets: names.length, datasets: names };
    return args.json ? result : `Search Console status\nProcessed datasets: ${result.processedDatasets}`;
  }
  if (command === "gsc-import") {
    if (args._.length || !args.file || !args.property) throw new Error("Invalid argument: gsc-import requires --file and --property.");
    return importSearchConsoleCsv({ rootDir, file: args.file, property: args.property });
  }
  if (command === "gsc-properties") {
    if (args._.length) throw new Error("Invalid argument: gsc-properties accepts no positional arguments.");
    const accessToken = await authProvider.getAccessToken();
    const properties = normalizeProperties(await transport.listSites(accessToken));
    return args.json ? properties : properties.map((item) => `${item.property}\t${item.permissionLevel}`).join("\n");
  }
  if (command === "gsc-fetch") {
    if (args._.length) throw new Error("Invalid argument: gsc-fetch accepts no positional arguments.");
    const request = gscRequest(args);
    const accessToken = await authProvider.getAccessToken();
    const properties = normalizeProperties(await transport.listSites(accessToken));
    if (!properties.some((item) => item.property === request.property)) throw new Error("Search Console property is not accessible.");
    const acquired = await fetchSearchAnalyticsPages({ transport, accessToken, request });
    return persistDataset({ rootDir, dataset: buildApiDataset({ ...request, ...acquired }) });
  }
  if (command === "gsc-analyze") {
    if (args._.length) throw new Error("Invalid argument: gsc-analyze accepts no positional arguments.");
    const names = await listProcessed();
    if (!names.length) throw new Error("No processed Search Console datasets are available.");
    const datasets = await Promise.all(names.map((name) => readFile(path.join(processed, name), "utf8").then(JSON.parse)));
    const inventory = await buildInventory({ rootDir, includeDrafts: true });
    const options = { highImpressions: args["high-impressions"], lowClicks: args["low-clicks"], nearRank: args["near-rank"] };
    const result = analyzeSearchConsole({ datasets, inventory, options });
    await atomicJson(contentPath(rootDir, "search-console", "analysis.json"), result);
    await atomicText(contentPath(rootDir, "search-console", "analysis.md"), searchConsoleMarkdown(result));
    return result;
  }
  const config = await loadConfig(rootDir);
  if (command === "inventory") { if (args._.length) throw new Error("Invalid argument: inventory accepts no positional arguments."); const result = await buildInventory({ rootDir, includeDrafts: !args["published-only"] }); await atomicJson(contentPath(rootDir, "inventory.json"), result); await atomicText(contentPath(rootDir, "inventory.md"), inventoryMarkdown(result)); return result; } if (command === "discover") { const month = assertMonth(positional(args, args.month, "discover") ?? 9); const inventory = await buildInventory({ rootDir, includeDrafts: true }); const candidates = discoverTopics({ inventory, rules: config.scoring, seeds: config.seeds, month }); const result = { schemaVersion: 2, month, generatedAt: "deterministic", candidates }; await atomicJson(contentPath(rootDir, "discovery", `2026-${String(month).padStart(2, "0")}.json`), result); await atomicText(contentPath(rootDir, "discovery", `2026-${String(month).padStart(2, "0")}.md`), discoveryMarkdown(candidates)); return result; } if (command === "seasonal") { const month = assertMonth(positional(args, args.month, "seasonal")); const inventory = await buildInventory({ rootDir, includeDrafts: true }); const result = seasonalPlan({ inventory, calendar: config.seasonal, month, candidates: discoverTopics({ inventory, rules: config.scoring, seeds: config.seeds, month }) }); await atomicJson(contentPath(rootDir, "seasonal", `2026-${String(month).padStart(2, "0")}.json`), result); await atomicText(contentPath(rootDir, "seasonal", `2026-${String(month).padStart(2, "0")}.md`), seasonalMarkdown(result)); return result; } if (command === "video") { const slug = assertSlug(positional(args, args.slug, "video")); const result = await createVideoPlan({ rootDir, slug }); await atomicJson(contentPath(rootDir, "video-plans", `${slug}.json`), result); await atomicText(contentPath(rootDir, "video-plans", `${slug}.md`), videoPlanMarkdown(result)); return result; } if (command !== "status" || args._.length) throw new Error(`Invalid argument: ${command}.`); const list = async (folder) => { try { return await readdir(contentPath(rootDir, folder)); } catch { return []; } }; const inventory = await buildInventory({ rootDir, includeDrafts: true }); const [discoveries, seasonals, plans] = await Promise.all([list("discovery"), list("seasonal"), list("video-plans")]); const invalidRecords = []; const parsedPlans = []; for (const name of plans.filter((name) => name.endsWith(".json"))) try { const plan = JSON.parse(await readFile(contentPath(rootDir, "video-plans", name), "utf8")); validateVideoPlan(plan); parsedPlans.push(plan); } catch (error) { invalidRecords.push(`${name}: ${error.message}`); } const latestDiscoveryRun = discoveries.filter((name) => name.endsWith(".json")).sort().at(-1) ?? null; const candidateCounts = {}; if (latestDiscoveryRun) for (const candidate of JSON.parse(await readFile(contentPath(rootDir, "discovery", latestDiscoveryRun), "utf8")).candidates) candidateCounts[candidate.recommendedStatus] = (candidateCounts[candidate.recommendedStatus] ?? 0) + 1; const result = { inventory: { exists: true, fingerprint: inventory.articles.map((article) => article.sourceFingerprint).join("") }, latestDiscoveryRun, latestSeasonalRun: seasonals.filter((name) => name.endsWith(".json")).sort().at(-1) ?? null, candidatesByRecommendedStatus: candidateCounts, videoPlans: parsedPlans.length, stalePlans: parsedPlans.filter((plan) => inventory.articles.find((article) => article.slug === plan.articleSlug)?.sourceFingerprint !== plan.sourceFingerprint).map((plan) => plan.articleSlug), plansAwaitingHumanReview: parsedPlans.filter((plan) => plan.publicationReadiness.requiresHumanReview).map((plan) => plan.articleSlug), missingConfiguration: [], invalidRecords }; return args.json ? result : `Content intelligence status\nInventory: present\nLatest discovery: ${result.latestDiscoveryRun ?? "none"}\nLatest seasonal: ${result.latestSeasonalRun ?? "none"}\nVideo plans: ${result.videoPlans}`; }
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) { const [command, ...argv] = process.argv.slice(2); const forwarded = command === "status" && process.env.npm_config_json === "true" ? [...argv, "--json"] : argv; runContentCli({ command, argv: forwarded }).then((result) => console.log(typeof result === "string" ? result : JSON.stringify(result, null, 2))).catch((error) => { console.error(`BLOCKED: ${error.message}`); process.exitCode = 1; }); }
