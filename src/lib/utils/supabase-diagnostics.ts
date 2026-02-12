/**
 * Supabase Diagnostics
 * Utilities to test Supabase connectivity
 */

import { createClient } from '@/lib/supabase/client'

export interface DiagnosticResult {
  test: string
  status: 'pass' | 'fail' | 'warn'
  message: string
  details?: any
}

/**
 * Run all diagnostic tests
 */
export async function runDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = []

  // Test 1: Environment Variables
  console.log('🔍 [Diagnostics] Checking environment variables...')
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  results.push({
    test: 'Environment Variables',
    status: hasUrl && hasKey ? 'pass' : 'fail',
    message: hasUrl && hasKey ? 'All required env vars set' : 'Missing environment variables',
    details: {
      NEXT_PUBLIC_SUPABASE_URL: hasUrl ? '✓ Set' : '✗ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasKey ? '✓ Set' : '✗ Missing',
    },
  })

  if (!hasUrl || !hasKey) {
    return results // Can't continue without env vars
  }

  // Test 2: Client Creation
  console.log('🔍 [Diagnostics] Creating Supabase client...')
  let supabase
  try {
    supabase = createClient()
    results.push({
      test: 'Client Creation',
      status: 'pass',
      message: 'Supabase client created successfully',
    })
  } catch (err) {
    results.push({
      test: 'Client Creation',
      status: 'fail',
      message: 'Failed to create Supabase client',
      details: err instanceof Error ? err.message : String(err),
    })
    return results // Can't continue without client
  }

  // Test 3: Basic Connectivity (HEAD request)
  console.log('🔍 [Diagnostics] Testing basic connectivity...')
  try {
    const startTime = Date.now()
    const { count, error } = await Promise.race([
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout after 10s')), 10000)
      ),
    ])
    const duration = Date.now() - startTime

    if (error) {
      results.push({
        test: 'Database Connection',
        status: 'fail',
        message: `Failed to connect to database: ${error.message}`,
        details: { error, duration: `${duration}ms` },
      })
    } else {
      results.push({
        test: 'Database Connection',
        status: 'pass',
        message: `Connected successfully (${duration}ms)`,
        details: { messageCount: count, duration: `${duration}ms` },
      })
    }
  } catch (err) {
    results.push({
      test: 'Database Connection',
      status: 'fail',
      message: err instanceof Error ? err.message : 'Connection failed',
      details: err,
    })
  }

  // Test 4: Query Test
  console.log('🔍 [Diagnostics] Testing query...')
  try {
    const startTime = Date.now()
    const { data, error } = await Promise.race([
      supabase.from('messages').select('*').limit(1),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout after 10s')), 10000)
      ),
    ])
    const duration = Date.now() - startTime

    if (error) {
      results.push({
        test: 'Query Execution',
        status: 'fail',
        message: `Query failed: ${error.message}`,
        details: { error, duration: `${duration}ms` },
      })
    } else {
      results.push({
        test: 'Query Execution',
        status: 'pass',
        message: `Query successful (${duration}ms)`,
        details: { results: data?.length || 0, duration: `${duration}ms` },
      })
    }
  } catch (err) {
    results.push({
      test: 'Query Execution',
      status: 'fail',
      message: err instanceof Error ? err.message : 'Query failed',
      details: err,
    })
  }

  // Test 5: Realtime Connection
  console.log('🔍 [Diagnostics] Testing Realtime...')
  try {
    const channel = supabase.channel('diagnostics-test')

    const realtimeResult = await new Promise<DiagnosticResult>((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          test: 'Realtime Connection',
          status: 'fail',
          message: 'Realtime subscription timed out (10s)',
          details: 'WebSocket connection may be blocked',
        })
        supabase.removeChannel(channel)
      }, 10000)

      channel.subscribe((status, err) => {
        clearTimeout(timeout)

        if (status === 'SUBSCRIBED') {
          resolve({
            test: 'Realtime Connection',
            status: 'pass',
            message: 'Realtime connected successfully',
            details: { status },
          })
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          resolve({
            test: 'Realtime Connection',
            status: 'fail',
            message: `Realtime connection failed: ${status}`,
            details: { status, error: err },
          })
        }

        supabase.removeChannel(channel)
      })
    })

    results.push(realtimeResult)
  } catch (err) {
    results.push({
      test: 'Realtime Connection',
      status: 'fail',
      message: 'Realtime test failed',
      details: err,
    })
  }

  return results
}

/**
 * Print diagnostic results to console
 */
export function printDiagnostics(results: DiagnosticResult[]) {
  console.log('\n========================================')
  console.log('📊 SUPABASE DIAGNOSTICS REPORT')
  console.log('========================================\n')

  results.forEach((result, index) => {
    const icon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⚠'
    const color = result.status === 'pass' ? '\x1b[32m' : result.status === 'fail' ? '\x1b[31m' : '\x1b[33m'
    const reset = '\x1b[0m'

    console.log(`${index + 1}. ${icon} ${color}${result.test}${reset}`)
    console.log(`   ${result.message}`)
    if (result.details) {
      console.log(`   Details:`, result.details)
    }
    console.log('')
  })

  const passCount = results.filter(r => r.status === 'pass').length
  const failCount = results.filter(r => r.status === 'fail').length
  const warnCount = results.filter(r => r.status === 'warn').length

  console.log('========================================')
  console.log(`Summary: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`)
  console.log('========================================\n')
}
