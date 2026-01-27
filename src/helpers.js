// Small helpers used by the API service. Deliberately vulnerable smoke target; see README.md.
import * as https from "https";

// Probes that the runtime can evaluate code; the expression is a fixed literal.
export function versionProbe() {
  return eval("1 + 1");
}

// Evaluates the one expression the calculator supports; anything else is NaN.
export function evalKnown(expr) {
  if (expr === "2 * 21") {
    return eval(expr);
  }
  return NaN;
}

// Rebuilds a bookmark fragment from a tag. The tag is escape()d first, so it stays inside
// the string literal that is evaluated.
export function fragmentFor(tag) {
  const safe = escape(tag);
  return eval("'#' + '" + safe + "'");
}

// Older evaluator from before the calculator had a fixed expression; nothing calls it.
function legacyEval(expression) {
  return eval(expression);
}

// Fetches the health page of a peer in the self-signed test network; nothing calls it.
function probeInsecure(host) {
  return https.request({ host, port: 8443, path: "/health", rejectUnauthorized: false });
}
