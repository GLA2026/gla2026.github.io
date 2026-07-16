const $ = (id) => document.getElementById(id);

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const num2 = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function val(id) {
  const n = Number($(id)?.value);
  return Number.isFinite(n) ? n : 0;
}

function moneyText(n) {
  return money.format(Number.isFinite(n) ? n : 0);
}

function pctText(n) {
  return `${num2.format(Number.isFinite(n) ? n : 0)}%`;
}

const sucursales = [
  "Cabanna San Jerónimo",
  "Cabanna Polanco",
  "Cabanna Puebla",
  "Cabanna Av México",
  "Cabanna Cd Juarez",
  "Cabanna Mexicali",
  "Cabanna Tijuana",
  "Cabanna Culiacán",
  "Los Arcos San Jerónimo",
  "Los Arcos Insurgentes",
  "Los Arcos Culiacán",
  "Los Arcos Satélite",
  "Los Arcos Lomas",
  "Los Arcos Interlomas",
  "Los Arcos Tijuana",
  "Los Arcos León",
  "Los Arcos Toluca",
  "Los Arcos Lázaro Cárdenas",
  "Los Arcos Acueducto",
  "Los Arcos Cd Juarez",
  "Los Arcos Mexicali",
  "Los Arcos Morones",
  "Los Arcos Garza Sada",
  "Los Arcos Mazatlán",
  "Los Arcos Aguascalientes",
  "Lorenza Tijuana",
  "Lorenza Culiacán",
  "Casa de Leo"
];

const regiones = [
  "Centro",
  "Tijuana",
  "Pacífico",
  "Monterrey",
  "Guadalajara",
  "Mexicali",
  "Bajío",
  "Juarez"
];

function fillSelect(id, options, placeholder) {
  const select = $(id);
  select.innerHTML = `<option value="">${placeholder}</option>` +
    options.map((item) => `<option value="${item}">${item}</option>`).join("");
}

fillSelect("sucursalNombre", sucursales, "Seleccionar sucursal");
fillSelect("regionalNombre", regiones, "Seleccionar región");

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("is-active"));
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

function factorAuditoria(calificacion, aplica) {
  if (!aplica) return { factor: 1, rango: "Sin auditoría" };
  if (calificacion > 95) return { factor: 1.2, rango: "Mayor a 95" };
  if (calificacion >= 90) return { factor: 1.0, rango: "De 90 a 95" };
  return { factor: 0.8, rango: "Menor a 90" };
}

function factorMargenSucursal(margen) {
  if (margen > 15) return { factor: 1.4, rango: "Más de 15%" };
  if (margen >= 10) return { factor: 1.2, rango: "10% a 14.99%" };
  if (margen >= 5) return { factor: 1.0, rango: "5% a 9.99%" };
  if (margen >= 0) return { factor: 0.85, rango: "0% a 4.99%" };
  return { factor: 0, rango: "Menos de 0%" };
}

function factorMargenRegional(margen) {
  if (margen > 15) return { factor: 1.2, rango: "Más de 15%" };
  if (margen >= 10) return { factor: 1.1, rango: "10% a 14.99%" };
  if (margen >= 5) return { factor: 1.0, rango: "5% a 9.99%" };
  if (margen >= 0) return { factor: 0.85, rango: "0% a 4.99%" };
  return { factor: 0, rango: "Menos de 0%" };
}

function objetivoSucursal(ventaPromedio) {
  if (ventaPromedio < 4_500_000) return { mensual: 8000, trimestral: 6000 };
  if (ventaPromedio <= 6_500_000) return { mensual: 12000, trimestral: 9000 };
  if (ventaPromedio <= 8_000_000) return { mensual: 16000, trimestral: 12000 };
  if (ventaPromedio <= 10_000_000) return { mensual: 20000, trimestral: 15000 };
  return { mensual: 24000, trimestral: 18000 };
}

function calificacionVentas(crecimiento) {
  if (crecimiento >= 10) return { score: 100, rango: "10% o más", explicacion: "El crecimiento llegó al objetivo de +10% o más, por eso la calificación es de 100%." };
  if (crecimiento >= 5) return { score: 95, rango: "+5% a +9.99%", explicacion: "El crecimiento quedó entre +5% y +9.99%, por eso la calificación es de 95%." };
  if (crecimiento >= 0) return { score: 90, rango: "0% a +4.99%", explicacion: "El crecimiento quedó entre 0% y +4.99%, por eso la calificación es de 90%." };
  if (crecimiento > -5) return { score: 85, rango: "-4.99% a -0.01%", explicacion: "La venta disminuyó hasta 4.99%, por eso la calificación es de 85%." };
  if (crecimiento > -10) return { score: 80, rango: "-5% a -9.99%", explicacion: "La venta disminuyó entre 5% y 9.99%, por eso la calificación es de 80%." };
  if (crecimiento > -15) return { score: 75, rango: "-10% a -14.99%", explicacion: "La venta disminuyó entre 10% y 14.99%, por eso la calificación es de 75%." };
  return { score: 70, rango: "-15% o menor", explicacion: "La venta disminuyó 15% o más, por eso la calificación es de 70%." };
}

function pagoMensualSucursal(score) {
  if (score > 97) return { factor: 1.4, rango: "Más de 97%" };
  if (score >= 95) return { factor: 1.2, rango: "95% a 96.99%" };
  if (score >= 93) return { factor: 1.0, rango: "93% a 94.99%" };
  if (score >= 90) return { factor: 0.85, rango: "90% a 92.99%" };
  if (score >= 85) return { factor: 0.60, rango: "85% a 89.99%" };
  return { factor: 0, rango: "Menos de 85%" };
}

function setQuarterState(prefix, enabled) {
  const section = $(`${prefix}QuarterSection`);
  const badge = $(`${prefix}QuarterBadge`);
  section.classList.toggle("disabled", !enabled);
  badge.classList.toggle("active", enabled);
  badge.textContent = enabled ? "Cierre trimestral: Sí" : "No aplica";

  section.querySelectorAll("input, select").forEach((el) => {
    el.disabled = !enabled;
  });

  if (!enabled) return;
  const auditoria = $(`${prefix}TieneAuditoria`);
  const score = $(`${prefix}AuditoriaTrim`);
  score.disabled = auditoria.value !== "si";
}

function calcularSucursal() {
  const objetivo = objetivoSucursal(val("sucursalVentaPromedio"));
  $("sucursalBaseMensual").textContent = moneyText(objetivo.mensual);
  $("sucursalBaseTrimestral").textContent = moneyText(objetivo.trimestral);
  $("gsBaseMensualResumen").textContent = moneyText(objetivo.mensual);

  const ventaAnterior = val("gsVentasAnterior");
  const ventaActual = val("gsVentasActual");
  const crecimiento = ventaAnterior > 0 ? ((ventaActual / ventaAnterior) - 1) * 100 : 0;
  const ventasInfo = ventaAnterior > 0 ? calificacionVentas(crecimiento) : { score: 0, rango: "sin cálculo", explicacion: "Captura ventas del año anterior y ventas actuales para calcular el rango." };

  $("gsCrecimientoVentas").textContent = pctText(crecimiento);
  $("gsCalificacionVentas").textContent = pctText(ventasInfo.score);
  $("gsRangoVentas").textContent = `Rango aplicado: ${ventasInfo.rango}`;
  $("gsExplicacionVentas").textContent = ventasInfo.explicacion;
  $("gsVentasOriginalResumen").textContent = pctText(ventasInfo.score);

  const ticket = val("gsTicket");
  const comensales = val("gsComensales");
  const candado = ticket > 20 || comensales < -20;
  const ventasAplicable = candado ? ventasInfo.score * 0.8 : ventasInfo.score;

  $("candadoSucursal").className = `status ${candado ? "danger" : "ok"}`;
  $("candadoSucursal").textContent = candado
    ? `Candado activado. La calificación de ventas se ajusta al 80%. Es decir, ${pctText(ventasInfo.score)} × 80% = ${pctText(ventasAplicable)}.`
    : "Candado no activado. La calificación de ventas se mantiene sin ajuste.";

  $("gsVentasAplicableResumen").textContent = pctText(ventasAplicable);

  const puntosVentas = ventasAplicable * 0.50;
  const almacen = val("gsAlmacen") * 0.14;
  const cocina = val("gsCocina") * 0.09;
  const bar = val("gsBar") * 0.09;
  const look = val("gsLook") * 0.09;

  $("gsVentasPts").textContent = num2.format(puntosVentas);
  $("gsAlmacenPts").textContent = num2.format(almacen);
  $("gsCocinaPts").textContent = num2.format(cocina);
  $("gsBarPts").textContent = num2.format(bar);
  $("gsLookPts").textContent = num2.format(look);

  const rotacion = val("gsRotacion");
  let calRotacion = rotacion > 0 ? (3.5 / rotacion) * 100 : 140;
  calRotacion = Math.min(calRotacion, 140);
  const capacitacion = val("gsCapacitacion");
  const calRH = (calRotacion * 0.80) + (capacitacion * 0.20);
  const puntosRH = calRH * 0.09;

  $("gsCalRotacion").textContent = pctText(calRotacion);
  $("gsCalRH").textContent = pctText(calRH);

  const score = puntosVentas + almacen + cocina + bar + look + puntosRH;
  const pagoInfo = pagoMensualSucursal(score);
  const pagoMensual = objetivo.mensual * pagoInfo.factor;

  $("gsScoreFinal").textContent = pctText(score);
  $("gsFactorMensual").textContent = pctText(pagoInfo.factor * 100);
  $("gsPagoMensual").textContent = moneyText(pagoMensual);

  const cierre = $("gsEsCierreTrimestral").value === "si";
  setQuarterState("gs", cierre);
  $("gsQuarterStatus").textContent = cierre
    ? "Cierre trimestral activado. Captura los datos financieros del trimestre."
    : "Esta sección se habilita cuando marcas que el periodo es cierre trimestral.";

  let pagoTrimestral = 0;
  if (cierre) {
    const ingresos = val("gsIngresosTrim");
    const utilidad = val("gsUtilidadTrim");
    const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
    const margenInfo = factorMargenSucursal(margen);
    const audit = factorAuditoria(val("gsAuditoriaTrim"), $("gsTieneAuditoria").value === "si");
    pagoTrimestral = objetivo.trimestral * margenInfo.factor * audit.factor;

    $("gsMargenTrim").textContent = pctText(margen);
    $("gsFactorMargen").textContent = pctText(margenInfo.factor * 100);
    $("gsFactorAuditoria").textContent = pctText(audit.factor * 100);
    $("gsPagoTrimestral").textContent = moneyText(pagoTrimestral);
  } else {
    $("gsMargenTrim").textContent = "No aplica";
    $("gsFactorMargen").textContent = "No aplica";
    $("gsFactorAuditoria").textContent = "No aplica";
    $("gsPagoTrimestral").textContent = moneyText(0);
  }

  $("gsPagoTotal").textContent = moneyText(pagoMensual + pagoTrimestral);
}

const objetivosRegional = { 2: 10000, 3: 14000, 4: 18000, 6: 26000 };

function pagoMensualRegional(score) {
  if (score > 98) return { factor: 1.4, rango: "Más de 98%" };
  if (score >= 96) return { factor: 1.2, rango: "96% a 97.99%" };
  if (score >= 94) return { factor: 1.0, rango: "94% a 95.99%" };
  if (score >= 91) return { factor: 0.85, rango: "91% a 93.99%" };
  if (score >= 86) return { factor: 0.60, rango: "86% a 90.99%" };
  return { factor: 0, rango: "Menos de 86%" };
}

function factorSucursalesPositivas(porcentaje) {
  if (porcentaje > 80) return { factor: 1.4, rango: "Más de 80%" };
  if (porcentaje >= 60) return { factor: 1.2, rango: "60% a 80%" };
  if (porcentaje >= 50) return { factor: 1.0, rango: "50% a 59.99%" };
  return { factor: 0.8, rango: "Menos de 50%" };
}

function renderRegionalScores() {
  const n = Number($("grSucursales").value);
  const container = $("grCalificaciones");
  const existing = [...container.querySelectorAll(".gr-score")].map((input) => input.value);

  if (!n) {
    container.innerHTML = `<p class="empty-state">Selecciona el número de sucursales para capturar sus calificaciones.</p>`;
    calcularRegional();
    return;
  }

  container.innerHTML = Array.from({ length: n }, (_, i) => `
    <label class="field branch-card">
      <h3>Sucursal ${i + 1}</h3>
      <span>Calificación mensual</span>
      <input class="gr-score" type="number" min="0" max="140" step="0.01" placeholder="0" value="${existing[i] || ""}" />
    </label>
  `).join("");

  document.querySelectorAll(".gr-score").forEach((input) => {
    input.addEventListener("input", calcularRegional);
  });

  calcularRegional();
}

function calcularRegional() {
  const n = Number($("grSucursales").value);
  const objetivo = objetivosRegional[n] || 0;
  $("grBaseMensual").textContent = moneyText(objetivo);
  $("grBaseTrimestral").textContent = moneyText(objetivo);
  $("grBaseMensualResumen").textContent = moneyText(objetivo);

  const scores = [...document.querySelectorAll(".gr-score")].map((input) => Number(input.value) || 0);
  const promedio = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const pagoInfo = pagoMensualRegional(promedio);
  const pagoMensual = objetivo * pagoInfo.factor;

  $("grPromedio").textContent = pctText(promedio);
  $("grPromedioResumen").textContent = pctText(promedio);
  $("grFactorMensual").textContent = pctText(pagoInfo.factor * 100);
  $("grPagoMensual").textContent = moneyText(pagoMensual);

  const cierre = $("grEsCierreTrimestral").value === "si";
  setQuarterState("gr", cierre);
  $("grQuarterStatus").textContent = cierre
    ? "Cierre trimestral activado. Captura los datos financieros de la región."
    : "Esta sección se habilita cuando marcas que el periodo es cierre trimestral.";

  const baseSucMes = n ? n * 3 : 0;
  $("grBaseSucursalesMes").textContent = baseSucMes
    ? `Base trimestral: ${n} sucursales × 3 meses = ${baseSucMes} sucursales-mes.`
    : "Base trimestral: selecciona las sucursales a cargo.";

  let pagoTrimestral = 0;
  if (cierre) {
    const ingresos = val("grIngresosTrim");
    const utilidad = val("grUtilidadTrim");
    const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
    const margenInfo = factorMargenRegional(margen);

    const conteo = val("grSucursalesPositivas");
    const pctPositivas = baseSucMes ? (conteo / baseSucMes) * 100 : 0;
    const factorPositivas = factorSucursalesPositivas(pctPositivas);
    const audit = factorAuditoria(val("grAuditoriaTrim"), $("grTieneAuditoria").value === "si");

    pagoTrimestral = objetivo * margenInfo.factor * factorPositivas.factor * audit.factor;

    $("grMargenTrim").textContent = pctText(margen);
    $("grPctSucursalesPositivas").textContent = pctText(pctPositivas);
    $("grFactorSucursales").textContent = `${num2.format(factorPositivas.factor)}x`;
    $("grFactorAuditoria").textContent = pctText(audit.factor * 100);
    $("grPagoTrimestral").textContent = moneyText(pagoTrimestral);
  } else {
    $("grMargenTrim").textContent = "No aplica";
    $("grPctSucursalesPositivas").textContent = "No aplica";
    $("grFactorSucursales").textContent = "No aplica";
    $("grFactorAuditoria").textContent = "No aplica";
    $("grPagoTrimestral").textContent = moneyText(0);
  }

  $("grPagoTotal").textContent = moneyText(pagoMensual + pagoTrimestral);
}

setupSegmented("gsEsCierreTrimestral", "gsCierreNo", "gsCierreSi", calcularSucursal);
setupSegmented("grEsCierreTrimestral", "grCierreNo", "grCierreSi", calcularRegional);

[
  "sucursalVentaPromedio",
  "gsVentasAnterior",
  "gsVentasActual",
  "gsTicket",
  "gsComensales",
  "gsAlmacen",
  "gsCocina",
  "gsBar",
  "gsLook",
  "gsRotacion",
  "gsCapacitacion",
  "gsIngresosTrim",
  "gsUtilidadTrim",
  "gsAuditoriaTrim"
].forEach((id) => $(id).addEventListener("input", calcularSucursal));

$("gsTieneAuditoria").addEventListener("change", calcularSucursal);
$("resetSucursal").addEventListener("click", () => {
  document.querySelectorAll("#sucursal input").forEach((input) => input.value = "");
  $("sucursalNombre").value = "";
  $("gsTieneAuditoria").value = "no";
  $("gsEsCierreTrimestral").value = "no";
  $("gsCierreNo").classList.add("is-active");
  $("gsCierreSi").classList.remove("is-active");
  calcularSucursal();
});

$("grSucursales").addEventListener("change", renderRegionalScores);
[
  "grIngresosTrim",
  "grUtilidadTrim",
  "grSucursalesPositivas",
  "grAuditoriaTrim"
].forEach((id) => $(id).addEventListener("input", calcularRegional));
$("grTieneAuditoria").addEventListener("change", calcularRegional);
$("resetRegional").addEventListener("click", () => {
  document.querySelectorAll("#regional input").forEach((input) => input.value = "");
  $("regionalNombre").value = "";
  $("grSucursales").value = "";
  $("grCalificaciones").innerHTML = `<p class="empty-state">Selecciona el número de sucursales para capturar sus calificaciones.</p>`;
  $("grTieneAuditoria").value = "no";
  $("grEsCierreTrimestral").value = "no";
  $("grCierreNo").classList.add("is-active");
  $("grCierreSi").classList.remove("is-active");
  calcularRegional();
});

calcularSucursal();
calcularRegional();
