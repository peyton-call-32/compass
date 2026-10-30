# Compass

Compass gets to know a college student in about a minute and gives them a short plan. It picks their top 5 to 8 opportunities (internships, recruiting events, clubs, and alumni to talk to) and gives a one-line reason for each.

I built it as a class project at BYU (MSB 341). The problem is one I lived through. BYU students get a flood of emails about events, clubs, and internships, and most of it isn't for them. The good opportunities get buried, especially for freshmen and sophomores who don't know what to look for yet. Compass sorts through it and tells each student what's worth their time this week and why.

> Status: Sprint 1 prototype. The opportunity list is made-up sample data in the right shape. Some club names match real BYU clubs.

## What it does

- **Two ways to get started.** Tap through a few quick questions, or swipe through cards on career paths and interests. Both build the same profile (major, year, interests, target roles, and experience).
- **Matches as a plan.** Results are grouped into a next step, things to do this week, people to talk to, and clubs to join.
- **A reason for each match.** Every card says why it fits that student, like "They're looking for juniors, and you're a junior going after investment banking."
- **My plan.** Students save the items they want to act on.
- **Built for more than one school.** The school name, colors, and email domain live in one settings file, so adding another school means adding one config.

## How matching works

Compass asks Claude to rank the opportunities for each student and write the reasons. If there's no API key, it falls back to a simpler scoring method based on matching tags, so the app always works for a demo. The matches page shows which method was used.

A few rules keep the matches sensible.

- Internships and alumni only show up if the student is going after that kind of role. An interest in AI alone won't pull in a software engineering internship for a finance student.
- Class year and past experience change the ranking and the reason.
- No more than 3 of any one type, so a student sees a mix.

### Testing it

The `/evals` page runs a test with two very different students (a finance junior and a computer science sophomore). The goal was for them to share no more than 3 of their top matches. The latest run had 0 shared matches, and no two reasons used the same sentence pattern. Results are in [`evals/two-students-results.md`](evals/two-students-results.md).

## Run it

Requires Node.js 20 or newer.

```bash
npm install
npm run dev     # open http://localhost:3000
```

To use Claude for ranking, create a file called `.env.local` with the line `ANTHROPIC_API_KEY=your-key`. Without it, the app uses tag scoring instead.

## How it's built

Next.js, React, TypeScript, and the Claude API.

| Path | What it does |
| --- | --- |
| `app/start/quick`, `app/start/swipe` | The two ways to get started |
| `app/matches/[id]` | A student's matches, shown as a plan |
| `app/matches/[id]/plan` | Items the student saved |
| `app/evals` | The two-student test |
| `lib/match.ts` | Ranking with Claude, with the tag scoring fallback |
| `lib/plan.ts` | Groups matches into plan sections |
| `lib/school.ts` | Everything school-specific |
| `lib/data.ts` | The only file that reads or saves data |
| `data/opportunities.json` | The sample opportunity list |

Saved student profiles are kept out of the repo so real student data never gets posted.

## What's next

- Real opportunities pulled from BYU emails, with personal info removed
- Student sign-in
