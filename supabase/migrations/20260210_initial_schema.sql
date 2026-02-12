-- OG Club Radio - Initial Database Schema
-- This migration creates all tables, RLS policies, and enables Realtime

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    is_anonymous BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Messages RLS Policies
CREATE POLICY "Messages are viewable by everyone"
    ON messages FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete messages (chat history is immutable)

-- =============================================
-- SONG_REQUESTS TABLE
-- =============================================
CREATE TYPE request_status AS ENUM ('pending', 'playing', 'played', 'skipped');

CREATE TABLE IF NOT EXISTS song_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    song_name TEXT NOT NULL,
    artist TEXT NOT NULL,
    status request_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    played_at TIMESTAMPTZ
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS song_requests_status_idx ON song_requests(status);
CREATE INDEX IF NOT EXISTS song_requests_created_at_idx ON song_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS song_requests_user_id_idx ON song_requests(user_id);

-- Enable RLS on song_requests
ALTER TABLE song_requests ENABLE ROW LEVEL SECURITY;

-- Song Requests RLS Policies
CREATE POLICY "Song requests are viewable by everyone"
    ON song_requests FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert song requests"
    ON song_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending requests"
    ON song_requests FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

-- Note: Only admins should be able to change status to 'playing' or 'played'
-- This will be handled via API routes with service role key

-- =============================================
-- UPVOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS upvotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    request_id UUID REFERENCES song_requests(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, request_id) -- One vote per user per request
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS upvotes_request_id_idx ON upvotes(request_id);
CREATE INDEX IF NOT EXISTS upvotes_user_id_idx ON upvotes(user_id);

-- Enable RLS on upvotes
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Upvotes RLS Policies
CREATE POLICY "Upvotes are viewable by everyone"
    ON upvotes FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own upvotes"
    ON upvotes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes"
    ON upvotes FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get upvote count for a request
CREATE OR REPLACE FUNCTION get_upvote_count(request_id UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM upvotes WHERE upvotes.request_id = $1;
$$ LANGUAGE SQL STABLE;

-- Function to check if user has upvoted a request
CREATE OR REPLACE FUNCTION has_user_upvoted(request_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS(
        SELECT 1 FROM upvotes
        WHERE upvotes.request_id = $1 AND upvotes.user_id = $2
    );
$$ LANGUAGE SQL STABLE;

-- =============================================
-- VIEWS
-- =============================================

-- View for song requests with upvote counts
CREATE OR REPLACE VIEW song_requests_with_votes AS
SELECT
    sr.*,
    COUNT(u.id)::INTEGER as upvote_count,
    p.username as requester_username,
    p.avatar_url as requester_avatar
FROM song_requests sr
LEFT JOIN upvotes u ON sr.id = u.request_id
LEFT JOIN profiles p ON sr.user_id = p.id
GROUP BY sr.id, p.username, p.avatar_url
ORDER BY COUNT(u.id) DESC, sr.created_at ASC;

-- =============================================
-- REALTIME
-- =============================================

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE song_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE upvotes;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- =============================================
-- TRIGGERS
-- =============================================

-- Automatically update played_at when status changes to 'played'
CREATE OR REPLACE FUNCTION update_played_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'played' AND OLD.status != 'played' THEN
        NEW.played_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER song_requests_update_played_at
    BEFORE UPDATE ON song_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_played_at();

-- =============================================
-- SEED DATA (Optional - for testing)
-- =============================================

-- Note: Uncomment below to add test data
-- You'll need to replace the UUID with an actual auth.users ID after creating a test user

/*
-- Insert test profile
INSERT INTO profiles (id, username, avatar_url, is_anonymous)
VALUES ('00000000-0000-0000-0000-000000000000', 'TestUser', null, false)
ON CONFLICT (id) DO NOTHING;

-- Insert test messages
INSERT INTO messages (user_id, content) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Welcome to OG Club Radio! 🎵'),
    ('00000000-0000-0000-0000-000000000000', 'This is a test message');

-- Insert test song requests
INSERT INTO song_requests (user_id, song_name, artist, status) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Bohemian Rhapsody', 'Queen', 'pending'),
    ('00000000-0000-0000-0000-000000000000', 'Stairway to Heaven', 'Led Zeppelin', 'pending');
*/

-- =============================================
-- COMPLETED
-- =============================================
-- Schema creation complete!
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Configure authentication providers in Supabase Dashboard
-- 3. Update .env.local with your Supabase credentials
