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

function value(id) {
  const node = $(id);
  const n = Number(node?.value);
  return Number.isFinite(n) ? n : 0;
}

function moneyText(n) {
  return money.format(Number.isFinite(n) ? n : 0);
}

function pctText(factor) {
  return `${number2.format(factor * 100)}%`;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, score));
}

function setProgress(id, score) {
  $(id).style.width = `${clampScore(score)}%`;
}

// ---------------------------
// Navegación
// ---------------------------
document.querySelectorAll(".role-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".role-tab").forEach((t) => t.classList.remove("is-active"));
    document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("is-active"));
    tab.classList.add("is-active");
    $(tab.dataset.target).classList.add("is-active");
  });
});

function setupSegmented(hiddenId, noId, siId, callback) {
  const hidden = $(hiddenId);
  const no = $(noId);
  const si = $(siId);

  [no, si].forEach((button) => {
    button.addEventListener("click", () => {
      hidden.value = button.dataset.value;
      no.classList.toggle("is-active", hidden.value === "no");
      si.classList.toggle("is-active", hidden.value === "si");
      callback();
    });
  });
}

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

function enableQuarter(tipo) {
  const isSucursal = tipo === "sucursal";
  const enabled = $(isSucursal ? "gsEsCierreTrimestral" : "grEsCierreTrimestral").value === "si";
  const card = $(isSucursal ? "gsQuarterCard" : "grQuarterCard");
  const status = $(isSucursal ? "gsQuarterStatus" : "grQuarterStatus");
  const auditSelect = $(isSucursal ? "gsTieneAuditoria" : "grTieneAuditoria");
  const auditScore = $(isSucursal ? "gsAuditoriaTrim" : "grAuditoriaTrim");

  card.classList.toggle("is-disabled", !enabled);

  card.querySelectorAll("input, select").forEach((control) => {
    control.disabled = !enabled;
  });

  if (enabled) {
    auditSelect.disabled = false;
    auditScore.disabled = auditSelect.value !== "si";
    status.textContent = "Cierre trimestral activado: se habilita el cálculo adicional del trimestre.";
  } else {
    status.textContent = "Se habilitará cuando indiques que el periodo corresponde a cierre trimestral.";
  }

  return enabled;
}

// ---------------------------
// Gerente de Sucursal
// ---------------------------
const indicadoresSucursal = [
  { rubro: "Ventas", indicador: "Ventas vs. mismo mes del año anterior", peso: 0.50, input: "gsVentas", output: "gsVentasPts", ajustable: true },
  { rubro: "Ejecución operativa", indicador: "Auditoría de almacén", peso: 0.14, input: "gsAlmacen", output: "gsAlmacenPts" },
  { rubro: "Ejecución operativa", indicador: "Auditoría de cocina", peso: 0.09, input: "gsCocina", output: "gsCocinaPts" },
  { rubro: "Ejecución operativa", indicador: "Auditoría de bar", peso: 0.09, input: "gsBar", output: "gsBarPts" },
  { rubro: "Ejecución operativa", indicador: "Evaluación de look", peso: 0.09, input: "gsLook", output: "gsLookPts" },
  { rubro: "Gestión de personal", indicador: "Resultado mensual de indicadores", peso: 0.09, input: "gsPersonal", output: "gsPersonalPts" },
];

function objetivoSucursal(venta) {
  if (venta < 4_500_000) return { mensual: 8000, trimestral: 6000, rango: "Menos de 4.5 mdp" };
  if (venta <= 6_500_000) return { mensual: 12000, trimestral: 9000, rango: "De 4.5 a 6.5 mdp" };
  if (venta <= 8_000_000) return { mensual: 16000, trimestral: 12000, rango: "De 6.5 a 8 mdp" };
  if (venta <= 10_000_000) return { mensual: 20000, trimestral: 15000, rango: "De 8 a 10 mdp" };
  return { mensual: 24000, trimestral: 18000, rango: "Más de 10 mdp" };
}

function pagoMensualSucursal(score) {
  if (score > 97) return { factor: 1.4, rango: "Más de 97%" };
  if (score >= 95) return { factor: 1.2, rango: "95% a 96.99%" };
  if (score >= 93) return { factor: 1.0, rango: "93% a 94.99%" };
  if (score >= 90) return { factor: 0.85, rango: "90% a 92.99%" };
  if (score >= 85) return { factor: 0.60, rango: "85% a 89.99%" };
  return { factor: 0, rango: "Menos de 85%" };
}

function calcularSucursal() {
  const objetivo = objetivoSucursal(value("sucursalVentaPromedio"));
  $("sucursalObjetivoMensual").textContent = moneyText(objetivo.mensual);
  $("sucursalObjetivoTrimestral").textContent = moneyText(objetivo.trimestral);

  const ticket = value("gsTicket");
  const comensales = value("gsComensales");
  const candadoActivo = ticket > 20 || comensales < -20;

  const status = $("candadoSucursal");
  const detalle = $("candadoDetalle");
  if (candadoActivo) {
    status.className = "status status--danger";
    status.innerHTML = "<strong>⚠️ Candado activado</strong><span>La calificación de ventas se ajusta al 80% antes de aplicar su peso.</span>";
    detalle.classList.remove("is-hidden");
  } else {
    status.className = "status status--success";
    status.innerHTML = "<strong>✅ Candado no activado</strong><span>La calificación de ventas se mantiene sin ajuste.</span>";
    detalle.classList.add("is-hidden");
  }

  let score = 0;
  const tableRows = indicadoresSucursal.map((item) => {
    const capturado = value(item.input);
    const aplicable = item.ajustable && candadoActivo ? capturado * 0.8 : capturado;
    const puntos = aplicable * item.peso;
    score += puntos;
    $(item.output).textContent = `${number2.format(puntos)} pts`;

    if (item.ajustable && candadoActivo) {
      detalle.innerHTML = `
        Ventas capturadas: <strong>${number2.format(capturado)}</strong><br>
        Ventas ajustadas: <strong>${number2.format(aplicable)}</strong><br>
        Puntos por ventas: <strong>${number2.format(puntos)}</strong>
      `;
    }

    return `
      <tr>
        <td>${item.rubro}</td>
        <td>${item.indicador}</td>
        <td>${number2.format(item.peso * 100)}%</td>
        <td class="numeric">${number2.format(capturado)}</td>
        <td class="numeric">${number2.format(aplicable)}</td>
        <td class="numeric">${number2.format(puntos)}</td>
      </tr>
    `;
  }).join("");

  $("tablaSucursalMensual").innerHTML = tableRows;
  $("gsScoreFinal").textContent = number2.format(score);
  $("gsScoreTop").textContent = number2.format(score);
  setProgress("gsProgressBar", score);

  const mensual = pagoMensualSucursal(score);
  const pagoMensual = objetivo.mensual * mensual.factor;
  $("gsRangoMensual").textContent = mensual.rango;
  $("gsFactorMensual").textContent = pctText(mensual.factor);
  $("gsPagoMensual").textContent = moneyText(pagoMensual);

  const quarterEnabled = enableQuarter("sucursal");
  let pagoTrimestral = 0;

  if (!quarterEnabled) {
    $("gsMargenTrim").textContent = "No aplica";
    $("gsFactorMargen").textContent = "No aplica";
    $("gsFactorAuditoria").textContent = "No aplica";
    $("gsPagoTrimestral").textContent = moneyText(0);
    $("gsFormulaTrim").textContent = "El incentivo trimestral no se calcula porque el periodo no fue marcado como cierre trimestral.";
    $("gsTotalDetalle").textContent = "Solo incentivo mensual.";
  } else {
    const ingresos = value("gsIngresosTrim");
    const utilidad = value("gsUtilidadTrim");
    const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
    const factorMargen = factorMargenSucursal(margen);
    const aplicaAuditoria = $("gsTieneAuditoria").value === "si";
    const audit = factorAuditoria(value("gsAuditoriaTrim"), aplicaAuditoria);

    pagoTrimestral = objetivo.trimestral * factorMargen.factor * audit.factor;
    $("gsMargenTrim").textContent = `${number2.format(margen)}%`;
    $("gsFactorMargen").textContent = pctText(factorMargen.factor);
    $("gsFactorAuditoria").textContent = pctText(audit.factor);
    $("gsPagoTrimestral").textContent = moneyText(pagoTrimestral);
    $("gsFormulaTrim").textContent =
      `Fórmula: ${moneyText(objetivo.trimestral)} × ${pctText(factorMargen.factor)} × ${pctText(audit.factor)} = ${moneyText(pagoTrimestral)}.`;
    $("gsTotalDetalle").textContent = "Incluye incentivo mensual + incentivo trimestral.";
  }

  const total = pagoMensual + pagoTrimestral;
  $("gsPagoTotal").textContent = moneyText(total);
  $("gsTotalTop").textContent = moneyText(total);
}

function resetSucursal() {
  document.querySelectorAll("#sucursal input[type='text'], #sucursal input[type='number']").forEach((input) => {
    input.value = "";
  });

  $("gsEsCierreTrimestral").value = "no";
  $("gsCierreNo").classList.add("is-active");
  $("gsCierreSi").classList.remove("is-active");
  $("gsTieneAuditoria").value = "no";
  calcularSucursal();
}

// ---------------------------
// Gerente Regional
// ---------------------------
const objetivosRegional = {
  2: 10000,
  3: 14000,
  4: 18000,
  6: 26000,
};

function pagoMensualRegional(score) {
  if (score > 98) return { factor: 1.4, rango: "Más de 98%" };
  if (score >= 96) return { factor: 1.2, rango: "96% a 97.99%" };
  if (score >= 94) return { factor: 1.0, rango: "94% a 95.99%" };
  if (score >= 91) return { factor: 0.85, rango: "91% a 93.99%" };
  if (score >= 86) return { factor: 0.60, rango: "86% a 90.99%" };
  return { factor: 0, rango: "Menos de 86%" };
}

function factorSucursalesPositivas(porcentaje) {
  if (porcentaje > 80) return { factor: 1.4, rango: "Más de 80%: 1.4x" };
  if (porcentaje >= 60) return { factor: 1.2, rango: "60% a 80%: 1.2x" };
  if (porcentaje >= 50) return { factor: 1.0, rango: "50% a 59.99%: 1.0x" };
  return { factor: 0.8, rango: "Menos de 50%: 0.8x" };
}

function renderRegionalScores() {
  const count = Number($("grSucursales").value);
  const container = $("grCalificaciones");
  const currentValues = [...container.querySelectorAll(".gr-score")].map((input) => input.value);

  if (!count) {
    container.innerHTML = '<p class="empty-state">Selecciona el número de sucursales para capturar sus calificaciones.</p>';
    calcularRegional();
    return;
  }

  container.innerHTML = Array.from({ length: count }, (_, index) => `
    <article class="branch-card">
      <h3>🏪 Sucursal ${index + 1}</h3>
      <label class="field">
        <span>Calificación mensual</span>
        <input class="gr-score" type="number" min="0" max="140" step="0.01" placeholder="0" value="${currentValues[index] ?? ""}" />
      </label>
    </article>
  `).join("");

  document.querySelectorAll(".gr-score").forEach((input) => input.addEventListener("input", calcularRegional));
  calcularRegional();
}

function calcularRegional() {
  const count = Number($("grSucursales").value);
  const objetivo = objetivosRegional[count] || 0;

  $("grObjetivoMensual").textContent = moneyText(objetivo);
  $("grObjetivoTrimestral").textContent = moneyText(objetivo);

  const scores = [...document.querySelectorAll(".gr-score")].map((input) => Number(input.value) || 0);
  const promedio = scores.length ? scores.reduce((sum, item) => sum + item, 0) / scores.length : 0;

  $("grPromedio").textContent = number2.format(promedio);
  $("grPromedioTop").textContent = number2.format(promedio);
  $("grPromedioResult").textContent = number2.format(promedio);
  setProgress("grProgressBar", promedio);

  const mensual = pagoMensualRegional(promedio);
  const pagoMensual = objetivo * mensual.factor;
  $("grRangoMensual").textContent = mensual.rango;
  $("grFactorMensual").textContent = pctText(mensual.factor);
  $("grPagoMensual").textContent = moneyText(pagoMensual);

  const quarterEnabled = enableQuarter("regional");
  let pagoTrimestral = 0;

  if (!quarterEnabled) {
    $("grMargenTrim").textContent = "No aplica";
    $("grFactorMargen").textContent = "No aplica";
    $("grPctSucursalesPositivas").textContent = "No aplica";
    $("grBaseSucursalesMes").textContent =
      count > 0
        ? `Base trimestral: ${count} sucursales × 3 meses = ${count * 3} sucursales-mes.`
        : "Base trimestral: selecciona las sucursales a cargo.";
    $("grFactorSucursales").textContent = "No aplica";
    $("grFactorAuditoria").textContent = "No aplica";
    $("grPagoTrimestral").textContent = moneyText(0);
    $("grFormulaTrim").textContent = "El incentivo trimestral no se calcula porque el periodo no fue marcado como cierre trimestral.";
    $("grTotalDetalle").textContent = "Solo incentivo mensual.";
  } else {
    const ingresos = value("grIngresosTrim");
    const utilidad = value("grUtilidadTrim");
    const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
    const factorMargen = factorMargenRegional(margen);
    const baseSucursalesMes = count > 0 ? count * 3 : 0;
    const conteoSucursalesPositivas = value("grSucursalesPositivas");
    const porcentajeSucursalesPositivas =
      baseSucursalesMes > 0 ? (conteoSucursalesPositivas / baseSucursalesMes) * 100 : 0;
    const factorSucursales = factorSucursalesPositivas(porcentajeSucursalesPositivas);
    const aplicaAuditoria = $("grTieneAuditoria").value === "si";
    const audit = factorAuditoria(value("grAuditoriaTrim"), aplicaAuditoria);

    pagoTrimestral = objetivo * factorMargen.factor * factorSucursales.factor * audit.factor;
    $("grMargenTrim").textContent = `${number2.format(margen)}%`;
    $("grFactorMargen").textContent = pctText(factorMargen.factor);
    $("grPctSucursalesPositivas").textContent = `${number2.format(porcentajeSucursalesPositivas)}%`;
    $("grBaseSucursalesMes").textContent =
      baseSucursalesMes > 0
        ? `Base trimestral: ${count} sucursales × 3 meses = ${baseSucursalesMes} sucursales-mes.`
        : "Base trimestral: selecciona las sucursales a cargo.";
    $("grFactorSucursales").textContent = `${number2.format(factorSucursales.factor)}x`;
    $("grFactorAuditoria").textContent = pctText(audit.factor);
    $("grPagoTrimestral").textContent = moneyText(pagoTrimestral);
    $("grFormulaTrim").textContent =
      `Fórmula: ${moneyText(objetivo)} × ${pctText(factorMargen.factor)} × ${number2.format(factorSucursales.factor)}x × ${pctText(audit.factor)} = ${moneyText(pagoTrimestral)}. ` +
      `Consistencia: ${number2.format(conteoSucursalesPositivas)} de ${baseSucursalesMes} sucursales-mes = ${number2.format(porcentajeSucursalesPositivas)}%.`;
    $("grTotalDetalle").textContent = "Incluye incentivo mensual + incentivo trimestral.";
  }

  const total = pagoMensual + pagoTrimestral;
  $("grPagoTotal").textContent = moneyText(total);
  $("grTotalTop").textContent = moneyText(total);
}

function resetRegional() {
  document.querySelectorAll("#regional input[type='text'], #regional input[type='number']").forEach((input) => {
    input.value = "";
  });

  $("grSucursales").value = "";
  $("grCalificaciones").innerHTML = '<p class="empty-state">Selecciona el número de sucursales para capturar sus calificaciones.</p>';
  $("grEsCierreTrimestral").value = "no";
  $("grCierreNo").classList.add("is-active");
  $("grCierreSi").classList.remove("is-active");
  $("grTieneAuditoria").value = "no";
  calcularRegional();
}

// ---------------------------
// Eventos
// ---------------------------
setupSegmented("gsEsCierreTrimestral", "gsCierreNo", "gsCierreSi", calcularSucursal);
setupSegmented("grEsCierreTrimestral", "grCierreNo", "grCierreSi", calcularRegional);

[
  "sucursalVentaPromedio",
  "gsVentas",
  "gsAlmacen",
  "gsCocina",
  "gsBar",
  "gsLook",
  "gsPersonal",
  "gsTicket",
  "gsComensales",
  "gsIngresosTrim",
  "gsUtilidadTrim",
  "gsAuditoriaTrim",
].forEach((id) => $(id).addEventListener("input", calcularSucursal));

$("gsTieneAuditoria").addEventListener("change", () => {
  $("gsAuditoriaTrim").disabled = $("gsEsCierreTrimestral").value !== "si" || $("gsTieneAuditoria").value !== "si";
  if ($("gsAuditoriaTrim").disabled) $("gsAuditoriaTrim").value = "";
  calcularSucursal();
});

$("resetSucursal").addEventListener("click", resetSucursal);

$("grSucursales").addEventListener("change", renderRegionalScores);

[
  "grIngresosTrim",
  "grUtilidadTrim",
  "grSucursalesPositivas",
  "grAuditoriaTrim",
].forEach((id) => $(id).addEventListener("input", calcularRegional));

$("grTieneAuditoria").addEventListener("change", () => {
  $("grAuditoriaTrim").disabled = $("grEsCierreTrimestral").value !== "si" || $("grTieneAuditoria").value !== "si";
  if ($("grAuditoriaTrim").disabled) $("grAuditoriaTrim").value = "";
  calcularRegional();
});

$("resetRegional").addEventListener("click", resetRegional);

// Inicialización
calcularSucursal();
calcularRegional();
