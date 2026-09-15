import { useState, useMemo } from 'react';
import { Stock, ScreeningFilters } from '@/types';
import { screenStocks } from '@/lib/analysis';
import { ScoreBadge } from '@/components/Badges';
import { PriceChart } from '@/components/Charts';
import { StockCard } from '@/components/StockCard';
import { SlidersHorizontal, X, Search } from 'lucide-react';

interface ScreenerProps {
  stocks: Stock[];
  onSelectStock: (ticker: string) => void;
  selectedTickers: string[];
  onToggleSelect: (ticker: string) => void;
}

const defaultFilters: ScreeningFilters = {
  sectors: [],
  minMarketCap: 0,
  maxPE: 100,
  minDividendYield: 0,
  minROE: -100,
  maxDebtToEquity: 100,
  minRevenueGrowth: -100,
  sortBy: 'overallScore',
  sortOrder: 'desc',
};

export function Screener({ stocks, onSelectStock, selectedTickers, onToggleSelect }: ScreenerProps) {
  const allSectors = useMemo(() => [...new Set(stocks.map((s) => s.sector))].sort(), [stocks]);
  const [filters, setFilters] = useState<ScreeningFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredStocks = useMemo(() => {
    let result = screenStocks(stocks, filters);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    return result;
  }, [stocks, filters, search]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.sectors.length > 0) count++;
    if (filters.minMarketCap > 0) count++;
    if (filters.maxPE < 100) count++;
    if (filters.minDividendYield > 0) count++;
    if (filters.minROE > -100) count++;
    if (filters.maxDebtToEquity < 100) count++;
    if (filters.minRevenueGrowth > -100) count++;
    return count;
  }, [filters]);

  const resetFilters = () => setFilters(defaultFilters);

  const toggleSector = (sector: string) => {
    setFilters((f) => ({
      ...f,
      sectors: f.sectors.includes(sector)
        ? f.sectors.filter((s) => s !== sector)
        : [...f.sectors, sector],
    }));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Stock Screener</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {filteredStocks.length} of {stocks.length} stocks match your criteria
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticker or name..."
              className="pl-9 pr-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 w-48"
            />
          </div>
          <div className="flex bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'grid' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-white'}`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'table' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-white'}`}
            >
              Table
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative inline-flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white hover:border-sky-500/50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Fundamental Filters</h2>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          {/* Sectors */}
          <div>
            <label className="text-xs text-slate-500 mb-2 block">Sectors</label>
            <div className="flex flex-wrap gap-2">
              {allSectors.map((sector) => (
                <button
                  key={sector}
                  onClick={() => toggleSector(sector)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    filters.sectors.includes(sector)
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                      : 'bg-slate-700/30 text-slate-400 border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>

          {/* Numeric filters */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FilterSlider
              label="Min Market Cap (€B)"
              value={filters.minMarketCap}
              min={0}
              max={80}
              step={5}
              onChange={(v) => setFilters((f) => ({ ...f, minMarketCap: v }))}
            />
            <FilterSlider
              label="Max P/E Ratio"
              value={filters.maxPE}
              min={5}
              max={100}
              step={1}
              onChange={(v) => setFilters((f) => ({ ...f, maxPE: v }))}
              displayValue={filters.maxPE >= 100 ? 'Any' : filters.maxPE.toString()}
            />
            <FilterSlider
              label="Min Dividend Yield (%)"
              value={filters.minDividendYield}
              min={0}
              max={10}
              step={0.5}
              onChange={(v) => setFilters((f) => ({ ...f, minDividendYield: v }))}
            />
            <FilterSlider
              label="Min ROE (%)"
              value={filters.minROE}
              min={-20}
              max={50}
              step={1}
              onChange={(v) => setFilters((f) => ({ ...f, minROE: v }))}
              displayValue={filters.minROE <= -100 ? 'Any' : `${filters.minROE}%`}
            />
            <FilterSlider
              label="Max Debt/Equity"
              value={filters.maxDebtToEquity}
              min={0}
              max={3}
              step={0.1}
              onChange={(v) => setFilters((f) => ({ ...f, maxDebtToEquity: v }))}
              displayValue={filters.maxDebtToEquity >= 100 ? 'Any' : filters.maxDebtToEquity.toFixed(1)}
            />
            <FilterSlider
              label="Min Revenue Growth (%)"
              value={filters.minRevenueGrowth}
              min={-20}
              max={20}
              step={0.5}
              onChange={(v) => setFilters((f) => ({ ...f, minRevenueGrowth: v }))}
              displayValue={filters.minRevenueGrowth <= -100 ? 'Any' : `${filters.minRevenueGrowth}%`}
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-700/30">
            <label className="text-xs text-slate-500">Sort by</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white px-3 py-1.5 focus:outline-none focus:border-sky-500/50"
            >
              <option value="overallScore">Overall Score</option>
              <option value="fundamentalScore">Fundamental Score</option>
              <option value="technicalScore">Technical Score</option>
              <option value="marketCap">Market Cap</option>
              <option value="peRatio">P/E Ratio</option>
              <option value="dividendYield">Dividend Yield</option>
              <option value="roe">ROE</option>
              <option value="revenueGrowth">Revenue Growth</option>
              <option value="price">Price</option>
            </select>
            <button
              onClick={() => setFilters((f) => ({ ...f, sortOrder: f.sortOrder === 'desc' ? 'asc' : 'desc' }))}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {filters.sortOrder === 'desc' ? '↓ Descending' : '↑ Ascending'}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {filteredStocks.length === 0 ? (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-12 text-center">
          <p className="text-slate-400">No stocks match your filters. Try loosening your criteria.</p>
          <button onClick={resetFilters} className="mt-3 text-sky-400 hover:text-sky-300 text-sm">
            Reset filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStocks.map((stock) => (
            <StockCard
              key={stock.ticker}
              stock={stock}
              onClick={onSelectStock}
              isSelected={selectedTickers.includes(stock.ticker)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-700/50">
                <th className="p-3">Ticker</th>
                <th className="p-3">Price</th>
                <th className="p-3 hidden md:table-cell">Chart</th>
                <th className="p-3">P/E</th>
                <th className="p-3 hidden sm:table-cell">Div Yield</th>
                <th className="p-3 hidden lg:table-cell">ROE</th>
                <th className="p-3 hidden lg:table-cell">D/E</th>
                <th className="p-3 hidden xl:table-cell">Rev Growth</th>
                <th className="p-3">Fund</th>
                <th className="p-3">Tech</th>
                <th className="p-3">Overall</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => (
                <tr
                  key={stock.ticker}
                  onClick={() => onSelectStock(stock.ticker)}
                  className="border-b border-slate-700/20 hover:bg-slate-700/20 cursor-pointer transition-colors"
                >
                  <td className="p-3">
                    <div className="font-semibold text-white">{stock.ticker}</div>
                    <div className="text-xs text-slate-500 max-w-[120px] truncate">{stock.name}</div>
                  </td>
                  <td className="p-3 font-mono text-white">€{stock.price.toFixed(2)}</td>
                  <td className="p-3 hidden md:table-cell w-28">
                    <PriceChart data={stock.priceHistory} height={28} color="auto" />
                  </td>
                  <td className="p-3 font-mono text-slate-300">{stock.peRatio > 0 ? stock.peRatio.toFixed(1) : 'N/A'}</td>
                  <td className="p-3 font-mono text-slate-300 hidden sm:table-cell">{stock.dividendYield.toFixed(1)}%</td>
                  <td className="p-3 font-mono text-slate-300 hidden lg:table-cell">{stock.roe.toFixed(1)}%</td>
                  <td className="p-3 font-mono text-slate-300 hidden lg:table-cell">{stock.debtToEquity.toFixed(2)}</td>
                  <td className="p-3 font-mono text-slate-300 hidden xl:table-cell">{stock.revenueGrowth.toFixed(1)}%</td>
                  <td className="p-3"><ScoreBadge score={stock.fundamentalScore} size="sm" /></td>
                  <td className="p-3"><ScoreBadge score={stock.technicalScore} size="sm" /></td>
                  <td className="p-3"><ScoreBadge score={stock.overallScore} size="sm" /></td>
                  <td className="p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect(stock.ticker);
                      }}
                      className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                        selectedTickers.includes(stock.ticker)
                          ? 'border-sky-500 bg-sky-500 text-white'
                          : 'border-slate-600 hover:border-sky-500'
                      }`}
                    >
                      {selectedTickers.includes(stock.ticker) && '✓'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  displayValue?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs text-slate-500">{label}</label>
        <span className="text-xs font-mono font-semibold text-sky-400">{displayValue ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-sky-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}
