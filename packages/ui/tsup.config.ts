import { defineConfig } from 'tsup'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

/**
 * Walk a directory and copy all SCSS module files (relative to src) into dist.
 * Next.js apps consuming this package compile the SCSS at their own build
 * time, so we just ship the source files.
 */
function copyScssModules() {
  const srcRoot = join(__dirname, 'src/styles/modules')
  const dstRoot = join(__dirname, 'dist/styles/modules')

  function walk(dir: string) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      if (statSync(full).isDirectory()) {
        walk(full)
      } else if (name.endsWith('.module.scss') || name.endsWith('.module.css')) {
        const rel = relative(srcRoot, full)
        const dst = join(dstRoot, rel)
        mkdirSync(join(dst, '..'), { recursive: true })
        copyFileSync(full, dst)
      }
    }
  }

  try {
    mkdirSync(dstRoot, { recursive: true })
    walk(srcRoot)
  } catch (e) {
    // Source dir may not exist yet on first build; tsup will fail loudly later.
    console.warn('copyScssModules:', (e as Error).message)
  }
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ['react', 'react-dom', 'next', 'next/image', 'next/link'],
  // Mark SCSS imports as external; the consumer's bundler resolves them.
  loader: {
    '.scss': 'empty',
  },
  onSuccess: async () => {
    copyScssModules()
  },
})
