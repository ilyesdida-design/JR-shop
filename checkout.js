document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("checkoutForm");

  if (!form) {
    console.error("checkoutForm introuvable");
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = document.getElementById("customerName").value.trim();
    var phone = document.getElementById("phone").value.trim();
    var wilaya = document.getElementById("wilaya").value.trim();
    var commune = document.getElementById("commune").value.trim();
    var address = document.getElementById("address").value.trim();
    var notes = document.getElementById("notes").value.trim();

    if (!name || !phone || !wilaya || !commune || !address) {
      showMessage("Veuillez remplir tous les champs obligatoires.", "error");
      return;
    }

    var cart = [];

    try {
      cart = JSON.parse(localStorage.getItem("jrshop_cart")) || [];
    } catch (error) {
      console.error("Cart error:", error);
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      showMessage("Votre panier est vide.", "error");
      return;
    }

    var total = 0;

    cart.forEach(function (item) {
      total += Number(item.price || 0) * Number(item.quantity || 0);
    });

    var items = cart.map(function (item) {
      return {
        id: item.id || null,
        name: item.name || "",
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 0),
        image_url: item.image_url || ""
      };
    });

    var orderData = {
      customer_name: name,
      phone: phone,
      wilaya: wilaya,
      commune: commune,
      address: address,
      notes: notes || null,
      items: items,
      total: total,
      status: "pending"
    };

    var button = document.getElementById("submitOrderButton");

    if (button) {
      button.disabled = true;
      button.textContent = "Enregistrement...";
    }

    if (typeof supabaseClient === "undefined") {
      showMessage("Erreur : Supabase n'est pas connecté.", "error");

      if (button) {
        button.disabled = false;
        button.textContent = "Confirmer la commande";
      }

      return;
    }

    supabaseClient
      .from("orders")
      .insert(orderData)
      .then(function (result) {

        if (result.error) {
          console.error("SUPABASE ERROR:", result.error);

          showMessage(
            "Erreur Supabase : " + result.error.message,
            "error"
          );

          if (button) {
            button.disabled = false;
            button.textContent = "Confirmer la commande";
          }

          return;
        }

        showMessage(
          "Commande enregistrée avec succès !",
          "success"
        );

        localStorage.removeItem("jrshop_cart");

        if (button) {
          button.textContent = "Commande enregistrée";
        }

        var message = "Nouvelle commande - JR Shop\n\n";

        message += "Nom: " + name + "\n";
        message += "Téléphone: " + phone + "\n";
        message += "Wilaya: " + wilaya + "\n";
        message += "Commune: " + commune + "\n";
        message += "Adresse: " + address + "\n";

        if (notes) {
          message += "Note: " + notes + "\n";
        }

        message += "\nProduits:\n";

        cart.forEach(function (item) {
          var itemTotal =
            Number(item.price || 0) *
            Number(item.quantity || 0);

          message +=
            "- " +
            item.name +
            " x " +
            item.quantity +
            " = " +
            itemTotal.toLocaleString("fr-DZ") +
            " DA\n";
        });

        message +=
          "\nTotal: " +
          total.toLocaleString("fr-DZ") +
          " DA";

        var whatsappNumber = "213697005313";

        var whatsappUrl =
          "https://wa.me/" +
          whatsappNumber +
          "?text=" +
          encodeURIComponent(message);

        setTimeout(function () {
          window.location.href = whatsappUrl;
        }, 1000);

      })
      .catch(function (error) {

        console.error("CHECKOUT ERROR:", error);

        showMessage(
          "Erreur : " + error.message,
          "error"
        );

        if (button) {
          button.disabled = false;
          button.textContent = "Confirmer la commande";
        }

      });

  });

  loadSummary();
});


function loadSummary() {

  var cart = [];

  try {
    cart = JSON.parse(localStorage.getItem("jrshop_cart")) || [];
  } catch (error) {
    cart = [];
  }

  var summary = document.getElementById("summaryItems");
  var totalElement = document.getElementById("summaryTotal");

  if (!summary || !totalElement) {
    return;
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    summary.innerHTML = "<p>Votre panier est vide.</p>";
    totalElement.textContent = "0 DA";
    return;
  }

  var html = "";
  var total = 0;

  cart.forEach(function (item) {

    var price = Number(item.price || 0);
    var quantity = Number(item.quantity || 0);
    var itemTotal = price * quantity;

    total += itemTotal;

    html +=
      "<div class=\"summary-row\">" +
      "<span>" +
      item.name +
      " × " +
      quantity +
      "</span>" +
      "<strong>" +
      itemTotal.toLocaleString("fr-DZ") +
      " DA" +
      "</strong>" +
      "</div>";

  });

  summary.innerHTML = html;
  totalElement.textContent =
    total.toLocaleString("fr-DZ") + " DA";
}


function showMessage(message, type) {

  var element =
    document.getElementById("checkoutMessage");

  if (!element) {
    alert(message);
    return;
  }

  element.style.display = "block";
  element.textContent = message;
  element.className = "checkout-message " + type;
}
