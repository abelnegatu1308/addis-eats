import test from "node:test";
import assert from "node:assert/strict";
import {
  createDish,
  deleteDish,
  getAdminDishes,
  getDish,
  updateDish,
} from "./data.js";

test("menu catalog supports staff CRUD while hiding unavailable dishes from customers", async () => {
  const dish = {
    id: "admin-crud-test-dish",
    name: "Admin CRUD Test Dish",
    category: "snack",
    price: 75,
    image: "/images/sambusa.webp",
    description: "Temporary menu item for the catalog CRUD test.",
    ingredients: "Test ingredients",
    prepTime: "5 min",
    available: true,
  };

  try {
    const created = await createDish(dish);
    assert.equal(created.status, "success");
    assert.equal((await getDish(dish.id)).name, dish.name);

    const changed = { ...dish, price: 90, available: false };
    assert.equal(await updateDish(dish.id, changed), true);
    assert.equal(await getDish(dish.id), null);
    assert.equal((await getAdminDishes()).find((item) => item.id === dish.id).price, 90);

    assert.equal(await deleteDish(dish.id), true);
    assert.equal(await deleteDish(dish.id), false);
  } finally {
    await deleteDish(dish.id);
  }
});
