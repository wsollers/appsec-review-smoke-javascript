// Small helpers used by the API service. Deliberately vulnerable smoke target; see README.md.

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
