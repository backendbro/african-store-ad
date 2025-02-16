const catBtn = document.querySelector("#create-category-btn");
const catInput = document.querySelector("#newCategoryInput");
const token = localStorage.getItem("token");

// (async function getCategories() {
//   try {
//     const response = await fetch(
//       "https://african-store.onrender.com/api/v1/category/",
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`Failed: ${errorData.message}`);
//     }

//     const resjson = await response.json();
//     categories = resjson.data;

//     console.log(categories);
//     localStorage.setItem("categories", )
//   } catch (error) {
//     console.log(error);
//   }
// })();

catBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const spinner = document.createElement("span");
  spinner.classList.add("spinner");
  catBtn.appendChild(spinner);

  try {
    const response = await fetch(
      "https://african-store.onrender.com/api/v1/category/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: catInput.value,
          description: `This is the ${catInput.value} category`,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json(); // Get error details
      throw new Error(`Failed: ${errorData.message}`);
    }

    Swal.fire({
      title: "Category",
      text: "Category created",
      icon: "success",
      showConfirmButton: false,
      timer: 2000, // Auto close in 2 seconds
    });

    catInput.value = " ";
    spinner.remove();

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error("Error:", error.message);
    Swal.fire({
      title: "Category",
      text: error.message,
      icon: "success",
      showConfirmButton: false,
      timer: 2000, // Auto close in 2 seconds
    });

    catInput.value = " ";
    spinner.remove();

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
});

const categories = [
  { id: "1", name: "Microphone" },
  { id: "2", name: "Microphone Pro" },
  { id: "3", name: "Audio Equipment" },
];
const selectedCategories = [];

const categoryDropdown = document.getElementById("categoryDropdown");
const toggleDropdownBtn = document.getElementById("toggleDropdownBtn");
const searchInput = document.getElementById("searchInput");
const categoryList = document.getElementById("categoryList");
const selectedCategoriesDiv = document.getElementById("selectedCategories");
const openCreateModalBtn = document.getElementById("openCreateModalBtn");
const createCategoryModal = document.getElementById("createCategoryModal");
const createCategoryForm = document.getElementById("createCategoryForm");
const newCategoryInput = document.getElementById("newCategoryInput");
const cancelCreateCategoryBtn = document.getElementById(
  "cancelCreateCategoryBtn"
);

// Toggle dropdown visibility
toggleDropdownBtn.addEventListener("click", () => {
  categoryDropdown.classList.toggle("hidden");
  document.getElementById("dropdownIcon").textContent =
    categoryDropdown.classList.contains("hidden") ? "▼" : "▲";
});

// // Filter categories based on search input
// searchInput.addEventListener("input", () => {
//   const searchTerm = searchInput.value.toLowerCase();
//   const filteredCategories = categories.filter((category) =>
//     category.name.toLowerCase().includes(searchTerm)
//   );
//   renderCategoryList(filteredCategories);
// });

// Render category list
async function renderCategoryList(filteredCategories) {
  categoryList.innerHTML = "";

  const response = await fetch(
    "https://african-store.onrender.com/api/v1/category/",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed: ${errorData.message}`);
  }

  const resjson = await response.json();
  const categories = resjson.data;

  console.log(categories);

  categories.forEach((category) => {
    const categoryBtn = document.createElement("button");
    categoryBtn.setAttribute("data-id", category.id);
    categoryBtn.className =
      "w-full px-4 py-2 text-left hover:bg-purple-50 flex items-center justify-between";
    categoryBtn.textContent = category.name;

    categoryBtn.addEventListener("click", () =>
      toggleCategorySelection(category)
    );
    categoryList.appendChild(categoryBtn);
  });
}

// Toggle category selection
function toggleCategorySelection(category) {
  const index = selectedCategories.findIndex(
    (selectedCategory) => selectedCategory.id === category.id
  );
  if (index !== -1) {
    selectedCategories.splice(index, 1); // Deselect
  } else {
    selectedCategories.push(category); // Select
  }
  renderSelectedCategories();
}

// Render selected categories
function renderSelectedCategories() {
  selectedCategoriesDiv.innerHTML = "";
  selectedCategories.forEach((category) => {
    console.log(category);
    const categoryTag = document.createElement("span");
    categoryTag.className =
      "inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm";
    categoryTag.textContent = category.name;
    categoryTag.setAttribute("data-id", category._id);
    const removeBtn = document.createElement("button");
    removeBtn.innerHTML = "×";
    removeBtn.className = "hover:text-purple-950";
    removeBtn.addEventListener("click", () =>
      toggleCategorySelection(category)
    );
    categoryTag.appendChild(removeBtn);
    selectedCategoriesDiv.appendChild(categoryTag);
  });
}

// Open modal for creating new category
openCreateModalBtn.addEventListener("click", () => {
  createCategoryModal.classList.remove("hidden");
});

// Cancel creating new category
cancelCreateCategoryBtn.addEventListener("click", () => {
  createCategoryModal.classList.add("hidden");
});

// Initial render of categories
renderCategoryList(categories);

function toggleDropdown() {
  console.log("Reacched");
  const dropdown = document.getElementById("productsDropdown");
  const arrow = document.getElementById("dropdownArrow");
  dropdown.classList.toggle("hidden");
  arrow.classList.toggle("rotate-180");
}

function toggleDropdown2() {
  console.log("Reacched");
  const dropdown = document.getElementById("productsDropdown2");
  const arrow = document.getElementById("dropdownArrow2");
  dropdown.classList.toggle("hidden");
  arrow.classList.toggle("rotate-180");
}
