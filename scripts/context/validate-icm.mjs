#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(scriptDir, '../..');

function parseArgs(argv) {
  let root = defaultRoot;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--root') {
      const value = argv[i + 1];
      if (!value) throw new Error('--root requires a path');
      root = path.resolve(value);
      i += 1;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/context/validate-icm.mjs [--root <repo>]');
      process.exit(0);
    }
    throw new Error(`unknown argument: ${arg}`);
  }
  return root;
}

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) files.push(full);
    }
  }
  return files;
}

function readUtf8(file) {
  return fs.readFileSync(file, 'utf8');
}

function relative(root, file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function hasHeading(markdown, heading) {
  return markdown
    .split(/\r?\n/)
    .some((line) => line.replace(/^##\s+/, '').trim().toLowerCase() === heading.toLowerCase() && /^##\s+/.test(line));
}

function extractBacktickRefs(markdown) {
  const refs = [];
  for (const match of markdown.matchAll(/`([^`\r\n]+)`/g)) refs.push(match[1].trim());
  return refs;
}

function looksLikeRepoReference(value) {
  if (!value || /\s/.test(value) || /[<>*]/.test(value)) return false;
  if (/^(?:https?:|mailto:|npm$|node$)/i.test(value)) return false;
  if (/^\/(?!\.agents\/|docs\/|\.ai\/|src\/|scripts\/|tests\/|public\/|functions\/)/.test(value)) return false;
  if (/^(?:\.agents|docs|\.ai|src|scripts|tests|public|functions)\//.test(value)) return true;
  if (/^(?:stages|references|templates|examples)\//.test(value)) return true;
  return /\.(?:md|json|ts|astro|mjs|js|txt)$/i.test(value) || value.endsWith('/');
}

function resolveReference(repoRoot, sourceFile, ref) {
  const clean = ref.replace(/^\//, '');
  if (/^(?:\.agents|docs|\.ai|src|scripts|tests|public|functions)\//.test(clean)) {
    return path.join(repoRoot, clean);
  }
  return path.resolve(path.dirname(sourceFile), clean);
}

function sizeThreshold(relativePath) {
  if (relativePath === 'CLAUDE.md') return 12_000;
  if (relativePath === 'CONTEXT.md') return 8_000;
  if (/^\.agents\/workspaces\/[^/]+\/CONTEXT\.md$/.test(relativePath)) return 8_000;
  if (/\/stages\/[^/]+\/CONTEXT\.md$/.test(relativePath)) return 12_000;
  return null;
}

function runAudit(repoRoot) {
  const failures = [];
  const warnings = [];
  const requiredRootFiles = ['CLAUDE.md', 'CONTEXT.md'];

  for (const item of requiredRootFiles) {
    if (!fs.existsSync(path.join(repoRoot, item))) failures.push(`missing required Layer ${item === 'CLAUDE.md' ? '0' : '1'} file: ${item}`);
  }

  const workspacesRoot = path.join(repoRoot, '.agents', 'workspaces');
  if (!fs.existsSync(workspacesRoot)) failures.push('missing workspace router directory: .agents/workspaces');

  const claudePath = path.join(repoRoot, 'CLAUDE.md');
  if (fs.existsSync(claudePath)) {
    const claude = readUtf8(claudePath);
    if (!claude.includes('CONTEXT.md')) failures.push('CLAUDE.md does not route to CONTEXT.md');

    const forbiddenGlobalImports = [
      /\.ai\/memory\/current-task\.md/i,
      /docs\/agent-handoff-notes\.md/i,
      /docs\/handoff\/current\.md/i,
      /\.agent\//i,
    ];
    for (const line of claude.split(/\r?\n/)) {
      if (!/^\s*@/.test(line)) continue;
      if (forbiddenGlobalImports.some((pattern) => pattern.test(line))) {
        failures.push(`Layer 4 material imported globally from CLAUDE.md: ${line.trim()}`);
      }
    }
  }

  const workspaceContextFiles = walkFiles(workspacesRoot).filter((file) => path.basename(file) === 'CONTEXT.md');
  const stageFiles = workspaceContextFiles.filter((file) => relative(repoRoot, file).includes('/stages/'));

  if (fs.existsSync(workspacesRoot) && workspaceContextFiles.length === 0) {
    failures.push('no workspace CONTEXT.md routers found under .agents/workspaces');
  }

  for (const stageFile of stageFiles) {
    const text = readUtf8(stageFile);
    const rel = relative(repoRoot, stageFile);
    for (const heading of ['Inputs', 'Process', 'Outputs', 'Verify', 'Stop conditions']) {
      if (!hasHeading(text, heading)) failures.push(`${rel} is missing required section: ## ${heading}`);
    }
    if (!/\|\s*L3\s*\|/i.test(text)) failures.push(`${rel} Inputs do not declare Layer 3 references`);
    if (!/\|\s*L4\s*\|/i.test(text)) failures.push(`${rel} Inputs do not declare Layer 4 working material`);
  }

  const activeFiles = [
    'CLAUDE.md',
    'AGENTS.md',
    'CONTEXT.md',
    'BLOG_ORCHESTRATOR.md',
  ]
    .map((item) => path.join(repoRoot, item))
    .filter((file) => fs.existsSync(file));
  activeFiles.push(...workspaceContextFiles);

  const seenReferenceFailures = new Set();
  for (const sourceFile of activeFiles) {
    const text = readUtf8(sourceFile);
    for (const ref of extractBacktickRefs(text)) {
      if (!looksLikeRepoReference(ref)) continue;
      const target = resolveReference(repoRoot, sourceFile, ref);
      if (!fs.existsSync(target)) {
        const key = `${relative(repoRoot, sourceFile)} -> ${ref}`;
        if (!seenReferenceFailures.has(key)) {
          seenReferenceFailures.add(key);
          failures.push(`dead routed reference: ${key}`);
        }
      }
    }
  }

  const pagesRoot = path.join(repoRoot, 'src', 'pages');
  for (const file of walkFiles(pagesRoot)) {
    if (file.toLowerCase().endsWith('.md')) {
      failures.push(`Markdown under src/pages becomes a public route: ${relative(repoRoot, file)}`);
    }
  }

  const structuralFiles = [
    ...activeFiles,
    ...stageFiles,
  ];
  const seenStructural = new Set();
  for (const file of structuralFiles) {
    const rel = relative(repoRoot, file);
    if (seenStructural.has(rel)) continue;
    seenStructural.add(rel);
    const threshold = sizeThreshold(rel);
    if (!threshold) continue;
    const length = readUtf8(file).length;
    if (length > threshold) warnings.push(`${rel} is ${length} characters; review whether context should be split (threshold ${threshold})`);
  }

  return { failures, warnings };
}

let repoRoot;
try {
  repoRoot = parseArgs(process.argv.slice(2));
} catch (error) {
  console.error(`ICM context audit argument error: ${error.message}`);
  process.exit(2);
}

const { failures, warnings } = runAudit(repoRoot);

if (warnings.length) {
  console.warn('ICM context audit warnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (failures.length) {
  console.error('ICM context audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`ICM context audit passed (${repoRoot}).`);
