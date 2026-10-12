"use client";

import Image from "next/image";
import Link from "next/link";
import { FavoriteButton, useFavorites } from "../providers";

export default function FavoritesList() {
  const { dishes } = useFavorites();

  if (dishes.length === 0) {
    return (
      <div className="mt-8 rounded-xl border p-8 text-center" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="text-4xl">♡</div>
        <h2 className="mt-4 text-xl font-semibold">No favourites yet</h2>
        <p className="mt-2" style={{ color: "var(--text-muted)" }}>
          Explore the menu and save dishes you love.
        </p>
        <Link href="/menu" className="button button-primary mt-6 inline-block">
          Explore Menu →
        </Link>
      </div>
    );
  }

  return (
    <ul className="dish-grid favorites-grid">
      {dishes.map((dish) => (
        <li className="dish-card" key={dish.id}>
          <div className="dish-card-media">
            <Link
              href={`/menu/${dish.id}`}
              className="dish-card-image"
              aria-label={`View ${dish.name}`}
            >
              <Image
                src={dish.image}
                alt={dish.name}
                fill
                sizes="(max-width: 700px) calc(100vw - 36px), (max-width: 1280px) calc(33.333vw - 32px), 403px"
              />
            </Link>
            <FavoriteButton dish={dish} />
          </div>
          <div>
            <h2>{dish.name}</h2>
            <p>{dish.description}</p>
            <p className="dish-price">
              {dish.price} ETB · {dish.prepTime}
            </p>
          </div>
          <Link href={`/menu/${dish.id}`} className="dish-link">
            Discover dish <span>↗</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
