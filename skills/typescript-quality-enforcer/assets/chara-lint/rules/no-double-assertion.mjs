import { isAssertion, isConstAssertion } from "../lib/ast.mjs";

// A non-null `!` between two assertions does not break the chain: it adds no evidence.
function innerLink(node) {
  let current = node.expression;
  while (current?.type === "TSNonNullExpression") current = current.expression;
  return isAssertion(current) ? current : null;
}

function isInnerLink(node) {
  let parent = node.parent;
  while (parent?.type === "TSNonNullExpression") parent = parent.parent;
  return isAssertion(parent) && innerLink(parent) !== null;
}

function check(context, node) {
  if (isInnerLink(node) || !innerLink(node)) return;
  const links = [];
  for (let link = node; link; link = innerLink(link)) links.push(link);
  if (links.every(isConstAssertion)) return;
  context.report({ node, messageId: "doubleAssertion", data: { count: String(links.length) } });
}

export default {
  meta: {
    type: "problem",
    docs: { description: "Disallow asserting a value that was itself just asserted (`x as unknown as T`)." },
    messages: {
      doubleAssertion:
        "{{count}} stacked type assertions force a conversion the compiler rejects. Keep the precise type, or parse the value into the target type.",
    },
    schema: [],
  },
  create(context) {
    return {
      TSAsExpression: (node) => check(context, node),
      TSTypeAssertion: (node) => check(context, node),
    };
  },
};
