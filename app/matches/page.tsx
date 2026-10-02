"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { lastProfile } from "@/components/app-shell";

// "My Matches" with no profile id: jump to the last saved profile, or offer to start.
export default function MyMatches() {
  const router = useRouter();
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const id = lastProfile();
    if (id) router.replace(`/matches/${id}`);
    else setEmpty(true);
  }, [router]);

  if (!empty) return null;
  return (
    <div className="wrap">
      <div className="eyebrow">My Matches</div>
      <h1 style={{ margin: "8px 0 12px" }}>No matches yet</h1>
      <p className="lede" style={{ margin: "0 0 28px" }}>
        Answer a few questions and we'll pick the internships, events, clubs, and alumni that fit you.
      </p>
      <Link className="btn" href="/">
        Get started
      </Link>
    </div>
  );
}
