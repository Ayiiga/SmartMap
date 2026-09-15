import type { Map as MapLibreMapType } from "maplibre-gl";
import { getRegisteredMap, registerMapInstance } from "@/lib/map/map-instance-registry";

export function registerMapForScreenshot(map: MapLibreMapType | null): void {
  registerMapInstance(map);
}

export function captureMapScreenshot(type = "image/png", quality = 0.92): string | null {
  const map = getRegisteredMap();
  if (!map) return null;
  try {
    map.triggerRepaint();
    const canvas = map.getCanvas();
    return canvas.toDataURL(type, quality);
  } catch {
    return null;
  }
}

export async function shareRouteMapScreenshot(routeLabel: string): Promise<boolean> {
  const dataUrl = captureMapScreenshot();
  if (!dataUrl) return false;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "smart-map-route.png", { type: "image/png" });
      await navigator.share({
        title: "Smart Map route",
        text: routeLabel,
        files: [file],
      });
      return true;
    } catch {
      // fall through to download
    }
  }

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "smart-map-route.png";
  link.click();
  return true;
}
