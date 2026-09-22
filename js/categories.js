const CATEGORIES = {
  combustible: [
    "shell",
    "ypf",
    "axion",
    "puma",
    "esso"
  ],

  supermercado: [
    "coto",
    "carrefour",
    "dia",
    "jumbo",
    "vea",
    "changomas",
    "chango mas",
    "disco"
  ],

  farmacia: [
    "farmacity",
    "farmacia",
    "dr ahorro"
  ],

  comida: [
    "mcdonalds",
    "mc donalds",
    "mostaza",
    "burger king",
    "starbucks"
  ]
};


function detectarCategoria(texto) {

  const limpio = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const [categoria, palabras] of Object.entries(CATEGORIES)) {

    for (const palabra of palabras) {

      if (limpio.includes(palabra)) {
        return categoria;
      }

    }

  }

  return "sin categoría";
}