import { FUNCTION_TYPES, isConstAssertion } from "../lib/ast.mjs";

const JUSTIFICATION = /(?:^|[^A-Za-z0-9_])SAFETY\s*:\s*\S/;
const CLASS_MEMBERS = new Set(["PropertyDefinition", "MethodDefinition", "AccessorProperty", "TSAbstractPropertyDefinition", "TSAbstractMethodDefinition"]);

function isStatement(node) {
  return node.type.endsWith("Statement") || node.type.endsWith("Declaration") || CLASS_MEMBERS.has(node.type);
}

// The assertion and its ancestors up to the nearest statement or class member.
// The search never crosses a function boundary, so one comment above a function
// cannot excuse every assertion inside it.
function candidates(node) {
  const nodes = [node];
  for (let current = node; current.parent && !isStatement(current) && current.parent.type !== "Program"; ) {
    current = current.parent;
    if (FUNCTION_TYPES.has(current.type)) break;
    nodes.push(current);
  }
  return nodes;
}

export default {
  meta: {
    type: "suggestion",
    docs: { description: "Require a `SAFETY:` comment that states the invariant behind every type assertion." },
    messages: {
      missingJustification:
        "Explain this assertion with a `// SAFETY: <invariant that was checked>` comment directly before it or its statement.",
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;
    function check(node) {
      if (isConstAssertion(node)) return;
      const justified = candidates(node).some((candidate) =>
        sourceCode.getCommentsBefore(candidate).some((comment) => comment.range[1] <= node.range[0] && JUSTIFICATION.test(comment.value)),
      );
      if (!justified) context.report({ node, messageId: "missingJustification" });
    }
    return { TSAsExpression: check, TSTypeAssertion: check };
  },
};
