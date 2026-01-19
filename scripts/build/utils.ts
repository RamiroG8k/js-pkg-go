import { execSync } from "child_process";
import { rmSync, existsSync } from "fs";
import type { BuildMode, BuildOptions } from "./types";
import type { BuildConfig } from "bun";

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

async function createPackageTarball() {
    console.log("📦 Creating package tarball...");

    try {
        execSync("bun pm pack", { stdio: "inherit" });
        console.log("✅ Package tarball created successfully");

        const pkg = await Bun.file("package.json").json();
        const tarballName = `${pkg.name}-${pkg.version}.tgz`;

        if (existsSync(tarballName)) {
            const stat = await Bun.file(tarballName).stat();
            const sizeKB = (stat.size / 1024).toFixed(2);
            console.log(`   📄 ${tarballName} (${sizeKB} KB)`);
        }

        return tarballName;
    } catch (error) {
        console.error("Failed to create package tarball");
        throw error;
    }
}

const LOCAL_BUILD_OPTIONS: BuildOptions = {
    minify: false,
    sourcemap: true,
    target: "bun",
    format: "esm",
    pack: true,
    types: true,
};

const DEVELOPMENT_BUILD_OPTIONS: BuildOptions = {
    minify: false,
    sourcemap: true,
    target: "bun",
    format: "esm",
    types: true,
};

const PRODUCTION_BUILD_OPTIONS: BuildOptions = {
    minify: true,
    sourcemap: false,
    target: "bun",
    format: "esm",
    types: false,
};

const OPTIONS = {
    local: LOCAL_BUILD_OPTIONS,
    development: DEVELOPMENT_BUILD_OPTIONS,
    production: PRODUCTION_BUILD_OPTIONS,
} as const;

async function buildBundle(
    mode: BuildMode = "local",
    newOptions?: BuildOptions,
) {
    const options = { ...OPTIONS[mode], ...newOptions };

    console.log("📦 Building bundle...");

    const { pack, types } = options;

    const buildConfig: BuildConfig = {
        entrypoints: ["./index.ts"],
        outdir: "./dist",
        target: options.target,
        format: options.format,
        minify: options.minify,
        splitting: false, // Not needed for a simple library
        sourcemap: options.sourcemap ? ("linked" as const) : ("none" as const),
        footer: "// built with love in GDL 🫀",
        define: {
            "process.env.NODE_ENV": JSON.stringify("production"),
        },
        packages: "bundle" as const,
        drop: options.minify ? ["console", "debugger"] : [], // Remove console.log and debugger in production
    };

    try {
        await cleanDist();

        if (types) {
            await buildTypes();
        }

        const result = await Bun.build(buildConfig);

        if (!result.success) {
            console.error("❌ Build failed with errors:");
            for (const message of result.logs) {
                console.error(message);
            }
            throw new Error("Build failed");
        }

        if (pack) {
            await createPackageTarball();
        }

        console.log("✅ Bundle built successfully");

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
        console.error("Failed to build bundle");
        throw error;
    }
}

export { cleanDist, buildTypes, buildBundle, createPackageTarball };
