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


// -------------------------
// FORMATO MONEDA
// -------------------------

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


// -------------------------
// FECHA LOCAL YYYY-MM-DD
// -------------------------

function obtenerFechaLocal() {

  const ahora = new Date();

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


// -------------------------
// GUARDAR
// -------------------------

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


// -------------------------
// RENDER
// -------------------------

function renderizar() {

  const gastos =
    obtenerGastos();

  cantidadGastos.textContent =
    gastos.length;

  renderizarTotalHoy(gastos);

  renderizarHistorial(gastos);

}


// -------------------------
// TOTAL HOY
// -------------------------

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


// -------------------------
// HISTORIAL
// -------------------------

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
        document.createElement("article");

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


// -------------------------
// FECHA VISUAL
// -------------------------

function formatearFecha(fecha) {

  const hoy =
    obtenerFechaLocal();


  if (fecha === hoy) {
    return "Hoy";
  }


  const partes =
    fecha.split("-");


  return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// -------------------------
// MENSAJE
// -------------------------

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
      2500
    );

}


// -------------------------
// SEGURIDAD HTML
// -------------------------

function escapeHTML(valor) {

  const div =
    document.createElement("div");

  div.textContent =
    valor ?? "";

  return div.innerHTML;

}


// -------------------------
// EVENTOS
// -------------------------

guardarBtn.addEventListener(
  "click",
  registrarGasto
);


input.addEventListener(
  "keydown",
  evento => {

    if (evento.key === "Enter") {

      evento.preventDefault();

      registrarGasto();

    }

  }
);


// -------------------------
// INICIO
// -------------------------

renderizar();

input.focus();