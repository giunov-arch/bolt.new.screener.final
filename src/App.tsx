import { useState, useEffect, useCallback } from 'react';
import { Stock } from '@/types';
import { stocks as staticStocks } from '@/data/stocks';
import { fetchAllStocks, refreshAllStocks } from '@/lib/dataService';
import { Dashboard } from '@/views/Dashboard';
import { Screener } from '@/views/Screener';
import { StockDetail } from '@/views/StockDetail';
import { PortfolioBuilder } from '@/views/PortfolioBuilder';
import { Watchlist } from '@/views/Watchlist';
import { LayoutDashboard, BarChart3, Briefcase, Star, TrendingUp, X, Menu, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

type View = 'dashboard' | 'screener' | 'detail' | 'portfolio' | 'watchlist';

const NAV_ITEMS: { id: View; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'screener', label: 'Screener', icon: BarChart3 },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'watchlist', label: 'Watchlist', icon: Star },
];

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(['UCG', 'LDO', 'PRY', 'TEN', 'AZM']);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [stocks, setStocks] = useState<Stock[]>(staticStocks);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<'live' | 'cache' | 'static'>('static');
  const [dataError, setDataError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load saved state from localStorage
  useEffect(() => {
    const savedWatch = localStorage.getItem('it_stock_watchlist');
    const savedPortfolio = localStorage.getItem('it_stock_portfolio');
    if (savedWatch) {
      try { setWatchlist(JSON.parse(savedWatch)); } catch { /* ignore */ }
    }
    if (savedPortfolio) {
      try { setSelectedTickers(JSON.parse(savedPortfolio)); } catch { /* ignore */ }
    }
  }, []);

  // Fetch live stock data on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchAllStocks();
      if (cancelled) return;
      setStocks(result.stocks);
      setDataSource(result.source);
      setDataError(result.error || null);
      setLastUpdated(new Date());
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem('it_stock_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('it_stock_portfolio', JSON.stringify(selectedTickers));
  }, [selectedTickers]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const result = await refreshAllStocks();
    setStocks(result.stocks);
    setDataSource(result.error ? 'static' : 'live');
    setDataError(result.error || null);
    setLastUpdated(new Date());
    setRefreshing(false);
  }, []);

  const selectStock = useCallback((ticker: string) => {
    setSelectedTicker(ticker);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigate = useCallback((v: string) => {
    setView(v as View);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleSelect = useCallback((ticker: string) => {
    setSelectedTickers((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  }, []);

  const toggleWatch = useCallback((ticker: string) => {
    setWatchlist((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedTickers([]), []);

  const selectedStock = selectedTicker ? stocks.find((s) => s.ticker === selectedTicker) || null : null;

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    badge: item.id === 'portfolio' && selectedTickers.length > 0 ? selectedTickers.length : item.id === 'watchlist' && watchlist.length > 0 ? watchlist.length : undefined,
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <button
              onClick={() => navigate('dashboard')}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block leading-tight">BorsaScreen</span>
                <span className="text-[10px] text-slate-500 leading-tight">Italian Stock Analysis</span>
              </div>
            </button>

            {/* Data status indicator */}
            <div className="hidden sm:flex items-center gap-2 mr-2">
              {loading ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading data...
                </span>
              ) : dataSource === 'live' ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Live data
                </span>
              ) : dataSource === 'cache' ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-sky-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cached
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-amber-400" title={dataError || ''}>
                  <AlertCircle className="w-3.5 h-3.5" /> Sample data
                </span>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1 text-slate-500 hover:text-sky-400 transition-colors disabled:opacity-30"
                title="Refresh data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {item.badge !== undefined && (
                      <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-sky-500/20 text-sky-400 rounded-full min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="md:hidden p-2 text-slate-500 hover:text-sky-400 transition-colors disabled:opacity-30"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileNavOpen && (
          <nav className="md:hidden border-t border-slate-700/50 px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-sky-500/10 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {item.badge !== undefined && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-sky-500/20 text-sky-400 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </header>

      {/* Data source banner */}
      {dataSource === 'static' && !loading && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
          <p className="text-xs text-amber-300">
            Showing sample data. {dataError ? `Live data unavailable: ${dataError}` : 'Click refresh to try loading live data.'}
          </p>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-3" />
            <p className="text-sm text-slate-400">Loading live market data...</p>
          </div>
        ) : (
          <>
            {view === 'dashboard' && <Dashboard stocks={stocks} onSelectStock={selectStock} onNavigate={navigate} />}
            {view === 'screener' && (
              <Screener
                stocks={stocks}
                onSelectStock={selectStock}
                selectedTickers={selectedTickers}
                onToggleSelect={toggleSelect}
              />
            )}
            {view === 'detail' && selectedStock && (
              <StockDetail
                stock={selectedStock}
                onBack={() => navigate('screener')}
                onAddToPortfolio={toggleSelect}
                isInPortfolio={selectedTickers.includes(selectedStock.ticker)}
              />
            )}
            {view === 'portfolio' && (
              <PortfolioBuilder
                stocks={stocks}
                selectedTickers={selectedTickers}
                onToggleSelect={toggleSelect}
                onClearSelection={clearSelection}
                onSelectStock={selectStock}
              />
            )}
            {view === 'watchlist' && (
              <Watchlist
                stocks={stocks}
                watchlist={watchlist}
                onToggleWatch={toggleWatch}
                onSelectStock={selectStock}
                selectedTickers={selectedTickers}
                onToggleSelect={toggleSelect}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-slate-500">
            BorsaScreen · Italian Stock Exchange Analysis Tool · {stocks.length} stocks tracked
            {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString()}`}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            For educational purposes only. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
