// The only module that reads or writes data. Sprint 1 uses local JSON files.
// Moving to Supabase later should only change this file.
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { MatchResult, Opportunity, PlanItem, Profile, ProfileInput } from "./types";
import { buildSummary } from "./summary";

const DATA_DIR = path.join(process.cwd(), "data");
const PROFILES_DIR = path.join(DATA_DIR, "profiles");
const MATCHES_DIR = path.join(DATA_DIR, "matches");
const PLANS_DIR = path.join(DATA_DIR, "plans");
const EVALS_FILE = path.join(process.cwd(), "evals", "two-students.json");

const safeId = (id: string) => /^[a-zA-Z0-9-]+$/.test(id);

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return null;
  }
}

async function writeJson(file: string, value: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export async function getOpportunities(): Promise<Opportunity[]> {
  return (await readJson<Opportunity[]>(path.join(DATA_DIR, "opportunities.json"))) ?? [];
}

export async function saveProfile(input: ProfileInput): Promise<Profile> {
  const profile: Profile = {
    id: randomUUID().slice(0, 8),
    createdAt: new Date().toISOString(),
    format: input.format,
    major: input.major,
    year: input.year,
    interests: input.interests,
    targetRoles: input.targetRoles,
    experience: input.experience.trim(),
    summary: input.summary?.trim() || buildSummary(input),
  };
  await writeJson(path.join(PROFILES_DIR, `${profile.id}.json`), profile);
  return profile;
}

export async function getProfile(id: string): Promise<Profile | null> {
  if (!safeId(id)) return null;
  return readJson<Profile>(path.join(PROFILES_DIR, `${id}.json`));
}

export async function getSavedMatches(profileId: string): Promise<MatchResult | null> {
  if (!safeId(profileId)) return null;
  return readJson<MatchResult>(path.join(MATCHES_DIR, `${profileId}.json`));
}

export async function saveMatches(result: MatchResult) {
  if (!safeId(result.profileId)) return;
  await writeJson(path.join(MATCHES_DIR, `${result.profileId}.json`), result);
}

// Saved plan items for a profile. Saving only records it here; nothing is sent anywhere.
export async function getPlan(profileId: string): Promise<PlanItem[]> {
  if (!safeId(profileId)) return [];
  return (await readJson<PlanItem[]>(path.join(PLANS_DIR, `${profileId}.json`))) ?? [];
}

export async function setPlanItem(profileId: string, opportunityId: string, saved: boolean): Promise<PlanItem[]> {
  if (!safeId(profileId)) return [];
  const items = (await getPlan(profileId)).filter((i) => i.opportunityId !== opportunityId);
  if (saved) items.push({ opportunityId, savedAt: new Date().toISOString() });
  await writeJson(path.join(PLANS_DIR, `${profileId}.json`), items);
  return items;
}

export async function getEvalProfiles(): Promise<Profile[]> {
  return (await readJson<Profile[]>(EVALS_FILE)) ?? [];
}
