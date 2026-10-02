export type OpportunityType = "internship" | "event" | "club" | "alum";

export type Opportunity = {
  id: string;
  type: OpportunityType;
  title: string;
  org: string;
  description: string;
  tags: string[];
  when?: string; // Display text, e.g. "Thu, Oct 8, 7 pm" or "Apply by Oct 31"
  date?: string; // ISO date of the event or deadline, used for sorting
  preferredYears?: string[]; // Class years the listing asks for, e.g. ["Junior"]
  action?: string;
};

// Every getting-to-know-you format produces this same shape.
export type Profile = {
  id: string;
  createdAt: string;
  format: "quick" | "swipe" | "eval";
  major: string;
  year: string;
  interests: string[];
  targetRoles: string[];
  experience: string;
  summary: string;
};

export type ProfileInput = Omit<Profile, "id" | "createdAt" | "summary"> & {
  summary?: string;
};

export type Match = {
  opportunityId: string;
  reason: string;
};

export type MatchResult = {
  profileId: string;
  createdAt: string;
  method: "claude" | "tag-scoring";
  matches: Match[];
};

// Items a student saved from their matches. Nothing is sent anywhere.
export type PlanItem = {
  opportunityId: string;
  savedAt: string;
};
