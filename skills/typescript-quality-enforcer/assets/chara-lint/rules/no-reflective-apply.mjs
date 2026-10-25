import { reflectCallRule } from "../lib/reflect-call.mjs";

export default reflectCallRule(
  "apply",
  "Disallow calling functions through `Reflect.apply`.",
  "`Reflect.apply` skips parameter and return checking. Call the function directly or dispatch through a typed table.",
);
