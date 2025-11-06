#!/usr/bin/env bun

/**
 * 📦 Publish Script for @g8k/js-pkg-go Library
 *
 * This script handles all publishing and versioning responsibilities including:
 * - Version management (patch, minor, major)
 * - Package tarball creation
 * - Publishing to npm registry
 * - Pre-publish validation
 *
 * Usage:
 *   bun run publish.ts [command] [flags]
 *
 * Commands:
 *   patch         - Build, validate, bump patch version and publish
 *   minor         - Build, validate, bump minor version and publish
 *   major         - Build, validate, bump major version and publish
 *   info          - Show package information
 *
 * @author Ramiro M
 * @version 0.0.1
 */

import { execSync } from "child_process";
import { existsSync } from "fs";

interface PublishOptions {
    dryRun?: boolean;
    tag?: string;
    access?: "public" | "restricted";
    registry?: string;
}

const DEFAULT_OPTIONS: PublishOptions = {
    dryRun: false,
    tag: "latest",
    access: "public",
};

async function validatePackage() {
    console.log("🔍 Validating package...\n");

    // Check if dist directory exists
    if (!existsSync("dist")) {
        console.error("❌ dist directory not found. Please run build first.");
        throw new Error("Build required before publishing");
    }

    // Check if required files exist
    const requiredFiles = [
        "dist/index.js",
        "dist/index.d.ts",
        "package.json",
        "README.md",
    ];

    for (const file of requiredFiles) {
        if (!existsSync(file)) {
            console.error(`❌ Required file missing: ${file}`);
            throw new Error(`Missing required file: ${file}`);
        }
    }

    // Validate package.json
    try {
        const pkg = await Bun.file("package.json").json();

        if (!pkg.name) {
            throw new Error("package.json missing 'name' field");
        }

        if (!pkg.version) {
            throw new Error("package.json missing 'version' field");
        }

        if (!pkg.main && !pkg.module && !pkg.exports) {
            throw new Error(
                "package.json missing entry point (main/module/exports)",
            );
        }

        console.log(`✅ Package validation passed`);
        console.log(`   📦 ${pkg.name}@${pkg.version}`);
        console.log(`   📄 ${pkg.description || "No description"}`);
    } catch (error) {
        console.error("❌ Invalid package.json");
        throw error;
    }
}

async function updateVersion(type: "patch" | "minor" | "major") {
    console.log(`📈 Updating version (${type})...\n`);

    try {
        // Get current version first
        const pkg = await Bun.file("package.json").json();
        const oldVersion = pkg.version;

        execSync(`npm version ${type} --no-git-tag-version`, {
            stdio: "inherit",
        });

        // Read new version
        const newPkg = await Bun.file("package.json").json();
        const newVersion = newPkg.version;

        console.log(`✅ Version updated: ${oldVersion} → ${newVersion}`);
        return newVersion;
    } catch (error) {
        console.error("❌ Failed to update version");
        throw error;
    }
}

async function createPackageTarball() {
    console.log("📦 Creating package tarball...\n");

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

async function buildForProduction() {
    console.log("🏗️  Building for production...\n");

    try {
        execSync("bun run build.ts prod", { stdio: "inherit" });
        console.log("✅ Production build completed");
    } catch (error) {
        console.error("❌ Production build failed");
        throw error;
    }
}

async function publishToNpm(options: PublishOptions = {}) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    console.log("🚀 Publishing to npm...\n");

    const args = ["publish"];

    if (mergedOptions.dryRun) {
        args.push("--dry-run");
    }

    if (mergedOptions.tag && mergedOptions.tag !== "latest") {
        args.push("--tag", mergedOptions.tag);
    }

    if (mergedOptions.access) {
        args.push("--access", mergedOptions.access);
    }

    if (mergedOptions.registry) {
        args.push("--registry", mergedOptions.registry);
    }

    try {
        const command = `bun ${args.join(" ")}`;
        console.log(`📋 Command: ${command}\n`);

        if (mergedOptions.dryRun) {
            console.log("🧪 DRY RUN - Not actually publishing");
        }

        execSync(command, { stdio: "inherit" });

        if (!mergedOptions.dryRun) {
            console.log("\n✅ Published to npm successfully!");

            // Show npm package link
            const pkg = await Bun.file("package.json").json();
            console.log(
                `🌍 View on npm: https://www.npmjs.com/package/${pkg.name}`,
            );
        } else {
            console.log("\n✅ Dry run completed successfully!");
        }
    } catch (error) {
        console.error("\n❌ Failed to publish to npm");
        throw error;
    }
}

async function publishWithVersionBump(
    versionType: "patch" | "minor" | "major",
    options: PublishOptions = {},
) {
    console.log(`🚀 Full ${versionType} release workflow...\n`);

    // Step 1: Build for production
    await buildForProduction();

    // Step 2: Validate package
    await validatePackage();

    // Step 3: Update version
    const newVersion = await updateVersion(versionType);

    // Step 4: Publish to npm
    await publishToNpm(options);

    console.log(`\n🎉 Successfully released v${newVersion}!`);
}

async function checkNpmAuth() {
    console.log("🔐 Checking npm authentication...\n");

    try {
        execSync("npm whoami", { stdio: "pipe" });
        const result = execSync("npm whoami", { encoding: "utf-8" }).trim();
        console.log(`✅ Authenticated as: ${result}`);
        return true;
    } catch (error) {
        console.error("❌ Not authenticated with npm");
        console.log("💡 Run 'npm login' to authenticate");
        return false;
    }
}

async function showPackageInfo() {
    console.log("📋 Package Information\n");

    try {
        const pkg = await Bun.file("package.json").json();

        console.log(`Name:        ${pkg.name}`);
        console.log(`Version:     ${pkg.version}`);
        console.log(`Description: ${pkg.description || "N/A"}`);
        console.log(`Author:      ${pkg.author || "N/A"}`);
        console.log(`License:     ${pkg.license || "N/A"}`);
        console.log(`Repository:  ${pkg.repository?.url || "N/A"}`);

        if (pkg.keywords && pkg.keywords.length > 0) {
            console.log(`Keywords:    ${pkg.keywords.join(", ")}`);
        }

        // Check if package exists on npm
        try {
            const npmInfo = execSync(`npm view ${pkg.name} --json`, {
                encoding: "utf-8",
                stdio: "pipe",
            });
            const npmData = JSON.parse(npmInfo);
            console.log(`\n🌍 NPM Status:`);
            console.log(`   Latest:    ${npmData.version}`);
            console.log(
                `   Published: ${new Date(npmData.time[npmData.version]).toLocaleDateString()}`,
            );
        } catch {
            console.log(`\n🌍 NPM Status: Not published yet`);
        }
    } catch (error) {
        console.error("❌ Failed to read package information");
        throw error;
    }
}

// CLI interface
const command = process.argv[2];
const flags = process.argv.slice(3);

const options: PublishOptions = {
    dryRun: flags.includes("--dry-run") || flags.includes("--dry"),
    tag: flags.find((f) => f.startsWith("--tag="))?.split("=")[1],
    access: flags.includes("--public")
        ? "public"
        : flags.includes("--restricted")
          ? "restricted"
          : undefined,
    registry: flags.find((f) => f.startsWith("--registry="))?.split("=")[1],
};

switch (command) {
    case "patch":
        await publishWithVersionBump("patch", options);
        break;

    case "minor":
        await publishWithVersionBump("minor", options);
        break;

    case "major":
        await publishWithVersionBump("major", options);
        break;

    case "info":
        await showPackageInfo();
        break;

    default:
        console.log(`
📦 Publish Script

Usage: bun run publish.ts <command> [flags]

Commands:
  patch         Build, validate, bump patch version and publish
  minor         Build, validate, bump minor version and publish
  major         Build, validate, bump major version and publish
  info          Show package information

Flags:
  --dry-run     Simulate publishing without actually doing it
  --tag=<name>  Publish with specific npm tag (default: latest)
  --public      Set access to public
  --restricted  Set access to restricted
  --registry=<url>  Use custom registry

Examples:
  bun run publish.ts patch            # Full patch release workflow
  bun run publish.ts minor            # Full minor release workflow
  bun run publish.ts major --dry-run  # Test major release
  bun run publish.ts info             # Show package info
`);

        // Default to showing package info
        if (!command) {
            await showPackageInfo();
        }
        break;
}
