"use client";

export default function DeleteDishButton() {
  return (
    <button
      type="submit"
      className="admin-danger-button"
      onClick={(event) => {
        if (!window.confirm("Permanently delete this dish from the menu?")) {
          event.preventDefault();
        }
      }}
    >
      Delete dish
    </button>
  );
}
