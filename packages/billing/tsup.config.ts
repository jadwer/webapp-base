import { defineConfig } from 'tsup'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

/**
 * Mirror @lwm/ui's SCSS handling: tsup treats .module.scss imports as
 * side-effect-free in the JS output, then onSuccess copies the source files
 * into dist/styles/ so consumers (Next.js apps) can compile them with their
 * own SCSS pipeline.
 */
function copyScssModules() {
  const srcRoot = join(__dirname, 'src/styles')
  const dstRoot = join(__dirname, 'dist/styles')

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
  external: ['react', 'react-dom', 'next', 'next/image', 'next/link', 'next/navigation'],
  loader: {
    '.scss': 'empty',
  },
  onSuccess: async () => {
    copyScssModules()
  },
})
