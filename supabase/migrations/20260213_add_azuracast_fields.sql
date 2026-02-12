-- Add AzuraCast integration fields to song_requests table
-- Migration: 20260213_add_azuracast_fields.sql
-- Description: Adds fields for native AzuraCast request system integration

-- Add new columns for AzuraCast integration
ALTER TABLE song_requests
ADD COLUMN IF NOT EXISTS azuracast_request_id TEXT,
ADD COLUMN IF NOT EXISTS azuracast_track_id TEXT,
ADD COLUMN IF NOT EXISTS is_legacy BOOLEAN DEFAULT false;

-- Create index for faster lookups by AzuraCast request ID
CREATE INDEX IF NOT EXISTS idx_song_requests_azuracast_id
ON song_requests(azuracast_request_id);

-- Create index for faster lookups by AzuraCast track ID
CREATE INDEX IF NOT EXISTS idx_song_requests_track_id
ON song_requests(azuracast_track_id);

-- Mark all existing requests as legacy (manual entry)
UPDATE song_requests
SET is_legacy = true
WHERE azuracast_request_id IS NULL
  AND is_legacy IS NULL;

-- Add comment to table
COMMENT ON COLUMN song_requests.azuracast_request_id IS 'Links this request to AzuraCast queue entry';
COMMENT ON COLUMN song_requests.azuracast_track_id IS 'AzuraCast media library track ID';
COMMENT ON COLUMN song_requests.is_legacy IS 'True for manual entry requests (pre-AzuraCast integration)';
