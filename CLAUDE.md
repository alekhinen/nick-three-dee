# Code style

- No single-line `if` statements. Always use braces and put the body on its own line.
- No inline `return` (or any other action) on the same line as an `if`. Brace it.

## Examples

Wrong:

```ts
if (!handle) return;
if (bl) bl.rotation.x += delta;
```

Right:

```ts
if (!handle) {
  return;
}
if (bl) {
  bl.rotation.x += delta;
}
```
