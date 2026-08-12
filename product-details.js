const $ = (selector) => document.querySelector(selector);

/* =========================
TOAST
========================= */

function toast(message) {
const box = $("#toast");

if (!box) return;

box.textContent = message;
box.classList.add("show");

setTimeout(() => {
box.classList.remove("show");
}, 2500);
}

/* =========================
CART
========================= */

function getCart() {
try {
return JSON.parse(
localStorage.getItem("jr_cart") || "[]"
);
} catch (error) {
console.error("Cart error:", error);
return [];
}
}

function saveCart(cart) {
localStorage.setItem(
"jr_cart",
JSON.stringify(cart)
);

updateCartCount();
}

function updateCartCount() {
const countBox = $("#cartCount");

if (!countBox) return;

const cart = getCart();

const count = cart.reduce(
(total, item) =>
total + Number(item.qty || 0),
0
);

countBox.textContent = count;
}

/* =========================
MONEY
========================= */

function money(value) {
return (
new Intl.NumberFormat("fr-DZ")
.format(Number(value || 0)) + " DA"
);
}

/* =========================
ESCAPE HTML
========================= */

function escapeHtml(value) {
return String(value ?? "").replace(
/[&<>"']/g,
(character) => ({
"&": "&",
"<": "<",
">": ">",
'"': """,
"'": "'"
})[character]
);
}

/* =========================
GET PRODUCT ID
========================= */

function getProductId() {
const params =
new URLSearchParams(
window.location.search
);

return params.get("id");
}

/* =========================
ADD TO CART
========================= */

function addProductToCart(product, quantity) {
if (!product) return;

const stock =
Number(product.stock || 0);

if (stock <= 0) {
toast("Produit en rupture de stock");
return;
}

quantity =
Math.floor(Number(quantity || 1));

if (quantity < 1) {
quantity = 1;
}

if (quantity > stock) {
toast("Stock insuffisant");
return;
}

const cart = getCart();

const existing =
cart.find(
(item) =>
String(item.id) ===
String(product.id)
);

if (existing) {

```
const newQuantity =
  Number(existing.qty || 0) +
  quantity;

if (newQuantity > stock) {
  toast("Stock insuffisant");
  return;
}

existing.qty = newQuantity;
```

} else {

```
cart.push({
  id: product.id,

  name: product.name,

  price:
    Number(product.price || 0),

  image_url:
    product.image_url ||
    product.image ||
    "",

  qty: quantity,

  stock: stock
});
```

}

saveCart(cart);

toast(
"Produit ajouté au panier ✅"
);
}

/* =========================
RENDER PRODUCT
========================= */

function renderProduct(product) {

const container =
$("#productContainer");

if (!container) return;

const image =
product.image_url ||
product.image ||
"https://placehold.co/800x800?text=JR+Shop";

const stock =
Number(product.stock || 0);

const oldPrice =
Number(product.old_price || 0);

container.innerHTML = `

```
<div class="product-details">

  <!-- IMAGE -->

  <div class="product-gallery">

    <img
      class="product-main-image"
      src="${escapeHtml(image)}"
      alt="${escapeHtml(product.name)}"
    >

  </div>


  <!-- INFO -->

  <div class="product-info">

    <a
      href="index.html"
      class="back-link"
    >
      ← Retour aux produits
    </a>


    <h1>
      ${escapeHtml(product.name)}
    </h1>


    <div class="product-price">

      ${money(product.price)}

      ${
        oldPrice > Number(product.price || 0)
          ? `
            <span class="product-old-price">
              ${money(oldPrice)}
            </span>
          `
          : ""
      }

    </div>


    <div class="product-stock">

      ${
        stock > 0
          ? `Disponible — ${stock} en stock`
          : "Rupture de stock"
      }

    </div>


    ${
      product.description
        ? `
          <div class="product-description">
            ${escapeHtml(product.description)}
          </div>
        `
        : `
          <div class="product-description">
            Découvrez ce produit JR Shop.
          </div>
        `
    }


    ${
      stock > 0
        ? `

          <div class="quantity-box">

            <button
              type="button"
              id="minusBtn"
            >
              −
            </button>


            <input
              id="quantity"
              type="number"
              min="1"
              max="${stock}"
              value="1"
            >


            <button
              type="button"
              id="plusBtn"
            >
              +
            </button>

          </div>


          <div class="buy-actions">

            <button
              type="button"
              class="btn primary"
              id="addToCartBtn"
            >
              Ajouter au panier
            </button>


            <button
              type="button"
              class="btn"
              id="buyNowBtn"
            >
              Acheter maintenant
            </button>

          </div>

        `
        : `

          <button
            type="button"
            class="btn"
            disabled
          >
            Rupture de stock
          </button>

        `
    }

  </div>

</div>
```

`;

if (stock <= 0) return;

const quantityInput =
$("#quantity");

const minusBtn =
$("#minusBtn");

const plusBtn =
$("#plusBtn");

const addBtn =
$("#addToCartBtn");

const buyBtn =
$("#buyNowBtn");

function getQuantity() {

```
let quantity =
  Number(
    quantityInput.value
  );

if (!Number.isFinite(quantity)) {
  quantity = 1;
}

quantity =
  Math.floor(quantity);

if (quantity < 1) {
  quantity = 1;
}

if (quantity > stock) {
  quantity = stock;
}

quantityInput.value =
  quantity;

return quantity;
```

}

minusBtn.addEventListener(
"click",
() => {

```
  let quantity =
    getQuantity();

  quantity--;

  if (quantity < 1) {
    quantity = 1;
  }

  quantityInput.value =
    quantity;
}
```

);

plusBtn.addEventListener(
"click",
() => {

```
  let quantity =
    getQuantity();

  quantity++;

  if (quantity > stock) {
    quantity = stock;
    toast("Stock maximum atteint");
  }

  quantityInput.value =
    quantity;
}
```

);

quantityInput.addEventListener(
"change",
getQuantity
);

addBtn.addEventListener(
"click",
() => {

```
  const quantity =
    getQuantity();

  addProductToCart(
    product,
    quantity
  );

}
```

);

buyBtn.addEventListener(
"click",
() => {

```
  const quantity =
    getQuantity();

  const cart =
    getCart();

  const existing =
    cart.find(
      (item) =>
        String(item.id) ===
        String(product.id)
    );

  if (existing) {

    const newQuantity =
      Number(existing.qty || 0) +
      quantity;

    if (newQuantity > stock) {
      toast("Stock insuffisant");
      return;
    }

    existing.qty =
      newQuantity;

  } else {

    cart.push({
      id: product.id,

      name: product.name,

      price:
        Number(product.price || 0),

      image_url:
        product.image_url ||
        product.image ||
        "",

      qty: quantity,

      stock: stock
    });

  }

  saveCart(cart);

  window.location.href =
    "cart.html";

}
```

);
}

/* =========================
LOAD PRODUCT
========================= */

async function loadProduct() {

const container =
$("#productContainer");

if (!container) return;

const productId =
getProductId();

if (!productId) {

```
container.innerHTML = `

  <div class="card empty">

    <h2>
      Produit introuvable
    </h2>

    <p>
      Aucun identifiant de produit
      n'a été fourni.
    </p>

    <a
      href="index.html"
      class="btn primary"
    >
      Retour à la boutique
    </a>

  </div>

`;

return;
```

}

try {

```
const {
  data,
  error
} =
  await supabaseClient
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("is_active", true)
    .single();


if (error) {

  console.error(
    "Product Supabase error:",
    error
  );

  throw error;
}


if (!data) {

  throw new Error(
    "Product not found"
  );

}


renderProduct(data);
```

} catch (error) {

```
console.error(
  "Load product error:",
  error
);


container.innerHTML = `

  <div class="card empty">

    <h2>
      Impossible de charger le produit
    </h2>

    <p>
      Vérifiez l'identifiant du produit
      ou votre connexion Supabase.
    </p>

    <a
      href="index.html"
      class="btn primary"
    >
      Retour à la boutique
    </a>

  </div>

`;
```

}
}

/* =========================
START
========================= */

document.addEventListener(
"DOMContentLoaded",
() => {

```
updateCartCount();

loadProduct();
```

}
);
