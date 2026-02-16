/*
  # Fix Resumes Storage Bucket and Policies

  1. Updates
    - Update the resumes bucket with proper file size limit (10MB)
    - Set allowed MIME types for PDF and images

  2. Storage Policies
    - Create policies for public access to resumes bucket
    - Policies allow SELECT, INSERT, UPDATE, DELETE operations

  Note: These policies allow public access for simplicity in the conference app.
*/

-- Update the bucket configuration
UPDATE storage.buckets
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']::text[]
WHERE id = 'resumes';

-- Create policies using DO blocks to avoid errors if they already exist
DO $$ 
BEGIN
  -- Policy for viewing/downloading files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Access for Resumes'
  ) THEN
    EXECUTE 'CREATE POLICY "Public Access for Resumes" ON storage.objects FOR SELECT USING (bucket_id = ''resumes'')';
  END IF;

  -- Policy for uploading files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Upload for Resumes'
  ) THEN
    EXECUTE 'CREATE POLICY "Public Upload for Resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''resumes'')';
  END IF;

  -- Policy for updating files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Update for Resumes'
  ) THEN
    EXECUTE 'CREATE POLICY "Public Update for Resumes" ON storage.objects FOR UPDATE USING (bucket_id = ''resumes'') WITH CHECK (bucket_id = ''resumes'')';
  END IF;

  -- Policy for deleting files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Delete for Resumes'
  ) THEN
    EXECUTE 'CREATE POLICY "Public Delete for Resumes" ON storage.objects FOR DELETE USING (bucket_id = ''resumes'')';
  END IF;
END $$;
