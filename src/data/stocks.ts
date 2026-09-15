import { Stock, TechnicalSignal } from '@/types';

// Real Italian stocks listed on Borsa Italiana (Euronext Milan)
// with realistic fundamental and technical data
const _stocksRaw: Omit<Stock, typeof OMIT_KEYS[number]>[] = [
  {
    ticker: 'ENI',
    name: 'Eni S.p.A.',
    sector: 'Energy',
    industry: 'Oil & Gas Integrated',
    price: 14.85,
    marketCap: 49.2,
    peRatio: 7.8,
    forwardPE: 7.1,
    pbRatio: 0.95,
    psRatio: 0.68,
    dividendYield: 5.8,
    payoutRatio: 45,
    roe: 12.5,
    roa: 7.2,
    debtToEquity: 0.38,
    currentRatio: 1.35,
    grossMargin: 38,
    netMargin: 9.5,
    revenueGrowth: 3.2,
    earningsGrowth: -5.1,
    fcFYield: 8.2,
    beta: 0.85,
    sma50: 14.62,
    sma200: 14.98,
    rsi: 55.3,
    macd: 0.08,
    macdSignal: 0.05,
    macdHist: 0.03,
    bollingerUpper: 15.40,
    bollingerLower: 14.10,
    bollingerMiddle: 14.75,
    atr: 0.28,
    volume: 15200000,
    avgVolume: 18500000,
    fiftyTwoWeekHigh: 16.20,
    fiftyTwoWeekLow: 13.45,
    priceHistory: genHistory(14.85, 60, 0.015, 0.008),
    volumeHistory: genVolume(15200000, 60),
    fundamentalScore: 72,
    technicalScore: 58,
    overallScore: 66,
  },
  {
    ticker: 'ISP',
    name: 'Intesa Sanpaolo S.p.A.',
    sector: 'Financials',
    industry: 'Diversified Banks',
    price: 2.42,
    marketCap: 43.1,
    peRatio: 7.2,
    forwardPE: 6.5,
    pbRatio: 0.82,
    psRatio: 2.1,
    dividendYield: 7.2,
    payoutRatio: 52,
    roe: 11.8,
    roa: 0.95,
    debtToEquity: 1.15,
    currentRatio: 0,
    grossMargin: 0,
    netMargin: 28.5,
    revenueGrowth: 6.8,
    earningsGrowth: 12.3,
    fcFYield: 0,
    beta: 1.28,
    sma50: 2.38,
    sma200: 2.25,
    rsi: 62.1,
    macd: 0.025,
    macdSignal: 0.018,
    macdHist: 0.007,
    bollingerUpper: 2.55,
    bollingerLower: 2.28,
    bollingerMiddle: 2.41,
    atr: 0.065,
    volume: 85000000,
    avgVolume: 92000000,
    fiftyTwoWeekHigh: 2.68,
    fiftyTwoWeekLow: 1.92,
    priceHistory: genHistory(2.42, 60, 0.012, 0.006),
    volumeHistory: genVolume(85000000, 60),
    fundamentalScore: 78,
    technicalScore: 71,
    overallScore: 75,
  },
  {
    ticker: 'UCG',
    name: 'UniCredit S.p.A.',
    sector: 'Financials',
    industry: 'Diversified Banks',
    price: 19.75,
    marketCap: 35.8,
    peRatio: 6.8,
    forwardPE: 5.9,
    pbRatio: 0.78,
    psRatio: 1.9,
    dividendYield: 6.5,
    payoutRatio: 40,
    roe: 12.2,
    roa: 1.05,
    debtToEquity: 1.05,
    currentRatio: 0,
    grossMargin: 0,
    netMargin: 27.8,
    revenueGrowth: 8.5,
    earningsGrowth: 18.7,
    fcFYield: 0,
    beta: 1.35,
    sma50: 19.32,
    sma200: 17.85,
    rsi: 66.8,
    macd: 0.22,
    macdSignal: 0.15,
    macdHist: 0.07,
    bollingerUpper: 20.80,
    bollingerLower: 18.50,
    bollingerMiddle: 19.65,
    atr: 0.52,
    volume: 22000000,
    avgVolume: 25000000,
    fiftyTwoWeekHigh: 21.50,
    fiftyTwoWeekLow: 14.20,
    priceHistory: genHistory(19.75, 60, 0.014, 0.007),
    volumeHistory: genVolume(22000000, 60),
    fundamentalScore: 82,
    technicalScore: 76,
    overallScore: 80,
  },
  {
    ticker: 'STM',
    name: 'STMicroelectronics N.V.',
    sector: 'Technology',
    industry: 'Semiconductors',
    price: 24.30,
    marketCap: 22.1,
    peRatio: 9.5,
    forwardPE: 12.8,
    pbRatio: 2.1,
    psRatio: 1.8,
    dividendYield: 1.2,
    payoutRatio: 12,
    roe: 22.5,
    roa: 14.8,
    debtToEquity: 0.15,
    currentRatio: 2.8,
    grossMargin: 47,
    netMargin: 24.5,
    revenueGrowth: -2.5,
    earningsGrowth: -8.4,
    fcFYield: 3.5,
    beta: 1.65,
    sma50: 25.10,
    sma200: 26.80,
    rsi: 42.5,
    macd: -0.18,
    macdSignal: -0.12,
    macdHist: -0.06,
    bollingerUpper: 26.50,
    bollingerLower: 23.10,
    bollingerMiddle: 24.80,
    atr: 0.85,
    volume: 3500000,
    avgVolume: 4800000,
    fiftyTwoWeekHigh: 32.50,
    fiftyTwoWeekLow: 22.10,
    priceHistory: genHistory(24.30, 60, 0.018, 0.012),
    volumeHistory: genVolume(3500000, 60),
    fundamentalScore: 68,
    technicalScore: 38,
    overallScore: 55,
  },
  {
    ticker: 'FERRARI',
    name: 'Ferrari N.V.',
    sector: 'Consumer Discretionary',
    industry: 'Luxury Vehicles',
    price: 412.50,
    marketCap: 74.3,
    peRatio: 32.5,
    forwardPE: 28.2,
    pbRatio: 12.8,
    psRatio: 7.2,
    dividendYield: 1.1,
    payoutRatio: 25,
    roe: 42.5,
    roa: 18.2,
    debtToEquity: 0.85,
    currentRatio: 1.8,
    grossMargin: 52,
    netMargin: 24,
    revenueGrowth: 11.2,
    earningsGrowth: 14.8,
    fcFYield: 1.8,
    beta: 0.92,
    sma50: 405.00,
    sma200: 378.50,
    rsi: 64.2,
    macd: 3.25,
    macdSignal: 2.80,
    macdHist: 0.45,
    bollingerUpper: 425.00,
    bollingerLower: 392.00,
    bollingerMiddle: 408.50,
    atr: 9.50,
    volume: 320000,
    avgVolume: 450000,
    fiftyTwoWeekHigh: 435.00,
    fiftyTwoWeekLow: 312.00,
    priceHistory: genHistory(412.50, 60, 0.010, 0.005),
    volumeHistory: genVolume(320000, 60),
    fundamentalScore: 85,
    technicalScore: 72,
    overallScore: 80,
  },
  {
    ticker: 'ENEL',
    name: 'Enel S.p.A.',
    sector: 'Utilities',
    industry: 'Electric Utilities',
    price: 6.42,
    marketCap: 65.8,
    peRatio: 9.2,
    forwardPE: 8.5,
    pbRatio: 1.15,
    psRatio: 0.85,
    dividendYield: 6.2,
    payoutRatio: 58,
    roe: 12.8,
    roa: 4.5,
    debtToEquity: 1.45,
    currentRatio: 0.82,
    grossMargin: 32,
    netMargin: 10.2,
    revenueGrowth: 1.5,
    earningsGrowth: 3.8,
    fcFYield: 4.2,
    beta: 0.78,
    sma50: 6.35,
    sma200: 6.58,
    rsi: 50.2,
    macd: 0.02,
    macdSignal: 0.01,
    macdHist: 0.01,
    bollingerUpper: 6.65,
    bollingerLower: 6.12,
    bollingerMiddle: 6.38,
    atr: 0.12,
    volume: 28000000,
    avgVolume: 32000000,
    fiftyTwoWeekHigh: 7.15,
    fiftyTwoWeekLow: 5.88,
    priceHistory: genHistory(6.42, 60, 0.008, 0.005),
    volumeHistory: genVolume(28000000, 60),
    fundamentalScore: 65,
    technicalScore: 52,
    overallScore: 60,
  },
  {
    ticker: 'LDO',
    name: 'Leonardo S.p.A.',
    sector: 'Industrials',
    industry: 'Aerospace & Defense',
    price: 22.85,
    marketCap: 13.2,
    peRatio: 14.5,
    forwardPE: 12.2,
    pbRatio: 2.8,
    psRatio: 1.1,
    dividendYield: 1.8,
    payoutRatio: 22,
    roe: 19.5,
    roa: 8.2,
    debtToEquity: 0.92,
    currentRatio: 1.15,
    grossMargin: 24,
    netMargin: 7.5,
    revenueGrowth: 14.2,
    earningsGrowth: 22.5,
    fcFYield: 2.8,
    beta: 0.95,
    sma50: 21.50,
    sma200: 18.75,
    rsi: 68.5,
    macd: 0.45,
    macdSignal: 0.32,
    macdHist: 0.13,
    bollingerUpper: 24.20,
    bollingerLower: 20.10,
    bollingerMiddle: 22.15,
    atr: 0.72,
    volume: 4800000,
    avgVolume: 5500000,
    fiftyTwoWeekHigh: 24.80,
    fiftyTwoWeekLow: 12.50,
    priceHistory: genHistory(22.85, 60, 0.016, 0.010),
    volumeHistory: genVolume(4800000, 60),
    fundamentalScore: 76,
    technicalScore: 82,
    overallScore: 78,
  },
  {
    ticker: 'BAMI',
    name: 'Banco BPM S.p.A.',
    sector: 'Financials',
    industry: 'Regional Banks',
    price: 7.85,
    marketCap: 12.8,
    peRatio: 6.5,
    forwardPE: 5.8,
    pbRatio: 0.65,
    psRatio: 1.7,
    dividendYield: 8.5,
    payoutRatio: 55,
    roe: 10.2,
    roa: 0.85,
    debtToEquity: 0.95,
    currentRatio: 0,
    grossMargin: 0,
    netMargin: 26.5,
    revenueGrowth: 9.2,
    earningsGrowth: 16.8,
    fcFYield: 0,
    beta: 1.42,
    sma50: 7.62,
    sma200: 6.95,
    rsi: 63.5,
    macd: 0.12,
    macdSignal: 0.08,
    macdHist: 0.04,
    bollingerUpper: 8.25,
    bollingerLower: 7.20,
    bollingerMiddle: 7.72,
    atr: 0.22,
    volume: 12000000,
    avgVolume: 14000000,
    fiftyTwoWeekHigh: 8.45,
    fiftyTwoWeekLow: 5.55,
    priceHistory: genHistory(7.85, 60, 0.015, 0.008),
    volumeHistory: genVolume(12000000, 60),
    fundamentalScore: 75,
    technicalScore: 74,
    overallScore: 75,
  },
  {
    ticker: 'TIT',
    name: 'Telecom Italia S.p.A.',
    sector: 'Communication Services',
    industry: 'Telecom Services',
    price: 0.285,
    marketCap: 5.8,
    peRatio: 0,
    forwardPE: 8.2,
    pbRatio: 0.45,
    psRatio: 0.35,
    dividendYield: 0,
    payoutRatio: 0,
    roe: -8.5,
    roa: -2.1,
    debtToEquity: 2.85,
    currentRatio: 0.65,
    grossMargin: 58,
    netMargin: -5.2,
    revenueGrowth: -4.5,
    earningsGrowth: -15.2,
    fcFYield: -2.5,
    beta: 1.15,
    sma50: 0.278,
    sma200: 0.295,
    rsi: 47.8,
    macd: 0.002,
    macdSignal: 0.001,
    macdHist: 0.001,
    bollingerUpper: 0.305,
    bollingerLower: 0.262,
    bollingerMiddle: 0.283,
    atr: 0.012,
    volume: 45000000,
    avgVolume: 52000000,
    fiftyTwoWeekHigh: 0.352,
    fiftyTwoWeekLow: 0.245,
    priceHistory: genHistory(0.285, 60, 0.014, 0.010),
    volumeHistory: genVolume(45000000, 60),
    fundamentalScore: 25,
    technicalScore: 48,
    overallScore: 35,
  },
  {
    ticker: 'PRY',
    name: 'Prysmian S.p.A.',
    sector: 'Industrials',
    industry: 'Electrical Equipment',
    price: 52.80,
    marketCap: 13.8,
    peRatio: 13.2,
    forwardPE: 11.5,
    pbRatio: 2.5,
    psRatio: 1.2,
    dividendYield: 2.8,
    payoutRatio: 32,
    roe: 19.2,
    roa: 8.8,
    debtToEquity: 0.68,
    currentRatio: 1.35,
    grossMargin: 28,
    netMargin: 8.5,
    revenueGrowth: 12.5,
    earningsGrowth: 19.8,
    fcFYield: 3.8,
    beta: 1.08,
    sma50: 51.20,
    sma200: 47.50,
    rsi: 61.2,
    macd: 0.55,
    macdSignal: 0.42,
    macdHist: 0.13,
    bollingerUpper: 55.20,
    bollingerLower: 48.80,
    bollingerMiddle: 52.00,
    atr: 1.35,
    volume: 1800000,
    avgVolume: 2200000,
    fiftyTwoWeekHigh: 56.50,
    fiftyTwoWeekLow: 38.20,
    priceHistory: genHistory(52.80, 60, 0.013, 0.008),
    volumeHistory: genVolume(1800000, 60),
    fundamentalScore: 80,
    technicalScore: 70,
    overallScore: 76,
  },
  {
    ticker: 'CNHI',
    name: 'CNH Industrial N.V.',
    sector: 'Industrials',
    industry: 'Farm & Heavy Machinery',
    price: 11.25,
    marketCap: 16.8,
    peRatio: 8.2,
    forwardPE: 7.5,
    pbRatio: 1.25,
    psRatio: 0.55,
    dividendYield: 4.5,
    payoutRatio: 35,
    roe: 15.5,
    roa: 6.2,
    debtToEquity: 0.85,
    currentRatio: 1.45,
    grossMargin: 25,
    netMargin: 6.8,
    revenueGrowth: 2.8,
    earningsGrowth: 4.2,
    fcFYield: 5.2,
    beta: 1.18,
    sma50: 11.05,
    sma200: 11.42,
    rsi: 52.8,
    macd: 0.05,
    macdSignal: 0.03,
    macdHist: 0.02,
    bollingerUpper: 11.80,
    bollingerLower: 10.50,
    bollingerMiddle: 11.15,
    atr: 0.28,
    volume: 5200000,
    avgVolume: 6500000,
    fiftyTwoWeekHigh: 12.80,
    fiftyTwoWeekLow: 9.85,
    priceHistory: genHistory(11.25, 60, 0.012, 0.007),
    volumeHistory: genVolume(5200000, 60),
    fundamentalScore: 70,
    technicalScore: 55,
    overallScore: 64,
  },
  {
    ticker: 'STLAM',
    name: 'Stellantis N.V.',
    sector: 'Consumer Discretionary',
    industry: 'Automobiles',
    price: 13.45,
    marketCap: 42.5,
    peRatio: 5.8,
    forwardPE: 5.2,
    pbRatio: 0.72,
    psRatio: 0.28,
    dividendYield: 8.2,
    payoutRatio: 48,
    roe: 13.2,
    roa: 5.8,
    debtToEquity: 0.42,
    currentRatio: 1.15,
    grossMargin: 18,
    netMargin: 5.2,
    revenueGrowth: -3.5,
    earningsGrowth: -8.8,
    fcFYield: 9.5,
    beta: 1.45,
    sma50: 13.15,
    sma200: 14.85,
    rsi: 45.2,
    macd: -0.08,
    macdSignal: -0.05,
    macdHist: -0.03,
    bollingerUpper: 14.20,
    bollingerLower: 12.50,
    bollingerMiddle: 13.35,
    atr: 0.38,
    volume: 28000000,
    avgVolume: 35000000,
    fiftyTwoWeekHigh: 18.50,
    fiftyTwoWeekLow: 12.20,
    priceHistory: genHistory(13.45, 60, 0.016, 0.010),
    volumeHistory: genVolume(28000000, 60),
    fundamentalScore: 68,
    technicalScore: 42,
    overallScore: 57,
  },
  {
    ticker: 'A2A',
    name: 'A2A S.p.A.',
    sector: 'Utilities',
    industry: 'Electric Utilities',
    price: 1.68,
    marketCap: 5.2,
    peRatio: 10.5,
    forwardPE: 9.8,
    pbRatio: 1.05,
    psRatio: 0.65,
    dividendYield: 5.5,
    payoutRatio: 55,
    roe: 10.2,
    roa: 3.8,
    debtToEquity: 1.25,
    currentRatio: 0.95,
    grossMargin: 22,
    netMargin: 6.5,
    revenueGrowth: 4.2,
    earningsGrowth: 7.8,
    fcFYield: 4.5,
    beta: 0.88,
    sma50: 1.65,
    sma200: 1.58,
    rsi: 57.5,
    macd: 0.015,
    macdSignal: 0.010,
    macdHist: 0.005,
    bollingerUpper: 1.75,
    bollingerLower: 1.55,
    bollingerMiddle: 1.65,
    atr: 0.045,
    volume: 8500000,
    avgVolume: 10000000,
    fiftyTwoWeekHigh: 1.82,
    fiftyTwoWeekLow: 1.38,
    priceHistory: genHistory(1.68, 60, 0.010, 0.006),
    volumeHistory: genVolume(8500000, 60),
    fundamentalScore: 62,
    technicalScore: 60,
    overallScore: 61,
  },
  {
    ticker: 'AZM',
    name: 'Azimut Holding S.p.A.',
    sector: 'Financials',
    industry: 'Asset Management',
    price: 18.50,
    marketCap: 4.8,
    peRatio: 8.5,
    forwardPE: 7.8,
    pbRatio: 1.85,
    psRatio: 2.2,
    dividendYield: 6.8,
    payoutRatio: 58,
    roe: 22.8,
    roa: 12.5,
    debtToEquity: 0.15,
    currentRatio: 1.25,
    grossMargin: 65,
    netMargin: 28,
    revenueGrowth: 8.5,
    earningsGrowth: 11.2,
    fcFYield: 7.5,
    beta: 1.22,
    sma50: 18.20,
    sma200: 17.50,
    rsi: 58.8,
    macd: 0.18,
    macdSignal: 0.12,
    macdHist: 0.06,
    bollingerUpper: 19.50,
    bollingerLower: 17.20,
    bollingerMiddle: 18.35,
    atr: 0.42,
    volume: 850000,
    avgVolume: 1100000,
    fiftyTwoWeekHigh: 20.20,
    fiftyTwoWeekLow: 15.80,
    priceHistory: genHistory(18.50, 60, 0.012, 0.007),
    volumeHistory: genVolume(850000, 60),
    fundamentalScore: 84,
    technicalScore: 66,
    overallScore: 77,
  },
  {
    ticker: 'RACE',
    name: 'Campari Group',
    sector: 'Consumer Staples',
    industry: 'Beverages - Alcoholic',
    price: 8.92,
    marketCap: 10.8,
    peRatio: 22.5,
    forwardPE: 19.8,
    pbRatio: 2.8,
    psRatio: 2.5,
    dividendYield: 1.5,
    payoutRatio: 30,
    roe: 12.5,
    roa: 6.8,
    debtToEquity: 1.15,
    currentRatio: 1.05,
    grossMargin: 52,
    netMargin: 12.5,
    revenueGrowth: 9.2,
    earningsGrowth: 8.5,
    fcFYield: 2.2,
    beta: 0.85,
    sma50: 8.85,
    sma200: 9.15,
    rsi: 49.5,
    macd: -0.02,
    macdSignal: -0.01,
    macdHist: -0.01,
    bollingerUpper: 9.35,
    bollingerLower: 8.52,
    bollingerMiddle: 8.93,
    atr: 0.18,
    volume: 2200000,
    avgVolume: 2800000,
    fiftyTwoWeekHigh: 10.25,
    fiftyTwoWeekLow: 8.15,
    priceHistory: genHistory(8.92, 60, 0.011, 0.007),
    volumeHistory: genVolume(2200000, 60),
    fundamentalScore: 70,
    technicalScore: 50,
    overallScore: 62,
  },
  {
    ticker: 'NEXI',
    name: 'Nexi S.p.A.',
    sector: 'Financials',
    industry: 'Specialty Business Services',
    price: 7.42,
    marketCap: 10.2,
    peRatio: 11.2,
    forwardPE: 9.5,
    pbRatio: 1.15,
    psRatio: 1.8,
    dividendYield: 3.5,
    payoutRatio: 38,
    roe: 10.5,
    roa: 5.2,
    debtToEquity: 1.65,
    currentRatio: 0.88,
    grossMargin: 55,
    netMargin: 15.2,
    revenueGrowth: 7.5,
    earningsGrowth: 10.8,
    fcFYield: 5.5,
    beta: 1.15,
    sma50: 7.25,
    sma200: 7.58,
    rsi: 48.2,
    macd: -0.03,
    macdSignal: -0.02,
    macdHist: -0.01,
    bollingerUpper: 7.85,
    bollingerLower: 6.95,
    bollingerMiddle: 7.40,
    atr: 0.20,
    volume: 3200000,
    avgVolume: 4200000,
    fiftyTwoWeekHigh: 8.65,
    fiftyTwoWeekLow: 6.72,
    priceHistory: genHistory(7.42, 60, 0.013, 0.008),
    volumeHistory: genVolume(3200000, 60),
    fundamentalScore: 64,
    technicalScore: 47,
    overallScore: 57,
  },
  {
    ticker: 'BZU',
    name: 'Buzzi Unicem S.p.A.',
    sector: 'Materials',
    industry: 'Building Materials',
    price: 23.50,
    marketCap: 4.2,
    peRatio: 8.8,
    forwardPE: 7.9,
    pbRatio: 1.05,
    psRatio: 0.75,
    dividendYield: 4.2,
    payoutRatio: 35,
    roe: 12.2,
    roa: 6.5,
    debtToEquity: 0.55,
    currentRatio: 1.35,
    grossMargin: 35,
    netMargin: 11.5,
    revenueGrowth: 5.8,
    earningsGrowth: 9.2,
    fcFYield: 5.8,
    beta: 1.05,
    sma50: 23.20,
    sma200: 22.10,
    rsi: 56.2,
    macd: 0.12,
    macdSignal: 0.08,
    macdHist: 0.04,
    bollingerUpper: 24.50,
    bollingerLower: 22.20,
    bollingerMiddle: 23.35,
    atr: 0.55,
    volume: 580000,
    avgVolume: 750000,
    fiftyTwoWeekHigh: 25.80,
    fiftyTwoWeekLow: 19.50,
    priceHistory: genHistory(23.50, 60, 0.011, 0.007),
    volumeHistory: genVolume(580000, 60),
    fundamentalScore: 72,
    technicalScore: 62,
    overallScore: 68,
  },
  {
    ticker: 'IG',
    name: 'Italgas S.p.A.',
    sector: 'Utilities',
    industry: 'Gas Utilities',
    price: 5.38,
    marketCap: 5.5,
    peRatio: 14.2,
    forwardPE: 12.8,
    pbRatio: 1.45,
    psRatio: 2.5,
    dividendYield: 4.8,
    payoutRatio: 65,
    roe: 10.2,
    roa: 4.2,
    debtToEquity: 1.85,
    currentRatio: 0.78,
    grossMargin: 42,
    netMargin: 15.5,
    revenueGrowth: 6.2,
    earningsGrowth: 8.5,
    fcFYield: 3.2,
    beta: 0.72,
    sma50: 5.32,
    sma200: 5.18,
    rsi: 55.8,
    macd: 0.025,
    macdSignal: 0.018,
    macdHist: 0.007,
    bollingerUpper: 5.55,
    bollingerLower: 5.12,
    bollingerMiddle: 5.34,
    atr: 0.11,
    volume: 1800000,
    avgVolume: 2400000,
    fiftyTwoWeekHigh: 5.78,
    fiftyTwoWeekLow: 4.55,
    priceHistory: genHistory(5.38, 60, 0.009, 0.005),
    volumeHistory: genVolume(1800000, 60),
    fundamentalScore: 68,
    technicalScore: 58,
    overallScore: 64,
  },
  {
    ticker: 'TEN',
    name: 'Tenaris S.A.',
    sector: 'Energy',
    industry: 'Oil & Gas Equipment',
    price: 14.80,
    marketCap: 16.8,
    peRatio: 6.2,
    forwardPE: 5.8,
    pbRatio: 1.15,
    psRatio: 1.2,
    dividendYield: 5.2,
    payoutRatio: 32,
    roe: 18.8,
    roa: 12.2,
    debtToEquity: 0.12,
    currentRatio: 2.2,
    grossMargin: 28,
    netMargin: 16.5,
    revenueGrowth: 5.5,
    earningsGrowth: 8.8,
    fcFYield: 7.8,
    beta: 1.32,
    sma50: 14.55,
    sma200: 15.25,
    rsi: 51.5,
    macd: 0.04,
    macdSignal: 0.02,
    macdHist: 0.02,
    bollingerUpper: 15.60,
    bollingerLower: 13.80,
    bollingerMiddle: 14.70,
    atr: 0.38,
    volume: 2800000,
    avgVolume: 3500000,
    fiftyTwoWeekHigh: 17.20,
    fiftyTwoWeekLow: 12.85,
    priceHistory: genHistory(14.80, 60, 0.014, 0.009),
    volumeHistory: genVolume(2800000, 60),
    fundamentalScore: 82,
    technicalScore: 54,
    overallScore: 70,
  },
  {
    ticker: 'MONC',
    name: 'Moncler S.p.A.',
    sector: 'Consumer Discretionary',
    industry: 'Luxury Goods',
    price: 58.50,
    marketCap: 15.8,
    peRatio: 25.8,
    forwardPE: 22.5,
    pbRatio: 5.8,
    psRatio: 4.2,
    dividendYield: 1.8,
    payoutRatio: 22,
    roe: 23.5,
    roa: 16.8,
    debtToEquity: 0.25,
    currentRatio: 2.5,
    grossMargin: 72,
    netMargin: 20.5,
    revenueGrowth: 15.2,
    earningsGrowth: 18.5,
    fcFYield: 3.5,
    beta: 1.28,
    sma50: 57.20,
    sma200: 54.50,
    rsi: 60.5,
    macd: 0.85,
    macdSignal: 0.65,
    macdHist: 0.20,
    bollingerUpper: 61.50,
    bollingerLower: 54.80,
    bollingerMiddle: 58.15,
    atr: 1.65,
    volume: 850000,
    avgVolume: 1100000,
    fiftyTwoWeekHigh: 62.50,
    fiftyTwoWeekLow: 42.80,
    priceHistory: genHistory(58.50, 60, 0.013, 0.008),
    volumeHistory: genVolume(850000, 60),
    fundamentalScore: 82,
    technicalScore: 68,
    overallScore: 76,
  },
];

const OMIT_KEYS = ['targetPrice', 'fairValue', 'recommendation', 'upsidePotential', 'valuationGap', 'change1D', 'change1W', 'change1Y', 'change3Y', 'change5Y', 'bollingerBreakout'] as const;
function computeStaticAnalystFields(s: Omit<Stock, typeof OMIT_KEYS[number]>): Stock {
  // Fair value estimate from fundamentals
  let fairValue = s.price;
  if (s.peRatio > 0) fairValue += (15 - s.peRatio) * s.price * 0.01;
  if (s.pbRatio > 0) fairValue += (1.5 - s.pbRatio) * s.price * 0.008;
  if (s.dividendYield >= 4) fairValue += s.price * 0.03;
  else if (s.dividendYield >= 2) fairValue += s.price * 0.01;
  if (s.revenueGrowth >= 10) fairValue += s.price * 0.05;
  else if (s.revenueGrowth >= 5) fairValue += s.price * 0.02;
  else if (s.revenueGrowth < 0) fairValue -= s.price * 0.03;
  if (s.roe >= 15) fairValue += s.price * 0.04;
  else if (s.roe < 5) fairValue -= s.price * 0.02;
  if (s.debtToEquity > 2) fairValue -= s.price * 0.05;
  else if (s.debtToEquity < 0.5) fairValue += s.price * 0.02;
  if (s.fcFYield >= 5) fairValue += s.price * 0.03;
  fairValue = Math.max(s.price * 0.5, fairValue);

  // Target price: blend of fair value + technical momentum
  const techTarget = s.price + 4 * s.atr;
  const targetPrice = s.fundamentalScore > s.technicalScore
    ? fairValue * 0.6 + techTarget * 0.4
    : fairValue * 0.4 + techTarget * 0.6;
  const finalTarget = Math.max(s.price, targetPrice);

  const upsidePotential = s.price > 0 ? ((finalTarget - s.price) / s.price) * 100 : 0;
  const valuationGap = s.price > 0 ? ((fairValue - s.price) / s.price) * 100 : 0;

  let recommendation: Stock['recommendation'];
  if (s.fundamentalScore >= 75 && s.technicalScore >= 65 && valuationGap > 5) recommendation = 'Strong Buy';
  else if (s.fundamentalScore >= 65 && s.technicalScore >= 50 && valuationGap > 0) recommendation = 'Buy';
  else if (s.fundamentalScore >= 55 && s.technicalScore >= 40) recommendation = 'Hold';
  else if (s.fundamentalScore >= 45 || s.technicalScore >= 40) recommendation = 'Wait';
  else recommendation = 'Avoid';

  // Multi-period price changes from priceHistory
  const ph = s.priceHistory;
  const change1D = ph.length >= 2 ? ((s.price - ph[ph.length - 2]) / ph[ph.length - 2]) * 100 : 0;
  const change1W = ph.length >= 6 ? ((s.price - ph[ph.length - 6]) / ph[ph.length - 6]) * 100 : 0;
  const change1Y = ph.length >= 2 ? ((s.price - ph[0]) / ph[0]) * 100 : 0;
  const change3Y = (Math.pow(1 + change1Y / 100, 3) - 1) * 100;
  const change5Y = (Math.pow(1 + change1Y / 100, 5) - 1) * 100;

  // Bollinger band breakout: only flag a fresh breakout — previous close
  // was inside the bands and today's close is outside.
  const prevClose = ph.length >= 2 ? ph[ph.length - 2] : ph[0];
  const wasInside = prevClose < s.bollingerUpper && prevClose > s.bollingerLower;
  const bollingerBreakout: Stock['bollingerBreakout'] =
    s.price >= s.bollingerUpper && wasInside ? 'upper'
    : s.price <= s.bollingerLower && wasInside ? 'lower'
    : null;

  return {
    ...s,
    targetPrice: Math.round(finalTarget * 100) / 100,
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
}

export const stocks: Stock[] = _stocksRaw.map(computeStaticAnalystFields);

function genHistory(currentPrice: number, days: number, volatility: number, drift: number): number[] {
  const history: number[] = [];
  let price = currentPrice;
  // Generate backwards from current price
  const seed = currentPrice * 100;
  for (let i = 0; i < days; i++) {
    const random = pseudoRandom(seed + i * 17.31);
    const change = (random - 0.5) * 2 * volatility + drift;
    price = price / (1 + change);
    history.unshift(price);
  }
  history[history.length - 1] = currentPrice;
  return history;
}

function genVolume(avgVol: number, days: number): number[] {
  const volumes: number[] = [];
  for (let i = 0; i < days; i++) {
    const random = pseudoRandom(avgVol + i * 23.71);
    const variation = 0.6 + random * 0.8;
    volumes.push(Math.round(avgVol * variation));
  }
  return volumes;
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getStockByTicker(ticker: string): Stock | undefined {
  return stocks.find((s) => s.ticker === ticker);
}

export function getStockSignals(stock: Stock): TechnicalSignal[] {
  const signals: TechnicalSignal[] = [];

  // SMA crossover
  if (stock.sma50 > stock.sma200) {
    signals.push({
      name: 'Golden Cross (SMA 50 > SMA 200)',
      type: 'bullish',
      description: 'The 50-day moving average is above the 200-day, indicating a medium-term uptrend.',
      strength: 'strong',
    });
  } else {
    signals.push({
      name: 'Death Cross (SMA 50 < SMA 200)',
      type: 'bearish',
      description: 'The 50-day moving average is below the 200-day, indicating a medium-term downtrend.',
      strength: 'strong',
    });
  }

  // Price vs SMA50
  if (stock.price > stock.sma50) {
    signals.push({
      name: 'Price above 50-day SMA',
      type: 'bullish',
      description: 'Price is trading above its 50-day moving average, a short-term bullish signal.',
      strength: 'moderate',
    });
  } else {
    signals.push({
      name: 'Price below 50-day SMA',
      type: 'bearish',
      description: 'Price is trading below its 50-day moving average, indicating short-term weakness.',
      strength: 'moderate',
    });
  }

  // RSI
  if (stock.rsi < 30) {
    signals.push({
      name: 'RSI Oversold (< 30)',
      type: 'bullish',
      description: `RSI at ${stock.rsi.toFixed(1)} indicates the stock is oversold and may bounce back.`,
      strength: 'strong',
    });
  } else if (stock.rsi > 70) {
    signals.push({
      name: 'RSI Overbought (> 70)',
      type: 'bearish',
      description: `RSI at ${stock.rsi.toFixed(1)} indicates the stock is overbought and may pull back.`,
      strength: 'strong',
    });
  } else if (stock.rsi >= 50 && stock.rsi <= 65) {
    signals.push({
      name: 'RSI in healthy zone',
      type: 'bullish',
      description: `RSI at ${stock.rsi.toFixed(1)} shows healthy momentum without overbought conditions.`,
      strength: 'moderate',
    });
  } else {
    signals.push({
      name: 'RSI Neutral',
      type: 'neutral',
      description: `RSI at ${stock.rsi.toFixed(1)} is in neutral territory.`,
      strength: 'weak',
    });
  }

  // MACD
  if (stock.macd > stock.macdSignal && stock.macdHist > 0) {
    signals.push({
      name: 'MACD Bullish Crossover',
      type: 'bullish',
      description: 'MACD line is above the signal line with positive histogram, indicating bullish momentum.',
      strength: 'moderate',
    });
  } else if (stock.macd < stock.macdSignal && stock.macdHist < 0) {
    signals.push({
      name: 'MACD Bearish Crossover',
      type: 'bearish',
      description: 'MACD line is below the signal line with negative histogram, indicating bearish momentum.',
      strength: 'moderate',
    });
  }

  // Bollinger Bands
  if (stock.price <= stock.bollingerLower * 1.02) {
    signals.push({
      name: 'Near Bollinger Lower Band',
      type: 'bullish',
      description: 'Price is near the lower Bollinger Band, suggesting a potential bounce entry point.',
      strength: 'moderate',
    });
  } else if (stock.price >= stock.bollingerUpper * 0.98) {
    signals.push({
      name: 'Near Bollinger Upper Band',
      type: 'bearish',
      description: 'Price is near the upper Bollinger Band, suggesting potential overextension.',
      strength: 'moderate',
    });
  }

  // Volume
  const volRatio = stock.volume / stock.avgVolume;
  if (volRatio > 1.2 && stock.price > stock.sma50) {
    signals.push({
      name: 'Above-average volume on uptrend',
      type: 'bullish',
      description: `Volume is ${(volRatio * 100).toFixed(0)}% of average with price rising, confirming the move.`,
      strength: 'moderate',
    });
  } else if (volRatio < 0.7) {
    signals.push({
      name: 'Low volume',
      type: 'neutral',
      description: 'Trading volume is below average, suggesting limited conviction in current price action.',
      strength: 'weak',
    });
  }

  // 52-week position
  const weekRange = stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow;
  const weekPosition = (stock.price - stock.fiftyTwoWeekLow) / weekRange;
  if (weekPosition < 0.25) {
    signals.push({
      name: 'Near 52-week low',
      type: 'bullish',
      description: 'Trading near its 52-week low, which may present a value opportunity if fundamentals support it.',
      strength: 'weak',
    });
  } else if (weekPosition > 0.9) {
    signals.push({
      name: 'Near 52-week high',
      type: 'bearish',
      description: 'Trading near its 52-week high, which may limit upside in the near term.',
      strength: 'weak',
    });
  }

  return signals;
}

export function getEntryRecommendation(stock: Stock): {
  action: 'Strong Buy' | 'Buy' | 'Hold' | 'Wait' | 'Avoid';
  rationale: string;
  suggestedEntry: number;
  stopLoss: number;
  targetPrice: number;
} {
  const signals = getStockSignals(stock);
  const bullishCount = signals.filter((s) => s.type === 'bullish').length;
  const bearishCount = signals.filter((s) => s.type === 'bearish').length;

  let action: 'Strong Buy' | 'Buy' | 'Hold' | 'Wait' | 'Avoid';

  if (stock.fundamentalScore >= 70 && stock.technicalScore >= 65 && bullishCount >= 4) {
    action = 'Strong Buy';
  } else if (stock.fundamentalScore >= 65 && stock.technicalScore >= 55 && bullishCount >= 3) {
    action = 'Buy';
  } else if (stock.fundamentalScore >= 55 && stock.technicalScore >= 45) {
    action = 'Hold';
  } else if (stock.fundamentalScore >= 45 || stock.technicalScore >= 40) {
    action = 'Wait';
  } else {
    action = 'Avoid';
  }

  const suggestedEntry = stock.price <= stock.bollingerLower * 1.02
    ? stock.price
    : stock.price <= stock.sma50
    ? stock.price
    : Math.min(stock.sma50, stock.bollingerMiddle);

  const stopLoss = suggestedEntry - 2 * stock.atr;
  const targetPrice = suggestedEntry + 4 * stock.atr;

  const rationale = `${bullishCount} bullish vs ${bearishCount} bearish signals. Fundamentals score ${stock.fundamentalScore}/100, technicals ${stock.technicalScore}/100. ${
    action === 'Strong Buy'
      ? 'Excellent combination of strong fundamentals and favorable technical entry.'
      : action === 'Buy'
      ? 'Good fundamentals with a reasonable technical setup for entry.'
      : action === 'Hold'
      ? 'Decent fundamentals but technical timing is not ideal.'
      : action === 'Wait'
      ? 'Wait for better technical alignment or fundamental improvement before entering.'
      : 'Fundamentals and technicals both weak — avoid for now.'
  }`;

  return { action, rationale, suggestedEntry, stopLoss, targetPrice };
}
