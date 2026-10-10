document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("adminLoggedIn") === "true") {
    window.location.href = "admin-dashboard.html";
    return;
  }

  const form = document.getElementById("loginForm");
  const error = document.getElementById("loginError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "admin123") {
      sessionStorage.setItem("adminLoggedIn", "true");
      sessionStorage.setItem("adminUser", username);
      window.location.href = "admin-dashboard.html";
    } else {
      error.textContent = "Invalid username or password. Use admin / admin123 for this demo.";
      error.classList.remove("hidden");
    }
  });
});
