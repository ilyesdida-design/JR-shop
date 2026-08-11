let allProducts = [];
let selectedCategory = null;

const $ = (selector) => document.querySelector(selector);

/* =========================
   TOAST
========================= */

function toast(message) {
  const toastBox = document.querySelector("#toast");

  if (!toastBox) return;

  toastBox.textContent = message;
  toastBox.classList.add("show");

  setTimeout(() => {
    toastBox.classList.remove("show");
  }, 2500);
}

/* =========================
   CART
========================= */

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("jr_cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("jr_cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cartCount = document.querySelector("#cartCount");

  if (!cartCount) return;

  const cart = getCart();

  const count = cart.reduce(
    (total, item) => total + Number(item.qty || 0),
    0
  );

  cartCount.textContent = count;
}

/* =========================
   ADD TO CART
========================= */

function addToCart(product) {
  if (!product) return;

  const stock = Number(product.stock || 0);

  if (stock <= 0) {
    toast("Produit en rupture de stock");
    return;
  }

  const cart = getCart();

  const existingProduct = cart.find(
    (item) => String(item.id) === String(product.id)
  );

  if (existingProduct) {
    if (existingProduct.qty >= stock) {
      toast("Stock insuffisant");
      return;
    }

    existingProduct.qty++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price || 0),
      image_url: product.image_url || "",
      qty: 1,
      stock: stock
    });
  }

  saveCart(cart);

  toast("Produit ajouté au panier");
}

/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]
  );
}

/* =========================
   MONEY
========================= */

function money(value) {
  const number = Number(value || 0);

  return `${number.toLocaleString("fr-FR")} DA`;
}

/* =========================
   PRODUCT CARD
========================= */

function productCard(product) {
  const image =
    product.image_url ||
    "https://placehold.co/600x700?text=JR+Shop";

  const stock = Number(product.stock || 0);

  const stockText =
    stock > 0
      ? `Stock: ${stock}`
      : "Rupture de stock";

  return `
    <article class="product card">

      <img
        src="${escapeHtml(image)}"
        alt="${escapeHtml(product.name)}"
        loading="lazy"
      >

      <div class="product-body">

        <h3>
          ${escapeHtml(product.name)}
        </h3>

        <strong>
          ${money(product.price)}
        </strong>

        <small>
          ${stockText}
        </small>

        <button
          class="btn primary add"
          data-id="${escapeHtml(product.id)}"
          ${stock <= 0 ? "disabled" : ""}
        >
          ${stock > 0 ? "Ajouter au panier" : "Rupture de stock"}
        </button>

      </div>

    </article>
  `;
}

/* =========================
   LOAD CATEGORIES
========================= */

async function loadCategories() {
  const categoriesBox = document.querySelector("#categories");

  if (!categoriesBox) return;

  categoriesBox.innerHTML = `
    <p>Chargement des catégories...</p>
  `;

  try {
    const { data, error } = await supabaseClient
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Categories error:", error);

      categoriesBox.innerHTML = `
        <p>Impossible de charger les catégories.</p>
      `;

      return;
    }

    const categories = data || [];

    categoriesBox.innerHTML = `
      <button
        class="cat active"
        data-cat=""
      >
        <span>Toutes</span>
      </button>

      ${categories
        .map((category) => {
          const image =
            category.image_url ||
            "https://placehold.co/120x100?text=Cat";

          return `
            <button
              class="cat"
              data-cat="${escapeHtml(category.id)}"
            >

              <img
                src="${escapeHtml(image)}"
                alt="${escapeHtml(category.name)}"
                loading="lazy"
              >

              <span>
                ${escapeHtml(category.name)}
              </span>

            </button>
          `;
        })
        .join("")}
    `;

    document
      .querySelectorAll(".cat")
      .forEach((button) => {
        button.addEventListener("click", () => {
          selectedCategory = button.dataset.cat || null;

          document
            .querySelectorAll(".cat")
            .forEach((item) => {
              item.classList.remove("active");
            });

          button.classList.add("active");

          renderProducts();
        });
      });
  } catch (error) {
    console.error("Categories JavaScript error:", error);

    categoriesBox.innerHTML = `
      <p>Erreur lors du chargement des catégories.</p>
    `;
  }
}

/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {
  const productsBox = document.querySelector("#products");

  if (!productsBox) return;

  productsBox.innerHTML = `
    <p>Chargement des produits...</p>
  `;

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", {
        ascending: false
      });

    if (error) {
      console.error("Products error:", error);

      productsBox.innerHTML = `
        <p>
          Impossible de charger les produits.
        </p>
      `;

      return;
    }

    allProducts = data || [];

    renderProducts();
  } catch (error) {
    console.error("Products JavaScript error:", error);

    productsBox.innerHTML = `
      <p>
        Erreur lors du chargement des produits.
      </p>
    `;
  }
}

/* =========================
   RENDER PRODUCTS
========================= */

function renderProducts() {
  const productsBox = document.querySelector("#products");

  if (!productsBox) return;

  let products = [...allProducts];

  /* CATEGORY FILTER */

  if (selectedCategory) {
    products = products.filter(
      (product) =>
        String(product.category_id) ===
        String(selectedCategory)
    );
  }

  /* SORT */

  const sort = document.querySelector("#sort")?.value;

  if (sort === "priceAsc") {
    products.sort(
      (a, b) =>
        Number(a.price || 0) -
        Number(b.price || 0)
    );
  }

  if (sort === "priceDesc") {
    products.sort(
      (a, b) =>
        Number(b.price || 0) -
        Number(a.price || 0)
    );
  }

  /* EMPTY */

  if (!products.length) {
    productsBox.innerHTML = `
      <div class="card empty">
        <h3>Aucun produit trouvé</h3>
        <p>Cette catégorie ne contient aucun produit.</p>
      </div>
    `;

    return;
  }

  /* PRODUCTS */

  productsBox.innerHTML = products
    .map(productCard)
    .join("");

  /* ADD BUTTONS */

  document
    .querySelectorAll(".add")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const product = allProducts.find(
          (item) =>
            String(item.id) ===
            String(button.dataset.id)
        );

        addToCart(product);
      });
    });
}

/* =========================
   SORT
========================= */

const sortSelect = document.querySelector("#sort");

if (sortSelect) {
  sortSelect.addEventListener(
    "change",
    renderProducts
  );
}

/* =========================
   INITIALIZE
========================= */

updateCartCount();

loadCategories();

loadProducts();
