"use client";

import { useActionState, useEffect, useRef } from "react";
import { placeOrder } from "../actions";
import { useCart } from "../providers";

const initialState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

const fields = [
  { name: "name", label: "Full name", placeholder: "Abebe Kebede", type: "text" },
  { name: "phone", label: "TeleBirr phone", placeholder: "0911 234 567", type: "tel" },
  { name: "area", label: "Delivery area", placeholder: "Bole, Addis Ababa", type: "text" },
];

export default function CheckoutForm() {
  const [state, formAction, isPending] = useActionState(placeOrder, initialState);
  const { items, subtotal, clearCart } = useCart();
  const clearedOnceRef = useRef(false);

  useEffect(() => {
    if (state.status === "success" && state.orderId && !clearedOnceRef.current) {
      clearedOnceRef.current = true;
      clearCart();
    }
  }, [state.status, state.orderId, clearCart]);

  return (
    <form action={formAction} className="checkout-form">
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="total" value={subtotal} />
      {state.message && (
        <p className={state.status === "success" ? "form-success" : "form-error"} role="status">
          {state.message}
        </p>
      )}
      {fields.map((field) => {
        const error = state.fieldErrors[field.name]?.[0];
        return (
          <div className="checkout-field" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${field.name}-error` : undefined}
            />
            {error && <p id={`${field.name}-error`} className="field-error" role="alert">{error}</p>}
          </div>
        );
      })}
      <div className="checkout-field">
        <label htmlFor="notes">Notes <span>(optional)</span></label>
        <textarea id="notes" name="notes" rows="4" placeholder="Gate number or delivery instructions" />
        {state.fieldErrors.notes?.[0] && (
          <p className="field-error" role="alert">{state.fieldErrors.notes[0]}</p>
        )}
      </div>
      <button type="submit" className="button button-primary checkout-submit" disabled={isPending || items.length === 0}>
        {isPending ? "Placing order..." : "Place order"}
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}