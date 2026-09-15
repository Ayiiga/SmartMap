-- Smart Map Phase 4–6 additive schema (backward compatible)
-- Does NOT modify existing Smart Map / auth tables.
-- Safe to apply on production; all new objects are additive.

-- Place claims & business portal
CREATE TABLE IF NOT EXISTS sm_business_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  place_key TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  claimed BOOLEAN NOT NULL DEFAULT FALSE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  premium BOOLEAN NOT NULL DEFAULT FALSE,
  sponsored BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS sm_business_listings_place_key_idx
  ON sm_business_listings (place_key);

-- Community reports (Phase 2/5 storage)
CREATE TABLE IF NOT EXISTS sm_community_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  city TEXT,
  country_code TEXT NOT NULL DEFAULT 'GH',
  status TEXT NOT NULL DEFAULT 'submitted',
  media_count INTEGER NOT NULL DEFAULT 0,
  ai_summary TEXT,
  moderation_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sm_community_reports_geo_idx
  ON sm_community_reports (country_code, created_at DESC);

-- Reviews
CREATE TABLE IF NOT EXISTS sm_place_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  place_key TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  helpful_votes INTEGER NOT NULL DEFAULT 0,
  reported BOOLEAN NOT NULL DEFAULT FALSE,
  moderation_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sm_place_reviews_place_idx
  ON sm_place_reviews (place_key, created_at DESC);

-- Trip plans
CREATE TABLE IF NOT EXISTS sm_trip_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stops JSONB NOT NULL DEFAULT '[]'::jsonb,
  mode TEXT NOT NULL DEFAULT 'driving',
  favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Country configuration (Phase 6)
CREATE TABLE IF NOT EXISTS sm_country_configs (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT,
  emergency JSONB NOT NULL DEFAULT '{}'::jsonb,
  languages JSONB NOT NULL DEFAULT '[]'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'planned',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit events (optional server-side sink)
CREATE TABLE IF NOT EXISTS sm_audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS placeholders (enable when wiring server actions)
ALTER TABLE sm_business_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_place_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_country_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_audit_events ENABLE ROW LEVEL SECURITY;
