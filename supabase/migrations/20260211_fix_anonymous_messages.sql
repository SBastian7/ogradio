-- Fix: Allow anonymous messages without requiring a profile
-- This enables client-side anonymous users to send messages

-- Drop the foreign key constraint
ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_user_id_fkey;

-- Make user_id nullable to support anonymous messages
ALTER TABLE messages
  ALTER COLUMN user_id DROP NOT NULL;

-- Add a new optional column for anonymous user data (stored as JSONB)
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS anonymous_user JSONB;

-- Update RLS policies to allow anyone to read messages
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON messages;
CREATE POLICY "Messages are viewable by everyone"
    ON messages FOR SELECT
    USING (true);

-- Update RLS to allow anyone to insert messages (anonymous or authenticated)
DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;
CREATE POLICY "Anyone can insert messages"
    ON messages FOR INSERT
    WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS messages_anonymous_user_idx ON messages USING GIN (anonymous_user);
