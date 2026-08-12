/* =========================================================
   JR SHOP — LOCATIONS
   58 WILAYAS + COMMUNES
========================================================= */

const LOCATIONS_API =
  "https://algeria-cities.iyed.online/api/v1";


/* =========================================================
   LOAD WILAYAS
========================================================= */

async function loadWilayas() {

  const wilayaSelect =
    document.getElementById("wilaya");

  const communeSelect =
    document.getElementById("commune");


  if (!wilayaSelect) {
    return;
  }


  wilayaSelect.innerHTML =
    '<option value="">Chargement des wilayas...</option>';

  wilayaSelect.disabled = true;


  if (communeSelect) {

    communeSelect.innerHTML =
      '<option value="">Sélectionnez d’abord une wilaya</option>';

    communeSelect.disabled = true;

  }


  try {

    const response =
      await fetch(
        LOCATIONS_API + "/wilayas"
      );


    if (!response.ok) {
      throw new Error(
        "Erreur lors du chargement des wilayas."
      );
    }


    const wilayas =
      await response.json();


    if (
      !Array.isArray(wilayas) ||
      wilayas.length === 0
    ) {

      throw new Error(
        "Aucune wilaya trouvée."
      );

    }


    wilayaSelect.innerHTML =
      '<option value="">Sélectionnez votre wilaya</option>';


    wilayas.forEach(function (wilaya) {

      const option =
        document.createElement("option");


      option.value =
        wilaya.wilaya_code;


      option.textContent =
        wilaya.wilaya_name_ascii;


      wilayaSelect.appendChild(
        option
      );

    });


    wilayaSelect.disabled = false;


    console.log(
      "Wilayas chargées:",
      wilayas.length
    );


  } catch (error) {

    console.error(
      "Wilayas error:",
      error
    );


    wilayaSelect.innerHTML =
      '<option value="">Erreur de chargement des wilayas</option>';

  }

}


/* =========================================================
   LOAD COMMUNES
========================================================= */

async function loadCommunes(
  wilayaCode
) {

  const communeSelect =
    document.getElementById("commune");


  if (!communeSelect) {
    return;
  }


  if (!wilayaCode) {

    communeSelect.innerHTML =
      '<option value="">Sélectionnez d’abord une wilaya</option>';

    communeSelect.disabled = true;

    return;

  }


  communeSelect.innerHTML =
    '<option value="">Chargement des communes...</option>';

  communeSelect.disabled = true;


  try {

    const response =
      await fetch(
        LOCATIONS_API +
        "/wilayas/communes/" +
        encodeURIComponent(
          wilayaCode
        )
      );


    if (!response.ok) {

      throw new Error(
        "Erreur lors du chargement des communes."
      );

    }


    const data =
      await response.json();


    const communes =
      Array.isArray(data)
        ? data
        : Array.isArray(data.data)
          ? data.data
          : [];


    if (communes.length === 0) {

      throw new Error(
        "Aucune commune trouvée."
      );

    }


    communeSelect.innerHTML =
      '<option value="">Sélectionnez votre commune</option>';


    communes.forEach(function (commune) {

      const option =
        document.createElement("option");


      const code =
        commune.commune_code ??
        commune.id ??
        commune.code ??
        "";


      const name =
        commune.commune_name_ascii ??
        commune.commune_name ??
        commune.name_ascii ??
        commune.name ??
        commune.nom ??
        "";


      option.value =
        code || name;


      option.textContent =
        name;


      communeSelect.appendChild(
        option
      );

    });


    communeSelect.disabled = false;


    console.log(
      "Communes chargées:",
      communes.length
    );


  } catch (error) {

    console.error(
      "Communes error:",
      error
    );


    communeSelect.innerHTML =
      '<option value="">Erreur de chargement</option>';

  }

}


/* =========================================================
   INIT
========================================================= */

function initLocations() {

  const wilayaSelect =
    document.getElementById("wilaya");


  const communeSelect =
    document.getElementById("commune");


  if (!wilayaSelect) {
    return;
  }


  if (communeSelect) {

    communeSelect.innerHTML =
      '<option value="">Sélectionnez d’abord une wilaya</option>';

    communeSelect.disabled = true;

  }


  loadWilayas();


  wilayaSelect.addEventListener(
    "change",
    function () {

      loadCommunes(
        this.value
      );

    }
  );

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initLocations();

  }
);
