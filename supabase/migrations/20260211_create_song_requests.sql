/**
 * Song Requests and Upvotes Schema
 * Creates tables for the song request queue with upvoting system
 */

-- Create song_requests table
CREATE TABLE IF NOT EXISTS song_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  song_name TEXT NOT NULL,
  artist TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'playing', 'played')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  played_at TIMESTAMPTZ,

  -- For anonymous users
  anonymous_user JSONB,

  -- Validation
  CONSTRAINT song_name_not_empty CHECK (char_length(song_name) > 0),
  CONSTRAINT artist_not_empty CHECK (char_length(artist) > 0)
);

-- Create upvotes table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES song_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- For anonymous users
  anonymous_user JSONB,

  -- Ensure one vote per user per request
  CONSTRAINT unique_vote UNIQUE (request_id, user_id),
  CONSTRAINT user_or_anonymous CHECK (user_id IS NOT NULL OR anonymous_user IS NOT NULL)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_song_requests_status ON song_requests(status);
CREATE INDEX IF NOT EXISTS idx_song_requests_created_at ON song_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_upvotes_request_id ON upvotes(request_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_user_id ON upvotes(user_id);

-- Create a view for requests with vote counts
-- Drop the view first if it exists
DROP VIEW IF EXISTS song_requests_with_votes;

CREATE VIEW song_requests_with_votes AS
SELECT
  sr.*,
  COALESCE(COUNT(u.id), 0)::INTEGER as vote_count
FROM song_requests sr
LEFT JOIN upvotes u ON sr.id = u.request_id
GROUP BY sr.id;

-- Enable Row-Level Security
ALTER TABLE song_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for song_requests
-- Everyone can view pending and playing requests
CREATE POLICY "Anyone can view active requests"
  ON song_requests FOR SELECT
  USING (status IN ('pending', 'playing'));

-- Anyone can insert requests (authenticated or anonymous)
CREATE POLICY "Anyone can insert requests"
  ON song_requests FOR INSERT
  WITH CHECK (true);

-- Users can update their own requests (change to played, etc.)
CREATE POLICY "Users can update own requests"
  ON song_requests FOR UPDATE
  USING (
    (user_id IS NOT NULL AND user_id = auth.uid()) OR
    (user_id IS NULL)
  );

-- RLS Policies for upvotes
-- Everyone can view upvotes
CREATE POLICY "Anyone can view upvotes"
  ON upvotes FOR SELECT
  USING (true);

-- Anyone can insert upvotes
CREATE POLICY "Anyone can insert upvotes"
  ON upvotes FOR INSERT
  WITH CHECK (true);

-- Users can delete their own upvotes (for un-voting)
CREATE POLICY "Users can delete own upvotes"
  ON upvotes FOR DELETE
  USING (
    (user_id IS NOT NULL AND user_id = auth.uid()) OR
    (user_id IS NULL)
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON song_requests TO authenticated, anon;
GRANT SELECT, INSERT, DELETE ON upvotes TO authenticated, anon;
GRANT SELECT ON song_requests_with_votes TO authenticated, anon;
