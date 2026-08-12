/* =========================================================
   JR SHOP — CHECKOUT
   Wilaya + Commune + Livraison + Total
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  loadCheckout();
  setupLocation();
  setupDelivery();
  setupFormSubmit();

});

/* =========================================================
   TEMPORARY DELIVERY PRICES
========================================================= */

var DELIVERY_PRICES = {
  domicile: 600,
  bureau: 400
};


/* =========================================================
   ALGERIA WILAYAS + COMMUNES
========================================================= */

var ALGERIA = {

  "Adrar": [
    "Adrar",
    "Tamest",
    "Charouine",
    "Reggane",
    "In Zghmir",
    "Tit",
    "Ksar Kaddour",
    "Tsabit",
    "Timimoun",
    "Ouled Said"
  ],

  "Chlef": [
    "Chlef",
    "Ténès",
    "Boukadir",
    "Oued Fodda",
    "El Karimia",
    "Ouled Fares",
    "Aïn Merane",
    "Abou El Hassan",
    "Chettia",
    "Moussadek"
  ],

  "Laghouat": [
    "Laghouat",
    "Aflou",
    "El Assafia",
    "Aïn Madhi",
    "Brida",
    "El Ghicha",
    "Hassi R'Mel",
    "Kheneg",
    "Oued Morra"
  ],

  "Oum El Bouaghi": [
    "Oum El Bouaghi",
    "Aïn Beïda",
    "Aïn M'lila",
    "Aïn Babouche",
    "Aïn Fakroun",
    "Aïn Kercha",
    "Dhalaa",
    "Fkirina",
    "Meskiana",
    "Sigus"
  ],

  "Batna": [
    "Batna",
    "Barika",
    "Merouana",
    "Arris",
    "Aïn Touta",
    "N'Gaous",
    "Tazoult",
    "El Madher",
    "Chemora",
    "Djezzar"
  ],

  "Béjaïa": [
    "Béjaïa",
    "Akbou",
    "Amizour",
    "Barbacha",
    "El Kseur",
    "Kherrata",
    "Seddouk",
    "Tichy",
    "Aokas",
    "Souk El Tenine"
  ],

  "Biskra": [
    "Biskra",
    "Aïn Naga",
    "Branis",
    "Chetma",
    "Djemorah",
    "El Hadjeb",
    "El Kantara",
    "Foughala",
    "Lioua",
    "Tolga"
  ],

  "Béchar": [
    "Béchar",
    "Abadla",
    "Beni Ounif",
    "Kenadsa",
    "Lahmar",
    "Taghit",
    "Igli",
    "Mogheul"
  ],

  "Blida": [
    "Blida",
    "Boufarik",
    "Bougara",
    "Beni Mered",
    "Chiffa",
    "Chréa",
    "El Affroun",
    "Larbaa",
    "Mouzaia",
    "Ouled Yaïch"
  ],

  "Bouira": [
    "Bouira",
    "Aïn Bessem",
    "Bechloul",
    "Bordj Okhriss",
    "Chorfa",
    "El Adjiba",
    "Haïzer",
    "Lakhdaria",
    "M'Chedallah",
    "Sour El Ghozlane"
  ],

  "Tamanrasset": [
    "Tamanrasset",
    "Abalessa",
    "Idles",
    "In Amguel",
    "Tazrouk"
  ],

  "Tébessa": [
    "Tébessa",
    "Bir El Ater",
    "Cheria",
    "El Kouif",
    "El Ma Labiod",
    "Morsott",
    "Negrine",
    "Ouenza",
    "Stah Guentis"
  ],

  "Tlemcen": [
    "Tlemcen",
    "Chetouane",
    "Mansourah",
    "Remchi",
    "Maghnia",
    "Ghazaouet",
    "Nedroma",
    "Sebdou",
    "Hennaya",
    "Bensekrane",
    "Ouled Mimoun",
    "Aïn Tallout",
    "Bab El Assa",
    "Beni Snous",
    "Beni Mester",
    "Fellaoucene",
    "Hammam Boughrara",
    "Honaïne",
    "Sabra",
    "Souahlia"
  ],

  "Tiaret": [
    "Tiaret",
    "Frenda",
    "Ksar Chellala",
    "Mahdia",
    "Mechraa Safa",
    "Medrissa",
    "Mellakou",
    "Rahouia",
    "Sougueur",
    "Aïn Deheb"
  ],

  "Tizi Ouzou": [
    "Tizi Ouzou",
    "Azazga",
    "Boghni",
    "Draa Ben Khedda",
    "Draa El Mizan",
    "Larbaa Nath Irathen",
    "Mekla",
    "Ouacif",
    "Ouadhia",
    "Tigzirt"
  ],

  "Alger": [
    "Alger Centre",
    "Bab El Oued",
    "Bachdjerrah",
    "Bir Mourad Raïs",
    "Bordj El Kiffan",
    "Dar El Beïda",
    "El Biar",
    "El Harrach",
    "Hussein Dey",
    "Kouba",
    "Mohammadia",
    "Rouiba",
    "Reghaïa",
    "Zeralda"
  ],

  "Djelfa": [
    "Djelfa",
    "Aïn Oussera",
    "Birine",
    "Hassi Bahbah",
    "Messaad",
    "Sidi Laadjel",
    "Dar Chioukh",
    "El Idrissia"
  ],

  "Jijel": [
    "Jijel",
    "El Milia",
    "Taher",
    "Chekfa",
    "Djimla",
    "El Ancer",
    "Kaous",
    "Settara",
    "Ziama Mansouriah"
  ],

  "Sétif": [
    "Sétif",
    "Aïn Arnat",
    "Aïn Azel",
    "Aïn Oulmene",
    "Babor",
    "Bougaa",
    "Djemila",
    "El Eulma",
    "Guidjel",
    "Hammam Guergour",
    "Salah Bey"
  ],

  "Saïda": [
    "Saïda",
    "Aïn El Hadjar",
    "El Hassasna",
    "Ouled Brahim",
    "Sidi Boubekeur",
    "Youb"
  ],

  "Skikda": [
    "Skikda",
    "Azzaba",
    "Collo",
    "El Harrouch",
    "Kerkera",
    "Ramdane Djamel",
    "Tamalous",
    "Ben Azzouz",
    "Filfila"
  ],

  "Sidi Bel Abbès": [
    "Sidi Bel Abbès",
    "Ben Badis",
    "Ras El Ma",
    "Sfisef",
    "Telagh",
    "Aïn El Berd",
    "Mostefa Ben Brahim",
    "Moulay Slissen"
  ],

  "Annaba": [
    "Annaba",
    "El Bouni",
    "El Hadjar",
    "Berrahal",
    "Chetaïbi",
    "Seraïdi",
    "Treat"
  ],

  "Guelma": [
    "Guelma",
    "Bouchegouf",
    "Héliopolis",
    "Hammam Debagh",
    "Khezara",
    "Oued Zenati",
    "Aïn Makhlouf",
    "Dahouara"
  ],

  "Constantine": [
    "Constantine",
    "El Khroub",
    "Hamma Bouziane",
    "Aïn Smara",
    "Didouche Mourad",
    "Ibn Ziad",
    "Zighoud Youcef"
  ],

  "Médéa": [
    "Médéa",
    "Berrouaghia",
    "Beni Slimane",
    "Ksar El Boukhari",
    "Seghouane",
    "Tablat",
    "El Omaria",
    "Ouled Antar"
  ],

  "Mostaganem": [
    "Mostaganem",
    "Aïn Tédelès",
    "Bouguirat",
    "Hassi Mameche",
    "Mesra",
    "Sidi Ali",
    "Sidi Lakhdar",
    "Stidia"
  ],

  "M'Sila": [
    "M'Sila",
    "Boussaâda",
    "Magra",
    "Sidi Aïssa",
    "Aïn El Hadjel",
    "Berhoum",
    "Chellal",
    "Hammam Dalaa",
    "Ouled Derradj"
  ],

  "Mascara": [
    "Mascara",
    "Bou Hanifia",
    "Ghriss",
    "Mohammadia",
    "Sig",
    "Tighennif",
    "Aïn Fares",
    "Oued El Abtal",
    "Zahana"
  ],

  "Ouargla": [
    "Ouargla",
    "Hassi Messaoud",
    "N'Goussa",
    "Rouissat",
    "Sidi Khouiled",
    "Hassi Ben Abdellah"
  ],

  "Oran": [
    "Oran",
    "Bir El Djir",
    "Es Senia",
    "Arzew",
    "Bethioua",
    "Aïn El Turk",
    "Mers El Kébir",
    "Gdyel",
    "Hassi Bounif",
    "Hassi Ben Okba",
    "Misserghin"
  ],

  "El Bayadh": [
    "El Bayadh",
    "Bougtob",
    "Brezina",
    "El Abiodh Sidi Cheikh",
    "Rogassa",
    "Cheguig"
  ],

  "Illizi": [
    "Illizi",
    "Djanet",
    "In Amenas",
    "Debdeb"
  ],

  "Bordj Bou Arréridj": [
    "Bordj Bou Arréridj",
    "Bordj Ghdir",
    "Bordj Zemoura",
    "El Achir",
    "Ras El Oued",
    "Mansoura",
    "Medjana"
  ],

  "Boumerdès": [
    "Boumerdès",
    "Boudouaou",
    "Dellys",
    "Isser",
    "Khemis El Khechna",
    "Naciria",
    "Ouled Moussa",
    "Thenia",
    "Tidjelabine"
  ],

  "El Tarf": [
    "El Tarf",
    "Ben M'Hidi",
    "Besbes",
    "Dréan",
    "El Kala",
    "Echatt",
    "Bouteldja",
    "Chefia"
  ],

  "Tindouf": [
    "Tindouf",
    "Oum El Assel"
  ],

  "Tissemsilt": [
    "Tissemsilt",
    "Bordj Bounaama",
    "Khemisti",
    "Lazharia",
    "Theniet El Had",
    "Youssoufia"
  ],

  "El Oued": [
    "El Oued",
    "Bayadha",
    "Debila",
    "Guemar",
    "Hassi Khalifa",
    "Kouinine",
    "Magrane",
    "Robbah",
    "Reguiba",
    "Taghzout"
  ],

  "Khenchela": [
    "Khenchela",
    "Aïn Touila",
    "Babar",
    "Chechar",
    "El Hamma",
    "Kais",
    "Ouled Rechache",
    "Remila",
    "Tamza"
  ],

  "Souk Ahras": [
    "Souk Ahras",
    "Bir Bou Haouch",
    "Haddada",
    "Hanencha",
    "Khedara",
    "M'daourouch",
    "Merahna",
    "Sedrata",
    "Taoura"
  ],

  "Tipaza": [
    "Tipaza",
    "Cherchell",
    "Bou Ismaïl",
    "Douaouda",
    "Fouka",
    "Hadjout",
    "Koléa",
    "Menaceur",
    "Nador"
  ],

  "Mila": [
    "Mila",
    "Chelghoum Laïd",
    "Ferdjioua",
    "Grarem Gouga",
    "Oued Athmania",
    "Rouached",
    "Sidi Merouane",
    "Tadjenanet",
    "Teleghma"
  ],

  "Aïn Defla": [
    "Aïn Defla",
    "Aïn Lechiakh",
    "Bordj Emir Khaled",
    "Boumedfaa",
    "El Abadia",
    "El Attaf",
    "Khemis Miliana",
    "Miliana",
    "Rouina"
  ],

  "Naâma": [
    "Naâma",
    "Aïn Sefra",
    "Asla",
    "Méchria",
    "Moghrar",
    "Sfissifa",
    "Tiout"
  ],

  "Aïn Témouchent": [
    "Aïn Témouchent",
    "Beni Saf",
    "El Amria",
    "El Malah",
    "Hammam Bou Hadjar",
    "Oulhaça",
    "Terga"
  ],

  "Ghardaïa": [
    "Ghardaïa",
    "Berriane",
    "Bounoura",
    "Daya Ben Dahoua",
    "El Atteuf",
    "Metlili",
    "Sebseb",
    "Zelfana"
  ],

  "Relizane": [
    "Relizane",
    "Ammi Moussa",
    "Djidiouia",
    "El H'madna",
    "Mazouna",
    "Mendes",
    "Oued Rhiou",
    "Ramka",
    "Sidi M'Hamed Benaouda",
    "Yellel"
  ],

  "Timimoun": [
    "Timimoun",
    "Aougrout",
    "Charouine",
    "Deldoul",
    "Ksar Kaddour",
    "Ouled Aïssa",
    "Talmine",
    "Tinerkouk"
  ],

  "Bordj Badji Mokhtar": [
    "Bordj Badji Mokhtar",
    "Timiaouine"
  ],

  "Ouled Djellal": [
    "Ouled Djellal",
    "Besbes",
    "Doucen",
    "Ras El Miad",
    "Sidi Khaled"
  ],

  "Béni Abbès": [
    "Béni Abbès",
    "El Ouata",
    "Igli",
    "Kerzaz",
    "Ksabi",
    "Ouled Khoudir",
    "Tabelbala",
    "Tamtert"
  ],

  "In Salah": [
    "In Salah",
    "Foggaret Azzaouia",
    "In Ghar",
    "Hassi Lahdjar"
  ],

  "In Guezzam": [
    "In Guezzam",
    "Tin Zaouatine"
  ],

  "Touggourt": [
    "Touggourt",
    "Blidet Amor",
    "El Hadjira",
    "Megarine",
    "M'Naguer",
    "Nezla",
    "Temacine",
    "Tebesbest",
    "Zaouia El Abidia"
  ],

  "Djanet": [
    "Djanet",
    "Bordj El Haouas"
  ],

  "El Meghaier": [
    "El Meghaier",
    "Djamaa",
    "M'Rara",
    "Sidi Amrane",
    "Still",
    "Tenedla"
  ],

  "El Menia": [
    "El Menia",
    "Hassi Gara",
    "Hassi Fehal"
  ]

};


/* =========================================================
   LOAD CHECKOUT
========================================================= */

function loadCheckout() {

  var cart = getCart();

  var container =
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
}


/* =========================================================
   CART
========================================================= */

function getCart() {

  try {

    var cart =
      JSON.parse(
        localStorage.getItem("jrshop_cart")
      );

    return Array.isArray(cart) ? cart : [];

  } catch (error) {

    console.error("Cart error:", error);

    return [];
  }
}


/* =========================================================
   LOCATION
========================================================= */

function setupLocation() {

  var wilaya =
    document.getElementById("wilaya");

  var commune =
    document.getElementById("commune");

  if (!wilaya || !commune) {
    return;
  }

  var names =
    Object.keys(ALGERIA);

  names.sort();

  names.forEach(function (name) {

    var option =
      document.createElement("option");

    option.value = name;
    option.textContent = name;

    wilaya.appendChild(option);

  });


  wilaya.addEventListener(
    "change",
    function () {

      commune.innerHTML =
        '<option value="">Sélectionnez votre commune</option>';

      commune.disabled = true;

      var selected =
        wilaya.value;

      if (!selected || !ALGERIA[selected]) {
        updateTotals();
        return;
      }

      ALGERIA[selected].forEach(
        function (name) {

          var option =
            document.createElement("option");

          option.value = name;
          option.textContent = name;

          commune.appendChild(option);

        }
      );

      commune.disabled = false;

      updateTotals();

    }
  );

}


/* =========================================================
   DELIVERY
========================================================= */

function setupDelivery() {

  var delivery =
    document.getElementById("deliveryType");

  if (!delivery) {
    return;
  }

  delivery.addEventListener(
    "change",
    function () {

      var addressGroup =
        document.getElementById("addressGroup");

      var address =
        document.getElementById("address");

      if (delivery.value === "bureau") {

        if (addressGroup) {
          addressGroup.style.display = "none";
        }

        if (address) {
          address.required = false;
          address.value = "";
        }

      } else {

        if (addressGroup) {
          addressGroup.style.display = "block";
        }

        if (address) {
          address.required = true;
        }

      }

      updateTotals();

    }
  );

}


/* =========================================================
   DELIVERY FEE
========================================================= */

function getDeliveryFee() {

  var delivery =
    document.getElementById("deliveryType");

  if (!delivery) {
    return 0;
  }

  return (
    DELIVERY_PRICES[delivery.value] ||
    0
  );
}


/* =========================================================
   TOTALS
========================================================= */

function calculateProductsTotal(cart) {

  var total = 0;

  cart.forEach(function (item) {

    total +=
      Number(item.price || 0) *
      Number(item.quantity || 0);

  });

  return total;
}


function updateTotals() {

  var cart =
    getCart();

  var productsTotal =
    calculateProductsTotal(cart);

  var deliveryFee =
    getDeliveryFee();

  var finalTotal =
    productsTotal +
    deliveryFee;


  var productsElement =
    document.getElementById("productsTotal");

  var deliveryElement =
    document.getElementById("summaryDelivery");

  var feeElement =
    document.getElementById("deliveryFee");

  var totalElement =
    document.getElementById("summaryTotal");


  if (productsElement) {
    productsElement.textContent =
      formatPrice(productsTotal);
  }

  if (deliveryElement) {
    deliveryElement.textContent =
      formatPrice(deliveryFee);
  }

  if (feeElement) {
    feeElement.textContent =
      formatPrice(deliveryFee);
  }

  if (totalElement) {
    totalElement.textContent =
      formatPrice(finalTotal);
  }

}


/* =========================================================
   SUMMARY
========================================================= */

function renderSummary(cart) {

  var container =
    document.getElementById("summaryItems");

  if (!container) {
    return;
  }

  var html = "";

  cart.forEach(function (item) {

    var price =
      Number(item.price || 0);

    var quantity =
      Number(item.quantity || 0);

    var total =
      price * quantity;

    html +=
      '<div class="summary-row">' +
      '<div>' +
      '<strong>' +
      escapeHTML(item.name) +
      '</strong>' +
      '<div style="font-size:.9rem;opacity:.7;">' +
      quantity +
      ' × ' +
      formatPrice(price) +
      '</div>' +
      '</div>' +
      '<strong>' +
      formatPrice(total) +
      '</strong>' +
      '</div>';

  });

  container.innerHTML = html;

  updateTotals();

}


/* =========================================================
   FORM
========================================================= */

function setupFormSubmit() {

  var form =
    document.getElementById("checkoutForm");

  if (!form) {
    return;
  }

  form.addEventListener(
    "submit",
    submitOrder
  );

}


/* =========================================================
   SUBMIT ORDER
========================================================= */

function submitOrder(event) {

  event.preventDefault();

  var cart =
    getCart();

  if (!cart.length) {

    showMessage(
      "Votre panier est vide.",
      "error"
    );

    return;
  }


  var name =
    document.getElementById("customerName").value.trim();

  var phone =
    document.getElementById("phone").value.trim();

  var wilaya =
    document.getElementById("wilaya").value;

  var commune =
    document.getElementById("commune").value;

  var deliveryType =
    document.getElementById("deliveryType").value;

  var address =
    document.getElementById("address").value.trim();

  var notes =
    document.getElementById("notes").value.trim();


  if (!name) {
    showMessage("Veuillez entrer votre nom complet.", "error");
    return;
  }

  if (!phone) {
    showMessage("Veuillez entrer votre numéro de téléphone.", "error");
    return;
  }

  if (!wilaya) {
    showMessage("Veuillez sélectionner votre wilaya.", "error");
    return;
  }

  if (!commune) {
    showMessage("Veuillez sélectionner votre commune.", "error");
    return;
  }

  if (!deliveryType) {
    showMessage("Veuillez choisir le type de livraison.", "error");
    return;
  }

  if (deliveryType === "domicile" && !address) {
    showMessage("Veuillez entrer votre adresse.", "error");
    return;
  }


  var productsTotal =
    calculateProductsTotal(cart);

  var deliveryFee =
    getDeliveryFee();

  var finalTotal =
    productsTotal +
    deliveryFee;


  var items =
    cart.map(function (item) {

      return {

        id: item.id || null,

        name: item.name || "",

        price:
          Number(item.price || 0),

        quantity:
          Number(item.quantity || 0),

        image_url:
          item.image_url || ""

      };

    });


  var orderData = {

    customer_name:
      name,

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

    total:
      finalTotal,

    status:
      "pending"

  };


  var button =
    document.getElementById(
      "submitOrderButton"
    );

  if (button) {

    button.disabled = true;

    button.textContent =
      "Enregistrement...";

  }


  if (
    typeof supabaseClient ===
    "undefined"
  ) {

    showMessage(
      "Erreur : Supabase n'est pas connecté.",
      "error"
    );

    resetButton();

    return;
  }


  supabaseClient
    .from("orders")
    .insert(orderData)
    .then(function (result) {

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

        resetButton();

        return;
      }


      localStorage.removeItem(
        "jrshop_cart"
      );


      showMessage(
        "Commande enregistrée avec succès !",
        "success"
      );


      if (button) {
        button.textContent =
          "Commande enregistrée";
      }


      sendWhatsApp(
        name,
        phone,
        wilaya,
        commune,
        deliveryType,
        address,
        notes,
        cart,
        productsTotal,
        deliveryFee,
        finalTotal
      );

    })
    .catch(function (error) {

      console.error(
        "CHECKOUT ERROR:",
        error
      );

      showMessage(
        "Erreur : " +
        error.message,
        "error"
      );

      resetButton();

    });

}


/* =========================================================
   WHATSAPP
========================================================= */

function sendWhatsApp(
  name,
  phone,
  wilaya,
  commune,
  deliveryType,
  address,
  notes,
  cart,
  productsTotal,
  deliveryFee,
  finalTotal
) {

  var message =
    "🛍️ Nouvelle commande - JR Shop\n\n";

  message +=
    "👤 Nom: " +
    name +
    "\n";

  message +=
    "📞 Téléphone: " +
    phone +
    "\n";

  message +=
    "📍 Wilaya: " +
    wilaya +
    "\n";

  message +=
    "🏘️ Commune: " +
    commune +
    "\n";

  message +=
    "🚚 Livraison: " +
    (
      deliveryType === "domicile"
        ? "À domicile"
        : "Bureau"
    ) +
    "\n";

  if (deliveryType === "domicile") {

    message +=
      "🏠 Adresse: " +
      address +
      "\n";

  }

  if (notes) {

    message +=
      "📝 Note: " +
      notes +
      "\n";

  }


  message +=
    "\n🛒 Produits:\n";


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
      formatPrice(itemTotal) +
      "\n";

  });


  message +=
    "\n💰 Total produits: " +
    formatPrice(productsTotal);

  message +=
    "\n🚚 Livraison: " +
    formatPrice(deliveryFee);

  message +=
    "\n💵 Total commande: " +
    formatPrice(finalTotal);


  var whatsappNumber =
    "213697005313";

  var url =
    "https://wa.me/" +
    whatsappNumber +
    "?text=" +
    encodeURIComponent(message);


  setTimeout(function () {

    window.location.href =
      url;

  }, 1000);

}


/* =========================================================
   HELPERS
========================================================= */

function resetButton() {

  var button =
    document.getElementById(
      "submitOrderButton"
    );

  if (button) {

    button.disabled = false;

    button.textContent =
      "Confirmer la commande";

  }

}


function showMessage(
  message,
  type
) {

  var element =
    document.getElementById(
      "checkoutMessage"
    );

  if (!element) {

    alert(message);

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


function formatPrice(value) {

  return (
    Number(value || 0)
      .toLocaleString("fr-DZ") +
    " DA"
  );

}


function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
