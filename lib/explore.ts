// Exploring flow: students react to work activities and pick interests, and we suggest roles.
// Hand-tuned weights, no AI. Role and interest ids come from the shared vocabulary.
import { ROLES } from "./vocab";

export type Activity = {
  id: string;
  kind: "activity" | "task" | "role" | "world"; // A way of working, part of a job, a job, or an industry
  interest?: string; // World cards: the interest id saved to the profile on "That's me"
  title: string; // Shown on the card
  detail?: string; // One line under the title (roles only)
  phrase: string; // Used mid-sentence in "because" lines
  weights: Record<string, number>; // Role id -> how strongly this points to it
};

// Mixed on purpose so the deck alternates between ways of working, tasks, roles, and worlds.
export const ACTIVITIES: Activity[] = [
  { id: "numbers", kind: "activity", title: "Cracking a tough problem with numbers", phrase: "solving problems with numbers",
    weights: { finance: 3, data: 3, "investment-banking": 2, accounting: 1, consulting: 1 } },
  { id: "pm", kind: "role", title: "Product manager", detail: "Decide what gets built and work with engineers to ship it.",
    phrase: "the product manager role", weights: { product: 4 } },
  { id: "model", kind: "task", title: "Building a financial model in Excel", phrase: "building financial models",
    weights: { finance: 3, "investment-banking": 3, accounting: 1 } },
  { id: "w-tech", kind: "world", interest: "tech", title: "Tech", detail: "Software companies, apps, and the people who build them.",
    phrase: "an interest in tech", weights: { product: 1, software: 1, sales: 0.5 } },
  { id: "persuade", kind: "activity", title: "Convincing someone to say yes", phrase: "convincing people",
    weights: { sales: 3, marketing: 1, entrepreneurship: 1, consulting: 1 } },
  { id: "consultant", kind: "role", title: "Management consultant", detail: "Travel to clients and solve a new company's biggest problem every few months.",
    phrase: "the consultant role", weights: { consulting: 4, strategy: 1 } },
  { id: "interviews", kind: "task", title: "Interviewing users to learn what they need", phrase: "talking to users",
    weights: { design: 3, product: 2, marketing: 1 } },
  { id: "w-healthcare", kind: "world", interest: "healthcare", title: "Healthcare", detail: "Hospitals, health tech, and improving patient care.",
    phrase: "an interest in healthcare", weights: { data: 1, "social-impact": 1, consulting: 0.5 } },
  { id: "build", kind: "activity", title: "Building something from nothing", phrase: "building from scratch",
    weights: { entrepreneurship: 3, software: 1, product: 1 } },
  { id: "sql", kind: "task", title: "Writing SQL to answer a business question", phrase: "digging into data",
    weights: { data: 4, software: 1 } },
  { id: "w-sports", kind: "world", interest: "sports", title: "Sports", detail: "Teams, leagues, and the business around them.",
    phrase: "an interest in sports", weights: { marketing: 1, sales: 1 } },
  { id: "banker", kind: "role", title: "Investment banker", detail: "Work long hours on big deals. Learn fast and get paid well.",
    phrase: "the investment banking role", weights: { "investment-banking": 4, finance: 1 } },
  { id: "love", kind: "activity", title: "Making something people love to use", phrase: "making things people love",
    weights: { design: 3, product: 3, software: 1 } },
  { id: "w-ai", kind: "world", interest: "ai", title: "AI", detail: "Companies and tools built on machine learning.",
    phrase: "an interest in AI", weights: { software: 1, data: 1, product: 1 } },
  { id: "coldcall", kind: "task", title: "Cold-calling a company to land a new customer", phrase: "landing new customers",
    weights: { sales: 4, entrepreneurship: 1 } },
  { id: "mission", kind: "activity", title: "Working on a mission bigger than a paycheck", phrase: "mission-driven work",
    weights: { "social-impact": 3, entrepreneurship: 1 } },
  { id: "w-outdoors", kind: "world", interest: "outdoors", title: "The outdoor industry", detail: "Gear, recreation, and brands built around getting outside.",
    phrase: "an interest in the outdoors", weights: { marketing: 1, entrepreneurship: 0.5 } },
  { id: "swe", kind: "role", title: "Software engineer", detail: "Write the code that makes products work.",
    phrase: "the software engineer role", weights: { software: 4, data: 1 } },
  { id: "campaign", kind: "task", title: "Planning a social media campaign", phrase: "planning campaigns",
    weights: { marketing: 4, sales: 1 } },
  { id: "fixing", kind: "activity", title: "Figuring out why something is broken and fixing it", phrase: "fixing what's broken",
    weights: { strategy: 3, consulting: 2, data: 1, software: 1 } },
  { id: "w-realestate", kind: "world", interest: "real-estate", title: "Real estate", detail: "Buying, building, and managing property.",
    phrase: "an interest in real estate", weights: { finance: 1, sales: 0.5 } },
  { id: "audit", kind: "task", title: "Checking a company's books line by line", phrase: "careful, detailed work",
    weights: { accounting: 4, finance: 1 } },
];

export type Reaction = "yes" | "maybe" | "no";
const REACTION_WEIGHT: Record<Reaction, number> = { yes: 1, maybe: 0.5, no: 0 };

export type Suggestion = { role: string; score: number; because: string };

function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

// Interests the student said yes to on world cards.
export function chosenInterests(reactions: Record<string, Reaction>): string[] {
  return ACTIVITIES.filter((a) => a.interest && reactions[a.id] === "yes").map((a) => a.interest!);
}

// Rank every role by the student's reactions, best first.
export function suggestRoles(reactions: Record<string, Reaction>): Suggestion[] {
  const scores: Record<string, number> = {};
  const drivers: Record<string, { text: string; weight: number }[]> = {};
  const add = (role: string, weight: number, text: string) => {
    scores[role] = (scores[role] ?? 0) + weight;
    (drivers[role] ??= []).push({ text, weight });
  };

  for (const a of ACTIVITIES) {
    const r = REACTION_WEIGHT[reactions[a.id] ?? "no"];
    if (!r) continue;
    for (const [role, w] of Object.entries(a.weights)) add(role, w * r, a.phrase);
  }

  return Object.keys(ROLES)
    .filter((role) => (scores[role] ?? 0) > 0)
    .map((role) => {
      const top = (drivers[role] ?? []).sort((a, b) => b.weight - a.weight).slice(0, 2).map((d) => d.text);
      return { role, score: scores[role], because: `Because you picked ${list(top)}.` };
    })
    .sort((a, b) => b.score - a.score);
}
