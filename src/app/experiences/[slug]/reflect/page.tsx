"use client";

import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { authedFetch } from "@/lib/clientApi";

export default function ReflectPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  async function submit(formData: FormData) {
    const response = await fetch(`/api/experiences/${params.slug}`);
    const body = await response.json();
    const experienceId = body.experience?.id;
    if (!experienceId) return;

    const reflection = {
      experience_id: experienceId,
      attended: formData.get("attended") === "on",
      surprised_by: formData.get("surprised_by"),
      people_met: formData.get("people_met"),
      would_return: formData.get("would_return") === "yes",
      sparked_interest_tags: String(formData.get("sparked_interest_tags") ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      private_note: formData.get("private_note"),
    };

    const saveResponse = await authedFetch("/api/reflections", {
      method: "POST",
      body: JSON.stringify(reflection),
    });

    if (saveResponse.ok) router.push("/profile");
  }

  return (
    <>
      <Header />
      <main className="container-page grid min-h-[calc(100vh-4rem)] place-items-center py-16">
        <form action={submit} className="soft-card grid w-full max-w-3xl gap-5 rounded-[36px] p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-moss">Reflect</p>
          <h1 className="serif text-5xl font-semibold leading-none">Turn the experience into part of your path.</h1>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input name="attended" type="checkbox" defaultChecked /> I attended
          </label>
          <TextArea name="surprised_by" label="What surprised you?" />
          <TextArea name="people_met" label="Did you meet anyone interesting?" />
          <label className="grid gap-2 text-sm font-semibold">
            Would you go again?
            <select name="would_return" className="rounded-2xl border border-line bg-paper-soft px-4 py-3 font-normal outline-none focus:border-moss">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            What new curiosity did this spark?
            <input name="sparked_interest_tags" placeholder="woodworking, jazz, volunteering" className="rounded-2xl border border-line bg-paper-soft px-4 py-3 font-normal outline-none focus:border-moss" />
          </label>
          <TextArea name="private_note" label="Optional private note" />
          <button className="quiet-button bg-night text-paper" type="submit">Add to my path</button>
        </form>
      </main>
    </>
  );
}

function TextArea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <textarea {...props} className="min-h-24 rounded-2xl border border-line bg-paper-soft px-4 py-3 font-normal outline-none focus:border-moss" />
    </label>
  );
}
