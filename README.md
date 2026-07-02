# Gym Fit Survey

Standalone version of the survey/results artifact. Uses [Supabase](https://supabase.com)
(free tier) instead of `window.storage` — real Postgres storage, and results
update via a realtime subscription instead of polling every few seconds.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project (free tier is plenty).
2. Once it's up, open **SQL Editor → New query**, paste the contents of
   `supabase-schema.sql`, and run it. This creates the `survey_responses`
   table, opens it up to anonymous insert/read, and enables realtime.
3. Go to **Project Settings → API**. Copy the **Project URL** and the
   **anon public key**.

## 2. Configure the app

```bash
cp .env.example .env
```

Paste your URL and anon key into `.env`.

## 3. Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Visit `?results` to see the passcode gate
(code is `results2024`, same as before — see note below).

## 4. Deploy

Any static host works since this is a plain Vite app:

**Vercel**
```bash
npm i -g vercel
vercel
```
Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables
in the Vercel project settings (Settings → Environment Variables), then redeploy.

**Netlify**
- `npm run build` → drag the `dist/` folder into Netlify, or connect the repo.
- Build command: `npm run build`, publish directory: `dist`.
- Add the same two env vars in Site settings → Environment variables.

## Notes

- **The passcode gate is still client-side only** — same as the original
  artifact. It stops casual snooping, not a determined visitor with dev
  tools open. For real access control, you'd want to move the results
  fetch behind a server route or Supabase Edge Function that checks a
  server-side secret, and tighten the `select` RLS policy in
  `supabase-schema.sql` accordingly.
- Every submission is public to anyone with the anon key (by design, to
  match the original open-storage behavior). If you want responses private
  until unlocked, restrict the `select` policy to a service role and fetch
  through a small server function instead.
- Realtime updates come from Postgres change events; there's also a 30s
  fallback poll in case an event is ever missed.
