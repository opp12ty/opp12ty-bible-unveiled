import type { Metadata } from "next";
import { AiChat } from "@/components/AiChat";

export const metadata: Metadata = { title: "Unveiled AI", description: "A source-grounded research assistant for Bible investigation, with citations to reviewed material." };

export default function AiPage() { return <AiChat />; }
