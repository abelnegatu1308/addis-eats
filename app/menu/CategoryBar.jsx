"use client";

import Link from "next/link";
import { createContext, useContext, useState } from "react";

const MenuFilterContext = createContext(null);

function formatCategory(category) {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function useMenuCategory() {
  const context = useContext(MenuFilterContext);
  if (!context) {
    throw new Error("Menu filters must be used inside FilterShell.");
  }
  return context;
}

export function CategoryBar({ categories, selectedCategory, onSelect }) {
  return (
    <nav className="category-bar" aria-label="Filter dishes by category">
      <button
        type="button"
        aria-pressed={selectedCategory === "all"}
        onClick={() => onSelect("all")}
      >
        <span>All dishes</span>
        <span className="category-count">
          {categories.reduce((total, item) => total + item.count, 0)}
        </span>
      </button>
      {categories.map(({ category, count }) => (
        <button
          key={category}
          type="button"
          aria-pressed={selectedCategory === category}
          onClick={() => onSelect(category)}
        >
          <span>{formatCategory(category)}</span>
          <span className="category-count">{count}</span>
        </button>
      ))}
    </nav>
  );
}

export default function FilterShell({ children, categories }) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <MenuFilterContext.Provider value={selectedCategory}>
      <div className="menu-layout">
        <aside className="menu-sidebar" aria-label="Menu categories">
          <p className="menu-sidebar-kicker">BROWSE THE MENU</p>
          <h2>Find your plate</h2>
          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <Link href="/cart" className="menu-cart-link">
            View your cart <span aria-hidden="true">↗</span>
          </Link>
        </aside>
        <div className="menu-layout-content">{children}</div>
      </div>
    </MenuFilterContext.Provider>
  );
}