/*
  # Add approval_status column to leads table

  1. Changes
    - Add `approval_status` column to `leads` table with default 'approved'
    - Add check constraint to ensure valid status values
    - Update existing records to have 'approved' status

  2. Security
    - Maintains existing RLS policies
*/

-- Add approval_status column to leads table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN approval_status text DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Update any existing records to have approved status
UPDATE public.leads SET approval_status = 'approved' WHERE approval_status IS NULL;