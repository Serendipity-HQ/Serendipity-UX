import { Header } from "@/components/Header";
import { ThisWeekCuration } from "@/components/ThisWeekCuration";
import { getWeeklyRecommendationSetFor, listApprovedExperiences } from "@/lib/experienceRepository";

export default async function ThisWeekPage() {
  const experiences = await listApprovedExperiences({ city: "San Francisco" });
  const recommendationSet = await getWeeklyRecommendationSetFor(null, "San Francisco");

  return (
    <>
      <Header />
      <main className="container-page py-14">
        <ThisWeekCuration experiences={experiences} initialSet={recommendationSet} />
      </main>
    </>
  );
}
