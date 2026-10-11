import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "pathe";
import type { StackManifest, SupportedPackageManager, SupportedRuntime } from "./types.js";

const MARKER_CANDIDATES = [
  "drizzle.config.ts",
  "drizzle.config.js",
  "drizzle.config.mjs",
  "prisma/schema.prisma",
  "Dockerfile",
  "docker-compose.yml",
  "docker-compose.yaml",
  "compose.yaml",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "tailwind.config.js",
  "tailwind.config.ts",
  "tailwind.config.mjs",
  "vitest.config.ts",
  "vitest.config.js",
  "vitest.config.mjs",
  "playwright.config.ts",
  "playwright.config.js",
];

/**
 * Safely parse a JSON file without throwing errors on malformed JSON
 */
function safeParseJson<T>(content: string): T | null {
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Scan a repository root directory for manifests, dependencies, and marker files
 */
export async function scanStackManifest(rootDir: string): Promise<StackManifest> {
  const resolvedRoot = resolve(rootDir);
  const runtimes: SupportedRuntime[] = [];
  const packageManagers: SupportedPackageManager[] = [];
  let dependencies: Record<string, string> = {};
  let devDependencies: Record<string, string> = {};
  const markerFiles: string[] = [];

  // Check package.json (Node/Bun/Deno)
  const pkgJsonPath = join(resolvedRoot, "package.json");
  if (existsSync(pkgJsonPath)) {
    runtimes.push("node");
    try {
      const raw = await readFile(pkgJsonPath, "utf-8");
      const parsed = safeParseJson<{
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
        packageManager?: string;
      }>(raw);

      if (parsed) {
        if (parsed.dependencies && typeof parsed.dependencies === "object") {
          dependencies = { ...parsed.dependencies };
        }
        if (parsed.devDependencies && typeof parsed.devDependencies === "object") {
          devDependencies = { ...parsed.devDependencies };
        }
        if (parsed.packageManager) {
          if (parsed.packageManager.startsWith("pnpm")) packageManagers.push("pnpm");
          else if (parsed.packageManager.startsWith("yarn")) packageManagers.push("yarn");
          else if (parsed.packageManager.startsWith("bun")) packageManagers.push("bun");
          else if (parsed.packageManager.startsWith("npm")) packageManagers.push("npm");
        }
      }
    } catch {
      // Ignored: safe fallback
    }
  }

  // Lockfile package manager detection
  if (existsSync(join(resolvedRoot, "pnpm-lock.yaml")) && !packageManagers.includes("pnpm")) {
    packageManagers.push("pnpm");
  }
  if (existsSync(join(resolvedRoot, "yarn.lock")) && !packageManagers.includes("yarn")) {
    packageManagers.push("yarn");
  }
  if (existsSync(join(resolvedRoot, "package-lock.json")) && !packageManagers.includes("npm")) {
    packageManagers.push("npm");
  }
  if (existsSync(join(resolvedRoot, "bun.lockb")) || existsSync(join(resolvedRoot, "bun.lock"))) {
    if (!packageManagers.includes("bun")) packageManagers.push("bun");
    if (!runtimes.includes("bun")) runtimes.push("bun");
  }

  // Python detection
  const pyprojectPath = join(resolvedRoot, "pyproject.toml");
  const reqsPath = join(resolvedRoot, "requirements.txt");
  if (existsSync(pyprojectPath) || existsSync(reqsPath)) {
    if (!runtimes.includes("python")) runtimes.push("python");
    if (existsSync(join(resolvedRoot, "poetry.lock"))) {
      packageManagers.push("poetry");
    }
  }

  // Go detection
  if (existsSync(join(resolvedRoot, "go.mod"))) {
    if (!runtimes.includes("go")) runtimes.push("go");
    packageManagers.push("gomod");
  }

  // Rust detection
  if (existsSync(join(resolvedRoot, "Cargo.toml"))) {
    if (!runtimes.includes("rust")) runtimes.push("rust");
    packageManagers.push("cargo");
  }

  // Scan marker files
  for (const candidate of MARKER_CANDIDATES) {
    if (existsSync(join(resolvedRoot, candidate))) {
      markerFiles.push(candidate);
    }
  }

  return {
    rootDir: resolvedRoot,
    runtimes,
    packageManagers,
    dependencies,
    devDependencies,
    markerFiles,
  };
}
