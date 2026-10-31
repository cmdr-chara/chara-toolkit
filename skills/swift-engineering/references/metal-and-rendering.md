# Metal and observable rendering

Read only when changing Metal/shaders, GPU-backed resources, rendering integration, or parity with a native reference renderer. Ordinary portable Swift and UI logic do not need this checklist.

## Reconstruct the rendering contract

Identify the renderer entry point, device and GPU-family requirements, shader compilation/library loading, pipeline descriptors, render attachments, and presentation/readback path. Preserve CPU/shader buffer layout, alignment, binding indices, formats, sample counts, blending, color space/alpha, coordinate conventions, and backing scale where the output depends on them.

Check feature availability on the supported SDK, OS, and actual GPU family. Use the project's existing Metal API generation and fallback; do not upgrade an API or deployment target simply because current documentation describes it. Expose pipeline creation failures and command-buffer errors through the existing error/reporting path instead of treating a missing frame as success.

## Trace resource lifetime and conflicting access

Follow each buffer/texture from allocation through encoding, submission, GPU completion, and reuse. CPU scope exit or command encoding completion does not establish that the GPU has finished reading. Verify the command buffer's retention policy and indirect-resource requirements rather than assuming ARC retains every needed resource.

For CPU/GPU and GPU/GPU sharing, identify the conflicting reads/writes, storage mode, hazard tracking, encoder/queue boundaries, and required visibility. Select synchronization for the API actually in use. Automatic hazard tracking, explicit fences/barriers/events, and CPU/GPU storage synchronization have different scopes; none is a universal replacement for the others. Avoid overwriting in-flight resources, unsynchronized readback, and waits that deadlock or block UI progress.

Preserve correct completion/error cleanup, including no-drawable or failed-submission paths. Check that throttling tokens or in-flight slots are released on every applicable path. An unchecked `Sendable` conformance cannot establish a GPU completion guarantee.

## Observe the output that changed

For a reference-renderer comparison, fix content, viewport/backing scale, inputs, time, color handling, and capture route. Define whether the task requires exact pixels or an accepted tolerance; do not hide differences with a broad threshold. Inspect representative frames and relevant interaction/resize transitions. Keep reference and candidate artifacts identifiable by source revision and execution environment.

Distinguish shader compilation, successful pipeline construction, command completion, readback, and presented output. Use relevant validation/capture tools already available to inspect a material GPU boundary. A host/Linux build, mock backend, saved preview, or old native recording cannot prove the changed renderer ran correctly on Apple hardware. Report unavailable native/GPU checks without substituting those artifacts as runtime proof.

Performance claims require comparable measurements and belong with `optimize-codebase-performance`; this reference establishes rendering correctness evidence, not an optimization mandate.

## Primary sources

- [Metal command structure](https://developer.apple.com/documentation/metal/setting-up-a-command-structure)
- [CPU and GPU synchronization](https://developer.apple.com/documentation/metal/synchronizing-cpu-and-gpu-work)
- [Resource synchronization and API-specific hazard tracking](https://developer.apple.com/documentation/metal/resource-synchronization)
- [Managed-resource storage synchronization](https://developer.apple.com/documentation/metal/synchronizing-a-managed-resource-in-macos)
- [Command-buffer retained references](https://developer.apple.com/documentation/metal/mtlcommandbufferdescriptor/retainedreferences)
- [Command-buffer diagnostics](https://developer.apple.com/documentation/metal/command-buffer-debugging)

Consult the actual resource, storage-mode, and queue APIs for the supported Metal implementation before choosing synchronization.
