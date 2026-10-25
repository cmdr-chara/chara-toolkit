import { refArgs, refName, typeParamsInScope, visibleAlias } from "../lib/types.mjs";

function isUnknownAlias(type, seen) {
  if (type?.type === "TSParenthesizedType") return isUnknownAlias(type.typeAnnotation, seen);
  if (type?.type === "TSUnknownKeyword") return true;
  if (type?.type === "TSUnionType") return type.types.some((member) => isUnknownAlias(member, seen));
  const name = refName(type);
  if (!name || refArgs(type).length > 0 || typeParamsInScope(type).has(name)) return false;
  const alias = visibleAlias(name, type);
  if (!alias || seen.has(alias) || alias.typeParameters?.params?.length) return false;
  seen.add(alias);
  return isUnknownAlias(alias.typeAnnotation, seen);
}

export default {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow type aliases that are `unknown` under another name." },
    messages: {
      unknownAlias:
        "`{{name}}` is `unknown` under a friendlier name, so unparsed values travel as if they had a type. Keep `unknown` visible at the boundary and give parsed values a real type.",
    },
    schema: [],
  },
  create(context) {
    return {
      TSTypeAliasDeclaration(node) {
        // The declaring alias is excluded from its own resolution.
        if (isUnknownAlias(node.typeAnnotation, new Set([node]))) {
          context.report({ node: node.id, messageId: "unknownAlias", data: { name: node.id.name } });
        }
      },
    };
  },
};
