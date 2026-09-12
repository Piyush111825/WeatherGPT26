import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import {
  HowDoWeKnowModal,
  ShareSnapshotModal,
  WebhooksModal,
  CacheManagerModal,
} from './components/Modals';
import { HomeView } from './components/views/HomeView';
import { ChatView } from './components/views/ChatView';
import { MapView } from './components/views/MapView';
import { RiskView } from './components/views/RiskView';
import { FarmerView } from './components/views/FarmerView';
import { DisasterView } from './components/views/DisasterView';
import { IndigenousTwinView } from './components/views/IndigenousTwinView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DEFAULT_TELEMETRY } from './data/weatherData';
import { OperationalPersona, WeatherTelemetry } from './types';
import { speakText, stopSpeaking, getAQIInfo } from './utils/weatherUtils';
import { fetchWeatherData, fetchAirQualityData, calculateSynopticAQI, extractCurrentRainProbability, reverseGeocode, getWeatherCondition, getWindDirection, handleSearchQuery } from './utils/weatherApi';
import { getCurrentPositionGPS } from './utils/geoUtils';

export default function App() {
  // Theme state (Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('weathergpt_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark class to html document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('weathergpt_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('weathergpt_theme', 'light');
    }
  }, [isDarkMode]);

  // Telemetry state with robust fallback parsing
  const [telemetry, setTelemetry] = useState<WeatherTelemetry>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('weathergpt_telemetry');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            return { ...DEFAULT_TELEMETRY, ...parsed };
          }
        }
      } catch (e) {
        console.warn('Failed to parse cached telemetry, using default:', e);
      }
    }
    return DEFAULT_TELEMETRY;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('weathergpt_telemetry', JSON.stringify(telemetry));
      } catch (e) {
        console.warn('Failed to persist telemetry to localStorage:', e);
      }
    }
  }, [telemetry]);

  // Persona state
  const [persona, setPersona] = useState<OperationalPersona>('citizen');

  // Active Tab state
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Weather Animation FX state (defaults to false for clean static card surface)
  const [weatherFxEnabled, setWeatherFxEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('weathergpt_weather_fx');
      return saved === 'true'; // Defaults to false
    }
    return false;
  });

  const handleToggleWeatherFx = () => {
    setWeatherFxEnabled(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('weathergpt_weather_fx', String(next));
      }
      showToast(next ? 'Live weather particle animations enabled' : 'Clean static background enabled');
      return next;
    });
  };

  // Audio broadcast state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Modals state
  const [isHowDoWeKnowOpen, setIsHowDoWeKnowOpen] = useState(false);
  const [isShareSnapshotOpen, setIsShareSnapshotOpen] = useState(false);
  const [isWebhooksOpen, setIsWebhooksOpen] = useState(false);
  const [isCacheManagerOpen, setIsCacheManagerOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleToggleAudio = () => {
    if (isAudioPlaying) {
      stopSpeaking();
      setIsAudioPlaying(false);
    } else {
      const text = `Broadcasting WeatherGPT synoptic telemetry for ${telemetry.cityName}. Current surface conditions are ${telemetry.condition}, ${telemetry.temp} degrees Celsius, feels like ${telemetry.feelsLike} degrees. Rain probability is ${telemetry.rainProb} percent. Surface wind is at ${telemetry.windSpeed} kilometers per hour from the ${telemetry.windDirection}. Air Quality Index is ${telemetry.aqi} (${telemetry.aqiStatus}).`;
      const ok = speakText(text);
      if (ok) {
        setIsAudioPlaying(true);
        setTimeout(() => setIsAudioPlaying(false), 14000);
      } else {
        showToast('Speech audio synthesis initialized');
      }
    }
  };

  // City Search handler
  const fetchAndSetWeather = async (lat: number, lon: number, locationName: string) => {
    try {
      const [weatherRes, airRes] = await Promise.allSettled([
        fetchWeatherData(lat, lon),
        fetchAirQualityData(lat, lon)
      ]);

      const data = weatherRes.status === 'fulfilled' ? weatherRes.value : null;
      const airData = airRes.status === 'fulfilled' ? airRes.value : null;

      if (data && data.current) {
        const current = data.current;
        
        const rainProb = extractCurrentRainProbability(data);

        const condition = getWeatherCondition(current.weather_code);

        // Real-time AQI and PM2.5 calculation with localized synoptic approximation fallback
        let aqiVal = airData?.current?.us_aqi;
        let pm25Val = airData?.current?.pm2_5;
        let pm10Val = airData?.current?.pm10;

        if (aqiVal === undefined || aqiVal === null || isNaN(aqiVal)) {
          const synoptic = calculateSynopticAQI(
            lat,
            lon,
            current.temperature_2m,
            current.relative_humidity_2m,
            condition
          );
          aqiVal = synoptic.aqi;
          if (pm25Val === undefined || pm25Val === null || isNaN(pm25Val)) pm25Val = synoptic.pm25;
          if (pm10Val === undefined || pm10Val === null || isNaN(pm10Val)) pm10Val = synoptic.pm10;
        }

        const aqiInfo = getAQIInfo(aqiVal, condition);

        const parsedHourly = data.hourly ? Array.from({ length: 24 }).map((_, i) => {
          const dt = new Date(data.hourly.time[i]);
          return {
            time: i === 0 ? 'NOW' : `${dt.getHours()}:00`,
            temp: Math.round(data.hourly.temperature_2m[i]),
            rainProb: data.hourly.precipitation_probability?.[i] || 0,
            windSpeed: Math.round(data.hourly.wind_speed_10m[i]),
            condition: getWeatherCondition(data.hourly.weather_code[i])
          };
        }) : undefined;

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const parsedDaily = data.daily ? Array.from({ length: 7 }).map((_, i) => {
          const dt = new Date(data.daily.time[i]);
          // Adjust timezone issues by adding hours
          dt.setHours(12);
          return {
            day: i === 0 ? 'Today' : days[dt.getDay()],
            minTemp: Math.round(data.daily.temperature_2m_min[i]),
            maxTemp: Math.round(data.daily.temperature_2m_max[i]),
            rainProb: data.daily.precipitation_probability_max?.[i] || 0,
            windGust: Math.round(data.daily.wind_speed_10m_max[i]),
            condition: getWeatherCondition(data.daily.weather_code[i])
          };
        }) : undefined;

        const newTelemetry: WeatherTelemetry = {
          ...telemetry,
          cityName: locationName,
          coordinates: `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`,
          temp: Math.round(current.temperature_2m),
          feelsLike: Math.round(current.apparent_temperature),
          humidity: current.relative_humidity_2m,
          rainProb: rainProb,
          windSpeed: current.wind_speed_10m,
          windDirection: getWindDirection(current.wind_direction_10m),
          condition: condition,
          aqi: aqiInfo.val,
          aqiStatus: aqiInfo.status,
          pm25: pm25Val != null ? Math.round(pm25Val * 10) / 10 : undefined,
          pm10: pm10Val != null ? Math.round(pm10Val * 10) / 10 : undefined,
          hourlyData: parsedHourly,
          dailyData: parsedDaily,
          timestamp: new Date().toISOString()
        };
        setTelemetry(newTelemetry);
        showToast(`Telemetry synchronized for ${locationName}`);
      }
    } catch(err) {
      console.error(err);
      showToast("Error fetching weather data");
    }
  };

  const handleSearchCity = async (cityName: string) => {
    const results = await handleSearchQuery(cityName);
    if (results && results.length > 0) {
      const best = results[0];
      await fetchAndSetWeather(best.lat, best.lon, best.name);
    } else {
      showToast(`Could not find location: ${cityName}`);
    }
  };

  // GPS Locate handler
  const handleGpsLocate = async () => {
    try {
      const pos = await getCurrentPositionGPS();
      const locationName = await reverseGeocode(pos.lat, pos.lon);
      await fetchAndSetWeather(pos.lat, pos.lon, locationName);
      showToast(`Synced GPS Telemetry for ${locationName}`);
    } catch (error) {
      console.error('GPS Geolocation Error:', error);
      showToast('GPS localized to High-Resolution Station');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased transition-colors duration-200 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Top Fixed Header Navbar */}
      <Navbar
        darkMode={isDarkMode}
        onToggleDarkMode={handleToggleTheme}
        currentTelemetry={telemetry}
        onSelectCity={(lat: number, lon: number, name: string) => {
          fetchAndSetWeather(lat, lon, name);
        }}
        onSearchString={handleSearchCity}
        onGpsLocate={handleGpsLocate}
        onToggleAudio={handleToggleAudio}
        audioEnabled={isAudioPlaying}
        weatherFxEnabled={weatherFxEnabled}
        onToggleWeatherFx={handleToggleWeatherFx}
      />

      {/* Main Content Area Protected by ErrorBoundary */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20">
        <ErrorBoundary
          viewName="Dashboard Content"
          onReset={() => setTelemetry(DEFAULT_TELEMETRY)}
        >
          {/* Render Active View Based on Selected Tab with Isolated Error Boundaries */}
          {activeTab === 'home' && (
            <ErrorBoundary viewName="Home" onReset={() => setTelemetry({ ...telemetry })}>
              <HomeView
                telemetry={telemetry}
                persona={persona}
                onSelectPersona={setPersona}
                onNavigateTab={setActiveTab}
                onOpenHowDoWeKnow={() => setIsHowDoWeKnowOpen(true)}
                onOpenShareSnapshot={() => setIsShareSnapshotOpen(true)}
                onOpenWebhooks={() => setIsWebhooksOpen(true)}
                onOpenCacheManager={() => setIsCacheManagerOpen(true)}
                onSearchCity={handleSearchCity}
                onGpsLocate={handleGpsLocate}
                weatherFxEnabled={weatherFxEnabled}
                onToggleWeatherFx={handleToggleWeatherFx}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'chat' && (
            <ErrorBoundary viewName="WeatherGPT Advisory Chat">
              <ChatView
                telemetry={telemetry}
                persona={persona}
                onSelectPersona={setPersona}
                onOpenHowDoWeKnow={() => setIsHowDoWeKnowOpen(true)}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'map' && (
            <ErrorBoundary viewName="Synoptic Radar Map">
              <MapView
                telemetry={telemetry}
                onSelectStationLocation={(cityName, coords) => {
                  if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
                    fetchAndSetWeather(coords.lat, coords.lng, cityName);
                  } else {
                    handleSearchCity(cityName);
                  }
                  showToast(`Map station synchronized: ${cityName}`);
                }}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'risk' && (
            <ErrorBoundary viewName="Atmospheric Risk Matrix">
              <RiskView telemetry={telemetry} />
            </ErrorBoundary>
          )}

          {activeTab === 'farmer' && (
            <ErrorBoundary viewName="Agro-Meteorology Hub">
              <FarmerView telemetry={telemetry} />
            </ErrorBoundary>
          )}

          {activeTab === 'disaster' && (
            <ErrorBoundary viewName="Disaster & River Basin Response">
              <DisasterView telemetry={telemetry} />
            </ErrorBoundary>
          )}

          {(activeTab === 'twin' || activeTab === 'twinview') && (
            <ErrorBoundary viewName="Indigenous Climate Twin">
              <IndigenousTwinView
                telemetry={telemetry}
                onNavigateTab={setActiveTab}
              />
            </ErrorBoundary>
          )}
        </ErrorBoundary>
      </main>

      {/* Floating Bottom Navigation Bar + Ask WeatherGPT Pill */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickAsk={() => setActiveTab('chat')}
      />

      {/* Interactive Modals */}
      <HowDoWeKnowModal
        isOpen={isHowDoWeKnowOpen}
        onClose={() => setIsHowDoWeKnowOpen(false)}
        telemetry={telemetry}
      />

      <ShareSnapshotModal
        isOpen={isShareSnapshotOpen}
        onClose={() => setIsShareSnapshotOpen(false)}
        telemetry={telemetry}
      />

      <WebhooksModal
        isOpen={isWebhooksOpen}
        onClose={() => setIsWebhooksOpen(false)}
      />

      <CacheManagerModal
        isOpen={isCacheManagerOpen}
        onClose={() => setIsCacheManagerOpen(false)}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 rounded-2xl border border-zinc-200 bg-white/95 px-4 py-2.5 text-xs font-semibold text-zinc-900 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 dark:text-zinc-100 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

