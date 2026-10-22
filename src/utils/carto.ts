const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
const key = env?.VITE_CARTO_API_KEY?.trim();

export const CARTO_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' +
  (key ? `?key=${encodeURIComponent(key)}` : '');

export const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
