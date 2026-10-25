import { stripValueWrappers } from "../lib/ast.mjs";

function isEmptyObject(node) {
  const value = stripValueWrappers(node);
  return value?.type === "ObjectExpression" && value.properties.length === 0;
}

export default {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow `...(cond ? { key } : {})` inside object literals." },
    messages: {
      emptyFallback:
        "This spread hides an include-or-omit decision behind an empty object. Build the object in explicit steps so the optional key is visible.",
    },
    schema: [],
  },
  create(context) {
    return {
      SpreadElement(node) {
        if (node.parent?.type !== "ObjectExpression" || node.argument?.type !== "ConditionalExpression") return;
        const { consequent, alternate } = node.argument;
        if (isEmptyObject(consequent) || isEmptyObject(alternate)) context.report({ node, messageId: "emptyFallback" });
      },
    };
  },
};
