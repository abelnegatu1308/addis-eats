"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { dishImageDimensions } from "@/lib/dish-image-dimensions";
import { AddToCartButton, FavoriteButton } from "../providers";
import { fetcher } from "@/lib/fetcher";
import SearchBox from "./SearchBox";
import { useMenuCategory } from "./CategoryBar";

export default function DishList({ dishes = [] }) {
  const category = useMenuCategory();
  const [term, setTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(term.trim()), 300);
    return () => clearTimeout(timer);
  }, [term]);

  const query = new URLSearchParams({
    search: debouncedTerm,
    category,
    page: "1",
  });
  const key = `/api/dishes?${query}`;

  const { data, error, isLoading, isValidating } = useSWR(key, fetcher, {
    fallbackData:
      !debouncedTerm && category === "all"
        ? { dishes, page: 1, hasNextPage: false }
        : undefined,
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const currentDishes = data?.dishes ?? dishes;
  const isWaitingForDebounce = term.trim() !== debouncedTerm;

  if (error && currentDishes.length === 0) {
    return (
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--error-border)", background: "var(--error-bg)" }}>
        <h2 className="text-lg font-semibold" style={{ color: "var(--error)" }}>
          Unable to load dishes
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--error)" }}>Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      <SearchBox
        value={term}
        onChange={setTerm}
        isSearching={
          isWaitingForDebounce || (isValidating && Boolean(debouncedTerm))
        }
        error={error}
      />

      {isLoading && currentDishes.length === 0 ? (
        <div className="py-10 text-center" style={{ color: "var(--text-muted)" }}>Loading dishes...</div>
      ) : currentDishes.length === 0 ? (
        <p className="py-10 text-center" style={{ color: "var(--text-muted)" }}>
          No dishes match your search.
        </p>
      ) : (
        <ul className="dish-grid" id="all-dishes">
          {currentDishes.map((dish, index) => (
            <li
              key={dish.id}
              id={dish.id}
              data-category={dish.category}
              className="dish-card"
            >
              <div className="dish-card-media">
                <Link
                  href={`/menu/${dish.id}`}
                  className="dish-card-image"
                  aria-label={`View ${dish.name}`}
                >
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    width={dishImageDimensions[dish.image]?.width ?? 800}
                    height={dishImageDimensions[dish.image]?.height ?? 600}
                    sizes="(max-width: 700px) calc(100vw - 36px), (max-width: 1280px) calc(33.333vw - 32px), 403px"
                  />
                </Link>
                <FavoriteButton dish={dish} />
              </div>

              <div>
                <span className="dish-index">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {dish.category?.toUpperCase()}
                </span>
                <h2>{dish.name}</h2>
                <p>{dish.description}</p>
                <p className="dish-price">
                  {dish.price} ETB · {dish.prepTime}
                </p>
              </div>

              <div className="dish-actions">
                <Link href={`/menu/${dish.id}`} className="dish-link">
                  Discover dish <span>↗</span>
                </Link>
                <AddToCartButton dish={dish} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {isValidating && !isWaitingForDebounce && (
        <p className="mt-4 text-sm" role="status" style={{ color: "var(--text-muted)" }}>
          Updating menu...
        </p>
      )}

      <div className="mt-10 flex items-center justify-center gap-4">
        <span className="font-medium">Page {data?.page ?? 1}</span>
      </div>
    </div>
  );
}
