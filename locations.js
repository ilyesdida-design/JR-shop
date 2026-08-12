/* =========================================================
   JR SHOP — LOCATIONS
   Wilaya + Commune — Algeria
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
    console.error("Wilaya select not found.");
    return;
  }

  wilayaSelect.innerHTML =
    '<option value="">Chargement des wilayas...</option>';

  wilayaSelect.disabled = true;

  if (communeSelect) {

    communeSelect.innerHTML =
      '<option value="">Choisissez d’abord une wilaya</option>';

    communeSelect.disabled = true;

  }


  try {

    const response =
      await fetch(
        LOCATIONS_API + "/wilayas"
      );


    if (!response.ok) {

      throw new Error(
        "Impossible de charger les wilayas."
      );

    }


    const data =
      await response.json();


    /*
      بعض APIs ترجع array مباشرة،
      وبعضها داخل data.
    */

    const wilayas =
      Array.isArray(data)
        ? data
        : Array.isArray(data.data)
          ? data.data
          : [];


    if (wilayas.length === 0) {

      throw new Error(
        "Aucune wilaya trouvée."
      );

    }


    wilayaSelect.innerHTML =
      '<option value="">Sélectionnez votre wilaya</option>';


    wilayas.forEach(function (wilaya) {

      const option =
        document.createElement("option");


      /*
        نحاول التعامل مع أكثر من
        تسمية ممكنة للـAPI.
      */

      const id =
        wilaya.id ??
        wilaya.wilaya_id ??
        wilaya.code ??
        wilaya.wilayaCode;


      const name =
        wilaya.name_fr ??
        wilaya.nameFr ??
        wilaya.name ??
        wilaya.nom ??
        wilaya.name_ascii ??
        "Wilaya";


      option.value = id;

      option.textContent =
        name;


      wilayaSelect.appendChild(
        option
      );

    });


    wilayaSelect.disabled = false;


  } catch (error) {

    console.error(
      "Wilayas error:",
      error
    );


    wilayaSelect.innerHTML =
      '<option value="">Erreur de chargement</option>';

  }

}


/* =========================================================
   LOAD COMMUNES
========================================================= */

async function loadCommunes(
  wilayaId
) {

  const communeSelect =
    document.getElementById("commune");

  if (!communeSelect) {
    return;
  }


  if (!wilayaId) {

    communeSelect.innerHTML =
      '<option value="">Choisissez d’abord une wilaya</option>';

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
        "/wilayas/" +
        encodeURIComponent(wilayaId) +
        "/communes"
      );


    if (!response.ok) {

      throw new Error(
        "Impossible de charger les communes."
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


      const id =
        commune.id ??
        commune.commune_id ??
        commune.code ??
        "";


      const name =
        commune.name_fr ??
        commune.nameFr ??
        commune.name ??
        commune.nom ??
        commune.name_ascii ??
        "Commune";


      option.value =
        id || name;


      option.textContent =
        name;


      communeSelect.appendChild(
        option
      );

    });


    communeSelect.disabled = false;


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
   INIT LOCATIONS
========================================================= */

function initLocations() {

  const wilayaSelect =
    document.getElementById("wilaya");

  const communeSelect =
    document.getElementById("commune");


  if (!wilayaSelect) {

    console.error(
      "Element #wilaya introuvable."
    );

    return;

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


  /*
    Si checkout.js يبدل الـselect
    أو الصفحة تعاود التحميل،
    نضمنو أن commune ترجع للحالة الصحيحة.
  */

  if (communeSelect) {

    communeSelect.innerHTML =
      '<option value="">Choisissez d’abord une wilaya</option>';

    communeSelect.disabled = true;

  }

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

