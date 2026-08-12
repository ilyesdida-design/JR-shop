/* =========================================================
   JR SHOP — PRODUCT DETAILS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadProductDetails();
});


let currentProduct = null;


/* =========================
   LOAD PRODUCT
========================= */

async function loadProductDetails() {

  const container =
    document.getElementById("productDetails");

  if (!container) return;

  const params =
    new URLSearchParams(window.location.search);

  const productId =
    params.get("id");

  if (!productId) {

    showProductError(
      "Produit introuvable."
    );

    return;
  }


  const { data, error } =
    await supabaseClient
      .from("products")
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq("id", productId)
      .eq("active", true)
      .single();


  if (error) {

    console.error(
      "Product details error:",
      error
    );

    showProductError(
      "Impossible de charger ce produit."
    );

    return;
  }


  if (!data) {

    showProductError(
      "Produit introuvable."
    );

    return;
  }


  currentProduct = data;

  renderProduct(data);
}


/* =========================
   RENDER PRODUCT
========================= */

function renderProduct(product) {

  const container =
    document.getElementById("productDetails");

  if (!container) return;


  const images =
    getProductImages(product);


  const mainImage =
    images[0];


  const oldPrice =
    product.old_price &&
    Number(product.old_price) >
      Number(product.price)
      ? `
        <span class="old-price">
          ${formatPrice(product.old_price)}
        </span>
      `
      : "";


  const saleBadge =
    product.old_price &&
    Number(product.old_price) >
      Number(product.price)
      ? `
        <span class="badge badge-sale">
          Promo
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


  const stock =
    Number(product.stock || 0);


  const stockText =
    stock > 0
      ? `
        <span class="badge badge-stock">
          ${stock} disponible(s)
        </span>
      `
      : `
        <span class="badge badge-sale">
          Rupture de stock
        </span>
      `;


  const addButton =
    stock > 0
      ? `
        <button
          id="addToCartButton"
          class="btn btn-primary"
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


  container.className =
    "product-details-grid";


  container.innerHTML = `

    <!-- =========================
         IMAGES
    ========================== -->

    <div>

      <div
        class="product-main-image"
        style="position: relative;"
      >

        ${saleBadge}
        ${featuredBadge}

        <img
          id="mainProductImage"
          src="${escapeHTML(mainImage)}"
          alt="${escapeHTML(product.name)}"
        >

      </div>


      ${
        images.length > 1
          ? `
            <div
              class="product-gallery"
              id="productGallery"
            >

              ${images
                .map(
                  (image, index) => `
                    <button
                      type="button"
                      class="gallery-thumb"
                      data-image="${escapeHTML(image)}"
                      aria-label="Image ${index + 1}"
                    >

                      <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(product.name)}"
                        loading="lazy"
                      >

                    </button>
                  `
                )
                .join("")}

            </div>
          `
          : ""
      }

    </div>


    <!-- =========================
         INFO
    ========================== -->

    <div class="product-details-info">

      ${
        product.categories
          ? `
            <p class="section-subtitle">
              ${escapeHTML(product.categories.name)}
            </p>
          `
          : ""
      }


      <h1>
        ${escapeHTML(product.name)}
      </h1>


      ${stockText}


      <div class="product-details-price">

        ${formatPrice(product.price)}

        ${oldPrice}

      </div>


      ${
        product.description
          ? `
            <p class="product-description">
              ${escapeHTML(product.description)}
            </p>
          `
          : `
            <p class="product-description">
              Aucun détail supplémentaire disponible
              pour ce produit.
            </p>
          `
      }


      <!-- QUANTITY -->

      ${
        stock > 0
          ? `
            <div
              class="form-group"
              style="margin-top: 25px;"
            >

              <label for="quantity">
                Quantité
              </label>

              <div
                class="quantity-control"
              >

                <button
                  type="button"
                  id="decreaseQuantity"
                >
                  −
                </button>

                <span id="quantity">
                  1
                </span>

                <button
                  type="button"
                  id="increaseQuantity"
                >
                  +
                </button>

              </div>

            </div>
          `
          : ""
      }


      <div
        class="product-actions"
        style="margin-top: 20px;"
      >

        ${addButton}

        <a
          href="cart.html"
          class="btn btn-outline"
        >
          Voir le panier
        </a>

      </div>

    </div>

  `;


  setupGallery();

  setupQuantity();

  setupAddToCart();
}


/* =========================
   PRODUCT IMAGES
========================= */

function getProductImages(product) {

  let images = [];


  if (
    Array.isArray(product.images)
  ) {

    images =
      product.images.filter(
        image =>
          typeof image === "string" &&
          image.trim() !== ""
      );

  }


  if (
    images.length === 0 &&
    product.image_url
  ) {

    images = [
      product.image_url
    ];

  }


  if (images.length === 0) {

    images = [
      "https://placehold.co/800x800?text=JR+Shop"
    ];

  }


  return [
    ...new Set(images)
  ];
}


/* =========================
   GALLERY
========================= */

function setupGallery() {

  const mainImage =
    document.getElementById(
      "mainProductImage"
    );


  const thumbnails =
    document.querySelectorAll(
      ".gallery-thumb"
    );


  if (!mainImage) return;


  thumbnails.forEach(
    thumbnail => {

      thumbnail.addEventListener(
        "click",
        () => {

          const image =
            thumbnail.dataset.image;

          if (!image) return;

          mainImage.src = image;

        }
      );

    }
  );
}


/* =========================
   QUANTITY
========================= */

function setupQuantity() {

  const quantityElement =
    document.getElementById(
      "quantity"
    );


  const decreaseButton =
    document.getElementById(
      "decreaseQuantity"
    );


  const increaseButton =
    document.getElementById(
      "increaseQuantity"
    );


  if (
    !quantityElement ||
    !decreaseButton ||
    !increaseButton ||
    !currentProduct
  ) {
    return;
  }


  let quantity = 1;


  decreaseButton.addEventListener(
    "click",
    () => {

      if (quantity > 1) {
        quantity -= 1;
        quantityElement.textContent =
          quantity;
      }

    }
  );


  increaseButton.addEventListener(
    "click",
    () => {

      const stock =
        Number(
          currentProduct.stock || 0
        );


      if (quantity < stock) {

        quantity += 1;

        quantityElement.textContent =
          quantity;

      }

    }
  );
}


/* =========================
   ADD TO CART
========================= */

function setupAddToCart() {

  const button =
    document.getElementById(
      "addToCartButton"
    );


  if (!button) return;


  button.addEventListener(
    "click",
    () => {

      if (!currentProduct) return;


      const quantityElement =
        document.getElementById(
          "quantity"
        );


      const quantity =
        Number(
          quantityElement
            ? quantityElement.textContent
            : 1
        );


      addProductToCart(
        currentProduct,
        quantity
      );

    }
  );
}


/* =========================
   CART
========================= */

function getCart() {

  try {

    const cart =
      JSON.parse(
        localStorage.getItem(
          "jrshop_cart"
        )
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


function addProductToCart(
  product,
  quantity
) {

  const cart =
    getCart();


  const existing =
    cart.find(
      item =>
        item.id === product.id
    );


  const stock =
    Number(
      product.stock || 0
    );


  if (existing) {

    const newQuantity =
      existing.quantity +
      quantity;


    if (newQuantity > stock) {

      alert(
        "La quantité demandée dépasse le stock disponible."
      );

      return;
    }


    existing.quantity =
      newQuantity;

  } else {

    if (quantity > stock) {

      alert(
        "La quantité demandée dépasse le stock disponible."
      );

      return;
    }


    cart.push({

      id:
        product.id,

      name:
        product.name,

      price:
        Number(product.price),

      image_url:
        product.image_url || "",

      quantity:
        quantity,

      stock:
        stock

    });

  }


  saveCart(cart);


  alert(
    "Produit ajouté au panier."
  );
}


/* =========================
   ERROR
========================= */

function showProductError(message) {

  const container =
    document.getElementById(
      "productDetails"
    );


  if (!container) return;


  container.className =
    "empty-state";


  container.innerHTML = `

    <h2>
      Produit introuvable
    </h2>

    <p>
      ${escapeHTML(message)}
    </p>

    <br>

    <a
      href="index.html"
      class="btn btn-primary"
    >
      Retour aux produits
    </a>

  `;
}


/* =========================
   FORMAT PRICE
========================= */

function formatPrice(value) {

  return (
    Number(value || 0)
      .toLocaleString("fr-DZ")
    + " DA"
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
