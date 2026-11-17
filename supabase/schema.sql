-- ==============================================================================
-- Mukt Education Loan Tracker - Supabase Database Schema
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. PEOPLE (Stakeholders: borrower, lenders, banks, family members)
CREATE TABLE IF NOT EXISTS public.people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BORROWINGS (Disbursements & loans taken)
CREATE TABLE IF NOT EXISTS public.borrowings (
  id TEXT PRIMARY KEY,
  from_id TEXT REFERENCES public.people(id) ON DELETE SET NULL,
  loan NUMERIC NOT NULL DEFAULT 0,
  local NUMERIC NOT NULL DEFAULT 0,
  rate NUMERIC,
  entered TEXT DEFAULT 'loan',
  date TEXT NOT NULL,
  reason TEXT,
  note TEXT,
  created BIGINT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PAYMENTS (Repayments made)
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  payer_id TEXT REFERENCES public.people(id) ON DELETE SET NULL,
  to_id TEXT REFERENCES public.people(id) ON DELETE SET NULL,
  loan NUMERIC NOT NULL DEFAULT 0,
  local NUMERIC NOT NULL DEFAULT 0,
  rate NUMERIC,
  entered TEXT DEFAULT 'loan',
  date TEXT NOT NULL,
  mode TEXT,
  note TEXT,
  created BIGINT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SETTINGS (App currencies, active rate, theme & onboarding state)
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  loan_cur TEXT DEFAULT 'INR',
  local_cur TEXT DEFAULT 'CAD',
  display TEXT DEFAULT 'loan',
  rate NUMERIC,
  rate_date TEXT,
  rate_last_fetched TEXT,
  theme TEXT DEFAULT 'auto',
  theme_accent TEXT DEFAULT 'emerald',
  onboarded BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. MUKT STATE (Full JSON document backup/sync snapshot)
CREATE TABLE IF NOT EXISTS public.mukt_state (
  id TEXT PRIMARY KEY DEFAULT 'current',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_borrowings_date ON public.borrowings(date DESC);
CREATE INDEX IF NOT EXISTS idx_borrowings_from_id ON public.borrowings(from_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON public.payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_to_id ON public.payments(to_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mukt_state ENABLE ROW LEVEL SECURITY;

-- Create Open Public Access Policies (secured by Supabase Publishable/Anon Key)
DROP POLICY IF EXISTS "Allow all access on people" ON public.people;
CREATE POLICY "Allow all access on people" ON public.people FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access on borrowings" ON public.borrowings;
CREATE POLICY "Allow all access on borrowings" ON public.borrowings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access on payments" ON public.payments;
CREATE POLICY "Allow all access on payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access on settings" ON public.settings;
CREATE POLICY "Allow all access on settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access on mukt_state" ON public.mukt_state;
CREATE POLICY "Allow all access on mukt_state" ON public.mukt_state FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime publication for live multi-device syncing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.people;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.borrowings;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
