import { isDeclaredLocally, memberName } from "./ast.mjs";

// The global Reflect object, reached directly or through an undeclared globalThis.
function isGlobalReflect(context, node) {
  if (node.type === "Identifier") return node.name === "Reflect" && !isDeclaredLocally(context.sourceCode, node, "Reflect");
  return (
    memberName(node) === "Reflect" &&
    node.object.type === "Identifier" &&
    node.object.name === "globalThis" &&
    !isDeclaredLocally(context.sourceCode, node.object, "globalThis")
  );
}

export function reflectCallRule(method, description, message) {
  return {
    meta: {
      type: "suggestion",
      docs: { description },
      messages: { reflective: message },
      schema: [],
    },
    create(context) {
      return {
        CallExpression(node) {
          if (memberName(node.callee) === method && isGlobalReflect(context, node.callee.object)) {
            context.report({ node, messageId: "reflective" });
          }
        },
      };
    },
  };
}
