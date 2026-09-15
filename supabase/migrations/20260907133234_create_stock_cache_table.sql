/*
# Create stock_data cache table

1. New Tables
- `stock_data` — caches live stock data fetched from Twelve Data API
  - `ticker` (text, primary key) — stock ticker symbol (e.g. ENI, ISP, UCG)
  - `data` (jsonb) — full stock data payload including price, fundamentals, technicals
  - `fetched_at` (timestamptz) — when the data was last fetched from the API
  - `created_at` (timestamptz) — row creation time

2. Security
- Enable RLS on `stock_data`.
- Allow anon + authenticated to read (public market data, no sensitive info).
- Allow anon + authenticated to insert/update (edge function writes cache).
- No delete policy needed.

3. Important Notes
- This is single-tenant: no user_id, no auth required.
- The edge function fetches from Twelve Data and upserts into this table.
- The frontend reads from this table directly via Supabase client.
- Cache freshness is checked by comparing fetched_at to current time.
*/

CREATE TABLE IF NOT EXISTS stock_data (
  ticker text PRIMARY KEY,
  data jsonb NOT NULL,
  fetched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_stock_data" ON stock_data;
CREATE POLICY "anon_read_stock_data" ON stock_data FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_stock_data" ON stock_data;
CREATE POLICY "anon_insert_stock_data" ON stock_data FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_stock_data" ON stock_data;
CREATE POLICY "anon_update_stock_data" ON stock_data FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_stock_data_fetched_at ON stock_data(fetched_at);
