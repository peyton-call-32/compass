// Shared tag vocabulary. Opportunities, profiles, and both onboarding formats use these ids.

export const ROLES: Record<string, string> = {
  consulting: "Consulting",
  product: "Product management",
  finance: "Corporate finance",
  "investment-banking": "Investment banking",
  marketing: "Marketing",
  software: "Software engineering",
  data: "Data & analytics",
  entrepreneurship: "Starting a company",
  accounting: "Accounting",
  design: "UX / design",
  sales: "Sales & BD",
  "social-impact": "Social impact",
  strategy: "Strategy & ops",
};

export const INTERESTS: Record<string, string> = {
  tech: "Tech",
  ai: "AI",
  startups: "Startups",
  outdoors: "Outdoor industry",
  healthcare: "Healthcare",
  sports: "Sports",
  education: "Education",
  investing: "Investing",
  media: "Media & entertainment",
  "real-estate": "Real estate",
  government: "Government & policy",
  international: "International work",
};

export const MAJORS = [
  "Strategic Management",
  "Finance",
  "Accounting",
  "Information Systems",
  "Marketing",
  "Entrepreneurship",
  "Computer Science",
  "Economics",
  "Psychology",
  "Public Health",
  "Other",
];

export const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Grad student"];

// A small nudge so a major counts for something even with few picks.
export const MAJOR_TAGS: Record<string, string[]> = {
  "Strategic Management": ["consulting", "strategy"],
  Finance: ["finance", "investment-banking", "investing"],
  Accounting: ["accounting", "finance"],
  "Information Systems": ["data", "product", "tech"],
  Marketing: ["marketing", "sales"],
  Entrepreneurship: ["entrepreneurship", "startups"],
  "Computer Science": ["software", "tech", "ai"],
  Economics: ["finance", "consulting", "government"],
  Psychology: ["design", "healthcare", "education"],
  "Public Health": ["healthcare", "social-impact"],
};

export function label(tag: string): string {
  return ROLES[tag] ?? INTERESTS[tag] ?? tag;
}

// Lowercase for use mid-sentence, but keep acronyms like AI, UX, and BD.
export function lowerLabel(tag: string): string {
  return label(tag)
    .toLowerCase()
    .replace(/\b(ai|ux|bd)\b/g, (m) => m.toUpperCase());
}

// Experience keywords: what the student wrote, a short phrase for reasons, and the tags it supports.
export const EXPERIENCE_KEYWORDS: { match: RegExp; phrase: string; tags: string[] }[] = [
  { match: /treasurer|budget/i, phrase: "treasurer experience", tags: ["finance", "accounting", "investing"] },
  { match: /bank|credit union/i, phrase: "banking job", tags: ["finance", "investment-banking", "investing"] },
  { match: /\bTA\b|teaching assistant|tutor/i, phrase: "TA work", tags: ["education"] },
  { match: /programming|coding|\bcode\b|software|developer/i, phrase: "programming background", tags: ["software", "tech", "ai"] },
  { match: /project/i, phrase: "project experience", tags: ["product", "software", "consulting", "data"] },
  { match: /started|founded|own business|side business|startup/i, phrase: "experience starting something", tags: ["entrepreneurship", "startups", "sales"] },
  { match: /sales|selling|door.to.door/i, phrase: "sales experience", tags: ["sales", "marketing", "entrepreneurship"] },
  { match: /social media|content|marketing/i, phrase: "marketing work", tags: ["marketing", "media"] },
  { match: /data|excel|sql|analy/i, phrase: "data work", tags: ["data", "finance", "consulting"] },
  { match: /design|figma|ux/i, phrase: "design work", tags: ["design", "product"] },
  { match: /research/i, phrase: "research experience", tags: ["data", "design", "healthcare"] },
  { match: /president|officer|\bvp\b|club/i, phrase: "club leadership", tags: ["consulting", "strategy", "social-impact"] },
  { match: /mission|abroad|spanish|portuguese|language/i, phrase: "time abroad", tags: ["international", "social-impact", "sales"] },
  { match: /intern/i, phrase: "past internship", tags: [] },
];

export function experienceHits(experience: string) {
  return EXPERIENCE_KEYWORDS.filter((k) => k.match.test(experience));
}
