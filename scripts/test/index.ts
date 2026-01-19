#!/usr/bin/env bun

/**
 * 🧪 Test Script for @g8k/js-pkg-go Library
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
 *   file      - Run specific test file with watch
 *
 * @author Ramiro M
 * @version 0.0.1
 */

import { helpMessage } from "./help.ts";
import { runAllTests, runSingleFileTests } from "./utils.ts";
import type { ParsedArgs, TestCommand, TestOptions } from "./types.ts";

function parseCommandLineArgs(): ParsedArgs {
    const [, , command, ...flags] = process.argv;

    // Parse file argument for file command
    const fileArg = flags.find((flag) => !flag.startsWith("--"));
    const cleanFlags = flags.filter((flag) => flag.startsWith("--"));

    const options: TestOptions = {
        coverage:
            cleanFlags.includes("--coverage") || cleanFlags.includes("--cov"),
        verbose: cleanFlags.includes("--verbose") || cleanFlags.includes("--v"),
        watch: cleanFlags.includes("--watch") || cleanFlags.includes("--w"),
    };

    return {
        command: command as TestCommand,
        fileArg,
        options,
    };
}

// CLI interface
const { command, fileArg, options } = parseCommandLineArgs();

switch (command) {
    case "coverage":
        await runAllTests(options);
        break;

    case "file":
        if (!fileArg) {
            console.error("❌ Please specify a test file to run");
            console.log("Usage: bun run test:file <filename>");
            process.exit(1);
        }

        await runSingleFileTests(fileArg, options);
        break;

    case "help":
        console.log(helpMessage);
        break;

    default:
        console.log(helpMessage);

        if (!command) {
            await runAllTests(options);
        }
        break;
}
