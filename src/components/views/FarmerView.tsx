import React, { useState } from 'react';
import { WeatherTelemetry } from '../../types';
import {
  Tractor,
  Droplets,
  Wind,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calculator,
  ShieldCheck,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface FarmerViewProps {
  telemetry: WeatherTelemetry;
}

export const FarmerView: React.FC<FarmerViewProps> = ({ telemetry }) => {
  const [selectedCrop, setSelectedCrop] = useState<'paddy' | 'wheat' | 'mustard' | 'potato' | 'vegetables'>('paddy');
  const [acres, setAcres] = useState<number>(4);
  const [costPerAcre, setCostPerAcre] = useState<number>(1400);

  // Economic calculation
  const totalSprayCost = acres * costPerAcre;
  const washOffPercentage = telemetry.rainProb > 50 ? 88 : 35;
  const potentialLoss = Math.round((totalSprayCost * washOffPercentage) / 100);

  const cropGuides = {
    paddy: {
      name: 'Paddy / Kharif Rice',
      stage: 'Tillering & Vegetative Extension',
      advice: 'Maintain 3-5 cm standing water layer. Rain forecasted will naturally maintain depth; shut electric submersible pumps to prevent bund overflowing and nutrient runoff.',
      fungicide: 'Delay Sheath Blight spray until rain system passes.',
    },
    wheat: {
      name: 'Wheat',
      stage: 'Field Preparation & Early Sowing',
      advice: 'Excess moisture in root zone may impede seed germination. Ensure field perimeter drainage furrows are cleared.',
      fungicide: 'No active foliar sprays required currently.',
    },
    mustard: {
      name: 'Mustard / Rapeseed',
      stage: 'Vegetative & Pre-Flowering',
      advice: 'Watch for aphid infestation in humid conditions. However, do not spray systemic insecticide today as rain will dilute active chemical concentration.',
      fungicide: 'Spray post-rain with sticker adjuvant.',
    },
    potato: {
      name: 'Potato / Tuber Crops',
      stage: 'Tuber Initiation & Canopy Bulking',
      advice: 'High relative humidity (>85%) strongly favors Late Blight (Phytophthora infestans). Plan protective Mancozeb contact spray immediately after rainfall clears.',
      fungicide: 'Late Blight warning index: ELEVATED.',
    },
    vegetables: {
      name: 'Leafy Vegetables & Solanaceous',
      stage: 'Harvesting & Fruit Maturation',
      advice: 'Harvest mature fruits/leaves before late afternoon rainfall to prevent bacterial soft rot and market value discounting.',
      fungicide: 'Store harvested crates elevated from damp soils.',
    },
  };

  const activeCrop = cropGuides[selectedCrop];

  return (
    <div className="space-y-5 pb-28">
      {/* Header Banner */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
                AGRONOMIC INTELLIGENCE & MICRO-METEOROLOGY
              </span>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                SPRAY WARNING ACTIVE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
              Farmer Agronomic Directive ({telemetry.coordinates})
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Calibrated for local soils, canopy boundary layers, and Open-Meteo AWS agro-telemetry.
            </p>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 dark:border-rose-900 dark:bg-rose-950/40 shrink-0">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <span>PAUSE CHEMICAL SPRAYING TODAY</span>
            </div>
            <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
              Rain probability {telemetry.rainProb}% causes ~{washOffPercentage}% chemical wash-off.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Soil & Canopy Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Root Soil (0-7cm)</span>
            <Droplets className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
            {telemetry.rootSoilMoisture}% vol
          </p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Optimal field capacity
          </span>
          <p className="text-[11px] text-zinc-400 mt-1">
            No irrigation needed for 48 hours.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Deep Subsoil (7-28cm)</span>
            <Droplets className="h-4 w-4 text-teal-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
            {telemetry.subsoilMoisture}% vol
          </p>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Well saturated
          </span>
          <p className="text-[11px] text-zinc-400 mt-1">
            Taproot moisture reserves abundant.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Droplet Aerodynamics</span>
            <Wind className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
            {telemetry.windSpeed} km/h
          </p>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Moderate drift risk
          </span>
          <p className="text-[11px] text-zinc-400 mt-1">
            Droplets drift 3.8m outside spray cone.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Leaf Wetness Duration</span>
            <Tractor className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
            6.2 Hours
          </p>
          <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            Fungal Spore Risk
          </span>
          <p className="text-[11px] text-zinc-400 mt-1">
            Foliage will stay wet past midnight.
          </p>
        </div>
      </div>

      {/* Interactive Crop Customizer */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
            CROP-SPECIFIC FIELD GUIDANCE
          </h2>
          <span className="text-xs text-zinc-400">
            Select your standing field crop for personalized directives
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'paddy', label: '🌾 Paddy / Rice' },
              { id: 'wheat', label: '🌿 Wheat' },
              { id: 'mustard', label: '🌼 Mustard' },
              { id: 'potato', label: '🥔 Potato' },
              { id: 'vegetables', label: '🥬 Vegetables' },
            ] as const
          ).map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCrop(c.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                selectedCrop === c.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Selected Crop Guidance Box */}
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between border-b border-emerald-200/50 pb-2 dark:border-emerald-900/50">
            <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              {activeCrop.name} • Stage: {activeCrop.stage}
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Verified IMD Agronet
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
            <p>
              <strong>Field Management:</strong> {activeCrop.advice}
            </p>
            <p>
              <strong>Foliar & Fungicide Alert:</strong> {activeCrop.fungicide}
            </p>
          </div>
        </div>

        {/* 4 Core Agronomic Operations Status */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="rounded-xl border border-red-200 bg-red-50/40 p-3 dark:border-red-900/50 dark:bg-red-950/20">
            <div className="flex items-center gap-1.5 font-bold text-red-800 dark:text-red-300">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>Chemical Spraying</span>
            </div>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              🔴 PAUSE. Reopens Tomorrow 4 PM when wash-off risk drops to &lt;10%.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Urea Fertilizer</span>
            </div>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              🟡 CAUTION. Do not broadcast before heavy showers to prevent nitrate leaching.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Irrigation Pumps</span>
            </div>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              🟢 SHUT OFF. Natural monsoon showers provide free balanced hydration.
            </p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/40 p-3 dark:border-red-900/50 dark:bg-red-950/20">
            <div className="flex items-center gap-1.5 font-bold text-red-800 dark:text-red-300">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>Open Threshing</span>
            </div>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              🔴 HALT. Keep grain pods covered under tarpaulins in ventilated sheds.
            </p>
          </div>
        </div>
      </div>

      {/* Economic Agrochemical Loss Calculator */}
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Economic Agrochemical Loss & Savings Calculator
          </h3>
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          Calculate the exact rupee savings by waiting for the optimal weather window rather than spraying before rain wash-off.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Field Area to Spray (Acres)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={acres}
              onChange={e => setAcres(Number(e.target.value))}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Chemical + Labor Cost per Acre (₹)
            </label>
            <input
              type="number"
              min="200"
              max="8000"
              step="100"
              value={costPerAcre}
              onChange={e => setCostPerAcre(Number(e.target.value))}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Calculation Result Callout */}
        <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-100/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              SAVINGS BY DELAYING SPRAY UNTIL TOMORROW 4 PM
            </span>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-0.5">
              ₹{potentialLoss.toLocaleString()} Saved
            </p>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
              Protects {acres} acres from {washOffPercentage}% pesticide wash-off into irrigation furrows.
            </p>
          </div>

          <div className="rounded-xl bg-white px-4 py-2 border border-emerald-200 dark:bg-zinc-900 dark:border-zinc-700 text-center shrink-0">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">
              Total Budget
            </span>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              ₹{totalSprayCost.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
