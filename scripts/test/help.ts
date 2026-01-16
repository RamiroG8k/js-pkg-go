export const helpMessage = `
🧪 Test Script

Usage: npm run test:<command> [flags]

Commands:
  coverage      Run all tests with coverage [default]
  file <name>   Run specific test file with watch

Flags:
  --coverage    Enable coverage reporting (default for most commands)
  --verbose     Enable verbose output
  --watch       Enable watch mode

Examples:
  npm run test:coverage             # Run tests with coverage
  npm run test:file sum.test.ts     # Test specific file
`;
