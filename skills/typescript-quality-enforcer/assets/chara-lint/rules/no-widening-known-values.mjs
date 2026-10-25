import { findVariable, isAssertion, nearestFunction, stableConstDeclarator, stripValueWrappers } from "../lib/ast.mjs";
import { dictionaryValues, expandAlias, isBroadKey, isBuiltin, refName, typeFacts, typeParamsInScope, unwrap } from "../lib/types.mjs";

const KNOWN_VALUES = new Set([
  "ObjectExpression",
  "ArrayExpression",
  "ArrowFunctionExpression",
  "FunctionExpression",
  "ClassExpression",
  "NewExpression",
  "Literal",
  "TemplateLiteral",
  "UnaryExpression",
]);

const KIND_LABELS = {
  unknown: "`unknown`",
  object: "`object`",
  dictionary: "an open dictionary",
  anonymous: "an anonymous object type",
  container: "a generic dictionary container",
};

// Broad kind reached through a non-generic alias body, or null.
function aliasBodyKind(type, facts, seen) {
  const current = unwrap(type, facts, true);
  if (current?.type === "TSUnknownKeyword") return "unknown";
  if (current?.type === "TSObjectKeyword") return "object";
  if (current?.type === "TSTypeLiteral") return current.members.some((m) => m.type === "TSIndexSignature") ? "dictionary" : null;
  if (current?.type === "TSMappedType") return isBroadKey(current.constraint ?? current.typeParameter?.constraint, facts) ? "dictionary" : null;
  const name = refName(current);
  if (name === "Record" && isBuiltin(name, facts)) return "dictionary";
  const expanded = name ? expandAlias({ node: current }, facts) : null;
  if (!expanded || seen.has(expanded.alias)) return null;
  seen.add(expanded.alias);
  if (expanded.alias.typeParameters?.params?.length) return dictionaryValues(expanded, facts) ? "dictionary" : null;
  return aliasBodyKind(expanded.node, facts, seen);
}

function broadKind(type, facts) {
  const current = unwrap(type, facts, true);
  switch (current?.type) {
    case "TSUnknownKeyword":
      return "unknown";
    case "TSObjectKeyword":
      return "object";
    case "TSMappedType":
      return "dictionary";
    case "TSTypeLiteral":
      if (current.members.some((member) => member.type === "TSIndexSignature")) return "dictionary";
      return current.members.length > 0 ? "anonymous" : null;
    case "TSTypeReference": {
      const name = refName(current);
      if (name === "Record" && isBuiltin(name, facts)) return "dictionary";
      const alias = name && !typeParamsInScope(current).has(name) ? facts.aliases.get(name) : null;
      if (!alias) return null;
      if (alias.typeParameters?.params?.length) {
        const expanded = expandAlias({ node: current }, facts);
        return expanded && dictionaryValues(expanded, facts) ? "container" : null;
      }
      return aliasBodyKind(alias.typeAnnotation, facts, new Set([alias]));
    }
    default:
      return null;
  }
}

function hasKnownEvidence(context, expression, seen = new Set()) {
  const value = stripValueWrappers(expression);
  if (KNOWN_VALUES.has(value?.type)) return true;
  if (value?.type !== "Identifier") return false;
  const declarator = stableConstDeclarator(context.sourceCode, value);
  if (!declarator || seen.has(declarator)) return false;
  seen.add(declarator);
  return hasKnownEvidence(context, declarator.init, seen);
}

function isEmptyObject(expression) {
  const value = stripValueWrappers(expression);
  return value?.type === "ObjectExpression" && value.properties.length === 0;
}

export default {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow pushing a value whose type is known from syntax into an explicitly broad type." },
    messages: {
      widening:
        "This value's type is fully known, but it is stored as {{kind}}, which throws that evidence away. Keep inference, use `satisfies`, or name an owner type.",
    },
    schema: [],
  },
  create(context) {
    const facts = typeFacts(context.sourceCode);

    function check(value, destination) {
      if (!value || !destination) return;
      const kind = broadKind(destination, facts);
      if (!kind || !hasKnownEvidence(context, value)) return;
      // `{}` is how an accumulator starts.
      if ((kind === "dictionary" || kind === "container") && isEmptyObject(value)) return;
      context.report({ node: value, messageId: "widening", data: { kind: KIND_LABELS[kind] } });
    }

    function checkAssertion(node) {
      if (isAssertion(node.parent) && node.parent.expression === node) return;
      check(node.expression, node.typeAnnotation);
    }

    return {
      VariableDeclarator(node) {
        if (node.id.type === "Identifier") check(node.init, node.id.typeAnnotation?.typeAnnotation);
      },
      PropertyDefinition: (node) => check(node.value, node.typeAnnotation?.typeAnnotation),
      AccessorProperty: (node) => check(node.value, node.typeAnnotation?.typeAnnotation),
      AssignmentExpression(node) {
        if (node.operator !== "=" || node.left.type !== "Identifier") return;
        const variable = findVariable(context.sourceCode, node.left, node.left.name);
        const declarator = variable?.defs.length === 1 ? variable.defs[0].node : null;
        if (declarator?.type === "VariableDeclarator" && declarator.id.type === "Identifier") {
          check(node.right, declarator.id.typeAnnotation?.typeAnnotation);
        }
      },
      ReturnStatement(node) {
        if (node.argument) check(node.argument, nearestFunction(node)?.returnType?.typeAnnotation);
      },
      ArrowFunctionExpression(node) {
        if (node.body.type !== "BlockStatement") check(node.body, node.returnType?.typeAnnotation);
      },
      TSAsExpression: checkAssertion,
      TSTypeAssertion: checkAssertion,
    };
  },
};
