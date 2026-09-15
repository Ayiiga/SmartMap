"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { markAttendance, fetchTodayAttendance, fetchClassroomStudents, type ClassroomStudent } from "@/lib/classroom";

export function AttendancePanel({ classroomId }: { classroomId: string }) {
  const [students, setStudents] = useState<ClassroomStudent[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchClassroomStudents(classroomId),
      fetchTodayAttendance(classroomId),
    ]).then(([studentList, today]) => {
      setStudents(studentList);
      const map: Record<string, boolean> = {};
      for (const row of today) map[row.student_id] = row.present;
      setAttendance(map);
      setLoading(false);
    });
  }, [classroomId]);

  const toggle = async (studentId: string) => {
    const present = !attendance[studentId];
    setAttendance((prev) => ({ ...prev, [studentId]: present }));
    await markAttendance(classroomId, studentId, present);
  };

  if (loading) return <p className="text-sm text-giga-muted">Loading attendance...</p>;

  if (students.length === 0) {
    return (
      <p className="text-sm text-giga-muted">
        No enrolled students yet. Share your classroom join code so students can enroll.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {students.map((student) => (
        <li key={student.student_id} className="flex items-center justify-between rounded-xl border border-giga-border px-3 py-2 dark:border-giga-border-dark">
          <span className="text-sm font-medium">{student.full_name}</span>
          <Button
            size="sm"
            variant={attendance[student.student_id] ? "primary" : "outline"}
            onClick={() => toggle(student.student_id)}
            aria-label={`Mark ${student.full_name} ${attendance[student.student_id] ? "absent" : "present"}`}
          >
            {attendance[student.student_id] ? "✅ Present" : "Mark Present"}
          </Button>
        </li>
      ))}
    </ul>
  );
}
