-- Add ATS settings table
CREATE TABLE public.ats_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  ats_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.ats_settings (id, ats_enabled) VALUES (1, false);

-- Add ATS-related columns to leads table
ALTER TABLE public.leads 
ADD COLUMN skills TEXT[],
ADD COLUMN experience_level TEXT,
ADD COLUMN ats_score INTEGER,
ADD COLUMN keywords TEXT[];

-- Create resume_analysis table for detailed ATS analysis
CREATE TABLE public.resume_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL,
  resume_id UUID,
  ats_score INTEGER,
  formatting_score INTEGER,
  keywords_found TEXT[],
  skills_extracted TEXT[],
  suggestions TEXT[],
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ats_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on ats_settings" 
ON public.ats_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on resume_analysis" 
ON public.resume_analysis 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for ats_settings updated_at
CREATE TRIGGER update_ats_settings_updated_at
BEFORE UPDATE ON public.ats_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();