const KEYS = { menu:"addiseats_menu", orders:"addiseats_orders" };
const read = (key, fallback) => {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; }
  catch { return fallback; }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const money = n => `${Number(n).toLocaleString("en-US")} ETB`;
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

let menu = read(KEYS.menu, []);
let orders = read(KEYS.orders, []);

function guard() {
  if (sessionStorage.getItem("adminLoggedIn") !== "true") {
    window.location.href = "admin-login.html";
    return false;
  }
  $("adminUser").textContent = sessionStorage.getItem("adminUser") || "Admin";
  return true;
}

function init() {
  if (!guard()) return;
  bind();
  renderAll();
}

function bind() {
  $("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminUser");
    window.location.href = "admin-login.html";
  });
  $("addDishBtn").addEventListener("click", () => openDishModal());
  $("closeDishModal").addEventListener("click", closeDishModal);
  $("dishModal").addEventListener("click", e => { if (e.target === $("dishModal")) closeDishModal(); });
  $("dishForm").addEventListener("submit", saveDish);
  $("dishSearch").addEventListener("input", renderDishes);
  $("dishTableWrap").addEventListener("click", handleDishTable);
  $("orderTableWrap").addEventListener("click", handleOrderTable);
  $("closeOrderModal").addEventListener("click", () => $("orderModal").classList.add("hidden"));
}

function renderAll() {
  menu = read(KEYS.menu, []);
  orders = read(KEYS.orders, []);
  renderStats();
  renderDishes();
  renderOrders();
  renderTopSellers();
  renderStatusDistribution();
}

function renderStats() {
  const revenue = orders.reduce((s,o) => s + Number(o.total || 0), 0);
  $("statRevenue").textContent = money(revenue);
  $("statOrders").textContent = orders.length;
  $("statAverage").textContent = money(orders.length ? revenue / orders.length : 0);
  $("statDishes").textContent = menu.length;
}

function renderDishes() {
  const q = $("dishSearch").value.trim().toLowerCase();
  const filtered = menu.filter(d => `${d.name} ${d.description} ${d.category}`.toLowerCase().includes(q));
  $("dishTableWrap").innerHTML = filtered.length ? `<table class="admin-table">
    <thead><tr><th>Dish</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
    <tbody>${filtered.map(d => `<tr>
      <td><strong>${escapeHTML(d.name)}</strong><br><span class="muted">${escapeHTML(d.description.slice(0,55))}${d.description.length>55?"…":""}</span></td>
      <td>${escapeHTML(d.category)}</td><td>${money(d.price)}</td>
      <td><div class="table-actions">
        <button class="small-btn" data-edit="${d.id}">Edit</button>
        <button class="small-btn danger" data-delete="${d.id}">Delete</button>
      </div></td>
    </tr>`).join("")}</tbody></table>` : `<div class="state-card">No dishes found.</div>`;
}

function handleDishTable(e) {
  const edit = e.target.closest("[data-edit]");
  const del = e.target.closest("[data-delete]");
  if (edit) openDishModal(Number(edit.dataset.edit));
  if (del) deleteDish(Number(del.dataset.delete));
}

function openDishModal(id = null) {
  $("dishForm").reset();
  $("dishId").value = "";
  $("dishModalTitle").textContent = id ? "Edit dish" : "Add dish";
  if (id) {
    const d = menu.find(x => x.id === id);
    if (!d) return;
    $("dishId").value = d.id;
    $("dishName").value = d.name;
    $("dishDescription").value = d.description;
    $("dishPrice").value = d.price;
    $("dishCategory").value = d.category;
    $("dishImage").value = d.image || "";
    $("dishIngredients").value = d.ingredients.join(", ");
  }
  $("dishModal").classList.remove("hidden");
}
function closeDishModal() { $("dishModal").classList.add("hidden"); }

function saveDish(e) {
  e.preventDefault();
  const id = Number($("dishId").value);
  const dish = {
    id: id || (menu.length ? Math.max(...menu.map(d => d.id)) + 1 : 1),
    name: $("dishName").value.trim(),
    description: $("dishDescription").value.trim(),
    price: Number($("dishPrice").value),
    category: $("dishCategory").value,
    image: $("dishImage").value.trim(),
    emoji: ({ethiopian:"🍛",pizza:"🍕",burgers:"🍔",drinks:"🥤"})[$("dishCategory").value],
    ingredients: $("dishIngredients").value.split(",").map(x => x.trim()).filter(Boolean)
  };
  if (id) menu = menu.map(d => d.id === id ? dish : d);
  else menu.push(dish);
  save(KEYS.menu, menu);
  closeDishModal();
  renderAll();
}

function deleteDish(id) {
  const dish = menu.find(d => d.id === id);
  if (!dish) return;
  if (!confirm(`Delete "${dish.name}"? This cannot be undone.`)) return;
  menu = menu.filter(d => d.id !== id);
  save(KEYS.menu, menu);
  renderAll();
}

function renderOrders() {
  $("orderTableWrap").innerHTML = orders.length ? `<table class="admin-table">
    <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${orders.map(o => `<tr>
      <td><strong>${escapeHTML(o.id)}</strong><br><span class="muted">${new Date(o.date).toLocaleDateString()}</span></td>
      <td>${escapeHTML(o.customer.name)}<br><span class="muted">${escapeHTML(o.customer.area)}</span></td>
      <td>${money(o.total)}</td>
      <td><select class="status-select" data-status="${escapeHTML(o.id)}">
        ${["pending","preparing","delivering","delivered"].map(s => `<option ${o.status===s?"selected":""} value="${s}">${s}</option>`).join("")}
      </select></td>
      <td><div class="table-actions"><button class="small-btn" data-view-order="${escapeHTML(o.id)}">View</button><button class="small-btn danger" data-delete-order="${escapeHTML(o.id)}">Delete</button></div></td>
    </tr>`).join("")}</tbody></table>` : `<div class="state-card">No orders yet.</div>`;
}

function handleOrderTable(e) {
  const select = e.target.closest("[data-status]");
  const view = e.target.closest("[data-view-order]");
  const del = e.target.closest("[data-delete-order]");
  if (select) updateStatus(select.dataset.status, select.value);
  if (view) showOrder(selectSafeId(view.dataset.viewOrder));
  if (del) deleteOrder(del.dataset.deleteOrder);
}
function selectSafeId(id) { return id; }

function updateStatus(id, status) {
  orders = orders.map(o => o.id === id ? {...o, status} : o);
  save(KEYS.orders, orders);
  renderAll();
}
function deleteOrder(id) {
  if (!confirm(`Delete order ${id}?`)) return;
  orders = orders.filter(o => o.id !== id);
  save(KEYS.orders, orders);
  renderAll();
}

function showOrder(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  $("orderDetails").innerHTML = `
    <p class="eyebrow">ORDER DETAILS</p>
    <h2>${escapeHTML(o.id)}</h2>
    <div class="detail-list">
      <span>Customer</span><strong>${escapeHTML(o.customer.name)}</strong>
      <span>Phone</span><strong>${escapeHTML(o.customer.phone)}</strong>
      <span>Area</span><strong>${escapeHTML(o.customer.area)}</strong>
      <span>Status</span><strong>${escapeHTML(o.status)}</strong>
      <span>Subtotal</span><strong>${money(o.subtotal)}</strong>
      <span>Delivery fee</span><strong>${money(o.deliveryFee)}</strong>
      <span>Total</span><strong>${money(o.total)}</strong>
    </div>
    <h3>Items</h3>
    <ul>${o.items.map(i => `<li>${escapeHTML(i.name)} × ${i.quantity} — ${money(i.price * i.quantity)}</li>`).join("")}</ul>
    ${o.instructions ? `<p><strong>Instructions:</strong> ${escapeHTML(o.instructions)}</p>` : ""}`;
  $("orderModal").classList.remove("hidden");
}

function renderTopSellers() {
  const counts = {};
  orders.forEach(o => o.items.forEach(i => counts[i.name] = (counts[i.name] || 0) + i.quantity));
  const list = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,5);
  $("topSellers").innerHTML = list.length ? list.map(([name,count]) => `<div class="progress-row"><div class="progress-label"><span>${escapeHTML(name)}</span><strong>${count}</strong></div><div class="progress-bar"><i style="width:${Math.min(100,count*15)}%"></i></div></div>`).join("") : `<p class="muted">No sales data yet.</p>`;
}

function renderStatusDistribution() {
  const statuses = ["pending","preparing","delivering","delivered"];
  $("statusDistribution").innerHTML = statuses.map(s => {
    const count = orders.filter(o => o.status === s).length;
    const percent = orders.length ? (count / orders.length) * 100 : 0;
    return `<div class="progress-row"><div class="progress-label"><span>${s}</span><strong>${count}</strong></div><div class="progress-bar"><i style="width:${percent}%"></i></div></div>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", init);
