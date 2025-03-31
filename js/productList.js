const productList = document.getElementById("productList");
const paginationContainer = document.getElementById("pagination");
const filterButtons = document.querySelectorAll(".filter-btn");

let currentPage = 1;
let totalPages = 1;
const limit = 10;
let activeFilter = "all"; // Default filter

async function fetchProducts(page = 1, filter = "all") {
  let url = `https://african-store.onrender.com/api/v1/product/product-admin?page=${page}&limit=${limit}`;
  if (filter === "new") {
    url += "&filterType=new";
  } else if (filter === "low") {
    url += "&filterType=lowStock";
  }
  try {
    const response = await fetch(url);
    const result = await response.json();

    console.log(result);
    if (response.ok) {
      renderProducts(result.data);
      renderPagination(result.pagination);
    } else {
      console.error("Error fetching products:", result.message);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
}

function renderProducts(products) {
  productList.innerHTML = ""; // Clear existing products

  products.forEach((product) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", product._id);
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">
        <input type="checkbox" class="rounded text-blue-600">
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center gap-3">
          <img src="${product.file[0]}" alt="${
      product.name
    }" class="w-10 h-10 rounded-lg object-cover">
          <div>
            <div class="font-medium text-gray-900">${product.name}</div>
            <div class="text-sm text-gray-500">#${product._id}</div>
            <div class="text-xs text-gray-400">${product.Variants}</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${product.category?.name || "Uncategorized"}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${product.StockQuantity} units
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        €${product.BasePrice.toFixed(2)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          product.StockQuantity > 0
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }">
          ${product.StockQuantity > 0 ? "In Stock" : "Out of Stock"}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div class="flex gap-2">
          <button class="edit-btn text-gray-400 hover:text-gray-600" data-id="${
            product._id
          }">
            <i class="ri-pencil-line"></i>
          </button>
          <button class="delete-btn text-gray-400 hover:text-gray-600">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </td>
    `;
    productList.appendChild(tr);
  });
}

function renderPagination({ currentPage, totalPages, totalProducts }) {
  console.log({ currentPage, totalPages, totalProducts });
  paginationContainer.innerHTML = `
    <div class="flex items-center justify-between w-full">
      <p class="text-sm text-gray-700">
        Showing <span class="font-medium">${
          (currentPage - 1) * limit + 1
        }</span>
        to <span class="font-medium">${Math.min(
          currentPage * limit,
          totalProducts
        )}</span>
        of <span class="font-medium">${totalProducts}</span> results
      </p>

      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button id="prevPage" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50" ${
          currentPage === 1 ? "disabled" : ""
        }>
          <i class="ri-arrow-left-s-line"></i>
        </button>
        ${Array.from({ length: totalPages }, (_, i) => {
          const page = i + 1;
          const activeClass =
            page === currentPage ? "font-bold bg-gray-200" : "";
          return `<button class="page-btn relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 ${activeClass}" data-page="${page}">
              ${page}
            </button>`;
        }).join("")}
        <button id="nextPage" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50" ${
          currentPage === totalPages ? "disabled" : ""
        }>
          <i class="ri-arrow-right-s-line"></i>
        </button>
      </nav>
    </div>
  `;

  // Attach event listeners
  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) fetchProducts(--currentPage, activeFilter);
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage < totalPages) fetchProducts(++currentPage, activeFilter);
  });

  document.querySelectorAll(".page-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const selectedPage = Number(e.target.dataset.page);
      currentPage = selectedPage;
      fetchProducts(selectedPage, activeFilter);
    });
  });
}

function updateActiveFilter(selectedFilter) {
  filterButtons.forEach((btn) => {
    if (btn.dataset.filter === selectedFilter) {
      btn.classList.add("bg-gray-100", "text-gray-900");
      btn.classList.remove("text-gray-500");
    } else {
      btn.classList.remove("bg-gray-100", "text-gray-900");
      btn.classList.add("text-gray-500");
    }
  });
}

// Event listener for filter buttons
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;
    if (selectedFilter !== activeFilter) {
      activeFilter = selectedFilter;
      currentPage = 1;
      updateActiveFilter(activeFilter);
      fetchProducts(1, activeFilter);
    }
  });
});

// ... existing code in product.js

// Event listener for export button
const exportBtn = document.getElementById("export-btn");
exportBtn.addEventListener("click", async () => {
  // Create a spinner element (using a Remix Icon and Tailwind's animate-spin class)
  const spinner = document.createElement("span");
  spinner.classList.add("spinner", "ml-2");
  spinner.innerHTML = `<i class="ri-loader-2-line animate-spin"></i>`;

  // Disable the button and append the spinner
  exportBtn.disabled = true;
  exportBtn.appendChild(spinner);

  try {
    // Retrieve token (adjust as necessary)
    const token = localStorage.getItem("token");

    // Call the new export endpoint with the active filter and token authorization
    const response = await fetch(
      `https://african-store.onrender.com/api/v1/product-spread/export?filter=${activeFilter}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const result = await response.json();

    // Remove the spinner and re-enable the button
    exportBtn.removeChild(spinner);
    exportBtn.disabled = false;

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Export Successful",
        html: `Your product export has been completed successfully. Please <a href="${result.spreadsheetUrl}" target="_blank">click here</a> to view the spreadsheet.`,
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Error exporting products: " + result.message,
        confirmButtonText: "Ok",
      });
    }
  } catch (err) {
    // Remove the spinner and re-enable the button on error
    exportBtn.removeChild(spinner);
    exportBtn.disabled = false;
    console.error("Network error:", err);
    Swal.fire({
      icon: "error",
      title: "Network Error",
      text: "Network error exporting products",
      confirmButtonText: "Ok",
    });
  }
});

updateActiveFilter(activeFilter);
fetchProducts();
