// Entry point of the smoke service. Deliberately vulnerable smoke target; see README.md.
import { main } from "./app.js";
import { runFromArgs } from "./cli.js";
import { serve } from "./server.js";

if (process.argv[2] === "run") {
  runFromArgs();
} else {
  main();
  serve(8081);
}
