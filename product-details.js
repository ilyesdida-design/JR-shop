/* =========================================================
JR SHOP — PRODUCT DETAILS
Compatible avec :

* products
* product_variants
* jr_cart
* cart.js
  ========================================================= */

let product = null;
let variants = [];
let selectedVariant = null;
let selectedColor = null;
let selectedSize = null;
let quantity = 1;

const $ = (selector) =>
document.querySelector(selector);

/* =========================================================
TOAST
========================================================= */

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
ESCAPE HTML
========================================================= */

function escapeHtml(value) {

return String(value ?? "").replace(
/[&<>"']/g,
character => ({
"&": "&",
"<": "<",
">": ">",
'"': """,
"'": "'"
})[character]
);
}

/* =========================================================
MONEY
========================================================= */

function money(value) {

return (
new Intl.NumberFormat("fr-DZ").format(
Number(value || 0)
) + " DA"
);
}

/* =========================================================
CART COUNT
========================================================= */

function updateCartCount() {

const cartCount = $("#cartCount");

if (!cartCount) return;

try {

```
const cart = JSON.parse(
  localStorage.getItem("jr_cart") || "[]"
);

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

cartCount.textContent = count;
```

} catch (error) {

```
console.error(
  "Cart count error:",
  error
);

cartCount.textContent = "0";
```

}
}

/* =========================================================
GET PRODUCT ID
========================================================= */

function getProductId() {

const params =
new URLSearchParams(
window.location.search
);

return params.get("id");
}

/* =========================================================
LOAD PRODUCT
========================================================= */

async function loadProduct() {

const container =
$("#productContainer");

const productId =
getProductId();

if (!container) return;

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
    "Product error:",
    error
  );

  showError(
    "Impossible de charger ce produit."
  );

  return;
}


if (!data) {

  showError(
    "Produit introuvable."
  );

  return;
}


product = data;


await loadVariants();


renderProduct();
```

} catch (error) {

```
console.error(
  "Product loading error:",
  error
);

showError(
  "Une erreur est survenue."
);
```

}
}

/* =========================================================
LOAD VARIANTS
========================================================= */

async function loadVariants() {

if (!product?.id) return;

try {

```
const {
  data,
  error
} =
  await supabaseClient
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id);


if (error) {

  /*
    Si la table ou certaines colonnes
    ne sont pas encore utilisées,
    on garde le produit fonctionnel.
  */

  console.warn(
    "Variants not available:",
    error.message
  );

  variants = [];

  return;
}


variants = data || [];
```

} catch (error) {

```
console.warn(
  "Variants loading error:",
  error
);

variants = [];
```

}
}

/* =========================================================
IMAGE LIST
========================================================= */

function getProductImages() {

const images = [];

if (product?.image_url) {
images.push(product.image_url);
}

/*
Support de plusieurs formats
possibles pour les futures images.
*/

if (
Array.isArray(
product?.images
)
) {

```
product.images.forEach(image => {

  const url =
    typeof image === "string"
      ? image
      : image?.url ||
        image?.image_url;

  if (
    url &&
    !images.includes(url)
  ) {
    images.push(url);
  }

});
```

}

if (!images.length) {

```
images.push(
  "https://placehold.co/700x800?text=JR+Shop"
);
```

}

return images;
}

/* =========================================================
COLORS
========================================================= */

function getColors() {

return [
...new Set(
variants
.map(
variant =>
variant.color
)
.filter(Boolean)
)
];
}

/* =========================================================
SIZES
========================================================= */

function getSizes() {

return [
...new Set(
variants
.map(
variant =>
variant.size
)
.filter(Boolean)
)
];
}

/* =========================================================
FIND SELECTED VARIANT
========================================================= */

function findVariant() {

if (!variants.length) {

```
selectedVariant = null;

return;
```

}

let matches =
variants.filter(
variant => {

```
    const colorMatch =
      !selectedColor ||
      String(
        variant.color ?? ""
      ) === String(
        selectedColor
      );

    const sizeMatch =
      !selectedSize ||
      String(
        variant.size ?? ""
      ) === String(
        selectedSize
      );

    return (
      colorMatch &&
      sizeMatch
    );
  }
);
```

selectedVariant =
matches.length
? matches[0]
: null;
}

/* =========================================================
CURRENT STOCK
========================================================= */

function getCurrentStock() {

if (selectedVariant) {

```
return Number(
  selectedVariant.stock || 0
);
```

}

return Number(
product?.stock || 0
);
}

/* =========================================================
CURRENT PRICE
========================================================= */

function getCurrentPrice() {

if (
selectedVariant &&
selectedVariant.price != null
) {

```
return Number(
  selectedVariant.price
);
```

}

return Number(
product?.price || 0
);
}

/* =========================================================
CURRENT OLD PRICE
========================================================= */

function getCurrentOldPrice() {

if (
selectedVariant &&
selectedVariant.old_price != null
) {

```
return Number(
  selectedVariant.old_price
);
```

}

return Number(
product?.old_price || 0
);
}

/* =========================================================
RENDER PRODUCT
========================================================= */

function renderProduct() {

const container =
$("#productContainer");

if (!container || !product) {
return;
}

const images =
getProductImages();

const colors =
getColors();

const sizes =
getSizes();

if (
colors.length &&
!selectedColor
) {
selectedColor =
colors[0];
}

if (
sizes.length &&
!selectedSize
) {
selectedSize =
sizes[0];
}

findVariant();

const price =
getCurrentPrice();

const oldPrice =
getCurrentOldPrice();

const stock =
getCurrentStock();

container.innerHTML = `

```
<section class="product-details">

  <!-- GALLERY -->

  <div class="product-gallery">

    <div class="main-image-wrap">

      <img
        id="mainProductImage"
        src="${escapeHtml(images[0])}"
        alt="${escapeHtml(product.name)}"
      >

    </div>


    <div class="thumbs">

      ${images.map((image, index) => `

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
            loading="lazy"
          >

        </button>

      `).join("")}

    </div>

  </div>


  <!-- INFO -->

  <div class="product-info">

    <h1>
      ${escapeHtml(product.name)}
    </h1>


    <div class="price-box">

      <strong
        id="productPrice"
        class="current-price"
      >
        ${money(price)}
      </strong>

      ${
        oldPrice > price
          ? `
            <span
              id="productOldPrice"
              class="old-price"
            >
              ${money(oldPrice)}
            </span>
          `
          : ""
      }

    </div>


    <div
      id="stockText"
      class="stock ${
        stock > 0
          ? "ok"
          : "out"
      }"
    >

      ${
        stock > 0
          ? `Stock disponible : ${stock}`
          : "Rupture de stock"
      }

    </div>


    <!-- COLORS -->

    ${
      colors.length
        ? `

          <div class="option-group">

            <h3>
              Couleur
            </h3>

            <div
              id="colors"
              class="options"
            >

              ${colors.map(color => `

                <button
                  type="button"
                  class="option-btn ${
                    String(color) ===
                    String(selectedColor)
                      ? "active"
                      : ""
                  }"
                  data-color="${escapeHtml(color)}"
                >
                  ${escapeHtml(color)}
                </button>

              `).join("")}

            </div>

          </div>

        `
        : ""
    }


    <!-- SIZES -->

    ${
      sizes.length
        ? `

          <div class="option-group">

            <h3>
              Taille
            </h3>

            <div
              id="sizes"
              class="options"
            >

              ${sizes.map(size => `

                <button
                  type="button"
                  class="option-btn ${
                    String(size) ===
                    String(selectedSize)
                      ? "active"
                      : ""
                  }"
                  data-size="${escapeHtml(size)}"
                >
                  ${escapeHtml(size)}
                </button>

              `).join("")}

            </div>

          </div>

        `
        : ""
    }


    <!-- QUANTITY -->

    <div class="quantity-box">

      <button
        type="button"
        id="minusBtn"
      >
        −
      </button>


      <span id="quantity">
        1
      </span>


      <button
        type="button"
        id="plusBtn"
      >
        +
      </button>

    </div>


    <!-- ACTIONS -->

    <div class="actions">

      <button
        type="button"
        id="addToCartBtn"
        class="btn primary"
        ${stock <= 0 ? "disabled" : ""}
      >
        ${
          stock > 0
            ? "Ajouter au panier"
            : "Rupture de stock"
        }
      </button>


      <button
        type="button"
        id="buyNowBtn"
        class="btn"
        ${stock <= 0 ? "disabled" : ""}
      >
        Acheter maintenant
      </button>

    </div>


    <!-- DESCRIPTION -->

    ${
      product.description
        ? `

          <div class="description">

            <h2>
              Description
            </h2>

            <p>
              ${escapeHtml(
                product.description
              )}
            </p>

          </div>

        `
        : ""
    }

  </div>

</section>
```

`;

bindProductEvents();
}

/* =========================================================
UPDATE PRODUCT UI
========================================================= */

function updateProductUI() {

findVariant();

const price =
getCurrentPrice();

const oldPrice =
getCurrentOldPrice();

const stock =
getCurrentStock();

const priceBox =
$("#productPrice");

if (priceBox) {
priceBox.textContent =
money(price);
}

const oldPriceBox =
$("#productOldPrice");

if (oldPriceBox) {

```
if (oldPrice > price) {

  oldPriceBox.textContent =
    money(oldPrice);

  oldPriceBox.style.display =
    "";

} else {

  oldPriceBox.style.display =
    "none";
}
```

}

const stockText =
$("#stockText");

if (stockText) {

```
stockText.className =
  "stock " +
  (
    stock > 0
      ? "ok"
      : "out"
  );

stockText.textContent =
  stock > 0
    ? `Stock disponible : ${stock}`
    : "Rupture de stock";
```

}

quantity =
Math.min(
quantity,
Math.max(
stock,
1
)
);

if (quantity < 1) {
quantity = 1;
}

const quantityBox =
$("#quantity");

if (quantityBox) {
quantityBox.textContent =
quantity;
}

const addButton =
$("#addToCartBtn");

const buyButton =
$("#buyNowBtn");

if (addButton) {

```
addButton.disabled =
  stock <= 0;

addButton.textContent =
  stock > 0
    ? "Ajouter au panier"
    : "Rupture de stock";
```

}

if (buyButton) {

```
buyButton.disabled =
  stock <= 0;
```

}
}

/* =========================================================
EVENTS
========================================================= */

function bindProductEvents() {

/* IMAGES */

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
        $("#mainProductImage");

      if (main) {
        main.src = image;
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

/* COLORS */

document
.querySelectorAll(
"[data-color]"
)
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


      quantity = 1;

      updateProductUI();
    }
  );
});
```

/* SIZES */

document
.querySelectorAll(
"[data-size]"
)
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


      quantity = 1;

      updateProductUI();
    }
  );
});
```

/* MINUS */

const minus =
$("#minusBtn");

if (minus) {

```
minus.addEventListener(
  "click",
  () => {

    quantity =
      Math.max(
        1,
        quantity - 1
      );

    updateProductUI();
  }
);
```

}

/* PLUS */

const plus =
$("#plusBtn");

if (plus) {

```
plus.addEventListener(
  "click",
  () => {

    const stock =
      getCurrentStock();

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

    updateProductUI();
  }
);
```

}

/* ADD TO CART */

const addButton =
$("#addToCartBtn");

if (addButton) {

```
addButton.addEventListener(
  "click",
  () => {

    addProductToCart(
      false
    );
  }
);
```

}

/* BUY NOW */

const buyButton =
$("#buyNowBtn");

if (buyButton) {

```
buyButton.addEventListener(
  "click",
  () => {

    addProductToCart(
      true
    );
  }
);
```

}
}

/* =========================================================
ADD PRODUCT TO CART
========================================================= */

function addProductToCart(
goToCheckout
) {

if (!product) return;

findVariant();

const stock =
getCurrentStock();

if (stock <= 0) {

```
toast(
  "Produit en rupture de stock"
);

return;
```

}

if (
quantity > stock
) {

```
toast(
  "Stock insuffisant"
);

return;
```

}

/*
Structure compatible avec
cart.js actuel.
*/

const cart =
getCart();

const productId =
product.id;

const variantId =
selectedVariant?.id ||
null;

const itemKey =
String(productId) +
"_" +
String(
variantId ||
"no-variant"
);

const existingIndex =
cart.findIndex(
item => {

```
    const existingProductId =
      item.product_id ??
      item.id;

    const existingVariantId =
      item.variant_id ??
      null;

    const existingKey =
      String(
        existingProductId
      ) +
      "_" +
      String(
        existingVariantId ||
        "no-variant"
      );

    return (
      existingKey ===
      itemKey
    );
  }
);
```

if (
existingIndex >= 0
) {

```
const existing =
  cart[existingIndex];


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


/*
  Nettoyage ancien format.
*/

delete existing.qty;
```

} else {

```
cart.push({

  product_id:
    productId,

  variant_id:
    variantId,

  name:
    product.name,

  price:
    getCurrentPrice(),

  old_price:
    getCurrentOldPrice(),

  image_url:
    product.image_url ||
    "",

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

localStorage.setItem(
"jr_cart",
JSON.stringify(cart)
);

updateCartCount();

if (goToCheckout) {

```
window.location.href =
  "cart.html";

return;
```

}

toast(
"Produit ajouté au panier ✅"
);
}

/* =========================================================
CART READER
========================================================= */

function getCart() {

try {

```
const cart =
  JSON.parse(
    localStorage.getItem(
      "jr_cart"
    ) || "[]"
  );

return Array.isArray(cart)
  ? cart
  : [];
```

} catch (error) {

```
console.error(
  "Cart read error:",
  error
);

return [];
```

}
}

/* =========================================================
ERROR
========================================================= */

function showError(message) {

const container =
$("#productContainer");

if (!container) return;

container.innerHTML = `

```
<div class="card error-box">

  <h2>
    ${escapeHtml(message)}
  </h2>

  <p>
    Le produit demandé n'est pas disponible.
  </p>

  <a
    href="index.html"
    class="btn primary"
  >
    Retour aux produits
  </a>

</div>
```

`;
}

/* =========================================================
INITIALIZE
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
