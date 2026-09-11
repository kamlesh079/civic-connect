const DEFAULT_LATITUDE =
  Number(import.meta.env.VITE_MAP_DEFAULT_LATITUDE) || 20.5937;

const DEFAULT_LONGITUDE =
  Number(import.meta.env.VITE_MAP_DEFAULT_LONGITUDE) || 78.9629;

const DEFAULT_ZOOM = Number(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 5;

const TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL ||
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const mapProvider = {
  name: "OpenStreetMap",

  tileUrl: TILE_URL,

  attribution: "&copy; OpenStreetMap contributors",

  defaultCenter: [DEFAULT_LATITUDE, DEFAULT_LONGITUDE],

  defaultZoom: DEFAULT_ZOOM,

  getMapUrl: (latitude, longitude, zoom = 18) => {
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`;
  },
};
