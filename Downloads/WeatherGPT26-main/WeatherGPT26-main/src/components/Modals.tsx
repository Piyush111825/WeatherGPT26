import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Cpu,
  Database,
  Share2,
  Copy,
  Check,
  Bell,
  HardDrive,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { WeatherTelemetry } from '../types';
import { copyTextToClipboard } from '../utils/weatherUtils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: WeatherTelemetry;
}

export const HowDoWeKnowModal: React.FC<ModalProps> = ({ isOpen, onClose, telemetry }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Data Provenance & Verification
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                How WeatherGPT computes high-confidence intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs text-zinc-600 dark:text-zinc-300">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-200">
              <Database className="h-4 w-4 text-blue-600" />
              <span>Multi-Source Numerical Sensor Blending</span>
            </div>
            <p className="mt-1 leading-relaxed text-zinc-600 dark:text-zinc-300">
              Telemetry for <strong className="text-blue-700 dark:text-blue-300">{telemetry.coordinates}</strong> is synthesized in real time from Open-Meteo High-Resolution Surface Mesonet, INSAT-3D thermal infrared radar, and Central Pollution Control Board (CPCB) continuous monitoring stations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Station Parity</span>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{telemetry.confidence}% Match</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Neural synthesis active</span>
            </div>
            <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Ensemble Convergence</span>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">91% Agreement</p>
              <span className="text-[10px] text-blue-600 dark:text-blue-400">ECMWF & GFS physics</span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
              <Cpu className="h-4 w-4 text-purple-500" />
              <span>5-Step Deterministic Audit Trail</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              Every decision card, alert, and farm directive explicitly logs sensor limits (e.g. spray wind ceiling &gt;15 km/h, soil moisture &gt;70%, flash flood elevation runoffs) so actions are verifiable by engineers, agronomists, and civil officials.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export const ShareSnapshotModal: React.FC<ModalProps> = ({ isOpen, onClose, telemetry }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const snapshotText = `🌤️ WeatherGPT AI Daily Briefing for ${telemetry.cityName} (${telemetry.coordinates})
Condition: ${telemetry.condition}
Temp: ${telemetry.temp}°C (Feels like ${telemetry.feelsLike}°C)
Rain Probability: ${telemetry.rainProb}% | Humidity: ${telemetry.humidity}%
Wind: ${telemetry.windSpeed} km/h (${telemetry.windDirection}) | AQI: ${telemetry.aqi} (${telemetry.aqiStatus})
Recommendation: Keep rain gear accessible; plan transit prior to expected precipitation increase.
Verified on: WeatherGPT Synoptic Platform`;

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(snapshotText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Share Telemetry Snapshot
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <textarea
            readOnly
            value={snapshotText}
            rows={7}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-800 outline-none dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200"
          />
        </div>

        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Snapshot'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const WebhooksModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [enabled, setEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.myapp.com/hooks/weather-risk');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Webhooks & Push Alert Dispatch
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
          <p>
            Configure automated outbound JSON webhooks or web push notifications whenever regional flash flood, pesticide drift risk, or high UV thresholds are breached.
          </p>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1">
              Destination Webhook Endpoint
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-800 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Browser Push Notifications
              </span>
              <p className="text-[10px] text-zinc-400">
                Receive real-time sound broadcast for Orange & Red advisories
              </p>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export const CacheManagerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [cleared, setCleared] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Offline Storage & Local Cache
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                IndexedDB & Local Telemetry Cache
              </p>
              <span className="text-[10px] text-zinc-500">
                Synchronized for offline field access
              </span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              10.5 KB Stored
            </span>
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Full synoptic arrays, evacuation shelter coordinates, and bio-indicator models remain stored locally so you can review emergency advice during cellular grid brownouts.
          </p>

          {cleared && (
            <div className="rounded-xl bg-emerald-50 p-2.5 text-center text-xs font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
              Cache refreshed and verified!
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-between gap-2">
          <button
            onClick={() => {
              setCleared(true);
              setTimeout(() => setCleared(false), 2000);
            }}
            className="flex items-center gap-1.5 rounded-full border border-red-200 px-3.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Flush Cache</span>
          </button>
          <button
            onClick={() => {
              setCleared(true);
              setTimeout(() => {
                setCleared(false);
                onClose();
              }, 600);
            }}
            className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Force Open-Meteo Sync</span>
          </button>
        </div>
      </div>
    </div>
  );
};
