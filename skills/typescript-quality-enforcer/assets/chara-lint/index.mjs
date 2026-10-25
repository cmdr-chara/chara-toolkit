// chara-lint: Oxlint rules that keep type evidence intact in JavaScript and
// TypeScript. Plain ES modules with no runtime dependencies, so the directory
// can be copied into a repository and loaded through `jsPlugins` as is.

import noBannedIdentifierTerms from "./rules/no-banned-identifier-terms.mjs";
import noBareObjectParams from "./rules/no-bare-object-params.mjs";
import noDoubleAssertion from "./rules/no-double-assertion.mjs";
import noEmptyObjectFallbackSpread from "./rules/no-empty-object-fallback-spread.mjs";
import noEraseThenAssert from "./rules/no-erase-then-assert.mjs";
import noLooseDictionaryValues from "./rules/no-loose-dictionary-values.mjs";
import noModuleRegistryMocks from "./rules/no-module-registry-mocks.mjs";
import noReflectiveApply from "./rules/no-reflective-apply.mjs";
import noReflectiveGet from "./rules/no-reflective-get.mjs";
import noTypeofChecks from "./rules/no-typeof-checks.mjs";
import noUnknownAliases from "./rules/no-unknown-aliases.mjs";
import noUnknownInputs from "./rules/no-unknown-inputs.mjs";
import noUnknownResults from "./rules/no-unknown-results.mjs";
import noWideningKnownValues from "./rules/no-widening-known-values.mjs";
import requireAssertionJustification from "./rules/require-assertion-justification.mjs";

export default {
  meta: { name: "chara-lint" },
  rules: {
    "no-banned-identifier-terms": noBannedIdentifierTerms,
    "no-bare-object-params": noBareObjectParams,
    "no-double-assertion": noDoubleAssertion,
    "no-empty-object-fallback-spread": noEmptyObjectFallbackSpread,
    "no-erase-then-assert": noEraseThenAssert,
    "no-loose-dictionary-values": noLooseDictionaryValues,
    "no-module-registry-mocks": noModuleRegistryMocks,
    "no-reflective-apply": noReflectiveApply,
    "no-reflective-get": noReflectiveGet,
    "no-typeof-checks": noTypeofChecks,
    "no-unknown-aliases": noUnknownAliases,
    "no-unknown-inputs": noUnknownInputs,
    "no-unknown-results": noUnknownResults,
    "no-widening-known-values": noWideningKnownValues,
    "require-assertion-justification": requireAssertionJustification,
  },
};
