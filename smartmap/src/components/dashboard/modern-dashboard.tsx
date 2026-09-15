"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Mic,
  MicOff,
  X,
  Bot,
  ChevronRight,
  Flame,
  Star,
  Coins,
  Gem,
  Trophy,
  Calendar,
  Target,
  Sparkles,
  BookOpen,
  Bell,
  Play,
} from "lucide-react";
import { format, subDays, isSameDay } from "date-fns";
import { ProgressBar } from "@/components/gamification/progress-bar";
import { LearningPathCard } from "@/components/dashboard/learning-path-card";
import { GlassCard } from "@/components/ui/glass-card";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGamification, useAppStore } from "@/stores/app-store";
import { useAuth } from "@/hooks/use-auth";
import { AVAILABLE_ECOSYSTEMS, WEEKLY_GOALS } from "@/content/ecosystems";
import { DAILY_QUESTS } from "@/content/quests";
import { LESSONS } from "@/content/curriculum";
import { buildPersonalizedLearningPath } from "@/lib/learning-path/recommendations";
import { SpeechRecognizer } from "@/lib/speech";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const LEADERBOARD_ENTRIES = [
  { name: "Amara O.", xp: 2450, avatar: "👩🏾" },
  { name: "James K.", xp: 2180, avatar: "👨🏿‍🏫" },
  { name: "Sarah M.", xp: 1920, avatar: "👩🏼" },
  { name: "David L.", xp: 1650, avatar: "👦🏻" },
  { name: "Priya S.", xp: 1480, avatar: "👧🏽" },
];

export function ModernDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const gamification = useGamification();
  const userRole = useAppStore((s) => s.userRole);
  const dismissNotification = useAppStore((s) => s.dismissNotification);
  const [ready, setReady] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const greeting = user?.user_metadata?.full_name?.split(" ")[0] ?? "Learner";
  const continueLesson = useMemo(() => {
    const path = buildPersonalizedLearningPath(gamification);
    return path[0] ?? null;
  }, [gamification]);

  const recommendedLessons = useMemo(() => {
    return buildPersonalizedLearningPath(gamification).slice(0, 4);
  }, [gamification]);

  const dailyMission = useMemo(() => {
    return DAILY_QUESTS.find((q) => !gamification.completed_quests.includes(q.id)) ?? DAILY_QUESTS[0];
  }, [gamification.completed_quests]);

  const missionProgress = gamification.daily_quest_progress[dailyMission.id] ?? 0;

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return LESSONS.filter(
      (l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.level.includes(q),
    ).slice(0, 8);
  }, [searchQuery]);

  const notifications = useMemo(() => {
    const items: { id: string; message: string; icon: string; href?: string }[] = [];
    if (gamification.streak === 0) {
      items.push({ id: "streak-start", message: "Start your learning streak today!", icon: "🔥", href: "/learn" });
    }
    if (missionProgress < dailyMission.target) {
      items.push({
        id: "daily-mission",
        message: `Daily mission: ${dailyMission.title} (${missionProgress}/${dailyMission.target})`,
        icon: dailyMission.icon,
        href: "/quests",
      });
    }
    if (gamification.badges.length > 0) {
      items.push({
        id: "badges",
        message: `You've earned ${gamification.badges.length} achievement badge${gamification.badges.length > 1 ? "s" : ""}!`,
        icon: "🏆",
        href: "/achievements",
      });
    }
    return items.filter((n) => !gamification.dismissed_notifications.includes(n.id));
  }, [gamification, dailyMission, missionProgress]);

  const leaderboard = useMemo(() => {
    const userEntry = { name: greeting, xp: gamification.xp, avatar: "🎓", isUser: true };
    return [...LEADERBOARD_ENTRIES, userEntry].sort((a, b) => b.xp - a.xp).slice(0, 6);
  }, [gamification.xp, greeting]);

  const calendarDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const active = isSameDay(date, new Date(gamification.last_active_date));
      const hasActivity = gamification.recent_activity.some((a) => isSameDay(new Date(a.timestamp), date));
      return { date, active: active || hasActivity };
    });
  }, [gamification.last_active_date, gamification.recent_activity]);

  const handleVoiceSearch = useCallback(() => {
    const recognizer = new SpeechRecognizer();
    setListening(true);
    recognizer.start(
      (transcript) => {
        setSearchQuery(transcript);
        setSearchOpen(true);
        setListening(false);
      },
      () => setListening(false),
    );
  }, []);

  if (!ready || authLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Animated Hero */}
      <motion.section {...fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-giga-purple via-giga-indigo to-giga-blue p-6 sm:p-10 text-white">
        <div className="absolute inset-0 overflow-hidden">
          {["⭐", "📚", "🔤", "🔢", "🎵"].map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl opacity-20"
              style={{ left: `${10 + i * 18}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ y: [0, -12, 0], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: i * 0.3 }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
        <div className="relative z-10 grid gap-6 lg:grid-cols-2 lg:items-center">
          <div>
            <motion.span
              className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold backdrop-blur-sm"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Sparkles className="h-4 w-4" /> AI-Powered Learning
            </motion.span>
            <h1 className="font-display mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
              {isAuthenticated ? (
                <>Welcome back, <span className="text-giga-yellow">{greeting}</span>!</>
              ) : (
                <>Learn, Read, Speak & <span className="text-giga-yellow">Grow Smarter</span></>
              )}
            </h1>
            <p className="mt-3 text-white/80 max-w-lg">
              Your personalized AI learning command center — track progress, complete missions, and explore new worlds.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {continueLesson ? (
                <Link href={continueLesson.href}>
                  <Button size="lg" className="bg-white text-giga-purple hover:bg-white/90">
                    <Play className="h-5 w-5" /> Continue Learning
                  </Button>
                </Link>
              ) : (
                <Link href="/learn">
                  <Button size="lg" className="bg-white text-giga-purple hover:bg-white/90">
                    <Play className="h-5 w-5" /> Start Learning
                  </Button>
                </Link>
              )}
              <Link href="/ai-tutor">
                <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10">
                  <Bot className="h-5 w-5" /> AI Tutor
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link href="/register">
                  <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10">
                    Create Account
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="max-w-md lg:ml-auto w-full">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <ProgressBar />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats Row */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Star className="h-5 w-5 text-giga-yellow" />} label="XP" value={gamification.xp} color="from-giga-yellow/20 to-giga-orange/20" />
        <StatCard icon={<Coins className="h-5 w-5 text-giga-orange" />} label="Coins" value={gamification.coins} color="from-giga-orange/20 to-giga-yellow/20" />
        <StatCard icon={<Gem className="h-5 w-5 text-giga-teal" />} label="Gems" value={gamification.gems ?? 0} color="from-giga-teal/20 to-giga-green/20" />
        <StatCard icon={<Flame className="h-5 w-5 text-giga-red" />} label="Streak" value={`${gamification.streak}d`} color="from-giga-red/20 to-giga-orange/20" />
      </motion.div>

      {/* Search Bar */}
      <motion.div {...fadeUp} transition={{ delay: 0.08 }} className="mt-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-giga-muted" />
            <input
              type="search"
              placeholder="Search lessons, topics, skills..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              className="w-full rounded-2xl border border-giga-border bg-white py-3 pl-12 pr-4 text-sm font-medium focus:border-giga-purple focus:outline-none focus:ring-2 focus:ring-giga-purple/20 dark:bg-giga-surface dark:border-giga-border-dark min-h-[48px]"
              aria-label="Universal search"
            />
            <AnimatePresence>
              {searchOpen && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute left-0 right-0 top-full z-40 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-giga-border bg-white shadow-xl dark:bg-giga-surface dark:border-giga-border-dark"
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/learn/${lesson.level}/${lesson.slug}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-giga-purple/5 min-h-[48px]"
                      >
                        <BookOpen className="h-4 w-4 text-giga-purple shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">{lesson.title}</p>
                          <p className="text-xs text-giga-muted">{lesson.level} · +{lesson.xp_reward} XP</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-center text-sm text-giga-muted">No lessons found. Try &quot;phonics&quot; or &quot;math&quot;.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={handleVoiceSearch}
            className={cn(
              "touch-target flex items-center justify-center rounded-2xl border px-4 transition-colors min-h-[48px]",
              listening ? "border-giga-red bg-giga-red/10 text-giga-red" : "border-giga-border hover:border-giga-purple hover:bg-giga-purple/5",
            )}
            aria-label={listening ? "Listening..." : "Voice search"}
          >
            {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        </div>
      </motion.div>

      {/* Smart Notifications */}
      {notifications.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="mt-6 space-y-2">
          {notifications.slice(0, 2).map((n) => (
            <div key={n.id} className="flex items-center gap-3 rounded-2xl border border-giga-purple/20 bg-giga-purple/5 px-4 py-3">
              <Bell className="h-4 w-4 text-giga-purple shrink-0" />
              <span className="text-lg">{n.icon}</span>
              {n.href ? (
                <Link href={n.href} className="flex-1 text-sm font-medium hover:text-giga-purple">{n.message}</Link>
              ) : (
                <span className="flex-1 text-sm font-medium">{n.message}</span>
              )}
              <button onClick={() => dismissNotification(n.id)} className="touch-target p-1 text-giga-muted hover:text-giga-purple" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning + Daily Mission */}
          <div className="grid gap-6 sm:grid-cols-2">
            <GlassCard hover className="h-full">
              <div className="flex items-center gap-2 mb-3">
                <Play className="h-5 w-5 text-giga-purple" />
                <h2 className="font-display text-lg font-bold">Continue Learning</h2>
              </div>
              {continueLesson ? (
                <Link href={continueLesson.href} className="block group">
                  <p className="font-semibold group-hover:text-giga-purple transition-colors">{continueLesson.title}</p>
                  <p className="text-sm text-giga-muted mt-1">{continueLesson.reason}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-giga-purple">
                    Resume <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              ) : (
                <Link href="/learn" className="text-giga-purple font-bold text-sm hover:underline">Explore lessons →</Link>
              )}
            </GlassCard>

            <GlassCard hover className="h-full">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-giga-orange" />
                <h2 className="font-display text-lg font-bold">Daily Mission</h2>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{dailyMission.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold">{dailyMission.title}</p>
                  <p className="text-sm text-giga-muted">{dailyMission.description}</p>
                  <div className="mt-3 h-2 rounded-full bg-giga-border/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-giga-orange to-giga-yellow transition-all"
                      style={{ width: `${Math.min((missionProgress / dailyMission.target) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-giga-muted">{missionProgress}/{dailyMission.target} · +{dailyMission.xpReward} XP</p>
                </div>
              </div>
              <Link href="/quests" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-giga-purple">
                View all quests <ChevronRight className="h-4 w-4" />
              </Link>
            </GlassCard>
          </div>

          {/* AI Tutor Widget */}
          <GlassCard className="bg-gradient-to-br from-giga-teal/10 to-giga-green/10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="text-5xl">🤖</span>
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold">AI Personal Tutor</h2>
                <p className="text-sm text-giga-muted mt-1">Reading coach, quiz generator, homework help, pronunciation practice, and more.</p>
              </div>
              <Link href="/ai-tutor">
                <Button><Bot className="h-4 w-4" /> Open AI Tutor</Button>
              </Link>
            </div>
          </GlassCard>

          {/* Learning Ecosystems */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-4">Learning Ecosystems</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {AVAILABLE_ECOSYSTEMS.map((eco, i) => (
                <motion.div key={eco.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link href={eco.href}>
                    <GlassCard hover className={`bg-gradient-to-br ${eco.color} text-white border-0 h-full`}>
                      <span className="text-4xl">{eco.icon}</span>
                      <h3 className="font-display mt-2 text-lg font-bold">{eco.title}</h3>
                      <p className="mt-1 text-sm text-white/80 line-clamp-2">{eco.description}</p>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommended Lessons */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-4">Recommended Lessons</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {recommendedLessons.map((lesson) => (
                <Link key={lesson.lessonId} href={lesson.href}>
                  <GlassCard hover>
                    <p className="font-semibold">{lesson.title}</p>
                    <p className="text-sm text-giga-muted mt-1">{lesson.reason}</p>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Daily Summary */}
          <GlassCard>
            <h2 className="font-display text-lg font-bold mb-3">Daily Summary</h2>
            <div className="space-y-2 text-sm">
              <p>📚 Lessons today: <strong>{gamification.lessons_completed_today}</strong></p>
              <p>⭐ XP earned today: <strong>{gamification.xp_earned_today}</strong></p>
              <p>🎤 Speaking exercises: <strong>{gamification.speaking_exercises_today}</strong></p>
              <p>🏆 Badges: <strong>{gamification.badges.length}</strong></p>
            </div>
          </GlassCard>

          {/* Weekly Goals */}
          <GlassCard>
            <h2 className="font-display text-lg font-bold mb-3">Weekly Goals</h2>
            <div className="space-y-3">
              {WEEKLY_GOALS.map((goal) => {
                const progress =
                  goal.id === "lessons-5" ? gamification.weekly_goals.lessons_completed
                  : goal.id === "xp-500" ? gamification.weekly_goals.xp_earned
                  : goal.id === "streak-5" ? gamification.streak
                  : gamification.weekly_goals.speaking_exercises;
                const pct = Math.min((progress / goal.target) * 100, 100);
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5"><span>{goal.icon}</span> {goal.title}</span>
                      <span className="text-giga-muted">{Math.min(progress, goal.target)}/{goal.target}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-giga-border/60 overflow-hidden">
                      <div className="h-full rounded-full bg-giga-purple transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Learning Calendar */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-giga-purple" />
              <h2 className="font-display text-lg font-bold">Learning Calendar</h2>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(({ date, active }) => (
                <div key={date.toISOString()} className="text-center">
                  <p className="text-[10px] text-giga-muted mb-1">{format(date, "EEE")}</p>
                  <div className={cn(
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                    active ? "bg-giga-purple text-white" : "bg-giga-border/40 text-giga-muted",
                  )}>
                    {format(date, "d")}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Achievement Badges */}
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-bold">Achievement Badges</h2>
              <Link href="/achievements" className="text-sm font-bold text-giga-purple hover:underline">View all</Link>
            </div>
            {gamification.badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {gamification.badges.slice(0, 6).map((badge) => (
                  <span key={badge.id} className="text-2xl" title={badge.name}>{badge.icon}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-giga-muted">Complete lessons to earn your first badge!</p>
            )}
          </GlassCard>

          {/* Leaderboard */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-5 w-5 text-giga-yellow" />
              <h2 className="font-display text-lg font-bold">Leaderboard</h2>
            </div>
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.name}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                    "isUser" in entry && entry.isUser ? "bg-giga-purple/10 font-bold" : "",
                  )}
                >
                  <span className="w-5 text-center text-giga-muted">{i + 1}</span>
                  <span>{entry.avatar}</span>
                  <span className="flex-1 truncate">{entry.name}</span>
                  <span className="text-giga-muted">{entry.xp} XP</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard>
            <h2 className="font-display text-lg font-bold mb-3">Recent Activity</h2>
            {gamification.recent_activity.length > 0 ? (
              <div className="space-y-2">
                {gamification.recent_activity.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-sm">
                    <span>{a.icon}</span>
                    <span className="flex-1 truncate">{a.title}</span>
                    <span className="text-xs text-giga-muted">{format(new Date(a.timestamp), "HH:mm")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-giga-muted">Your learning activity will appear here.</p>
            )}
          </GlassCard>

          <LearningPathCard />
        </div>
      </div>

      {/* Role Dashboard Link */}
      {isAuthenticated && userRole !== "student" && (
        <motion.div {...fadeUp} className="mt-8 text-center">
          <Link href={`/dashboard/${userRole}`}>
            <Button variant="outline">
              Go to {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      )}

      <FloatingAIAssistant />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className={cn("rounded-2xl bg-gradient-to-br p-4 border border-giga-border/40 dark:border-giga-border-dark", color)}>
      <div className="flex items-center gap-2 text-giga-muted text-xs font-semibold uppercase tracking-wide">
        {icon} {label}
      </div>
      <p className="font-display mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function FloatingAIAssistant() {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-3 w-72 rounded-2xl border border-giga-border bg-white p-4 shadow-2xl dark:bg-giga-surface dark:border-giga-border-dark"
          >
            <p className="font-display font-bold">AI Learning Companion</p>
            <p className="text-sm text-giga-muted mt-1">Need help? I can coach reading, generate quizzes, check pronunciation, and more.</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => router.push("/ai-tutor")}>Open Tutor</Button>
              <Button size="sm" variant="outline" onClick={() => setExpanded(false)}>Close</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-giga-purple to-giga-blue text-white shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="AI Learning Companion"
      >
        <Bot className="h-6 w-6" />
      </motion.button>
    </div>
  );
}
