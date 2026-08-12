"use strict";

/* =========================================================
   JR SHOP — ADMIN PRO
   Supabase + Products + Categories
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

  customers: []
};


/* =========================================================
   DOM
========================================================= */

const DOM = {
  sidebar: document.querySelector(".sidebar"),

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
    document.getElementById("productCategoryFilter"),

  productStatusFilter:
    document.getElementById("productStatusFilter"),

  customerSearch:
    document.getElementById("customerSearch")
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
    "JR Shop Admin — démarrage..."
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
   LOAD DATA
========================================================= */

async function loadAllData() {

  try {

    await Promise.all([
      loadCategories(),
      loadProducts()
    ]);

    updateDashboard();

  } catch (error) {

    console.error(
      "Erreur chargement données:",
      error
    );

    showNotification(
      "Erreur de chargement Supabase.",
      "error"
    );
  }
}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

  const {
    data,
    error
  } = await supabaseClient

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
      "Erreur produits:",
      error
    );

    throw error;
  }


  STATE.products =
    data || [];


  renderProducts();

  updateProductCategoryFilter();

  renderLowStock();

  updateDashboard();
}


/* =========================================================
   LOAD CATEGORIES
========================================================= */

async function loadCategories() {

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
      "Erreur catégories:",
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


  if (!tbody) return;


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


  tbody.innerHTML = products
    .map(product => {

      const category =
        STATE.categories.find(
          cat =>
            String(cat.id) ===
            String(product.category_id)
        );


      const isActive =
        product.active !== false;


      const stock =
        Number(product.stock || 0);


      let stockClass =
        "status-success";


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
                    product.name || "Produit"
                  )}
                </strong>

                ${
                  product.featured

                  ? `

                    <div
                      style="
                        font-size:10px;
                        margin-top:3px;
                        font-weight:700;
                      "
                    >
                      ★ Produit vedette
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
              ? escapeHTML(category.name)
              : "—"
            }

          </td>


          <td>

            <strong>
              ${formatPrice(product.price)}
            </strong>

            ${
              product.old_price

              ? `

                <div
                  style="
                    font-size:10px;
                    color:#888;
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

    })
    .join("");
}


/* =========================================================
   CATEGORY FILTER
========================================================= */

function updateProductCategoryFilter() {

  const select =
    DOM.productCategoryFilter;


  if (!select) return;


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
    DOM.productCategoryFilter?.value ||
    "";


  const status =
    DOM.productStatusFilter?.value ||
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
          ) === String(category);


        const isActive =
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


  renderProducts(filtered);
}


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
        margin-top:6px;
        color:#777;
        font-size:12px;
      "
    >
      Créez un produit complet pour votre boutique.
    </p>


    <div style="margin-top:20px">


      <div class="form-group">

        <label>
          Nom du produit *
        </label>

        <input
          id="productName"
          type="text"
          placeholder="Ex: T-shirt Oversize"
        >

      </div>


      <div class="form-group">

        <label>
          Slug
        </label>

        <input
          id="productSlug"
          type="text"
          placeholder="t-shirt-oversize"
        >

      </div>


      <div class="form-group">

        <label>
          Description
        </label>

        <textarea
          id="productDescription"
          rows="5"
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
            id="productPrice"
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
            id="productOldPrice"
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
            id="productStock"
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
            id="productCategory"
          >

            <option value="">
              Choisir une catégorie
            </option>

            ${STATE.categories
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
              .join("")}

          </select>

        </div>

      </div>


      <div class="form-group">

        <label>
          Image principale
        </label>

        <input
          id="productImage"
          type="url"
          placeholder="https://..."
        >

      </div>


      <div class="form-group">

        <label>
          Images supplémentaires
        </label>

        <textarea
          id="productImages"
          rows="4"
          placeholder="Une URL par ligne"
          style="
            width:100%;
            resize:vertical;
          "
        ></textarea>

        <small
          style="
            color:#777;
            font-size:10px;
          "
        >
          Mettez une URL par ligne.
        </small>

      </div>


      <div
        style="
          display:flex;
          gap:20px;
          margin:15px 0;
          flex-wrap:wrap;
        "
      >

        <label
          style="
            display:flex;
            align-items:center;
            gap:8px;
            cursor:pointer;
          "
        >

          <input
            id="productFeatured"
            type="checkbox"
          >

          Produit vedette

        </label>


        <label
          style="
            display:flex;
            align-items:center;
            gap:8px;
            cursor:pointer;
          "
        >

          <input
            id="productActive"
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
      >
        Ajouter le produit
      </button>


    </div>

  `);


  const nameInput =
    document.getElementById(
      "productName"
    );


  const slugInput =
    document.getElementById(
      "productSlug"
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
      .getElementById("productName")
      ?.value
      .trim();


  const slug =
    document
      .getElementById("productSlug")
      ?.value
      .trim();


  const description =
    document
      .getElementById("productDescription")
      ?.value
      .trim();


  const priceValue =
    document
      .getElementById("productPrice")
      ?.value;


  const oldPriceValue =
    document
      .getElementById("productOldPrice")
      ?.value;


  const stockValue =
    document
      .getElementById("productStock")
      ?.value;


  const categoryId =
    document
      .getElementById("productCategory")
      ?.value;


  const imageUrl =
    document
      .getElementById("productImage")
      ?.value
      .trim();


  const imagesText =
    document
      .getElementById("productImages")
      ?.value
      .trim();


  const featured =
    document
      .getElementById("productFeatured")
      ?.checked ||
    false;


  const active =
    document
      .getElementById("productActive")
      ?.checked !== false;


  const price =
    Number(priceValue);


  const stock =
    Number(stockValue);


  const oldPrice =
    oldPriceValue === ""
      ? null
      : Number(oldPriceValue);


  if (!name) {

    showNotification(
      "Le nom du produit est obligatoire.",
      "error"
    );

    return;
  }


  if (
    !Number.isFinite(price) ||
    price < 0
  ) {

    showNotification(
      "Le prix est invalide.",
      "error"
    );

    return;
  }


  if (
    !Number.isInteger(stock) ||
    stock < 0
  ) {

    showNotification(
      "Le stock est invalide.",
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
      "L'ancien prix est invalide.",
      "error"
    );

    return;
  }


  const images =
    imagesText

      ? imagesText
          .split(/\r?\n/)
          .map(
            url => url.trim()
          )
          .filter(Boolean)

      : [];


  const productData = {

    category_id:
      categoryId || null,

    name,

    slug:
      slug || createSlug(name),

    description:
      description || null,

    price,

    old_price:
      oldPrice,

    stock,

    image_url:
      imageUrl || null,

    images,

    featured,

    active

  };


  console.log(
    "Produit à envoyer:",
    productData
  );


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
      "Erreur ajout produit:",
      error
    );

    showNotification(
      error.message ||
      "Impossible d'ajouter le produit.",
      "error"
    );

    return;
  }


  STATE.products.unshift(
    data
  );


  renderProducts();

  renderLowStock();

  updateDashboard();


  closeModal();


  showNotification(
    "Produit ajouté avec succès.",
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


  const images =
    Array.isArray(
      product.images
    )
      ? product.images.join("\n")
      : "";


  openModal(`

    <h2>
      Modifier le produit
    </h2>

    <p
      style="
        margin-top:6px;
        color:#777;
        font-size:12px;
      "
    >
      Modifiez les informations du produit.
    </p>


    <div style="margin-top:20px">


      <div class="form-group">

        <label>
          Nom du produit *
        </label>

        <input
          id="editProductName"
          type="text"
          value="${escapeHTML(
            product.name || ""
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
            product.slug || ""
          )}"
        >

      </div>


      <div class="form-group">

        <label>
          Description
        </label>

        <textarea
          id="editProductDescription"
          rows="5"
          style="
            width:100%;
            resize:vertical;
          "
        >${escapeHTML(
          product.description || ""
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
            Prix *
          </label>

          <input
            id="editProductPrice"
            type="number"
            min="0"
            step="0.01"
            value="${Number(
              product.price || 0
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
              product.old_price === null ||
              product.old_price === undefined
                ? ""
                : Number(
                    product.old_price
                  )
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
            Stock *
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

            ${STATE.categories
              .map(
                category => `

                  <option
                    value="${escapeHTML(
                      category.id
                    )}"
                    ${
                      String(
                        product.category_id
                      ) ===
                      String(
                        category.id
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
              .join("")}

          </select>

        </div>

      </div>


      <div class="form-group">

        <label>
          Image principale
        </label>

        <input
          id="editProductImage"
          type="url"
          value="${escapeHTML(
            product.image_url || ""
          )}"
        >

      </div>


      <div class="form-group">

        <label>
          Images supplémentaires
        </label>

        <textarea
          id="editProductImages"
          rows="4"
          style="
            width:100%;
            resize:vertical;
          "
        >${escapeHTML(
          images
        )}</textarea>

      </div>


      <div
        style="
          display:flex;
          gap:20px;
          margin:15px 0;
          flex-wrap:wrap;
        "
      >

        <label
          style="
            display:flex;
            align-items:center;
            gap:8px;
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

          Produit vedette

        </label>


        <label
          style="
            display:flex;
            align-items:center;
            gap:8px;
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

          Produit actif

        </label>

      </div>


      <button
        id="updateProductBtn"
        class="primary-btn"
        style="width:100%"
      >
        Enregistrer les modifications
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


  const imageUrl =
    document
      .getElementById(
        "editProductImage"
      )
      ?.value
      .trim();


  const imagesText =
    document
      .getElementById(
        "editProductImages"
      )
      ?.value
      .trim();


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
      : Number(oldPriceValue);


  if (!name) {

    showNotification(
      "Le nom est obligatoire.",
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


  const images =
    imagesText

      ? imagesText
          .split(/\r?\n/)
          .map(
            url => url.trim()
          )
          .filter(Boolean)

      : [];


  const updateData = {

    category_id:
      categoryId || null,

    name,

    slug:
      slug || createSlug(name),

    description:
      description || null,

    price,

    old_price:
      oldPrice,

    stock,

    image_url:
      imageUrl || null,

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

    console.error(
      "Erreur modification:",
      error
    );

    showNotification(
      error.message ||
      "Impossible de modifier le produit.",
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
      data;
  }


  renderProducts();

  renderLowStock();

  updateDashboard();


  closeModal();


  showNotification(
    "Produit modifié avec succès.",
    "success"
  );
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

                <strong>
                  JR
                </strong>

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


    <div style="margin-top:20px">


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
        Ajouter la catégorie
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

  const name =
    document
      .getElementById(
        "newCategoryName"
      )
      ?.value
      .trim();


  const slugValue =
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
      "Le nom est obligatoire.",
      "error"
    );

    return;
  }


  const slug =
    slugValue ||
    createSlug(name);


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
      "Erreur catégorie:",
      error
    );

    showNotification(
      error.message,
      "error"
    );

    return;
  }


  STATE.categories.push(
    data
  );


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
    "Catégorie ajoutée avec succès.",
    "success"
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


  const statProducts =
    document.getElementById(
      "statProducts"
    );


  if (statProducts) {

    statProducts.textContent =
      activeProducts.length;
  }


  const statOrders =
    document.getElementById(
      "statOrders"
    );


  if (statOrders) {

    statOrders.textContent =
      STATE.orders.length;
  }


  const statCustomers =
    document.getElementById(
      "statCustomers"
    );


  if (statCustomers) {

    statCustomers.textContent =
      STATE.customers.length;
  }


  const statRevenue =
    document.getElementById(
      "statRevenue"
    );


  if (statRevenue) {

    statRevenue.textContent =
      formatPrice(0);
  }
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
          Aucun produit en rupture
          ou stock faible.
        </p>

      </div>

    `;

    return;
  }


  container.innerHTML =
    lowStock
      .slice(0, 8)
      .map(product => {

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


        let className =
          "status-success";


        if (stock === 0) {

          state =
            "Rupture";

          className =
            "status-danger";

        } else if (stock <= 5) {

          state =
            "Stock faible";

          className =
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
                  ${className}
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
        dans l'étape suivante.
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
        dans l'étape suivante.
      </td>

    </tr>

  `;
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

            if (
              section === "products" &&
              item.classList.contains(
                "quick-action"
              )
            ) {

              showSection(
                "products"
              );

              setTimeout(
                () => {
                  openAddProductModal();
                },
                100
              );

              return;
            }


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
    !CONFIG.sections[section]
  ) return;


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


  if (
    section === "categories"
  ) {

    renderCategories();
  }


  if (
    section === "products"
  ) {

    renderProducts();
  }
}


/* =========================================================
   MOBILE
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
        event.key === "Escape"
      ) {

        closeModal();
      }

    }
  );
}


function openModal(
  content
) {

  if (!DOM.modalOverlay) return;

  if (!DOM.modalContent) return;


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


  if (!confirmed) return;


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
    " " +
    CONFIG.currency
  );
}


function createSlug(
  text
) {

  return String(text || "")

    .toLowerCase()

    .normalize("NFD")

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
