/* =========================================================
   JR SHOP — CHECKOUT
   Supabase Orders + WhatsApp
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadCheckout();
});


/* =========================================================
   CONFIG
========================================================= */

// ⚠️ بدّل هذا الرقم برقم WhatsApp الخاص بـ JR Shop.
// الصيغة: كود الدولة + الرقم بدون + أو مسافات.
// مثال الجزائر: 2135XXXXXXXX

const WHATSAPP_NUMBER = "213697005313";


/* =========================================================
   CART
========================================================= */

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
      "Cart error:",
      error
    );

    return [];
  }
}


/* =========================================================
   LOAD CHECKOUT
========================================================= */

function loadCheckout() {

  const cart =
    getCart();


  const container =
    document.getElementById(
      "checkoutContainer"
    );


  if (!container) return;


  if (cart.length === 0) {

    container.innerHTML = `

      <div class="card empty-state">

        <h2>
          Votre panier est vide
        </h2>

        <p>
          Ajoutez au moins un produit
          avant de continuer.
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


  renderSummary(cart);

  setupCheckoutForm(cart);
}


/* =========================================================
   SUMMARY
========================================================= */

function renderSummary(cart) {

  const itemsContainer =
    document.getElementById(
      "summaryItems"
    );


  const totalElement =
    document.getElementById(
      "summaryTotal"
    );


  if (
    !itemsContainer ||
    !totalElement
  ) {
    return;
  }


  let total = 0;


  itemsContainer.innerHTML =
    cart
      .map(item => {

        const price =
          Number(item.price || 0);


        const quantity =
          Number(item.quantity || 0);


        const itemTotal =
          price * quantity;


        total += itemTotal;


        return `

          <div
            class="summary-row"
            style="
              align-items:flex-start;
              gap:12px;
            "
          >

            <div>

              <strong>
                ${escapeHTML(item.name)}
              </strong>

              <div
                style="
                  font-size:.9rem;
                  opacity:.7;
                  margin-top:4px;
                "
              >
                ${quantity} ×
                ${formatPrice(price)}
              </div>

            </div>


            <strong>
              ${formatPrice(itemTotal)}
            </strong>

          </div>

        `;

      })
      .join("");


  totalElement.textContent =
    formatPrice(total);
}


/* =========================================================
   TOTAL
========================================================= */

function calculateTotal(cart) {

  return cart.reduce(
    (total, item) => {

      return (
        total +
        Number(item.price || 0) *
        Number(item.quantity || 0)
      );

    },
    0
  );
}


/* =========================================================
   FORM
========================================================= */

function setupCheckoutForm(cart) {

  const form =
    document.getElementById(
      "checkoutForm"
    );


  if (!form) return;


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const button =
        document.getElementById(
          "submitOrderButton"
        );


      const formData =
        new FormData(form);


      const customerName =
        String(
          formData.get(
            "customerName"
          ) || ""
        ).trim();


      const phone =
        String(
          formData.get(
            "phone"
          ) || ""
        ).trim();


      const wilaya =
        String(
          formData.get(
            "wilaya"
          ) || ""
        ).trim();


      const commune =
        String(
          formData.get(
            "commune"
          ) || ""
        ).trim();


      const address =
        String(
          formData.get(
            "address"
          ) || ""
        ).trim();


      const notes =
        String(
          formData.get(
            "notes"
          ) || ""
        ).trim();


      /* =========================
         VALIDATION
      ========================== */

      if (!customerName) {

        showMessage(
          "Veuillez entrer votre nom complet.",
          "error"
        );

        return;
      }


      if (!isValidPhone(phone)) {

        showMessage(
          "Veuillez entrer un numéro de téléphone valide.",
          "error"
        );

        return;
      }


      if (!wilaya) {

        showMessage(
          "Veuillez entrer votre wilaya.",
          "error"
        );

        return;
      }


      if (!commune) {

        showMessage(
          "Veuillez entrer votre commune.",
          "error"
        );

        return;
      }


      if (!address) {

        showMessage(
          "Veuillez entrer votre adresse.",
          "error"
        );

        return;
      }


      if (!cart.length) {

        showMessage(
          "Votre panier est vide.",
          "error"
        );

        return;
      }


      /* =========================
         DISABLE BUTTON
      ========================== */

      if (button) {

        button.disabled = true;

        button.textContent =
          "Enregistrement...";

      }


      try {

        const total =
          calculateTotal(cart);


        /* =========================
           ORDER ITEMS
        ========================== */

        const items =
          cart.map(item => ({

            id:
              item.id,

            name:
              item.name,

            price:
              Number(item.price || 0),

            quantity:
              Number(item.quantity || 0),

            image_url:
              item.image_url || ""

          }));


        /* =========================
           INSERT ORDER
        ========================== */

        const { data, error } =
          await supabaseClient
            .from("orders")
            .insert({

              customer_name:
                customerName,

              phone:
                phone,

              wilaya:
                wilaya,

              commune:
                commune,

              address:
                address,

              notes:
                notes || null,

              items:
                items,

              total:
                total,

              status:
                "pending"

            })
            .select("id")
            .single();


        if (error) {

          console.error(
            "Order insert error:",
            error
          );

          throw new Error(
            "Impossible d'enregistrer la commande."
          );
        }


        const orderId =
          data?.id;


        /* =========================
           WHATSAPP
        ========================== */

        const whatsappMessage =
          createWhatsAppMessage({

            orderId:
              orderId,

            customerName:
              customerName,

            phone:
              phone,

            wilaya:
              wilaya,

            commune:
              commune,

            address:
              address,

            notes:
              notes,

            cart:
              cart,

            total:
              total

          });


        const whatsappUrl =
          "https://wa.me/" +
          WHATSAPP_NUMBER +
          "?text=" +
          encodeURIComponent(
            whatsappMessage
          );


        /* =========================
           CLEAR CART
        ========================== */

        localStorage.removeItem(
          "jrshop_cart"
        );


        /* =========================
           SUCCESS
        ========================== */

        showMessage(
          "Commande enregistrée avec succès.",
          "success"
        );


        form.reset();


        if (button) {

          button.textContent =
            "Commande enregistrée";

        }


        /* =========================
           OPEN WHATSAPP
        ========================== */

        setTimeout(() => {

          window.location.href =
            whatsappUrl;

        }, 800);


      } catch (error) {

        console.error(
          "Checkout error:",
          error
        );


        showMessage(
          error.message ||
          "Une erreur est survenue.",
          "error"
        );


        if (button) {

          button.disabled = false;

          button.textContent =
            "Confirmer la commande";

        }

      }

    }
  );
}


/* =========================================================
   WHATSAPP MESSAGE
========================================================= */

function createWhatsAppMessage(data) {

  let message =
    "🛍️ *Nouvelle commande - JR Shop*\n\n";


  message +=
    "📦 *Commande:* " +
    (data.orderId || "N/A") +
    "\n";


  message +=
    "👤 *Nom:* " +
    data.customerName +
    "\n";


  message +=
    "📞 *Téléphone:* " +
    data.phone +
    "\n";


  message +=
    "📍 *Wilaya:* " +
    data.wilaya +
    "\n";


  message +=
    "🏘️ *Commune:* " +
    data.commune +
    "\n";


  message +=
    "🏠 *Adresse:* " +
    data.address +
    "\n";


  if (data.notes) {

    message +=
      "📝 *Note:* " +
      data.notes +
      "\n";

  }


  message +=
    "\n🛒 *Produits:*\n";


  data.cart.forEach(item => {

    const itemTotal =
      Number(item.price || 0) *
      Number(item.quantity || 0);


    message +=
      "• " +
      item.name +
      " × " +
      item.quantity +
      " = " +
      formatPrice(itemTotal) +
      "\n";

  });


  message +=
    "\n💰 *Total: " +
    formatPrice(data.total) +
    "*";


  return message;
}


/* =========================================================
   PHONE VALIDATION
========================================================= */

function isValidPhone(phone) {

  const cleaned =
    phone.replace(
      /[\s\-().]/g,
      ""
    );


  return /^[+]?[0-9]{8,15}$/.test(
    cleaned
  );
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
  message,
  type
) {

  const element =
    document.getElementById(
      "checkoutMessage"
    );


  if (!element) return;


  element.style.display =
    "block";


  element.textContent =
    message;


  element.className =
    "checkout-message " +
    type;


  element.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(value) {

  return (
    Number(value || 0)
      .toLocaleString("fr-DZ")
    + " DA"
  );
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
