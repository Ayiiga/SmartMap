"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { joinClassroomByCode } from "@/lib/classroom";
import { useAuth } from "@/hooks/use-auth";

export function JoinClassroomForm() {
  const { user, isAuthenticated } = useAuth();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <p className="text-sm text-giga-muted">Sign in as a student to join a classroom with your teacher&apos;s code.</p>
    );
  }

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setMessage(null);
    const result = await joinClassroomByCode(user.id, code.trim());
    setLoading(false);
    if (result.error) {
      setMessage(result.error);
    } else if (result.classroom) {
      setMessage(`Joined "${result.classroom.name}" successfully!`);
      setCode("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter classroom join code"
          className="flex-1 rounded-xl border border-giga-border px-3 py-2 text-sm dark:bg-giga-surface min-h-[44px]"
          aria-label="Classroom join code"
        />
        <Button onClick={handleJoin} loading={loading} disabled={!code.trim()}>
          Join
        </Button>
      </div>
      {message && (
        <p className={`text-sm ${message.includes("success") ? "text-giga-green" : "text-giga-orange"}`} role="status">
          {message}
        </p>
      )}
    </div>
  );
}
