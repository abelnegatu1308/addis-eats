import { createDishAction, updateDishAction } from "../actions/admin-menu";

const categories = [
  ["traditional", "Traditional"],
  ["snack", "Snack"],
  ["fast-food", "Fast Food"],
  ["main-course", "Main Course"],
  ["breakfast", "Breakfast"],
  ["drink", "Drink"],
  ["traditional-drink", "Traditional Drink"],
];

const imageOptions = [
  "/images/asa-tibs.webp",
  "/images/avocado-juice.jpg",
  "/images/beyaynetu.webp",
  "/images/burger.webp",
  "/images/chechebsa.jpg",
  "/images/chips.webp",
  "/images/club-sandwich.webp",
  "/images/doro-wat.jpg",
  "/images/dulet.jpg",
  "/images/ethiopian-coffee.webp",
  "/images/ethiopian-fasting-platter.webp",
  "/images/ethiopian-food.webp",
  "/images/ethiopian-wat.webp",
  "/images/firfir.webp",
  "/images/fish-and-chips.webp",
  "/images/foul.webp",
  "/images/gomen.webp",
  "/images/kitfo-authentic.webp",
  "/images/lemon-juice.jpg",
  "/images/macchiato.webp",
  "/images/mango-juice.jpg",
  "/images/misir-wat.webp",
  "/images/orange-juice.jpg",
  "/images/papaya-juice.jpg",
  "/images/pasta.webp",
  "/images/pizza.webp",
  "/images/rice.webp",
  "/images/roasted-chicken.webp",
  "/images/sambusa.webp",
  "/images/shai.webp",
  "/images/shiro.webp",
  "/images/smoothie.jpg",
  "/images/soft-drink.jpg",
  "/images/spris.jpg",
  "/images/tej.jpg",
  "/images/tibs.webp",
  "/images/tikil-gomen.webp",
  "/images/water.jpg",
];

export default function DishForm({ dish, error }) {
  const action = dish ? updateDishAction : createDishAction;

  return (
    <form action={action} className="admin-dish-form">
      {dish && <input type="hidden" name="id" value={dish.id} />}
      {error && (
        <p className="admin-login-error" role="alert">
          {error}
        </p>
      )}
      <div className="admin-form-grid">
        <label>
          Dish name
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            defaultValue={dish?.name}
          />
        </label>
        <label>
          Category
          <select name="category" defaultValue={dish?.category ?? "traditional"}>
            {categories.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          Price (ETB)
          <input
            name="price"
            type="number"
            min="0"
            max="1000000"
            step="1"
            required
            defaultValue={dish?.price ?? ""}
          />
        </label>
        <label>
          Preparation time
          <input
            name="prepTime"
            required
            maxLength={80}
            placeholder="20 min"
            defaultValue={dish?.prepTime}
          />
        </label>
        <label className="admin-form-full">
          Image
          <select name="image" defaultValue={dish?.image ?? imageOptions[0]}>
            {imageOptions.map((image) => (
              <option key={image} value={image}>{image}</option>
            ))}
          </select>
        </label>
        <label className="admin-form-full">
          Description
          <textarea
            name="description"
            required
            minLength={5}
            maxLength={1000}
            rows={3}
            defaultValue={dish?.description}
          />
        </label>
        <label className="admin-form-full">
          Ingredients
          <textarea
            name="ingredients"
            required
            maxLength={1000}
            rows={2}
            defaultValue={dish?.ingredients}
          />
        </label>
      </div>
      <label className="admin-availability-control">
        <input
          name="available"
          type="checkbox"
          defaultChecked={dish?.available ?? true}
        />
        Available to order
      </label>
      <div className="admin-form-actions">
        <button type="submit" className="admin-primary-button">
          {dish ? "Save changes" : "Create dish"}
        </button>
      </div>
    </form>
  );
}
