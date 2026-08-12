/* =========================================================
   JR SHOP — HOME PAGE
   Supabase + Categories + Products + Search
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadProducts();

  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      filterProducts(searchInput.value);
    });
  }
});


/* =========================
   GLOBAL DATA
========================= */

let allProducts = [];


/* =========================
   LOAD CATEGORIES
========================= */

async function loadCategories() {
  const container = document.getElementById("categoriesGrid");

  if (!container) return;

  container.innerHTML = `
    <div class="loading">
      Chargement des catégories...
    </div>
  `;

  const { data, error } = await supabaseClient
    .from("categories")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error("Categories error:", error);

    container.innerHTML = `
      <div class="empty-state">
        <h2>Erreur</h2>
        <p>Impossible de charger les catégories.</p>
      </div>
    `;

    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Aucune catégorie</h2>
        <p>
          Les catégories apparaîtront ici
          lorsqu'elles seront ajoutées.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = data
    .map(category => {

      const image = category.image_url
        ? category.image_url
        : "https://placehold.co/600x400?text=JR+Shop";

      return `
        <a
          class="category-card"
          href="#products"
          data-category="${escapeHTML(category.id)}"
        >

          <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(category.name)}"
            loading="lazy"
          >

          <div class="category-card-content">

            <h3>
              ${escapeHTML(category.name)}
            </h3>

          </div>

        </a>
      `;
    })
    .join("");

  attachCategoryEvents();
}


/* =========================
   CATEGORY FILTER
========================= */

function attachCategoryEvents() {
  const cards = document.querySelectorAll(
    ".category-card"
  );

  cards.forEach(card => {

    card.addEventListener("click", event => {

      event.preventDefault();

      const categoryId =
        card.dataset.category;

      filterByCategory(categoryId);

      const productsSection =
        document.getElementById("products");

      if (productsSection) {
        productsSection.scrollIntoView({
          behavior: "smooth"
        });
      }

    });

  });
}


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {
  const container =
    document.getElementById("productsGrid");

  if (!container) return;

  container.innerHTML = `
    <div class="loading">
      Chargement des produits...
    </div>
  `;

  const { data, error } = await supabaseClient
    .from("products")
    .select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq("active", true)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error("Products error:", error);

    container.innerHTML = `
      <div class="empty-state">
        <h2>Erreur</h2>
        <p>
          Impossible de charger les produits.
        </p>
      </div>
    `;

    return;
  }

  allProducts = data || [];

  renderProducts(allProducts);
}


/* =========================
   RENDER PRODUCTS
========================= */

function renderProducts(products) {
  const container =
    document.getElementById("productsGrid");

  if (!container) return;

  if (!products || products.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <h2>Aucun produit</h2>
        <p>
          Aucun produit disponible pour le moment.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = products
    .map(product => createProductCard(product))
    .join("");
}


/* =========================
   PRODUCT CARD
========================= */

function createProductCard(product) {

  const image = product.image_url
    ? product.image_url
    : "https://placehold.co/600x600?text=JR+Shop";

  const price = formatPrice(
    product.price
  );

  const oldPrice =
    product.old_price &&
    Number(product.old_price) > Number(product.price)
      ? `
        <span class="old-price">
          ${formatPrice(product.old_price)}
        </span>
      `
      : "";

  const featuredBadge =
    product.featured
      ? `
        <span class="badge badge-featured">
          Vedette
        </span>
      `
      : "";

  const saleBadge =
    product.old_price &&
    Number(product.old_price) > Number(product.price)
      ? `
        <span class="badge badge-sale">
          Promo
        </span>
      `
      : "";

  const stockBadge =
    Number(product.stock) > 0
      ? `
        <span class="badge badge-stock">
          Disponible
        </span>
      `
      : "";

  const stockButton =
    Number(product.stock) > 0
      ? `
        <button
          class="btn btn-primary"
          onclick="addToCart('${escapeHTML(product.id)}')"
        >
          Ajouter au panier
        </button>
      `
      : `
        <button
          class="btn btn-outline"
          disabled
        >
          Rupture de stock
        </button>
      `;

  return `
    <article
      class="product-card"
      data-product-id="${escapeHTML(product.id)}"
    >

      <div class="product-image">

        ${saleBadge}
        ${featuredBadge}

        <a
          href="product-details.html?id=${encodeURIComponent(product.id)}"
        >

          <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
          >

        </a>

      </div>


      <div class="product-info">

        ${stockBadge}

        <a
          href="product-details.html?id=${encodeURIComponent(product.id)}"
        >

          <h3 class="product-name">
            ${escapeHTML(product.name)}
          </h3>

        </a>


        <div class="product-price">

          <span class="price">
            ${price}
          </span>

          ${oldPrice}

        </div>


        <div class="product-actions">

          <a
            href="product-details.html?id=${encodeURIComponent(product.id)}"
            class="btn btn-outline"
          >
            Voir
          </a>

          ${stockButton}

        </div>

      </div>

    </article>
  `;
}


/* =========================
   SEARCH
========================= */

function filterProducts(searchTerm) {

  const term =
    searchTerm
      .trim()
      .toLowerCase();

  if (!term) {
    renderProducts(allProducts);
    return;
  }

  const filtered =
    allProducts.filter(product => {

      const name =
        String(product.name || "")
          .toLowerCase();

      const description =
        String(product.description || "")
          .toLowerCase();

      return (
        name.includes(term) ||
        description.includes(term)
      );
    });

  renderProducts(filtered);
}


/* =========================
   CATEGORY FILTER
========================= */

function filterByCategory(categoryId) {

  if (!categoryId) {
    renderProducts(allProducts);
    return;
  }

  const filtered =
    allProducts.filter(product => {

      return (
        product.category_id === categoryId
      );

    });

  renderProducts(filtered);
}


/* =========================
   CART
========================= */

function getCart() {

  try {

    const cart =
      JSON.parse(
        localStorage.getItem("jrshop_cart")
      );

    return Array.isArray(cart)
      ? cart
      : [];

  } catch (error) {

    console.error(
      "Cart read error:",
      error
    );

    return [];
  }
}


function saveCart(cart) {

  localStorage.setItem(
    "jrshop_cart",
    JSON.stringify(cart)
  );

}


/* =========================
   ADD TO CART
========================= */

function addToCart(productId) {

  const product =
    allProducts.find(
      item => item.id === productId
    );

  if (!product) {
    console.error(
      "Product not found:",
      productId
    );

    return;
  }

  const cart = getCart();

  const existing =
    cart.find(
      item => item.id === productId
    );

  if (existing) {

    if (
      existing.quantity <
      Number(product.stock)
    ) {

      existing.quantity += 1;

    } else {

      alert(
        "Quantité maximale disponible atteinte."
      );

      return;
    }

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      price: Number(product.price),

      image_url:
        product.image_url || "",

      quantity: 1,

      stock:
        Number(product.stock)

    });

  }

  saveCart(cart);

  alert(
    "Produit ajouté au panier."
  );
}


/* =========================
   FORMAT PRICE
========================= */

function formatPrice(value) {

  const number =
    Number(value || 0);

  return (
    number.toLocaleString(
      "fr-DZ"
    ) + " DA"
  );
}


/* =========================
   HTML ESCAPE
========================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
