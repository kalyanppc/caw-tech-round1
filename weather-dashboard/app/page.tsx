"use client"

import type React from "react"
import axios from "axios"

import { useState, useEffect } from "react"
import {
  Search,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Cloud,
  CloudRain,
  Star,
  StarOff,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WeatherData {
  location: {
    name: string
    region?: string
    country?: string
    localtime?: string
  }
  current: {
    temp_c: number
    condition: {
      text: string
      icon?: string
    }
    humidity: number
    wind_kph?: number
    uv?: number
  }
}

interface ForecastData {
  location: {
    name: string
    region?: string
    country?: string
  }
  forecast: {
    forecastday: Array<{
      date: string
      day: {
        maxtemp_c: number
        mintemp_c: number
        avgtemp_c?: number
        condition: {
          text: string
          icon?: string
        }
      }
    }>
  }
}

interface FavoriteCity {
  id?: number
  city: string
  region?: string
  country?: string
  savedAt: string
}

export default function WeatherDashboard() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [favorites, setFavorites] = useState<FavoriteCity[]>([])
  const [searchCity, setSearchCity] = useState("")
  const [selectedCity, setSelectedCity] = useState("Delhi")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock API base URL - replace with your actual API endpoint
  const API_BASE = "http://localhost:3000"

const fetchCurrentWeather = async (city: string) => {
  try {
    setLoading(true)
    setError(null)

    const res = await axios.get(`${API_BASE}/weather/current/${city}`);
    // res.data has { location: {...}, current: {...} }
    setCurrentWeather(res.data as WeatherData)
  } catch (err) {
    setError("Failed to fetch current weather data. Please try again.")
  } finally {
    setLoading(false)
  }
}

const fetchForecast = async (city: string) => {
  try {
    const res = await axios.get(`${API_BASE}/weather/forecast/${city}`)
    // res.data has { location: {...}, forecast: { forecastday: [...] } }
    setForecast(res.data as ForecastData)
  } catch (err) {
    setError("Failed to fetch forecast data. Please try again.")
  }
}

 const fetchFavorites = async () => {
  try {
    const res = await axios.get(`${API_BASE}/weather/favorites`)
    // res.data is an array of FavoriteCity objects
    setFavorites(res.data as FavoriteCity[])
  } catch (err) {
    console.error("Failed to fetch favorites")
  }
}

// POST add a favorite
const addToFavorites = async (city: string) => {
  try {
    const res = await axios.post(
      `${API_BASE}/weather/favorites`,
      { city },
      { headers: { "Content-Type": "application/json" } }
    )
    // res.data is the newly created FavoriteCity
    setFavorites((prev) => [...prev, res.data as FavoriteCity])
  } catch (err) {
    setError("Failed to add city to favorites.")
  }
}
  const removeFromFavorites = (cityToRemove: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.city !== cityToRemove))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchCity.trim()) {
      setSelectedCity(searchCity.trim())
      setSearchCity("")
    }
  }

  const isFavorite = (city: string) => {
    return favorites.some((fav) => fav.city.toLowerCase() === city.toLowerCase())
  }

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase()
    if (lowerCondition.includes("sunny") || lowerCondition.includes("clear"))
      return <Sun className="w-8 h-8 text-yellow-500" />
    if (lowerCondition.includes("cloud")) return <Cloud className="w-8 h-8 text-gray-500" />
    if (lowerCondition.includes("rain")) return <CloudRain className="w-8 h-8 text-blue-500" />
    return <Sun className="w-8 h-8 text-yellow-500" />
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  useEffect(() => {
    fetchCurrentWeather(selectedCity)
    fetchForecast(selectedCity)
  }, [selectedCity])

  useEffect(() => {
    fetchFavorites()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">Weather Dashboard</h1>
          <p className="text-gray-600">Stay updated with current weather conditions and forecasts</p>
        </div>

        {/* Search */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search for a city..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Weather */}
        {currentWeather && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <CardTitle className="text-2xl">{currentWeather.location.name}</CardTitle>
                {currentWeather.location.region && <Badge variant="secondary">{currentWeather.location.region}</Badge>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (isFavorite(currentWeather.location.name)) {
                    removeFromFavorites(currentWeather.location.name)
                  } else {
                    addToFavorites(currentWeather.location.name)
                  }
                }}
              >
                {isFavorite(currentWeather.location.name) ? (
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarOff className="w-4 h-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-4">
                  {getWeatherIcon(currentWeather.current.condition.text)}
                  <div>
                    <p className="text-3xl font-bold">{Math.round(currentWeather.current.temp_c)}°C</p>
                    <p className="text-gray-600">{currentWeather.current.condition.text}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Droplets className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-lg font-semibold">{currentWeather.current.humidity}%</p>
                    <p className="text-sm text-gray-600">Humidity</p>
                  </div>
                </div>

                {currentWeather.current.wind_kph && (
                  <div className="flex items-center gap-3">
                    <Wind className="w-6 h-6 text-gray-500" />
                    <div>
                      <p className="text-lg font-semibold">{currentWeather.current.wind_kph} km/h</p>
                      <p className="text-sm text-gray-600">Wind Speed</p>
                    </div>
                  </div>
                )}

                {currentWeather.current.uv && (
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-6 h-6 text-orange-500" />
                    <div>
                      <p className="text-lg font-semibold">{currentWeather.current.uv}</p>
                      <p className="text-sm text-gray-600">UV Index</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3-Day Forecast */}
          {forecast && (
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>3-Day Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {forecast.forecast.forecastday.map((day, index) => (
                      <div key={day.date} className="text-center p-4 rounded-lg bg-gray-50">
                        <p className="font-semibold text-gray-800">{index === 0 ? "Today" : formatDate(day.date)}</p>
                        <div className="my-3 flex justify-center">{getWeatherIcon(day.day.condition.text)}</div>
                        <p className="text-sm text-gray-600 mb-2">{day.day.condition.text}</p>
                        <div className="space-y-1">
                          <p className="text-lg font-bold">{Math.round(day.day.maxtemp_c)}°</p>
                          <p className="text-sm text-gray-500">{Math.round(day.day.mintemp_c)}°</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Favorites */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Favorite Cities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {favorites.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No favorite cities yet</p>
                ) : (
                  favorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedCity(favorite.city)}
                    >
                      <div>
                        <p className="font-medium">{favorite.city}</p>
                        <p className="text-xs text-gray-500">Added {new Date(favorite.savedAt).toLocaleDateString()}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromFavorites(favorite.city)
                        }}
                      >
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
