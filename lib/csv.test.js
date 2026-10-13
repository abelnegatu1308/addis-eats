import test from "node:test";
import assert from "node:assert/strict";

import { escapeCsvValue, rowsToCsv } from "./csv.js";

test("csv escaping keeps quoted values valid", () => {
  assert.equal(escapeCsvValue('hello, world'), '"hello, world"');
  assert.equal(escapeCsvValue('"quoted" value'), '"""quoted"" value"');
  assert.equal(escapeCsvValue('line\n2'), '"line\n2"');
});

test("rows to csv serializes tabular data with headers", () => {
  const csv = rowsToCsv(
    [{ orderId: "abc", items: "Doro x2, Kitfo" }],
    ["orderId", "items"],
  );

  assert.equal(
    csv,
    'orderId,items\nabc,"Doro x2, Kitfo"',
  );
});
