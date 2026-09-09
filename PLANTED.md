# Planted inventory

This repository is a smoke target for appsec-review. Everything below is deliberate. The
evaluation answer key lives in the separate `appsec-review-smoke-guide` repository; this file
describes the target, it is not the key.

Line numbers refer to the tagged head. The fixture files `src/app.js`, `src/cli.js` and
`src/store.ts` are byte-identical to `tests/fixtures/graph/codeql_export/javascript-synthetic/source/`
in appsec-review, so the line numbers its `expected-facts.json` cites are unchanged.

## True positives, code

| Id | Weakness | Where | Source to sink |
| --- | --- | --- | --- |
| TP-C1 | CWE-89 SQL injection | `src/app.js` `handleSql` | `req.query.id` through `buildQuery` to `pool.query` |
| TP-C2 | CWE-78 command injection | `src/app.js` `handleExec` | `req.query.host` to `cp.exec("nslookup " + host)` (the unguarded call) |
| TP-C3 | CWE-918 server-side request forgery | `src/app.js` `handleFetch` | `req.query.url` to `http.get` |
| TP-C4 | CWE-502 unsafe deserialization | `src/app.js` `handleRestore` | `req.body` to `serialize.unserialize` |
| TP-C5 | CWE-79 reflected cross-site scripting | `src/app.js` `handleEcho` | `req.query.name` to `res.send` |
| TP-C6 | CWE-78 command injection | `src/cli.js` `runCommand` | `process.argv`, `process.env` and `readlineSync.question` to `cp.execSync` |
| TP-C7 | CWE-601 open redirect | `src/server.js` `handleApi`, `go` op | `req.query.next` to `res.redirect` |
| TP-C8 | CWE-117 log injection | `src/server.js` `handleAudit` | `req.query.user` and `req.query.page` to `console.log` |
| TP-C9 | CWE-730 regular expression injection | `src/filter.js` `handleFilter` | `req.query.pattern` to `new RegExp` |

## True positives, dependencies

Declared in `package.json` and pinned in `package-lock.json` (lockfile version 3, with `resolved`
and `integrity` for every entry); none is installed, imported or needed by the build. SBOM tools
that read the lockfile see them.

| Id | Package | Version | Advisory | Fixed in | How declared |
| --- | --- | --- | --- | --- | --- |
| TP-D1 | lodash | 4.17.15 | GHSA-p6mc-m468-83gw (CVE-2020-8203); also GHSA-35jh-r3h4-6jhm, GHSA-29mw-wpgm-hmr9 | 4.17.19 (4.17.21 for the others) | direct dependency |
| TP-D2 | ws | 7.4.5 | GHSA-6fc8-4gx4-v693 (CVE-2021-32640); also GHSA-3h5v-q93c-6h6q, GHSA-96hv-2xvq-fx4p | 7.4.6 (7.5.10 and 7.5.11 for the others) | direct dependency |
| TP-D3 | minimist | 0.0.8 | GHSA-vh95-rmgr-6w4m (CVE-2020-7598); also GHSA-xvch-5gv4-984h | 0.2.1 (0.2.4 for the other) | transitive pin of `mkdirp` 0.5.1 |

## Fixed in history

| Id | What | Introduced | Fixed |
| --- | --- | --- | --- |
| FX-C1 | CWE-78 command injection in `runReport` (`execSync` with the request's report name) | "Add a report op that runs the report helper" | "Fix command injection in runReport (CWE-78)": the sink was removed |
| FX-C2 | CWE-22 path traversal in `readTemplate` | "Add a template op that serves files from the template root" | "Fix path traversal in readTemplate (CWE-22)": `path.basename` now dominates `readFileSync` |
| FX-D1 | node-fetch 2.6.0 (GHSA-r683-j2x4-v87g / CVE-2022-0235) | "Add node-fetch 2.6.0 for the upstream probe" | "Upgrade node-fetch from 2.6.0 to 2.6.7" |

`SECURITY.md` and `CHANGELOG.md` describe the three fixed items and nothing else. node-fetch 2.6.7
brings `whatwg-url` 5.0.0, `tr46` 0.0.3 and `webidl-conversions` 3.0.1 into the lockfile; all
three have no OSV record.

## False positives

Each is flagged by a rule under appsec-review `rules/semgrep/` and refuted by a code-intelligence
fact. appsec-review mounts no SEI CERT rules for JavaScript.

| Id | Where | Flagged by | Refuted by |
| --- | --- | --- | --- |
| FP-1 | `src/helpers.js` `versionProbe`: `eval("1 + 1")` | `appsec-review.javascript-dangerous-eval` | constant operand: no `dataflow_path` reaches the sink |
| FP-2 | `src/helpers.js` `evalKnown`: `eval(expr)` | `appsec-review.javascript-dangerous-eval` | `guard_fact`: `expr === "2 * 21"` dominates the sink and constrains its operand |
| FP-3 | `src/helpers.js` `fragmentFor`: `eval("'#' + '" + safe + "'")` | `appsec-review.javascript-dangerous-eval` | `path_sanitizers`: `escape` (a catalog sanitizer) dominates the sink on the only path from `req.query.tag` |
| FP-4 | `src/helpers.js` `legacyEval`: `eval(expression)` | `appsec-review.javascript-dangerous-eval` | dead code: no callers, no export, no entry point, so no `dataflow_path` reaches it |
| FP-5 | `src/helpers.js` `probeInsecure`: `rejectUnauthorized: false` | `appsec-review.review-signal.privilege_shift.node-tls-verification-disabled` | dead code: no callers, no export, no entry point, so no `dataflow_path` reaches it |

## High-complexity function

`handleApi` in `src/server.js` is the dispatcher of the API service and the function the history
touches most. It holds TP-C7. Its intended cyclomatic complexity is above 15 by the appsec-review
counter (branches, loops, boolean operators, switch cases and conditional expressions); the
measured value is recorded in the guide.

## Code-intelligence cases

`src/app.js`, `src/cli.js` and `src/store.ts` carry the appsec-review JavaScript graph-export
fixture unchanged: a sanitized path (`handleFile`, `path.basename`), a dominating and a
non-dominating guard (`handleExec`), a cross-function flow summary (`buildQuery`, `runCommand`),
argv, environment and `readline-sync` sources, interface dispatch (`persist` to `MemoryStore.save`
or `FileStore.save`), an unresolved indirect call (`invoke`) and `Math.random`. The fixed state of
`readTemplate` adds a second `path.basename` sanitizer. `src/store.ts` is the one TypeScript file,
so the Node-dependent extractor path runs.

## History

Produced by `tools/make-history.sh` from `tools/history/steps/`: 38 commits by three synthetic
authors, dated 2025-05 to 2026-09, including the introduction and fix of each fixed item, a
dependency upgrade, a rename (`src/search.js` to `src/filter.js`), a revert and its reapply, a
hardening review that adds `SECURITY.md`, and a commit body that records an investigated report
found not exploitable (FP-2). The vendoring commit adds the TypeScript compiler; every other commit
except the first touches at most three files.
