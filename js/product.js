let formData = new FormData();
let uploadContainer = [];

const tokenize = localStorage.getItem("token");
const productName = document.getElementById("productName");
const productDescription = document.getElementById("productDescription");
const basePrice = document.getElementById("basePrice");
const StockQuantity = document.getElementById("StockQuantity");
const discount = document.getElementById("discount");
const discountType = document.getElementById("discount-type");
const selectedRadio = document.querySelector('input[name="packaging"]:checked');
const quantity = document.querySelector("#quantityKg");

document
  .getElementById("productImage")
  .addEventListener("change", async function (event) {
    const files = event.target.files;
    if (files.length === 0) return alert("No files selected");

    const previewContainer = document.getElementById("imagePreviewContainer");

    for (const file of files) {
      formData.append("images[]", file);
      console.log(files);

      // Show local preview before upload
      const reader = new FileReader();
      reader.onload = function (e) {
        const previewDiv = document.createElement("div");
        previewDiv.classList.add(
          "relative",
          "w-40",
          "h-40",
          "lg:w-56",
          "lg:h-56",
          "rounded-lg",
          "overflow-hidden",
          "bg-gray-100"
        );

        previewDiv.innerHTML = `
                <img src="${e.target.result}" alt="Preview" class="w-full h-full object-cover">
                <button class="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-200">
                    <i class="ri-close-line text-lg"></i>
                </button>
            `;

        previewContainer.appendChild(previewDiv);

        // Handle remove button
        previewDiv
          .querySelector("button")
          .addEventListener("click", function () {
            previewDiv.remove();
          });
      };
      reader.readAsDataURL(file);
    }
  });

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");
console.log(productId);

document.getElementById("submitButton").addEventListener("click", async (e) => {
  e.preventDefault();

  const button = document.getElementById("submitButton");
  const spinner = document.createElement("span");
  spinner.classList.add("spinner");
  button.appendChild(spinner);

  // Default discount fields if not provided
  if (!discountType.value.trim()) {
    console.log(discountType.value);
    discountType.value = "no-discount";
  }

  if (!discount.value.trim()) {
    discount.value = "0";
  }

  // Get all selected category spans
  const spans = document.querySelectorAll("#selectedCategories span[data-id]");
  let spanData = [];
  spans.forEach((span) => {
    spanData.push({
      text: span.textContent,
      dataId: span.getAttribute("data-id"),
    });
  });

  // Validate required fields (discount fields removed)
  if (
    !productName.value.trim() ||
    !basePrice.value.trim() ||
    !StockQuantity.value.trim() ||
    !quantity.value.trim()
  ) {
    Swal.fire("Error", "Please fill out all required fields.", "error");
    spinner.remove();
    return;
  }

  // Validate discount: if discount type is not "no discount", then discount must be > 0.
  if (
    discountType.value.toLowerCase() !== "no-discount" &&
    parseFloat(discount.value) <= 0
  ) {
    console.log(discountType.value);
    Swal.fire(
      "Error",
      "Please enter a valid discount value for the selected discount type.",
      "error"
    );
    spinner.remove();
    return;
  }

  // Append text fields to the existing global FormData

  formData.append("name", productName.value);
  formData.append("description", productDescription.value.trim() || "N/A");
  formData.append("BasePrice", basePrice.value);
  formData.append("StockQuantity", StockQuantity.value);
  formData.append("Discount", discount.value);
  formData.append("DiscountType", discountType.value);
  formData.append("categoryId", spanData[0].dataId);
  formData.append("Variants", quantity.value);

  const selectedRadio = document.querySelector(
    'input[name="packaging"]:checked'
  );
  if (selectedRadio) {
    formData.append("PackagingType", selectedRadio.value);
  }

  console.log("FormData ready to be sent.");

  // Determine endpoint URL (update or create)
  const url = productId
    ? `https://african-store.onrender.com/api/v1/product/${productId}`
    : `https://african-store.onrender.com/api/v1/product/create/${spanData[0].dataId}`;

  try {
    const response = await fetch(url, {
      method: productId ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        title: "Success!",
        text: `Product ${productId ? "updated" : "created"} successfully`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        Swal.close();
        window.location.reload();
      });
    } else {
      const error = await response.json();
      Swal.fire({
        title: "Error!",
        text: error.message || "Operation failed",
        icon: "error",
      });
    }
  } catch (error) {
    console.log(error);
    Swal.fire({
      title: "Error!",
      text: "Network error occurred",
      icon: "error",
    });
  } finally {
    spinner.remove();
  }
});

// Check if we're in edit mode
if (productId) {
  document.querySelector("h1").textContent = "Edit Product";
  document.querySelector("#submitButton").textContent = "Update Product";

  // Fetch product data
  async function fetchProductData() {
    try {
      const response = await fetch(
        `https://african-store.onrender.com/api/v1/product/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${tokenize}`,
          },
        }
      );

      if (response.ok) {
        const product = await response.json();
        populateForm(product.data);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to load product data",
        icon: "error",
      });
    }
  }

  // Populate form fields
  function populateForm(product) {
    document.getElementById("productName").value = product.name;
    document.getElementById("productDescription").value = product.description;
    document.getElementById("basePrice").value = product.BasePrice;
    document.getElementById("StockQuantity").value = product.StockQuantity;
    document.getElementById("discount").value = product.discount || 0;
    document.getElementById("discount-type").value =
      product.discountType || "no-discount";

    document.querySelector("#quantityKg").value = product.Variants;
    console.log(product);
    if (product.PackagingType) {
      console.log("Product PackagingType:", product.PackagingType);

      const radioInput = document.querySelector(
        `input[name="packaging"][value="${product.PackagingType}"]`
      );

      if (radioInput) {
        radioInput.checked = true;
      } else {
        console.warn(
          `No matching radio input found for value: ${product.PackagingType}`
        );
      }
    }

    if (product.category) {
      selectedCategoriesDiv.innerHTML = "";
      console.log(product.category);
      const categoryTag = document.createElement("span");
      categoryTag.className =
        "inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm";
      categoryTag.textContent = product.category.name;
      categoryTag.setAttribute("data-id", product.category._id);

      const removeBtn = document.createElement("button");
      removeBtn.innerHTML = "×";
      removeBtn.className = "hover:text-purple-950";
      removeBtn.addEventListener("click", () => {
        toggleCategorySelection(product.category);
        categoryTag.remove(); // Remove from UI
      });

      categoryTag.appendChild(removeBtn);
      selectedCategoriesDiv.appendChild(categoryTag);
    }

    // Handle images
    if (product.file && product.file.length > 0) {
      const imageContainer = document.getElementById("imagePreviewContainer");

      if (!imageContainer) {
        console.error("Image container not found!");
        return;
      }

      // Clear existing previews before adding new ones
      imageContainer.innerHTML = "";

      product.file.forEach((imageUrl, index) => {
        console.log("Image URL:", imageUrl); // Debugging

        if (!imageUrl) return; // Skip empty values

        const previewDiv = document.createElement("div");
        previewDiv.classList.add(
          "relative",
          "w-40",
          "h-40",
          "lg:w-56",
          "lg:h-56",
          "rounded-lg",
          "overflow-hidden",
          "bg-gray-100"
        );

        previewDiv.innerHTML = `
          <img src="${imageUrl}" alt="Uploaded Image" class="w-full h-full object-cover">
          <button class="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-200">
            <i class="ri-close-line text-lg"></i>
          </button>
        `;

        // Append to container
        imageContainer.appendChild(previewDiv);

        // Handle remove button
        previewDiv
          .querySelector("button")
          .addEventListener("click", function () {
            previewDiv.remove();

            // Optionally: Remove the image from `product.file` array
            product.file.splice(index, 1);
            console.log("Updated file list:", product.file);
          });
      });
    }
  }

  fetchProductData();
}

function toggleCategorySelection(category) {
  console.log(category);
  const index = selectedCategories.findIndex(
    (selectedCategory) => selectedCategory.id === category.id
  );
  if (index !== -1) {
    selectedCategories.splice(index, 1);
  } else {
    selectedCategories.push(category);
  }
  renderSelectedCategories();
}

// Helper function to get selected variants
function getSelectedVariants() {
  return Array.from(
    document.querySelectorAll('input[type="checkbox"]:checked')
  ).map((checkbox) => checkbox.nextElementSibling.textContent.trim());
}
