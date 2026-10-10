import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDishes, getDish } from "../data";
import { AddToCartButton, FavoriteButton } from "../../providers";
import { dishImageDimensions } from "@/lib/dish-image-dimensions";
import { absoluteUrl } from "@/lib/site-url";

export const dynamicParams = false;

export async function generateStaticParams() {
  const dishes = await getDishes();
  return dishes.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = await getDish(id);
  if (!dish) notFound();

  const title = `${dish.name} Ethiopian dish`;
  const description = dish.description;
  const socialDescription = `${dish.description} ${dish.price} ETB.`;
  const imageUrl = absoluteUrl(`/menu/${dish.id}/opengraph-image`);

  return {
    title,
    description: socialDescription,
    alternates: {
      canonical: absoluteUrl(`/menu/${dish.id}`),
    },
    openGraph: {
      type: "article",
      title: `${dish.name} | Addis Eats`,
      description: socialDescription,
      url: absoluteUrl(`/menu/${dish.id}`),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${dish.name}, an Ethiopian dish from Addis Eats`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dish.name} | Addis Eats`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function DishPage({ params }) {
  const { id } = await params;

  if (id === "error-test") {
    throw new Error("Failed to load dish details!");
  }

  const dish = await getDish(id);
  if (!dish) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: dish.name,
    description: dish.description,
    image: absoluteUrl(dish.image),
    offers: {
      "@type": "Offer",
      price: dish.price,
      priceCurrency: "ETB",
    },
    isPartOf: {
      "@type": "Menu",
      name: "Addis Eats Menu",
      url: absoluteUrl("/menu"),
    },
  };

  return (
    <main className="page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <p className="page-kicker">
        {dish.category.toUpperCase()} · {dish.prepTime.toUpperCase()}
      </p>
      <div className="dish-detail">
        <div className="dish-detail-image">
          <Image
            src={dish.image}
            alt={dish.name}
            width={dishImageDimensions[dish.image]?.width ?? 800}
            height={dishImageDimensions[dish.image]?.height ?? 600}
            sizes="(max-width: 700px) calc(100vw - 36px), (max-width: 1280px) calc(54.05vw - 61px), 645px"
          />
          <FavoriteButton dish={dish} />
        </div>
        <div className="dish-detail-copy">
          <Link href="/menu" className="dish-back-link">
            ← All dishes
          </Link>
          <h1>{dish.name}</h1>
          <p>{dish.description}</p>
          <h2>Ingredients</h2>
          <p>{dish.ingredients}</p>
          <strong className="dish-detail-price">{dish.price} ETB</strong>
          <AddToCartButton dish={dish} />
        </div>
      </div>
    </main>
  );
}
