import { deref, dictionaryValues, expandAlias, refArgs, refName, typeFacts } from "../lib/types.mjs";

const CANDIDATES = ["TSTypeLiteral", "TSMappedType", "TSTypeReference", "TSTypeOperator"];

function isEmptyMembers(members) {
  return members.every(
    (member) =>
      member.type === "TSPropertySignature" && member.optional && member.typeAnnotation?.typeAnnotation?.type === "TSNeverKeyword",
  );
}

// Returns the escape hatch a value type amounts to, or null when it is concrete.
function escapeHatch(ref, facts, seen = new Set()) {
  if (!ref?.node) return null;
  const { node, env } = deref(ref, facts);
  switch (node?.type) {
    case "TSUnknownKeyword":
      return "unknown";
    case "TSAnyKeyword":
      return "any";
    case "TSObjectKeyword":
      return "object";
    case "TSTypeLiteral":
      return isEmptyMembers(node.members) ? "{}" : null;
    case "TSUnionType":
      for (const member of node.types) {
        const found = escapeHatch({ node: member, env }, facts, seen);
        if (found) return found;
      }
      return null;
    case "TSIntersectionType": {
      const found = node.types.map((member) => escapeHatch({ node: member, env }, facts, seen));
      if (found.includes("any")) return "any";
      return found.every(Boolean) ? found[0] : null;
    }
    case "TSTypeReference": {
      const name = refName(node);
      const declarations = facts.interfaces.get(name);
      if (declarations?.length === 1 && refArgs(node).length === 0) {
        const [declaration] = declarations;
        return !declaration.extends?.length && isEmptyMembers(declaration.body.body) ? `empty interface ${name}` : null;
      }
      const expanded = expandAlias({ node, env }, facts);
      if (!expanded || seen.has(expanded.alias)) return null;
      seen.add(expanded.alias);
      return escapeHatch(expanded, facts, seen);
    }
    default:
      return null;
  }
}

function looseValue(values, facts) {
  for (const value of values ?? []) {
    const found = escapeHatch(value, facts);
    if (found) return found;
  }
  return null;
}

function insideAliasDeclaration(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (current.type === "TSTypeAliasDeclaration") return true;
    if (!current.type.startsWith("TS")) return false;
  }
  return false;
}

export default {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow dictionaries (index signatures, `Record`, mapped types) whose values are `unknown`, `any`, `object`, or `{}`." },
    messages: {
      looseValues:
        "This dictionary's values are `{{hatch}}`, so every read needs a cast. Take the value type from its owner or schema, and parse heterogeneous payloads before inserting them.",
    },
    schema: [],
  },
  create(context) {
    const facts = typeFacts(context.sourceCode);

    function offending(node) {
      if (!CANDIDATES.includes(node.type)) return null;
      // A plain use of a non-generic local alias is reported once, at the alias.
      const name = refName(node);
      const alias = name ? facts.aliases.get(name) : null;
      if (alias && !alias.typeParameters?.params?.length && refArgs(node).length === 0 && !insideAliasDeclaration(node)) return null;
      return looseValue(dictionaryValues({ node }, facts), facts);
    }

    function hasOffendingAncestor(node) {
      for (let current = node.parent; current?.type.startsWith("TS"); current = current.parent) {
        if (offending(current)) return true;
      }
      return false;
    }

    function checkType(node) {
      const hatch = offending(node);
      if (hatch && !hasOffendingAncestor(node)) context.report({ node, messageId: "looseValues", data: { hatch } });
    }

    const visitor = Object.fromEntries(CANDIDATES.map((type) => [type, checkType]));
    visitor.TSIndexSignature = (node) => {
      if (node.parent?.type !== "TSInterfaceBody" && node.parent?.type !== "ClassBody") return;
      const hatch = escapeHatch({ node: node.typeAnnotation?.typeAnnotation }, facts);
      if (hatch) context.report({ node, messageId: "looseValues", data: { hatch } });
    };
    return visitor;
  },
};
