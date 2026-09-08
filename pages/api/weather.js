export default async function handler(req, res) {
  const { city, lat, lon } = req.query

  try {
    let latitude = lat
    let longitude = lon
    let name = null
    let country = null

    if (!latitude || !longitude) {
      if (!city) return res.status(400).send('Provide city or lat+lon')
      // geocode
      const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
      if (!geo.ok) throw new Error('Geocoding failed')
      const geoJson = await geo.json()
      if (!geoJson.results || geoJson.results.length === 0) return res.status(404).send('Location not found')
      const place = geoJson.results[0]
      latitude = place.latitude
      longitude = place.longitude
      name = place.name
      country = place.country
    }

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&daily=temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`

    const weatherRes = await fetch(apiUrl)
    if (!weatherRes.ok) throw new Error('Weather API failed')
    const weatherJson = await weatherRes.json()

    return res.status(200).json({
      name: name || weatherJson.timezone,
      country: country || null,
      ...weatherJson
    })
  } catch (err) {
    console.error(err)
    return res.status(500).send(err.message || 'Server error')
  }
}
