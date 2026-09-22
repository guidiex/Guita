function parsearGasto(texto) {

  const original = texto.trim();

  if (!original) {
    return null;
  }

  // -------------------------
  // MONTO
  // -------------------------

  const matchMonto = original.match(
    /(\d+(?:[.,]\d+)*)\s*(k)?/i
  );

  if (!matchMonto) {
    return null;
  }

  let montoTexto = matchMonto[1];
  const usaK = Boolean(matchMonto[2]);

  let monto;

  if (usaK) {

    monto = parseFloat(
      montoTexto.replace(",", ".")
    ) * 1000;

  } else {

    // 100.000 → 100000
    // 35,000 → 35000
    monto = Number(
      montoTexto.replace(/[.,]/g, "")
    );

  }

  if (!Number.isFinite(monto) || monto <= 0) {
    return null;
  }


  // -------------------------
  // FECHA
  // -------------------------

  const ahora = new Date();
  let fecha = new Date(ahora);

  const textoLower = original.toLowerCase();

  if (textoLower.includes("ayer")) {

    fecha.setDate(
      fecha.getDate() - 1
    );

  }


  // -------------------------
  // COMERCIO
  // -------------------------

  let comercio = original
    .replace(matchMonto[0], "")
    .replace(/\b(hoy|ayer)\b/gi, "")
    .trim();

  if (!comercio) {
    comercio = "Sin comercio";
  }

  comercio =
    comercio.charAt(0).toUpperCase() +
    comercio.slice(1);


  // -------------------------
  // CATEGORÍA
  // -------------------------

  const categoria =
    detectarCategoria(original);


  // -------------------------
  // RESULTADO
  // -------------------------

  return {

    id:
      "g_" +
      Date.now(),

    monto,

    fecha:
      [
        fecha.getFullYear(),
        String(fecha.getMonth() + 1).padStart(2, "0"),
        String(fecha.getDate()).padStart(2, "0")
      ].join("-"),

    comercio,

    categoria,

    textoOriginal:
      original,

    creadoEn:
      new Date().toISOString()

  };

}