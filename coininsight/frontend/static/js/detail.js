/**
 * CoinInsight — Detalle de Criptomoneda
 * RF07: Vista Detallada
 * RF08: Gráfica Histórica (Chart.js)
 * RF09: Análisis IA (Gemini)
 * RF10: Favoritos
 */

let cryptoChartInstance = null;
const cryptoId = document.getElementById("current-crypto-id").value;
let selectedLevel = "intermedio";
let currentPriceHistory = [];   // Array de [timestamp_ms, precio] del periodo activo
let currentPrice = 0;           // Precio actual de la cripto (se actualiza en loadDetail)

// --- Utilidades de formateo (reutilizadas de main.js conceptualmente) ---
function formatPrice(value) {
    if (value == null) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);
}
function formatLargeNumber(value) {
    if (value == null) return "—";
    if (value >= 1e12) return "$" + (value / 1e12).toFixed(2) + "T";
    if (value >= 1e9) return "$" + (value / 1e9).toFixed(2) + "B";
    if (value >= 1e6) return "$" + (value / 1e6).toFixed(2) + "M";
    return "$" + value.toLocaleString("en-US");
}
function formatChangeClass(value) {
    if (value == null) return "text-muted";
    return value >= 0 ? "text-success" : "text-danger";
}
function formatChangeText(value) {
    if (value == null) return "—";
    return (value >= 0 ? "+" : "") + value.toFixed(2) + "%";
}

// --- Carga de Detalle ---
async function loadDetail() {
    const loading = document.getElementById("detail-loading");
    const content = document.getElementById("detail-content");
    const errorMsg = document.getElementById("detail-error");
    
    try {
        const res = await fetch(`/api/crypto/${cryptoId}`);
        if (!res.ok) throw new Error("Error fetching detail");
        const data = await res.json();
        
        // Rellenar UI
        document.getElementById("detail-image").src = data.image || "";
        document.getElementById("detail-name").textContent = data.name;
        document.getElementById("detail-symbol").textContent = (data.symbol || "").toUpperCase();
        
        currentPrice = data.current_price || 0;
        document.getElementById("detail-price").textContent = formatPrice(data.current_price);
        document.getElementById("detail-market-cap").textContent = formatLargeNumber(data.market_cap);
        document.getElementById("detail-volume").textContent = formatLargeNumber(data.total_volume);
        
        const change24 = document.getElementById("detail-change-24h");
        change24.textContent = formatChangeText(data.price_change_percentage_24h);
        change24.className = formatChangeClass(data.price_change_percentage_24h) + " fw-bold";
        
        const change7d = document.getElementById("detail-change-7d");
        change7d.textContent = formatChangeText(data.price_change_percentage_7d);
        change7d.className = formatChangeClass(data.price_change_percentage_7d) + " fw-bold";
        
        loading.style.display = "none";
        content.style.display = "block";
        
        // Cargar fav y chart después de mostrar contenido
        checkFavoriteStatus();
        loadChart(7);
    } catch (e) {
        console.error(e);
        loading.style.display = "none";
        errorMsg.style.display = "block";
    }
}

// --- Favoritos ---
async function checkFavoriteStatus() {
    try {
        const res = await fetch(`/api/favorites/${cryptoId}/status`);
        if (res.ok) {
            const data = await res.json();
            updateFavButton(data.is_favorite);
        }
    } catch (e) {
        console.error("Error check fav", e);
    }
}

async function toggleFavorite() {
    try {
        const btn = document.getElementById("favorite-btn");
        const isFav = btn.classList.contains("active");
        
        const res = await fetch(`/api/favorites/${cryptoId}`, {
            method: isFav ? "DELETE" : "POST"
        });
        
        if (res.ok) {
            const data = await res.json();
            updateFavButton(data.is_favorite);
        }
    } catch (e) {
        console.error("Error toggle fav", e);
    }
}

function updateFavButton(isFav) {
    const btn = document.getElementById("favorite-btn");
    const icon = btn.querySelector("i");
    if (isFav) {
        btn.classList.add("active");
        icon.classList.remove("bi-star");
        icon.classList.add("bi-star-fill");
        icon.style.color = "var(--ci-accent)";
    } else {
        btn.classList.remove("active");
        icon.classList.remove("bi-star-fill");
        icon.classList.add("bi-star");
        icon.style.color = "";
    }
}

// --- Gráfica Chart.js ---
async function loadChart(days) {
    try {
        const res = await fetch(`/api/crypto/${cryptoId}/history?days=${days}`);
        if (!res.ok) throw new Error("Error fetching history");
        const data = await res.json();
        
        const prices = data.prices || [];
        currentPriceHistory = prices; // Guardar en módulo para el simulador

        // Actualizar rango del input de fecha del simulador
        const simDate = document.getElementById("sim-date");
        if (simDate && prices.length >= 2) {
            const toDateStr = ts => new Date(ts).toISOString().split("T")[0];
            simDate.min = toDateStr(prices[0][0]);
            simDate.max = toDateStr(prices[prices.length - 1][0]);
        }
        // Limpiar resultado previo del simulador al cambiar periodo
        const simResult = document.getElementById("sim-result");
        const simError  = document.getElementById("sim-error");
        if (simResult) simResult.style.display = "none";
        if (simError)  simError.style.display  = "none";
        const labels = prices.map(p => {
            const date = new Date(p[0]);
            return days <= 1 ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : date.toLocaleDateString();
        });
        const values = prices.map(p => p[1]);
        
        const ctx = document.getElementById("cryptoChart").getContext("2d");
        
        // Colores según si sube o baja (comparar inicio y fin)
        const isPositive = values[values.length - 1] >= values[0];
        const lineColor = isPositive ? "#22c55e" : "#ef4444";
        const bgColor = isPositive ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)";

        if (cryptoChartInstance) {
            cryptoChartInstance.destroy();
        }

        cryptoChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Precio (USD)',
                    data: values,
                    borderColor: lineColor,
                    backgroundColor: bgColor,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHitRadius: 10,
                    fill: true,
                    tension: 0.2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return formatPrice(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    x: { display: false },
                    y: {
                        display: true,
                        position: 'right',
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af' }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    } catch (e) {
        console.error("Error chart", e);
    }
}

// --- Simulador de inversión histórica ---
function simulateInvestment() {
    const simError  = document.getElementById("sim-error");
    const simResult = document.getElementById("sim-result");

    // Ocultar estados previos
    simError.style.display  = "none";
    simResult.style.display = "none";

    const amount = parseFloat(document.getElementById("sim-amount").value);
    const dateVal = document.getElementById("sim-date").value; // "YYYY-MM-DD"

    // Validación
    if (!amount || amount <= 0 || isNaN(amount)) {
        simError.textContent = "Introduce una cantidad en USD mayor que 0.";
        simError.style.display = "block";
        return;
    }
    if (!dateVal) {
        simError.textContent = "Selecciona una fecha dentro del rango disponible.";
        simError.style.display = "block";
        return;
    }
    if (currentPriceHistory.length === 0) {
        simError.textContent = "No hay datos cargados para ese periodo, prueba a seleccionar un periodo más amplio (30D o 90D) primero.";
        simError.style.display = "block";
        return;
    }

    // Convertir fecha seleccionada a timestamp (interpretar como medianoche UTC
    // para evitar desfases de zona horaria que desplazarían el día seleccionado)
    const [y, m, d] = dateVal.split("-").map(Number);
    const selectedTs = Date.UTC(y, m - 1, d);

    // Validar que la fecha esté dentro del rango de datos cargados
    const firstTs = currentPriceHistory[0][0];
    const lastTs  = currentPriceHistory[currentPriceHistory.length - 1][0];
    if (selectedTs < firstTs || selectedTs > lastTs) {
        const fmt = ts => new Date(ts).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
        simError.textContent =
            `La fecha seleccionada está fuera del periodo disponible (${fmt(firstTs)} – ${fmt(lastTs)}). ` +
            `Selecciona un periodo más amplio (30D o 90D) para acceder a más fechas.`;
        simError.style.display = "block";
        return;
    }

    // Buscar el punto más próximo en el historial
    const closest = currentPriceHistory.reduce((best, point) => {
        return Math.abs(point[0] - selectedTs) < Math.abs(best[0] - selectedTs) ? point : best;
    });

    const priceAtDate = closest[1];
    if (!priceAtDate || priceAtDate <= 0) {
        simError.textContent = "No se encontró un precio válido para esa fecha. Prueba otra fecha.";
        simError.style.display = "block";
        return;
    }

    // Precio "actual" de referencia: usar el último punto del historial cargado
    // (mismo origen de datos que el gráfico, coherente con lo que el usuario ve).
    // Si currentPrice (API) está disponible y parece válido, usarlo como fallback.
    const lastHistoryPrice = currentPriceHistory[currentPriceHistory.length - 1][1];
    const refPrice = (currentPrice && currentPrice > 0) ? currentPrice : lastHistoryPrice;

    if (!refPrice || refPrice <= 0) {
        simError.textContent = "No se pudo obtener el precio actual. Recarga la página e inténtalo de nuevo.";
        simError.style.display = "block";
        return;
    }

    // Cálculos
    const coins    = amount / priceAtDate;
    const valueNow = coins * refPrice;
    const roi      = ((valueNow - amount) / amount) * 100;

    // Renderizar
    document.getElementById("sim-coins").textContent = coins.toFixed(6);
    document.getElementById("sim-value").textContent = formatPrice(valueNow);
    const roiEl = document.getElementById("sim-roi");
    roiEl.textContent = formatChangeText(roi);
    roiEl.className   = "sim-roi-value fw-bold " + formatChangeClass(roi);

    // Mostrar precios de referencia para transparencia
    const simPriceInfo = document.getElementById("sim-price-info");
    if (simPriceInfo) {
        simPriceInfo.textContent =
            `Precio de compra: ${formatPrice(priceAtDate)}  ·  Precio actual: ${formatPrice(refPrice)}`;
    }

    simResult.style.display = "block";
}

// --- Análisis IA ---
async function analyzeCrypto() {
    const loading = document.getElementById("ia-loading");
    const result = document.getElementById("ia-result");
    const placeholder = document.getElementById("ia-placeholder");
    
    placeholder.style.display = "none";
    result.style.display = "none";
    loading.style.display = "block";
    
    try {
        const res = await fetch("/api/analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ crypto: cryptoId, level: selectedLevel })
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Error al analizar");
        
        document.getElementById("ia-summary").textContent = data.resumen || "No disponible";
        
        const trend = (data.tendencia || "").toLowerCase();
        const trendBadge = document.getElementById("ia-trend");
        trendBadge.textContent = "Tendencia: " + data.tendencia;
        trendBadge.className = "badge border " + (trend.includes("alcista") ? "bg-success" : (trend.includes("bajista") ? "bg-danger" : "bg-secondary"));
        
        const risk = (data.riesgo || "").toLowerCase();
        const riskBadge = document.getElementById("ia-risk");
        riskBadge.textContent = "Riesgo: " + data.riesgo;
        riskBadge.className = "badge border " + (risk.includes("alto") ? "bg-danger" : (risk.includes("bajo") ? "bg-success" : "bg-warning"));
        
        document.getElementById("ia-factors").textContent = data.factores || "Ninguno destacado.";
        
        loading.style.display = "none";
        result.style.display = "block";
    } catch (e) {
        console.error(e);
        loading.style.display = "none";
        placeholder.style.display = "block";
        alert("Error: " + e.message);
    }
}

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", () => {
    loadDetail();
    
    document.getElementById("favorite-btn").addEventListener("click", toggleFavorite);
    document.getElementById("btn-analyze").addEventListener("click", analyzeCrypto);
    
    // Selector de periodo del gráfico
    document.querySelectorAll(".ci-btn-period").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".ci-btn-period").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            loadChart(e.target.getAttribute("data-days"));
        });
    });

    // Selector de nivel de explicación de IA
    document.querySelectorAll(".ci-btn-level").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const clickedLevel = e.currentTarget.getAttribute("data-level");
            // Actualizar estado y sincronizar TODOS los botones de nivel (en placeholder y en result)
            document.querySelectorAll(".ci-btn-level").forEach(b => {
                b.classList.toggle("active", b.getAttribute("data-level") === clickedLevel);
            });
            selectedLevel = clickedLevel;
            // Si ya hay resultado visible, lanzar nuevo análisis automáticamente
            if (document.getElementById("ia-result").style.display !== "none") {
                analyzeCrypto();
            }
        });
    });

    // Simulador de inversión histórica
    document.getElementById("btn-simulate").addEventListener("click", simulateInvestment);

    // Disparar simulación también con Enter en los inputs del simulador
    ["sim-amount", "sim-date"].forEach(id => {
        document.getElementById(id).addEventListener("keydown", (e) => {
            if (e.key === "Enter") simulateInvestment();
        });
    });
});
