"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "../actions";

const initialState = { status: "idle", message: "" };

export default function CancelOrderButton({ orderId }) {
  const cancelAction = async (_previousState) => cancelOrder(orderId);
  const [state, formAction, isPending] = useActionState(cancelAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <div className="order-cancel-control">
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!window.confirm("Cancel this pending order?")) {
            event.preventDefault();
          }
        }}
      >
        <button type="submit" className="order-cancel-button" disabled={isPending}>
          {isPending ? "Cancelling..." : "Cancel order"}
        </button>
      </form>
      {state.message && <p role="status">{state.message}</p>}
    </div>
  );
}
