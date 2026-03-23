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

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Kairos requires both variables at startup. If either is missing, the app throws an error from `src/lib/supabase.ts`.

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

