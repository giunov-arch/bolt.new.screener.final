interface PriceChartProps {
  data: number[];
  height?: number;
  showAxis?: boolean;
  color?: string;
  fill?: boolean;
}

export function PriceChart({
  data,
  height = 60,
  showAxis = false,
  color = '#38bdf8',
  fill = true,
}: PriceChartProps) {
  if (data.length < 2) return null;

  const width = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = range * 0.1;
  const chartMin = min - padding;
  const chartMax = max + padding;
  const chartRange = chartMax - chartMin;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - chartMin) / chartRange) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  const lastPrice = data[data.length - 1];
  const firstPrice = data[0];
  const isUp = lastPrice >= firstPrice;
  const strokeColor = color === 'auto' ? (isUp ? '#34d399' : '#fb7185') : color;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: `${height}px` }}
    >
      {fill && (
        <defs>
          <linearGradient id={`grad-${strokeColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={areaPath} fill={`url(#grad-${strokeColor.replace('#', '')})`} />}
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {showAxis && (
        <>
          <text x="2" y="12" fill="#64748b" fontSize="8" className="font-mono">
            {max.toFixed(2)}
          </text>
          <text x="2" y={height - 4} fill="#64748b" fontSize="8" className="font-mono">
            {min.toFixed(2)}
          </text>
        </>
      )}
    </svg>
  );
}

interface VolumeChartProps {
  data: number[];
  height?: number;
}

export function VolumeChart({ data, height = 30 }: VolumeChartProps) {
  if (data.length < 2) return null;

  const width = 100;
  const max = Math.max(...data);
  const barWidth = width / data.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: `${height}px` }}
    >
      {data.map((val, i) => {
        const barHeight = (val / max) * height;
        const isUp = i > 0 ? data[i] >= data[i - 1] : true;
        return (
          <rect
            key={i}
            x={i * barWidth}
            y={height - barHeight}
            width={barWidth * 0.7}
            height={barHeight}
            fill={isUp ? '#34d39940' : '#fb718540'}
          />
        );
      })}
    </svg>
  );
}

interface GaugeBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
}

export function GaugeBar({ value, max = 100, label, color }: GaugeBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const autoColor =
    percentage >= 75 ? 'bg-emerald-500'
    : percentage >= 60 ? 'bg-sky-500'
    : percentage >= 45 ? 'bg-amber-500'
    : 'bg-rose-500';

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{label}</span>
          <span className="font-mono font-semibold text-slate-300">{value.toFixed(0)}</span>
        </div>
      )}
      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color || autoColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface RadialScoreProps {
  score: number;
  size?: number;
  label?: string;
}

export function RadialScore({ score, size = 120, label }: RadialScoreProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#34d399' : score >= 60 ? '#38bdf8' : score >= 45 ? '#fbbf24' : '#fb7185';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{score}</span>
        {label && <span className="text-xs text-slate-400 mt-0.5">{label}</span>}
      </div>
    </div>
  );
}
