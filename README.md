# Kairos

Kairos is a focus operating system for people who do cognitively expensive work and need help deciding what to do next, not just tracking time.

## 1) Overview

Kairos is a web app that turns a rough task backlog into a guided focus session with clear next actions.

It is built for students, founders, creators, and professionals who:
- have multiple important tasks competing for attention,
- do not always have the same energy level throughout the day,
- and need a practical way to recover when focus breaks down.

The problem it solves is not "how to run a timer." The problem is "how to pick the right task for this moment, stay with it, and recover quickly when the session goes off track."

## 2) Why This Exists

Most productivity tools are either:
- static planners (good at storing tasks, weak at execution), or
- generic timer tools (good at counting minutes, weak at task selection and adaptation).

In real work, friction happens in three places:
1. Choosing the next task under uncertainty.
2. Maintaining momentum after 20-40 minutes.
3. Recovering from mental states like overload, distraction, or fatigue.

Kairos exists to connect those three phases into one flow instead of forcing users to stitch together planning apps, timer apps, and ad-hoc break habits.

## 3) Core Idea

Kairos treats a focus block as a decision system, not a stopwatch.

The core model is:
- prioritize by task return (`weight / estimatedHours`),
- filter by current energy state (low, medium, high),
- run a structured session with checkpoints and bounded pause rules,
- then adapt behavior based on how the user feels when they get stuck.

The differentiator is the tight coupling between selection logic and in-session adaptation. The recommendation engine and the session engine share context, so the product can react without being unpredictable.

## 4) Key Features

- **ROI-driven task ranking**  
  Tasks are sorted by `weight / estimatedHours` so prioritization favors high-impact, low-friction work instead of urgency theater.

- **Energy-aware recommendation**  
  Current energy state maps to task depth (`deep`, `medium`, `shallow`) so recommendations match cognitive capacity in real time.

- **Guided session loop**  
  Focus sessions include checkpoints, pause allowances, and continuation logic so a user is never left with a blank "now what?" moment.

- **Break recommendation with feeling classification**  
  Break suggestions are generated from quick feelings or free-text input and include reason + suggested action, not just a duration.

- **Special focus display modes**  
  Fullscreen and mini-corner clock modes support different work environments (immersive mode vs multitasking mode).

- **State resilience across refreshes**  
  Dashboard and active session state are persisted in local storage with sanitization, so accidental refreshes do not destroy work context.

- **Secure auth and reset flows**  
  Reset-password handling supports both code-based and hash-token Supabase recovery links, with explicit validation and failure messaging.

## 5) Architecture & Tech Stack

### Frontend
- **React + TypeScript + Vite**
  - React was chosen for predictable state composition across route guards, onboarding, dashboard, and focus session flows.
  - TypeScript is used to keep domain types (`Task`, `Profile`, session state) explicit and prevent drift as flows evolve.
  - Vite keeps iteration fast and build config minimal for a hackathon-friendly but production-capable setup.

- **React Router**
  - Routing is deliberately split by access concerns:
    - `PublicOnlyRoute` for anonymous screens,
    - `ProtectedRoute` for authenticated screens,
    - `OnboardingGate` for post-auth profile readiness.
  - This keeps policy decisions centralized instead of sprinkled across pages.

- **Tailwind + shadcn-style component primitives**
  - Utility-first styling keeps UI changes fast without CSS sprawl.
  - Component primitives enforce consistency in forms, cards, dialogs, and buttons.

### Backend/Platform
- **Supabase Auth + Postgres**
  - Supabase gives a practical authentication + database baseline without building a custom auth backend.
  - Postgres-backed `profiles` support onboarding and personalization state with RLS boundaries.

- **Row Level Security**
  - User-owned data is scoped to `auth.uid()` policies to prevent cross-user reads/writes from client-side mistakes.

### Client-side persistence
- **localStorage wrappers**
  - Used for session continuity and dashboard persistence in a way that is easy to reason about and sanitize.
  - Kept intentionally lightweight; this project does not require a full server-side session orchestration layer.

## 6) How It Works

### User flow
1. User signs up or logs in.
2. New users see the "How to Use" intro, then onboarding.
3. On onboarding completion, profile preferences are saved to Supabase.
4. On dashboard, user adds tasks, selects energy, and receives a recommendation.
5. Starting a session creates active-session state and enters focus mode.
6. During the session, checkpoints and break logic guide recovery and continuation.
7. Session completion returns user to planning with updated context.

### Data flow
- **Auth/session layer**  
  `supabase.auth.getSession()` initializes auth state and route guards.

- **Profile layer**  
  Profile is loaded from Supabase (`profiles`), sanitized on write, and used by onboarding/home flows.

- **Planning layer**  
  Task list + energy + media preferences are persisted in local storage and sanitized on read.

- **Recommendation layer**  
  `session-helpers.ts` computes ROI ranking and energy-fit task recommendation.

- **Execution layer**  
  Active session state is persisted and resumed from local storage, with break/checkpoint events driving UI transitions.

## 7) Key Technical Decisions

- **Deterministic recommendation logic before any "AI-like" behavior**  
  Task selection is deterministic (`ROI + energy mapping`) so outcomes are explainable and debuggable.  
  Tradeoff: less novelty than ML ranking, but significantly more trust and maintainability.

- **Non-blocking profile load after session initialization**  
  Auth loading is cleared as soon as session is known, and profile fetch continues in parallel.  
  Tradeoff: brief window where profile is null, handled by route gating; payoff is faster perceived startup.

- **Dual recovery-link support in reset flow**  
  Both `?code=` and `#access_token` styles are supported because Supabase redirect behavior can vary across auth settings/environments.  
  Tradeoff: more branch handling in one page; payoff is fewer production reset failures.

- **Sanitize-at-boundary strategy**  
  Inputs are validated/sanitized at form boundaries and before persistence (auth inputs, tasks, onboarding, media URLs, restored local storage).  
  Tradeoff: some duplication across layers; payoff is resilience against malformed state and accidental injection vectors.

## 8) Challenges & Solutions

- **Reset password links intermittently failed**  
  Cause: inconsistent redirect/session token handling across environments.  
  Fix: explicit recovery session checks, code exchange support, hash-token support, and clearer error states.

- **Users could lose active-session context on refresh**  
  Cause: volatile in-memory state in focus flow.  
  Fix: typed local-storage persistence (`PersistedActiveSession`) with sanitization on restore.

- **Break guidance felt vague and ignorable**  
  Cause: one-size-fits-all break suggestions.  
  Fix: classify feelings (including custom text keyword mapping) and return structured break rationale + actions.

- **Startup felt slow on low-power laptops**  
  Cause: auth and profile loading were serialized before route rendering.  
  Fix: decouple initial auth readiness from profile fetch and guard profile-dependent routes explicitly.

## 9) Limitations

- This is still a client-heavy SPA; most planning/session state is local-first and not yet collaborative across devices.
- Recommendation strategy is intentionally simple and rule-based; it does not learn from historical outcomes yet.
- Bundle size can still be improved (single large chunk warning appears in production build).
- Current observability is basic (console + direct UI states), not a full structured telemetry pipeline.

## 10) Future Improvements

- Add route-level code splitting to reduce initial JavaScript parse/execute cost.
- Add sync of dashboard/session state to Supabase for multi-device continuity.
- Add richer analytics on checkpoint outcomes to tune recommendation quality.
- Add optional calendar/deadline context into ranking (without replacing deterministic core logic).
- Expand test coverage around auth edge cases and session-resume behavior.

---

## Local Setup

### Prerequisites
- Node.js 20+
- npm
- Supabase project

### Environment variables
Create `.env` from `.env.example`:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ORIGIN=http://localhost:5173
```

### Commands
```bash
npm install
npm run dev
npm run build
npm run lint
```

