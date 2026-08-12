/* =========================================================
   JR SHOP — ADMIN
   admin.js
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
========================================================= */

const ADMIN_CONFIG = {
  shopName: "JR Shop",
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
      subtitle: "Gérez vos offres et codes promotionnels"
    },

    inventory: {
      title: "Stock",
      subtitle: "Suivez votre inventaire"
    },

    analytics: {
      title: "Statistiques",
      subtitle: "Analysez les performances de votre boutique"
    },

    settings: {
      title: "Paramètres",
      subtitle: "Configuration de votre boutique"
    }
  }
};


/* =========================================================
   DOM
========================================================= */

const DOM = {
  sidebar: document.querySelector(".sidebar"),
  mobileMenuBtn: document.getElementById("mobileMenuBtn"),

  pageTitle: document.getElementById("pageTitle"),
  pageSubtitle: document.getElementById("pageSubtitle"),

  navItems: document.querySelectorAll(".nav-item"),
  pageSections: document.querySelectorAll(".page-section"),

  quickActions: document.querySelectorAll("[data-section]"),

  logoutBtn: document.getElementById("logoutBtn"),

  modalOverlay: document.getElementById("modalOverlay"),
  modalContent: document.getElementById("modalContent"),
  closeModalBtn: document.getElementById("closeModalBtn"),

  addProductBtn: document.getElementById("addProductBtn"),
  addCategoryBtn: document.getElementById("addCategoryBtn"),

  productSearch: document.getElementById("productSearch"),
  productCategoryFilter: document.getElementById("productCategoryFilter"),
  productStatusFilter: document.getElementById("productStatusFilter"),

  customerSearch: document.getElementById("customerSearch"),

  salesPeriod: document.getElementById("salesPeriod")
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
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  initializeAdmin();

});


function initializeAdmin() {

  setupNavigation();
  setupMobileMenu();
  setupModal();
  setupQuickActions();
  setupButtons();
  setupSearch();

  loadInitialDashboard();

  console.log("JR Shop Admin initialized.");
}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

  DOM.navItems.forEach((item) => {

    item.addEventListener("click", () => {

      const section = item.dataset.section;

      if (!section) {
        return;
      }

      showSection(section);

    });

  });

}


/* =========================================================
   SHOW SECTION
========================================================= */

function showSection(sectionName) {

  const config = ADMIN_CONFIG.sections[sectionName];

  if (!config) {
    console.warn("Section inconnue:", sectionName);
    return;
  }

  STATE.currentSection = sectionName;


  /* Active nav */

  DOM.navItems.forEach((item) => {

    item.classList.toggle(
      "active",
      item.dataset.section === sectionName
    );

  });


  /* Active page */

  DOM.pageSections.forEach((section) => {

    section.classList.toggle(
      "active",
      section.id === sectionName
    );

  });


  /* Header */

  DOM.pageTitle.textContent = config.title;
  DOM.pageSubtitle.textContent = config.subtitle;


  /* Close mobile sidebar */

  if (window.innerWidth <= 900) {

    DOM.sidebar?.classList.remove("open");

  }


  /* Load section data */

  handleSectionLoad(sectionName);

}


/* =========================================================
   SECTION LOAD
========================================================= */

function handleSectionLoad(sectionName) {

  switch (sectionName) {

    case "dashboard":
      loadInitialDashboard();
      break;

    case "products":
      loadProducts();
      break;

    case "categories":
      loadCategories();
      break;

    case "orders":
      loadOrders();
      break;

    case "customers":
      loadCustomers();
      break;

    case "inventory":
      loadInventory();
      break;

    case "analytics":
      loadAnalytics();
      break;

    default:
      break;

  }

}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

  if (!DOM.mobileMenuBtn || !DOM.sidebar) {
    return;
  }

  DOM.mobileMenuBtn.addEventListener("click", () => {

    DOM.sidebar.classList.toggle("open");

  });


  document.addEventListener("click", (event) => {

    if (window.innerWidth > 900) {
      return;
    }

    const clickedInsideSidebar =
      DOM.sidebar.contains(event.target);

    const clickedMenu =
      DOM.mobileMenuBtn.contains(event.target);

    if (
      !clickedInsideSidebar &&
      !clickedMenu
    ) {

      DOM.sidebar.classList.remove("open");

    }

  });

}


/* =========================================================
   QUICK ACTIONS
========================================================= */

function setupQuickActions() {

  DOM.quickActions.forEach((element) => {

    element.addEventListener("click", () => {

      const section = element.dataset.section;

      if (!section) {
        return;
      }

      showSection(section);

    });

  });

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


  DOM.customerSearch?.addEventListener(
    "input",
    filterCustomers
  );

}


/* =========================================================
   DASHBOARD
========================================================= */

function loadInitialDashboard() {

  updateDashboardStats();

}


function updateDashboardStats() {

  const revenueElement =
    document.getElementById("statRevenue");

  const ordersElement =
    document.getElementById("statOrders");

  const productsElement =
    document.getElementById("statProducts");

  const customersElement =
    document.getElementById("statCustomers");


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
      STATE.products.length;

  }


  if (customersElement) {

    customersElement.textContent =
      STATE.customers.length;

  }

}


/* =========================================================
   PRODUCTS
========================================================= */

function loadProducts() {

  console.log("Loading products...");

  renderProducts();

}


function renderProducts(products = STATE.products) {

  const tbody =
    document.getElementById("productsTableBody");

  if (!tbody) {
    return;
  }


  if (!products.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-row">
          Aucun produit chargé pour le moment.
        </td>
      </tr>
    `;

    return;
  }


  tbody.innerHTML = products.map((product) => {

    const active =
      product.is_active !== false;

    return `
      <tr>

        <td>
          <strong>
            ${escapeHTML(product.name || "Produit")}
          </strong>
        </td>

        <td>
          ${escapeHTML(product.category_name || "—")}
        </td>

        <td>
          ${formatPrice(product.price || 0)}
        </td>

        <td>
          ${Number(product.stock || 0)}
        </td>

        <td>
          <span class="status ${
            active
              ? "status-success"
              : "status-neutral"
          }">
            ${active ? "Actif" : "Inactif"}
          </span>
        </td>

        <td>
          <button
            class="secondary-btn"
            onclick="editProduct('${product.id || ""}')"
          >
            Modifier
          </button>
        </td>

      </tr>
    `;

  }).join("");

}


/* =========================================================
   PRODUCT FILTER
========================================================= */

function filterProducts() {

  const search =
    DOM.productSearch?.value
      ?.trim()
      .toLowerCase() || "";


  const category =
    DOM.productCategoryFilter?.value || "";


  const status =
    DOM.productStatusFilter?.value || "";


  const filtered =
    STATE.products.filter((product) => {

      const name =
        String(product.name || "")
          .toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search);


      const matchesCategory =
        !category ||
        String(product.category_id || "") === category;


      const active =
        product.is_active !== false;


      const matchesStatus =
        !status ||
        (status === "active" && active) ||
        (status === "inactive" && !active);


      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );

    });


  renderProducts(filtered);

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(productId) {

  const product =
    STATE.products.find(
      (item) => String(item.id) === String(productId)
    );


  if (!product) {

    showNotification(
      "Produit introuvable.",
      "error"
    );

    return;
  }


  openModal(`
    <h2>Modifier le produit</h2>

    <p style="
      margin-top:8px;
      color:#747982;
      font-size:12px;
    ">
      ${escapeHTML(product.name || "Produit")}
    </p>

    <div style="margin-top:20px;">
      <button
        class="primary-btn"
        onclick="closeModal()"
      >
        Fermer
      </button>
    </div>
  `);

}


/* =========================================================
   CATEGORIES
========================================================= */

function loadCategories() {

  console.log("Loading categories...");

  renderCategories();

}


function renderCategories() {

  const container =
    document.getElementById("categoriesGrid");

  if (!container) {
    return;
  }


  if (!STATE.categories.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">▦</div>

        <strong>
          Aucune catégorie
        </strong>

        <p>
          Les catégories seront chargées depuis Supabase.
        </p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    STATE.categories.map((category) => {

      return `
        <div class="category-card">

          <div class="category-image">
            ${
              category.image_url
                ? `<img
                    src="${escapeHTML(category.image_url)}"
                    alt="${escapeHTML(category.name || "")}"
                    style="
                      width:100%;
                      height:100%;
                      object-fit:cover;
                    "
                  >`
                : "JR"
            }
          </div>

          <div class="category-content">

            <h3>
              ${escapeHTML(category.name || "Catégorie")}
            </h3>

            <p>
              ${escapeHTML(category.slug || "")}
            </p>

          </div>

        </div>
      `;

    }).join("");

}


/* =========================================================
   ADD CATEGORY
========================================================= */

function openAddCategoryModal() {

  openModal(`

    <h2>Ajouter une catégorie</h2>

    <p style="
      margin-top:7px;
      color:#747982;
      font-size:12px;
    ">
      Création d'une nouvelle catégorie.
    </p>

    <div style="margin-top:20px;">

      <div class="form-group">

        <label>
          Nom de la catégorie
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


      <button
        class="primary-btn"
        id="saveCategoryBtn"
      >
        Ajouter
      </button>

    </div>

  `);


  document
    .getElementById("saveCategoryBtn")
    ?.addEventListener(
      "click",
      saveCategoryPlaceholder
    );

}


function saveCategoryPlaceholder() {

  const name =
    document.getElementById("newCategoryName")
      ?.value
      ?.trim();


  if (!name) {

    showNotification(
      "Veuillez saisir un nom.",
      "error"
    );

    return;
  }


  showNotification(
    "La connexion Supabase sera ajoutée dans l'étape suivante.",
    "info"
  );

}


/* =========================================================
   ADD PRODUCT
========================================================= */

function openAddProductModal() {

  openModal(`

    <h2>Ajouter un produit</h2>

    <p style="
      margin-top:7px;
      color:#747982;
      font-size:12px;
    ">
      Nous allons connecter ce formulaire à votre table
      <strong>products</strong>.
    </p>


    <div style="margin-top:20px;">

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
          Stock
        </label>

        <input
          id="newProductStock"
          type="number"
          min="0"
          placeholder="10"
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
    .getElementById("saveProductBtn")
    ?.addEventListener(
      "click",
      saveProductPlaceholder
    );

}


function saveProductPlaceholder() {

  const name =
    document.getElementById("newProductName")
      ?.value
      ?.trim();


  const price =
    document.getElementById("newProductPrice")
      ?.value;


  const stock =
    document.getElementById("newProductStock")
      ?.value;


  if (!name) {

    showNotification(
      "Veuillez saisir le nom du produit.",
      "error"
    );

    return;
  }


  if (price === "" || Number(price) < 0) {

    showNotification(
      "Veuillez saisir un prix valide.",
      "error"
    );

    return;
  }


  if (stock === "" || Number(stock) < 0) {

    showNotification(
      "Veuillez saisir un stock valide.",
      "error"
    );

    return;
  }


  showNotification(
    "La connexion Supabase sera ajoutée dans l'étape suivante.",
    "info"
  );

}


/* =========================================================
   ORDERS
========================================================= */

function loadOrders() {

  renderOrders();

}


function renderOrders() {

  const tbody =
    document.getElementById("ordersTableBody");

  if (!tbody) {
    return;
  }


  if (!STATE.orders.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-row">
          Aucune commande.
        </td>
      </tr>
    `;

    return;
  }


  tbody.innerHTML =
    STATE.orders.map((order) => {

      return `
        <tr>

          <td>
            #${escapeHTML(order.id || "")}
          </td>

          <td>
            ${escapeHTML(order.customer_name || "Client")}
          </td>

          <td>
            ${formatDate(order.created_at)}
          </td>

          <td>
            ${formatPrice(order.total || 0)}
          </td>

          <td>
            <span class="status status-neutral">
              ${escapeHTML(order.status || "Nouveau")}
            </span>
          </td>

          <td>
            <button class="secondary-btn">
              Détails
            </button>
          </td>

        </tr>
      `;

    }).join("");

}


/* =========================================================
   CUSTOMERS
========================================================= */

function loadCustomers() {

  renderCustomers();

}


function renderCustomers(customers = STATE.customers) {

  const tbody =
    document.getElementById("customersTableBody");

  if (!tbody) {
    return;
  }


  if (!customers.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-row">
          Aucun client.
        </td>
      </tr>
    `;

    return;
  }


  tbody.innerHTML =
    customers.map((customer) => {

      return `
        <tr>

          <td>
            <strong>
              ${escapeHTML(customer.name || "Client")}
            </strong>
          </td>

          <td>
            ${escapeHTML(customer.email || "—")}
          </td>

          <td>
            ${escapeHTML(customer.phone || "—")}
          </td>

          <td>
            ${Number(customer.orders_count || 0)}
          </td>

          <td>
            ${formatPrice(customer.total_spent || 0)}
          </td>

          <td>
            <button class="secondary-btn">
              Voir
            </button>
          </td>

        </tr>
      `;

    }).join("");

}


/* =========================================================
   CUSTOMER FILTER
========================================================= */

function filterCustomers() {

  const search =
    DOM.customerSearch?.value
      ?.trim()
      .toLowerCase() || "";


  const filtered =
    STATE.customers.filter((customer) => {

      const name =
        String(customer.name || "")
          .toLowerCase();

      const email =
        String(customer.email || "")
          .toLowerCase();


      return (
        !search ||
        name.includes(search) ||
        email.includes(search)
      );

    });


  renderCustomers(filtered);

}


/* =========================================================
   INVENTORY
========================================================= */

function loadInventory() {

  const tbody =
    document.getElementById("inventoryTableBody");

  if (!tbody) {
    return;
  }


  if (!STATE.products.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-row">
          Aucun produit.
        </td>
      </tr>
    `;

    return;
  }


  tbody.innerHTML =
    STATE.products.map((product) => {

      const stock =
        Number(product.stock || 0);


      let state = "Correct";
      let statusClass = "status-success";


      if (stock === 0) {

        state = "Rupture";
        statusClass = "status-danger";

      } else if (stock <= 5) {

        state = "Stock faible";
        statusClass = "status-warning";

      }


      return `
        <tr>

          <td>
            <strong>
              ${escapeHTML(product.name || "Produit")}
            </strong>
          </td>

          <td>
            ${stock}
          </td>

          <td>
            <span class="status ${statusClass}">
              ${state}
            </span>
          </td>

          <td>
            <button class="secondary-btn">
              Modifier
            </button>
          </td>

        </tr>
      `;

    }).join("");

}


/* =========================================================
   ANALYTICS
========================================================= */

function loadAnalytics() {

  console.log(
    "Analytics ready for Supabase connection."
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
    (event) => {

      if (
        event.target === DOM.modalOverlay
      ) {

        closeModal();

      }

    }
  );


  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape"
      ) {

        closeModal();

      }

    }
  );

}


function openModal(content) {

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

function handleLogout() {

  const confirmed =
    window.confirm(
      "Voulez-vous vraiment vous déconnecter ?"
    );


  if (!confirmed) {
    return;
  }


  /*
    Supabase Auth sera ajouté ici.
  */

  showNotification(
    "Déconnexion prête pour Supabase Auth.",
    "info"
  );

}


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification(
  message,
  type = "info"
) {

  const existing =
    document.querySelector(
      ".admin-notification"
    );


  existing?.remove();


  const notification =
    document.createElement("div");


  notification.className =
    "admin-notification";


  notification.textContent =
    message;


  const background =
    type === "error"
      ? "#c73535"
      : "#111";


  notification.style.cssText = `
    position:fixed;
    right:20px;
    bottom:20px;
    z-index:5000;
    max-width:360px;
    padding:14px 17px;
    border-radius:12px;
    background:${background};
    color:#fff;
    font-size:12px;
    font-weight:600;
    box-shadow:0 15px 40px rgba(0,0,0,.18);
  `;


  document.body.appendChild(
    notification
  );


  setTimeout(() => {

    notification.remove();

  }, 3500);

}


/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value) {

  const number =
    Number(value) || 0;


  return (
    new Intl.NumberFormat(
      "fr-FR"
    ).format(number) +
    " " +
    ADMIN_CONFIG.currency
  );

}


function formatDate(value) {

  if (!value) {
    return "—";
  }


  const date =
    new Date(value);


  if (Number.isNaN(date.getTime())) {
    return "—";
  }


  return date.toLocaleDateString(
    "fr-FR"
  );

}


function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   GLOBAL FUNCTIONS
   Needed by inline buttons
========================================================= */

window.showSection = showSection;
window.closeModal = closeModal;
window.editProduct = editProduct;


/* =========================================================
   DEBUG
========================================================= */

window.JR_ADMIN = {
  STATE,
  showSection,
  openModal,
  closeModal,
  loadProducts,
  loadCategories,
  loadOrders,
  loadCustomers
};

