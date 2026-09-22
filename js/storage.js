const STORAGE_KEY = "gastosIA_gastos";


function obtenerGastos() {

  const datos =
    localStorage.getItem(STORAGE_KEY);

  if (!datos) {
    return [];
  }

  try {

    return JSON.parse(datos);

  } catch (error) {

    console.error(
      "Error leyendo gastos:",
      error
    );

    return [];

  }

}


function guardarGastos(gastos) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(gastos)
  );

}


function agregarGasto(gasto) {

  const gastos =
    obtenerGastos();

  gastos.unshift(gasto);

  guardarGastos(gastos);

  return gastos;

}


function eliminarGasto(id) {

  const gastos =
    obtenerGastos()
      .filter(
        gasto => gasto.id !== id
      );

  guardarGastos(gastos);

  return gastos;

}


function borrarTodosLosGastos() {

  localStorage.removeItem(
    STORAGE_KEY
  );

}