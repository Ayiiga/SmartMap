import * as Astronomy from "astronomy-engine";
import type { AstronomicalObject, EquatorialCoords, ObserverContext } from "./types";
import { horizontalFromRaDec } from "./coordinates";

const BODY_MAP: Record<string, Astronomy.Body> = {
  sun: Astronomy.Body.Sun,
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  moon: Astronomy.Body.Moon,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus,
  neptune: Astronomy.Body.Neptune,
};

export interface EphemerisPosition {
  objectId: string;
  equatorial: EquatorialCoords;
  raHours: number;
  decDeg: number;
  distanceAu?: number;
  magnitude?: number;
  isApproximate: boolean;
}

export function getPlanetPosition(
  objectId: string,
  date: Date,
): EphemerisPosition | null {
  const body = BODY_MAP[objectId];
  if (!body) return null;

  const time = Astronomy.MakeTime(date);
  let raHours: number;
  let decDeg: number;
  let distanceAu: number | undefined;
  let magnitude: number | undefined;

  if (body === Astronomy.Body.Sun) {
    const equ = Astronomy.Equator(Astronomy.Body.Sun, time, new Astronomy.Observer(0, 0, 0), true, true);
    raHours = equ.ra;
    decDeg = equ.dec;
    distanceAu = 1;
    magnitude = -26.7;
  } else if (body === Astronomy.Body.Moon) {
    const equ = Astronomy.Equator(Astronomy.Body.Moon, time, new Astronomy.Observer(0, 0, 0), true, true);
    raHours = equ.ra;
    decDeg = equ.dec;
    distanceAu = equ.dist;
    magnitude = -12.6;
  } else {
    const equ = Astronomy.Equator(body, time, new Astronomy.Observer(0, 0, 0), true, true);
    raHours = equ.ra;
    decDeg = equ.dec;
    distanceAu = equ.dist;
    const illum = Astronomy.Illumination(body, time);
    magnitude = illum.mag;
  }

  return {
    objectId,
    equatorial: { raHours, decDeg },
    raHours,
    decDeg,
    distanceAu,
    magnitude,
    isApproximate: false,
  };
}

export function getAllPlanetPositions(date: Date): EphemerisPosition[] {
  return Object.keys(BODY_MAP)
    .map((id) => getPlanetPosition(id, date))
    .filter((p): p is EphemerisPosition => p !== null);
}

export function enrichObjectWithPosition(
  object: AstronomicalObject,
  observer: ObserverContext,
): AstronomicalObject & { position?: EphemerisPosition; horizontal?: ReturnType<typeof horizontalFromRaDec> } {
  if (object.raHours != null && object.decDeg != null) {
    const horizontal = horizontalFromRaDec(object.raHours, object.decDeg, observer);
    return {
      ...object,
      horizontal,
      position: {
        objectId: object.id,
        equatorial: { raHours: object.raHours, decDeg: object.decDeg },
        raHours: object.raHours,
        decDeg: object.decDeg,
        isApproximate: false,
      },
    };
  }

  if (object.requiresLiveData) {
    const pos = getPlanetPosition(object.id, observer.date);
    if (pos) {
      const horizontal = horizontalFromRaDec(pos.raHours, pos.decDeg, observer);
      return { ...object, position: pos, horizontal, magnitude: pos.magnitude ?? object.magnitude };
    }
  }

  return object;
}

/** Solar system heliocentric distances in AU for 3D visualization (approximate mean distances). */
export const PLANET_ORBIT_AU: Record<string, number> = {
  mercury: 0.39,
  venus: 0.72,
  earth: 1.0,
  mars: 1.52,
  jupiter: 5.2,
  saturn: 9.5,
  uranus: 19.2,
  neptune: 30.1,
};

export function getHeliocentricVector(objectId: string, date: Date): [number, number, number] | null {
  const body = BODY_MAP[objectId];
  if (!body || body === Astronomy.Body.Sun || body === Astronomy.Body.Moon) return null;

  const time = Astronomy.MakeTime(date);
  const vec = Astronomy.HelioVector(body, time);
  return [vec.x, vec.y, vec.z];
}

export function getMoonGeocentricVector(date: Date): [number, number, number] {
  const time = Astronomy.MakeTime(date);
  const vec = Astronomy.GeoVector(Astronomy.Body.Moon, time, false);
  return [vec.x, vec.y, vec.z];
}
