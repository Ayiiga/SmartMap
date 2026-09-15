"use client";

import { useCallback, useEffect } from "react";
import { useSpaceCamStore } from "@/lib/spacecam/spacecam-store";

export function useDeviceOrientation() {
  const setOrientation = useSpaceCamStore((s) => s.setOrientation);
  const orientation = useSpaceCamStore((s) => s.orientation);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined") return false;

    const DeviceOrientationEventCtor = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    try {
      if (typeof DeviceOrientationEventCtor.requestPermission === "function") {
        const result = await DeviceOrientationEventCtor.requestPermission();
        if (result !== "granted") {
          setOrientation({ permission: "denied", available: false, accuracy: "unavailable" });
          return false;
        }
      }
      setOrientation({ permission: "granted", available: true });
      return true;
    } catch {
      setOrientation({ permission: "denied", available: false, accuracy: "unavailable" });
      return false;
    }
  }, [setOrientation]);

  useEffect(() => {
    if (orientation.permission !== "granted") return;

    function handleOrientation(event: DeviceOrientationEvent) {
      const alpha = event.alpha ?? 0;
      const beta = event.beta ?? 90;
      const gamma = event.gamma ?? 0;
      const webkitEvent = event as DeviceOrientationEvent & { webkitCompassAccuracy?: number };
      const accuracy = webkitEvent.webkitCompassAccuracy;
      let accuracyLevel: "high" | "medium" | "low" = "medium";
      if (accuracy != null) {
        if (accuracy < 15) accuracyLevel = "high";
        else if (accuracy > 45) accuracyLevel = "low";
      }

      setOrientation({
        alpha,
        beta,
        gamma,
        accuracy: accuracyLevel,
        calibrated: accuracyLevel !== "low",
        available: true,
      });
    }

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [orientation.permission, setOrientation]);

  return { orientation, requestPermission };
}
