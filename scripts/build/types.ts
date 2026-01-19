export interface BuildOptions {
    clean?: boolean;
    minify?: boolean;
    sourcemap?: boolean;
    watch?: boolean;
    pack?: boolean;
    target?: "browser" | "bun" | "node";
    format?: "esm" | "cjs" | "iife";
    types?: boolean;
}

export interface ParsedArgs {
    command: string | undefined;
    options: BuildOptions;
}

export type BuildMode = "local" | "development" | "production";
