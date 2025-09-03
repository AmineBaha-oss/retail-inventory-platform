-- Migration to add webhook idempotency support
-- This prevents duplicate processing of webhook events from external systems

-- Add source and external_event_id columns to webhook_events table
ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS external_event_id TEXT;

-- Create unique index to prevent duplicate webhook processing
CREATE UNIQUE INDEX IF NOT EXISTS uq_webhook_source_external
  ON webhook_events(source, external_event_id);

-- Add comments for documentation
COMMENT ON COLUMN webhook_events.source IS 'Source system identifier (e.g., shopify, lightspeed)';
COMMENT ON COLUMN webhook_events.external_event_id IS 'External system event ID for idempotency';
