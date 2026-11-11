export function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function mapsRouteUrl(destination: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

/** Zoekterm voor een plek: adres/naam + "Berlin" als die er nog niet in staat. */
export function withBerlin(place: string) {
  return /berlin/i.test(place) ? place : `${place}, Berlin`
}
