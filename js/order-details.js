document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("id");

  if (!orderId) {
    console.error("Owner ID not found in URL");

    Swal.fire({
      title: "Order!",
      text: "Order not found",
      icon: "error",
      showConfirmButton: false,
      timer: 2000,
    });

    window.location.href = "/orders-list.html";
  }

  console.log(orderId);

  // Get authentication token (assuming it's stored in localStorage)
  const token = localStorage.getItem("token");

  const response = await fetch(
    `https://african-store.onrender.com/api/v1/order/${orderId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log(response);
  if (!response.ok) {
    throw new Error("Failed to fetch product details");
  }

  const order = await response.json();
  renderOrderItems(order.order_items);
  displayOrderStatus(order);

  console.log(order);
  document
    .querySelector("#edit-order")
    .setAttribute("href", `/edit-order.html?id=${orderId}`);

  document.querySelector("#order-id").textContent = order._id;
  document.querySelector("#order-h1-id").textContent = order._id;

  function formatDate(dateString) {
    const date = new Date(dateString);

    let day = date.getDate();
    day = day < 10 ? "0" + day : day;

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];

    const year = date.getFullYear();

    let hours = date.getHours();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    let minutes = date.getMinutes();
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return `${day} ${month} ${year} at ${hours}:${minutes}${ampm}`;
  }

  document.querySelector("#order-date").textContent = formatDate(
    order.createdAt
  );

  document.querySelector("#payment_method").textContent = order.payment_method;
  document.querySelector("#payment_details_method").textContent =
    order.payment_method;
  document.querySelector("#order_status").textContent = order.order_status;
  document.querySelector(
    "#items_count"
  ).textContent = `(${order.order_items.length} products)`;

  function renderOrderItems(orderItems) {
    document.getElementById("orderItemsContainer").innerHTML = "";
    // Create the outer container with a dividing line between items
    const container = document.createElement("div");
    container.className = "divide-y divide-gray-200";

    let grandTotal = 0;

    orderItems.forEach((item) => {
      // Create a container for each item
      const itemDiv = document.createElement("div");
      itemDiv.className = "py-4 flex items-start gap-4";

      // Create an image element
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.food_name;
      img.className = "w-20 h-20 rounded-lg object-cover";

      // Create the details container
      const infoDiv = document.createElement("div");
      infoDiv.className = "flex-1";

      // Food name as title
      const title = document.createElement("h4");
      title.className = "font-medium";
      title.textContent = item.food_name;

      // Optional description element (empty here; fill as needed)
      const desc = document.createElement("p");
      desc.className = "text-sm text-gray-500";
      desc.textContent = ""; // Add description text if available

      // Create a container for quantity info
      const qtyDiv = document.createElement("div");
      qtyDiv.className = "mt-1 flex items-center gap-4";
      const qtySpan = document.createElement("span");
      qtySpan.className = "text-sm";
      qtySpan.textContent = `Qty: ${item.quantity}`;
      qtyDiv.appendChild(qtySpan);

      // Append title, description, and quantity container to the details div
      infoDiv.appendChild(title);
      infoDiv.appendChild(desc);
      infoDiv.appendChild(qtyDiv);

      // Create the price container
      const priceDiv = document.createElement("div");
      priceDiv.className = "text-right";

      // Display unit price
      const priceP = document.createElement("p");
      priceP.className = "font-medium";
      priceP.textContent = `€${item.price}`;
      priceDiv.appendChild(priceP);

      const itemTotal = item.price * item.quantity;
      grandTotal += itemTotal;

      // Calculate total price (unit price * quantity)
      const totalPrice = item.price * item.quantity;
      const totalP = document.createElement("p");
      totalP.className = "font-medium text-sm text-gray-600";
      totalP.textContent = `Total: €${totalPrice.toFixed(2)}`;
      priceDiv.appendChild(totalP);

      // Append the image, details, and price to the item container
      itemDiv.appendChild(img);
      itemDiv.appendChild(infoDiv);
      itemDiv.appendChild(priceDiv);

      // Append this item container to the overall container
      container.appendChild(itemDiv);
    });

    document.querySelector("#bag_total").innerText = `€${grandTotal}`;
    document.querySelector("#sub_total").innerText = `€${grandTotal}`;
    document.querySelector("#total_balance").innerText = `€${grandTotal}`;
    document.querySelector("#con_charges").innerText = `€0`;
    document.querySelector("#shipping_total").innerHTML = `€0`;

    const grandTotalDiv = document.createElement("div");
    grandTotalDiv.className = "text-right mt-4";
    const grandTotalP = document.createElement("p");
    grandTotalP.className = "font-bold text-lg";
    grandTotalP.textContent = `Grand total: €${grandTotal.toFixed(2)}`;
    grandTotalDiv.appendChild(grandTotalP);

    // Append the grand total container to the overall container
    container.appendChild(grandTotalDiv);
    return container;
  }

  // Find the container element in the HTML where order items will be displayed.
  const orderItemsContainer = document.getElementById("orderItemsContainer");
  if (orderItemsContainer) {
    // Render the order items and append them to the container
    orderItemsContainer.appendChild(renderOrderItems(order.order_items));
  } else {
    console.error('No element with id "orderItemsContainer" found in the DOM.');
  }

  function displayOrderStatus(order) {
    // Determine the status title and description based on the order status
    let statusTitle = "";
    let statusDescription = "";

    console.log(order.order_status);
    switch (order.order_status) {
      case "pending":
        statusTitle = "Order Placed";
        statusDescription =
          "An order has been placed and is awaiting processing.";
        break;
      case "successful":
        statusTitle = "Order Successful";
        statusDescription = "Your order has been successfully processed.";
        break;
      case "failed":
        statusTitle = "Order Failed";
        statusDescription = "There was an issue processing your order.";
        break;
      default:
        statusTitle = "Order Status Unknown";
        statusDescription = "The status of this order could not be determined.";
    }

    // Format the creation date – adjust locale or format as needed.
    const formattedDate = new Date(order.createdAt).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Get the container element
    const container = document.getElementById("orderStatusSection");
    if (!container) {
      console.error(
        "No element with id 'orderStatusSection' found in the DOM."
      );
      return;
    }

    // Fill the container with the order status details
    container.innerHTML = `
      <div>
        <p class="font-medium">${statusTitle}</p>
        <p class="text-sm text-gray-500">${statusDescription}</p>
        <p class="text-xs text-gray-400">${formattedDate}</p>
      </div>
    `;
  }
});
