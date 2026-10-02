# Compass (Sprint 1 prototype)

Shown to BYU students as "BYU Compass."

Gets to know a BYU student, saves a profile, and shows their top 5 to 8 opportunities
(internships, events, clubs, alumni) with a one-line reason for each.

## Run it

```bash
cd product
npm install
npm run dev
```

Open http://localhost:3000.

**Claude ranking (optional):** create a file called `.env.local` in `product/` with the line
`ANTHROPIC_API_KEY=your-key`. Without a key, the app ranks by tag overlap instead, so it still works
for a demo. The matches page shows which method was used.

## What's here

| Path | What it does |
| --- | --- |
| `/start/quick` | Getting-to-know-you format 1: tap-to-pick questions |
| `/start/swipe` | Getting-to-know-you format 2: swipe cards on career paths and interests |
| `/matches/[id]` | Matches as a plan: next step, Do this week, People to talk to, Clubs to join. Profile in a right panel |
| `/matches/[id]/plan` | "My plan": items the student saved. Saving never sends anything |
| `/matches` | "My Matches": opens the last profile saved in this browser, or an empty state |
| `/evals` | Sprint 1 test: two students with different majors, counts shared matches |
| `lib/school.ts` | School config: name, hub name, accent color, email domain. Everything school-specific reads from it |
| `components/app-shell.tsx` | Left nav on every page, with a placeholder signed-in student (no login yet) |
| `lib/data.ts` | The only file that reads or writes data (swap for Supabase later) |
| `lib/match.ts` | Claude ranking with tag-scoring fallback. Role gate, class year, experience, varied reasons |
| `lib/plan.ts` | Groups matches into the plan sections |
| `data/opportunities.json` | Opportunity list |
| `data/profiles/`, `data/matches/`, `data/plans/` | Saved profiles, matches, and plans (git-ignored so real student data stays out of the repo) |
| `evals/two-students.json` | The two test students used by `/evals` |

Both formats save the same profile shape (major, year, interests, target roles, experience,
summary), so matching doesn't depend on which format wins.

## Opportunity data

`data/opportunities.json` is placeholder sample data (36 entries). Some club names match real
BYU clubs, but the internships, events, alumni, and dates are made-up examples in the right
shape. Replace them with real
entries from BYU emails, with personal info removed. Alumni stay anonymized, for example
"BYU alum, PM at Adobe, Class of 2019."
