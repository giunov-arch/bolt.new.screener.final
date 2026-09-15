export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  price: number;
  marketCap: number; // in billions EUR
  // Fundamentals
  peRatio: number;
  forwardPE: number;
  pbRatio: number;
  psRatio: number;
  dividendYield: number; // percentage
  payoutRatio: number; // percentage
  roe: number; // percentage
  roa: number; // percentage
  debtToEquity: number;
  currentRatio: number;
  grossMargin: number; // percentage
  netMargin: number; // percentage
  revenueGrowth: number; // percentage YoY
  earningsGrowth: number; // percentage YoY
  fcFYield: number; // percentage
  beta: number;
  // Technicals
  sma50: number;
  sma200: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHist: number;
  bollingerUpper: number;
  bollingerLower: number;
  bollingerMiddle: number;
  atr: number;
  volume: number;
  avgVolume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  priceHistory: number[]; // last 60 trading days
  volumeHistory: number[];
  // Scores (pre-calculated)
  fundamentalScore: number; // 0-100
  technicalScore: number; // 0-100
  overallScore: number; // 0-100
  // Analyst estimates (computed)
  targetPrice: number; // price target based on technical + fundamental blend
  fairValue: number; // intrinsic value estimate from fundamentals
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Wait' | 'Avoid';
  upsidePotential: number; // percentage upside to target price
  valuationGap: number; // percentage difference: fair value vs current price
  // Multi-period price changes (computed from price history)
  change1D: number; // percentage
  change1W: number; // percentage
  change1Y: number; // percentage
  change3Y: number; // percentage (estimated from available data)
  change5Y: number; // percentage (estimated from available data)
  // Bollinger band breakout
  bollingerBreakout: 'upper' | 'lower' | null; // null = within bands
}

export interface ScreeningFilters {
  sectors: string[];
  minMarketCap: number;
  maxPE: number;
  minDividendYield: number;
  minROE: number;
  maxDebtToEquity: number;
  minRevenueGrowth: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PortfolioHolding {
  ticker: string;
  weight: number; // percentage
  shares: number;
  entryPrice: number;
  currentPrice: number;
}

export interface PortfolioAllocation {
  ticker: string;
  weight: number;
  rationale: string;
}

export interface TechnicalSignal {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  description: string;
  strength: 'strong' | 'moderate' | 'weak';
}
