/**
 * Supabase Database Types
 * Auto-generated types for type-safe database access
 *
 * To regenerate: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          is_anonymous: boolean
          created_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          is_anonymous?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          is_anonymous?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      song_requests: {
        Row: {
          id: string
          user_id: string
          song_name: string
          artist: string
          status: 'pending' | 'playing' | 'played' | 'skipped'
          created_at: string
          played_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          song_name: string
          artist: string
          status?: 'pending' | 'playing' | 'played' | 'skipped'
          created_at?: string
          played_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          song_name?: string
          artist?: string
          status?: 'pending' | 'playing' | 'played' | 'skipped'
          created_at?: string
          played_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'song_requests_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      upvotes: {
        Row: {
          id: string
          user_id: string
          request_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          request_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          request_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'upvotes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'upvotes_request_id_fkey'
            columns: ['request_id']
            isOneToOne: false
            referencedRelation: 'song_requests'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      song_requests_with_votes: {
        Row: {
          id: string
          user_id: string
          song_name: string
          artist: string
          status: 'pending' | 'playing' | 'played' | 'skipped'
          created_at: string
          played_at: string | null
          upvote_count: number
          requester_username: string
          requester_avatar: string | null
        }
      }
    }
    Functions: {
      get_upvote_count: {
        Args: {
          request_id: string
        }
        Returns: number
      }
      has_user_upvoted: {
        Args: {
          request_id: string
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      request_status: 'pending' | 'playing' | 'played' | 'skipped'
    }
  }
}
