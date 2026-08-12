/* =========================================================
   JR SHOP — CART
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
});


/* =========================
   CART STORAGE
========================= */

function getCart() {
  try {
    const cart = JSON.parse(
      localStorage.getItem("jrshop_cart")
    );

    return Array.isArray(cart) ? cart : [];

  } catch (error) {

    console.error("Cart error:", error);

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
   RENDER CART
========================= */

function renderCart() {

  const container =
    document.getElementById("cartContainer");

  if (!container) return;


  const cart = getCart();


  if (cart.length === 0) {

    container.className = "card";

    container.innerHTML = `

      <div class="empty-state">

        <h2>
          Votre panier est vide
        </h2>

        <p>
          Ajoutez des produits à votre panier
          pour continuer.
        </p>

        <br>

        <a
          href="index.html#products"
          class="btn btn-primary"
        >
          Découvrir les produits
        </a>

      </div>

    `;

    return;
  }


  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
        Number(item.quantity || 0),
      0
    );


  const itemsCount =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0),
      0
    );


  container.className =
    "cart-layout";


  container.innerHTML = `

    <!-- =========================
         ITEMS
    ========================== -->

    <div class="card">

      <div
        style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:15px;
          margin-bottom:10px;
        "
      >

        <h2>
          Produits
        </h2>

        <span class="section-subtitle">
          ${itemsCount} article(s)
        </span>

      </div>


      <div>

        ${cart
          .map(
            (item, index) =>
              createCartItem(
                item,
                index
              )
          )
          .join("")}

      </div>

    </div>


    <!-- =========================
         SUMMARY
    ========================== -->

    <aside class="card cart-summary">

      <h2>
        Résumé
      </h2>


      <div class="summary-row">

        <span>
          Articles
        </span>

        <strong>
          ${itemsCount}
        </strong>

      </div>


      <div class="summary-row">

        <span>
          Sous-total
        </span>

        <strong>
          ${formatPrice(total)}
        </strong>

      </div>


      <div class="summary-row">

        <span>
          Livraison
        </span>

        <strong>
          À confirmer
        </strong>

      </div>


      <div class="summary-row summary-total">

        <span>
          Total
        </span>

        <strong>
          ${formatPrice(total)}
        </strong>

      </div>


      <div
        style="
          display:grid;
          gap:10px;
          margin-top:20px;
        "
      >

        <a
          href="checkout.html"
          class="btn btn-primary"
        >
          Passer la commande
        </a>


        <a
          href="index.html#products"
          class="btn btn-outline"
        >
          Continuer les achats
        </a>


        <button
          type="button"
          id="clearCartButton"
          class="btn btn-danger"
        >
          Vider le panier
        </button>

      </div>

    </aside>

  `;


  attachCartEvents();
}


/* =========================
   CART ITEM
========================= */

function createCartItem(
  item,
  index
) {

  const image =
    item.image_url
      ? item.image_url
      : "https://placehold.co/300x300?text=JR+Shop";


  const price =
    Number(item.price || 0);


  const quantity =
    Number(item.quantity || 1);


  const itemTotal =
    price * quantity;


  return `

    <div
      class="cart-item"
      data-index="${index}"
    >

      <!-- IMAGE -->

      <div class="cart-item-image">

        <img
          src="${escapeHTML(image)}"
          alt="${escapeHTML(item.name)}"
          loading="lazy"
        >

      </div>


      <!-- INFO -->

      <div>

        <h3>
          ${escapeHTML(item.name)}
        </h3>


        <p class="section-subtitle">

          ${formatPrice(price)}

        </p>


        <div
          style="
            margin-top:10px;
            display:flex;
            align-items:center;
            gap:12px;
            flex-wrap:wrap;
          "
        >

          <div class="quantity-control">

            <button
              type="button"
              class="decrease-button"
              data-index="${index}"
            >
              −
            </button>

            <span>
              ${quantity}
            </span>

            <button
              type="button"
              class="increase-button"
              data-index="${index}"
            >
              +
            </button>

          </div>


          <button
            type="button"
            class="btn btn-outline remove-button"
            data-index="${index}"
            style="
              min-height:34px;
              padding:0 12px;
            "
          >
            Supprimer
          </button>

        </div>

      </div>


      <!-- TOTAL -->

      <strong>

        ${formatPrice(itemTotal)}

      </strong>

    </div>

  `;
}


/* =========================
   EVENTS
========================= */

function attachCartEvents() {

  document
    .querySelectorAll(".decrease-button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.index
            );

          updateQuantity(
            index,
            -1
          );

        }
      );

    });


  document
    .querySelectorAll(".increase-button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.index
            );

          updateQuantity(
            index,
            1
          );

        }
      );

    });


  document
    .querySelectorAll(".remove-button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.index
            );

          removeItem(index);

        }
      );

    });


  const clearButton =
    document.getElementById(
      "clearCartButton"
    );


  if (clearButton) {

    clearButton.addEventListener(
      "click",
      clearCart
    );

  }

}


/* =========================
   UPDATE QUANTITY
========================= */

function updateQuantity(
  index,
  change
) {

  const cart =
    getCart();


  const item =
    cart[index];


  if (!item) return;


  const currentQuantity =
    Number(item.quantity || 1);


  const newQuantity =
    currentQuantity + change;


  if (newQuantity <= 0) {

    cart.splice(index, 1);

    saveCart(cart);

    renderCart();

    return;
  }


  const stock =
    Number(item.stock || 0);


  if (
    stock > 0 &&
    newQuantity > stock
  ) {

    alert(
      "La quantité maximale disponible est de " +
      stock +
      "."
    );

    return;
  }


  item.quantity =
    newQuantity;


  saveCart(cart);

  renderCart();
}


/* =========================
   REMOVE ITEM
========================= */

function removeItem(index) {

  const cart =
    getCart();


  if (!cart[index]) return;


  cart.splice(
    index,
    1
  );


  saveCart(cart);

  renderCart();
}


/* =========================
   CLEAR CART
========================= */

function clearCart() {

  const cart =
    getCart();


  if (cart.length === 0) return;


  const confirmed =
    confirm(
      "Voulez-vous vraiment vider le panier ?"
    );


  if (!confirmed) return;


  localStorage.removeItem(
    "jrshop_cart"
  );


  renderCart();
}


/* =========================
   PRICE
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
