import type { StyleSpecification } from "maplibre-gl";

const ESRI_IMAGERY =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

/** Carto Voyager labels-only tiles for hybrid satellite view. */
const CARTO_LABELS =
  "https://basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}@2x.png";

/** Lightweight satellite raster style for SpaceCam (no native SDK). */
export const SATELLITE_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: [ESRI_IMAGERY],
      tileSize: 256,
      attribution: "Esri World Imagery",
    },
  },
  layers: [
    {
      id: "satellite-layer",
      type: "raster",
      source: "satellite",
    },
  ],
};

/** Hybrid satellite with street labels — Google Maps–style satellite view. */
export const SATELLITE_HYBRID_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: [ESRI_IMAGERY],
      tileSize: 256,
      attribution: "Esri World Imagery",
    },
    labels: {
      type: "raster",
      tiles: [CARTO_LABELS],
      tileSize: 256,
      attribution: "© CARTO © OpenStreetMap",
    },
  },
  layers: [
    {
      id: "satellite-layer",
      type: "raster",
      source: "satellite",
    },
    {
      id: "satellite-labels",
      type: "raster",
      source: "labels",
      paint: {
        "raster-opacity": 0.88,
      },
    },
  ],
};
