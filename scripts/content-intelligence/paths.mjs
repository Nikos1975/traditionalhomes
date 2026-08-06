import path from "node:path";
export const rootPath = (rootDir, ...parts) => path.join(rootDir, ...parts);
export const configPath = (rootDir, name) => rootPath(rootDir, "config", "content-intelligence", name);
