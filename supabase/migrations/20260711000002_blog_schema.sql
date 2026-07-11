-- Create blog_posts table
CREATE TABLE IF NOT EXISTS yedam_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  content TEXT,
  image TEXT,
  author TEXT DEFAULT 'Yedam Editor',
  seo_title TEXT,
  seo_description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON yedam_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON yedam_blog_posts(status);

-- Enable RLS
ALTER TABLE yedam_blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can read published posts"
  ON yedam_blog_posts
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage all posts"
  ON yedam_blog_posts
  USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- Update function
CREATE OR REPLACE FUNCTION update_blog_post_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_blog_post_timestamp
  BEFORE UPDATE ON yedam_blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_post_timestamp();
