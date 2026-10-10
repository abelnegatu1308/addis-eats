import "server-only";
import { getDatabase } from "../../lib/db.js";

const dishes = [
  {
    id: "kitfo",
    name: "Kitfo",
    category: "traditional",
    price: 320,
    image: "/images/kitfo-authentic.webp",
    description: "Finely chopped beef seasoned with mitmita and spiced clarified butter, served with ayib and injera.",
    ingredients: "Beef, niter kibbeh, mitmita, ayib, injera",
    prepTime: "20 min",
  },
  {
    id: "shiro",
    name: "Shiro",
    category: "traditional",
    price: 180,
    image: "/images/shiro.webp",
    description: "A warming chickpea stew slowly simmered with berbere, garlic, ginger and onions, served with injera.",
    ingredients: "Chickpea flour, berbere, garlic, ginger, onions, injera",
    prepTime: "30 min",
  },
  {
    id: "doro-wat",
    name: "Doro Wat",
    category: "traditional",
    price: 280,
    image: "/images/ethiopian-wat.webp",
    description: "Chicken slow-cooked in a rich berbere sauce with onions and a hard-boiled egg, served on injera.",
    ingredients: "Chicken, berbere, onions, garlic, ginger, egg, injera",
    prepTime: "45 min",
  },
  {
    id: "tibs",
    name: "Tibs",
    category: "traditional",
    price: 320,
    image: "/images/ethiopian-food.webp",
    description: "Tender beef sautéed with onions, tomatoes, green peppers, rosemary, and Ethiopian spices.",
    ingredients: "Beef, onions, tomatoes, green peppers, garlic, rosemary, oil",
    prepTime: "30 min"
  },
  {
    id: "beyaynetu",
    name: "Beyaynetu",
    category: "traditional",
    price: 250,
    image: "/images/ethiopian-fasting-platter.webp",
    description: "A colorful vegetarian platter of Ethiopian lentils, vegetables, and traditional stews served on injera.",
    ingredients: "Injera, misir wat, shiro, gomen, tikil gomen, vegetables",
    prepTime: "40 min"
  },
  {
    id: "misir-wat",
    name: "Misir Wat",
    category: "traditional",
    price: 180,
    image: "/images/misir-wat.webp",
    description: "Red lentils slowly cooked with berbere, onions, garlic, and traditional Ethiopian spices.",
    ingredients: "Red lentils, berbere, onions, garlic, ginger, oil",
    prepTime: "35 min"
  },
  {
    id: "gomen",
    name: "Gomen",
    category: "traditional",
    price: 150,
    image: "/images/gomen.webp",
    description: "Chopped collard greens cooked with garlic, onions, and aromatic Ethiopian seasonings.",
    ingredients: "Collard greens, onions, garlic, ginger, oil, salt",
    prepTime: "25 min"
  },
  {
    id: "tikil-gomen",
    name: "Tikil Gomen",
    category: "traditional",
    price: 160,
    image: "/images/tikil-gomen.webp",
    description: "A comforting Ethiopian cabbage dish cooked with carrots, potatoes, onions, and turmeric.",
    ingredients: "Cabbage, carrots, potatoes, onions, turmeric, oil",
    prepTime: "30 min"
  },
  {
    id: "dulet",
    name: "Dulet",
    category: "traditional",
    price: 300,
    image: "/images/dulet.jpg",
    description: "A flavorful Ethiopian dish of finely chopped meat and offal seasoned with spiced butter, garlic, and chili.",
    ingredients: "Beef or lamb, offal, onions, garlic, mitmita, spiced butter",
    prepTime: "35 min"
  },
  {
    id: "firfir",
    name: "Firfir",
    category: "traditional",
    price: 180,
    image: "/images/firfir.webp",
    description: "Pieces of injera mixed with a spicy berbere sauce and sautéed onions, served as a traditional Ethiopian meal.",
    ingredients: "Injera, berbere, onions, garlic, oil or spiced butter",
    prepTime: "20 min"
  },
  {
    id: "chechebsa",
    name: "Chechebsa",
    category: "traditional",
    price: 160,
    image: "/images/chechebsa.jpg",
    description: "Pieces of flatbread tossed with spiced butter and berbere, often served with honey or yogurt.",
    ingredients: "Flatbread, spiced butter, berbere, honey or yogurt",
    prepTime: "20 min"
  },
  {
    id: "asa-tibs",
    name: "Asa Tibs",
    category: "traditional",
    price: 300,
    image: "/images/asa-tibs.webp",
    description: "Fish pieces sautéed or fried with onions, peppers, lemon, and Ethiopian spices.",
    ingredients: "Fish, onions, green peppers, garlic, lemon, oil",
    prepTime: "25 min"
  },
  {
    id: "sambusa",
    name: "Sambusa",
    category: "snack",
    price: 50,
    image: "/images/sambusa.webp",
    description: "Crispy triangular pastries filled with seasoned lentils or minced beef.",
    ingredients: "Pastry, lentils or beef, onions, green chili, spices, oil",
    prepTime: "25 min"
  },
  {
    id: "chips",
    name: "French Fries",
    category: "fast-food",
    price: 100,
    image: "/images/chips.webp",
    description: "Golden crispy potato fries seasoned with salt and served hot.",
    ingredients: "Potatoes, oil, salt",
    prepTime: "20 min"
  },
  {
    id: "burger",
    name: "Beef Burger",
    category: "fast-food",
    price: 250,
    image: "/images/burger.webp",
    description: "A juicy beef patty served in a toasted bun with lettuce, tomato, onions, and sauce.",
    ingredients: "Beef patty, burger bun, lettuce, tomato, onions, sauce",
    prepTime: "20 min"
  },
  {
    id: "pizza",
    name: "Pizza",
    category: "fast-food",
    price: 350,
    image: "/images/pizza.webp",
    description: "Oven-baked pizza topped with tomato sauce, melted cheese, and assorted toppings.",
    ingredients: "Pizza dough, tomato sauce, cheese, vegetables, meat toppings",
    prepTime: "30 min"
  },
  {
    id: "pasta",
    name: "Pasta with Tomato Sauce",
    category: "main-course",
    price: 220,
    image: "/images/pasta.webp",
    description: "Pasta tossed in a rich tomato sauce with garlic, onions, and herbs.",
    ingredients: "Pasta, tomatoes, onions, garlic, herbs, oil",
    prepTime: "25 min"
  },
  {
    id: "rice",
    name: "Rice with Vegetables",
    category: "main-course",
    price: 200,
    image: "/images/rice.webp",
    description: "Fluffy rice cooked with mixed vegetables and aromatic seasonings.",
    ingredients: "Rice, carrots, peas, onions, garlic, oil, spices",
    prepTime: "25 min"
  },
  {
    id: "club-sandwich",
    name: "Club Sandwich",
    category: "snack",
    price: 200,
    image: "/images/club-sandwich.webp",
    description: "A toasted layered sandwich filled with egg, chicken, lettuce, tomato, and mayonnaise.",
    ingredients: "Bread, chicken, egg, lettuce, tomato, mayonnaise",
    prepTime: "15 min"
  },
  {
    id: "roasted-chicken",
    name: "Roasted Chicken",
    category: "main-course",
    price: 320,
    image: "/images/roasted-chicken.webp",
    description: "Seasoned chicken roasted until golden and served with vegetables or fries.",
    ingredients: "Chicken, garlic, lemon, paprika, herbs, oil",
    prepTime: "45 min"
  },
  {
    id: "fish-and-chips",
    name: "Fish and Chips",
    category: "main-course",
    price: 300,
    image: "/images/fish-and-chips.webp",
    description: "Crispy fried fish served with golden potato fries and lemon.",
    ingredients: "Fish, potatoes, flour, lemon, oil, salt",
    prepTime: "30 min"
  },
  {
    id: "foul",
    name: "Foul Medames",
    category: "breakfast",
    price: 150,
    image: "/images/foul.webp",
    description: "Mashed fava beans seasoned with olive oil, lemon, garlic, and spices, served with bread.",
    ingredients: "Fava beans, olive oil, lemon, garlic, cumin, bread",
    prepTime: "20 min"
  },
  {
    id: "chechebsa-breakfast",
    name: "Chechebsa Breakfast",
    category: "breakfast",
    price: 160,
    image: "/images/chechebsa.jpg",
    description: "Traditional torn flatbread mixed with spiced butter and berbere, served fresh for breakfast.",
    ingredients: "Flatbread, spiced butter, berbere",
    prepTime: "20 min"
  },
  {
    id: "ethiopian-coffee",
    name: "Ethiopian Coffee",
    category: "drink",
    price: 40,
    image: "/images/ethiopian-coffee.webp",
    description: "Freshly roasted and brewed Ethiopian coffee with a rich aroma and distinctive flavor.",
    ingredients: "Ethiopian coffee beans, water, sugar optional",
    prepTime: "10 min"
  },
  {
    id: "macchiato",
    name: "Macchiato",
    category: "drink",
    price: 80,
    image: "/images/macchiato.webp",
    description: "A strong espresso topped with a small amount of steamed milk.",
    ingredients: "Espresso coffee, steamed milk",
    prepTime: "5 min"
  },
  {
    id: "shai",
    name: "Shai",
    category: "drink",
    price: 35,
    image: "/images/shai.webp",
    description: "Traditional Ethiopian tea brewed with tea leaves and optional sugar or spices.",
    ingredients: "Black tea, water, sugar optional, spices optional",
    prepTime: "5 min"
  },
  {
    id: "spris",
    name: "Spris",
    category: "drink",
    price: 100,
    image: "/images/spris.jpg",
    description: "A refreshing layered fruit juice made with seasonal fruits such as avocado, mango, and papaya.",
    ingredients: "Avocado, mango, papaya, seasonal fruit juice",
    prepTime: "10 min"
  },
  {
    id: "avocado-juice",
    name: "Avocado Juice",
    category: "drink",
    price: 100,
    image: "/images/avocado-juice.jpg",
    description: "A thick and creamy avocado drink blended fresh with milk or water and a touch of sugar.",
    ingredients: "Avocado, milk or water, sugar optional, lemon optional",
    prepTime: "5 min"
  },
  {
    id: "mango-juice",
    name: "Mango Juice",
    category: "drink",
    price: 80,
    image: "/images/mango-juice.jpg",
    description: "Fresh mango blended into a sweet, tropical juice.",
    ingredients: "Mango, water, sugar optional",
    prepTime: "5 min"
  },
  {
    id: "papaya-juice",
    name: "Papaya Juice",
    category: "drink",
    price: 80,
    image: "/images/papaya-juice.jpg",
    description: "Fresh papaya blended into a smooth and refreshing fruit drink.",
    ingredients: "Papaya, water, sugar optional, lemon optional",
    prepTime: "5 min"
  },
  {
    id: "lemon-juice",
    name: "Lemon Juice",
    category: "drink",
    price: 60,
    image: "/images/lemon-juice.jpg",
    description: "A refreshing lemon drink with a bright citrus flavor.",
    ingredients: "Lemon, water, sugar, ice optional",
    prepTime: "5 min"
  },
  {
    id: "orange-juice",
    name: "Orange Juice",
    category: "drink",
    price: 80,
    image: "/images/orange-juice.jpg",
    description: "Freshly squeezed orange juice with a naturally sweet citrus taste.",
    ingredients: "Fresh oranges, ice optional",
    prepTime: "5 min"
  },
  {
    id: "water",
    name: "Bottled Water",
    category: "drink",
    price: 25,
    image: "/images/water.jpg",
    description: "Chilled bottled drinking water.",
    ingredients: "Drinking water",
    prepTime: "1 min"
  },
  {
    id: "soft-drink",
    name: "Soft Drink",
    category: "drink",
    price: 40,
    image: "/images/soft-drink.jpg",
    description: "A chilled carbonated soft drink served cold.",
    ingredients: "Carbonated beverage",
    prepTime: "1 min"
  },
  {
    id: "smoothie",
    name: "Fruit Smoothie",
    category: "drink",
    price: 120,
    image: "/images/smoothie.jpg",
    description: "A thick blended drink made with fresh seasonal fruits.",
    ingredients: "Seasonal fruits, milk or yogurt, honey optional",
    prepTime: "7 min"
  },
  {
    id: "tej",
    name: "Tej",
    category: "traditional-drink",
    price: 150,
    image: "/images/tej.jpg",
    description: "Traditional Ethiopian honey wine made by fermenting honey with water and gesho.",
    ingredients: "Honey, water, gesho",
    prepTime: "Fermentation required"
  },

];

const dishStoreKey = Symbol.for("addis-eats.dishes");
const dishStore = globalThis[dishStoreKey] ?? new Map(
  dishes.map((dish) => [dish.id, { ...dish, available: true }]),
);
globalThis[dishStoreKey] = dishStore;

export const defaultDishes = dishes;

function fromDatabaseRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    image: row.image,
    description: row.description,
    ingredients: row.ingredients,
    prepTime: row.prep_time,
    available: row.available,
  };
}

export async function getDishes() {
  const sql = getDatabase();
  const availableDishes = sql
    ? (await sql`
        SELECT * FROM addis_eats_dishes
        WHERE available = true
        ORDER BY created_at, name
      `).map(fromDatabaseRow)
    : [...dishStore.values()];
  return availableDishes.filter((dish) => dish.available !== false);
}

export async function getDish(id) {
  const sql = getDatabase();
  if (sql) {
    const [row] = await sql`
      SELECT * FROM addis_eats_dishes
      WHERE id = ${id} AND available = true
    `;
    return row ? fromDatabaseRow(row) : null;
  }
  const dish = dishStore.get(id);
  return dish?.available !== false ? dish ?? null : null;
}

export async function getAdminDishes() {
  const sql = getDatabase();
  return sql
    ? (await sql`
        SELECT * FROM addis_eats_dishes
        ORDER BY created_at DESC, name
      `).map(fromDatabaseRow)
    : [...dishStore.values()];
}

export async function createDish(dish) {
  const sql = getDatabase();
  if (!sql) {
    if (dishStore.has(dish.id)) {
      return { status: "conflict" };
    }
    dishStore.set(dish.id, { ...dish });
    return { status: "success" };
  }

  const rows = await sql`
    INSERT INTO addis_eats_dishes
      (id, name, category, price, image, description, ingredients, prep_time, available)
    VALUES
      (${dish.id}, ${dish.name}, ${dish.category}, ${dish.price}, ${dish.image},
       ${dish.description}, ${dish.ingredients}, ${dish.prepTime}, ${dish.available})
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;
  return rows.length ? { status: "success" } : { status: "conflict" };
}

export async function updateDish(id, dish) {
  const sql = getDatabase();
  if (!sql) {
    if (!dishStore.has(id)) {
      return false;
    }
    dishStore.set(id, { ...dish, id });
    return true;
  }

  const rows = await sql`
    UPDATE addis_eats_dishes
    SET name = ${dish.name},
        category = ${dish.category},
        price = ${dish.price},
        image = ${dish.image},
        description = ${dish.description},
        ingredients = ${dish.ingredients},
        prep_time = ${dish.prepTime},
        available = ${dish.available},
        updated_at = now()
    WHERE id = ${id}
    RETURNING id
  `;
  return rows.length > 0;
}

export async function deleteDish(id) {
  const sql = getDatabase();
  if (!sql) {
    return dishStore.delete(id);
  }
  const rows = await sql`
    DELETE FROM addis_eats_dishes
    WHERE id = ${id}
    RETURNING id
  `;
  return rows.length > 0;
}