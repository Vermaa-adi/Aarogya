-- ============================================================================
-- Aarogya — Seed Data for Development
-- ============================================================================
-- NOTE: This seed file works AFTER users are created through Supabase Auth.
-- In development, create users via the Supabase dashboard or Auth API first,
-- then run this to populate profiles.
--
-- For local development, you can insert directly into `users` table
-- (the auth trigger won't fire for manual inserts to public.users).
-- ============================================================================

-- Sample admin user (create via Supabase dashboard with email: admin@aarogya.hp.gov.in)
-- After creating in Auth dashboard, set role manually:
-- UPDATE users SET role = 'ADMIN' WHERE email = 'admin@aarogya.hp.gov.in';

-- ============================================================================
-- The following inserts assume the auth users have been created first.
-- Replace UUIDs with actual IDs from your auth.users table.
-- ============================================================================

-- Example doctor profiles (for UI development — use with real auth user IDs)
-- INSERT INTO doctor_profiles (user_id, name, specialties, languages, qualification, experience_years, license_no, bio, fee_inr, availability, is_verified)
-- VALUES
--   ('REPLACE-WITH-AUTH-UUID-1', 'Dr. Reena Sharma', ARRAY['Cardiology'], ARRAY['Hindi','English'], 'MBBS, MD Cardiology — IGMC Shimla', 12, 'HP-MCI-2014-001', 'Senior cardiologist with 12 years of experience...', 500, '{"monday":[{"start":"09:00","end":"12:00"},{"start":"14:00","end":"17:00"}],"wednesday":[{"start":"09:00","end":"12:00"}],"friday":[{"start":"10:00","end":"14:00"}]}', true),
--   ('REPLACE-WITH-AUTH-UUID-2', 'Dr. Arun Pillai', ARRAY['General Medicine'], ARRAY['Hindi','English'], 'MBBS — Dr. RPGMC Tanda', 8, 'HP-MCI-2018-042', 'General physician specialising in rural healthcare...', 300, '{"tuesday":[{"start":"10:00","end":"13:00"}],"thursday":[{"start":"10:00","end":"13:00"}],"saturday":[{"start":"09:00","end":"12:00"}]}', true),
--   ('REPLACE-WITH-AUTH-UUID-3', 'Dr. Nisha Verma', ARRAY['Pediatrics'], ARRAY['Hindi','Bengali'], 'MBBS, DCH — IGMC Shimla', 10, 'HP-MCI-2016-017', 'Pediatrician with expertise in child nutrition...', 400, '{"monday":[{"start":"10:00","end":"14:00"}],"wednesday":[{"start":"10:00","end":"14:00"}],"friday":[{"start":"10:00","end":"14:00"}]}', false);
