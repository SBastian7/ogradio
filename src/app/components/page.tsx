/**
 * Component Demo Page
 * Showcase all UI components
 */

'use client'

import { useState } from 'react'
import { GlassPanel, Button, Avatar, Badge, toast } from '@/components/ui'
import { motion } from 'framer-motion'
import { fadeInVariants, staggerContainer, staggerItem } from '@/lib/animations'

export default function ComponentsPage() {
  const [loading, setLoading] = useState(false)

  const handleToastDemo = (type: 'success' | 'error' | 'loading') => {
    if (type === 'success') {
      toast.success('Operation completed successfully!')
    } else if (type === 'error') {
      toast.error('Something went wrong!')
    } else {
      const id = toast.loading('Loading...')
      setTimeout(() => toast.dismiss(id), 2000)
    }
  }

  const handleLoadingDemo = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 3000)
  }

  return (
    <div className="min-h-screen p-8">
      <motion.div
        className="max-w-6xl mx-auto space-y-12"
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-display font-black gradient-text uppercase">
            Component Library
          </h1>
          <p className="text-xl text-white/70">
            OG Club Radio Design System
          </p>
        </div>

        {/* GlassPanel Section */}
        <motion.section
          className="space-y-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-3xl font-display font-black text-white uppercase"
            variants={staggerItem}
          >
            Glass Panels
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div variants={staggerItem}>
              <GlassPanel>
                <h3 className="font-bold mb-2">Default Panel</h3>
                <p className="text-sm text-white/70">
                  Basic glassmorphic panel with medium padding
                </p>
              </GlassPanel>
            </motion.div>
            <motion.div variants={staggerItem}>
              <GlassPanel hoverable padding="lg">
                <h3 className="font-bold mb-2">Hoverable Panel</h3>
                <p className="text-sm text-white/70">
                  Hover over me to see the effect
                </p>
              </GlassPanel>
            </motion.div>
            <motion.div variants={staggerItem}>
              <GlassPanel padding="xl" className="text-center">
                <h3 className="font-bold mb-2">Large Padding</h3>
                <p className="text-sm text-white/70">
                  Extra spacious layout
                </p>
              </GlassPanel>
            </motion.div>
          </div>
        </motion.section>

        {/* Buttons Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-display font-black text-white uppercase">
            Buttons
          </h2>
          <GlassPanel>
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h3 className="font-bold mb-3 text-sm text-white/70">VARIANTS</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="font-bold mb-3 text-sm text-white/70">SIZES</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              {/* States */}
              <div>
                <h3 className="font-bold mb-3 text-sm text-white/70">STATES</h3>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleLoadingDemo} loading={loading}>
                    {loading ? 'Loading...' : 'Click to Load'}
                  </Button>
                  <Button disabled>Disabled</Button>
                  <Button fullWidth variant="secondary">
                    Full Width
                  </Button>
                </div>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* Avatars Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-display font-black text-white uppercase">
            Avatars
          </h2>
          <GlassPanel>
            <div className="space-y-6">
              {/* Sizes */}
              <div>
                <h3 className="font-bold mb-3 text-sm text-white/70">SIZES</h3>
                <div className="flex items-center gap-3">
                  <Avatar name="John Doe" size="xs" />
                  <Avatar name="Jane Smith" size="sm" />
                  <Avatar name="Bob Wilson" size="md" />
                  <Avatar name="Alice Johnson" size="lg" />
                  <Avatar name="Charlie Brown" size="xl" />
                </div>
              </div>

              {/* With Verification */}
              <div>
                <h3 className="font-bold mb-3 text-sm text-white/70">VERIFIED USERS</h3>
                <div className="flex items-center gap-3">
                  <Avatar name="Verified User" verified size="md" />
                  <Avatar name="DJ Alex" verified size="lg" />
                </div>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* Badges Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-display font-black text-white uppercase">
            Badges
          </h2>
          <GlassPanel>
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h3 className="font-bold mb-3 text-sm text-white/70">STATUS BADGES</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="pending" dot>Pending</Badge>
                  <Badge variant="playing" dot>Playing</Badge>
                  <Badge variant="played" dot>Played</Badge>
                  <Badge variant="skipped" dot>Skipped</Badge>
                  <Badge variant="verified">Verified</Badge>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="font-bold mb-3 text-sm text-white/70">SIZES</h3>
                <div className="flex items-center gap-3">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* Toast Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-display font-black text-white uppercase">
            Toast Notifications
          </h2>
          <GlassPanel>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => handleToastDemo('success')} variant="primary">
                Success Toast
              </Button>
              <Button onClick={() => handleToastDemo('error')} variant="secondary">
                Error Toast
              </Button>
              <Button onClick={() => handleToastDemo('loading')} variant="ghost">
                Loading Toast
              </Button>
            </div>
          </GlassPanel>
        </section>

        {/* Color Palette */}
        <section className="space-y-4">
          <h2 className="text-3xl font-display font-black text-white uppercase">
            Color Palette
          </h2>
          <GlassPanel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="w-full h-20 rounded-lg bg-accent-blue mb-2" />
                <p className="text-sm font-bold">Electric Blue</p>
                <p className="text-xs text-white/50">#00d4ff</p>
              </div>
              <div>
                <div className="w-full h-20 rounded-lg bg-accent-purple mb-2" />
                <p className="text-sm font-bold">Neon Purple</p>
                <p className="text-xs text-white/50">#b794f6</p>
              </div>
              <div>
                <div className="w-full h-20 rounded-lg bg-background-dark mb-2 border border-glass-border" />
                <p className="text-sm font-bold">Dark</p>
                <p className="text-xs text-white/50">#0a0a0f</p>
              </div>
              <div>
                <div className="w-full h-20 rounded-lg bg-background-darker mb-2 border border-glass-border" />
                <p className="text-sm font-bold">Darker</p>
                <p className="text-xs text-white/50">#1a1a2e</p>
              </div>
            </div>
          </GlassPanel>
        </section>
      </motion.div>
    </div>
  )
}
