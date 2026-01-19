export const helpMessage = `
🏗️  Build Script

Usage: npm run build:<command> [flags]

Commands:
    local         Build everything for local development (sourcemaps + tar file)
    dev           Development build (unminified, with sourcemaps)
    prod          Production build (minified, no sourcemaps) [default]

Flags:
    --pack        Create package tarball after build
    --minify      Enable minification
    --sourcemap   Generate source maps
    --target=<t>  Build target (browser|bun|node) [default: bun]
    --format=<f>  Output format (esm|cjs|iife) [default: esm]

Examples:
    npm run build.ts                     # Build everything
    npm run build.ts local --minify      # Build minified bundle
    npm run build.ts dev                 # Development build
    npm run build.ts prod --pack         # Production build + tarball
`;
