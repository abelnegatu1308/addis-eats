const KEYS = {
  menu: "addiseats_menu",
  orders: "addiseats_orders",
  cart: "addiseats_cart",
  favorites: "addiseats_favorites",
  theme: "addiseats_theme"
};

const seedMenu = [
  {id:1,name:"Doro Wat",description:"Spicy Ethiopian chicken stew with berbere, served with injera.",price:350,category:"ethiopian",emoji:"🍛",image:"",ingredients:["Chicken","Berbere","Onions","Injera","Garlic","Ginger"]},
  {id:2,name:"Tibs",description:"Sautéed beef with onions, peppers and Ethiopian spices.",price:420,category:"ethiopian",emoji:"🥩",image:"",ingredients:["Beef","Onions","Peppers","Rosemary","Mitmita"]},
  {id:3,name:"Kitfo",description:"Seasoned minced beef served with ayib and traditional greens.",price:390,category:"ethiopian",emoji:"🥘",image:"",ingredients:["Beef","Mitmita","Butter","Ayib","Gomen"]},
  {id:4,name:"Margherita Pizza",description:"Classic pizza with tomato, mozzarella and fresh basil.",price:480,category:"pizza",emoji:"🍕",image:"",ingredients:["Tomato","Mozzarella","Basil","Flour"]},
  {id:5,name:"Chicken Pizza",description:"Cheesy pizza topped with seasoned chicken and vegetables.",price:560,category:"pizza",emoji:"🍕",image:"",ingredients:["Chicken","Mozzarella","Tomato","Onion","Pepper"]},
  {id:6,name:"Classic Burger",description:"Juicy beef patty with cheese, lettuce, tomato and sauce.",price:450,category:"burgers",emoji:"🍔",image:"",ingredients:["Beef","Cheese","Lettuce","Tomato","Bun"]},
  {id:7,name:"Chicken Burger",description:"Crispy chicken fillet with lettuce and house sauce.",price:430,category:"burgers",emoji:"🍔",image:"",ingredients:["Chicken","Lettuce","Bun","House sauce"]},
  {id:8,name:"Fresh Juice",description:"Freshly blended seasonal fruit juice.",price:120,category:"drinks",emoji:"🥤",image:"",ingredients:["Seasonal fruit","Ice"]},
  {id:9,name:"Macchiato",description:"Smooth Ethiopian-style espresso with steamed milk.",price:90,category:"drinks",emoji:"☕",image:"",ingredients:["Espresso","Milk"]},
  {id:10,name:"Mango Smoothie",description:"Creamy mango smoothie made with fresh fruit.",price:180,category:"drinks",emoji:"🥭",image:"",ingredients:["Mango","Milk","Ice"]}
];

const state = {
  menu: [],
  cart: [],
  favorites: [],
  query: "",
  category: "all"
};

const $ = (id) => document.getElementById(id);
const money = (n) => `${Number(n).toLocaleString("en-US")} ETB`;
const read = (key, fallback) => {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function emojiFor(category) {
  return ({ethiopian:"🍛", pizza:"🍕", burgers:"🍔", drinks:"🥤"})[category] || "🍽️";
}

function init() {
  const storedMenu = read(KEYS.menu, null);
  state.menu = Array.isArray(storedMenu) && storedMenu.length ? storedMenu : seedMenu;
  save(KEYS.menu, state.menu);
  state.cart = read(KEYS.cart, []);
  state.favorites = read(KEYS.favorites, []);
  applyTheme();
  bindEvents();
  render();
  simulateLoading();
}

function bindEvents() {
  $("searchInput").addEventListener("input", e => { state.query = e.target.value.trim().toLowerCase(); renderMenu(); });
  $("categoryButtons").addEventListener("click", e => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;
    state.category = btn.dataset.category;
    document.querySelectorAll(".category").forEach(b => b.classList.toggle("active", b === btn));
    renderMenu();
  });
  $("cartBtn").addEventListener("click", openCart);
  $("closeCart").addEventListener("click", closeCart);
  $("cartOverlay").addEventListener("click", closeCart);
  $("continueShopping").addEventListener("click", closeCart);
  $("checkoutBtn").addEventListener("click", openCheckout);
  $("closeCheckout").addEventListener("click", closeCheckout);
  $("checkoutModal").addEventListener("click", e => { if (e.target === $("checkoutModal")) closeCheckout(); });
  $("closeDetail").addEventListener("click", () => $("detailModal").classList.add("hidden"));
  $("confirmationDone").addEventListener("click", () => $("confirmationModal").classList.add("hidden"));
  $("themeToggle").addEventListener("click", toggleTheme);
  $("checkoutForm").addEventListener("submit", submitOrder);
  $("menuGrid").addEventListener("click", handleMenuClick);
  $("cartItems").addEventListener("click", handleCartClick);
  $("orderHistory").addEventListener("click", handleHistoryClick);
}

function simulateLoading() {
  $("loading").classList.remove("hidden");
  $("menuGrid").classList.add("hidden");
  setTimeout(() => {
    $("loading").classList.add("hidden");
    $("menuGrid").classList.remove("hidden");
    renderMenu();
  }, 350);
}

function render() {
  renderMenu();
  renderCart();
  renderHistory();
}

function filteredMenu() {
  return state.menu.filter(dish => {
    const categoryOK = state.category === "all" || dish.category === state.category;
    const q = state.query;
    const searchOK = !q || `${dish.name} ${dish.description} ${dish.category} ${dish.ingredients.join(" ")}`.toLowerCase().includes(q);
    return categoryOK && searchOK;
  });
}

function renderMenu() {
  const dishes = filteredMenu();
  $("menuCount").textContent = `${dishes.length} dish${dishes.length === 1 ? "" : "es"}`;
  $("menuEmpty").classList.toggle("hidden", dishes.length !== 0);
  $("menuGrid").innerHTML = dishes.map(dish => {
    const fav = state.favorites.includes(dish.id);
    const visual = dish.image ? `<img src="${escapeHTML(dish.image)}" alt="${escapeHTML(dish.name)}">` : `<span>${dish.emoji || emojiFor(dish.category)}</span>`;
    return `<article class="dish-card">
      <div class="dish-visual">${visual}<button class="favorite" data-fav="${dish.id}" aria-label="Favorite ${escapeHTML(dish.name)}">${fav ? "❤️" : "♡"}</button></div>
      <div class="dish-body">
        <div class="dish-top"><span class="dish-name">${escapeHTML(dish.name)}</span><span class="price">${money(dish.price)}</span></div>
        <div class="dish-description">${escapeHTML(dish.description)}</div>
        <div class="dish-actions">
          <button class="btn btn-secondary" data-detail="${dish.id}">Details</button>
          <button class="btn btn-primary" data-add="${dish.id}">Add to cart</button>
        </div>
      </div>
    </article>`;
  }).join("");
}

function handleMenuClick(e) {
  const add = e.target.closest("[data-add]");
  const detail = e.target.closest("[data-detail]");
  const fav = e.target.closest("[data-fav]");
  if (add) addToCart(Number(add.dataset.add));
  if (detail) showDetails(Number(detail.dataset.detail));
  if (fav) toggleFavorite(Number(fav.dataset.fav));
}

function addToCart(id) {
  const existing = state.cart.find(item => item.id === id);
  if (existing) existing.quantity++;
  else state.cart.push({id, quantity:1});
  save(KEYS.cart, state.cart);
  renderCart();
  openCart();
}

function cartDetails() {
  return state.cart.map(item => {
    const dish = state.menu.find(d => d.id === item.id);
    return dish ? {...item, dish} : null;
  }).filter(Boolean);
}

function cartTotal() {
  return cartDetails().reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
}

function renderCart() {
  const items = cartDetails();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  $("cartBadge").textContent = count;
  $("cartEmpty").classList.toggle("hidden", items.length !== 0);
  $("cartFooter").classList.toggle("hidden", items.length === 0);
  $("cartItems").innerHTML = items.map(item => `
    <div class="cart-item">
      <div class="cart-thumb">${item.dish.emoji || emojiFor(item.dish.category)}</div>
      <div>
        <strong>${escapeHTML(item.dish.name)}</strong>
        <span class="muted">${money(item.dish.price * item.quantity)}</span>
        <div class="qty">
          <button data-dec="${item.dish.id}" aria-label="Decrease quantity">−</button>
          <b>${item.quantity}</b>
          <button data-inc="${item.dish.id}" aria-label="Increase quantity">+</button>
        </div>
        <button class="remove-btn" data-remove="${item.dish.id}">Remove</button>
      </div>
    </div>`).join("");
  $("cartTotal").textContent = money(cartTotal());
}

function handleCartClick(e) {
  const inc = e.target.closest("[data-inc]");
  const dec = e.target.closest("[data-dec]");
  const remove = e.target.closest("[data-remove]");
  if (inc) changeQty(Number(inc.dataset.inc), 1);
  if (dec) changeQty(Number(dec.dataset.dec), -1);
  if (remove) removeFromCart(Number(remove.dataset.remove));
}

function changeQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) state.cart = state.cart.filter(i => i.id !== id);
  save(KEYS.cart, state.cart);
  renderCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  save(KEYS.cart, state.cart);
  renderCart();
}

function openCart() {
  $("cartDrawer").classList.add("open");
  $("cartOverlay").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  $("cartDrawer").classList.remove("open");
  $("cartOverlay").classList.add("hidden");
  document.body.style.overflow = "";
}

function openCheckout() {
  if (!state.cart.length) return;
  closeCart();
  updateCheckoutTotals();
  $("checkoutModal").classList.remove("hidden");
}
function closeCheckout() { $("checkoutModal").classList.add("hidden"); }

function validateCheckout() {
  const name = $("customerName").value.trim();
  const phone = $("customerPhone").value.trim();
  const area = $("deliveryArea").value;
  let ok = true;
  const phoneRegex = /^(?:\+251|0)9\d{8}$/;
  $("nameError").textContent = name.length < 2 ? "Name must contain at least 2 characters." : "";
  $("phoneError").textContent = phoneRegex.test(phone) ? "" : "Use 09XXXXXXXX or +2519XXXXXXXX.";
  $("areaError").textContent = area ? "" : "Please select a delivery area.";
  ok = name.length >= 2 && phoneRegex.test(phone) && Boolean(area);
  return ok;
}

function deliveryFee(area) {
  const fees = {Bole:50, Piassa:70, Mexico:60, CMC:80, Gerji:75, Kazanchis:55, Yeka:90, "Other Addis area":100};
  return fees[area] || 0;
}

function updateCheckoutTotals() {
  const fee = deliveryFee($("deliveryArea").value);
  $("deliveryFee").textContent = money(fee);
  $("checkoutTotal").textContent = money(cartTotal() + fee);
  const area = $("deliveryArea").value;
  $("estimatedTime").textContent = area === "Other Addis area" ? "45–60 min" : "30–45 min";
}
$("deliveryArea").addEventListener("change", updateCheckoutTotals);

function submitOrder(e) {
  e.preventDefault();
  if (!validateCheckout()) return;
  const area = $("deliveryArea").value;
  const fee = deliveryFee(area);
  const order = {
    id: `AE-${Date.now().toString().slice(-7)}`,
    date: new Date().toISOString(),
    customer: {
      name: $("customerName").value.trim(),
      phone: $("customerPhone").value.trim(),
      area
    },
    instructions: $("specialInstructions").value.trim(),
    items: cartDetails().map(item => ({id:item.dish.id, name:item.dish.name, price:item.dish.price, quantity:item.quantity})),
    subtotal: cartTotal(),
    deliveryFee: fee,
    total: cartTotal() + fee,
    status: "pending"
  };
  const orders = read(KEYS.orders, []);
  orders.unshift(order);
  save(KEYS.orders, orders);
  state.cart = [];
  save(KEYS.cart, state.cart);
  render();
  closeCheckout();
  $("checkoutForm").reset();
  $("confirmationText").textContent = `Order ${order.id} has been placed. Estimated delivery: ${area === "Other Addis area" ? "45–60" : "30–45"} minutes.`;
  $("confirmationModal").classList.remove("hidden");
}

function showDetails(id) {
  const dish = state.menu.find(d => d.id === id);
  if (!dish) return;
  $("detailContent").innerHTML = `
    <div class="dish-visual" style="border-radius:16px;margin-bottom:18px;height:210px">${dish.image ? `<img src="${escapeHTML(dish.image)}" alt="${escapeHTML(dish.name)}">` : `<span>${dish.emoji || emojiFor(dish.category)}</span>`}</div>
    <p class="eyebrow">${escapeHTML(dish.category)}</p>
    <h2>${escapeHTML(dish.name)}</h2>
    <p class="muted">${escapeHTML(dish.description)}</p>
    <p><strong>Ingredients:</strong> ${dish.ingredients.map(escapeHTML).join(", ")}</p>
    <div class="total-row"><strong>${money(dish.price)}</strong><button class="btn btn-primary" data-modal-add="${dish.id}">Add to cart</button></div>`;
  $("detailModal").classList.remove("hidden");
  $("detailContent").querySelector("[data-modal-add]").addEventListener("click", () => {
    addToCart(id);
    $("detailModal").classList.add("hidden");
  });
}

function toggleFavorite(id) {
  state.favorites = state.favorites.includes(id) ? state.favorites.filter(x => x !== id) : [...state.favorites, id];
  save(KEYS.favorites, state.favorites);
  renderMenu();
}

function renderHistory() {
  const orders = read(KEYS.orders, []);
  $("orderHistory").innerHTML = orders.length ? orders.slice(0,8).map(order => `
    <article class="order-card">
      <div class="order-card-header">
        <div><strong>${escapeHTML(order.id)}</strong><div class="muted">${new Date(order.date).toLocaleString()}</div></div>
        <span class="status">${escapeHTML(order.status)}</span>
      </div>
      <p>${order.items.map(i => `${escapeHTML(i.name)} × ${i.quantity}`).join(", ")}</p>
      <strong>${money(order.total)}</strong>
      ${order.status === "delivered" ? `<button class="btn btn-secondary" data-reorder="${escapeHTML(order.id)}" style="margin-top:10px">Reorder</button>` : ""}
    </article>`).join("") : `<div class="state-card">You have no orders yet. Your completed orders will appear here.</div>`;
}

function handleHistoryClick(e) {
  const btn = e.target.closest("[data-reorder]");
  if (!btn) return;
  const order = read(KEYS.orders, []).find(o => o.id === btn.dataset.reorder);
  if (!order) return;
  order.items.forEach(item => {
    const existing = state.cart.find(c => c.id === item.id);
    if (existing) existing.quantity += item.quantity;
    else state.cart.push({id:item.id, quantity:item.quantity});
  });
  save(KEYS.cart, state.cart);
  renderCart();
  openCart();
}

function applyTheme() {
  const theme = localStorage.getItem(KEYS.theme) || "light";
  document.documentElement.dataset.theme = theme;
  $("themeToggle").textContent = theme === "dark" ? "☀️" : "🌙";
}
function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem(KEYS.theme, next);
  applyTheme();
}

document.addEventListener("DOMContentLoaded", init);
