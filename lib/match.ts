import type { Match, MatchResult, Opportunity, Profile } from "./types";
import { MAJOR_TAGS, ROLES, experienceHits, label, lowerLabel } from "./vocab";
import { SCHOOL } from "./school";

const MIN_MATCHES = 5;
const MAX_MATCHES = 8;
const MAX_PER_TYPE = 3;

const isRole = (tag: string) => tag in ROLES;
const EARLY_YEARS = new Set(["Freshman", "Sophomore"]);

// Roles the student is going after: what they picked, or if they picked none, what their major
// usually leads to.
function studentRoles(p: Profile): string[] {
  return p.targetRoles.length ? p.targetRoles : (MAJOR_TAGS[p.major] ?? []).filter(isRole);
}

// Internships and alumni are tied to a role, so they only qualify when the student is going after
// that role. An interest alone (AI, say) never pulls in a role the student didn't pick.
function eligible(p: Profile, o: Opportunity): boolean {
  if (o.type !== "internship" && o.type !== "alum") return true;
  const roles = o.tags.filter(isRole);
  if (!roles.length) return true;
  const wanted = studentRoles(p);
  return roles.some((r) => wanted.includes(r));
}

// ---------- Fallback: tag scoring (no API key needed) ----------

type Facts = {
  roles: string[]; // Roles the student picked that this opportunity is tagged for
  interests: string[];
  majorTags: string[];
  exp: { phrase: string; tags: string[] }[];
  yearFit: boolean;
  yearMiss: boolean;
};

function factsFor(p: Profile, o: Opportunity): Facts {
  const roles = o.tags.filter((t) => p.targetRoles.includes(t));
  const interests = o.tags.filter((t) => p.interests.includes(t));
  const majorTags = o.tags.filter(
    (t) => (MAJOR_TAGS[p.major] ?? []).includes(t) && !roles.includes(t) && !interests.includes(t)
  );
  const exp = experienceHits(p.experience).filter((k) => k.tags.some((t) => o.tags.includes(t)));
  const yearFit = !!o.preferredYears?.includes(p.year);
  return { roles, interests, majorTags, exp, yearFit, yearMiss: !!o.preferredYears && !yearFit };
}

function score(p: Profile, o: Opportunity, f: Facts): number {
  const topical = f.roles.length * 3 + f.interests.length * 2 + f.majorTags.length;
  if (topical === 0) return 0;
  let s = topical + Math.min(f.exp.length, 2);
  if (f.yearFit) s += 3;
  if (f.yearMiss) s -= 2;
  if (EARLY_YEARS.has(p.year)) {
    // Freshmen and sophomores: clubs and events first, most internships later.
    if (o.type === "club" || o.type === "event") s += 2;
    if (o.type === "internship" && !f.yearFit) s -= 2;
  } else if (o.type === "internship" || o.type === "alum") {
    s += 1;
  }
  return s;
}

// ---------- Fallback reasons: varied, specific, never repeated on a page ----------

const ROLE_NOUN: Record<string, string> = {
  entrepreneurship: "entrepreneurship",
  design: "UX and design",
  sales: "sales and BD",
  data: "data and analytics",
  strategy: "strategy and ops",
};
const roleNoun = (tag: string) => ROLE_NOUN[tag] ?? lowerLabel(tag);

const YEAR_PLURAL: Record<string, string> = {
  Freshman: "freshmen",
  Sophomore: "sophomores",
  Junior: "juniors",
  Senior: "seniors",
  "Grad student": "grad students",
};

const withA = (word: string) => (/^[aeiou]/i.test(word) ? `an ${word}` : `a ${word}`);

type Ctx = {
  p: Profile;
  o: Opportunity;
  f: Facts;
  year: string; // "junior"
  aYear: string; // "a junior"
  aMajor: string; // "a Finance major"
  early: boolean;
  role: string | null; // Only set when the opportunity is tagged for a role the student picked
  interest: string | null;
  topic: string; // Best available subject: role, then interest, then a major-related tag
  majorTopic: string | null;
  exp: string | null;
  when: string | null; // "Thu, Oct 8" for events
  deadline: string | null; // "Apply by Oct 31" for internships
};

function buildCtx(p: Profile, o: Opportunity, f: Facts): Ctx {
  const year = (p.year || "student").toLowerCase();
  const role = f.roles[0] ? roleNoun(f.roles[0]) : null;
  const interest = f.interests[0] ? lowerLabel(f.interests[0]) : null;
  const majorTopic = f.majorTags[0] ? (isRole(f.majorTags[0]) ? roleNoun(f.majorTags[0]) : lowerLabel(f.majorTags[0])) : null;
  return {
    p,
    o,
    f,
    year,
    aYear: withA(year),
    aMajor: withA(`${p.major} major`),
    early: EARLY_YEARS.has(p.year),
    role,
    interest,
    topic: role ?? interest ?? majorTopic ?? "this area",
    majorTopic,
    exp: f.exp[0]?.phrase ?? null,
    when: o.type === "event" && o.when ? o.when.split(",").slice(0, 2).join(",") : null,
    deadline: o.type === "internship" && o.date && o.when ? o.when : null,
  };
}

type Template = { id: string; write: (c: Ctx) => string | null };

// Most specific first. Each page uses each template at most once.
const TEMPLATES: Template[] = [
  { id: "year-role", write: (c) => (c.f.yearFit && c.role ? `They're looking for ${YEAR_PLURAL[c.p.year]}, and you're ${c.aYear} going after ${c.role}.` : null) },
  { id: "year-topic", write: (c) => (c.f.yearFit ? `Built for ${YEAR_PLURAL[c.p.year]} like you, and it lines up with ${c.topic}.` : null) },
  { id: "int-season", write: (c) => (c.o.type === "internship" && c.deadline && c.role && !c.early ? `${c.deadline}. As ${c.aYear}, this is the season to land ${c.role} internships.` : null) },
  { id: "int-exp", write: (c) => (c.o.type === "internship" && c.exp && c.role ? `Your ${c.exp} gives you a real story to tell in a ${c.role} interview here.` : null) },
  { id: "int-deadline", write: (c) => (c.o.type === "internship" && c.deadline && c.role ? `${c.deadline}, so there's time to prep. It's hands-on ${c.role} work, a path you picked.` : null) },
  { id: "int-rolling", write: (c) => (c.o.type === "internship" && !c.deadline && c.role ? `Rolling applications, so applying early helps. Real ${c.role} work for ${c.aMajor}.` : null) },
  { id: "event-role", write: (c) => (c.o.type === "event" && c.when && c.role ? `${c.when}: you'll meet people in ${c.role} and hear how they got in.` : null) },
  { id: "event-exp", write: (c) => (c.o.type === "event" && c.when && c.exp ? `${c.when}. Your ${c.exp} is an easy conversation starter with the people there.` : null) },
  { id: "event-interest", write: (c) => (c.o.type === "event" && c.when && c.interest ? `${c.when}: a low-pressure way to see ${c.interest} work up close.` : null) },
  { id: "event-early", write: (c) => (c.o.type === "event" && c.when && c.early ? `Good for ${c.aYear}: no application, just show up ${c.when} and learn about ${c.topic}.` : null) },
  { id: "club-early", write: (c) => (c.o.type === "club" && c.early ? `Joining as ${c.aYear} gives you years of ${c.topic} prep before recruiting starts.` : null) },
  { id: "club-role", write: (c) => (c.o.type === "club" && c.role ? `Where students going after ${c.role} practice together, a good fit for ${c.aMajor}.` : null) },
  { id: "club-exp", write: (c) => (c.o.type === "club" && c.exp ? `Your ${c.exp} carries over here, and it's an easy way to build on it.` : null) },
  { id: "club-interest", write: (c) => (c.o.type === "club" && c.interest ? `A way to go deeper on ${c.interest} with other students, outside of class.` : null) },
  { id: "alum-role", write: (c) => (c.o.type === "alum" && c.role ? `Works in ${c.role} now. Ask how ${c.aMajor} can break in.` : null) },
  { id: "alum-exp", write: (c) => (c.o.type === "alum" && c.exp ? `They can help you frame your ${c.exp} for ${c.topic} recruiting.` : null) },
  { id: "alum-late", write: (c) => (c.o.type === "alum" && !c.early ? `As ${c.aYear}, a coffee chat now pays off before ${c.topic} deadlines hit.` : null) },
  { id: "alum-early", write: (c) => (c.o.type === "alum" && c.early ? `Talking to them as ${c.aYear} gives you a head start on ${c.topic} most students skip.` : null) },
  { id: "role-interest", write: (c) => (c.role && c.interest ? `Combines ${c.role} and ${c.interest}, two things you picked.` : null) },
  { id: "major", write: (c) => (c.majorTopic ? `A common next step for ${c.p.major} majors looking at ${c.majorTopic}.` : null) },
  { id: "interest", write: (c) => (c.interest ? `Fits your interest in ${c.interest}, and the timing works for ${c.aYear}.` : null) },
  { id: "fallback", write: (c) => `Lines up with ${c.topic}, which fits where you are as ${c.aYear}.` },
];

function writeReasons(p: Profile, picked: { o: Opportunity; f: Facts }[]): string[] {
  const used = new Set<string>();
  return picked.map(({ o, f }) => {
    const ctx = buildCtx(p, o, f);
    let first: string | null = null;
    for (const t of TEMPLATES) {
      const text = t.write(ctx);
      if (!text) continue;
      first ??= text;
      if (!used.has(t.id)) {
        used.add(t.id);
        return text;
      }
    }
    return first!;
  });
}

function rankCandidates(profile: Profile, opps: Opportunity[]) {
  return opps
    .filter((o) => eligible(profile, o))
    .map((o) => {
      const f = factsFor(profile, o);
      return { o, f, s: score(profile, o, f) };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.o.id.localeCompare(b.o.id));
}

export function tagScoreMatches(profile: Profile, opps: Opportunity[]): Match[] {
  const ranked = rankCandidates(profile, opps);

  // Keep a mix of types so it's not all one kind of thing.
  const picked: typeof ranked = [];
  const perType: Record<string, number> = {};
  for (const x of ranked) {
    if (picked.length >= MAX_MATCHES) break;
    if ((perType[x.o.type] ?? 0) >= MAX_PER_TYPE) continue;
    picked.push(x);
    perType[x.o.type] = (perType[x.o.type] ?? 0) + 1;
  }
  // If the type cap left us short, fill from the rest.
  for (const x of ranked) {
    if (picked.length >= MIN_MATCHES) break;
    if (!picked.includes(x)) picked.push(x);
  }
  const reasons = writeReasons(profile, picked);
  return picked.map((x, i) => ({ opportunityId: x.o.id, reason: reasons[i] }));
}

// ---------- Claude ranking ----------

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

function buildPrompt(profile: Profile, opps: Opportunity[]): string {
  const student = {
    year: profile.year,
    major: profile.major,
    targetRoles: profile.targetRoles.map(label),
    interests: profile.interests.map(label),
    experience: profile.experience || "(none given)",
  };
  const list = opps.map((o) => ({
    id: o.id,
    type: o.type,
    title: o.title,
    org: o.org,
    description: o.description,
    roles: o.tags.filter(isRole).map(label),
    topics: o.tags.filter((t) => !isRole(t)).map(label),
    when: o.when,
    preferredYears: o.preferredYears,
  }));
  const today = new Date().toISOString().slice(0, 10);
  return `You are a career scout for ${SCHOOL.name} students. Pick the ${MIN_MATCHES} to ${MAX_MATCHES} opportunities from the list that best fit this student, ranked best first. Today is ${today}.

Ranking rules:
- Only use ids from the list.
- Include at least two different types (internship, event, club, alum). No more than ${MAX_PER_TYPE} of any one type.
- Use class year. Freshmen and sophomores: favor clubs and events over internships. Juniors and seniors: favor internships and alumni. Boost listings whose preferredYears include the student's year, and rank down ones that ask for a different year.
- Use the student's experience when it connects to an opportunity.
- Skip anything that doesn't fit. Fewer good matches beats padding.

Reason rules:
- One plain sentence, under 25 words, talking to the student as "you".
- Mention at least one thing about the student (their year, major, or a specific piece of their experience) AND one specific detail of the opportunity (its date or deadline, who will be there, or why it matters now).
- Only call something a step toward a role if that role is in the opportunity's "roles" list and in the student's targetRoles.
- Every reason must use a different sentence structure. No two reasons may start the same way or follow the same template.

Student:
${JSON.stringify(student, null, 2)}

Opportunities:
${JSON.stringify(list, null, 2)}

Reply with only JSON in this shape, no other text:
{"matches":[{"id":"...","reason":"..."}]}`;
}

async function claudeMatches(profile: Profile, opps: Opportunity[]): Promise<Match[] | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  // Same eligibility filter as the fallback, so an interest can't pull in an unpicked role.
  const candidates = rankCandidates(profile, opps).map((x) => x.o);
  if (!candidates.length) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        messages: [{ role: "user", content: buildPrompt(profile, candidates) }],
      }),
    });
    if (!res.ok) {
      console.error("Claude API error", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const text: string = (data.content ?? [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("");
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json) as { matches: { id: string; reason: string }[] };
    const valid = new Set(candidates.map((o) => o.id));
    const seen = new Set<string>();
    const matches = parsed.matches
      .filter((m) => valid.has(m.id) && !seen.has(m.id) && seen.add(m.id))
      .slice(0, MAX_MATCHES)
      .map((m) => ({ opportunityId: m.id, reason: String(m.reason).trim() }));
    return matches.length ? matches : null;
  } catch (err) {
    console.error("Claude matching failed, falling back to tag scoring", err);
    return null;
  }
}

export async function findMatches(profile: Profile, opps: Opportunity[]): Promise<MatchResult> {
  const ai = await claudeMatches(profile, opps);
  return {
    profileId: profile.id,
    createdAt: new Date().toISOString(),
    method: ai ? "claude" : "tag-scoring",
    matches: ai ?? tagScoreMatches(profile, opps),
  };
}
