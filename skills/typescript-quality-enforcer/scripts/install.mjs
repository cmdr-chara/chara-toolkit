#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(skillRoot, "assets/chara-lint");
const [targetArgument] = process.argv.slice(2);
const target = resolve(process.cwd(), targetArgument ?? "tools/oxlint/chara-lint");

if (existsSync(target)) {
  console.error(`Refusing to overwrite existing destination: ${target}`);
  console.error("Compare the existing plugin and use an explicitly reviewed migration instead.");
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });
cpSync(source, target, { recursive: true, force: false, errorOnExist: true });
const entry = `./${relative(process.cwd(), resolve(target, "index.mjs")).replaceAll("\\", "/")}`;
console.log(`Copied chara-lint to ${target}`);
console.log(`Add it to .oxlintrc.json: "jsPlugins": ["${entry}"], then enable approved rules as "chara-lint/<rule>".`);
