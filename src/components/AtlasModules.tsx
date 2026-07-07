import { Building2, CheckCircle2, EyeOff, Network, QrCode, Sparkles, UsersRound } from "lucide-react";
import type { AnonymousGuest } from "@/lib/types";

export function JourneyMap() {
  const steps = [
    ["Who are you?", "I do not know yet, I love this, or I want to find my people."],
    ["Where are you?", "City, neighborhood, travel radius, and comfort going alone."],
    ["When are you free?", "Real availability, not aspirational calendars."],
    ["Three invitations", "Passion, Growth, and Surprise every week."],
    ["Attend + prove", "QR, NFC, host confirmation, or physical token."],
    ["Reflect + grow", "The experience enters your Passion Path."],
  ];

  return (
    <div className="grid gap-3">
      {steps.map(([title, copy], index) => (
        <div key={title} className="flex gap-4 rounded-3xl border border-line bg-paper-soft/80 p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-night text-sm font-semibold text-paper">
            {index + 1}
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted">{copy}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnonymousGuestList({ guests }: { guests: AnonymousGuest[] }) {
  return (
    <div className="grid gap-3">
      {guests.map((guest) => (
        <article key={guest.code} className="rounded-3xl border border-line bg-paper-soft p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <EyeOff className="h-4 w-4 text-moss" />
              {guest.code}
            </div>
            <span className="rounded-full bg-sage px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-moss">
              anonymous
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Currently exploring</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {guest.currentlyExploring.map((item) => (
                <span key={item} className="rounded-full border border-line bg-paper px-3 py-1 text-xs text-muted">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Recent path</div>
            <div className="mt-2 text-sm font-semibold leading-6">{guest.recentPath.join(" -> ")}</div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">Going because {guest.attendingBecause}.</p>
        </article>
      ))}
    </div>
  );
}

export function PhilosophyTiles() {
  const tiles = [
    [UsersRound, "Real people, not audiences", "Connection starts through shared rooms and repeated participation."],
    [EyeOff, "Bias-light guest lists", "See path fragments before names, faces, jobs, or status signals."],
    [QrCode, "Proof of attendance", "The graph is built from real participation, not self-presentation."],
    [Network, "Passion path overlap", "Meet people near your becoming, not just people you already know."],
    [Building2, "Community CRM", "Hosts learn who returns, overlaps, refers, and becomes a regular."],
    [Sparkles, "Participation over engagement", "The product succeeds when users close the app and go."],
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tiles.map(([Icon, title, copy]) => (
        <div key={String(title)} className="soft-card rounded-[28px] p-6">
          <Icon className="h-5 w-5 text-moss" />
          <h3 className="serif mt-5 text-2xl font-semibold">{String(title)}</h3>
          <p className="mt-3 text-sm leading-6 text-muted">{String(copy)}</p>
        </div>
      ))}
    </div>
  );
}

export function PassionPathDiagram() {
  const path = ["Cars & Coffee", "Sketching", "Industrial Design", "Maker Space", "Woodworking", "Architecture"];

  return (
    <div className="soft-card rounded-[32px] p-7">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-moss">
        <CheckCircle2 className="h-4 w-4" />
        Verified path
      </div>
      <div className="mt-7 grid gap-4">
        {path.map((item, index) => (
          <div key={item} className="flex items-center gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-night text-sm font-semibold text-paper">
              {index + 1}
            </div>
            <div className="serif text-2xl font-semibold">{item}</div>
            {index < path.length - 1 ? <div className="path-line h-px flex-1" /> : null}
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm leading-6 text-muted">
        Each node is earned through attendance and reflection. The profile becomes a story of what the person actually tried.
      </p>
    </div>
  );
}
