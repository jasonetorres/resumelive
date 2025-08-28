-- Update questions table RLS policy to allow delete operations
DROP POLICY IF EXISTS "Everyone can delete questions" ON public.questions;

CREATE POLICY "Everyone can delete questions" 
ON public.questions 
FOR DELETE 
USING (true);