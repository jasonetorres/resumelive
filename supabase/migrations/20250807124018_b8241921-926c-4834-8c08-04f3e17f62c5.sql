-- Add reactions column to ratings table
ALTER TABLE public.ratings 
ADD COLUMN reaction TEXT;