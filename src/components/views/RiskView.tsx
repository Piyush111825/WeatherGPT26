import React, { useState } from 'react';
import { WeatherTelemetry } from '../../types';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  CloudRain,
  Wind,
  Activity,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface RiskViewProps {
  telemetry: WeatherTelemetry;
}

export const RiskView: React.FC<RiskViewProps> = ({ telemetry }) => {
  // Simulator sliders
  const [simTemp, setSimTemp] = useState(telemetry.temp);
  const [simRain, setSimRain] = useState(telemetry.rainProb);
  const [simWind, setSimWind] = useState(telemetry.windSpeed);

  // Computed Risk Score
  const rainWeight = (simRain / 100) * 40;
  const windWeight = Math.min((simWind / 60) * 30, 30);
  const tempWeight = simTemp > 35 ? (simTemp - 35) * 6 : simTemp < 5 ? (5 - simTemp) * 6 : 5;
  const rawScore = Math.round(rainWeight + windWeight + tempWeight);
  const simulatedScore = Math.min(Math.max(rawScore, 10), 100);

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { label: 'CRITICAL / SEVERE RISK', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-300 dark:border-red-900' };
    if (score >= 45) return { label: 'ELEVATED / CAUTION', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-300 dark:border-amber-900' };
    return { label: 'LOW / MODERATE RISK', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-300 dark:border-emerald-900' };
  };

  const riskMeta = getRiskLevel(simulatedScore);

  return (
    <div className="space-y-5 pb-28">
      {/* Header */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                MULTI-HAZARD RISK MATRIX & SAFETY THRESHOLDS
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                REAL-TIME CAUSALITY
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
              Localized Hazard Intelligence ({telemetry.coordinates})
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Deterministic multi-variable risk scoring analyzing wet-bulb heat index, particulate matter, localized convective precipitation, and lightning discharge probability.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-700 dark:bg-zinc-800/80 text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              Composite Hazard Index
            </span>
            <span className={`text-2xl font-black ${riskMeta.color}`}>
              {simulatedScore}/100
            </span>
            <span className={`text-[10px] block font-bold ${riskMeta.color}`}>
              {riskMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Causality Risk Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Heat & Moisture Stress */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Wet-Bulb Stress
            </span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
            {telemetry.feelsLike}°C
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Humidity at {telemetry.humidity}% elevates thermal strain; hydration mandatory for outdoor laborers.
          </p>
          <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-semibold text-amber-600">
            Threshold: Safe &lt;32°C (Current: {telemetry.feelsLike}°C)
          </div>
        </div>

        {/* Precipitation Inundation */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Runoff / Inundation
            </span>
            <CloudRain className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
            {telemetry.rainProb}%
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Scattered shower cells up to 14mm/hr. Low-lying culvert backflows possible in arterial zones.
          </p>
          <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-semibold text-blue-600">
            Warning at &gt;70% (Current: {telemetry.rainProb}%)
          </div>
        </div>

        {/* Wind Gust & Structural */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Wind Shear & Gusts
            </span>
            <Wind className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
            {telemetry.windSpeed} km/h
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Calm to gentle airflow. Negligible structural or tree-fall hazard across municipal sectors.
          </p>
          <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-semibold text-emerald-600">
            Safe ceiling &lt;35 km/h
          </div>
        </div>

        {/* Atmospheric Quality */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Air Quality (CPCB)
            </span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
            AQI {telemetry.aqi}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Clean air conditions. Particulate matter PM2.5 and PM10 within healthy residential standards.
          </p>
          <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-semibold text-emerald-600">
            Category: {telemetry.aqiStatus}
          </div>
        </div>
      </div>

      {/* Interactive Risk Simulator Sliders */}
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Interactive Multi-Variable Hazard Simulator
          </h3>
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          Test what happens to civil safety, agricultural spraying, and travel advisory levels when meteorological parameters vary.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Slider 1: Temperature */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Ambient Temp:</span>
              <span className="text-blue-600 font-bold">{simTemp}°C</span>
            </div>
            <input
              type="range"
              min="10"
              max="46"
              value={simTemp}
              onChange={e => setSimTemp(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Slider 2: Rain Probability */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Rain Probability:</span>
              <span className="text-blue-600 font-bold">{simRain}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simRain}
              onChange={e => setSimRain(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Slider 3: Wind Velocity */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Wind Velocity:</span>
              <span className="text-blue-600 font-bold">{simWind} km/h</span>
            </div>
            <input
              type="range"
              min="2"
              max="70"
              value={simWind}
              onChange={e => setSimWind(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        {/* Dynamic Recalculated Directives */}
        <div className={`mt-4 rounded-2xl border p-4 ${riskMeta.bg} ${riskMeta.border}`}>
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Simulated Outcome: {riskMeta.label} ({simulatedScore}/100)</span>
          </div>
          <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
            {simulatedScore >= 70
              ? 'Extreme vigilance advised. Restrict all outdoor gatherings, halt pesticide spraying immediately, inspect emergency pumping stations, and alert low-lying residential clusters.'
              : simulatedScore >= 45
              ? 'Moderate caution needed. Rain gear recommended for commuters. Farmers should avoid chemical spray due to drift and wash-off risk. Normal operations can continue with continuous radar monitoring.'
              : 'Favorable operational conditions. Outdoor activities, sports, and normal logistics can proceed uninhibited.'}
          </p>
        </div>
      </div>

      {/* Safety Directives for 4 Cohorts */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">
          POPULATION-SPECIFIC SAFETY DIRECTIVES
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">Pedestrians & Commuters</span>
            <p className="mt-1 text-zinc-600 dark:text-zinc-300">
              Carry rain gear; watch for slippery tiled footpaths and delayed municipal bus routes between 4 PM and 7 PM.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">Outdoor & Construction Labor</span>
            <p className="mt-1 text-zinc-600 dark:text-zinc-300">
              Maintain hydration breaks every 45 mins due to high wet-bulb humidity ({telemetry.humidity}%). Cover raw cement and dry aggregate bags.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">Schools & Children</span>
            <p className="mt-1 text-zinc-600 dark:text-zinc-300">
              Outdoor sports and PE classes permitted in morning; transition to indoor halls after 3:30 PM as convective cells form.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">Municipal & Power Utilities</span>
            <p className="mt-1 text-zinc-600 dark:text-zinc-300">
              Keep primary storm pumps on standby. Clear culvert debris in low-lying sub-basins. Power lines safe from gale shear.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
