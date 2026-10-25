import { reflectCallRule } from "../lib/reflect-call.mjs";

export default reflectCallRule(
  "get",
  "Disallow reading properties through `Reflect.get`.",
  "`Reflect.get` returns an unchecked value. Use typed property access, or parse dynamic input into a domain type first.",
);
