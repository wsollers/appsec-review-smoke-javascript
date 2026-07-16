# appsec-review-smoke-javascript

A deliberately vulnerable **smoke target** for [appsec-review](https://github.com/wsollers/appsec-review).
It exists so that a review of a tiny, fully understood JavaScript and TypeScript program has one
correct answer at every stage. **Do not deploy, run against untrusted input, or reuse any of this
code.**

The program is a toy HTTP service: `src/app.js`, `src/cli.js` and `src/store.ts` are the
appsec-review code-graph fixture modules and `src/server.js` is a small `/api/:op` dispatcher.

## Build

One npm package, no network, no generated code. The compiler is vendored, so there is no install
step; the fixture modules import packages (`express`, `pg`, `node-serialize`, `readline-sync`)
that are deliberately not declared and never resolved, and `allowJs` without `checkJs` compiles
them as they are:

```sh
node node_modules/typescript/bin/tsc -p tsconfig.json
```

The build is expected to succeed in the appsec-review `node` build image (Node 22) as an
unprivileged user with networking disabled, writing only to the output directory.

## History

`tools/make-history.sh` rebuilds this repository's commit graph from `tools/history/steps/` with
fixed authors and dates, so the history is reproducible and can be reviewed as code.

## License

MIT; see `LICENSE`. The vendored TypeScript compiler under `node_modules/typescript` keeps its own
license (Apache-2.0).
