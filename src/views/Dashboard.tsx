import { useMemo } from 'react';
import { Stock } from '@/types';
import { ScoreBadge } from '@/components/Badges';
import { PriceChart, GaugeBar } from '@/components/Charts';
import { StockCard } from '@/components/StockCard';
import { TrendingUp, Activity, BarChart3, Award, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface DashboardProps {
  stocks: Stock[];
  onSelectStock: (ticker: string) => void;
  onNavigate: (view: string) => void;
}

export function Dashboard({ stocks, onSelectStock, onNavigate }: DashboardProps) {
  const stats = useMemo(() => {
    const avgScore = stocks.reduce((s, x) => s + x.overallScore, 0) / stocks.length;
    const gainers = stocks.filter((s) => s.price > s.priceHistory[0]).length;
    const losers = stocks.length - gainers;
    const avgDividend = stocks.reduce((s, x) => s + x.dividendYield, 0) / stocks.length;
    const avgPE = stocks.filter((s) => s.peRatio > 0).reduce((s, x) => s + x.peRatio, 0) / stocks.filter((s) => s.peRatio > 0).length;
    return { avgScore, gainers, losers, avgDividend, avgPE };
  }, [stocks]);

  const topPicks = useMemo(() => [...stocks].sort((a, b) => b.overallScore - a.overallScore).slice(0, 6), [stocks]);
  const topTechnical = useMemo(() => [...stocks].sort((a, b) => b.technicalScore - a.technicalScore).slice(0, 4), [stocks]);
  const breakoutStocks = useMemo(() => stocks.filter((s) => s.bollingerBreakout !== null), [stocks]);

  const sectorStats = useMemo(() => {
    const map = new Map<string, { count: number; avgScore: number }>();
    stocks.forEach((s) => {
      const ex = map.get(s.sector) || { count: 0, avgScore: 0 };
      map.set(s.sector, { count: ex.count + 1, avgScore: ex.avgScore + s.overallScore });
    });
    return Array.from(map.entries()).map(([sector, data]) => ({
      sector,
      count: data.count,
      avgScore: data.avgScore / data.count,
    })).sort((a, b) => b.avgScore - a.avgScore);
  }, [stocks]);

  return (
    <div className="space-y-6">
      {/* Hero stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Stocks Tracked"
          value={stocks.length.toString()}
          sub="Borsa Italiana"
          color="sky"
        />
        <StatCard
          icon={TrendingUp}
          label="Advancing"
          value={stats.gainers.toString()}
          sub={`${stats.losers} declining`}
          color="emerald"
        />
        <StatCard
          icon={BarChart3}
          label="Avg P/E Ratio"
          value={stats.avgPE.toFixed(1)}
          sub="Market valuation"
          color="amber"
        />
        <StatCard
          icon={Award}
          label="Avg Dividend Yield"
          value={`${stats.avgDividend.toFixed(1)}%`}
          sub="Across all stocks"
          color="violet"
        />
      </div>

      {/* Bollinger Band Breakout Alerts */}
      {breakoutStocks.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Bollinger Band Breakouts</h2>
            <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-400 rounded-full">{breakoutStocks.length}</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {breakoutStocks.map((stock) => {
              const isUpper = stock.bollingerBreakout === 'upper';
              const Icon = isUpper ? ArrowUpCircle : ArrowDownCircle;
              return (
                <button
                  key={stock.ticker}
                  onClick={() => onSelectStock(stock.ticker)}
                  className={`group flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                    isUpper
                      ? 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50'
                      : 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isUpper ? 'text-rose-400' : 'text-emerald-400'}`} />
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{stock.ticker}</span>
                      <span className={`text-xs font-medium ${isUpper ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isUpper ? 'Upper break' : 'Lower break'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-slate-300">€{stock.price.toFixed(2)}</span>
                      <span className="text-xs text-slate-500">
                        Band: €{isUpper ? stock.bollingerUpper.toFixed(2) : stock.bollingerLower.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Market overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Top Overall Picks</h2>
            <button
              onClick={() => onNavigate('screener')}
              className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
            >
              View all →
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topPicks.map((stock) => (
              <StockCard key={stock.ticker} stock={stock} onClick={onSelectStock} />
            ))}
          </div>
        </div>

        {/* Sector breakdown */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Sector Performance</h2>
          <div className="space-y-3">
            {sectorStats.map((s) => (
              <div key={s.sector}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{s.sector}</span>
                  <span className="text-slate-500 text-xs">{s.count} stocks</span>
                </div>
                <GaugeBar value={s.avgScore} label="" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best technical entries */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Best Technical Entry Opportunities</h2>
            <p className="text-sm text-slate-400 mt-0.5">Stocks with the strongest technical setups for entry timing</p>
          </div>
          <button
            onClick={() => onNavigate('screener')}
            className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
          >
            Screen all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-700/50">
                <th className="pb-2 pr-4">Ticker</th>
                <th className="pb-2 pr-4">Price</th>
                <th className="pb-2 pr-4 hidden md:table-cell">Chart</th>
                <th className="pb-2 pr-4">RSI</th>
                <th className="pb-2 pr-4 hidden sm:table-cell">SMA50</th>
                <th className="pb-2 pr-4">Tech Score</th>
                <th className="pb-2 pr-4 hidden lg:table-cell">Fund Score</th>
                <th className="pb-2">Overall</th>
              </tr>
            </thead>
            <tbody>
              {topTechnical.map((stock) => {
                const vsSma50 = ((stock.price - stock.sma50) / stock.sma50) * 100;
                return (
                  <tr
                    key={stock.ticker}
                    onClick={() => onSelectStock(stock.ticker)}
                    className="border-b border-slate-700/20 hover:bg-slate-700/20 cursor-pointer transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-white">{stock.ticker}</div>
                      <div className="text-xs text-slate-500 max-w-[120px] truncate">{stock.name}</div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-white">€{stock.price.toFixed(2)}</td>
                    <td className="py-3 pr-4 hidden md:table-cell w-32">
                      <PriceChart data={stock.priceHistory} height={30} color="auto" />
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`font-mono ${stock.rsi < 30 ? 'text-emerald-400' : stock.rsi > 70 ? 'text-rose-400' : 'text-slate-300'}`}>
                        {stock.rsi.toFixed(0)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      <span className={`font-mono text-xs ${vsSma50 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {vsSma50 >= 0 ? '+' : ''}{vsSma50.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 pr-4"><ScoreBadge score={stock.technicalScore} size="sm" /></td>
                    <td className="py-3 pr-4 hidden lg:table-cell"><ScoreBadge score={stock.fundamentalScore} size="sm" /></td>
                    <td className="py-3"><ScoreBadge score={stock.overallScore} size="sm" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <QuickActionCard
          icon={BarChart3}
          title="Screen Stocks"
          description="Filter Italian stocks by fundamentals like P/E, ROE, dividend yield, debt ratio, and growth."
          onClick={() => onNavigate('screener')}
          color="sky"
        />
        <QuickActionCard
          icon={Award}
          title="Build Portfolio"
          description="Get optimal allocation suggestions based on your risk tolerance and investment capital."
          onClick={() => onNavigate('portfolio')}
          color="emerald"
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-4">
      <div className={`inline-flex p-2 rounded-lg border ${colors[color]} mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, description, onClick, color }: { icon: any; title: string; description: string; onClick: () => void; color: string }) {
  const colors: Record<string, string> = {
    sky: 'group-hover:border-sky-500/50',
    emerald: 'group-hover:border-emerald-500/50',
  };

  return (
    <button
      onClick={onClick}
      className={`group text-left rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 transition-all hover:bg-slate-800/40 ${colors[color]}`}
    >
      <div className="flex items-start gap-4">
        <div className={`inline-flex p-3 rounded-lg border ${color === 'sky' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
    </button>
  );
}
