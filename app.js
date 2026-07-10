const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const number2 = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const $ = (id) => document.getElementById(id);
const numeric = (id) => {
  const value = Number($(id)?.value);
  return Number.isFinite(value) ? value : 0;
};

const percentText = (factor) => `${number2.format(factor * 100)}%`;
const moneyText = (value) => money.format(Number.isFinite(value) ? value : 0);

// ---------------------------
// Navegación
// ---------------------------
document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("is-active"));
    document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("is-active"));
    button.classList.add("is-active");
    $(button.dataset.target).classList.add("is-active");
  });
});

// ---------------------------
// Reglas compartidas
// ---------------------------
function factorAuditoria(calificacion, aplica) {
  if (!aplica) return { factor: 1, rango: "Sin auditoría: 100%" };
  if (calificacion > 95) return { factor: 1.2, rango: "Mayor a 95: 120%" };
  if (calificacion >= 90) return { factor: 1.0, rango: "De 90 a 95: 100%" };
  return { factor: 0.8, rango: "Menor a 90: 80%" };
}

function factorMargenSucursal(margen) {
  if (margen > 15) return { factor: 1.4, rango: "Más de 15%: 140%" };
  if (margen >= 10) return { factor: 1.2, rango: "De 10% a 14.99%: 120%" };
  if (margen >= 5) return { factor: 1.0, rango: "De 5% a 9.99%: 100%" };
  if (margen >= 0) return { factor: 0.85, rango: "De 0% a 4.99%: 85%" };
  return { factor: 0, rango: "Menos de 0%: 0%" };
}

function factorMargenRegional(margen) {
  if (margen > 15) return { factor: 1.2, rango: "Más de 15%: 120%" };
  if (margen >= 10) return { factor: 1.1, rango: "De 10% a 14.99%: 110%" };
  if (margen >= 5) return { factor: 1.0, rango: "De 5% a 9.99%: 100%" };
  if (margen >= 0) return { factor: 0.85, rango: "De 0% a 4.99%: 85%" };
  return { factor: 0, rango: "Menos de 0%: 0%" };
}

// ---------------------------
// Gerente de sucursal
// ---------------------------
const pesosSucursal = [
  { rubro: "Ventas", indicador: "Venta vs. mismo periodo año anterior", peso: 0.50, id: "gsVentas", ajustable: true },
  { rubro: "Ejecución operativa", indicador: "Auditoría de almacén", peso: 0.14, id: "gsAlmacen" },
  { rubro: "Ejecución operativa", indicador: "Auditoría de cocina", peso: 0.09, id: "gsCocina" },
  { rubro: "Ejecución operativa", indicador: "Auditoría de bar", peso: 0.09, id: "gsBar" },
  { rubro: "Ejecución operativa", indicador: "Evaluación de look", peso: 0.09, id: "gsLook" },
  { rubro: "Gestión de personal", indicador: "Resultado mensual de indicadores", peso: 0.09, id: "gsPersonal" },
];

function objetivoSucursal(ventaPromedio) {
  if (ventaPromedio < 4_500_000) return { mensual: 8_000, trimestral: 6_000, rango: "Menos de $4.5 mdp" };
  if (ventaPromedio < 6_500_000) return { mensual: 12_000, trimestral: 9_000, rango: "$4.5 a menos de $6.5 mdp" };
  if (ventaPromedio < 8_000_000) return { mensual: 16_000, trimestral: 12_000, rango: "$6.5 a menos de $8 mdp" };
  if (ventaPromedio <= 10_000_000) return { mensual: 20_000, trimestral: 15_000, rango: "$8 a $10 mdp" };
  return { mensual: 24_000, trimestral: 18_000, rango: "Más de $10 mdp" };
}

function pagoMensualSucursal(score) {
  if (score > 97) return { factor: 1.4, rango: "Más de 97%" };
  if (score >= 95) return { factor: 1.2, rango: "De 95% a 96.99%" };
  if (score >= 93) return { factor: 1.0, rango: "De 93% a 94.99%" };
  if (score >= 90) return { factor: 0.85, rango: "De 90% a 92.99%" };
  if (score >= 85) return { factor: 0.60, rango: "De 85% a 89.99%" };
  return { factor: 0, rango: "Menos de 85%" };
}

function calcularSucursal() {
  const objetivo = objetivoSucursal(numeric("sucursalVentaPromedio"));
  $("sucursalObjetivoMensual").textContent = moneyText(objetivo.mensual);
  $("sucursalObjetivoTrimestral").textContent = moneyText(objetivo.trimestral);

  const ticket = numeric("gsTicket");
  const comensales = numeric("gsComensales");
  const candado = ticket > 20 || comensales < -20;

  const alert = $("candadoSucursal");
  if (candado) {
    alert.className = "alert alert--danger";
    alert.textContent = "Candado activado: la calificación de ventas se reduce al 80% antes de aplicar su ponderación del 50%.";
  } else {
    alert.className = "alert alert--success";
    alert.textContent = "Candado no activado: la calificación de ventas se utiliza sin ajuste.";
  }

  let score = 0;
  const rows = pesosSucursal.map((item) => {
    const capturada = numeric(item.id);
    const aplicable = item.ajustable && candado ? capturada * 0.8 : capturada;
    const puntos = aplicable * item.peso;
    score += puntos;
    return `
      <tr>
        <td>${item.rubro}</td>
        <td>${item.indicador}</td>
        <td>${number2.format(item.peso * 100)}%</td>
        <td class="numeric">${number2.format(capturada)}</td>
        <td class="numeric">${number2.format(aplicable)}</td>
        <td class="numeric">${number2.format(puntos)}</td>
      </tr>`;
  }).join("");

  $("tablaSucursalMensual").innerHTML = rows;
  $("gsScoreFinal").textContent = number2.format(score);

  const mensual = pagoMensualSucursal(score);
  const pagoMensual = objetivo.mensual * mensual.factor;
  $("gsRangoMensual").textContent = mensual.rango;
  $("gsFactorMensual").textContent = percentText(mensual.factor);
  $("gsPagoMensual").textContent = moneyText(pagoMensual);

  const ingresos = numeric("gsIngresosTrim");
  const utilidad = numeric("gsUtilidadTrim");
  const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
  const margenInfo = factorMargenSucursal(margen);
  const aplicaAuditoria = $("gsTieneAuditoria").value === "si";
  const auditoriaInfo = factorAuditoria(numeric("gsAuditoriaTrim"), aplicaAuditoria);

  const pagoTrim = objetivo.trimestral * margenInfo.factor * auditoriaInfo.factor;
  $("gsMargenTrim").textContent = `${number2.format(margen)}%`;
  $("gsFactorMargen").textContent = percentText(margenInfo.factor);
  $("gsFactorAuditoria").textContent = percentText(auditoriaInfo.factor);
  $("gsPagoTrimestral").textContent = moneyText(pagoTrim);
  $("gsPagoTotal").textContent = moneyText(pagoMensual + pagoTrim);
  $("gsFormulaTrim").textContent =
    `Fórmula: ${moneyText(objetivo.trimestral)} × ${percentText(margenInfo.factor)} × ${percentText(auditoriaInfo.factor)} = ${moneyText(pagoTrim)}.`;
}

$("gsTieneAuditoria").addEventListener("change", () => {
  const enabled = $("gsTieneAuditoria").value === "si";
  $("gsAuditoriaTrim").disabled = !enabled;
  if (!enabled) $("gsAuditoriaTrim").value = "";
  calcularSucursal();
});

[
  "sucursalVentaPromedio", "gsVentas", "gsAlmacen", "gsCocina", "gsBar", "gsLook",
  "gsPersonal", "gsTicket", "gsComensales", "gsIngresosTrim", "gsUtilidadTrim",
  "gsAuditoriaTrim"
].forEach((id) => $(id).addEventListener("input", calcularSucursal));

$("resetSucursal").addEventListener("click", () => {
  document.querySelectorAll("#sucursal input").forEach((input) => input.value = "");
  $("gsTieneAuditoria").value = "no";
  $("gsAuditoriaTrim").disabled = true;
  calcularSucursal();
});

// ---------------------------
// Gerente regional
// ---------------------------
const objetivosRegional = {
  2: 10_000,
  3: 14_000,
  4: 18_000,
  6: 26_000,
};

function pagoMensualRegional(score) {
  if (score > 98) return { factor: 1.4, rango: "Más de 98%" };
  if (score >= 96) return { factor: 1.2, rango: "De 96% a 97.99%" };
  if (score >= 94) return { factor: 1.0, rango: "De 94% a 95.99%" };
  if (score >= 91) return { factor: 0.85, rango: "De 91% a 93.99%" };
  if (score >= 86) return { factor: 0.60, rango: "De 86% a 90.99%" };
  return { factor: 0, rango: "Menos de 86%" };
}

function factorSucursalesPositivas(porcentaje) {
  if (porcentaje > 80) return { factor: 1.4, rango: "Más de 80%: 1.4x" };
  if (porcentaje >= 60) return { factor: 1.2, rango: "De 60% a 80%: 1.2x" };
  if (porcentaje >= 50) return { factor: 1.0, rango: "De 50% a 59.99%: 1.0x" };
  return { factor: 0.8, rango: "Menos de 50%: 0.8x" };
}

function renderCalificacionesRegional() {
  const n = Number($("grSucursales").value);
  const container = $("grCalificaciones");

  if (!n) {
    container.innerHTML = '<p class="empty-state">Selecciona el número de sucursales para capturar sus calificaciones.</p>';
    calcularRegional();
    return;
  }

  const previous = [...container.querySelectorAll("input")].map((input) => input.value);
  container.innerHTML = Array.from({ length: n }, (_, i) => `
    <label class="field">
      <span>Calificación sucursal ${i + 1}</span>
      <input class="gr-score" type="number" min="0" max="140" step="0.01" placeholder="0 a 140" value="${previous[i] ?? ""}" />
    </label>
  `).join("");

  container.querySelectorAll(".gr-score").forEach((input) => {
    input.addEventListener("input", calcularRegional);
  });
  calcularRegional();
}

function calcularRegional() {
  const n = Number($("grSucursales").value);
  const objetivo = objetivosRegional[n] || 0;
  $("grObjetivoMensual").textContent = moneyText(objetivo);
  $("grObjetivoTrimestral").textContent = moneyText(objetivo);

  const scores = [...document.querySelectorAll(".gr-score")].map((input) => Number(input.value) || 0);
  const promedio = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;
  const mensual = pagoMensualRegional(promedio);
  const pagoMensual = objetivo * mensual.factor;

  $("grPromedio").textContent = number2.format(promedio);
  $("grRangoMensual").textContent = mensual.rango;
  $("grFactorMensual").textContent = percentText(mensual.factor);
  $("grPagoMensual").textContent = moneyText(pagoMensual);

  const ingresos = numeric("grIngresosTrim");
  const utilidad = numeric("grUtilidadTrim");
  const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
  const margenInfo = factorMargenRegional(margen);
  const sucPosInfo = factorSucursalesPositivas(numeric("grSucursalesPositivas"));
  const aplicaAuditoria = $("grTieneAuditoria").value === "si";
  const auditoriaInfo = factorAuditoria(numeric("grAuditoriaTrim"), aplicaAuditoria);

  const pagoTrim = objetivo * margenInfo.factor * sucPosInfo.factor * auditoriaInfo.factor;
  $("grMargenTrim").textContent = `${number2.format(margen)}%`;
  $("grFactorMargen").textContent = percentText(margenInfo.factor);
  $("grFactorSucursales").textContent = `${number2.format(sucPosInfo.factor)}x`;
  $("grFactorAuditoria").textContent = percentText(auditoriaInfo.factor);
  $("grPagoTrimestral").textContent = moneyText(pagoTrim);
  $("grPagoTotal").textContent = moneyText(pagoMensual + pagoTrim);
  $("grFormulaTrim").textContent =
    `Fórmula: ${moneyText(objetivo)} × ${percentText(margenInfo.factor)} × ${number2.format(sucPosInfo.factor)}x × ${percentText(auditoriaInfo.factor)} = ${moneyText(pagoTrim)}.`;
}

$("grSucursales").addEventListener("change", renderCalificacionesRegional);
$("grTieneAuditoria").addEventListener("change", () => {
  const enabled = $("grTieneAuditoria").value === "si";
  $("grAuditoriaTrim").disabled = !enabled;
  if (!enabled) $("grAuditoriaTrim").value = "";
  calcularRegional();
});

["grIngresosTrim", "grUtilidadTrim", "grSucursalesPositivas", "grAuditoriaTrim"]
  .forEach((id) => $(id).addEventListener("input", calcularRegional));

$("resetRegional").addEventListener("click", () => {
  document.querySelectorAll("#regional input").forEach((input) => input.value = "");
  $("grSucursales").value = "";
  $("grTieneAuditoria").value = "no";
  $("grAuditoriaTrim").disabled = true;
  renderCalificacionesRegional();
  calcularRegional();
});

// Inicialización
calcularSucursal();
calcularRegional();
