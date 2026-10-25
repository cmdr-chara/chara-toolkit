import { isDeclaredLocally } from "../lib/ast.mjs";

const RUNTIME_FUNCTIONS = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);
const EQUALITY = new Set(["===", "!==", "==", "!="]);

function insideTypeGuard(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (RUNTIME_FUNCTIONS.has(current.type)) return current.returnType?.typeAnnotation?.type === "TSTypePredicate";
  }
  return false;
}

// `typeof window === "undefined"`: detecting whether the runtime provides a global.
function isEnvironmentCheck(context, node) {
  const comparison = node.parent;
  if (node.argument.type !== "Identifier" || comparison?.type !== "BinaryExpression" || !EQUALITY.has(comparison.operator)) {
    return false;
  }
  const other = comparison.left === node ? comparison.right : comparison.left;
  return other.type === "Literal" && other.value === "undefined" && !isDeclaredLocally(context.sourceCode, node, node.argument.name);
}

export default {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow runtime `typeof` checks outside dedicated parsing code." },
    messages: {
      runtimeTypeof:
        "Runtime `typeof` narrows a raw value without establishing its contract. Decode the data at the boundary and branch on domain values.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allowTypeGuards: { type: "boolean", default: false },
          allowEnvironmentChecks: { type: "boolean", default: false },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] ?? {};
    return {
      UnaryExpression(node) {
        if (node.operator !== "typeof") return;
        if (options.allowTypeGuards && insideTypeGuard(node)) return;
        if (options.allowEnvironmentChecks && isEnvironmentCheck(context, node)) return;
        context.report({ node, messageId: "runtimeTypeof" });
      },
    };
  },
};
