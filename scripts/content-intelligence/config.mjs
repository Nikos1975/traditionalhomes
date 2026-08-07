import { configPath } from "./paths.mjs";
import { readJson } from "./utils.mjs";
import { validateBrandProfile, validateScoringRules, validateSeasonalCalendar } from "./schemas.mjs";
export async function loadConfig(rootDir) { const brand = await readJson(configPath(rootDir, "traditional-homes.json")); const scoring = await readJson(configPath(rootDir, "scoring-rules.json")); const seasonal = await readJson(configPath(rootDir, "seasonal-calendar.json")); const seeds = await readJson(configPath(rootDir, "seed-topics.json")); return { brand: validateBrandProfile(brand, "traditional-homes.json"), scoring: validateScoringRules(scoring, "scoring-rules.json"), seasonal: validateSeasonalCalendar(seasonal, "seasonal-calendar.json"), seeds }; }
