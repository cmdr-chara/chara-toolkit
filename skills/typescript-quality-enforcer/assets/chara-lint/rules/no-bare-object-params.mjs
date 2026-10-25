import { onSignatures, paramAnnotation, paramDisplayName, signatureParams } from "../lib/ast.mjs";
import { resolvesTo, typeFacts } from "../lib/types.mjs";

function isObjectKeyword(type, recurse) {
  if (type?.type === "TSObjectKeyword") return true;
  return type?.type === "TSUnionType" && type.types.some(recurse);
}

export default {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow parameters typed with the bare `object` keyword." },
    messages: {
      bareObject:
        "Parameter `{{name}}` is typed `object`, which only says \"not a primitive\". Accept the owning domain type and parse external data before the call.",
    },
    schema: [],
  },
  create(context) {
    const facts = typeFacts(context.sourceCode);
    return onSignatures((node) => {
        for (const param of signatureParams(node)) {
          const annotation = paramAnnotation(param);
          if (!annotation || !resolvesTo(annotation, facts, isObjectKeyword)) continue;
          context.report({ node: annotation, messageId: "bareObject", data: { name: paramDisplayName(param, context.sourceCode) } });
        }
    });
  },
};
