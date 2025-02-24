document.addEventListener("DOMContentLoaded", async function () {
  console.log("RECENT ACTIVITY");
  try {
    const response = await fetch(
      "https://african-store.onrender.com/api/v1/order/recent-activity",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const result = await response.json();

    if (result.success) {
      const { users, orders, products } = result.data;
      const activityContainer = document.querySelector("#recent-act");
      activityContainer.innerHTML = ""; // Clear previous content

      // Function to format date and time
      const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        return (
          date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          }) +
          " " +
          date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      };

      // Function to create an activity item
      const createActivityItem = (
        icon,
        colorClass,
        title,
        description,
        dateTime
      ) => {
        return `
              <div class="flex items-center gap-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-full ${colorClass}">
                  <i class="${icon}"></i>
                </div>
                <div>
                  <p class="text-sm font-medium">${title}</p>
                  <p class="text-sm text-gray-500">${description}</p>
                  <p class="text-xs text-gray-400">${dateTime}</p>
                </div>
              </div>
            `;
      };

      // Populate users
      users.forEach((user) => {
        activityContainer.innerHTML += createActivityItem(
          "ri-user-add-line text-blue-600",
          "bg-blue-100",
          "New Customer Registration",
          `${user.username} created an account`,
          formatDateTime(user.createdAt)
        );
      });

      // Populate orders
      orders.forEach((order) => {
        activityContainer.innerHTML += createActivityItem(
          "ri-shopping-bag-line text-green-600",
          "bg-green-100",
          "New Order Placed",
          `Order #${order._id} was placed`,
          formatDateTime(order.createdAt)
        );
      });

      // Populate products
      products.forEach((product) => {
        activityContainer.innerHTML += createActivityItem(
          "ri-box-3-line text-yellow-600",
          "bg-yellow-100",
          "Product Update",
          `${product.name} was added`,
          formatDateTime(product.createdAt)
        );
      });
    } else {
      console.error("Failed to fetch recent activity");
    }
  } catch (error) {
    console.error("Error fetching recent activity:", error);
  }
});
