-- Fix Messages RLS for Client-Side Anonymous Users
-- Since we're using client-side anonymous users (not Supabase auth.signInAnonymously),
-- we need to allow unauthenticated users to insert messages

-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;

-- Create new permissive INSERT policy that allows anyone to insert messages
CREATE POLICY "Anyone can insert messages"
    ON messages FOR INSERT
    WITH CHECK (true);

-- Note: This is acceptable for a public chat room
-- The user_id will be the client-side generated UUID
-- We rely on application-level validation for message content (DOMPurify)
