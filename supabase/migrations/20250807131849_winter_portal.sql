/*
  # Allow NULL values for quick reactions

  1. Schema Changes
    - Remove NOT NULL constraints from overall, presentation, content columns
    - Update CHECK constraints to allow NULL values
    - This enables quick reactions to use NULL instead of 0

  2. Security
    - Maintain existing RLS policies
    - No changes to authentication requirements
*/

-- Remove NOT NULL constraints and update CHECK constraints to allow NULL values
ALTER TABLE public.ratings 
  ALTER COLUMN overall DROP NOT NULL,
  ALTER COLUMN presentation DROP NOT NULL,
  ALTER COLUMN content DROP NOT NULL;

-- Drop existing check constraints
ALTER TABLE public.ratings 
  DROP CONSTRAINT IF EXISTS ratings_overall_check,
  DROP CONSTRAINT IF EXISTS ratings_presentation_check,
  DROP CONSTRAINT IF EXISTS ratings_content_check;

-- Add new check constraints that allow NULL or values between 1-5
ALTER TABLE public.ratings 
  ADD CONSTRAINT ratings_overall_check CHECK (overall IS NULL OR (overall >= 1 AND overall <= 5)),
  ADD CONSTRAINT ratings_presentation_check CHECK (presentation IS NULL OR (presentation >= 1 AND presentation <= 5)),
  ADD CONSTRAINT ratings_content_check CHECK (content IS NULL OR (content >= 1 AND content <= 5));