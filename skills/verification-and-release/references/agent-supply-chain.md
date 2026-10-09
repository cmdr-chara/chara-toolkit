# Agent and skill bundle release controls

Use for releases that distribute skills, agents, executable hooks, install scripts, plugin definitions, MCP servers, or automatic updates. The release owner must distinguish verified controls from advisory prose.

## Provenance and authorization

1. Freeze the reviewed candidate identity and identify the exact files and executable entry points being distributed.
2. Link source revision, build inputs, artifact digest, and install reference. Moving branch names and tags alone are insufficient as durable release identities.
3. Verify publisher trust independently of the downloaded artifact. Matching a digest on an untrusted server establishes consistency, not authenticity.
4. Identify the trusted principal approving promotion and the host mechanism enforcing approved versions, tool grants, network permissions, and filesystem scope.
5. Check the permissions delta: newly executable commands, external connections, inherited credentials, scheduled tasks, and transitive integrations.
6. Define rollout cohorts, pause/rollback controls, an immutable known-good revision, and recovery for partially applied updates.
7. Retain evidence that user-authored instructions and data survive installation and rollback.

## Negative scenarios worth testing

- A previously approved release tag now resolves to another commit: stop the update.
- The installed bytes differ from the reviewed artifact: reject promotion.
- A new plugin requests broader capabilities: require independent approval.
- Managed installation collides with user configuration: fail without discarding the user's content.
- A canary deployment reports a meaningful regression: halt broader rollout.

Provide actual test/approval artifacts tied to the candidate. This checklist is not proof that a product is signed, sandboxed, certified, or ready to ship.
