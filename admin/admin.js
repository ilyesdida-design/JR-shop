"use strict";

/* =========================================================
   JR SHOP ADMIN
   SUPABASE CONNECTION
========================================================= */

const SUPABASE_URL =
  "https://cstjgsuehmqcolajspqh.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_e_wQxqCrx21Qq1kRYKjFMg_yR6TQfKX";


/* =========================================================
   SUPABASE
========================================================= */

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
  currency: "DA",

  sections: {
    dashboard: {
      title: "Dashboard",
      subtitle: "Vue générale de votre boutique"
    },

    products: {
      title: "Produits",
      subtitle: "Gérez votre catalogue produits"
    },

    orders: {
      title: "Commandes",
      subtitle: "Gérez toutes les commandes"
    },

    customers: {
      title: "Clients",
      subtitle: "Gérez vos clients"
    },

    categories: {
      title: "Catégories",
      subtitle: "Organisez votre catalogue"
    },

    promotions: {
      title: "Promotions",
      subtitle: "Gérez vos offres"
    },

    inventory: {
      title: "Stock",
      subtitle: "Suivez votre inventaire"
    },

    analytics: {
      title: "Statistiques",
      subtitle: "Analysez les performances"
    },

    settings: {
      title: "Paramètres",
      subtitle: "Configuration de votre boutique"
    }
  }
};


/* =========================================================
   STATE
========================================================= */

const STATE = {
  currentSection: "dashboard",

  products: [],
  categories: [],
  orders: [],
  customers: [],

  loading: false
};


/* =========================================================
   DOM
========================================================= */

const DOM = {

  sidebar:
    document.querySelector(".sidebar"),

  mobileMenuBtn:
    document.getElementById("mobileMenuBtn"),

  pageTitle:
    document.getElementById("pageTitle"),

  pageSubtitle:
    document.getElementById("pageSubtitle"),

  navItems:
    document.querySelectorAll(".nav-item"),

  pageSections:
    document.querySelectorAll(".page-section"),

  quickActions:
    document.querySelectorAll("[data-section]"),

  logoutBtn:
    document.getElementById("logoutBtn"),

  modalOverlay:
    document.getElementById("modalOverlay"),

  modalContent:
    document.getElementById("modalContent"),

  closeModalBtn:
    document.getElementById("closeModalBtn"),

  addProductBtn:
    document.getElementById("addProductBtn"),

  addCategoryBtn:
    document.getElementById("addCategoryBtn"),

  productSearch:
    document.getElementById("productSearch"),

  productCategoryFilter:
    document.getElementById(
      "productCategoryFilter"
    ),

  productStatusFilter:
    document.getElementById(
      "productStatusFilter"
    ),

  customerSearch:
    document.getElementById(
      "customerSearch"
    )
};


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  init
);


async function init() {

  console.log(
    "JR Shop Admin started..."
  );

  setupNavigation();
  setupMobileMenu();
  setupModal();
  setupButtons();
  setupSearch();

  await loadAllData();

  showSection("dashboard");
}


/* =========================================================
   LOAD ALL DATA
========================================================= */

async function loadAllData() {

  STATE.loading = true;

  try {

    await Promise.all([
      loadProducts(),
      loadCategories()
    ]);

    updateDashboard();

  } catch (error) {

    console.error(
      "Erreur chargement:",
      error
    );

    showNotification(
      "Erreur lors du chargement des données Supabase.",
      "error"
    );

  } finally {

    STATE.loading = false;

  }
}


/* =========================================================
   PRODUCTS — SUPABASE
========================================================= */

async function loadProducts() {

  console.log(
    "Chargement des produits..."
  );

  const {
    data,
    error
  } = await supabaseClient
    .from("products")
.select(`
  id,
  name,
  price,
  old_price,
  stock,
  category_id,
  image_url,
  active
`)
     .order(
      "name",
      {
        ascending: true
      }
    );


  if (error) {

    console.error(
      "Products error:",
      error
    );

    throw error;
  }


  STATE.products =
    data || [];


  console.log(
    "Produits chargés:",
    STATE.products.length
  );


  renderProducts();
  updateProductCategoryFilter();
  updateDashboard();
}


/* =========================================================
   CATEGORIES — SUPABASE
========================================================= */

async function loadCategories() {

  console.log(
    "Chargement des catégories..."
  );

  const {
    data,
    error
  } = await supabaseClient
    .from("categories")
    .select(`
      id,
      name,
      slug,
      image_url
    `)
    .order(
      "name",
      {
        ascending: true
      }
    );


  if (error) {

    console.error(
      "Categories error:",
      error
    );

    throw error;
  }


  STATE.categories =
    data || [];


  console.log(
    "Catégories chargées:",
    STATE.categories.length
  );


  renderCategories();
  updateProductCategoryFilter();
}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts(
  products = STATE.products
) {

  const tbody =
    document.getElementById(
      "productsTableBody"
    );


  if (!tbody) {
    return;
  }


  if (!products.length) {

    tbody.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="empty-row"
        >
          Aucun produit trouvé.
        </td>
      </tr>
    `;

    return;
  }


  tbody.innerHTML =
    products
      .map(
        product => {

          const category =
            STATE.categories.find(
              category =>
                String(category.id) ===
                String(product.category_id)
            );


          const isActive =
            product.is_active !== false &&
            product.active !== false;


          const stock =
            Number(product.stock || 0);


          let stockClass =
            "status-success";

          let stockText =
            `${stock}`;


          if (stock === 0) {

            stockClass =
              "status-danger";

          } else if (stock <= 5) {

            stockClass =
              "status-warning";

          }


          return `
            <tr>

              <td>

                <div
                  style="
                    display:flex;
                    align-items:center;
                    gap:10px;
                  "
                >

                  ${
                    product.image_url
                      ? `
                        <img
                          src="${escapeHTML(
                            product.image_url
                          )}"
                          alt="${escapeHTML(
                            product.name
                          )}"
                          style="
                            width:48px;
                            height:48px;
                            object-fit:cover;
                            border-radius:9px;
                            background:#f1f1f1;
                          "
                        >
                      `
                      : `
                        <div
                          style="
                            width:48px;
                            height:48px;
                            border-radius:9px;
                            background:#f1f1f1;
                            display:grid;
                            place-items:center;
                            font-weight:800;
                          "
                        >
                          JR
                        </div>
                      `
                  }

                  <div>

                    <strong>
                      ${escapeHTML(
                        product.name ||
                        "Produit"
                      )}
                    </strong>

                    ${
                      product.old_price
                        ? `
                          <div
                            style="
                              color:#888;
                              font-size:10px;
                              text-decoration:line-through;
                              margin-top:3px;
                            "
                          >
                            ${formatPrice(
                              product.old_price
                            )}
                          </div>
                        `
                        : ""
                    }

                  </div>

                </div>

              </td>


              <td>
                ${
                  category
                    ? escapeHTML(
                        category.name
                      )
                    : "—"
                }
              </td>


              <td>
                <strong>
                  ${formatPrice(
                    product.price
                  )}
                </strong>
              </td>


              <td>

                <span
                  class="
                    status
                    ${stockClass}
                  "
                >
                  ${stockText}
                </span>

              </td>


              <td>

                <span
                  class="
                    status
                    ${
                      isActive
                        ? "status-success"
                        : "status-neutral"
                    }
                  "
                >
                  ${
                    isActive
                      ? "Actif"
                      : "Inactif"
                  }
                </span>

              </td>


              <td>

                <button
                  class="secondary-btn"
                  onclick="editProduct('${escapeHTML(
                    product.id
                  )}')"
                >
                  Modifier
                </button>

              </td>

            </tr>
          `;
        }
      )
      .join("");
}


/* =========================================================
   PRODUCT CATEGORY FILTER
========================================================= */

function updateProductCategoryFilter() {

  const select =
    DOM.productCategoryFilter;


  if (!select) {
    return;
  }


  const currentValue =
    select.value;


  select.innerHTML = `
    <option value="">
      Toutes les catégories
    </option>
  `;


  STATE.categories.forEach(
    category => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        category.id;

      option.textContent =
        category.name;


      select.appendChild(
        option
      );

    }
  );


  select.value =
    currentValue;
}


/* =========================================================
   PRODUCT FILTER
========================================================= */

function filterProducts() {

  const search =
    (
      DOM.productSearch?.value ||
      ""
    )
      .trim()
      .toLowerCase();


  const category =
    DOM.productCategoryFilter
      ?.value || "";


  const status =
    DOM.productStatusFilter
      ?.value || "";


  const filtered =
    STATE.products.filter(
      product => {

        const name =
          String(
            product.name || ""
          ).toLowerCase();


        const matchesSearch =
          !search ||
          name.includes(search);


        const matchesCategory =
          !category ||
          String(
            product.category_id
          ) ===
          String(category);


        const isActive =
          product.is_active !== false &&
          product.active !== false;


        const matchesStatus =
          !status ||
          (
            status === "active" &&
            isActive
          ) ||
          (
            status === "inactive" &&
            !isActive
          );


        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus
        );

      }
    );


  renderProducts(
    filtered
  );
}


/* =========================================================
   RENDER CATEGORIES
========================================================= */

function renderCategories() {

  const container =
    document.getElementById(
      "categoriesGrid"
    );


  if (!container) {
    return;
  }


  if (!STATE.categories.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          ▦
        </div>

        <strong>
          Aucune catégorie
        </strong>

        <p>
          Aucune catégorie trouvée.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML =
    STATE.categories
      .map(
        category => {

          return `
            <div
              class="category-card"
            >

              <div
                class="category-image"
              >

                ${
                  category.image_url
                    ? `
                      <img
                        src="${escapeHTML(
                          category.image_url
                        )}"
                        alt="${escapeHTML(
                          category.name
                        )}"
                        style="
                          width:100%;
                          height:100%;
                          object-fit:cover;
                        "
                      >
                    `
                    : `
                      <strong>
                        JR
                      </strong>
                    `
                }

              </div>


              <div
                class="category-content"
              >

                <h3>
                  ${escapeHTML(
                    category.name
                  )}
                </h3>

                <p>
                  ${escapeHTML(
                    category.slug || ""
                  )}
                </p>

              </div>

            </div>
          `;
        }
      )
      .join("");
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

  const products =
    STATE.products;


  const activeProducts =
    products.filter(
      product =>
        product.is_active !== false &&
        product.active !== false
    );


  const revenueElement =
    document.getElementById(
      "statRevenue"
    );


  const ordersElement =
    document.getElementById(
      "statOrders"
    );


  const productsElement =
    document.getElementById(
      "statProducts"
    );


  const customersElement =
    document.getElementById(
      "statCustomers"
    );


  if (revenueElement) {

    revenueElement.textContent =
      formatPrice(0);

  }


  if (ordersElement) {

    ordersElement.textContent =
      STATE.orders.length;

  }


  if (productsElement) {

    productsElement.textContent =
      activeProducts.length;

  }


  if (customersElement) {

    customersElement.textContent =
      STATE.customers.length;

  }


  renderLowStock();
}


/* =========================================================
   LOW STOCK
========================================================= */

function renderLowStock() {

  const container =
    document.getElementById(
      "lowStockContainer"
    );


  if (!container) {
    return;
  }


  const lowStock =
    STATE.products.filter(
      product =>
        Number(
          product.stock || 0
        ) <= 5
    );


  if (!lowStock.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          ✓
        </div>

        <strong>
          Stock correct
        </strong>

        <p>
          Aucun produit en stock faible.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML =
    lowStock
      .slice(0, 8)
      .map(
        product => {

          const stock =
            Number(
              product.stock || 0
            );


          return `
            <div
              class="low-stock-item"
            >

              <strong>
                ${escapeHTML(
                  product.name
                )}
              </strong>

              <span
                class="
                  status
                  ${
                    stock === 0
                      ? "status-danger"
                      : "status-warning"
                  }
                "
              >
                ${
                  stock === 0
                    ? "Rupture"
                    : `${stock} restant(s)`
                }
              </span>

            </div>
          `;
        }
      )
      .join("");
}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

  DOM.navItems.forEach(
    item => {

      item.addEventListener(
        "click",
        () => {

          showSection(
            item.dataset.section
          );

        }
      );

    }
  );


  DOM.quickActions.forEach(
    item => {

      item.addEventListener(
        "click",
        () => {

          const section =
            item.dataset.section;


          if (section) {

            showSection(
              section
            );

          }

        }
      );

    }
  );
}


/* =========================================================
   SHOW SECTION
========================================================= */

function showSection(
  section
) {

  if (
    !CONFIG.sections[
      section
    ]
  ) {
    return;
  }


  STATE.currentSection =
    section;


  DOM.navItems.forEach(
    item => {

      item.classList.toggle(
        "active",
        item.dataset.section ===
        section
      );

    }
  );


  DOM.pageSections.forEach(
    page => {

      page.classList.toggle(
        "active",
        page.id === section
      );

    }
  );


  DOM.pageTitle.textContent =
    CONFIG.sections[
      section
    ].title;


  DOM.pageSubtitle.textContent =
    CONFIG.sections[
      section
    ].subtitle;


  if (
    window.innerWidth <= 900
  ) {

    DOM.sidebar?.classList.remove(
      "open"
    );

  }


  if (section === "inventory") {

    loadInventory();

  }


  if (section === "products") {

    renderProducts();

  }


  if (section === "categories") {

    renderCategories();

  }
}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

  DOM.mobileMenuBtn?.addEventListener(
    "click",
    () => {

      DOM.sidebar?.classList.toggle(
        "open"
      );

    }
  );


  document.addEventListener(
    "click",
    event => {

      if (
        window.innerWidth > 900
      ) {
        return;
      }


      if (
        DOM.sidebar?.contains(
          event.target
        ) ||
        DOM.mobileMenuBtn?.contains(
          event.target
        )
      ) {
        return;
      }


      DOM.sidebar?.classList.remove(
        "open"
      );

    }
  );
}


/* =========================================================
   BUTTONS
========================================================= */

function setupButtons() {

  DOM.addProductBtn?.addEventListener(
    "click",
    openAddProductModal
  );


  DOM.addCategoryBtn?.addEventListener(
    "click",
    openAddCategoryModal
  );


  DOM.logoutBtn?.addEventListener(
    "click",
    handleLogout
  );
}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

  DOM.productSearch?.addEventListener(
    "input",
    filterProducts
  );


  DOM.productCategoryFilter?.addEventListener(
    "change",
    filterProducts
  );


  DOM.productStatusFilter?.addEventListener(
    "change",
    filterProducts
  );
}


/* =========================================================
   ADD PRODUCT
========================================================= */

function openAddProductModal() {

  openModal(`

    <h2>
      Ajouter un produit
    </h2>

    <p
      style="
        margin-top:7px;
        color:#747982;
        font-size:12px;
      "
    >
      Formulaire connecté à Supabase.
    </p>


    <div
      style="
        margin-top:20px;
      "
    >

      <div class="form-group">

        <label>
          Nom du produit
        </label>

        <input
          id="newProductName"
          type="text"
          placeholder="Ex: T-shirt Oversize"
        >

      </div>


      <div class="form-group">

        <label>
          Prix
        </label>

        <input
          id="newProductPrice"
          type="number"
          min="0"
          step="0.01"
          placeholder="2500"
        >

      </div>


      <div class="form-group">

        <label>
          Ancien prix
        </label>

        <input
          id="newProductOldPrice"
          type="number"
          min="0"
          step="0.01"
          placeholder="3000"
        >

      </div>


      <div class="form-group">

        <label>
          Stock
        </label>

        <input
          id="newProductStock"
          type="number"
          min="0"
          placeholder="10"
        >

      </div>


      <div class="form-group">

        <label>
          Catégorie
        </label>

        <select
          id="newProductCategory"
        >

          <option value="">
            Choisir une catégorie
          </option>

          ${
            STATE.categories
              .map(
                category => `
                  <option
                    value="${escapeHTML(
                      category.id
                    )}"
                  >
                    ${escapeHTML(
                      category.name
                    )}
                  </option>
                `
              )
              .join("")
          }

        </select>

      </div>


      <div class="form-group">

        <label>
          Image URL
        </label>

        <input
          id="newProductImage"
          type="url"
          placeholder="https://..."
        >

      </div>


      <button
        class="primary-btn"
        id="saveProductBtn"
      >
        Ajouter le produit
      </button>

    </div>
  `);


  document
    .getElementById(
      "saveProductBtn"
    )
    ?.addEventListener(
      "click",
      saveProduct
    );
}


/* =========================================================
   SAVE PRODUCT
========================================================= */

async function saveProduct() {

  const name =
    document
      .getElementById(
        "newProductName"
      )
      ?.value
      .trim();


  const price =
    document
      .getElementById(
        "newProductPrice"
      )
      ?.value;


  const oldPrice =
    document
      .getElementById(
        "newProductOldPrice"
      )
      ?.value;


  const stock =
    document
      .getElementById(
        "newProductStock"
      )
      ?.value;


  const categoryId =
    document
      .getElementById(
        "newProductCategory"
      )
      ?.value;


  const imageUrl =
    document
      .getElementById(
        "newProductImage"
      )
      ?.value
      .trim();


  if (!name) {

    showNotification(
      "Nom du produit obligatoire.",
      "error"
    );

    return;
  }


  if (
    price === "" ||
    Number(price) < 0
  ) {

    showNotification(
      "Prix invalide.",
      "error"
    );

    return;
  }


  if (
    stock === "" ||
    Number(stock) < 0
  ) {

    showNotification(
      "Stock invalide.",
      "error"
    );

    return;
  }


  const productData = {

    name,

    price:
      Number(price),

    old_price:
      oldPrice === ""
        ? null
        : Number(oldPrice),

    stock:
      Number(stock),

    category_id:
      categoryId || null,

    image_url:
      imageUrl || null,

    is_active:
      true,

    active:
      true
  };


  const {
    data,
    error
  } =
    await supabaseClient
      .from("products")
      .insert(
        productData
      )
      .select()
      .single();


  if (error) {

    console.error(
      "Insert product error:",
      error
    );

    showNotification(
      error.message ||
      "Impossible d'ajouter le produit.",
      "error"
    );

    return;
  }


  STATE.products.push(
    data
  );


  renderProducts();
  updateDashboard();
  renderLowStock();


  closeModal();


  showNotification(
    "Produit ajouté avec succès.",
    "success"
  );
}


/* =========================================================
   ADD CATEGORY
========================================================= */

function openAddCategoryModal() {

  openModal(`

    <h2>
      Ajouter une catégorie
    </h2>

    <div
      style="
        margin-top:20px;
      "
    >

      <div class="form-group">

        <label>
          Nom
        </label>

        <input
          id="newCategoryName"
          type="text"
          placeholder="Ex: Homme"
        >

      </div>


      <div class="form-group">

        <label>
          Slug
        </label>

        <input
          id="newCategorySlug"
          type="text"
          placeholder="homme"
        >

      </div>


      <div class="form-group">

        <label>
          Image URL
        </label>

        <input
          id="newCategoryImage"
          type="url"
          placeholder="https://..."
        >

      </div>


      <button
        class="primary-btn"
        id="saveCategoryBtn"
      >
        Ajouter
      </button>

    </div>

  `);


  document
    .getElementById(
      "saveCategoryBtn"
    )
    ?.addEventListener(
      "click",
      saveCategory
    );
}


/* =========================================================
   SAVE CATEGORY
========================================================= */

async function saveCategory() {

  const name =
    document
      .getElementById(
        "newCategoryName"
      )
      ?.value
      .trim();


  let slug =
    document
      .getElementById(
        "newCategorySlug"
      )
      ?.value
      .trim();


  const imageUrl =
    document
      .getElementById(
        "newCategoryImage"
      )
      ?.value
      .trim();


  if (!name) {

    showNotification(
      "Nom obligatoire.",
      "error"
    );

    return;
  }


  if (!slug) {

    slug =
      createSlug(name);

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("categories")
      .insert({

        name,

        slug,

        image_url:
          imageUrl || null

      })
      .select()
      .single();


  if (error) {

    console.error(
      "Insert category error:",
      error
    );

    showNotification(
      error.message ||
      "Impossible d'ajouter la catégorie.",
      "error"
    );

    return;
  }


  STATE.categories.push(
    data
  );


  renderCategories();
  updateProductCategoryFilter();


  closeModal();


  showNotification(
    "Catégorie ajoutée.",
    "success"
  );
}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(
  productId
) {

  const product =
    STATE.products.find(
      item =>
        String(item.id) ===
        String(productId)
    );


  if (!product) {

    showNotification(
      "Produit introuvable.",
      "error"
    );

    return;
  }


  openModal(`

    <h2>
      Produit
    </h2>

    <p
      style="
        margin-top:8px;
        color:#747982;
        font-size:12px;
      "
    >
      ${escapeHTML(
        product.name
      )}
    </p>

    <div
      style="
        margin-top:20px;
      "
    >

      <div
        class="form-group"
      >

        <label>
          Nom
        </label>

        <input
          id="editProductName"
          value="${escapeHTML(
            product.name || ""
          )}"
        >

      </div>


      <div
        class="form-group"
      >

        <label>
          Prix
        </label>

        <input
          id="editProductPrice"
          type="number"
          min="0"
          value="${Number(
            product.price || 0
          )}"
        >

      </div>


      <div
        class="form-group"
      >

        <label>
          Stock
        </label>

        <input
          id="editProductStock"
          type="number"
          min="0"
          value="${Number(
            product.stock || 0
          )}"
        >

      </div>


      <button
        class="primary-btn"
        id="updateProductBtn"
      >
        Enregistrer
      </button>

    </div>

  `);


  document
    .getElementById(
      "updateProductBtn"
    )
    ?.addEventListener(
      "click",
      () =>
        updateProduct(
          product.id
        )
    );
}


/* =========================================================
   UPDATE PRODUCT
========================================================= */

async function updateProduct(
  productId
) {

  const name =
    document
      .getElementById(
        "editProductName"
      )
      ?.value
      .trim();


  const price =
    Number(
      document
        .getElementById(
          "editProductPrice"
        )
        ?.value
    );


  const stock =
    Number(
      document
        .getElementById(
          "editProductStock"
        )
        ?.value
    );


  if (!name) {

    showNotification(
      "Nom obligatoire.",
      "error"
    );

    return;
  }


  if (
    !Number.isFinite(price) ||
    price < 0
  ) {

    showNotification(
      "Prix invalide.",
      "error"
    );

    return;
  }


  if (
    !Number.isFinite(stock) ||
    stock < 0
  ) {

    showNotification(
      "Stock invalide.",
      "error"
    );

    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("products")
      .update({

        name,

        price,

        stock

      })
      .eq(
        "id",
        productId
      )
      .select()
      .single();


  if (error) {

    console.error(
      "Update product error:",
      error
    );

    showNotification(
      error.message,
      "error"
    );

    return;
  }


  const index =
    STATE.products.findIndex(
      product =>
        String(product.id) ===
        String(productId)
    );


  if (index !== -1) {

    STATE.products[index] =
      {
        ...STATE.products[index],
        ...data
      };

  }


  renderProducts();
  updateDashboard();
  renderLowStock();


  closeModal();


  showNotification(
    "Produit modifié avec succès.",
    "success"
  );
}


/* =========================================================
   INVENTORY
========================================================= */

function loadInventory() {

  const tbody =
    document.getElementById(
      "inventoryTableBody"
    );


  if (!tbody) {
    return;
  }


  if (!STATE.products.length) {

    tbody.innerHTML = `
      <tr>
        <td
          colspan="4"
          class="empty-row"
        >
          Aucun produit.
        </td>
      </tr>
    `;

    return;
  }


  tbody.innerHTML =
    STATE.products
      .map(
        product => {

          const stock =
            Number(
              product.stock || 0
            );


          let state =
            "Correct";

          let statusClass =
            "status-success";


          if (
            stock === 0
          ) {

            state =
              "Rupture";

            statusClass =
              "status-danger";

          } else if (
            stock <= 5
          ) {

            state =
              "Stock faible";

            statusClass =
              "status-warning";

          }


          return `
            <tr>

              <td>
                <strong>
                  ${escapeHTML(
                    product.name
                  )}
                </strong>
              </td>

              <td>
                ${stock}
              </td>

              <td>
                <span
                  class="
                    status
                    ${statusClass}
                  "
                >
                  ${state}
                </span>
              </td>

              <td>

                <button
                  class="secondary-btn"
                  onclick="editProduct('${escapeHTML(
                    product.id
                  )}')"
                >
                  Modifier
                </button>

              </td>

            </tr>
          `;
        }
      )
      .join("");
}


/* =========================================================
   ORDERS
========================================================= */

function loadOrders() {

  renderOrders();

}


function renderOrders() {

  const tbody =
    document.getElementById(
      "ordersTableBody"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = `
    <tr>
      <td
        colspan="6"
        class="empty-row"
      >
        Les commandes seront connectées
        dans l'étape Commandes.
      </td>
    </tr>
  `;
}


/* =========================================================
   CUSTOMERS
========================================================= */

function loadCustomers() {

  const tbody =
    document.getElementById(
      "customersTableBody"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = `
    <tr>
      <td
        colspan="6"
        class="empty-row"
      >
        Les clients seront connectés
        dans l'étape Clients.
      </td>
    </tr>
  `;
}


/* =========================================================
   MODAL
========================================================= */

function setupModal() {

  DOM.closeModalBtn?.addEventListener(
    "click",
    closeModal
  );


  DOM.modalOverlay?.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        DOM.modalOverlay
      ) {

        closeModal();

      }

    }
  );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closeModal();

      }

    }
  );
}


function openModal(
  content
) {

  if (!DOM.modalOverlay) {
    return;
  }


  DOM.modalContent.innerHTML =
    content;


  DOM.modalOverlay.classList.add(
    "show"
  );
}


function closeModal() {

  DOM.modalOverlay?.classList.remove(
    "show"
  );
}


/* =========================================================
   LOGOUT
========================================================= */

async function handleLogout() {

  const confirmed =
    window.confirm(
      "Voulez-vous vraiment vous déconnecter ?"
    );


  if (!confirmed) {
    return;
  }


  const {
    error
  } =
    await supabaseClient.auth.signOut();


  if (error) {

    console.error(
      error
    );

    showNotification(
      error.message,
      "error"
    );

    return;
  }


  showNotification(
    "Déconnexion effectuée.",
    "success"
  );
}


/* =========================================================
   HELPERS
========================================================= */

function formatPrice(
  value
) {

  const number =
    Number(value) || 0;


  return (
    new Intl.NumberFormat(
      "fr-FR"
    ).format(number)
    +
    " "
    +
    CONFIG.currency
  );
}


function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


function createSlug(
  text
) {

  return String(text)
    .toLowerCase()
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      "");
}


function showNotification(
  message,
  type = "info"
) {

  document
    .querySelector(
      ".admin-notification"
    )
    ?.remove();


  const notification =
    document.createElement(
      "div"
    );


  notification.className =
    "admin-notification";


  notification.textContent =
    message;


  notification.style.cssText = `
    position:fixed;
    right:20px;
    bottom:20px;
    z-index:5000;
    max-width:380px;
    padding:14px 17px;
    border-radius:12px;
    background:${
      type === "error"
        ? "#c73535"
        : "#111"
    };
    color:#fff;
    font-size:12px;
    font-weight:600;
    box-shadow:
      0 15px 40px
      rgba(0,0,0,.18);
  `;


  document.body.appendChild(
    notification
  );


  setTimeout(
    () => {
      notification.remove();
    },
    3500
  );
}


/* =========================================================
   GLOBAL
========================================================= */

window.showSection =
  showSection;

window.closeModal =
  closeModal;

window.editProduct =
  editProduct;

window.JR_ADMIN = {
  STATE,
  supabaseClient,
  loadProducts,
  loadCategories,
  showSection
};
