#!/usr/bin/env bun

/**
 * 🧪 Test Script for js-lib-go Library
 *
 * This script handles all testing-related functionality including:
 * - Running tests with coverage
 * - Watch mode for development
 * - Test reporting and output
 *
 * Based on Bun's native test runner: https://bun.sh/docs/test
 *
 * Usage:
 *   bun run test.ts [command] [flags]
 *
 * Commands:
 *   coverage  - Run all tests with coverage (default)
 *   watch     - Run tests in watch mode
 *   file      - Run specific test file with watch
 *
 * @author Ramiro M
 * @version 0.0.1
 */

import { execSync } from "child_process";

interface TestOptions {
  coverage?: boolean;
  watch?: boolean;
  verbose?: boolean;
  file?: string;
}

const DEFAULT_OPTIONS: TestOptions = {
  coverage: true,
  watch: false,
  verbose: false,
};

async function runTestsWithCoverage() {
  console.log("🧪 Running all tests with coverage...\n");

  const args = ["test", "--coverage"];

  try {
    const command = `bun ${args.join(" ")}`;
    console.log(`📋 Command: ${command}\n`);

    execSync(command, { stdio: "inherit" });

    console.log("\n✅ All tests passed successfully!");
  } catch (error) {
    console.error("\n❌ Tests failed");
    throw error;
  }
}

async function runFileTests(filename: string, options: TestOptions = {}) {
  console.log(`🎯 Running tests for file: ${filename}...\n`);

  const args = ["test", filename, "--watch"];

  if (options.coverage) {
    args.push("--coverage");
  }

  if (options.verbose) {
    args.push("--verbose");
  }

  try {
    const command = `bun ${args.join(" ")}`;
    console.log(`📋 Command: ${command}\n`);
    console.log("💡 Press Ctrl+C to stop watching\n");

    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`❌ Tests failed for file: ${filename}`);
    throw error;
  }
}

// CLI interface
const command = process.argv[2];
const flags = process.argv.slice(3);

// Parse file argument for file command
const fileArg = flags.find((flag) => !flag.startsWith("--"));
const cleanFlags = flags.filter((flag) => flag.startsWith("--"));

const options: TestOptions = {
  coverage: cleanFlags.includes("--coverage") || cleanFlags.includes("--cov"),
  verbose: cleanFlags.includes("--verbose") || cleanFlags.includes("--v"),
  watch: cleanFlags.includes("--watch") || cleanFlags.includes("--w"),
};

switch (command) {
  case "coverage":
    await runTestsWithCoverage();
    break;

  case "file":
    if (!fileArg) {
      console.error("❌ Please specify a test file to run");
      console.log("Usage: bun test:file <filename>");
      process.exit(1);
    }
    await runFileTests(fileArg, {
      ...options,
      coverage: options.coverage ?? true,
    });
    break;

  default:
    console.log(`
🧪 js-lib-go Test Script

Usage: bun run test.ts <command> [flags]

Commands:
  coverage      Run all tests with coverage [default]
  file <name>   Run specific test file with watch

Flags:
  --coverage    Enable coverage reporting (default for most commands)
  --verbose     Enable verbose output
  --watch       Enable watch mode

Examples:
  bun run test.ts coverage            # Run tests with coverage
  bun run test.ts file sum.test.ts    # Test specific file
`);

    // Default to running tests with coverage
    if (!command) {
      await runTestsWithCoverage();
    }
    break;
}
