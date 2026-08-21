import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFile(path.join(rootDir, relativePath), 'utf8');

test('blog orchestrator routes editorial work through the editorial-research workspace', async () => {
  const orchestrator = await read('BLOG_ORCHESTRATOR.md');

  assert.match(orchestrator, /`research-only`/);
  assert.match(orchestrator, /\.agents\/workspaces\/editorial-research\/CONTEXT\.md/);
  assert.match(orchestrator, /research deliverables only/i);
  assert.match(orchestrator, /no automatic publication/i);
  assert.match(orchestrator, /no automatic merge/i);
});

test('editorial-research workspace routes one bounded stage at a time', async () => {
  const workspace = await read('.agents/workspaces/editorial-research/CONTEXT.md');

  for (const stage of [
    'stages/01_research/CONTEXT.md',
    'stages/02_drafting/CONTEXT.md',
    'stages/03_revision/CONTEXT.md',
    'stages/04_audit/CONTEXT.md',
  ]) {
    assert.match(workspace, new RegExp(stage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(workspace, /`research-only` stops after Stage 01/);
  assert.match(workspace, /Research and drafting are separate mental modes/);
  assert.match(workspace, /Publication, visual-plan, and image-only work remain routed by `BLOG_ORCHESTRATOR\.md`/);
});

test('research stage is evidence-only and stops before article drafting', async () => {
  const stage = await read('.agents/workspaces/editorial-research/stages/01_research/CONTEXT.md');

  assert.match(stage, /Do not write the final article in this stage/);
  assert.match(stage, /verified/);
  assert.match(stage, /qualified\/uncertain/);
  assert.match(stage, /rejected/);
  assert.match(stage, /unresolved/);
  assert.match(stage, /For `research-only`, stop here/);
  assert.match(stage, /A registered topic-local `CONTEXT\.md` narrows these outputs/);
  assert.match(stage, /`research-only` still stops at this stage/);
});

test('drafting stage requires reviewed evidence and keeps publication separate', async () => {
  const stage = await read('.agents/workspaces/editorial-research/stages/02_drafting/CONTEXT.md');

  assert.match(stage, /\.agents\/skills\/blog-research-article\/SKILL\.md/);
  assert.match(stage, /Confirm Stage 01 is complete/);
  assert.match(stage, /draft: true/);
  assert.match(stage, /Route new evidence work back to Stage 01/);
});

test('revision and audit stages cannot silently become research or publication', async () => {
  const revision = await read('.agents/workspaces/editorial-research/stages/03_revision/CONTEXT.md');
  const audit = await read('.agents/workspaces/editorial-research/stages/04_audit/CONTEXT.md');

  assert.match(revision, /\.agents\/skills\/blog-revise-draft\/SKILL\.md/);
  assert.match(revision, /route that work to Stage 01/);
  assert.match(revision, /Preserve `draft: true`/);

  assert.match(audit, /\.agents\/skills\/blog-content-audit\/SKILL\.md/);
  assert.match(audit, /read-only by default/i);
  assert.match(audit, /Return findings without editing files/);
  assert.match(audit, /Do not convert an audit into a revision implicitly/);
});
