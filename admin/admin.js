"use strict";

/* =========================================================
   JR SHOP ADMIN PRO
   PRODUCTS + CATEGORIES + IMAGE UPLOAD
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
   LOAD ALL
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
   PRODUCTS
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
   CATEGORIES
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


  if (!select) return;


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
   FILTER
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
          grid-template-columns:
            1fr 1fr;
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
          grid-template-columns:
            1fr 1fr;
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
   IMAGE PREVIEW
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


  if (!preview) return;


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


  if (!gallery) return;


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


  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;


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


  return data.publicUrl;
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
        ?.files || []
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
    Number(priceValue);


  const stock =
    Number(stockValue);


  const oldPrice =
    oldPriceValue === ""
      ? null
      : Number(oldPriceValue);


  if (!name) {

    showNotification(
      "Nom du produit obligatoire.",
      "error"
    );

    return;
  }


  if (
    !mainFile
  ) {

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


  try {

    if (button) {

      button.disabled =
        true;

      button.textContent =
        "Upload des images...";
    }


    const mainImageUrl =
      await uploadImage(
        mainFile
      );


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


    const productData = {

      category_id:
        categoryId || null,

      name,

      slug:
        slugValue ||
        createSlug(name),

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

      throw error;
    }


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
          rows="4"
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
          grid-template-columns:
            1fr 1fr;
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
              product.old_price ??
              ""
            }"
          >

        </div>

      </div>


      <div
        style="
          display:grid;
          grid-template-columns:
            1fr 1fr;
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

        <label>

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


        <label>

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
          grid-template-columns:
            1fr 1fr;
          gap:10px;
        "
      >

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

    </div>

  `);


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
        ) return;


        const url =
          URL.createObjectURL(
            file
          );


        preview.innerHTML = `

          <img
            src="${url}"
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


  if (!product) return;


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
        ?.files || []
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


  try {

    if (button) {

      button.disabled =
        true;

      button.textContent =
        "Enregistrement...";
    }


    let imageUrl =
      product.image_url ||
      null;


    if (newImage) {

      imageUrl =
        await uploadImage(
          newImage
        );
    }


    let images =
      Array.isArray(
        product.images
      )
        ? [...product.images]
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


    const updateData = {

      category_id:
        categoryId || null,

      name,

      slug:
        slug ||
        createSlug(name),

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

      throw error;
    }


    const index =
      STATE.products.findIndex(
        item =>
          String(item.id) ===
          String(productId)
      );


    if (index !== -1) {

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


  if (!product) return;


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
    "Catégorie ajoutée.",
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


  if (!tbody) return;


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
  ) return;


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
    " "
    +
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
