/**
 * Supabase Connection Test Script
 * Run with: npx tsx scripts/test-supabase.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/lib/supabase/database.types'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please check your .env.local file')
  process.exit(1)
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n')

  try {
    // Test 1: Database connection
    console.log('1️⃣ Testing database connection...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (profilesError) throw profilesError
    console.log('✅ Database connection successful!\n')

    // Test 2: Check all tables exist
    console.log('2️⃣ Checking tables...')
    const tables = ['profiles', 'messages', 'song_requests', 'upvotes']

    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1)
      if (error) {
        console.error(`❌ Table '${table}' not found or not accessible`)
        throw error
      }
      console.log(`   ✅ ${table}`)
    }
    console.log('')

    // Test 3: Check view exists
    console.log('3️⃣ Checking views...')
    const { error: viewError } = await supabase
      .from('song_requests_with_votes')
      .select('*')
      .limit(1)

    if (viewError) throw viewError
    console.log('   ✅ song_requests_with_votes\n')

    // Test 4: Check Realtime
    console.log('4️⃣ Testing Realtime connection...')
    const channel = supabase.channel('test-channel')

    await new Promise((resolve, reject) => {
      channel
        .on('system', { event: 'error' }, (error) => {
          console.error('❌ Realtime error:', error)
          reject(error)
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Realtime connection successful!\n')
            channel.unsubscribe()
            resolve(true)
          }
        })

      // Timeout after 5 seconds
      setTimeout(() => {
        channel.unsubscribe()
        reject(new Error('Realtime connection timeout'))
      }, 5000)
    })

    // Test 5: Check authentication
    console.log('5️⃣ Testing authentication setup...')
    const { data: { session } } = await supabase.auth.getSession()
    console.log('   ✅ Auth initialized (no active session - expected)\n')

    // Success summary
    console.log('═══════════════════════════════════════')
    console.log('🎉 ALL TESTS PASSED!')
    console.log('═══════════════════════════════════════')
    console.log('\nSupabase is ready to use!')
    console.log('Next: Continue to Phase 3 (Design System)\n')

  } catch (error) {
    console.error('\n❌ TEST FAILED!')
    console.error('Error:', error)
    console.error('\nPlease check:')
    console.error('1. .env.local has correct NEXT_PUBLIC_SUPABASE_URL')
    console.error('2. .env.local has correct NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.error('3. Database migration was run successfully')
    console.error('4. Tables are enabled for Realtime (Database → Replication)')
    process.exit(1)
  }
}

testConnection()
