import { onSignatures } from "../lib/ast.mjs";
import { refArgs, refName, resolvesTo, typeFacts } from "../lib/types.mjs";

const PROMISES = new Set(["Promise", "PromiseLike"]);

function isUnknownResult(type, recurse) {
  if (type?.type === "TSUnknownKeyword") return true;
  if (type?.type === "TSUnionType") return type.types.some(recurse);
  return PROMISES.has(refName(type)) && refArgs(type).length > 0 && recurse(refArgs(type)[0]);
}

export default {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow declared return types that resolve to `unknown` (including `Promise<unknown>`)." },
    messages: {
      unknownResult:
        "This function promises callers an unparsed `unknown`. Parse the data where it is obtained and return a domain type.",
    },
    schema: [],
  },
  create(context) {
    const facts = typeFacts(context.sourceCode);
    return onSignatures((node) => {
        const returnType = node.returnType?.typeAnnotation;
        if (!returnType || returnType.type === "TSTypePredicate") return;
        if (resolvesTo(returnType, facts, isUnknownResult)) context.report({ node: returnType, messageId: "unknownResult" });
    });
  },
};
