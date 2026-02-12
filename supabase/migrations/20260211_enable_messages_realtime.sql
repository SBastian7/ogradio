/**
 * Enable Realtime for Messages Table
 * Ensures postgres_changes subscriptions work for the messages table
 */

-- Add the messages table to the realtime publication
-- This will error if already added, but that's okay
DO $$
BEGIN
  -- Try to add the table to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION
  WHEN duplicate_object THEN
    -- Table already in publication, that's fine
    RAISE NOTICE 'messages table already in supabase_realtime publication';
END $$;

-- Ensure the table has replica identity set (required for realtime)
-- This allows Realtime to track changes
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Verify the table is in the publication
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'messages';
