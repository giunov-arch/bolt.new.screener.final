import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Stock universe is loaded from the stock_config table at runtime.
// This allows users to add/remove stocks from the app UI without redeploying.
interface StockConfigRow {
  ticker: string;
  yf_symbol: string;
  name: string | null;
  sector: string;
  industry: string;
  market_cap: number;
  pe_ratio: number;
  forward_pe: number;
  pb_ratio: number;
  ps_ratio: number;
  dividend_yield: number;
  payout_ratio: number;
  roe: number;
  roa: number;
  debt_to_equity: number;
  current_ratio: number;
  gross_margin: number;
  net_margin: number;
  revenue_growth: number;
  earnings_growth: number;
  fcf_yield: number;
  beta: number;
}

interface StockMapEntry {
  ticker: string;
  yfSymbol: string;
  sector: string;
  industry: string;
}

interface FundamentalsEntry {
  marketCap: number; peRatio: number; forwardPE: number; pbRatio: number; psRatio: number;
  dividendYield: number; payoutRatio: number; roe: number; roa: number; debtToEquity: number;
  currentRatio: number; grossMargin: number; netMargin: number; revenueGrowth: number;
  earningsGrowth: number; fcFYield: number; beta: number;
}

async function loadStockConfig(): Promise<{ stockMap: StockMapEntry[]; fundamentals: Record<string, FundamentalsEntry>; names: Record<string, string> }> {
  const { data, error } = await supabase
    .from("stock_config")
    .select("*")
    .order("ticker");

  if (error || !data || data.length === 0) {
    throw new Error("Failed to load stock_config: " + (error?.message || "no rows"));
  }

  const rows = data as unknown as StockConfigRow[];
  const stockMap: StockMapEntry[] = rows.map((r) => ({
    ticker: r.ticker,
    yfSymbol: r.yf_symbol,
    sector: r.sector,
    industry: r.industry,
  }));

  const fundamentals: Record<string, FundamentalsEntry> = {};
  const names: Record<string, string> = {};
  for (const r of rows) {
    fundamentals[r.ticker] = {
      marketCap: r.market_cap,
      peRatio: r.pe_ratio,
      forwardPE: r.forward_pe,
      pbRatio: r.pb_ratio,
      psRatio: r.ps_ratio,
      dividendYield: r.dividend_yield,
      payoutRatio: r.payout_ratio,
      roe: r.roe,
      roa: r.roa,
      debtToEquity: r.debt_to_equity,
      currentRatio: r.current_ratio,
      grossMargin: r.gross_margin,
      netMargin: r.net_margin,
      revenueGrowth: r.revenue_growth,
      earningsGrowth: r.earnings_growth,
      fcFYield: r.fcf_yield,
      beta: r.beta,
    };
    if (r.name) names[r.ticker] = r.name;
  }

  return { stockMap, fundamentals, names };
}

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0" } });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

interface YahooChartResult {
  meta: {
    regularMarketPrice: number;
    fiftyTwoWeekHigh?: number;
    fiftyTwoWeekLow?: number;
    regularMarketVolume?: number;
    regularMarketDayHigh?: number;
    regularMarketDayLow?: number;
    regularMarketChangePercent?: number;
    longName?: string;
    shortName?: string;
    chartPreviousClose?: number;
  };
  timestamps: number[];
  closes: number[];
  volumes: number[];
  dividends: { date: number; amount: number }[];
}

async function fetchYahooData(symbol: string): Promise<YahooChartResult | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y&events=div`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const timestamps: number[] = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const closes: number[] = (quote.close || []).map((c: number | null) => c ?? 0);
    const volumes: number[] = (quote.volume || []).map((v: number | null) => v ?? 0);

    const dividends: { date: number; amount: number }[] = [];
    const divData = result.events?.dividends;
    if (divData) {
      for (const [ts, div] of Object.entries(divData)) {
        dividends.push({ date: parseInt(ts), amount: (div as any).amount });
      }
    }

    return { meta, timestamps, closes, volumes, dividends };
  } catch {
    return null;
  }
}

function computeSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function computeRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    if (i <= 0) continue;
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

function computeMACD(prices: number[]): { macd: number; signal: number; hist: number } {
  if (prices.length < 35) return { macd: 0, signal: 0, hist: 0 };
  const ema = (data: number[], period: number): number => {
    const k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    return ema;
  };
  const ema12 = ema(prices.slice(-50), 12);
  const ema26 = ema(prices.slice(-50), 26);
  const macd = ema12 - ema26;

  const macdValues: number[] = [];
  for (let i = 35; i <= prices.length; i++) {
    const slice = prices.slice(0, i);
    const e12 = ema(slice.slice(-50), 12);
    const e26 = ema(slice.slice(-50), 26);
    macdValues.push(e12 - e26);
  }
  const signal = ema(macdValues, 9);
  const hist = macd - signal;
  return { macd, signal, hist };
}

function computeBollinger(prices: number[]): { upper: number; lower: number; middle: number } {
  if (prices.length < 20) {
    const avg = prices.reduce((a, b) => a + b, 0) / Math.max(prices.length, 1);
    return { upper: avg * 1.05, lower: avg * 0.95, middle: avg };
  }
  const last20 = prices.slice(-20);
  const sma = last20.reduce((a, b) => a + b, 0) / 20;
  const variance = last20.reduce((sum, p) => sum + Math.pow(p - sma, 2), 0) / 20;
  const stdDev = Math.sqrt(variance);
  return { upper: sma + 2 * stdDev, lower: sma - 2 * stdDev, middle: sma };
}

function computeATR(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return (prices[prices.length - 1] || 0) * 0.02;
  let sum = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    if (i > 0) sum += Math.abs(prices[i] - prices[i - 1]);
  }
  return sum / period;
}

function computeFundamentalScore(f: FundamentalsEntry | undefined): number {
  if (!f) return 50;
  let score = 50;
  if (f.peRatio > 0 && f.peRatio < 10) score += 10;
  else if (f.peRatio > 0 && f.peRatio < 15) score += 5;
  else if (f.peRatio > 0 && f.peRatio > 30) score -= 5;
  if (f.dividendYield >= 5) score += 10;
  else if (f.dividendYield >= 3) score += 5;
  if (f.roe >= 15) score += 10;
  else if (f.roe >= 10) score += 5;
  else if (f.roe < 0) score -= 10;
  if (f.debtToEquity < 0.5) score += 8;
  else if (f.debtToEquity > 2) score -= 8;
  if (f.revenueGrowth >= 10) score += 8;
  else if (f.revenueGrowth >= 5) score += 4;
  else if (f.revenueGrowth < 0) score -= 5;
  if (f.earningsGrowth >= 10) score += 8;
  else if (f.earningsGrowth < 0) score -= 5;
  if (f.netMargin >= 15) score += 5;
  else if (f.netMargin < 0) score -= 5;
  if (f.pbRatio < 1) score += 5;
  if (f.currentRatio >= 1.5) score += 4;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function computeTechnicalScore(
  price: number, sma50: number, sma200: number, rsi: number, macdHist: number,
  bollUpper: number, bollLower: number, weekPosition: number
): number {
  let score = 50;
  if (sma50 > sma200) score += 12; else score -= 10;
  if (price > sma50) score += 8; else score -= 5;
  if (price > sma200) score += 5; else score -= 5;
  if (rsi < 30) score += 10;
  else if (rsi >= 50 && rsi <= 65) score += 6;
  else if (rsi > 70) score -= 8;
  if (macdHist > 0) score += 6; else score -= 4;
  if (price <= bollLower * 1.02) score += 5;
  else if (price >= bollUpper * 0.98) score -= 5;
  if (weekPosition < 25) score += 5;
  else if (weekPosition > 90) score -= 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function computeFairValue(price: number, f: FundamentalsEntry | undefined): number {
  if (!f) return price;
  // Weighted blend of valuation multiples vs sector-average assumptions
  let value = price;
  // P/E fair value: if P/E < 15, stock is undervalued (fair price higher)
  if (f.peRatio > 0) {
    const peFair = 15 * (f.netMargin > 0 ? f.netMargin / 10 : 1);
    value += (peFair - f.peRatio) * price * 0.01;
  }
  // P/B fair value: if P/B < 1.5, undervalued
  if (f.pbRatio > 0) {
    value += (1.5 - f.pbRatio) * price * 0.008;
  }
  // Dividend yield: higher yield = more value
  if (f.dividendYield >= 4) value += price * 0.03;
  else if (f.dividendYield >= 2) value += price * 0.01;
  // Growth premium
  if (f.revenueGrowth >= 10) value += price * 0.05;
  else if (f.revenueGrowth >= 5) value += price * 0.02;
  else if (f.revenueGrowth < 0) value -= price * 0.03;
  // ROE premium
  if (f.roe >= 15) value += price * 0.04;
  else if (f.roe < 5) value -= price * 0.02;
  // Debt discount
  if (f.debtToEquity > 2) value -= price * 0.05;
  else if (f.debtToEquity < 0.5) value += price * 0.02;
  // FCF yield premium
  if (f.fcFYield >= 5) value += price * 0.03;
  return Math.max(price * 0.5, value);
}

function computeTargetPrice(price: number, fairValue: number, atr: number, fundScore: number, techScore: number): number {
  // Target = blend of fair value upside + technical momentum (ATR-based)
  const fundTarget = fairValue;
  const techTarget = price + 4 * atr;
  const blend = fundScore > techScore ? fundTarget * 0.6 + techTarget * 0.4 : fundTarget * 0.4 + techTarget * 0.6;
  return Math.max(price, blend);
}

function computeRecommendation(fundScore: number, techScore: number, valuationGap: number, rsi: number): 'Strong Buy' | 'Buy' | 'Hold' | 'Wait' | 'Avoid' {
  if (fundScore >= 75 && techScore >= 65 && valuationGap > 5) return 'Strong Buy';
  if (fundScore >= 65 && techScore >= 50 && valuationGap > 0) return 'Buy';
  if (fundScore >= 55 && techScore >= 40) return 'Hold';
  if (fundScore >= 45 || techScore >= 40) return 'Wait';
  return 'Avoid';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const singleTicker = url.searchParams.get("ticker");
    const force = url.searchParams.get("force") === "true";

    // Load stock universe from database
    const { stockMap: STOCK_MAP, fundamentals: FUNDAMENTALS, names: STOCK_NAMES } = await loadStockConfig();

    const cacheMaxAgeMs = 60 * 60 * 1000; // 1 hour
    const tickersToFetch = singleTicker
      ? STOCK_MAP.filter((s) => s.ticker === singleTicker)
      : STOCK_MAP;

    // Check cache freshness
    if (!force) {
      const { data: cached } = await supabase
        .from("stock_data")
        .select("ticker, fetched_at")
        .in("ticker", tickersToFetch.map((s) => s.ticker));

      const now = Date.now();
      const freshTickers = (cached || [])
        .filter((c) => c.fetched_at && now - new Date(c.fetched_at).getTime() < cacheMaxAgeMs)
        .map((c) => c.ticker);

      if (singleTicker && freshTickers.includes(singleTicker)) {
        const { data: row } = await supabase
          .from("stock_data")
          .select("data")
          .eq("ticker", singleTicker)
          .maybeSingle();
        return new Response(JSON.stringify({ stock: row?.data, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!singleTicker && freshTickers.length === tickersToFetch.length) {
        const { data: rows } = await supabase
          .from("stock_data")
          .select("ticker, data")
          .in("ticker", tickersToFetch.map((s) => s.ticker));
        const stocks = (rows || []).map((r) => r.data).filter(Boolean);
        return new Response(JSON.stringify({ stocks, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch live data from Yahoo Finance in batches of 5
    const results: any[] = [];
    let fetched = 0;
    let failed = 0;
    const batchSize = 5;

    for (let i = 0; i < tickersToFetch.length; i += batchSize) {
      const batch = tickersToFetch.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (s) => {
          const yd = await fetchYahooData(s.yfSymbol);
          if (!yd || yd.closes.length === 0) {
            failed++;
            return null;
          }

          const price = yd.meta.regularMarketPrice;
          const validCloses = yd.closes.filter((c) => c > 0);
          const validVolumes = yd.volumes.filter((v) => v >= 0);
          const prices = validCloses;
          const volumes = validVolumes;

          const sma50 = computeSMA(prices, 50);
          const sma200 = computeSMA(prices, 200);
          const rsi = computeRSI(prices, 14);
          const { macd, signal: macdSignal, hist: macdHist } = computeMACD(prices);
          const boll = computeBollinger(prices);
          const atr = computeATR(prices, 14);

          const weekHigh = yd.meta.fiftyTwoWeekHigh || Math.max(...prices);
          const weekLow = yd.meta.fiftyTwoWeekLow || Math.min(...prices);
          const weekPosition = weekHigh > weekLow
            ? ((price - weekLow) / (weekHigh - weekLow)) * 100
            : 50;

          // Compute live dividend yield from Yahoo dividend data
          const totalDividends = yd.dividends.reduce((sum, d) => sum + d.amount, 0);
          const liveDivYield = price > 0 ? (totalDividends / price) * 100 : 0;

          const fund = FUNDAMENTALS[s.ticker];
          const fundScore = computeFundamentalScore(fund);
          const techScore = computeTechnicalScore(price, sma50, sma200, rsi, macdHist, boll.upper, boll.lower, weekPosition);
          const overallScore = Math.round(fundScore * 0.55 + techScore * 0.45);

          const fairValue = computeFairValue(price, fund);
          const targetPrice = computeTargetPrice(price, fairValue, atr, fundScore, techScore);
          const upsidePotential = price > 0 ? ((targetPrice - price) / price) * 100 : 0;
          const valuationGap = price > 0 ? ((fairValue - price) / price) * 100 : 0;
          const recommendation = computeRecommendation(fundScore, techScore, valuationGap, rsi);

          // Multi-period price changes
          const change1D = prices.length >= 2
            ? ((price - prices[prices.length - 2]) / prices[prices.length - 2]) * 100
            : 0;
          const change1W = prices.length >= 6
            ? ((price - prices[prices.length - 6]) / prices[prices.length - 6]) * 100
            : 0;
          const change1Y = prices.length >= 2
            ? ((price - prices[0]) / prices[0]) * 100
            : 0;
          // 3Y and 5Y estimated by compounding 1Y return
          const change3Y = (Math.pow(1 + change1Y / 100, 3) - 1) * 100;
          const change5Y = (Math.pow(1 + change1Y / 100, 5) - 1) * 100;

          // Bollinger band breakout: only flag a fresh breakout — previous close
          // was inside the bands and today's close is outside.
          const prevClose = prices.length >= 2 ? prices[prices.length - 2] : prices[0];
          const wasInside = prevClose < boll.upper && prevClose > boll.lower;
          const bollingerBreakout: 'upper' | 'lower' | null =
            price >= boll.upper && wasInside ? 'upper'
            : price <= boll.lower && wasInside ? 'lower'
            : null;

          const volume = yd.meta.regularMarketVolume || 0;
          const avgVolume = volumes.length > 0
            ? volumes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(volumes.length, 20)
            : volume;

          // Use live dividend yield if available, otherwise static
          const dividendYield = liveDivYield > 0 ? liveDivYield : (fund?.dividendYield || 0);

          // Price history (last 60 trading days for charts)
          const priceHistory = prices.slice(-60);
          const volumeHistory = volumes.slice(-60);

          return {
            ticker: s.ticker,
            name: yd.meta.longName || yd.meta.shortName || STOCK_NAMES[s.ticker] || s.ticker,
            sector: s.sector,
            industry: s.industry,
            price,
            marketCap: fund?.marketCap || 0,
            peRatio: fund?.peRatio || 0,
            forwardPE: fund?.forwardPE || 0,
            pbRatio: fund?.pbRatio || 0,
            psRatio: fund?.psRatio || 0,
            dividendYield,
            payoutRatio: fund?.payoutRatio || 0,
            roe: fund?.roe || 0,
            roa: fund?.roa || 0,
            debtToEquity: fund?.debtToEquity || 0,
            currentRatio: fund?.currentRatio || 0,
            grossMargin: fund?.grossMargin || 0,
            netMargin: fund?.netMargin || 0,
            revenueGrowth: fund?.revenueGrowth || 0,
            earningsGrowth: fund?.earningsGrowth || 0,
            fcFYield: fund?.fcFYield || 0,
            beta: fund?.beta || 1,
            sma50,
            sma200,
            rsi,
            macd,
            macdSignal,
            macdHist,
            bollingerUpper: boll.upper,
            bollingerLower: boll.lower,
            bollingerMiddle: boll.middle,
            atr,
            volume,
            avgVolume,
            fiftyTwoWeekHigh: weekHigh,
            fiftyTwoWeekLow: weekLow,
            priceHistory,
            volumeHistory,
            fundamentalScore: fundScore,
            technicalScore: techScore,
            overallScore,
            targetPrice: Math.round(targetPrice * 100) / 100,
            fairValue: Math.round(fairValue * 100) / 100,
            recommendation,
            upsidePotential: Math.round(upsidePotential * 100) / 100,
            valuationGap: Math.round(valuationGap * 100) / 100,
            change1D: Math.round(change1D * 100) / 100,
            change1W: Math.round(change1W * 100) / 100,
            change1Y: Math.round(change1Y * 100) / 100,
            change3Y: Math.round(change3Y * 100) / 100,
            change5Y: Math.round(change5Y * 100) / 100,
            bollingerBreakout,
          };
        })
      );

      for (const result of batchResults) {
        if (result) {
          results.push(result);
          fetched++;
          await supabase.from("stock_data").upsert({
            ticker: result.ticker,
            data: result,
            fetched_at: new Date().toISOString(),
          });
        }
      }
    }

    if (singleTicker) {
      const stock = results.find((r) => r.ticker === singleTicker);
      if (!stock) {
        return new Response(JSON.stringify({ error: "Failed to fetch stock data" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ stock, cached: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ stocks: results, cached: false, fetched, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
