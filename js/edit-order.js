document.addEventListener("DOMContentLoaded", async function () {
  // Get order ID from query string; if not present, redirect to orders list.
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("id");
  if (!orderId) {
    Swal.fire({
      title: "Order!",
      text: "Order not found",
      icon: "error",
      showConfirmButton: false,
      timer: 2000,
    });
    window.location.href = "/orders-list.html";
    return;
  }

  const token = localStorage.getItem("token");

  // Global variable to hold product names (for food item select options)
  let foodItems = [];

  // Fetch product names from the API and then initialize the form.
  try {
    const res = await fetch(
      "https://african-store.onrender.com/api/v1/product/normal"
    );
    const data = await res.json();
    foodItems = data.data.map((product) => product.name);
    // Initialize food form (clears container; we will populate with order items later)
    document.getElementById("foodItemsList").innerHTML = "";
  } catch (error) {
    console.error("Error fetching products:", error);
  }

  // Function to create a food item element (dropdown with quantity and price)
  function createFoodItemElement() {
    const itemDiv = document.createElement("div");
    itemDiv.className = "flex items-center space-x-2 mb-2";
    itemDiv.innerHTML = `
        <select class="food-item shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          ${foodItems
            .map((item) => `<option value="${item}">${item}</option>`)
            .join("")}
        </select>
        <input type="number" class="quantity shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Quantity" min="1" value="1">
        <input type="number" class="price shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Price" step="0.01" min="0">
        <button type="button" class="remove-item bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Remove</button>
      `;
    return itemDiv;
  }

  // Fetch the order details from the backend and populate the form.
  try {
    const orderRes = await fetch(
      `https://african-store.onrender.com/api/v1/order/${orderId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!orderRes.ok) throw new Error("Failed to fetch order details");
    const order = await orderRes.json();

    // Populate form fields
    document.getElementById("customerName").value = order.customer_name;
    document.getElementById("amountPaid").value = order.amount_paid;
    document.getElementById("paymentMethod").value = order.payment_method;
    document.getElementById("orderStatus").value = order.order_status;

    // Populate order items into the food items list container
    const foodItemsList = document.getElementById("foodItemsList");
    foodItemsList.innerHTML = "";
    order.order_items.forEach((item) => {
      const itemElem = createFoodItemElement();
      itemElem.querySelector(".food-item").value = item.food_name;
      itemElem.querySelector(".quantity").value = item.quantity;
      itemElem.querySelector(".price").value = item.price;
      foodItemsList.appendChild(itemElem);
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    Swal.fire({
      title: "Error",
      text: "Failed to load order details. Please try again.",
      icon: "error",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  // Remove food item element on clicking its remove button
  document
    .getElementById("foodItemsList")
    .addEventListener("click", function (e) {
      if (e.target.classList.contains("remove-item")) {
        e.target.closest("div").remove();
      }
    });

  // Handle form submission to update the order
  document
    .getElementById("orderForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      // Show a spinner on the submit button
      const submitBtn = this.querySelector("button[type='submit']");
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<i class="ri-loader-line animate-spin text-white"></i> Updating...`;
      submitBtn.disabled = true;

      const customer_name = document
        .getElementById("customerName")
        .value.trim();
      const amount_paid = parseFloat(
        document.getElementById("amountPaid").value
      );
      const payment_method = document.getElementById("paymentMethod").value;
      const order_status = document.getElementById("orderStatus").value;

      // Gather updated order items
      const order_items = [];
      const foodItemsList = document.getElementById("foodItemsList");
      Array.from(foodItemsList.children).forEach((itemElement) => {
        const foodSelect = itemElement.querySelector(".food-item");
        const quantityInput = itemElement.querySelector(".quantity");
        const priceInput = itemElement.querySelector(".price");
        if (foodSelect && quantityInput && priceInput) {
          const food_name = foodSelect.value;
          const quantity = parseInt(quantityInput.value, 10);
          const price = parseFloat(priceInput.value);
          if (food_name && !isNaN(quantity) && !isNaN(price)) {
            order_items.push({ food_name, quantity, price });
          } else {
            Swal.fire({
              title: "Update order",
              text: "Please check your values and try again.",
              icon: "error",
              timer: 2000,
              showConfirmButton: false,
            });
          }
        }
      });

      const updatedOrder = {
        customer_name,
        amount_paid,
        payment_method,
        order_status,
        order_items,
      };

      try {
        const updateRes = await fetch(
          `https://african-store.onrender.com/api/v1/order/${orderId}`,
          {
            method: "PUT", // or PATCH if your API supports it
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedOrder),
          }
        );

        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;

        if (updateRes.ok) {
          Swal.fire({
            title: "Update Order",
            text: "Order updated successfully",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          // Refresh the page to show updated data
          window.location.reload();
        } else {
          Swal.fire({
            title: "Update Order",
            text: "Order could not be updated",
            icon: "error",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Error updating order:", error);
        Swal.fire({
          title: "Update Order",
          text: "An error occurred. Please try again.",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
});
