#!/usr/bin/env bun

/**
 * 🏗️ Build Script for js-lib-go Library
 *
 * This script handles only build-related functionality including:
 * - JavaScript/TypeScript bundling with Bun.build API
 * - TypeScript definition generation
 * - Build output management
 * - Development and production builds
 *
 * Based on: https://bun.sh/docs/bundler
 *
 * Usage:
 *   bun run build.ts [command] [flags]
 *
 * Commands:
 *   all       - Build everything (bundle + types) [default]
 *   bundle    - Build JavaScript bundle only
 *   types     - Build TypeScript definitions only
 *   clean     - Clean build output directory
 *   watch     - Build in watch mode (development)
 *
 * @author Ramiro M
 * @version 0.0.1
 */

import { execSync } from "child_process";
import { rmSync, existsSync } from "fs";

interface BuildOptions {
  clean?: boolean;
  minify?: boolean;
  sourcemap?: boolean;
  watch?: boolean;
  pack?: boolean;
  target?: "browser" | "bun" | "node";
  format?: "esm" | "cjs" | "iife";
}

const DEFAULT_OPTIONS: BuildOptions = {
  clean: true,
  minify: true,
  sourcemap: false,
  watch: false,
  pack: false,
  target: "bun",
  format: "esm",
};

async function cleanDist() {
  if (existsSync("dist")) {
    rmSync("dist", { recursive: true, force: true });
    console.log("🧹 Cleaned dist directory");
  }
}

async function buildTypes() {
  console.log("📝 Building TypeScript definitions...");

  try {
    execSync("npx tsc -p tsconfig.build.json", { stdio: "inherit" });
    console.log("✅ TypeScript definitions built successfully");
  } catch (error) {
    console.error("❌ Failed to build TypeScript definitions");
    throw error;
  }
}

async function buildBundle(options: BuildOptions = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  console.log("📦 Building bundle...");

  const buildConfig = {
    entrypoints: ["./index.ts"],
    outdir: "./dist",
    target: mergedOptions.target,
    format: mergedOptions.format,
    minify: mergedOptions.minify,
    splitting: false, // Not needed for a simple library
    sourcemap: mergedOptions.sourcemap
      ? ("linked" as const)
      : ("none" as const),
    external: [], // Bundle everything for the library
    footer: "// built with love in GDL 🫀",
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
    packages: "bundle" as const,
    drop: mergedOptions.minify ? ["console", "debugger"] : [], // Remove console.log and debugger in production
  };

  try {
    const result = await Bun.build(buildConfig);

    if (!result.success) {
      console.error("❌ Build failed with errors:");
      for (const message of result.logs) {
        console.error(message);
      }
      throw new Error("Build failed");
    }

    console.log("✅ Bundle built successfully");

    // Log build artifacts
    for (const output of result.outputs) {
      const sizeKB = (output.size / 1024).toFixed(2);
      console.log(`  📄 ${output.path} (${sizeKB} KB)`);
    }

    if (result.logs.length > 0) {
      console.log("⚠️  Build warnings:");
      for (const message of result.logs) {
        console.warn(message);
      }
    }

    return result;
  } catch (error) {
    console.error("❌ Failed to build bundle");
    throw error;
  }
}

async function buildAll(options: BuildOptions = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  console.log("🏗️  Starting full build process...\n");

  if (mergedOptions.clean) {
    await cleanDist();
  }

  await buildBundle(mergedOptions);
  await buildTypes();

  console.log("\n🎉 Build completed successfully!");

  if (mergedOptions.pack) {
    await createPackageTarball();
  }
}

async function developmentBuild(
  watch: boolean = false,
  options: BuildOptions = {},
) {
  if (watch) {
    console.log("👀 Starting development watch mode...\n");

    // For now, use CLI watch mode as Bun.build doesn't have native watch yet
    const args = [
      "build",
      "./index.ts",
      "--outdir",
      "./dist",
      "--watch",
      "--sourcemap", // Always use sourcemaps in dev
      "--target",
      "bun",
      "--format",
      "esm",
      '--footer="// built with love in GDL 🫀 (dev mode)"',
    ];

    try {
      const command = `bun ${args.join(" ")}`;
      console.log(`📋 Command: ${command}\n`);
      console.log("💡 Press Ctrl+C to stop watching\n");

      execSync(command, { stdio: "inherit" });
    } catch (error) {
      console.error("❌ Development watch mode failed");
      throw error;
    }
  } else {
    console.log("🔧 Building for development...\n");

    await buildBundle({
      clean: true,
      minify: false,
      sourcemap: true,
      target: "bun",
      format: "esm",
    });

    await buildTypes();

    console.log("\n🎉 Development build completed!");

    if (options.pack) {
      await createPackageTarball();
    }
  }
}

async function productionBuild(options: BuildOptions = {}) {
  console.log("🚀 Building for production...\n");

  await buildBundle({
    clean: true,
    minify: true,
    sourcemap: false,
    target: "bun",
    format: "esm",
  });

  await buildTypes();

  console.log("\n🎉 Production build completed!");

  if (options.pack) {
    await createPackageTarball();
  }
}

async function createPackageTarball() {
  console.log("📦 Creating package tarball...");

  try {
    execSync("bun pm pack", { stdio: "inherit" });
    console.log("✅ Package tarball created successfully");

    // Show tarball info
    const pkg = await Bun.file("package.json").json();
    const tarballName = `${pkg.name}-${pkg.version}.tgz`;

    if (existsSync(tarballName)) {
      const stat = await Bun.file(tarballName).stat();
      const sizeKB = (stat.size / 1024).toFixed(2);
      console.log(`   📄 ${tarballName} (${sizeKB} KB)`);
    }

    return tarballName;
  } catch (error) {
    console.error("❌ Failed to create package tarball");
    throw error;
  }
}

// CLI interface
const command = process.argv[2];
const flags = process.argv.slice(3);

const options: BuildOptions = {
  clean: !flags.includes("--no-clean"),
  minify: flags.includes("--minify"),
  sourcemap: flags.includes("--sourcemap"),
  watch: flags.includes("--watch"),
  pack: flags.includes("--pack"),
  target:
    (flags
      .find((f) => f.startsWith("--target="))
      ?.split("=")[1] as BuildOptions["target"]) || "bun",
  format:
    (flags
      .find((f) => f.startsWith("--format="))
      ?.split("=")[1] as BuildOptions["format"]) || "esm",
};

switch (command) {
  case "bundle":
    await buildBundle(options);
    break;

  case "types":
    await buildTypes();
    break;

  case "clean":
    await cleanDist();
    break;

  case "watch":
    await developmentBuild(true);
    break;

  case "dev":
    await developmentBuild(false, options);
    break;

  case "prod":
    await productionBuild(options);
    break;

  case "all":
    await buildAll(options);
    break;

  default:
    console.log(`
🏗️  js-lib-go Build Script

Usage: bun run build.ts <command> [flags]

Commands:
  all           Build everything (bundle + types) [default]
  bundle        Build JavaScript bundle only
  types         Build TypeScript definitions only
  clean         Clean the dist directory
  dev           Development build (unminified, with sourcemaps)
  watch         Development build in watch mode
  prod          Production build (minified, no sourcemaps)

Flags:
  --pack        Create package tarball after build
  --minify      Enable minification
  --sourcemap   Generate source maps
  --no-clean    Skip cleaning dist directory
  --target=<t>  Build target (browser|bun|node) [default: bun]
  --format=<f>  Output format (esm|cjs|iife) [default: esm]

Examples:
  bun run build.ts                     # Build everything
  bun run build.ts bundle --minify     # Build minified bundle
  bun run build.ts dev                 # Development build
  bun run build.ts prod --pack         # Production build + tarball
  bun run build.ts watch               # Development watch mode
`);

    // Default to building everything
    if (!command) {
      await buildAll(options);
    }
    break;
}
