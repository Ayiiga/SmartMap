"use client";

import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

export interface ClassroomSummary {
  id: string;
  name: string;
  grade_level: string;
  join_code: string;
  student_count: number;
  created_at: string;
}

export interface AssignmentSummary {
  id: string;
  title: string;
  due_date: string | null;
  classroom_name: string;
  created_at: string;
}

export interface StudentProgressSummary {
  student_id: string;
  full_name: string;
  xp: number;
  streak: number;
  lessons_completed: number;
}

export interface SchoolStats {
  total_users: number;
  active_students: number;
  schools: number;
  lessons_published: number;
}

export async function fetchTeacherClassrooms(userId: string): Promise<ClassroomSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("classrooms")
    .select("id, name, grade_level, join_code, created_at")
    .eq("teacher_id", userId);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    grade_level: row.grade_level,
    join_code: row.join_code,
    student_count: 0,
    created_at: row.created_at,
  }));
}

export async function fetchTeacherAssignments(userId: string): Promise<AssignmentSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assignments")
    .select("id, title, due_date, created_at, classrooms(name)")
    .eq("teacher_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    due_date: row.due_date,
    classroom_name: Array.isArray(row.classrooms)
      ? (row.classrooms[0] as { name: string } | undefined)?.name ?? "Classroom"
      : (row.classrooms as { name: string } | null)?.name ?? "Classroom",
    created_at: row.created_at,
  }));
}

export async function createClassroom(userId: string, name: string, gradeLevel: string) {
  const supabase = createClient();
  return supabase.from("classrooms").insert({
    name,
    teacher_id: userId,
    grade_level: gradeLevel,
  }).select().single();
}

export async function createAssignment(
  teacherId: string,
  classroomId: string,
  title: string,
  dueDate?: string,
) {
  const supabase = createClient();
  return supabase.from("assignments").insert({
    teacher_id: teacherId,
    classroom_id: classroomId,
    lesson_id: "00000000-0000-0000-0000-000000000001",
    title,
    due_date: dueDate ?? null,
  }).select().single();
}

export async function fetchChildProgress(parentId: string): Promise<StudentProgressSummary[]> {
  const supabase = createClient();
  const { data: children, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("parent_id", parentId);

  if (error || !children?.length) return [];

  const results: StudentProgressSummary[] = [];
  for (const child of children) {
    const { data: gamification } = await supabase
      .from("gamification")
      .select("xp, streak, completed_lessons")
      .eq("user_id", child.id)
      .single();

    results.push({
      student_id: child.id,
      full_name: child.full_name,
      xp: gamification?.xp ?? 0,
      streak: gamification?.streak ?? 0,
      lessons_completed: (gamification?.completed_lessons as string[] | null)?.length ?? 0,
    });
  }
  return results;
}

export async function fetchSchoolStats(): Promise<SchoolStats | null> {
  const supabase = createClient();
  const [profiles, schools, lessons] = await Promise.all([
    supabase.from("profiles").select("id, role", { count: "exact", head: false }),
    supabase.from("schools").select("id", { count: "exact", head: true }),
    supabase.from("lessons").select("id", { count: "exact", head: true }).eq("published", true),
  ]);

  if (profiles.error) return null;

  const users = profiles.data ?? [];
  return {
    total_users: users.length,
    active_students: users.filter((u) => u.role === "student").length,
    schools: schools.count ?? 0,
    lessons_published: lessons.count ?? 0,
  };
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).single();
  return (data?.role as UserRole) ?? null;
}

export interface ClassroomStudent {
  student_id: string;
  full_name: string;
  joined_at: string;
}

export async function joinClassroomByCode(studentId: string, joinCode: string) {
  const supabase = createClient();
  const { data: classroom, error: lookupError } = await supabase
    .from("classrooms")
    .select("id, name")
    .eq("join_code", joinCode.trim().toLowerCase())
    .single();

  if (lookupError || !classroom) {
    return { error: "Invalid join code. Check with your teacher." };
  }

  const { error } = await supabase.from("classroom_students").upsert({
    classroom_id: classroom.id,
    student_id: studentId,
  });

  if (error) return { error: error.message };
  return { classroom };
}

export async function fetchClassroomStudents(classroomId: string): Promise<ClassroomStudent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("classroom_students")
    .select("student_id, joined_at, profiles(full_name)")
    .eq("classroom_id", classroomId);

  if (error || !data) return [];

  return data.map((row) => {
    const profile = Array.isArray(row.profiles)
      ? (row.profiles[0] as { full_name: string } | undefined)
      : (row.profiles as { full_name: string } | null);
    return {
      student_id: row.student_id,
      full_name: profile?.full_name ?? "Student",
      joined_at: row.joined_at,
    };
  });
}

export async function markAttendance(
  classroomId: string,
  studentId: string,
  present: boolean,
) {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  return supabase.from("attendance").upsert(
    { classroom_id: classroomId, student_id: studentId, date: today, present },
    { onConflict: "classroom_id,student_id,date" },
  );
}

export async function fetchTodayAttendance(classroomId: string) {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("attendance")
    .select("student_id, present")
    .eq("classroom_id", classroomId)
    .eq("date", today);
  return data ?? [];
}

export async function createHomework(
  teacherId: string,
  classroomId: string,
  title: string,
  dueDate?: string,
) {
  return createAssignment(teacherId, classroomId, `📝 ${title}`, dueDate);
}

export async function sendClassAnnouncement(
  teacherId: string,
  classroomId: string,
  message: string,
) {
  return createAssignment(teacherId, classroomId, `📢 ${message.slice(0, 80)}`);
}
