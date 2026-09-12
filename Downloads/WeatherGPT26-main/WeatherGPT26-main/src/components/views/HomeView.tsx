import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OperationalPersona, WeatherTelemetry } from '../../types';
import { HOURLY_FORECAST, WEEKLY_FORECAST, DEFAULT_TELEMETRY } from '../../data/weatherData';
import { speakText, stopSpeaking, getAQIInfo } from '../../utils/weatherUtils';
import { TabType } from '../BottomNav';
import { ErrorBoundary } from '../ErrorBoundary';
import {
  MapPin, Volume2, VolumeX, Thermometer, CloudRain, Wind, Activity,
  Crosshair, Sparkles, Sprout, Siren,
  Clock, Sun, Droplets, Cloud, CloudLightning, ChevronDown, ChevronUp, AlertTriangle, ArrowRight, Leaf, Snowflake, Zap
} from 'lucide-react';

type Season = 'Spring' | 'Summer' | 'Monsoon' | 'Autumn' | 'Winter';

const getSeason = (month: number): Season => {
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 10) return 'Monsoon';
  if (month === 11) return 'Autumn';
  return 'Winter';
};

const SEASON_CONFIG = {
  Spring: {
    title: 'Vibrant Spring',
    gradient: 'from-teal-600/40 via-emerald-900/20 to-zinc-900',
    accent: 'text-teal-400',
    bgAccent: 'bg-teal-400/10',
    border: 'border-teal-500/30',
    icon: Sprout,
    advice: 'Spring Bloom: Perfect for outdoor activities. Watch for pollen counts if you have allergies.',
    audio: 'Current Spring conditions provide a vibrant atmospheric baseline with potential for localized pollen peaks.'
  },
  Summer: {
    title: 'Golden Summer',
    gradient: 'from-amber-600/40 via-orange-900/20 to-zinc-900',
    accent: 'text-amber-400',
    bgAccent: 'bg-amber-400/10',
    border: 'border-amber-500/30',
    icon: Sun,
    advice: 'Summer Alert: Extreme heat possible. Stay hydrated and avoid peak sun hours between 12 PM - 4 PM.',
    audio: 'Current Summer conditions indicate high solar radiation and thermal intensity. Hydration protocols recommended.'
  },
  Monsoon: {
    title: 'Monsoon Rhythm',
    gradient: 'from-blue-600/40 via-slate-900/20 to-zinc-900',
    accent: 'text-blue-400',
    bgAccent: 'bg-blue-400/10',
    border: 'border-blue-500/30',
    icon: CloudRain,
    advice: 'Monsoon Safety: Active storm risk. Keep rain gear ready and monitor for localized waterlogging alerts.',
    audio: 'Active Monsoon precipitation cycles are currently influencing regional moisture levels. Monitor flood channels.'
  },
  Autumn: {
    title: 'Autumn Transition',
    gradient: 'from-orange-600/40 via-orange-900/20 to-zinc-900',
    accent: 'text-orange-400',
    bgAccent: 'bg-orange-400/10',
    border: 'border-orange-500/30',
    icon: Leaf,
    advice: 'Autumn Breeze: Variable wind speeds. Excellent for monitoring wind-driven telemetry changes.',
    audio: 'The Autumn transition is introducing variable wind vectors and cooling surface temperatures.'
  },
  Winter: {
    title: 'Frosty Winter',
    gradient: 'from-cyan-600/40 via-blue-900/20 to-zinc-900',
    accent: 'text-cyan-400',
    bgAccent: 'bg-cyan-400/10',
    border: 'border-cyan-500/30',
    icon: Snowflake,
    advice: 'Winter Watch: Low visibility possible due to morning fog. Keep warm and monitor air quality inversion.',
    audio: 'Current Winter atmospheric conditions are dominated by stable air and cooler surface gradients. Fog alerts active.'
  }
};

interface HomeViewProps {
  telemetry: WeatherTelemetry;
  persona: OperationalPersona;
  onSelectPersona: (p: OperationalPersona) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenHowDoWeKnow: () => void;
  onOpenShareSnapshot: () => void;
  onOpenWebhooks: () => void;
  onOpenCacheManager: () => void;
  onSearchCity: (query: string) => void;
  onGpsLocate: () => void;
  weatherFxEnabled?: boolean;
  onToggleWeatherFx?: () => void;
}

const AnimatedCounter = ({ value, suffix = '' }: { value: number, suffix?: string }) => {
  return (
    <div className="flex items-baseline relative overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <span>{suffix}</span>
    </div>
  );
};

const MetricProgress = ({ value, max, colorClass, type = 'bar' }: { value: number, max: number, colorClass: string, type?: 'bar' | 'liquid' | 'aqi' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  if (type === 'aqi') {
    return (
      <div className="mt-3 relative">
        <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 via-orange-500 to-red-600 opacity-30" />
        <motion.div 
          initial={{ left: 0 }}
          animate={{ left: `${percentage}%` }}
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-emerald-500 shadow-sm"
          style={{ left: `${percentage}%` }}
        />
      </div>
    );
  }

  if (type === 'liquid') {
    return (
      <div className="mt-3 h-1.5 w-full bg-zinc-700/30 rounded-full overflow-hidden relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`absolute inset-y-0 left-0 ${colorClass} opacity-80`}
        />
        <motion.div 
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2"
        />
      </div>
    );
  }

  return (
    <div className="mt-3 h-1.5 w-full bg-zinc-700/30 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        className={`h-full ${colorClass}`}
      />
    </div>
  );
};

export const HomeView: React.FC<HomeViewProps> = ({
  telemetry,
  persona,
  onSelectPersona,
  onNavigateTab,
  onSearchCity,
  onGpsLocate,
  weatherFxEnabled = false,
  onToggleWeatherFx,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const [selectedHourIndex, setSelectedHourIndex] = useState(0);
  const [expandedAlert, setExpandedAlert] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [activeHealthAdvice, setActiveHealthAdvice] = useState<string>('outdoor');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const safeTelemetry = telemetry || DEFAULT_TELEMETRY;
  const currentHourlyForecast = safeTelemetry.hourlyData && safeTelemetry.hourlyData.length > 0 ? safeTelemetry.hourlyData : HOURLY_FORECAST;
  const currentWeeklyForecast = safeTelemetry.dailyData && safeTelemetry.dailyData.length > 0 ? safeTelemetry.dailyData : WEEKLY_FORECAST;

  const activeHourly = currentHourlyForecast[selectedHourIndex] || currentHourlyForecast[0] || { temp: 25, rainProb: 10, windSpeed: 12, condition: 'Clear', hour: '12 PM' };
  const displayTelemetry = {
    temp: selectedHourIndex === 0 ? (safeTelemetry.temp ?? 25) : (activeHourly.temp ?? 25),
    rainProb: selectedHourIndex === 0 ? (safeTelemetry.rainProb ?? 0) : (activeHourly.rainProb ?? 0),
    aqi: typeof safeTelemetry.aqi === 'number' ? safeTelemetry.aqi : 50, 
    windSpeed: selectedHourIndex === 0 ? (safeTelemetry.windSpeed ?? 10) : (activeHourly.windSpeed ?? 10),
    humidity: typeof safeTelemetry.humidity === 'number' ? safeTelemetry.humidity : 60,
  };

  const aqiInfo = getAQIInfo(displayTelemetry.aqi, safeTelemetry.condition || 'Clear');

  const currentMonth = new Date().getMonth() + 1;
  const season = getSeason(currentMonth);
  const config = SEASON_CONFIG[season] || SEASON_CONFIG['Spring'];

  const handleToggleAudio = () => {
    try {
      if (isAudioPlaying) {
        stopSpeaking();
        setIsAudioPlaying(false);
      } else {
        const text = `${config.audio} Live briefing for ${safeTelemetry.cityName || 'your region'}. The current condition is ${safeTelemetry.condition || 'Clear'} with a temperature of ${displayTelemetry.temp} degrees, and a ${displayTelemetry.rainProb} percent chance of rain.`;
        speakText(text);
        setIsAudioPlaying(true);
        setTimeout(() => setIsAudioPlaying(false), 9000);
      }
    } catch (e) {
      console.warn('Audio playback error in HomeView:', e);
    }
  };

  const quickActions = [
    { id: 'spray', label: 'Spray Loss Calculator', icon: Sparkles },
    { id: 'bio', label: 'Bio-Indicators', icon: Sprout },
    { id: 'shelter', label: 'Emergency Shelters', icon: Siren },
  ];

  const cities = ['New Delhi', 'Mumbai', 'London', 'Kolkata'];

  const renderWeatherBackdrop = (condition: string) => {
    if (!weatherFxEnabled) return null;

    const lower = condition.toLowerCase();
    const isRain = lower.includes('rain') || lower.includes('drizzle') || lower.includes('storm') || lower.includes('shower');
    const isCloudy = lower.includes('cloud') || lower.includes('overcast') || lower.includes('fog');

    if (isRain) {
      return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
          <motion.div animate={{ y: [0, 800], opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="absolute top-0 left-[20%] w-0.5 h-20 bg-blue-400/60" />
          <motion.div animate={{ y: [-100, 700], opacity: [0, 0.8, 0] }} transition={{ duration: 1.5, delay: 0.3, repeat: Infinity, ease: 'linear' }} className="absolute top-0 left-[50%] w-0.5 h-16 bg-blue-300/40" />
          <motion.div animate={{ y: [-50, 900], opacity: [0, 1, 0] }} transition={{ duration: 1.1, delay: 0.7, repeat: Infinity, ease: 'linear' }} className="absolute top-0 left-[80%] w-0.5 h-24 bg-blue-500/50" />
          <motion.div animate={{ y: [0, 600], opacity: [0, 0.6, 0] }} transition={{ duration: 1.4, delay: 0.1, repeat: Infinity, ease: 'linear' }} className="absolute top-0 left-[35%] w-0.5 h-12 bg-blue-400/30" />
          <div className="absolute top-10 left-10 w-64 h-64 bg-slate-700/40 rounded-full blur-3xl" />
        </div>
      );
    }

    if (isCloudy) {
      return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
          <motion.div animate={{ x: [0, 120, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-10 -left-20 w-96 h-40 bg-white/20 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0, -100, 0] }} transition={{ duration: 30, delay: 2, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-20 -right-10 w-80 h-48 bg-zinc-400/20 rounded-full blur-3xl" />
        </div>
      );
    }

    // Clear/Default
    return (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-20 -right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, -50, 0], y: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-10 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
      </div>
    );
  };

  const getWeatherIcon = (condition: string, size: 'sm' | 'lg' = 'sm') => {
    const iconClass = size === 'lg' ? 'w-16 h-16 filter drop-shadow-xl' : 'w-5 h-5';
    if (condition.includes('Rain')) return <CloudRain className={`${iconClass} text-blue-400`} />;
    if (condition.includes('Cloud')) return <Cloud className={`${iconClass} text-zinc-400`} />;
    if (condition.includes('Thunder')) return <CloudLightning className={`${iconClass} text-yellow-400`} />;
    return <Sun className={`${iconClass} text-orange-400`} />;
  };

  return (
    <div className="space-y-6 pb-28 relative">
      
      {/* 1. Hero & Live Visuals */}
      <section className={`relative overflow-hidden rounded-3xl ${weatherFxEnabled ? 'bg-zinc-900 shadow-xl' : 'bg-zinc-900/95 shadow-md'} text-white p-6 sm:p-8 border ${weatherFxEnabled ? config.border : 'border-zinc-800'} transition-all duration-700`}>
        {weatherFxEnabled && <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-60 z-0`} />}
        {renderWeatherBackdrop(telemetry.condition)}

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 bg-zinc-800/80 backdrop-blur-md rounded-full px-3 py-1 border border-zinc-700/50`}>
              <motion.div 
                animate={{ opacity: [1, 0.4, 1] }} 
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`w-2.5 h-2.5 rounded-full ${config.accent.replace('text', 'bg')}`}
              />
              <span className={`text-[10px] font-bold tracking-widest ${config.accent} uppercase`}>{config.title} • LIVE AWS DATA</span>
            </div>
            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {currentTime}
            </span>
          </div>

          <div className="mb-6 flex justify-between items-end gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full animate-pulse" />
                {getWeatherIcon(telemetry.condition)}
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight flex items-center gap-2">
                  <MapPin className="h-8 w-8 text-blue-400" />
                  {telemetry.cityName}
                </h1>
                <p className="text-zinc-400 mt-1">{telemetry.coordinates} • {telemetry.condition}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onToggleWeatherFx && (
                <button
                  onClick={onToggleWeatherFx}
                  title={weatherFxEnabled ? 'Disable Live Weather FX' : 'Enable Live Weather FX'}
                  className={`flex h-10 px-3.5 shrink-0 items-center gap-1.5 justify-center rounded-full transition-all text-xs font-bold ${
                    weatherFxEnabled
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-750 hover:text-zinc-200'
                  }`}
                >
                  <Sparkles className={`h-3.5 w-3.5 ${weatherFxEnabled ? 'text-blue-400 animate-pulse' : 'text-zinc-500'}`} />
                  <span>{weatherFxEnabled ? 'Weather FX: ON' : 'FX: OFF'}</span>
                </button>
              )}
              <button
                onClick={handleToggleAudio}
                className={`flex h-10 px-4 shrink-0 items-center gap-2 justify-center rounded-full transition-colors text-xs font-bold ${
                  isAudioPlaying 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' 
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                {isAudioPlaying ? <VolumeX className="h-4 w-4 animate-pulse" /> : <Volume2 className="h-4 w-4" />}
                {isAudioPlaying ? 'Stop Audio' : '🔊 Audio Briefing'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-4 group hover:bg-zinc-800/80 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <Thermometer className="h-5 w-5 text-orange-400" />
                <span className="text-[10px] font-black text-orange-500/50 uppercase">Live</span>
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase block mb-1">Temperature</span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                 <AnimatedCounter value={displayTelemetry.temp} suffix="°C" />
              </div>
              <MetricProgress value={displayTelemetry.temp} max={50} colorClass="bg-orange-500" />
            </div>
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-4 group hover:bg-zinc-800/80 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <CloudRain className="h-5 w-5 text-blue-400" />
                <span className="text-[10px] font-black text-blue-500/50 uppercase">Risk</span>
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase block mb-1">Rain Prob</span>
              <div className="text-2xl sm:text-3xl font-black text-blue-400">
                 <AnimatedCounter value={displayTelemetry.rainProb} suffix="%" />
              </div>
              <MetricProgress value={displayTelemetry.rainProb} max={100} colorClass="bg-blue-500" type="liquid" />
            </div>
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-4 group hover:bg-zinc-800/80 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <Activity className={`h-5 w-5 ${aqiInfo.textClass}`} />
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full bg-zinc-700/50 text-zinc-300">{aqiInfo.status}</span>
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase block mb-1">AQI (Live)</span>
              <div className={`text-2xl sm:text-3xl font-black ${aqiInfo.textClass}`}>
                 <AnimatedCounter value={aqiInfo.val} />
              </div>
              <MetricProgress value={aqiInfo.val} max={300} colorClass={aqiInfo.barColorClass} type="aqi" />
            </div>
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-4 group hover:bg-zinc-800/80 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <Wind className="h-5 w-5 text-purple-400" />
                <span className="text-[10px] font-black text-purple-500/50 uppercase">Velocity</span>
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase block mb-1">Wind Speed</span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                 <AnimatedCounter value={displayTelemetry.windSpeed} suffix=" km/h" />
              </div>
              <MetricProgress value={displayTelemetry.windSpeed} max={100} colorClass="bg-purple-500" />
            </div>
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-4 group hover:bg-zinc-800/80 transition-colors col-span-2 md:col-span-1">
              <div className="flex justify-between items-center mb-2">
                <Droplets className="h-5 w-5 text-cyan-400" />
                <span className="text-[10px] font-black text-cyan-500/50 uppercase">
                  {displayTelemetry.humidity > 70 ? 'High' : displayTelemetry.humidity < 35 ? 'Low' : 'Optimal'}
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase block mb-1">Humidity</span>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400">
                 <AnimatedCounter value={displayTelemetry.humidity} suffix="%" />
              </div>
              <MetricProgress value={displayTelemetry.humidity} max={100} colorClass="bg-cyan-500" type="liquid" />
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal Advice Banner */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-4 rounded-2xl border ${config.border} ${config.bgAccent} backdrop-blur-sm flex items-start gap-4`}
      >
        <div className={`p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm shrink-0`}>
          <config.icon className={`w-5 h-5 ${config.accent}`} />
        </div>
        <div>
          <h4 className={`text-sm font-black uppercase tracking-tight ${config.accent}`}>{season} Guidance</h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5 leading-relaxed font-medium">
            {config.advice}
          </p>
        </div>
        <button onClick={() => onNavigateTab('chat')} className="ml-auto p-2 hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded-full transition-colors self-center shrink-0">
           <Zap className={`h-4 w-4 ${config.accent}`} />
        </button>
      </motion.div>

      {/* Hourly Forecast & Quick Actions */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-1">Hourly Forecast (Next 24 Hours)</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {currentHourlyForecast.map((hour, idx) => {
            const isSelected = selectedHourIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedHourIndex(idx)}
                className={`snap-start shrink-0 flex flex-col items-center justify-between p-4 rounded-3xl border w-24 h-36 transition-all duration-300 ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105' 
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-blue-300 dark:hover:border-zinc-600'
                }`}
              >
                <span className={`text-xs font-bold ${isSelected ? 'text-blue-100' : 'text-zinc-500'}`}>{hour.time}</span>
                <div className="my-2">
                  {getWeatherIcon(hour.condition)}
                </div>
                <span className="text-xl font-black">{hour.temp}°</span>
                <div className={`flex flex-col items-center gap-1 text-[10px] font-bold mt-1 ${isSelected ? 'text-blue-200' : 'text-blue-500'}`}>
                  <div className="flex items-center gap-1"><Droplets className="w-3 h-3" /> {hour.rainProb}%</div>
                  <div className={`flex items-center gap-1 ${isSelected ? 'text-blue-100' : 'text-zinc-400'}`}><Wind className="w-3 h-3" /> {hour.windSpeed} km/h</div>
                </div>
              </button>
            )
          })}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={onGpsLocate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-bold dark:bg-zinc-100 dark:text-zinc-900 shadow-sm shrink-0"
          >
            <Crosshair className="w-3.5 h-3.5" /> GPS Sync
          </button>
          {cities.map(city => (
            <button
              key={city}
              onClick={() => onSearchCity(city)}
              className="px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 whitespace-nowrap"
            >
              {city}
            </button>
          ))}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => setActiveDrawer(activeDrawer === action.id ? null : action.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-bold whitespace-nowrap transition-colors ${
                activeDrawer === action.id 
                  ? 'bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100'
                  : 'bg-white border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <action.icon className="w-4 h-4 text-blue-500" />
              {action.label}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {activeDrawer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-5 mb-4">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                  {quickActions.find(q => q.id === activeDrawer)?.label} Insights
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Interactive module for {activeDrawer} loaded securely via WeatherGPT Engine.
                </p>
                <button onClick={() => onNavigateTab('chat')} className="mt-4 text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Analyze in Chat
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Intelligence Modules (Grid Layout) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Severe Weather Alert Strip */}
        <div className="col-span-1 lg:col-span-2">
           <div className={`rounded-3xl border overflow-hidden transition-all duration-300 ${expandedAlert ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/50 shadow-md' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-amber-300 dark:hover:border-amber-800/50'}`}>
              <button 
                onClick={() => setExpandedAlert(!expandedAlert)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <CloudLightning className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Thunderstorm Alert in Effect</h3>
                    <p className="text-xs text-zinc-500">Radar indicates incoming convective cells.</p>
                  </div>
                </div>
                {expandedAlert ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
              </button>
              
              <AnimatePresence>
                {expandedAlert && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-2 border-t border-amber-200/50 dark:border-amber-900/50">
                      <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
                        A moderate squall line is approaching from the southwest. Expected wind gusts up to 65km/h and localized waterlogging in low-lying areas between 4 PM and 7 PM.
                      </p>
                      <button className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors">
                        <AlertTriangle className="h-4 w-4" /> View Impact Matrix
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* Air Quality Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
               <div>
                 <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-1">Air Quality & Health</span>
                 <h3 className={`text-3xl font-black ${aqiInfo.textClass}`}>{aqiInfo.val}</h3>
                 <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mt-1 ${aqiInfo.badgeClass}`}>{aqiInfo.status}</span>
               </div>
               <div className="text-right">
                 <span className="text-xs text-zinc-500 block">Primary Pollutant</span>
                 <span className="font-bold text-zinc-700 dark:text-zinc-300">
                   {telemetry.pm25 != null ? `PM2.5: ${telemetry.pm25} µg/m³` : telemetry.pm10 != null ? `PM10: ${telemetry.pm10} µg/m³` : 'PM2.5'}
                 </span>
               </div>
            </div>
            
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 mb-6 overflow-hidden">
               <div className={`${aqiInfo.barColorClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(5, (aqiInfo.val / 300) * 100))}%` }}></div>
            </div>
          </div>
          
          <div className="space-y-3">
             <span className="text-xs font-bold text-zinc-500">Health Advice</span>
             <div className="flex gap-2">
               <button onClick={() => setActiveHealthAdvice('outdoor')} className={`flex-1 p-2 rounded-xl border text-[10px] font-bold transition-all ${activeHealthAdvice === 'outdoor' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent' : 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'}`}>🏃 Outdoor Sports</button>
               <button onClick={() => setActiveHealthAdvice('vent')} className={`flex-1 p-2 rounded-xl border text-[10px] font-bold transition-all ${activeHealthAdvice === 'vent' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent' : 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'}`}>🪟 Ventilation</button>
               <button onClick={() => setActiveHealthAdvice('sensitive')} className={`flex-1 p-2 rounded-xl border text-[10px] font-bold transition-all ${activeHealthAdvice === 'sensitive' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent' : 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'}`}>👶 Sensitive Groups</button>
             </div>
             <p className="text-xs text-zinc-600 dark:text-zinc-400 pt-1 leading-relaxed">
               {activeHealthAdvice === 'outdoor' && aqiInfo.advice.outdoor}
               {activeHealthAdvice === 'vent' && aqiInfo.advice.vent}
               {activeHealthAdvice === 'sensitive' && aqiInfo.advice.sensitive}
             </p>
          </div>
        </div>

        {/* UV & Solar Radiation */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <div>
               <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-1">UV & Solar Radiation</span>
               <div className="flex items-end gap-2">
                 <h3 className="text-3xl font-black text-amber-500">{telemetry.uvIndex || 6}</h3>
                 <span className="text-sm font-bold text-zinc-500 mb-1">UV Index</span>
               </div>
             </div>
             <Sun className="h-8 w-8 text-amber-400" />
          </div>
          
          <div className="my-6 relative flex justify-center">
            {/* Simple arc meter representation */}
            <svg viewBox="0 0 100 50" className="w-full max-w-[200px] overflow-visible">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-zinc-100 dark:text-zinc-800" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-amber-400 drop-shadow-md" strokeDasharray="125" strokeDashoffset={125 - (125 * ((telemetry.uvIndex || 6)/11))} />
            </svg>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Peak UV: 12:00 PM - 2:00 PM</h4>
            <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-1">
              Sun protection advisory: Wear SPF 30+ sunscreen and protective eyewear.
            </p>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="col-span-1 lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-4">7-Day High/Low Forecast</span>
          <div className="space-y-3">
            {currentWeeklyForecast.map((day, idx) => {
              const isExpanded = expandedDay === idx;
              // calculate bar position (assuming temp range 10 to 40)
              const rangeMin = 10;
              const rangeMax = 40;
              const rangeSpan = rangeMax - rangeMin;
              const leftPercent = ((day.minTemp - rangeMin) / rangeSpan) * 100;
              const widthPercent = ((day.maxTemp - day.minTemp) / rangeSpan) * 100;

              return (
                <div key={idx} className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                  <button 
                    onClick={() => setExpandedDay(isExpanded ? null : idx)}
                    className="w-full flex items-center p-3 sm:p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="w-12 text-left font-bold text-sm text-zinc-900 dark:text-zinc-100">{day.day}</div>
                    <div className="w-8 flex justify-center mx-2">{getWeatherIcon(day.condition)}</div>
                    
                    <div className="flex-1 flex items-center gap-3 mx-2">
                      <span className="text-xs font-bold text-zinc-500 w-6 text-right">{day.minTemp}°</span>
                      <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full relative overflow-hidden">
                        <div 
                          className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400" 
                          style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 w-6">{day.maxTemp}°</span>
                    </div>
                    
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800"
                      >
                        <div className="p-4 flex gap-6 text-xs text-zinc-600 dark:text-zinc-400">
                          <div className="flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-500"/> Rain: {day.rainProb}%</div>
                          <div className="flex items-center gap-2"><Wind className="w-4 h-4 text-emerald-500"/> Gusts up to {day.windGust} km/h</div>
                          <button className="ml-auto text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:underline">
                            Details <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </section>

    </div>
  );
};
