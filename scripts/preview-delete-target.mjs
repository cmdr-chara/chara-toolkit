#!/usr/bin/env node
/**
 * Read-only scoped deletion-target preview. Does not delete files or authorize
 * removal. Rejects ambiguous inputs, escapes, links, and volume boundaries.
 */
import { lstat, realpath, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, join, parse, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

function isWithin(parent, candidate) {
  const child = relative(parent, candidate);
  return child === "" || (child !== ".." && !child.startsWith(".." + sep) && !isAbsolute(child));
}

export function validateLiteralPath(value) {
  if (typeof value !== "string" || !value.trim() || value !== value.trim()) throw Error("missing or padded path");
  if (/[\0\r\n*?\[\]{}]/.test(value) || /(^|[\\/])\.\.(?=[\\/]|$)/.test(value))
    throw Error("wildcard, control character, or parent traversal is forbidden");
  if (/(?:^|[\\/])(?:~|\$\{?[\w]+|%[\w]+%)(?=[\\/]|$)/.test(value))
    throw Error("unexpanded environment or home alias is forbidden");
  if (/^[a-z]:$/i.test(value) || /^[a-z]:[\\/]?$/i.test(value) || /^[\\/]+$/.test(value)
    || /^\\\\[?.]\\/.test(value) || /^\\\\[^\\]+\\[^\\]+[\\/]?$/i.test(value))
    throw Error("volume, network-share, or filesystem root is forbidden");
  if (/^[a-z]:[^\\/]/i.test(value)) throw Error("ambiguous drive-relative Windows path");
  if (/^[\\/](?:home|users|mnt|media|volumes|c|d)(?:[\\/][^\\/]+)?[\\/]?$/i.test(value))
    throw Error("broad home, drive mount, or volume path is forbidden");
  if (value === "." || value === "./" || value === ".\\") throw Error("workspace-root alias is forbidden");
  return value;
}

export async function previewDeleteTarget(workspaceInput, targetInput) {
  validateLiteralPath(workspaceInput);
  validateLiteralPath(targetInput);
  const workspace = await realpath(resolve(workspaceInput));
  const workspaceStat = await stat(workspace);
  if (!workspaceStat.isDirectory()) throw Error("workspace must be a directory");
  const home = await realpath(homedir()).catch(() => resolve(homedir()));
  const root = parse(workspace).root;
  if (workspace === root || isWithin(workspace, home))
    throw Error("workspace may not be filesystem root or a parent of the home directory");
  if (isAbsolute(targetInput) || /^[a-z]:/i.test(targetInput))
    throw Error("target must be workspace-relative, never an absolute or drive path");
  const target = resolve(workspace, targetInput);
  if (!isWithin(workspace, target) || target === workspace)
    throw Error("target must be a descendant of the workspace, not the workspace itself");
  const canonical = await realpath(target);
  if (!isWithin(workspace, canonical) || canonical === workspace)
    throw Error("resolved target escapes the workspace");
  const parts = relative(workspace, target).split(sep);
  let cursor = workspace;
  for (const part of parts) {
    cursor = join(cursor, part);
    const info = await lstat(cursor);
    if (info.isSymbolicLink()) throw Error("symlink or junction in target path");
    const physical = await stat(cursor);
    if (physical.dev !== workspaceStat.dev) throw Error("target crosses a filesystem/mount boundary");
    if ([".git", ".codex", ".claude", ".agents", "backups"].includes(part.toLowerCase()))
      throw Error("protected repository metadata or backup directory");
  }
  const current = await lstat(target);
  return {
    status: "PREVIEW_ONLY",
    workspace,
    target: canonical,
    relative: relative(workspace, canonical),
    kind: current.isDirectory() ? "directory" : current.isFile() ? "file" : "other",
    note: "No files changed. Revalidate immediately before any approved deletion; this is not a sandbox or authorization.",
  };
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length !== 4 || argv[0] !== "--workspace" || argv[2] !== "--target")
    throw Error("Usage: node scripts/preview-delete-target.mjs --workspace <repo> --target <literal-path>");
  console.log(JSON.stringify(await previewDeleteTarget(argv[1], argv[3]), null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write("Delete-target preview refused: " + error.message + "\n");
    process.exitCode = 2;
  });
}
