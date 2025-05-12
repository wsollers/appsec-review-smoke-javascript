# appsec-review-smoke-javascript

A deliberately vulnerable **smoke target** for [appsec-review](https://github.com/wsollers/appsec-review).
It exists so that a review of a tiny, fully understood JavaScript and TypeScript program has one
correct answer at every stage. **Do not deploy, run against untrusted input, or reuse any of this
code.**

The program is a toy HTTP service: `src/app.js`, `src/cli.js` and `src/store.ts` are the
appsec-review code-graph fixture modules and `src/server.js` is a small `/api/:op` dispatcher.

## License

MIT; see `LICENSE`. The vendored TypeScript compiler under `node_modules/typescript` keeps its own
license (Apache-2.0).
