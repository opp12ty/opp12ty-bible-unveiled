import type { Metadata } from "next";
import { QuestionBoard } from "@/components/QuestionBoard";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Global Questions", description: "Ask and vote on the questions people are afraid to ask. Moderated, respectful and research-led." };

export default function Questions() {
  return (
    <div className="wrap py-8 max-w-3xl">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Global questions" }]} />
      <h1 className="m-0 text-4xl">Global Questions</h1>
      <p className="muted mt-2 mb-6">Difficult questions deserve careful answers, not ridicule. Top-voted questions are researched and may become investigations.</p>
      <QuestionBoard />
    </div>
  );
}
