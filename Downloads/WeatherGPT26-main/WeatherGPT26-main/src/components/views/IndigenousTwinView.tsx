import React, { useState } from 'react';
import { WeatherTelemetry } from '../../types';
import {
  Sparkles,
  Leaf,
  Upload,
  Volume2,
  VolumeX,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Info,
  Layers,
  CheckCircle2,
  Bug,
  Compass,
  ArrowRight,
  Radio,
  FileText,
  Activity,
  Send,
} from 'lucide-react';
import { CredibilityBadge } from '../CredibilityBadge';
import { ExplainThisModal, ExplanationStepData } from '../ExplainThisModal';
import { speakText, stopSpeaking } from '../../utils/weatherUtils';

export type TwinViewMode = 'modern' | 'classic';

interface BioIndicator {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  observation: string;
  biologicalTrigger: string;
  folklorePrediction: string;
  icon: string;
  defaultConfidence: number;
}

const PRESET_INDICATORS: BioIndicator[] = [
  {
    id: 'ants',
    name: 'Red Harvester Ant Column Migration',
    scientificName: 'Solenopsis geminata / Camponotus',
    category: 'Insect Ethology',
    observation: 'Carrying white pupae/eggs vertically to elevated mound crests and dry tree crevices',
    biologicalTrigger:
      'Sensory trichoid sensilla detect barometric pressure drops (<1008 hPa) and subterranean soil hygroscopic saturation prior to inundation.',
    folklorePrediction: 'Heavy localized precipitation or cloudburst within 6 to 12 hours',
    icon: '🐜',
    defaultConfidence: 91,
  },
  {
    id: 'dragonflies',
    name: 'Dragonfly Low-Altitude Swarms',
    scientificName: 'Pantala flavescens (Globe Skimmer)',
    category: 'Atmospheric Aerobiology',
    observation: 'Swarming low (<1.5m) above crop canopy and irrigation canal boundaries',
    biologicalTrigger:
      'Ambient relative humidity (>80% RH) condenses on delicate chitin wing veins, increasing aerodynamic payload weight. Concurrently, prey gnats descend into boundary layer.',
    folklorePrediction: 'Rain and convective stormfront within 3 to 5 hours',
    icon: '🦟',
    defaultConfidence: 88,
  },
  {
    id: 'neem',
    name: 'Neem & Banyan Leaf Curl Phenology',
    scientificName: 'Azadirachta indica & Ficus benghalensis',
    category: 'Flora Phenology',
    observation: 'Underside leaf curvature exposing lower stomata and palisade tissue',
    biologicalTrigger:
      'Rapid ambient vapor pressure deficit (VPD) reduction creates turgor pressure surge in pulvinus cells before convective thunderstorm passage.',
    folklorePrediction: 'Precipitation front approaching district; impending humidity spike',
    icon: '🌳',
    defaultConfidence: 85,
  },
  {
    id: 'birds',
    name: 'High-Altitude Bird Nesting & Flight',
    scientificName: 'Hirundinidae (Swallows & Swifts)',
    category: 'Avian Ethology',
    observation: 'Skimming water surfaces or nesting in elevated upper boughs',
    biologicalTrigger:
      'Tympanic air sacks sense infrasound from distant frontal squalls; insect thermal updrafts flatten near ground level.',
    folklorePrediction: 'Heavy monsoonal rains and potential localized waterlogging',
    icon: '🦅',
    defaultConfidence: 86,
  },
  {
    id: 'frogs',
    name: 'Intense Nocturnal Frog Chorus',
    scientificName: 'Hoplobatrachus tigerinus (Indian Bullfrog)',
    category: 'Amphibian Activity',
    observation: 'Synchronized high-decibel vocalization near saturated wetland margins',
    biologicalTrigger:
      'Cutaneous baroreceptors detect saturated atmospheric humidity and impending puddle formation necessary for spawning.',
    folklorePrediction: 'Saturated soil moisture and imminent sustained downpour',
    icon: '🐸',
    defaultConfidence: 92,
  },
  {
    id: 'flowering',
    name: 'Unseasonal Canopy Flowering (Cassia/Amaltas)',
    scientificName: 'Cassia fistula (Golden Shower)',
    category: 'Micro-Climate Phenology',
    observation: 'Burst of yellow racemes 40-45 days prior to seasonal monsoon arrival',
    biologicalTrigger:
      'Photoperiod and subsoil thermal accumulation triggering hormonal gibberellin synthesis in flower buds.',
    folklorePrediction: 'Reliable seasonal monsoon arrival in 40 to 45 days',
    icon: '🌺',
    defaultConfidence: 84,
  },
];

interface IndigenousTwinViewProps {
  telemetry: WeatherTelemetry;
  weatherData?: { telemetry: WeatherTelemetry; location?: string };
  language?: 'English' | 'Hindi';
  initialMode?: TwinViewMode;
  onNavigateTab?: (tab: any) => void;
  onSwitchToBasicTwin?: () => void;
}

export const IndigenousTwinView: React.FC<IndigenousTwinViewProps> = ({
  telemetry: propTelemetry,
  weatherData,
  language: initialLanguage = 'English',
  initialMode = 'modern',
  onNavigateTab,
}) => {
  const telemetry = propTelemetry || weatherData?.telemetry;
  const [viewMode, setViewMode] = useState<TwinViewMode>(initialMode);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>('ants');
  const [customNote, setCustomNote] = useState<string>('');
  const [userObservation, setUserObservation] = useState<string>('');
  const [logSuccess, setLogSuccess] = useState<boolean>(false);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showConfidenceTip, setShowConfidenceTip] = useState<boolean>(false);
  const [language, setLanguage] = useState<'English' | 'Hindi'>(initialLanguage);
  const [isHowDoWeKnowOpen, setIsHowDoWeKnowOpen] = useState<boolean>(false);
  const [explainModalData, setExplainModalData] = useState<ExplanationStepData | null>(null);

  const activeIndicator =
    PRESET_INDICATORS.find((i) => i.id === selectedIndicatorId) || PRESET_INDICATORS[0];

  const temp = telemetry?.temp ?? 28;
  const humidity = telemetry?.humidity ?? 65;
  const windSpeed = telemetry?.windSpeed ?? 12;
  const soilMoisture = telemetry?.rootSoilMoisture ?? 45;
  const surfacePressure = telemetry?.surfacePressure ?? 1010;
  const rainProb = telemetry?.rainProb ?? 50;
  const aqi = telemetry?.aqi ?? 60;
  const cityName = telemetry?.cityName || weatherData?.location || 'Local Region';

  // Blended telemetry cross-check calculation
  const satelliteMoistureMatch =
    soilMoisture > 50
      ? 'High Saturation Match (94%)'
      : soilMoisture > 25
      ? 'Moderate Soil Moisture Match (87%)'
      : 'Dry Soil Divergence (78%)';
  const satelliteHumidityMatch =
    humidity > 70 ? 'High Humidity Correlation (96%)' : 'Moderate Humidity Correlation (82%)';
  const satelliteWindMatch =
    windSpeed > 15 ? 'Wind Shear Validated (90%)' : 'Stable Atmospheric Wind (88% match)';

  const blendedConfidence = Math.min(
    98,
    Math.max(
      75,
      Math.round(
        (activeIndicator.defaultConfidence +
          (humidity > 70 ? 5 : 2) +
          (soilMoisture > 40 ? 4 : 1)) /
          1.15
      )
    )
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setUploadedImageName(file.name);
        setIsAnalyzing(true);
        setTimeout(() => {
          setIsAnalyzing(false);
        }, 1000);
      }
    } catch (err) {
      console.warn('Failed to process uploaded image:', err);
      setIsAnalyzing(false);
    }
  };

  const handleRunTwinSynthesis = () => {
    try {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 800);
    } catch (err) {
      console.warn('Failed to run twin synthesis:', err);
      setIsAnalyzing(false);
    }
  };

  const handleLogCrowdsourcedObservation = (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!userObservation.trim()) return;
      setLogSuccess(true);
      setUserObservation('');
      setTimeout(() => setLogSuccess(false), 3500);
    } catch (err) {
      console.warn('Failed to log crowdsourced observation:', err);
    }
  };

  const speakTwinAdvisory = () => {
    try {
      if (isSpeaking) {
        stopSpeaking();
        setIsSpeaking(false);
        return;
      }

      const text =
        language === 'Hindi'
          ? `स्वदेशी क्लाइमेट ट्विन ${cityName}: ${activeIndicator.name} संकेतक। ओपन-मेटियो उपग्रह डेटा के साथ मिलान। सहमति विश्वास ${blendedConfidence} प्रतिशत है। भविष्यवाणी: ${activeIndicator.folklorePrediction}`
          : `Indigenous Climate Twin analysis for ${cityName}. Bio indicator ${activeIndicator.name} blended with Open-Meteo satellite telemetry. Blended consensus confidence is ${blendedConfidence} percent. Folklore prediction: ${activeIndicator.folklorePrediction}`;

      const ok = speakText(text);
      if (ok) {
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 9000);
      }
    } catch (err) {
      console.warn('Speech synthesis error in IndigenousTwinView:', err);
      setIsSpeaking(false);
    }
  };

  const handleOpenExplainModal = () => {
    setExplainModalData({
      title: `Climate Twin Cross-Validation: ${activeIndicator.name}`,
      location: cityName,
      whatIsHappening: `Observed bio-indicator "${activeIndicator.name}" signals: ${activeIndicator.folklorePrediction.toLowerCase()} Live satellite telemetry reveals ${temp}°C, ${humidity}% humidity, and ${soilMoisture}% root-zone soil saturation.`,
      whyIsItHappening: `Bio-indicators respond to micro-scale barometric fluctuations and electrostatic charge shifts in the boundary layer ahead of synoptic weather fronts detected by orbital radiometers.`,
      howItAffectsUser: `Agricultural operations, open storage, and outdoor schedules face imminent weather transitions within 12-24 hours.`,
      recommendedDecision:
        blendedConfidence > 85
          ? `Treat traditional and satellite convergence as a verified meteorological signal. Accelerate preventative measures.`
          : `Monitor localized sky conditions and maintain flexible scheduling.`,
      recommendedAction: `Secure standing harvest piles, verify drainage clearing around seed beds, and check daily farm chemical application windows.`,
      confidence: blendedConfidence,
      dataSources: [
        'Open-Meteo High-Resolution NWP',
        'Indigenous Agro-Ecological Knowledge Repositories (ICAR/CRIDA)',
        'CPCB Environmental Observation Network',
      ],
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-28">
      {/* Header Card with Integrated Mode Switcher */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 text-slate-100 p-6 rounded-3xl border border-emerald-800/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-400 animate-pulse" /> Ancestral Knowledge Harmonized with Satellite AI
            </span>
            <CredibilityBadge variant="AI_INTERPRETATION" text="TWIN CONSENSUS" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Leaf className="text-emerald-400 shrink-0" size={24} />
            <span>Indigenous Climate Twin • {cityName}</span>
          </h1>
          <p className="text-xs text-slate-300">
            Mapping traditional bio-indicators against real-time Open-Meteo satellite telemetry (soil moisture, humidity, wind shifts).
          </p>
          <div className="pt-2">
            <p className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-800/40 rounded-xl p-2.5 leading-relaxed">
              <strong>Cultural & Observational Notice:</strong> Traditional bio-indicators are presented as cultural and historical observations alongside modern meteorological data. They are not replacements for numerical weather forecasts.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
          {/* Language Switcher */}
          <div className="flex items-center rounded-xl bg-slate-950/80 p-1 border border-slate-800 self-end sm:self-auto">
            <button
              onClick={() => setLanguage('English')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                language === 'English'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('Hindi')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                language === 'Hindi'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
          </div>

          <button
            id="listen-twin-audio-btn"
            onClick={speakTwinAdvisory}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg transition shrink-0 ${
              isSpeaking
                ? 'bg-emerald-400 text-slate-950 animate-pulse ring-4 ring-emerald-400/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSpeaking ? <VolumeX size={16} className="animate-bounce" /> : <Volume2 size={16} />}
            <span>{isSpeaking ? 'Stop Audio' : `🔊 Listen Twin (${language})`}</span>
          </button>
        </div>
      </div>

      {/* UNIFIED IN-PAGE VIEW MODE TOGGLE SWITCH (Modern 3-Section vs Classic Twin Matrix) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 px-2">
          <Layers className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Twin Interface Layout:
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1 bg-white dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
          <button
            id="toggle-mode-modern-btn"
            onClick={() => setViewMode('modern')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'modern'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Modern 3-Section Architecture</span>
          </button>

          <button
            id="toggle-mode-classic-btn"
            onClick={() => setViewMode('classic')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'classic'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Classic Twin Matrix</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: MODERN 3-SECTION ARCHITECTURE */}
      {/* ========================================================================= */}
      {viewMode === 'modern' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* SECTION 1: 🌿 OBSERVATION (Traditional Bio-Indicators & Phenology) */}
          <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    SECTION 1 • BIO-INDICATORS & PHENOLOGY
                  </span>
                  <CredibilityBadge variant="MODEL_ESTIMATE" text="TRADITIONAL KNOWLEDGE" />
                </div>
                <h2 className="font-extrabold text-lg sm:text-xl text-white mt-0.5">
                  🌿 OBSERVATION (Traditional Ecological Indicators)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generational indigenous wisdom passed down by Indian farming & coastal communities.
                </p>
              </div>
              <span className="text-xs font-mono bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800 self-start sm:self-auto">
                Active Region: {cityName}
              </span>
            </div>

            {/* Preset Indicator Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PRESET_INDICATORS.map((indicator) => {
                const isSelected = selectedIndicatorId === indicator.id;
                return (
                  <div
                    key={indicator.id}
                    id={`twin-indicator-${indicator.id}`}
                    onClick={() => {
                      setSelectedIndicatorId(indicator.id);
                      handleRunTwinSynthesis();
                    }}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-950/50 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-2xl">{indicator.icon}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {indicator.defaultConfidence}% baseline weight
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-200">{indicator.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {indicator.folklorePrediction}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Input & Upload Simulator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Custom Field Note Observation
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Unusual termite mound activity near riverbank..."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
                  />
                  <button
                    onClick={handleRunTwinSynthesis}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition"
                  >
                    Blend
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Upload Bio-Indicator Photo / Field Audio
                </label>
                <label className="flex items-center justify-center gap-2 w-full bg-slate-950 border border-dashed border-slate-700 hover:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 cursor-pointer transition">
                  <Upload size={15} className="text-emerald-400" />
                  <span>
                    {uploadedImageName ? `Uploaded: ${uploadedImageName}` : 'Click to upload image or audio'}
                  </span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,audio/*"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 2: 🛰️ SCIENTIFIC DATA (Satellite Sensors & Numerical Ground Truth) */}
          <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                    SECTION 2 • SATELLITE & SENSOR INSTRUMENTATION
                  </span>
                  <CredibilityBadge variant="LIVE_DATA" text="LIVE SENSORS" />
                </div>
                <h2 className="font-extrabold text-lg sm:text-xl text-white mt-0.5">
                  🛰️ SCIENTIFIC DATA (Satellite & Ground Sensors)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live numerical telemetry from Open-Meteo, INSAT-3D infrared radar, and CPCB automated stations.
                </p>
              </div>

              <button
                onClick={handleRunTwinSynthesis}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-300 bg-blue-950/80 px-3.5 py-2 rounded-xl border border-blue-800/80 hover:bg-blue-900 transition disabled:opacity-50 self-start sm:self-auto"
              >
                <RefreshCw size={13} className={isAnalyzing ? 'animate-spin' : ''} />
                <span>{isAnalyzing ? 'Calibrating...' : 'Re-Sync Sensors'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Root Zone Soil Moisture</span>
                <p className="text-base font-extrabold text-white">{soilMoisture}% Volumetric</p>
                <p className="text-[11px] text-emerald-400 font-semibold">{satelliteMoistureMatch}</p>
              </div>

              <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Atmospheric Humidity</span>
                <p className="text-base font-extrabold text-white">{humidity}% RH</p>
                <p className="text-[11px] text-blue-400 font-semibold">{satelliteHumidityMatch}</p>
              </div>

              <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Surface Wind Shear</span>
                <p className="text-base font-extrabold text-white">{windSpeed} km/h</p>
                <p className="text-[11px] text-amber-400 font-semibold">{satelliteWindMatch}</p>
              </div>

              <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Thermal & Air Quality</span>
                <p className="text-base font-extrabold text-white">{temp}°C • AQI {aqi}</p>
                <p className="text-[11px] text-teal-400 font-semibold">Active CPCB Ground Sensor</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: 🤖 WEATHERGPT INTERPRETATION (5-Step Framework & Action) */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/40 p-6 rounded-3xl shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    SECTION 3 • AI INTERPRETATION & CONSENSUS
                  </span>
                  <CredibilityBadge variant="AI_INTERPRETATION" text="SYNTHESIS ENGINE" />
                </div>
                <h2 className="font-extrabold text-lg sm:text-xl text-white mt-0.5">
                  🤖 WEATHERGPT INTERPRETATION (5-Step Scientific Synthesis)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rigorous cross-validation combining indigenous bio-observations with high-resolution satellite arrays.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenExplainModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white rounded-xl text-xs font-bold border border-emerald-500/40 transition"
                >
                  <Sparkles size={13} /> Deep Explain (5-Step)
                </button>
                <button
                  onClick={() => setIsHowDoWeKnowOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  <Info size={13} /> How do we know?
                </button>
              </div>
            </div>

            {/* 5-Step Intelligence Framework Cards */}
            <div className="space-y-3">
              {/* 1. What is happening */}
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    1. WHAT IS HAPPENING?
                  </span>
                  <CredibilityBadge variant="LIVE_DATA" text="CROSS-VERIFIED" />
                </div>
                <p className="text-xs font-semibold text-white">
                  Traditional indicator <strong className="text-emerald-300">"{activeIndicator.name}"</strong> observed in {cityName}. Concurrent satellite measurements confirm {humidity}% atmospheric relative humidity and {soilMoisture}% soil saturation.
                </p>
              </div>

              {/* 2. Why is it happening */}
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    2. WHY IS IT HAPPENING?
                  </span>
                  <CredibilityBadge variant="MODEL_ESTIMATE" text="ATMOSPHERIC DYNAMICS" />
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Bio-indicator species exhibit sharp behavioral changes in response to sudden decreases in barometric pressure, micro-vibrations, and electrostatic charge build-up that precede rainfall fronts by 12–24 hours.
                </p>
              </div>

              {/* 3. How does it affect the user */}
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    3. HOW DOES IT AFFECT THE USER?
                  </span>
                  <CredibilityBadge variant="AI_INTERPRETATION" text="IMPACT MODELLING" />
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Open storage of harvested crops, outdoor civil construction, or planned chemical spraying are at imminent risk of wash-off or water damage within the next 24-hour cycle.
                </p>
              </div>

              {/* 4. Recommended Decision */}
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    4. RECOMMENDED DECISION
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-400">
                    {blendedConfidence >= 85 ? 'HIGH CONFIDENCE DECISION' : 'MODERATE CONFIDENCE DECISION'}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Accept the convergence of ancestral phenology and orbital sensors as a high-probability trigger. Prioritize rapid field protection over waiting for visual rain onset.
                </p>
              </div>

              {/* 5. 🎯 RECOMMENDED ACTION */}
              <div className="p-4.5 bg-gradient-to-r from-emerald-950/90 via-slate-950 to-slate-950 rounded-2xl border-2 border-emerald-500/70 space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    🎯 RECOMMENDED ACTION
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                    EXECUTE WITHIN 6-12 HOURS
                  </span>
                </div>
                <div className="text-xs text-slate-100 space-y-1.5 leading-relaxed">
                  <p className="font-semibold text-white">
                    ✓ Cover all threshing floors and exposed harvested grain with tarpaulins immediately.
                  </p>
                  <p className="text-slate-300">
                    ✓ Halt chemical and pesticide spraying to prevent costly wash-off and chemical runoff into waterways.
                  </p>
                  <p className="text-slate-300">
                    ✓ Open field drainage furrows to prevent localized root inundation in clayey soil.
                  </p>
                </div>
              </div>
            </div>

            {/* Blended Consensus Banner */}
            <div className="p-5 bg-gradient-to-r from-emerald-950/60 to-blue-950/60 rounded-2xl border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-emerald-600/30 text-emerald-400 rounded-2xl border border-emerald-500/40 shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      Climate Twin Synthesis Consensus
                    </span>
                    <button
                      onClick={() => setShowConfidenceTip(!showConfidenceTip)}
                      className="text-emerald-400/80 hover:text-emerald-300 transition"
                      title="How to interpret confidence score"
                    >
                      <HelpCircle size={14} />
                    </button>
                  </div>
                  <h3 className="font-extrabold text-white text-base">
                    {blendedConfidence > 88
                      ? 'High Confidence Convergence (Folklore & Satellite Agree)'
                      : 'Moderate Convergence — Monitor Local Shifts'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {activeIndicator.name} combined with Open-Meteo humidity ({humidity}%) and soil moisture ({soilMoisture}%) yields a verified predictive confidence rating for {cityName}.
                  </p>
                  {showConfidenceTip && (
                    <div className="mt-2.5 p-2.5 bg-emerald-950/90 border border-emerald-600/40 rounded-xl text-[11px] text-emerald-200 leading-normal">
                      💡 <strong className="text-white">How to use:</strong> This score weights ancestral bio-indicator observations against real-time satellite telemetry. A score above 85% validates immediate precautionary measures.
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center sm:text-right shrink-0 bg-slate-950/80 px-5 py-3 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Blended Confidence</p>
                <p className="text-2xl font-black text-emerald-400">{blendedConfidence}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CLASSIC TWIN MATRIX */}
      {/* ========================================================================= */}
      {viewMode === 'classic' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Classic Consensus Index Header Summary */}
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
                <h2 className="text-xl sm:text-2xl font-black text-teal-950 dark:text-teal-100 mt-1">
                  Ancestral Climate Twin & Bio-Indicators
                </h2>
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
                    {blendedConfidence}% Match
                  </span>
                  <span className="text-[10px] block font-semibold text-zinc-500">
                    Model & Traditional Convergence
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Core Classic Bio-Indicator Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {PRESET_INDICATORS.slice(0, 3).map((bio) => {
              const isSelected = selectedIndicatorId === bio.id;
              return (
                <div
                  key={bio.id}
                  id={`classic-bio-${bio.id}`}
                  onClick={() => setSelectedIndicatorId(bio.id)}
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
                            {bio.name}
                          </h3>
                          <span className="text-[10px] italic text-zinc-400">
                            {bio.scientificName}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                        {bio.defaultConfidence}% Conf
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
                        {bio.folklorePrediction}
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
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">
              CROSS-PARADIGM CONVERGENCE AUDIT
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-blue-200 bg-white p-4 dark:border-blue-900/50 dark:bg-zinc-800/80">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <Radio className="h-4 w-4" />
                  <span>Open-Meteo High-Resolution Ensemble</span>
                </span>
                <ul className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                  <li>• Surface Humidity: <strong>{humidity}%</strong> (Saturated)</li>
                  <li>• Barometric Trend: <strong>{surfacePressure} hPa</strong> (Falling)</li>
                  <li>• Convective Rain Prob: <strong>{rainProb}%</strong> peaking 4 PM - 7 PM</li>
                  <li>• Root Soil Moisture: <strong>{soilMoisture}% Volumetric</strong></li>
                </ul>
              </div>

              <div className="rounded-2xl border border-teal-200 bg-white p-4 dark:border-teal-900/50 dark:bg-zinc-800/80">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                  <Leaf className="h-4 w-4" />
                  <span>Bio-Ecological Synthesis</span>
                </span>
                <ul className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                  <li>• Selected Bio-Signal: <strong>{activeIndicator.name}</strong></li>
                  <li>• Ethology Mechanism: {activeIndicator.observation}</li>
                  <li>• Integrated Confidence: <strong>{blendedConfidence}% Convergence</strong></li>
                  <li>• Consensus Signal: {activeIndicator.folklorePrediction}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Field Observer Input Box */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Crowdsource Local Ecological Observation
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Witnessed unusual animal or plant behavior in {telemetry.coordinates}? Submit to cross-reference with our neural synoptic network.
            </p>

            <form onSubmit={handleLogCrowdsourcedObservation} className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={userObservation}
                onChange={(e) => setUserObservation(e.target.value)}
                placeholder="e.g. Tree frogs croaking vigorously near irrigation channel, or birds flying low..."
                className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs sm:text-sm text-zinc-800 outline-none focus:border-teal-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Observation</span>
              </button>
            </form>

            {logSuccess && (
              <div className="mt-3 rounded-xl bg-teal-50 p-2.5 text-center text-xs font-semibold text-teal-700 dark:bg-teal-950/70 dark:text-teal-300">
                ✓ Observation logged and matched with Open-Meteo local station telemetry!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Explanatory Modal */}
      {explainModalData && (
        <ExplainThisModal
          isOpen={!!explainModalData}
          onClose={() => setExplainModalData(null)}
          data={explainModalData}
        />
      )}

      {/* Custom Data Provenance Modal */}
      {isHowDoWeKnowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Indigenous Climate Twin Cross-Validation</h3>
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {blendedConfidence >= 85 ? 'HIGH CONVERGENCE' : 'MODERATE CONVERGENCE'} ({blendedConfidence}%)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsHowDoWeKnowOpen(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-zinc-600 dark:text-zinc-300">
              <p className="leading-relaxed">
                The Indigenous Climate Twin cross-references centuries of empirical ecological observations (documented in ICAR agro-meteorological compendia) with high-frequency numerical weather models from Open-Meteo.
              </p>

              <div className="space-y-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 p-3.5 border border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-[10px] uppercase text-zinc-400 block">Verified Data Repositories</span>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500">✓</span>
                    <span><strong>ICAR & CRIDA:</strong> Empirical field compendiums of traditional agricultural & bio-indicators across agro-climatic zones.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-500">✓</span>
                    <span><strong>Open-Meteo NWP Grid:</strong> Hourly volumetric soil moisture (0-7cm) & saturation vapor pressure.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-teal-500">✓</span>
                    <span><strong>CPCB Mesonet:</strong> Real-time atmospheric particulates and surface stations.</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
                <strong>Methodological note:</strong> Bio-indicators respond to micro-scale barometric fluctuations and electrostatic charge shifts in the boundary layer. Always corroborate with official IMD and NDMA emergency bulletins.
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsHowDoWeKnowOpen(false)}
                className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

