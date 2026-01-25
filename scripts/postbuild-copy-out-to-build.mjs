import { existsSync } from "node:fs"
import { cp, rm } from "node:fs/promises"
import path from "node:path"

const cwd = process.cwd()
const outDir = path.join(cwd, "out")
const buildDir = path.join(cwd, "build")

if (!existsSync(outDir)) {
  // If you're not using `output: "export"` (or build failed), there's nothing to copy.
  process.exit(0)
}

// Ensure a clean build directory (some CI systems expect `build/`).
await rm(buildDir, { recursive: true, force: true })
await cp(outDir, buildDir, { recursive: true })

