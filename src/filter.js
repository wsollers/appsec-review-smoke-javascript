// Item search for the API service. Deliberately vulnerable smoke target; see README.md.
const ITEMS = ["alpha", "beta", "gamma", "delta"];

// Returns the items whose name matches the pattern from the query string.
export function handleFilter(req, res) {
  const re = new RegExp(req.query.pattern);
  const hits = [];
  for (const item of ITEMS) {
    if (re.test(item)) {
      hits.push(item);
    }
  }
  res.json(hits);
}
