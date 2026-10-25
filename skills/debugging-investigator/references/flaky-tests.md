# Flaky tests

A flaky test is a test whose result depends on something it does not control. Treat it as a bug report with a missing input. Adding retries does not fix it.

## 1. Establish that it is flaky

- Re-run the exact failing commit and command. Record the pass/fail ratio over N runs (start with 20–50; use more for rare failures) and say what N was.
- Separate a flaky failure from a real regression that only fails sometimes. If the failure first appears at a specific commit, bisect before you treat it as flakiness.
- Capture each failure's full output, seed, ordering, worker ID, timing, and environment. "It failed once in CI" is not enough to start working.

## 2. Classify the hidden input

| Class | Typical signal | Discriminating experiment |
| --- | --- | --- |
| Order or shared state | Passes alone, fails in the suite or under a specific order | Run with randomized order and a fixed seed; bisect the preceding tests |
| Time | Fails near midnight, month ends, DST changes, or on slow machines | Freeze the clock or inject time; run with a shifted timezone |
| Concurrency | Fails under parallel workers or load | Run with workers=1 and with workers=many; add stress repetitions |
| Async timing | Fixed sleeps, polling, animation, debounce | Replace sleeps with waits on the observable condition |
| External resources | Network, ports, filesystem, temp directories, databases | Isolate per test (random ports, unique directories, transactions) |
| Randomness | Unseeded generators, hash or set iteration order | Log and fix the seed; assert on sorted output |
| Resource limits | Memory, file handles, CPU contention in CI | Compare against CI runner limits; watch resource usage |
| Test infrastructure | Leaked mocks, global stubs, unclosed servers | Check teardown; run each test in a fresh process |

Change one variable per experiment. Note which hypotheses each experiment rules out.

## 3. Fix the cause

- Make the hidden input explicit: inject clock, randomness, and configuration; give each test its own state; await the actual condition instead of sleeping.
- If the product itself is racy and the test is right, the bug belongs to the product. Fix the code, not the test.
- Never loosen an assertion until it can't fail. Never add a blanket retry around a test that is hiding a real race.

## 4. Quarantine policy

Quarantine only to unblock other work, and only with:

- a named owner, a linked issue, and an expiry date;
- the test still running and reporting (non-blocking), so the evidence keeps accumulating;
- a visible count of quarantined tests in CI output.

A quarantine that passes its expiry without a fix needs an explicit decision to delete or rewrite the test.

## 5. Verify

Run the same N-run experiment after the fix, under the conditions that used to fail (order, parallelism, timezone). Report the before and after ratios. Zero failures in N runs shrinks the risk, but say that it doesn't prove the flake is gone. A fix is convincing when you can name the hidden input and the failing seed or order now passes repeatedly.

If a critical flake can't be reproduced, improve the failure artifacts (seed, order, timing, environment dump, traces) so the next failure is diagnosable. Don't delete the test.
