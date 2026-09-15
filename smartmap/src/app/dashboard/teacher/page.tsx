"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Users, ClipboardList } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { InsightsPanel, LevelAnalytics } from "@/components/dashboard/analytics-panel";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchTeacherClassrooms,
  fetchTeacherAssignments,
  createClassroom,
  createHomework,
  sendClassAnnouncement,
  createAssignment,
  type ClassroomSummary,
  type AssignmentSummary,
} from "@/lib/classroom";
import { AttendancePanel } from "@/components/classroom/attendance-panel";

export default function TeacherDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClassName, setNewClassName] = useState("");
  const [homeworkTitle, setHomeworkTitle] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchTeacherClassrooms(user.id),
      fetchTeacherAssignments(user.id),
    ]).then(([cls, asn]) => {
      setClassrooms(cls);
      setAssignments(asn);
      setLoading(false);
    });
  }, [user, isAuthenticated]);

  const handleCreateClass = async () => {
    if (!user || !newClassName.trim()) return;
    const { data, error } = await createClassroom(user.id, newClassName.trim(), "Primary");
    if (error) {
      setMessage("Could not create classroom. Please try again when online.");
      return;
    }
    if (data) {
      setClassrooms((prev) => [...prev, {
        id: data.id,
        name: data.name,
        grade_level: data.grade_level,
        join_code: data.join_code,
        student_count: 0,
        created_at: data.created_at,
      }]);
      setNewClassName("");
      setMessage(`Classroom "${data.name}" created! Join code: ${data.join_code}`);
    }
  };

  const handleCreateAssignment = async (classroomId: string) => {
    if (!user) return;
    const title = `Weekly Practice — ${new Date().toLocaleDateString()}`;
    const { error } = await createAssignment(user.id, classroomId, title);
    if (error) {
      setMessage("Assignment saved locally. Sync when connected to Supabase.");
      return;
    }
    const refreshed = await fetchTeacherAssignments(user.id);
    setAssignments(refreshed);
    setMessage("Assignment created successfully!");
  };

  const totalStudents = classrooms.reduce((sum, c) => sum + c.student_count, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-giga-purple hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <h1 className="font-display text-3xl font-bold">Teacher Classroom Dashboard</h1>
      <p className="mt-2 text-giga-muted">Class management, assignments, analytics, and attendance</p>

      {!isAuthenticated && (
        <p className="mt-4 rounded-xl bg-giga-orange/10 px-4 py-3 text-sm">
          Sign in to manage classrooms with Supabase. Demo analytics are shown below.
        </p>
      )}

      {message && (
        <p className="mt-4 rounded-xl bg-giga-green/10 px-4 py-3 text-sm text-giga-green">{message}</p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <GlassCard className="text-center">
          <p className="text-3xl font-display font-bold text-giga-purple">{loading ? "…" : classrooms.length}</p>
          <p className="text-sm text-giga-muted">Classrooms</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-3xl font-display font-bold text-giga-orange">{loading ? "…" : totalStudents}</p>
          <p className="text-sm text-giga-muted">Enrolled Students</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-3xl font-display font-bold text-giga-green">{assignments.length}</p>
          <p className="text-sm text-giga-muted">Assignments</p>
        </GlassCard>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-giga-purple" />
            <h2 className="font-display text-xl font-bold">Classroom Management</h2>
          </div>
          {classrooms.length > 0 ? (
            <ul className="space-y-3">
              {classrooms.map((c) => (
                <li key={c.id} className="rounded-xl border border-giga-border p-3 dark:border-giga-border-dark">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-giga-muted">{c.grade_level} · {c.student_count} students · Code: {c.join_code}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setSelectedClassroom(c.id); handleCreateAssignment(c.id); }}>
                      <ClipboardList className="h-4 w-4" /> Assign
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedClassroom(selectedClassroom === c.id ? null : c.id)}>
                      Attendance
                    </Button>
                  </div>
                  {selectedClassroom === c.id && (
                    <div className="mt-3 border-t border-giga-border pt-3 dark:border-giga-border-dark">
                      <AttendancePanel classroomId={c.id} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-giga-muted">No classrooms yet. Create your first class below.</p>
          )}
          {isAuthenticated && (
            <div className="mt-4 flex gap-2">
              <input
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Class name"
                className="flex-1 rounded-xl border border-giga-border px-3 py-2 text-sm dark:bg-giga-surface"
              />
              <Button onClick={handleCreateClass}><Plus className="h-4 w-4" /> Create</Button>
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <h2 className="font-display text-xl font-bold mb-4">Recent Assignments</h2>
          {assignments.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {assignments.map((a) => (
                <li key={a.id} className="flex justify-between gap-2 border-b border-giga-border/50 pb-2">
                  <span>{a.title}</span>
                  <span className="text-giga-muted shrink-0">{a.classroom_name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-giga-muted">Assignments will appear here once created.</p>
          )}
        </GlassCard>
      </div>

      {classrooms.length > 0 && isAuthenticated && (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <GlassCard>
            <h2 className="font-display text-xl font-bold mb-4">Homework</h2>
            <input
              value={homeworkTitle}
              onChange={(e) => setHomeworkTitle(e.target.value)}
              placeholder="Homework title"
              className="w-full rounded-xl border border-giga-border px-3 py-2 text-sm mb-3 dark:bg-giga-surface"
            />
            <Button
              size="sm"
              disabled={!homeworkTitle.trim()}
              onClick={async () => {
                if (!user || !classrooms[0]) return;
                await createHomework(user.id, classrooms[0].id, homeworkTitle.trim());
                setHomeworkTitle("");
                setMessage("Homework assigned!");
                const refreshed = await fetchTeacherAssignments(user.id);
                setAssignments(refreshed);
              }}
            >
              Assign Homework
            </Button>
          </GlassCard>
          <GlassCard>
            <h2 className="font-display text-xl font-bold mb-4">Class Announcement</h2>
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Message to your class..."
              className="w-full rounded-xl border border-giga-border px-3 py-2 text-sm mb-3 min-h-[80px] dark:bg-giga-surface"
            />
            <Button
              size="sm"
              disabled={!announcement.trim()}
              onClick={async () => {
                if (!user || !classrooms[0]) return;
                await sendClassAnnouncement(user.id, classrooms[0].id, announcement.trim());
                setAnnouncement("");
                setMessage("Announcement sent!");
              }}
            >
              Send Notification
            </Button>
          </GlassCard>
        </div>
      )}

      <div className="mt-10">
        <InsightsPanel
          strengths={["Phonics engagement", "Interactive lesson completion"]}
          weaknesses={["Extended reading fluency"]}
          recommendations={[
            "Assign GigaPhonics lessons this week",
            "Use AI Quiz Generator for differentiated practice",
            "Track attendance daily via classroom dashboard",
          ]}
        />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold mb-4">Class Progress Analytics</h2>
        <LevelAnalytics />
      </div>
    </div>
  );
}
