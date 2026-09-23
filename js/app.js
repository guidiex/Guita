// =========================================
// P13 · GUITA
// app.js
// V0.2 · Ticket Scan
// =========================================


// =========================================
// ELEMENTOS · GASTOS
// =========================================

const input =
  document.getElementById("gastoInput");

const guardarBtn =
  document.getElementById("guardarBtn");

const listaGastos =
  document.getElementById("listaGastos");

const totalHoy =
  document.getElementById("totalHoy");

const cantidadGastos =
  document.getElementById("cantidadGastos");

const mensaje =
  document.getElementById("mensaje");


// =========================================
// ELEMENTOS · TICKET
// =========================================

const ticketBtn =
  document.getElementById("ticketBtn");

const ticketInput =
  document.getElementById("ticketInput");

const ticketPreview =
  document.getElementById("ticketPreview");

const ticketImagen =
  document.getElementById("ticketImagen");

const cerrarTicketBtn =
  document.getElementById("cerrarTicketBtn");

const procesarTicketBtn =
  document.getElementById("procesarTicketBtn");


// =========================================
// ELEMENTOS · REVISIÓN
// =========================================

const ticketRevision =
  document.getElementById("ticketRevision");

const ticketComercio =
  document.getElementById("ticketComercio");

const ticketMonto =
  document.getElementById("ticketMonto");

const ticketFecha =
  document.getElementById("ticketFecha");

const ticketCategoria =
  document.getElementById("ticketCategoria");

const confirmarTicketBtn =
  document.getElementById("confirmarTicketBtn");


// =========================================
// ESTADO · TICKET
// =========================================

let ticketArchivoActual = null;

let ticketObjectURL = null;

let ticketTextoOCR = "";


// =========================================
// FORMATO MONEDA
// =========================================

function formatearMonto(monto) {

  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }
  ).format(monto);

}


// =========================================
// FECHA LOCAL
// =========================================

function obtenerFechaLocal() {

  const ahora =
    new Date();

  const year =
    ahora.getFullYear();

  const month =
    String(
      ahora.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      ahora.getDate()
    ).padStart(2, "0");


  return `${year}-${month}-${day}`;

}


// =========================================
// REGISTRAR GASTO MANUAL
// =========================================

function registrarGasto() {

  const texto =
    input.value.trim();


  if (!texto) {

    mostrarMensaje(
      "Escriba un gasto."
    );

    input.focus();

    return;

  }


  const gasto =
    parsearGasto(texto);


  if (!gasto) {

    mostrarMensaje(
      "No pude detectar el monto."
    );

    input.focus();

    return;

  }


  agregarGasto(gasto);


  input.value = "";


  mostrarMensaje(
    `${formatearMonto(gasto.monto)} · ${gasto.comercio}`
  );


  renderizar();

  input.focus();

}


// =========================================
// RENDER GENERAL
// =========================================

function renderizar() {

  const gastos =
    obtenerGastos();


  cantidadGastos.textContent =
    gastos.length;


  renderizarTotalHoy(
    gastos
  );


  renderizarHistorial(
    gastos
  );

}


// =========================================
// TOTAL HOY
// =========================================

function renderizarTotalHoy(gastos) {

  const hoy =
    obtenerFechaLocal();


  const total =
    gastos

      .filter(
        gasto =>
          gasto.fecha === hoy
      )

      .reduce(
        (suma, gasto) =>
          suma + gasto.monto,
        0
      );


  totalHoy.textContent =
    formatearMonto(total);

}


// =========================================
// HISTORIAL
// =========================================

function renderizarHistorial(gastos) {

  listaGastos.innerHTML = "";


  if (gastos.length === 0) {

    listaGastos.innerHTML = `
      <p class="vacio">
        Todavía no hay gastos.
      </p>
    `;

    return;

  }


  gastos.forEach(
    gasto => {

      const item =
        document.createElement(
          "article"
        );


      item.className =
        "gasto-item";


      item.innerHTML = `

        <div class="gasto-info">

          <strong>
            ${escapeHTML(gasto.comercio)}
          </strong>

          <span>
            ${escapeHTML(gasto.categoria)}
            ·
            ${formatearFecha(gasto.fecha)}
          </span>

        </div>


        <div class="gasto-derecha">

          <strong>
            ${formatearMonto(gasto.monto)}
          </strong>

          <button
            class="eliminar"
            type="button"
            aria-label="Eliminar gasto"
            data-id="${gasto.id}"
          >
            ×
          </button>

        </div>

      `;


      listaGastos.appendChild(
        item
      );

    }
  );


  document
    .querySelectorAll(".eliminar")
    .forEach(
      boton => {

        boton.addEventListener(
          "click",
          () => {

            eliminarGasto(
              boton.dataset.id
            );

            renderizar();

          }
        );

      }
    );

}


// =========================================
// FECHA VISUAL
// =========================================

function formatearFecha(fecha) {

  const hoy =
    obtenerFechaLocal();


  if (fecha === hoy) {

    return "Hoy";

  }


  const partes =
    fecha.split("-");


  if (partes.length !== 3) {

    return fecha;

  }


  return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// =========================================
// MENSAJES
// =========================================

function mostrarMensaje(texto) {

  mensaje.textContent =
    texto;


  clearTimeout(
    mostrarMensaje.timer
  );


  mostrarMensaje.timer =
    setTimeout(
      () => {

        mensaje.textContent = "";

      },
      3000
    );

}


// =========================================
// SEGURIDAD HTML
// =========================================

function escapeHTML(valor) {

  const div =
    document.createElement("div");


  div.textContent =
    valor ?? "";


  return div.innerHTML;

}


// =========================================
// TICKET · ABRIR SELECTOR
// =========================================

function abrirSelectorTicket() {

  ticketInput.click();

}


// =========================================
// TICKET · PREVIEW
// =========================================

function mostrarPreviewTicket(archivo) {

  if (!archivo) {

    return;

  }


  if (
    !archivo.type.startsWith("image/")
  ) {

    mostrarMensaje(
      "Seleccione una imagen."
    );

    return;

  }


  if (ticketObjectURL) {

    URL.revokeObjectURL(
      ticketObjectURL
    );

  }


  ticketArchivoActual =
    archivo;


  ticketObjectURL =
    URL.createObjectURL(
      archivo
    );


  ticketImagen.src =
    ticketObjectURL;


  ticketPreview.hidden =
    false;


  ticketRevision.hidden =
    true;


  ticketTextoOCR =
    "";


  mostrarMensaje(
    "Foto recibida ✓"
  );

}


// =========================================
// TICKET · LIMPIAR
// =========================================

function limpiarTicket() {

  if (ticketObjectURL) {

    URL.revokeObjectURL(
      ticketObjectURL
    );

  }


  ticketObjectURL =
    null;


  ticketArchivoActual =
    null;


  ticketTextoOCR =
    "";


  ticketImagen.removeAttribute(
    "src"
  );


  ticketInput.value =
    "";


  ticketPreview.hidden =
    true;


  ticketRevision.hidden =
    true;


  ticketComercio.value =
    "";


  ticketMonto.value =
    "";


  ticketFecha.value =
    "";


  ticketCategoria.value =
    "sin categoría";

}


// =========================================
// TICKET · OCR
// =========================================

async function procesarTicket() {

  if (!ticketArchivoActual) {

    mostrarMensaje(
      "Primero seleccione un ticket."
    );

    return;

  }


  if (
    typeof Tesseract === "undefined"
  ) {

    mostrarMensaje(
      "OCR no disponible."
    );


    console.error(
      "Tesseract no está cargado."
    );


    return;

  }


  try {

    procesarTicketBtn.disabled =
      true;


    procesarTicketBtn.textContent =
      "LEYENDO...";


    mostrarMensaje(
      "Leyendo ticket..."
    );


    const resultado =
      await Tesseract.recognize(
        ticketArchivoActual,
        "spa",
        {

          logger:
            progreso => {

              console.log(
                "OCR:",
                progreso
              );


              if (
                progreso.status ===
                "recognizing text"
              ) {

                const porcentaje =
                  Math.round(
                    progreso.progress *
                    100
                  );


                procesarTicketBtn.textContent =
                  `LEYENDO ${porcentaje}%`;

              }

            }

        }
      );


    // -------------------------------------
    // TEXTO OCR
    // -------------------------------------

    ticketTextoOCR =
      resultado.data.text || "";


    console.log(
      "TEXTO OCR:"
    );


    console.log(
      ticketTextoOCR
    );


    // -------------------------------------
    // INTERPRETACIÓN
    // -------------------------------------

    const datos =
      parsearTextoTicket(
        ticketTextoOCR
      );


    console.log(
      "DATOS DETECTADOS:",
      datos
    );


    if (!datos) {

      mostrarMensaje(
        "No pude interpretar el ticket."
      );

      return;

    }


    // -------------------------------------
    // MOSTRAR REVISIÓN
    // -------------------------------------

    cargarRevisionTicket(
      datos
    );


    mostrarMensaje(
      "Revise los datos."
    );

  }

  catch (error) {

    console.error(
      "Error OCR:",
      error
    );


    mostrarMensaje(
      "No pude leer el ticket."
    );

  }

  finally {

    procesarTicketBtn.disabled =
      false;


    procesarTicketBtn.textContent =
      "LEER TICKET";

  }

}


// =========================================
// TICKET · CARGAR REVISIÓN
// =========================================

function cargarRevisionTicket(datos) {

  ticketComercio.value =
    datos.comercio || "";


  ticketMonto.value =
    datos.monto ?? "";


  ticketFecha.value =
  datos.fecha || "";


  const categoria =
    datos.categoria ||
    "sin categoría";


  const existeCategoria =
    Array
      .from(
        ticketCategoria.options
      )
      .some(
        opcion =>
          opcion.value === categoria
      );


  ticketCategoria.value =
    existeCategoria
      ? categoria
      : "sin categoría";


  ticketRevision.hidden =
    false;


  // Lleva la revisión a pantalla.

  ticketRevision.scrollIntoView(
    {
      behavior: "smooth",
      block: "nearest"
    }
  );

}


// =========================================
// TICKET · CONFIRMAR GASTO
// =========================================

function confirmarGastoTicket() {

  const comercio =
    ticketComercio.value.trim();


  const monto =
    Number(
      ticketMonto.value
    );


  const fecha =
    ticketFecha.value;


  const categoria =
    ticketCategoria.value;


  // -------------------------------------
  // VALIDACIONES
  // -------------------------------------

  if (
    !Number.isFinite(monto) ||
    monto <= 0
  ) {

    mostrarMensaje(
      "Revise el monto."
    );


    ticketMonto.focus();

    return;

  }


  if (!fecha) {

    mostrarMensaje(
      "Revise la fecha."
    );


    ticketFecha.focus();

    return;

  }


  // -------------------------------------
  // CREAR GASTO
  // -------------------------------------

  const gasto = {

    id:
      "g_" + Date.now(),

    monto:
      monto,

    fecha:
      fecha,

    comercio:
      comercio ||
      "Sin comercio",

    categoria:
      categoria ||
      "sin categoría",

    textoOriginal:
      ticketTextoOCR,

    origen:
      "ticket",

    creadoEn:
      new Date().toISOString()

  };


  // -------------------------------------
  // GUARDAR
  // -------------------------------------

  agregarGasto(
    gasto
  );


  renderizar();


  mostrarMensaje(
    `${formatearMonto(gasto.monto)} · ${gasto.comercio} guardado ✓`
  );


  limpiarTicket();


  input.focus();

}


// =========================================
// EVENTOS · GASTOS
// =========================================

guardarBtn.addEventListener(
  "click",
  registrarGasto
);


input.addEventListener(
  "keydown",
  evento => {

    if (
      evento.key === "Enter"
    ) {

      evento.preventDefault();

      registrarGasto();

    }

  }
);


// =========================================
// EVENTOS · TICKET
// =========================================

ticketBtn.addEventListener(
  "click",
  abrirSelectorTicket
);


ticketInput.addEventListener(
  "change",
  evento => {

    const archivo =
      evento.target.files[0];


    mostrarPreviewTicket(
      archivo
    );

  }
);


cerrarTicketBtn.addEventListener(
  "click",
  limpiarTicket
);


procesarTicketBtn.addEventListener(
  "click",
  procesarTicket
);


confirmarTicketBtn.addEventListener(
  "click",
  confirmarGastoTicket
);


// =========================================
// INICIO
// =========================================

renderizar();

input.focus();