"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CircleDot, Focus, RefreshCw, SwitchCamera } from "lucide-react";
import { hasConsent } from "@/lib/ai40/privacy";
import { useMapStore } from "@/stores/map-store";
import { ArOverlay } from "./ar-overlay";
import type { ObserverContext } from "@/lib/spacecam/astronomy/types";
import type { SpaceCamLayers } from "@/lib/spacecam/spacecam-store";
import type { OrientationState } from "@/lib/spacecam/spacecam-store";

type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "unavailable";
type CameraCapability = { zoom?: { min?: number; max?: number; step?: number } };

export function CameraView({
  observer,
  layers,
  orientation,
  className,
}: {
  observer: ObserverContext;
  layers: SpaceCamLayers;
  orientation: OrientationState;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [opticalZoom, setOpticalZoom] = useState({ min: 1, max: 1, value: 1 });
  const privacyConsents = useMapStore((s) => s.privacyConsents);
  const setPrivacyConsent = useMapStore((s) => s.setPrivacyConsent);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(
    async (facingMode = cameraFacing) => {
      if (!hasConsent(privacyConsents, "camera")) {
        setPrivacyConsent("camera", true);
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraStatus("unavailable");
        return;
      }
      stopCamera();
      setCameraStatus("requesting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const track = stream.getVideoTracks()[0];
        const capability = track?.getCapabilities?.() as CameraCapability | undefined;
        const range = capability?.zoom;
        setOpticalZoom({
          min: range?.min ?? 1,
          max: range?.max ?? 1,
          value: range?.min ?? 1,
        });
        setCameraStatus("ready");
      } catch (error) {
        setCameraStatus(
          error instanceof DOMException && error.name === "NotAllowedError" ? "denied" : "unavailable",
        );
      }
    },
    [cameraFacing, privacyConsents, setPrivacyConsent, stopCamera],
  );

  useEffect(() => () => stopCamera(), [stopCamera]);

  async function setDeviceZoom(value: number) {
    setOpticalZoom((current) => ({ ...current, value }));
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track?.applyConstraints || opticalZoom.max <= opticalZoom.min) return;
    try {
      await track.applyConstraints({ advanced: [{ zoom: value } as MediaTrackConstraintSet] });
    } catch {
      // Device may reject runtime constraints
    }
  }

  function captureLocally() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `spacecam-${Date.now()}.jpg`;
      link.click();
      URL.revokeObjectURL(link.href);
    }, "image/jpeg", 0.92);
  }

  return (
    <div className={className}>
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted />
      {cameraStatus === "ready" && (
        <>
          <ArOverlay observer={observer} layers={layers} orientation={orientation} className="absolute inset-0 z-10" />
          <div className="absolute right-3 top-20 z-20 flex flex-col gap-2">
            {opticalZoom.max > opticalZoom.min && (
              <div className="rounded-2xl bg-slate-950/70 p-2 backdrop-blur">
                <Focus className="mx-auto h-4 w-4 text-cyan-200" />
                <input
                  type="range"
                  min={opticalZoom.min}
                  max={opticalZoom.max}
                  step="0.1"
                  value={opticalZoom.value}
                  onChange={(e) => void setDeviceZoom(Number(e.target.value))}
                  className="mt-1 w-20 accent-cyan-300"
                  aria-label="Optical zoom"
                />
              </div>
            )}
            <button
              type="button"
              onClick={captureLocally}
              className="grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-slate-950/60 backdrop-blur"
              aria-label="Capture locally"
            >
              <CircleDot className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
      {cameraStatus !== "ready" && (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#061b30] via-[#103d5c] to-[#031018] p-6 text-center">
          <div className="max-w-sm">
            <Camera className="mx-auto h-12 w-12 text-cyan-200" />
            <h2 className="mt-4 font-display text-xl font-bold">Camera View</h2>
            <p className="mt-2 text-sm text-slate-200">
              SpaceCam overlays catalog positions on your camera view. The overlay shows where objects are in the sky — your camera cannot see invisible astronomical objects.
            </p>
            <button
              type="button"
              onClick={() => void startCamera()}
              disabled={cameraStatus === "requesting"}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#0B3A63] disabled:opacity-60"
            >
              <Camera className="h-4 w-4" />
              {cameraStatus === "requesting" ? "Requesting camera…" : "Enable camera"}
            </button>
            {cameraStatus === "denied" && (
              <p className="mt-3 text-xs text-amber-200">Camera permission denied. Use Sky Map or 3D Space modes instead.</p>
            )}
          </div>
        </div>
      )}
      {cameraStatus === "ready" && (
        <div className="absolute bottom-36 left-3 z-20 flex gap-2">
          <button
            type="button"
            onClick={() => {
              const next = cameraFacing === "environment" ? "user" : "environment";
              setCameraFacing(next);
              void startCamera(next);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-bold backdrop-blur"
          >
            <SwitchCamera className="h-3.5 w-3.5" /> Switch
          </button>
          <button
            type="button"
            onClick={() => void startCamera()}
            className="inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-bold backdrop-blur"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Restart
          </button>
        </div>
      )}
    </div>
  );
}
