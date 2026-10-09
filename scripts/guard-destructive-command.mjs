#!/usr/bin/env node
/**
 * Read-only, fail-closed Claude Code PreToolUse filter for obvious destructive
 * shell commands. Never executes or rewrites the proposed command.
 *
 * This lexical guard is not a sandbox: commands can hide destructive behavior
 * behind scripts, aliases, other tools, or encodings. Use OS isolation first.
 */
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const patterns = [
  { name: "filesystem deletion", pattern: /(?:^|[\s;&|()'"\n])(?:sudo\s+)?(?:rm|rmdir|rd|del|erase|remove-item|rimraf|unlink)(?:\.exe)?(?=$|[\s;&|()'"\n])/i },
  { name: "destructive Git state change", pattern: /\bgit\s+(?:(?:-C\s+\S+\s+)?(?:clean|restore|reset|worktree\s+(?:prune|remove)|stash\s+(?:clear|drop)))(?=$|[\s;&|()'"\n])/i },
  { name: "recursive permission mutation", pattern: /\b(?:chmod|chown|chgrp)\s+[-\w]*R\b/i },
  { name: "find -delete", pattern: /\bfind\b[^\n]*\s-delete\b/i },
  { name: "synchronization deletion", pattern: /\b(?:rsync\b[^\n]*--delete\b|robocopy\b[^\n]*\/(?:MIR|PURGE)\b)/i },
  { name: "disk erase or format", pattern: /\b(?:mkfs(?:\.\w+)?|wipefs|diskpart|format-volume|clear-disk|remove-partition|diskutil\s+(?:eraseDisk|eraseVolume)|shred)\b/i },
  { name: "scripted recursive deletion", pattern: /\b(?:shutil\.rmtree|os\.removedirs|fs\.rmSync|fs\.rmdirSync|fs\.rm\(|FileUtils\.rm_rf|Directory\.Delete)\b/i },
  { name: "unsafe shell interpreter piping", pattern: /\b(?:curl|wget)\b[^\n]*\|\s*(?:bash|sh|zsh|pwsh|powershell)\b/i },
];

export function classifyDestructiveCommand(command) {
  if (typeof command !== "string" || !command.trim()) return "missing shell command";
  if (command.length > 100_000) return "oversized shell command";
  for (const item of patterns) if (item.pattern.test(command)) return item.name;
  return null;
}

export function assessHookInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return "invalid hook input";
  if (!["Bash", "PowerShell"].includes(input.tool_name)) return "unsupported tool";
  return classifyDestructiveCommand(input.tool_input?.command);
}

function denial(reason) {
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason:
        "Codex Toolkit blocked " + reason + ". Do not retry via another shell, script, or tool. " +
        "Identify literal in-workspace targets, inspect the preview, and obtain explicit scoped approval. " +
        "Keep full-access agents inside an OS-enforced isolated environment.",
    },
  };
}

async function main() {
  let input = "";
  try {
    for await (const chunk of process.stdin) {
      input += String(chunk);
      if (input.length > 200_000) throw Error("oversized hook input");
    }
    const reason = assessHookInput(JSON.parse(input));
    if (reason) process.stdout.write(JSON.stringify(denial(reason)) + "\n");
  } catch (error) {
    // A hook failure must not accidentally permit an unknown command.
    process.stderr.write("Destructive command guard could not inspect request: " + error.message + "\n");
    process.exitCode = 2;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
