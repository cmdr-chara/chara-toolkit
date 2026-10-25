import { findVariable, functionBoundary, isAssertion, isConstAssertion, stableConstDeclarator, stripWhitespace } from "../lib/ast.mjs";
import { refArgs, refName } from "../lib/types.mjs";

const BROAD_KEYS = new Set(["TSStringKeyword", "TSNumberKeyword", "TSSymbolKeyword"]);
const KNOWN_VALUES = new Set([
  "Literal",
  "TemplateLiteral",
  "ArrayExpression",
  "ObjectExpression",
  "FunctionExpression",
  "ArrowFunctionExpression",
  "ClassExpression",
  "NewExpression",
]);

function isBroadKey(type) {
  if (BROAD_KEYS.has(type?.type) || refName(type) === "PropertyKey") return true;
  return type?.type === "TSUnionType" && type.types.every(isBroadKey);
}

function isTopValue(type) {
  return type?.type === "TSUnknownKeyword" || type?.type === "TSAnyKeyword";
}

// Names are matched literally: this rule does not consider shadowing.
function erasedKind(type) {
  if (!type) return null;
  if (isTopValue(type)) return "top";
  if (type.type === "TSObjectKeyword") return "object";
  const name = refName(type);
  const args = refArgs(type);
  if (name === "Record" && args.length === 2 && isBroadKey(args[0]) && isTopValue(args[1])) return "record";
  if (name === "Readonly" && args.length === 1 && erasedKind(args[0]) === "record") return "record";
  if (type.type === "TSTypeLiteral" && type.members.length === 1) {
    const [member] = type.members;
    const key = member.parameters?.[0]?.typeAnnotation?.typeAnnotation;
    if (member.type === "TSIndexSignature" && member.parameters?.length === 1 && isBroadKey(key) && isTopValue(member.typeAnnotation?.typeAnnotation)) {
      return "record";
    }
  }
  return null;
}

function definitelyObject(type) {
  switch (type?.type) {
    case "TSArrayType":
    case "TSTupleType":
    case "TSFunctionType":
    case "TSConstructorType":
    case "TSMappedType":
    case "TSObjectKeyword":
      return true;
    case "TSTypeLiteral":
      return type.members.length > 0;
    case "TSTypeOperator":
      return type.operator === "readonly" && definitelyObject(type.typeAnnotation);
    case "TSIntersectionType":
      return type.types.every(definitelyObject);
    default:
      return false;
  }
}

function definitelyNarrowerRecord(type) {
  if (type?.type === "TSTypeLiteral") return type.members.some((member) => member.type !== "TSIndexSignature");
  const args = refArgs(type);
  if (refName(type) === "Record") return args.length === 2 && !isTopValue(args[1]);
  return refName(type) === "Readonly" && args.length === 1 && definitelyNarrowerRecord(args[0]);
}

export default {
  meta: {
    type: "problem",
    docs: { description: "Disallow storing a known value in a broad binding and later asserting it back to a narrower type." },
    messages: {
      eraseThenAssert:
        "`{{name}}` was widened from a value whose type was known, and is now asserted back. Keep the precise type from initialization to use, or parse once at the boundary.",
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;

    // The evidence type text of a value, `""` when known but untyped, or null when unknown.
    function evidence(value, boundary, seen = new Set()) {
      if (isAssertion(value) && !isConstAssertion(value)) return erasedKind(value.typeAnnotation) ? null : sourceCode.getText(value.typeAnnotation);
      if (KNOWN_VALUES.has(value?.type)) return "";
      if (value?.type !== "Identifier") return null;
      const variable = findVariable(sourceCode, value, value.name);
      if (!variable || variable.defs.length !== 1) return null;
      const [definition] = variable.defs;
      const declaredAt = definition.name;
      if (functionBoundary(declaredAt) !== boundary) return null;
      const annotation = declaredAt.typeAnnotation?.typeAnnotation;
      if (annotation) return erasedKind(annotation) ? null : sourceCode.getText(annotation);
      const declarator = stableConstDeclarator(sourceCode, value);
      if (!declarator || seen.has(declarator)) return null;
      seen.add(declarator);
      return evidence(declarator.init, boundary, seen);
    }

    function check(node) {
      if (isConstAssertion(node) || node.expression.type !== "Identifier") return;
      const declarator = stableConstDeclarator(sourceCode, node.expression);
      if (!declarator || node.range[0] < declarator.range[1]) return;
      const boundary = functionBoundary(declarator);
      if (functionBoundary(node) !== boundary) return;

      const annotation = declarator.id.typeAnnotation?.typeAnnotation;
      let kind = erasedKind(annotation);
      let original = declarator.init;
      if (!kind && isAssertion(declarator.init)) {
        kind = erasedKind(declarator.init.typeAnnotation);
        original = declarator.init.expression;
      }
      if (!kind) return;
      const evidenceType = evidence(original, boundary);
      const target = node.typeAnnotation;
      if (evidenceType === null || erasedKind(target)) return;

      const sameType = evidenceType !== "" && stripWhitespace(evidenceType) === stripWhitespace(sourceCode.getText(target));
      const narrowed =
        kind === "top" ||
        sameType ||
        (kind === "object" && definitelyObject(target)) ||
        (kind === "record" && definitelyNarrowerRecord(target));
      if (narrowed) context.report({ node, messageId: "eraseThenAssert", data: { name: node.expression.name } });
    }

    return { TSAsExpression: check, TSTypeAssertion: check };
  },
};
