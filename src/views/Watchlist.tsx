import { useMemo, useState } from 'react';
import { Stock } from '@/types';
import { getStockSignals, getEntryRecommendation } from '@/data/stocks';
import { ScoreBadge, ActionBadge } from '@/components/Badges';
import { PriceChart } from '@/components/Charts';
import { StockCard } from '@/components/StockCard';
import { Star, Search, Target } from 'lucide-react';

interface WatchlistProps {
  stocks: Stock[];
  watchlist: string[];
  onToggleWatch: (ticker: string) => void;
  onSelectStock: (ticker: string) => void;
  selectedTickers: string[];
  onToggleSelect: (ticker: string) => void;
}

export function Watchlist({ stocks, watchlist, onToggleWatch, onSelectStock, selectedTickers, onToggleSelect }: WatchlistProps) {
  const [search, setSearch] = useState('');

  const watchedStocks = useMemo(
    () => stocks.filter((s) => watchlist.includes(s.ticker)),
    [stocks, watchlist]
  );

  const searchResults = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return stocks
      .filter((s) => !watchlist.includes(s.ticker))
      .filter((s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [stocks, search, watchlist]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Watchlist</h1>
          <p className="text-sm text-slate-400 mt-0.5">{watchedStocks.length} stocks on your watchlist</p>
        </div>
      </div>

      {/* Add to watchlist */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stocks to add to your watchlist..."
          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
        />
        {searchResults.length > 0 && (
          <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-700/50 bg-slate-800 shadow-xl overflow-hidden">
            {searchResults.map((stock) => (
              <button
                key={stock.ticker}
                onClick={() => {
                  onToggleWatch(stock.ticker);
                  setSearch('');
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 transition-colors text-left"
              >
                <div>
                  <span className="text-sm font-semibold text-white">{stock.ticker}</span>
                  <span className="text-xs text-slate-500 ml-2">{stock.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{stock.sector}</span>
                  <ScoreBadge score={stock.overallScore} size="sm" />
                  <Star className="w-4 h-4 text-slate-500" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Watchlist entries */}
      {watchedStocks.length === 0 ? (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-12 text-center">
          <Star className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-1">Your watchlist is empty</p>
          <p className="text-sm text-slate-500">Search above to add stocks you want to monitor for entry opportunities.</p>
        </div>
      ) : (
        <>
          {/* Entry opportunities table */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-400" /> Entry Opportunities
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-700/50">
                    <th className="pb-2 pr-3">Ticker</th>
                    <th className="pb-2 pr-3">Price</th>
                    <th className="pb-2 pr-3 hidden md:table-cell">Chart</th>
                    <th className="pb-2 pr-3">Action</th>
                    <th className="pb-2 pr-3 hidden sm:table-cell">Entry</th>
                    <th className="pb-2 pr-3 hidden sm:table-cell">Stop</th>
                    <th className="pb-2 pr-3 hidden lg:table-cell">Target</th>
                    <th className="pb-2">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {watchedStocks.map((stock) => {
                    const rec = getEntryRecommendation(stock);
                    return (
                      <tr
                        key={stock.ticker}
                        onClick={() => onSelectStock(stock.ticker)}
                        className="border-b border-slate-700/20 hover:bg-slate-700/20 cursor-pointer transition-colors"
                      >
                        <td className="py-3 pr-3">
                          <div className="font-semibold text-white">{stock.ticker}</div>
                          <div className="text-xs text-slate-500 max-w-[120px] truncate">{stock.name}</div>
                        </td>
                        <td className="py-3 pr-3 font-mono text-white">€{stock.price.toFixed(2)}</td>
                        <td className="py-3 pr-3 hidden md:table-cell w-28">
                          <PriceChart data={stock.priceHistory} height={28} color="auto" />
                        </td>
                        <td className="py-3 pr-3"><ActionBadge action={rec.action} /></td>
                        <td className="py-3 pr-3 hidden sm:table-cell font-mono text-sky-400">€{rec.suggestedEntry.toFixed(2)}</td>
                        <td className="py-3 pr-3 hidden sm:table-cell font-mono text-rose-400">€{rec.stopLoss.toFixed(2)}</td>
                        <td className="py-3 pr-3 hidden lg:table-cell font-mono text-emerald-400">€{rec.targetPrice.toFixed(2)}</td>
                        <td className="py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWatch(stock.ticker);
                            }}
                            className="text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card view */}
          <div>
            <h2 className="text-sm font-semibold text-white mb-3">All Watched Stocks</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {watchedStocks.map((stock) => (
                <StockCard
                  key={stock.ticker}
                  stock={stock}
                  onClick={onSelectStock}
                  isSelected={selectedTickers.includes(stock.ticker)}
                  onToggleSelect={onToggleSelect}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
