# START HERE

## 1. Before opening Claude Code (15 minutes)
1. Unzip, then open the `yhc-platform` folder in VS Code.
2. Install on your machine (if not already): **Node.js LTS**, **pnpm** (`corepack enable`), **Git**, **Docker Desktop** (running), **Supabase CLI**, and Claude Code (VS Code extension or CLI).
3. Recommended VS Code extensions: ESLint, Prettier, Tailwind CSS IntelliSense, Markdown Preview Mermaid Support, Playwright Test.
4. Skim `docs/00_Project_Blueprint.md` (5 min) and send `docs/12_What_We_Need.md` sections A–C to the client today. Template approvals, DLT and Razorpay KYC take the longest.

## 2. First prompt — paste this into Claude Code

```
You are starting the Your Hair Company platform build. This folder is a project kit: docs, phase plans,
a tested Supabase schema and design tokens. No app code exists yet.

1. Read CLAUDE.md fully. It contains the rules for this repo.
2. Read docs/00_Project_Blueprint.md and PROGRESS.md.
3. Read phases/PHASE_00_Foundation.md.
4. Check my machine: node -v, pnpm -v, git --version, docker info (is it running?), supabase --version.
   Tell me what is missing, with install commands for my OS, before doing anything else.
5. Then give me your plan for Phase 00 (max 25 lines) and wait for my OK.

Important: do not overwrite any existing file in this kit (docs/, phases/, supabase/, design/,
CLAUDE.md, README.md, START_HERE.md, PROGRESS.md, .env.example, .gitignore, .claude/).
Scaffold Next.js in a temp folder and move files in, as Phase 00 task 0.3 describes.
```

## 3. Every phase after that
Use the custom command (defined in `.claude/commands/phase.md`):
```
/phase 01
```
or paste the "Paste-ready prompt" at the bottom of the phase file. Commands for status and a review pass:
```
/status        → summarises PROGRESS.md, what's blocked, what's next
/review-phase  → self-review of the current phase against its acceptance criteria and CLAUDE.md rules
```

## 4. Working rhythm
- One phase = one branch (`feat/phase-04-booking`) = one PR into `staging`. Review the PR yourself before merging.
- Keep the session focused: start a fresh Claude Code session per phase and use `/phase NN`. The phase file and `PROGRESS.md` carry the context forward.
- When the client sends something from `docs/12`, tick it there and tell Claude Code ("Razorpay test keys are now in .env.local — wire them up and remove the TODO").
- Design (Figma) runs in parallel with Phases 00–01. Share exported screens or a Figma link before Phase 02.

## 5. Phase order
00 Foundation → 01 Data layer → 02 Design system & website → 03 OTP, catalog & checkout → 04 Booking → 05 Doctor Portal → 06 Recommendation → 07 Sales CRM → 08 Messaging → 09 Fulfilment, care & refill → 10 Account & guarantee → 11 Admin & analytics → 12 Hardening & launch. Phase 2 items stay in `phases/PHASE_P2_Backlog.md`.
