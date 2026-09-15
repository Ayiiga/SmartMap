"use client";

export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export async function subscribeToPushNotifications(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

  const permitted = await requestPushPermission();
  if (!permitted) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    if (!existing) {
      await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: undefined,
      });
    }
    return true;
  } catch {
    return false;
  }
}

export function showNewsNotification(title: string, body: string) {
  if (typeof window === "undefined" || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/icons/icon-192.png", tag: "gigatrend-notification" });
  } catch {
    // Notifications blocked
  }
}

/** @deprecated Use showNewsNotification */
export const showLearningReminder = showNewsNotification;

export function scheduleBreakingNewsReminder(hour = 8) {
  if (typeof window === "undefined") return;
  const key = "smartmap-daily-briefing";
  const last = localStorage.getItem(key);
  const today = new Date().toISOString().split("T")[0];
  if (last === today) return;

  const now = new Date();
  if (now.getHours() >= hour) {
    showNewsNotification(
      "Your Smart Map safety briefing is ready",
      "Review community alerts, weather risks, and saved safe places before you travel.",
    );
    localStorage.setItem(key, today);
  }
}

/** @deprecated Use scheduleBreakingNewsReminder */
export const scheduleDailyReminder = scheduleBreakingNewsReminder;
