# Destructive operations safety (Windows, macOS, Linux)

This is a cross-cutting rule for every Chara's Toolkit skill and Mission Control agent. It applies even when the user chooses **Full Access**, bypasses permission prompts, or asks the agent to clean up. It is not a replacement for a sandbox or filesystem permissions.

## Before touching data

1. Establish **specific scope and authorization**: identify the exact files/paths and why the operation is needed. Permission to complete a coding task is **not** permission to erase files outside its accepted scope.
2. Identify the host OS, actual shell and current working directory. Windows Git Bash/MSYS paths such as /c/Users and WSL mounts such as /mnt/c can refer to real Windows user files.
3. Expand and inspect paths *before* constructing a command. Reject absent/empty variables, unresolved ~ or $HOME, wildcards in targets, path traversal, UNC/drive roots, and ambiguous relative paths. Do not interpolate target paths into a command string passed to another shell.
4. Check the resolved path is a child of the authorized workspace (not the workspace itself), that it does not cross symlinks/junctions/mounts, and that its contents match the intended delete set. Exclude .git, backups, credentials, profile directories, existing user work, and shared volumes.
5. Prefer restoring/editing one file or replacing a temporary artifact rather than recursively clearing a directory. Inspect version-control diffs and any programmatic preview; snapshot irreplaceable data before approved bulk edits.
6. An action that would delete a home/profile, drive root, mount, workspace root, backup, or unrelated directory is **always refused**. For other broad/irreversible operations, stop for explicit approval of the exact target even in Full Access.
7. If blocked or uncertain, **stop**. Do not repackage the same deletion as Python/Node code, move it to a subagent, escalate privileges, or switch shells until it happens to work.

### What to treat as destructive

The safety boundary includes file deletion, forced/recursive cleanup, restoring or overwriting uncommitted work, broad moves, recursive permission changes, schema/data removal, sync commands with delete/mirror modes, and cleanup inside containers or mounted directories. Approval for one exact target never implies approval for its parent or siblings.

## Windows

- PowerShell quoting differs from POSIX shells: single quotes are verbatim, double quotes expand variables, and a backslash does **not** escape a double quote. Use a typed variable and `-LiteralPath` for a specific known target; `-Path` interprets wildcards.
- `Remove-Item` supports `-WhatIf`. Use it for inspection, **not** as proof that the resolved path is safe. Recheck the actual target independently.
- **Do not chain PowerShell → cmd.exe /c → rd/rmdir/del** for cleanup. Those shells reparse arguments differently, and CMD quiet recursive deletion does not ask for confirmation.
- Drive roots (`C:\`), user profiles (`C:\Users` and individual account roots), system folders, volume/mount directories and UNC share roots must never be deletion targets. Git Bash path spellings (`/c/Users`) still map to the Windows drive.
- Avoid executing cleanup via network drives, mapped volumes, UNC aliases, WSL mounted Windows volumes, administrator privileges, or broad wildcards.

Safe *inspection* example (does not delete):

```powershell
$target = Join-Path (Get-Location) 'dist'
Get-Item -LiteralPath $target
Remove-Item -LiteralPath $target -Recurse -WhatIf
```

## macOS and Linux

- Reject `/`, `/home`, `/Users`, `/Volumes`, mounted volumes, home directories, and parent paths of the workspace. Do not rely on shell aliases or quoted variables to certify intent.
- GNU `rm` normally protects the filesystem root, but that **does not protect** ordinary profile directories or directories within mounted volumes; `--one-file-system` is GNU-specific and does not make all deletes safe. macOS/BSD tools differ.
- Treat recursive `chmod`/`chown`, `find -delete`, `rsync --delete`, destructive `git` actions, `diskutil`, `mkfs`, and interpreter-level filesystem deletion as high risk.
- Do not run full-access agents as root, with unrestricted sudo, or with host home/system directories writable through container bind mounts.

Safe *inspection* example:

```sh
pwd -P
ls -lad -- ./dist
git status --short
```

## Optional read-only tooling bundled with this repository

The toolkit does **not** automatically enable a command guard or hook. A blanket deny policy may be too intrusive for individual development, and no lexical guard can inspect arbitrary programs safely.

### Inspect one literal deletion target

Run from the toolkit source/package with Node 18+ (no network access or filesystem writes):

```sh
node scripts/preview-delete-target.mjs --workspace /path/to/project --target dist
```

It emits `PREVIEW_ONLY` for existing in-scope paths and fails closed for roots, home/workspace roots, parents, globs, aliases, symlinks/junctions, cross-device mount points, backups and .git metadata. No deletion is performed. Check immediately again at the point of any authorized mutation: a preview can become stale.

### Optional Claude Code PreToolUse hook (Bash and PowerShell)

Anthropic supports synchronous hooks that can deny tool calls. To activate this **on purpose**, place an admin/user-managed entry like the following in your Claude settings. Substitute the permanent absolute path to the toolkit script (do not point at a temporary package cache):

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash|PowerShell",
      "hooks": [{
        "type": "command",
        "command": "node",
        "args": ["/ABSOLUTE/TOOLKIT/PATH/scripts/guard-destructive-command.mjs"]
      }]
    }]
  }
}
```

The hook reads the tool request from stdin and emits a `deny` decision for recognizable high-risk shell commands. It checks the *whole command*, including nested commands, rather than just commands starting with a deletion verb; ordinary read/build/test commands pass unchanged. Invalid input fails closed. Run the unit tests before enabling it.

**Limits:** Regex matching can miss aliases, obfuscation, code inside external scripts, tool calls outside Bash/PowerShell, other plugins, and arbitrary filesystem APIs. A compromised agent with unconstrained file access can edit or bypass its own hook. The hook is a *defense in depth*, not a guarantee of safety. Keep it outside the writable workspace and enforce permissions independently.

### Optional Codex command restrictions

Codex supports command prefix rules in its configuration hierarchy, and organization administrators may set restrictive rules in managed configuration. These can deny obvious command prefixes but **cannot reliably inspect arbitrary nested scripts or commands executed by other tools**.

Place restrictions in a protected admin/user config layer—not in an agent-writable project directory. For example, a locally tested rule can forbid the simple rm command prefix without forbidding routine build commands:

```starlark
prefix_rule(
    pattern = ["rm"],
    decision = "forbidden",
    justification = "Use a scoped read-only preview and request approval for any deletion."
)
```

Do not assume this single rule catches recursive deletion invoked through shell wrappers, npm scripts, Python, Git, or PowerShell. Prefer a least-privilege sandbox; run an unrestricted agent only inside an isolated VM/container without writable host profile/system mounts. Docker bind mounts are writable by default, so isolation requires deliberate mount configuration.

## Validation and support

```sh
node --test scripts/test_destructive_safety.mjs
```

The tests run on Linux, Windows and macOS CI and never delete user data; the temporary fixtures they create are removed by the test harness. A passing test verifies these helpers, **not the safety of arbitrary full-access agents**.

### Primary references

- [Microsoft PowerShell Remove-Item](https://learn.microsoft.com/powershell/module/microsoft.powershell.management/remove-item)
- [Microsoft PowerShell quoting](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_quoting_rules)
- [Microsoft CMD rmdir](https://learn.microsoft.com/windows-server/administration/windows-commands/rmdir)
- [GNU rm manual](https://www.gnu.org/software/coreutils/manual/html_node/rm-invocation.html)
- [Claude Code hook reference](https://code.claude.com/docs/en/hooks)
- [Codex command rules](https://developers.openai.com/codex/rules)
- [Docker bind mount security](https://docs.docker.com/engine/storage/bind-mounts/)
