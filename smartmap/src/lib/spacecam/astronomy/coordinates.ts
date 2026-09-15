import * as Astronomy from "astronomy-engine";
import type { EquatorialCoords, HorizontalCoords, ObserverContext } from "./types";

export function toHorizontal(
  equatorial: EquatorialCoords,
  observer: ObserverContext,
): HorizontalCoords {
  const time = Astronomy.MakeTime(observer.date);
  const observerGeo = new Astronomy.Observer(observer.latitude, observer.longitude, observer.elevationM ?? 0);
  const hor = Astronomy.Horizon(time, observerGeo, equatorial.raHours * 15, equatorial.decDeg, "normal");
  return {
    azimuthDeg: hor.azimuth,
    altitudeDeg: hor.altitude,
  };
}

export function horizontalFromRaDec(
  raHours: number,
  decDeg: number,
  observer: ObserverContext,
): HorizontalCoords {
  return toHorizontal({ raHours, decDeg }, observer);
}

export function angularSeparationDeg(
  a: HorizontalCoords,
  b: HorizontalCoords,
): number {
  const az1 = (a.azimuthDeg * Math.PI) / 180;
  const alt1 = (a.altitudeDeg * Math.PI) / 180;
  const az2 = (b.azimuthDeg * Math.PI) / 180;
  const alt2 = (b.altitudeDeg * Math.PI) / 180;

  const cosSep =
    Math.sin(alt1) * Math.sin(alt2) +
    Math.cos(alt1) * Math.cos(alt2) * Math.cos(az1 - az2);
  return (Math.acos(Math.max(-1, Math.min(1, cosSep))) * 180) / Math.PI;
}

/** Convert horizontal coords to unit vector on celestial sphere (for 3D rendering). */
export function horizontalToVector(horizontal: HorizontalCoords): [number, number, number] {
  const az = (horizontal.azimuthDeg * Math.PI) / 180;
  const alt = (horizontal.altitudeDeg * Math.PI) / 180;
  const x = Math.cos(alt) * Math.sin(az);
  const y = Math.sin(alt);
  const z = Math.cos(alt) * Math.cos(az);
  return [x, y, z];
}

/** Convert RA/Dec to unit vector (equatorial frame). */
export function equatorialToVector(raHours: number, decDeg: number): [number, number, number] {
  const ra = (raHours * 15 * Math.PI) / 180;
  const dec = (decDeg * Math.PI) / 180;
  const x = Math.cos(dec) * Math.cos(ra);
  const y = Math.sin(dec);
  const z = -Math.cos(dec) * Math.sin(ra);
  return [x, y, z];
}

export function formatRaDec(raHours: number, decDeg: number): string {
  const raH = Math.floor(raHours);
  const raM = Math.floor((raHours - raH) * 60);
  const raS = Math.round(((raHours - raH) * 60 - raM) * 60);
  const decSign = decDeg >= 0 ? "+" : "-";
  const absDec = Math.abs(decDeg);
  const decD = Math.floor(absDec);
  const decM = Math.floor((absDec - decD) * 60);
  const decS = Math.round(((absDec - decD) * 60 - decM) * 60);
  return `${raH}h ${raM}m ${raS}s / ${decSign}${decD}° ${decM}' ${decS}"`;
}

export function formatAzAlt(azimuthDeg: number, altitudeDeg: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(azimuthDeg / 45) % 8;
  return `${directions[idx]} ${azimuthDeg.toFixed(0)}° · Alt ${altitudeDeg.toFixed(1)}°`;
}

export function isSunAboveHorizon(observer: ObserverContext): boolean {
  const time = Astronomy.MakeTime(observer.date);
  const obs = new Astronomy.Observer(observer.latitude, observer.longitude, observer.elevationM ?? 0);
  const equ = Astronomy.Equator(Astronomy.Body.Sun, time, obs, true, true);
  const hor = Astronomy.Horizon(time, obs, equ.ra * 15, equ.dec, "normal");
  return hor.altitude > -6;
}
