-- Add stripe_session_id column to cheotnun_orders for tracking Stripe payments
ALTER TABLE cheotnun_orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Enable Realtime for cheotnun_orders (for live status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE cheotnun_orders;
