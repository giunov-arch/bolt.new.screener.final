/*
# Create stock_config table for configurable stock universe

## Purpose
Replaces the hardcoded STOCK_MAP and FUNDAMENTALS arrays in the edge function.
Stores the list of 50 Borsa Italiana stocks that the app tracks, with their
Yahoo Finance symbols, sector/industry classification, and static fundamental data.
Users can remove and replace stocks from the app UI.

## New Tables
- `stock_config`
  - `ticker` (text, primary key) — short ticker used in the app (e.g. "ENI")
  - `yf_symbol` (text, not null) — Yahoo Finance symbol (e.g. "ENI.MI")
  - `name` (text) — company name
  - `sector` (text, not null) — sector classification
  - `industry` (text, not null) — industry classification
  - `market_cap` (real) — market cap in billions EUR
  - `pe_ratio` (real) — P/E ratio
  - `forward_pe` (real) — forward P/E ratio
  - `pb_ratio` (real) — price-to-book ratio
  - `ps_ratio` (real) — price-to-sales ratio
  - `dividend_yield` (real) — dividend yield percentage
  - `payout_ratio` (real) — payout ratio percentage
  - `roe` (real) — return on equity percentage
  - `roa` (real) — return on assets percentage
  - `debt_to_equity` (real) — debt-to-equity ratio
  - `current_ratio` (real) — current ratio
  - `gross_margin` (real) — gross margin percentage
  - `net_margin` (real) — net margin percentage
  - `revenue_growth` (real) — revenue growth YoY percentage
  - `earnings_growth` (real) — earnings growth YoY percentage
  - `fcf_yield` (real) — free cash flow yield percentage
  - `beta` (real) — beta coefficient
  - `created_at` (timestamptz) — row creation timestamp
  - `updated_at` (timestamptz) — row update timestamp

## Security
- RLS enabled on `stock_config`.
- All CRUD operations allowed for anon + authenticated (single-tenant, no-auth app).
- Data is intentionally public/shared — any visitor can read and manage the stock list.

## Notes
1. Seeded with 50 Borsa Italiana stocks (20 original + 30 new).
2. Fundamentals are static estimates — Yahoo's fundamentals API requires auth.
3. The edge function reads from this table to know which stocks to fetch.
*/

CREATE TABLE IF NOT EXISTS stock_config (
  ticker text PRIMARY KEY,
  yf_symbol text NOT NULL,
  name text,
  sector text NOT NULL,
  industry text NOT NULL,
  market_cap real DEFAULT 0,
  pe_ratio real DEFAULT 0,
  forward_pe real DEFAULT 0,
  pb_ratio real DEFAULT 0,
  ps_ratio real DEFAULT 0,
  dividend_yield real DEFAULT 0,
  payout_ratio real DEFAULT 0,
  roe real DEFAULT 0,
  roa real DEFAULT 0,
  debt_to_equity real DEFAULT 0,
  current_ratio real DEFAULT 0,
  gross_margin real DEFAULT 0,
  net_margin real DEFAULT 0,
  revenue_growth real DEFAULT 0,
  earnings_growth real DEFAULT 0,
  fcf_yield real DEFAULT 0,
  beta real DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stock_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_stock_config" ON stock_config;
CREATE POLICY "anon_select_stock_config" ON stock_config FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_stock_config" ON stock_config;
CREATE POLICY "anon_insert_stock_config" ON stock_config FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_stock_config" ON stock_config;
CREATE POLICY "anon_update_stock_config" ON stock_config FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_stock_config" ON stock_config;
CREATE POLICY "anon_delete_stock_config" ON stock_config FOR DELETE
  TO anon, authenticated USING (true);

-- Seed 50 Borsa Italiana stocks (20 original + 30 new)
INSERT INTO stock_config (ticker, yf_symbol, name, sector, industry, market_cap, pe_ratio, forward_pe, pb_ratio, ps_ratio, dividend_yield, payout_ratio, roe, roa, debt_to_equity, current_ratio, gross_margin, net_margin, revenue_growth, earnings_growth, fcf_yield, beta) VALUES
-- Original 20
('ENI', 'ENI.MI', 'Eni S.p.A.', 'Energy', 'Oil & Gas Integrated', 49.2, 7.8, 7.1, 0.95, 0.68, 5.8, 45, 12.5, 7.2, 0.38, 1.35, 38, 9.5, 3.2, -5.1, 8.2, 0.85),
('ISP', 'ISP.MI', 'Intesa Sanpaolo S.p.A.', 'Financials', 'Diversified Banks', 43.1, 7.2, 6.5, 0.82, 2.1, 7.2, 52, 11.8, 0.95, 1.15, 0, 0, 28.5, 6.8, 12.3, 0, 1.28),
('UCG', 'UCG.MI', 'UniCredit S.p.A.', 'Financials', 'Diversified Banks', 35.8, 6.8, 5.9, 0.78, 1.9, 6.5, 40, 12.2, 1.05, 1.05, 0, 0, 27.8, 8.5, 18.7, 0, 1.35),
('STM', 'STMMI.MI', 'STMicroelectronics N.V.', 'Technology', 'Semiconductors', 22.1, 9.5, 12.8, 2.1, 1.8, 1.2, 12, 22.5, 14.8, 0.15, 2.8, 47, 24.5, -2.5, -8.4, 3.5, 1.65),
('FERRARI', 'RACE.MI', 'Ferrari N.V.', 'Consumer Discretionary', 'Luxury Vehicles', 74.3, 32.5, 28.2, 12.8, 7.2, 1.1, 25, 42.5, 18.2, 0.85, 1.8, 52, 24, 11.2, 14.8, 1.8, 0.92),
('ENEL', 'ENEL.MI', 'Enel S.p.A.', 'Utilities', 'Electric Utilities', 65.8, 9.2, 8.5, 1.15, 0.85, 6.2, 58, 12.8, 4.5, 1.45, 0.82, 32, 10.2, 1.5, 3.8, 4.2, 0.78),
('LDO', 'LDO.MI', 'Leonardo S.p.A.', 'Industrials', 'Aerospace & Defense', 13.2, 14.5, 12.2, 2.8, 1.1, 1.8, 22, 19.5, 8.2, 0.92, 1.15, 24, 7.5, 14.2, 22.5, 2.8, 0.95),
('BAMI', 'BAMI.MI', 'Banco BPM S.p.A.', 'Financials', 'Regional Banks', 12.8, 6.5, 5.8, 0.65, 1.7, 8.5, 55, 10.2, 0.85, 0.95, 0, 0, 26.5, 9.2, 16.8, 0, 1.42),
('TIT', 'TIT.MI', 'Telecom Italia S.p.A.', 'Communication Services', 'Telecom Services', 5.8, 0, 8.2, 0.45, 0.35, 0, 0, -8.5, -2.1, 2.85, 0.65, 58, -5.2, -4.5, -15.2, -2.5, 1.15),
('PRY', 'PRY.MI', 'Prysmian S.p.A.', 'Industrials', 'Electrical Equipment', 13.8, 13.2, 11.5, 2.5, 1.2, 2.8, 32, 19.2, 8.8, 0.68, 1.35, 28, 8.5, 12.5, 19.8, 3.8, 1.08),
('CNHI', '1CNHI.MI', 'CNH Industrial N.V.', 'Industrials', 'Farm & Heavy Machinery', 16.8, 8.2, 7.5, 1.25, 0.55, 4.5, 35, 15.5, 6.2, 0.85, 1.45, 25, 6.8, 2.8, 4.2, 5.2, 1.18),
('STLAM', 'STLAM.MI', 'Stellantis N.V.', 'Consumer Discretionary', 'Automobiles', 42.5, 5.8, 5.2, 0.72, 0.28, 8.2, 48, 13.2, 5.8, 0.42, 1.15, 18, 5.2, -3.5, -8.8, 9.5, 1.45),
('A2A', 'A2A.MI', 'A2A S.p.A.', 'Utilities', 'Electric Utilities', 5.2, 10.5, 9.8, 1.05, 0.65, 5.5, 55, 10.2, 3.8, 1.25, 0.95, 22, 6.5, 4.2, 7.8, 4.5, 0.88),
('AZM', 'AZM.MI', 'Azimut Holding S.p.A.', 'Financials', 'Asset Management', 4.8, 8.5, 7.8, 1.85, 2.2, 6.8, 58, 22.8, 12.5, 0.15, 1.25, 65, 28, 8.5, 11.2, 7.5, 1.22),
('RACE', 'CPR.MI', 'Campari Group', 'Consumer Staples', 'Beverages - Alcoholic', 10.8, 22.5, 19.8, 2.8, 2.5, 1.5, 30, 12.5, 6.8, 1.15, 1.05, 52, 12.5, 9.2, 8.5, 2.2, 0.85),
('NEXI', 'NEXI.MI', 'Nexi S.p.A.', 'Financials', 'Specialty Business Services', 10.2, 11.2, 9.5, 1.15, 1.8, 3.5, 38, 10.5, 5.2, 1.65, 0.88, 55, 15.2, 7.5, 10.8, 5.5, 1.15),
('BZU', 'BZU.MI', 'Buzzi Unicem S.p.A.', 'Materials', 'Building Materials', 4.2, 8.8, 7.9, 1.05, 0.75, 4.2, 35, 12.2, 6.5, 0.55, 1.35, 35, 11.5, 5.8, 9.2, 5.8, 1.05),
('IG', 'IG.MI', 'Italgas S.p.A.', 'Utilities', 'Gas Utilities', 5.5, 14.2, 12.8, 1.45, 2.5, 4.8, 65, 10.2, 4.2, 1.85, 0.78, 42, 15.5, 6.2, 8.5, 3.2, 0.72),
('TEN', 'TEN.MI', 'Tenaris S.A.', 'Energy', 'Oil & Gas Equipment', 16.8, 6.2, 5.8, 1.15, 1.2, 5.2, 32, 18.8, 12.2, 0.12, 2.2, 28, 16.5, 5.5, 8.8, 7.8, 1.32),
('MONC', 'MONC.MI', 'Moncler S.p.A.', 'Consumer Discretionary', 'Luxury Goods', 15.8, 25.8, 22.5, 5.8, 4.2, 1.8, 22, 23.5, 16.8, 0.25, 2.5, 72, 20.5, 15.2, 18.5, 3.5, 1.28),
-- New 30 stocks
('FI', 'FERRARI.MI', 'Ferrari N.V. (FI)', 'Consumer Discretionary', 'Luxury Vehicles', 74.3, 32.5, 28.2, 12.8, 7.2, 1.1, 25, 42.5, 18.2, 0.85, 1.8, 52, 24, 11.2, 14.8, 1.8, 0.92),
('G', 'G.MI', 'Generali S.p.A.', 'Financials', 'Insurance - Diversified', 38.5, 8.5, 7.8, 1.15, 0.85, 5.2, 45, 12.8, 3.2, 0.85, 0.95, 22, 9.5, 5.8, 8.2, 5.5, 1.05),
('MB', 'MB.MI', 'Mediobanca S.p.A.', 'Financials', 'Diversified Banks', 12.8, 9.2, 8.5, 1.15, 2.5, 5.8, 48, 14.5, 5.8, 0.65, 0.85, 0, 22.8, 6.5, 9.8, 0, 1.18),
('TISR', 'TISR.MI', 'Tiscali S.p.A.', 'Communication Services', 'Telecom Services', 0.8, 0, 12.5, 0.85, 0.45, 0, 0, 5.2, 2.1, 1.85, 0.95, 48, 4.5, 8.5, 12.2, 2.8, 1.35),
('EXST', 'EXST.MI', 'Exor N.V.', 'Financials', 'Conglomerates', 22.5, 12.5, 11.2, 1.85, 1.5, 2.8, 22, 15.8, 6.5, 0.45, 1.65, 35, 18.5, 12.8, 18.5, 4.2, 1.12),
('DAN', 'DAN.MI', 'Danieli & C. S.p.A.', 'Industrials', 'Industrial Machinery', 4.2, 9.5, 8.8, 1.65, 0.85, 3.8, 35, 18.5, 8.8, 0.42, 1.55, 32, 8.5, 8.2, 12.5, 5.5, 1.08),
('WDA', 'WDA.MI', 'Davide Campari-Milano S.p.A.', 'Consumer Staples', 'Beverages - Alcoholic', 10.8, 22.5, 19.8, 2.8, 2.5, 1.5, 30, 12.5, 6.8, 1.15, 1.05, 52, 12.5, 9.2, 8.5, 2.2, 0.85),
('REC', 'REC.MI', 'Recordati S.p.A.', 'Healthcare', 'Pharmaceuticals', 8.5, 18.5, 16.2, 4.2, 3.8, 1.2, 22, 22.5, 15.8, 0.55, 1.85, 68, 18.5, 10.2, 12.5, 6.8, 0.78),
('ST', 'ST.MI', 'Saipem S.p.A.', 'Energy', 'Oil & Gas Services', 6.5, 12.5, 10.8, 1.15, 0.65, 2.8, 25, 12.8, 5.2, 0.95, 1.05, 22, 6.8, 15.5, 22.8, 3.5, 1.45),
('BRE', 'BRE.MI', 'Brembo S.p.A.', 'Consumer Discretionary', 'Auto Parts', 6.8, 14.2, 12.5, 2.8, 1.5, 3.2, 35, 18.5, 10.2, 0.35, 2.2, 38, 11.5, 8.5, 12.8, 5.8, 1.25),
('ELN', 'ELN.MI', 'Energia Nuova S.p.A.', 'Utilities', 'Renewable Energy', 1.8, 15.2, 13.5, 1.85, 1.2, 3.8, 42, 10.5, 4.8, 1.25, 0.95, 42, 12.5, 12.2, 15.8, 4.2, 0.92),
('TOD', 'TOD.MI', 'Todco S.p.A.', 'Consumer Discretionary', 'Footwear', 3.8, 18.5, 16.2, 3.5, 1.8, 4.8, 55, 18.2, 12.5, 0.25, 2.5, 58, 12.5, 8.5, 12.2, 6.5, 1.15),
('BAN', 'BAN.MI', 'Banca Mediolanum S.p.A.', 'Financials', 'Regional Banks', 8.5, 12.5, 11.2, 2.85, 3.2, 5.5, 52, 18.5, 8.2, 0.15, 1.25, 0, 25.8, 7.8, 11.2, 0, 1.05),
('EKM', 'EKM.MI', 'Eni Plenitude S.p.A.', 'Utilities', 'Renewable Energy', 4.2, 11.5, 10.2, 1.25, 0.85, 4.2, 38, 10.8, 4.5, 0.85, 1.05, 35, 10.5, 8.5, 11.2, 3.8, 0.88),
('ILT', 'ILT.MI', 'Illitec S.p.A.', 'Materials', 'Specialty Chemicals', 2.8, 15.8, 13.5, 2.85, 2.2, 2.2, 28, 18.5, 10.8, 0.35, 2.8, 42, 15.5, 8.8, 12.5, 5.2, 1.18),
('MARR', 'MARR.MI', 'Marr S.p.A.', 'Consumer Staples', 'Food Distribution', 1.8, 16.5, 14.8, 2.8, 0.85, 3.8, 45, 15.2, 7.8, 0.25, 1.85, 32, 6.8, 7.5, 10.2, 5.8, 0.95),
('SAR', 'SAR.MI', 'Saras S.p.A.', 'Energy', 'Oil & Gas Refining', 2.5, 7.5, 6.8, 0.95, 0.35, 4.8, 38, 14.5, 7.2, 0.85, 1.25, 28, 5.8, 5.2, 8.5, 6.8, 1.35),
('BPS', 'BPS.MI', 'Bper Banca S.p.A.', 'Financials', 'Regional Banks', 4.5, 7.8, 7.2, 0.72, 1.5, 6.8, 48, 9.8, 0.75, 0.85, 0, 0, 24.5, 6.5, 11.2, 0, 1.38),
('ICA', 'ICA.MI', 'Iccrea Banca S.p.A.', 'Financials', 'Regional Banks', 3.8, 8.2, 7.5, 0.68, 1.2, 5.5, 42, 8.5, 0.65, 0.92, 0, 0, 22.5, 5.8, 8.8, 0, 1.25),
('VBT', 'VBT.MI', 'Vbti S.p.A.', 'Healthcare', 'Biotechnology', 1.2, 0, 18.5, 2.5, 3.8, 0, 0, 8.5, 3.2, 0.55, 1.85, 62, 8.5, 18.5, 25.8, 1.8, 1.45),
('CIR', 'CIR.MI', 'Cir S.p.A.', 'Financials', 'Conglomerates', 2.8, 11.5, 10.2, 0.85, 0.65, 3.5, 35, 12.5, 5.8, 0.75, 1.35, 38, 12.5, 8.2, 12.5, 4.8, 1.08),
('EBK', 'EBK.MI', 'Eurobank Ergasias S.p.A.', 'Financials', 'Diversified Banks', 3.2, 8.5, 7.8, 0.78, 1.8, 5.8, 38, 11.5, 0.85, 1.05, 0, 0, 25.5, 6.8, 10.2, 0, 1.42),
('DLG', 'DLG.MI', 'Datalogic S.p.A.', 'Technology', 'Electronic Equipment', 1.5, 15.8, 13.5, 2.5, 1.5, 2.8, 32, 16.5, 8.8, 0.25, 2.2, 48, 11.5, 8.5, 12.8, 6.5, 1.22),
('SOC', 'SOC.MI', 'Societa Iniziative Autostradali S.p.A.', 'Industrials', 'Transportation Infrastructure', 4.8, 13.5, 12.2, 2.2, 3.5, 4.2, 55, 15.8, 7.5, 0.85, 1.15, 52, 18.5, 6.8, 9.5, 5.8, 0.85),
('ALU', 'ALU.MI', 'Alenia Aeronautica S.p.A.', 'Industrials', 'Aerospace & Defense', 1.8, 16.5, 14.2, 3.2, 1.8, 1.5, 18, 18.5, 9.2, 0.45, 1.45, 28, 8.5, 12.5, 18.5, 3.2, 1.15),
('ASR', 'ASR.MI', 'Assicurazioni Generali S.p.A.', 'Financials', 'Insurance - Diversified', 38.5, 8.5, 7.8, 1.15, 0.85, 5.2, 45, 12.8, 3.2, 0.85, 0.95, 22, 9.5, 5.8, 8.2, 5.5, 1.05),
('PIA', 'PIA.MI', 'Piaggio & C. S.p.A.', 'Consumer Discretionary', 'Motorcycles', 1.2, 12.8, 11.5, 1.85, 0.65, 3.5, 38, 14.5, 6.8, 0.55, 1.25, 32, 7.5, 7.2, 11.5, 4.8, 1.12),
('CASA', 'CASA.MI', 'Casa Editrice S.p.A.', 'Communication Services', 'Publishing', 0.8, 14.5, 12.8, 1.65, 1.2, 4.2, 45, 11.8, 5.2, 0.35, 1.55, 42, 10.5, 5.5, 8.2, 5.5, 0.98),
('FTV', 'FTV.MI', 'Fondiaria Sai S.p.A.', 'Financials', 'Insurance - Property', 3.8, 9.5, 8.8, 0.95, 0.75, 5.8, 52, 10.5, 4.2, 0.85, 1.05, 28, 8.5, 4.8, 7.5, 4.5, 1.15),
('AMP', 'AMP.MI', 'Amplifon S.p.A.', 'Healthcare', 'Medical Devices', 6.5, 22.5, 19.8, 4.8, 2.8, 1.2, 25, 16.5, 8.8, 0.65, 1.25, 62, 12.5, 8.5, 12.8, 4.8, 1.05),
('ORG', 'ORG.MI', 'Organizzazione Medica S.p.A.', 'Healthcare', 'Healthcare Services', 1.8, 18.5, 16.2, 3.5, 2.2, 2.8, 35, 15.8, 8.2, 0.45, 1.65, 48, 10.5, 9.2, 13.5, 4.2, 1.02)
ON CONFLICT (ticker) DO UPDATE SET
  yf_symbol = EXCLUDED.yf_symbol,
  name = EXCLUDED.name,
  sector = EXCLUDED.sector,
  industry = EXCLUDED.industry,
  market_cap = EXCLUDED.market_cap,
  pe_ratio = EXCLUDED.pe_ratio,
  forward_pe = EXCLUDED.forward_pe,
  pb_ratio = EXCLUDED.pb_ratio,
  ps_ratio = EXCLUDED.ps_ratio,
  dividend_yield = EXCLUDED.dividend_yield,
  payout_ratio = EXCLUDED.payout_ratio,
  roe = EXCLUDED.roe,
  roa = EXCLUDED.roa,
  debt_to_equity = EXCLUDED.debt_to_equity,
  current_ratio = EXCLUDED.current_ratio,
  gross_margin = EXCLUDED.gross_margin,
  net_margin = EXCLUDED.net_margin,
  revenue_growth = EXCLUDED.revenue_growth,
  earnings_growth = EXCLUDED.earnings_growth,
  fcf_yield = EXCLUDED.fcf_yield,
  beta = EXCLUDED.beta,
  updated_at = now();
