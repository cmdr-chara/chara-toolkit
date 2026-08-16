import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

type AliasScope = ESTree.Node & { readonly body: readonly ESTree.Node[] };

function referencedAliasName(type: ESTree.TSType): string | null {
  if (type.type === "TSParenthesizedType") return referencedAliasName(type.typeAnnotation);
  if (type.type !== "TSTypeReference" || type.typeName.type !== "Identifier") return null;
  return type.typeArguments === null ||
    type.typeArguments === undefined ||
    type.typeArguments.params.length === 0
    ? type.typeName.name
    : null;
}

function isAliasScope(node: ESTree.Node): node is AliasScope {
  const type = node.type as string;
  return (
    (type === "Program" || type === "BlockStatement" || type === "TSModuleBlock") &&
    "body" in node &&
    Array.isArray(node.body)
  );
}

function declaredAlias(node: ESTree.Node): ESTree.TSTypeAliasDeclaration | null {
  if (node.type === "TSTypeAliasDeclaration") return node;
  if (
    node.type === "ExportNamedDeclaration" &&
    node.declaration?.type === "TSTypeAliasDeclaration"
  ) {
    return node.declaration;
  }
  return null;
}

function aliasesVisibleFrom(node: ESTree.Node): ReadonlyMap<string, ESTree.TSTypeAliasDeclaration> {
  const scopes: AliasScope[] = [];
  let current: ESTree.Node | null = node.parent;
  while (current !== null) {
    if (isAliasScope(current)) scopes.push(current);
    current = current.parent;
  }

  const aliases = new Map<string, ESTree.TSTypeAliasDeclaration>();
  for (const scope of scopes.reverse()) {
    for (const statement of scope.body) {
      const alias = declaredAlias(statement);
      if (alias !== null) aliases.set(alias.id.name, alias);
    }
  }
  return aliases;
}

/** Ban named aliases that merely conceal TypeScript's unknown top type. */
export const noUnknownTypeAliasesRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow type aliases whose resolved type is unknown; unknown must remain visible at an allowed boundary.",
    },
    messages: {
      unknownAlias:
        "Type alias `{{alias}}` hides `unknown`. Keep `unknown` explicit at the parsing boundary or on an allowed `cause` field; otherwise use the parsed owner type.",
    },
  },
  createOnce(context) {
    const resolvesToUnknown = (
      type: ESTree.TSType,
      aliases: ReadonlyMap<string, ESTree.TSTypeAliasDeclaration>,
      visited = new Set<string>(),
    ): boolean => {
      if (type.type === "TSUnknownKeyword") return true;
      if (type.type === "TSParenthesizedType") {
        return resolvesToUnknown(type.typeAnnotation, aliases, visited);
      }
      if (type.type === "TSUnionType") {
        return type.types.some((member) => resolvesToUnknown(member, aliases, visited));
      }
      const name = referencedAliasName(type);
      if (name === null || visited.has(name)) return false;
      const alias = aliases.get(name);
      if (
        alias === undefined ||
        (alias.typeParameters !== null && alias.typeParameters !== undefined)
      ) {
        return false;
      }
      const nextVisited = new Set(visited);
      nextVisited.add(name);
      return resolvesToUnknown(alias.typeAnnotation, aliases, nextVisited);
    };

    return {
      TSTypeAliasDeclaration(node) {
        const aliases = aliasesVisibleFrom(node);
        if (!resolvesToUnknown(node.typeAnnotation, aliases, new Set([node.id.name]))) return;
        context.report({
          node: node.id,
          messageId: "unknownAlias",
          data: { alias: node.id.name },
        });
      },
    };
  },
});
