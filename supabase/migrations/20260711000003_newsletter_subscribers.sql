-- Newsletter / Email Leads Table
CREATE TABLE IF NOT EXISTS yedam_newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT DEFAULT '',
  source TEXT DEFAULT 'website' CHECK (source IN ('homepage', 'experiencias', 'website', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON yedam_newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON yedam_newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_source ON yedam_newsletter_subscribers(source);
CREATE INDEX IF NOT EXISTS idx_newsletter_created ON yedam_newsletter_subscribers(created_at);

-- Enable RLS
ALTER TABLE yedam_newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS policies: only admins can read/manage; anyone can insert
CREATE POLICY "Anyone can subscribe"
  ON yedam_newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage subscribers"
  ON yedam_newsletter_subscribers
  USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_newsletter_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_newsletter_timestamp
  BEFORE UPDATE ON yedam_newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_timestamp();
