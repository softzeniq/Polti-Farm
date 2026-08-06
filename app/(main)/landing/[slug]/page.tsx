"use client";
import LandingPageView from "@/components/LandingPage/LandingPage";
import { useParams } from "next/navigation";

export default function page() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div>
      <LandingPageView slug={slug} />
    </div>
  );
}
