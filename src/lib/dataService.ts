import { Stock } from '@/types';
import { supabase } from '@/lib/supabase';
import { stocks as staticStocks, getStockSignals, getEntryRecommendation } from '@/data/stocks';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-stocks`;

const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour
const CACHE_VERSION = 2; // bump to invalidate stale cache from old config

// IndexedDB-based cache for browser
const DB_NAME = 'borsascreen_cache';
const STORE_NAME = 'stock_data';
const META_KEY = '_meta';

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbGet(key: string): Promise<any> {
  const db = await openDB();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

async function idbSet(key: string, value: any): Promise<void> {
  const db = await openDB();
  if (!db) return;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

// Enrich live stock data with signals and recommendations from static helpers
function enrichStock(stock: Stock): Stock {
  // These are computed in the edge function, but ensure they exist
  return stock;
}

export async function fetchAllStocks(): Promise<{ stocks: Stock[]; source: 'cache' | 'live' | 'static'; error?: string }> {
  // Check IndexedDB cache first
  const cached = await idbGet(META_KEY);
  if (cached && cached.version === CACHE_VERSION && cached.timestamp && Date.now() - cached.timestamp < CACHE_MAX_AGE_MS && cached.stocks) {
    return { stocks: cached.stocks.map(enrichStock), source: 'cache' };
  }

  // Fetch from edge function
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Edge function returned ${res.status}`);
    }

    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (!data.stocks || data.stocks.length === 0) {
      throw new Error('No stock data returned');
    }

    const liveStocks = data.stocks as Stock[];

    // Merge with static data for any tickers that failed to fetch live
    const liveTickers = liveStocks.map((s) => s.ticker);
    const missingStocks = staticStocks.filter((s) => !liveTickers.includes(s.ticker));
    const allStocks = [...liveStocks, ...missingStocks];

    // Save to IndexedDB
    await idbSet(META_KEY, { stocks: allStocks, timestamp: Date.now(), version: CACHE_VERSION });

    return { stocks: allStocks.map(enrichStock), source: 'live' };
  } catch (err) {
    // Fall back to static data
    return { stocks: staticStocks, source: 'static', error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchSingleStock(ticker: string): Promise<{ stock: Stock | null; source: 'cache' | 'live' | 'static'; error?: string }> {
  // Check IndexedDB for individual stock
  const cachedAll = await idbGet(META_KEY);
  if (cachedAll && cachedAll.version === CACHE_VERSION && cachedAll.timestamp && Date.now() - cachedAll.timestamp < CACHE_MAX_AGE_MS) {
    const cachedStock = (cachedAll.stocks || []).find((s: Stock) => s.ticker === ticker);
    if (cachedStock) {
      return { stock: enrichStock(cachedStock), source: 'cache' };
    }
  }

  // Fetch from edge function
  try {
    const res = await fetch(`${EDGE_FUNCTION_URL}?ticker=${ticker}`, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`Edge function returned ${res.status}`);

    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (!data.stock) throw new Error('No stock data returned');

    const stock = enrichStock(data.stock as Stock);

    // Update IndexedDB cache
    if (cachedAll && cachedAll.stocks) {
      const updated = cachedAll.stocks.map((s: Stock) => s.ticker === ticker ? stock : s);
      await idbSet(META_KEY, { stocks: updated, timestamp: cachedAll.timestamp, version: CACHE_VERSION });
    }

    return { stock, source: 'live' };
  } catch (err) {
    // Fall back to static data
    const staticStock = staticStocks.find((s) => s.ticker === ticker);
    return {
      stock: staticStock || null,
      source: 'static',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function refreshAllStocks(): Promise<{ stocks: Stock[]; error?: string }> {
  try {
    const res = await fetch(`${EDGE_FUNCTION_URL}?force=true`, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`Edge function returned ${res.status}`);

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const liveStocks = data.stocks as Stock[];
    const liveTickers = liveStocks.map((s) => s.ticker);
    const missingStocks = staticStocks.filter((s) => !liveTickers.includes(s.ticker));
    const allStocks = [...liveStocks, ...missingStocks];

    await idbSet(META_KEY, { stocks: allStocks, timestamp: Date.now(), version: CACHE_VERSION });

    return { stocks: allStocks };
  } catch (err) {
    return { stocks: staticStocks, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export { getStockSignals, getEntryRecommendation };
