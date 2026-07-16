CREATE TABLE IF NOT EXISTS cheotnun_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    next_billing DATE,
    stripe_subscription_id TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cheotnun_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscriptions" ON cheotnun_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role all access" ON cheotnun_subscriptions
    FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_cheotnun_subscriptions_user ON cheotnun_subscriptions(user_id);
