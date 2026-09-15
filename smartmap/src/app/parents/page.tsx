import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = { title: "For Parents" };

export default function ParentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-5xl">👨‍👩‍👧</span>
        <h1 className="font-display mt-4 text-4xl font-bold">Smart Map for Parents</h1>
        <p className="mt-4 text-lg text-giga-muted">
          Track your child&apos;s learning journey, celebrate achievements, and get home learning suggestions
        </p>
        <Link href="/dashboard/parent" className="inline-block mt-8">
          <Button size="lg">Open Parent Dashboard</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card hover gradient>
          <CardTitle>📈 Child Progress</CardTitle>
          <CardDescription>See exactly what your child is learning and how they&apos;re progressing across all 8 levels</CardDescription>
        </Card>
        <Card hover gradient>
          <CardTitle>📖 Reading Activity</CardTitle>
          <CardDescription>Track stories read, time spent reading, and fluency improvements</CardDescription>
        </Card>
        <Card hover gradient>
          <CardTitle>🏆 Achievements</CardTitle>
          <CardDescription>Celebrate badges, streaks, and milestones with your child</CardDescription>
        </Card>
        <Card hover gradient>
          <CardTitle>🏠 Home Learning</CardTitle>
          <CardDescription>Personalized suggestions for learning activities at home — even offline</CardDescription>
        </Card>
      </div>
    </div>
  );
}
