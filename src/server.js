// API service of the smoke target. This repository is a deliberately vulnerable smoke
// target for appsec-review; see README.md.
import express from "express";

const stats = { requests: 0, errors: 0 };

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
  app.listen(port);
}
