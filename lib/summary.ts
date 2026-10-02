import type { ProfileInput } from "./types";
import { lowerLabel } from "./vocab";

function list(items: string[]): string {
  const names = items.map((t) => lowerLabel(t));
  if (names.length <= 1) return names.join("");
  return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}

// Plain-English profile summary built from the answers, no AI needed.
export function buildSummary(p: Pick<ProfileInput, "major" | "year" | "interests" | "targetRoles" | "experience">): string {
  const parts: string[] = [];
  parts.push(`${p.year || "Student"} studying ${p.major || "an undeclared major"}.`);
  if (p.targetRoles.length) parts.push(`Wants to explore ${list(p.targetRoles)}.`);
  if (p.interests.length) parts.push(`Interested in ${list(p.interests)}.`);
  if (p.experience.trim()) parts.push(`Experience: ${p.experience.trim()}`);
  return parts.join(" ");
}
