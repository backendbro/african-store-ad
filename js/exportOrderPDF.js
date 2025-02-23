document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("id");

  if (!orderId) {
    console.error("Order ID not found in URL");
    Swal.fire({
      title: "Order!",
      text: "Order not found",
      icon: "error",
      showConfirmButton: false,
      timer: 2000,
    });
    window.location.href = "/orders-list.html";
  }

  const token = localStorage.getItem("token");
  const exportBtn = document.getElementById("exportPDFBtn");
  exportBtn.addEventListener("click", exportPDF);

  async function exportPDF() {
    // Store original button content and disable the button
    const originalContent = exportBtn.innerHTML;
    exportBtn.innerHTML = `<i class="ri-loader-line animate-spin text-white"></i> Exporting...`;
    exportBtn.disabled = true;

    try {
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

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const order = await response.json();
      if (!order) {
        alert("Order data not found!");
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Set up some margins
      const marginLeft = 14;
      const marginRight = 196;
      let y = 10;

      // Header: Background rectangle & Title
      doc.setFillColor(230, 230, 230);
      doc.rect(0, 0, 210, 20, "F"); // Light gray header background
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("Order Details", 105, 14, { align: "center" });
      y = 30;

      // Order Details Section
      doc.setFontSize(12);
      doc.text(`Order ID: ${order._id}`, marginLeft, y);
      y += 8;
      doc.text(`Customer: ${order.customer_name}`, marginLeft, y);
      y += 8;
      doc.text(`Order Date: ${formatDate(order.createdAt)}`, marginLeft, y);
      y += 8;
      doc.text(`Payment Method: ${order.payment_method}`, marginLeft, y);
      y += 8;
      doc.text(`Order Status: ${order.order_status}`, marginLeft, y);
      y += 10;

      // Draw a horizontal line
      doc.setDrawColor(0, 0, 0);
      doc.line(marginLeft, y, marginRight, y);
      y += 10;

      // Order Items Section
      doc.setFontSize(14);
      doc.text("Items:", marginLeft, y);
      y += 8;
      doc.setFontSize(12);

      order.order_items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.food_name}`, marginLeft, y);
        y += 6;
        doc.text(
          `   Qty: ${item.quantity} | Unit Price: ₤${item.price.toFixed(2)}`,
          marginLeft + 6,
          y
        );
        y += 6;
        const itemTotal = item.price * item.quantity;
        doc.text(`   Total: ₤${itemTotal.toFixed(2)}`, marginLeft + 6, y);
        y += 8;
        // Draw a line after each item
        doc.line(marginLeft, y, marginRight, y);
        y += 4;
      });

      // Calculate and display the Grand Total
      const grandTotal = order.order_items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      y += 10;
      doc.setFontSize(14);
      doc.text(`Grand Total: ₤${grandTotal.toFixed(2)}`, marginLeft, y);

      // Save the PDF with a dynamic filename
      doc.save(`order_${order._id}.pdf`);
    } catch (error) {
      console.error("Error exporting order:", error);
      alert("Failed to export order. Please try again.");
    } finally {
      // Restore export button's original state
      exportBtn.innerHTML = originalContent;
      exportBtn.disabled = false;
    }
  }

  // Helper function to format dates (e.g., "03 Dec 2024 at 6:23pm")
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
});
