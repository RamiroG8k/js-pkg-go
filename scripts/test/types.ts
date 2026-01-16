export interface TestOptions {
    coverage?: boolean;
    watch?: boolean;
    verbose?: boolean;
    file?: string;
}

export type TestCommand = "coverage" | "file" | "help" | undefined;

export interface ParsedArgs {
    command: TestCommand;
    fileArg?: string;
    options: TestOptions;
}

export class TestExecutionError extends Error {
    constructor(
        message: string,
        public readonly command?: string,
    ) {
        super(message);
        this.name = "TestExecutionError";
    }
}
