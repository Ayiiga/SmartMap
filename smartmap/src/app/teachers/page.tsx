import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = { title: "For Teachers" };

const FEATURES = [
  { icon: "👥", title: "Student Management", desc: "Add, organize, and track every learner in your class" },
  { icon: "📋", title: "Class Management", desc: "Create classes with join codes for easy enrollment" },
  { icon: "📝", title: "Assignments", desc: "Assign lessons and track completion" },
  { icon: "📊", title: "Analytics & Reports", desc: "Detailed progress analytics and exportable reports" },
  { icon: "✅", title: "Attendance", desc: "Daily attendance tracking for each class" },
  { icon: "💡", title: "Recommendations", desc: "AI-powered learning recommendations per student" },
];

export default function TeachersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-5xl">👩‍🏫</span>
        <h1 className="font-display mt-4 text-4xl font-bold">Smart Map for Teachers</h1>
        <p className="mt-4 text-lg text-giga-muted">
          Powerful tools to manage classes, track progress, and help every child succeed
        </p>
        <Link href="/dashboard/teacher" className="inline-block mt-8">
          <Button size="lg">Open Teacher Dashboard</Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.title} hover gradient>
            <span className="text-4xl">{f.icon}</span>
            <CardTitle className="mt-3">{f.title}</CardTitle>
            <CardDescription>{f.desc}</CardDescription>
          </Card>
        ))}
      </div>
    </div>
  );
}
