import { useMemo } from 'react';
import { Stock } from '@/types';
import { getStockSignals, getEntryRecommendation } from '@/data/stocks';
import { ScoreBadge, SignalBadge, ActionBadge, ChangeBadge } from '@/components/Badges';
import { PriceChart, VolumeChart, GaugeBar, RadialScore } from '@/components/Charts';
import { ArrowLeft, Plus, Target, Shield, TrendingUp, BarChart3, DollarSign, Zap, PieChart, Gauge, Scale, Sparkles } from 'lucide-react';

interface StockDetailProps {
  stock: Stock;
  onBack: () => void;
  onAddToPortfolio: (ticker: string) => void;
  isInPortfolio: boolean;
}

export function StockDetail({ stock, onBack, onAddToPortfolio, isInPortfolio }: StockDetailProps) {
  const signals = useMemo(() => getStockSignals(stock), [stock]);
  const recommendation = useMemo(() => getEntryRecommendation(stock), [stock]);

  const priceChange = ((stock.price - stock.priceHistory[0]) / stock.priceHistory[0]) * 100;
  const vsSma50 = ((stock.price - stock.sma50) / stock.sma50) * 100;
  const vsSma200 = ((stock.price - stock.sma200) / stock.sma200) * 100;
  const weekRange = stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow;
  const weekPosition = ((stock.price - stock.fiftyTwoWeekLow) / weekRange) * 100;

  const bullishCount = signals.filter((s) => s.type === 'bullish').length;
  const bearishCount = signals.filter((s) => s.type === 'bearish').length;

  const fundamentals = [
    { label: 'P/E Ratio', value: stock.peRatio > 0 ? stock.peRatio.toFixed(1) : 'N/A', good: stock.peRatio > 0 && stock.peRatio < 15 },
    { label: 'Forward P/E', value: stock.forwardPE > 0 ? stock.forwardPE.toFixed(1) : 'N/A', good: stock.forwardPE > 0 && stock.forwardPE < 12 },
    { label: 'P/B Ratio', value: stock.pbRatio.toFixed(2), good: stock.pbRatio < 1.5 },
    { label: 'P/S Ratio', value: stock.psRatio.toFixed(2), good: stock.psRatio < 1.5 },
    { label: 'Dividend Yield', value: `${stock.dividendYield.toFixed(1)}%`, good: stock.dividendYield >= 4 },
    { label: 'Payout Ratio', value: `${stock.payoutRatio}%`, good: stock.payoutRatio > 0 && stock.payoutRatio < 60 },
    { label: 'ROE', value: `${stock.roe.toFixed(1)}%`, good: stock.roe >= 15 },
    { label: 'ROA', value: `${stock.roa.toFixed(1)}%`, good: stock.roa >= 8 },
    { label: 'Debt/Equity', value: stock.debtToEquity.toFixed(2), good: stock.debtToEquity < 1 },
    { label: 'Current Ratio', value: stock.currentRatio > 0 ? stock.currentRatio.toFixed(2) : 'N/A', good: stock.currentRatio >= 1.2 },
    { label: 'Gross Margin', value: stock.grossMargin > 0 ? `${stock.grossMargin}%` : 'N/A', good: stock.grossMargin >= 35 },
    { label: 'Net Margin', value: `${stock.netMargin.toFixed(1)}%`, good: stock.netMargin >= 10 },
    { label: 'Revenue Growth', value: `${stock.revenueGrowth.toFixed(1)}%`, good: stock.revenueGrowth >= 5 },
    { label: 'Earnings Growth', value: `${stock.earningsGrowth.toFixed(1)}%`, good: stock.earningsGrowth >= 8 },
    { label: 'FCF Yield', value: `${stock.fcFYield.toFixed(1)}%`, good: stock.fcFYield >= 5 },
    { label: 'Beta', value: stock.beta.toFixed(2), good: stock.beta < 1.2 },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-1 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{stock.ticker}</h1>
              <span className="text-sm text-slate-500 px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700/50">{stock.sector}</span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{stock.name} · {stock.industry}</p>
          </div>
        </div>
        <button
          onClick={() => onAddToPortfolio(stock.ticker)}
          disabled={isInPortfolio}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isInPortfolio
              ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
              : 'bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30'
          }`}
        >
          <Plus className="w-4 h-4" />
          {isInPortfolio ? 'In Portfolio' : 'Add to Portfolio'}
        </button>
      </div>

      {/* Price + Scores Summary */}
      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-3xl font-bold text-white font-mono">€{stock.price.toFixed(2)}</span>
              <span className={`ml-3 text-lg font-semibold ${priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
            <div className="text-right text-sm">
              <p className="text-slate-500">Market Cap</p>
              <p className="text-white font-mono">€{stock.marketCap.toFixed(1)}B</p>
            </div>
          </div>
          <PriceChart data={stock.priceHistory} height={120} color="auto" showAxis />
          <div className="mt-3">
            <VolumeChart data={stock.volumeHistory} height={30} />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Vol: {(stock.volume / 1e6).toFixed(1)}M</span>
            <span>Avg Vol: {(stock.avgVolume / 1e6).toFixed(1)}M</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 flex flex-col items-center justify-center">
          <RadialScore score={stock.overallScore} size={130} label="Overall" />
          <div className="flex gap-4 mt-3">
            <div className="text-center">
              <p className="text-xs text-slate-500">Fundamental</p>
              <ScoreBadge score={stock.fundamentalScore} size="sm" />
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">Technical</p>
              <ScoreBadge score={stock.technicalScore} size="sm" />
            </div>
          </div>
        </div>

        {/* Entry recommendation */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Entry Recommendation</h3>
          <div className="mb-4">
            <ActionBadge action={recommendation.action} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Suggested Entry</p>
                <p className="text-sm font-mono font-semibold text-white">€{recommendation.suggestedEntry.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Stop Loss (2x ATR)</p>
                <p className="text-sm font-mono font-semibold text-rose-400">€{recommendation.stopLoss.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Target (4x ATR)</p>
                <p className="text-sm font-mono font-semibold text-emerald-400">€{recommendation.targetPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/30">
            <p className="text-xs text-slate-400">{recommendation.rationale}</p>
          </div>
        </div>
      </div>

      {/* Analyst Estimates */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Analyst Estimates
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recommendation */}
          <div className="p-4 rounded-lg bg-slate-700/20 border border-slate-700/30 flex flex-col items-center justify-center gap-2">
            <Gauge className="w-5 h-5 text-sky-400" />
            <p className="text-xs text-slate-500">Recommendation</p>
            <ActionBadge action={stock.recommendation} />
          </div>

          {/* Target Price */}
          <div className="p-4 rounded-lg bg-slate-700/20 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-slate-500">Price Target</p>
            </div>
            <p className="text-lg font-mono font-bold text-emerald-400">€{stock.targetPrice.toFixed(2)}</p>
            <p className={`text-xs font-semibold mt-1 ${stock.upsidePotential >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stock.upsidePotential >= 0 ? '+' : ''}{stock.upsidePotential.toFixed(1)}% upside
            </p>
          </div>

          {/* Fair Value */}
          <div className="p-4 rounded-lg bg-slate-700/20 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-4 h-4 text-sky-400" />
              <p className="text-xs text-slate-500">Fair Value Estimate</p>
            </div>
            <p className="text-lg font-mono font-bold text-sky-400">€{stock.fairValue.toFixed(2)}</p>
            <p className={`text-xs font-semibold mt-1 ${stock.valuationGap >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stock.valuationGap >= 0 ? 'Undervalued by ' : 'Overvalued by '}{Math.abs(stock.valuationGap).toFixed(1)}%
            </p>
          </div>

          {/* Price vs Target visualization */}
          <div className="p-4 rounded-lg bg-slate-700/20 border border-slate-700/30">
            <p className="text-xs text-slate-500 mb-2">Price vs Target vs Fair Value</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Current</span>
                <span className="font-mono text-white">€{stock.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-sky-400">Fair Value</span>
                <span className="font-mono text-sky-400">€{stock.fairValue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400">Target</span>
                <span className="font-mono text-emerald-400">€{stock.targetPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Valuation bar */}
        <div className="mt-4 pt-4 border-t border-slate-700/30">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>€{Math.min(stock.price, stock.fairValue, stock.targetPrice).toFixed(2)}</span>
            <span>Valuation Range</span>
            <span>€{Math.max(stock.price, stock.fairValue, stock.targetPrice).toFixed(2)}</span>
          </div>
          <div className="relative h-4 bg-slate-700/40 rounded-full overflow-hidden">
            <div className="absolute h-full bg-gradient-to-r from-rose-500/20 via-sky-500/20 to-emerald-500/20 rounded-full" style={{ width: '100%' }} />
            {(() => {
              const lo = Math.min(stock.price, stock.fairValue, stock.targetPrice);
              const hi = Math.max(stock.price, stock.fairValue, stock.targetPrice);
              const range = hi - lo || 1;
              const pricePos = ((stock.price - lo) / range) * 100;
              const fairPos = ((stock.fairValue - lo) / range) * 100;
              const targetPos = ((stock.targetPrice - lo) / range) * 100;
              return (
                <>
                  <div className="absolute w-0.5 h-4 bg-white rounded-full" style={{ left: `${pricePos}%` }} title="Current Price" />
                  <div className="absolute w-0.5 h-4 bg-sky-400 rounded-full" style={{ left: `${fairPos}%` }} title="Fair Value" />
                  <div className="absolute w-0.5 h-4 bg-emerald-400 rounded-full" style={{ left: `${targetPos}%` }} title="Target Price" />
                </>
              );
            })()}
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-0.5 bg-white" /> Current</span>
            <span className="flex items-center gap-1.5 text-sky-400"><span className="w-2 h-0.5 bg-sky-400" /> Fair Value</span>
            <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2 h-0.5 bg-emerald-400" /> Target</span>
          </div>
        </div>
      </div>

      {/* Technical Analysis */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-400" /> Technical Indicators
          </h3>
          <div className="space-y-3 text-sm">
            <TechRow label="RSI (14)" value={stock.rsi.toFixed(1)} signal={stock.rsi < 30 ? 'bullish' : stock.rsi > 70 ? 'bearish' : 'neutral'} hint={stock.rsi < 30 ? 'Oversold' : stock.rsi > 70 ? 'Overbought' : 'Neutral'} />
            <TechRow label="MACD" value={stock.macd.toFixed(3)} signal={stock.macdHist > 0 ? 'bullish' : 'bearish'} hint={stock.macdHist > 0 ? 'Bullish cross' : 'Bearish cross'} />
            <TechRow label="Price vs SMA 50" value={`${vsSma50 >= 0 ? '+' : ''}${vsSma50.toFixed(1)}%`} signal={vsSma50 >= 0 ? 'bullish' : 'bearish'} hint={vsSma50 >= 0 ? 'Above' : 'Below'} />
            <TechRow label="Price vs SMA 200" value={`${vsSma200 >= 0 ? '+' : ''}${vsSma200.toFixed(1)}%`} signal={vsSma200 >= 0 ? 'bullish' : 'bearish'} hint={vsSma200 >= 0 ? 'Above' : 'Below'} />
            <TechRow label="SMA 50 vs 200" value="" signal={stock.sma50 > stock.sma200 ? 'bullish' : 'bearish'} hint={stock.sma50 > stock.sma200 ? 'Golden Cross' : 'Death Cross'} />
            <TechRow label="Bollinger Position" value={`${((stock.price - stock.bollingerLower) / (stock.bollingerUpper - stock.bollingerLower) * 100).toFixed(0)}%`} signal={stock.price <= stock.bollingerLower * 1.02 ? 'bullish' : stock.price >= stock.bollingerUpper * 0.98 ? 'bearish' : 'neutral'} hint={stock.price <= stock.bollingerLower * 1.02 ? 'Lower band' : stock.price >= stock.bollingerUpper * 0.98 ? 'Upper band' : 'Mid range'} />
            <TechRow label="ATR (Volatility)" value={stock.atr.toFixed(3)} signal="neutral" hint={`${(stock.atr / stock.price * 100).toFixed(1)}% of price`} />
            <TechRow label="52-Week Position" value={`${weekPosition.toFixed(0)}%`} signal={weekPosition < 25 ? 'bullish' : weekPosition > 90 ? 'bearish' : 'neutral'} hint={weekPosition < 25 ? 'Near low' : weekPosition > 90 ? 'Near high' : 'Mid range'} />
          </div>
        </div>

        {/* Signals */}
        <div className="lg:col-span-2 rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Technical Signals
            </h3>
            <div className="flex gap-3 text-sm">
              <span className="text-emerald-400 font-semibold">{bullishCount} Bullish</span>
              <span className="text-rose-400 font-semibold">{bearishCount} Bearish</span>
            </div>
          </div>
          <div className="space-y-2">
            {signals.map((signal, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  signal.type === 'bullish'
                    ? 'bg-emerald-500/5 border-emerald-500/15'
                    : signal.type === 'bearish'
                    ? 'bg-rose-500/5 border-rose-500/15'
                    : 'bg-slate-700/20 border-slate-700/30'
                }`}
              >
                <SignalBadge type={signal.type}>
                  {signal.type === 'bullish' ? 'Bullish' : signal.type === 'bearish' ? 'Bearish' : 'Neutral'}
                </SignalBadge>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{signal.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      signal.strength === 'strong' ? 'bg-slate-600/50 text-slate-200' : 'bg-slate-700/30 text-slate-400'
                    }`}>
                      {signal.strength}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{signal.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fundamentals Table */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" /> Fundamental Analysis
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {fundamentals.map((f) => (
            <div key={f.label} className="p-3 rounded-lg bg-slate-700/20 border border-slate-700/30">
              <p className="text-xs text-slate-500 mb-1">{f.label}</p>
              <div className="flex items-center justify-between">
                <p className={`text-sm font-mono font-semibold ${f.good ? 'text-emerald-400' : 'text-slate-300'}`}>{f.value}</p>
                <span className={`w-2 h-2 rounded-full ${f.good ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price range visualization */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-sky-400" /> Price Position
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">52-Week Range</span>
              <span className="text-slate-500 text-xs font-mono">€{stock.fiftyTwoWeekLow.toFixed(2)} - €{stock.fiftyTwoWeekHigh.toFixed(2)}</span>
            </div>
            <div className="relative h-3 bg-slate-700/50 rounded-full">
              <div
                className="absolute h-3 bg-gradient-to-r from-rose-500/30 via-amber-500/30 to-emerald-500/30 rounded-full"
                style={{ width: '100%' }}
              />
              <div
                className="absolute w-1 h-5 bg-sky-400 rounded-full -top-1 shadow-lg shadow-sky-500/50"
                style={{ left: `${weekPosition}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 text-center">
              Current price is at {weekPosition.toFixed(0)}% of its 52-week range
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700/30">
            <div>
              <p className="text-xs text-slate-500">SMA 50</p>
              <p className="text-sm font-mono text-white">€{stock.sma50.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">SMA 200</p>
              <p className="text-sm font-mono text-white">€{stock.sma200.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Bollinger Middle</p>
              <p className="text-sm font-mono text-white">€{stock.bollingerMiddle.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechRow({ label, value, signal, hint }: { label: string; value: string; signal: 'bullish' | 'bearish' | 'neutral'; hint: string }) {
  const colors = {
    bullish: 'text-emerald-400',
    bearish: 'text-rose-400',
    neutral: 'text-slate-400',
  };

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-700/20 last:border-0">
      <div>
        <span className="text-slate-400">{label}</span>
        <span className="text-xs text-slate-600 ml-2">{hint}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className={`font-mono font-semibold ${colors[signal]}`}>{value}</span>}
        <div className={`w-2 h-2 rounded-full ${signal === 'bullish' ? 'bg-emerald-500' : signal === 'bearish' ? 'bg-rose-500' : 'bg-slate-600'}`} />
      </div>
    </div>
  );
}
