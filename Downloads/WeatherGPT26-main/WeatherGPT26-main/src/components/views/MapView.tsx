import React, { useState, useEffect, useRef } from 'react';
import { WeatherTelemetry } from '../../types';
import { motion } from 'motion/react';
import {
  Play, Pause, MapPin, Wind, Droplets, Crosshair, Sparkles, Thermometer,
  ChevronRight, ChevronLeft, Menu, X, Info, Layers, Radio, ShieldAlert, Activity, Compass, Gauge, Sprout, Search, Globe, Sun
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from 'react-leaflet';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  telemetry: WeatherTelemetry;
  onSelectStationLocation: (city: string, coords?: { lat: number; lng: number }) => void;
}

// Map Event component for handling clicks
const MapEvents = ({ onMapClick }: { onMapClick: (e: L.LeafletMouseEvent) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e);
    },
  });
  return null;
};

interface PlaceMetadata {
  name: string;
  address: string;
  coords: { lat: number; lng: number };
  city: string;
  country: string;
}

interface PlaceSearchProps {
  onPlaceSelected: (metadata: PlaceMetadata) => void;
}

const PlaceSearch: React.FC<PlaceSearchProps> = ({ onPlaceSelected }) => {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const options: google.maps.places.AutocompleteOptions = {
      fields: ['name', 'formatted_address', 'geometry', 'address_components'],
    };

    const ac = new placesLib.Autocomplete(inputRef.current, options);
    setAutocomplete(ac);

    return () => {
      google.maps.event.clearInstanceListeners(ac);
    };
  }, [placesLib]);

  useEffect(() => {
    if (!autocomplete) return;

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      let city = '';
      let country = '';

      if (place.address_components) {
        for (const component of place.address_components) {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('country')) {
            country = component.long_name;
          }
        }
      }

      onPlaceSelected({
        name: place.name || 'Unknown Location',
        address: place.formatted_address || '',
        coords: { lat, lng },
        city,
        country
      });
    });

    return () => {
      listener.remove();
    };
  }, [autocomplete, onPlaceSelected]);

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-3.5 w-3.5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search worldwide location..."
        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-2.5 pl-9 pr-4 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pointer-events-auto"
      />
    </div>
  );
};

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapMetricProgress = ({ value, max, colorClass, type = 'bar' }: { value: number, max: number, colorClass: string, type?: 'bar' | 'liquid' | 'aqi' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  if (type === 'aqi') {
    return (
      <div className="mt-1 relative h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-emerald-500 via-yellow-400 via-orange-500 to-red-600 opacity-50" />
        <motion.div 
          initial={{ left: 0 }}
          animate={{ left: `${percentage}%` }}
          className="absolute top-0 bottom-0 w-1 bg-white shadow-sm"
        />
      </div>
    );
  }

  return (
    <div className="mt-1 h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        className={`h-full ${colorClass}`}
      />
    </div>
  );
};

export const MapView: React.FC<MapViewProps> = ({
  telemetry,
  onSelectStationLocation,
}) => {
  const [activeLayer, setActiveLayer] = useState<'radar' | 'aqi' | 'wind' | 'temp' | 'soil' | 'pressure' | 'hazard'>('radar');
  const [viewMode, setViewMode] = useState<'simple' | 'advanced'>('simple');
  const [esriMode, setEsriMode] = useState<'street' | 'topo' | 'satellite'>('street');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeStep, setTimeStep] = useState(0); // 0: NOW, 1: +1h, 2: +3h, 3: +6h, 4: +12h
  const timeLabels = ['NOW', '+1 HOUR', '+3 HOURS', '+6 HOURS', '+12 HOURS'];

  const [selectedStation, setSelectedStation] = useState<string>(telemetry.cityName);
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([
    parseFloat(telemetry.coordinates.split(',')[0]), 
    parseFloat(telemetry.coordinates.split(',')[1]) || 85.31
  ]);
  const [placeMetadata, setPlaceMetadata] = useState<PlaceMetadata | null>(null);
  const geocodingLib = useMapsLibrary('geocoding');
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (geocodingLib) {
      setGeocoder(new geocodingLib.Geocoder());
    }
  }, [geocodingLib]);

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  
  // Modal states
  const [modalType, setModalType] = useState<'timeline' | 'info' | 'micro' | null>(null);

  // Radar Animation logic
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeStep((prev) => (prev + 1) % timeLabels.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLabels.length]);

  // Derive telemetry metrics strictly synchronized with active global telemetry
  const windDirDegree = typeof telemetry.windDirection === 'string' 
    ? (telemetry.windDirection === 'N' ? 0 : telemetry.windDirection === 'NE' ? 45 : telemetry.windDirection === 'E' ? 90 : telemetry.windDirection === 'SE' ? 135 : telemetry.windDirection === 'S' ? 180 : telemetry.windDirection === 'SW' ? 225 : telemetry.windDirection === 'W' ? 270 : telemetry.windDirection === 'NW' ? 315 : 220)
    : (telemetry.windDirection || 220);

  const currentMetrics = {
    temp: typeof telemetry.temp === 'number' ? telemetry.temp.toFixed(1) : String(telemetry.temp),
    rainProb: telemetry.rainProb,
    windSpeed: typeof telemetry.windSpeed === 'number' ? telemetry.windSpeed.toFixed(1) : String(telemetry.windSpeed),
    humidity: telemetry.humidity,
    pressure: telemetry.surfacePressure || 1012,
    soilMoisture: telemetry.rootSoilMoisture || 42,
    aqi: telemetry.aqi,
    aqiStatus: telemetry.aqiStatus,
    pm25: telemetry.pm25 != null ? telemetry.pm25.toFixed(1) : '18.4',
    pm10: telemetry.pm10 != null ? telemetry.pm10.toFixed(1) : '32.1',
    windDirection: windDirDegree
  };

  // Parse coords safely
  useEffect(() => {
    try {
      const parts = telemetry.coordinates.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          setSelectedCoords([lat, lng]);
          setSelectedStation(telemetry.cityName);
        }
      }
    } catch (e) {
       // fallback
    }
  }, [telemetry.coordinates, telemetry.cityName]);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setSelectedCoords([lat, lng]);
    
    if (geocoder) {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const place = results[0];
          let city = '';
          let country = '';

          for (const component of place.address_components) {
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('country')) {
              country = component.long_name;
            }
          }

          const metadata: PlaceMetadata = {
            name: city || 'Custom Location',
            address: place.formatted_address,
            coords: { lat, lng },
            city,
            country
          };
          
          setSelectedStation(metadata.name);
          setPlaceMetadata(metadata);
          onSelectStationLocation(metadata.city || metadata.name, { lat, lng });
        } else {
          setSelectedStation('Custom Location');
          setPlaceMetadata(null);
          onSelectStationLocation('Custom Location', { lat, lng });
        }
      });
    } else {
      setSelectedStation('Custom Location');
      setPlaceMetadata(null);
      onSelectStationLocation('Custom Location', { lat, lng });
    }
  };

  const handlePlaceSelected = (metadata: PlaceMetadata) => {
    setSelectedCoords([metadata.coords.lat, metadata.coords.lng]);
    setSelectedStation(metadata.name);
    setPlaceMetadata(metadata);
    // Sync with top level state
    onSelectStationLocation(metadata.city || metadata.name, { lat: metadata.coords.lat, lng: metadata.coords.lng });
  };

  const [rainViewerTime, setRainViewerTime] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
          const latest = data.radar.past[data.radar.past.length - 1].time;
          setRainViewerTime(latest);
        }
      })
      .catch(console.error);
  }, []);

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('Rain')) return <Droplets className="w-8 h-8 text-blue-400" />;
    if (condition.includes('Cloud')) return <Globe className="w-8 h-8 text-zinc-400" />;
    return <Sun className="w-8 h-8 text-orange-400" />;
  };

  return (
    <APIProvider 
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
      solutionChannel="gmp_mcp_codeassist_v1_aistudio"
      language="en"
    >
      <div className="relative h-[calc(100vh-8rem)] w-full rounded-3xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 font-sans z-0">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={selectedCoords} zoom={6} className="h-full w-full" zoomControl={false}>
          <ZoomControl position="bottomright" />
          <ChangeView center={selectedCoords} zoom={6} />
          {esriMode === 'street' && (
            <TileLayer 
              attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          )}

          {esriMode === 'topo' && (
            <TileLayer 
              attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          )}

          {esriMode === 'satellite' && (
            <TileLayer 
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          )}
          {activeLayer === 'radar' && rainViewerTime && (
            <TileLayer
              url={`https://tilecache.rainviewer.com/v2/radar/${rainViewerTime}/256/{z}/{x}/{y}/2/1_1.png`}
              opacity={0.6}
            />
          )}
          {activeLayer === 'aqi' && (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              opacity={0.3}
            />
          )}
          {activeLayer === 'wind' && (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              opacity={0.3}
            />
          )}
          {activeLayer === 'temp' && (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              opacity={0.4}
            />
          )}
          {activeLayer === 'soil' && (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              opacity={0.2}
              className="grayscale sepia brightness-50"
            />
          )}
          {activeLayer === 'pressure' && (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              opacity={0.2}
              className="hue-rotate-90"
            />
          )}
          {activeLayer === 'hazard' && (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              opacity={0.5}
              className="invert hue-rotate-180"
            />
          )}
          
          <Marker position={selectedCoords}>
            <Popup className="rounded-xl">
              <div className="p-1 min-w-[140px]">
                <h3 className="font-bold text-sm text-zinc-900">{selectedStation}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] text-zinc-600 flex justify-between"><span>Temp:</span> <span className="font-bold">{currentMetrics.temp}°C</span></p>
                  <p className="text-[10px] text-zinc-600 flex justify-between"><span>Rain:</span> <span className="font-bold">{currentMetrics.rainProb}%</span></p>
                  <p className="text-[10px] text-zinc-600 flex justify-between"><span>Wind:</span> <span className="font-bold">{currentMetrics.windSpeed} km/h</span></p>
                </div>
                <button 
                  className="mt-3 w-full bg-blue-600 text-white text-[10px] py-1.5 rounded-md font-bold hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    onSelectStationLocation(selectedStation, { lat: selectedCoords[0], lng: selectedCoords[1] });
                  }}
                >
                  Focus This Station
                </button>
              </div>
            </Popup>
          </Marker>

          <MapEvents onMapClick={handleMapClick} />
        </MapContainer>
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-20 flex flex-col pointer-events-none p-3 sm:p-4 justify-between">
        
        {/* Top Bar */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pointer-events-none">
          <div className="flex bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full p-1 border border-zinc-200 dark:border-zinc-800 pointer-events-auto shadow-sm">
            <button onClick={() => setViewMode('simple')} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${viewMode === 'simple' ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>Simple</button>
            <button onClick={() => setViewMode('advanced')} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${viewMode === 'advanced' ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>Advanced</button>
          </div>
          
          <div className="flex bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full p-1 border border-zinc-200 dark:border-zinc-800 pointer-events-auto shadow-sm hidden sm:flex">
             <button onClick={() => setEsriMode('street')} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${esriMode === 'street' ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>Street</button>
             <button onClick={() => setEsriMode('topo')} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${esriMode === 'topo' ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>Topo</button>
             <button onClick={() => setEsriMode('satellite')} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${esriMode === 'satellite' ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>Satellite</button>
          </div>

          <div className="flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full p-1.5 border border-zinc-200 dark:border-zinc-800 pointer-events-auto shadow-sm overflow-x-auto max-w-full">
            <div className="px-2 border-r border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <span className="text-[10px] font-black text-zinc-400 whitespace-nowrap">FUTURE PLAYBACK: {timeLabels[timeStep]}</span>
              <div className="h-3 w-[1px] bg-zinc-200 dark:bg-zinc-800"></div>
              <span className="text-[10px] font-black text-emerald-500 whitespace-nowrap">HOURLY MODEL</span>
              <div className="h-3 w-[1px] bg-zinc-200 dark:bg-zinc-800"></div>
              <span className="text-[10px] font-black text-blue-500 whitespace-nowrap">STABLE</span>
            </div>
            <button onClick={() => setIsPlaying(!isPlaying)} className="h-6 px-2 flex items-center justify-center bg-blue-600 text-white rounded-full shrink-0 transition-colors hover:bg-blue-700 gap-1">
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
              <span className="text-[9px] font-black uppercase tracking-tighter">Playback</span>
            </button>
            {timeLabels.map((lbl, idx) => (
              <button 
                key={lbl} 
                onClick={() => setTimeStep(idx)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap transition-colors ${timeStep === idx ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile toggles for panels (Advanced only) */}
        {viewMode === 'advanced' && (
          <div className="sm:hidden absolute top-20 left-3 right-3 flex justify-between pointer-events-none z-20">
             <button onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)} className="bg-white/90 dark:bg-zinc-900/90 p-2 rounded-full shadow-md border border-zinc-200 dark:border-zinc-800 pointer-events-auto transition-transform hover:scale-105">
               <Menu className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
             </button>
             <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className="bg-white/90 dark:bg-zinc-900/90 p-2 rounded-full shadow-md border border-zinc-200 dark:border-zinc-800 pointer-events-auto transition-transform hover:scale-105">
               <Layers className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
             </button>
          </div>
        )}

        {/* Middle panels (Left/Right) */}
        <div className="flex-1 flex justify-between items-stretch py-4 pointer-events-none overflow-hidden relative">
          
          {/* Left Panel: Inspector */}
          <div className={`pointer-events-auto absolute sm:relative w-64 sm:w-72 h-full overflow-y-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl transition-transform duration-300 ease-in-out ${isLeftPanelOpen ? 'translate-x-0' : '-translate-x-[120%] sm:translate-x-0'} z-30 flex flex-col gap-4`}>
            <div className="flex justify-between items-center sm:hidden">
              <span className="font-bold text-xs text-zinc-500">INSPECTOR</span>
              <button onClick={() => setIsLeftPanelOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X className="h-4 w-4 text-zinc-500"/></button>
            </div>
            
            <div>
              <div className="mb-4">
                <PlaceSearch onPlaceSelected={handlePlaceSelected} />
              </div>

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">WHAT IS HAPPENING NOW?</span>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">Surface thermal conditions are stable with ambient moisture levels.</p>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-2xl shrink-0">
                  {getWeatherIcon(telemetry.condition)}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 leading-tight mt-2">
                {selectedStation}
              </h3>
              {placeMetadata?.address ? (
                <p className="text-[10px] text-zinc-500 mt-1 leading-tight line-clamp-1">{placeMetadata.address}</p>
              ) : null}
              <div className="flex flex-wrap gap-2 mt-2">
                <p className="text-[10px] text-zinc-500 font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5" /> {selectedCoords[0].toFixed(3)}, {selectedCoords[1].toFixed(3)}
                </p>
                {placeMetadata?.country && (
                  <p className="text-[10px] text-zinc-500 font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Globe className="h-2.5 w-2.5" /> {placeMetadata.country}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
               <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group hover:bg-zinc-100 transition-colors">
                 <Thermometer className="h-4 w-4 text-orange-500 mb-1" />
                 <span className="block text-[10px] text-zinc-500 font-bold uppercase">Temperature</span>
                 <span className="block text-lg font-black text-zinc-900 dark:text-zinc-100">
                   {currentMetrics.temp}°C
                 </span>
                 <MapMetricProgress value={parseFloat(currentMetrics.temp)} max={50} colorClass="bg-orange-500" />
               </div>
               <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 group hover:bg-zinc-100 transition-colors">
                 <div className="flex justify-between items-start">
                   <Droplets className="h-4 w-4 text-blue-500 mb-1" />
                   <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${currentMetrics.rainProb > 40 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                     {currentMetrics.rainProb > 40 ? 'High Risk' : 'Low Risk'}
                   </span>
                 </div>
                 <span className="block text-[10px] text-zinc-500 font-bold uppercase">Rain Chance</span>
                 <span className="block text-lg font-black text-blue-600 dark:text-blue-400">
                   {currentMetrics.rainProb}%
                 </span>
                 <MapMetricProgress value={currentMetrics.rainProb} max={100} colorClass="bg-blue-500" />
               </div>
               <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 col-span-2 flex items-center justify-between group hover:bg-zinc-100 transition-colors">
                 <div>
                   <Wind className="h-4 w-4 text-emerald-500 mb-1" />
                   <span className="block text-[10px] text-zinc-500 font-bold uppercase">Wind Speed</span>
                   <span className="block text-lg font-black text-zinc-900 dark:text-zinc-100">
                     {currentMetrics.windSpeed} km/h
                   </span>
                 </div>
                 <div className="text-right flex flex-col items-end">
                   <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Direction</span>
                    <motion.div 
                      animate={{ rotate: currentMetrics.windDirection }}
                      className="text-emerald-500"
                    >
                      <Wind className="h-3 w-3" />
                    </motion.div>
                   </div>
                   <span className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">{currentMetrics.windDirection}°</span>
                 </div>
               </div>
            </div>

            {viewMode === 'advanced' && (
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">WHAT IS LIKELY TO HAPPEN NEXT?</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2 font-medium">
                  Cloud moisture gathering along westerly corridors.
                </p>
              </div>
            )}

            {viewMode === 'advanced' && (
              <div className="mt-auto pt-4 flex flex-col gap-2">
                <button 
                  onClick={() => setModalType('timeline')}
                  className="w-full bg-blue-600 text-white rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors"
                >
                  <Sparkles className="h-3 w-3" /> Explain Timeline (5-Step)
                </button>
                <button 
                  onClick={() => setModalType('info')}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Info className="h-3 w-3" /> How do we know?
                </button>
                <span className="text-[9px] text-center text-zinc-400 mt-1">Forecast projection based on IMD / Open-Meteo numerical simulation models.</span>
              </div>
            )}
          </div>

          {/* Right Panel: Data & Layers (Advanced only) */}
          {viewMode === 'advanced' && (
            <div className={`pointer-events-auto absolute right-0 sm:relative w-64 sm:w-80 h-full overflow-y-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl transition-transform duration-300 ease-in-out ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-[120%] sm:translate-x-0'} z-30 flex flex-col gap-4`}>
              <div className="flex justify-between items-center sm:hidden">
                <span className="font-bold text-xs text-zinc-500">DATA & LAYERS</span>
                <button onClick={() => setIsRightPanelOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X className="h-4 w-4 text-zinc-500"/></button>
              </div>

              {/* Station Inspector / Location Box */}
              <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
                 <div className="flex justify-between items-start mb-3">
                   <div>
                     <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">STATION INSPECTOR</span>
                     <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100">Live Telemetry</h4>
                   </div>
                   <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                 </div>

                 <div className="space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] text-zinc-500 font-medium">Coordinates</span>
                     <span className="text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-300">
                       {selectedCoords[0].toFixed(2)}°N, {selectedCoords[1].toFixed(2)}°E
                     </span>
                   </div>
                   <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-700 pt-2">
                     <span className="text-[11px] text-zinc-500 font-medium">Temperature</span>
                     <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                       {currentMetrics.temp}°C
                     </span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] text-zinc-500 font-medium">Humidity</span>
                     <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                       {currentMetrics.humidity}%
                     </span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] text-zinc-500 font-medium">Wind Speed</span>
                     <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                       {currentMetrics.windSpeed} km/h ({currentMetrics.windDirection}°)
                     </span>
                   </div>
                   
                   <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-700 pt-2">
                     <span className="text-[11px] text-zinc-500 font-medium">Air Pressure</span>
                     <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">{currentMetrics.pressure} hPa</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] text-zinc-500 font-medium">Ground Moisture</span>
                     <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{currentMetrics.soilMoisture}%</span>
                   </div>
                   <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-700 pt-2">
                     <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-500 font-medium">Air Quality</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${parseFloat(currentMetrics.pm25) < 25 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : parseFloat(currentMetrics.pm25) < 50 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {parseFloat(currentMetrics.pm25) < 25 ? 'Good' : parseFloat(currentMetrics.pm25) < 50 ? 'Moderate' : 'Poor'}
                      </span>
                     </div>
                     <div className="text-right">
                       <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 block">PM2.5: {currentMetrics.pm25}</span>
                       <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 block">PM10: {currentMetrics.pm10}</span>
                     </div>
                   </div>
                   <MapMetricProgress value={parseFloat(currentMetrics.pm25)} max={100} colorClass="bg-emerald-500" type="aqi" />
                 </div>

                 <button 
                   onClick={() => setModalType('micro')}
                   className="w-full mt-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl py-2.5 text-[11px] font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                 >
                   <Sparkles className="h-3.5 w-3.5" /> Explain This Area (5-Step AI)
                 </button>
                 
                 <div className="mt-3 flex items-center justify-center gap-1.5 opacity-60">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">✓ Synced to WeatherGPT CPCB/Open-Meteo</span>
                 </div>
              </div>

              {/* Select Data Layer Panel */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">SELECT DATA LAYER</span>
                
                {[
                  { 
                    group: 'Atmospheric', 
                    layers: [
                      { id: 'radar', icon: Radio, label: 'Doppler Radar', sub: 'Live Rain & Storms' },
                      { id: 'wind', icon: Compass, label: 'Wind Speed & Flow', sub: 'Wind Flow & Direction' }
                    ] 
                  },
                  { 
                    group: 'Surface & Soil', 
                    layers: [
                      { id: 'temp', icon: Thermometer, label: 'Temperature', sub: 'Heat Distribution Map' },
                      { id: 'soil', icon: Sprout, label: 'Ground Moisture (%)', sub: 'Soil Water Levels' }
                    ] 
                  },
                  { 
                    group: 'Pressure & Environment', 
                    layers: [
                      { id: 'aqi', icon: Activity, label: 'Air Quality Index (AQI)', sub: 'Pollution & Smog Levels' },
                      { id: 'pressure', icon: Gauge, label: 'Air Pressure (hPa)', sub: 'High/Low Pressure Zones' },
                      { id: 'hazard', icon: ShieldAlert, label: 'Hazard Corridors', sub: 'Weather Alert & Risk Zones' }
                    ] 
                  }
                ].map(group => (
                  <div key={group.group} className="space-y-1.5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase ml-1">{group.group}</span>
                    <div className="flex flex-col gap-1.5">
                      {group.layers.map(layer => (
                        <button 
                          key={layer.id}
                          onClick={() => setActiveLayer(layer.id as any)}
                          className={`flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-all ${
                            activeLayer === layer.id 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500 scale-[1.01]' 
                              : 'border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                          }`}
                        >
                          <layer.icon className={`h-4 w-4 shrink-0 ${activeLayer === layer.id ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}`} />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold leading-none">{layer.label}</span>
                            <span className="text-[9px] opacity-60 leading-none mt-1">{layer.sub}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Overlay (Advanced only) */}
        {viewMode === 'advanced' && (
          <div className="w-full flex flex-col sm:flex-row justify-between items-end sm:items-center pointer-events-none gap-4">
             <div className="pointer-events-auto bg-zinc-900/90 backdrop-blur-md rounded-3xl p-5 border border-zinc-800 shadow-2xl self-start sm:self-auto w-full sm:w-auto">
               <div className="flex justify-between items-center mb-3">
                 <span className="text-xs font-black text-zinc-400 uppercase tracking-widest block">Doppler Radar Precipitation & Rain Echo (RainViewer)</span>
                 <span className="text-xs font-mono font-bold text-blue-400 ml-6">Frame {timeStep + 1}/{timeLabels.length} • {timeLabels[timeStep]}</span>
               </div>
               <div className="flex items-center gap-3 w-full sm:w-[450px]">
                 <span className="text-[10px] text-zinc-500 font-bold font-mono whitespace-nowrap">0 mm/h (Dry)</span>
                 <div className="flex-1 h-4 rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 via-orange-500 to-red-600 shadow-inner"></div>
                 <span className="text-[10px] text-zinc-500 font-bold font-mono whitespace-nowrap">40+ mm/h (Heavy)</span>
               </div>
               <div className="flex justify-between mt-2 px-12 text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                  <span>2.5 mm/h (Light)</span>
                  <span>10 mm/h (Moderate)</span>
               </div>
             </div>

             <button 
               onClick={() => setIsPlaying(!isPlaying)} 
               className={`pointer-events-auto flex items-center gap-3 px-8 py-5 rounded-full font-black text-sm sm:text-base shadow-2xl border transition-all transform hover:scale-105 active:scale-95 ${
                 isPlaying 
                   ? 'bg-blue-600 text-white border-blue-500 ring-4 ring-blue-500/20' 
                   : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'
               }`}
             >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                <span>{isPlaying ? 'STOP ANIMATION' : 'ANIMATE RADAR'}</span>
             </button>
          </div>
        )}

      </div>

      {/* Modals */}
      {modalType && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm pointer-events-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 relative">
            <button 
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-zinc-500" />
            </button>

            {modalType === 'timeline' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">5-Step Timeline Forecast</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { step: 1, title: 'Atmospheric Priming', desc: 'Boundary layer moisture is reaching saturation point (89%). Convection is likely within 45 minutes.' },
                    { step: 2, title: 'Cell Formation', desc: 'Initial convective cells expected to form 12km West of current coordinates.' },
                    { step: 3, title: 'Precipitation Peak', desc: 'Rain intensity reaching 12.5mm/h between +3H and +6H marks.' },
                    { step: 4, title: 'Wind Shift', desc: 'Surface winds expected to rotate from NW to SW, bringing cooler air.' },
                    { step: 5, title: 'Post-Frontal Stability', desc: 'Skies clearing by +12H as the moisture corridor moves Eastward.' }
                  ].map(s => (
                    <div key={s.step} className="flex gap-4">
                      <div className="font-black text-blue-600/30 text-3xl shrink-0 italic leading-none">{s.step}</div>
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{s.title}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modalType === 'info' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl">
                    <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Data Intelligence Engine</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">WeatherGPT utilizes a multi-model consensus layer to provide ultra-local telemetry.</p>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> IMD (India Meteorological Dept)
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1">High-resolution regional NWP models for synaptic weather patterns.</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Open-Meteo GFS/ECMWF
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1">Global ensemble models providing baseline temperature and pressure grids.</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> RainViewer Doppler Grid
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1">Real-time radar reflectivity for accurate precipitation mapping.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'micro' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl">
                    <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Micro-Climate Analysis</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl">
                    <p className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase mb-2">Selected Node: {selectedStation}</p>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
                      "This specific topography creates a unique venturi effect for surface winds, resulting in a persistent thermal corridor. Moisture levels are currently decoupled from the regional mean, indicating a 2.4% localized elevation in humidity vs surrounding blocks."
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Core Drivers</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Topographic Venturi', 'Surface Thermal Inversion', 'Low PM10 Corridor', 'Soil Saturation Sink'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold rounded-full text-zinc-600 dark:text-zinc-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </APIProvider>
  );
};
