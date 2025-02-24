document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(
      "https://african-store.onrender.com/api/v1/order/order-metrics",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch metrics");
    }
    const data = await response.json();
    console.log(data);
    // Update the HTML with the fetched metrics
    document.getElementById(
      "totalSales"
    ).textContent = `€${data.totalSales.toLocaleString()}`;
    document.getElementById("totalOrders").textContent =
      data.totalOrders.toLocaleString();
    document.getElementById("activeUsers").textContent =
      data.activeUsers.toLocaleString();

    // Format percentages with a plus sign if positive
    const formatPercentage = (val) => {
      console.log(val);
      const formatted = Math.abs(val).toFixed(1) + "%";
      return val >= 0 ? `+${formatted}` : `-${formatted}`;
    };

    document.getElementById("salesChange").textContent = `${formatPercentage(
      data.percentSalesChange
    )} from last month`;
    document.getElementById("ordersChange").textContent = `${formatPercentage(
      data.percentOrdersChange
    )} from last month`;
    document.getElementById("usersChange").textContent = `${formatPercentage(
      data.percentActiveUsersChange
    )} from last month`;
  } catch (error) {
    console.error("Error fetching metrics:", error);
  }
});
