-- ============================================================================
-- Fix: Drop the handle_new_user trigger that's crashing on signup
-- The application code now handles users/profile creation manually.
-- ============================================================================

-- Drop the trigger (this is what's causing "Database error saving new user")
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Keep the function for reference but it won't fire automatically anymore
-- DROP FUNCTION IF EXISTS handle_new_user();
