// Type-syntax resolution shared by the chara-lint rules. "Resolves to" always
// means following type aliases declared in the same file; imported and inferred
// types are never consulted. Every resolution is cycle-safe.

const BUILTIN_NAMES = new Set(["Record", "Readonly", "Partial", "Required", "Pick", "Omit", "PropertyKey", "NonNullable"]);
const TRANSPARENT_UTILITIES = new Set(["Readonly", "Partial", "Required", "NonNullable"]);
const EMPTY_ENV = new Map();
const factsCache = new WeakMap();

function declarationOf(statement) {
  if (statement.type === "ExportNamedDeclaration" || statement.type === "ExportDefaultDeclaration") {
    return statement.declaration ?? null;
  }
  return statement;
}

// Module-level type facts, computed once per file.
export function typeFacts(sourceCode) {
  const program = sourceCode.ast;
  let facts = factsCache.get(program);
  if (facts) return facts;
  const aliases = new Map();
  const interfaces = new Map();
  const boundNames = new Set();
  for (const statement of program.body) {
    if (statement.type === "ImportDeclaration") {
      for (const specifier of statement.specifiers) boundNames.add(specifier.local.name);
      continue;
    }
    const declaration = declarationOf(statement);
    if (!declaration?.id || declaration.id.type !== "Identifier") continue;
    const name = declaration.id.name;
    boundNames.add(name);
    if (declaration.type === "TSTypeAliasDeclaration" && !aliases.has(name)) aliases.set(name, declaration);
    if (declaration.type === "TSInterfaceDeclaration") {
      interfaces.set(name, [...(interfaces.get(name) ?? []), declaration]);
    }
  }
  facts = { aliases, interfaces, boundNames };
  factsCache.set(program, facts);
  return facts;
}

export function isBuiltin(name, facts) {
  return BUILTIN_NAMES.has(name) && !facts.boundNames.has(name);
}

export function refName(type) {
  return type?.type === "TSTypeReference" && type.typeName?.type === "Identifier" ? type.typeName.name : null;
}

export function refArgs(type) {
  return type?.typeArguments?.params ?? [];
}

export function typeParamNames(declaration) {
  const params = declaration?.typeParameters?.params ?? [];
  return params.map((param) => (typeof param.name === "string" ? param.name : param.name?.name));
}

// Parentheses and `readonly` never change what a type is. With `utilities`,
// the built-in Readonly/Partial/Required/NonNullable are looked through too.
export function unwrap(type, facts, utilities = false) {
  let current = type;
  for (;;) {
    if (current?.type === "TSParenthesizedType") current = current.typeAnnotation;
    else if (current?.type === "TSTypeOperator" && current.operator === "readonly") current = current.typeAnnotation;
    else if (utilities && TRANSPARENT_UTILITIES.has(refName(current)) && isBuiltin(refName(current), facts) && refArgs(current).length === 1) {
      current = refArgs(current)[0];
    } else return current;
  }
}

function collectInferNames(node, names) {
  if (!node || typeof node !== "object") return;
  if (node.type === "TSInferType") {
    const param = node.typeParameter;
    names.add(typeof param?.name === "string" ? param.name : param?.name?.name);
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === "parent") continue;
    if (Array.isArray(value)) value.forEach((item) => collectInferNames(item, names));
    else if (value && typeof value.type === "string") collectInferNames(value, names);
  }
}

// Type-parameter names in scope at `node`: enclosing generic declarations,
// mapped-type keys (inside the value or `as` clause), and `infer` variables
// (inside the true branch of their conditional type).
export function typeParamsInScope(node) {
  const names = new Set();
  for (let child = node, current = node.parent; current; child = current, current = current.parent) {
    if (current.typeParameters?.type === "TSTypeParameterDeclaration") {
      for (const name of typeParamNames(current)) names.add(name);
    }
    if (current.type === "TSMappedType" && (child === current.typeAnnotation || child === current.nameType)) {
      const key = current.key ?? current.typeParameter?.name;
      names.add(typeof key === "string" ? key : key?.name);
    }
    if (current.type === "TSConditionalType" && child === current.trueType) collectInferNames(current.extendsType, names);
  }
  return names;
}

// A reference to a module-level, non-generic alias written without type
// arguments and not shadowed by a type parameter. Returns the alias or null.
export function plainTopAlias(type, facts) {
  const name = refName(type);
  if (!name || refArgs(type).length > 0 || typeParamsInScope(type).has(name)) return null;
  const alias = facts.aliases.get(name);
  return alias && !alias.typeParameters?.params?.length ? alias : null;
}

// Follows module-level non-generic aliases until `isOffending` decides.
// `isOffending(type, recurse)` gets a recurse callback for nested positions.
export function resolvesTo(type, facts, isOffending, seen = new Set()) {
  const recurse = (inner) => resolvesTo(inner, facts, isOffending, seen);
  const current = unwrap(type, facts);
  if (isOffending(current, recurse)) return true;
  const alias = plainTopAlias(current, facts);
  if (!alias || seen.has(alias)) return false;
  seen.add(alias);
  return recurse(alias.typeAnnotation);
}

// Generic-aware resolution. A ref is `{ node, env }`, where env maps type
// parameter names to the refs they were instantiated with.
export function bindAlias(alias, args, callerEnv) {
  const params = alias.typeParameters?.params ?? [];
  const env = new Map();
  for (const [index, param] of params.entries()) {
    const name = typeof param.name === "string" ? param.name : param.name?.name;
    if (args[index]) env.set(name, { node: args[index], env: callerEnv });
    else if (param.default) env.set(name, { node: param.default, env });
    else return null;
  }
  return env;
}

export function deref(ref, facts, utilities = true) {
  let current = { node: unwrap(ref.node, facts, utilities), env: ref.env ?? EMPTY_ENV };
  const seen = new Set();
  for (;;) {
    const name = refName(current.node);
    if (!name || refArgs(current.node).length > 0 || !current.env.has(name) || seen.has(current.node)) return current;
    seen.add(current.node);
    const bound = current.env.get(name);
    current = { node: unwrap(bound.node, facts, utilities), env: bound.env };
  }
}

// Expands a reference to a module-level alias (generic or not). Returns the
// alias body as a ref, or null when it is not a resolvable local alias.
export function expandAlias(ref, facts) {
  const name = refName(ref.node);
  if (!name || isBuiltin(name, facts) || typeParamsInScope(ref.node).has(name)) return null;
  const alias = facts.aliases.get(name);
  if (!alias) return null;
  const env = bindAlias(alias, refArgs(ref.node), ref.env ?? EMPTY_ENV);
  return env ? { node: alias.typeAnnotation, env, alias } : null;
}

export function isBroadKey(type, facts) {
  const current = unwrap(type, facts);
  if (["TSStringKeyword", "TSNumberKeyword", "TSSymbolKeyword"].includes(current?.type)) return true;
  if (refName(current) === "PropertyKey" && isBuiltin("PropertyKey", facts)) return true;
  return current?.type === "TSUnionType" && current.types.every((member) => isBroadKey(member, facts));
}

function mappedConstraint(mapped) {
  return mapped.constraint ?? mapped.typeParameter?.constraint ?? null;
}

// Value-type refs of an open dictionary, or null when the type is not one.
// Only open key domains count: finite keys (`Record<"a" | "b", V>`) and
// homomorphic mapped types (`{ [K in keyof T]: V }`) describe fixed shapes.
export function dictionaryValues(ref, facts, seen = new Set()) {
  const { node, env } = deref(ref, facts);
  if (!node) return null;
  if (node.type === "TSTypeLiteral") {
    const signatures = node.members.filter((member) => member.type === "TSIndexSignature");
    return signatures.length ? signatures.map((signature) => ({ node: signature.typeAnnotation?.typeAnnotation, env })) : null;
  }
  if (node.type === "TSMappedType") {
    return node.typeAnnotation && isBroadKey(mappedConstraint(node), facts) ? [{ node: node.typeAnnotation, env }] : null;
  }
  const name = refName(node);
  if (!name) return null;
  const args = refArgs(node);
  if (name === "Record" && isBuiltin(name, facts)) {
    return args.length === 2 && isBroadKey(deref({ node: args[0], env }, facts, false).node, facts) ? [{ node: args[1], env }] : null;
  }
  if ((name === "Pick" || name === "Omit") && isBuiltin(name, facts)) {
    return args.length ? dictionaryValues({ node: args[0], env }, facts, seen) : null;
  }
  const expanded = expandAlias({ node, env }, facts);
  if (!expanded || seen.has(expanded.alias)) return null;
  seen.add(expanded.alias);
  return dictionaryValues(expanded, facts, seen);
}

// Visible type aliases by lexical scope: module, enclosing blocks, and
// enclosing namespaces. The innermost declaration of a name wins.
const containerCache = new WeakMap();

function aliasesDeclaredIn(container) {
  let aliases = containerCache.get(container);
  if (aliases) return aliases;
  aliases = new Map();
  const statements = container.body ?? container.consequent ?? [];
  for (const statement of Array.isArray(statements) ? statements : []) {
    const declaration = declarationOf(statement);
    if (declaration?.type === "TSTypeAliasDeclaration" && !aliases.has(declaration.id.name)) {
      aliases.set(declaration.id.name, declaration);
    }
  }
  containerCache.set(container, aliases);
  return aliases;
}

export function visibleAlias(name, fromNode) {
  for (let current = fromNode.parent; current; current = current.parent) {
    if (["Program", "BlockStatement", "TSModuleBlock", "StaticBlock", "SwitchCase"].includes(current.type)) {
      const alias = aliasesDeclaredIn(current).get(name);
      if (alias) return alias;
    }
  }
  return null;
}
