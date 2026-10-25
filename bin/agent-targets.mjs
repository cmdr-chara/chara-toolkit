// Where each agent reads user-level skills. Paths follow each agent's
// documented global skills directory, as listed by the open agent skills CLI
// (github.com/vercel-labs/skills docs/agents.md), checked 2026-10-25.
//
// `roles` marks agents with a documented custom-subagent folder; setup installs
// the generated Mission Control roles there (see scripts/build_mission_control.mjs).
//
// `agents` is the shared standard location (~/.agents/skills). Codex reads it,
// as do Cline, Warp, Zed, Pi, and other agents that follow the standard, so
// it is always part of automatic setup.

import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export const AGENT_TARGETS = [
  { id: "agents", label: "standard ~/.agents/skills (Codex, Cline, Warp, Zed, Pi, ...)", skills: [".agents", "skills"] },
  { id: "claude-code", label: "Claude Code", skills: [".claude", "skills"], detect: [".claude"], roles: [".claude", "agents"] },
  { id: "cursor", label: "Cursor", skills: [".cursor", "skills"], detect: [".cursor"] },
  { id: "gemini-cli", label: "Gemini CLI", skills: [".gemini", "skills"], detect: [".gemini"], roles: [".gemini", "agents"] },
  { id: "github-copilot", label: "GitHub Copilot", skills: [".copilot", "skills"], detect: [".copilot"] },
  { id: "opencode", label: "OpenCode", skills: [".config", "opencode", "skills"], detect: [".config", "opencode"] },
  { id: "windsurf", label: "Windsurf", skills: [".codeium", "windsurf", "skills"], detect: [".codeium", "windsurf"] },
  { id: "droid", label: "Factory Droid", skills: [".factory", "skills"], detect: [".factory"] },
  { id: "kiro-cli", label: "Kiro CLI", skills: [".kiro", "skills"], detect: [".kiro"] },
  { id: "roo", label: "Roo Code", skills: [".roo", "skills"], detect: [".roo"] },
  { id: "goose", label: "Goose", skills: [".config", "goose", "skills"], detect: [".config", "goose"] },
];

// Accepted spellings that mean the shared standard location.
const STANDARD_ALIASES = new Set(["agents", "codex", "universal", "cline", "warp", "zed", "pi"]);

async function isDirectory(path) {
  try {
    return (await stat(path)).isDirectory();
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

// The toolkit keeps its own state and backups under CODEX_HOME, so those
// entries alone do not mean Codex is installed.
const TOOLKIT_OWNED = new Set(["codex-toolkit", "backups"]);

async function codexPresent(codexHome) {
  if (!(await isDirectory(codexHome))) return false;
  return (await readdir(codexHome)).some((name) => !TOOLKIT_OWNED.has(name));
}

export function knownAgentIds() {
  return ["auto", ...AGENT_TARGETS.map((target) => target.id), ...[...STANDARD_ALIASES].filter((id) => id !== "agents")];
}

// Resolves `--agents` into skill directories plus whether the Codex-only
// integration (Mission Control roles, AGENTS.md routing) should be installed.
//
// `auto`: the standard location, every agent whose home directory exists, and
// the Codex integration when Codex is present, explicitly configured, or no
// other agent was found (the toolkit's historical default).
export async function resolveTargets({ spec = "auto", home, codexHome, codexExplicit = false }) {
  const requested = spec.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (requested.length === 0) throw new Error("--agents requires at least one agent id");
  for (const id of requested) {
    if (!knownAgentIds().includes(id)) {
      throw new Error(`unknown agent "${id}"; expected one of: ${knownAgentIds().join(", ")}`);
    }
  }

  const selected = new Set();
  let codex = false;
  if (requested.includes("auto")) {
    selected.add("agents");
    for (const target of AGENT_TARGETS) {
      if (target.detect && (await isDirectory(join(home, ...target.detect)))) selected.add(target.id);
    }
    codex = codexExplicit || (await codexPresent(codexHome)) || selected.size === 1;
  }
  for (const id of requested) {
    if (id === "auto") continue;
    if (STANDARD_ALIASES.has(id)) selected.add("agents");
    else selected.add(id);
    if (id === "codex") codex = true;
  }

  const targets = AGENT_TARGETS.filter((target) => selected.has(target.id)).map((target) => ({
    id: target.id,
    label: target.label,
    skillsRoot: join(home, ...target.skills),
    rolesRoot: target.roles ? join(home, ...target.roles) : null,
  }));
  return { targets, codex };
}
