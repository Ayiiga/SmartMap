export type UserRole = "student" | "teacher" | "parent" | "admin";

export type LearningLevel =
  | "alphabet"
  | "phonics"
  | "vocabulary"
  | "semantics"
  | "tone"
  | "rhythm"
  | "reading"
  | "grammar"
  | "mathematics";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  age_group?: "toddler" | "infant" | "kindergarten" | "primary" | "adult";
  parent_id?: string;
  teacher_id?: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  level: LearningLevel;
  title: string;
  description: string;
  slug: string;
  order_index: number;
  duration_minutes: number;
  xp_reward: number;
  coin_reward: number;
  is_premium: boolean;
  content: LessonContent;
  thumbnail_url?: string;
}

export interface LessonContent {
  type: "alphabet" | "phonics" | "vocabulary" | "story" | "game" | "quiz" | "grammar" | "mathematics";
  activities: Activity[];
  audio_url?: string;
  video_url?: string;
}

export interface Activity {
  id: string;
  type:
    | "tracing"
    | "matching"
    | "listening"
    | "speaking"
    | "reading"
    | "quiz"
    | "flashcard"
    | "blending"
    | "comprehension"
    | "drag-drop";
  title: string;
  data: Record<string, unknown>;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  level: LearningLevel;
  completed: boolean;
  score: number;
  time_spent_seconds: number;
  completed_at?: string;
  synced: boolean;
}

export interface ActivityEntry {
  id: string;
  type: "lesson" | "quest" | "badge" | "xp" | "streak";
  title: string;
  icon: string;
  timestamp: string;
}

export interface WeeklyGoalProgress {
  lessons_completed: number;
  xp_earned: number;
  speaking_exercises: number;
  week_start: string;
}

export interface GamificationState {
  xp: number;
  coins: number;
  gems: number;
  level: number;
  streak: number;
  last_active_date: string;
  badges: Badge[];
  unlocked_lessons: string[];
  completed_lessons: string[];
  daily_quest_progress: Record<string, number>;
  completed_quests: string[];
  unlocked_worlds: string[];
  strengths: string[];
  weaknesses: string[];
  lessons_completed_today: number;
  xp_earned_today: number;
  speaking_exercises_today: number;
  recent_activity: ActivityEntry[];
  weekly_goals: WeeklyGoalProgress;
  dismissed_notifications: string[];
  leaderboard_opt_in: boolean;
  completed_weekly_challenges: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_required: number;
  category: "learning" | "streak" | "reading" | "phonics" | "social";
}

export interface ClassRoom {
  id: string;
  name: string;
  teacher_id: string;
  school_id?: string;
  grade_level: string;
  student_ids: string[];
  created_at: string;
}

export interface Assignment {
  id: string;
  class_id: string;
  teacher_id: string;
  lesson_id: string;
  title: string;
  due_date: string;
  created_at: string;
}

export interface OfflineQueueItem {
  id: string;
  type: "progress" | "achievement" | "activity" | "gamification";
  payload: Record<string, unknown>;
  created_at: string;
  retry_count: number;
}

export interface AIFeatureRequest {
  feature:
    | "reading_coach"
    | "pronunciation"
    | "story_generator"
    | "quiz_generator"
    | "homework_assistant"
    | "recommendations"
    | "vocabulary_trainer"
    | "speaking_coach"
    | "speech_coach"
    | "science_lab"
    | "lesson_generator"
    | "coding_tutor"
    | "math_tutor"
    | "study_plan"
    | "revision"
    | "news_assistant"
    | "map_assistant";
  input: string;
  context?: Record<string, unknown>;
}

export interface Story {
  id: string;
  title: string;
  level: LearningLevel;
  content: string;
  illustration_url?: string;
  audio_url?: string;
  word_count: number;
  age_group: string;
}

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles?: UserRole[];
}
