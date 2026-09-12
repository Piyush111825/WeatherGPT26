import React, { useState, useEffect } from 'react';
import {
  OperationalPersona,
  WeatherTelemetry,
  ChatMessage,
  PlanEvaluationResult,
} from '../../types';
import { SITUATION_SCENARIOS } from '../../data/weatherData';
import { speakText, stopSpeaking, evaluatePlan } from '../../utils/weatherUtils';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface ChatViewProps {
  telemetry: WeatherTelemetry;
  persona: OperationalPersona;
  onSelectPersona: (p: OperationalPersona) => void;
  onOpenHowDoWeKnow: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  telemetry,
  persona,
  onSelectPersona,
  onOpenHowDoWeKnow,
}) => {
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'weathergpt',
      text:
        language === 'HI'
          ? `नमस्ते! मैं WeatherGPT हूँ, आपका स्थानीय AI मौसम विशेषज्ञ। मैं ${telemetry.coordinates} के लिए लाइव IMD AWS मौसम डेटा की निगरानी कर रहा हूँ।\n\nवर्तमान तापमान: ${telemetry.temp}°C, आर्द्रता ${telemetry.humidity}%, हवा ${telemetry.windSpeed} km/h (${telemetry.windDirection}), वायु गुणवत्ता AQI ${telemetry.aqi}। मैं आज आपकी क्या सहायता कर सकता हूँ?`
          : `Namaste! I am WeatherGPT, your localized AI Meteorological Assistant. I am actively monitoring live IMD AWS telemetry for ${telemetry.coordinates}.\n\nCurrent Telemetry: ${telemetry.temp}°C, Humidity ${telemetry.humidity}%, Wind ${telemetry.windSpeed} km/h ${telemetry.windDirection}, AQI ${telemetry.aqi}. How may I assist your operations today?`,
      timestamp: 'Just now',
      grounded: true,
      confidence: 96,
      telemetrySummary: `${telemetry.coordinates} • ${telemetry.condition} • AQI ${telemetry.aqi}`,
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [showProvenance, setShowProvenance] = useState<Record<string, boolean>>({
    'msg-1': false,
  });

  // Situation Decision Engine State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('can-i-go-out');
  const activeScenario =
    SITUATION_SCENARIOS.find(s => s.id === selectedScenarioId) || SITUATION_SCENARIOS[0];

  // Plan Optimization Engine State
  const [planInput, setPlanInput] = useState('Can I travel at 6 PM?');
  const [planResult, setPlanResult] = useState<PlanEvaluationResult>(() =>
    evaluatePlan('Can I travel at 6 PM?', telemetry)
  );

  useEffect(() => {
    setPlanResult(evaluatePlan(planInput, telemetry));
  }, [telemetry]);

  const handleEvaluatePlan = (query: string) => {
    setPlanInput(query);
    setPlanResult(evaluatePlan(query, telemetry));
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputVal('');

    // AI dynamic response generation
    setTimeout(() => {
      let reply = '';
      const q = text.toLowerCase();

      if (q.includes('spray') || q.includes('crop') || q.includes('pesticide') || q.includes('farm')) {
        reply = `🌾 **Agronomic Directive for ${telemetry.coordinates}:**\n• **Decision**: 🔴 DELAY SPRAYING.\n• **Telemetry**: Current wind is ${telemetry.windSpeed} km/h with humidity at ${telemetry.humidity}% and rain chance at ${telemetry.rainProb}%.\n• **Wash-Off Risk**: 88% chemical runoff expected if applied within next 12 hours.\n• **Recommended Window**: Delay until tomorrow 4:00 PM when wind velocities drop below 12 km/h and convective cloud tops stabilize.`;
      } else if (q.includes('travel') || q.includes('commute') || q.includes('drive') || q.includes('6 pm')) {
        reply = `🚗 **Transit Analysis for ${telemetry.coordinates}:**\n• **Decision**: 🟡 MINOR CAUTION.\n• **Roadway State**: Slick tarmac and reduced braking friction expected during late afternoon peak.\n• **Recommendation**: Depart 15-20 minutes early. Maintain 3-second spacing on national and state highways. Avoid low-lying railway underpasses.`;
      } else if (q.includes('wear') || q.includes('cloth')) {
        reply = `👕 **Wardrobe Recommendation:**\n• **Feels-like Index**: ${telemetry.feelsLike}°C with high humidity (${telemetry.humidity}%).\n• **Guidance**: Wear breathable, loose-fitting cotton or quick-drying activewear.\n• **Precaution**: Pack a lightweight foldable umbrella or water-resistant shell in your day pack.`;
      } else if (q.includes('flood') || q.includes('danger') || q.includes('disaster') || q.includes('sos')) {
        reply = `🚨 **Civil Defense & Flash Flood Assessment:**\n• **Advisory Level**: 🟠 CAUTION (Low-lying inundation monitored).\n• **Drainage Status**: Watershed capacity at 84% (Warning threshold: 95%).\n• **Nearest Relief Facility**: Central Community & Relief Stadium (1.4 km).\n• **Emergency Lines**: Call 1077 (District Control) or 112 (National Emergency).`;
      } else if (q.includes('soil') || q.includes('irrigation')) {
        reply = `🚜 **Soil Moisture & Irrigation Timing:**\n• **Root Zone (0-7cm)**: ${telemetry.rootSoilMoisture}% volumetric.\n• **Deep Subsoil (7-28cm)**: ${telemetry.subsoilMoisture}%.\n• **Recommendation**: PAUSE tube-well irrigation. Incoming rainfall will replenish root horizons naturally, saving ~35,000 litres of pumped groundwater per acre.`;
      } else {
        reply = `🌤️ **Verified WeatherGPT Assessment for "${text}":**\n• **Station Conditions**: ${telemetry.condition}, ${telemetry.temp}°C (feels like ${telemetry.feelsLike}°C), Rain probability ${telemetry.rainProb}%.\n• **Impact Overview**: Moderate atmospheric moisture with gentle surface breeze (${telemetry.windSpeed} km/h).\n• **Operational Advice**: Normal scheduling is favorable, but keep rain gear accessible for localized late afternoon convective precipitation.`;
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'weathergpt',
        text: reply,
        timestamp: 'Just now',
        grounded: true,
        confidence: 94,
        telemetrySummary: `${telemetry.coordinates} • ${telemetry.temp}°C • Rain ${telemetry.rainProb}%`,
      };

      setMessages(prev => [...prev, aiMsg]);
    }, 400);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'weathergpt',
        text:
          language === 'HI'
            ? `सत्र साफ़ किया गया। ${telemetry.coordinates} के लिए मैं आपकी क्या सहायता करूँ?`
            : `Chat cleared. Actively monitoring ${telemetry.coordinates} telemetry. What would you like to evaluate?`,
        timestamp: 'Just now',
        grounded: true,
        confidence: 96,
      },
    ]);
  };

  return (
    <div className="space-y-5 pb-28">
      {/* Top Controls Bar */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Persona selector pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => onSelectPersona('farmer')}
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                persona === 'farmer'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              Farmer
            </button>
            <button
              onClick={() => onSelectPersona('disaster')}
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                persona === 'disaster'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              Disaster Manager
            </button>
            <button
              onClick={() => onSelectPersona('citizen')}
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                persona === 'citizen'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              General
            </button>
          </div>

          {/* Right Language & Clear Chat */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-800">
              <button
                onClick={() => setLanguage('EN')}
                className={`rounded-full px-2.5 py-0.5 transition-colors ${
                  language === 'EN' ? 'bg-white text-blue-600 shadow-xs dark:bg-zinc-900 dark:text-blue-400' : 'text-zinc-500'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('HI')}
                className={`rounded-full px-2.5 py-0.5 transition-colors ${
                  language === 'HI' ? 'bg-white text-blue-600 shadow-xs dark:bg-zinc-900 dark:text-blue-400' : 'text-zinc-500'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <button
              onClick={handleClearChat}
              className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ask by Situation Decision Engine */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            ASK BY SITUATION ({telemetry.coordinates})
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Select a real-world scenario to receive verified meteorological decision support.
          </p>
        </div>

        {/* 6 Situation Scenario Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {SITUATION_SCENARIOS.map(s => {
            const isSelected = s.id === selectedScenarioId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedScenarioId(s.id)}
                className={`rounded-2xl border px-3 py-3 text-center transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 font-bold text-blue-700 ring-1 ring-blue-600 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300'
                }`}
              >
                <span className="text-xs sm:text-sm block">{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Decision Card */}
        <div className="mt-4 rounded-3xl border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/60 pb-3 dark:border-zinc-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                DECISION FOR {activeScenario.title.toUpperCase()}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <AlertTriangle
                  className={`h-5 w-5 ${
                    activeScenario.decisionType === 'danger'
                      ? 'text-red-500'
                      : activeScenario.decisionType === 'caution'
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }`}
                />
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  {activeScenario.decision}
                </h3>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 self-start sm:self-auto">
              Confidence: {activeScenario.confidence}% ({activeScenario.confidenceLevel})
            </span>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-zinc-200/60 dark:border-zinc-800">
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span>🎯 RECOMMENDED ACTION</span>
              </span>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 mt-0.5">
                {activeScenario.recommendedAction}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Optimization Engine ("Ask About My Plan") */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
              PLAN OPTIMIZATION ENGINE
            </span>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Ask About My Plan
            </h2>
          </div>
        </div>

        {/* 1-Tap Instant Question Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            'Can I travel at 6 PM?',
            'Is it safe to play cricket this evening?',
            'What should I wear today?',
            'Can I go for a walk?',
            'Will weather affect my journey?',
          ].map(q => (
            <button
              key={q}
              onClick={() => {
                handleEvaluatePlan(q);
                handleSendMessage(q);
              }}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700 hover:border-blue-400 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-blue-500"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={planInput}
            onChange={e => setPlanInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleEvaluatePlan(planInput);
                handleSendMessage(planInput);
              }
            }}
            placeholder="Ask anything (e.g. Can I wash my car at 3 PM?)"
            className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs sm:text-sm text-zinc-800 outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          />
          <button
            onClick={() => {
              handleEvaluatePlan(planInput);
              handleSendMessage(planInput);
            }}
            className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shrink-0"
          >
            Evaluate
          </button>
        </div>

        {/* Evaluated Plan Result Card */}
        <div className="mt-4 rounded-3xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2.5 dark:border-zinc-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400">EVALUATED QUERY</span>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                "{planResult.query}"
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                planResult.riskClass === 'red'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  : planResult.riskClass === 'yellow'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {planResult.riskLevel}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">WEATHER IMPACT:</span>
              <p className="mt-0.5 text-zinc-600 dark:text-zinc-300">{planResult.impactDescription}</p>
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">WHAT TO EXPECT:</span>
              <p className="mt-0.5 text-zinc-600 dark:text-zinc-300">{planResult.whatToExpect}</p>
            </div>
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">AI RECOMMENDATION:</span>
              <p className="mt-0.5 font-medium text-emerald-950 dark:text-emerald-200">
                {planResult.aiRecommendation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversational Stream */}
      <div className="space-y-3.5">
        {messages.map(msg => {
          const isAI = msg.sender === 'weathergpt';
          const isProvOpen = showProvenance[msg.id];
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                  isAI
                    ? 'border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {isAI && (
                  <div className="mb-2.5 flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        WeatherGPT Grounded Intel
                      </span>
                      {msg.grounded && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          GROUNDED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400">{msg.timestamp}</span>
                      <button
                        onClick={() => speakText(msg.text)}
                        title="Listen to message"
                        className="rounded-full p-1 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="whitespace-pre-line text-zinc-700 dark:text-zinc-200">
                  {msg.text}
                </div>

                {isAI && (
                  <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                    <button
                      onClick={() =>
                        setShowProvenance(prev => ({
                          ...prev,
                          [msg.id]: !prev[msg.id],
                        }))
                      }
                      className="flex items-center gap-1 text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      <span>Data Provenance & Reasoning</span>
                      {isProvOpen ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {msg.confidence || 95}% Confidence
                    </span>
                  </div>
                )}

                {isProvOpen && (
                  <div className="mt-2 rounded-xl bg-zinc-50 p-3 text-[11px] text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300">
                    <p>
                      <strong>Sensor Baseline:</strong> Open-Meteo AWS Agronet station {telemetry.coordinates}. Synoptic temperature {telemetry.temp}°C, humidity {telemetry.humidity}%, surface pressure {telemetry.surfacePressure} hPa.
                    </p>
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Box */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-2.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={`Ask WeatherGPT about ${telemetry.coordinates} weather, spray timings, flood risks...`}
            className="flex-1 rounded-full border-none bg-transparent px-4 py-2 text-xs sm:text-sm text-zinc-800 outline-none placeholder-zinc-400 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
          <button
            onClick={() => handleSendMessage()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
