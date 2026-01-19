#!/usr/bin/env bun

/**
 * 🏗️ Build Script for @g8k/js-pkg-go Library
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
 *   prod      - Build everything (bundle + types) [default]
 *   dev       - Build everything (bundle + types) for development (sourcemaps)
 *   local     - Build everything for local development (sourcemaps + tar file)
 *
 * @author Ramiro M
 * @version 0.0.1
 */

import { helpMessage } from "./help";
import type { BuildOptions, ParsedArgs } from "./types";
import { buildBundle } from "./utils";

function parseCommandLineArgs(): ParsedArgs {
    const [, , command, ...flags] = process.argv;

    const options: BuildOptions = Object.fromEntries(
        Object.entries({
            minify: flags.includes("--minify") ? true : undefined,
            sourcemap: flags.includes("--sourcemap") ? true : undefined,
            watch: flags.includes("--watch") ? true : undefined,
            pack: flags.includes("--pack") ? true : undefined,
            types: flags.includes("--types") ? true : undefined,
            target:
                (flags
                    .find((f) => f.startsWith("--target="))
                    ?.split("=")[1] as BuildOptions["target"]) || undefined,
            format:
                (flags
                    .find((f) => f.startsWith("--format="))
                    ?.split("=")[1] as BuildOptions["format"]) || undefined,
        }).filter(([_, value]) => value !== undefined),
    );

    return {
        command,
        options,
    };
}

// CLI interface
const { command, options } = parseCommandLineArgs();

switch (command) {
    case "local":
        await buildBundle("local", options);
        break;

    case "dev":
        await buildBundle("development", options);
        break;

    case "prod":
        await buildBundle("production", options);
        break;

    case "help":
        console.log(helpMessage);
        break;

    default:
        console.log(helpMessage);

        if (!command) {
            await buildBundle("local", options);
        }
        break;
}
