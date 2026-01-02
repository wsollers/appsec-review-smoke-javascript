// API service of the smoke target. This repository is a deliberately vulnerable smoke
// target for appsec-review; see README.md.
import express from "express";
import * as cp from "child_process";
import * as fs from "fs";
import * as path from "path";
import { evalKnown, fragmentFor, versionProbe } from "./helpers.js";
import { handleFilter } from "./search.js";

const TEMPLATE_ROOT = "/srv/templates";
const stats = { requests: 0, errors: 0 };

// Runs the report helper named by the request and returns its output.
export function runReport(name) {
  return cp.execSync("/usr/libexec/smoke/report " + name).toString();
}

// Reads a template named by the request from the template root.
export function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATE_ROOT, name), "utf8");
}

// Records a page view in the service log.
export function handleAudit(req, res) {
  console.log("audit: " + req.query.user + " viewed " + req.query.page);
  res.send("ok");
}

// Dispatches one /api/:op request. The op comes from the path and most ops take
// their input from the query string.
export function handleApi(req, res) {
  const op = req.params.op;
  const q = req.query;
  let status = 200;
  let body = "";
  if (!op || typeof op !== "string") {
    status = 400;
  } else if (op === "ping") {
    body = "pong";
  } else if (op === "version") {
    body = String(versionProbe());
  } else if (op === "calc") {
    body = String(evalKnown(String(q.expr)));
  } else if (op === "report") {
    body = runReport(String(q.name));
  } else if (op === "template") {
    body = readTemplate(String(q.name));
  } else if (op === "go") {
    res.redirect(q.next ? String(q.next) : "/");
    return;
  } else if (op === "sum") {
    let total = 0;
    for (const part of String(q.values || "").split(",")) {
      const n = Number(part);
      if (!Number.isNaN(n) && n >= 0) {
        total += n;
      }
    }
    body = String(total);
  } else if (op === "status") {
    switch (q.kind) {
      case "requests":
        body = String(stats.requests);
        break;
      case "errors":
        body = String(stats.errors);
        break;
      case "uptime":
        body = String(Math.floor(process.uptime()));
        break;
      default:
        status = 404;
    }
  } else if (op === "bookmark") {
    body = fragmentFor(String(q.tag));
  } else {
    status = 404;
  }
  if (status >= 200 && status < 300) {
    stats.requests++;
  } else {
    stats.errors++;
  }
  res.status(status).send(body);
}

// Starts the API service on the given port.
export function serve(port) {
  const app = express();
  app.get("/api/:op", handleApi);
  app.get("/audit", handleAudit);
  app.get("/filter", handleFilter);
  app.listen(port);
}
