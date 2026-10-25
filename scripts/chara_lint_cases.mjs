// Fixture cases for the chara-lint Oxlint plugin. Each case lists the exact
// source text of every expected diagnostic span; an empty list means "allow".

export default [
  // no-double-assertion
  { rule: "no-double-assertion", code: "const order = rawPayload as unknown as Order;", report: ["rawPayload as unknown as Order"] },
  { rule: "no-double-assertion", code: "const port = (<unknown>(settings.port)) as number;", report: ["(<unknown>(settings.port)) as number"] },
  { rule: "no-double-assertion", code: "const id = ((token as unknown) as string) as UserId;", report: ["((token as unknown) as string) as UserId"] },
  { rule: "no-double-assertion", code: 'const modes = (["r", "w"] as const) as readonly string[];', report: ['(["r", "w"] as const) as readonly string[]'] },
  { rule: "no-double-assertion", code: "const nested = (value as unknown)! as Target;", report: ["(value as unknown)! as Target"] },
  { rule: "no-double-assertion", code: "const retries = config.retries as number;", report: [] },
  { rule: "no-double-assertion", code: 'const palette = (["red", "teal"] as const) as const;', report: [] },
  { rule: "no-double-assertion", code: "const user = normalize(input as RawUser) as User;", report: [] },

  // no-empty-object-fallback-spread
  { rule: "no-empty-object-fallback-spread", code: "const request = { url, ...(timeoutMs ? { timeoutMs } : {}) };", report: ["...(timeoutMs ? { timeoutMs } : {})"] },
  { rule: "no-empty-object-fallback-spread", code: "const headers = { ...(anonymous ? {} : { authorization: token }) };", report: ["...(anonymous ? {} : { authorization: token })"] },
  { rule: "no-empty-object-fallback-spread", code: "const o = { ...(flag ? { a: 1 } : ({} as Partial<X>)) };", report: ["...(flag ? { a: 1 } : ({} as Partial<X>))"] },
  { rule: "no-empty-object-fallback-spread", code: 'const flags = [...(verbose ? ["-v"] : [])];', report: [] },
  { rule: "no-empty-object-fallback-spread", code: 'const query = { ...(filter ? { filter } : { filter: "all" }) };', report: [] },
  { rule: "no-empty-object-fallback-spread", code: 'const opts = { ...(debug && { level: "trace" }) };', report: [] },
  { rule: "no-empty-object-fallback-spread", code: "const plain = { ...{} };", report: [] },

  // no-widening-known-values
  { rule: "no-widening-known-values", code: "const origin: { lat: number; lng: number } = { lat: 52.5, lng: 13.4 };", report: ["{ lat: 52.5, lng: 13.4 }"] },
  { rule: "no-widening-known-values", code: "const limits: Record<string, number> = { cpu: 2, memoryGb: 4 };", report: ["{ cpu: 2, memoryGb: 4 }"] },
  { rule: "no-widening-known-values", code: "function makeHandler(): unknown {\n  return (event: Event) => event.type;\n}", report: ["(event: Event) => event.type"] },
  { rule: "no-widening-known-values", code: 'const base = { theme: "dark" };\nconst copy = base;\nconst forwarded = copy as object;', report: ["copy"] },
  { rule: "no-widening-known-values", code: "const totals: Record<string, number> = {};", report: [] },
  { rule: "no-widening-known-values", code: "const placeholder: unknown = {};", report: ["{}"] },
  { rule: "no-widening-known-values", code: "interface Point { x: number; y: number }\nconst p: Point = { x: 1, y: 2 };\nconst q = { x: 3, y: 4 } satisfies Point;", report: [] },
  { rule: "no-widening-known-values", code: "const parsed: unknown = JSON.parse(text);", report: [] },
  { rule: "no-widening-known-values", code: "type Bag = { [key: string]: string };\nlet bag: Bag;\nbag = { a: \"x\" };", report: ['{ a: "x" }'] },
  { rule: "no-widening-known-values", code: "type Record<K, V> = Map<K, V>;\nconst m: Record<string, unknown> = { a: 1 };", report: [] },
  { rule: "no-widening-known-values", code: "class Settings { values: object = [1, 2]; }", report: ["[1, 2]"] },

  // no-module-registry-mocks
  { rule: "no-module-registry-mocks", code: 'vi.mock("../billing/stripe-client");', report: ['vi.mock("../billing/stripe-client")'] },
  { rule: "no-module-registry-mocks", code: 'import { vi as t } from "vitest";\nt["doMock"]("./clock");', report: ['t["doMock"]("./clock")'] },
  { rule: "no-module-registry-mocks", code: 'import { jest } from "@jest/globals";\njest.unstable_mockModule("node:fs", () => ({ readFileSync: () => "" }));', report: ['jest.unstable_mockModule("node:fs", () => ({ readFileSync: () => "" }))'] },
  { rule: "no-module-registry-mocks", code: 'const spy = vi.spyOn(mailer, "send");', report: [] },
  { rule: "no-module-registry-mocks", code: 'const vi = createVirtualInbox();\nvi.mock("draft");', report: [] },
  { rule: "no-module-registry-mocks", code: 'import { jest } from "./my-test-helpers";\njest.mock("./db");', report: [] },
  { rule: "no-module-registry-mocks", code: 'vi[method]("./db");', report: [] },

  // no-bare-object-params
  { rule: "no-bare-object-params", code: "function logEntity(entity: object): void {}", report: ["object"] },
  { rule: "no-bare-object-params", code: "const describe = (target: object | undefined) => String(target);", report: ["object | undefined"] },
  { rule: "no-bare-object-params", code: "type Anything = object;\ntype Payload = Anything;\ninterface Bus { publish(topic: string, payload: Payload): void }", report: ["Payload"] },
  { rule: "no-bare-object-params", code: "class Cache { constructor(private readonly backing: object) {} }", report: ["object"] },
  { rule: "no-bare-object-params", code: "type Item = object;\nfunction first<Item>(items: Item[], fallback: Item): Item { return items[0] ?? fallback; }", report: [] },
  { rule: "no-bare-object-params", code: "function render(props: Readonly<object>, extras: {}): void {}", report: [] },

  // no-reflective-apply / no-reflective-get
  { rule: "no-reflective-apply", code: "const result = Reflect.apply(handler, ctx, [req, res]);", report: ["Reflect.apply(handler, ctx, [req, res])"] },
  { rule: "no-reflective-apply", code: 'Reflect["apply"](Math.max, undefined, samples);', report: ['Reflect["apply"](Math.max, undefined, samples)'] },
  { rule: "no-reflective-apply", code: "globalThis.Reflect.apply(fn, null, []);", report: ["globalThis.Reflect.apply(fn, null, [])"] },
  { rule: "no-reflective-apply", code: "const result2 = handler.call(ctx, req, res);\nconst ref = Reflect.apply;", report: [] },
  { rule: "no-reflective-apply", code: 'import { Reflect } from "./meta-runtime";\nReflect.apply(task, null, []);', report: [] },
  { rule: "no-reflective-get", code: "const value = Reflect.get(settings, key);", report: ["Reflect.get(settings, key)"] },
  { rule: "no-reflective-get", code: 'const port = Reflect["get"](env, "PORT", proxyReceiver);', report: ['Reflect["get"](env, "PORT", proxyReceiver)'] },
  { rule: "no-reflective-get", code: "const cached = registry.get(key);\nif (Reflect.has(settings, key)) touch(key);", report: [] },
  { rule: "no-reflective-get", code: 'function probe(Reflect: { get(k: string): string }) { return Reflect.get("x"); }', report: [] },

  // no-typeof-checks
  { rule: "no-typeof-checks", code: 'if (typeof payload.amount === "number") charge(payload.amount);', report: ["typeof payload.amount"] },
  { rule: "no-typeof-checks", code: "log(typeof incoming);", report: ["typeof incoming"] },
  { rule: "no-typeof-checks", code: "const defaults = { retries: 3 };\ntype Defaults = typeof defaults;", report: [] },
  { rule: "no-typeof-checks", code: 'function isLabel(value: unknown): value is string { return typeof value === "string"; }', report: ["typeof value"] },
  { rule: "no-typeof-checks", options: { allowTypeGuards: true }, code: 'function isLabel(value: unknown): value is string { return typeof value === "string"; }', report: [] },
  {
    rule: "no-typeof-checks",
    options: { allowTypeGuards: true },
    code: 'function assertCount(v: unknown): asserts v is number {\n  if (typeof v !== "number") throw new TypeError("count");\n}',
    report: [],
  },
  {
    rule: "no-typeof-checks",
    options: { allowTypeGuards: true },
    code: 'function isTagList(v: unknown): v is string[] {\n  return Array.isArray(v) && v.every((t) => typeof t === "string");\n}',
    report: ["typeof t"],
  },
  { rule: "no-typeof-checks", options: { allowTypeGuards: true }, code: 'class Guards { isId(v: unknown): v is string { return typeof v === "string"; } }', report: [] },
  { rule: "no-typeof-checks", code: 'const browser = typeof window !== "undefined";', report: ["typeof window"] },
  { rule: "no-typeof-checks", options: { allowEnvironmentChecks: true }, code: 'const browser = typeof window !== "undefined";', report: [] },
  { rule: "no-typeof-checks", options: { allowEnvironmentChecks: true }, code: 'function f(window: unknown) { return typeof window !== "undefined"; }', report: ["typeof window"] },

  // no-banned-identifier-terms
  { rule: "no-banned-identifier-terms", code: "interface UserShape { id: string }\nlet current: UserShape;", report: ["UserShape", "UserShape"] },
  { rule: "no-banned-identifier-terms", code: "class Canvas { #SHAPECount = 0 }", report: ["#SHAPECount"] },
  { rule: "no-banned-identifier-terms", file: "icon.tsx", code: 'const icon = <ShapeBadge size="sm" />;', report: ["ShapeBadge"] },
  { rule: "no-banned-identifier-terms", code: 'const label = "Choose a shape";\ntype Outline = { points: Array<[number, number]> };\nconst shap_e = 1;', report: [] },
  { rule: "no-banned-identifier-terms", code: 'import { shape } from "./geometry";', report: ["shape"] },
  { rule: "no-banned-identifier-terms", options: { terms: ["data"] }, code: "const userData = 1;\nconst shapeless = 2;", report: ["userData"] },
  { rule: "no-banned-identifier-terms", options: { ignoreForeignMembers: true }, code: "const keys = schema.shape;\nconst myShape = 1;", report: ["myShape"] },

  // no-unknown-inputs
  { rule: "no-unknown-inputs", code: "export function ingestReading(raw: unknown): Reading { return decode(raw); }", report: ["unknown"] },
  { rule: "no-unknown-inputs", code: "const greet = (who: unknown | Person) => `hi ${String(who)}`;", report: ["unknown | Person"] },
  { rule: "no-unknown-inputs", code: "interface Sink { write(chunk: string | (unknown | Uint8Array)): void }", report: ["string | (unknown | Uint8Array)"] },
  { rule: "no-unknown-inputs", code: "function apply({ op }: unknown): void {}", report: ["unknown"] },
  { rule: "no-unknown-inputs", code: "type Handler = (event: unknown) => void;", report: ["unknown"] },
  { rule: "no-unknown-inputs", code: "class FetchFailed extends Error {\n  constructor(message: string, readonly cause?: unknown) { super(message); }\n}", report: [] },
  { rule: "no-unknown-inputs", code: "try { run(); } catch (err: unknown) { report(err); }\nfunction collect(items: unknown[]): number { return items.length; }", report: [] },

  // no-unknown-results
  { rule: "no-unknown-results", code: "async function loadProfile(id: string): Promise<unknown> { return fetchJson(id); }", report: ["Promise<unknown>"] },
  { rule: "no-unknown-results", code: "type Opaque = unknown;\ntype Wire = Opaque | string;\nconst readWire = (): Wire => socket.read();", report: ["Wire"] },
  { rule: "no-unknown-results", code: "type Loader = () => PromiseLike<unknown>;\ninterface Store { snapshot(): unknown }", report: ["PromiseLike<unknown>", "unknown"] },
  { rule: "no-unknown-results", code: "type Output = unknown;\nfunction identity<Output>(value: Output): Output { return value; }", report: [] },
  { rule: "no-unknown-results", code: "function entries(): Array<unknown> { return []; }\nconst parse = (text: string) => JSON.parse(text);", report: [] },

  // no-unknown-aliases
  { rule: "no-unknown-aliases", code: "type ExternalBlob = unknown;", report: ["ExternalBlob"] },
  { rule: "no-unknown-aliases", code: "type Body = unknown;\ntype Envelope = Body | null;", report: ["Body", "Envelope"] },
  { rule: "no-unknown-aliases", code: "namespace Webhook {\n  type Raw = unknown;\n  export type Incoming = Raw;\n}", report: ["Raw", "Incoming"] },
  { rule: "no-unknown-aliases", code: "function handle() {\n  type Untrusted = unknown;\n  type Input = (Untrusted);\n  return null as Input | null;\n}", report: ["Untrusted", "Input"] },
  { rule: "no-unknown-aliases", code: "type Raw = unknown;\nnamespace Codec {\n  type Raw = Uint8Array;\n  type Frame = Raw;\n}", report: ["Raw"] },
  { rule: "no-unknown-aliases", code: "{ type Hidden = unknown; }\n{ type View = Hidden; }", report: ["Hidden"] },
  { rule: "no-unknown-aliases", code: "type Response = Promise<unknown>;\ntype Bag<T> = Box<T>;", report: [] },
  { rule: "no-unknown-aliases", code: "type Slot<T> = unknown;", report: ["Slot"] },
  { rule: "no-unknown-aliases", code: "type Raw = unknown;\ntype Wrap<Raw> = Raw;", report: ["Raw"] },

  // no-loose-dictionary-values
  { rule: "no-loose-dictionary-values", code: "let attributes: Record<string, unknown>;", report: ["Record<string, unknown>"] },
  { rule: "no-loose-dictionary-values", code: "interface Headers { [name: string]: string | any }", report: ["[name: string]: string | any"] },
  { rule: "no-loose-dictionary-values", code: "interface Marker {}\ntype Registry = { [key: string]: Marker };", report: ["{ [key: string]: Marker }"] },
  { rule: "no-loose-dictionary-values", code: "type Metadata = Readonly<Record<string, object>>;\nfunction tag(meta: Metadata): void {}", report: ["Readonly<Record<string, object>>"] },
  { rule: "no-loose-dictionary-values", code: "type Table<V> = { [row: string]: V };\nconst loose: Table<unknown> = {};", report: ["Table<unknown>"] },
  { rule: "no-loose-dictionary-values", code: "type Bag<V = unknown> = Record<string, V>;\nlet bag: Bag;", report: ["Bag"] },
  { rule: "no-loose-dictionary-values", code: "type Prices = Record<string, number>;\nconst byId: { [id: string]: Order } = {};", report: [] },
  { rule: "no-loose-dictionary-values", code: "type Envelope = { kind: string; data: unknown };\nconst memo = new Map<string, unknown>();", report: [] },
  { rule: "no-loose-dictionary-values", code: 'type Fixed = Record<"a" | "b", unknown>;\ntype Mirror<T> = { [K in keyof T]: unknown };', report: [] },
  { rule: "no-loose-dictionary-values", code: "type Record<K, V> = Map<K, V>;\nlet r: Record<string, unknown>;", report: [] },

  // no-erase-then-assert
  { rule: "no-erase-then-assert", code: "function route(req: Request) {\n  const anyBody: unknown = { path: req.url };\n  return anyBody as { path: string };\n}", report: ["anyBody as { path: string }"] },
  { rule: "no-erase-then-assert", code: "function relay(evt: KeyboardEvent) {\n  const erased: object = evt;\n  forward(erased as KeyboardEvent);\n}", report: ["erased as KeyboardEvent"] },
  { rule: "no-erase-then-assert", code: 'const env = { HOME: "/root" } as Record<string, unknown>;\nconst typedEnv = env as { HOME: string };', report: ["env as { HOME: string }"] },
  { rule: "no-erase-then-assert", code: "const items: object = [1, 2, 3];\nconst nums = items as number[];", report: ["items as number[]"] },
  { rule: "no-erase-then-assert", code: "const decoded: unknown = JSON.parse(raw);\nconst cfg = decoded as Config;", report: [] },
  { rule: "no-erase-then-assert", code: "const shared: unknown = { retries: 2 };\nfunction read() { return shared as { retries: number }; }", report: [] },
  { rule: "no-erase-then-assert", code: "function wrap(u: User) {\n  const o: object = u;\n  return o as Account;\n}", report: [] },
  { rule: "no-erase-then-assert", code: "let loose: unknown = { a: 1 };\nconst back = loose as { a: number };", report: [] },

  // require-assertion-justification
  { rule: "require-assertion-justification", code: "const level = rawLevel as LogLevel;", report: ["rawLevel as LogLevel"] },
  { rule: "require-assertion-justification", code: "// SAFETY:\nconst level = rawLevel as LogLevel;", report: ["rawLevel as LogLevel"] },
  { rule: "require-assertion-justification", code: "const level = rawLevel as LogLevel; // SAFETY: validated by parseLevel above", report: ["rawLevel as LogLevel"] },
  { rule: "require-assertion-justification", code: "// UNSAFETY: nope\nconst a = b as C;\n// safety: lower case\nconst d = e as F;", report: ["b as C", "e as F"] },
  { rule: "require-assertion-justification", code: "// SAFETY: parseLevel() rejected every value outside the LogLevel union\nconst level = rawLevel as LogLevel;", report: [] },
  { rule: "require-assertion-justification", code: "emit(/* SAFETY: ids come from the id allocator */ next as SessionId);", report: [] },
  { rule: "require-assertion-justification", code: "/* SAFETY:\n   width was clamped to 0..255 two lines up */\nconst byte = <Uint8>width;", report: [] },
  { rule: "require-assertion-justification", code: "// NOTE-SAFETY: width was clamped above\nconst x = y as Z;", report: [] },
  { rule: "require-assertion-justification", code: '// NOTE-SAFETY: checked above\nconst verbs = ["GET", "PUT"] as const;\nconst x = y as Z;', report: ["y as Z"] },
  { rule: "require-assertion-justification", code: "// SAFETY: covers the whole function\nfunction outer() {\n  return input as Parsed;\n}", report: ["input as Parsed"] },
  { rule: "require-assertion-justification", file: "plain.js", code: "const n = Number(text);", report: [] },
];
