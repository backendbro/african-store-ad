document.addEventListener("DOMContentLoaded", async function () {
  const API_URL = "https://african-store.onrender.com/api/v1/auth/me";
  const token = localStorage.getItem("token");

  if (!token) {
    disableApplication("No authentication token found.");
    return;
  }

  try {
    const user = await fetchAdminStatus(token);

    if (user?.user?.role !== "admin") {
      disableApplication(
        "Not authenticated",
        "You do not have admin permissions."
      );
    }
  } catch (error) {
    console.error("Admin status check failed:", error);
    disableApplication("Not authorized", "Failed to verify admin status.");
  }

  async function fetchAdminStatus(token) {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user status");
    }

    return response.json();
  }

  function disableApplication(title, message) {
    // document.body.innerHTML = `<h2 style="text-align: center; color: red; margin-top: 20px;">
    //   ${message} Redirecting...
    // </h2>`;

    // setTimeout(() => {
    //   window.location.href = "/login"; // Redirect to login page
    // }, 3000);

    Swal.fire({
      title,
      text: message,
      icon: "error",
      showConfirmButton: false,
      timer: 2000, // Auto close in 2 seconds
    });

    setTimeout(() => {
      window.location.href = "/account.html";
    }, 2000);
  }
});
