# Changelog

All notable changes to this project are documented in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- API service with an `/api/:op` dispatcher.
- npm manifest and lockfile; the TypeScript compiler is vendored under `node_modules/typescript`.

### Changed

- Builds with `strict` type checking.
- `tools/make-history.sh` reproduces the commit graph.

### Security

- 2026-02-11: Upgraded node-fetch from 2.6.0 to 2.6.7 (GHSA-r683-j2x4-v87g / CVE-2022-0235, secure headers forwarded to untrusted sites on redirect; also closes CVE-2020-15168).
- 2026-02-26: Fixed command injection in `runReport` (CWE-78); reports are now produced in-process from a fixed list.
- 2026-03-08: Fixed path traversal in `readTemplate` (CWE-22); only the base name of the requested template is used.
