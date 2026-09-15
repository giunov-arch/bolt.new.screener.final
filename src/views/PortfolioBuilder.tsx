import { useState, useMemo } from 'react';
import { Stock, PortfolioAllocation } from '@/types';
import { buildPortfolio, getSectorBreakdown } from '@/lib/analysis';
import { ScoreBadge } from '@/components/Badges';
import { GaugeBar } from '@/components/Charts';
import { Shield, Scale, Zap, Plus, X, PieChart, TrendingUp, DollarSign, AlertCircle, Target, LineChart } from 'lucide-react';

interface PortfolioBuilderProps {
  stocks: Stock[];
  selectedTickers: string[];
  onToggleSelect: (ticker: string) => void;
  onClearSelection: () => void;
  onSelectStock: (ticker: string) => void;
}

type RiskTolerance = 'conservative' | 'balanced' | 'aggressive';

export function PortfolioBuilder({ stocks, selectedTickers, onToggleSelect, onClearSelection, onSelectStock }: PortfolioBuilderProps) {
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('balanced');
  const [capital, setCapital] = useState(10000);

  const portfolio = useMemo(
    () => buildPortfolio(stocks, selectedTickers, riskTolerance, capital),
    [stocks, selectedTickers, riskTolerance, capital]
  );

  const sectorBreakdown = useMemo(() => getSectorBreakdown(stocks, selectedTickers), [stocks, selectedTickers]);
  const selectedStocks = stocks.filter((s) => selectedTickers.includes(s.ticker));

  const riskConfig = {
    conservative: { icon: Shield, label: 'Conservative', desc: 'Capital preservation, income focus', color: 'sky', fundamentalWeight: 0.7 },
    balanced: { icon: Scale, label: 'Balanced', desc: 'Growth + income blend', color: 'emerald', fundamentalWeight: 0.55 },
    aggressive: { icon: Zap, label: 'Aggressive', desc: 'Maximum growth potential', color: 'amber', fundamentalWeight: 0.4 },
  };

  const colors = ['#38bdf8', '#34d399', '#fbbf24', '#fb7185', '#a78bfa', '#f97316', '#06b6d4', '#ec4899'];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Portfolio Builder</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Build a medium-term portfolio with fundamentals-driven selection and technical entry timing
        </p>
      </div>

      {/* Settings */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Risk tolerance */}
        <div className="lg:col-span-2 rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Risk Tolerance</h3>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(riskConfig) as RiskTolerance[]).map((risk) => {
              const config = riskConfig[risk];
              const Icon = config.icon;
              const isActive = riskTolerance === risk;
              const colorClasses: Record<string, string> = {
                sky: isActive ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-slate-700/50 text-slate-400 hover:border-sky-500/30',
                emerald: isActive ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700/50 text-slate-400 hover:border-emerald-500/30',
                amber: isActive ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-slate-700/50 text-slate-400 hover:border-amber-500/30',
              };
              return (
                <button
                  key={risk}
                  onClick={() => setRiskTolerance(risk)}
                  className={`p-4 rounded-xl border text-left transition-all ${colorClasses[config.color]}`}
                >
                  <Icon className="w-5 h-5 mb-2" />
                  <p className="font-semibold text-sm text-white">{config.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{config.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Capital input */}
          <div className="mt-5 pt-5 border-t border-slate-700/30">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-slate-400">Investment Capital</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-lg">€</span>
                <input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Math.max(1000, parseFloat(e.target.value) || 0))}
                  className="w-32 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-lg font-mono font-semibold text-white focus:outline-none focus:border-sky-500/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[5000, 10000, 25000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setCapital(amt)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    capital === amt
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                      : 'bg-slate-700/30 text-slate-400 border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  €{amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio summary */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Portfolio Summary</h3>
          {portfolio.allocations.length === 0 ? (
            <div className="text-center py-6">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Select stocks to build your portfolio</p>
            </div>
          ) : (
            <div className="space-y-4">
              <SummaryStat icon={TrendingUp} label="Expected Annual Return" value={`+${portfolio.expectedReturn.toFixed(1)}%`} color="emerald" />
              <SummaryStat icon={DollarSign} label="Expected Dividend Yield" value={`${portfolio.expectedDividend.toFixed(2)}%`} color="sky" />
              <SummaryStat icon={Shield} label="Risk Level" value={portfolio.riskLevel} color={portfolio.riskLevel === 'Low' ? 'emerald' : portfolio.riskLevel === 'Medium' ? 'amber' : 'rose'} />
              <SummaryStat icon={PieChart} label="Number of Holdings" value={portfolio.allocations.length.toString()} color="violet" />
              <div className="pt-3 border-t border-slate-700/30">
                <p className="text-xs text-slate-500 mb-1">Annual Dividend Income</p>
                <p className="text-xl font-bold text-emerald-400 font-mono">
                  €{(capital * portfolio.expectedDividend / 100).toFixed(0)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected stocks */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">
            Selected Stocks ({selectedTickers.length})
          </h3>
          {selectedTickers.length > 0 && (
            <button
              onClick={onClearSelection}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors inline-flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>
        {selectedTickers.length === 0 ? (
          <div className="text-center py-8">
            <Plus className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-3">No stocks selected yet. Add stocks from the screener to build your portfolio.</p>
            <p className="text-xs text-slate-600">Use the checkboxes in the screener to select stocks for your portfolio.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedStocks.map((stock) => (
              <div
                key={stock.ticker}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/30 border border-slate-700/50"
              >
                <button
                  onClick={() => onSelectStock(stock.ticker)}
                  className="text-sm font-medium text-white hover:text-sky-400 transition-colors"
                >
                  {stock.ticker}
                </button>
                <ScoreBadge score={stock.overallScore} size="sm" />
                <button
                  onClick={() => onToggleSelect(stock.ticker)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Allocations */}
      {portfolio.allocations.length > 0 && (
        <>
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Pie chart visualization */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Allocation Breakdown</h3>
              <div className="relative w-full aspect-square max-w-[220px] mx-auto">
                <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
                  {portfolio.allocations.reduce((acc: any[], alloc, i) => {
                    const prev = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
                    const angle = (alloc.weight / 100) * 360;
                    const endAngle = prev + angle;
                    const startRad = (prev * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    const largeArc = angle > 180 ? 1 : 0;
                    const x1 = 50 + 40 * Math.cos(startRad);
                    const y1 = 50 + 40 * Math.sin(startRad);
                    const x2 = 50 + 40 * Math.cos(endRad);
                    const y2 = 50 + 40 * Math.sin(endRad);
                    const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
                    acc.push({ path, color: colors[i % colors.length], endAngle, ticker: alloc.ticker, weight: alloc.weight });
                    return acc;
                  }, []).map((seg, i) => (
                    <path key={i} d={seg.path} fill={seg.color} stroke="#0f172a" strokeWidth="0.5" />
                  ))}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Capital</p>
                    <p className="text-sm font-bold text-white font-mono">€{capital.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                {portfolio.allocations.map((alloc, i) => (
                  <div key={alloc.ticker} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ background: colors[i % colors.length] }} />
                      <span className="text-slate-300 font-medium">{alloc.ticker}</span>
                    </div>
                    <span className="text-slate-400 font-mono">{alloc.weight.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Allocation table */}
            <div className="lg:col-span-2 rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Position Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-700/50">
                      <th className="pb-2 pr-3">Ticker</th>
                      <th className="pb-2 pr-3">Weight</th>
                      <th className="pb-2 pr-3">Amount</th>
                      <th className="pb-2 pr-3 hidden sm:table-cell">Price</th>
                      <th className="pb-2 pr-3 hidden md:table-cell">Shares</th>
                      <th className="pb-2">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.allocations.map((alloc, i) => {
                      const stock = stocks.find((s) => s.ticker === alloc.ticker)!;
                      const amount = (alloc.weight / 100) * capital;
                      const shares = Math.floor(amount / stock.price);
                      return (
                        <tr
                          key={alloc.ticker}
                          onClick={() => onSelectStock(alloc.ticker)}
                          className="border-b border-slate-700/20 hover:bg-slate-700/20 cursor-pointer transition-colors"
                        >
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }} />
                              <span className="font-semibold text-white">{alloc.ticker}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-3 font-mono text-slate-300">{alloc.weight.toFixed(1)}%</td>
                          <td className="py-3 pr-3 font-mono text-white">€{amount.toFixed(0)}</td>
                          <td className="py-3 pr-3 hidden sm:table-cell font-mono text-slate-400">€{stock.price.toFixed(2)}</td>
                          <td className="py-3 pr-3 hidden md:table-cell font-mono text-slate-400">{shares}</td>
                          <td className="py-3"><ScoreBadge score={stock.overallScore} size="sm" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Rationale */}
              <div className="mt-4 pt-4 border-t border-slate-700/30">
                <h4 className="text-xs font-semibold text-slate-400 mb-3">Allocation Rationale</h4>
                <div className="space-y-2">
                  {portfolio.allocations.map((alloc) => (
                    <div key={alloc.ticker} className="flex items-start gap-2 text-xs">
                      <span className="font-semibold text-sky-400 min-w-[60px]">{alloc.ticker}</span>
                      <span className="text-slate-400">{alloc.rationale}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sector diversification */}
          {sectorBreakdown.length > 0 && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Sector Diversification</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sectorBreakdown.map((s) => (
                  <div key={s.sector} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{s.sector}</span>
                      <span className="text-slate-500 text-xs">{s.count} stock{s.count > 1 ? 's' : ''}</span>
                    </div>
                    <GaugeBar value={s.avgScore} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price change monitor */}
          {selectedStocks.length > 0 && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
              <div className="flex items-center gap-2 mb-4">
                <LineChart className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">Price Change Monitor</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-700/50">
                      <th className="pb-2 pr-3">Ticker</th>
                      <th className="pb-2 pr-3 text-right">Price</th>
                      <th className="pb-2 pr-3 text-right">1D</th>
                      <th className="pb-2 pr-3 text-right">1W</th>
                      <th className="pb-2 pr-3 text-right hidden sm:table-cell">1Y</th>
                      <th className="pb-2 pr-3 text-right hidden md:table-cell">3Y est.</th>
                      <th className="pb-2 pr-3 text-right hidden md:table-cell">5Y est.</th>
                      <th className="pb-2 text-right hidden lg:table-cell">Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStocks.map((stock) => (
                      <tr
                        key={stock.ticker}
                        onClick={() => onSelectStock(stock.ticker)}
                        className="border-b border-slate-700/20 hover:bg-slate-700/20 cursor-pointer transition-colors"
                      >
                        <td className="py-3 pr-3 font-semibold text-white">{stock.ticker}</td>
                        <td className="py-3 pr-3 text-right font-mono text-slate-300">€{stock.price.toFixed(2)}</td>
                        <td className="py-3 pr-3 text-right font-mono">
                          <ChangeCell value={stock.change1D} />
                        </td>
                        <td className="py-3 pr-3 text-right font-mono">
                          <ChangeCell value={stock.change1W} />
                        </td>
                        <td className="py-3 pr-3 text-right font-mono hidden sm:table-cell">
                          <ChangeCell value={stock.change1Y} />
                        </td>
                        <td className="py-3 pr-3 text-right font-mono hidden md:table-cell">
                          <ChangeCell value={stock.change3Y} />
                        </td>
                        <td className="py-3 pr-3 text-right font-mono hidden md:table-cell">
                          <ChangeCell value={stock.change5Y} />
                        </td>
                        <td className="py-3 text-right hidden lg:table-cell">
                          {stock.bollingerBreakout === 'upper' && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-rose-500/15 text-rose-400">Upper break</span>
                          )}
                          {stock.bollingerBreakout === 'lower' && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-500/15 text-emerald-400">Lower break</span>
                          )}
                          {stock.bollingerBreakout === null && (
                            <span className="text-xs text-slate-600">In range</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-600 mt-3">
                3Y and 5Y figures are estimated by compounding the 1Y return. Bollinger band breakouts flag stocks whose price has moved outside their 20-day volatility envelope.
              </p>
            </div>
          )}

          {/* Risk warnings */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-amber-200/80">
                <p className="font-semibold text-amber-400">Investment Notes</p>
                <ul className="space-y-1 text-xs">
                  <li>Allocations are optimized based on fundamental + technical scores weighted by your risk tolerance.</li>
                  <li>Entry prices should be confirmed with current market orders. Use the suggested entry from each stock's detail page.</li>
                  <li>For medium-term holds (6-18 months), maintain stop losses at 2x ATR below entry and rebalance quarterly.</li>
                  <li>This tool provides analysis for educational purposes and is not financial advice.</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ChangeCell({ value }: { value: number }) {
  const isUp = value >= 0;
  return (
    <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
      {isUp ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
}

function SummaryStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    sky: 'text-sky-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    violet: 'text-violet-400',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-slate-700/30 ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`text-lg font-bold ${colors[color]}`}>{value}</p>
      </div>
    </div>
  );
}
