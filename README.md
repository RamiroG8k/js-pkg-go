# js-lib-go

A simple JavaScript/TypeScript utility library for mathematical operations.

## Installation

Install the library using npm:

```bash
npm install js-lib-go
```

Or using yarn:

```bash
yarn add js-lib-go
```

Or using bun:

```bash
bun add js-lib-go
```

## Usage

### Import the library

#### ES6 Modules (recommended)

```javascript
import { sum } from 'js-lib-go';
```

#### TypeScript

```typescript
import { sum } from 'js-lib-go';
```

#### CommonJS

```javascript
const { sum } = require('js-lib-go');
```

### Examples

#### Basic Usage

```javascript
import { sum } from 'js-lib-go';

// Sum multiple numbers
const result = sum(1, 2, 3, 4, 5);
console.log(result); // Output: 15

// Sum with array spread
const numbers = [10, 20, 30];
const total = sum(...numbers);
console.log(total); // Output: 60

// Sum with no arguments
const empty = sum();
console.log(empty); // Output: 0
```

#### TypeScript Usage

```typescript
import { sum } from 'js-lib-go';

const calculate = (values: number[]): number => {
  return sum(...values);
};

const result = calculate([1, 2, 3]);
console.log(result); // Output: 6
```

## API Reference

### `sum(...args: number[]): number`

Calculates the sum of all provided numbers.

**Parameters:**
- `...args: number[]` - Variable number of numeric arguments to sum

**Returns:**
- `number` - The sum of all provided numbers. Returns 0 if no arguments are provided.

**Example:**
```javascript
sum(1, 2, 3); // Returns 6
sum(); // Returns 0
sum(10, -5, 3); // Returns 8
```

## Development

To install dependencies for development:

```bash
bun install
```

To run tests:

```bash
bun run test:all
```

To build the library:

```bash
bun run build:all
```

## License

MIT

## Author

Ramiro M

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.