/* =========================================================
   JR SHOP — CHECKOUT
   Supabase Orders + WhatsApp + Delivery
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  loadCheckout();
  setupDelivery();
});


/* =========================================================
   CONFIG
========================================================= */

const WHATSAPP_NUMBER = "213697005313";


/* =========================================================
   DELIVERY PRICES — TEMPORARY
========================================================= */

/* =========================================================
   DELIVERY PRICES — 58 WILAYAS
   Tarifs indicatifs 2026
   domicile / stop-desk
========================================================= */

const DELIVERY_PRICES = {

  "01": { domicile: 1100, bureau: 600 },
  "02": { domicile: 690,  bureau: 400 },
  "03": { domicile: 900,  bureau: 500 },
  "04": { domicile: 850,  bureau: 400 },
  "05": { domicile: 850,  bureau: 400 },
  "06": { domicile: 790,  bureau: 400 },
  "07": { domicile: 950,  bureau: 500 },
  "08": { domicile: 1000, bureau: 600 },
  "09": { domicile: 600,  bureau: 400 },
  "10": { domicile: 690,  bureau: 400 },
  "11": { domicile: 1100, bureau: 600 },
  "12": { domicile: 850,  bureau: 400 },
  "13": { domicile: 600,  bureau: 400 },
  "14": { domicile: 700,  bureau: 400 },
  "15": { domicile: 690,  bureau: 400 },
  "16": { domicile: 500,  bureau: 400 },
  "17": { domicile: 900,  bureau: 500 },
  "18": { domicile: 790,  bureau: 400 },
  "19": { domicile: 750,  bureau: 400 },
  "20": { domicile: 790,  bureau: 400 },
  "21": { domicile: 690,  bureau: 400 },
  "22": { domicile: 600,  bureau: 400 },
  "23": { domicile: 800,  bureau: 400 },
  "24": { domicile: 850,  bureau: 450 },
  "25": { domicile: 800,  bureau: 400 },
  "26": { domicile: 690,  bureau: 400 },
  "27": { domicile: 600,  bureau: 400 },
  "28": { domicile: 800,  bureau: 400 },
  "29": { domicile: 650,  bureau: 400 },
  "30": { domicile: 900,  bureau: 500 },
  "31": { domicile: 450,  bureau: 250 },
  "32": { domicile: 900,  bureau: 500 },
  "33": { domicile: 1300, bureau: 600 },
  "34": { domicile: 790,  bureau: 400 },
  "35": { domicile: 690,  bureau: 350 },
  "36": { domicile: 850,  bureau: 500 },
  "37": { domicile: 1300, bureau: 600 },
  "38": { domicile: 750,  bureau: 400 },
  "39": { domicile: 950, bureau: 550 },
  "40": { domicile: 800, bureau: 400 },
  "41": { domicile: 800, bureau: 500 },
  "42": { domicile: 690, bureau: 350 },
  "43": { domicile: 690, bureau: 400 },
  "44": { domicile: 690, bureau: 400 },
  "45": { domicile: 900, bureau: 500 },
  "46": { domicile: 600, bureau: 400 },
  "47": { domicile: 990, bureau: 500 },
  "48": { domicile: 690, bureau: 400 },
  "49": { domicile: 1000, bureau: 750 },
  "50": { domicile: 1700, bureau: 1100 },
  "51": { domicile: 900, bureau: 600 },
  "52": { domicile: 1100, bureau: 600 },
  "53": { domicile: 1100, bureau: 600 },
  "54": { domicile: 1700, bureau: 1100 },
  "55": { domicile: 990, bureau: 500 },
  "56": { domicile: 1700, bureau: 1100 },
  "57": { domicile: 900, bureau: null },
  "58": { domicile: 990, bureau: 500 }

};


/* =========================================================
   CART
========================================================= */

function getCart() {

  try {

    const cart = JSON.parse(
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

  const cart = getCart();

  const container =
    document.getElementById(
      "checkoutContainer"
    );


  if (!container) {
    return;
  }


  if (cart.length === 0) {

    container.innerHTML =
      '<div class="card empty-state">' +

      '<h2>' +
      'Votre panier est vide' +
      '</h2>' +

      '<p>' +
      'Ajoutez au moins un produit avant de continuer.' +
      '</p>' +

      '<br>' +

      '<a ' +
      'href="index.html#products" ' +
      'class="btn btn-primary">' +

      'Découvrir les produits' +

      '</a>' +

      '</div>';

    return;

  }


  renderSummary(cart);

  setupCheckoutForm(cart);

}


/* =========================================================
   RENDER SUMMARY
========================================================= */

function renderSummary(cart) {

  const itemsContainer =
    document.getElementById(
      "summaryItems"
    );


  const productsTotalElement =
    document.getElementById(
      "productsTotal"
    );


  const totalElement =
    document.getElementById(
      "summaryTotal"
    );


  if (
    !itemsContainer ||
    !productsTotalElement ||
    !totalElement
  ) {
    return;
  }


  let total = 0;

  let html = "";


  cart.forEach(function (item) {

    const price =
      Number(
        item.price || 0
      );


    const quantity =
      Number(
        item.quantity || 0
      );


    const itemTotal =
      price * quantity;


    total += itemTotal;


    html +=

      '<div class="summary-row">' +

        '<div>' +

          '<strong>' +
          escapeHTML(item.name) +
          '</strong>' +

          '<div ' +
            'style="' +
              'font-size:.9rem;' +
              'opacity:.7;' +
              'margin-top:4px;' +
            '">' +

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


  itemsContainer.innerHTML =
    html;


  productsTotalElement.textContent =
    formatPrice(total);


  updateFinalTotal();

}


/* =========================================================
   CALCULATE PRODUCTS TOTAL
========================================================= */

function calculateTotal(cart) {

  return cart.reduce(
    function (total, item) {

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
   GET DELIVERY FEE
========================================================= */

function getDeliveryFee() {

  const deliveryType =
    document.getElementById(
      "deliveryType"
    );


  if (!deliveryType) {
    return 0;
  }


  return (
    DELIVERY_PRICES[
      deliveryType.value
    ] || 0
  );

}


/* =========================================================
   UPDATE DELIVERY DISPLAY
========================================================= */

function updateDeliveryDisplay() {

  const fee =
    getDeliveryFee();


  const deliveryFeeElement =
    document.getElementById(
      "deliveryFee"
    );


  const summaryDeliveryElement =
    document.getElementById(
      "summaryDelivery"
    );


  if (deliveryFeeElement) {

    deliveryFeeElement.textContent =
      formatPrice(fee);

  }


  if (summaryDeliveryElement) {

    summaryDeliveryElement.textContent =
      formatPrice(fee);

  }


  updateFinalTotal();

}


/* =========================================================
   UPDATE FINAL TOTAL
========================================================= */

function updateFinalTotal() {

  const cart =
    getCart();


  const productsTotal =
    calculateTotal(cart);


  const deliveryFee =
    getDeliveryFee();


  const finalTotal =
    productsTotal +
    deliveryFee;


  const totalElement =
    document.getElementById(
      "summaryTotal"
    );


  const productsTotalElement =
    document.getElementById(
      "productsTotal"
    );


  if (productsTotalElement) {

    productsTotalElement.textContent =
      formatPrice(productsTotal);

  }


  if (totalElement) {

    totalElement.textContent =
      formatPrice(finalTotal);

  }

}


/* =========================================================
   SETUP DELIVERY
========================================================= */

function setupDelivery() {

  const deliveryType =
    document.getElementById(
      "deliveryType"
    );


  if (!deliveryType) {
    return;
  }


  deliveryType.addEventListener(
    "change",
    function () {

      updateDeliveryDisplay();

    }
  );


  updateDeliveryDisplay();

}


/* =========================================================
   CHECKOUT FORM
========================================================= */

function setupCheckoutForm(cart) {

  const form =
    document.getElementById(
      "checkoutForm"
    );


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


      const customerNameElement =
        document.getElementById(
          "customerName"
        );


      const phoneElement =
        document.getElementById(
          "phone"
        );


      const wilayaElement =
        document.getElementById(
          "wilaya"
        );


      const communeElement =
        document.getElementById(
          "commune"
        );


      const deliveryTypeElement =
        document.getElementById(
          "deliveryType"
        );


      const addressElement =
        document.getElementById(
          "address"
        );


      const notesElement =
        document.getElementById(
          "notes"
        );


      const customerName =
        customerNameElement
          ? customerNameElement.value.trim()
          : "";


      const phone =
        phoneElement
          ? phoneElement.value.trim()
          : "";


      const wilaya =
        wilayaElement
          ? wilayaElement.value.trim()
          : "";


      const commune =
        communeElement
          ? communeElement.value.trim()
          : "";


      const deliveryType =
        deliveryTypeElement
          ? deliveryTypeElement.value
          : "";


      const address =
        addressElement
          ? addressElement.value.trim()
          : "";


      const notes =
        notesElement
          ? notesElement.value.trim()
          : "";


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
          "Veuillez sélectionner votre wilaya.",
          "error"
        );

        return;

      }


      if (!commune) {

        showMessage(
          "Veuillez sélectionner votre commune.",
          "error"
        );

        return;

      }


      if (!deliveryType) {

        showMessage(
          "Veuillez choisir le type de livraison.",
          "error"
        );

        return;

      }


      if (
        deliveryType === "domicile" &&
        !address
      ) {

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

        button.disabled =
          true;

        button.textContent =
          "Enregistrement...";

      }


      try {

        /* =========================
           TOTALS
        ========================== */

        const productsTotal =
          calculateTotal(cart);


        const deliveryFee =
          DELIVERY_PRICES[
            deliveryType
          ] || 0;


        const total =
          productsTotal +
          deliveryFee;


        /* =========================
           ORDER ITEMS
        ========================== */

        const items =
          cart.map(function (item) {

            return {

              id:
                item.id,

              name:
                item.name,

              price:
                Number(
                  item.price || 0
                ),

              quantity:
                Number(
                  item.quantity || 0
                ),

              image_url:
                item.image_url || ""

            };

          });


        /* =========================
           ORDER ID
        ========================= */

        const orderId =
          crypto.randomUUID();


        /* =========================
           ORDER DATA
        ========================= */

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
            address || null,

          notes:
            notes || null,

          items:
            items,

          products_total:
            productsTotal,

          delivery_type:
            deliveryType,

          delivery_fee:
            deliveryFee,

          total:
            total,

          status:
            "pending"

        };


        /* =========================
           SUPABASE
        ========================= */

        const result =
          await supabaseClient
            .from("orders")
            .insert(
              orderData
            );


        if (result.error) {

          console.error(
            "SUPABASE ERROR:",
            result.error
          );


          throw new Error(
            result.error.message ||
            "Impossible d'enregistrer la commande."
          );

        }


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

            deliveryType:
              deliveryType,

            address:
              address,

            notes:
              notes,

            cart:
              cart,

            productsTotal:
              productsTotal,

            deliveryFee:
              deliveryFee,

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
          "Commande enregistrée avec succès. Ouverture de WhatsApp...",
          "success"
        );


        if (button) {

          button.textContent =
            "Commande enregistrée";

        }


        setTimeout(
          function () {

            window.location.href =
              whatsappUrl;

          },
          1000
        );


      } catch (error) {

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
   WHATSAPP MESSAGE
========================================================= */

function createWhatsAppMessage(data) {

  let message =
    "🛍️ Nouvelle commande - JR Shop\n\n";


  message +=
    "📦 Commande: " +
    data.orderId +
    "\n";


  message +=
    "👤 Nom: " +
    data.customerName +
    "\n";


  message +=
    "📞 Téléphone: " +
    data.phone +
    "\n";


  message +=
    "📍 Wilaya: " +
    data.wilaya +
    "\n";


  message +=
    "🏘️ Commune: " +
    data.commune +
    "\n";


  message +=
    "🚚 Livraison: " +
    (
      data.deliveryType === "domicile"
        ? "Domicile"
        : "Bureau"
    ) +
    "\n";


  if (data.address) {

    message +=
      "🏠 Adresse: " +
      data.address +
      "\n";

  }


  if (data.notes) {

    message +=
      "📝 Note: " +
      data.notes +
      "\n";

  }


  message +=
    "\n🛒 Produits:\n";


  data.cart.forEach(
    function (item) {

      const itemTotal =
        Number(
          item.price || 0
        ) *
        Number(
          item.quantity || 0
        );


      message +=
        "- " +
        item.name +
        " × " +
        item.quantity +
        " = " +
        formatPrice(
          itemTotal
        ) +
        "\n";

    }
  );


  message +=
    "\n💵 Total produits: " +
    formatPrice(
      data.productsTotal
    );


  message +=
    "\n🚚 Livraison: " +
    formatPrice(
      data.deliveryFee
    );


  message +=
    "\n💰 Total final: " +
    formatPrice(
      data.total
    );


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
   SHOW MESSAGE
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
   FORMAT PRICE
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

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}
