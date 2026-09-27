const GOOGLE_MAPS_EMBED_HOST = 'www.google.com';
const GOOGLE_MAPS_EMBED_PATH = '/maps/embed';

function googleMapsApiKey() {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return env?.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? '';
}

export function withGoogleMapsApiKey(url: string) {
  const key = googleMapsApiKey();
  if (!key) return url;

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== GOOGLE_MAPS_EMBED_HOST || parsed.pathname !== GOOGLE_MAPS_EMBED_PATH) {
      return url;
    }
    if (!parsed.searchParams.has('key')) {
      parsed.searchParams.set('key', key);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
