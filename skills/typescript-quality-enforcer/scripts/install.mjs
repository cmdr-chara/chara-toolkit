#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(skillRoot, "assets/anti-slop");
const [targetArgument] = process.argv.slice(2);
const target = resolve(process.cwd(), targetArgument ?? "tools/oxlint/anti-slop");

if (existsSync(target)) {
  console.error(`Refusing to overwrite existing destination: ${target}`);
  console.error("Compare the existing plugin and use an explicitly reviewed migration instead.");
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });
cpSync(source, target, { recursive: true, force: false, errorOnExist: true });
console.log(`Copied the vendored anti-slop runtime to ${target}`);
console.log(`Preserved upstream license at ${target}/LICENSE`);
