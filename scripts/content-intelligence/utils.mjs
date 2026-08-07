import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const hash = (value) => createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
export const stable = (value) => JSON.stringify(value, Object.keys(value).sort(), 2);
export function assertSlug(slug) { if (!SLUG.test(slug ?? "")) throw new Error("slug must be lowercase kebab-case."); return slug; }
export function assertMonth(month) { const value = Number(month); if (!Number.isInteger(value) || value < 1 || value > 12) throw new Error("month must be an integer from 1 to 12."); return value; }
export async function readJson(file) { try { return JSON.parse(await readFile(file, "utf8")); } catch (error) { throw new Error(`${file}: invalid JSON (${error.message})`); } }
async function writeIfChanged(file, value) { try { if (await readFile(file, "utf8") === value) return false; } catch {} await mkdir(path.dirname(file), { recursive: true }); const tmp = `${file}.${process.pid}.tmp`; await writeFile(tmp, value, "utf8"); await rename(tmp, file); return true; }
export async function atomicJson(file, value) { return writeIfChanged(file, `${JSON.stringify(value, null, 2)}\n`); }
export async function atomicText(file, value) { return writeIfChanged(file, value.endsWith("\n") ? value : `${value}\n`); }
export function contentPath(rootDir, ...parts) { const base = path.resolve(rootDir, "data", "content-intelligence"); const candidate = path.resolve(base, ...parts); if (path.relative(base, candidate).startsWith("..") || path.isAbsolute(path.relative(base, candidate))) throw new Error("Generated output must remain under data/content-intelligence/."); return candidate; }
