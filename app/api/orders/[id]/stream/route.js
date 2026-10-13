import { getOrderForOwner } from "@/lib/orders";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function sendEvent(controller, eventName, payload) {
  const data = `event: ${eventName}\n` + `data: ${JSON.stringify(payload)}\n\n`;
  controller.enqueue(encoder.encode(data));
}

function getStatusMessage(status) {
  switch (status) {
    case "pending":
      return "Your order has been received and is waiting for confirmation.";
    case "preparing":
      return "Your order is being prepared in the kitchen.";
    case "delivering":
      return "A courier is on the way to your address.";
    case "delivered":
      return "Your order has been delivered.";
    case "cancelled":
      return "This order was cancelled.";
    default:
      return "Checking for delivery updates.";
  }
}

export async function GET(request, { params }) {
  const { id } = await params;

  const session = await getSession();
  if (!session) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to track this order." } },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const order = await getOrderForOwner(id, session.id);
  if (!order) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Order not found." } },
      { status: 404, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const stream = new ReadableStream({
    start(controller) {
      let lastStatus = order.status;
      let keepAliveTimer;
      let pollerTimer;

      const emit = (payload) => {
        sendEvent(controller, "order-status", payload);
      };

      const close = () => {
        if (keepAliveTimer) {
          clearInterval(keepAliveTimer);
        }
        if (pollerTimer) {
          clearInterval(pollerTimer);
        }
        controller.close();
      };

      const publish = async () => {
        try {
          const currentOrder = await getOrderForOwner(id, session.id);
          if (!currentOrder) {
            close();
            return;
          }

          const nextStatus = currentOrder.status;
          if (nextStatus !== lastStatus) {
            lastStatus = nextStatus;
            emit({
              status: nextStatus,
              updatedAt: currentOrder.cancelledAt ?? currentOrder.createdAt,
              message: getStatusMessage(nextStatus),
            });
          }

          if (["delivered", "cancelled"].includes(nextStatus)) {
            emit({
              status: nextStatus,
              updatedAt: currentOrder.cancelledAt ?? currentOrder.createdAt,
              message: getStatusMessage(nextStatus),
            });
            close();
            return;
          }
        } catch {
          // Silent retry on transient polling failures; the client reconnects.
        }
      };

      emit({
        status: order.status,
        updatedAt: order.cancelledAt ?? order.createdAt,
        message: getStatusMessage(order.status),
      });

      keepAliveTimer = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 15000);

      pollerTimer = setInterval(() => {
        publish().catch(() => undefined);
      }, 5000);

      request.signal.addEventListener("abort", close, { once: true });
    },
    cancel() {
      // The request abort event handles cleanup for the polling loop.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "private, no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
