/*
  # Create Remaining Missing Tables

  1. New Tables
    - `ats_settings` - Control ATS analysis feature
      - `id` (integer, primary key, singleton)
      - `ats_enabled` (boolean)
      - `updated_at` (timestamptz)
    
    - `resume_analysis` - Store ATS analysis results
      - `id` (uuid, primary key)
      - `lead_id` (uuid, references leads)
      - `resume_id` (uuid)
      - `ats_score` (integer)
      - `formatting_score` (integer)
      - `keywords_found` (text array)
      - `skills_extracted` (text array)
      - `suggestions` (text array)
      - `analysis_data` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access

  3. Initial Data
    - Insert default ATS settings (disabled by default)
*/

-- Create ATS settings table
CREATE TABLE IF NOT EXISTS public.ats_settings (
  id integer PRIMARY KEY DEFAULT 1,
  ats_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (id = 1)
);

-- Insert default settings
INSERT INTO public.ats_settings (id, ats_enabled) 
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- Create resume_analysis table for detailed ATS analysis
CREATE TABLE IF NOT EXISTS public.resume_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  resume_id uuid,
  ats_score integer,
  formatting_score integer,
  keywords_found text[],
  skills_extracted text[],
  suggestions text[],
  analysis_data jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.ats_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view ats_settings"
  ON public.ats_settings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update ats_settings"
  ON public.ats_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view resume_analysis"
  ON public.resume_analysis FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert resume_analysis"
  ON public.resume_analysis FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update resume_analysis"
  ON public.resume_analysis FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete resume_analysis"
  ON public.resume_analysis FOR DELETE
  USING (true);

-- Create trigger for ats_settings updated_at
CREATE TRIGGER update_ats_settings_updated_at
  BEFORE UPDATE ON public.ats_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.ats_settings REPLICA IDENTITY FULL;
ALTER TABLE public.resume_analysis REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.ats_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resume_analysis;