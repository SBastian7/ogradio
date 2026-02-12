# Supabase Setup Instructions

This directory contains database migrations and setup instructions for the OG Club Radio project.

## Step-by-Step Setup Guide

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details:
   - **Name:** `og-club-radio`
   - **Database Password:** Generate a strong password and save it securely
   - **Region:** Choose the region closest to your users
5. Click "Create new project" and wait ~2 minutes

### 2. Run Database Migration

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `migrations/20260210_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the migration
6. Verify success - you should see "Success. No rows returned"

### 3. Enable Realtime

1. Go to **Database → Replication**
2. Find these tables and enable replication for each:
   - `messages`
   - `song_requests`
   - `upvotes`
   - `profiles`
3. Click the toggle to enable for each table

### 4. Configure Authentication Providers

#### Google OAuth
1. Go to **Authentication → Providers**
2. Find "Google" and click "Enable"
3. Follow the instructions to set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
4. Paste credentials into Supabase and save

#### Discord OAuth
1. In **Authentication → Providers**, find "Discord" and click "Enable"
2. Follow the instructions:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create new application
   - Go to OAuth2 settings
   - Add redirect: `https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
3. Paste credentials into Supabase and save

#### GitHub OAuth
1. In **Authentication → Providers**, find "GitHub" and click "Enable"
2. Follow the instructions:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create new OAuth App
   - Set Homepage URL: `https://[YOUR-PROJECT-ID].supabase.co`
   - Set Authorization callback URL: `https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback`
   - Copy Client ID and generate Client Secret
3. Paste credentials into Supabase and save

### 5. Get API Keys

1. Go to **Settings → API**
2. Find and copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (safe to use in client-side code)
   - **service_role** key (⚠️ KEEP SECRET - only use server-side)

### 6. Update Environment Variables

1. Open `app/.env.local` in your project
2. Update with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Radio Stream Configuration (already set)
NEXT_PUBLIC_RADIO_STREAM_URL=https://radio.ogclub.info/listen/og_club/radio.mp3

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **IMPORTANT:** Never commit `.env.local` to git! It's already in `.gitignore`.

### 7. Test the Connection

Run the development server to test:

```bash
cd app
npm run dev
```

The app should connect to Supabase without errors. Check the browser console for any connection issues.

## Database Schema Overview

### Tables

- **profiles** - User profiles (extends auth.users)
  - Anonymous users get auto-generated usernames
  - Authenticated users can customize their profile

- **messages** - Chat messages
  - Real-time updates enabled
  - Immutable (can't edit/delete)

- **song_requests** - Song requests with status tracking
  - Status: pending → playing → played/skipped
  - Automatically sets `played_at` when status changes to 'played'

- **upvotes** - Song request upvotes
  - One vote per user per request (unique constraint)
  - Users can un-vote

### Views

- **song_requests_with_votes** - Pre-joined view with upvote counts and requester info

### Functions

- `get_upvote_count(request_id)` - Get upvote count for a request
- `has_user_upvoted(request_id, user_id)` - Check if user upvoted

## Row-Level Security (RLS)

All tables have RLS enabled with these policies:

- **Read:** Everyone can view all data
- **Insert:** Users can only insert their own data
- **Update:** Users can only update their own data
- **Delete:** Users can only delete their own upvotes

⚠️ **Admin operations** (like changing song status to 'playing') must use the service role key via API routes.

## Troubleshooting

### Migration fails
- Check for syntax errors in the SQL
- Ensure you're running the query in the correct project
- Try running sections of the migration separately

### Realtime not working
- Verify tables are enabled in Database → Replication
- Check that the table names match exactly
- Restart your dev server

### Authentication issues
- Verify redirect URIs match exactly (including https/http)
- Check that credentials are correct
- Ensure auth providers are enabled in Supabase dashboard

### Connection errors
- Verify `.env.local` has correct Supabase URL and keys
- Check that environment variables start with `NEXT_PUBLIC_` for client-side usage
- Restart dev server after changing env vars

## Next Steps

After completing setup:
1. Test authentication flow
2. Test sending a message
3. Test creating a song request
4. Test upvoting
5. Verify real-time updates work

See the main [README.md](../README.md) for full development workflow.
