import React, { useState, useEffect } from 'react';
import {
  Search,
  Navigation,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  CloudRain,
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  Sparkles
} from 'lucide-react';
import { WeatherTelemetry } from '../types';
import { GLOBAL_CITIES } from '../data/weatherData';
import { handleSearchQuery } from '../utils/weatherApi';

interface NavbarProps {
  currentTelemetry: WeatherTelemetry;
  onSelectCity: (lat: number, lon: number, name: string) => void;
  onSearchString: (query: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onGpsLocate: () => void;
  weatherFxEnabled?: boolean;
  onToggleWeatherFx?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTelemetry,
  onSelectCity,
  onSearchString,
  darkMode,
  onToggleDarkMode,
  audioEnabled,
  onToggleAudio,
  onGpsLocate,
  weatherFxEnabled = false,
  onToggleWeatherFx,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (val.trim().length > 2) {
      setIsSearching(true);
      setShowSearchDropdown(true);
      
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await handleSearchQuery(val);
        setSearchResults(results);
        setIsSearching(false);
      }, 500); // 500ms debounce
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: any) => {
    onSelectCity(result.lat, result.lon, result.name);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleGpsClick = () => {
    setIsGpsLoading(true);
    onGpsLocate();
    setTimeout(() => {
      setIsGpsLoading(false);
    }, 800);
  };

  const scrollCities = (direction: 'left' | 'right') => {
    const container = document.getElementById('cities-scroll-container');
    if (container) {
      const offset = direction === 'left' ? -220 : 220;
      container.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const container = document.getElementById('global-city-search-container');
      if (container && !container.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md transition-colors dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2.5">
        {/* Top brand and action bar */}
        <div className="flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
              <CloudRain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                  WeatherGPT
                </span>
                <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                  AI Synoptic Engine
                </span>
              </div>
            </div>
          </div>

          {/* Search bar & GPS button */}
          <div
            id="global-city-search-container"
            className="relative flex-1 max-w-lg mx-2"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => { if (searchQuery.length > 2) setShowSearchDropdown(true); }}
                placeholder="Search global city, town or village..."
                className="w-full rounded-full border border-zinc-200 bg-zinc-50/80 py-1.5 pl-9 pr-20 text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-400 dark:focus:bg-zinc-900"
              />
              <button
                id="gps-telemetry-btn"
                onClick={handleGpsClick}
                title="Sync with GPS Location Telemetry"
                className="absolute right-1.5 flex items-center gap-1 rounded-full bg-blue-50 hover:bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700 transition-colors dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300"
              >
                <Navigation
                  className={`h-3 w-3 ${isGpsLoading ? 'animate-spin' : ''}`}
                />
                <span>GPS</span>
              </button>
            </div>

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl transition-all dark:border-zinc-700 dark:bg-zinc-900 z-50">
                {isSearching ? (
                  <div className="px-3 py-3 text-center text-xs text-zinc-400">
                    Searching location...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result, idx) => (
                    <button
                      key={`${result.lat}-${result.lon}-${idx}`}
                      onClick={() => handleSelectResult(result)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs sm:text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {result.name}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-center text-xs text-zinc-400">
                    No matching locations found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons (Weather FX, Audio, Theme) */}
          <div className="flex items-center gap-1.5">
            {onToggleWeatherFx && (
              <button
                id="weather-fx-toggle-btn"
                onClick={onToggleWeatherFx}
                title={weatherFxEnabled ? 'Weather Particle FX: ON (Click to disable)' : 'Weather Particle FX: OFF (Click to enable)'}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                  weatherFxEnabled
                    ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-950/70 dark:text-blue-300 shadow-xs'
                    : 'border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <Sparkles className={`h-4 w-4 ${weatherFxEnabled ? 'text-blue-600 dark:text-blue-400 animate-pulse' : ''}`} />
              </button>
            )}
            <button
              id="audio-toggle-btn"
              onClick={onToggleAudio}
              title={audioEnabled ? 'Voice Broadcast On' : 'Voice Broadcast Muted'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              {audioEnabled ? (
                <Volume2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>
            <button
              id="theme-toggle-btn"
              onClick={onToggleDarkMode}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-amber-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-amber-400"
            >
              {darkMode ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Global Cities Quick Switcher Carousel */}
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 shrink-0">
            <span>★ CITIES:</span>
          </div>
          <button
            onClick={() => scrollCities('left')}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-700 dark:hover:bg-zinc-800"
            title="Scroll left"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <div
            id="cities-scroll-container"
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
          >
            {GLOBAL_CITIES.map(city => {
              const isSelected = currentTelemetry.cityName.includes(city.cityName);
              return (
                <button
                  key={city.cityId}
                  onClick={() => onSearchString(city.cityName)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/80 dark:text-blue-300 shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {isSelected && <Check className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />}
                  <span>{city.cityName}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => scrollCities('right')}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-700 dark:hover:bg-zinc-800"
            title="Scroll right"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </header>
  );
};
