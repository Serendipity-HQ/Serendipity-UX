import type { OnboardingState } from "./types";

const onboardingKey = "serendipity:onboarding";
const savedKey = "serendipity:saved";
const goingKey = "serendipity:going";

export function readOnboarding(): OnboardingState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(onboardingKey);
  return raw ? (JSON.parse(raw) as OnboardingState) : null;
}

export function writeOnboarding(value: OnboardingState) {
  window.localStorage.setItem(onboardingKey, JSON.stringify(value));
}

function readList(key: string) {
  if (typeof window === "undefined") return [];
  return JSON.parse(window.localStorage.getItem(key) ?? "[]") as string[];
}

function toggleList(key: string, id: string) {
  const current = readList(key);
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function readSaved() {
  return readList(savedKey);
}

export function readGoing() {
  return readList(goingKey);
}

export function toggleSaved(id: string) {
  return toggleList(savedKey, id);
}

export function toggleGoing(id: string) {
  return toggleList(goingKey, id);
}
