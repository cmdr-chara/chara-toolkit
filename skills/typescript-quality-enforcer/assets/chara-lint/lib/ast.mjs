// Syntax helpers shared by the chara-lint rules. Everything here is purely
// syntactic and per-file: no type checker, no imports are followed.

export const FUNCTION_TYPES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
  "TSDeclareFunction",
  "TSEmptyBodyFunctionExpression",
]);

// Every construct that declares parameters or a return contract.
export const SIGNATURE_TYPES = new Set([
  ...FUNCTION_TYPES,
  "TSFunctionType",
  "TSConstructorType",
  "TSCallSignatureDeclaration",
  "TSConstructSignatureDeclaration",
  "TSMethodSignature",
]);

export function isAssertion(node) {
  return node?.type === "TSAsExpression" || node?.type === "TSTypeAssertion";
}

export function isConstAssertion(node) {
  if (!isAssertion(node)) return false;
  const target = node.typeAnnotation;
  return target?.type === "TSTypeReference" && target.typeName?.type === "Identifier" && target.typeName.name === "const";
}

// Strips wrappers that never change which value an expression produces.
export function stripValueWrappers(node) {
  let current = node;
  while (
    isAssertion(current) ||
    current?.type === "TSSatisfiesExpression" ||
    current?.type === "TSNonNullExpression"
  ) {
    current = current.expression;
  }
  return current;
}

export function signatureParams(node) {
  return node.params ?? node.parameters ?? [];
}

// The written type of a parameter, whatever form the parameter takes.
export function paramAnnotation(param) {
  switch (param?.type) {
    case "TSParameterProperty":
      return paramAnnotation(param.parameter);
    case "AssignmentPattern":
      return param.left?.typeAnnotation?.typeAnnotation ?? null;
    case "RestElement":
      return param.typeAnnotation?.typeAnnotation ?? param.argument?.typeAnnotation?.typeAnnotation ?? null;
    default:
      return param?.typeAnnotation?.typeAnnotation ?? null;
  }
}

export function paramDisplayName(param, sourceCode) {
  switch (param?.type) {
    case "Identifier":
      return param.name;
    case "TSParameterProperty":
      return paramDisplayName(param.parameter, sourceCode);
    case "AssignmentPattern":
      return paramDisplayName(param.left, sourceCode);
    case "RestElement":
      return paramDisplayName(param.argument, sourceCode);
    default: {
      const end = param.typeAnnotation ? param.typeAnnotation.range[0] : param.range[1];
      return sourceCode.text.slice(param.range[0], end).trim();
    }
  }
}

export function nearestFunction(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (FUNCTION_TYPES.has(current.type)) return current;
  }
  return null;
}

// The function body (or the module) that owns a node.
export function functionBoundary(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (FUNCTION_TYPES.has(current.type) || current.type === "Program") return current;
  }
  return null;
}

export function findVariable(sourceCode, node, name) {
  for (let scope = sourceCode.getScope(node); scope; scope = scope.upper) {
    const variable = scope.set.get(name);
    if (variable) return variable;
  }
  return null;
}

// True when the file itself declares `name` in a scope visible from `node`.
export function isDeclaredLocally(sourceCode, node, name) {
  const variable = findVariable(sourceCode, node, name);
  return Boolean(variable && variable.defs.length > 0);
}

// A `const` with one plain-identifier declaration, an initializer, and no
// later writes. Returns its declarator, or null.
export function stableConstDeclarator(sourceCode, identifier) {
  const variable = findVariable(sourceCode, identifier, identifier.name);
  if (!variable || variable.defs.length !== 1) return null;
  const [definition] = variable.defs;
  const declarator = definition.node;
  if (
    definition.type !== "Variable" ||
    declarator?.type !== "VariableDeclarator" ||
    declarator.id.type !== "Identifier" ||
    !declarator.init ||
    declarator.parent?.kind !== "const"
  ) {
    return null;
  }
  const rewritten = variable.references.some((reference) => reference.isWrite() && !reference.init);
  return rewritten ? null : declarator;
}

export function memberName(member) {
  if (member?.type !== "MemberExpression") return null;
  if (!member.computed && member.property.type === "Identifier") return member.property.name;
  if (member.computed && member.property.type === "Literal" && typeof member.property.value === "string") {
    return member.property.value;
  }
  return null;
}

export function stripWhitespace(text) {
  return text.replace(/\s+/g, "");
}

// A visitor that calls `handler` for every construct with a signature.
export function onSignatures(handler) {
  return Object.fromEntries([...SIGNATURE_TYPES].map((type) => [type, handler]));
}
