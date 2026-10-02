import { NextResponse } from "next/server";
import { saveProfile } from "@/lib/data";
import { INTERESTS, ROLES } from "@/lib/vocab";

const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const targetRoles = strings(body.targetRoles).filter((t) => t in ROLES);
  const interests = strings(body.interests).filter((t) => t in INTERESTS);
  const major = typeof body.major === "string" ? body.major.trim().slice(0, 80) : "";
  const year = typeof body.year === "string" ? body.year : "";

  if (!major || !year) return NextResponse.json({ error: "Pick a major and year" }, { status: 400 });
  if (!targetRoles.length && !interests.length) {
    return NextResponse.json({ error: "Pick at least one role or interest" }, { status: 400 });
  }

  const profile = await saveProfile({
    format: body.format === "swipe" ? "swipe" : "quick",
    major,
    year,
    targetRoles,
    interests,
    experience: typeof body.experience === "string" ? body.experience.slice(0, 1000) : "",
  });
  return NextResponse.json({ id: profile.id });
}
