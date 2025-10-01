/*
  # Create Storage Bucket for Resumes

  1. Storage Setup
    - Create 'resumes' storage bucket
    - Set bucket to public access
    - Configure file size limits and allowed types
  
  2. Storage Policies
    - Allow public SELECT (anyone can view/download files)
    - Allow public INSERT (anyone can upload files)
    - Allow public UPDATE (anyone can update files)
    - Allow public DELETE (anyone can delete files)

  Note: Public policies are used for simplicity in this conference app.
  In production, you'd want authenticated-only access.
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

-- Create storage policies for the resumes bucket
-- Allow anyone to read/view files (public access)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Access for Resumes'
  ) THEN
    CREATE POLICY "Public Access for Resumes"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resumes');
  END IF;
END $$;

-- Allow anyone to upload files
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Upload for Resumes'
  ) THEN
    CREATE POLICY "Public Upload for Resumes"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'resumes');
  END IF;
END $$;

-- Allow anyone to update files
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Update for Resumes'
  ) THEN
    CREATE POLICY "Public Update for Resumes"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'resumes')
    WITH CHECK (bucket_id = 'resumes');
  END IF;
END $$;

-- Allow anyone to delete files
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Delete for Resumes'
  ) THEN
    CREATE POLICY "Public Delete for Resumes"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'resumes');
  END IF;
END $$;