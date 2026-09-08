import { useState } from 'react'

export default function Home() {
  const [query, setQuery] = useState('New York')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  async function fetchWeather(q) {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    if (!query) return
    fetchWeather(query)
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }, (err) => {
      setError(err.message)
      setLoading(false)
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Weather Dashboard (Open‑Meteo)</h1>
          <button onClick={detectLocation} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Detect me</button>
        </header>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} className="flex-1 p-2 border rounded" placeholder="City name (e.g. London)" />
          <button className="bg-green-600 text-white px-4 rounded" type="submit">Search</button>
        </form>

        {loading && <p>Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {data && (
          <section className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{data.name} — {data.country}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 border rounded">
                <h3 className="font-medium">Current</h3>
                <p className="text-3xl font-bold">{data.current_weather.temperature}°C</p>
                <p>Wind: {data.current_weather.windspeed} m/s</p>
                <p>Wind dir: {data.current_weather.winddirection}°</p>
                <p>Weather code: {data.current_weather.weathercode}</p>
              </div>

              <div className="p-3 border rounded md:col-span-2">
                <h3 className="font-medium">Daily (next days)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {data.daily.time.map((d, i) => (
                    <div key={d} className="p-2 bg-slate-50 rounded">
                      <div className="font-semibold">{d}</div>
                      <div>Max: {data.daily.temperature_2m_max[i]}°C</div>
                      <div>Min: {data.daily.temperature_2m_min[i]}°C</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium">Hourly (next 24)</h3>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="text-left">
                      <th className="pr-4">Time</th>
                      <th className="pr-4">Temp (°C)</th>
                      <th className="pr-4">RH (%)</th>
                      <th className="pr-4">Wind (m/s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.hourly.time.slice(0,24).map((t, i) => (
                      <tr key={t} className="border-t">
                        <td className="pr-4">{t}</td>
                        <td className="pr-4">{data.hourly.temperature_2m[i]}</td>
                        <td className="pr-4">{data.hourly.relativehumidity_2m[i]}</td>
                        <td className="pr-4">{data.hourly.windspeed_10m[i]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </section>
        )}

        <footer className="mt-6 text-sm text-slate-600">
          Data from Open‑Meteo (no API key required). This demo is scaffolded into the big-boy-games repo.
        </footer>
      </div>
    </div>
  )
}
