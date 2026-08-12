/* =========================================================
JR SHOP — PRODUCT DETAILS
========================================================= */

let product = null;
let variants = [];

let selectedColor = null;
let selectedSize = null;
let selectedVariant = null;
let quantity = 1;

/* =========================================================
HELPERS
========================================================= */

const $ = selector =>
document.querySelector(selector);

function escapeHtml(value) {

return String(value ?? "").replace(
/[&<>"']/g,
char => ({
"&": "&",
"<": "<",
">": ">",
'"': """,
"'": "'"
})[char]
);
}

function money(value) {

return (
new Intl.NumberFormat("fr-DZ")
.format(Number(value || 0)) +
" DA"
);
}

function toast(message) {

const box = $("#toast");

if (!box) return;

box.textContent = message;

box.classList.add("show");

setTimeout(() => {
box.classList.remove("show");
}, 2500);
}

/* =========================================================
CART
========================================================= */

function getCart() {

try {

```
const cart = JSON.parse(
  localStorage.getItem("jr_cart") || "[]"
);

return Array.isArray(cart)
  ? cart
  : [];
```

} catch {

```
return [];
```

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

const box = $("#cartCount");

if (!box) return;

const cart = getCart();

const count = cart.reduce(
(total, item) =>
total +
Number(
item.quantity ??
item.qty ??
0
),
0
);

box.textContent = count;
}

/* =========================================================
PRODUCT ID
========================================================= */

function getProductId() {

const params =
new URLSearchParams(
window.location.search
);

return params.get("id");
}

/* =========================================================
IMAGE
========================================================= */

function getImage(item) {

return (
item?.image_url ||
item?.image ||
"https://placehold.co/800x1000?text=JR+Shop"
);
}

/* =========================================================
LOAD PRODUCT
========================================================= */

async function loadProduct() {

const box =
$("#productDetails");

const productId =
getProductId();

if (!productId) {

```
showError(
  "Produit introuvable."
);

return;
```

}

try {

```
const result =
  await supabaseClient
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();


if (result.error) {
  throw result.error;
}


if (!result.data) {

  showError(
    "Ce produit n'existe pas."
  );

  return;
}


product =
  result.data;


const variantsResult =
  await supabaseClient
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id);


if (!variantsResult.error) {

  variants =
    variantsResult.data || [];

} else {

  variants = [];

  console.warn(
    "Variants:",
    variantsResult.error
  );
}


renderProduct();
```

} catch (error) {

```
console.error(
  "Product error:",
  error
);

showError(
  "Impossible de charger le produit."
);
```

}
}

/* =========================================================
ERROR
========================================================= */

function showError(message) {

const box =
$("#productDetails");

if (!box) return;

box.innerHTML = `

```
<div class="error">

  <h2>
    ${escapeHtml(message)}
  </h2>

  <a
    class="btn primary"
    href="index.html"
  >
    Retour aux produits
  </a>

</div>
```

`;
}

/* =========================================================
RENDER PRODUCT
========================================================= */

function renderProduct() {

const box =
$("#productDetails");

if (!box || !product) return;

const mainImage =
getImage(product);

const oldPrice =
Number(product.old_price || 0);

const currentPrice =
Number(product.price || 0);

const discount =
oldPrice > currentPrice &&
oldPrice > 0
? Math.round(
((oldPrice - currentPrice) /
oldPrice) *
100
)
: 0;

const colors = [
...new Set(
variants
.map(v => v.color)
.filter(Boolean)
)
];

const sizes = [
...new Set(
variants
.map(v => v.size)
.filter(Boolean)
)
];

const images = [
product.image_url,
product.image_2,
product.image_3,
product.image_4
].filter(Boolean);

if (!images.length) {
images.push(mainImage);
}

box.innerHTML = `

```
<div class="product-layout">

  <!-- GALLERY -->

  <div class="gallery">

    <div class="thumbs" id="thumbs">

      ${images.map(
        (image, index) => `

          <button
            type="button"
            class="thumb ${
              index === 0
                ? "active"
                : ""
            }"
            data-image="${escapeHtml(image)}"
          >

            <img
              src="${escapeHtml(image)}"
              alt="${escapeHtml(product.name)}"
            >

          </button>

        `
      ).join("")}

    </div>


    <div class="main-image-box">

      <img
        id="mainImage"
        class="main-image"
        src="${escapeHtml(mainImage)}"
        alt="${escapeHtml(product.name)}"
      >

    </div>

  </div>


  <!-- PRODUCT INFO -->

  <div class="product-info">

    <div class="product-brand">
      JR SHOP
    </div>


    <h1 class="product-name">
      ${escapeHtml(product.name)}
    </h1>


    <div class="price-line">

      <strong class="price">
        ${money(currentPrice)}
      </strong>

      ${
        oldPrice > currentPrice
          ? `
            <span class="old-price">
              ${money(oldPrice)}
            </span>

            <span class="sale">
              -${discount}%
            </span>
          `
          : ""
      }

    </div>


    <div class="rating">
      <span>★★★★★</span>
      <span> Aucun avis</span>
    </div>


    ${
      colors.length
        ? `

          <div class="option-section">

            <div class="option-header">

              <strong>
                Couleur :
                <span id="selectedColorLabel">
                  Choisissez
                </span>
              </strong>

            </div>


            <div class="options">

              ${colors.map(
                color => `

                  <button
                    type="button"
                    class="option color-option"
                    data-color="${escapeHtml(color)}"
                  >
                    ${escapeHtml(color)}
                  </button>

                `
              ).join("")}

            </div>

          </div>

        `
        : ""
    }


    ${
      sizes.length
        ? `

          <div class="option-section">

            <div class="option-header">

              <strong>
                Taille :
                <span id="selectedSizeLabel">
                  Choisissez
                </span>
              </strong>

              <button
                type="button"
                class="size-guide-btn"
                id="sizeGuideButton"
              >
                Guide des tailles
              </button>

            </div>


            <div class="options">

              ${sizes.map(
                size => `

                  <button
                    type="button"
                    class="option"
                    data-size="${escapeHtml(size)}"
                  >
                    ${escapeHtml(size)}
                  </button>

                `
              ).join("")}

            </div>

          </div>

        `
        : ""
    }


    <div class="stock" id="stockStatus">
      ${getAvailableStock() > 0
        ? "✓ Disponible"
        : "Rupture de stock"}
    </div>


    <div class="quantity">

      <button
        type="button"
        id="minus"
      >
        −
      </button>

      <input
        id="quantity"
        type="number"
        value="1"
        min="1"
      >

      <button
        type="button"
        id="plus"
      >
        +
      </button>

    </div>


    <div class="actions">

      <button
        type="button"
        id="addButton"
        class="action-btn add-btn"
      >
        Ajouter au panier
      </button>


      <button
        type="button"
        id="buyButton"
        class="action-btn buy-btn"
      >
        Acheter maintenant
      </button>

    </div>


    <div class="delivery-box">

      <div class="delivery-row">

        <span>🚚</span>

        <div>
          <strong>Livraison</strong>
          Livraison à domicile en Algérie.
        </div>

      </div>


      <div class="delivery-row">

        <span>↩️</span>

        <div>
          <strong>Retours</strong>
          Consultez notre politique de retour.
        </div>

      </div>


      <div class="delivery-row">

        <span>🔒</span>

        <div>
          <strong>Paiement</strong>
          Paiement sécurisé à la livraison.
        </div>

      </div>

    </div>

  </div>

</div>


<!-- DETAILS -->

<section class="details-section">

  <div class="details-block">

    <h2>
      Description
    </h2>

    <div class="description">

      ${escapeHtml(
        product.description ||
        product.details ||
        "Découvrez ce produit JR Shop."
      )}

    </div>

  </div>


  ${
    sizes.length
      ? `

        <div
          class="details-block"
          id="sizeGuide"
        >

          <h2>
            Guide des tailles
          </h2>


          <table class="size-table">

            <thead>

              <tr>
                <th>Taille</th>
                <th>Poitrine</th>
                <th>Taille</th>
                <th>Hanches</th>
              </tr>

            </thead>


            <tbody>

              <tr>
                <td>S</td>
                <td>88-92</td>
                <td>72-76</td>
                <td>90-94</td>
              </tr>

              <tr>
                <td>M</td>
                <td>92-96</td>
                <td>76-80</td>
                <td>94-98</td>
              </tr>

              <tr>
                <td>L</td>
                <td>96-100</td>
                <td>80-84</td>
                <td>98-102</td>
              </tr>

              <tr>
                <td>XL</td>
                <td>100-106</td>
                <td>84-90</td>
                <td>102-108</td>
              </tr>

            </tbody>

          </table>

        </div>

      `
      : ""
  }

</section>
```

`;

const breadcrumb =
$("#breadcrumbProduct");

if (breadcrumb) {
breadcrumb.textContent =
product.name;
}

setupGallery();

setupVariants();

setupQuantity();

setupActions();

updateProductState();
}

/* =========================================================
GALLERY
========================================================= */

function setupGallery() {

document
.querySelectorAll(".thumb")
.forEach(button => {

```
  button.addEventListener(
    "click",
    () => {

      const image =
        button.dataset.image;


      const main =
        $("#mainImage");


      if (main) {
        main.src =
          image;
      }


      document
        .querySelectorAll(".thumb")
        .forEach(item =>
          item.classList.remove(
            "active"
          )
        );


      button.classList.add(
        "active"
      );

    }
  );

});
```

}

/* =========================================================
VARIANTS
========================================================= */

function setupVariants() {

document
.querySelectorAll("[data-color]")
.forEach(button => {

```
  button.addEventListener(
    "click",
    () => {

      selectedColor =
        button.dataset.color;


      document
        .querySelectorAll(
          "[data-color]"
        )
        .forEach(item =>
          item.classList.remove(
            "active"
          )
        );


      button.classList.add(
        "active"
      );


      const label =
        $("#selectedColorLabel");


      if (label) {
        label.textContent =
          selectedColor;
      }


      updateProductState();
    }
  );

});
```

document
.querySelectorAll("[data-size]")
.forEach(button => {

```
  button.addEventListener(
    "click",
    () => {

      selectedSize =
        button.dataset.size;


      document
        .querySelectorAll(
          "[data-size]"
        )
        .forEach(item =>
          item.classList.remove(
            "active"
          )
        );


      button.classList.add(
        "active"
      );


      const label =
        $("#selectedSizeLabel");


      if (label) {
        label.textContent =
          selectedSize;
      }


      updateProductState();
    }
  );

});
```

$("#sizeGuideButton")
?.addEventListener(
"click",
() => {

```
    $("#sizeGuide")
      ?.scrollIntoView({
        behavior: "smooth"
      });

  }
);
```

}

/* =========================================================
SELECT VARIANT
========================================================= */

function findVariant() {

if (!variants.length) {
return null;
}

let matches =
[...variants];

if (selectedColor) {

```
matches =
  matches.filter(
    variant =>
      String(
        variant.color || ""
      ) ===
      String(
        selectedColor
      )
  );
```

}

if (selectedSize) {

```
matches =
  matches.filter(
    variant =>
      String(
        variant.size || ""
      ) ===
      String(
        selectedSize
      )
  );
```

}

return matches[0] || null;
}

/* =========================================================
STOCK
========================================================= */

function getAvailableStock() {

const variant =
findVariant();

if (variants.length) {

```
if (!variant) {
  return 0;
}


return Number(
  variant.stock || 0
);
```

}

return Number(
product?.stock || 0
);
}

/* =========================================================
PRODUCT STATE
========================================================= */

function updateProductState() {

const variant =
findVariant();

selectedVariant =
variant;

const stock =
getAvailableStock();

const stockBox =
$("#stockStatus");

const addButton =
$("#addButton");

const buyButton =
$("#buyButton");

const input =
$("#quantity");

if (variants.length && !variant) {

```
if (stockBox) {

  stockBox.textContent =
    "Choisissez la couleur et la taille";

  stockBox.className =
    "stock";

}


if (addButton) {
  addButton.disabled = true;
}


if (buyButton) {
  buyButton.disabled = true;
}


return;
```

}

if (stock <= 0) {

```
if (stockBox) {

  stockBox.textContent =
    "Rupture de stock";

  stockBox.className =
    "stock out";

}


if (addButton) {
  addButton.disabled = true;
}


if (buyButton) {
  buyButton.disabled = true;
}


return;
```

}

if (stock <= 5) {

```
if (stockBox) {

  stockBox.textContent =
    `✓ Plus que ${stock} disponible(s)`;

  stockBox.className =
    "stock ok";

}
```

} else {

```
if (stockBox) {

  stockBox.textContent =
    "✓ Disponible";

  stockBox.className =
    "stock ok";

}
```

}

if (addButton) {
addButton.disabled = false;
}

if (buyButton) {
buyButton.disabled = false;
}

if (input) {

```
input.max =
  stock;


if (
  Number(input.value) >
  stock
) {

  input.value =
    stock;

  quantity =
    stock;
}
```

}
}

/* =========================================================
QUANTITY
========================================================= */

function setupQuantity() {

const input =
$("#quantity");

$("#minus")
?.addEventListener(
"click",
() => {

```
    quantity =
      Math.max(
        1,
        quantity - 1
      );


    input.value =
      quantity;

  }
);
```

$("#plus")
?.addEventListener(
"click",
() => {

```
    const stock =
      getAvailableStock();


    if (
      stock > 0 &&
      quantity >= stock
    ) {

      toast(
        "Stock insuffisant"
      );

      return;
    }


    quantity++;


    input.value =
      quantity;

  }
);
```

input?.addEventListener(
"input",
() => {

```
  let value =
    Number(
      input.value || 1
    );


  if (value < 1) {
    value = 1;
  }


  const stock =
    getAvailableStock();


  if (
    stock > 0 &&
    value > stock
  ) {

    value =
      stock;
  }


  quantity =
    value;

  input.value =
    value;

}
```

);
}

/* =========================================================
ADD TO CART
========================================================= */

function addToCart() {

if (!product) return;

const stock =
getAvailableStock();

if (
variants.length &&
!selectedVariant
) {

```
toast(
  "Veuillez choisir une couleur et une taille"
);

return;
```

}

if (stock <= 0) {

```
toast(
  "Produit en rupture de stock"
);

return;
```

}

if (quantity > stock) {

```
toast(
  "Stock insuffisant"
);

return;
```

}

const price =
Number(
selectedVariant?.price ??
product.price ??
0
);

const variantId =
selectedVariant?.id ||
null;

const cart =
getCart();

const existing =
cart.find(
item =>

```
    String(
      item.product_id ??
      item.id
    ) ===
    String(product.id)

    &&

    String(
      item.variant_id || ""
    ) ===
    String(
      variantId || ""
    )
);
```

if (existing) {

```
const oldQuantity =
  Number(
    existing.quantity ??
    existing.qty ??
    0
  );


if (
  oldQuantity +
  quantity >
  stock
) {

  toast(
    "Stock insuffisant"
  );

  return;
}


existing.quantity =
  oldQuantity +
  quantity;


delete existing.qty;
```

} else {

```
cart.push({

  product_id:
    product.id,

  variant_id:
    variantId,

  name:
    product.name,

  price:
    price,

  old_price:
    Number(
      product.old_price || 0
    ),

  image_url:
    getImage(product),

  color:
    selectedVariant?.color ??
    selectedColor ??
    null,

  size:
    selectedVariant?.size ??
    selectedSize ??
    null,

  quantity:
    quantity,

  stock:
    stock

});
```

}

saveCart(cart);

toast(
"Produit ajouté au panier ✅"
);
}

/* =========================================================
BUY NOW
========================================================= */

function buyNow() {

const before =
getCart().length;

addToCart();

setTimeout(() => {

```
const cart =
  getCart();


if (
  cart.length >= before
) {

  window.location.href =
    "cart.html";
}
```

}, 250);
}

/* =========================================================
ACTIONS
========================================================= */

function setupActions() {

$("#addButton")
?.addEventListener(
"click",
addToCart
);

$("#buyButton")
?.addEventListener(
"click",
buyNow
);
}

/* =========================================================
START
========================================================= */

document.addEventListener(
"DOMContentLoaded",
() => {

```
updateCartCount();

loadProduct();
```

}
);
