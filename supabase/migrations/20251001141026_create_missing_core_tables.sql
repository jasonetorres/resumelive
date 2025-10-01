/*
  # Create Missing Core Tables

  1. New Tables
    - `leads` - Store lead/participant information from registration
      - `id` (uuid, primary key)
      - `email` (text, required)
      - `first_name` (text)
      - `last_name` (text)
      - `job_title` (text)
      - `skills` (text array)
      - `experience_level` (text)
      - `ats_score` (integer)
      - `keywords` (text array)
      - `approval_status` (text) - pending, approved, rejected
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `resumes` - Store uploaded resume metadata
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `file_path` (text, required)
      - `file_type` (text, required)
      - `file_size` (integer, required)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (anonymous participation)

  3. Storage
    - Create resumes storage bucket for file uploads
    - Add storage policies for public access

  4. Functions
    - Create update_updated_at_column function for automatic timestamp updates
*/

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text,
  last_name text,
  job_title text,
  skills text[],
  experience_level text,
  ats_score integer,
  keywords text[],
  approval_status text DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create policies for leads
CREATE POLICY "Anyone can view leads"
  ON public.leads FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update leads"
  ON public.leads FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete leads"
  ON public.leads FOR DELETE
  USING (true);

-- Create policies for resumes
CREATE POLICY "Anyone can view resumes"
  ON public.resumes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert resumes"
  ON public.resumes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update resumes"
  ON public.resumes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete resumes"
  ON public.resumes FOR DELETE
  USING (true);

-- Create trigger for leads updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.leads REPLICA IDENTITY FULL;
ALTER TABLE public.resumes REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resumes;

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for resumes bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow public uploads to resumes bucket'
  ) THEN
    CREATE POLICY "Allow public uploads to resumes bucket" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'resumes');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow public access to resumes'
  ) THEN
    CREATE POLICY "Allow public access to resumes" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'resumes');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow users to update their uploads in resumes'
  ) THEN
    CREATE POLICY "Allow users to update their uploads in resumes" 
    ON storage.objects 
    FOR UPDATE 
    USING (bucket_id = 'resumes')
    WITH CHECK (bucket_id = 'resumes');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow users to delete their uploads from resumes'
  ) THEN
    CREATE POLICY "Allow users to delete their uploads from resumes" 
    ON storage.objects 
    FOR DELETE 
    USING (bucket_id = 'resumes');
  END IF;
END $$;