"use client";

import { useState } from "react";
import { Bookmark, CheckCircle2 } from "lucide-react";
import { readGoing, readSaved, toggleGoing, toggleSaved } from "@/lib/storage";

export function ExperienceActions({ experienceId }: { experienceId: string }) {
  const [saved, setSaved] = useState(() => readSaved().includes(experienceId));
  const [going, setGoing] = useState(() => readGoing().includes(experienceId));

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setSaved(toggleSaved(experienceId).includes(experienceId))}
        className={`quiet-button ${saved ? "bg-sage text-ink" : "bg-paper-soft text-ink"}`}
      >
        <Bookmark className="h-4 w-4" />
        {saved ? "Saved" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => setGoing(toggleGoing(experienceId).includes(experienceId))}
        className={`quiet-button ${going ? "bg-moss text-paper" : "bg-night text-paper"}`}
      >
        <CheckCircle2 className="h-4 w-4" />
        {going ? "Going" : "I'm Going"}
      </button>
    </div>
  );
}
