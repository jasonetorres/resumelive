-- Remove the profiles table since no auth is needed
DROP TABLE IF EXISTS public.profiles;

-- Drop the function and trigger since no auth is needed
DROP FUNCTION IF EXISTS public.create_profile_for_new_user();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;