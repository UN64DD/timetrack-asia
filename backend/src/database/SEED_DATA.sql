-- =========================================================
-- TIME TRACK: MASTER SEED DATA
-- Run this AFTER running ULTRA_MASTER_SCHEMA.sql
-- =========================================================

-- 1. Create Super Admin / Developer Account
-- Email: nithyananthanimalan@gmail.com
-- Pass: nithyananthanimalan@gmail.com
INSERT INTO users (role, first_name, last_name, email, password_hash, status)
VALUES (
    'SUPER_ADMIN', 
    'Nithya', 
    'Nimalan', 
    'nithyananthanimalan@gmail.com', 
    '$2b$10$y5kTcQY6d4KF8LHnQlulwOORxSFx42LBbfMwnI1GBZamo1C/kVzEy', 
    'ACTIVE'
)
ON CONFLICT (email) DO UPDATE SET role = 'SUPER_ADMIN', status = 'ACTIVE';

-- 2. Create Base Notification Templates (Example)
INSERT INTO notification_templates (type, subject, content_html)
VALUES (
    'registration_confirmation',
    'Registration Confirmed: {{event_name}}',
    '<h1>Hello {{participant_name}}!</h1><p>Your registration for <b>{{event_name}}</b> is confirmed. Your bib number is {{bib_number}}.</p>'
) ON CONFLICT (type) DO NOTHING;

-- 3. Enable Default Gateways
INSERT INTO payment_gateways (name, is_enabled, config)
VALUES 
    ('Stripe', TRUE, '{"mode": "test"}'),
    ('Billplz', TRUE, '{"mode": "test"}'),
    ('Manual Bank Transfer', TRUE, '{}')
ON CONFLICT (name) DO UPDATE SET is_enabled = TRUE;
