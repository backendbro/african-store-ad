// document.addEventListener("DOMContentLoaded", () => {
//   const orderForm = document.getElementById("orderForm");

//   orderForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     // Get order-level inputs
//     const customer_name = document.getElementById("customerName").value.trim();
//     const amount_paid = parseFloat(document.getElementById("amountPaid").value);
//     const payment_method = document.getElementById("paymentMethod").value;
//     const order_status = document.getElementById("orderStatus").value;

//     // Get order items
//     const order_items = [];
//     const foodItemsList = document.getElementById("foodItemsList");

//     // Loop through each dynamically added food item element.
//     // Here, we're assuming that each direct child of foodItemsList represents one food item.
//     Array.from(foodItemsList.children).forEach((itemElement) => {
//       const foodSelect = itemElement.querySelector(".food-item");
//       const quantityInput = itemElement.querySelector(".quantity");
//       const priceInput = itemElement.querySelector(".price");

//       // Only add the food item if all fields exist
//       if (foodSelect && quantityInput && priceInput) {
//         const food_name = foodSelect.value;
//         const quantity = parseInt(quantityInput.value, 10);
//         const price = parseFloat(priceInput.value);

//         // Ensure valid values before pushing
//         if (food_name && !isNaN(quantity) && !isNaN(price)) {
//           order_items.push({ food_name, quantity, price });
//         }
//       }
//     });

//     // Build the order object
//     const orderData = {
//       customer_name,
//       amount_paid,
//       payment_method,
//       order_status,
//       order_items,
//     };

//     console.log("Order Data:", orderData);
//     const createOrderResponse = await fetch(
//       `https://african-store.onrender.com/api/v1/order`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify(orderData),
//       }
//     );
//     const responseData = await createOrderResponse.json();
//     console.log("Order created:", responseData);
//   });
// });
