import { execSync } from "child_process";
import { TestExecutionError, type TestOptions } from "./types.ts";

export async function runAllTests(options: TestOptions = {}): Promise<void> {
    console.log("🧪 Running all tests with coverage...\n");

    const args = ["test"];

    if (options.coverage !== false) {
        args.push("--coverage");
    }

    try {
        const command = `bun ${args.join(" ")}`;
        console.log(`📋 Command: ${command}\n`);

        execSync(command, { stdio: "inherit" });

        console.log("\n✅ All tests passed successfully!");
    } catch (error) {
        console.error("\n❌ Tests failed");
        throw new TestExecutionError(
            "Test execution failed",
            `bun ${args.join(" ")}`,
        );
    }
}

export async function runSingleFileTests(
    filename: string,
    options: TestOptions = {},
): Promise<void> {
    console.log(`🎯 Running tests for file: ${filename}...\n`);

    const args = ["test", filename];

    // Always use watch mode for single file tests
    args.push("--watch");

    if (options.coverage !== false) {
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
        throw new TestExecutionError(
            `Test execution failed for ${filename}`,
            `bun ${args.join(" ")}`,
        );
    }
}
