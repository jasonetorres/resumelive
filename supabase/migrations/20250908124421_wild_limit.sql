/*
  # Add security measures for lead collection and content moderation

  1. New Tables
    - `blocked_emails` - Track blocked email domains and addresses
    - `moderation_log` - Log all moderation actions
    - `rate_limits` - Track submission rates per IP/session

  2. Security Features
    - Email domain validation
    - Rate limiting
    - Content moderation for chat and questions
    - Admin approval workflow
    - Duplicate prevention

  3. Moderation Tools
    - Block/unblock emails
    - Review flagged content
    - Manual approval system
*/

-- Create blocked emails table
CREATE TABLE IF NOT EXISTS public.blocked_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  domain text,
  reason text,
  blocked_by text DEFAULT 'system',
  created_at timestamptz DEFAULT now()
);

-- Create moderation log table
CREATE TABLE IF NOT EXISTS public.moderation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL, -- 'block_email', 'approve_lead', 'reject_content', etc.
  target_id text, -- ID of the affected record
  target_type text, -- 'lead', 'question', 'chat_message', etc.
  reason text,
  moderator text DEFAULT 'system',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or session ID
  action_type text NOT NULL, -- 'lead_submission', 'question_submission', 'rating_submission'
  count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(identifier, action_type)
);

-- Add approval status to leads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Add moderation fields to questions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'is_flagged'
  ) THEN
    ALTER TABLE public.questions ADD COLUMN is_flagged boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'moderation_status'
  ) THEN
    ALTER TABLE public.questions ADD COLUMN moderation_status text DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Add moderation fields to chat_messages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'is_flagged'
  ) THEN
    ALTER TABLE public.chat_messages ADD COLUMN is_flagged boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'moderation_status'
  ) THEN
    ALTER TABLE public.chat_messages ADD COLUMN moderation_status text DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.blocked_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Allow all operations on blocked_emails" 
ON public.blocked_emails 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on moderation_log" 
ON public.moderation_log 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on rate_limits" 
ON public.rate_limits 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add some common blocked domains
INSERT INTO public.blocked_emails (email, domain, reason) VALUES
('test@test.com', 'test.com', 'Common test domain'),
('fake@fake.com', 'fake.com', 'Common fake domain'),
('spam@spam.com', 'spam.com', 'Known spam domain'),
('troll@troll.com', 'troll.com', 'Troll domain')
ON CONFLICT (email) DO NOTHING;

-- Enable realtime for new tables
ALTER TABLE public.blocked_emails REPLICA IDENTITY FULL;
ALTER TABLE public.moderation_log REPLICA IDENTITY FULL;
ALTER TABLE public.rate_limits REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_emails;
ALTER PUBLICATION supabase_realtime ADD TABLE public.moderation_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rate_limits;