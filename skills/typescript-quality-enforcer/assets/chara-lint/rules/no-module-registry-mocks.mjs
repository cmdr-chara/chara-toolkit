import { findVariable, memberName } from "../lib/ast.mjs";

const MODULE_METHODS = new Set(["mock", "doMock", "unstable_mockModule"]);
const FRAMEWORK_IMPORTS = { vitest: "vi", "@jest/globals": "jest" };

function isFrameworkObject(context, identifier) {
  const variable = findVariable(context.sourceCode, identifier, identifier.name);
  if (!variable || variable.defs.length === 0) return identifier.name === "vi" || identifier.name === "jest";
  if (variable.defs.length !== 1) return false;
  const [definition] = variable.defs;
  const specifier = definition.node;
  if (specifier?.type !== "ImportSpecifier") return false;
  const source = specifier.parent?.source?.value;
  const imported = specifier.imported?.name ?? specifier.imported?.value;
  return FRAMEWORK_IMPORTS[source] === imported;
}

export default {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow replacing whole modules through the Vitest or Jest module registry." },
    messages: {
      moduleMock:
        "`{{object}}.{{method}}` swaps a module behind the code's back. Pass the collaborator in through a parameter or interface and use a faithful fake.",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;
        const method = memberName(callee);
        if (!MODULE_METHODS.has(method) || callee.object.type !== "Identifier") return;
        if (!isFrameworkObject(context, callee.object)) return;
        context.report({ node, messageId: "moduleMock", data: { object: callee.object.name, method } });
      },
    };
  },
};
