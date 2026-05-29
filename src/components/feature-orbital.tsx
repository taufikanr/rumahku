"use client";

import {
  BadgeCheck,
  FileText,
  Receipt,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import RadialOrbitalTimeline, {
  type TimelineItem,
} from "@/components/ui/radial-orbital-timeline";

const featureTimeline: TimelineItem[] = [
  {
    id: 1,
    title: "Scam Check",
    date: "84% top need",
    category: "Trust",
    content:
      "An AI scam detector scores every listing for risk and flags red flags before you pay any deposit. Built because 68% of renters we surveyed had faced a scam.",
    icon: ShieldCheck,
    relatedIds: [2, 3],
    status: "completed",
    energy: 95,
  },
  {
    id: 2,
    title: "Verified",
    date: "Landlord KYC",
    category: "Trust",
    content:
      "Landlords pass identity verification to earn a Verified badge — so the room you see is the room you get, not a stolen photo.",
    icon: BadgeCheck,
    relatedIds: [1, 4],
    status: "completed",
    energy: 90,
  },
  {
    id: 3,
    title: "Fair Price",
    date: "84% top need",
    category: "Insight",
    content:
      "Each listing is compared against the real average rent for that KK area, so you instantly know if a price is fair, a steal, or overpriced.",
    icon: Scale,
    relatedIds: [1, 5],
    status: "completed",
    energy: 88,
  },
  {
    id: 4,
    title: "Housemates",
    date: "77% had issues",
    category: "Match",
    content:
      "See who you'd be living with and match on lifestyle — sleep schedule, cleanliness, and guests — before you ever move in.",
    icon: Users,
    relatedIds: [2, 6],
    status: "in-progress",
    energy: 77,
  },
  {
    id: 5,
    title: "Tenancy",
    date: "Stops disputes",
    category: "Protect",
    content:
      "Generate a clear digital tenancy agreement in minutes — capturing deposit terms and move-in condition to prevent disputes later.",
    icon: FileText,
    relatedIds: [3, 6],
    status: "in-progress",
    energy: 70,
  },
  {
    id: 6,
    title: "Bills",
    date: "Never miss rent",
    category: "Manage",
    content:
      "Track rent and utility bills in one place with due-date reminders, so you never forget a payment again.",
    icon: Receipt,
    relatedIds: [4, 5],
    status: "pending",
    energy: 66,
  },
];

export function FeatureOrbital() {
  return <RadialOrbitalTimeline timelineData={featureTimeline} />;
}
