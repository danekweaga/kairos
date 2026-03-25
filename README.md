# Kairos

Kairos is a focus-planning web app that helps you pick the right task for your current energy, start a guided focus session, and adapt when you get stuck.

## What it does

- Plan tasks by ROI (`weight / estimatedHours`)
- Match work to energy level (`low`, `medium`, `high`)
- Run guided focus sessions with:
  - countdown timer
  - progress checkpoints
  - pause allowances
  - break recommendations based on how you feel
- Customize theme and timer size
- Use optional media during sessions

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Supabase Auth + Supabase database (`profiles` table)

## Prerequisites

- Node.js 20+ (recommended)
- npm
- A Supabase project

## Environment variables

Copy `.env.example` to `.env` in the project root:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ORIGIN=http://localhost:5173
```

Kairos requires both variables at startup. If either is missing, the app throws an error from `src/lib/supabase.ts`.
Use `VITE_APP_ORIGIN` to control password reset redirect origin in multi-environment setups.

## Install and run

```bash
npm install
npm run dev
```

App runs on Vite's local dev server (usually `http://localhost:5173`).

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Type-check and build for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint

## App flow and routes

Public routes:

- `/` - Landing page
- `/login` - Log in
- `/signup` - Create account
- `/reset-password` - Reset password

Protected routes:

- `/onboarding` - First-time profile setup
- `/home` - User home
- `/dashboard` - Planning dashboard
- `/focus` - Active focus session

Route guards in `src/App.tsx`:

- `PublicOnlyRoute` for unauthenticated pages
- `ProtectedRoute` for authenticated pages
- `OnboardingGate` to ensure onboarding completion before main app pages

## Core usage

1. Sign up or log in.
2. Complete onboarding (saved in the `profiles` table).
3. Add tasks on the dashboard (`name`, `weight`, `estimatedHours`, `type`).
4. Select your energy level.
5. Start the recommended focus session.
6. During focus:
   - track time and progress
   - respond to checkpoints
   - use pause and break tools when needed

## Supabase notes

Kairos expects a `profiles` table keyed by auth user id (`id`) and reads/writes fields used in `src/lib/kairos-types.ts`, including:

- `role`
- `preferred_language`
- `main_goal`
- `preferred_session_length`
- `audio_preference`
- `guidance_style`
- `onboarding_completed`

### Password reset configuration

In Supabase dashboard (`Authentication -> URL Configuration`), add all redirect URLs used by Kairos:

- `http://localhost:5173/reset-password`
- `https://<your-production-domain>/reset-password`
- Optional preview URLs if you test Vercel previews

If redirect URLs are missing, reset links can fail or land without a usable recovery session.

### Security baseline (frontend + Supabase)

- Frontend must only use `VITE_SUPABASE_ANON_KEY` (never service role key).
- Keep `.env` out of Git (`.gitignore` is configured for this).
- Use RLS on all user-owned tables, scoped to `auth.uid()`.
- Enable email confirmation and review password policy in Supabase Auth settings.

### Example RLS policies for `profiles`

Run in Supabase SQL editor (adjust if you already have policies):

```sql
alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);
```

### IDOR/RLS verification checklist

- Sign in as User A and verify User A can read/update only User A profile.
- Sign in as User B and verify User B cannot read/update User A profile.
- Confirm all new tables added later receive equivalent `auth.uid()`-scoped policies.

### Vercel deployment security checklist

- Set env vars in Vercel for each environment (Production/Preview/Development):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_APP_ORIGIN`
- Ensure production domain is HTTPS and matches Supabase redirect configuration.
- Avoid logging secrets/tokens in client code or browser console.
- Use Supabase built-in controls for abuse protection (Auth rate limits / captcha where appropriate).

## Troubleshooting

- **Error: "Supabase environment variables are missing."**
  - Confirm `.env` exists in project root.
  - Confirm both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set.
  - Restart the dev server after updating env vars.

- **Build fails on TypeScript**
  - Run `npm run build` locally and resolve type errors before deploying.

- **Auth or profile flow issues**
  - Verify your Supabase project has Auth enabled.
  - Verify the `profiles` table exists and your policies allow expected reads/writes.

## Project structure (high-level)

- `src/pages` - Route pages (`Landing`, `Dashboard`, `FocusSession`, etc.)
- `src/components` - Reusable UI and session components
- `src/lib` - Domain types, helpers, and Supabase utilities
- `src/routes` - Route guards and onboarding gate

