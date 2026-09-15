import { Stock } from '@/types';
import { ScoreBadge } from '@/components/Badges';
import { PriceChart } from '@/components/Charts';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

interface StockCardProps {
  stock: Stock;
  onClick: (ticker: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (ticker: string) => void;
}

export function StockCard({ stock, onClick, isSelected, onToggleSelect }: StockCardProps) {
  const priceChange = ((stock.price - stock.priceHistory[0]) / stock.priceHistory[0]) * 100;
  const isUp = priceChange >= 0;
  const hasBreakout = stock.bollingerBreakout !== null;
  const isUpperBreak = stock.bollingerBreakout === 'upper';

  return (
    <div
      onClick={() => onClick(stock.ticker)}
      className={`group relative cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:border-sky-500/50 hover:bg-slate-800/40 ${
        hasBreakout
          ? isUpperBreak
            ? 'border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/20'
            : 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20'
          : isSelected
          ? 'border-sky-500 bg-sky-500/5'
          : 'border-slate-700/50 bg-slate-800/20'
      }`}
    >
      {onToggleSelect && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(stock.ticker);
          }}
          className={`absolute top-3 right-3 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
            isSelected
              ? 'border-sky-500 bg-sky-500 text-white'
              : 'border-slate-600 hover:border-sky-500'
          }`}
        >
          {isSelected && <ChevronRight className="w-3 h-3 -rotate-45" />}
        </button>
      )}

      <div className="flex items-start justify-between mb-2 pr-8">
        <div>
          <h3 className="font-semibold text-white text-sm">{stock.ticker}</h3>
          <p className="text-xs text-slate-400 truncate max-w-[160px]">{stock.name}</p>
        </div>
        <ScoreBadge score={stock.overallScore} size="sm" />
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <span className="text-lg font-bold text-white font-mono">€{stock.price.toFixed(2)}</span>
          <span className={`ml-2 text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isUp ? '+' : ''}{priceChange.toFixed(1)}%
          </span>
          {hasBreakout && (
            <span className={`ml-2 inline-flex items-center gap-0.5 text-xs font-semibold ${
              isUpperBreak ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {isUpperBreak ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isUpperBreak ? 'Band break' : 'Band break'}
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <PriceChart data={stock.priceHistory} height={40} color="auto" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-slate-500">P/E</span>
          <p className="text-slate-300 font-mono">{stock.peRatio > 0 ? stock.peRatio.toFixed(1) : 'N/A'}</p>
        </div>
        <div>
          <span className="text-slate-500">Div Yield</span>
          <p className="text-slate-300 font-mono">{stock.dividendYield.toFixed(1)}%</p>
        </div>
        <div>
          <span className="text-slate-500">ROE</span>
          <p className="text-slate-300 font-mono">{stock.roe.toFixed(1)}%</p>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-700/30 flex items-center justify-between text-xs">
        <span className="text-slate-500">{stock.sector}</span>
        <span className={`px-1.5 py-0.5 rounded font-medium ${
          stock.recommendation === 'Strong Buy' ? 'bg-emerald-500/15 text-emerald-400'
          : stock.recommendation === 'Buy' ? 'bg-sky-500/15 text-sky-400'
          : stock.recommendation === 'Hold' ? 'bg-amber-500/15 text-amber-400'
          : stock.recommendation === 'Wait' ? 'bg-orange-500/15 text-orange-400'
          : 'bg-rose-500/15 text-rose-400'
        }`}>
          {stock.recommendation}
        </span>
      </div>
    </div>
  );
}
