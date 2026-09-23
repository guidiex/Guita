// =========================================
// P13 · GUITA
// ticket-parser.js
// V0.2 · Parser de tickets
// =========================================
//
// Recibe texto generado por OCR.
//
// Devuelve:
// - comercio
// - monto
// - fecha
// - categoria
//
// Regla:
// Si un dato importante no puede
// determinarse con seguridad, devuelve null.
// Guita NO inventa monto ni fecha.
// =========================================


// =========================================
// PARSER PRINCIPAL
// =========================================

function parsearTextoTicket(texto) {

  if (
    !texto ||
    !texto.trim()
  ) {
    return null;
  }


  const original =
    texto.trim();


  const lineas =
    original
      .split(/\r?\n/)
      .map(
        linea =>
          linea.trim()
      )
      .filter(Boolean);


  const comercio =
    detectarComercioTicket(
      lineas
    );


  const monto =
    detectarTotalTicket(
      lineas
    );


  const fecha =
    detectarFechaTicket(
      original
    );


  const categoria =
    detectarCategoria(
      comercio || original
    );


  return {

    comercio:
      comercio ||
      "Sin comercio",

    monto:
      Number.isFinite(monto)
        ? monto
        : null,

    fecha:
      fecha || null,

    categoria:
      categoria ||
      "sin categoría",

    textoOriginal:
      original

  };

}


// =========================================
// COMERCIO
// =========================================

function detectarComercioTicket(lineas) {

  // ---------------------------------------
  // MARCAS CONOCIDAS
  // ---------------------------------------

  const comercios = [

    // Supermercados
    "coto",
    "carrefour",
    "dia",
    "jumbo",
    "disco",
    "vea",
    "changomas",
    "chango mas",
    "maxiconsumo",
    "vital",
    "makro",

    // Combustible
    "shell",
    "ypf",
    "axion",
    "puma",

    // Farmacia
    "farmacity",

    // Comida
    "mcdonalds",
    "mc donalds",
    "mostaza",
    "burger king",
    "wendys",
    "wendy's",
    "kfc",
    "subway",
    "starbucks",
    "havanna",
    "cafe martinez"

  ];


  for (const linea of lineas) {

    const limpia =
      normalizarTextoTicket(
        linea
      );


    for (
      const comercio
      of comercios
    ) {

      const comercioLimpio =
        normalizarTextoTicket(
          comercio
        );


      if (
        contienePalabraOFrase(
          limpia,
          comercioLimpio
        )
      ) {

        return capitalizarTicket(
          comercio
        );

      }

    }

  }


  // ---------------------------------------
  // FALLBACK:
  // BUSCAR UNA LÍNEA DE ENCABEZADO
  // ---------------------------------------

  const palabrasNoComercio = [

    "cuit",
    "rut",
    "fecha",
    "factura",
    "ticket",
    "cliente",
    "cajero",
    "cajera",
    "telefono",
    "tel.",
    "domicilio",
    "direccion",
    "total",
    "importe",
    "precio",
    "cantidad",
    "descripcion",
    "iva",
    "ingresos brutos",
    "consumidor final",
    "gracias",
    "atendido",
    "pv:",
    "pto",
    "comprobante"

  ];


  const primerasLineas =
    lineas.slice(
      0,
      8
    );


  for (
    const linea
    of primerasLineas
  ) {

    const limpia =
      normalizarTextoTicket(
        linea
      );


    if (
      linea.length < 3 ||
      linea.length > 50
    ) {
      continue;
    }


    if (
      !/[a-záéíóúñ]/i.test(
        linea
      )
    ) {
      continue;
    }


    const descartada =
      palabrasNoComercio.some(
        palabra =>
          limpia.includes(
            normalizarTextoTicket(
              palabra
            )
          )
      );


    if (descartada) {
      continue;
    }


    return limpiarComercioTicket(
      linea
    );

  }


  return null;

}


// =========================================
// TOTAL DEL TICKET
// =========================================

function detectarTotalTicket(lineas) {

  /*
    Estrategia:

    1. TOTAL A PAGAR
    2. IMPORTE TOTAL
    3. TOTAL explícito
    4. SUMA DE SUS PAGOS
    5. EFECTIVO

    Nunca buscamos simplemente
    "el número más grande".
  */


  // ---------------------------------------
  // 1. TOTAL A PAGAR
  // ---------------------------------------

  const totalAPagar =
    buscarMontoEnLineaTicket(
      lineas,
      linea => {

        const limpia =
          normalizarTextoTicket(
            linea
          );

        return (
          limpia.includes(
            "total a pagar"
          )
        );

      }
    );


  if (
    Number.isFinite(
      totalAPagar
    )
  ) {

    return totalAPagar;

  }


  // ---------------------------------------
  // 2. IMPORTE TOTAL
  // ---------------------------------------

  const importeTotal =
    buscarMontoEnLineaTicket(
      lineas,
      linea => {

        const limpia =
          normalizarTextoTicket(
            linea
          );

        return (
          limpia.includes(
            "importe total"
          )
        );

      }
    );


  if (
    Number.isFinite(
      importeTotal
    )
  ) {

    return importeTotal;

  }


  // ---------------------------------------
  // 3. TOTAL EXPLÍCITO
  // ---------------------------------------

  const candidatosTotal = [];


  for (const linea of lineas) {

    const limpia =
      normalizarTextoTicket(
        linea
      );


    if (
      !/\btotal\b/.test(
        limpia
      )
    ) {
      continue;
    }


    // Evitar encabezados como:
    // "DESCRIPCION PRECIO TOTAL"

    const tieneNumero =
      /\d/.test(
        linea
      );


    if (!tieneNumero) {
      continue;
    }


    const monto =
      extraerMontoDespuesDeTotal(
        linea
      );


    if (
      Number.isFinite(monto) &&
      monto > 0
    ) {

      candidatosTotal.push(
        monto
      );

    }

  }


  if (
    candidatosTotal.length === 1
  ) {

    return candidatosTotal[0];

  }


  if (
    candidatosTotal.length > 1
  ) {

    /*
      Si aparecen varios TOTAL:

      - si son iguales, perfecto.
      - si son muy parecidos, usamos
        el último TOTAL impreso.
      - si difieren mucho, no adivinamos.
    */


    const redondeados =
      candidatosTotal.map(
        monto =>
          Math.round(
            monto * 100
          ) / 100
      );


    const unicos =
      [
        ...new Set(
          redondeados
        )
      ];


    if (
      unicos.length === 1
    ) {

      return unicos[0];

    }


    const ultimo =
      candidatosTotal[
        candidatosTotal.length - 1
      ];


    const anterior =
      candidatosTotal[
        candidatosTotal.length - 2
      ];


    const diferencia =
      Math.abs(
        ultimo - anterior
      );


    const base =
      Math.max(
        Math.abs(ultimo),
        Math.abs(anterior)
      );


    /*
      Diferencia menor al 2%:
      probablemente subtotal/total
      o corrección del comprobante.

      Conservamos el último TOTAL.
    */

    if (
      base > 0 &&
      diferencia / base <= 0.02
    ) {

      return ultimo;

    }


    // Ambigüedad real.

    return null;

  }


  // ---------------------------------------
  // 4. SUMA DE SUS PAGOS
  // ---------------------------------------

  const sumaPagos =
    buscarMontoEnLineaTicket(
      lineas,
      linea => {

        const limpia =
          normalizarTextoTicket(
            linea
          );

        return (
          limpia.includes(
            "suma de sus pagos"
          )
        );

      }
    );


  if (
    Number.isFinite(
      sumaPagos
    )
  ) {

    return sumaPagos;

  }


  // ---------------------------------------
  // 5. EFECTIVO
  // ---------------------------------------

  const efectivo =
    buscarMontoEnLineaTicket(
      lineas,
      linea => {

        const limpia =
          normalizarTextoTicket(
            linea
          );

        return (
          limpia.startsWith(
            "efectivo"
          )
        );

      }
    );


  if (
    Number.isFinite(
      efectivo
    )
  ) {

    return efectivo;

  }


  // ---------------------------------------
  // SIN FALLBACK PELIGROSO
  // ---------------------------------------

  return null;

}


// =========================================
// MONTO DESPUÉS DE "TOTAL"
// =========================================

function extraerMontoDespuesDeTotal(
  linea
) {

  if (!linea) {
    return null;
  }


  /*
    Ejemplos:

    TOTAL 3100,00
    TOTAL = 122,559
    TOTAL: $ 45.300,00
    BASE IVA TOTAL 120,00
  */


  const match =
    linea.match(
      /\bTOTAL\b[\s:=\-]*\$?\s*(\d[\d.,]*)/i
    );


  if (
    match &&
    match[1]
  ) {

    return convertirMontoTicket(
      match[1]
    );

  }


  /*
    Algunos OCR agregan caracteres
    entre TOTAL y el importe.
  */

  const posicion =
    normalizarTextoTicket(
      linea
    ).lastIndexOf(
      "total"
    );


  if (posicion === -1) {
    return null;
  }


  const despues =
    linea.slice(
      posicion + 5
    );


  const montos =
    extraerMontosTicket(
      despues
    );


  if (!montos.length) {
    return null;
  }


  return montos[
    montos.length - 1
  ];

}


// =========================================
// BUSCAR MONTO EN LÍNEA
// =========================================

function buscarMontoEnLineaTicket(
  lineas,
  condicion
) {

  for (const linea of lineas) {

    if (
      !condicion(linea)
    ) {
      continue;
    }


    const montos =
      extraerMontosTicket(
        linea
      );


    if (
      montos.length > 0
    ) {

      return montos[
        montos.length - 1
      ];

    }

  }


  return null;

}


// =========================================
// EXTRAER MONTOS
// =========================================

function extraerMontosTicket(linea) {

  if (!linea) {
    return [];
  }


  /*
    Reconoce:

    120
    120,00
    3100,00
    3.100,00
    3.100
    122,559
    123.556
  */


  const matches =
    linea.match(
      /\$?\s*\d+(?:[.,]\d{1,3})?(?:[.,]\d{2})?/g
    );


  if (!matches) {
    return [];
  }


  return matches
    .map(
      valor =>
        convertirMontoTicket(
          valor
        )
    )
    .filter(
      monto =>
        Number.isFinite(monto) &&
        monto > 0
    );

}


// =========================================
// CONVERTIR MONTO
// =========================================

function convertirMontoTicket(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {
    return null;
  }


  let limpio =
    String(valor)
      .replace(/\$/g, "")
      .replace(/\s/g, "")
      .replace(/[^\d.,]/g, "")
      .trim();


  if (!limpio) {
    return null;
  }


  const puntos =
    (
      limpio.match(/\./g) ||
      []
    ).length;


  const comas =
    (
      limpio.match(/,/g) ||
      []
    ).length;


  // ---------------------------------------
  // 3.100,00
  // ---------------------------------------

  if (
    puntos >= 1 &&
    comas === 1 &&
    limpio.lastIndexOf(",") >
    limpio.lastIndexOf(".")
  ) {

    limpio =
      limpio
        .replace(/\./g, "")
        .replace(",", ".");


    return numeroSeguroTicket(
      limpio
    );

  }


  // ---------------------------------------
  // 3,100.00
  // ---------------------------------------

  if (
    comas >= 1 &&
    puntos === 1 &&
    limpio.lastIndexOf(".") >
    limpio.lastIndexOf(",")
  ) {

    limpio =
      limpio
        .replace(/,/g, "");


    return numeroSeguroTicket(
      limpio
    );

  }


  // ---------------------------------------
  // SOLO COMA
  // ---------------------------------------

  if (
    comas === 1 &&
    puntos === 0
  ) {

    const [
      entero,
      decimal
    ] =
      limpio.split(",");


    /*
      120,00 → 120
      3100,00 → 3100

      Si hay 3 cifras después de coma:
      122,559 → 122.559

      No lo convertimos en 122559.
    */

    if (
      decimal.length === 2
    ) {

      return numeroSeguroTicket(
        `${entero}.${decimal}`
      );

    }


    if (
      decimal.length === 3
    ) {

      return numeroSeguroTicket(
        `${entero}.${decimal}`
      );

    }


    return numeroSeguroTicket(
      `${entero}.${decimal}`
    );

  }


  // ---------------------------------------
  // SOLO PUNTO
  // ---------------------------------------

  if (
    puntos === 1 &&
    comas === 0
  ) {

    const [
      entero,
      decimal
    ] =
      limpio.split(".");


    /*
      3100.00 → 3100

      3.100 es ambiguo.
      Para tickets argentinos suele
      representar 3100 cuando hay
      exactamente 3 cifras detrás
      y hasta 3 delante.
    */

    if (
      decimal.length === 2
    ) {

      return numeroSeguroTicket(
        limpio
      );

    }


    if (
      decimal.length === 3
    ) {

      if (
        entero.length <= 3
      ) {

        /*
          Conservamos como decimal.

          Esto evita transformar
          automáticamente 122.559
          en 122559.
        */

        return numeroSeguroTicket(
          limpio
        );

      }

    }


    return numeroSeguroTicket(
      limpio
    );

  }


  // ---------------------------------------
  // VARIOS PUNTOS SIN COMA
  // 1.234.567
  // ---------------------------------------

  if (
    puntos > 1 &&
    comas === 0
  ) {

    const partes =
      limpio.split(".");


    const milesValidos =
      partes
        .slice(1)
        .every(
          parte =>
            parte.length === 3
        );


    if (milesValidos) {

      return numeroSeguroTicket(
        partes.join("")
      );

    }

  }


  // ---------------------------------------
  // VARIAS COMAS SIN PUNTO
  // ---------------------------------------

  if (
    comas > 1 &&
    puntos === 0
  ) {

    const partes =
      limpio.split(",");


    const milesValidos =
      partes
        .slice(1)
        .every(
          parte =>
            parte.length === 3
        );


    if (milesValidos) {

      return numeroSeguroTicket(
        partes.join("")
      );

    }

  }


  // ---------------------------------------
  // ENTERO
  // ---------------------------------------

  return numeroSeguroTicket(
    limpio
  );

}


// =========================================
// NÚMERO SEGURO
// =========================================

function numeroSeguroTicket(valor) {

  const numero =
    Number(valor);


  if (
    !Number.isFinite(numero)
  ) {
    return null;
  }


  return numero;

}


// =========================================
// FECHA
// =========================================

function detectarFechaTicket(texto) {

  if (!texto) {
    return null;
  }


  /*
    Reconoce:

    12/03/2018
    12-03-2018
    12.03.2018

    También:
    12/03/18
  */


  const regex =
    /\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4}|\d{2})\b/g;


  const coincidencias =
    [
      ...texto.matchAll(
        regex
      )
    ];


  if (
    coincidencias.length === 0
  ) {

    return null;

  }


  for (
    const match
    of coincidencias
  ) {

    const dia =
      Number(
        match[1]
      );


    const mes =
      Number(
        match[2]
      );


    let anio =
      Number(
        match[3]
      );


    if (
      anio < 100
    ) {

      anio += 2000;

    }


    if (
      !fechaValidaTicket(
        dia,
        mes,
        anio
      )
    ) {

      continue;

    }


    return [
      String(anio)
        .padStart(4, "0"),

      String(mes)
        .padStart(2, "0"),

      String(dia)
        .padStart(2, "0")

    ].join("-");

  }


  return null;

}


// =========================================
// VALIDAR FECHA REAL
// =========================================

function fechaValidaTicket(
  dia,
  mes,
  anio
) {

  if (
    anio < 2000 ||
    anio > 2100
  ) {
    return false;
  }


  if (
    mes < 1 ||
    mes > 12
  ) {
    return false;
  }


  if (
    dia < 1 ||
    dia > 31
  ) {
    return false;
  }


  const fecha =
    new Date(
      anio,
      mes - 1,
      dia
    );


  return (
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia
  );

}


// =========================================
// NORMALIZAR TEXTO
// =========================================

function normalizarTextoTicket(texto) {

  return String(
    texto || ""
  )
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


// =========================================
// PALABRA / FRASE
// =========================================

function contienePalabraOFrase(
  texto,
  termino
) {

  if (
    !texto ||
    !termino
  ) {
    return false;
  }


  /*
    Para frases con espacios,
    includes es suficiente.
  */

  if (
    termino.includes(" ")
  ) {

    return texto.includes(
      termino
    );

  }


  /*
    Para palabras individuales evitamos
    falsos positivos por coincidencias
    dentro de otras palabras.
  */

  const escapado =
    termino.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );


  const regex =
    new RegExp(
      `(^|[^a-z0-9])${escapado}([^a-z0-9]|$)`,
      "i"
    );


  return regex.test(
    texto
  );

}


// =========================================
// LIMPIAR COMERCIO
// =========================================

function limpiarComercioTicket(
  texto
) {

  return String(
    texto || ""
  )
    .replace(
      /^[|!¡\-_]+/,
      ""
    )
    .replace(
      /[|!¡\-_]+$/,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


// =========================================
// CAPITALIZAR
// =========================================

function capitalizarTicket(texto) {

  return String(
    texto || ""
  )
    .split(" ")
    .map(
      palabra => {

        if (!palabra) {
          return "";
        }


        return (
          palabra
            .charAt(0)
            .toUpperCase() +
          palabra
            .slice(1)
            .toLowerCase()
        );

      }
    )
    .join(" ");

}