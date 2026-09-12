import React from 'react';
import { ShieldCheck, Activity, Cpu, CheckCircle } from 'lucide-react';

export type CredibilityVariant = 'LIVE_DATA' | 'MODEL_ESTIMATE' | 'AI_INTERPRETATION' | 'OFFICIAL_VERIFIED';

interface CredibilityBadgeProps {
  variant: CredibilityVariant;
  text?: string;
  className?: string;
}

export const CredibilityBadge: React.FC<CredibilityBadgeProps> = ({
  variant,
  text,
  className = '',
}) => {
  switch (variant) {
    case 'LIVE_DATA':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-400 tracking-wider uppercase ${className}`}
        >
          <Activity className="h-2.5 w-2.5" />
          <span>{text || 'LIVE SENSORS'}</span>
        </span>
      );
    case 'MODEL_ESTIMATE':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-blue-400 tracking-wider uppercase ${className}`}
        >
          <Cpu className="h-2.5 w-2.5" />
          <span>{text || 'MODEL ESTIMATE'}</span>
        </span>
      );
    case 'AI_INTERPRETATION':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-teal-300 tracking-wider uppercase ${className}`}
        >
          <ShieldCheck className="h-2.5 w-2.5" />
          <span>{text || 'TWIN CONSENSUS'}</span>
        </span>
      );
    case 'OFFICIAL_VERIFIED':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-amber-400 tracking-wider uppercase ${className}`}
        >
          <CheckCircle className="h-2.5 w-2.5" />
          <span>{text || 'OFFICIAL VERIFIED'}</span>
        </span>
      );
    default:
      return null;
  }
};
