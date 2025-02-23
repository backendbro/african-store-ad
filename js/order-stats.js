document.addEventListener("DOMContentLoaded", function () {
  // Replace the URL below with your actual endpoint URL.
  const endpoint =
    "https://african-store.onrender.com/api/v1/order/order-stats";

  fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      // If your endpoint requires authorization, add the token here.
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      // Expected data structure:
      // {
      //   pendingOrders: { count: 100000, change: 2.5 },
      //   completedOrders: { count: 180000, change: 2.0 },
      //   cancelledOrders: { count: 2000, change: -0.25 },
      //   refundRequests: { count: 800, change: 1.25 }
      // }

      // Update Pending Orders
      document.getElementById("pendingCount").textContent =
        data.pendingOrders.count;
      document.getElementById("pendingChange").textContent =
        (data.pendingOrders.change > 0 ? "+" : "") +
        data.pendingOrders.change +
        "%";

      // Update Completed Orders
      document.getElementById("completedCount").textContent =
        data.completedOrders.count;
      document.getElementById("completedChange").textContent =
        (data.completedOrders.change > 0 ? "+" : "") +
        data.completedOrders.change +
        "%";

      // Update Cancelled Orders
      document.getElementById("cancelledCount").textContent =
        data.cancelledOrders.count;
      document.getElementById("cancelledChange").textContent =
        (data.cancelledOrders.change > 0 ? "+" : "") +
        data.cancelledOrders.change +
        "%";

      // Update Refund Requests
      document.getElementById("refundCount").textContent =
        data.refundRequests.count;
      document.getElementById("refundChange").textContent =
        (data.refundRequests.change > 0 ? "+" : "") +
        data.refundRequests.change +
        "%";
    })
    .catch((error) => {
      console.error("Error fetching dashboard stats:", error);
    });
});
