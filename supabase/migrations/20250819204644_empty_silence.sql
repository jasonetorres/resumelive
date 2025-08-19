/*
  # Create chat messages table for real-time chat

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `target_person` (text, references current session)
      - `message` (text, the chat message content)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `chat_messages` table
    - Add policies for public read/write access (anonymous chat)

  3. Real-time
    - Enable real-time updates for live chat functionality
*/

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_person text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anonymous chat)
CREATE POLICY "Anyone can view chat messages"
  ON public.chat_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert chat messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete chat messages"
  ON public.chat_messages
  FOR DELETE
  USING (true);

-- Enable real-time functionality
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;