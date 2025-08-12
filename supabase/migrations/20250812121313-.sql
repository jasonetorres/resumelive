-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true);

-- Create RLS policies for resume uploads
CREATE POLICY "Allow public uploads to resumes bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Allow public access to resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes');

CREATE POLICY "Allow users to update their uploads" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'resumes');

CREATE POLICY "Allow users to delete their uploads" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'resumes');