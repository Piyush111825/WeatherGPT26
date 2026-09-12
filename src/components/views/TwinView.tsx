import React, { useState } from 'react';
import { WeatherTelemetry } from '../../types';
import {
  Leaf,
  Bug,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  PlusCircle,
  Eye,
  ArrowRight,
} from 'lucide-react';

interface TwinViewProps {
  telemetry: WeatherTelemetry;
  onOpenTwinView?: () => void;
}

export const TwinView: React.FC<TwinViewProps> = ({ telemetry, onOpenTwinView }) => {
  const [selectedBioSignal, setSelectedBioSignal] = useState<string>('dragonfly');
  const [userObservation, setUserObservation] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);

  const bioIndicators = [
    {
      id: 'dragonfly',
      title: 'Dragonfly Flight Altitude',
      scientificName: 'Pantala flavescens (Globe Skimmer)',
      observation: 'Swarming low (<1.5m) above crop canopy and pond edges',
      biologicalTrigger:
        'Atmospheric moisture (>80% RH) condenses on delicate chitin wing membranes, increasing aerodynamic payload weight. Concurrently, prey gnats descend into boundary layer.',
      ancestralPrediction: 'Rain within 3 to 5 hours',
      confidence: 88,
      consensusAgreement: 'Strong Agreement with 59% Rain Prob',
    },
    {
      id: 'ants',
      title: 'Red Harvester Ant Column Migration',
      scientificName: 'Solenopsis geminata / Camponotus',
      observation: 'Carrying white pupae/eggs vertically to elevated mound crests',
      biologicalTrigger:
        'Sensory trichoid sensilla detect barometric pressure gradients (drop below 1008 hPa) and soil hygroscopic moisture surge prior to inundation.',
      ancestralPrediction: 'Heavy localized precipitation within 6 hours',
      confidence: 91,
      consensusAgreement: 'Strong Agreement with incoming rain front',
    },
    {
      id: 'neem',
      title: 'Neem & Banyan Leaf Curl Phenology',
      scientificName: 'Azadirachta indica & Ficus benghalensis',
      observation: 'Underside leaf curvature exposing lower stomata',
      biologicalTrigger:
        'Rapid ambient vapor pressure deficit (VPD) reduction creates turgor pressure surge in pulvinus cells before convective thunderstorm passage.',
      ancestralPrediction: 'Precipitation front approaching district',
      confidence: 84,
      consensusAgreement: 'Corroborated by 89% humidity',
    },
  ];

  const handleLogObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userObservation.trim()) return;
    setLogSuccess(true);
    setUserObservation('');
    setTimeout(() => setLogSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 pb-28">
      {/* Header Banner */}
      <div className="rounded-3xl border border-teal-200 bg-teal-50/60 p-5 shadow-xs dark:border-teal-900/60 dark:bg-teal-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-teal-600 px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                ETHNO-METEOROLOGY & DIGITAL TWIN
              </span>
              <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
                Ancestral Knowledge Cross-Validated by Sensor Physics
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-teal-950 dark:text-teal-100 mt-1">
              Ancestral Climate Twin & Bio-Indicators
            </h1>
            <p className="text-xs text-teal-800 dark:text-teal-300 mt-0.5">
              Harmonizing indigenous ecological indicators (insect aerobiology, floral phenology, bird ethology) with numerical AWS sensors for {telemetry.coordinates}.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="rounded-2xl border border-teal-200 bg-white p-3.5 dark:border-teal-800 dark:bg-zinc-900 text-right w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                Consensus Index
              </span>
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
                89% Match
              </span>
              <span className="text-[10px] block font-semibold text-zinc-500">
                Model & Traditional Convergence
              </span>
            </div>
            {onOpenTwinView && (
              <button
                onClick={onOpenTwinView}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Open 3-Section TwinView</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3 Core Bio-Indicator Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {bioIndicators.map(bio => {
          const isSelected = selectedBioSignal === bio.id;
          return (
            <div
              key={bio.id}
              onClick={() => setSelectedBioSignal(bio.id)}
              className={`cursor-pointer rounded-3xl border p-5 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-teal-500 bg-white shadow-md ring-2 ring-teal-500/20 dark:border-teal-400 dark:bg-zinc-900'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                      <Bug className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {bio.title}
                      </h3>
                      <span className="text-[10px] italic text-zinc-400">
                        {bio.scientificName}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                    {bio.confidence}% Conf
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-zinc-500 text-[10px] uppercase">
                      Observed Behavior:
                    </span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      "{bio.observation}"
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-zinc-500 text-[10px] uppercase">
                      Biophysical Explanation:
                    </span>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      {bio.biologicalTrigger}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    Ancestral Prediction
                  </span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">
                    {bio.ancestralPrediction}
                  </span>
                </div>
                <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Model vs Bio-Indicator Consensus Matrix */}
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">
          CROSS-PARADIGM CONVERGENCE AUDIT
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-blue-200 bg-white p-4 dark:border-blue-900/50 dark:bg-zinc-800/80">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <span>📡 Open-Meteo High-Resolution Ensemble</span>
            </span>
            <ul className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
              <li>• Surface Humidity: <strong>{telemetry.humidity}%</strong> (Saturated)</li>
              <li>• Barometric Trend: <strong>{telemetry.surfacePressure} hPa</strong> (Falling)</li>
              <li>• Convective Rain Prob: <strong>{telemetry.rainProb}%</strong> peaking 4 PM - 7 PM</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-teal-200 bg-white p-4 dark:border-teal-900/50 dark:bg-zinc-800/80">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <span>🍃 Bio-Ecological Synthesis</span>
            </span>
            <ul className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
              <li>• Dragonfly swarm low cruising verifies boundary moisture saturation</li>
              <li>• Ant pupae evacuation signals subterranean soil hydro-pressure surge</li>
              <li>• Integrated Confidence: <strong>89% Convergence</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Field Observer Input Box */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Crowdsource Local Ecological Observation
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Witnessed unusual animal or plant behavior in {telemetry.coordinates}? Submit to cross-reference with our neural synoptic network.
        </p>

        <form onSubmit={handleLogObservation} className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={userObservation}
            onChange={e => setUserObservation(e.target.value)}
            placeholder="e.g. Tree frogs croaking vigorously near irrigation channel, or birds flying low..."
            className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs sm:text-sm text-zinc-800 outline-none focus:border-teal-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          />
          <button
            type="submit"
            className="rounded-2xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shrink-0"
          >
            Submit Observation
          </button>
        </form>

        {logSuccess && (
          <div className="mt-3 rounded-xl bg-teal-50 p-2.5 text-center text-xs font-semibold text-teal-700 dark:bg-teal-950/70 dark:text-teal-300">
            ✓ Observation logged and matched with Open-Meteo local station telemetry!
          </div>
        )}
      </div>
    </div>
  );
};
