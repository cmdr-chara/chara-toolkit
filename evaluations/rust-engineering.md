# Rust contract probes

These are original task fixtures and acceptance criteria for the Rust implementation route and the existing review route. Expected behavior, observed runs, and comparative evidence are separate. A structural pass or a text-proxy score does not demonstrate that generated Rust works.

## Running a probe

Create a fresh workspace outside the toolkit, supply only the task's raw artifacts and user request, and make the candidate skill available there. Do not supply this guide's acceptance criteria, a suspected defect, another run's output, or the expected answer to the working agent. Keep the independent observer's tests outside that workspace until the run finishes. Record source/candidate fingerprints, toolchains, permission scope, commands, changed files, observed outcomes, and gaps.

For an A/B comparison, match initial artifacts, model/runtime settings, execution permissions, and independent acceptance checks. Vary only the skill condition. Use repeated runs and keep regressions. The existing [outcome evaluator](outcome-benchmarks.md) can compare completed isolated workspaces; it does not generate candidate implementations or establish matched provenance on its own.

## Probe 1: byte-run port

User request: implement the following Python routine in a dependency-free Rust library with the supplied Rust interface. Preserve all byte values and source behavior for a limit in `1..=255`; a zero limit returns `PackError::ZeroLimit`. No service migration, compiler change, or API redesign is requested. Include focused tests and report executed checks.

Source artifact:

```python
def pack_runs(payload: bytes, max_run: int) -> list[tuple[int, int]]:
    if not 1 <= max_run <= 255:
        raise ValueError("max_run must be between 1 and 255")
    runs = []
    for byte in payload:
        if runs and runs[-1][0] == byte and runs[-1][1] < max_run:
            value, count = runs[-1]
            runs[-1] = (value, count + 1)
        else:
            runs.append((byte, 1))
    return runs
```

Use a minimal library manifest with no dependencies, edition 2021, and declared `rust-version = "1.70"`. The Rust input type deliberately excludes the Python function's negative and over-255 limits; this is an explicit fixture domain decision. Keep the interface:

```rust
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Run {
    pub byte: u8,
    pub count: u8,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PackError {
    ZeroLimit,
}

pub fn pack_runs(payload: &[u8], max_run: u8) -> Result<Vec<Run>, PackError>;
```

The final line above specifies a signature, not a compilable free-function declaration. Supply an intentionally failing stub or an empty implementation in the working fixture.

Independent acceptance: check empty data, zero limit even on empty data, every byte including NUL and non-UTF-8 sequences, alternating values, exact run boundaries, and runs longer than 255. Generate deterministic valid inputs independently, compare ordered `(byte, count)` output with the Python routine, and confirm expanding runs reproduces the input with each count within the requested limit. Compile consumer tests against the supplied interface. Verify that dependencies, declared compiler support, and unrelated files were not changed. A latest-compiler pass does not establish minimum-compiler support.

## Probe 2: concurrent budget review

User request: review a Rust library change for introduced regressions without editing. A previously atomic conditional increment was replaced with the implementation below. `Budget::take` promises that at most `limit` acquisitions succeed when there are no releases. `used` starts at zero; cloned handles share it. Callers use `shared_usage` for diagnostics. Return evidence-backed findings and distinguish API preferences from correctness defects.

```rust
use std::sync::{atomic::{AtomicUsize, Ordering}, Arc};

#[derive(Clone)]
pub struct Budget {
    limit: usize,
    used: Arc<AtomicUsize>,
}

impl Budget {
    pub fn new(limit: usize) -> Self {
        Self { limit, used: Arc::new(AtomicUsize::new(0)) }
    }

    pub fn take(&self) -> bool {
        let used = self.used.load(Ordering::Relaxed);
        if used >= self.limit {
            return false;
        }
        self.used.store(used + 1, Ordering::Relaxed);
        true
    }

    pub fn shared_usage(&self) -> Arc<AtomicUsize> {
        Arc::clone(&self.used)
    }
}
```

Independent acceptance: the introduced capacity regression must be tied to a concrete interleaving with two acquisitions observing the same prior count, not merely to a preference for a stronger memory ordering. A suggested correction must make the conditional update indivisible. Keep documentation/style observations separate; the bool result and diagnostic `Arc` return are not independently proven regressions. No source mutation is authorized. Note the diagnostic handle's existing mutation capability as a contract issue only with appropriate scope and evidence; do not invent its introduction in this diff.

For the base artifact, keep the same surrounding source and replace only the candidate `take` body with:

```rust
self.used.fetch_update(Ordering::Relaxed, Ordering::Relaxed, |used| {
    if used < self.limit { Some(used + 1) } else { None }
}).is_ok()
```

## Probe 3: configuration and soundness evidence

Use the Rust cases in [behavioral-cases.json](behavioral-cases.json) to check explicit decisions about supported configurations, thread-affine APIs, port domains, and missing safety documentation. These are text/zero-write proxies. Human review must assess the reasoning; phrase matches alone do not prove correct implementation, routing, soundness, or parity.

## Observations

Record actual probe outcomes here only after execution. Until a matched A/B experiment is captured, no comparative effectiveness, recall, reliability, or token-saving claim is established.

### Candidate forward tests — 2026-10-31

Two fresh-context agents received only their respective copied skill, raw fixture, and user request. Neither received the observer's acceptance criteria, other run, suspected defect, or this guide. The implementation agent could write only its temporary fixture; the reviewer was instructed to remain read-only. These were task-specific snapshots, not installed-client routing tests.

| Probe | Observed result | Evidence boundary |
| --- | --- | --- |
| Byte-run port | An observer-authored differential corpus passed 823/823 cases, including all nonzero `u8` limits, every byte value, long runs, generated inputs, and zero-limit errors. The supplied public interface compiled in a separate consumer. | Parent executed its own driver against the resulting Rust library and the Python source using rustc 1.99.1 on Linux. Declared minimum-compiler support was not executed. |
| Probe sensitivity | The same observer corpus rejected the original failing stub on 817/823 cases; the six zero-limit cases passed. | This establishes that the checks can fail. The stub is not a model baseline and the delta is not a quality-improvement score. |
| Concurrent budget review | One introduced finding identified the two-success/one-slot interleaving and proposed restoring the indivisible conditional update. It did not classify the existing bool result or diagnostic `Arc` return as regressions. | Parent checked the finding against both source artifacts. Static interleaving evidence only; no concurrency runtime test or defect-recall benchmark. |
| Catalog-only selection | A separate fresh-context agent selected the intended primary for 9/9 held-out prompts: three Rust implementation requests and six adjacent negative cases covering review, diagnosis, migration, TypeScript, bug hunting, and a beginner explanation. | It received only 23 names/descriptions and the prompts, without bodies or an answer key. This is a model selection probe, not evidence of an installed client's automatic invocation. |

Snapshot fingerprints use SHA-256 over sorted relative file paths, NUL, file bytes, NUL, for each skill folder:

- `rust-engineering`: `6cfeeec7b3b6253eadaa186cb90b51b9a69073b9dd112313bb46f4c57d9c94f7`
- `review-and-refactor-code`: `e612b883236c1a78d22a2019b0675b815ecace09c4ec9f81c4fd9537b599f5d2`
- Python source file: `1453734c8c3c501b0fd48d9511f8be1ceca0b62bc96cb56ca95bec4db9acb32f`
- Generated Rust library source, including its own tests: `2c4dc32a4b9442bb4e98a7c3a86fc3dd9f10049ae932f88f1e66ecae8e1bdc86`

At that candidate, the skill folders were byte-compared with the forward-test snapshots. The parent also observed isolated standard/Claude installations containing 23 matching skill folders, a preserved user instruction block, an unchanged second setup, and a passing Mission Control check. Later language additions change the reviewer snapshot and catalog; the fingerprints above identify the historical probe, not every future tree. Repository structural checks and these local runs do not establish automatic routing accuracy in any client, Windows/macOS execution, exhaustive parity, soundness, or superiority over another skill pack.
