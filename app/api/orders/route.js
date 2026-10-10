import {
  createOrder,
  getOrderForOwner,
  toPublicOrder,
  updateOrderStatusForStaff,
} from "../../../lib/orders";
import { getSession, isStaff } from "../../../lib/session";
import { validateOrder } from "../../../lib/validate-order";

const privateJson = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });

function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return privateJson(
      { error: { code: "UNAUTHORIZED", message: "Sign in to view this order." } },
      401,
    );
  }

  const orderId = new URL(request.url).searchParams.get("id");
  if (!orderId) {
    return privateJson(
      { error: { code: "INVALID_ID", message: "An order ID is required." } },
      400,
    );
  }

  const order = await getOrderForOwner(orderId, session.id);
  if (!order) {
    return privateJson(
      { error: { code: "NOT_FOUND", message: "Order not found." } },
      404,
    );
  }

  return privateJson({ order });
}

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return privateJson(
      { error: { code: "FORBIDDEN_ORIGIN", message: "Cross-origin order requests are not allowed." } },
      403,
    );
  }

  const session = await getSession();
  if (!session) {
    return privateJson(
      { error: { code: "UNAUTHORIZED", message: "Sign in to place an order." } },
      401,
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return privateJson(
      { error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } },
      400,
    );
  }

  const result = await validateOrder(body);
  if (!result.success) {
    return privateJson(
      {
        error: { code: "VALIDATION_ERROR", message: "Check the highlighted fields and try again." },
        fieldErrors: result.fieldErrors,
      },
      422,
    );
  }

  const order = await createOrder(session.id, result.data);
  return privateJson({ order: toPublicOrder(order) }, 201);
}

export async function PATCH(request) {
  if (!isSameOrigin(request)) {
    return privateJson(
      { error: { code: "FORBIDDEN_ORIGIN", message: "Cross-origin updates are not allowed." } },
      403,
    );
  }

  const session = await getSession();
  if (!session) {
    return privateJson(
      { error: { code: "UNAUTHORIZED", message: "Sign in to update an order." } },
      401,
    );
  }
  if (!isStaff(session)) {
    return privateJson(
      { error: { code: "FORBIDDEN", message: "Staff access is required." } },
      403,
    );
  }

  const orderId = new URL(request.url).searchParams.get("id");
  if (!orderId) {
    return privateJson(
      { error: { code: "INVALID_ID", message: "An order ID is required." } },
      400,
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return privateJson(
      { error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } },
      400,
    );
  }

  const statuses = ["preparing", "delivering", "delivered", "cancelled"];
  if (!statuses.includes(body?.status)) {
    return privateJson(
      { error: { code: "INVALID_STATUS", message: "Order status is invalid." } },
      422,
    );
  }

  const result = await updateOrderStatusForStaff(orderId, body.status);
  if (result.status === "not-found") {
    return privateJson(
      { error: { code: "NOT_FOUND", message: result.message } },
      404,
    );
  }
  if (result.status === "conflict") {
    return privateJson(
      { error: { code: "INVALID_TRANSITION", message: result.message } },
      409,
    );
  }

  return privateJson({ order: result.order });
}