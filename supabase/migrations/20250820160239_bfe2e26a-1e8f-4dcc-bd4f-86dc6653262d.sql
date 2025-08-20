-- Create Q&A table for questions and answers
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_person TEXT NOT NULL,
  question TEXT NOT NULL,
  author_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  upvotes INTEGER NOT NULL DEFAULT 0,
  is_answered BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policies for questions access
CREATE POLICY "Everyone can view questions" 
ON public.questions 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can create questions" 
ON public.questions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Everyone can update questions" 
ON public.questions 
FOR UPDATE 
USING (true);

-- Create table for question upvotes to prevent duplicate votes
CREATE TABLE public.question_upvotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Using anonymous user ID
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.question_upvotes ENABLE ROW LEVEL SECURITY;

-- Create policies for upvotes
CREATE POLICY "Everyone can view upvotes" 
ON public.question_upvotes 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can create upvotes" 
ON public.question_upvotes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Everyone can delete their upvotes" 
ON public.question_upvotes 
FOR DELETE 
USING (true);

-- Add index for better performance
CREATE INDEX idx_questions_target_person ON public.questions(target_person);
CREATE INDEX idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX idx_question_upvotes_question_id ON public.question_upvotes(question_id);