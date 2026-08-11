const $ = (selector) => document.querySelector(selector);

/* =========================
TOAST
========================= */

function toast(message) {

const toastBox = $("#toast");

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

```
return JSON.parse(
  localStorage.getItem("jr_cart") || "[]"
);
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

render();

}

/* =========================
COUNT
========================= */

function updateCartCount() {

const cartCount = $("#cartCount");

if (!cartCount) return;

const cart = getCart();

const count = cart.reduce(
(total, item) =>
total + Number(item.qty || 0),
0
);

cartCount.textContent = count;

}

/* =========================
MONEY
========================= */

function formatMoney(value) {

return (
new Intl.NumberFormat("fr-DZ")
.format(Number(value || 0))
+ " DA"
);

}

/* =========================
RENDER CART
========================= */

function render() {

const cartBox = $("#cart");

if (!cartBox) return;

const cart = getCart();

updateCartCount();

/* EMPTY CART */

if (!cart.length) {

```
cartBox.innerHTML = `

  <div class="card empty">

    <h2>
      Votre panier est vide
    </h2>

    <p>
      Ajoutez des produits pour commencer.
    </p>

    <a
      class="btn primary"
      href="index.html"
    >
      Continuer mes achats
    </a>

  </div>

`;

const checkout = $("#checkout");

if (checkout) {
  checkout.hidden = true;
}

return;
```

}

/* SHOW CHECKOUT */

const checkout = $("#checkout");

if (checkout) {
checkout.hidden = false;
}

/* CART ITEMS */

cartBox.innerHTML = cart
.map((item, index) => {

```
  const image =
    item.image_url ||
    "https://placehold.co/120x150?text=JR+Shop";


  const subtotal =
    Number(item.price || 0) *
    Number(item.qty || 0);


  return `

    <div class="cart-row card">

      <img
        src="${image}"
        alt="${escapeHtml(item.name)}"
      >


      <div>

        <h3>
          ${escapeHtml(item.name)}
        </h3>

        <p>
          ${formatMoney(item.price)}
        </p>


        <div class="qty">

          <button
            type="button"
            data-index="${index}"
            data-action="minus"
          >
            −
          </button>


          <b>
            ${item.qty}
          </b>


          <button
            type="button"
            data-index="${index}"
            data-action="plus"
          >
            +
          </button>


          <button
            type="button"
            class="remove"
            data-index="${index}"
            data-action="remove"
          >
            Supprimer
          </button>

        </div>

      </div>


      <strong>
        ${formatMoney(subtotal)}
      </strong>

    </div>

  `;

})
.join("");
```

/* TOTAL */

const total = cart.reduce(
(sum, item) =>
sum +
Number(item.price || 0) *
Number(item.qty || 0),
0
);

cartBox.innerHTML += `

```
<div class="total">

  <span>
    Total
  </span>

  <strong>
    ${formatMoney(total)}
  </strong>

</div>
```

`;

/* BUTTON EVENTS */

document
.querySelectorAll("[data-action]")
.forEach(button => {

```
  button.addEventListener(
    "click",
    () => {

      const index =
        Number(button.dataset.index);

      const action =
        button.dataset.action;

      changeQuantity(
        index,
        action
      );

    }
  );

});
```

}

/* =========================
CHANGE QUANTITY
========================= */

function changeQuantity(index, action) {

const cart = getCart();

if (!cart[index]) return;

/* MINUS */

if (action === "minus") {

```
cart[index].qty--;

if (cart[index].qty <= 0) {

  cart.splice(index, 1);

}
```

}

/* PLUS */

if (action === "plus") {

```
const stock =
  Number(cart[index].stock || 0);

if (
  stock > 0 &&
  cart[index].qty >= stock
) {

  toast("Stock insuffisant");

  return;

}

cart[index].qty++;
```

}

/* REMOVE */

if (action === "remove") {

```
cart.splice(index, 1);
```

}

saveCart(cart);

}

/* =========================
ESCAPE HTML
========================= */

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

/* =========================
CHECKOUT
========================= */

const orderForm = $("#orderForm");

if (orderForm) {

orderForm.addEventListener(
"submit",
async (event) => {

```
  event.preventDefault();


  const cart = getCart();


  if (!cart.length) {

    toast("Votre panier est vide");

    return;

  }


  const button =
    orderForm.querySelector(
      'button[type="submit"]'
    );


  if (button) {

    button.disabled = true;

    button.textContent =
      "Envoi de la commande...";

  }


  try {

    const formData =
      new FormData(orderForm);


    const customerName =
      String(
        formData.get("customer_name") || ""
      ).trim();


    const phone =
      String(
        formData.get("phone") || ""
      ).trim();


    const address =
      String(
        formData.get("address") || ""
      ).trim();


    const note =
      String(
        formData.get("note") || ""
      ).trim();


    if (
      !customerName ||
      !phone ||
      !address
    ) {

      toast(
        "Veuillez remplir les informations obligatoires"
      );

      return;

    }


    /* TOTAL */

    const total =
      cart.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) *
          Number(item.qty || 0),
        0
      );


    /* CREATE ORDER */

    const { data: order, error } =
      await supabaseClient
        .from("orders")
        .insert({

          customer_name:
            customerName,

          phone:
            phone,

          address:
            address,

          note:
            note || null,

          total:
            total,

          status:
            "new"

        })
        .select()
        .single();


    if (error) {

      console.error(
        "Order error:",
        error
      );

      throw error;

    }


    /* CREATE ORDER ITEMS */

    const items =
      cart.map(item => ({

        order_id:
          order.id,

        product_id:
          item.id,

        quantity:
          Number(item.qty),

        unit_price:
          Number(item.price)

      }));


    const { error: itemsError } =
      await supabaseClient
        .from("order_items")
        .insert(items);


    if (itemsError) {

      console.error(
        "Order items error:",
        itemsError
      );

      throw itemsError;

    }


    /* SUCCESS */

    localStorage.removeItem(
      "jr_cart"
    );


    orderForm.reset();


    render();


    toast(
      "Commande envoyée avec succès ✅"
    );


  } catch (error) {

    console.error(error);

    toast(
      "Erreur lors de la commande. Réessayez."
    );

  } finally {

    if (button) {

      button.disabled = false;

      button.textContent =
        "Confirmer la commande";

    }

  }

}
```

);

}

/* =========================
START
========================= */

render();
