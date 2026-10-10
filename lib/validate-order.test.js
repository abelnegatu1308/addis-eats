import test from "node:test";
import assert from "node:assert/strict";
import { validateOrder } from "./validate-order.js";

test("order totals and item details are taken from the server catalog", async () => {
  const result = await validateOrder({
    name: "Abebe Kebede",
    phone: "09112345678",
    area: "Bole",
    items: [
      {
        id: "kitfo",
        name: "Forged name",
        price: 1,
        qty: 2,
        image: "https://attacker.example/image.jpg",
      },
    ],
    total: 2,
  });

  assert.equal(result.success, true);
  assert.equal(result.data.items[0].name, "Kitfo");
  assert.equal(result.data.items[0].price, 320);
  assert.equal(result.data.items[0].image, "/images/kitfo-authentic.webp");
  assert.equal(result.data.total, 640);
});

test("order validation rejects dish IDs absent from the server catalog", async () => {
  const result = await validateOrder({
    name: "Abebe Kebede",
    phone: "09112345678",
    area: "Bole",
    items: [{ id: "made-up", name: "Unknown", price: 1, qty: 1 }],
    total: 1,
  });

  assert.equal(result.success, false);
  assert.ok(result.fieldErrors.items);
});
