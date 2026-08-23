// Reverse geocoding via OpenStreetMap Nominatim (free, no API key required).
// Usage policy: https://operations.osmfoundation.org/policies/nominatim/ — fine for
// low-volume personal/small-project use; a self-hosted instance is recommended for
// high-traffic production use.
export const reverseGeocode = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`
  const response = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!response.ok) {
    throw new Error('Could not resolve an address from this location')
  }
  const data = await response.json()
  const a = data.address || {}

  return {
    street: [a.house_number, a.road].filter(Boolean).join(' ') || a.suburb || a.neighbourhood || '',
    city: a.city || a.town || a.village || a.suburb || '',
    state: a.state || '',
    zipcode: a.postcode || '',
    country: a.country || '',
  }
}
