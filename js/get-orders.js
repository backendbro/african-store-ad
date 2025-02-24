document.addEventListener("DOMContentLoaded", async function () {
  const tableBody = document.querySelector("tbody");
  const paginationContainer = document.querySelector(".pagination-container");
  const token = localStorage.getItem("token");
  let currentPage = 1;
  const limit = 10;
  let totalOrders = 0;
  let currentFilter = ""; // if you need to support filtering export as well

  // Fetch and render orders (existing code)
  async function fetchOrders(page, filter = "") {
    try {
      const url = new URL(
        "https://african-store.onrender.com/api/v1/order/pagination"
      );
      url.searchParams.append("page", page);
      url.searchParams.append("limit", limit);
      if (filter) {
        url.searchParams.append("filter", filter);
      }

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      totalOrders = data.totalOrders;
      if (!data || !data.orders) {
        console.error("No orders found.");
        return;
      }

      // Clear existing rows
      tableBody.innerHTML = "";
      data.orders.forEach((order) => {
        const orderItems = order.order_items
          .slice(0, 2)
          .map((item) => item.food_name);
        const displayedItems =
          orderItems.length < order.order_items.length
            ? [...orderItems, "..."]
            : orderItems;

        const row = document.createElement("tr");
        row.innerHTML = `
              <td class="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" class="rounded text-blue-600">
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <a class="text-blue-400 cursor-pointer hover:text-gray-700" href="order-details.html?id=${
                    order._id
                  }">#${order._id.slice(-6)}</a>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${displayedItems.join(
                ", "
              )}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(
                order.createdAt
              ).toLocaleDateString()}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                order.customer_name
              }</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€${order.amount_paid.toFixed(
                2
              )}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.order_status === "successful"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }">
                      ${order.order_status}
                  </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                <div class="flex gap-2 items-center relative">
                    <button class="text-gray-400 hover:text-gray-600 view-order" data-id="${
                      order._id
                    }">
                      <a href="order-details.html?id=${order._id}">
                        <i class="ri-eye-line text-lg"></i>
                      </a>
                    </button>
                    <button class="text-gray-400 hover:text-gray-600 more-options relative">
                        <i class="ri-more-2-fill text-lg"></i>
                    </button>
                    <div class="dropdown-menu absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-md border border-gray-300 hidden z-10">
                        <a href="/edit-order.html?id=${
                          order._id
                        }" class="block w-full text-left text-sm text-gray-700 px-4 py-2 hover:bg-gray-100" data-id="${
          order._id
        }">
                            <i class="ri-edit-line text-blue-500"></i> Update
                        </a>
                        <button class="block w-full text-left text-sm text-red-600 px-4 py-2 hover:bg-red-100 delete-order" data-id="${
                          order._id
                        }">
                            <i class="ri-delete-bin-line text-red-500"></i> Delete
                        </button>
                    </div>
                </div>
              </td>
            `;
        tableBody.appendChild(row);
      });

      // (Re)attach event listeners for view, more options, delete, etc.
      attachEventListeners();
      updatePaginationControls();
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }

  function attachEventListeners() {
    // View order
    document.querySelectorAll(".view-order").forEach((button) => {
      button.addEventListener("click", (event) => {
        const orderId = event.currentTarget.dataset.id;
        window.location.href = `order-details.html?id=${orderId}`;
      });
    });

    // More options dropdown
    document.querySelectorAll(".more-options").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const dropdown = event.currentTarget.nextElementSibling;
        document.querySelectorAll(".dropdown-menu").forEach((menu) => {
          if (menu !== dropdown) menu.classList.add("hidden");
        });
        dropdown.classList.toggle("hidden");
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      document.querySelectorAll(".dropdown-menu").forEach((menu) => {
        menu.classList.add("hidden");
      });
    });

    // Delete order
    document.querySelectorAll(".delete-order").forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.stopPropagation();
        const orderId = event.currentTarget.dataset.id;
        await deleteOrder(orderId, event.currentTarget);
      });
    });
  }

  async function deleteOrder(orderId, button) {
    if (!confirm("Are you sure you want to delete this order?")) {
      return;
    }

    const row = button.closest("tr");
    const originalContent = button.innerHTML;
    button.innerHTML = `<i class="ri-loader-line animate-spin text-red-500"></i> Deleting...`;
    button.disabled = true;

    try {
      const response = await fetch(
        `https://african-store.onrender.com/api/v1/order/${orderId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        Swal.fire({
          title: "Delete order",
          text: "Delete order failed",
          icon: "error",
          showConfirmButton: false,
          timer: 2000,
        });
        throw new Error(`Delete failed with status ${response.status}`);
      }

      row.remove();

      Swal.fire({
        title: "Deleted!",
        text: "The order has been deleted.",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete the order. Please try again.");
      button.innerHTML = originalContent;
      button.disabled = false;
    }
  }

  function updatePaginationControls() {
    const totalPages = Math.ceil(totalOrders / limit);
    paginationContainer.innerHTML = `
          <div class="flex-1 flex justify-between sm:hidden">
              <button class="prev-page relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" ${
                currentPage === 1 ? "disabled" : ""
              }>Previous</button>
              <button class="next-page ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" ${
                currentPage === totalPages ? "disabled" : ""
              }>Next</button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                  <p class="text-sm text-gray-700">Showing <span class="font-medium">${
                    (currentPage - 1) * limit + 1
                  }</span> to <span class="font-medium">${Math.min(
      currentPage * limit,
      totalOrders
    )}</span> of <span class="font-medium">${totalOrders}</span> results</p>
              </div>
              <div>
                  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button class="prev-page relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50" ${
                        currentPage === 1 ? "disabled" : ""
                      }>
                          <i class="ri-arrow-left-s-line"></i>
                      </button>
                      ${Array.from(
                        { length: totalPages },
                        (_, i) => `
                        <button class="page-number relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                          currentPage === i + 1 ? "bg-gray-300" : ""
                        }" data-page="${i + 1}">
                          ${i + 1}
                        </button>
                      `
                      ).join("")}
                      <button class="next-page relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50" ${
                        currentPage === totalPages ? "disabled" : ""
                      }>
                          <i class="ri-arrow-right-s-line"></i>
                      </button>
                  </nav>
              </div>
          </div>
        `;

    document.querySelector(".prev-page")?.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        fetchOrders(currentPage, currentFilter);
      }
    });
    document.querySelector(".next-page")?.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        fetchOrders(currentPage, currentFilter);
      }
    });
    document.querySelectorAll(".page-number").forEach((button) => {
      button.addEventListener("click", () => {
        currentPage = parseInt(button.dataset.page);
        fetchOrders(currentPage, currentFilter);
      });
    });
  }

  // Export Function: Generate a PDF of all orders instead of CSV.
  async function exportOrders() {
    const exportBtn = document.getElementById("exportBtn");
    const originalContent = exportBtn.innerHTML;

    // Show spinner on export button
    exportBtn.innerHTML = `<i class="ri-loader-line animate-spin text-gray-500"></i> Exporting...`;
    exportBtn.disabled = true;

    try {
      // Fetch all orders using a high limit (or a dedicated export endpoint)
      const url = new URL(
        "https://african-store.onrender.com/api/v1/order/pagination"
      );
      url.searchParams.append("page", 1);
      url.searchParams.append("limit", 1000000); // High limit to get all orders
      if (currentFilter) {
        url.searchParams.append("filter", currentFilter);
      }

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const orders = data.orders;
      if (!orders || orders.length === 0) {
        Swal.fire({
          title: "Export order",
          text: "This time period does have any order",
          icon: "error",
          showConfirmButton: false,
          timer: 2000,
        });
        return;
      }

      // Create PDF using jsPDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      let y = 10;

      // Header Section
      doc.setFillColor(230, 230, 230);
      doc.rect(0, 0, 210, 20, "F");
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("Orders Export", 105, 14, { align: "center" });
      y = 30;

      // Loop through orders and add details
      orders.forEach((order, idx) => {
        doc.setFontSize(12);
        doc.text(`Order ID: ${order._id}`, 10, y);
        y += 6;
        doc.text(`Customer: ${order.customer_name}`, 10, y);
        y += 6;
        doc.text(
          `Order Date: ${new Date(order.createdAt).toLocaleDateString()}`,
          10,
          y
        );
        y += 6;
        doc.text(`Amount Paid: €${order.amount_paid.toFixed(2)}`, 10, y);
        y += 6;
        doc.text(`Status: ${order.order_status}`, 10, y);
        y += 6;
        doc.text("Items:", 10, y);
        y += 6;
        order.order_items.forEach((item, itemIdx) => {
          doc.text(
            `- ${item.food_name} | Qty: ${
              item.quantity
            } | Price: €${item.price.toFixed(2)}`,
            12,
            y
          );
          y += 6;
        });
        y += 4;
        // Draw horizontal line between orders
        doc.line(10, y, 200, y);
        y += 6;

        // If y is near the bottom, add a new page
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
      });

      doc.save("orders_export.pdf");
    } catch (error) {
      console.error("Error exporting orders:", error);
      alert("Failed to export orders. Please try again.");
    } finally {
      exportBtn.innerHTML = originalContent;
      exportBtn.disabled = false;
    }
  }

  // Attach export functionality to the export button
  const exportBtnElement = document.getElementById("exportBtn");
  exportBtnElement.addEventListener("click", exportOrders);

  // Attach filter functionality to buttons (using your provided HTML)
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active styling from all filter buttons
      filterButtons.forEach((btn) => {
        btn.classList.remove("bg-gray-100", "text-gray-900");
        btn.classList.add("text-gray-500");
      });

      // Add active styling to clicked button
      this.classList.add("bg-gray-100", "text-gray-900");
      this.classList.remove("text-gray-500");

      // Set the filter value and refetch orders from page 1
      currentFilter = this.getAttribute("data-id") || "";
      currentPage = 1;
      fetchOrders(currentPage, currentFilter);
    });
  });

  // Initial fetch
  fetchOrders(currentPage, currentFilter);
});
