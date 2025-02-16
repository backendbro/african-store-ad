// Select product list container
const productLists = document.getElementById("productList");
let allProducts = []; // Store fetched products

// Fetch products and initialize search
(async function fetchProductList() {
  try {
    const response = await fetch(
      "https://african-store.onrender.com/api/v1/product/normal",
      {
        method: "GET",
      }
    );

    if (response.ok) {
      const data = await response.json();
      allProducts = data.data;
      console.log("Fetched Products:", allProducts);
      renderProducts(allProducts); // Initial render
      initSearch(); // Initialize search after data is loaded
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
})();

// **Debounce function to limit frequent execution**
function debounce(func, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

// **Initialize live search functionality**
function initSearch() {
  const searchInput = document.querySelector("#searchProduct");

  if (!searchInput) {
    console.error("Search input not found!");
    return;
  }

  searchInput.addEventListener(
    "input",
    debounce((e) => {
      const searchTerm = e.target.value.trim().toLowerCase();
      console.log("Searching for:", searchTerm);
      const filtered = filterProducts(searchTerm);
      renderProducts(filtered);
    }, 300) // 300ms debounce time
  );
}

// **Filter function for search**
function filterProducts(searchTerm) {
  if (!searchTerm) return allProducts;
  console.log(allProducts);
  return allProducts.filter((product) => {
    const searchFields = [
      product.name?.toLowerCase(),
      product._id?.toLowerCase(),
      product.category?.name?.toLowerCase(),
      product.StockQuantity?.toString(),
      product.BasePrice?.toFixed(2),
    ].filter(Boolean); // Remove `null` or `undefined` values

    return searchFields.some((field) => field.includes(searchTerm));
  });
}

// **Render products dynamically**
function renderProducts(products) {
  console.log(`From render products: ${products}`);
  productLists.innerHTML = ""; // Clear current list

  if (products.length === 0) {
    productLists.innerHTML = `<tr><td colspan="6" class="text-center py-4">No products found</td></tr>`;
    return;
  }

  products.forEach((product) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", product._id);
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">
          <input type="checkbox" class="rounded text-blue-600">
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center gap-3">
              <img src=${product?.file[0]} alt="${product.name}"
                  class="w-10 h-10 rounded-lg object-cover">
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
          ₤${product.BasePrice.toFixed(2)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
              ${
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

    // Add event listeners for edit and delete buttons
    addRowEventListeners(tr, product._id);
    productLists.appendChild(tr);
  });
}

// **Handle edit and delete button events**
function addRowEventListeners(tr, productId) {
  tr.querySelector(".edit-btn").addEventListener("click", () => {
    window.location.href = `add-product.html?id=${productId}`;
  });

  tr.querySelector(".delete-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    const productId = tr.dataset.id;

    // SweetAlert Confirmation Dialog
    const confirmResult = await Swal.fire({
      title: "Delete Product?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmResult.isConfirmed) {
      try {
        Swal.fire({
          title: "Deleting...",
          html: "Please wait while we remove the product",
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const deleteResponse = await fetch(
          `https://african-store.onrender.com/api/v1/product/${productId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        Swal.close();

        if (deleteResponse.ok) {
          tr.remove();
          Swal.fire({
            title: "Deleted!",
            text: "Product has been deleted.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          const errorData = await deleteResponse.json();
          Swal.fire({
            title: "Error!",
            text: errorData.message || "Failed to delete product",
            icon: "error",
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Network error occurred. Please try again.",
          icon: "error",
          showConfirmButton: false,
          timer: 2000,
        });
        console.error("Delete error:", error);
      }
    }
  });
}
