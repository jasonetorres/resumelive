-- Add submitter_name column to resumes table
ALTER TABLE public.resumes 
ADD COLUMN submitter_name TEXT;

-- Add index for faster lookups by name
CREATE INDEX idx_resumes_submitter_name ON public.resumes(submitter_name);