/**
 * Supabase Diagnostics Page
 * Test Supabase connectivity and configuration
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertCircle, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import { GlassPanel, Button } from '@/components/ui'
import { runDiagnostics, printDiagnostics, type DiagnosticResult } from '@/lib/utils/supabase-diagnostics'
import { fadeInVariants } from '@/lib/animations'

export default function DiagnosticsPage() {
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])

  const handleRunDiagnostics = async () => {
    setRunning(true)
    setResults([])

    try {
      const diagnosticResults = await runDiagnostics()
      setResults(diagnosticResults)
      printDiagnostics(diagnosticResults)
    } catch (err) {
      console.error('Diagnostics failed:', err)
    } finally {
      setRunning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'fail':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'warn':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'border-green-400/30 bg-green-400/5'
      case 'fail':
        return 'border-red-400/30 bg-red-400/5'
      case 'warn':
        return 'border-yellow-400/30 bg-yellow-400/5'
      default:
        return 'border-white/10 bg-white/5'
    }
  }

  const passCount = results.filter(r => r.status === 'pass').length
  const failCount = results.filter(r => r.status === 'fail').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          className="text-center space-y-2"
        >
          <h1 className="font-display font-black text-4xl bg-gradient-to-r from-accent-blue via-accent-purple to-accent-blue bg-clip-text text-transparent">
            Supabase Diagnostics
          </h1>
          <p className="text-white/60">Test your Supabase connection and configuration</p>
        </motion.div>

        {/* Run Button */}
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <GlassPanel className="text-center">
            <Button
              onClick={handleRunDiagnostics}
              disabled={running}
              variant="primary"
              size="lg"
            >
              {running ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5 mr-2" />
                  Run Diagnostics
                </>
              )}
            </Button>
            <p className="text-xs text-white/50 mt-3">
              This will test your Supabase connection, database queries, and realtime functionality
            </p>
          </GlassPanel>
        </motion.div>

        {/* Results */}
        {results.length > 0 && (
          <motion.div
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Summary */}
            <GlassPanel>
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl">Summary</h2>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-400">
                    {passCount} Passed
                  </span>
                  <span className="text-red-400">
                    {failCount} Failed
                  </span>
                </div>
              </div>
            </GlassPanel>

            {/* Test Results */}
            {results.map((result, index) => (
              <motion.div
                key={index}
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <GlassPanel className={`border ${getStatusColor(result.status)}`}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 space-y-2">
                      <h3 className="font-bold text-lg">{result.test}</h3>
                      <p className="text-white/80 text-sm">{result.message}</p>
                      {result.details && (
                        <details className="text-xs text-white/60">
                          <summary className="cursor-pointer hover:text-white/80">
                            View Details
                          </summary>
                          <pre className="mt-2 p-3 bg-black/30 rounded-lg overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}

            {/* Troubleshooting Tips */}
            {failCount > 0 && (
              <motion.div
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.5 }}
              >
                <GlassPanel className="border border-yellow-400/30 bg-yellow-400/5">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Troubleshooting Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>• Check if your Supabase project is active at <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">supabase.com/dashboard</a></li>
                    <li>• Verify <code className="px-1 py-0.5 bg-black/30 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="px-1 py-0.5 bg-black/30 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your <code className="px-1 py-0.5 bg-black/30 rounded">.env.local</code> file</li>
                    <li>• Restart your development server after changing environment variables</li>
                    <li>• Check browser console (F12) for WebSocket errors</li>
                    <li>• Ensure no firewall or VPN is blocking WebSocket connections (wss://)</li>
                    <li>• Verify Realtime is enabled for the &quot;messages&quot; table in Supabase dashboard</li>
                  </ul>
                </GlassPanel>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Back to Home */}
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <a
            href="/"
            className="text-accent-blue hover:text-accent-purple transition-colors text-sm"
          >
            ← Back to Home
          </a>
        </motion.div>
      </div>
    </div>
  )
}
