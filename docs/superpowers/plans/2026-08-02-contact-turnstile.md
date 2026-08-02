# Contact Turnstile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect the English contact form with Cloudflare Turnstile and strict server-side submission validation.

**Architecture:** The Astro page renders a managed Turnstile widget using only the public site key, and its client script holds submission until the widget supplies a token. The Pages Function validates cheap form fields and the honeypot before calling Siteverify; only a successful, expected action and hostname may continue to the existing Email Service REST send.

**Tech Stack:** Astro, Cloudflare Pages Functions, native Fetch/FormData, Node built-in test runner.

---

### Task 1: Define server-side security behaviour

**Files:**
- Modify: `tests/contact-function.test.mjs`
- Modify: `package.json`

- [ ] Add a `test` script that runs Node's built-in test runner and write failing tests for missing, invalid, expired/duplicate, wrong-action, wrong-hostname, and network-failed Turnstile validation.
- [ ] Add failing tests confirming the honeypot and malformed fields make no external calls, invalid properties are rejected, and a validated submission makes one Siteverify call and one unchanged Email Service REST call.
- [ ] Run `npm test` and confirm the new security expectations fail before implementation.

### Task 2: Implement the server-side validation gate

**Files:**
- Modify: `functions/api/contact.js`
- Test: `tests/contact-function.test.mjs`

- [ ] Add a small internal Siteverify helper that posts `secret`, `response`, and an optional `remoteip` from `CF-Connecting-IP` to Cloudflare's Siteverify endpoint.
- [ ] Validate name (2–80), email (maximum 254), message (15–2000), property allowlist, and honeypot before Siteverify.
- [ ] Require a configured `TURNSTILE_SECRET_KEY`, a successful Siteverify result, `action: contact`, and one approved hostname; return generic failures and never call email delivery on rejection.
- [ ] Run `npm test` and confirm all endpoint tests pass.

### Task 3: Integrate the managed client widget

**Files:**
- Modify: `src/pages/en/contact.astro`

- [ ] Load Turnstile asynchronously with its public site key and render a managed widget with `data-action="contact"` inside the existing form.
- [ ] Disable the submit button until token success; show clear non-technical errors on Turnstile error/expiry; reset the widget after a failed server submission.
- [ ] Preserve the existing FormData submission and layout classes.

### Task 4: Verify and publish a focused review branch

**Files:**
- Modify: `docs/agent-handoff-notes.md`
- Modify: `package.json`
- Modify: `tests/contact-function.test.mjs`
- Modify: `functions/api/contact.js`
- Modify: `src/pages/en/contact.astro`

- [ ] Run `npm test`, `npm run build`, `npm run typecheck`, and `git diff --check`; review the rendered contact page locally.
- [ ] Update concise handoff notes, stage only the listed files, commit, push `codex/contact-turnstile`, and open a draft pull request.
