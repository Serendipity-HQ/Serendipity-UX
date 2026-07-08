"use client";

import { useState } from "react";
import { Bookmark, CheckCircle2 } from "lucide-react";
import { authedFetch } from "@/lib/clientApi";
import { readGoing, readSaved, toggleGoing, toggleSaved } from "@/lib/storage";

export function ExperienceActions({ experienceId }: { experienceId: string }) {
  const [saved, setSaved] = useState(() => readSaved().includes(experienceId));
  const [going, setGoing] = useState(() => readGoing().includes(experienceId));
  const [message, setMessage] = useState("");

  async function updateStatus(status: "saved" | "going") {
    const response = await authedFetch("/api/user-experiences", {
      method: "POST",
      body: JSON.stringify({ experience_id: experienceId, status }),
    });

    if (response.ok) {
      const body = await response.json();
      if (status === "saved") setSaved(Boolean(body.active));
      if (status === "going") setGoing(Boolean(body.active));
      setMessage("");
      return;
    }

    if (response.status === 401) {
      if (status === "saved") setSaved(toggleSaved(experienceId).includes(experienceId));
      if (status === "going") setGoing(toggleGoing(experienceId).includes(experienceId));
      setMessage("Saved locally. Sign in to keep this across devices.");
      return;
    }

    setMessage("Could not update yet. Try again in a moment.");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateStatus("saved")}
          className={`quiet-button ${saved ? "bg-sage text-ink" : "bg-paper-soft text-ink"}`}
        >
          <Bookmark className="h-4 w-4" />
          {saved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => updateStatus("going")}
          className={`quiet-button ${going ? "bg-moss text-paper" : "bg-night text-paper"}`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {going ? "Going" : "I'm Going"}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-muted">{message}</p> : null}
    </div>
  );
}
