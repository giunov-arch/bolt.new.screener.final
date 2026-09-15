import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreBadgeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, label, size = 'md' }: ScoreBadgeProps) {
  const color =
    score >= 75 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : score >= 60 ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
    : score >= 45 ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-base px-4 py-1.5' : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border font-semibold ${color} ${sizeClass}`}>
      {score}
      {label && <span className="opacity-60 font-normal">{label}</span>}
    </span>
  );
}

interface SignalBadgeProps {
  type: 'bullish' | 'bearish' | 'neutral';
  children: React.ReactNode;
}

export function SignalBadge({ type, children }: SignalBadgeProps) {
  const config = {
    bullish: { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: TrendingUp },
    bearish: { color: 'bg-rose-500/15 text-rose-400 border-rose-500/30', icon: TrendingDown },
    neutral: { color: 'bg-slate-500/15 text-slate-400 border-slate-500/30', icon: Minus },
  };
  const { color, icon: Icon } = config[type];

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {children}
    </span>
  );
}

interface ActionBadgeProps {
  action: 'Strong Buy' | 'Buy' | 'Hold' | 'Wait' | 'Avoid';
}

export function ActionBadge({ action }: ActionBadgeProps) {
  const config = {
    'Strong Buy': 'bg-emerald-500 text-white',
    'Buy': 'bg-sky-500 text-white',
    'Hold': 'bg-amber-500 text-white',
    'Wait': 'bg-orange-500 text-white',
    'Avoid': 'bg-rose-500 text-white',
  };

  return (
    <span className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-bold ${config[action]}`}>
      {action}
    </span>
  );
}

interface ChangeBadgeProps {
  value: number;
  showSign?: boolean;
}

export function ChangeBadge({ value, showSign = true }: ChangeBadgeProps) {
  const isPositive = value >= 0;
  const color = isPositive ? 'text-emerald-400' : 'text-rose-400';
  const sign = isPositive && showSign ? '+' : '';

  return (
    <span className={`inline-flex items-center gap-0.5 font-semibold ${color}`}>
      {sign}{value.toFixed(1)}%
    </span>
  );
}
