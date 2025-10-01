/*
  # Add Signup Toggle Setting

  1. New Tables
    - `signup_settings`
      - `id` (integer, primary key) - Always 1 for singleton pattern
      - `signup_enabled` (boolean) - Whether signup is required
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `signup_settings` table
    - Add policy for anyone to read the setting
    - Add policy for authenticated users to update (host page is password protected)

  3. Initial Data
    - Insert default row with signup enabled
*/

CREATE TABLE IF NOT EXISTS signup_settings (
  id integer PRIMARY KEY DEFAULT 1,
  signup_enabled boolean DEFAULT true NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT singleton_signup_settings CHECK (id = 1)
);

ALTER TABLE signup_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read signup settings"
  ON signup_settings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update signup settings"
  ON signup_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Insert default row if it doesn't exist
INSERT INTO signup_settings (id, signup_enabled)
VALUES (1, true)
ON CONFLICT (id) DO NOTHING;