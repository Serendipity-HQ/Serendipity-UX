import type { Experience } from "@/lib/types";

const categoryColors: Record<string, string> = {
  Architecture: "from-moss to-night",
  Ceramics: "from-clay to-night",
  Makerspace: "from-night to-moss",
  Coffee: "from-[#6d4b34] to-night",
  Photography: "from-[#38475b] to-night",
  Cooking: "from-[#8a4e35] to-night",
  Running: "from-[#546c58] to-night",
  Design: "from-[#3a4c64] to-night",
};

export function ExperienceArtwork({ experience, className = "" }: { experience: Experience; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${categoryColors[experience.category] ?? categoryColors.Design} ${className}`}>
      <div className="absolute inset-0 opacity-80">
        <div className="absolute left-[12%] top-[14%] h-28 w-28 rounded-full border border-paper/25" />
        <div className="absolute bottom-[18%] right-[14%] h-36 w-36 rounded-full bg-paper/10" />
        <div className="absolute left-[22%] top-[55%] h-px w-[58%] rotate-[-12deg] bg-paper/35" />
        <div className="absolute right-[24%] top-[20%] h-20 w-px rotate-[24deg] bg-paper/30" />
      </div>
      <div className="absolute bottom-5 left-5 right-5">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-paper/70">{experience.city}</div>
        <div className="serif mt-2 max-w-xs text-3xl font-semibold leading-none text-paper">{experience.category}</div>
      </div>
    </div>
  );
}
