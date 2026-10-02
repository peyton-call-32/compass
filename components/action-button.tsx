"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

// Saves the item to the student's plan. Nothing is sent to the organization.
export function ActionButton({
  profileId,
  opportunityId,
  label,
  saved: initialSaved,
}: {
  profileId: string;
  opportunityId: string;
  label: string;
  saved: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    const next = !saved;
    setSaved(next);
    setBusy(true);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileId, opportunityId, saved: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setSaved(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={"act" + (saved ? " saved" : "")}
      onClick={toggle}
      disabled={busy}
      title={saved ? "Remove from my plan" : "Save to my plan. Nothing is sent."}
    >
      {saved ? (
        <>
          <Check size={14} /> Saved to plan
        </>
      ) : (
        label
      )}
    </button>
  );
}
