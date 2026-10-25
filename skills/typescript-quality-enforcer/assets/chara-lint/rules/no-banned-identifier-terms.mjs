export default {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow identifiers that describe structure instead of domain meaning (default term: `shape`)." },
    messages: {
      bannedTerm: "`{{name}}` contains the banned term `{{term}}`. Name it after its domain role or owner instead of its structure.",
    },
    schema: [
      {
        type: "object",
        properties: {
          terms: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
          ignoreForeignMembers: { type: "boolean", default: false },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] ?? {};
    const terms = (options.terms ?? ["shape"]).map((term) => term.toLowerCase());
    const reported = new Set();

    function check(node, name) {
      const lowered = name.toLowerCase();
      const term = terms.find((candidate) => lowered.includes(candidate));
      const key = `${node.range[0]}:${node.range[1]}`;
      if (!term || reported.has(key)) return;
      // A property read on another object is that object's API, not a name this file chose.
      if (options.ignoreForeignMembers && node.parent?.type === "MemberExpression" && node.parent.property === node && !node.parent.computed) {
        return;
      }
      reported.add(key);
      context.report({ node, messageId: "bannedTerm", data: { name, term } });
    }

    return {
      Identifier: (node) => check(node, node.name),
      PrivateIdentifier: (node) => check(node, node.name),
      JSXIdentifier: (node) => check(node, node.name),
    };
  },
};
