export function createGoogleMapsUrl(lat: number, lng: number): string {
  const latFixed = lat.toFixed(7)
  const lngFixed = lng.toFixed(7)
  return `https://www.google.com/maps?q=${latFixed},${lngFixed}`
}
