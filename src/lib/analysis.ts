import { Stock, ScreeningFilters, PortfolioAllocation } from '@/types';

export function screenStocks(stocks: Stock[], filters: ScreeningFilters): Stock[] {
  let filtered = stocks.filter((s) => {
    if (filters.sectors.length > 0 && !filters.sectors.includes(s.sector)) return false;
    if (s.marketCap < filters.minMarketCap) return false;
    if (s.peRatio > 0 && s.peRatio > filters.maxPE) return false;
    if (s.dividendYield < filters.minDividendYield) return false;
    if (s.roe < filters.minROE) return false;
    if (s.debtToEquity > filters.maxDebtToEquity) return false;
    if (s.revenueGrowth < filters.minRevenueGrowth) return false;
    return true;
  });

  filtered = sortStocks(filtered, filters.sortBy, filters.sortOrder);
  return filtered;
}

export function sortStocks(
  list: Stock[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): Stock[] {
  const sorted = [...list].sort((a, b) => {
    let valA: number, valB: number;
    switch (sortBy) {
      case 'overallScore': valA = a.overallScore; valB = b.overallScore; break;
      case 'fundamentalScore': valA = a.fundamentalScore; valB = b.fundamentalScore; break;
      case 'technicalScore': valA = a.technicalScore; valB = b.technicalScore; break;
      case 'marketCap': valA = a.marketCap; valB = b.marketCap; break;
      case 'peRatio': valA = a.peRatio || 999; valB = b.peRatio || 999; break;
      case 'dividendYield': valA = a.dividendYield; valB = b.dividendYield; break;
      case 'roe': valA = a.roe; valB = b.roe; break;
      case 'revenueGrowth': valA = a.revenueGrowth; valB = b.revenueGrowth; break;
      case 'price': valA = a.price; valB = b.price; break;
      default: valA = a.overallScore; valB = b.overallScore;
    }
    return sortOrder === 'desc' ? valB - valA : valA - valB;
  });
  return sorted;
}

export function buildPortfolio(
  stocks: Stock[],
  selectedTickers: string[],
  riskTolerance: 'conservative' | 'balanced' | 'aggressive',
  capital: number
): { allocations: PortfolioAllocation[]; expectedReturn: number; expectedDividend: number; riskLevel: string } {
  const selected = stocks.filter((s) => selectedTickers.includes(s.ticker));
  if (selected.length === 0) {
    return { allocations: [], expectedReturn: 0, expectedDividend: 0, riskLevel: 'N/A' };
  }

  // Weight allocation based on risk tolerance and scores
  const riskWeights = {
    conservative: { fundamentalWeight: 0.7, technicalWeight: 0.3, maxPerStock: 25 },
    balanced: { fundamentalWeight: 0.55, technicalWeight: 0.45, maxPerStock: 20 },
    aggressive: { fundamentalWeight: 0.4, technicalWeight: 0.6, maxPerStock: 30 },
  };

  const config = riskWeights[riskTolerance];
  const maxPerStock = config.maxPerStock;

  // Calculate raw scores
  const scored = selected.map((s) => ({
    stock: s,
    rawScore: s.fundamentalScore * config.fundamentalWeight + s.technicalScore * config.technicalWeight,
  }));

  const totalRaw = scored.reduce((sum, s) => sum + s.rawScore, 0);

  // Initial proportional allocation
  let allocations = scored.map((s) => ({
    ticker: s.stock.ticker,
    weight: (s.rawScore / totalRaw) * 100,
    rationale: getAllocationRationale(s.stock, riskTolerance),
  }));

  // Cap at maxPerStock and redistribute
  let excess = 0;
  allocations = allocations.map((a) => {
    if (a.weight > maxPerStock) {
      excess += a.weight - maxPerStock;
      return { ...a, weight: maxPerStock };
    }
    return a;
  });

  if (excess > 0) {
    const uncapped = allocations.filter((a) => a.weight < maxPerStock);
    const uncappedTotal = uncapped.reduce((sum, a) => sum + a.weight, 0);
    allocations = allocations.map((a) => {
      if (a.weight < maxPerStock) {
        return { ...a, weight: a.weight + (excess * a.weight / uncappedTotal) };
      }
      return a;
    });
  }

  // Normalize to 100%
  const totalWeight = allocations.reduce((sum, a) => sum + a.weight, 0);
  allocations = allocations.map((a) => ({
    ...a,
    weight: (a.weight / totalWeight) * 100,
  }));

  // Sort by weight descending
  allocations.sort((a, b) => b.weight - a.weight);

  // Calculate expected metrics
  const expectedDividend = allocations.reduce((sum, a) => {
    const stock = selected.find((s) => s.ticker === a.ticker)!;
    return sum + (a.weight / 100) * stock.dividendYield;
  }, 0);

  const expectedReturn = allocations.reduce((sum, a) => {
    const stock = selected.find((s) => s.ticker === a.ticker)!;
    const earningsYield = stock.forwardPE > 0 ? (1 / stock.forwardPE) * 100 : 0;
    return sum + (a.weight / 100) * (earningsYield + stock.dividendYield + stock.earningsGrowth * 0.5);
  }, 0);

  const avgBeta = allocations.reduce((sum, a) => {
    const stock = selected.find((s) => s.ticker === a.ticker)!;
    return sum + (a.weight / 100) * stock.beta;
  }, 0);

  const riskLevel = avgBeta < 0.9 ? 'Low' : avgBeta < 1.2 ? 'Medium' : 'High';

  return { allocations, expectedReturn, expectedDividend, riskLevel };
}

function getAllocationRationale(stock: Stock, risk: string): string {
  const signals = [];
  if (stock.fundamentalScore >= 75) signals.push('strong fundamentals');
  if (stock.technicalScore >= 65) signals.push('favorable technicals');
  if (stock.dividendYield >= 5) signals.push('high dividend yield');
  if (stock.roe >= 15) signals.push('high ROE');
  if (stock.revenueGrowth >= 10) signals.push('strong growth');
  if (stock.peRatio > 0 && stock.peRatio <= 8) signals.push('attractive valuation');

  if (risk === 'conservative' && stock.beta < 1) signals.push('low volatility');
  if (risk === 'aggressive' && stock.beta > 1.2) signals.push('high beta for upside');

  return signals.length > 0 ? signals.join(', ') : 'diversification';
}

export function getSectorBreakdown(stocks: Stock[], tickers: string[]): { sector: string; count: number; avgScore: number }[] {
  const selected = stocks.filter((s) => tickers.includes(s.ticker));
  const sectorMap = new Map<string, { count: number; totalScore: number }>();

  selected.forEach((s) => {
    const existing = sectorMap.get(s.sector) || { count: 0, totalScore: 0 };
    sectorMap.set(s.sector, {
      count: existing.count + 1,
      totalScore: existing.totalScore + s.overallScore,
    });
  });

  return Array.from(sectorMap.entries()).map(([sector, data]) => ({
    sector,
    count: data.count,
    avgScore: data.totalScore / data.count,
  })).sort((a, b) => b.count - a.count);
}
