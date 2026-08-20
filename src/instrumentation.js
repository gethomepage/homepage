import { applyNextAuthEnv } from "utils/env";

export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  applyNextAuthEnv();
}
