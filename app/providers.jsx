"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

const CartContext = createContext(null);
const FavoritesContext = createContext(null);
const emptyItems = [];
const emptyFavorites = [];
let cartItems = emptyItems;
let cartInitialized = false;
const cartListeners = new Set();
let favoriteDishes = emptyFavorites;
let favoritesInitialized = false;
const favoriteListeners = new Set();

function initializeCart() {
  if (cartInitialized || typeof window === "undefined") return;
  cartInitialized = true;
  try {
    const savedItems = JSON.parse(localStorage.getItem("addis-eats-cart") || "[]");
    if (Array.isArray(savedItems)) cartItems = savedItems;
  } catch {
    localStorage.removeItem("addis-eats-cart");
  }
  cartListeners.forEach((listener) => listener());
}

function subscribeToCart(listener) {
  cartListeners.add(listener);
  initializeCart();
  return () => cartListeners.delete(listener);
}

function updateCart(updater) {
  initializeCart();
  cartItems = updater(cartItems);
  localStorage.setItem("addis-eats-cart", JSON.stringify(cartItems));
  cartListeners.forEach((listener) => listener());
}

function initializeFavorites() {
  if (favoritesInitialized || typeof window === "undefined") return;
  favoritesInitialized = true;
  try {
    const savedFavorites = JSON.parse(localStorage.getItem("addis-eats-favorites") || "[]");
    if (Array.isArray(savedFavorites)) favoriteDishes = savedFavorites;
  } catch {
    localStorage.removeItem("addis-eats-favorites");
  }
  favoriteListeners.forEach((listener) => listener());
}

function subscribeToFavorites(listener) {
  favoriteListeners.add(listener);
  initializeFavorites();
  return () => favoriteListeners.delete(listener);
}

function updateFavorites(updater) {
  initializeFavorites();
  favoriteDishes = updater(favoriteDishes);
  localStorage.setItem("addis-eats-favorites", JSON.stringify(favoriteDishes));
  favoriteListeners.forEach((listener) => listener());
}

function CartProvider({ children }) {
  const items = useSyncExternalStore(subscribeToCart, () => cartItems, () => emptyItems);
  const addItem = (dish, quantity = 1) => updateCart((currentItems) => {
    const existing = currentItems.find((item) => item.id === dish.id);
    if (existing) {
      return currentItems.map((item) => item.id === dish.id ? { ...item, qty: item.qty + quantity } : item);
    }
    return [...currentItems, { ...dish, qty: quantity }];
  });
  const updateQuantity = (id, qty) => updateCart((currentItems) => qty < 1
    ? currentItems.filter((item) => item.id !== id)
    : currentItems.map((item) => item.id === id ? { ...item, qty } : item));
  const removeItem = (id) => updateCart((currentItems) => currentItems.filter((item) => item.id !== id));
  const clearCart = () => updateCart(() => []);
  const itemCount = items.reduce((count, item) => count + item.qty, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.qty, 0);
  const value = { items, itemCount, subtotal, addItem, updateQuantity, removeItem, clearCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function FavoritesProvider({ children }) {
  const dishes = useSyncExternalStore(
    subscribeToFavorites,
    () => favoriteDishes,
    () => emptyFavorites,
  );
  const toggleFavorite = (dish) => updateFavorites((currentDishes) => (
    currentDishes.some((item) => item.id === dish.id)
      ? currentDishes.filter((item) => item.id !== dish.id)
      : [...currentDishes, dish]
  ));
  const removeFavorite = (id) => updateFavorites((currentDishes) => (
    currentDishes.filter((dish) => dish.id !== id)
  ));
  const value = { dishes, toggleFavorite, removeFavorite };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("Cart controls must be rendered inside Providers.");
  return cart;
}

export function useFavorites() {
  const favorites = useContext(FavoritesContext);
  if (!favorites) throw new Error("Favorite controls must be rendered inside Providers.");
  return favorites;
}

export function CartCount() {
  const { itemCount } = useCart();
  return <span aria-live="polite">{itemCount}</span>;
}

export function FavoriteButton({ dish }) {
  const { dishes, toggleFavorite } = useFavorites();
  const isFavorite = dishes.some((item) => item.id === dish.id);

  return (
    <button
      type="button"
      className="favorite-button"
      onClick={() => toggleFavorite(dish)}
      aria-label={isFavorite ? `Remove ${dish.name} from favourites` : `Add ${dish.name} to favourites`}
      aria-pressed={isFavorite}
    >
      {isFavorite ? "♥" : "♡"}
    </button>
  );
}

export function AddToCartButton({ dish }) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      className="cart-add-button"
      onClick={() => addItem(dish)}
      aria-label={`Add ${dish.name} to cart`}
    >
      Add to cart
    </button>
  );
}

export default function Providers({ children }) {
  return (
    <CartProvider>
      <FavoritesProvider>{children}</FavoritesProvider>
    </CartProvider>
  );
}