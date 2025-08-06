-- Add agreement column to ratings table
ALTER TABLE public.ratings ADD COLUMN agreement TEXT CHECK (agreement IN ('agree', 'disagree', NULL));

-- Update the current_target table to include agreement stats
-- We'll calculate these on the fly, so no schema changes needed for current_target