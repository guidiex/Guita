// =========================================
// P13 · GUITA
// categories.js
// V0.2
// =========================================


const CATEGORIES = {

  // ---------------------------------------
  // SUPERMERCADOS
  // ---------------------------------------

  supermercado: [

    // Cadenas
    "coto",
    "carrefour",
    "carrefour market",
    "carrefour express",
    "dia",
    "dia%",
    "jumbo",
    "disco",
    "vea",
    "changomas",
    "chango mas",
    "maxiconsumo",
    "vital",
    "makro",

    // Otros nombres / formatos frecuentes
    "supermercado",
    "supermercados",
    "super market",
    "supermarket",
    "autoservicio",
    "autoservicios",
    "hipermercado",
    "hipermercados"

  ],


  // ---------------------------------------
  // ALMACÉN / PROXIMIDAD
  // ---------------------------------------

  almacen: [

    "almacen",
    "almacén",
    "despensa",
    "minimercado",
    "mini mercado",
    "mercadito",
    "market",
    "kiosco",
    "kiosko",
    "drugstore",
    "maxikiosco",
    "maxikiosko",
    "proximidad"

  ],


  // ---------------------------------------
  // CARNICERÍA
  // ---------------------------------------

  carniceria: [

    "carniceria",
    "carnicería",
    "carnes",
    "carne",
    "frigorifico",
    "frigorífico",
    "polleria",
    "pollería",
    "pollo",
    "granja"

  ],


  // ---------------------------------------
  // VERDULERÍA
  // ---------------------------------------

  verduleria: [

    "verduleria",
    "verdulería",
    "verduras",
    "verdura",
    "fruteria",
    "frutería",
    "frutas",
    "fruta",
    "frutas y verduras",
    "verduras y frutas"

  ],


  // ---------------------------------------
  // PANADERÍA
  // ---------------------------------------

  panaderia: [

    "panaderia",
    "panadería",
    "panificados",
    "panificacion",
    "panificación",
    "confiteria",
    "confitería",
    "pasteleria",
    "pastelería",
    "facturas",
    "bakery"

  ],


  // ---------------------------------------
  // FIAMBRERÍA
  // ---------------------------------------

  fiambreria: [

    "fiambreria",
    "fiambrería",
    "fiambres",
    "queseria",
    "quesería",
    "quesos",
    "lacteos",
    "lácteos"

  ],


  // ---------------------------------------
  // COMIDA / FAST FOOD
  // ---------------------------------------

  comida: [

    // Fast food
    "mcdonalds",
    "mc donalds",
    "burger king",
    "mostaza",
    "wendys",
    "wendy's",
    "kfc",
    "subway",

    // Café
    "starbucks",
    "havanna",
    "cafe martinez",
    "café martínez",

    // Genéricos
    "restaurante",
    "restaurant",
    "resto",
    "parrilla",
    "pizzeria",
    "pizzería",
    "pizza",
    "hamburgueseria",
    "hamburguesería",
    "cerveceria",
    "cervecería",
    "cafeteria",
    "cafetería",
    "rotiseria",
    "rotisería",
    "comidas",
    "comidas rapidas",
    "comidas rápidas"

  ],


  // ---------------------------------------
  // FARMACIA
  // ---------------------------------------

  farmacia: [

    "farmacity",
    "farmacia",
    "farmacias",
    "farma",
    "dr ahorro",
    "doctor ahorro"

  ],


  // ---------------------------------------
  // COMBUSTIBLE
  // ---------------------------------------

  combustible: [

    "shell",
    "ypf",
    "axion",
    "puma",
    "esso",

    "estacion de servicio",
    "estación de servicio",
    "combustible",
    "nafta",
    "gasoil"

  ]

};


// =========================================
// DETECTAR CATEGORÍA
// =========================================

function detectarCategoria(texto) {

  if (!texto) {
    return "sin categoría";
  }


  const limpio =
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );


  for (
    const [
      categoria,
      palabras
    ]
    of Object.entries(CATEGORIES)
  ) {

    for (
      const palabra
      of palabras
    ) {

      const palabraLimpia =
        palabra
          .toLowerCase()
          .normalize("NFD")
          .replace(
            /[\u0300-\u036f]/g,
            ""
          );


      if (
        limpio.includes(
          palabraLimpia
        )
      ) {

        return categoria;

      }

    }

  }


  return "sin categoría";

}