"use strict";

/* =========================================================
   JR SHOP ADMIN PRO
   PART 1 / 3
   CONFIG + STATE + DOM + INIT + NAVIGATION
   + PRODUCTS/CATEGORIES LOADING
========================================================= */

/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://cstjgsuehmqcolajspqh.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_e_wQxqCrx21Qq1kRYKjFMg_yR6TQfKX";

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

  imageBucket: "product-images",

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
   VARIANT OPTIONS
========================================================= */

const VARIANT_OPTIONS = {

  colors: [
    "Noir",
    "Blanc",
    "Rouge",
    "Bleu",
    "Vert",
    "Jaune",
    "Orange",
    "Rose",
    "Violet",
    "Beige",
    "Marron",
    "Gris"
  ],

  clothingSizes: [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "XXXL"
  ],

  shoeSizes: [
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45"
  ]

};


/* =========================================================
   STATE
========================================================= */

const STATE = {

  currentSection: "dashboard",

  loading: false,

  products: [],

  categories: [],

  orders: [],

  customers: [],

  variants: []

};


/* =========================================================
   DOM
========================================================= */

const DOM = {

  sidebar:
    document.querySelector(".sidebar"),

  mobileMenuBtn:
    document.getElementById(
      "mobileMenuBtn"
    ),

  pageTitle:
    document.getElementById(
      "pageTitle"
    ),

  pageSubtitle:
    document.getElementById(
      "pageSubtitle"
    ),

  navItems:
    document.querySelectorAll(
      ".nav-item"
    ),

  pageSections:
    document.querySelectorAll(
      ".page-section"
    ),

  quickActions:
    document.querySelectorAll(
      "[data-section]"
    ),

  logoutBtn:
    document.getElementById(
      "logoutBtn"
    ),

  modalOverlay:
    document.getElementById(
      "modalOverlay"
    ),

  modalContent:
    document.getElementById(
      "modalContent"
    ),

  closeModalBtn:
    document.getElementById(
      "closeModalBtn"
    ),

  addProductBtn:
    document.getElementById(
      "addProductBtn"
    ),

  addCategoryBtn:
    document.getElementById(
      "addCategoryBtn"
    ),

  productSearch:
    document.getElementById(
      "productSearch"
    ),

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
    "JR Shop Admin Pro started..."
  );

  setupNavigation();

  setupMobileMenu();

  setupModal();

  setupButtons();

  setupSearch();

  await loadAllData();

  showSection(
    "dashboard"
  );

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
      "Load all data error:",
      error
    );

    showNotification(
      "Erreur de chargement Supabase.",
      "error"
    );

  } finally {

    STATE.loading = false;

  }

}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

  const {
    data,
    error
  } =
    await supabaseClient

      .from("products")

      .select(`
        id,
        category_id,
        name,
        slug,
        description,
        price,
        old_price,
        stock,
        image_url,
        images,
        featured,
        active,
        created_at
      `)

      .order(
        "created_at",
        {
          ascending: false
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


  renderProducts();

  updateProductCategoryFilter();

  updateDashboard();

}


/* =========================================================
   LOAD CATEGORIES
========================================================= */

async function loadCategories() {

  const {
    data,
    error
  } =
    await supabaseClient

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
              cat =>
                String(cat.id) ===
                String(
                  product.category_id
                )
            );


          const active =
            product.active !== false;


          const stock =
            Number(
              product.stock || 0
            );


          let stockClass =
            "status-success";


          if (stock === 0) {

            stockClass =
              "status-danger";

          } else if (
            stock <= 5
          ) {

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
                            width:52px;
                            height:52px;
                            object-fit:cover;
                            border-radius:9px;
                            background:#f2f2f2;
                          "
                        >

                      `

                      : `

                        <div
                          style="
                            width:52px;
                            height:52px;
                            border-radius:9px;
                            background:#f2f2f2;
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
                      product.featured

                        ? `

                          <div
                            style="
                              font-size:10px;
                              margin-top:3px;
                            "
                          >
                            ★ Vedette
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


                ${
                  product.old_price

                    ? `

                      <div
                        style="
                          font-size:10px;
                          color:#888;
                          text-decoration:line-through;
                        "
                      >
                        ${formatPrice(
                          product.old_price
                        )}
                      </div>

                    `

                    : ""
                }

              </td>


              <td>

                <span
                  class="
                    status
                    ${stockClass}
                  "
                >
                  ${stock}
                </span>

              </td>


              <td>

                <span
                  class="
                    status
                    ${
                      active
                        ? "status-success"
                        : "status-neutral"
                    }
                  "
                >

                  ${
                    active
                      ? "Actif"
                      : "Inactif"
                  }

                </span>

              </td>


              <td>

                <button
                  type="button"
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
   CATEGORY FILTER
========================================================= */

function updateProductCategoryFilter() {

  const select =
    DOM.productCategoryFilter;


  if (!select) {
    return;
  }


  const oldValue =
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
    oldValue;

}


/* =========================================================
   FILTER PRODUCTS
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
      ?.value ||
    "";


  const status =
    DOM.productStatusFilter
      ?.value ||
    "";


  const filtered =
    STATE.products.filter(
      product => {

        const name =
          String(
            product.name || ""
          )
            .toLowerCase();


        const slug =
          String(
            product.slug || ""
          )
            .toLowerCase();


        const matchesSearch =
          !search ||
          name.includes(search) ||
          slug.includes(search);


        const matchesCategory =
          !category ||
          String(
            product.category_id
          ) ===
          String(category);


        const active =
          product.active !== false;


        const matchesStatus =
          !status ||

          (
            status === "active" &&
            active
          ) ||

          (
            status === "inactive" &&
            !active
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
   CATEGORIES RENDER
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

        <strong>
          Aucune catégorie
        </strong>

      </div>

    `;

    return;

  }


  container.innerHTML =
    STATE.categories
      .map(
        category => `

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

        `
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
        page.id ===
        section
      );

    }
  );


  if (DOM.pageTitle) {

    DOM.pageTitle.textContent =
      CONFIG.sections[
        section
      ].title;

  }


  if (DOM.pageSubtitle) {

    DOM.pageSubtitle.textContent =
      CONFIG.sections[
        section
      ].subtitle;

  }


  if (
    window.innerWidth <= 900
  ) {

    DOM.sidebar?.classList.remove(
      "open"
    );

  }


  if (
    section === "products"
  ) {

    renderProducts();

  }


  if (
    section === "categories"
  ) {

    renderCategories();

  }


  if (
    section === "inventory"
  ) {

    loadInventory();

  }


  if (
    section === "orders"
  ) {

    loadOrders();

  }


  if (
    section === "customers"
  ) {

    loadCustomers();

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

  if (
    !DOM.modalOverlay ||
    !DOM.modalContent
  ) {
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
    ).format(number) +
    " " +
    CONFIG.currency
  );

}


function createSlug(
  text
) {

  return String(
    text || ""
  )

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
      ""
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


/* =========================================================
   NOTIFICATION
========================================================= */

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

    z-index:9999;

    max-width:380px;

    padding:14px 18px;

    border-radius:12px;

    background:${
      type === "error"
        ? "#c73535"
        : "#111"
    };

    color:#fff;

    font-size:13px;

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
   DASHBOARD
========================================================= */

function updateDashboard() {

  const activeProducts =
    STATE.products.filter(
      product =>
        product.active !== false
    );


  const revenue =
    document.getElementById(
      "statRevenue"
    );


  const orders =
    document.getElementById(
      "statOrders"
    );


  const products =
    document.getElementById(
      "statProducts"
    );


  const customers =
    document.getElementById(
      "statCustomers"
    );


  if (revenue) {

    revenue.textContent =
      formatPrice(0);

  }


  if (orders) {

    orders.textContent =
      STATE.orders.length;

  }


  if (products) {

    products.textContent =
      activeProducts.length;

  }


  if (customers) {

    customers.textContent =
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


  const products =
    STATE.products.filter(
      product =>
        Number(
          product.stock || 0
        ) <= 5
    );


  if (!products.length) {

    container.innerHTML = `

      <div class="empty-state">

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
    products
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


          if (stock === 0) {

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
                  type="button"
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
    await supabaseClient
      .auth
      .signOut();


  if (error) {

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
   GLOBAL
   PART 1
========================================================= */

window.showSection =
  showSection;

window.closeModal =
  closeModal;

window.JR_ADMIN = {

  STATE,

  supabaseClient,

  loadProducts,

  loadCategories,

  showSection

};

/* =========================================================
   JR SHOP ADMIN PRO
   PART 2 / 3
   PRODUCTS + IMAGES + CATEGORIES
========================================================= */


/* =========================================================
   ADD PRODUCT MODAL
========================================================= */

function openAddProductModal() {

  openModal(`

    <h2>
      Ajouter un produit
    </h2>

    <p
      style="
        color:#777;
        font-size:12px;
        margin-top:6px;
      "
    >
      Ajoutez votre produit et ses images.
    </p>


    <div
      style="
        margin-top:20px;
      "
    >

      <div class="form-group">

        <label>
          Nom du produit *
        </label>

        <input
          id="newProductName"
          type="text"
          placeholder="Ex: T-shirt Oversize"
        >

      </div>


      <div class="form-group">

        <label>
          Slug
        </label>

        <input
          id="newProductSlug"
          type="text"
          placeholder="t-shirt-oversize"
        >

      </div>


      <div class="form-group">

        <label>
          Description
        </label>

        <textarea
          id="newProductDescription"
          rows="4"
          placeholder="Description du produit..."
          style="
            width:100%;
            resize:vertical;
          "
        ></textarea>

      </div>


      <div
        style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
        "
      >

        <div class="form-group">

          <label>
            Prix *
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

      </div>


      <div
        style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
        "
      >

        <div class="form-group">

          <label>
            Stock *
          </label>

          <input
            id="newProductStock"
            type="number"
            min="0"
            step="1"
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
              Choisir
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

      </div>


      <div class="form-group">

        <label>
          Image principale *
        </label>

        <input
          id="newProductFile"
          type="file"
          accept="image/*"
        >

        <div
          id="newProductPreview"
          style="
            margin-top:10px;
          "
        ></div>

      </div>


      <div class="form-group">

        <label>
          Images supplémentaires
        </label>

        <input
          id="newProductFiles"
          type="file"
          accept="image/*"
          multiple
        >

        <div
          id="newProductGallery"
          style="
            display:flex;
            gap:8px;
            flex-wrap:wrap;
            margin-top:10px;
          "
        ></div>

      </div>


      <div
        style="
          display:flex;
          gap:20px;
          flex-wrap:wrap;
          margin:15px 0;
        "
      >

        <label
          style="
            display:flex;
            gap:8px;
            align-items:center;
          "
        >

          <input
            id="newProductFeatured"
            type="checkbox"
          >

          Produit vedette

        </label>


        <label
          style="
            display:flex;
            gap:8px;
            align-items:center;
          "
        >

          <input
            id="newProductActive"
            type="checkbox"
            checked
          >

          Produit actif

        </label>

      </div>


      <button
        id="saveProductBtn"
        class="primary-btn"
        style="width:100%"
        type="button"
      >
        Ajouter le produit
      </button>

    </div>

  `);


  const nameInput =
    document.getElementById(
      "newProductName"
    );


  const slugInput =
    document.getElementById(
      "newProductSlug"
    );


  nameInput?.addEventListener(
    "input",
    () => {

      if (
        !slugInput.dataset.edited
      ) {

        slugInput.value =
          createSlug(
            nameInput.value
          );

      }

    }
  );


  slugInput?.addEventListener(
    "input",
    () => {

      slugInput.dataset.edited =
        "true";

    }
  );


  document
    .getElementById(
      "newProductFile"
    )
    ?.addEventListener(
      "change",
      previewMainImage
    );


  document
    .getElementById(
      "newProductFiles"
    )
    ?.addEventListener(
      "change",
      previewExtraImages
    );


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
   IMAGE PREVIEW - MAIN
========================================================= */

function previewMainImage(
  event
) {

  const file =
    event.target.files?.[0];


  const preview =
    document.getElementById(
      "newProductPreview"
    );


  if (!preview) {
    return;
  }


  if (!file) {

    preview.innerHTML =
      "";

    return;

  }


  const url =
    URL.createObjectURL(
      file
    );


  preview.innerHTML = `

    <img
      src="${url}"
      alt="Preview"
      style="
        width:120px;
        height:120px;
        object-fit:cover;
        border-radius:12px;
        border:1px solid #ddd;
      "
    >

  `;

}


/* =========================================================
   IMAGE PREVIEW - EXTRA
========================================================= */

function previewExtraImages(
  event
) {

  const files =
    Array.from(
      event.target.files || []
    );


  const gallery =
    document.getElementById(
      "newProductGallery"
    );


  if (!gallery) {
    return;
  }


  gallery.innerHTML =
    files
      .map(
        file => {

          const url =
            URL.createObjectURL(
              file
            );


          return `

            <img
              src="${url}"
              alt="Image"
              style="
                width:70px;
                height:70px;
                object-fit:cover;
                border-radius:8px;
                border:1px solid #ddd;
              "
            >

          `;

        }
      )
      .join("");

}


/* =========================================================
   UPLOAD IMAGE
========================================================= */

async function uploadImage(
  file
) {

  if (!file) {
    return null;
  }


  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "jpg";


  const safeExtension =
    extension.replace(
      /[^a-z0-9]/g,
      ""
    ) ||
    "jpg";


  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;


  const filePath =
    `products/${fileName}`;


  const {
    error
  } =
    await supabaseClient
      .storage
      .from(
        CONFIG.imageBucket
      )
      .upload(
        filePath,
        file,
        {
          cacheControl:
            "3600",

          upsert:
            false,

          contentType:
            file.type
        }
      );


  if (error) {

    console.error(
      "Image upload error:",
      error
    );

    throw error;

  }


  const {
    data
  } =
    supabaseClient
      .storage
      .from(
        CONFIG.imageBucket
      )
      .getPublicUrl(
        filePath
      );


  return data?.publicUrl ||
    null;

}


/* =========================================================
   SAVE PRODUCT
========================================================= */

async function saveProduct() {

  const button =
    document.getElementById(
      "saveProductBtn"
    );


  const name =
    document
      .getElementById(
        "newProductName"
      )
      ?.value
      .trim();


  const slugValue =
    document
      .getElementById(
        "newProductSlug"
      )
      ?.value
      .trim();


  const description =
    document
      .getElementById(
        "newProductDescription"
      )
      ?.value
      .trim();


  const priceValue =
    document
      .getElementById(
        "newProductPrice"
      )
      ?.value;


  const oldPriceValue =
    document
      .getElementById(
        "newProductOldPrice"
      )
      ?.value;


  const stockValue =
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


  const mainFile =
    document
      .getElementById(
        "newProductFile"
      )
      ?.files?.[0];


  const extraFiles =
    Array.from(
      document
        .getElementById(
          "newProductFiles"
        )
        ?.files ||
      []
    );


  const featured =
    document
      .getElementById(
        "newProductFeatured"
      )
      ?.checked ||
    false;


  const active =
    document
      .getElementById(
        "newProductActive"
      )
      ?.checked !== false;


  const price =
    Number(
      priceValue
    );


  const stock =
    Number(
      stockValue
    );


  const oldPrice =
    oldPriceValue === ""
      ? null
      : Number(
          oldPriceValue
        );


  /* -------------------------
     VALIDATION
  ------------------------- */

  if (!name) {

    showNotification(
      "Nom du produit obligatoire.",
      "error"
    );

    return;

  }


  if (!mainFile) {

    showNotification(
      "Choisissez une image principale.",
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
    !Number.isInteger(stock) ||
    stock < 0
  ) {

    showNotification(
      "Stock invalide.",
      "error"
    );

    return;

  }


  if (
    oldPrice !== null &&
    (
      !Number.isFinite(
        oldPrice
      ) ||
      oldPrice < 0
    )
  ) {

    showNotification(
      "Ancien prix invalide.",
      "error"
    );

    return;

  }


  try {

    if (button) {

      button.disabled =
        true;

      button.textContent =
        "Upload des images...";

    }


    /* -------------------------
       MAIN IMAGE
    ------------------------- */

    const mainImageUrl =
      await uploadImage(
        mainFile
      );


    /* -------------------------
       EXTRA IMAGES
    ------------------------- */

    const extraImageUrls =
      [];


    for (
      const file
      of extraFiles
    ) {

      const url =
        await uploadImage(
          file
        );


      if (url) {

        extraImageUrls.push(
          url
        );

      }

    }


    /* -------------------------
       PRODUCT DATA
    ------------------------- */

    const productData = {

      category_id:
        categoryId ||
        null,

      name,

      slug:
        slugValue ||
        createSlug(
          name
        ),

      description:
        description ||
        null,

      price,

      old_price:
        oldPrice,

      stock,

      image_url:
        mainImageUrl,

      images:
        extraImageUrls,

      featured,

      active

    };


    if (button) {

      button.textContent =
        "Enregistrement...";

    }


    /* -------------------------
       INSERT
    ------------------------- */

    const {
      data,
      error
    } =
      await supabaseClient

        .from(
          "products"
        )

        .insert(
          productData
        )

        .select()
        .single();


    if (error) {
      throw error;
    }


    /* -------------------------
       UPDATE STATE
    ------------------------- */

    STATE.products.unshift(
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


  } catch (error) {

    console.error(
      "Save product error:",
      error
    );


    showNotification(
      error.message ||
      "Erreur lors de l'ajout du produit.",
      "error"
    );


  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "Ajouter le produit";

    }

  }

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


  const images =
    Array.isArray(
      product.images
    )
      ? product.images
      : [];


  openModal(`

    <h2>
      Modifier le produit
    </h2>


    <p
      style="
        color:#777;
        font-size:12px;
        margin-top:6px;
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

      <div class="form-group">

        <label>
          Nom *
        </label>

        <input
          id="editProductName"
          type="text"
          value="${escapeHTML(
            product.name ||
            ""
          )}"
        >

      </div>


      <div class="form-group">

        <label>
          Slug
        </label>

        <input
          id="editProductSlug"
          type="text"
          value="${escapeHTML(
            product.slug ||
            ""
          )}"
        >

      </div>


      <div class="form-group">

        <label>
          Description
        </label>

        <textarea
          id="editProductDescription"
          rows="4"
          style="
            width:100%;
            resize:vertical;
          "
        >${escapeHTML(
          product.description ||
          ""
        )}</textarea>

      </div>


      <div
        style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
        "
      >

        <div class="form-group">

          <label>
            Prix
          </label>

          <input
            id="editProductPrice"
            type="number"
            min="0"
            step="0.01"
            value="${Number(
              product.price ||
              0
            )}"
          >

        </div>


        <div class="form-group">

          <label>
            Ancien prix
          </label>

          <input
            id="editProductOldPrice"
            type="number"
            min="0"
            step="0.01"
            value="${
              product.old_price ??
              ""
            }"
          >

        </div>

      </div>


      <div
        style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
        "
      >

        <div class="form-group">

          <label>
            Stock
          </label>

          <input
            id="editProductStock"
            type="number"
            min="0"
            step="1"
            value="${Number(
              product.stock ||
              0
            )}"
          >

        </div>


        <div class="form-group">

          <label>
            Catégorie
          </label>

          <select
            id="editProductCategory"
          >

            <option value="">
              Sans catégorie
            </option>

            ${
              STATE.categories
                .map(
                  category => `

                    <option
                      value="${escapeHTML(
                        category.id
                      )}"
                      ${
                        String(
                          category.id
                        ) ===
                        String(
                          product.category_id
                        )
                          ? "selected"
                          : ""
                      }
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

      </div>


      <div class="form-group">

        <label>
          Image actuelle
        </label>


        ${
          product.image_url

            ? `

              <img
                src="${escapeHTML(
                  product.image_url
                )}"
                alt=""
                style="
                  width:120px;
                  height:120px;
                  object-fit:cover;
                  border-radius:12px;
                  margin-top:8px;
                "
              >

            `

            : `

              <div
                style="
                  padding:20px;
                  background:#f4f4f4;
                  border-radius:10px;
                "
              >
                Aucune image
              </div>

            `
        }

      </div>


      <div class="form-group">

        <label>
          Remplacer l'image
        </label>

        <input
          id="editProductFile"
          type="file"
          accept="image/*"
        >

        <div
          id="editProductPreview"
          style="
            margin-top:10px;
          "
        ></div>

      </div>


      <div class="form-group">

        <label>
          Images supplémentaires
        </label>


        <div
          style="
            display:flex;
            gap:8px;
            flex-wrap:wrap;
            margin-bottom:10px;
          "
        >

          ${
            images
              .map(
                url => `

                  <img
                    src="${escapeHTML(
                      url
                    )}"
                    alt=""
                    style="
                      width:65px;
                      height:65px;
                      object-fit:cover;
                      border-radius:8px;
                    "
                  >

                `
              )
              .join("")
          }

        </div>


        <input
          id="editProductFiles"
          type="file"
          accept="image/*"
          multiple
        >

      </div>


      <div
        style="
          display:flex;
          gap:20px;
          flex-wrap:wrap;
          margin:15px 0;
        "
      >

        <label
          style="
            display:flex;
            gap:8px;
            align-items:center;
          "
        >

          <input
            id="editProductFeatured"
            type="checkbox"
            ${
              product.featured
                ? "checked"
                : ""
            }
          >

          ★ Vedette

        </label>


        <label
          style="
            display:flex;
            gap:8px;
            align-items:center;
          "
        >

          <input
            id="editProductActive"
            type="checkbox"
            ${
              product.active !== false
                ? "checked"
                : ""
            }
          >

          Actif

        </label>

      </div>


      <div
        style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
        "
      >

        <button
          id="updateProductBtn"
          class="primary-btn"
          type="button"
        >
          Enregistrer
        </button>


        <button
          id="deleteProductBtn"
          class="secondary-btn"
          type="button"
          style="
            color:#c73535;
            border-color:#c73535;
          "
        >
          🗑 Supprimer
        </button>

      </div>


      <!--
        PART 3 ajoutera ici automatiquement
        le gestionnaire des variantes.
      -->

    </div>

  `);


  /* -------------------------
     NEW IMAGE PREVIEW
  ------------------------- */

  document
    .getElementById(
      "editProductFile"
    )
    ?.addEventListener(
      "change",
      event => {

        const file =
          event.target.files?.[0];


        const preview =
          document.getElementById(
            "editProductPreview"
          );


        if (
          !file ||
          !preview
        ) {
          return;
        }


        const url =
          URL.createObjectURL(
            file
          );


        preview.innerHTML = `

          <img
            src="${url}"
            alt="Preview"
            style="
              width:120px;
              height:120px;
              object-fit:cover;
              border-radius:12px;
            "
          >

        `;

      }
    );


  /* -------------------------
     UPDATE BUTTON
  ------------------------- */

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


  /* -------------------------
     DELETE BUTTON
  ------------------------- */

  document
    .getElementById(
      "deleteProductBtn"
    )
    ?.addEventListener(
      "click",
      () =>
        deleteProduct(
          product.id
        )
    );


  /*
    PART 3 will add the
    variants manager here.
  */

}


/* =========================================================
   UPDATE PRODUCT
========================================================= */

async function updateProduct(
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


  const button =
    document.getElementById(
      "updateProductBtn"
    );


  const name =
    document
      .getElementById(
        "editProductName"
      )
      ?.value
      .trim();


  const slug =
    document
      .getElementById(
        "editProductSlug"
      )
      ?.value
      .trim();


  const description =
    document
      .getElementById(
        "editProductDescription"
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


  const oldPriceValue =
    document
      .getElementById(
        "editProductOldPrice"
      )
      ?.value;


  const stock =
    Number(
      document
        .getElementById(
          "editProductStock"
        )
        ?.value
    );


  const categoryId =
    document
      .getElementById(
        "editProductCategory"
      )
      ?.value;


  const newImage =
    document
      .getElementById(
        "editProductFile"
      )
      ?.files?.[0];


  const extraFiles =
    Array.from(
      document
        .getElementById(
          "editProductFiles"
        )
        ?.files ||
      []
    );


  const featured =
    document
      .getElementById(
        "editProductFeatured"
      )
      ?.checked ||
    false;


  const active =
    document
      .getElementById(
        "editProductActive"
      )
      ?.checked !== false;


  const oldPrice =
    oldPriceValue === ""
      ? null
      : Number(
          oldPriceValue
        );


  /* -------------------------
     VALIDATION
  ------------------------- */

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
    !Number.isInteger(stock) ||
    stock < 0
  ) {

    showNotification(
      "Stock invalide.",
      "error"
    );

    return;

  }


  if (
    oldPrice !== null &&
    (
      !Number.isFinite(
        oldPrice
      ) ||
      oldPrice < 0
    )
  ) {

    showNotification(
      "Ancien prix invalide.",
      "error"
    );

    return;

  }


  try {

    if (button) {

      button.disabled =
        true;

      button.textContent =
        "Enregistrement...";

    }


    /* -------------------------
       IMAGE PRINCIPALE
    ------------------------- */

    let imageUrl =
      product.image_url ||
      null;


    if (newImage) {

      imageUrl =
        await uploadImage(
          newImage
        );

    }


    /* -------------------------
       EXTRA IMAGES
    ------------------------- */

    let images =
      Array.isArray(
        product.images
      )
        ? [
            ...product.images
          ]
        : [];


    for (
      const file
      of extraFiles
    ) {

      const url =
        await uploadImage(
          file
        );


      if (url) {

        images.push(
          url
        );

      }

    }


    /* -------------------------
       UPDATE DATA
    ------------------------- */

    const updateData = {

      category_id:
        categoryId ||
        null,

      name,

      slug:
        slug ||
        createSlug(
          name
        ),

      description:
        description ||
        null,

      price,

      old_price:
        oldPrice,

      stock,

      image_url:
        imageUrl,

      images,

      featured,

      active

    };


    const {
      data,
      error
    } =
      await supabaseClient

        .from(
          "products"
        )

        .update(
          updateData
        )

        .eq(
          "id",
          productId
        )

        .select()
        .single();


    if (error) {
      throw error;
    }


    /* -------------------------
       UPDATE STATE
    ------------------------- */

    const index =
      STATE.products.findIndex(
        item =>
          String(item.id) ===
          String(productId)
      );


    if (
      index !== -1
    ) {

      STATE.products[index] =
        data;

    }


    renderProducts();

    updateDashboard();

    renderLowStock();

    closeModal();


    showNotification(
      "Produit modifié avec succès.",
      "success"
    );


  } catch (error) {

    console.error(
      "Update product error:",
      error
    );


    showNotification(
      error.message ||
      "Erreur modification produit.",
      "error"
    );


  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "Enregistrer";

    }

  }

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(
  productId
) {

  const product =
    STATE.products.find(
      item =>
        String(item.id) ===
        String(productId)
    );


  if (!product) {
    return;
  }


  const confirmed =
    window.confirm(
      `Supprimer définitivement "${product.name}" ?`
    );


  if (!confirmed) {
    return;
  }


  const button =
    document.getElementById(
      "deleteProductBtn"
    );


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "Suppression...";

  }


  try {

    /*
      Supprimer d'abord les variantes
      du produit pour éviter les
      problèmes de relation.
    */

    const {
      error:
        variantDeleteError
    } =
      await supabaseClient

        .from(
          "product_variants"
        )

        .delete()

        .eq(
          "product_id",
          productId
        );


    if (
      variantDeleteError
    ) {

      console.warn(
        "Variant delete warning:",
        variantDeleteError
      );

    }


    const {
      error
    } =
      await supabaseClient

        .from(
          "products"
        )

        .delete()

        .eq(
          "id",
          productId
        );


    if (error) {
      throw error;
    }


    STATE.products =
      STATE.products.filter(
        item =>
          String(item.id) !==
          String(productId)
      );


    renderProducts();

    updateDashboard();

    renderLowStock();

    closeModal();


    showNotification(
      "Produit supprimé avec succès.",
      "success"
    );


  } catch (error) {

    console.error(
      "Delete product error:",
      error
    );


    showNotification(
      error.message ||
      "Erreur suppression produit.",
      "error"
    );


  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "🗑 Supprimer";

    }

  }

}


/* =========================================================
   ADD CATEGORY MODAL
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
          Nom *
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
        id="saveCategoryBtn"
        class="primary-btn"
        style="width:100%"
        type="button"
      >
        Ajouter
      </button>

    </div>

  `);


  const nameInput =
    document.getElementById(
      "newCategoryName"
    );


  const slugInput =
    document.getElementById(
      "newCategorySlug"
    );


  nameInput?.addEventListener(
    "input",
    () => {

      if (
        !slugInput.dataset.edited
      ) {

        slugInput.value =
          createSlug(
            nameInput.value
          );

      }

    }
  );


  slugInput?.addEventListener(
    "input",
    () => {

      slugInput.dataset.edited =
        "true";

    }
  );


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

  const button =
    document.getElementById(
      "saveCategoryBtn"
    );


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
      createSlug(
        name
      );

  }


  try {

    if (button) {

      button.disabled =
        true;

      button.textContent =
        "Ajout...";

    }


    const {
      data,
      error
    } =
      await supabaseClient

        .from(
          "categories"
        )

        .insert({

          name,

          slug,

          image_url:
            imageUrl ||
            null

        })

        .select()
        .single();


    if (error) {
      throw error;
    }


    STATE.categories.push(
      data
    );


    STATE.categories.sort(
      (a, b) =>
        String(
          a.name
        ).localeCompare(
          String(
            b.name
          )
        )
    );


    renderCategories();

    updateProductCategoryFilter();

    closeModal();


    showNotification(
      "Catégorie ajoutée.",
      "success"
    );


  } catch (error) {

    console.error(
      "Save category error:",
      error
    );


    showNotification(
      error.message ||
      "Erreur lors de l'ajout de la catégorie.",
      "error"
    );


  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "Ajouter";

    }

  }

}


/* =========================================================
   GLOBAL EXPORTS - PART 2
========================================================= */

window.editProduct =
  editProduct;

window.deleteProduct =
  deleteProduct;

window.saveProduct =
  saveProduct;

window.saveCategory =
  saveCategory;

window.openAddProductModal =
  openAddProductModal;

window.openAddCategoryModal =
  openAddCategoryModal;

window.uploadImage =
  uploadImage;

/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(productId) {

  const product = STATE.products.find(
    item => String(item.id) === String(productId)
  );

  if (!product) {
    showNotification(
      "Produit introuvable.",
      "error"
    );
    return;
  }

  const images = Array.isArray(product.images)
    ? product.images
    : [];

  openModal(`
    <h2>Modifier le produit</h2>

    <p style="
      color:#777;
      font-size:12px;
      margin-top:6px;
    ">
      ${escapeHTML(product.name || "")}
    </p>

    <div style="margin-top:20px;">

      <div class="form-group">
        <label>Nom *</label>

        <input
          id="editProductName"
          type="text"
          value="${escapeHTML(product.name || "")}"
        >
      </div>

      <div class="form-group">
        <label>Slug</label>

        <input
          id="editProductSlug"
          type="text"
          value="${escapeHTML(product.slug || "")}"
        >
      </div>

      <div class="form-group">
        <label>Description</label>

        <textarea
          id="editProductDescription"
          rows="4"
          style="width:100%;resize:vertical;"
        >${escapeHTML(product.description || "")}</textarea>
      </div>

      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
      ">

        <div class="form-group">
          <label>Prix</label>

          <input
            id="editProductPrice"
            type="number"
            min="0"
            step="0.01"
            value="${Number(product.price || 0)}"
          >
        </div>

        <div class="form-group">
          <label>Ancien prix</label>

          <input
            id="editProductOldPrice"
            type="number"
            min="0"
            step="0.01"
            value="${product.old_price ?? ""}"
          >
        </div>

      </div>

      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
      ">

        <div class="form-group">
          <label>Stock</label>

          <input
            id="editProductStock"
            type="number"
            min="0"
            step="1"
            value="${Number(product.stock || 0)}"
          >
        </div>

        <div class="form-group">
          <label>Catégorie</label>

          <select id="editProductCategory">

            <option value="">
              Sans catégorie
            </option>

            ${STATE.categories.map(category => `
              <option
                value="${escapeHTML(category.id)}"
                ${
                  String(category.id) ===
                  String(product.category_id)
                    ? "selected"
                    : ""
                }
              >
                ${escapeHTML(category.name)}
              </option>
            `).join("")}

          </select>
        </div>

      </div>

      <div class="form-group">

        <label>Image actuelle</label>

        ${
          product.image_url
            ? `
              <img
                src="${escapeHTML(product.image_url)}"
                alt=""
                style="
                  width:120px;
                  height:120px;
                  object-fit:cover;
                  border-radius:12px;
                  margin-top:8px;
                "
              >
            `
            : `
              <div style="
                padding:20px;
                background:#f4f4f4;
                border-radius:10px;
              ">
                Aucune image
              </div>
            `
        }

      </div>

      <div class="form-group">

        <label>Remplacer l'image</label>

        <input
          id="editProductFile"
          type="file"
          accept="image/*"
        >

        <div
          id="editProductPreview"
          style="margin-top:10px;"
        ></div>

      </div>

      <div class="form-group">

        <label>Images supplémentaires</label>

        <div style="
          display:flex;
          gap:8px;
          flex-wrap:wrap;
          margin-bottom:10px;
        ">

          ${
            images.map(url => `
              <img
                src="${escapeHTML(url)}"
                alt=""
                style="
                  width:65px;
                  height:65px;
                  object-fit:cover;
                  border-radius:8px;
                "
              >
            `).join("")
          }

        </div>

        <input
          id="editProductFiles"
          type="file"
          accept="image/*"
          multiple
        >

      </div>

      <div style="
        display:flex;
        gap:20px;
        flex-wrap:wrap;
        margin:15px 0;
      ">

        <label style="
          display:flex;
          gap:8px;
          align-items:center;
        ">

          <input
            id="editProductFeatured"
            type="checkbox"
            ${product.featured ? "checked" : ""}
          >

          ★ Vedette

        </label>

        <label style="
          display:flex;
          gap:8px;
          align-items:center;
        ">

          <input
            id="editProductActive"
            type="checkbox"
            ${product.active !== false ? "checked" : ""}
          >

          Actif

        </label>

      </div>

      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
      ">

        <button
          id="updateProductBtn"
          class="primary-btn"
        >
          Enregistrer
        </button>

        <button
          id="deleteProductBtn"
          class="secondary-btn"
          style="
            color:#c73535;
            border-color:#c73535;
          "
        >
          🗑 Supprimer
        </button>

      </div>

      <!-- VARIANTS -->
      ${renderVariantForm(product)}

    </div>
  `);

  document
    .getElementById("editProductFile")
    ?.addEventListener("change", event => {

      const file = event.target.files?.[0];

      const preview =
        document.getElementById(
          "editProductPreview"
        );

      if (!file || !preview) return;

      const url =
        URL.createObjectURL(file);

      preview.innerHTML = `
        <img
          src="${url}"
          alt=""
          style="
            width:120px;
            height:120px;
            object-fit:cover;
            border-radius:12px;
          "
        >
      `;
    });

  document
    .getElementById("updateProductBtn")
    ?.addEventListener(
      "click",
      () => updateProduct(product.id)
    );

  document
    .getElementById("deleteProductBtn")
    ?.addEventListener(
      "click",
      () => deleteProduct(product.id)
    );

  document
    .getElementById("addVariantBtn")
    ?.addEventListener(
      "click",
      () => openVariantForm(null, product)
    );

  renderProductVariants(product.id);
}


/* =========================================================
   UPDATE PRODUCT
========================================================= */

async function updateProduct(productId) {

  const product = STATE.products.find(
    item => String(item.id) === String(productId)
  );

  if (!product) return;

  const button =
    document.getElementById(
      "updateProductBtn"
    );

  const name =
    document
      .getElementById("editProductName")
      ?.value
      .trim();

  const slug =
    document
      .getElementById("editProductSlug")
      ?.value
      .trim();

  const description =
    document
      .getElementById("editProductDescription")
      ?.value
      .trim();

  const price =
    Number(
      document
        .getElementById("editProductPrice")
        ?.value
    );

  const oldPriceValue =
    document
      .getElementById("editProductOldPrice")
      ?.value;

  const stock =
    Number(
      document
        .getElementById("editProductStock")
        ?.value
    );

  const categoryId =
    document
      .getElementById("editProductCategory")
      ?.value;

  const newImage =
    document
      .getElementById("editProductFile")
      ?.files?.[0];

  const extraFiles =
    Array.from(
      document
        .getElementById("editProductFiles")
        ?.files || []
    );

  const featured =
    document
      .getElementById("editProductFeatured")
      ?.checked || false;

  const active =
    document
      .getElementById("editProductActive")
      ?.checked !== false;

  const oldPrice =
    oldPriceValue === ""
      ? null
      : Number(oldPriceValue);

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
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    showNotification(
      "Stock invalide.",
      "error"
    );
    return;
  }

  if (
    oldPrice !== null &&
    (
      !Number.isFinite(oldPrice) ||
      oldPrice < 0
    )
  ) {
    showNotification(
      "Ancien prix invalide.",
      "error"
    );
    return;
  }

  try {

    if (button) {
      button.disabled = true;
      button.textContent =
        "Enregistrement...";
    }

    let imageUrl =
      product.image_url || null;

    if (newImage) {
      imageUrl =
        await uploadImage(
          newImage
        );
    }

    let images =
      Array.isArray(product.images)
        ? [...product.images]
        : [];

    for (const file of extraFiles) {

      const url =
        await uploadImage(file);

      if (url) {
        images.push(url);
      }
    }

    const updateData = {

      category_id:
        categoryId || null,

      name,

      slug:
        slug ||
        createSlug(name),

      description:
        description || null,

      price,

      old_price:
        oldPrice,

      stock,

      image_url:
        imageUrl,

      images,

      featured,

      active

    };

    const {
      data,
      error
    } =
      await supabaseClient
        .from("products")
        .update(updateData)
        .eq("id", productId)
        .select()
        .single();

    if (error) {
      throw error;
    }

    const index =
      STATE.products.findIndex(
        item =>
          String(item.id) ===
          String(productId)
      );

    if (index !== -1) {
      STATE.products[index] = data;
    }

    renderProducts();
    updateDashboard();
    renderLowStock();

    showNotification(
      "Produit modifié avec succès.",
      "success"
    );

    /*
      On recharge le modal pour que
      les variantes restent disponibles.
    */

    closeModal();

  } catch (error) {

    console.error(
      "Update product error:",
      error
    );

    showNotification(
      error.message ||
      "Erreur modification produit.",
      "error"
    );

  } finally {

    if (button) {
      button.disabled = false;
      button.textContent =
        "Enregistrer";
    }

  }
}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(productId) {

  const product =
    STATE.products.find(
      item =>
        String(item.id) ===
        String(productId)
    );

  if (!product) return;

  const confirmed =
    window.confirm(
      `Supprimer définitivement "${product.name}" ?`
    );

  if (!confirmed) return;

  const button =
    document.getElementById(
      "deleteProductBtn"
    );

  if (button) {
    button.disabled = true;
    button.textContent =
      "Suppression...";
  }

  try {

    /*
      Supprimer d'abord les variantes
      liées au produit.
    */

    const {
      error: variantsError
    } =
      await supabaseClient
        .from("product_variants")
        .delete()
        .eq(
          "product_id",
          productId
        );

    if (variantsError) {
      throw variantsError;
    }

    const {
      error
    } =
      await supabaseClient
        .from("products")
        .delete()
        .eq(
          "id",
          productId
        );

    if (error) {
      throw error;
    }

    STATE.products =
      STATE.products.filter(
        item =>
          String(item.id) !==
          String(productId)
      );

    renderProducts();
    updateDashboard();
    renderLowStock();

    closeModal();

    showNotification(
      "Produit supprimé avec succès.",
      "success"
    );

  } catch (error) {

    console.error(
      "Delete product error:",
      error
    );

    showNotification(
      error.message ||
      "Erreur suppression produit.",
      "error"
    );

  } finally {

    if (button) {
      button.disabled = false;
      button.textContent =
        "🗑 Supprimer";
    }

  }
}


/* =========================================================
   CATEGORIES
========================================================= */

function renderCategories() {

  const container =
    document.getElementById(
      "categoriesGrid"
    );

  if (!container) return;

  if (!STATE.categories.length) {

    container.innerHTML = `
      <div class="empty-state">
        <strong>
          Aucune catégorie
        </strong>
      </div>
    `;

    return;
  }

  container.innerHTML =
    STATE.categories
      .map(category => `

        <div class="category-card">

          <div class="category-image">

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
                  <strong>JR</strong>
                `
            }

          </div>

          <div class="category-content">

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

      `)
      .join("");
}


/* =========================================================
   ADD CATEGORY
========================================================= */

function openAddCategoryModal() {

  openModal(`

    <h2>
      Ajouter une catégorie
    </h2>

    <div style="margin-top:20px;">

      <div class="form-group">

        <label>
          Nom *
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
        id="saveCategoryBtn"
        class="primary-btn"
        style="width:100%"
      >
        Ajouter
      </button>

    </div>

  `);

  const nameInput =
    document.getElementById(
      "newCategoryName"
    );

  const slugInput =
    document.getElementById(
      "newCategorySlug"
    );

  nameInput?.addEventListener(
    "input",
    () => {

      if (!slugInput.dataset.edited) {

        slugInput.value =
          createSlug(
            nameInput.value
          );

      }

    }
  );

  slugInput?.addEventListener(
    "input",
    () => {

      slugInput.dataset.edited =
        "true";

    }
  );

  document
    .getElementById("saveCategoryBtn")
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
    slug = createSlug(name);
  }

  try {

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
      throw error;
    }

    STATE.categories.push(data);

    STATE.categories.sort(
      (a, b) =>
        String(a.name)
          .localeCompare(
            String(b.name)
          )
    );

    renderCategories();
    updateProductCategoryFilter();

    closeModal();

    showNotification(
      "Catégorie ajoutée.",
      "success"
    );

  } catch (error) {

    console.error(
      "Save category error:",
      error
    );

    showNotification(
      error.message ||
      "Erreur lors de l'ajout.",
      "error"
    );

  }
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

  const activeProducts =
    STATE.products.filter(
      product =>
        product.active !== false
    );

  const revenue =
    document.getElementById(
      "statRevenue"
    );

  const orders =
    document.getElementById(
      "statOrders"
    );

  const products =
    document.getElementById(
      "statProducts"
    );

  const customers =
    document.getElementById(
      "statCustomers"
    );

  if (revenue) {
    revenue.textContent =
      formatPrice(0);
  }

  if (orders) {
    orders.textContent =
      STATE.orders.length;
  }

  if (products) {
    products.textContent =
      activeProducts.length;
  }

  if (customers) {
    customers.textContent =
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

  if (!container) return;

  const products =
    STATE.products.filter(
      product =>
        Number(product.stock || 0) <= 5
    );

  if (!products.length) {

    container.innerHTML = `

      <div class="empty-state">

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
    products
      .slice(0, 8)
      .map(product => {

        const stock =
          Number(
            product.stock || 0
          );

        return `

          <div class="low-stock-item">

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

      })
      .join("");
}


/* =========================================================
   INVENTORY
========================================================= */

function loadInventory() {

  const tbody =
    document.getElementById(
      "inventoryTableBody"
    );

  if (!tbody) return;

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
      .map(product => {

        const stock =
          Number(
            product.stock || 0
          );

        let state =
          "Correct";

        let statusClass =
          "status-success";

        if (stock === 0) {

          state =
            "Rupture";

          statusClass =
            "status-danger";

        } else if (stock <= 5) {

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

      })
      .join("");
}


/* =========================================================
   ORDERS
========================================================= */

function loadOrders() {

  const tbody =
    document.getElementById(
      "ordersTableBody"
    );

  if (!tbody) return;

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

  if (!tbody) return;

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
   VARIANT FORM HELPERS
========================================================= */

function getVariantSizeOptions() {
  return `
    <option value="">Sans taille</option>

    <optgroup label="Vêtements">
      ${VARIANT_OPTIONS.clothingSizes
        .map(
          size => `
            <option value="${escapeHTML(size)}">
              ${escapeHTML(size)}
            </option>
          `
        )
        .join("")}
    </optgroup>

    <optgroup label="Chaussures">
      ${VARIANT_OPTIONS.shoeSizes
        .map(
          size => `
            <option value="${escapeHTML(size)}">
              ${escapeHTML(size)}
            </option>
          `
        )
        .join("")}
    </optgroup>
  `;
}


function getVariantColorOptions() {
  return `
    <option value="">Sans couleur</option>

    ${VARIANT_OPTIONS.colors
      .map(
        color => `
          <option value="${escapeHTML(color)}">
            ${escapeHTML(color)}
          </option>
        `
      )
      .join("")}
  `;
}


/* =========================================================
   VARIANT MANAGER HTML
========================================================= */

function renderVariantManager(product) {
  return `
    <div
      id="variantManager"
      style="
        margin-top:28px;
        padding-top:22px;
        border-top:1px solid #e5e5e5;
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          margin-bottom:15px;
        "
      >

        <div>
          <h3
            style="
              margin:0;
              font-size:18px;
            "
          >
            Variantes du produit
          </h3>

          <p
            style="
              margin:5px 0 0;
              color:#777;
              font-size:12px;
            "
          >
            Gérez les couleurs, tailles, prix et stocks.
          </p>
        </div>

        <button
          type="button"
          id="addVariantBtn"
          class="primary-btn"
        >
          ＋ Ajouter une variante
        </button>

      </div>


      <div id="variantsList">

        <div
          style="
            padding:15px;
            background:#f7f7f7;
            border-radius:10px;
            color:#777;
            font-size:13px;
          "
        >
          Chargement des variantes...
        </div>

      </div>


      <div
        id="variantFormContainer"
        style="
          display:none;
          margin-top:15px;
          padding:18px;
          border:1px solid #e5e5e5;
          border-radius:12px;
          background:#fafafa;
        "
      >

        <h4
          id="variantFormTitle"
          style="
            margin:0 0 15px;
          "
        >
          Ajouter une variante
        </h4>


        <input
          type="hidden"
          id="editingVariantId"
        >


        <div
          style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:12px;
          "
        >

          <div class="form-group">

            <label>
              Couleur
            </label>

            <select id="variantColor">
              ${getVariantColorOptions()}
            </select>

          </div>


          <div class="form-group">

            <label>
              Taille / Pointure
            </label>

            <select id="variantSize">
              ${getVariantSizeOptions()}
            </select>

          </div>


          <div class="form-group">

            <label>
              Prix
            </label>

            <input
              id="variantPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="Prix du produit"
            >

            <small
              style="
                color:#777;
                font-size:11px;
              "
            >
              Laisser vide pour utiliser le prix du produit.
            </small>

          </div>


          <div class="form-group">

            <label>
              Stock
            </label>

            <input
              id="variantStock"
              type="number"
              min="0"
              step="1"
              value="0"
            >

          </div>

        </div>


        <div class="form-group">

          <label>
            Image de la variante
          </label>

          <input
            id="variantImage"
            type="url"
            placeholder="https://..."
          >

        </div>


        <label
          style="
            display:flex;
            align-items:center;
            gap:8px;
            margin:12px 0 18px;
          "
        >

          <input
            id="variantActive"
            type="checkbox"
            checked
          >

          Variante active

        </label>


        <div
          style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:10px;
          "
        >

          <button
            type="button"
            id="saveVariantBtn"
            class="primary-btn"
          >
            Enregistrer
          </button>


          <button
            type="button"
            id="cancelVariantBtn"
            class="secondary-btn"
          >
            Annuler
          </button>

        </div>

      </div>

    </div>
  `;
}


/* =========================================================
   RENDER VARIANTS
========================================================= */

async function renderProductVariants(productId) {

  const container =
    document.getElementById("variantsList");

  if (!container) {
    return;
  }

  try {

    container.innerHTML = `
      <div
        style="
          padding:15px;
          background:#f7f7f7;
          border-radius:10px;
          color:#777;
          font-size:13px;
        "
      >
        Chargement des variantes...
      </div>
    `;

    const variants =
      await loadProductVariants(productId);

    if (!variants.length) {

      container.innerHTML = `
        <div
          style="
            padding:20px;
            text-align:center;
            background:#f7f7f7;
            border-radius:10px;
            color:#777;
            font-size:13px;
          "
        >
          Aucune variante.
        </div>
      `;

      return;
    }


    container.innerHTML =
      variants
        .map(variant => {

          const price =
            variant.price === null ||
            variant.price === undefined
              ? "Prix produit"
              : formatPrice(variant.price);

          const stock =
            Number(variant.stock || 0);

          const stockClass =
            stock === 0
              ? "status-danger"
              : stock <= 5
                ? "status-warning"
                : "status-success";


          return `
            <div
              class="variant-admin-card"
              data-variant-id="${escapeHTML(variant.id)}"
              style="
                display:flex;
                align-items:center;
                gap:12px;
                padding:12px;
                margin-bottom:10px;
                border:1px solid #e5e5e5;
                border-radius:12px;
                background:#fff;
              "
            >

              ${
                variant.image_url
                  ? `
                    <img
                      src="${escapeHTML(variant.image_url)}"
                      alt=""
                      style="
                        width:58px;
                        height:58px;
                        object-fit:cover;
                        border-radius:9px;
                      "
                    >
                  `
                  : `
                    <div
                      style="
                        width:58px;
                        height:58px;
                        border-radius:9px;
                        background:#f1f1f1;
                        display:grid;
                        place-items:center;
                        font-weight:700;
                      "
                    >
                      JR
                    </div>
                  `
              }


              <div
                style="
                  flex:1;
                  min-width:0;
                "
              >

                <strong>
                  ${escapeHTML(
                    variant.color || "Sans couleur"
                  )}

                  —

                  ${escapeHTML(
                    variant.size || "Sans taille"
                  )}
                </strong>


                <div
                  style="
                    margin-top:5px;
                    font-size:12px;
                    color:#777;
                  "
                >
                  ${price}
                  ·
                  Stock:
                  ${stock}
                </div>


                <div
                  style="
                    margin-top:6px;
                  "
                >
                  <span
                    class="status ${stockClass}"
                  >
                    ${
                      stock === 0
                        ? "Rupture"
                        : `${stock} en stock`
                    }
                  </span>
                </div>


                <div
                  style="
                    margin-top:5px;
                    font-size:11px;
                  "
                >
                  ${
                    variant.is_active
                      ? "✓ Active"
                      : "× Inactive"
                  }
                </div>

              </div>


              <div
                style="
                  display:flex;
                  gap:6px;
                  flex-wrap:wrap;
                "
              >

                <button
                  type="button"
                  class="secondary-btn"
                  onclick="editVariant('${escapeHTML(variant.id)}')"
                >
                  Modifier
                </button>


                <button
                  type="button"
                  class="secondary-btn"
                  style="
                    color:#c73535;
                    border-color:#c73535;
                  "
                  onclick="deleteVariant('${escapeHTML(variant.id)}')"
                >
                  Supprimer
                </button>

              </div>

            </div>
          `;
        })
        .join("");

  } catch (error) {

    console.error(
      "Render variants error:",
      error
    );

    container.innerHTML = `
      <div
        style="
          padding:15px;
          background:#fff1f1;
          border-radius:10px;
          color:#c73535;
          font-size:13px;
        "
      >
        Impossible de charger les variantes.
      </div>
    `;
  }
}


/* =========================================================
   OPEN VARIANT FORM
========================================================= */

function openVariantForm(
  variant = null,
  product = null
) {

  const form =
    document.getElementById(
      "variantFormContainer"
    );

  if (!form) {
    return;
  }


  const title =
    document.getElementById(
      "variantFormTitle"
    );

  const idInput =
    document.getElementById(
      "editingVariantId"
    );

  const colorInput =
    document.getElementById(
      "variantColor"
    );

  const sizeInput =
    document.getElementById(
      "variantSize"
    );

  const priceInput =
    document.getElementById(
      "variantPrice"
    );

  const stockInput =
    document.getElementById(
      "variantStock"
    );

  const imageInput =
    document.getElementById(
      "variantImage"
    );

  const activeInput =
    document.getElementById(
      "variantActive"
    );


  const editing =
    Boolean(variant);


  if (title) {

    title.textContent =
      editing
        ? "Modifier la variante"
        : "Ajouter une variante";
  }


  if (idInput) {

    idInput.value =
      variant?.id || "";
  }


  if (colorInput) {

    colorInput.value =
      variant?.color || "";
  }


  if (sizeInput) {

    sizeInput.value =
      variant?.size || "";
  }


  if (priceInput) {

    priceInput.value =
      variant?.price ?? "";
  }


  if (stockInput) {

    stockInput.value =
      Number(
        variant?.stock || 0
      );
  }


  if (imageInput) {

    imageInput.value =
      variant?.image_url || "";
  }


  if (activeInput) {

    activeInput.checked =
      variant
        ? variant.is_active !== false
        : true;
  }


  form.style.display =
    "block";


  form.scrollIntoView({
    behavior:"smooth",
    block:"nearest"
  });


  const saveButton =
    document.getElementById(
      "saveVariantBtn"
    );

  if (saveButton) {

    saveButton.onclick =
      () =>
        saveVariantFromForm(
          product?.id
        );
  }


  const cancelButton =
    document.getElementById(
      "cancelVariantBtn"
    );

  if (cancelButton) {

    cancelButton.onclick =
      closeVariantForm;
  }
}


/* =========================================================
   CLOSE VARIANT FORM
========================================================= */

function closeVariantForm() {

  const form =
    document.getElementById(
      "variantFormContainer"
    );

  if (form) {

    form.style.display =
      "none";
  }
}


/* =========================================================
   SAVE VARIANT FROM FORM
========================================================= */

async function saveVariantFromForm(
  productId
) {

  if (!productId) {

    showNotification(
      "Produit introuvable.",
      "error"
    );

    return;
  }


  const id =
    document.getElementById(
      "editingVariantId"
    )?.value || "";


  const color =
    document.getElementById(
      "variantColor"
    )?.value || "";


  const size =
    document.getElementById(
      "variantSize"
    )?.value || "";


  const priceValue =
    document.getElementById(
      "variantPrice"
    )?.value;


  const stockValue =
    document.getElementById(
      "variantStock"
    )?.value;


  const imageUrl =
    document.getElementById(
      "variantImage"
    )?.value.trim() || null;


  const isActive =
    document.getElementById(
      "variantActive"
    )?.checked !== false;


  const price =
    priceValue === "" ||
    priceValue === null ||
    priceValue === undefined
      ? null
      : Number(priceValue);


  const stock =
    Number(stockValue);


  if (
    !Number.isFinite(stock) ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {

    showNotification(
      "Stock de variante invalide.",
      "error"
    );

    return;
  }


  if (
    price !== null &&
    (
      !Number.isFinite(price) ||
      price < 0
    )
  ) {

    showNotification(
      "Prix de variante invalide.",
      "error"
    );

    return;
  }


  if (!color && !size) {

    showNotification(
      "Choisissez au moins une couleur ou une taille.",
      "error"
    );

    return;
  }


  const button =
    document.getElementById(
      "saveVariantBtn"
    );


  try {

    if (button) {

      button.disabled =
        true;

      button.textContent =
        "Enregistrement...";
    }


    const variantData = {

      product_id:
        productId,

      color:
        color.trim() || null,

      size:
        size.trim() || null,

      price,

      stock,

      image_url:
        imageUrl,

      is_active:
        isActive

    };


    let data;
    let error;


    if (id) {

      const result =
        await supabaseClient
          .from("product_variants")
          .update(variantData)
          .eq("id", id)
          .select()
          .single();

      data =
        result.data;

      error =
        result.error;

    } else {

      const result =
        await supabaseClient
          .from("product_variants")
          .insert(variantData)
          .select()
          .single();

      data =
        result.data;

      error =
        result.error;
    }


    if (error) {

      if (
        error.code ===
        "23505"
      ) {

        throw new Error(
          "Cette combinaison couleur / taille existe déjà pour ce produit."
        );
      }

      throw error;
    }


    closeVariantForm();


    await renderProductVariants(
      productId
    );


    showNotification(
      id
        ? "Variante modifiée avec succès."
        : "Variante ajoutée avec succès.",
      "success"
    );


  } catch (error) {

    console.error(
      "Save variant error:",
      error
    );


    showNotification(
      error.message ||
      "Erreur lors de l'enregistrement de la variante.",
      "error"
    );


  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "Enregistrer";
    }
  }
}


/* =========================================================
   EDIT VARIANT
========================================================= */

async function editVariant(
  variantId
) {

  if (!variantId) {
    return;
  }


  const variant =
    await getVariant(
      variantId
    );


  if (!variant) {
    return;
  }


  const product =
    STATE.products.find(
      item =>
        String(item.id) ===
        String(
          variant.product_id
        )
    );


  if (!product) {

    showNotification(
      "Produit de la variante introuvable.",
      "error"
    );

    return;
  }


  openVariantForm(
    variant,
    product
  );
}


/* =========================================================
   GET VARIANT
========================================================= */

async function getVariant(
  variantId
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("product_variants")
      .select(`
        id,
        product_id,
        color,
        size,
        price,
        stock,
        image_url,
        is_active,
        created_at,
        updated_at
      `)
      .eq(
        "id",
        variantId
      )
      .single();


  if (error) {

    console.error(
      "Get variant error:",
      error
    );


    showNotification(
      "Impossible de charger la variante.",
      "error"
    );


    return null;
  }


  return data;
}


/* =========================================================
   DELETE VARIANT
========================================================= */

async function deleteVariant(
  variantId
) {

  if (!variantId) {
    return;
  }


  const variant =
    await getVariant(
      variantId
    );


  if (!variant) {
    return;
  }


  const product =
    STATE.products.find(
      item =>
        String(item.id) ===
        String(
          variant.product_id
        )
    );


  const variantName = [
    variant.color,
    variant.size
  ]
    .filter(Boolean)
    .join(" — ") ||
    "cette variante";


  const confirmed =
    window.confirm(
      `Supprimer "${variantName}" ?`
    );


  if (!confirmed) {
    return;
  }


  try {

    const {
      error
    } =
      await supabaseClient
        .from("product_variants")
        .delete()
        .eq(
          "id",
          variantId
        );


    if (error) {
      throw error;
    }


    if (product) {

      await renderProductVariants(
        product.id
      );
    }


    showNotification(
      "Variante supprimée avec succès.",
      "success"
    );


  } catch (error) {

    console.error(
      "Delete variant error:",
      error
    );


    showNotification(
      error.message ||
      "Erreur lors de la suppression de la variante.",
      "error"
    );
  }
}


/* =========================================================
   ADD VARIANT BUTTON
========================================================= */

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "#addVariantBtn"
      );

    if (!button) {
      return;
    }


    const productId =
      button.dataset.productId;


    if (!productId) {

      showNotification(
        "Produit introuvable.",
        "error"
      );

      return;
    }


    const product =
      STATE.products.find(
        item =>
          String(item.id) ===
          String(productId)
      );


    openVariantForm(
      null,
      product
    );
  }
);


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.editVariant =
  editVariant;

window.deleteVariant =
  deleteVariant;

window.getVariant =
  getVariant;

window.renderProductVariants =
  renderProductVariants;


/* =========================================================
   UPDATE EDIT PRODUCT MODAL
   Add variants section
========================================================= */

const originalEditProduct =
  window.editProduct;


/*
  On ouvre la section variantes après
  chargement du modal produit.
*/

async function addVariantsToEditModal(
  product
) {

  const modalContent =
    document.getElementById(
      "modalContent"
    );

  if (!modalContent) {
    return;
  }


  const existing =
    document.getElementById(
      "variantManager"
    );


  if (existing) {
    existing.remove();
  }


  const managerHTML =
    renderVariantManager(
      product
    );


  modalContent.insertAdjacentHTML(
    "beforeend",
    managerHTML
  );


  const addButton =
    document.getElementById(
      "addVariantBtn"
    );


  if (addButton) {

    addButton.dataset.productId =
      product.id;
  }


  await renderProductVariants(
    product.id
  );
}


/* =========================================================
   PATCH EDIT PRODUCT
========================================================= */

const oldEditProduct =
  window.editProduct;


window.editProduct =
  async function(productId) {

    oldEditProduct(
      productId
    );


    setTimeout(
      async () => {

        const product =
          STATE.products.find(
            item =>
              String(item.id) ===
              String(productId)
          );


        if (!product) {
          return;
        }


        await addVariantsToEditModal(
          product
        );

      },
      100
    );
  };


/* =========================================================
   FINAL ADMIN API
========================================================= */

window.JR_ADMIN = {

  STATE,

  CONFIG,

  supabaseClient,

  loadProducts,

  loadCategories,

  loadProductVariants,

  renderProductVariants,

  saveProductVariant,

  deleteProductVariant,

  getVariant,

  editVariant,

  deleteVariant,

  showSection,

  openModal,

  closeModal

};


/* =========================================================
   END
========================================================= */

console.log(
  "JR Shop Admin Pro — READY ✓"
);
