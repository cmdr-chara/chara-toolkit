import { onSignatures, paramAnnotation, paramDisplayName, signatureParams } from "../lib/ast.mjs";

// `unknown` anywhere in a union collapses the whole union to `unknown`.
function isUnknown(type) {
  if (type?.type === "TSParenthesizedType") return isUnknown(type.typeAnnotation);
  if (type?.type === "TSUnknownKeyword") return true;
  return type?.type === "TSUnionType" && type.types.some(isUnknown);
}

export default {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow `unknown` parameters; accept a parsed domain type instead." },
    messages: {
      unknownInput:
        "Parameter `{{name}}` accepts `unknown`, which moves the parsing obligation into this function. Parse at the boundary and accept the domain type.",
    },
    schema: [],
  },
  create(context) {
    return onSignatures((node) => {
        for (const param of signatureParams(node)) {
          const annotation = paramAnnotation(param);
          if (!isUnknown(annotation)) continue;
          const name = paramDisplayName(param, context.sourceCode);
          // `cause` conventionally carries an arbitrary underlying error.
          if (name === "cause") continue;
          context.report({ node: annotation, messageId: "unknownInput", data: { name } });
        }
    });
  },
};
