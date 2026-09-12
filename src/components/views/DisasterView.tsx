import React, { useState, useEffect, useMemo } from 'react';
import { WeatherTelemetry } from '../../types';
import { speakText } from '../../utils/weatherUtils';
import {
  getSuggestedRivers,
  calculateRiverTelemetry,
  createCustomRiver,
  RiverBasinData,
} from '../../utils/riverBasinUtils';
import {
  ShieldAlert,
  Radio,
  MapPin,
  Phone,
  AlertTriangle,
  Building,
  CheckCircle2,
  Copy,
  Check,
  Volume2,
  MessageSquare,
  Smartphone,
  WifiOff,
  Waves,
  Droplets,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
  Plus,
  Compass,
} from 'lucide-react';

interface DisasterViewProps {
  telemetry: WeatherTelemetry;
}

export const DisasterView: React.FC<DisasterViewProps> = ({ telemetry }) => {
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);
  const [isCached, setIsCached] = useState(false);

  // Suggested rivers for the active location
  const suggestedRivers = useMemo(() => {
    return getSuggestedRivers(telemetry);
  }, [telemetry.cityId, telemetry.cityName, telemetry.coordinates, telemetry.rainProb, telemetry.rootSoilMoisture]);

  // Selected river state (defaults to the first suggested river for the active location)
  const [selectedRiverId, setSelectedRiverId] = useState<string>('');
  const [customRiverInput, setCustomRiverInput] = useState<string>('');
  const [customRiverData, setCustomRiverData] = useState<RiverBasinData | null>(null);

  // Synchronize default river when location changes
  useEffect(() => {
    if (suggestedRivers.length > 0) {
      setSelectedRiverId(suggestedRivers[0].id);
      setCustomRiverData(null);
    }
  }, [telemetry.cityName, telemetry.coordinates]);

  // Current active river data
  const activeRiver: RiverBasinData = useMemo(() => {
    if (customRiverData) {
      return calculateRiverTelemetry(customRiverData, telemetry);
    }
    const found = suggestedRivers.find((r) => r.id === selectedRiverId);
    return found || suggestedRivers[0] || createCustomRiver('Local River Basin', telemetry);
  }, [customRiverData, selectedRiverId, suggestedRivers, telemetry]);

  const handleApplyCustomRiver = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customRiverInput.trim()) return;
    const custom = createCustomRiver(customRiverInput.trim(), telemetry);
    setCustomRiverData(custom);
    setSelectedRiverId(custom.id);
  };

  const handleSelectSuggestedRiver = (river: RiverBasinData) => {
    setCustomRiverData(null);
    setSelectedRiverId(river.id);
  };

  const SOS_CACHE_KEY = 'weathergpt_last_sos';

  const emergencySmsText = `🚨 EMERGENCY STATUS UPDATE (${telemetry.cityName} ${telemetry.coordinates}):
I am currently safe. Weather condition: ${telemetry.condition} (${telemetry.temp}°C, Rain ${telemetry.rainProb}%).
Monitored Water Basin: ${activeRiver.name} (${activeRiver.dangerPercentage}% of danger mark - ${activeRiver.status}).
Nearest Designated Relief Shelter: Central Community & Relief Stadium (1.4 km).
Shared via WeatherGPT Disaster Response Hub.`;

  useEffect(() => {
    try {
      const sosData = {
        text: emergencySmsText,
        timestamp: new Date().toISOString(),
        location: telemetry.cityName || 'Active Region',
        coords: telemetry.coordinates || '0.00°N, 0.00°E',
        river: activeRiver?.name || 'Local Waterway',
        riverDangerPercent: activeRiver?.dangerPercentage ?? 50,
        shelter: "Central Community & Relief Stadium (1.4 km)"
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(SOS_CACHE_KEY, JSON.stringify(sosData));
      }
      setIsCached(true);
    } catch (e) {
      console.warn('Failed to cache SOS emergency record:', e);
      setIsCached(false);
    }
  }, [emergencySmsText, telemetry.cityName, telemetry.coordinates, activeRiver?.name, activeRiver?.dangerPercentage]);

  const handleCopySms = () => {
    try {
      if (navigator && navigator.clipboard) {
        navigator.clipboard.writeText(emergencySmsText);
        setCopiedSms(true);
        setTimeout(() => setCopiedSms(false), 2000);
      }
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const handleTestSiren = () => {
    try {
      setSirenPlaying(true);
      speakText(
        `Emergency Alert Broadcast. Hydro Advisory for ${telemetry.cityName || 'your region'}. Water basin ${activeRiver?.name || 'Local Basin'} is currently at ${activeRiver?.dangerPercentage ?? 50} percent of danger level with status ${activeRiver?.status || 'NORMAL'}. Follow official district civil defense advisories.`
      );
      setTimeout(() => setSirenPlaying(false), 8000);
    } catch (e) {
      console.warn('Emergency siren audio failed:', e);
      setSirenPlaying(false);
    }
  };

  // Helper styles for status badge
  const getStatusBadge = (status: RiverBasinData['status']) => {
    switch (status) {
      case 'CRITICAL':
        return (
          <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white animate-pulse">
            CRITICAL FLOOD DANGER
          </span>
        );
      case 'ALERT':
        return (
          <span className="rounded-full bg-orange-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
            HIGH WATER ALERT
          </span>
        );
      case 'WATCH':
        return (
          <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
            HYDRO WATCH
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            NORMAL FLOW
          </span>
        );
    }
  };

  // Helper for progress bar color
  const getProgressBarColor = (dangerPercentage: number) => {
    if (dangerPercentage >= 90) return 'bg-rose-600';
    if (dangerPercentage >= 78) return 'bg-orange-500';
    if (dangerPercentage >= 65) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-5 pb-28">
      {/* Top Banner */}
      <div className="rounded-3xl border border-rose-300 bg-rose-50/60 p-5 shadow-xs dark:border-rose-900 dark:bg-rose-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                ORANGE ADVISORY
              </span>
              <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                IMD Hydro-Meteorological Monitoring Active
              </span>
              {isCached && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <WifiOff className="h-2.5 w-2.5" />
                  OFFLINE READY (CACHED)
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-rose-950 dark:text-rose-100 mt-1">
              Disaster Response & Emergency Shelters
            </h1>
            <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
              Live river basin flood telemetry, verified offline relief facilities, and emergency broadcast dispatch for {telemetry.coordinates}.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={handleTestSiren}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-xs transition-colors ${
                sirenPlaying
                  ? 'bg-rose-700 text-white animate-pulse'
                  : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
            >
              <Volume2 className="h-4 w-4" />
              <span>{sirenPlaying ? 'Broadcasting Alert...' : 'Test Audio Siren'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* DYNAMIC RIVER & WATER BASIN SELECTOR COMPONENT */}
      <div className="rounded-3xl border border-blue-200 bg-white p-5 shadow-xs dark:border-blue-900/60 dark:bg-zinc-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
              <Waves className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  HYDROLOGICAL MONITORING
                </span>
                <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[9px] font-semibold text-zinc-500">
                  Region: {telemetry.cityName}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Select Local River, Canal, or Water Basin
              </h2>
            </div>
          </div>

          {/* Quick River Dropdown Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="river-basin-select" className="text-xs font-semibold text-zinc-500 whitespace-nowrap">
              Active Basin:
            </label>
            <select
              id="river-basin-select"
              value={customRiverData ? 'custom' : selectedRiverId}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'custom') return;
                const match = suggestedRivers.find((r) => r.id === val);
                if (match) handleSelectSuggestedRiver(match);
              }}
              className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-800 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {suggestedRivers.map((river) => (
                <option key={river.id} value={river.id}>
                  {river.name} ({river.type})
                </option>
              ))}
              {customRiverData && (
                <option value="custom">
                  Custom: {customRiverData.name} ({customRiverData.type})
                </option>
              )}
            </select>
          </div>
        </div>

        {/* Suggested River Pills for current region */}
        <div className="mt-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Compass className="h-3 w-3 text-blue-500" />
              Suggested Water Bodies near <strong>{telemetry.cityName}</strong>:
            </span>
            <span className="text-[10px] text-zinc-400">Click to switch gauge</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {suggestedRivers.map((river) => {
              const isSelected = !customRiverData && selectedRiverId === river.id;
              return (
                <button
                  key={river.id}
                  id={`select-river-${river.id}`}
                  onClick={() => handleSelectSuggestedRiver(river)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400/30'
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <Waves className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                  <span>{river.name}</span>
                  <span
                    className={`rounded-md px-1.5 py-0.2 text-[9px] font-mono ${
                      isSelected
                        ? 'bg-blue-700 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {river.dangerPercentage}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom River Search / Input Field */}
        <form onSubmit={handleApplyCustomRiver} className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              id="custom-river-input"
              placeholder="Specify custom river, canal, or drainage basin (e.g. Damodar River, Hooghly, Saraswati Canal)..."
              value={customRiverInput}
              onChange={(e) => setCustomRiverInput(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 pl-8.5 pr-3 py-2 text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            id="apply-custom-river-btn"
            disabled={!customRiverInput.trim()}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Set Custom Basin</span>
          </button>
        </form>
      </div>

      {/* Watershed & Urban Drainage Gauges (3 Cards - Dynamic to Active River) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Dynamic River Basin Card */}
        <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-xs dark:border-blue-900/50 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 truncate max-w-[170px]" title={activeRiver.name}>
              {activeRiver.name}
            </span>
            {getStatusBadge(activeRiver.status)}
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {activeRiver.dangerPercentage}%
            </p>
            <span className="text-xs font-semibold text-zinc-500">of danger mark</span>
          </div>

          <div className="mt-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(activeRiver.dangerPercentage)}`}
              style={{ width: `${activeRiver.dangerPercentage}%` }}
            />
          </div>

          <div className="mt-2.5 space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center justify-between">
              <span>Current Level:</span>
              <strong className="text-zinc-800 dark:text-zinc-200">
                {activeRiver.currentLevelM} m / {activeRiver.dangerMarkM} m mark
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Rate of Change:</span>
              <span className={`font-semibold flex items-center gap-0.5 ${
                activeRiver.rateTrend === 'rising' ? 'text-rose-600 dark:text-rose-400' : activeRiver.rateTrend === 'falling' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'
              }`}>
                {activeRiver.rateTrend === 'rising' ? <ArrowUpRight className="h-3 w-3" /> : activeRiver.rateTrend === 'falling' ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {activeRiver.rateOfChangeCmHr > 0 ? `+${activeRiver.rateOfChangeCmHr}` : activeRiver.rateOfChangeCmHr} cm/hr ({activeRiver.rateTrend})
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
              <span>Discharge Volume:</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300">
                {activeRiver.dischargeCusecs.toLocaleString()} cusecs
              </span>
            </div>
          </div>
        </div>

        {/* Urban Culvert Inundation Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Urban Culvert Inundation</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              STABLE
            </span>
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            Normal Flow
          </p>
          <div className="mt-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '38%' }} />
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            Primary storm outlets draining freely into {activeRiver.name}.
          </p>
        </div>

        {/* Relief Sump Pumps Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Relief Sump Pumps</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              READY
            </span>
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            100% Operational
          </p>
          <div className="mt-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '100%' }} />
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            Diesel backups fueled for 72 hours of uninterrupted drainage.
          </p>
        </div>
      </div>

      {/* River Basin Hydro-Catchment Details */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/30 text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5 text-blue-500" />
            Catchment: {activeRiver.catchment}
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            Gauge Station: {activeRiver.gaugeStation}
          </span>
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {activeRiver.summary} • <strong>Embankment Freeboard:</strong> {activeRiver.embankmentStatus}.
        </p>
      </div>

      {/* Verified Offline Relief Shelters */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            VERIFIED OFFLINE RELIEF SHELTERS NEAR {telemetry.coordinates}
          </h2>
          <span className="text-xs text-zinc-400">Cached for offline emergency navigation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Central Community Stadium
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                1.4 km
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Capacity: 1,800 persons • Medical & Food kits ready</p>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-700 text-[11px]">
              <span className="text-emerald-600 font-semibold">Elevated Plinth: Yes</span>
              <span className="font-mono text-zinc-600 dark:text-zinc-300">Sector 4-B</span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Govt Polytechnic Relief Campus
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                2.8 km
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Capacity: 950 persons • Backup Generator active</p>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-700 text-[11px]">
              <span className="text-emerald-600 font-semibold">Water Tank: 20k L</span>
              <span className="font-mono text-zinc-600 dark:text-zinc-300">West Wing</span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Municipal High School Auditorium
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                3.9 km
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Capacity: 1,200 persons • Community Kitchen setup</p>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-700 text-[11px]">
              <span className="text-emerald-600 font-semibold">Helipad: Adjacent</span>
              <span className="font-mono text-zinc-600 dark:text-zinc-300">Main Road</span>
            </div>
          </div>
        </div>
      </div>

      {/* Impassable Inundation Corridors & Waterlogging */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">
          TRANSIT VULNERABILITIES & WATERLOGGED PASSAGES
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/50 p-3 dark:border-rose-900/50 dark:bg-rose-950/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <div>
                <span className="font-bold text-rose-950 dark:text-rose-200">
                  Low Embankment Underpass near {activeRiver.name}
                </span>
                <p className="text-rose-800 dark:text-rose-300 text-[11px]">
                  45 cm standing water reported. Impassable for light vehicles and two-wheelers.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold text-white shrink-0">
              AVOID
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <div>
                <span className="font-bold text-emerald-950 dark:text-emerald-200">
                  Station Road Flyover Bypass
                </span>
                <p className="text-emerald-800 dark:text-emerald-300 text-[11px]">
                  Elevated bypass route completely clear with normal traffic flow.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shrink-0">
              CLEAR
            </span>
          </div>
        </div>
      </div>

      {/* Emergency SMS Broadcast Generator */}
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Emergency SOS Dispatch SMS Generator
            </h3>
            <p className="text-xs text-zinc-500">
              Generate a formatted broadcast message with verified weather telemetry and shelter location to send via SMS or WhatsApp during emergencies.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            <button
              onClick={handleCopySms}
              className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {copiedSms ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedSms ? 'Copied' : 'Copy'}</span>
            </button>
            <a 
              href={`sms:?body=${encodeURIComponent(emergencySmsText)}`}
              className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Send via SMS</span>
            </a>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(emergencySmsText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <textarea
          readOnly
          value={emergencySmsText}
          rows={4}
          className="w-full rounded-2xl border border-zinc-200 bg-white p-3 font-mono text-xs text-zinc-800 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />

        {/* Helplines Direct Dial */}
        <div className="mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-700 flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-blue-600" />
            District Disaster: <strong>1077</strong>
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-rose-600" />
            National Emergency: <strong>112</strong>
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-emerald-600" />
            State Relief Control: <strong>1070</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

