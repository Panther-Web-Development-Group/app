-- Use site_settings for timezone, maintenance, cookie consent (PantherWeb)
-- No new table: insert reserved keys into existing site_settings (key-value store).
-- Keys: timezone, maintenance_mode, maintenance_message, cookie_consent_message, cookie_consent_accept_text, cookie_consent_decline_text.
-- Idempotent: ON CONFLICT (key) DO NOTHING so existing values are not overwritten.

INSERT INTO public.site_settings (key, value, value_type, description, category, is_public)
VALUES
  ('timezone', '"UTC"'::jsonb, 'string', 'Site timezone (e.g. America/New_York)', 'general', TRUE),
  ('maintenance_mode', 'false'::jsonb, 'boolean', 'When true, show maintenance page', 'general', TRUE),
  ('maintenance_message', '""'::jsonb, 'string', 'Message shown when site is in maintenance mode', 'general', TRUE),
  ('cookie_consent_message', '""'::jsonb, 'string', 'Cookie consent banner message', 'general', TRUE),
  ('cookie_consent_accept_text', '"Accept"'::jsonb, 'string', 'Cookie consent accept button label', 'general', TRUE),
  ('cookie_consent_decline_text', '"Decline"'::jsonb, 'string', 'Cookie consent decline button label', 'general', TRUE)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.site_settings IS 'Global site configuration (key-value store). Reserved keys: timezone, maintenance_mode, maintenance_message, cookie_consent_message, cookie_consent_accept_text, cookie_consent_decline_text.';
