-- Migration: Fix user deletion to properly handle auth records
-- This creates a SECURITY DEFINER function that can delete users from auth.users

CREATE OR REPLACE FUNCTION delete_user_completely(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  -- Prevent deletion of root admin
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND email = current_setting('app.settings.root_admin_email', true)
  ) THEN
    RAISE EXCEPTION 'Cannot delete root admin user';
  END IF;

  -- Delete from auth.users (this will cascade to profiles due to FK)
  -- Note: This requires the function to be run with elevated privileges
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- Revoke direct execution from anon/authenticated roles
REVOKE ALL ON FUNCTION delete_user_completely(UUID) FROM anon, authenticated;

-- Grant execute to authenticated users (function has SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO authenticated;

COMMENT ON FUNCTION delete_user_completely(UUID) IS 'Admin-only function to delete user from both auth and public schemas';
