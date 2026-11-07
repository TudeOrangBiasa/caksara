// Shim tipe runtime-test Bun untuk `tsc --noEmit` (apps/web).
// WHY: test dijalankan via `bun test`, tapi tsc tak mengenal modul "bun:test"
// dan `import.meta.dir`. Shim ini HANYA tipe (declare module, nol runtime)
// agar `bun run check-types` mencakup web tanpa @types/bun / allowImportingTsExtensions.
// Matcher di bawah adalah subset Bun yang dipakai repo ini; tambah bila test baru
// memakai matcher lain (tsc akan menunjukkannya).
declare module "bun:test" {
  export interface BunTestMatchers {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toStrictEqual(expected: unknown): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toContain(item: unknown): void;
    toContainEqual(item: unknown): void;
    toHaveLength(length: number): void;
    toHaveProperty(key: string, value?: unknown): void;
    toBeGreaterThan(n: number): void;
    toBeGreaterThanOrEqual(n: number): void;
    toBeLessThan(n: number): void;
    toBeLessThanOrEqual(n: number): void;
    toThrow(expected?: unknown): void;
    toMatch(pattern: RegExp | string): void;
    toMatchObject(obj: object): void;
    not: BunTestMatchers;
  }
  export function expect(actual: unknown): BunTestMatchers;
  export function describe(name: string, fn: () => void): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function mock<T extends (...args: never[]) => unknown>(fn?: T): T & { calls: unknown[][] };
  export namespace mock {
    function module(path: string, factory: () => Record<string, unknown>): void;
  }
}

interface ImportMeta {
  /** Bun-specific: direktori file saat ini (dipakai test baca fixture via fs). */
  readonly dir: string;
}
