"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "../providers";
import { dishImageDimensions } from "@/lib/dish-image-dimensions";

const deliveryFees = {
  Bole: 45,
  Piassa: 55,
  Kirkos: 50,
  Merkato: 60,
  Yeka: 65,
};

export default function CartView() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } =
    useCart();
  const [area, setArea] = useState("Bole");
  const deliveryFee = deliveryFees[area];

  return (
    <>
      <div className="cart-heading">
        <h1 className="page-title">Your cart</h1>
        {itemCount > 0 && (
          <button className="cart-clear" onClick={clearCart}>
            Clear cart
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="cart-empty">
          <p>Your table is waiting.</p>
          <Link href="/menu" className="button button-primary">
            Browse the menu <span>↗</span>
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <ul className="cart-items">
            {items.map((item) => (
              <li className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={dishImageDimensions[item.image]?.width ?? 800}
                    height={dishImageDimensions[item.image]?.height ?? 600}
                    sizes="(max-width: 700px) 70px, 92px"
                  />
                </div>
                <div className="cart-item-info">
                  <Link href={`/menu/${item.id}`}>{item.name}</Link>
                  <span>{item.price} ETB each</span>
                  <div className="quantity-control">
                    <button
                      onClick={() => updateQuantity(item.id, item.qty - 1)}
                      aria-label={`Remove one ${item.name}`}
                    >
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.qty + 1)}
                      aria-label={`Add one ${item.name}`}
                    >
                      +
                    </button>
                    <button
                      className="remove-item"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <strong>{item.price * item.qty} ETB</strong>
              </li>
            ))}
          </ul>
          <aside className="cart-summary">
            <h2>Order summary</h2>
            <p>
              <span>Items ({itemCount})</span>
              <strong>{subtotal} ETB</strong>
            </p>
            <label htmlFor="delivery-area">Delivery area</label>
            <select
              id="delivery-area"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            >
              {Object.keys(deliveryFees).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
            <p>
              <span>Delivery</span>
              <strong>{deliveryFee} ETB</strong>
            </p>
            <p className="cart-total">
              <span>Total</span>
              <strong>{subtotal + deliveryFee} ETB</strong>
            </p>
            <Link href="/checkout" className="button button-primary">
              Continue to checkout <span>↗</span>
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
