import type { Match, Opportunity } from "./types";

export type PlanEntry = { match: Match; opp: Opportunity; rank: number };

export type PlanGroups = {
  next: PlanEntry | null; // The single most important next step
  doThisWeek: PlanEntry[]; // Events and internship deadlines, soonest first
  people: PlanEntry[]; // Alumni
  clubs: PlanEntry[];
};

const DAY = 24 * 60 * 60 * 1000;
const NEXT_STEP_WINDOW = 14;

function todayIso(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function daysUntil(date: string, now = new Date()): number {
  return Math.round((Date.parse(date) - Date.parse(todayIso(now))) / DAY);
}

export function isThisWeek(o: Opportunity, now = new Date()): boolean {
  if (!o.date) return false;
  const d = daysUntil(o.date, now);
  return d >= 0 && d <= 7;
}

export function toEntries(matches: Match[], opportunities: Opportunity[]): PlanEntry[] {
  const byId = new Map(opportunities.map((o) => [o.id, o]));
  return matches.flatMap((match, i) => {
    const opp = byId.get(match.opportunityId);
    return opp ? [{ match, opp, rank: i + 1 }] : [];
  });
}

export function groupPlan(matches: Match[], opportunities: Opportunity[], now = new Date()): PlanGroups {
  // Past events and deadlines drop off.
  const entries = toEntries(matches, opportunities).filter((e) => !e.opp.date || daysUntil(e.opp.date, now) >= 0);

  // Next step: the best-ranked match with a date coming up soon, otherwise the best match.
  const next =
    entries.find((e) => e.opp.date && daysUntil(e.opp.date, now) <= NEXT_STEP_WINDOW) ?? entries[0] ?? null;
  const rest = entries.filter((e) => e !== next);

  const doThisWeek = rest
    .filter((e) => e.opp.type === "event" || e.opp.type === "internship")
    .sort((a, b) => {
      if (a.opp.date && b.opp.date) return a.opp.date.localeCompare(b.opp.date);
      if (a.opp.date) return -1; // Rolling deadlines go last
      if (b.opp.date) return 1;
      return a.rank - b.rank;
    });

  return {
    next,
    doThisWeek,
    people: rest.filter((e) => e.opp.type === "alum"),
    clubs: rest.filter((e) => e.opp.type === "club"),
  };
}
