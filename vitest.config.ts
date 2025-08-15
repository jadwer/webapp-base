/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment
    environment: 'happy-dom', // Faster than jsdom, compatible with React Testing Library
    
    // Setup files
    setupFiles: ['./src/test/setup.ts'],
    
    // Globals (makes describe, it, expect available globally)
    globals: true,
    
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        'src/app/**', // Exclude Next.js app directory (pages are integration tested)
        '**/*.test.*',
        '**/*.spec.*'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    
    // Test patterns - Buscar en módulos específicos
    include: [
      'src/modules/**/tests/**/*.{test,spec}.{js,ts,tsx}',
      'src/modules/**/*.{test,spec}.{js,ts,tsx}',
      'src/ui/**/*.{test,spec}.{js,ts,tsx}'
    ],
    exclude: ['node_modules/', 'src/test/setup.ts'],
    
    // Environment matching - usar node para integration tests
    environmentMatchGlobs: [
      ['**/integration/**', 'node']
    ],
    
    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Watch mode
    watch: false,
    
    // Reporter
    reporters: ['verbose', 'html'],
    
    // Retry failed tests
    retry: 1,
    
    // Run tests in parallel
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4
      }
    }
  },
  
  // Resolve aliases (same as Next.js)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/ui': path.resolve(__dirname, './src/ui'),
      '@/modules': path.resolve(__dirname, './src/modules'),
      '@/lib': path.resolve(__dirname, './src/lib')
    }
  }
})