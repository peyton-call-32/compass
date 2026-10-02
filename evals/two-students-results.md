# Two-student test results

**Goal:** two test students with different majors share no more than 3 top matches.
Profiles are in `two-students.json`. Re-run any time at http://localhost:3000/evals.

## 2026-09-28 (after spec 002), tag scoring (no API key)

Ranking now gates role-tied internships and alumni on the student's picked roles, uses class
year and experience, and writes a different reason template for each card.

**Result: pass, 0 shared matches.** No two reasons on either list use the same sentence frame.

Student A (Finance junior, investment banking and corporate finance, investing and real estate):
1. Investment Banking Summer Analyst (internship): "They're looking for juniors, and you're a junior going after investment banking."
2. Alum, Associate at a PE fund: "Works in investment banking now. Ask how a Finance major can break in."
3. Finance Society (club): "Where students going after corporate finance practice together, a good fit for a Finance major."
4. Finance Recruiting Info Session (event): "Wed, Oct 7: you'll meet people in investment banking and hear how they got in."
5. Real Estate Acquisitions Intern (internship): "Your treasurer experience gives you a real story to tell in a corporate finance interview here."
6. Audit & Advisory Intern (internship): "Built for juniors like you, and it lines up with corporate finance."
7. Real Estate Club (club): "Your treasurer experience carries over here, and it's an easy way to build on it."
8. Accounting Firm Meet the Firms (event): "Tue, Oct 6. Your treasurer experience is an easy conversation starter with the people there."

Student B (CS sophomore, software and product, AI and startups):
1. AI Builders Demo Night (event): "Fri, Oct 16: you'll meet people in software engineering and hear how they got in."
2. Artificial Intelligence Association (club): "Joining as a sophomore gives you years of software engineering prep before recruiting starts."
3. Developers Club (club): "Where students going after software engineering practice together, a good fit for a Computer Science major."
4. Alum, Founder of a Provo AI startup: "Works in software engineering now. Ask how a Computer Science major can break in."
5. Product Management Association (club): "Your programming background carries over here, and it's an easy way to build on it."
6. Product Management Panel (event): "Tue, Oct 13. Your programming background is an easy conversation starter with the people there."
7. Software Engineering Intern (internship): "Your programming background gives you a real story to tell in a software engineering interview here."
8. Associate Product Manager Intern (internship): "Apply by Nov 15, so there's time to prep. It's hands-on product management work, a path you picked."

Student B's list shifted toward clubs and events (sophomore), and Student A's toward
internships marked "Juniors preferred."

## 2026-09-28, tag scoring (no API key), before spec 002

**Result: pass, 0 shared matches.**

Student A (Finance junior, investment banking and corporate finance, investing and real estate):
1. Alum, Associate at a PE fund
2. Finance Society (club)
3. Finance Recruiting Info Session (event)
4. Investment Banking Summer Analyst (internship)
5. Real Estate Acquisitions Intern (internship)
6. Real Estate Club (club)
7. Accounting Firm Meet the Firms (event)
8. Corporate Finance Intern (FP&A) (internship)

Student B (CS sophomore, software and product, AI and startups):
1. AI Builders Demo Night (event)
2. Software Engineering Intern (internship)
3. Alum, Founder of a Provo AI startup
4. Artificial Intelligence Association (club)
5. Associate Product Manager Intern (internship)
6. Developers Club (club)
7. Alum, Software Engineer at a Lehi tech company
8. Alum, PM at Adobe

## Claude ranking

[Run /evals with an API key set and record the result here.]
