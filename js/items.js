document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector("#mostSoldItemsContainer");

  try {
    const response = await fetch(
      "https://african-store.onrender.com/api/v1/order/order-items",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const items = await response.json();
    console.log(items);

    container.innerHTML = ""; // Clear existing content

    // Generate HTML for each item
    items.forEach((item) => {
      const itemHTML = `
          <div class="fade-in">
            <div class="mb-1 flex items-center justify-between text-sm font-medium text-gray-700">
              <span>${item.name}</span>
              <span>${item.percentage}%</span>
            </div>
            <div class="h-3 w-full rounded-full bg-gray-200 shadow-inner">
              <div class="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700 ease-in-out"
                style="width: ${item.percentage}%;"></div>
            </div>
          </div>
        `;
      container.innerHTML += itemHTML;
    });
  } catch (error) {
    console.error("Error fetching most sold items:", error);
    container.innerHTML =
      "<p class='text-red-500 text-center'>Failed to load data.</p>";
  }
});
