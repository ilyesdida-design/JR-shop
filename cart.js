```javascript
/* =========================================================
   JR SHOP — CART.JS
   Compatible avec :
   - index.html
   - app.js
   - product-details.html
   - cart.html
   - checkout.html
   - localStorage : jr_cart
========================================================= */


/* =========================================================
   HELPERS
========================================================= */

const $ = (selector) =>
  document.querySelector(selector);


/* =========================================================
   TOAST
========================================================= */

function toast(message) {

  const toastBox =
    $("#toast");

  if (!toastBox) return;

  toastBox.textContent =
    message;

  toastBox.classList.add(
    "show"
  );


  setTimeout(() => {

    toastBox.classList.remove(
      "show"
    );

  }, 2500);
}


/* =========================================================
   CART
========================================================= */

function getCart() {

  try {

    const cart =
      JSON.parse(
        localStorage.getItem(
          "jr_cart"
        ) || "[]"
      );


    return Array.isArray(cart)
      ? cart
      : [];


  } catch (error) {

    console.error(
      "Cart error:",
      error
    );

    return [];

  }
}


function saveCart(cart) {

  localStorage.setItem(
    "jr_cart",
    JSON.stringify(cart)
  );


  render();
}


/* =========================================================
   NORMALIZE CART
========================================================= */

function normalizeCartItem(item) {

  if (!item) {
    return null;
  }


  return {

    product_id:
      item.product_id ??
      item.id ??
      null,


    variant_id:
      item.variant_id ??
      null,


    name:
      item.name ??
      "Produit",


    price:
      Number(
        item.price ?? 0
      ),


    old_price:
      Number(
        item.old_price ?? 0
      ),


    image_url:
      item.image_url ??
      item.image ??
      "",


    color:
      item.color ??
      null,


    size:
      item.size ??
      null,


    quantity:
      Math.max(
        1,
        Number(
          item.quantity ??
          item.qty ??
          1
        )
      ),


    stock:
      Number(
        item.stock ?? 0
      )

  };
}


function getNormalizedCart() {

  const cart =
    getCart();


  const normalized =
    cart
      .map(
        normalizeCartItem
      )
      .filter(
        item =>
          item &&
          item.product_id
      );


  /*
    On sauvegarde directement
    la nouvelle structure.
  */

  localStorage.setItem(
    "jr_cart",
    JSON.stringify(
      normalized
    )
  );


  return normalized;
}


/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {

  const cartCount =
    $("#cartCount");


  if (!cartCount) {
    return;
  }


  const cart =
    getNormalizedCart();


  const count =
    cart.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    );


  cartCount.textContent =
    count;
}


/* =========================================================
   MONEY
========================================================= */

function formatMoney(value) {

  return (

    new Intl.NumberFormat(
      "fr-DZ"
    ).format(
      Number(value || 0)
    ) +

    " DA"

  );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    character => ({

      "&":
        "&amp;",

      "<":
        "&lt;",

      ">":
        "&gt;",

      '"':
        "&quot;",

      "'":
        "&#039;"

    })[character]
  );
}


/* =========================================================
   ITEM KEY
   Important pour les variants
========================================================= */

function getItemKey(item) {

  return (

    String(
      item.product_id
    ) +

    "_" +

    String(
      item.variant_id ||
      "no-variant"
    )

  );
}


/* =========================================================
   RENDER CART
========================================================= */

function render() {

  const cartBox =
    $("#cart");


  if (!cartBox) {
    return;
  }


  const cart =
    getNormalizedCart();


  updateCartCount();


  /* =======================================================
     EMPTY
  ======================================================= */

  if (!cart.length) {

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


    const checkout =
      $("#checkout");


    if (checkout) {
      checkout.hidden = true;
    }


    return;
  }


  /* =======================================================
     SHOW CHECKOUT
  ======================================================= */

  const checkout =
    $("#checkout");


  if (checkout) {
    checkout.hidden = false;
  }


  /* =======================================================
     ITEMS
  ======================================================= */

  cartBox.innerHTML =
    cart
      .map(
        (item, index) => {

          const image =
            item.image_url ||
            "https://placehold.co/120x150?text=JR+Shop";


          const quantity =
            Number(
              item.quantity || 1
            );


          const subtotal =
            Number(
              item.price || 0
            ) *
            quantity;


          const variantInfo = [

            item.color
              ? `Couleur : ${escapeHtml(item.color)}`
              : "",

            item.size
              ? `Taille : ${escapeHtml(item.size)}`
              : ""

          ]
            .filter(Boolean)
            .join(" • ");


          return `

            <div
              class="cart-row card"
              data-index="${index}"
            >

              <img
                src="${escapeHtml(image)}"
                alt="${escapeHtml(
                  item.name
                )}"
                loading="lazy"
              >


              <div class="cart-item-info">

                <h3>
                  ${escapeHtml(
                    item.name
                  )}
                </h3>


                ${
                  variantInfo
                    ? `
                      <p class="cart-variant">
                        ${variantInfo}
                      </p>
                    `
                    : ""
                }


                <p>
                  ${formatMoney(
                    item.price
                  )}
                </p>


                <div class="qty">

                  <button
                    type="button"
                    data-index="${index}"
                    data-action="minus"
                    aria-label="Diminuer"
                  >
                    −
                  </button>


                  <b>
                    ${quantity}
                  </b>


                  <button
                    type="button"
                    data-index="${index}"
                    data-action="plus"
                    aria-label="Augmenter"
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


              <strong class="cart-subtotal">
                ${formatMoney(
                  subtotal
                )}
              </strong>

            </div>

          `;

        }
      )
      .join("");


  /* =======================================================
     TOTAL
  ======================================================= */

  const total =
    cart.reduce(
      (sum, item) =>

        sum +

        Number(
          item.price || 0
        ) *

        Number(
          item.quantity || 0
        ),

      0
    );


  cartBox.innerHTML += `

    <div class="total">

      <span>
        Total
      </span>


      <strong>
        ${formatMoney(
          total
        )}
      </strong>

    </div>

  `;


  /* =======================================================
     BUTTON EVENTS
  ======================================================= */

  document
    .querySelectorAll(
      "[data-action]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          function () {

            const index =
              Number(
                button.dataset.index
              );


            const action =
              button.dataset.action;


            changeQuantity(
              index,
              action
            );

          }
        );

      }
    );
}


/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeQuantity(
  index,
  action
) {

  const cart =
    getNormalizedCart();


  if (!cart[index]) {
    return;
  }


  const item =
    cart[index];


  let quantity =
    Number(
      item.quantity || 1
    );


  /* =======================================================
     MINUS
  ======================================================= */

  if (
    action === "minus"
  ) {

    quantity--;


    if (quantity <= 0) {

      cart.splice(
        index,
        1
      );

      saveCart(
        cart
      );

      return;
    }


    item.quantity =
      quantity;

  }


  /* =======================================================
     PLUS
  ======================================================= */

  if (
    action === "plus"
  ) {

    const stock =
      Number(
        item.stock || 0
      );


    if (
      stock > 0 &&
      quantity >= stock
    ) {

      toast(
        "Stock insuffisant"
      );

      return;
    }


    /*
      Si stock = 0 mais que l'ancien
      panier contient déjà le produit,
      on autorise seulement si aucune
      limite n'est connue.
    */

    item.quantity =
      quantity + 1;

  }


  /* =======================================================
     REMOVE
  ======================================================= */

  if (
    action === "remove"
  ) {

    cart.splice(
      index,
      1
    );

  }


  saveCart(
    cart
  );
}


/* =========================================================
   CHECKOUT
========================================================= */

const orderForm =
  $("#orderForm");


if (orderForm) {

  orderForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      const cart =
        getNormalizedCart();


      if (!cart.length) {

        toast(
          "Votre panier est vide"
        );

        return;
      }


      const button =
        orderForm.querySelector(
          'button[type="submit"]'
        );


      if (button) {

        button.disabled =
          true;

        button.textContent =
          "Envoi de la commande...";

      }


      try {

        const formData =
          new FormData(
            orderForm
          );


        const customerName =
          String(
            formData.get(
              "customer_name"
            ) || ""
          ).trim();


        const phone =
          String(
            formData.get(
              "phone"
            ) || ""
          ).trim();


        const address =
          String(
            formData.get(
              "address"
            ) || ""
          ).trim();


        const note =
          String(
            formData.get(
              "note"
            ) || ""
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


        /* =================================================
           TOTAL
        ================================================= */

        const total =
          cart.reduce(
            (sum, item) =>

              sum +

              Number(
                item.price || 0
              ) *

              Number(
                item.quantity || 0
              ),

            0
          );


        /* =================================================
           CREATE ORDER
        ================================================= */

        const {
          data: order,
          error: orderError
        } =
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


        if (orderError) {

          console.error(
            "Order error:",
            orderError
          );

          throw orderError;
        }


        if (
          !order ||
          !order.id
        ) {

          throw new Error(
            "Commande créée sans ID."
          );
        }


        /* =================================================
           CREATE ORDER ITEMS
        ================================================= */

        const items =
          cart.map(
            item => ({

              order_id:
                order.id,

              product_id:
                item.product_id,

              variant_id:
                item.variant_id ||
                null,

              quantity:
                Number(
                  item.quantity || 1
                ),

              unit_price:
                Number(
                  item.price || 0
                )

            })
          );


        const {
          error: itemsError
        } =
          await supabaseClient
            .from("order_items")
            .insert(
              items
            );


        if (itemsError) {

          console.error(
            "Order items error:",
            itemsError
          );

          throw itemsError;
        }


        /* =================================================
           SUCCESS
        ================================================= */

        localStorage.removeItem(
          "jr_cart"
        );


        orderForm.reset();


        render();


        toast(
          "Commande envoyée avec succès ✅"
        );


      } catch (error) {

        console.error(
          "Checkout error:",
          error
        );


        toast(
          "Erreur lors de la commande. Réessayez."
        );


      } finally {

        if (button) {

          button.disabled =
            false;

          button.textContent =
            "Confirmer la commande";

        }

      }

    }
  );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    render();

  }
);
