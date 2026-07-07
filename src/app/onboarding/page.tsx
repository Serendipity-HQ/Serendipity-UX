"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ChoicePills } from "@/components/ChoicePills";
import { feelings, goals, interests } from "@/lib/experiences";
import { writeOnboarding } from "@/lib/storage";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Design", "Coffee"]);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>(["Curious"]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["Community"]);

  function submit() {
    writeOnboarding({
      interests: selectedInterests,
      feelings: selectedFeelings,
      goals: selectedGoals,
    });
    router.push("/dashboard");
  }

  return (
    <>
      <Header />
      <main className="container-page py-16">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">Onboarding</p>
          <h1 className="serif mt-4 text-6xl font-semibold leading-none tracking-tight">Start with curiosity, not a profile.</h1>
          <p className="mt-6 text-lg leading-8 text-muted">
            These answers shape the weekly curation. They are not a bio. They are a compass.
          </p>
        </section>

        <div className="mt-12 grid gap-6">
          <Question title="What are you curious about?">
            <ChoicePills options={interests} selected={selectedInterests} onChange={setSelectedInterests} />
          </Question>
          <Question title="How do you want to feel more often?">
            <ChoicePills options={feelings} selected={selectedFeelings} onChange={setSelectedFeelings} />
          </Question>
          <Question title="What do you want more of in your life?">
            <ChoicePills options={goals} selected={selectedGoals} onChange={setSelectedGoals} />
          </Question>
        </div>

        <button onClick={submit} className="quiet-button mt-10 bg-night text-paper" type="button">
          Build my weekly curation
        </button>
      </main>
    </>
  );
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="soft-card rounded-[28px] p-6">
      <h2 className="serif text-3xl font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
