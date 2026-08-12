/* =========================================================
   JR SHOP - CHECKOUT
   Supabase Orders + WhatsApp
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  loadCheckout();
});


/* =========================================================
   CONFIG
========================================================= */

const WHATSAPP_NUMBER = "213697005313";


/* =========================================================
   CART
========================================================= */

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


/* =========================================================
   LOAD CHECKOUT
========================================================= */

function loadCheckout() {

  const cart = getCart();

  const container =
    document.getElementById("checkoutContainer");

  if (!container) {
    return;
  }

  if (cart.length === 0) {

    container.innerHTML =
      '<div class="card empty-state">' +
        '<h2>Votre panier est vide</h2>' +
        '<p>Ajoutez au moins un produit avant de continuer.</p>' +
        '<br>' +
        '<a href="index.html#products" class="btn btn-primary">' +
          'Découvrir les produits' +
        '</a>' +
      '</div>';

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
    document.getElementById("summaryItems");

  const totalElement =
    document.getElementById("summaryTotal");

  if (!itemsContainer || !totalElement) {
    return;
  }

  let total = 0;

  let html = "";


  cart.forEach(function (item) {

    const price =
      Number(item.price || 0);

    const quantity =
      Number(item.quantity || 0);

    const itemTotal =
      price * quantity;

    total += itemTotal;


    html +=
      '<div class="summary-row">' +

        '<div>' +

          '<strong>' +
            escapeHTML(item.name) +
          '</strong>' +

          '<div style="font-size:.9rem;opacity:.7;margin-top:4px;">' +
            quantity +
            ' × ' +
            formatPrice(price) +
          '</div>' +

        '</div>' +

        '<strong>' +
          formatPrice(itemTotal) +
        '</strong>' +

      '</div>';

  });


  itemsContainer.innerHTML = html;

  totalElement.textContent =
    formatPrice(total);
}


/* =========================================================
   TOTAL
========================================================= */

function calculateTotal(cart) {

  let total = 0;


  cart.forEach(function (item) {

    total +=
      Number(item.price || 0) *
      Number(item.quantity || 0);

  });


  return total;
}


/* =========================================================
   CHECKOUT FORM
========================================================= */

function setupCheckoutForm(cart) {

  const form =
    document.getElementById("checkoutForm");

  if (!form) {
    return;
  }


  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      const button =
        document.getElementById(
          "submitOrderButton"
        );


      const customerName =
        document.getElementById(
          "customerName"
        ).value.trim();


      const phone =
        document.getElementById(
          "phone"
        ).value.trim();


      const wilaya =
        document.getElementById(
          "wilaya"
        ).value.trim();


      const commune =
        document.getElementById(
          "commune"
        ).value.trim();


      const address =
        document.getElementById(
          "address"
        ).value.trim();


      const notes =
        document.getElementById(
          "notes"
        ).value.trim();


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


      if (cart.length === 0) {

        showMessage(
          "Votre panier est vide.",
          "error"
        );

        return;
      }


      /* =========================
         BUTTON
      ========================== */

      if (button) {

        button.disabled = true;

        button.textContent =
          "Enregistrement...";

      }


      try {

        /* =========================
           TOTAL
        ========================== */

        const total =
          calculateTotal(cart);


        /* =========================
           ITEMS
        ========================== */

        const items =
          cart.map(function (item) {

            return {

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

            };

          });


        /* =========================
           ORDER ID
        ========================== */

        const orderId =
          crypto.randomUUID();


        /* =========================
           ORDER DATA
        ========================== */

        const orderData = {

          id:
            orderId,

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

        };


        /* =========================
           SUPABASE INSERT
        ========================== */

        const result =
          await supabaseClient
            .from("orders")
            .insert(orderData);


        if (result.error) {

          console.error(
            "SUPABASE ERROR:",
            result.error
          );


          showMessage(
            "Erreur Supabase : " +
            result.error.message,
            "error"
          );


          if (button) {

            button.disabled = false;

            button.textContent =
              "Confirmer la commande";

          }

          return;
        }


        /* =========================
           WHATSAPP MESSAGE
        ========================== */

        const whatsappMessage =
          createWhatsAppMessage(
            orderId,
            customerName,
            phone,
            wilaya,
            commune,
            address,
            notes,
            cart,
            total
          );


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
          "Commande enregistrée avec succès. Ouverture de WhatsApp...",
          "success"
        );


        if (button) {

          button.textContent =
            "Commande enregistrée";

        }


        /* =========================
           OPEN WHATSAPP
        ========================== */

        setTimeout(function () {

          window.location.href =
            whatsappUrl;

        }, 1000);

      }


      catch (error) {

        console.error(
          "CHECKOUT ERROR:",
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

function createWhatsAppMessage(
  orderId,
  customerName,
  phone,
  wilaya,
  commune,
  address,
  notes,
  cart,
  total
) {

  let message =
    "Nouvelle commande - JR Shop\n\n";


  message +=
    "Commande: " +
    orderId +
    "\n";


  message +=
    "Nom: " +
    customerName +
    "\n";


  message +=
    "Telephone: " +
    phone +
    "\n";


  message +=
    "Wilaya: " +
    wilaya +
    "\n";


  message +=
    "Commune: " +
    commune +
    "\n";


  message +=
    "Adresse: " +
    address +
    "\n";


  if (notes) {

    message +=
      "Note: " +
      notes +
      "\n";

  }


  message +=
    "\nProduits:\n";


  cart.forEach(function (item) {

    const itemTotal =
      Number(item.price || 0) *
      Number(item.quantity || 0);


    message +=
      "- " +
      item.name +
      " x " +
      item.quantity +
      " = " +
      formatPrice(itemTotal) +
      "\n";

  });


  message +=
    "\nTotal: " +
    formatPrice(total);


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


  if (!element) {
    return;
  }


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
   PRICE
========================================================= */

function formatPrice(value) {

  return (
    Number(value || 0)
      .toLocaleString("fr-DZ") +
    " DA"
  );
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
