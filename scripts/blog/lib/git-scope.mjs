export function parsePorcelainStatus(output) {
  return String(output ?? "")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const status = line.slice(0, 2);
      const rawPath = line.slice(3).trim();
      const renameParts = rawPath.includes(" -> ")
        ? rawPath.split(" -> ")
        : null;
      const renamedPath = renameParts ? renameParts.at(-1) : rawPath;
      const entry = {
        status,
        path: renamedPath.replace(/^"|"$/g, "").replace(/\\/g, "/"),
      };
      if (renameParts)
        entry.originalPath = renameParts[0]
          .replace(/^"|"$/g, "")
          .replace(/\\/g, "/");
      return entry;
    });
}

function isAllowed(filePath, allowedPaths) {
  return allowedPaths.some(
    (allowed) =>
      filePath === allowed ||
      (allowed.endsWith("/") && filePath.startsWith(allowed)),
  );
}

export function assertOnlyAllowedChanges(entries, allowedPaths = []) {
  const unrelated = entries.filter(
    (entry) =>
      !isAllowed(entry.path, allowedPaths) ||
      (entry.originalPath && !isAllowed(entry.originalPath, allowedPaths)),
  );
  if (unrelated.length > 0) {
    throw new Error(
      `Unrelated changed files detected:\n${unrelated.map((entry) => `- ${entry.status} ${entry.originalPath ? `${entry.originalPath} -> ` : ""}${entry.path}`).join("\n")}`,
    );
  }
}

export function assertCleanWorkingTree(entries) {
  if (entries.length > 0) {
    throw new Error(
      `Working tree must be clean before scaffolding a blog run:\n${entries.map((entry) => `- ${entry.status} ${entry.path}`).join("\n")}`,
    );
  }
}
